/**
 * Canonical per-engagement order state — `clients/<slug>/order.json`.
 *
 * This is the deterministic, application-code-owned record of where an
 * order actually is. It exists because the $299 Discover pipeline's only
 * prior state signal was prose in status.md, parsed with regex — which is
 * exactly what let a crashed, budget-ceiling-terminated run (mulberry-creek-2,
 * 2026-08-26) get marked `ready_for_delivery: true` (the untouched status.md
 * TEMPLATE's own "yes/no" placeholder text satisfied the completion regex).
 * The Claude Agent SDK session that does the actual analysis NEVER writes to
 * order.json directly, and nothing here trusts agent-authored prose as an
 * authority on completion — every write here is made by runner/bridge code,
 * after runner-observed, deterministic signals (process exit state, file
 * mtimes, structured check results).
 *
 * Plain JSON file, whole-file read/write — consistent with how the rest of
 * this repo persists per-engagement state (contact.json, engagement.json,
 * tasks.json). No database at this scale.
 *
 * Deliberately pipeline-agnostic (productType is just a field) so the
 * Implementation Agent's engagement.json/stage machinery can be surfaced
 * through this same shape later without rework — that wiring is NOT done in
 * this phase, and implementation/lib/* is untouched.
 */

import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');
const CLIENTS_DIR = path.join(VAULT_DIR, 'clients');

// Exported so other modules that need to walk clients/ (the aggregator) or
// resolve a vault-relative path (report-file serving) share one definition
// of where the vault lives, rather than each redefining it.
export { VAULT_DIR, CLIENTS_DIR };

export function clientDir(slug) {
  return path.join(CLIENTS_DIR, slug);
}

/**
 * Resolves a vault-relative path (as stored in order.json's reportPdfPath/
 * appendixPdfPath, e.g. "clients/mulberry-creek-2/discover/report.pdf") to
 * an absolute path, refusing anything that would resolve outside clients/.
 * Used when serving a report PDF over HTTP (bridge-server's /report-file) —
 * the value always originates from order.json itself, not directly from
 * request input, but this is cheap, real path-traversal protection to keep
 * around now that order.json content can drive a file read over a network
 * request at all (which was not previously true of any bridge-server route).
 */
export function resolveVaultRelativePath(relPath) {
  const resolved = path.resolve(VAULT_DIR, relPath);
  const clientsRootWithSep = path.resolve(CLIENTS_DIR) + path.sep;
  if (!resolved.startsWith(clientsRootWithSep)) {
    throw new Error(`Refusing to resolve a path outside clients/: ${relPath}`);
  }
  return resolved;
}
export function orderPath(slug) {
  return path.join(clientDir(slug), 'order.json');
}
// Phase 1 only instruments the Discover pipeline, and the user's spec places
// the event log under discover/ specifically (not clients/<slug>/ directly) —
// clients/<slug>/discover/order-events.ndjson.
export function orderEventLogPath(slug) {
  return path.join(clientDir(slug), 'discover', 'order-events.ndjson');
}

/** @returns {object} a fresh, empty order record. */
export function newOrder(slug, productType) {
  const now = new Date().toISOString();
  return {
    slug,
    productType, // 'discover' | 'implementation'
    orderId: null,
    orderKey: null,
    businessName: null,
    contactName: null,
    contactEmail: null,
    status: 'paid', // paid | awaiting_intake | ready_to_run | running | needs_attention | awaiting_final_review | approved | delivering | delivered
    currentStep: null, // { id, label, startedAt }
    completedSteps: [],
    lastCheckpoint: null, // { step, at }
    failure: null, // { errorClass, message, step, customerActionRequired, retryAvailable, occurredAt }
    costUsd: null,
    dataforseoCallsUsed: null,
    reportPdfPath: null,
    appendixPdfPath: null,
    approval: { requestedAt: null, approvedAt: null, approvedBy: null, batchId: null },
    delivery: { deliveredAt: null, method: null },
    timestamps: { createdAt: now, updatedAt: now },
    notes: [], // free-text limitations/caveats attached by backfills or the runner — never parsed back as a state signal
  };
}

export async function loadOrder(slug) {
  const p = orderPath(slug);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch (err) {
    throw new Error(`order.json for "${slug}" exists but is not valid JSON: ${err.message}`);
  }
}

