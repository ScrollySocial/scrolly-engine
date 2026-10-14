/**
 * order-state.mjs round-trip tests. Uses a disposable client slug
 * (__order-state-test__, cleaned up before and after) under the real
 * clients/ dir — same convention this repo already uses for smoke-test
 * client folders (see automation/README.md's Cleanup note). No network,
 * no Agent SDK, no paid calls.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadOrder, saveOrder, newOrder, updateOrder, recordIntakeReceived, recordApproval, recordDelivery, recordRunStarted, recordFailure, recordReadyForReview, recordManualReviewAcceptance, setCurrentStep, orderPath, orderEventLogPath, clientDir } from '../lib/order-state.mjs';

const SLUG = '__order-state-test__';

before(async () => {
  await rm(clientDir(SLUG), { recursive: true, force: true });
});
after(async () => {
  await rm(clientDir(SLUG), { recursive: true, force: true });
});

test('loadOrder returns null when no order.json exists yet', async () => {
  assert.equal(await loadOrder(SLUG), null);
});

test('saveOrder / loadOrder round-trip', async () => {
  const order = newOrder(SLUG, 'discover');
  order.businessName = 'Test Co';
  await saveOrder(order);
  const loaded = await loadOrder(SLUG);
  assert.equal(loaded.businessName, 'Test Co');
  assert.equal(loaded.status, 'paid');
  assert.equal(loaded.productType, 'discover');
});

test('updateOrder creates when absent, mutates when present', async () => {
  await rm(clientDir(SLUG), { recursive: true, force: true });
  await updateOrder(SLUG, 'discover', (o) => {
    o.businessName = 'First Write';
  });
  let loaded = await loadOrder(SLUG);
  assert.equal(loaded.businessName, 'First Write');

  await updateOrder(SLUG, 'discover', (o) => {
    o.businessName = 'Second Write';
  });
  loaded = await loadOrder(SLUG);
  assert.equal(loaded.businessName, 'Second Write');
});

test('recordRunStarted resets step/failure state but keeps identity fields settable', async () => {
  await recordRunStarted(SLUG, 'discover', { businessName: 'Acme', orderId: '999' });
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'running');
  assert.equal(order.businessName, 'Acme');
  assert.equal(order.orderId, '999');
  assert.equal(order.currentStep, null);
  assert.deepEqual(order.completedSteps, []);
  assert.equal(order.failure, null);
  assert.ok(order.timestamps.runStartedAt);
});

test('setCurrentStep advances currentStep and backfills completedSteps/lastCheckpoint', async () => {
  await recordRunStarted(SLUG, 'discover', {});
  const changed1 = await setCurrentStep(SLUG, 'discover', { id: 'step_3_data_plan', label: 'Drafting data plan' });
  assert.equal(changed1, true);
  let order = await loadOrder(SLUG);
  assert.equal(order.currentStep.id, 'step_3_data_plan');
  assert.deepEqual(order.completedSteps, []); // nothing before it yet

  const changed2 = await setCurrentStep(SLUG, 'discover', { id: 'step_9_structured_records', label: 'Writing structured findings' });
  assert.equal(changed2, true);
  order = await loadOrder(SLUG);
  assert.equal(order.currentStep.id, 'step_9_structured_records');
  assert.ok(order.completedSteps.includes('step_3_data_plan'));
  assert.equal(order.lastCheckpoint.step, 'step_3_data_plan');

  // Re-invoking with the SAME step id is a no-op — no event, no state churn.
  const changed3 = await setCurrentStep(SLUG, 'discover', { id: 'step_9_structured_records', label: 'Writing structured findings' });
  assert.equal(changed3, false);
});

test('recordFailure sets needs_attention + failure without inventing a completed step', async () => {
  await recordRunStarted(SLUG, 'discover', {});
  await setCurrentStep(SLUG, 'discover', { id: 'step_5_query_sources', label: 'Collecting external data' });
  await recordFailure(SLUG, 'discover', { errorClass: 'budget_ceiling', message: 'Reached maximum budget ($2)', retryAvailable: true, customerActionRequired: false });

  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'needs_attention');
  assert.equal(order.failure.errorClass, 'budget_ceiling');
  assert.ok(order.failure.occurredAt);
  // The step it failed inside of was never completed — must not appear as completed.
  assert.ok(!order.completedSteps.includes('step_5_query_sources'));
});

test('recordManualReviewAcceptance moves needs_attention -> awaiting_final_review WITHOUT clearing the original failure evidence', async () => {
  await recordRunStarted(SLUG, 'discover', {});
  await setCurrentStep(SLUG, 'discover', { id: 'step_13_derive_outputs', label: 'Generating report & appendix' });
  await recordFailure(SLUG, 'discover', {
    errorClass: 'completeness_gate_failed',
    message: 'Required source(s) failed: Competitor comparison / keyword-gap data',
    retryAvailable: true,
    customerActionRequired: false,
  });
  await updateOrder(SLUG, 'discover', (o) => {
    o.reportPdfPath = `clients/${SLUG}/discover/report.pdf`;
    o.appendixPdfPath = `clients/${SLUG}/discover/appendix.pdf`;
  });

  await recordManualReviewAcceptance(SLUG, 'discover', { operator: 'test-operator', note: 'Reviewed manually, substitute evidence adequate.' });

  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review');
  // The whole point of this action: the original gate failure must survive.
  assert.ok(order.failure, 'order.failure must NOT be cleared by a manual review acceptance');
  assert.equal(order.failure.errorClass, 'completeness_gate_failed');
  assert.equal(order.failure.message, 'Required source(s) failed: Competitor comparison / keyword-gap data');
  // Audit trail recorded on the order itself.
  assert.equal(order.manualReview.operator, 'test-operator');
  assert.equal(order.manualReview.priorStatus, 'needs_attention');
  assert.equal(order.manualReview.priorFailure.errorClass, 'completeness_gate_failed');
  assert.ok(order.manualReview.acceptedAt);

  const log = await readFile(orderEventLogPath(SLUG), 'utf8');
  const lines = log.trim().split('\n').map((l) => JSON.parse(l));
  const evt = lines.find((l) => l.type === 'manual_review_accepted');
  assert.ok(evt, 'manual_review_accepted must be logged');
  assert.equal(evt.priorStatus, 'needs_attention');
  assert.equal(evt.resultingStatus, 'awaiting_final_review');
  assert.equal(evt.failureErrorClass, 'completeness_gate_failed');
  assert.equal(evt.operator, 'test-operator');
});

test('recordReadyForReview clears failure and sets awaiting_final_review', async () => {
  await recordRunStarted(SLUG, 'discover', {});
  await setCurrentStep(SLUG, 'discover', { id: 'step_13_derive_outputs', label: 'Generating report & appendix' });
  await recordReadyForReview(SLUG, 'discover', { reportPdfPath: `clients/${SLUG}/discover/report.pdf` });

  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review');
  assert.equal(order.failure, null);
  assert.equal(order.currentStep, null);
  assert.ok(order.completedSteps.includes('step_13_derive_outputs'));
  assert.equal(order.reportPdfPath, `clients/${SLUG}/discover/report.pdf`);
});

test('recordIntakeReceived sets ready_to_run and identity fields', async () => {
  await recordIntakeReceived(SLUG, 'discover', { orderId: '272', orderKey: 'wc_order_abc', businessName: 'Acme', contactEmail: 'a@acme.com' });
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'ready_to_run');
  assert.equal(order.orderId, '272');
  assert.equal(order.businessName, 'Acme');
});

test('recordApproval sets approved + approval.approvedAt without touching delivery', async () => {
  await recordReadyForReview(SLUG, 'discover', {});
  await recordApproval(SLUG, 'discover', { approvedBy: 'mercedes' });
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'approved');
  assert.equal(order.approval.approvedBy, 'mercedes');
  assert.ok(order.approval.approvedAt);
  assert.equal(order.delivery?.deliveredAt, null);
});

test('recordDelivery sets delivered + delivery.deliveredAt', async () => {
  await recordDelivery(SLUG, 'discover', { method: 'email' });
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'delivered');
  assert.equal(order.delivery.method, 'email');
  assert.ok(order.delivery.deliveredAt);
});

test('logOrderEvent (via setCurrentStep/recordFailure) appends to order-events.ndjson', async () => {
  const log = await readFile(orderEventLogPath(SLUG), 'utf8');
  const lines = log.trim().split('\n').map((l) => JSON.parse(l));
  assert.ok(lines.length > 0);
  assert.ok(lines.every((l) => l.at && l.slug === SLUG && l.type));
  assert.ok(lines.some((l) => l.type === 'run_started'));
  assert.ok(lines.some((l) => l.type === 'step_started'));
  assert.ok(lines.some((l) => l.type === 'failed'));
  assert.ok(lines.some((l) => l.type === 'manual_review_accepted'));
  assert.ok(lines.some((l) => l.type === 'ready_for_review'));
  assert.ok(lines.some((l) => l.type === 'intake_received'));
  assert.ok(lines.some((l) => l.type === 'approved'));
  assert.ok(lines.some((l) => l.type === 'delivered'));
});

test('order.json is valid, pretty-printed JSON on disk at the expected path', async () => {
  const raw = await readFile(orderPath(SLUG), 'utf8');
  const parsed = JSON.parse(raw); // throws if malformed
  assert.equal(parsed.slug, SLUG);
  assert.ok(raw.includes('\n  '), 'expected pretty-printed (indented) JSON');
});
