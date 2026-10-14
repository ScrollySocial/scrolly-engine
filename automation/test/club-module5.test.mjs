/**
 * Focused tests for Module 5 (Give Them a Reason to Pay Attention / the
 * Messaging & Content Builder): Core Message generation, Message Angles,
 * Content Role prioritization, the Channel -> Message Map (built from
 * Module 4's ACTUAL persisted schema), the Proof Plan, Objection Messaging,
 * CTA strategy, the reusable Idea Generator, Starter Ideas, the Messaging
 * Experiment, and the safety/claims guardrails. No network, no LLM --
 * every generator here is deterministic, so the safety guarantees are
 * checked both structurally and via the explicit scanner.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { newOfferPlan } from '../club/lib/offer-plan-schema.mjs';
import { newDiscoveryPlan } from '../club/lib/discovery-plan-schema.mjs';
import { newChannelPlan } from '../club/lib/channel-plan-schema.mjs';
import { newMessagingPlan } from '../club/lib/messaging-plan-schema.mjs';
import { generateCoreMessageOptions } from '../club/lib/core-message-generator.mjs';
import { generateMessageAngles } from '../club/lib/message-angle-generator.mjs';
import { prioritizeContentRoles } from '../club/lib/content-role-prioritizer.mjs';
import { buildChannelMessageMap } from '../club/lib/channel-message-map-builder.mjs';
import { buildProofPlan } from '../club/lib/proof-plan-builder.mjs';
import { buildObjectionMessaging } from '../club/lib/objection-messaging-builder.mjs';
import { buildContentIdea, generateStarterIdeas } from '../club/lib/idea-generator.mjs';
import { determineMessagingExperiment } from '../club/lib/messaging-experiment.mjs';
import { scanForUnsafeClaims, isSafeCopy } from '../club/lib/messaging-safety.mjs';
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
import { getModule5Context, generateCoreMessage, submitModule5, getModule5ResultsForToken } from '../club/lib/module5-service.mjs';

const CUSTOMER_ID = 555004;
const EMAIL = 'module5-test@example.com';
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
  Object.assign(plan, {
    coreMessageOptions: ['Option A', 'Option B', 'Option C'],
    selectedCoreMessage: 'Candles for home shoppers who want their space to feel cozy.',
  }, overrides);
  return plan;
}

// --- core-message-generator.mjs ---------------------------------------------

test('Core Message uses actual customer/offer state, not generic filler', () => {
  const options = generateCoreMessageOptions({
    offer: 'Candles', buyerDescription: 'Home shoppers redecorating a living room', primaryTriggerCategory: 'desire_want',
    desiredResultFunctional: 'a room that smells and feels cozy', differentiation: { category: null, detail: null, status: 'unknown' },
    topBuyingCriteria: ['design_style'],
  });
  assert.equal(options.length, 3);
  assert.ok(options.some((o) => /home shoppers/i.test(o)));
  assert.ok(options.some((o) => /cozy/i.test(o)));
});

test('Core Message does not invent an unsupported differentiator when none is stated', () => {
  const options = generateCoreMessageOptions({
    offer: 'Candles', buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want',
    desiredResultFunctional: 'a cozy room', differentiation: { category: null, detail: null, status: 'unknown' },
    topBuyingCriteria: ['design_style'],
  });
  const joined = options.join(' ');
  assert.doesNotMatch(joined, /designed to unknown|null|undefined/i);
});

test('a stated differentiator IS reflected in the Core Message when real', () => {
  const options = generateCoreMessageOptions({
    offer: 'Candles', buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room',
    differentiation: { category: 'Materials', detail: 'Made with all-natural soy wax', status: 'stated' }, topBuyingCriteria: ['design_style'],
  });
  assert.ok(options.some((o) => /all-natural soy wax/i.test(o)));
});

test('Core Message generator never breaks on a grammatically awkward free-text differentiator (the Module 2 regression class)', () => {
  const options = generateCoreMessageOptions({
    offer: 'soaps', buyerDescription: 'healthy conscious people', primaryTriggerCategory: 'current_solution_inadequate', desiredResultFunctional: 'a gentle, truly natural soap',
    differentiation: { category: 'Materials', detail: 'Made with all-natural, locally sourced ingredients', status: 'stated' }, topBuyingCriteria: ['materials'],
  });
  for (const o of options) {
    assert.doesNotMatch(o, /is Made with/);
    assert.doesNotMatch(o, /\bis A gentle\b/);
  }
});

// --- message-angle-generator.mjs --------------------------------------------

test('Message Angles derive from actual customer state -- changing the trigger changes the angle set', () => {
  const a = generateMessageAngles({ buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room', differentiation: { status: 'unknown' }, topBuyingCriteria: ['design_style'], objections: [], proofInventory: [], module3ConfidenceKey: 'working_hypothesis' });
  const b = generateMessageAngles({ buyerDescription: 'Home shoppers', primaryTriggerCategory: 'gift_need', desiredResultFunctional: 'a cozy room', differentiation: { status: 'unknown' }, topBuyingCriteria: ['design_style'], objections: [], proofInventory: [], module3ConfidenceKey: 'working_hypothesis' });
  assert.notDeepEqual(a.map((x) => x.name), b.map((x) => x.name));
});

test('a hypothesized (stated-but-unvalidated) differentiator angle always stays Working Hypothesis, never upgraded', () => {
  const angles = generateMessageAngles({
    buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room',
    differentiation: { category: 'Materials', detail: 'Soy wax', status: 'stated' }, topBuyingCriteria: ['design_style'],
    objections: [], proofInventory: [], module3ConfidenceKey: 'evidence_backed', hasRealRevenue: true,
  });
  const diffAngle = angles.find((a) => a.sourceType === 'differentiation');
  assert.equal(diffAngle.evidenceState, 'working_hypothesis');
});

test('an observed objection produces an Evidence-Backed angle -- real buyer evidence outranks assumption', () => {
  const angles = generateMessageAngles({
    buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room',
    differentiation: { status: 'unknown' }, topBuyingCriteria: ['design_style'],
    objections: [{ type: 'Price', note: null, basis: 'observed' }], proofInventory: [], module3ConfidenceKey: 'working_hypothesis',
  });
  const objAngle = angles.find((a) => a.sourceType === 'objection_observed');
  assert.ok(objAngle);
  assert.equal(objAngle.evidenceState, 'evidence_backed');
});

test('proof existing is never upgraded past Partially Validated just because it exists', () => {
  const angles = generateMessageAngles({
    buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room',
    differentiation: { status: 'unknown' }, topBuyingCriteria: ['design_style'], objections: [],
    proofInventory: [{ type: 'Testimonials', detail: null }], module3ConfidenceKey: 'evidence_backed', hasRealRevenue: true,
  });
  const proofAngle = angles.find((a) => a.sourceType === 'proof');
  assert.notEqual(proofAngle.evidenceState, 'evidence_backed');
});

test('Message Angles return 4-6 prioritized options for a typically-populated profile, most-evidenced first', () => {
  const angles = generateMessageAngles({
    buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room',
    differentiation: { category: 'Materials', detail: 'Soy wax', status: 'stated' }, topBuyingCriteria: ['design_style', 'reviews'],
    objections: [{ type: 'Price', note: null, basis: 'observed' }], proofInventory: [{ type: 'Testimonials', detail: null }],
    module3ConfidenceKey: 'evidence_backed', hasRealRevenue: true,
  });
  assert.ok(angles.length >= 4 && angles.length <= 6);
  assert.equal(angles[0].sourceType, 'objection_observed');
});

// --- content-role-prioritizer.mjs -------------------------------------------

test('Content Roles are prioritized, not treated as equal quotas -- not every role lands on the same tier', () => {
  const roles = prioritizeContentRoles({
    primaryTriggerCategory: 'desire_want', route: 'ecommerce', startingStateKey: 'ready_to_sell', topBuyingCriteria: ['design_style'],
    proofInventoryCount: 2, hasFounderProof: false, differentiationCategory: null, objections: [], offerClarityState: 'working_hypothesis', proofTrustState: 'on_track',
  });
  assert.equal(roles.length, 7);
  const priorities = new Set(roles.map((r) => r.priority));
  assert.ok(priorities.size > 1);
});

test('a problem-driven trigger prioritizes the Problem role high; a desire-driven trigger prioritizes it low', () => {
  const problemDriven = prioritizeContentRoles({ primaryTriggerCategory: 'current_solution_inadequate', route: 'services', startingStateKey: 'ready_to_sell', topBuyingCriteria: [], proofInventoryCount: 1, objections: [], offerClarityState: 'on_track', proofTrustState: 'on_track' });
  const desireDriven = prioritizeContentRoles({ primaryTriggerCategory: 'gift_need', route: 'ecommerce', startingStateKey: 'ready_to_sell', topBuyingCriteria: [], proofInventoryCount: 1, objections: [], offerClarityState: 'on_track', proofTrustState: 'on_track' });
  assert.equal(problemDriven.find((r) => r.role === 'problem').priority, 'high');
  assert.equal(desireDriven.find((r) => r.role === 'problem').priority, 'low');
});

test('no proof at all raises Proof & Process priority for an early-stage business, rather than lowering it', () => {
  const noProof = prioritizeContentRoles({ primaryTriggerCategory: 'desire_want', route: 'ecommerce', startingStateKey: 'starting_from_zero', topBuyingCriteria: [], proofInventoryCount: 0, objections: [], offerClarityState: 'working_hypothesis', proofTrustState: 'insufficient_data' });
  assert.equal(noProof.find((r) => r.role === 'proof_process').priority, 'high');
});

test('a hypothesized-only objection produces Medium priority for the Objection role, never High -- it must not dominate', () => {
  const hypothesisOnly = prioritizeContentRoles({ primaryTriggerCategory: 'desire_want', route: 'ecommerce', startingStateKey: 'ready_to_sell', topBuyingCriteria: [], proofInventoryCount: 1, objections: [{ type: 'Price', basis: 'hypothesis' }], offerClarityState: 'on_track', proofTrustState: 'on_track' });
  assert.equal(hypothesisOnly.find((r) => r.role === 'objection').priority, 'medium');
});

test('an observed objection produces High priority for the Objection role', () => {
  const observed = prioritizeContentRoles({ primaryTriggerCategory: 'desire_want', route: 'ecommerce', startingStateKey: 'ready_to_sell', topBuyingCriteria: [], proofInventoryCount: 1, objections: [{ type: 'Price', basis: 'observed' }], offerClarityState: 'on_track', proofTrustState: 'on_track' });
  assert.equal(observed.find((r) => r.role === 'objection').priority, 'high');
});

test('a simple local/marketplace business gets Low priority on Story & Perspective by default (spec\'s own named example)', () => {
  const roles = prioritizeContentRoles({ primaryTriggerCategory: 'urgent_practical_need', route: 'local_hybrid', startingStateKey: 'ready_to_sell', topBuyingCriteria: [], proofInventoryCount: 1, differentiationCategory: null, hasFounderProof: false, objections: [], offerClarityState: 'on_track', proofTrustState: 'on_track' });
  assert.equal(roles.find((r) => r.role === 'story_perspective').priority, 'low');
});

// --- channel-message-map-builder.mjs (respects Module 4's ACTUAL Channel Jobs) ---

test('the Channel Message Map uses Module 4\'s actual channel/job verbatim, never a re-derived one', () => {
  const map = buildChannelMessageMap({
    channels: [{ key: 'google_search', label: 'Google Search', job: 'intent_capture' }],
    feasibleFormats: ['writing_articles'], coreMessage: 'A test core message.', angles: [],
  });
  assert.equal(map[0].channel, 'Google Search');
  assert.equal(map[0].job, 'intent_capture');
});

test('different Channel Jobs produce meaningfully different messaging guidance (priority roles and CTA category both differ)', () => {
  const map = buildChannelMessageMap({
    channels: [
      { key: 'instagram', label: 'Instagram', job: 'discovery' },
      { key: 'email_newsletters', label: 'Email / owned audience', job: 'follow_up' },
    ],
    feasibleFormats: ['short_form_video', 'writing_articles'], coreMessage: 'A test core message.', angles: [],
  });
  const [discoveryEntry, followUpEntry] = map;
  assert.notDeepEqual(discoveryEntry.priorityRoles.map((r) => r.role), followUpEntry.priorityRoles.map((r) => r.role));
  assert.notEqual(discoveryEntry.ctaCategory, followUpEntry.ctaCategory);
  assert.notEqual(discoveryEntry.whatToCommunicate, followUpEntry.whatToCommunicate);
});

test('suitable formats reflect the owner\'s actual feasible formats intersected with the channel\'s real requirements', () => {
  const withFormat = buildChannelMessageMap({ channels: [{ key: 'youtube', label: 'YouTube', job: 'education' }], feasibleFormats: ['long_form_video', 'talking_head_video'], coreMessage: 'X', angles: [] });
  const withoutFormat = buildChannelMessageMap({ channels: [{ key: 'youtube', label: 'YouTube', job: 'education' }], feasibleFormats: ['writing_articles'], coreMessage: 'X', angles: [] });
  assert.ok(withFormat[0].suitableFormats.includes('long_form_video'));
  assert.equal(withoutFormat[0].suitableFormats.length, 0);
});

test('a channel needing no specific production (e.g. a marketplace listing) still gets a sensible suitable-format suggestion from what the owner can do', () => {
  const map = buildChannelMessageMap({ channels: [{ key: 'etsy', label: 'Etsy', job: 'marketplace_discovery' }], feasibleFormats: ['photography_images'], coreMessage: 'X', angles: [] });
  assert.ok(map[0].suitableFormats.includes('photography_images'));
});

test('CTA direction adapts to Channel Job', () => {
  const map = buildChannelMessageMap({
    channels: [
      { key: 'google_search', label: 'Google Search', job: 'intent_capture' },
      { key: 'referrals_word_of_mouth', label: 'Referrals / word of mouth', job: 'referral' },
      { key: 'email_newsletters', label: 'Email', job: 'conversion_support' },
    ],
    feasibleFormats: [], coreMessage: 'X', angles: [],
  });
  const categories = map.map((m) => m.ctaCategory);
  assert.equal(new Set(categories).size, categories.length); // all distinct here
});

// --- proof-plan-builder.mjs --------------------------------------------------

test('existing proof is reused directly without becoming a false performance claim', () => {
  const plan = buildProofPlan({ proofInventory: [{ type: 'Testimonials', detail: 'from real customers' }], route: 'ecommerce' });
  assert.equal(plan.existingProof.length, 1);
  assert.equal(plan.existingProof[0].type, 'Testimonials');
  assert.doesNotMatch(plan.existingProof[0].howToUse, /proves|guarantees|always works/i);
  assert.equal(plan.proofToBuild.length, 0);
});

test('missing proof does not block an early-stage business from marketing -- legitimate alternatives are suggested', () => {
  const plan = buildProofPlan({ proofInventory: [], route: 'services' });
  assert.equal(plan.existingProof.length, 0);
  assert.ok(plan.proofToBuild.length > 0);
  assert.ok(!plan.proofToBuild.some((p) => /testimonial|review/i.test(p))); // never suggests fabricating what doesn't exist
});

test('proof-to-build suggestions adapt by business model', () => {
  const ecom = buildProofPlan({ proofInventory: [], route: 'ecommerce' });
  const services = buildProofPlan({ proofInventory: [], route: 'services' });
  assert.notDeepEqual(ecom.proofToBuild, services.proofToBuild);
});

// --- objection-messaging-builder.mjs -----------------------------------------

test('observed and hypothesized objections remain distinct through Objection Messaging', () => {
  const messaging = buildObjectionMessaging([
    { type: 'Price', note: null, basis: 'observed' },
    { type: 'Trust', note: null, basis: 'hypothesis' },
  ]);
  assert.equal(messaging.find((m) => m.objection === 'Price').basis, 'observed');
  assert.equal(messaging.find((m) => m.objection === 'Trust').basis, 'hypothesis');
});

test('objection messaging never PRESCRIBES discounting, urgency, or guarantees -- it may name "discounting" only as something to avoid doing automatically', () => {
  const messaging = buildObjectionMessaging([{ type: 'Price', note: null, basis: 'hypothesis' }]);
  const violations = scanForUnsafeClaims(messaging[0].messageDirection);
  assert.deepEqual(violations, []);
  assert.doesNotMatch(messaging[0].messageDirection, /^(discount|lower (the |your )?price)|\blimited time\b|\bact now\b|money[- ]back guarantee/i);
  // the spec's own canonical example direction explicitly tells the owner NOT to discount automatically -- that mention is safe, a command TO discount would not be.
  assert.match(messaging[0].messageDirection, /before discounting or changing the offer/i);
});

test('a custom, free-typed objection still receives a safe generic direction rather than crashing or inventing a claim', () => {
  const messaging = buildObjectionMessaging([{ type: 'Worried it will smell too strong', note: null, basis: 'hypothesis' }]);
  assert.equal(messaging.length, 1);
  assert.ok(messaging[0].messageDirection.length > 0);
  assert.deepEqual(scanForUnsafeClaims(messaging[0].messageDirection), []);
});

// --- idea-generator.mjs: the reusable formula -------------------------------

test('the Idea Generator combines real customer-specific state, not a generic template', () => {
  const idea = buildContentIdea({
    role: 'problem', buyerDescription: 'Home shoppers redecorating a living room', primaryTriggerCategory: 'desire_want',
    desiredResultFunctional: 'a cozy room', angle: null, channelLabel: 'Instagram', ctaLabel: 'Discover',
  });
  assert.match(idea.idea, /home shoppers redecorating a living room/i);
  assert.equal(idea.channel, 'Instagram');
  assert.equal(idea.ctaDirection, 'Discover');
});

test('idea text never exposes ugly internal concatenation (e.g. undefined/null/[object Object])', () => {
  const idea = buildContentIdea({ role: 'offer', buyerDescription: 'Home shoppers', channelLabel: 'Instagram', ctaLabel: 'Discover' });
  assert.doesNotMatch(idea.idea, /undefined|null|\[object/i);
});

test('starter ideas are personalized to the actual business -- two different businesses produce different ideas', () => {
  const channelEntriesA = buildChannelMessageMap({ channels: [{ key: 'instagram', label: 'Instagram', job: 'discovery' }], feasibleFormats: ['short_form_video'], coreMessage: 'X', angles: [] });
  const ideasA = generateStarterIdeas({ channelEntries: channelEntriesA, angles: [], buyerDescription: 'Home shoppers redecorating a living room', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room', objections: [] });
  const ideasB = generateStarterIdeas({ channelEntries: channelEntriesA, angles: [], buyerDescription: 'Early-stage founders about to launch', primaryTriggerCategory: 'deadline', desiredResultFunctional: 'a credible brand', objections: [] });
  assert.notDeepEqual(ideasA.map((i) => i.idea), ideasB.map((i) => i.idea));
});

test('starter ideas are bounded to 10-15', () => {
  const channelEntries = buildChannelMessageMap({
    channels: [{ key: 'instagram', label: 'Instagram', job: 'discovery' }, { key: 'google_search', label: 'Google Search', job: 'intent_capture' }],
    feasibleFormats: ['short_form_video', 'writing_articles'], coreMessage: 'X', angles: [],
  });
  const ideas = generateStarterIdeas({ channelEntries, angles: [], buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room', objections: [{ type: 'Price', basis: 'observed' }] });
  assert.ok(ideas.length >= 10 && ideas.length <= 15);
});

test('starter ideas never claim current trend knowledge and are never a 30-day calendar', () => {
  const channelEntries = buildChannelMessageMap({ channels: [{ key: 'instagram', label: 'Instagram', job: 'discovery' }], feasibleFormats: ['short_form_video'], coreMessage: 'X', angles: [] });
  const ideas = generateStarterIdeas({ channelEntries, angles: [], buyerDescription: 'Home shoppers', primaryTriggerCategory: 'desire_want', desiredResultFunctional: 'a cozy room', objections: [] });
  const serialized = JSON.stringify(ideas);
  assert.doesNotMatch(serialized, /trending|this week|right now on|day 1|day 2|30.day/i);
});

// --- messaging-experiment.mjs ------------------------------------------------

test('Messaging Experiment adapts to evidence state: an observed objection produces an objection-testing experiment', () => {
  const exp = determineMessagingExperiment({ primaryChannelLabel: 'Instagram', observedObjection: { type: 'Price' }, customerLanguageHypotheses: [], angles: [], startingStateKey: 'ready_to_sell' });
  assert.match(exp, /"Price"/);
});

test('Messaging Experiment adapts to channel: different primary channel labels appear verbatim in the experiment', () => {
  const a = determineMessagingExperiment({ primaryChannelLabel: 'Etsy', observedObjection: null, customerLanguageHypotheses: [], angles: [{ name: 'A' }, { name: 'B' }], startingStateKey: 'ready_to_sell' });
  const b = determineMessagingExperiment({ primaryChannelLabel: 'Google Search', observedObjection: null, customerLanguageHypotheses: [], angles: [{ name: 'A' }, { name: 'B' }], startingStateKey: 'ready_to_sell' });
  assert.match(a, /Etsy/);
  assert.match(b, /Google Search/);
  assert.notEqual(a, b);
});

test('Messaging Experiment never promises revenue and never becomes a 30-day execution plan', () => {
  const exp = determineMessagingExperiment({ primaryChannelLabel: 'Instagram', observedObjection: null, customerLanguageHypotheses: [], angles: [], startingStateKey: 'starting_from_zero' });
  assert.doesNotMatch(exp, /\$1,?000|30.day|guarantee/i);
});

// --- messaging-safety.mjs: the explicit guardrail scanner -------------------

test('scanForUnsafeClaims flags an unsupported health/efficacy claim', () => {
  assert.ok(!isSafeCopy('Clear your acne naturally with this soap.'));
  assert.ok(scanForUnsafeClaims('This treats your skin condition.').length > 0);
});

test('scanForUnsafeClaims does not false-positive on safe, honest copy', () => {
  assert.ok(isSafeCopy('Show the real process behind how this soap is made.'));
  assert.ok(isSafeCopy('Made with all-natural, locally sourced ingredients.'));
});

// --- Test 22 (explicit named regression): a health-related buyer concern
// must never become an unsupported product efficacy claim anywhere in the
// full computed Module 5 result. ---------------------------------------------

test('SAFETY REGRESSION: a buyer\'s stated health concern (worried about breakouts) never becomes an unsupported efficacy claim anywhere in Module 5\'s output', () => {
  const profile = baseProfile({ route: 'ecommerce', offer: 'soaps', audience: 'healthy conscious people' });
  const offerPlan = baseOfferPlan({
    offerConfirmed: 'soaps', whatTheyGet: 'A bar of handmade natural soap, shipped to their door', audienceConfirmed: 'healthy conscious people',
    differentiation: { category: 'Materials', detail: 'Made with all-natural, locally sourced ingredients', status: 'stated' },
    selectedPositioning: 'Handmade natural soaps for health-conscious buyers.',
  });
  const discoveryPlan = baseDiscoveryPlan({
    buyerDescription: 'healthy conscious people', currentSituation: 'Worried about breakouts from harsh soaps',
    desiredResult: { functional: 'clear, calm skin without breakouts' },
    primaryTriggerCategory: 'current_solution_inadequate', buyingTriggers: [{ category: 'current_solution_inadequate', note: null }],
    buyingCriteria: [{ category: 'materials' }], discoveryEnvironments: ['instagram', 'google_search'],
    evidenceSources: ['reviews'],
  });
  const channelPlan = baseChannelPlan();
  const messagingPlan = baseMessagingPlan();

  const results = computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan);
  const serialized = JSON.stringify(results);

  const violations = scanForUnsafeClaims(serialized);
  assert.deepEqual(violations, [], `unsafe claim(s) found: ${JSON.stringify(violations)}`);
  assert.doesNotMatch(serialized, /clears? (your |their )?(skin|acne|breakouts)/i);
  assert.doesNotMatch(serialized, /cures? acne/i);
});

test('SAFETY REGRESSION: no invented testimonials or customer quotes appear anywhere', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan({ proofInventory: [] }), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  const serialized = JSON.stringify(results);
  assert.doesNotMatch(serialized, /"[A-Z][^"]{10,}"\s*[-—]\s*[A-Z]/); // no quoted, attributed sentence anywhere
});

test('SAFETY REGRESSION: no invented statistics, certifications, or scarcity/urgency appear anywhere', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  const serialized = JSON.stringify(results);
  assert.doesNotMatch(serialized, /\b\d{1,3}%\s*(of (customers|buyers|users)|off)\b/i);
  assert.doesNotMatch(serialized, /limited time|act now|only \d+ (left|spots?)/i);
});

// --- module5.mjs: the full artifact -----------------------------------------

test('Your $1K Messaging & Content Plan contains the correct structured output', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  const plan = results.messagingContentPlan;
  assert.equal(plan.coreMessage, baseMessagingPlan().selectedCoreMessage);
  assert.ok(plan.topMessageAngles.length >= 1);
  assert.equal(plan.contentPriorities.length, 7);
  assert.ok(plan.channelMessageMap.length >= 1);
  assert.ok(plan.proofPlan);
  assert.ok(Array.isArray(plan.objectionsToAddress));
  assert.ok(Array.isArray(plan.ctaStrategy));
  assert.ok(plan.reusableIdeaFormula.formula);
  assert.ok(plan.starterIdeas.length >= 10);
  assert.ok(plan.firstMessagingExperiment);
  assert.equal(results.moduleProgress.current, 5);
  assert.equal(results.moduleProgress.total, 7);
  assert.ok(results.confidence);
});

test('Test 1: Module 4 state correctly prepopulates the carried-forward context using Module 4\'s ACTUAL field names', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  const m4 = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  assert.equal(results.carriedForward.module4.primaryChannel, m4.channelPlan.primaryChannel);
  assert.equal(results.carriedForward.module4.primaryJob, m4.channelPlan.primaryJob);
  assert.equal(results.carriedForward.module4.secondaryChannel, m4.channelPlan.secondaryChannel);
  assert.equal(results.carriedForward.module4.compoundingAsset, m4.channelPlan.compoundingAsset);
  assert.deepEqual(results.carriedForward.module4.notNow, m4.channelPlan.notNow);
  assert.deepEqual(results.carriedForward.module4.earlyEvidence, m4.channelPlan.earlyEvidence);
  assert.equal(results.carriedForward.module4.channelStrategy, m4.channelPlan.strategySynthesis);
  assert.equal(results.carriedForward.module4.channelExperiment, m4.channelPlan.channelExperiment);
  assert.deepEqual(results.carriedForward.module4.channelConfidence, m4.confidence);
});

test('the Channel Message Map is built from Module 4\'s ACTUAL selected channels, never a re-derived channel list', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  const m4 = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  const mapChannels = results.messagingContentPlan.channelMessageMap.map((c) => c.channel);
  assert.ok(mapChannels.includes(m4.channelPlan.primaryChannel));
  if (m4.channelPlan.secondaryChannelKey) assert.ok(mapChannels.includes(m4.channelPlan.secondaryChannel));
});

test('a channel serving both Primary and Compounding roles is not duplicated in the Channel Message Map', () => {
  const results = computeModule5Results(
    baseProfile({ route: 'marketplace_first' }), baseOfferPlan(), baseDiscoveryPlan({ discoveryEnvironments: ['etsy'] }), baseChannelPlan(), baseMessagingPlan()
  );
  const keys = results.messagingContentPlan.channelMessageMap.map((c) => c.channelKey);
  assert.equal(new Set(keys).size, keys.length);
});

test('Module 5 completion points to Module 6, never Module 7 or a 30-day plan', () => {
  const results = computeModule5Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan(), baseMessagingPlan());
  assert.equal(results.nextClubStep.moduleLabel, 'Module 6 — Turn Attention Into Sales');
  const copy = results.nextClubStep.transition + ' ' + results.nextClubStep.cta;
  assert.doesNotMatch(copy, /module 7|30.day/i);
});

test('Modules 1-4 remain functional after Module 5 is added', () => {
  const profile = baseProfile();
  assert.equal(computeModule1Results(profile).moduleProgress.current, 1);
  const m2 = computeModule2Results(profile, baseOfferPlan());
  assert.equal(m2.nextClubStep.moduleLabel, 'Module 3 — Find the People Most Likely to Buy It');
  const m3 = computeModule3Results(profile, baseOfferPlan(), baseDiscoveryPlan());
  assert.equal(m3.nextClubStep.moduleLabel, 'Module 4 — Choose How People Will Find You');
  const m4 = computeModule4Results(profile, baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  assert.equal(m4.nextClubStep.moduleLabel, 'Module 5 — Give Them a Reason to Pay Attention');
});

// --- module5-service.mjs: gating, generation, persistence, multiple business models ---

async function onboardThroughModule4(overrides = {}) {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders', ...overrides.profile } });
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule2({
    accessToken: token2,
    answers: { offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief', audienceConfirmed: 'Early-stage founders', selectedPositioning: 'Brand strategy consulting for early-stage founders.', objections: [], ...overrides.offer },
  });
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
}

test('Module 4 state prepopulates Module 5 via getModule5Context, and no Module 1-4 answers are re-requested', async () => {
  await onboardThroughModule4();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const ctx = await getModule5Context(token);
  assert.equal(ctx.ok, true);
  assert.equal(ctx.offer, 'Brand strategy consulting');
  assert.equal(ctx.existingMessagingPlan, null);
});

test('Module 5 requires Module 4 to be complete first', async () => {
  const token = signAccessToken({ customerId: 999991, email: 'no-module4@example.com' });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'X', price: 100, audience: 'Y' } });
  const token2 = signAccessToken({ customerId: 999991, email: 'no-module4@example.com' });
  await submitModule2({ accessToken: token2, answers: { offerConfirmed: 'X', whatTheyGet: 'Y', audienceConfirmed: 'Z', selectedPositioning: 'X for Z.', objections: [] } });
  const token3 = signAccessToken({ customerId: 999991, email: 'no-module4@example.com' });
  await submitModule3({ accessToken: token3, answers: { buyerDescription: 'Z', desiredResult: { functional: 'W' }, buyingTriggers: [{ category: 'deadline', note: null }], primaryTriggerCategory: 'deadline', buyingCriteria: [{ category: 'expertise' }], discoveryEnvironments: ['google_search'], evidenceSources: ['reviews'] } });
  const token4 = signAccessToken({ customerId: 999991, email: 'no-module4@example.com' });
  const result = await getModule5Context(token4);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module4_not_complete');
  await rm(memberDir('customer-999991'), { recursive: true, force: true });
});

test('generateCoreMessage produces 3 real options built from stored state, with no new customer answers required', async () => {
  await onboardThroughModule4();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const gen = await generateCoreMessage({ accessToken: token });
  assert.equal(gen.ok, true);
  assert.equal(gen.coreMessageOptions.length, 3);
  assert.ok(gen.coreMessageOptions.some((o) => /early-stage founders/i.test(o)));
});

test('customer can select one of the 3 generated Core Message options verbatim', async () => {
  await onboardThroughModule4();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const gen = await generateCoreMessage({ accessToken: token });
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule5({ accessToken: token2, answers: { selectedCoreMessage: gen.coreMessageOptions[0], coreMessageOptions: gen.coreMessageOptions } });
  assert.equal(result.ok, true);
  assert.equal(result.results.messagingContentPlan.coreMessage, gen.coreMessageOptions[0]);
});

test('customer can write their own fully custom Core Message, which persists verbatim', async () => {
  await onboardThroughModule4();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const custom = 'Founders trust us because we make branding feel simple before a launch.';
  const result = await submitModule5({ accessToken: token, answers: { selectedCoreMessage: custom, coreMessageOptions: [] } });
  assert.equal(result.ok, true);
  assert.equal(result.results.messagingContentPlan.coreMessage, custom);
});

test('submitModule5 rejects an empty Core Message', async () => {
  await onboardThroughModule4();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule5({ accessToken: token, answers: { selectedCoreMessage: '   ' } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_core_message');
});

test('Test 28: the existing authenticated customer flow works end to end for a marketplace-first business: onboarding -> Module 2 -> 3 -> 4 -> 5 -> reload', async () => {
  await onboardThroughModule4({
    profile: { route: 'marketplace_first', offer: 'Handmade earrings', price: 28, audience: 'Gift shoppers' },
    offer: { offerConfirmed: 'Handmade earrings', audienceConfirmed: 'Gift shoppers', selectedPositioning: 'Handmade earrings for gift shoppers.' },
    discovery: { buyerDescription: 'People buying a gift for someone else', desiredResult: { functional: 'a gift that feels thoughtful and unique' }, discoveryEnvironments: ['etsy', 'pinterest'], primaryTriggerCategory: 'gift_need', buyingTriggers: [{ category: 'gift_need', note: null }], evidenceSources: ['actual_sales_conversations', 'reviews'] },
    channel: { feasibleFormats: ['photography_images', 'graphics_design'], existingAssets: [{ type: 'marketplace_listings_sales', level: 'real_traction', detail: '12 real sales' }] },
  });
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const gen = await generateCoreMessage({ accessToken: token });
  assert.equal(gen.ok, true);
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule5({ accessToken: token2, answers: { selectedCoreMessage: gen.coreMessageOptions[0], coreMessageOptions: gen.coreMessageOptions } });
  assert.equal(submitResult.ok, true);
  assert.equal(submitResult.results.businessType.route, 'marketplace_first');
  assert.ok(submitResult.results.messagingContentPlan.channelMessageMap.some((c) => c.channel === 'Etsy'));

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule5ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.messagingContentPlan.coreMessage, gen.coreMessageOptions[0]);
});