export async function saveOrder(order) {
  order.timestamps = order.timestamps || {};
  order.timestamps.updatedAt = new Date().toISOString();
  await mkdir(clientDir(order.slug), { recursive: true });
  await writeFile(orderPath(order.slug), JSON.stringify(order, null, 2), 'utf8');
  return order;
}

/**
 * Load-or-create, mutate in place via `mutateFn`, save. The one write path
 * every caller should use instead of hand-rolling read/modify/write.
 */
export async function updateOrder(slug, productType, mutateFn) {
  const existing = await loadOrder(slug);
  const order = existing || newOrder(slug, productType);
  mutateFn(order);
  return saveOrder(order);
}

/**
 * Append-only audit trail, separate from order.json (which holds current
 * state only) so history is never overwritten — same split as the
 * Implementation Agent's tasks.json/change-log.ndjson.
 *
 * Deliberately best-effort: a logging failure must never abort the
 * engagement or block an order.json write, since the event log is
 * diagnostic, not authoritative.
 */
export async function logOrderEvent(slug, event) {
  try {
    await mkdir(path.dirname(orderEventLogPath(slug)), { recursive: true });
    const line = JSON.stringify({ at: new Date().toISOString(), slug, ...event }) + '\n';
    await appendFile(orderEventLogPath(slug), line, 'utf8');
  } catch (err) {
    console.error(`[order-state] failed to append event log for "${slug}": ${err.message}`);
  }
}

/**
 * Advance the tracked step. Only writes/logs when the step actually changes,
 * so repeated Write/Edit calls against the same file (common — an agent
 * revises a file many times within one protocol step) don't spam the event
 * log or bump timestamps pointlessly. Returns whether it changed anything.
 */
export async function setCurrentStep(slug, productType, step) {
  let changed = false;
  await updateOrder(slug, productType, (order) => {
    if (order.currentStep?.id === step.id) return; // no-op, same step
    if (order.currentStep) {
      order.completedSteps = Array.from(new Set([...(order.completedSteps || []), order.currentStep.id]));
      order.lastCheckpoint = { step: order.currentStep.id, at: new Date().toISOString() };
    }
    order.currentStep = { id: step.id, label: step.label, startedAt: new Date().toISOString() };
    order.status = 'running';
    changed = true;
  });
  if (changed) await logOrderEvent(slug, { type: 'step_started', step: step.id, label: step.label });
  return changed;
}

/**
 * Real intake->ready-to-run transition, called from create-engagement.mjs
 * right after a paid order's Tally submission is verified and contact.json
 * is written -- i.e. the moment a real engagement actually exists, before
 * launch-runner.mjs spawns the run. Genuinely brief in practice (launch is
 * near-immediate), but it is a real event, not a placeholder.
 */
export async function recordIntakeReceived(slug, productType, fields = {}) {
  await updateOrder(slug, productType, (order) => {
    Object.assign(order, fields);
    order.status = 'ready_to_run';
  });
  await logOrderEvent(slug, { type: 'intake_received' });
}

/**
 * Real operator-approval event -- called when an Approve & Send link's
 * token is validated (check-and-consume-token.mjs), which is the actual
 * moment a human approved the report. No separate "delivering" write
 * exists: the workflow sends the email and marks delivery in the same
 * request chain, with no real intermediate state to distinguish.
 */
export async function recordApproval(slug, productType, fields = {}) {
  await updateOrder(slug, productType, (order) => {
    order.approval = { ...order.approval, approvedAt: new Date().toISOString(), ...fields };
    order.status = 'approved';
  });
  await logOrderEvent(slug, { type: 'approved' });
}

/** Real delivery event -- called from mark-delivered.mjs once the client email has actually sent. */
export async function recordDelivery(slug, productType, fields = {}) {
  await updateOrder(slug, productType, (order) => {
    order.delivery = { ...order.delivery, deliveredAt: new Date().toISOString(), ...fields };
    order.status = 'delivered';
  });
  await logOrderEvent(slug, { type: 'delivered' });
}

