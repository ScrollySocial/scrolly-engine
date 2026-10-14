/**
 * Focused tests for the $1K Challenge slice: Challenge lifecycle
 * (challenge-lifecycle.mjs, challenge-service.mjs, challenge-completion-
 * store.mjs), the platform-neutral opportunity catalog (opportunity-
 * catalog.mjs), deterministic assignment/ranking (opportunity-ranking.mjs),
 * per-customer execution (opportunity-service.mjs, opportunity-assignment-
 * store.mjs), the weekly review architecture (weekly-challenge-review.mjs,
 * gated by the existing analyzeWhenReady()), and the additive Growth
 * Review integration (module7-service.mjs). No LLM anywhere in this path.
 *
 * Does not re-test Modules 1-6's own onboarding/gating logic (already
 * covered by their own test files) beyond what's needed to reach a
 * Club member eligible to start a Challenge.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { memberDir, loadMember, saveMember } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding } from '../club/lib/onboarding-service.mjs';
import { submitModule2 } from '../club/lib/module2-service.mjs';
import { submitModule3 } from '../club/lib/module3-service.mjs';
import { submitModule4 } from '../club/lib/module4-service.mjs';
import { submitModule5 } from '../club/lib/module5-service.mjs';
import { submitModule6 } from '../club/lib/module6-service.mjs';
import { submitManualMetricsForToken, createMemberGrowthStore } from '../club/lib/member-growth-state.mjs';

import { computeChallengeStatus, dayNumber, revenueGoalSignal, CHALLENGE_WINDOW_DAYS, CLAIM_GRACE_PERIOD_DAYS } from '../club/lib/challenge-lifecycle.mjs';
import { getChallengeState, startChallengeAttempt } from '../club/lib/challenge-service.mjs';
import { getChallengeCompletion } from '../club/lib/challenge-completion-store.mjs';
import { OPPORTUNITY_CATALOG, PLATFORMS } from '../club/lib/opportunity-catalog.mjs';
import { filterEligibleOpportunities, rankOpportunities, recommendOpportunities } from '../club/lib/opportunity-ranking.mjs';
import { getOpportunityState, planOpportunity, markOpportunityPosted, recordOpportunityResult } from '../club/lib/opportunity-service.mjs';
import { computeWeeklyChallengeReview } from '../club/lib/weekly-challenge-review.mjs';
import { getGrowthReviewState } from '../club/lib/module7-service.mjs';

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

const CUSTOMER_IDS = [810001, 810002, 810003, 810004, 810005, 810006, 810007];
const slugFor = (id) => `customer-${id}`;

before(async () => { for (const id of CUSTOMER_IDS) await rm(memberDir(slugFor(id)), { recursive: true, force: true }); });
after(async () => { for (const id of CUSTOMER_IDS) await rm(memberDir(slugFor(id)), { recursive: true, force: true }); });

// 2026-09-15 sprint: startChallengeAttempt() now requires a real, unused
// product-280 order (see club-order-verify.mjs's findAvailableChallengeOrder)
// -- never the real network. By default this mock hands back 5 valid,
// unconsumed orders for whichever customer asks, so every pre-existing test
// below (written before paid entitlement existed) keeps working unchanged;
// the dedicated entitlement tests further down locally override this to
// prove the non-purchaser/one-order-per-attempt cases.
let savedFetch, savedWcEnv;
before(() => {
  savedFetch = global.fetch;
  savedWcEnv = { base: process.env.WC_STORE_BASE_URL, key: process.env.WC_AUDIT_CONSUMER_KEY, secret: process.env.WC_AUDIT_CONSUMER_SECRET };
  process.env.WC_STORE_BASE_URL = 'example-test-store.invalid';
  process.env.WC_AUDIT_CONSUMER_KEY = 'test-key';
  process.env.WC_AUDIT_CONSUMER_SECRET = 'test-secret';
  global.fetch = defaultChallengeOrdersFetch;
});
after(() => {
  global.fetch = savedFetch;
  if (savedWcEnv.base === undefined) delete process.env.WC_STORE_BASE_URL; else process.env.WC_STORE_BASE_URL = savedWcEnv.base;
  if (savedWcEnv.key === undefined) delete process.env.WC_AUDIT_CONSUMER_KEY; else process.env.WC_AUDIT_CONSUMER_KEY = savedWcEnv.key;
  if (savedWcEnv.secret === undefined) delete process.env.WC_AUDIT_CONSUMER_SECRET; else process.env.WC_AUDIT_CONSUMER_SECRET = savedWcEnv.secret;
});

function fakeOrdersFor(customerId, count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: customerId * 100 + i,
    order_key: `wc_order_test_${customerId}_${i}`,
    date_created: new Date(Date.now() - (count - i) * 86400000).toISOString(),
    line_items: [{ product_id: 280 }],
  }));
}

async function defaultChallengeOrdersFetch(url) {
  const u = String(url);
  const match = u.match(/\/orders\?customer=(\d+)/);
  if (match) return { ok: true, json: async () => fakeOrdersFor(Number(match[1])) };
  throw new Error(`club-challenge.test.mjs: unexpected fetch to ${u}`);
}

async function onboardThroughModule6(customerId, email, { price = 24 } = {}) {
  const t1 = signAccessToken({ customerId, email });
  await submitOnboarding({ accessToken: t1, answers: { route: 'ecommerce', stage: 'B', offer: 'Hand-poured candles', price, audience: 'Home shoppers' } });
  const t2 = signAccessToken({ customerId, email });
  await submitModule2({ accessToken: t2, answers: { offerConfirmed: 'Hand-poured candles', whatTheyGet: 'A hand-poured soy candle', audienceConfirmed: 'Home shoppers', selectedPositioning: 'Candles for home shoppers.', objections: [] } });
  const t3 = signAccessToken({ customerId, email });
  await submitModule3({
    accessToken: t3,
    answers: {
      buyerDescription: 'Home shoppers redecorating a living room', desiredResult: { functional: 'a room that smells and feels cozy' },
      buyingTriggers: [{ category: 'desire_want', note: null }], primaryTriggerCategory: 'desire_want', buyingCriteria: [{ category: 'design_style' }],
      discoveryEnvironments: ['instagram', 'google_search'], evidenceSources: ['reviews'], objections: [],
    },
  });
  const t4 = signAccessToken({ customerId, email });
  await submitModule4({ accessToken: t4, answers: { marketingHoursPerWeek: 10, feasibleFormats: ['short_form_video', 'photography_images'], existingAssets: [], hardConstraints: [] } });
  const t5 = signAccessToken({ customerId, email });
  await submitModule5({ accessToken: t5, answers: { selectedCoreMessage: 'Candles for home shoppers who want their space to feel cozy.', coreMessageOptions: [] } });
  const t6 = signAccessToken({ customerId, email });
  await submitModule6({ accessToken: t6, answers: { conversionDestinations: [{ type: 'website_product_page', detail: null }], mobileStatus: 'likely', followUpMechanism: 'not_necessary_yet' } });
}

async function backdateChallengeStart(slug, challengeId, daysAgo) {
  const member = await loadMember(slug);
  const challenge = member.challenges.find((c) => c.challengeId === challengeId);
  challenge.startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  await saveMember(member);
}

// --- challenge-lifecycle.mjs (pure) ------------------------------------------

test('dayNumber counts from startedAt and clamps to the 30-day window', () => {
  const day1 = { startedAt: new Date().toISOString() };
  assert.equal(dayNumber(day1), 1);
  const day45 = { startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() };
  assert.equal(dayNumber(day45), CHALLENGE_WINDOW_DAYS);
});

test('revenueGoalSignal never guesses -- unknown unless both snapshots are known', () => {
  assert.deepEqual(revenueGoalSignal(null, { value: 500, state: 'known' }), { known: false, gained: null, met: false });
  assert.deepEqual(revenueGoalSignal({ value: 100, state: 'known' }, { value: 100, state: 'unknown' }), { known: false, gained: null, met: false });
  const known = revenueGoalSignal({ value: 100, state: 'known' }, { value: 1200, state: 'known' });
  assert.equal(known.known, true);
  assert.equal(known.gained, 1100);
  assert.equal(known.met, true);
});

test('computeChallengeStatus: active during the window, completed after if goal not known/met, claim_available if met within grace, expired past grace', () => {
  const base = { achievement: { verified: false, claim: null } };
  const active = { ...base, startedAt: new Date().toISOString() };
  assert.equal(computeChallengeStatus(active, { known: false, met: false }), 'active');

  const justClosed = { ...base, startedAt: new Date(Date.now() - (CHALLENGE_WINDOW_DAYS) * 24 * 60 * 60 * 1000).toISOString() };
  assert.equal(computeChallengeStatus(justClosed, { known: false, met: false }), 'completed');
  assert.equal(computeChallengeStatus(justClosed, { known: true, met: false }), 'completed');
  assert.equal(computeChallengeStatus(justClosed, { known: true, met: true }), 'claim_available');

  const pastGrace = { ...base, startedAt: new Date(Date.now() - (CHALLENGE_WINDOW_DAYS + CLAIM_GRACE_PERIOD_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString() };
  assert.equal(computeChallengeStatus(pastGrace, { known: true, met: true }), 'expired');

  const claimed = { ...base, achievement: { verified: false, claim: { claimedAt: new Date().toISOString() } }, startedAt: new Date().toISOString() };
  assert.equal(computeChallengeStatus(claimed, { known: false, met: false }), 'stripe_submitted');

  const verified = { ...base, achievement: { verified: true, claim: { claimedAt: new Date().toISOString() } }, startedAt: new Date().toISOString() };
  assert.equal(computeChallengeStatus(verified, { known: false, met: false }), 'stripe_verified');
});

// --- opportunity-catalog.mjs structure ---------------------------------------

test('every catalog opportunity has an adaptation for all 3 required platforms', () => {
  for (const o of OPPORTUNITY_CATALOG) {
    const platforms = o.platformAdaptations.map((p) => p.platform).sort();
    assert.deepEqual(platforms, [...PLATFORMS].sort(), `opportunity "${o.opportunityId}" is missing a platform adaptation`);
  }
});

test('no opportunity promises virality or a guaranteed outcome', () => {
  const bannedPhrases = /\bviral\b|\bguarantee(d)?\b|\bwill go viral\b/i;
  for (const o of OPPORTUNITY_CATALOG) {
    assert.doesNotMatch(o.coreConcept + ' ' + o.hookAngle, bannedPhrases, o.opportunityId);
    for (const p of o.platformAdaptations) {
      assert.doesNotMatch(p.executionNotes + ' ' + p.captionGuidance, bannedPhrases, `${o.opportunityId}/${p.platform}`);
    }
  }
});

// --- opportunity-ranking.mjs (pure, deterministic) ---------------------------

test('filterEligibleOpportunities excludes a business model or platform mismatch', () => {
  const eligible = filterEligibleOpportunities(OPPORTUNITY_CATALOG, { businessModel: 'ecommerce', activePlatforms: ['instagram_reels'] });
  assert.ok(eligible.length > 0);
  for (const o of eligible) {
    assert.ok(o.applicableBusinessModels.includes('ecommerce'));
    assert.ok(o.platformAdaptations.some((p) => p.platform === 'instagram_reels'));
  }
});

test('rankOpportunities is deterministic -- same inputs, same order, every time', () => {
  const eligible = filterEligibleOpportunities(OPPORTUNITY_CATALOG, { businessModel: 'ecommerce', activePlatforms: PLATFORMS });
  const a = rankOpportunities(eligible, { constraintCategory: 'discovery_constraint', contentCapacity: 'low' }).map((o) => o.opportunityId);
  const b = rankOpportunities(eligible, { constraintCategory: 'discovery_constraint', contentCapacity: 'low' }).map((o) => o.opportunityId);
  assert.deepEqual(a, b);
});

test('recommendOpportunities returns a small bounded subset, never the whole catalog', () => {
  const recommended = recommendOpportunities(OPPORTUNITY_CATALOG, { businessModel: 'ecommerce', activePlatforms: PLATFORMS, constraintCategory: 'discovery_constraint', contentCapacity: 'medium', limit: 5 });
  assert.equal(recommended.length, 5);
  assert.ok(recommended.length < OPPORTUNITY_CATALOG.length);
});

// --- Challenge lifecycle end to end (service layer) --------------------------

test('a non-member cannot start or read a Challenge', async () => {
  const token = signAccessToken({ customerId: 810001, email: 'never-onboarded@example.com' });
  const state = await getChallengeState(token);
  assert.equal(state.ok, false);
  assert.equal(state.reason, 'not_a_club_member');
  const start = await startChallengeAttempt(token);
  assert.equal(start.ok, false);
});

test('starting a Challenge captures a Challenge Start snapshot that stays unchanged after later metric updates (immutability)', async () => {
  const customerId = 810002, email = 'lifecycle@example.com';
  await onboardThroughModule6(customerId, email);
  const t1 = signAccessToken({ customerId, email });
  await submitManualMetricsForToken({ accessToken: t1, values: { revenueUsd: 100, salesCount: 2, siteVisits: 40 } });

  const t2 = signAccessToken({ customerId, email });
  const started = await startChallengeAttempt(t2);
  assert.equal(started.ok, true);

  const store = createMemberGrowthStore();
  const growthState = await store.load(slugFor(customerId));
  const snapshot = growthState.challengeStarts.find((s) => s.challengeId === started.challengeId);
  assert.equal(snapshot.metrics.revenueUsd.value, 100);

  // Report new, different metrics AFTER the Challenge started.
  const t3 = signAccessToken({ customerId, email });
  await submitManualMetricsForToken({ accessToken: t3, values: { revenueUsd: 900, salesCount: 9, siteVisits: 200 } });

  const growthStateAfter = await store.load(slugFor(customerId));
  const snapshotAfter = growthStateAfter.challengeStarts.find((s) => s.challengeId === started.challengeId);
  assert.equal(snapshotAfter.metrics.revenueUsd.value, 100, 'the Challenge Start snapshot must never change after the fact');
  assert.equal(growthStateAfter.currentMetrics.revenueUsd.value, 900, 'current metrics DID update -- proving the snapshot is genuinely frozen, not just stale by coincidence');
});

// --- Paid entitlement (2026-09-15 sprint) ------------------------------------

test('a Club member with no product-280 purchase cannot start a paid Challenge attempt', async () => {
  const customerId = 810006, email = 'no-purchase@example.com';
  await onboardThroughModule6(customerId, email);
  const savedLocalFetch = global.fetch;
  global.fetch = async (url) => {
    if (String(url).includes('/orders?customer=')) return { ok: true, json: async () => [] }; // real customer, zero orders for product 280
    throw new Error('unexpected fetch');
  };
  try {
    const token = signAccessToken({ customerId, email });
    const result = await startChallengeAttempt(token);
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'no_valid_challenge_purchase');
  } finally {
    global.fetch = savedLocalFetch;
  }
});

test('one $25 purchase funds exactly one attempt -- a second attempt requires a second, still-unconsumed order', async () => {
  const customerId = 810007, email = 'one-order@example.com';
  await onboardThroughModule6(customerId, email);
  const savedLocalFetch = global.fetch;
  let orders = [{ id: 5551, order_key: 'wc_order_only_one', date_created: new Date(Date.now() - 86400000).toISOString(), line_items: [{ product_id: 280 }] }];
  global.fetch = async (url) => {
    if (String(url).includes('/orders?customer=')) return { ok: true, json: async () => orders };
    throw new Error('unexpected fetch');
  };
  try {
    const t1 = signAccessToken({ customerId, email });
    const first = await startChallengeAttempt(t1);
    assert.equal(first.ok, true, 'the one real order funds the first attempt');

    await backdateChallengeStart(slugFor(customerId), first.challengeId, 31); // close it out so a second attempt is otherwise allowed

    const t2 = signAccessToken({ customerId, email });
    const second = await startChallengeAttempt(t2);
    assert.equal(second.ok, false, 'the same order was already consumed by the first attempt -- it must not fund a second one');
    assert.equal(second.reason, 'no_valid_challenge_purchase');

    // A genuine second purchase (a real, distinct order) does fund a second attempt.
    orders = [...orders, { id: 5552, order_key: 'wc_order_two', date_created: new Date().toISOString(), line_items: [{ product_id: 280 }] }];
    const t3 = signAccessToken({ customerId, email });
    const third = await startChallengeAttempt(t3);
    assert.equal(third.ok, true, 'a genuine second purchase funds a genuine second attempt');
    assert.notEqual(third.challengeId, first.challengeId);
  } finally {
    global.fetch = savedLocalFetch;
  }
});

test('a second attempt never overwrites the first -- both remain in history with their own snapshots', async () => {
  const customerId = 810003, email = 'repeat-attempts@example.com';
  await onboardThroughModule6(customerId, email);
  const t1 = signAccessToken({ customerId, email });
  const first = await startChallengeAttempt(t1);
  assert.equal(first.ok, true);

  // Cannot start a second concurrent attempt while the first is active.
  const t2 = signAccessToken({ customerId, email });
  const blocked = await startChallengeAttempt(t2);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'challenge_already_active');

  // Backdate the first attempt past its window (a real, later calendar date -- not a mutation this system would ever do to itself, just how a real 31-days-later customer would look).
  await backdateChallengeStart(slugFor(customerId), first.challengeId, 31);

  const t3 = signAccessToken({ customerId, email });
  const second = await startChallengeAttempt(t3);
  assert.equal(second.ok, true);
  assert.notEqual(second.challengeId, first.challengeId);

  const t4 = signAccessToken({ customerId, email });
  const state = await getChallengeState(t4);
  assert.equal(state.ok, true);
  assert.equal(state.history.length, 2, 'both attempts must remain in history');
  const firstView = state.history.find((h) => h.challengeId === first.challengeId);
  assert.ok(firstView, 'the first attempt must not have been removed or replaced');
  assert.equal(firstView.status, 'completed', 'the backdated first attempt is correctly terminal, not silently reactivated');
  assert.equal(state.active.challengeId, second.challengeId, 'the active attempt is the new one');
});

test('a completed Challenge preserves its history and captures a final snapshot exactly once', async () => {
  const customerId = 810004, email = 'completion@example.com';
  await onboardThroughModule6(customerId, email);
  const t1 = signAccessToken({ customerId, email });
  await submitManualMetricsForToken({ accessToken: t1, values: { revenueUsd: 50, salesCount: 1, siteVisits: 10 } });
  const t2 = signAccessToken({ customerId, email });
  const started = await startChallengeAttempt(t2);
  await backdateChallengeStart(slugFor(customerId), started.challengeId, 31);

  const t3 = signAccessToken({ customerId, email });
  const state = await getChallengeState(t3);
  assert.equal(state.ok, true);
  const view = state.history.find((h) => h.challengeId === started.challengeId);
  assert.equal(view.status, 'completed'); // no revenue reported since start -> goal not known as met
  assert.equal(state.active, null, 'a completed attempt is no longer the active one');

  const completion = await getChallengeCompletion(slugFor(customerId), started.challengeId);
  assert.ok(completion, 'a final snapshot must be captured once the window closes');
  assert.equal(completion.finalSnapshot.revenueUsd.value, 50);

  // Reading again must not recapture/overwrite it.
  const t4 = signAccessToken({ customerId, email });
  await getChallengeState(t4);
  const completionAgain = await getChallengeCompletion(slugFor(customerId), started.challengeId);
  assert.equal(completionAgain.capturedAt, completion.capturedAt, 'a second read must not recapture the final snapshot');
});

// --- Opportunity execution end to end -----------------------------------------

test('opportunities cannot be recommended without an active Challenge', async () => {
  const customerId = 810005, email = 'opportunities@example.com';
  await onboardThroughModule6(customerId, email);
  const token = signAccessToken({ customerId, email });
  const state = await getOpportunityState(token);
  assert.equal(state.ok, false);
  assert.equal(state.reason, 'no_active_challenge');
});

test('a posted item links back to the correct opportunity, attempt, and platform; the same core opportunity can carry distinct per-platform results', async () => {
  const customerId = 810005, email = 'opportunities@example.com'; // continues from the attempt started above
  const t1 = signAccessToken({ customerId, email });
  const started = await startChallengeAttempt(t1);
  assert.equal(started.ok, true);

  const t2 = signAccessToken({ customerId, email });
  const oppState = await getOpportunityState(t2, { activePlatforms: ['instagram_reels', 'tiktok'] });
  assert.equal(oppState.ok, true);
  assert.ok(oppState.assignments.length > 0);
  assert.ok(oppState.assignments.length <= 16, 'recommendations must be a bounded subset, not the whole catalog');

  // Find the same core opportunity assigned to two different platforms (recommend logic assigns per-platform separately).
  const byOpportunity = {};
  for (const a of oppState.assignments) (byOpportunity[a.opportunityId] ||= []).push(a);
  const [opportunityId, twoAssignments] = Object.entries(byOpportunity).find(([, list]) => list.length >= 2) || [];
  assert.ok(opportunityId, 'fixture must produce at least one opportunity assigned on 2+ platforms to make this test meaningful');

  const [assignmentA, assignmentB] = twoAssignments;
  assert.notEqual(assignmentA.platform, assignmentB.platform);

  for (const a of [assignmentA, assignmentB]) {
    const tPlan = signAccessToken({ customerId, email });
    const planned = await planOpportunity(tPlan, { assignmentId: a.assignmentId });
    assert.equal(planned.ok, true);
    assert.equal(planned.assignment.state, 'planned');
    const tPost = signAccessToken({ customerId, email });
    const posted = await markOpportunityPosted(tPost, { assignmentId: a.assignmentId });
    assert.equal(posted.ok, true);
    assert.equal(posted.assignment.state, 'posted');
  }

  const tResultA = signAccessToken({ customerId, email });
  const resultA = await recordOpportunityResult(tResultA, { assignmentId: assignmentA.assignmentId, metrics: { views: 500, engagement: 20, followersGained: 3, siteClicks: null, leadsOrSales: 0 } });
  assert.equal(resultA.ok, true);
  assert.equal(resultA.result.opportunityId, opportunityId);
  assert.equal(resultA.result.challengeAttemptId, started.challengeId);
  assert.equal(resultA.result.platform, assignmentA.platform);
  assert.equal(resultA.result.metrics.siteClicks.state, 'unknown');
  assert.equal(resultA.result.metrics.leadsOrSales.state, 'zero');
  assert.equal(resultA.result.metrics.leadsOrSales.value, 0);

  const tResultB = signAccessToken({ customerId, email });
  const resultB = await recordOpportunityResult(tResultB, { assignmentId: assignmentB.assignmentId, metrics: { views: 5000, engagement: 300, followersGained: 40, siteClicks: 12, leadsOrSales: 2 } });
  assert.equal(resultB.ok, true);
  assert.equal(resultB.result.opportunityId, opportunityId, 'same core opportunity...');
  assert.notEqual(resultB.result.platform, resultA.result.platform, '...but a distinct platform...');
  assert.notEqual(resultB.result.metrics.views.value, resultA.result.metrics.views.value, '...produced genuinely distinct, independently-stored results');
});

// --- weekly-challenge-review.mjs (architecture, gated, no model call) -------

test('the weekly Challenge review refuses to summarize when there is nothing posted this period', async () => {
  const review = await computeWeeklyChallengeReview({ periodResults: [] });
  assert.equal(review.status, 'not_enough_data');
  assert.equal(review.analysis, null);
});

test('the weekly Challenge review produces a deterministic structured summary once there is real posted data, never a model call', async () => {
  const results = [
    { platform: 'instagram_reels', metrics: { views: { value: 100, state: 'known' } }, recordedAt: new Date().toISOString() },
    { platform: 'tiktok', metrics: { views: { value: 900, state: 'known' } }, recordedAt: new Date().toISOString() },
  ];
  const review = await computeWeeklyChallengeReview({ periodResults: results });
  assert.equal(review.status, 'ready');
  assert.equal(review.analysis.postedThisPeriod, 2);
  assert.equal(review.analysis.bestPerformingPlatform, 'tiktok');
  assert.equal(review.analysis.modelSummary, 'not_invoked_in_this_slice');
});

test('missing required connections/metrics blocks the weekly review\'s analysis even with posted results present', async () => {
  const results = [{ platform: 'instagram_reels', metrics: { views: { value: 100, state: 'known' } }, recordedAt: new Date().toISOString() }];
  const review = await computeWeeklyChallengeReview({ periodResults: results, requiredConnections: ['store'], connectionsState: { store: { status: 'not_connected' } } });
  assert.equal(review.status, 'not_enough_data');
  assert.deepEqual(review.missingConnections, ['store']);
  assert.equal(review.analysis, null);
});

// --- Growth Review integration (additive) ------------------------------------

test('Growth Review state shows no Challenge context for a member who has never started one', async () => {
  const customerId = 810004, email = 'completion@example.com'; // has completed Module 6 but its Challenge attempt is already 'completed', not active
  const token = signAccessToken({ customerId, email });
  const state = await getGrowthReviewState(token);
  assert.equal(state.ok, true);
  assert.equal(state.challenge, null, 'no ACTIVE challenge -- the completed one must not be reported as current context');
  assert.equal(state.opportunityProgress, null);
  assert.equal(state.priorPeriodComparison, null, 'fewer than 2 reviews exist yet');
});

test('Growth Review state surfaces current Challenge context and opportunity execution progress when a Challenge is active', async () => {
  const customerId = 810005, email = 'opportunities@example.com'; // has an active attempt with assignments from the earlier test
  const token = signAccessToken({ customerId, email });
  const state = await getGrowthReviewState(token);
  assert.equal(state.ok, true);
  assert.ok(state.challenge, 'an active Challenge must be surfaced');
  assert.equal(state.challenge.status, 'active');
  assert.ok(state.opportunityProgress, 'opportunity execution progress must be surfaced');
  assert.equal(state.opportunityProgress.posted, 2, 'both planned+posted assignments from the earlier test');
});

// --- identity isolation -------------------------------------------------------

test('two members\' Challenge and opportunity data are fully isolated by identity', async () => {
  const stateB = await getChallengeState(signAccessToken({ customerId: 810003, email: 'repeat-attempts@example.com' }));
  const stateD = await getChallengeState(signAccessToken({ customerId: 810004, email: 'completion@example.com' }));
  assert.notEqual(stateB.slug, stateD.slug);
  assert.notEqual(stateB.history[0]?.challengeId, stateD.history[0]?.challengeId);

  const oppE = await getOpportunityState(signAccessToken({ customerId: 810005, email: 'opportunities@example.com' }));
  const oppNonMember = await getOpportunityState(signAccessToken({ customerId: 999888, email: 'stranger@example.com' }));
  assert.equal(oppE.ok, true);
  assert.equal(oppNonMember.ok, false);
});
