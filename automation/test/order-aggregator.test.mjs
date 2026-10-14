/**
 * Tests the operator dashboard's derived fields (next action, priority
 * tier, elapsed-in-stage) as pure functions, plus listOrders()/
 * getOrderDetail() end-to-end against the real mulberry-creek-2 fixture and
 * synthetic fixtures. global.fetch is stubbed for the WooCommerce
 * enrichment lookup so these stay fast/deterministic/network-free — no
 * live WooCommerce, Anthropic, or DataForSEO calls.
 */
import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { nextAction, priorityTier, isRunningUnusuallyLong, elapsedInStage, listOrders, getOrderDetail } from '../lib/order-aggregator.mjs';
import { newOrder, saveOrder, orderPath, clientDir } from '../lib/order-state.mjs';

// --- Pure derivation functions ------------------------------------------------

test('nextAction: needs_attention with no report draft -> Investigate failure', () => {
  const o = { status: 'needs_attention', failure: { customerActionRequired: false }, reportPdfPath: null, appendixPdfPath: null };
  assert.equal(nextAction(o), 'Investigate failure');
});

test('nextAction: needs_attention with a report draft -> Review report', () => {
  const o = { status: 'needs_attention', failure: { customerActionRequired: false }, reportPdfPath: 'x.pdf', appendixPdfPath: null };
  assert.equal(nextAction(o), 'Review report');
});

test('nextAction: needs_attention with customerActionRequired -> Awaiting customer action', () => {
  const o = { status: 'needs_attention', failure: { customerActionRequired: true }, reportPdfPath: null };
  assert.equal(nextAction(o), 'Awaiting customer action');
});

test('nextAction: awaiting_final_review -> Review report / Approve & Send', () => {
  assert.equal(nextAction({ status: 'awaiting_final_review' }), 'Review report / Approve & Send');
});

test('nextAction: delivered long ago -> None / Complete', () => {
  const o = { status: 'delivered', delivery: { deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() } };
  assert.equal(nextAction(o), 'None / Complete');
});

test('nextAction: delivered within the last hour -> Verify delivery', () => {
  const o = { status: 'delivered', delivery: { deliveredAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() } };
  assert.equal(nextAction(o), 'Verify delivery');
});

test('nextAction: awaiting_intake/paid -> Await intake', () => {
  assert.equal(nextAction({ status: 'awaiting_intake' }), 'Await intake');
  assert.equal(nextAction({ status: 'paid' }), 'Await intake');
});

// --- Priority tier (exact 7-tier spec) -----------------------------------
test('priorityTier: internal failure/blocked sorts first (tier 0)', () => {
  const o = { status: 'needs_attention', failure: { customerActionRequired: false } };
  assert.equal(priorityTier(o), 0);
});

test('priorityTier: awaiting operator QA/review is tier 1', () => {
  assert.equal(priorityTier({ status: 'awaiting_final_review' }), 1);
});

test('priorityTier: customer action required is tier 2 (below internal failure, above running-long)', () => {
  const o = { status: 'needs_attention', failure: { customerActionRequired: true } };
  assert.equal(priorityTier(o), 2);
});

test('priorityTier: running unusually long is tier 3', () => {
  const o = { status: 'running', currentStep: { startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() } };
  assert.equal(priorityTier(o), 3);
});

test('priorityTier: a normal (not unusually long) running order is tier 4, not 3', () => {
  const o = { status: 'running', currentStep: { startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() } };
  assert.equal(priorityTier(o), 4);
});

test('priorityTier: awaiting_intake is tier 5, delivered is tier 6 (last)', () => {
  assert.equal(priorityTier({ status: 'awaiting_intake' }), 5);
  assert.equal(priorityTier({ status: 'delivered' }), 6);
});

test('priorityTier: full ordering is monotonic across the 7 requested tiers', () => {
  const fixtures = [
    { status: 'needs_attention', failure: { customerActionRequired: false } }, // 0
    { status: 'awaiting_final_review' }, // 1
    { status: 'needs_attention', failure: { customerActionRequired: true } }, // 2
    { status: 'running', currentStep: { startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() } }, // 3
    { status: 'ready_to_run' }, // 4
    { status: 'awaiting_intake' }, // 5
    { status: 'delivered' }, // 6
  ];
  const tiers = fixtures.map(priorityTier);
  for (let i = 1; i < tiers.length; i++) {
    assert.ok(tiers[i] > tiers[i - 1], `tier ${tiers[i]} (index ${i}) should be greater than the previous tier ${tiers[i - 1]}`);
  }
});

// --- Elapsed / unusually-long ----------------------------------------------
test('isRunningUnusuallyLong: false under 2h, true over 2h', () => {
  assert.equal(isRunningUnusuallyLong({ status: 'running', currentStep: { startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() } }), false);
  assert.equal(isRunningUnusuallyLong({ status: 'running', currentStep: { startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() } }), true);
});

test('elapsedInStage: formats minutes, hours, and days correctly', () => {
  const mins = elapsedInStage({ timestamps: { createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() } });
  assert.equal(mins.text, '45m');
  const hours = elapsedInStage({ timestamps: { createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() } });
  assert.equal(hours.text, '1d 2h');
});

// --- Integration: listOrders() / getOrderDetail() --------------------------
let originalFetch;
before(() => { originalFetch = global.fetch; });
after(() => { global.fetch = originalFetch; });
beforeEach(() => {
  // No WC_AUDIT credentials configured in the test env -> fetchWcOrdersByIds
  // short-circuits before ever calling fetch. Stub anyway as a hard
  // guarantee this suite makes zero real network calls.
  global.fetch = async () => { throw new Error('test suite must not make real network calls'); };
});
afterEach(async () => { global.fetch = originalFetch; });