export async function recordRunStarted(slug, productType, fields = {}) {
  await updateOrder(slug, productType, (order) => {
    Object.assign(order, fields);
    order.status = 'running';
    order.currentStep = null;
    order.completedSteps = [];
    order.lastCheckpoint = null;
    order.failure = null;
    order.timestamps.runStartedAt = new Date().toISOString();
  });
  await logOrderEvent(slug, { type: 'run_started' });
}

export async function recordFailure(slug, productType, failure) {
  await updateOrder(slug, productType, (order) => {
    // Deliberately does NOT move currentStep into completedSteps — a step
    // the run failed inside of was never actually completed. lastCheckpoint
    // (set by setCurrentStep whenever a step transition occurred) already
    // reflects the last step that DID finish.
    order.status = 'needs_attention';
    order.failure = { ...failure, occurredAt: failure.occurredAt || new Date().toISOString() };
  });
  await logOrderEvent(slug, { type: 'failed', errorClass: failure.errorClass, message: failure.message });
}

/**
 * Operator manually accepted a flagged completeness-gate issue after
 * personally reviewing the generated report+appendix (dashboard's "Accept
 * Review & Continue" action) -- moves a needs_attention order to
 * awaiting_final_review the same way recordReadyForReview does, but
 * deliberately does NOT null order.failure: the original completeness-gate
 * evidence (error class, message, occurredAt) must survive the transition
 * so it stays inspectable later, exactly as the operator reviewed it. A
 * separate order.manualReview record (plus its own order-events.ndjson
 * entry, distinct from 'ready_for_review') carries the audit trail: who,
 * when, prior status, and a snapshot of the failure that was accepted.
 * Eligibility (needs_attention + report/appendix present + no customer
 * action required) is enforced by the caller (bridge-server's
 * /accept-review-and-continue route), not here -- this function only
 * performs the transition once eligibility has already been confirmed.
 */
export async function recordManualReviewAcceptance(slug, productType, { operator, note } = {}) {
  let priorStatus = null;
  let priorFailure = null;
  await updateOrder(slug, productType, (order) => {
    priorStatus = order.status;
    priorFailure = order.failure ? { ...order.failure } : null;
    if (order.currentStep) {
      order.completedSteps = Array.from(new Set([...(order.completedSteps || []), order.currentStep.id]));
      order.lastCheckpoint = { step: order.currentStep.id, at: new Date().toISOString() };
    }
    order.currentStep = null;
    order.status = 'awaiting_final_review';
    // order.failure is intentionally left exactly as it was -- not cleared.
    order.manualReview = {
      acceptedAt: new Date().toISOString(),
      operator: operator || null,
      note: note || null,
      priorStatus,
      priorFailure,
    };
  });
  await logOrderEvent(slug, {
    type: 'manual_review_accepted',
    priorStatus,
    resultingStatus: 'awaiting_final_review',
    failureErrorClass: priorFailure ? priorFailure.errorClass : null,
    operator: operator || null,
    note: note || null,
  });
}

/**
 * Records a failed delivery attempt (Resend rejected/errored, or the
 * payload/attachments couldn't be built) WITHOUT changing order.status --
 * the order stays exactly where it was (normally awaiting_final_review), so
 * a genuine, deliberate operator retry (clicking Approve & Send again)
 * still works, rather than stranding the order in a half-approved state
 * with no way forward. Never called on a successful send -- see
 * lib/approve-and-send.mjs, which calls recordApproval instead once Resend
 * has confirmed acceptance.
 */
export async function recordDeliveryFailure(slug, productType, { reason, message } = {}) {
  await updateOrder(slug, productType, (order) => {
    order.lastDeliveryFailure = {
      reason: reason || 'unknown',
      message: message || '',
      occurredAt: new Date().toISOString(),
    };
  });
  await logOrderEvent(slug, { type: 'delivery_failed', reason: reason || 'unknown', message: message || '' });
}

export async function recordReadyForReview(slug, productType, fields = {}) {
  await updateOrder(slug, productType, (order) => {
    if (order.currentStep) {
      order.completedSteps = Array.from(new Set([...(order.completedSteps || []), order.currentStep.id]));
      order.lastCheckpoint = { step: order.currentStep.id, at: new Date().toISOString() };
    }
    order.currentStep = null;
    order.status = 'awaiting_final_review';
    order.failure = null;
    Object.assign(order, fields);
  });
  await logOrderEvent(slug, { type: 'ready_for_review' });
}
