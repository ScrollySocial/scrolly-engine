/**
 * Reads canonical order state across clients/*\/order.json and normalizes it
 * into the shape the dashboard (and the n8n safety check) need. No database
 * — a directory scan + per-file JSON read, consistent with how order.json
 * itself is stored (see order-state.mjs's header comment) and with how the
 * rest of this repo already persists per-engagement state.
 *
 * Only client folders that HAVE an order.json appear here. Nothing here
 * retroactively reconstructs state for historical engagements that predate
 * Phase 1 — mulberry-creek-2 has one because it was explicitly backfilled
 * (scripts/backfill-order-state.mjs); other pre-Phase-1 folders (e.g. the
 * original mulberry-creek) simply won't appear until/unless the same is
 * done for them.
 *
 * Commerce facts (purchase date, WooCommerce's own order/payment status)
 * are enriched from a best-effort, read-only WooCommerce lookup (see
 * wc-order-lookup.mjs) — WooCommerce stays authoritative for those; this
 * module never invents or estimates them if the lookup is unavailable.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { CLIENTS_DIR, loadOrder, orderEventLogPath, clientDir } from './order-state.mjs';
import { fetchWcOrdersByIds } from './wc-order-lookup.mjs';
import { loadDataForSeoCalls, capabilitySucceeded } from './dataforseo-call-log.mjs';
import { REQUIRED_CAPABILITY_CHECKS } from './dataforseo-capability-map.mjs';

const PRODUCT_LABELS = {
  discover: 'SEO Site Audit ($299)',
  implementation: 'Implementation Agent ($999)',
};

// --- "Open order" definition -------------------------------------------------
// An order is OPEN unless it has reached the one terminal state: delivered.
// Every other status — paid, awaiting_intake, ready_to_run, running,
// needs_attention, awaiting_final_review, approved, delivering — still has
// an operator- or customer-facing action pending, so it counts as open.
const CLOSED_STATUSES = new Set(['delivered']);
export function isOpenOrder(order) {
  return !CLOSED_STATUSES.has(order.status);
}

// --- Operator priority (Part "PRIORITIZATION") -------------------------------
// Exact 7-tier order requested: internal failure/blocked first, delivered
// last. Ties within a tier fall back to most-recently-active first (see
// listOrders' sort).
export function priorityTier(order) {
  if (order.status === 'needs_attention' && !order.failure?.customerActionRequired) return 0; // internal failure / blocked
  if (order.status === 'awaiting_final_review') return 1; // awaiting operator QA/review
  if (order.status === 'needs_attention' && order.failure?.customerActionRequired) return 2; // customer action required
  if (order.status === 'running' && isRunningUnusuallyLong(order)) return 3;
  if (['ready_to_run', 'approved', 'delivering'].includes(order.status)) return 4; // ready/queued
  if (order.status === 'running') return 4; // running normally — grouped with "in progress, nothing to do yet"
  if (order.status === 'awaiting_intake' || order.status === 'paid') return 5; // awaiting intake
  if (order.status === 'delivered') return 6; // complete
  return 4;
}

// "Unusually long" is a real elapsed-time threshold, not a fake percentage —
// 2 hours since the run (or current step) actually started. Chosen as a
// round, clearly-past-normal number; Discover runs have historically taken
// well under this. No invented progress estimate involved.
const UNUSUALLY_LONG_MS = 2 * 60 * 60 * 1000;
function stageStartedAt(order) {
  return order.currentStep?.startedAt || order.timestamps?.runStartedAt || order.timestamps?.createdAt || null;
}
export function isRunningUnusuallyLong(order) {
  if (order.status !== 'running') return false;
  const startedAt = stageStartedAt(order);
  if (!startedAt) return false;
  return Date.now() - new Date(startedAt).getTime() > UNUSUALLY_LONG_MS;
}

export function elapsedInStage(order) {
  const startedAt = stageStartedAt(order);
  if (!startedAt) return null;
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return { ms, text: `${mins}m` };
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return { ms, text: `${hours}h ${remMins}m` };
  const days = Math.floor(hours / 24);
  return { ms, text: `${days}d ${hours % 24}h` };
}

// --- Next operator action (Part "LIST VIEW") ---------------------------------
// Real workflow state only — every branch here maps directly to an existing
// order.json field, never a guess.
export function nextAction(order) {
  if (order.status === 'needs_attention') {
    if (order.failure?.customerActionRequired) return 'Awaiting customer action';
    if (order.reportPdfPath || order.appendixPdfPath) return 'Review report';
    return 'Investigate failure';
  }
  if (order.status === 'awaiting_final_review') return 'Review report / Approve & Send';
  if (order.status === 'approved') return 'Send report';
  if (order.status === 'running') return isRunningUnusuallyLong(order) ? 'Investigate — running unusually long' : 'None (in progress)';
  if (order.status === 'ready_to_run') return 'Await run start';
  if (order.status === 'awaiting_intake' || order.status === 'paid') return 'Await intake';
  if (order.status === 'delivering') return 'Verify delivery';
  if (order.status === 'delivered') {
    const deliveredAt = order.delivery?.deliveredAt ? new Date(order.delivery.deliveredAt).getTime() : null;
    const recentlyDelivered = deliveredAt && Date.now() - deliveredAt < 60 * 60 * 1000;
    return recentlyDelivered ? 'Verify delivery' : 'None / Complete';
  }
  return 'None';
}

// A needs_attention order where a usable report+appendix already exist and
// no customer action is required is a review case, not a broken run — the
// analysis substantially completed and one internal quality/completeness
// check needs a human judgment call before delivery. This is presentation
// interpretation only: it never touches order.json, status, or the
// completeness gate itself, and a true failure (no report draft) still
// resolves false here.
function isReviewRequired(order) {
  return order.status === 'needs_attention'
    && Boolean(order.reportPdfPath)
    && Boolean(order.appendixPdfPath)
    && !order.failure?.customerActionRequired;
}

function customerActionRequired(order) {
  if (order.status === 'awaiting_intake') return true;
  if (order.failure?.customerActionRequired) return true;
  return false;
}
function operatorActionRequired(order) {
  return order.status === 'needs_attention' || order.status === 'awaiting_final_review';
}
function problemSummary(order) {
  if (!order.failure) return null;
  return `${order.failure.errorClass}: ${order.failure.message}`;
}

function toRow(order, wcData) {
  return {
    slug: order.slug,
    orderId: order.orderId,
    businessName: order.businessName,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    productType: order.productType,
    product: PRODUCT_LABELS[order.productType] || order.productType,
    status: order.status,
    currentStep: order.currentStep, // { id, label, startedAt } | null
    lastCheckpoint: order.lastCheckpoint, // { step, at, approximate? } | null
    lastActivity: order.timestamps?.updatedAt || null,
    problem: problemSummary(order),
    failure: order.failure,
    customerActionRequired: customerActionRequired(order),
    operatorActionRequired: operatorActionRequired(order),
    reviewRequired: isReviewRequired(order),
    reportAvailable: Boolean(order.reportPdfPath),
    appendixAvailable: Boolean(order.appendixPdfPath),
    costUsd: order.costUsd,
    dataforseoCallsUsed: order.dataforseoCallsUsed,
    // No structural DataForSEO dollar-cost field exists anywhere in
    // order.json today — surfaced explicitly as unknown rather than
    // invented. See discover-v1-known-followups.md.
    dataforseoCostUsd: null,
    approval: order.approval,
    delivery: order.delivery,
    lastDeliveryFailure: order.lastDeliveryFailure || null,
    timestamps: order.timestamps,
    wpSync: order.wpSync || null,
    // Commerce enrichment — best-effort, WooCommerce-sourced, null if the
    // lookup didn't cover this order (no orderId, or WC unreachable).
    purchaseDate: wcData?.datePaid || wcData?.dateCreated || null,
    wcOrderStatus: wcData?.wcStatus || null,
    wcTotal: wcData?.total || null,
    // Derived, operator-facing only.
    nextAction: nextAction(order),
    priorityTier: priorityTier(order),
    elapsedInStage: elapsedInStage(order),
    runningUnusuallyLong: isRunningUnusuallyLong(order),
  };
}

function isDeliveredToday(order) {
  if (order.status !== 'delivered' || !order.delivery?.deliveredAt) return false;
  const d = new Date(order.delivery.deliveredAt);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

async function loadAllOrders() {
  let entries = [];
  try {
    entries = await readdir(CLIENTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const orders = [];
  for (const slug of slugs) {
    const order = await loadOrder(slug);
    if (order) orders.push(order);
  }
  return orders;
}

export async function listOrders() {
  const orders = await loadAllOrders();
  const wcMap = await fetchWcOrdersByIds(orders.map((o) => o.orderId).filter(Boolean));
  const rows = orders.map((o) => toRow(o, o.orderId ? wcMap.get(Number(o.orderId)) : null));

  rows.sort((a, b) => {
    if (a.priorityTier !== b.priorityTier) return a.priorityTier - b.priorityTier;
    return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
  });

  const counts = {
    openOrders: orders.filter(isOpenOrder).length,
    awaitingIntake: orders.filter((o) => o.status === 'awaiting_intake' || o.status === 'paid').length,
    running: orders.filter((o) => o.status === 'running').length,
    needsAttention: orders.filter((o) => o.status === 'needs_attention').length,
    awaitingApproval: orders.filter((o) => o.status === 'awaiting_final_review').length,
    deliveredToday: orders.filter(isDeliveredToday).length,
  };

  return { generatedAt: new Date().toISOString(), counts, orders: rows };
}

// --- Detail view: DataForSEO capability summary ------------------------------
// "fallback/partial/N/A capability indicators" (Automation section). Reuses
// the exact same structured evidence the Completeness Gate itself consults
// — never re-derives or guesses success independently of it.
async function capabilitySummary(slug) {
  const calls = await loadDataForSeoCalls(path.join(clientDir(slug), 'discover')).catch(() => []);
  const buckets = [];
  for (const [bucket, checks] of Object.entries(REQUIRED_CAPABILITY_CHECKS)) {
    for (const check of checks) {
      const succeeded = check.capabilities.some((cap) => capabilitySucceeded(calls, cap));
      const attempted = check.capabilities.some((cap) => calls.some((c) => c.capability === cap));
      buckets.push({
        bucket,
        label: check.label,
        capabilities: check.capabilities,
        status: succeeded ? 'succeeded' : attempted ? 'attempted_failed' : 'not_attempted',
      });
    }
  }
  return buckets;
}

export async function getOrderDetail(slug) {
  const order = await loadOrder(slug);
  if (!order) return null;
  let events = [];
  try {
    const raw = await readFile(orderEventLogPath(slug), 'utf8');
    events = raw
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    events = []; // no event log yet (or pre-Phase-1 engagement) — not an error
  }

  const wcMap = order.orderId ? await fetchWcOrdersByIds([order.orderId]) : new Map();
  const row = toRow(order, order.orderId ? wcMap.get(Number(order.orderId)) : null);
  const capabilities = await capabilitySummary(slug);

  return { order: row, rawOrder: order, events, capabilities };
}
