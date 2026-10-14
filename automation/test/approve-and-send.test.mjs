/**
 * approve-and-send.mjs tests. global.fetch is stubbed for every test in
 * this file -- NO test here is ever allowed to reach a real Resend
 * endpoint, and runScript is a fake that never spawns a real child process
 * (build-resend-payload.mjs / mark-delivered.mjs are never actually run).
 * This is deliberate: this file exists specifically to prove the send path
 * behaves correctly WITHOUT ever sending a real email — see the module's
 * own header comment.
 *
 * Uses a disposable client slug (__approve-and-send-test__, cleaned up
 * before/after), same convention as the other lib tests.
 */
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { approveAndSend, ApproveAndSendError } from '../lib/approve-and-send.mjs';
import { newOrder, saveOrder, loadOrder, recordDelivery, clientDir } from '../lib/order-state.mjs';

const SLUG = '__approve-and-send-test__';
const DISCOVER_DIR = path.join(clientDir(SLUG), 'discover');
const REPORT_PDF_PATH = `clients/${SLUG}/discover/report.pdf`;
const APPENDIX_PDF_PATH = `clients/${SLUG}/discover/appendix.pdf`;

async function makeReadyOrder(overrides = {}) {
  const order = newOrder(SLUG, 'discover');
  order.status = 'awaiting_final_review';
  order.reportPdfPath = REPORT_PDF_PATH;
  order.appendixPdfPath = APPENDIX_PDF_PATH;
  order.contactEmail = 'test@example.com';
  order.businessName = 'Test Co';
  Object.assign(order, overrides);
  await saveOrder(order);
  return order;
}

function fakeRunScriptOk() {
  const calls = [];
  const runScript = async (scriptName, args) => {
    calls.push({ scriptName, args });
    if (scriptName === 'build-resend-payload.mjs') {
      return JSON.stringify({
        from: 'Scrolly Social <hello@scrollyseo.com>',
        to: ['test@example.com'],
        subject: 'Your SEO Discovery Report is ready — Test Co',
        html: '<p>hi</p>',
        attachments: [
          { filename: 'report.pdf', content: 'YQ==' },
          { filename: 'appendix.pdf', content: 'YQ==' },
        ],
      });
    }
    if (scriptName === 'mark-delivered.mjs') {
      // Stands in for the real mark-delivered.mjs (never actually spawned
      // in this test file) -- reproduces its one real side effect
      // (recordDelivery) so assertions about the final order status are
      // meaningful, without a real child process or a real WordPress sync.
      await recordDelivery(SLUG, 'discover', { method: 'email' });
      return JSON.stringify({ slug: SLUG, delivered: true });
    }
    throw new Error(`fakeRunScriptOk: unexpected script "${scriptName}"`);
  };
  return { runScript, calls };
}

let originalFetch;
before(async () => {
  originalFetch = global.fetch;
  await rm(clientDir(SLUG), { recursive: true, force: true });
  await mkdir(DISCOVER_DIR, { recursive: true });
  // Real (tiny, dummy) files on disk -- approveAndSend checks existsSync on
  // the resolved paths, it doesn't just trust the order.json string fields.
  await writeFile(path.join(DISCOVER_DIR, 'report.pdf'), '%PDF-1.4 dummy report', 'utf8');
  await writeFile(path.join(DISCOVER_DIR, 'appendix.pdf'), '%PDF-1.4 dummy appendix', 'utf8');
});
after(async () => {
  global.fetch = originalFetch;
  await rm(clientDir(SLUG), { recursive: true, force: true });
});
beforeEach(() => {
  // Hard default: any test that forgets to stub fetch explicitly gets a
  // hard failure instead of silently reaching the real network.
  global.fetch = async () => { throw new Error('test suite must not make real network/Resend calls'); };
});

test('rejects when order is not awaiting_final_review', async () => {
  await makeReadyOrder({ status: 'needs_attention' });
  const { runScript } = fakeRunScriptOk();
  await assert.rejects(() => approveAndSend(SLUG, { runScript }), ApproveAndSendError);
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'needs_attention'); // untouched
});

test('rejects when report.pdf is missing on disk, even if order.json claims it exists', async () => {
  await makeReadyOrder({ reportPdfPath: `clients/${SLUG}/discover/does-not-exist.pdf` });
  const { runScript, calls } = fakeRunScriptOk();
  await assert.rejects(() => approveAndSend(SLUG, { runScript }), /report\.pdf/);
  assert.equal(calls.length, 0, 'must never reach build-resend-payload.mjs without both PDFs verified first');
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review'); // untouched, safe to retry
  assert.equal(order.approval.approvedAt, null);
});

test('rejects when appendix.pdf is missing on disk', async () => {
  await makeReadyOrder({ appendixPdfPath: `clients/${SLUG}/discover/does-not-exist.pdf` });
  const { runScript, calls } = fakeRunScriptOk();
  await assert.rejects(() => approveAndSend(SLUG, { runScript }), /appendix\.pdf/);
  assert.equal(calls.length, 0);
});

