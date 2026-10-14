/**
 * Tests syncOrderToWordPress's idempotency and fail-closed order-matching
 * behavior. No live network calls -- global.fetch is stubbed so these run
 * fast and never touch the real WordPress site. (Live verification against
 * the real order-status route happens separately, by hand, against the
 * approved test order.)
 */
import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { newOrder, saveOrder, orderPath } from '../lib/order-state.mjs';
import { syncOrderToWordPress } from '../lib/wp-tracker-sync.mjs';

const SLUG = 'test'; // clients/test/ -- existing repo scratch fixture directory, not a real client

let originalFetch;
let originalEnv;

before(() => {
  originalEnv = { ...process.env };
  process.env.WP_TRACKER_BASE_URL = 'https://example.invalid';
  process.env.WP_TRACKER_USER = 'fixture-user';
  process.env.WP_TRACKER_APP_PASSWORD = 'fixture-pass';
});

after(() => {
  process.env = originalEnv;
});

beforeEach(() => {
  originalFetch = global.fetch;
});

afterEach(async () => {
  global.fetch = originalFetch;
  await rm(orderPath(SLUG), { force: true });
});

test('idempotency: identical projection is skipped on the second call, only one real fetch happens', async () => {
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => '{}' };
  };

  const order = newOrder(SLUG, 'discover');
  order.orderId = '999999'; // fixture id -- fetch is stubbed, never a real HTTP call
  order.status = 'awaiting_final_review';
  order.reportPdfPath = `clients/${SLUG}/discover/report.pdf`;
  await saveOrder(order);

  const first = await syncOrderToWordPress(SLUG);
  assert.equal(first.ok, true);
  assert.equal(fetchCalls, 1);

  const second = await syncOrderToWordPress(SLUG);
  assert.equal(second.skipped, true);
  assert.equal(second.reason, 'unchanged');
  assert.equal(fetchCalls, 1, 'second call with an identical projection must not re-POST');
});

test('a real state change after a synced state triggers exactly one more sync', async () => {
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => '{}' };
  };

  const order = newOrder(SLUG, 'discover');
  order.orderId = '999999';
  order.status = 'running';
  await saveOrder(order);
  await syncOrderToWordPress(SLUG);
  assert.equal(fetchCalls, 1);

  // Re-sync with no change -- must not fire again.
  await syncOrderToWordPress(SLUG);
  assert.equal(fetchCalls, 1);

  // Advance to a genuinely different customer-facing state.
  const order2 = newOrder(SLUG, 'discover');
  order2.orderId = '999999';
  order2.status = 'awaiting_final_review';
  order2.reportPdfPath = `clients/${SLUG}/discover/report.pdf`;
  await saveOrder(order2);
  await syncOrderToWordPress(SLUG);
  assert.equal(fetchCalls, 2, 'a genuine status change must trigger exactly one new sync');
});

test('missing order id fails closed: no fetch attempted, order id never guessed', async () => {
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => '{}' };
  };

  const order = newOrder(SLUG, 'discover');
  order.orderId = null;
  order.status = 'running';
  await saveOrder(order);

  const result = await syncOrderToWordPress(SLUG);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'missing_or_invalid_order_id');
  assert.equal(fetchCalls, 0, 'must never attempt a network call without a valid order id');
});

test('non-numeric order id fails closed the same way', async () => {
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => '{}' };
  };

  const order = newOrder(SLUG, 'discover');
  order.orderId = 'not-a-real-id';
  order.status = 'running';
  await saveOrder(order);

  const result = await syncOrderToWordPress(SLUG);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'missing_or_invalid_order_id');
  assert.equal(fetchCalls, 0);
});

test('no order.json at all is a clean skip, not a crash', async () => {
  await rm(orderPath(SLUG), { force: true });
  const result = await syncOrderToWordPress(SLUG);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'no_order_json');
});

test('an HTTP failure is reported, not thrown, and never marks the order as synced', async () => {
  global.fetch = async () => ({ ok: false, status: 500, text: async () => 'server error' });

  const order = newOrder(SLUG, 'discover');
  order.orderId = '999999';
  order.status = 'running';
  await saveOrder(order);

  const result = await syncOrderToWordPress(SLUG);
  assert.equal(result.ok, false);
  assert.equal(result.status, 500);

  const { loadOrder } = await import('../lib/order-state.mjs');
  const reloaded = await loadOrder(SLUG);
  assert.equal(reloaded.wpSync, undefined, 'a failed POST must not record a wpSync snapshot');
});
