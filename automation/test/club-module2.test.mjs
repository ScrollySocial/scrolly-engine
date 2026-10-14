/**
 * Focused tests for Module 2 (Build Something People Want to Buy / the
 * Offer Builder): positioning generation, offer evaluation (existence vs.
 * performance, extended with 'working_hypothesis'), Fix First/Keep/Learn,
 * the Offer Experiment, and the module2-service orchestration. No network.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { getRouteConfig } from '../club/lib/business-model-router.mjs';
import { computeThousandKMath } from '../club/lib/thousand-k-math.mjs';
import { generatePositioningOptions } from '../club/lib/offer-positioning.mjs';
import { evaluateOffer, buildFixFirstKeepLearn, determineOfferExperiment } from '../club/lib/offer-evaluation.mjs';
import { computeModule2Results } from '../club/lib/module2.mjs';
import { computeModule1Results } from '../club/lib/module1.mjs';
import { newOfferPlan } from '../club/lib/offer-plan-schema.mjs';
import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding, slugFromCustomerId } from '../club/lib/onboarding-service.mjs';
import { generatePositioning, submitModule2, getModule2ResultsForToken, getModule2Context } from '../club/lib/module2-service.mjs';

const CUSTOMER_ID = 555001;
const EMAIL = 'module2-test@example.com';
const SLUG = slugFromCustomerId(CUSTOMER_ID);

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

beforeEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });
afterEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });

function baseProfile(overrides = {}) {
  const profile = newBusinessProfile();
  Object.assign(profile, { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders' }, overrides);
  return profile;
}
function basePlan(overrides = {}) {
  const plan = newOfferPlan();
  Object.assign(plan, {
    offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A one-hour working session plus a written brand brief',
    audienceConfirmed: 'Early-stage founders', buyingMotivation: 'Feeling confident about their brand before launch',
    selectedPositioning: 'Brand strategy consulting for early-stage founders who need clarity before launch.',
  }, overrides);
  return plan;
}

// --- offer-positioning.mjs --------------------------------------------------

test('positioning generation adapts by business model -- ecommerce and services produce structurally different phrasing', () => {
  const shared = { offer: 'Candles', audience: 'Home shoppers', whatTheyGet: 'a hand-poured candle', motivation: 'a cozy home', differentiationDetail: null };
  const ecom = generatePositioningOptions({ ...shared, route: 'ecommerce' });
  const services = generatePositioningOptions({ ...shared, offer: 'Coaching', route: 'services' });
  assert.equal(ecom.length, 3);
  assert.equal(services.length, 3);
  assert.notDeepEqual(ecom, services);
  assert.ok(services.some((s) => /who need/i.test(s)));
});

test('positioning never invents a differentiator when none is stated', () => {
  const options = generatePositioningOptions({ offer: 'Candles', audience: 'Home shoppers', route: 'ecommerce' });
  const joined = options.join(' ');
  assert.match(joined, /still being defined/);
  assert.doesNotMatch(joined, /designed to a clear reason/);
});

// --- 2026-09-12 regression: the positioning generator must handle every
// differentiator grammatical form without producing "designed to Made..."
// style breakage. One test per form, plus the exact real-world case.

test('positioning normalizes a VERB-PHRASE differentiator (the real regression case)', () => {
  const options = generatePositioningOptions({
    offer: 'soaps', audience: 'healthy conscious people', whatTheyGet: 'A bar of handmade natural soap, shipped to their door',
    motivation: 'Feeling good about using natural, chemical-free products',
    differentiationDetail: 'Made with all-natural, locally sourced ingredients', route: 'ecommerce',
  });
  for (const o of options) {
    assert.doesNotMatch(o, /designed to Made/);
    assert.doesNotMatch(o, /\bto Made\b/);
  }
  assert.ok(options.some((o) => /made with all-natural, locally sourced ingredients/.test(o)));
});

test('positioning normalizes a NOUN-PHRASE differentiator', () => {
  const options = generatePositioningOptions({ offer: 'Soaps', audience: 'shoppers', differentiationDetail: 'All-natural ingredients', route: 'ecommerce' });
  assert.ok(options.some((o) => /all-natural ingredients/.test(o)));
  assert.doesNotMatch(options.join(' '), /designed to All-natural/);
});

test('positioning normalizes an ADJECTIVE-PHRASE differentiator', () => {
  const options = generatePositioningOptions({ offer: 'Coaching', audience: 'founders', differentiationDetail: 'Affordable and fast', route: 'services' });
  assert.ok(options.some((o) => /affordable and fast/.test(o)));
});

test('positioning normalizes a FEATURE-style differentiator', () => {
  const options = generatePositioningOptions({ offer: 'Lamps', audience: 'shoppers', differentiationDetail: 'Solar powered', route: 'ecommerce' });
  assert.ok(options.some((o) => /solar powered/.test(o)));
});

test('positioning normalizes a METHOD-style differentiator', () => {
  const options = generatePositioningOptions({ offer: 'Candles', audience: 'shoppers', differentiationDetail: 'Hand-poured in small batches', route: 'ecommerce' });
  assert.ok(options.some((o) => /hand-poured in small batches/.test(o)));
});

test('positioning normalizes a BENEFIT-style differentiator', () => {
  const options = generatePositioningOptions({ offer: 'Meal kits', audience: 'busy parents', differentiationDetail: 'Saves you time every week', route: 'ecommerce' });
  assert.ok(options.some((o) => /saves you time every week/.test(o)));
});

test('positioning normalizes a COMPLETE-SENTENCE differentiator without stranding a capital letter mid-sentence', () => {
  const options = generatePositioningOptions({ offer: 'Snacks', audience: 'parents', differentiationDetail: 'We use only organic ingredients.', route: 'ecommerce' });
  const joined = options.join(' ');
  assert.doesNotMatch(joined, /,\s*We\s/);
  assert.ok(options.some((o) => /we use only organic ingredients/.test(o)));
});

test('motivation and whatTheyGet are also normalized when embedded mid-sentence, not just the differentiator (same class of bug)', () => {
  const options = generatePositioningOptions({
    offer: 'soaps', audience: 'health-conscious people', whatTheyGet: 'A bar of handmade natural soap, shipped to their door',
    motivation: 'Feeling good about using natural, chemical-free products', route: 'ecommerce',
  });
  const joined = options.join(' ');
  assert.doesNotMatch(joined, /want Feeling/);
  assert.doesNotMatch(joined, /gives health-conscious people A bar/);
});

test('a common unhyphenated compound ("healthy conscious") is normalized to "health-conscious" in generated positioning', () => {
  const options = generatePositioningOptions({ offer: 'soaps', audience: 'healthy conscious people', differentiationDetail: 'made with natural ingredients', route: 'ecommerce' });
  assert.ok(options.some((o) => /health-conscious/i.test(o)));
});

// --- offer-evaluation.mjs ---------------------------------------------------

test('missing differentiation becomes insufficient_data (a learning need), never an invented differentiator', () => {
  const plan = basePlan({ differentiation: { category: null, detail: null, status: 'unknown' } });
  const dims = evaluateOffer({ profile: baseProfile(), plan, math: computeThousandKMath({ price: 500, route: 'services' }), module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  assert.equal(dims.reasonToChoose.state, 'insufficient_data');
});

test('a stated differentiator is a working_hypothesis, not manufactured certainty', () => {
  const plan = basePlan({ differentiation: { category: 'Specialization', detail: 'Only works with pre-seed founders', status: 'stated' } });
  const dims = evaluateOffer({ profile: baseProfile(), plan, math: computeThousandKMath({ price: 500, route: 'services' }), module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  assert.equal(dims.reasonToChoose.state, 'working_hypothesis');
});

test('existing proof does not automatically classify trust as growth_strength -- it follows Module 1\'s own real evidence', () => {
  const plan = basePlan({ proofInventory: [{ type: 'Testimonials', detail: null }, { type: 'Case studies', detail: null }] });
  const dims = evaluateOffer({ profile: baseProfile(), plan, math: computeThousandKMath({ price: 500, route: 'services' }), module1TrustDim: { state: 'insufficient_data', rationale: 'no real trust metric known' } });
  assert.notEqual(dims.proofTrust.state, 'growth_strength');
  assert.equal(dims.proofTrust.state, 'insufficient_data'); // mirrors Module 1's own honest read, existence alone didn't upgrade it
  assert.equal(dims.proofTrust.evidence.existenceState, 'exists'); // existence IS still true and reported separately
});

test('missing proof for an early-stage business is reported as not_established, not penalized as growth_opportunity', () => {
  const plan = basePlan({ proofInventory: [] });
  const dims = evaluateOffer({ profile: baseProfile({ stage: 'A' }), plan, math: computeThousandKMath({ price: 500, route: 'services' }), module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  assert.equal(dims.proofTrust.evidence.existenceState, 'not_established');
  assert.notEqual(dims.proofTrust.state, 'growth_opportunity');
});

test('observed and hypothesized objections remain distinguishable and produce different Buying Friction verdicts', () => {
  const math = computeThousandKMath({ price: 500, route: 'services' });
  const observedPlan = basePlan({ objections: [{ type: 'Price', note: null, basis: 'observed' }] });
  const hypothesisPlan = basePlan({ objections: [{ type: 'Price', note: null, basis: 'hypothesis' }] });
  const observedDims = evaluateOffer({ profile: baseProfile(), plan: observedPlan, math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const hypothesisDims = evaluateOffer({ profile: baseProfile(), plan: hypothesisPlan, math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  assert.equal(observedDims.buyingFriction.state, 'growth_opportunity');
  assert.equal(hypothesisDims.buyingFriction.state, 'working_hypothesis');
});

test('low price / high transaction count does not automatically produce a "raise your price" recommendation', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'digital_product' });
  assert.equal(math.isHighTransactionCount, true);
  const dims = evaluateOffer({ profile: baseProfile({ route: 'digital_product', price: 9.99 }), plan: basePlan(), math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  assert.equal(dims.priceEconomics.state, 'on_track');
  assert.doesNotMatch(dims.priceEconomics.rationale, /raise|increase (your )?price|charge more/i);
  const fkl = buildFixFirstKeepLearn(dims, math);
  const allCopy = [fkl.fixFirst.title, fkl.fixFirst.rationale, fkl.keep.title, fkl.keep.rationale, fkl.learn.title, fkl.learn.rationale].join(' ');
  assert.doesNotMatch(allCopy, /raise|increase (your )?price|charge more/i);
});

// --- 2026-09-12 regression: Fix First must reflect the strongest actual
// evidence, not fall back to a generic clarity line whenever nothing has
// escalated to growth_opportunity. Real customer-observed case first.

test('Fix First does not fall back to generic clarity advice when a more specific, evidence-backed issue exists (the real observed case)', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'ecommerce' });
  const plan = basePlan({
    differentiation: { category: 'Materials', detail: 'Made with all-natural, locally sourced ingredients', status: 'stated' },
    proofInventory: [{ type: 'Testimonials', detail: null }],
  });
  const dims = evaluateOffer({ profile: baseProfile({ route: 'ecommerce', price: 9.99 }), plan, math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const fkl = buildFixFirstKeepLearn(dims, math);
  // Real, unused proof exists -- that's a more specific, higher-leverage lever than re-polishing an already-complete description.
  assert.match(fkl.fixFirst.title, /Testimonials/);
  assert.notEqual(fkl.fixFirst.title, 'Tighten the one-sentence description of the offer so it reads clearly at a glance.');
});

test('Fix First does NOT automatically default to buyer-fit validation just because the audience is unvalidated, when a more specific signal exists', () => {
  const math = computeThousandKMath({ price: 500, route: 'services' });
  // Audience is a working hypothesis (true of almost every early profile) AND a differentiator is stated
  // (also a working hypothesis) -- the more specific, higher-leverage signal should win, not audience by default.
  const dims = evaluateOffer({
    profile: baseProfile(),
    plan: basePlan({ differentiation: { category: 'Specialization', detail: 'Only pre-seed founders', status: 'stated' } }),
    math, module1TrustDim: { state: 'insufficient_data', rationale: '' },
  });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.doesNotMatch(fkl.fixFirst.title, /who this is for|really for/i);
});

test('Fix First DOES fall through to buyer-fit when it is genuinely the only remaining unvalidated signal', () => {
  const math = computeThousandKMath({ price: 500, route: 'services' });
  // No differentiator stated at all (genuinely unknown -> insufficient_data, not a competing hypothesis) and no proof -- buyer fit is legitimately the strongest remaining lever here.
  const dims = evaluateOffer({ profile: baseProfile(), plan: basePlan({ differentiation: { category: null, detail: null, status: 'unknown' } }), math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.match(fkl.fixFirst.title, /who this is for/i);
});

test('Fix First prefers a stated-but-unvalidated differentiator over generic clarity polish when no proof exists', () => {
  const math = computeThousandKMath({ price: 500, route: 'services' });
  const dims = evaluateOffer({
    profile: baseProfile(), plan: basePlan({ differentiation: { category: 'Specialization', detail: 'Only pre-seed founders', status: 'stated' }, proofInventory: [] }),
    math, module1TrustDim: { state: 'insufficient_data', rationale: '' },
  });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.match(fkl.fixFirst.title, /Specialization/);
});

test('Fix First and Learn stay distinct even when they touch related dimensions', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'ecommerce' });
  const plan = basePlan({ differentiation: { category: 'Materials', detail: 'Made with natural ingredients', status: 'stated' }, proofInventory: [{ type: 'Testimonials', detail: null }] });
  const dims = evaluateOffer({ profile: baseProfile({ route: 'ecommerce', price: 9.99 }), plan, math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.notEqual(fkl.fixFirst.title, fkl.learn.title);
});

test('an evidenced growth_opportunity still outranks everything else for Fix First', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'ecommerce' });
  const plan = basePlan({
    differentiation: { category: 'Materials', detail: 'Made with natural ingredients', status: 'stated' },
    proofInventory: [{ type: 'Testimonials', detail: null }],
    objections: [{ type: 'Unclear fit', note: null, basis: 'observed' }],
  });
  const dims = evaluateOffer({ profile: baseProfile({ route: 'ecommerce', price: 9.99 }), plan, math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.match(fkl.fixFirst.title, /who this offer is really for/i);
});

test('Fix First / Keep / Learn are always produced (never null) and Keep defaults to price absent contrary evidence', () => {
  const math = computeThousandKMath({ price: 500, route: 'services' });
  const dims = evaluateOffer({ profile: baseProfile(), plan: basePlan(), math, module1TrustDim: { state: 'insufficient_data', rationale: '' } });
  const fkl = buildFixFirstKeepLearn(dims, math);
  assert.ok(fkl.fixFirst.title);
  assert.ok(fkl.keep.title);
  assert.ok(fkl.learn.title);
  assert.match(fkl.keep.title, /\$500/);
});

test('Offer Experiment adapts by starting state, matching the canonical examples', () => {
  assert.match(determineOfferExperiment('starting_from_zero'), /small number of relevant potential buyers/);
  assert.match(determineOfferExperiment('ready_to_sell'), /qualified prospects/);
  assert.match(determineOfferExperiment('building_momentum'), /Compare the revised positioning/);
});

// --- module2.mjs: Your $1K Offer artifact -----------------------------------

test('Your $1K Offer contains the correct structured output', () => {
  const profile = baseProfile();
  const plan = basePlan({ objections: [{ type: 'Price', note: null, basis: 'observed' }], proofInventory: [{ type: 'Testimonials', detail: null }] });
  const results = computeModule2Results(profile, plan);
  const o = results.yourOffer;
  assert.equal(o.primaryOffer, plan.offerConfirmed);
  assert.equal(o.customer, plan.audienceConfirmed);
  assert.equal(o.price, 500);
  assert.equal(o.target.salesRequired, 2);
  assert.equal(o.positioning, plan.selectedPositioning);
  assert.equal(o.primaryBuyingConcern.label, 'Price');
  assert.equal(o.primaryBuyingConcern.basis, 'observed');
  assert.deepEqual(o.bestAvailableProof, plan.proofInventory);
  assert.ok(o.fixFirst && o.keep && o.learn && o.nextExperiment);
  assert.equal(results.moduleProgress.current, 2);
  assert.equal(results.moduleProgress.total, 7);
});

test('Module 2 completion points to Module 3, never Channel Selector or Module 4', () => {
  const results = computeModule2Results(baseProfile(), basePlan());
  assert.equal(results.nextClubStep.moduleLabel, 'Module 3 — Find the People Most Likely to Buy It');
  const copy = results.nextClubStep.transition + ' ' + results.nextClubStep.cta;
  assert.doesNotMatch(copy, /channel selector|module 4/i);
});

// --- module2-service.mjs: prepopulation, confirm-or-refine, persistence ---

async function onboardCustomer(overrides = {}) {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  return submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders', ...overrides } });
}

test('Module 1 offer/price/customer data prepopulates Module 2 via getModule2Context', async () => {
  await onboardCustomer();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const ctx = await getModule2Context(token);
  assert.equal(ctx.ok, true);
  assert.equal(ctx.profile.offer, 'Brand strategy consulting');
  assert.equal(ctx.profile.price, 500);
  assert.equal(ctx.profile.audience, 'Early-stage founders');
  assert.ok(ctx.module1Results.math);
  assert.equal(ctx.existingOfferPlan, null);
});

test('customer can confirm Module 1 data as-is (no forced re-entry) and it persists', async () => {
  await onboardCustomer();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule2({
    accessToken: token,
    answers: { offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief', audienceConfirmed: 'Early-stage founders', selectedPositioning: 'Brand strategy consulting for early-stage founders.' },
  });
  assert.equal(result.ok, true);
  assert.equal(result.results.yourOffer.primaryOffer, 'Brand strategy consulting');
});

test('customer can refine the offer beyond Module 1\'s original text, and the refinement persists', async () => {
  await onboardCustomer();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule2({
    accessToken: token,
    answers: { offerConfirmed: 'Brand strategy + launch-week consulting package', whatTheyGet: 'Two working sessionsplus a written brief', audienceConfirmed: 'Early-stage founders about to launch', selectedPositioning: 'Custom positioning here.' },
  });
  const laterToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule2ResultsForToken(laterToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.yourOffer.primaryOffer, 'Brand strategy + launch-week consulting package');
});

test('customer can select/edit positioning -- a fully custom sentence persists verbatim', async () => {
  await onboardCustomer();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const custom = 'My own totally custom positioning sentence.';
  const result = await submitModule2({
    accessToken: token,
    answers: { offerConfirmed: 'X', whatTheyGet: 'Y', audienceConfirmed: 'Z', selectedPositioning: custom },
  });
  assert.equal(result.results.yourOffer.positioning, custom);
});

test('generatePositioning requires Module 1 to be complete first', async () => {
  const token = signAccessToken({ customerId: 999888, email: 'no-module1@example.com' });
  const result = await generatePositioning({ accessToken: token, answers: { offerConfirmed: 'X', audienceConfirmed: 'Y' } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_a_club_member');
});

test('Module 1 remains unaffected by Module 2 -- same shape, same behavior', () => {
  const profile = baseProfile();
  const m1 = computeModule1Results(profile);
  assert.ok(m1.startingState);
  assert.ok(m1.math);
  assert.ok(m1.firstPriority);
  assert.ok(m1.startingPointPlan);
  assert.equal(m1.moduleProgress.current, 1);
});

test('the existing authenticated customer flow still works end to end: onboarding -> Module 2 -> reload with a fresh token', async () => {
  await onboardCustomer({ route: 'ecommerce', offer: 'Candles', price: 9.99 });
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule2({
    accessToken: token,
    answers: { offerConfirmed: 'Candles', whatTheyGet: 'A hand-poured soy candle', audienceConfirmed: 'Home shoppers', selectedPositioning: 'Candles for home shoppers.' },
  });
  assert.equal(submitResult.ok, true);

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL }); // simulates a later "Go to $1K Club" click
  const reload = await getModule2ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.yourOffer.primaryOffer, 'Candles');
  assert.equal(reload.results.businessType.route, 'ecommerce');
});