test('B. listOrders() includes the real mulberry-creek-2 fixture with correct derived fields', async () => {
  // 2026-08-29: this real fixture was moved from needs_attention to
  // awaiting_final_review via the dashboard's "Accept Review & Continue"
  // operator action (see order-state.mjs's recordManualReviewAcceptance and
  // discover-customer-status.test.mjs's test B, which asserts the original
  // completeness_gate_failed evidence survived that transition intact).
  const { orders } = await listOrders();
  const row = orders.find((o) => o.slug === 'mulberry-creek-2');
  assert.ok(row, 'mulberry-creek-2 must appear in listOrders()');
  assert.equal(row.status, 'awaiting_final_review');
  assert.equal(row.reportAvailable, true);
  assert.equal(row.nextAction, 'Review report / Approve & Send');
  assert.equal(row.priorityTier, 1);
  assert.equal(row.costUsd > 0, true);
  assert.equal(row.dataforseoCostUsd, null); // explicit data gap, not invented
  // reviewRequired only ever applies to needs_attention — now that the
  // order is awaiting_final_review, Approve & Send's own status check is
  // what gates delivery, not this flag.
  assert.equal(row.reviewRequired, false);
});

// Dedicated slug, distinct from clients/test/ -- wp-tracker-sync.test.mjs
// already uses that one, and node --test runs files concurrently, so
// sharing a scratch slug across test files causes real file-lock races.
const SLUG = '__order-aggregator-test__';
before(async () => { await rm(clientDir(SLUG), { recursive: true, force: true }); });
after(async () => { await rm(clientDir(SLUG), { recursive: true, force: true }); });
afterEach(async () => {
  await rm(orderPath(SLUG), { force: true });
});

test('C. a needs_attention fixture with no report draft is visibly prioritized (tier 0) with "Investigate failure"', async () => {
  const order = newOrder(SLUG, 'discover');
  order.status = 'needs_attention';
  order.failure = { errorClass: 'unknown_agent_error', message: 'crashed', customerActionRequired: false, retryAvailable: true };
  await saveOrder(order);

  const detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.priorityTier, 0);
  assert.equal(detail.order.nextAction, 'Investigate failure');
  // A genuine failure (no report draft at all) must NOT be softened to a
  // review flag — this is exactly the case the dashboard wording pass must
  // keep looking clearly broken.
  assert.equal(detail.order.reviewRequired, false);
});

test('D. a delivered fixture (delivered well over an hour ago) shows complete / no action', async () => {
  const order = newOrder(SLUG, 'discover');
  order.status = 'delivered';
  order.approval = { approvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), approvedBy: 'test', requestedAt: null, batchId: null };
  order.delivery = { deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), method: 'email' };
  await saveOrder(order);

  const detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.priorityTier, 6);
  assert.equal(detail.order.nextAction, 'None / Complete');
  assert.equal(detail.order.reviewRequired, false); // review-flag wording only ever applies to needs_attention
});

test('F. reviewRequired is presentation-only: true only for needs_attention with both drafts present and no customer action required', async () => {
  // needs_attention + both drafts + no customer action -> review flag
  const reviewCase = newOrder(SLUG, 'discover');
  reviewCase.status = 'needs_attention';
  reviewCase.failure = { errorClass: 'completeness_gate_failed', message: 'x', customerActionRequired: false, retryAvailable: true };
  reviewCase.reportPdfPath = 'clients/x/discover/report.pdf';
  reviewCase.appendixPdfPath = 'clients/x/discover/appendix.pdf';
  await saveOrder(reviewCase);
  let detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.reviewRequired, true);
  assert.equal(detail.order.status, 'needs_attention'); // underlying status untouched

  // needs_attention + both drafts, but customer action IS required -> not a review flag
  const customerCase = newOrder(SLUG, 'discover');
  customerCase.status = 'needs_attention';
  customerCase.failure = { errorClass: 'client_data_incomplete', message: 'x', customerActionRequired: true, retryAvailable: true };
  customerCase.reportPdfPath = 'clients/x/discover/report.pdf';
  customerCase.appendixPdfPath = 'clients/x/discover/appendix.pdf';
  await saveOrder(customerCase);
  detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.reviewRequired, false);

  // awaiting_final_review is never a "review flag" case (it has its own,
  // already-correct amber presentation) -- reviewRequired only applies to
  // needs_attention.
  const readyCase = newOrder(SLUG, 'discover');
  readyCase.status = 'awaiting_final_review';
  await saveOrder(readyCase);
  detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.reviewRequired, false);
});

test('E. cost displays the actual stored value when present, and null (not invented) when absent', async () => {
  const order = newOrder(SLUG, 'discover');
  order.status = 'running';
  order.costUsd = 4.2;
  await saveOrder(order);
  let detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.costUsd, 4.2);
  assert.equal(detail.order.dataforseoCostUsd, null);

  const order2 = newOrder(SLUG, 'discover');
  order2.status = 'running';
  await saveOrder(order2); // costUsd stays null (never set)
  detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.costUsd, null);
});

test('H. Approve & Send guard: only a genuinely awaiting_final_review order is eligible (checked the same way the bridge route checks it)', async () => {
  const notReady = newOrder(SLUG, 'discover');
  notReady.status = 'needs_attention';
  await saveOrder(notReady);
  let detail = await getOrderDetail(SLUG);
  assert.notEqual(detail.order.status, 'awaiting_final_review');

  const ready = newOrder(SLUG, 'discover');
  ready.status = 'awaiting_final_review';
  await saveOrder(ready);
  detail = await getOrderDetail(SLUG);
  assert.equal(detail.order.status, 'awaiting_final_review');
});
