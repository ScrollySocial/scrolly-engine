/**
 * Tests the customer-status mapping against real and synthetic order.json
 * fixtures. No Discover run, no Anthropic/DataForSEO/WordPress calls --
 * pure mapping logic only.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { toCustomerStatus, toAdminStatus } from '../lib/discover-customer-status.mjs';
import { CUSTOMER_STATUSES } from '../lib/customer-status-contract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const FORBIDDEN_TERMS = ['completeness_gate_failed', 'DataForSEO', 'dataforseo', 'domain_intersection', '22.62', 'costUsd', 'Anthropic', 'claude', 'gate not confirmed'];

function assertNoLeak(customer) {
  const serialized = JSON.stringify(customer).toLowerCase();
  for (const forbidden of FORBIDDEN_TERMS) {
    assert.ok(!serialized.includes(forbidden.toLowerCase()), `customer-facing object must not leak "${forbidden}"`);
  }
}

// --- A: running -> analysis_in_progress -------------------------------------
test('A. internal status "running" maps to analysis_in_progress', () => {
  const c = toCustomerStatus({ orderId: '500', status: 'running', currentStep: { id: 'step_6_keyword_universe' }, failure: null, approval: {}, delivery: {} });
  assert.equal(c.customerStatus, 'analysis_in_progress');
  assert.equal(c.customerMessage, 'Your analysis is in progress.');
  assert.equal(c.actionRequired, false);
});

// --- B: the real mulberry-creek-2 order (order 272) -------------------------
// 2026-08-29: this real fixture was deliberately moved from needs_attention
// to awaiting_final_review via the dashboard's new "Accept Review &
// Continue" operator action (see order-state.mjs's
// recordManualReviewAcceptance) -- an operator reviewed the completeness-
// gate failure and the already-generated report/appendix and manually
// accepted it. order.failure is preserved as-is (never cleared) precisely
// so this sanity check can still see the original gate failure underneath
// the new status; order.manualReview carries the acceptance audit record.
test('B. real order 272 (awaiting_final_review after manual review acceptance, original completeness_gate_failed evidence preserved) maps to in_final_review, never a failure', async () => {
  const raw = await readFile(path.join(VAULT_DIR, 'clients', 'mulberry-creek-2', 'order.json'), 'utf8');
  const order = JSON.parse(raw);

  // Sanity-check the fixture is what we think it is, so this test fails
  // loudly if the real file ever changes underneath it.
  assert.equal(order.status, 'awaiting_final_review');
  assert.equal(order.failure.errorClass, 'completeness_gate_failed'); // preserved, not cleared, by the manual review acceptance
  assert.equal(order.failure.customerActionRequired, false);
  assert.ok(order.reportPdfPath, 'fixture assumption: a report draft exists on disk');
  assert.equal(order.manualReview.priorStatus, 'needs_attention'); // the audit trail of how it got here

  const customer = toCustomerStatus(order);
  assert.equal(customer.customerStatus, 'in_final_review');
  assert.equal(customer.customerMessage, 'Your report is in final review.');
  assert.equal(customer.actionRequired, false);
  assert.equal(customer.reportAvailable, false);
  assertNoLeak(customer);

  // The admin view, by contrast, MUST retain full detail.
  const admin = toAdminStatus(order);
  assert.equal(admin.failure.errorClass, 'completeness_gate_failed');
  assert.equal(admin.costUsd, order.costUsd);
});

// --- C: needs_attention, no customer action, never exposes the error --------
test('C1. needs_attention with no report draft yet (early failure) -> analysis_in_progress, no leak', () => {
  const order = {
    orderId: '600',
    status: 'needs_attention',
    failure: { errorClass: 'dataforseo_billing', message: 'DataForSEO account balance exhausted mid-run', customerActionRequired: false },
    reportPdfPath: null,
    appendixPdfPath: null,
    approval: {},
    delivery: {},
  };
  const c = toCustomerStatus(order);
  assert.equal(c.customerStatus, 'analysis_in_progress');
  assertNoLeak(c);
});

test('C2. needs_attention with a report draft already on disk -> in_final_review, no leak', () => {
  const order = {
    orderId: '601',
    status: 'needs_attention',
    failure: { errorClass: 'unknown_agent_error', message: 'agent session crashed after quality gate', customerActionRequired: false },
    reportPdfPath: 'clients/x/discover/report.pdf',
    appendixPdfPath: null,
    approval: {},
    delivery: {},
  };
  const c = toCustomerStatus(order);
  assert.equal(c.customerStatus, 'in_final_review');
  assertNoLeak(c);
});

// --- D: customer action genuinely required -----------------------------------
test('D. failure.customerActionRequired true -> action_required with expected message/action metadata', () => {
  const c = toCustomerStatus({
    orderId: '502',
    status: 'needs_attention',
    failure: { errorClass: 'some_internal_thing', customerActionRequired: true },
    approval: {},
    delivery: {},
  });
  assert.equal(c.customerStatus, 'action_required');
  assert.equal(c.actionRequired, true);
  assert.equal(c.actionLabel, 'Provide more information');
  assert.equal(c.customerMessage, 'We need a bit more information from you to continue.');
  assertNoLeak(c);
});

// --- E: the JS mapping layer never carries over stale action state ----------
// (the live WordPress clearing behavior itself is verified separately,
// directly against the route -- this proves the pure mapping function has
// no "previous action" state to leak across calls in the first place.)
test('E. a subsequent computation with no action pending yields null action fields, independent of any prior call', () => {
  const withAction = toCustomerStatus({
    orderId: '700', status: 'needs_attention',
    failure: { customerActionRequired: true }, approval: {}, delivery: {},
  });
  assert.equal(withAction.actionRequired, true);
  assert.notEqual(withAction.actionLabel, null);

  const withoutAction = toCustomerStatus({
    orderId: '700', status: 'awaiting_final_review',
    failure: null, reportPdfPath: 'clients/x/discover/report.pdf', approval: {}, delivery: {},
  });
  assert.equal(withoutAction.actionRequired, false);
  assert.equal(withoutAction.actionLabel, null);
  assert.equal(withoutAction.actionUrl, null);
});

// --- F: delivered -> ready ----------------------------------------------------
test('F. delivered -> ready, "Your report is ready."', () => {
  const c = toCustomerStatus({
    orderId: '504',
    status: 'delivered',
    failure: null,
    approval: { approvedAt: '2026-08-27T00:00:00Z' },
    delivery: { deliveredAt: '2026-08-27T01:00:00Z' },
    reportPdfPath: 'clients/x/discover/report.pdf',
  });
  assert.equal(c.customerStatus, 'ready');
  assert.equal(c.customerMessage, 'Your report is ready.');
  assert.equal(c.reportAvailable, true);
});

test('approved-but-not-yet-delivered also reads as ready (customer doesn\'t need the internal distinction)', () => {
  const c = toCustomerStatus({
    orderId: '503', status: 'awaiting_final_review', failure: null,
    approval: { approvedAt: '2026-08-27T00:00:00Z', approvedBy: 'mercedes' },
    delivery: { deliveredAt: null },
    reportPdfPath: 'clients/x/discover/report.pdf',
  });
  assert.equal(c.customerStatus, 'ready');
  assert.equal(c.reportAvailable, true);
});

// --- Remaining states ---------------------------------------------------------
test('no order.json + no Tally link -> intake_required', () => {
  const c = toCustomerStatus(null, {});
  assert.equal(c.customerStatus, 'intake_required');
  assert.equal(c.actionRequired, false);
});

test('no order.json + a Tally link is known -> intake_required with the intake action', () => {
  const c = toCustomerStatus(null, { orderId: '999', tallyIntakeUrl: 'https://tally.so/r/D4OVlE?order_id=999&order_key=abc' });
  assert.equal(c.customerStatus, 'intake_required');
  assert.equal(c.actionRequired, true);
  assert.equal(c.actionLabel, 'Complete your intake form');
  assert.equal(c.actionUrl, 'https://tally.so/r/D4OVlE?order_id=999&order_key=abc');
});

test('internal status ready_to_run -> information_received', () => {
  const c = toCustomerStatus({ orderId: '505', status: 'ready_to_run', failure: null, approval: {}, delivery: {} });
  assert.equal(c.customerStatus, 'information_received');
  assert.equal(c.customerMessage, 'We’ve received your information and your report is queued.');
});

test('internal status awaiting_final_review (gate actually passed, no report path set yet either) -> in_final_review', () => {
  const c = toCustomerStatus({ orderId: '501', status: 'awaiting_final_review', failure: null, approval: {}, delivery: {} });
  assert.equal(c.customerStatus, 'in_final_review');
});

test('every possible output is a valid enum member and passes the contract check', () => {
  const fixtures = [
    null,
    { orderId: '1', status: 'running', failure: null, approval: {}, delivery: {} },
    { orderId: '2', status: 'awaiting_final_review', failure: null, approval: {}, delivery: {} },
    { orderId: '3', status: 'needs_attention', failure: { errorClass: 'budget_ceiling', customerActionRequired: false }, approval: {}, delivery: {} },
    { orderId: '4', status: 'needs_attention', failure: { errorClass: 'x', customerActionRequired: true }, approval: {}, delivery: {} },
    { orderId: '5', status: 'ready_to_run', failure: null, approval: {}, delivery: {} },
    { orderId: '6', status: 'delivered', failure: null, approval: {}, delivery: {}, reportPdfPath: 'x' },
  ];
  for (const f of fixtures) {
    const c = toCustomerStatus(f);
    assert.ok(CUSTOMER_STATUSES.includes(c.customerStatus));
  }
});
