/**
 * Focused tests for Module 7 (Find What Works & Do More of It / the Weekly
 * Growth Review): the input schema, the deterministic diagnosis engine
 * (growth-review-diagnosis.mjs -- no LLM anywhere in this path), the
 * business-model-adapted metric shaping, append-only frozen-record
 * persistence, module7-service.mjs's Module-6-completion gate (extending
 * every prior module's own "is Module N-1 actually done" cascade one
 * level further), identity isolation between members, and the guarantee
 * that a submitted review never silently rewrites itself when later
 * Module 1-6 state changes.
 *
 * Does NOT re-test Modules 1-6's own gating logic (module1_not_complete
 * through module5_not_complete) -- that cascade is copied verbatim from
 * module6-service.mjs, which already tests it; this file only proves the
 * one genuinely new link (module6_not_complete) and the end-to-end path
 * through it.
 *
 * Also does NOT test multi-review trend detection -- this slice
 * intentionally does not build it (hasMultipleReviews/patternConsistent/
 * repeatabilityRegression are always forced false in module7-service.mjs).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding } from '../club/lib/onboarding-service.mjs';
import { submitModule2 } from '../club/lib/module2-service.mjs';
import { submitModule3 } from '../club/lib/module3-service.mjs';
import { submitModule4 } from '../club/lib/module4-service.mjs';
import { submitModule5 } from '../club/lib/module5-service.mjs';
import { submitModule6 } from '../club/lib/module6-service.mjs';

import { newGrowthReviewInput, assertValidGrowthReviewInput } from '../club/lib/growth-review-schema.mjs';
import { determineConstraint, determineStrongestSignal, classifyReviewConfidence } from '../club/lib/growth-review-diagnosis.mjs';
import { buildReportableMetrics, mergeReportedMetrics } from '../club/lib/growth-review-metrics.mjs';
import { loadGrowthReviews, appendGrowthReview, getLatestGrowthReview } from '../club/lib/growth-review-store.mjs';
import { getGrowthReviewState, submitGrowthReview } from '../club/lib/module7-service.mjs';

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

const CUSTOMER_IDS = [700001, 700002, 700003, 700010, 700011, 700098, 700099];
const slugFor = (id) => `customer-${id}`;

before(async () => { for (const id of CUSTOMER_IDS) await rm(memberDir(slugFor(id)), { recursive: true, force: true }); });
after(async () => { for (const id of CUSTOMER_IDS) await rm(memberDir(slugFor(id)), { recursive: true, force: true }); });

// --- shared fixtures ---------------------------------------------------------

async function onboardThroughModule5(customerId, email, price = 500) {
  const token = signAccessToken({ customerId, email });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price, audience: 'Early-stage founders' } });
  const token2 = signAccessToken({ customerId, email });
  await submitModule2({ accessToken: token2, answers: { offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief', audienceConfirmed: 'Early-stage founders', selectedPositioning: 'Brand strategy consulting for early-stage founders.', objections: [] } });
  const token3 = signAccessToken({ customerId, email });
  await submitModule3({
    accessToken: token3,
    answers: {
      buyerDescription: 'Early-stage founders about to launch', desiredResult: { functional: 'a brand that reads as credible at launch' },
      buyingTriggers: [{ category: 'deadline', note: null }], primaryTriggerCategory: 'deadline', buyingCriteria: [{ category: 'expertise' }],
      discoveryEnvironments: ['referrals_word_of_mouth', 'google_search'], evidenceSources: ['actual_sales_conversations'], objections: [],
    },
  });
  const token4 = signAccessToken({ customerId, email });
  await submitModule4({ accessToken: token4, answers: { marketingHoursPerWeek: 8, feasibleFormats: ['writing_articles', 'live_conversation_networking'], existingAssets: [], hardConstraints: [] } });
  const token5 = signAccessToken({ customerId, email });
  await submitModule5({ accessToken: token5, answers: { selectedCoreMessage: 'Brand strategy consulting for early-stage founders who need clarity before launch.', coreMessageOptions: [] } });
}

async function onboardThroughModule6(customerId, email, { price, destinationType = 'inquiry_contact_form' } = {}) {
  await onboardThroughModule5(customerId, email, price);
  const token6 = signAccessToken({ customerId, email });
  await submitModule6({ accessToken: token6, answers: { conversionDestinations: [{ type: destinationType, detail: null }], mobileStatus: 'likely', followUpMechanism: 'email' } });
}

function validReviewAnswers(overrides = {}) {
  return {
    periodStart: '2026-09-01',
    periodEnd: '2026-09-07',
    activity: { channelsUsed: [], actions: ['did_nothing'], capacityConstrained: null, notes: null },
    revenueUsd: null,
    salesCount: null,
    pathMetrics: [],
    revenueAttribution: { state: 'unknown', breakdown: [] },
    experimentUpdates: [],
    ...overrides,
  };
}

// --- growth-review-schema.mjs -------------------------------------------------

test('newGrowthReviewInput defaults are all honest unknowns, never zeros or empty-string placeholders', () => {
  const input = newGrowthReviewInput();
  assert.equal(input.periodStart, null);
  assert.equal(input.revenueUsd, null);
  assert.equal(input.salesCount, null);
  assert.deepEqual(input.pathMetrics, []);
  assert.equal(input.revenueAttribution.state, 'unknown');
});

test('assertValidGrowthReviewInput rejects a missing required top-level field', () => {
  const input = newGrowthReviewInput();
  delete input.activity;
  assert.throws(() => assertValidGrowthReviewInput(input), /missing required field/);
});

test('assertValidGrowthReviewInput rejects an activity action outside the canonical enum', () => {
  const input = newGrowthReviewInput();
  input.activity.actions = ['made_up_action'];
  assert.throws(() => assertValidGrowthReviewInput(input), /activity action/);
});

test('assertValidGrowthReviewInput rejects a revenueAttribution state outside the canonical enum', () => {
  const input = newGrowthReviewInput();
  input.revenueAttribution.state = 'definitely_sure';
  assert.throws(() => assertValidGrowthReviewInput(input), /revenueAttribution/);
});

test('assertValidGrowthReviewInput rejects an experiment status outside the canonical enum', () => {
  const input = newGrowthReviewInput();
  input.experimentUpdates = [{ source: 'module4_channel', experimentText: 'Test something', status: 'finished_forever', result: null }];
  assert.throws(() => assertValidGrowthReviewInput(input), /experiment status/);
});

test('assertValidGrowthReviewInput accepts a fully-formed, honestly-unknown input', () => {
  const input = newGrowthReviewInput();
  input.periodStart = '2026-09-01';
  input.periodEnd = '2026-09-07';
  assert.doesNotThrow(() => assertValidGrowthReviewInput(input));
});

// --- growth-review-diagnosis.mjs (deterministic, no LLM) ---------------------

test('nothing reported this period is Insufficient Data, never an assumed problem', () => {
  const result = determineConstraint({ didAnyActivity: false, attentionMetrics: [], intentMetrics: [], revenueUsd: null, salesCount: null, capacityConstrained: null, isHighTransactionCount: false, repeatabilityRegression: false });
  assert.equal(result.category, 'insufficient_data');
});

test('demand beyond capacity reads as a Capacity Constraint, not a marketing problem', () => {
  const result = determineConstraint({ didAnyActivity: true, attentionMetrics: [{ label: 'Reach', known: true, value: 50 }], intentMetrics: [], revenueUsd: null, salesCount: null, capacityConstrained: true, isHighTransactionCount: false, repeatabilityRegression: false });
  assert.equal(result.category, 'capacity_constraint');
});

test('a known-but-zero attention metric with nothing downstream is a Discovery Constraint', () => {
  const result = determineConstraint({ didAnyActivity: true, attentionMetrics: [{ label: 'Reach', known: true, value: 0 }], intentMetrics: [], revenueUsd: null, salesCount: null, capacityConstrained: false, isHighTransactionCount: false, repeatabilityRegression: false });
  assert.equal(result.category, 'discovery_constraint');
});

test('real sales at a normal transaction volume reads Path Healthy', () => {
  const result = determineConstraint({ didAnyActivity: true, attentionMetrics: [], intentMetrics: [], revenueUsd: 500, salesCount: 1, capacityConstrained: false, isHighTransactionCount: false, repeatabilityRegression: false });
  assert.equal(result.category, 'path_healthy');
});

test('real sales at a low price point reads Economics/Volume, never a fabricated conversion problem', () => {
  const result = determineConstraint({ didAnyActivity: true, attentionMetrics: [], intentMetrics: [], revenueUsd: 40, salesCount: 2, capacityConstrained: false, isHighTransactionCount: true, repeatabilityRegression: false });
  assert.equal(result.category, 'economics_volume_constraint');
});

test('a prior win that did not reproduce is a Repeatability Constraint, not silently ignored', () => {
  const result = determineConstraint({ didAnyActivity: true, attentionMetrics: [], intentMetrics: [], revenueUsd: null, salesCount: null, capacityConstrained: null, isHighTransactionCount: false, repeatabilityRegression: true });
  assert.equal(result.category, 'repeatability_constraint');
});

test('determineStrongestSignal prefers revenue, then sales, then buying intent, then attention, then none', () => {
  assert.equal(determineStrongestSignal({ attentionMetrics: [{ label: 'Reach', known: true, value: 10 }], intentMetrics: [{ label: 'Clicks', known: true, value: 5 }], revenueUsd: 100, salesCount: 3 }).tier, 'revenue');
  assert.equal(determineStrongestSignal({ attentionMetrics: [], intentMetrics: [{ label: 'Clicks', known: true, value: 5 }], revenueUsd: null, salesCount: 2 }).tier, 'sales');
  assert.equal(determineStrongestSignal({ attentionMetrics: [{ label: 'Reach', known: true, value: 10 }], intentMetrics: [{ label: 'Clicks', known: true, value: 5 }], revenueUsd: null, salesCount: null }).tier, 'buying_intent');
  assert.equal(determineStrongestSignal({ attentionMetrics: [{ label: 'Reach', known: true, value: 10 }], intentMetrics: [], revenueUsd: null, salesCount: null }).tier, 'attention');
  assert.equal(determineStrongestSignal({ attentionMetrics: [], intentMetrics: [], revenueUsd: null, salesCount: null }).tier, 'none');
});

test('classifyReviewConfidence never reaches Evidence-Backed from a single review, even with known attribution', () => {
  const result = classifyReviewConfidence({ constraintCategory: 'path_healthy', attributionState: 'known', hasMultipleReviews: false, patternConsistent: false });
  assert.notEqual(result.key, 'evidence_backed');
});

test('classifyReviewConfidence reports Insufficient Data confidence whenever the constraint itself is insufficient_data', () => {
  const result = classifyReviewConfidence({ constraintCategory: 'insufficient_data', attributionState: 'unknown', hasMultipleReviews: false, patternConsistent: false });
  assert.equal(result.key, 'insufficient_data');
});

// --- growth-review-metrics.mjs ------------------------------------------------

test('buildReportableMetrics tags the leading entries attention and the rest buying_intent, and always drops Revenue', () => {
  const metrics = buildReportableMetrics({ measure: ['Impressions', 'Saves', 'Add to Cart', 'Revenue'], earlyEvidenceCount: 2 });
  assert.deepEqual(metrics.map((m) => m.tier), ['attention', 'attention', 'buying_intent']);
  assert.ok(!metrics.some((m) => m.label === 'Revenue'));
});

test('mergeReportedMetrics preserves unknown as unknown and a real zero as zero, never coercing one into the other', () => {
  const reportable = buildReportableMetrics({ measure: ['Impressions', 'Add to Cart', 'Revenue'], earlyEvidenceCount: 1 });
  const merged = mergeReportedMetrics(reportable, [{ label: 'Add to Cart', value: 0, known: true }]);
  const impressions = merged.find((m) => m.label === 'Impressions');
  const addToCart = merged.find((m) => m.label === 'Add to Cart');
  assert.equal(impressions.known, false);
  assert.equal(impressions.value, null);
  assert.equal(addToCart.known, true);
  assert.equal(addToCart.value, 0);
});

// --- growth-review-store.mjs (append-only) -----------------------------------

test('loadGrowthReviews returns an empty array, never null, when no reviews exist yet', async () => {
  const slug = 'customer-700099';
  const reviews = await loadGrowthReviews(slug);
  assert.deepEqual(reviews, []);
  assert.equal(await getLatestGrowthReview(slug), null);
});

test('appendGrowthReview is append-only -- a second submission never overwrites the first', async () => {
  const slug = 'customer-700098';
  const first = await appendGrowthReview(slug, { marker: 'first' });
  const second = await appendGrowthReview(slug, { marker: 'second' });
  const all = await loadGrowthReviews(slug);
  assert.equal(all.length, 2);
  assert.equal(all[0].marker, 'first');
  assert.equal(all[0].reviewId, first.reviewId);
  assert.equal(all[1].marker, 'second');
  assert.notEqual(all[0].reviewId, all[1].reviewId);
  assert.equal((await getLatestGrowthReview(slug)).marker, 'second');
});

// --- module7-service.mjs: gating -----------------------------------------------

test('a non-member cannot reach Growth Review state', async () => {
  const token = signAccessToken({ customerId: 700001, email: 'never-onboarded@example.com' });
  const result = await getGrowthReviewState(token);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_a_club_member');
});

test('Growth Review requires Module 6 to be complete, mirroring every prior module\'s own "is Module N-1 done" gate', async () => {
  await onboardThroughModule5(700002, 'module6-gate@example.com');
  const token = signAccessToken({ customerId: 700002, email: 'module6-gate@example.com' });
  const result = await getGrowthReviewState(token);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module6_not_complete');
});

// --- module7-service.mjs: an eligible member with no reviews yet ------------

test('an eligible member with zero reviews sees the honest empty state, not an error', async () => {
  await onboardThroughModule6(700003, 'empty-state@example.com');
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const state = await getGrowthReviewState(token);
  assert.equal(state.ok, true);
  assert.equal(state.reviewCount, 0);
  assert.equal(state.latestReview, null);
  assert.ok(Array.isArray(state.context.reportableMetrics));
});

// --- module7-service.mjs: submission validation ------------------------------

test('submitGrowthReview rejects a submission missing the review period', async () => {
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({ accessToken: token, answers: validReviewAnswers({ periodStart: null }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_period');
});

test('submitGrowthReview rejects a negative revenue value rather than silently accepting it', async () => {
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({ accessToken: token, answers: validReviewAnswers({ revenueUsd: -5 }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'invalid_revenueUsd');
});

test('submitGrowthReview rejects an inverted period range (end before start) -- caught live via browser QA, where the form\'s next-review default could otherwise produce one', async () => {
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({ accessToken: token, answers: validReviewAnswers({ periodStart: '2026-10-05', periodEnd: '2026-10-01' }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'invalid_period_range');
});

// --- module7-service.mjs: deterministic submission + honest states ----------

test('a first review with nothing reported freezes as Insufficient Data, and unreported metrics stay unknown, never zero', async () => {
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({
    accessToken: token,
    answers: validReviewAnswers({ activity: { channelsUsed: [], actions: [], capacityConstrained: null, notes: null } }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.review.constraint.category, 'insufficient_data');
  assert.ok(result.review.reportableMetrics.every((m) => m.known === false && m.value === null));
});

test('a real reported zero sale is frozen as zero, never as unknown', async () => {
  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({ accessToken: token, answers: validReviewAnswers({ periodStart: '2026-09-08', periodEnd: '2026-09-14', salesCount: 0 }) });
  assert.equal(result.ok, true);
  assert.equal(result.review.input.salesCount, 0);
  assert.notEqual(result.review.input.salesCount, null);
});

test('the server derives frozen experiment text from live module state, never trusting a client-supplied string', async () => {
  const tokenState = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const state = await getGrowthReviewState(tokenState);
  const real = state.context.candidateExperiments.find((c) => c.source === 'module4_channel');
  assert.ok(real, 'fixture must produce a real module4_channel experiment to make this test meaningful');

  const token = signAccessToken({ customerId: 700003, email: 'empty-state@example.com' });
  const result = await submitGrowthReview({
    accessToken: token,
    answers: validReviewAnswers({
      periodStart: '2026-09-15', periodEnd: '2026-09-21',
      experimentUpdates: [{ source: 'module4_channel', status: 'ran', result: 'Got 3 replies', experimentText: 'FABRICATED CLIENT TEXT' }],
    }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.review.input.experimentUpdates[0].experimentText, real.experimentText);
  assert.notEqual(result.review.input.experimentUpdates[0].experimentText, 'FABRICATED CLIENT TEXT');
});

test('a submitted Growth Review is a frozen historical record -- resubmitting Module 6 afterward does not alter it', async () => {
  const customerId = 700003, email = 'empty-state@example.com';
  const tokenBefore = signAccessToken({ customerId, email });
  const before = await submitGrowthReview({ accessToken: tokenBefore, answers: validReviewAnswers({ periodStart: '2026-09-22', periodEnd: '2026-09-28' }) });
  assert.equal(before.ok, true);
  const originalDestinationLabel = before.review.context.destinationLabel;
  assert.ok(originalDestinationLabel);

  // A legitimate resubmission of Module 6 with a different real destination --
  // every module always re-derives fresh on its own page; this is not a hack.
  const token6b = signAccessToken({ customerId, email });
  await submitModule6({ accessToken: token6b, answers: { conversionDestinations: [{ type: 'website_product_page', detail: null }], mobileStatus: 'likely', followUpMechanism: 'email' } });

  const tokenAfter = signAccessToken({ customerId, email });
  const state = await getGrowthReviewState(tokenAfter);
  assert.equal(state.ok, true);
  assert.notEqual(state.context.destinationLabel, originalDestinationLabel, 'sanity check: the underlying module state actually changed');
  assert.equal(state.latestReview.context.destinationLabel, originalDestinationLabel, 'the frozen review must not silently pick up the new destination');
});

// --- identity isolation -------------------------------------------------------

test('two members\' Growth Review histories are fully isolated by identity, never cross-visible', async () => {
  await onboardThroughModule6(700010, 'iso-a@example.com');
  await onboardThroughModule6(700011, 'iso-b@example.com');

  const tokenA = signAccessToken({ customerId: 700010, email: 'iso-a@example.com' });
  const submitA = await submitGrowthReview({ accessToken: tokenA, answers: validReviewAnswers({ revenueUsd: 900 }) });
  assert.equal(submitA.ok, true);

  const tokenB = signAccessToken({ customerId: 700011, email: 'iso-b@example.com' });
  const stateB = await getGrowthReviewState(tokenB);
  assert.equal(stateB.ok, true);
  assert.equal(stateB.reviewCount, 0, "customer B must not see customer A's review");
  assert.equal(stateB.latestReview, null);

  const tokenA2 = signAccessToken({ customerId: 700010, email: 'iso-a@example.com' });
  const stateA = await getGrowthReviewState(tokenA2);
  assert.equal(stateA.reviewCount, 1);
  assert.equal(stateA.latestReview.input.revenueUsd, 900);
});
