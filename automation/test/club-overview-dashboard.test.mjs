/**
 * Focused tests for the $1K Club dashboard's real backend logic
 * (member-growth-state.mjs): the honest activity streak, and the
 * getOverviewForToken() surface the overview.html dashboard renders from.
 *
 * Does not re-test Module 1-7 onboarding/gating (covered by their own
 * test files) beyond what's needed to reach a Club member the overview
 * service will accept.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding } from '../club/lib/onboarding-service.mjs';
import { fetchCustomerFirstName } from '../club/lib/club-order-verify.mjs';
import {
  computeStreak,
  createMemberGrowthStore,
  submitManualMetricsForToken,
  createOverviewService,
  createManualMetricsService,
} from '../club/lib/member-growth-state.mjs';

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

const CUSTOMER_IDS = [820101, 820102, 820103, 820104];

before(async () => {
  for (const id of CUSTOMER_IDS) await rm(memberDir(`customer-${id}`), { recursive: true, force: true });
});
after(async () => {
  for (const id of CUSTOMER_IDS) await rm(memberDir(`customer-${id}`), { recursive: true, force: true });
});

test('computeStreak: a real timestamp from today counts as an active 1-day streak', () => {
  const now = new Date().toISOString();
  assert.deepEqual(computeStreak([now]), { active: true, days: 1 });
});

test('computeStreak: a real timestamp from yesterday still counts as active (not yet broken)', () => {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  assert.deepEqual(computeStreak([yesterday]), { active: true, days: 1 });
});

test('computeStreak: the most recent action being 2+ days old is an inactive, not stale, streak', () => {
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
  assert.deepEqual(computeStreak([twoDaysAgo]), { active: false, days: 0 });
});

test('computeStreak: counts real consecutive calendar days, not raw timestamp equality', () => {
  const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString();
  // Same real bug this regression guards: two timestamps on the same
  // calendar day but different times must count as ONE day, not break
  // the chain or double count.
  const dates = [day(0), `${day(0).slice(0, 10)}T01:00:00.000Z`, day(1), day(2)];
  assert.deepEqual(computeStreak(dates), { active: true, days: 3 });
});

test('computeStreak: no dated activity at all is a clean inactive state, not an error', () => {
  assert.deepEqual(computeStreak([]), { active: false, days: 0 });
});

test('getOverviewForToken: a real member with manually-reported metrics gets honest streak/activity/baseline data', async () => {
  const customerId = 820101;
  const token = signAccessToken({ customerId, email: 'overview-qa-1@example.com' });
  const onboarding = await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Hand-poured candles', price: 40, audience: 'Home shoppers' },
  });
  assert.equal(onboarding.ok, true);

  const store = createMemberGrowthStore();
  const submitManualMetrics = createManualMetricsService({ store });
  const submitResult = await submitManualMetrics({ accessToken: token, values: { revenueUsd: 150, salesCount: 3, siteVisits: 120 } });
  assert.equal(submitResult.ok, true);

  const getOverview = createOverviewService({ store });
  const overview = await getOverview(token);
  assert.equal(overview.ok, true);

  // Just-submitted metrics are dated today -> a real, active 1-day streak.
  assert.equal(overview.streak.active, true);
  assert.equal(overview.streak.days, 1);

  // Baseline captured at first submission equals current (no drift yet).
  assert.equal(overview.baseline.metrics.revenueUsd.value, 150);
  assert.equal(overview.metrics.revenueUsd.value, 150);
  assert.equal(overview.metrics.revenueUsd.state, 'customer-reported');

  // No Growth Reviews or saved content exist yet for this member -- real
  // zeros, not fabricated activity.
  assert.equal(overview.activity.contentSavedCount, 0);
  assert.equal(overview.activity.growthReviewsCount, 0);
  assert.equal(overview.activity.latestGrowthReviewAt, null);
});

test('getOverviewForToken: a brand-new member with no growth-state data gets unknown metrics and an inactive streak, never fabricated numbers', async () => {
  const customerId = 820102;
  const token = signAccessToken({ customerId, email: 'overview-qa-2@example.com' });
  const onboarding = await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Hand-poured candles', price: 40, audience: 'Home shoppers' },
  });
  assert.equal(onboarding.ok, true);

  const getOverview = createOverviewService();
  const overview = await getOverview(token);
  assert.equal(overview.ok, true);

  assert.equal(overview.streak.active, false);
  assert.equal(overview.streak.days, 0);
  assert.equal(overview.baseline, null);
  assert.deepEqual(overview.metrics, {});
  assert.equal(overview.revenue30Day.known, false);
});

test('getOverviewForToken: an invalid/expired token is refused, never silently returns another member\'s data', async () => {
  const getOverview = createOverviewService();
  const result = await getOverview('not-a-real-token');
  assert.equal(result.ok, false);
});

// --- Real first name (fetchCustomerFirstName + identity.firstName) -------
// Never hits the real network: WC_STORE_BASE_URL/WC_AUDIT_CONSUMER_* are
// unset by default in the test environment (no dotenv preload in `npm
// test`), so the "unconfigured" paths below reflect real CI behavior, and
// the "success" paths use a mocked global.fetch, never scrollyseo.com.

let savedFetch;
let savedEnv;
function stubWcEnv() {
  savedEnv = {
    WC_STORE_BASE_URL: process.env.WC_STORE_BASE_URL,
    WC_AUDIT_CONSUMER_KEY: process.env.WC_AUDIT_CONSUMER_KEY,
    WC_AUDIT_CONSUMER_SECRET: process.env.WC_AUDIT_CONSUMER_SECRET,
  };
  process.env.WC_STORE_BASE_URL = 'example-test-store.invalid';
  process.env.WC_AUDIT_CONSUMER_KEY = 'test-key';
  process.env.WC_AUDIT_CONSUMER_SECRET = 'test-secret';
}
function restoreWcEnv() {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

test('fetchCustomerFirstName: unconfigured WC credentials return null, never throw', async () => {
  const originalBase = process.env.WC_STORE_BASE_URL;
  delete process.env.WC_STORE_BASE_URL;
  try {
    const result = await fetchCustomerFirstName(12345);
    assert.equal(result, null);
  } finally {
    if (originalBase !== undefined) process.env.WC_STORE_BASE_URL = originalBase;
  }
});

test('fetchCustomerFirstName: a real customer.first_name is returned, trimmed', async () => {
  stubWcEnv();
  savedFetch = global.fetch;
  global.fetch = async (url) => {
    assert.match(String(url), /\/wp-json\/wc\/v3\/customers\/555\b/);
    return { ok: true, json: async () => ({ id: 555, first_name: '  Jordan  ', billing: { first_name: 'Jordan' } }) };
  };
  try {
    const result = await fetchCustomerFirstName(555);
    assert.equal(result, 'Jordan');
  } finally {
    global.fetch = savedFetch;
    restoreWcEnv();
  }
});

test('fetchCustomerFirstName: falls back to billing.first_name when the top-level field is blank', async () => {
  stubWcEnv();
  savedFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ id: 556, first_name: '', billing: { first_name: 'Riley' } }) });
  try {
    const result = await fetchCustomerFirstName(556);
    assert.equal(result, 'Riley');
  } finally {
    global.fetch = savedFetch;
    restoreWcEnv();
  }
});

test('fetchCustomerFirstName: a 404/not-found customer returns null, not an error', async () => {
  stubWcEnv();
  savedFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 404 });
  try {
    const result = await fetchCustomerFirstName(999999);
    assert.equal(result, null);
  } finally {
    global.fetch = savedFetch;
    restoreWcEnv();
  }
});

test('fetchCustomerFirstName: a network failure returns null, never throws', async () => {
  stubWcEnv();
  savedFetch = global.fetch;
  global.fetch = async () => { throw new Error('ECONNRESET'); };
  try {
    const result = await fetchCustomerFirstName(1);
    assert.equal(result, null);
  } finally {
    global.fetch = savedFetch;
    restoreWcEnv();
  }
});

test('getOverviewForToken: identity.firstName is null (not fabricated) when the WC lookup is unconfigured', async () => {
  const customerId = 820103;
  const token = signAccessToken({ customerId, email: 'overview-qa-3@example.com' });
  const onboarding = await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Hand-poured candles', price: 40, audience: 'Home shoppers' },
  });
  assert.equal(onboarding.ok, true);

  const getOverview = createOverviewService();
  const overview = await getOverview(token);
  assert.equal(overview.ok, true);
  assert.equal(overview.identity.customerId, customerId);
  assert.equal(overview.identity.firstName, null);
});

test('getOverviewForToken: a real first name is fetched once and then cached on the member record, not re-fetched every load', async () => {
  const customerId = 820104;
  const token = signAccessToken({ customerId, email: 'overview-qa-4@example.com' });
  await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Hand-poured candles', price: 40, audience: 'Home shoppers' },
  });

  stubWcEnv();
  savedFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => { fetchCalls++; return { ok: true, json: async () => ({ first_name: 'Casey' }) }; };
  try {
    const getOverview = createOverviewService();
    const first = await getOverview(token);
    assert.equal(first.identity.firstName, 'Casey');
    assert.equal(fetchCalls, 1);

    // Second load: the name is now cached on disk -- must not hit "the
    // network" (the still-stubbed fetch) again.
    const second = await getOverview(token);
    assert.equal(second.identity.firstName, 'Casey');
    assert.equal(fetchCalls, 1);
  } finally {
    global.fetch = savedFetch;
    restoreWcEnv();
    await rm(memberDir(`customer-${customerId}`), { recursive: true, force: true });
  }
});
