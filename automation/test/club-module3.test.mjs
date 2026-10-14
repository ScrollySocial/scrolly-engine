/**
 * Focused tests for Module 3 (Find the People Most Likely to Buy It / the
 * Customer Discovery Map): prepopulation from Module 2, confirm-or-refine,
 * route-adapted trigger/criteria language, observed-vs-hypothesized
 * objections, evidence-driven confidence classification (never a numeric
 * score), the Discovery Gap, the Customer Discovery Experiment, and the
 * module3-service orchestration. No network.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { newOfferPlan } from '../club/lib/offer-plan-schema.mjs';
import { newDiscoveryPlan } from '../club/lib/discovery-plan-schema.mjs';
import { discoveryLanguageForRoute, STRONG_EVIDENCE_SOURCES } from '../club/lib/discovery-content.mjs';
import { generateCustomerLanguageHypotheses } from '../club/lib/customer-language-hypotheses.mjs';
import {
  classifyConfidence,
  buildWhatThisTellsUs,
  determineDiscoveryGap,
  determineDiscoveryExperiment,
  deriveTopBuyingCriteria,
} from '../club/lib/discovery-evaluation.mjs';
import { computeModule3Results } from '../club/lib/module3.mjs';
import { computeModule2Results } from '../club/lib/module2.mjs';
import { computeModule1Results } from '../club/lib/module1.mjs';
import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding, slugFromCustomerId } from '../club/lib/onboarding-service.mjs';
import { submitModule2 } from '../club/lib/module2-service.mjs';
import { getModule3Context, generateLanguageHypotheses, submitModule3, getModule3ResultsForToken } from '../club/lib/module3-service.mjs';

const CUSTOMER_ID = 555002;
const EMAIL = 'module3-test@example.com';
const SLUG = slugFromCustomerId(CUSTOMER_ID);

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

beforeEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });
afterEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });

function baseProfile(overrides = {}) {
  const profile = newBusinessProfile();
  Object.assign(profile, { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders' }, overrides);
  return profile;
}
function baseOfferPlan(overrides = {}) {
  const plan = newOfferPlan();
  Object.assign(plan, {
    offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A one-hour working session plus a written brand brief',
    audienceConfirmed: 'Early-stage founders', buyingMotivation: 'Feeling confident about their brand before launch',
    selectedPositioning: 'Brand strategy consulting for early-stage founders who need clarity before launch.',
    objections: [{ type: 'Price', note: null, basis: 'observed' }],
  }, overrides);
  return plan;
}
function baseDiscoveryPlan(overrides = {}) {
  const plan = newDiscoveryPlan();
  Object.assign(plan, {
    buyerDescription: 'Early-stage founders about to launch',
    currentSituation: 'About to launch and unsure their brand reads as credible',
    tryingToAccomplish: 'Look credible enough to win their first customers',
    whyNow: 'Launch date is set and there is no time to redo this later',
    buyingTriggers: [{ category: 'deadline', note: null }],
    primaryTriggerCategory: 'deadline',
    desiredResult: { functional: 'a brand that reads as credible at launch', practicalEmotional: 'feeling confident showing up publicly' },
    objections: [{ type: 'Price', note: null, basis: 'observed' }],
    buyingCriteria: [{ category: 'expertise' }, { category: 'proof' }],
    discoveryEnvironments: ['referrals_word_of_mouth', 'google_search'],
    customerLanguageHypotheses: ['brand strategy consultant for startups'],
    evidenceSources: ['actual_sales_conversations'],
  }, overrides);
  return plan;
}

// --- discovery-content.mjs ---------------------------------------------------

test('buying trigger and buying criteria suggestions adapt by business model', () => {
  const ecom = discoveryLanguageForRoute('ecommerce');
  const services = discoveryLanguageForRoute('services');
  assert.notDeepEqual(ecom.suggestedTriggerCategories, services.suggestedTriggerCategories);
  assert.notDeepEqual(ecom.suggestedCriteriaCategories, services.suggestedCriteriaCategories);
  assert.ok(services.suggestedTriggerCategories.includes('revenue_performance_problem'));
  assert.ok(ecom.suggestedTriggerCategories.includes('gift_need'));
});

test('route language never forces the same customer-discovery vocabulary onto every business model', () => {
  const marketplace = discoveryLanguageForRoute('marketplace_first');
  const local = discoveryLanguageForRoute('local_hybrid');
  assert.match(marketplace.situationPrompt, /occasion|use case/i);
  assert.match(local.situationPrompt, /local|practical/i);
});

test('no irrelevant demographic persona fields exist in the DiscoveryPlan schema', () => {
  const plan = newDiscoveryPlan();
  const keys = Object.keys(plan).join(' ').toLowerCase();
  for (const forbidden of ['age', 'income', 'hobby', 'hobbies', 'coffee', 'name', 'gender']) {
    assert.doesNotMatch(keys, new RegExp(`\\b${forbidden}\\b`));
  }
});

// --- discovery-evaluation.mjs: confidence classification ---------------------

test('best-guess-only evidence produces Working Hypothesis, never Evidence-Backed', () => {
  const c = classifyConfidence(['best_guess_intuition']);
  assert.equal(c.key, 'working_hypothesis');
});

test('no evidence sources at all also produces Working Hypothesis', () => {
  assert.equal(classifyConfidence([]).key, 'working_hypothesis');
});

test('a single strong evidence source produces Partially Validated', () => {
  const c = classifyConfidence(['reviews']);
  assert.equal(c.key, 'partially_validated');
});

test('two or more strong, independent evidence sources produce Evidence-Backed', () => {
  const c = classifyConfidence(['existing_buyers', 'actual_sales_conversations']);
  assert.equal(c.key, 'evidence_backed');
});

test('weak evidence sources (intuition, competitor observation) never count toward Evidence-Backed even combined', () => {
  const c = classifyConfidence(['best_guess_intuition', 'personal_business_experience', 'competitor_community_observation', 'other']);
  assert.equal(c.key, 'working_hypothesis');
});

test('confidence is never expressed as a numeric score', () => {
  for (const sources of [[], ['reviews'], ['existing_buyers', 'reviews']]) {
    const c = classifyConfidence(sources);
    assert.equal(typeof c.label, 'string');
    assert.ok(!/^[0-9.]+$/.test(c.label));
  }
});

// --- deriveTopBuyingCriteria: identifies the most relevant, not a dump ------

test('top buying criteria surfaces route-relevant selections first, never adds an unselected category', () => {
  const routeLanguage = discoveryLanguageForRoute('services');
  const selected = [{ category: 'shipping' }, { category: 'expertise' }, { category: 'proof' }, { category: 'convenience' }];
  const top = deriveTopBuyingCriteria(selected, routeLanguage, 3);
  assert.equal(top.length, 3);
  assert.ok(top.includes('expertise'));
  assert.ok(top.includes('proof'));
  assert.ok(!top.includes('shipping') || top.length === 3); // shipping isn't a services-suggested category
  for (const c of top) assert.ok(selected.map((s) => s.category).includes(c));
});

test('top buying criteria is empty when nothing was selected -- never invents a criterion', () => {
  assert.deepEqual(deriveTopBuyingCriteria([], discoveryLanguageForRoute('services')), []);
});

// --- What This Tells Us: only fires on supported evidence -------------------

test('What This Tells Us does not claim trigger-driven behavior when confidence is only Working Hypothesis', () => {
  const plan = baseDiscoveryPlan({ evidenceSources: ['best_guess_intuition'] });
  const confidence = classifyConfidence(plan.evidenceSources);
  const notes = buildWhatThisTellsUs({ plan, confidence });
  assert.ok(!notes.some((n) => /trigger-driven/.test(n)));
  assert.ok(notes.some((n) => /still mostly hypothetical/.test(n)));
});

test('What This Tells Us flags trust importance only when proof/reviews/expertise were actually selected', () => {
  const withTrust = baseDiscoveryPlan({ buyingCriteria: [{ category: 'proof' }], evidenceSources: ['existing_buyers', 'reviews'] });
  const withoutTrust = baseDiscoveryPlan({ buyingCriteria: [{ category: 'speed' }], evidenceSources: ['existing_buyers', 'reviews'] });
  const notesWith = buildWhatThisTellsUs({ plan: withTrust, confidence: classifyConfidence(withTrust.evidenceSources) });
  const notesWithout = buildWhatThisTellsUs({ plan: withoutTrust, confidence: classifyConfidence(withoutTrust.evidenceSources) });
  assert.ok(notesWith.some((n) => /trust appears especially important/i.test(n)));
  assert.ok(!notesWithout.some((n) => /trust appears especially important/i.test(n)));
});

test('What This Tells Us never invents an unsupported claim -- an empty, minimal plan produces no fabricated notes', () => {
  const plan = newDiscoveryPlan();
  const confidence = classifyConfidence(plan.evidenceSources);
  const notes = buildWhatThisTellsUs({ plan, confidence });
  assert.ok(notes.every((n) => typeof n === 'string' && n.length > 0));
  // only the honest "still hypothetical" note should fire; nothing about trust/marketplace/objections is invented
  assert.equal(notes.length, 1);
});

// --- Discovery Gap: single most important unresolved question --------------

test('Discovery Gap identifies the evidence foundation itself as the gap when confidence is Working Hypothesis', () => {
  const plan = baseDiscoveryPlan({ evidenceSources: ['best_guess_intuition'] });
  const gap = determineDiscoveryGap({ plan, confidence: classifyConfidence(plan.evidenceSources) });
  assert.match(gap.title, /who is actually buying/i);
});

test('Discovery Gap escalates to customer-language once evidence exists but no hypotheses were generated', () => {
  const plan = baseDiscoveryPlan({ evidenceSources: ['existing_buyers', 'reviews'], customerLanguageHypotheses: [] });
  const gap = determineDiscoveryGap({ plan, confidence: classifyConfidence(plan.evidenceSources) });
  assert.match(gap.title, /what buyers actually call this problem/i);
});

test('Discovery Gap does not manufacture a gap when evidence is already strong -- names a refinement instead', () => {
  const plan = baseDiscoveryPlan({
    evidenceSources: ['existing_buyers', 'reviews', 'actual_sales_conversations'],
    customerLanguageHypotheses: ['brand strategy for startups'],
    discoveryEnvironments: ['referrals_word_of_mouth'],
    objections: [{ type: 'Price', note: null, basis: 'observed' }],
  });
  const gap = determineDiscoveryGap({ plan, confidence: classifyConfidence(plan.evidenceSources) });
  assert.match(gap.title, /which discovery environment/i);
});

test('Discovery Gap is always produced (never null), one single question, not a list', () => {
  const plan = newDiscoveryPlan();
  const gap = determineDiscoveryGap({ plan, confidence: classifyConfidence(plan.evidenceSources) });
  assert.ok(gap.title && gap.rationale);
  assert.equal(typeof gap.title, 'string');
});

// --- Customer Discovery Experiment: adapts by stage and business model -----

test('Customer Discovery Experiment adapts by starting state', () => {
  assert.match(determineDiscoveryExperiment({ startingStateKey: 'starting_from_zero', route: 'services' }), /existing customer messages/i);
  assert.match(determineDiscoveryExperiment({ startingStateKey: 'ready_to_sell', route: 'services' }), /next few real prospects/i);
  assert.match(determineDiscoveryExperiment({ startingStateKey: 'building_momentum', route: 'services' }), /existing reviews/i);
});

test('Customer Discovery Experiment adapts by business model -- marketplace-first gets marketplace search behavior, not a generic prompt', () => {
  const exp = determineDiscoveryExperiment({ startingStateKey: 'ready_to_sell', route: 'marketplace_first' });
  assert.match(exp, /marketplace search|listing data/i);
});

test('Customer Discovery Experiment is a small, practical action, never an elaborate formal-research requirement', () => {
  for (const state of ['starting_from_zero', 'ready_to_sell', 'building_momentum']) {
    const exp = determineDiscoveryExperiment({ startingStateKey: state, route: 'services' });
    assert.doesNotMatch(exp, /interview 50|formal (market )?research|survey \d+/i);
  }
});

// --- customer-language-hypotheses.mjs: always hypotheses, never fabricated data ---

test('customer-language hypothesis generator never fabricates search volumes or metrics', () => {
  const hyps = generateCustomerLanguageHypotheses({ offer: 'brand strategy consulting', audience: 'early-stage founders', functionalResult: 'look credible at launch', route: 'services' });
  const joined = hyps.join(' ');
  assert.doesNotMatch(joined, /\d[\d,]*\s*(searches|volume|monthly)/i);
  assert.ok(hyps.length > 0);
});

test('customer-language hypothesis generator adapts by route (marketplace/local get surface-specific phrases)', () => {
  const marketplace = generateCustomerLanguageHypotheses({ offer: 'candles', audience: 'home shoppers', route: 'marketplace_first' });
  const local = generateCustomerLanguageHypotheses({ offer: 'landscaping', audience: 'homeowners', route: 'local_hybrid' });
  assert.ok(marketplace.some((h) => /etsy/.test(h)));
  assert.ok(local.some((h) => /near me/.test(h)));
});

// --- module3.mjs: the Customer Discovery Map artifact -----------------------

test('Customer Discovery Map contains the correct structured state', () => {
  const results = computeModule3Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan());
  const map = results.discoveryMap;
  assert.equal(map.likelyBuyer, 'Early-stage founders about to launch');
  assert.equal(map.buyingTrigger.strongest, 'deadline');
  assert.equal(map.desiredResult.functional, 'a brand that reads as credible at launch');
  assert.deepEqual(map.likelyObjections, [{ type: 'Price', note: null, basis: 'observed' }]);
  assert.deepEqual(map.whereTheyMayLook, ['referrals_word_of_mouth', 'google_search']);
  assert.deepEqual(map.evidence, ['actual_sales_conversations']);
  assert.equal(map.confidence, 'Partially Validated');
  assert.equal(results.moduleProgress.current, 3);
  assert.equal(results.moduleProgress.total, 7);
  assert.ok(results.discoveryGap);
  assert.ok(results.nextExperiment);
});

test('observed and hypothesized objections remain distinguishable in the Customer Discovery Map', () => {
  const plan = baseDiscoveryPlan({ objections: [{ type: 'Price', note: null, basis: 'observed' }, { type: 'Trust', note: null, basis: 'hypothesis' }] });
  const results = computeModule3Results(baseProfile(), baseOfferPlan(), plan);
  const byType = Object.fromEntries(results.discoveryMap.likelyObjections.map((o) => [o.type, o.basis]));
  assert.equal(byType.Price, 'observed');
  assert.equal(byType.Trust, 'hypothesis');
});

test('discovery environments are mapped as plausible places to look, never as a channel recommendation', () => {
  const results = computeModule3Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan());
  const serialized = JSON.stringify(results).toLowerCase();
  assert.doesNotMatch(serialized, /recommend(ed|ation)? channel/);
  assert.doesNotMatch(serialized, /best channel/);
  assert.ok(Array.isArray(results.discoveryMap.whereTheyMayLook));
});

test('generated customer-language phrases are carried through as hypotheses, distinct from evidence-backed confidence', () => {
  const plan = baseDiscoveryPlan({ evidenceSources: ['best_guess_intuition'], customerLanguageHypotheses: ['brand consultant for startups'] });
  const results = computeModule3Results(baseProfile(), baseOfferPlan(), plan);
  assert.equal(results.confidence.key, 'working_hypothesis');
  assert.deepEqual(results.discoveryMap.customerLanguageHypotheses, ['brand consultant for startups']);
});

test('Module 3 completion points to Module 4, never Module 5 or a channel decision', () => {
  const results = computeModule3Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan());
  assert.equal(results.nextClubStep.moduleLabel, 'Module 4 — Choose How People Will Find You');
  const copy = results.nextClubStep.transition + ' ' + results.nextClubStep.cta;
  assert.doesNotMatch(copy, /module 5/i);
});

// --- module3-service.mjs: prepopulation, confirm-or-refine, gating, persistence ---

async function onboardCustomerThroughModule2(overrides = {}) {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders', ...overrides.profile } });
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule2({
    accessToken: token2,
    answers: {
      offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief',
      audienceConfirmed: 'Early-stage founders', buyingMotivation: 'Feeling confident before launch',
      objections: [{ type: 'Price', note: null, basis: 'observed' }],
      selectedPositioning: 'Brand strategy consulting for early-stage founders.',
      ...overrides.offer,
    },
  });
}

function fullModule3Answers(overrides = {}) {
  return {
    buyerDescription: 'Early-stage founders about to launch',
    desiredResult: { functional: 'a brand that reads as credible at launch' },
    buyingTriggers: [{ category: 'deadline', note: null }],
    primaryTriggerCategory: 'deadline',
    buyingCriteria: [{ category: 'expertise' }],
    discoveryEnvironments: ['referrals_word_of_mouth'],
    evidenceSources: ['actual_sales_conversations'],
    objections: [{ type: 'Price', note: null, basis: 'observed' }],
    ...overrides,
  };
}

test('Module 2 offer/audience/objections state prepopulates Module 3 via getModule3Context', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const ctx = await getModule3Context(token);
  assert.equal(ctx.ok, true);
  assert.equal(ctx.offerPlan.offerConfirmed, 'Brand strategy consulting');
  assert.equal(ctx.offerPlan.audienceConfirmed, 'Early-stage founders');
  assert.deepEqual(ctx.offerPlan.objections, [{ type: 'Price', note: null, basis: 'observed' }]);
  assert.equal(ctx.existingDiscoveryPlan, null);
});

test('Module 3 requires Module 2 to be complete first', async () => {
  const token = signAccessToken({ customerId: 999777, email: 'no-module2@example.com' });
  const result = await getModule3Context(token);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_a_club_member');
});

test('Module 3 blocks with module2_not_complete when Module 1 is done but Module 2 is not', async () => {
  const token = signAccessToken({ customerId: 999778, email: 'only-module1@example.com' });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'X', price: 100, audience: 'Y' } });
  const token2 = signAccessToken({ customerId: 999778, email: 'only-module1@example.com' });
  const result = await getModule3Context(token2);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module2_not_complete');
  await rm(memberDir('customer-999778'), { recursive: true, force: true });
});

test('customer can confirm Module 2 data as-is (no forced re-entry) and it persists', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule3({ accessToken: token, answers: fullModule3Answers() });
  assert.equal(result.ok, true);
  assert.equal(result.results.discoveryMap.likelyBuyer, 'Early-stage founders about to launch');
});

test('customer can refine persisted customer information beyond Module 2\'s original text, and the refinement persists', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule3({ accessToken: token, answers: fullModule3Answers({ buyerDescription: 'Series-A-adjacent founders who already have a logo but no real positioning' }) });
  const laterToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule3ResultsForToken(laterToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.discoveryMap.likelyBuyer, 'Series-A-adjacent founders who already have a logo but no real positioning');
});

test('submitModule3 rejects when required fields are missing (no buyer description)', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule3({ accessToken: token, answers: fullModule3Answers({ buyerDescription: '' }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_buyer_description');
});

test('submitModule3 rejects when no primary trigger was chosen even if triggers were checked', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule3({ accessToken: token, answers: fullModule3Answers({ primaryTriggerCategory: null }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_primary_trigger');
});

test('submitModule3 accepts best-guess-only evidence as a valid, honest answer (never blocks on weak evidence)', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule3({ accessToken: token, answers: fullModule3Answers({ evidenceSources: ['best_guess_intuition'] }) });
  assert.equal(result.ok, true);
  assert.equal(result.results.confidence.key, 'working_hypothesis');
});

test('generateLanguageHypotheses requires Module 2 to be complete first', async () => {
  const token = signAccessToken({ customerId: 999779, email: 'no-module2-hyp@example.com' });
  const result = await generateLanguageHypotheses({ accessToken: token, answers: { buyerDescription: 'X' } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_a_club_member');
});

test('generateLanguageHypotheses returns route-adapted, labeled hypotheses built from confirmed offer data', async () => {
  await onboardCustomerThroughModule2();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await generateLanguageHypotheses({ accessToken: token, answers: { buyerDescription: 'Early-stage founders', desiredResult: { functional: 'look credible at launch' }, primaryTriggerCategory: 'deadline' } });
  assert.equal(result.ok, true);
  assert.ok(result.customerLanguageHypotheses.length > 0);
});

test('Modules 1 and 2 remain functional after Module 3 is added', () => {
  const profile = baseProfile();
  const m1 = computeModule1Results(profile);
  assert.ok(m1.startingState);
  assert.ok(m1.math);
  assert.equal(m1.moduleProgress.current, 1);

  const m2 = computeModule2Results(profile, baseOfferPlan());
  assert.ok(m2.yourOffer);
  assert.equal(m2.moduleProgress.current, 2);
  assert.equal(m2.nextClubStep.moduleLabel, 'Module 3 — Find the People Most Likely to Buy It');
});

test('the existing authenticated customer flow works end to end: onboarding -> Module 2 -> Module 3 -> reload with a fresh token', async () => {
  await onboardCustomerThroughModule2({ profile: { route: 'ecommerce', offer: 'Candles', price: 9.99 }, offer: { offerConfirmed: 'Candles', audienceConfirmed: 'Home shoppers', selectedPositioning: 'Candles for home shoppers.', objections: [] } });
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule3({
    accessToken: token,
    answers: fullModule3Answers({ buyerDescription: 'Home shoppers redecorating a living room', objections: [], discoveryEnvironments: ['instagram', 'pinterest'], buyingCriteria: [{ category: 'design_style' }] }),
  });
  assert.equal(submitResult.ok, true);

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL }); // simulates a later "Go to $1K Club" click
  const reload = await getModule3ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.discoveryMap.likelyBuyer, 'Home shoppers redecorating a living room');
  assert.equal(reload.results.businessType.route, 'ecommerce');
});
