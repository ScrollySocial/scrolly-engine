/**
 * Focused tests for Module 6 (Turn Attention Into Sales / the Sales Path
 * Builder): canonical-destination selection, business-model-adapted path
 * construction, the qualification-step heuristic, the Sales Path Check
 * dimensions (offer clarity reuse, next-step clarity, purchase/contact
 * ability with an explicit customer-reported-vs-verified distinction,
 * contextual friction, trust placement, mobile practicality, follow-up),
 * the CTA -> Destination Map, the Conversion Gap decision tree (with the
 * critical insufficient-activity-first ordering), Direct vs Nurture
 * reasoning, Fix Now/Keep/Measure, the Sales-Path Experiment, and the
 * module6-service orchestration. No network, no fake numeric score.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { newOfferPlan } from '../club/lib/offer-plan-schema.mjs';
import { newDiscoveryPlan } from '../club/lib/discovery-plan-schema.mjs';
import { newChannelPlan } from '../club/lib/channel-plan-schema.mjs';
import { newMessagingPlan } from '../club/lib/messaging-plan-schema.mjs';
import { newSalesPathPlan } from '../club/lib/sales-path-plan-schema.mjs';
import {
  pickCanonicalDestination,
  needsQualificationStep,
  buildChannelPaths,
  classifyPathType,
  hasQualifiedActivityEvidence,
  evaluatePurchaseContactAbility,
  evaluateContextualFriction,
  buildTrustGuidance,
  buildCtaDestinationMap,
  determineConversionGap,
  determineConversionApproach,
  determineFixNow,
  determineKeep,
  determineMeasureFirst,
  determineSalesPathExperiment,
  buildPathMetrics,
} from '../club/lib/sales-path-evaluation.mjs';
import { computeModule6Results } from '../club/lib/module6.mjs';
import { computeModule5Results } from '../club/lib/module5.mjs';
import { computeModule4Results } from '../club/lib/module4.mjs';
import { computeModule3Results } from '../club/lib/module3.mjs';
import { computeModule2Results } from '../club/lib/module2.mjs';
import { computeModule1Results } from '../club/lib/module1.mjs';
import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding, slugFromCustomerId } from '../club/lib/onboarding-service.mjs';
import { submitModule2 } from '../club/lib/module2-service.mjs';
import { submitModule3 } from '../club/lib/module3-service.mjs';
import { submitModule4 } from '../club/lib/module4-service.mjs';
import { submitModule5 } from '../club/lib/module5-service.mjs';
import { getModule6Context, submitModule6, getModule6ResultsForToken } from '../club/lib/module6-service.mjs';

const CUSTOMER_ID = 555005;
const EMAIL = 'module6-test@example.com';
const SLUG = slugFromCustomerId(CUSTOMER_ID);

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

beforeEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });
afterEach(async () => { await rm(memberDir(SLUG), { recursive: true, force: true }); });

function baseProfile(overrides = {}) {
  const profile = newBusinessProfile();
  Object.assign(profile, { route: 'ecommerce', stage: 'B', offer: 'Candles', price: 24, audience: 'Home shoppers' }, overrides);
  return profile;
}
function baseOfferPlan(overrides = {}) {
  const plan = newOfferPlan();
  Object.assign(plan, {
    offerConfirmed: 'Candles', whatTheyGet: 'A hand-poured soy candle', audienceConfirmed: 'Home shoppers',
    buyingMotivation: 'A cozy home', selectedPositioning: 'Candles for home shoppers.',
  }, overrides);
  return plan;
}
function baseDiscoveryPlan(overrides = {}) {
  const plan = newDiscoveryPlan();
  Object.assign(plan, {
    buyerDescription: 'Home shoppers redecorating a living room',
    desiredResult: { functional: 'a room that smells and feels cozy' },
    buyingTriggers: [{ category: 'desire_want', note: null }],
    primaryTriggerCategory: 'desire_want',
    buyingCriteria: [{ category: 'design_style' }],
    discoveryEnvironments: ['instagram', 'google_search'],
    customerLanguageHypotheses: ['best cozy candles'],
    evidenceSources: ['reviews'],
  }, overrides);
  return plan;
}
function baseChannelPlan(overrides = {}) {
  const plan = newChannelPlan();
  Object.assign(plan, {
    marketingHoursPerWeek: 10,
    feasibleFormats: ['short_form_video', 'photography_images', 'writing_articles', 'graphics_design'],
    existingAssets: [],
    hardConstraints: [],
  }, overrides);
  return plan;
}
function baseMessagingPlan(overrides = {}) {
  const plan = newMessagingPlan();
  Object.assign(plan, { coreMessageOptions: ['A', 'B', 'C'], selectedCoreMessage: 'Candles for home shoppers who want their space to feel cozy.' }, overrides);
  return plan;
}
function baseSalesPathPlan(overrides = {}) {
  const plan = newSalesPathPlan();
  Object.assign(plan, {
    conversionDestinations: [{ type: 'website_product_page', detail: null }],
    mobileStatus: 'likely',
    followUpMechanism: 'not_necessary_yet',
  }, overrides);
  return plan;
}

// --- pickCanonicalDestination / classifyPathType ----------------------------

test('the most direct/specific selected destination anchors the canonical path', () => {
  const d = pickCanonicalDestination([{ type: 'dm', detail: null }, { type: 'checkout', detail: null }]);
  assert.equal(d.type, 'checkout');
});

test('Path Type is descriptive language, never a score, and adapts by destination', () => {
  assert.equal(classifyPathType(pickCanonicalDestination([{ type: 'checkout' }])), 'Direct Conversion');
  assert.equal(classifyPathType(pickCanonicalDestination([{ type: 'marketplace_listing' }])), 'Marketplace');
  assert.equal(classifyPathType(pickCanonicalDestination([{ type: 'inquiry_contact_form' }])), 'Inquiry-Led');
  assert.equal(classifyPathType(pickCanonicalDestination([{ type: 'dm' }])), 'Conversation / DM-Led');
  assert.equal(classifyPathType(pickCanonicalDestination([{ type: 'physical_location' }])), 'Local / Offline');
});

// --- Test 7/8: qualification step is price/complexity-driven, not automatic ---

test('a low-price/simple offer does not get a qualification step (Test 7)', () => {
  assert.equal(needsQualificationStep({ route: 'ecommerce', price: 24, topBuyingCriteria: [] }), false);
  assert.equal(needsQualificationStep({ route: 'digital_product', price: 9.99, topBuyingCriteria: [] }), false);
});

test('a higher-consideration service offer legitimately requires qualification (Test 8)', () => {
  assert.equal(needsQualificationStep({ route: 'services', price: 5000, topBuyingCriteria: [] }), true);
  assert.equal(needsQualificationStep({ route: 'services', price: 50, topBuyingCriteria: ['expertise'] }), true);
});

// --- Test 5/6: business model is not forced into the wrong shape -----------

test('Test 5: a service business is NOT forced into direct-checkout terminology', () => {
  const destination = pickCanonicalDestination([{ type: 'inquiry_contact_form' }]);
  const needsQual = needsQualificationStep({ route: 'services', price: 800, topBuyingCriteria: [] });
  const paths = buildChannelPaths({ channels: [{ key: 'google_search', label: 'Google Search', job: 'intent_capture' }], canonicalDestination: destination, needsQualification: needsQual });
  const steps = paths[0].steps;
  assert.ok(!steps.includes('Checkout'));
  assert.ok(!steps.includes('Add to Cart'));
  assert.ok(steps.includes('Qualification / Conversation'));
});

test('Test 6: a marketplace-first business remains marketplace-native, not forced onto a website funnel', () => {
  const destination = pickCanonicalDestination([{ type: 'marketplace_listing' }]);
  const approach = determineConversionApproach({ route: 'marketplace_first', canonicalDestination: destination, needsQualification: false, offerClarityState: 'on_track', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  assert.equal(approach.approach, 'marketplace_native');
  const paths = buildChannelPaths({ channels: [{ key: 'etsy', label: 'Etsy', job: 'marketplace_discovery' }], canonicalDestination: destination, needsQualification: false });
  assert.deepEqual(paths[0].steps, ['Etsy', 'Listing', 'Product Evaluation', 'Checkout', 'Purchase']);
});

// --- Test 4: ecommerce is not forced into nurture ---------------------------

test('Test 4: ecommerce with no evidence of a trust/clarity gap gets Direct Conversion, never forced nurture', () => {
  const destination = pickCanonicalDestination([{ type: 'website_product_page' }]);
  const approach = determineConversionApproach({ route: 'ecommerce', canonicalDestination: destination, needsQualification: false, offerClarityState: 'on_track', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  assert.equal(approach.approach, 'direct_conversion');
});

// --- Test 9: additional steps are not automatically bad friction -----------

test('Test 9: a services path with a genuinely-warranted qualification step is NOT flagged as friction', () => {
  const friction = evaluateContextualFriction({ route: 'services', price: 5000, needsQualification: true, pathSteps: ['Google Search', 'Inquiry', 'Qualification / Conversation', 'Booking or Payment'] });
  assert.equal(friction.state, 'on_track');
});

test('an unusually long path for a genuinely low-price simple product IS flagged (not "more steps = bad" universally, but a real mismatch)', () => {
  const friction = evaluateContextualFriction({ route: 'ecommerce', price: 9.99, needsQualification: false, pathSteps: ['Instagram', 'Email', 'Nurture', 'Sales Page', 'Checkout', 'Upsell', 'Purchase'] });
  assert.equal(friction.state, 'growth_opportunity');
});

// --- Test 10/11: purchase/contact mechanism, and the verification distinction ---

test('Test 10: a missing purchase/contact mechanism is identified as a genuine structural blocker', () => {
  const result = evaluatePurchaseContactAbility({ conversionDestinations: [{ type: 'not_set_up_yet' }] });
  assert.equal(result.state, 'not_established');
});

test('Test 11: an existing mechanism is reported as CUSTOMER-REPORTED, never claimed as technically verified', () => {
  const result = evaluatePurchaseContactAbility({ conversionDestinations: [{ type: 'checkout' }] });
  assert.equal(result.state, 'customer_reported');
  assert.equal(result.verification, 'customer_reported');
  assert.match(result.rationale, /reported|not technically tested/i);
  assert.doesNotMatch(result.rationale, /verified|tested and confirmed|works correctly/i);
});

// --- Test 12/13/14: CTA -> Destination Map ----------------------------------

test('Test 12: the CTA -> Destination Map uses actual Module 5 CTA categories, not invented ones', () => {
  const channelMessageMap = [{ channel: 'Instagram', ctaCategory: 'discover', ctaLabel: 'Discover' }];
  const map = buildCtaDestinationMap({ channelMessageMap, canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]) });
  assert.equal(map[0].ctaCategory, 'discover');
  assert.equal(map[0].ctaLabel, 'Discover');
});

test('Test 13: a buy/convert CTA pointed at a non-transactional destination is flagged as a mismatch', () => {
  const channelMessageMap = [{ channel: 'Instagram', ctaCategory: 'buy_convert', ctaLabel: 'Buy / Convert' }];
  const map = buildCtaDestinationMap({ channelMessageMap, canonicalDestination: pickCanonicalDestination([{ type: 'dm' }]) });
  assert.equal(map[0].mismatch, true);
});

test('Test 14: a direct-purchase destination is not forced when the CTA is a softer consideration step', () => {
  const channelMessageMap = [{ channel: 'Google Search', ctaCategory: 'consider', ctaLabel: 'Consider' }];
  const map = buildCtaDestinationMap({ channelMessageMap, canonicalDestination: pickCanonicalDestination([{ type: 'inquiry_contact_form' }]) });
  assert.equal(map[0].mismatch, false);
});

// --- Test 15/16: Module 4 Secondary is resource priority, NOT dependency ---

test('Test 15: Secondary Channel is never made dependent on Primary Channel -- each channel\'s path never contains another channel\'s label', () => {
  const destination = pickCanonicalDestination([{ type: 'website_product_page' }]);
  const channels = [{ key: 'instagram', label: 'Instagram', job: 'discovery' }, { key: 'google_search', label: 'Google Search', job: 'intent_capture' }];
  const paths = buildChannelPaths({ channels, canonicalDestination: destination, needsQualification: false });
  const [primaryPath, secondaryPath] = paths;
  assert.ok(!secondaryPath.steps.includes('Instagram'));
  assert.ok(!primaryPath.steps.includes('Google Search'));
});

test('Test 16: multiple channels independently produce legitimate, complete revenue paths to the same real destination', () => {
  const destination = pickCanonicalDestination([{ type: 'website_product_page' }]);
  const channels = [{ key: 'instagram', label: 'Instagram', job: 'discovery' }, { key: 'google_search', label: 'Google Search', job: 'intent_capture' }];
  const paths = buildChannelPaths({ channels, canonicalDestination: destination, needsQualification: false });
  assert.equal(paths.length, 2);
  for (const p of paths) {
    assert.ok(p.steps.includes('Purchase'));
    assert.equal(p.destinationEstablished, true);
  }
});

// --- Test 17: Module 4 Early Evidence Signals remain available -------------

test('Test 17: Module 4\'s Early Evidence Signals are preserved verbatim as upstream metrics', () => {
  const metrics = buildPathMetrics({ earlyEvidence: ['saves/shares/DMs from people matching your buyer description', 'profile visits leading to a click-through'], canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]) });
  assert.ok(metrics.includes('saves/shares/DMs from people matching your buyer description'));
  assert.ok(metrics.includes('profile visits leading to a click-through'));
  assert.equal(metrics[metrics.length - 1], 'Revenue');
});

// --- Test 18/19: existing proof never implies placement, never invented ---

test('Test 18: existing proof does NOT imply it is correctly placed at the decision point', () => {
  const guidance = buildTrustGuidance({ canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]), proofPlan: { existingProof: [{ type: 'Customer reviews', detail: null, howToUse: 'x' }], proofToBuild: [] } });
  assert.notEqual(guidance.state, 'confirmed_placed');
  assert.equal(guidance.placementKnown, false);
  assert.equal(guidance.state, 'exists_placement_unknown');
});

test('Test 19: proof is never invented -- only items literally present in Module 5\'s proofPlan are surfaced', () => {
  const proofPlan = { existingProof: [{ type: 'Testimonials', detail: null, howToUse: 'x' }], proofToBuild: [] };
  const guidance = buildTrustGuidance({ canonicalDestination: pickCanonicalDestination([{ type: 'inquiry_contact_form' }]), proofPlan });
  const allTypes = guidance.existing.map((p) => p.type);
  for (const t of allTypes) assert.ok(proofPlan.existingProof.some((p) => p.type === t));
});

test('no proof at all is honestly reported as not_established, never invented', () => {
  const guidance = buildTrustGuidance({ canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]), proofPlan: { existingProof: [], proofToBuild: ['Detailed, honest product photography'] } });
  assert.equal(guidance.state, 'not_established');
  assert.deepEqual(guidance.existing, []);
});

// --- Test 20: follow-up is not automatically required ----------------------

test('Test 20: a clean direct-conversion path with no follow-up mechanism is NOT automatically flagged as a gap', () => {
  const gap = determineConversionGap({
    route: 'ecommerce', canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]), hasActivity: true,
    ctaMap: [{ mismatch: false }], friction: { state: 'on_track' }, trustGuidance: { state: 'exists_placement_unknown' }, offerClarityState: 'on_track',
    mobileStatus: 'confirmed', mobileRelevant: false, followUpMechanism: 'none', followUpPlausiblyNeeded: false,
  });
  assert.notEqual(gap.category, 'follow_up_opportunity');
  assert.equal(gap.category, 'path_appears_sound');
});

// --- Test 21: Direct vs Nurture reasoning adapts appropriately --------------

test('Test 21: Direct vs Nurture reasoning covers all four real scenarios distinctly', () => {
  const direct = determineConversionApproach({ route: 'ecommerce', canonicalDestination: pickCanonicalDestination([{ type: 'checkout' }]), needsQualification: false, offerClarityState: 'on_track', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  const marketplace = determineConversionApproach({ route: 'marketplace_first', canonicalDestination: pickCanonicalDestination([{ type: 'marketplace_listing' }]), needsQualification: false, offerClarityState: 'on_track', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  const qualification = determineConversionApproach({ route: 'services', canonicalDestination: pickCanonicalDestination([{ type: 'inquiry_contact_form' }]), needsQualification: true, offerClarityState: 'on_track', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  const nurture = determineConversionApproach({ route: 'digital_product', canonicalDestination: pickCanonicalDestination([{ type: 'sales_page' }]), needsQualification: false, offerClarityState: 'growth_opportunity', proofTrustState: 'on_track', hasObservedTrustObjection: false });
  const approaches = new Set([direct.approach, marketplace.approach, qualification.approach, nurture.approach]);
  assert.equal(approaches.size, 4);
});

// --- Test 22/23: insufficient activity is checked BEFORE any conversion verdict ---

test('Test 22/23: insufficient qualified activity NEVER becomes "bad conversion" -- it is checked first, even with a real mismatch present', () => {
  const gap = determineConversionGap({
    route: 'ecommerce', canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]), hasActivity: false,
    ctaMap: [{ mismatch: true, mismatchReason: 'x' }], friction: { state: 'growth_opportunity' }, trustGuidance: { state: 'not_established' }, offerClarityState: 'growth_opportunity',
    mobileStatus: 'unknown_needs_checking', mobileRelevant: true, followUpMechanism: 'none', followUpPlausiblyNeeded: true,
  });
  assert.equal(gap.category, 'insufficient_qualified_activity');
  assert.match(gap.rationale, /don't yet have enough qualified buying activity/i);
  assert.doesNotMatch(gap.rationale, /checkout isn't converting|conversion (rate )?is (bad|poor|low)/i);
});

// --- Test 24/25: Module 1 $1K Math reuse, planning vs performance -----------

test('Test 24/25: $1K Connection reuses Module 1\'s real math and never presents planning as performance', () => {
  const profile = baseProfile({ price: 24 });
  const results = computeModule6Results(profile, baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan(), baseSalesPathPlan());
  const m1 = computeModule1Results(profile);
  assert.equal(results.salesPath.thousandKConnection.price, m1.math.price);
  assert.equal(results.salesPath.thousandKConnection.salesRequired, m1.math.requiredSales);
  assert.equal(results.salesPath.thousandKConnection.resultingRevenue, m1.math.resultingRevenue);
  assert.match(results.salesPath.thousandKConnection.interpretation, /still needs to be established/i); // no real activity evidence in this fixture
});

// --- Test 26/27: metrics adapt by path, never force unavailable metrics ---

test('Test 26: path-specific metrics adapt by destination/business model', () => {
  const ecomMetrics = buildPathMetrics({ earlyEvidence: [], canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]) });
  const serviceMetrics = buildPathMetrics({ earlyEvidence: [], canonicalDestination: pickCanonicalDestination([{ type: 'inquiry_contact_form' }]) });
  assert.notDeepEqual(ecomMetrics, serviceMetrics);
});

test('Test 27: no destination established yet does not force fabricated mid-funnel metrics', () => {
  const metrics = buildPathMetrics({ earlyEvidence: ['channel signal'], canonicalDestination: null });
  assert.deepEqual(metrics, ['channel signal', 'Revenue']);
});

// --- Test 28: Fix Now / Keep / Measure derive from actual state ------------

test('Test 28: Fix Now / Keep / Measure First all change with the underlying gap/approach', () => {
  const noPathGap = { category: 'no_purchase_path', label: 'No Purchase Path Established' };
  const soundGap = { category: 'path_appears_sound', label: 'Path Appears Structurally Sound' };
  assert.notEqual(determineFixNow(noPathGap).title, determineFixNow(soundGap).title);

  const directKeep = determineKeep({ conversionApproach: { approach: 'direct_conversion' }, canonicalDestination: pickCanonicalDestination([{ type: 'checkout' }]) });
  const marketplaceKeep = determineKeep({ conversionApproach: { approach: 'marketplace_native' }, canonicalDestination: pickCanonicalDestination([{ type: 'marketplace_listing' }]) });
  assert.notEqual(directKeep.title, marketplaceKeep.title);

  const measureNoActivity = determineMeasureFirst({ gap: soundGap, hasActivity: false });
  const measureWithActivity = determineMeasureFirst({ gap: soundGap, hasActivity: true });
  assert.notEqual(measureNoActivity.title, measureWithActivity.title);
});

test('it is valid to say no structural rebuild is justified yet when the path appears sound', () => {
  const fixNow = determineFixNow({ category: 'path_appears_sound', label: 'Path Appears Structurally Sound' });
  assert.match(fixNow.title, /no structural rebuild is justified/i);
});

// --- Test 29/30: the experiment addresses a real unknown, no revenue promise ---

test('Test 29: the Sales-Path Experiment adapts to the actual gap, never a generic universal test', () => {
  const noPath = determineSalesPathExperiment({ gap: { category: 'no_purchase_path' }, canonicalDestination: null, primaryChannelLabel: 'Instagram' });
  const mismatch = determineSalesPathExperiment({ gap: { category: 'cta_destination_mismatch' }, canonicalDestination: pickCanonicalDestination([{ type: 'website_product_page' }]), primaryChannelLabel: 'Instagram' });
  assert.notEqual(noPath, mismatch);
});

test('Test 30: no experiment or artifact text promises revenue', () => {
  const results = computeModule6Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan(), baseSalesPathPlan());
  const serialized = JSON.stringify(results);
  assert.doesNotMatch(serialized, /will (make|earn|reach) \$|guarantee(d|s)? (revenue|sales|\$)/i);
});

// --- Test 31: full artifact structure ---------------------------------------

test('Test 31: Your $1K Sales Path contains the correct structured state', () => {
  const results = computeModule6Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan(), baseSalesPathPlan());
  const sp = results.salesPath;
  assert.ok(sp.primarySalesPath);
  assert.ok(sp.pathType);
  assert.ok(sp.channelRevenuePaths.length >= 1);
  assert.ok(Array.isArray(sp.ctaDestinationMap));
  assert.ok(Array.isArray(sp.whatsWorking));
  assert.ok(sp.conversionGap);
  assert.ok(sp.trustAtDecisionPoint);
  assert.ok(sp.followUp);
  assert.ok(sp.thousandKConnection);
  assert.ok(sp.measure.length > 0);
  assert.ok(sp.fixNow && sp.keep && sp.measureFirst);
  assert.ok(sp.firstSalesPathExperiment);
  assert.equal(results.moduleProgress.current, 6);
  assert.equal(results.moduleProgress.total, 7);
});

test('Test 1: actual Module 5 state correctly prepopulates the carried-forward context', () => {
  const profile = baseProfile();
  const offerPlan = baseOfferPlan();
  const discoveryPlan = baseDiscoveryPlan();
  const channelPlan = baseChannelPlan();
  const messagingPlan = baseMessagingPlan();
  const results = computeModule6Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan, baseSalesPathPlan());
  const m5 = computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan);
  assert.equal(results.carriedForward.module5.coreMessage, m5.messagingContentPlan.coreMessage);
  assert.deepEqual(results.carriedForward.module5.ctaStrategy, m5.messagingContentPlan.ctaStrategy);
  assert.deepEqual(results.carriedForward.module5.proofPlan, m5.messagingContentPlan.proofPlan);
  assert.deepEqual(results.carriedForward.module5.objectionsToAddress, m5.messagingContentPlan.objectionsToAddress);
});

test('Test 32: Module 6 completion points to Module 7, never Module 8 or Challenge language', () => {
  const results = computeModule6Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan(), baseSalesPathPlan());
  assert.equal(results.nextClubStep.moduleLabel, 'Module 7 — Find What Works & Do More of It');
  const copy = results.nextClubStep.transition + ' ' + results.nextClubStep.cta;
  assert.doesNotMatch(copy, /module 8|30.day/i);
});

test('Test 33: Modules 1-5 remain functional after Module 6 is added', () => {
  const profile = baseProfile();
  assert.equal(computeModule1Results(profile).moduleProgress.current, 1);
  const m2 = computeModule2Results(profile, baseOfferPlan());
  assert.equal(m2.nextClubStep.moduleLabel, 'Module 3 — Find the People Most Likely to Buy It');
  const m3 = computeModule3Results(profile, baseOfferPlan(), baseDiscoveryPlan());
  assert.equal(m3.nextClubStep.moduleLabel, 'Module 4 — Choose How People Will Find You');
  const m4 = computeModule4Results(profile, baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  assert.equal(m4.nextClubStep.moduleLabel, 'Module 5 — Give Them a Reason to Pay Attention');
  const m5 = computeModule5Results(profile, baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  assert.equal(m5.nextClubStep.moduleLabel, 'Module 6 — Turn Attention Into Sales');
});

// --- module6-service.mjs: gating, prepopulation, persistence, business models ---

async function onboardThroughModule5(overrides = {}) {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders', ...overrides.profile } });
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule2({ accessToken: token2, answers: { offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief', audienceConfirmed: 'Early-stage founders', selectedPositioning: 'Brand strategy consulting for early-stage founders.', objections: [], ...overrides.offer } });
  const token3 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule3({
    accessToken: token3,
    answers: {
      buyerDescription: 'Early-stage founders about to launch', desiredResult: { functional: 'a brand that reads as credible at launch' },
      buyingTriggers: [{ category: 'deadline', note: null }], primaryTriggerCategory: 'deadline', buyingCriteria: [{ category: 'expertise' }],
      discoveryEnvironments: ['referrals_word_of_mouth', 'google_search'], evidenceSources: ['actual_sales_conversations'], objections: [], ...overrides.discovery,
    },
  });
  const token4 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule4({ accessToken: token4, answers: { marketingHoursPerWeek: 8, feasibleFormats: ['writing_articles', 'live_conversation_networking'], existingAssets: [], hardConstraints: [], ...overrides.channel } });
  const token5 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule5({ accessToken: token5, answers: { selectedCoreMessage: 'Brand strategy consulting for early-stage founders who need clarity before launch.', coreMessageOptions: [] } });
}

function fullModule6Answers(overrides = {}) {
  return { conversionDestinations: [{ type: 'inquiry_contact_form', detail: null }], mobileStatus: 'likely', followUpMechanism: 'email', ...overrides };
}

test('Module 5 state prepopulates Module 6 via getModule6Context, no Module 1-5 answers re-requested', async () => {
  await onboardThroughModule5();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const ctx = await getModule6Context(token);
  assert.equal(ctx.ok, true);
  assert.equal(ctx.existingSalesPathPlan, null);
});

test('Module 6 requires Module 5 to be complete first', async () => {
  const token = signAccessToken({ customerId: 999992, email: 'no-module5@example.com' });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'X', price: 100, audience: 'Y' } });
  const token2 = signAccessToken({ customerId: 999992, email: 'no-module5@example.com' });
  await submitModule2({ accessToken: token2, answers: { offerConfirmed: 'X', whatTheyGet: 'Y', audienceConfirmed: 'Z', selectedPositioning: 'X for Z.', objections: [] } });
  const token3 = signAccessToken({ customerId: 999992, email: 'no-module5@example.com' });
  await submitModule3({ accessToken: token3, answers: { buyerDescription: 'Z', desiredResult: { functional: 'W' }, buyingTriggers: [{ category: 'deadline', note: null }], primaryTriggerCategory: 'deadline', buyingCriteria: [{ category: 'expertise' }], discoveryEnvironments: ['google_search'], evidenceSources: ['reviews'] } });
  const token4 = signAccessToken({ customerId: 999992, email: 'no-module5@example.com' });
  await submitModule4({ accessToken: token4, answers: { marketingHoursPerWeek: 5, feasibleFormats: ['writing_articles'], existingAssets: [], hardConstraints: [] } });
  const token5 = signAccessToken({ customerId: 999992, email: 'no-module5@example.com' });
  const result = await getModule6Context(token5);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module5_not_complete');
  await rm(memberDir('customer-999992'), { recursive: true, force: true });
});

test('submitModule6 rejects when no conversion destination is selected', async () => {
  await onboardThroughModule5();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule6({ accessToken: token, answers: fullModule6Answers({ conversionDestinations: [] }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_conversion_destinations');
});

test('submitModule6 accepts "not set up yet" as a valid, honest destination answer', async () => {
  await onboardThroughModule5();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule6({ accessToken: token, answers: fullModule6Answers({ conversionDestinations: [{ type: 'not_set_up_yet', detail: null }] }) });
  assert.equal(result.ok, true);
  assert.equal(result.results.salesPath.conversionGap.category, 'no_inquiry_path');
});

test('Test 34: the existing authenticated customer flow works end to end for a marketplace-first business: onboarding -> 2 -> 3 -> 4 -> 5 -> 6 -> reload', async () => {
  await onboardThroughModule5({
    profile: { route: 'marketplace_first', offer: 'Handmade earrings', price: 28, audience: 'Gift shoppers' },
    offer: { offerConfirmed: 'Handmade earrings', audienceConfirmed: 'Gift shoppers', selectedPositioning: 'Handmade earrings for gift shoppers.' },
    discovery: { buyerDescription: 'People buying a gift for someone else', desiredResult: { functional: 'a gift that feels thoughtful and unique' }, discoveryEnvironments: ['etsy', 'pinterest'], primaryTriggerCategory: 'gift_need', buyingTriggers: [{ category: 'gift_need', note: null }], evidenceSources: ['actual_sales_conversations', 'reviews'] },
    channel: { feasibleFormats: ['photography_images', 'graphics_design'], existingAssets: [{ type: 'marketplace_listings_sales', level: 'real_traction', detail: '12 real sales' }] },
  });
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule6({ accessToken: token, answers: fullModule6Answers({ conversionDestinations: [{ type: 'marketplace_listing', detail: null }] }) });
  assert.equal(submitResult.ok, true);
  assert.equal(submitResult.results.businessType.route, 'marketplace_first');
  assert.equal(submitResult.results.salesPath.conversionApproach.approach, 'marketplace_native');

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule6ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.salesPath.pathType, 'Marketplace');
});