test('a successful Resend call sends both real PDF attachments, THEN approves, THEN marks delivered', async () => {
  await makeReadyOrder();
  let capturedBody = null;
  global.fetch = async (url, opts) => {
    assert.equal(url, 'https://api.resend.com/emails');
    capturedBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ id: 'resend_abc123' }) };
  };
  const { runScript, calls } = fakeRunScriptOk();

  const result = await approveAndSend(SLUG, { runScript });

  // The actual deliverable reached Resend as real attachments.
  assert.equal(capturedBody.attachments.length, 2);
  assert.deepEqual(capturedBody.attachments.map((a) => a.filename).sort(), ['appendix.pdf', 'report.pdf']);
  assert.equal(capturedBody.to[0], 'test@example.com');

  // Ordering: build payload -> (fetch happens between these two calls,
  // asserted separately below) -> mark-delivered, never the old
  // approve-before-send ordering.
  assert.deepEqual(calls.map((c) => c.scriptName), ['build-resend-payload.mjs', 'mark-delivered.mjs']);

  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'delivered');
  assert.ok(order.approval.approvedAt, 'approval must be recorded only after Resend confirmed acceptance');
  assert.equal(order.approval.approvedBy, 'dashboard');
  assert.equal(order.lastDeliveryFailure, undefined);
  assert.equal(result.resendId, 'resend_abc123');
});

test('a rejected Resend response (non-2xx) leaves the order at awaiting_final_review, never approved, never delivered', async () => {
  await makeReadyOrder();
  global.fetch = async () => ({ ok: false, status: 422, text: async () => 'Invalid `to` field' });
  const { runScript, calls } = fakeRunScriptOk();

  await assert.rejects(() => approveAndSend(SLUG, { runScript }), ApproveAndSendError);

  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review'); // not stuck at 'approved', genuinely retryable
  assert.equal(order.approval.approvedAt, null);
  assert.equal(order.delivery.deliveredAt, null);
  assert.ok(order.lastDeliveryFailure, 'a delivery failure must be recorded');
  assert.equal(order.lastDeliveryFailure.reason, 'resend_rejected');
  assert.ok(order.lastDeliveryFailure.message.includes('422'));
  // mark-delivered.mjs must never have been called.
  assert.ok(!calls.some((c) => c.scriptName === 'mark-delivered.mjs'));
});

test('a network-level fetch failure (Resend unreachable) is treated the same as a rejection, not silently swallowed', async () => {
  await makeReadyOrder();
  global.fetch = async () => { throw new Error('ECONNRESET'); };
  const { runScript, calls } = fakeRunScriptOk();

  await assert.rejects(() => approveAndSend(SLUG, { runScript }), ApproveAndSendError);
  const order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review');
  assert.equal(order.lastDeliveryFailure.reason, 'resend_request_failed');
  assert.ok(!calls.some((c) => c.scriptName === 'mark-delivered.mjs'));
});

test('a build-resend-payload.mjs failure is recorded and never reaches Resend at all', async () => {
  await makeReadyOrder();
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; };
  const runScript = async (scriptName) => {
    if (scriptName === 'build-resend-payload.mjs') throw new Error('No contact.json found');
    throw new Error(`unexpected script "${scriptName}"`);
  };

  await assert.rejects(() => approveAndSend(SLUG, { runScript }), ApproveAndSendError);
  assert.equal(fetchCalled, false, 'must never call Resend if the payload could not be built');
  const order = await loadOrder(SLUG);
  assert.equal(order.lastDeliveryFailure.reason, 'payload_build_failed');
});

test('a payload with fewer than 2 attachments is refused before ever reaching Resend', async () => {
  await makeReadyOrder();
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; };
  const runScript = async (scriptName) => {
    if (scriptName === 'build-resend-payload.mjs') {
      return JSON.stringify({ to: ['test@example.com'], attachments: [{ filename: 'report.pdf', content: 'YQ==' }] });
    }
    throw new Error(`unexpected script "${scriptName}"`);
  };

  await assert.rejects(() => approveAndSend(SLUG, { runScript }), /missing one or both PDF attachments/);
  assert.equal(fetchCalled, false);
  const order = await loadOrder(SLUG);
  assert.equal(order.lastDeliveryFailure.reason, 'attachments_incomplete');
});

test('after a successful delivery, a second call is rejected and does not send another email (no duplicate send)', async () => {
  await makeReadyOrder();
  let fetchCallCount = 0;
  global.fetch = async () => { fetchCallCount++; return { ok: true, json: async () => ({ id: 'resend_first' }) }; };
  const { runScript } = fakeRunScriptOk();

  await approveAndSend(SLUG, { runScript }); // first call succeeds
  assert.equal(fetchCallCount, 1);

  await assert.rejects(() => approveAndSend(SLUG, { runScript }), /not awaiting final review/);
  assert.equal(fetchCallCount, 1, 'a second call after success must not hit Resend again');
});

test('a delivery failure followed by a genuine fixed retry succeeds normally (manual retry is allowed, not blocked)', async () => {
  await makeReadyOrder();
  global.fetch = async () => ({ ok: false, status: 500, text: async () => 'temporary outage' });
  const { runScript } = fakeRunScriptOk();
  await assert.rejects(() => approveAndSend(SLUG, { runScript }));

  let order = await loadOrder(SLUG);
  assert.equal(order.status, 'awaiting_final_review');

  // Operator retries after the transient issue clears.
  global.fetch = async () => ({ ok: true, json: async () => ({ id: 'resend_retry_ok' }) });
  const result = await approveAndSend(SLUG, { runScript });
  assert.equal(result.resendId, 'resend_retry_ok');

  order = await loadOrder(SLUG);
  assert.equal(order.status, 'delivered');
});
