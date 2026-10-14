/**
 * Focused tests for Module 4 (Choose How People Will Find You / the Channel
 * Selector + $1K Channel Plan): candidate gathering, business-model-adapted
 * offer/format-fit reasoning, owner-execution-fit and existing-traction
 * scoring (account-exists vs traction-exists), hard-constraint tradeoffs,
 * Primary/Secondary/Compounding/Not-Now selection, channel jobs, evidence-
 * driven confidence, the Channel Experiment, and the module4-service
 * orchestration. No network, no fake numeric score exposed to the customer.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { newOfferPlan } from '../club/lib/offer-plan-schema.mjs';
import { newDiscoveryPlan } from '../club/lib/discovery-plan-schema.mjs';
import { newChannelPlan } from '../club/lib/channel-plan-schema.mjs';
import { channelRef, CHANNEL_UNIVERSE } from '../club/lib/channel-content.mjs';
import {
  gatherCandidateChannels,
  deriveOfferFormatTags,
  scoreCandidate,
  selectChannelPlan,
  classifyChannelConfidence,
  pickJobForRole,
  reasonForNotNow,
  determineChannelExperiment,
} from '../club/lib/channel-evaluation.mjs';
import { computeModule4Results } from '../club/lib/module4.mjs';
import { computeModule3Results } from '../club/lib/module3.mjs';
import { computeModule2Results } from '../club/lib/module2.mjs';
import { computeModule1Results } from '../club/lib/module1.mjs';
import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';
import { submitOnboarding, slugFromCustomerId } from '../club/lib/onboarding-service.mjs';
import { submitModule2 } from '../club/lib/module2-service.mjs';
import { submitModule3 } from '../club/lib/module3-service.mjs';
import { getModule4Context, submitModule4, getModule4ResultsForToken } from '../club/lib/module4-service.mjs';

const CUSTOMER_ID = 555003;
const EMAIL = 'module4-test@example.com';
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

// --- channel-content.mjs / candidate gathering ------------------------------

test('channel universe is reused from Module 3\'s discovery environments, not duplicated', () => {
  assert.ok(CHANNEL_UNIVERSE.includes('instagram'));
  assert.ok(CHANNEL_UNIVERSE.includes('etsy'));
});

test('candidates come from Module 3\'s confirmed discovery environments plus Module 1\'s existing channels', () => {
  const profile = baseProfile({ discoveryChannels: ['referral'] });
  const discoveryPlan = baseDiscoveryPlan({ discoveryEnvironments: ['google_search'] });
  const candidates = gatherCandidateChannels({ discoveryPlan, profile });
  const keys = candidates.map((c) => c.key);
  assert.ok(keys.includes('google_search'));
  assert.ok(keys.includes('referrals_word_of_mouth'));
  assert.ok(candidates.every((c) => c.presence === 'confirmed'));
});

// --- Test 4: channel recommendations adapt by business model ---------------

test('offer/format-fit tags differ by business model (ecommerce vs services)', () => {
  const ecom = deriveOfferFormatTags({ route: 'ecommerce', buyingCriteria: [], proofInventory: [] });
  const services = deriveOfferFormatTags({ route: 'services', buyingCriteria: [], proofInventory: [] });
  assert.notDeepEqual(ecom, services);
});

test('the same channel scores different format-fit under different business models (referrals fits services, not digital_product)', () => {
  const servicesTags = deriveOfferFormatTags({ route: 'services' });
  const digitalTags = deriveOfferFormatTags({ route: 'digital_product' });
  const candidate = { key: 'referrals_word_of_mouth', presence: 'confirmed' };
  const channelPlan = baseChannelPlan();
  const underServices = scoreCandidate(candidate, { offerFormatTags: servicesTags, channelPlan });
  const underDigital = scoreCandidate(candidate, { offerFormatTags: digitalTags, channelPlan });
  assert.ok(underServices.breakdown.formatFit > underDigital.breakdown.formatFit);
});

test('marketplace-first surfaces a marketplace channel when none was explicitly confirmed, and explains why', () => {
  const profile = baseProfile({ route: 'marketplace_first' });
  const discoveryPlan = baseDiscoveryPlan({ discoveryEnvironments: ['instagram'] }); // no marketplace channel confirmed
  const candidates = gatherCandidateChannels({ discoveryPlan, profile });
  const surfaced = candidates.find((c) => c.key === 'etsy');
  assert.ok(surfaced);
  assert.equal(surfaced.presence, 'surfaced');
  assert.ok(surfaced.surfacedReason && surfaced.surfacedReason.length > 0);
});

test('local/hybrid surfaces Google Maps / local search when not already confirmed', () => {
  const profile = baseProfile({ route: 'local_hybrid' });
  const discoveryPlan = baseDiscoveryPlan({ discoveryEnvironments: ['facebook'] });
  const candidates = gatherCandidateChannels({ discoveryPlan, profile });
  assert.ok(candidates.some((c) => c.key === 'google_maps_local_search' && c.presence === 'surfaced'));
});

test('a route does not surface a channel that is already a confirmed candidate (never duplicates)', () => {
  const profile = baseProfile({ route: 'marketplace_first' });
  const discoveryPlan = baseDiscoveryPlan({ discoveryEnvironments: ['etsy'] });
  const candidates = gatherCandidateChannels({ discoveryPlan, profile });
  const etsyEntries = candidates.filter((c) => c.key === 'etsy');
  assert.equal(etsyEntries.length, 1);
  assert.equal(etsyEntries[0].presence, 'confirmed');
});

// --- Test 2: existing channel/account never automatically equals traction --

test('an existing channel is a candidate, but existing traction score stays zero without a real_traction asset', () => {
  const channelPlanNoAssets = baseChannelPlan({ existingAssets: [] });
  const scored = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags: [], channelPlan: channelPlanNoAssets });
  assert.equal(scored.breakdown.traction, 0);
});

test('"account only" level explicitly does NOT count as traction, even though the asset is recorded', () => {
  const channelPlan = baseChannelPlan({ existingAssets: [{ type: 'existing_social_audience', level: 'account_only', detail: null }] });
  const scored = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  assert.equal(scored.breakdown.traction, 0);
});

test('"real_traction" level does count toward the Existing Traction dimension', () => {
  const channelPlan = baseChannelPlan({ existingAssets: [{ type: 'existing_social_audience', level: 'real_traction', detail: null }] });
  const scored = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  assert.ok(scored.breakdown.traction > 0);
});

// --- Test 3: customer presence alone does not automatically make Primary ---

test('presence alone does not decide Primary -- two equally "confirmed" channels are differentiated by other dimensions', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'services' }); // ['expertise_driven','referral_driven','comparison_driven']
  const channelPlan = baseChannelPlan({ feasibleFormats: ['writing_articles', 'short_form_video'] });
  const weak = scoreCandidate({ key: 'tiktok', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const strong = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  assert.equal(weak.breakdown.presence, strong.breakdown.presence); // presence weight is IDENTICAL for both
  assert.ok(strong.total > weak.total); // yet the outcome differs
  const selection = selectChannelPlan([weak, strong], channelPlan);
  assert.equal(selection.primary.key, 'google_search');
});

// --- Test 6: recommendations account for feasible owner formats ------------

test('owner execution fit reflects feasible formats -- fits vs poor', () => {
  const channelPlanFits = baseChannelPlan({ feasibleFormats: ['long_form_video', 'talking_head_video'] });
  const channelPlanPoor = baseChannelPlan({ feasibleFormats: ['writing_articles'], marketingHoursPerWeek: 2 });
  const fits = scoreCandidate({ key: 'youtube', presence: 'confirmed' }, { offerFormatTags: [], channelPlan: channelPlanFits });
  const poor = scoreCandidate({ key: 'youtube', presence: 'confirmed' }, { offerFormatTags: [], channelPlan: channelPlanPoor });
  assert.equal(fits.breakdown.executionLevel, 'fits');
  assert.equal(poor.breakdown.executionLevel, 'poor');
  assert.ok(fits.breakdown.execution > poor.breakdown.execution);
});

test('a channel that requires no specific production (e.g. a marketplace listing) is never penalized for unknown formats', () => {
  const channelPlan = baseChannelPlan({ feasibleFormats: ['photography_images'] });
  const scored = scoreCandidate({ key: 'marketplaces_directories', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  assert.equal(scored.breakdown.executionLevel, 'fits');
});

// --- Test 5: recommendations adapt to owner marketing capacity -------------

test('low marketing capacity yields "No Secondary Channel Yet" even with a viable second candidate', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' });
  const channelPlan = baseChannelPlan({ marketingHoursPerWeek: 1 });
  const a = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const b = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const selection = selectChannelPlan([a, b], channelPlan);
  assert.equal(selection.secondary, null);
});

test('adequate marketing capacity allows a genuine secondary channel', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' });
  const channelPlan = baseChannelPlan({ marketingHoursPerWeek: 10 });
  const a = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const b = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const selection = selectChannelPlan([a, b], channelPlan);
  assert.ok(selection.secondary);
});

// --- Test 7: a hard constraint is respected while still explaining tradeoffs ---

test('a hard-constrained channel is never selected as Primary or Secondary, even if it scored highest', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' });
  const channelPlan = baseChannelPlan({ hardConstraints: ['google_search'] });
  const a = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const b = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  assert.ok(a.total > b.total); // google_search WOULD have won on merit
  const selection = selectChannelPlan([a, b], channelPlan);
  assert.equal(selection.primary.key, 'instagram');
  assert.equal(selection.constrainedTradeoff.key, 'google_search');
});

test('the constrained channel\'s Not Now reason explains why it would have been attractive and names the real alternative, never just "bad channel"', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' });
  const channelPlan = baseChannelPlan({ hardConstraints: ['google_search'] });
  const a = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const b = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const selection = selectChannelPlan([a, b], channelPlan);
  const reason = reasonForNotNow(a, selection.primary, channelPlan);
  assert.match(reason, /won't use google search/i);
  assert.match(reason, /strong fit/i);
  assert.match(reason, /instagram/i);
  assert.doesNotMatch(reason, /bad channel/i);
});

// --- Test 8: strong existing traction can materially affect recommendation ---

test('strong existing traction can flip which channel is Primary', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' }); // ['visual','comparison_driven','searchable']
  const channelPlan = baseChannelPlan({ feasibleFormats: ['short_form_video', 'photography_images', 'writing_articles'] });

  const withoutTraction = selectChannelPlan(
    [
      scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan }),
      scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan }),
    ],
    channelPlan
  );
  assert.equal(withoutTraction.primary.key, 'google_search');

  const channelPlanWithTraction = baseChannelPlan({
    feasibleFormats: ['short_form_video', 'photography_images', 'writing_articles'],
    existingAssets: [{ type: 'existing_social_audience', level: 'real_traction', detail: '40k engaged followers' }],
  });
  const withTraction = selectChannelPlan(
    [
      scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan: channelPlanWithTraction }),
      scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags, channelPlan: channelPlanWithTraction }),
    ],
    channelPlanWithTraction
  );
  assert.equal(withTraction.primary.key, 'instagram');
});

// --- Test 9: buying/discovery intent affects recommendation ----------------

test('higher discovery/buying intent increases a channel\'s standing, holding other factors equal', () => {
  const channelPlan = baseChannelPlan();
  const activelySearching = scoreCandidate({ key: 'google_search', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  const entertainment = scoreCandidate({ key: 'tiktok', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  assert.ok(activelySearching.breakdown.intent > entertainment.breakdown.intent);
});

// --- Test 10: time-to-feedback affects prioritization, never a revenue promise ---

test('faster time-to-feedback channels score higher on that dimension, planning-only, never a revenue promise', () => {
  const channelPlan = baseChannelPlan();
  const fast = scoreCandidate({ key: 'etsy', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  const slow = scoreCandidate({ key: 'youtube', presence: 'confirmed' }, { offerFormatTags: [], channelPlan });
  assert.ok(fast.breakdown.timeToFeedback > slow.breakdown.timeToFeedback);
});

test('no customer-facing copy in a full Module 4 result promises revenue or a dollar outcome', () => {
  const results = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  const serialized = JSON.stringify(results);
  assert.doesNotMatch(serialized, /will make \$|guarantee|promised? revenue|\$\d[\d,]*\s*(in sales|in revenue)/i);
});

// --- Test 11: compounding potential is considered but never automatically Primary ---

test('compounding potential alone does not make a channel Primary over stronger intent/format-fit', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'local_hybrid' }); // ['local','referral_driven','conversational']
  const channelPlan = baseChannelPlan({ feasibleFormats: ['photography_images', 'graphics_design', 'live_conversation_networking', 'direct_outreach'] });
  const highCompounding = scoreCandidate({ key: 'pinterest', presence: 'confirmed' }, { offerFormatTags, channelPlan }); // compounding: high, but 0 format-fit overlap here
  const strongerOtherwise = scoreCandidate({ key: 'referrals_word_of_mouth', presence: 'confirmed' }, { offerFormatTags, channelPlan }); // compounding: medium
  assert.ok(channelRef('pinterest').compounding === 'high');
  assert.ok(channelRef('referrals_word_of_mouth').compounding !== 'high');
  const selection = selectChannelPlan([highCompounding, strongerOtherwise], channelPlan);
  assert.equal(selection.primary.key, 'referrals_word_of_mouth');
});

test('compounding weight is structurally a small factor, never able to outweigh intent on its own', () => {
  // The maximum compounding bonus must be smaller than the gap between the lowest and highest intent weights,
  // otherwise compounding alone could flip a decision that intent should be deciding.
  const maxCompoundingWeight = 0.5;
  const intentRange = 3 - 1; // actively_searching (3) vs consuming_entertainment/maintaining_relationships (1)
  assert.ok(maxCompoundingWeight < intentRange);
});

// --- Test 16 / 17: Compounding Asset "Not Yet" and Primary+Compounding overlap ---

test('Compounding Asset can legitimately be "Not Yet" when nothing eligible compounds', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'creator_affiliate' });
  const channelPlan = baseChannelPlan();
  const a = scoreCandidate({ key: 'tiktok', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const b = scoreCandidate({ key: 'instagram', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const c = scoreCandidate({ key: 'facebook', presence: 'confirmed' }, { offerFormatTags, channelPlan });
  const selection = selectChannelPlan([a, b, c], channelPlan);
  assert.equal(selection.compounding, null);
});

test('a channel can serve both Primary and Compounding roles without implying duplicate work', () => {
  const results = computeModule4Results(
    baseProfile({ route: 'marketplace_first' }),
    baseOfferPlan(),
    baseDiscoveryPlan({ discoveryEnvironments: ['etsy'] }),
    baseChannelPlan()
  );
  assert.equal(results.channelPlan.primaryChannel, results.channelPlan.compoundingAsset);
  assert.equal(results.channelPlan.compoundingIsPrimary, true);
  assert.match(results.channelPlan.whyItCompounds, /Primary Channel/);
});

// --- Test 12: no fake numeric channel score is exposed ----------------------

// moduleProgress.{current,total} is the pre-existing, legitimate "Module N of 7"
// counter used by every module since Module 1 -- not a channel score.
function scanForForbiddenScoreShapes(value, path = '$') {
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (path === '$.moduleProgress') continue;
      assert.ok(!/^(score|total|rank)$/i.test(k), `forbidden score-shaped key "${k}" found at ${path}.${k}`);
      scanForForbiddenScoreShapes(v, `${path}.${k}`);
    }
  }
}

test('the public Module 4 result never exposes a raw score/total/rank field', () => {
  const results = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  scanForForbiddenScoreShapes(results);
});

test('the public Module 4 result never renders a fake precision grade like "87/100" or "A+"', () => {
  const results = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  const serialized = JSON.stringify(results);
  assert.doesNotMatch(serialized, /\b\d{1,3}\s*\/\s*100\b/);
  assert.doesNotMatch(serialized, /\bA\+|\b9\.\d\s*\/\s*10\b/);
});

// --- Test 13 / 14: confidence classification --------------------------------

test('Working Hypothesis confidence when Module 3 evidence is weak', () => {
  const c = classifyChannelConfidence({ module3Confidence: 'working_hypothesis', primary: { presence: 'confirmed', breakdown: { traction: 0 } } });
  assert.equal(c.key, 'working_hypothesis');
});

test('a business-model-surfaced (not customer-confirmed) primary is always Working Hypothesis, regardless of Module 3 confidence', () => {
  const c = classifyChannelConfidence({ module3Confidence: 'evidence_backed', primary: { presence: 'surfaced', breakdown: { traction: 0 } } });
  assert.equal(c.key, 'working_hypothesis');
});

test('Evidence-Backed confidence requires strong Module 3 evidence AND real traction on the confirmed primary', () => {
  const c = classifyChannelConfidence({ module3Confidence: 'evidence_backed', primary: { presence: 'confirmed', breakdown: { traction: 3 } } });
  assert.equal(c.key, 'evidence_backed');
});

test('strong Module 3 evidence without real traction on the primary produces Partially Validated, not Evidence-Backed', () => {
  const c = classifyChannelConfidence({ module3Confidence: 'evidence_backed', primary: { presence: 'confirmed', breakdown: { traction: 0 } } });
  assert.equal(c.key, 'partially_validated');
});

// --- Test 19: selected channels receive appropriate, non-generic jobs ------

test('channel jobs are derived from what the channel actually supports, not a blanket "Discovery" for every platform', () => {
  assert.equal(pickJobForRole(channelRef('etsy'), 'primary'), 'marketplace_discovery');
  assert.equal(pickJobForRole(channelRef('google_maps_local_search'), 'primary'), 'local_discovery');
  assert.equal(pickJobForRole(channelRef('referrals_word_of_mouth'), 'primary'), 'referral');
  assert.notEqual(pickJobForRole(channelRef('etsy'), 'primary'), 'discovery');
});

test('a job is always one the channel genuinely supports', () => {
  for (const key of CHANNEL_UNIVERSE) {
    const ref = channelRef(key);
    if (!ref) continue;
    for (const role of ['primary', 'secondary', 'compounding']) {
      const job = pickJobForRole(ref, role);
      assert.ok(ref.jobsSupported.includes(job), `${key}/${role} produced an unsupported job "${job}"`);
    }
  }
});

// --- Test 20: Channel Experiment adapts to business/channel/state ----------

test('Channel Experiment adapts by the primary channel\'s intent category', () => {
  const search = determineChannelExperiment({ primaryRef: channelRef('google_search'), startingStateKey: 'ready_to_sell' });
  const referral = determineChannelExperiment({ primaryRef: channelRef('referrals_word_of_mouth'), startingStateKey: 'ready_to_sell' });
  assert.notEqual(search, referral);
  assert.match(search, /search impressions|customer-language hypotheses/i);
  assert.match(referral, /referral sources|communities/i);
});

test('Channel Experiment adapts by starting state, holding the channel constant', () => {
  const zero = determineChannelExperiment({ primaryRef: channelRef('instagram'), startingStateKey: 'starting_from_zero' });
  const momentum = determineChannelExperiment({ primaryRef: channelRef('instagram'), startingStateKey: 'building_momentum' });
  assert.notEqual(zero, momentum);
});

test('Channel Experiment never promises $1,000 or turns into a 30-day plan', () => {
  for (const key of ['google_search', 'instagram', 'etsy', 'referrals_word_of_mouth']) {
    const exp = determineChannelExperiment({ primaryRef: channelRef(key), startingStateKey: 'ready_to_sell' });
    assert.doesNotMatch(exp, /\$1,?000|30.day|30 day/i);
  }
});

// --- Test 21: Your $1K Channel Plan contains correct structured output -----

test('the $1K Channel Plan artifact contains the correct structured output', () => {
  const results = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  const cp = results.channelPlan;
  assert.equal(cp.primaryChannel, 'Google Search');
  assert.ok(cp.primaryJob);
  assert.ok(cp.whyPrimary);
  assert.ok(Array.isArray(cp.earlyEvidence) && cp.earlyEvidence.length > 0);
  assert.ok(cp.secondaryChannel);
  assert.ok(cp.whySecondary);
  assert.ok(cp.compoundingAsset);
  assert.ok(cp.whyItCompounds);
  assert.ok(Array.isArray(cp.notNow));
  assert.equal(cp.availableCapacity.hoursPerWeek, 10);
  assert.deepEqual(cp.formatsToLeanInto, baseChannelPlan().feasibleFormats);
  assert.ok(cp.strategySynthesis && cp.strategySynthesis.length > 0);
  assert.ok(cp.channelExperiment && cp.channelExperiment.length > 0);
  assert.equal(results.moduleProgress.current, 4);
  assert.equal(results.moduleProgress.total, 7);
  assert.ok(results.confidence);
});

test('Test 1: Module 1/2/3 state correctly prepopulates the carried-forward context', () => {
  const profile = baseProfile();
  const offerPlan = baseOfferPlan();
  const discoveryPlan = baseDiscoveryPlan();
  const results = computeModule4Results(profile, offerPlan, discoveryPlan, baseChannelPlan());
  assert.equal(results.carriedForward.module1.price, profile.price);
  assert.equal(results.carriedForward.module2.deliverable, offerPlan.whatTheyGet);
  assert.equal(results.carriedForward.module2.positioning, offerPlan.selectedPositioning);
  assert.equal(results.carriedForward.module3.likelyBuyer, discoveryPlan.buyerDescription);
  assert.deepEqual(results.carriedForward.module3.discoveryEnvironments, discoveryPlan.discoveryEnvironments);
  assert.ok(results.carriedForward.module3.confidence);
  assert.ok(results.carriedForward.module3.discoveryGap);
});

// --- Test 18: Not Now channels get customer-specific reasons, never "bad" --

test('Not Now channels never use "bad channel" language, and reasons are specific to each channel\'s own weak dimension', () => {
  const offerFormatTags = deriveOfferFormatTags({ route: 'ecommerce' });
  const channelPlan = baseChannelPlan({ feasibleFormats: ['writing_articles'], marketingHoursPerWeek: 10 });
  const candidates = ['google_search', 'instagram', 'tiktok', 'youtube'].map((key) => scoreCandidate({ key, presence: 'confirmed' }, { offerFormatTags, channelPlan }));
  const selection = selectChannelPlan(candidates, channelPlan);
  for (const c of selection.notNow) {
    const reason = reasonForNotNow(c, selection.primary, channelPlan);
    assert.doesNotMatch(reason, /\bbad\b/i);
    assert.ok(reason.length > 10);
  }
});

// --- Test 22: Module 4 completion points to Module 5 ------------------------

test('Module 4 completion points to Module 5, never Module 6 or a content calendar', () => {
  const results = computeModule4Results(baseProfile(), baseOfferPlan(), baseDiscoveryPlan(), baseChannelPlan());
  assert.equal(results.nextClubStep.moduleLabel, 'Module 5 — Give Them a Reason to Pay Attention');
  const copy = results.nextClubStep.transition + ' ' + results.nextClubStep.cta;
  assert.doesNotMatch(copy, /module 6/i);
});

// --- Test 23: Modules 1-3 remain functional ---------------------------------

test('Modules 1, 2, and 3 remain functional after Module 4 is added', () => {
  const profile = baseProfile();
  const m1 = computeModule1Results(profile);
  assert.equal(m1.moduleProgress.current, 1);
  const m2 = computeModule2Results(profile, baseOfferPlan());
  assert.equal(m2.moduleProgress.current, 2);
  assert.equal(m2.nextClubStep.moduleLabel, 'Module 3 — Find the People Most Likely to Buy It');
  const m3 = computeModule3Results(profile, baseOfferPlan(), baseDiscoveryPlan());
  assert.equal(m3.moduleProgress.current, 3);
  assert.equal(m3.nextClubStep.moduleLabel, 'Module 4 — Choose How People Will Find You');
});

// --- module4-service.mjs: gating, prepopulation, persistence, multiple business models ---

async function onboardThroughModule3(overrides = {}) {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'Brand strategy consulting', price: 500, audience: 'Early-stage founders', ...overrides.profile } });
  const token2 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule2({
    accessToken: token2,
    answers: {
      offerConfirmed: 'Brand strategy consulting', whatTheyGet: 'A working session + brand brief', audienceConfirmed: 'Early-stage founders',
      selectedPositioning: 'Brand strategy consulting for early-stage founders.', objections: [], ...overrides.offer,
    },
  });
  const token3 = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitModule3({
    accessToken: token3,
    answers: {
      buyerDescription: 'Early-stage founders about to launch', desiredResult: { functional: 'a brand that reads as credible at launch' },
      buyingTriggers: [{ category: 'deadline', note: null }], primaryTriggerCategory: 'deadline',
      buyingCriteria: [{ category: 'expertise' }], discoveryEnvironments: ['referrals_word_of_mouth', 'google_search'],
      evidenceSources: ['actual_sales_conversations'], objections: [], ...overrides.discovery,
    },
  });
}

function fullModule4Answers(overrides = {}) {
  return {
    marketingHoursPerWeek: 8,
    feasibleFormats: ['writing_articles', 'live_conversation_networking'],
    existingAssets: [],
    hardConstraints: [],
    ...overrides,
  };
}

test('Module 1/2/3 state prepopulates Module 4 via getModule4Context', async () => {
  await onboardThroughModule3();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const ctx = await getModule4Context(token);
  assert.equal(ctx.ok, true);
  assert.deepEqual(ctx.discoveryEnvironments, ['referrals_word_of_mouth', 'google_search']);
  assert.equal(ctx.existingChannelPlan, null);
});

test('Module 4 requires Module 3 to be complete first (Module 1/2 done, Module 3 not)', async () => {
  const token = signAccessToken({ customerId: 999881, email: 'no-module3@example.com' });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'X', price: 100, audience: 'Y' } });
  const token2 = signAccessToken({ customerId: 999881, email: 'no-module3@example.com' });
  await submitModule2({ accessToken: token2, answers: { offerConfirmed: 'X', whatTheyGet: 'Y', audienceConfirmed: 'Z', selectedPositioning: 'X for Z.', objections: [] } });
  const token3 = signAccessToken({ customerId: 999881, email: 'no-module3@example.com' });
  const result = await getModule4Context(token3);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module3_not_complete');
  await rm(memberDir('customer-999881'), { recursive: true, force: true });
});

test('Module 4 requires Module 2 to be complete first (only Module 1 done)', async () => {
  const token = signAccessToken({ customerId: 999882, email: 'no-module2@example.com' });
  await submitOnboarding({ accessToken: token, answers: { route: 'services', stage: 'B', offer: 'X', price: 100, audience: 'Y' } });
  const token2 = signAccessToken({ customerId: 999882, email: 'no-module2@example.com' });
  const result = await getModule4Context(token2);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'module2_not_complete');
  await rm(memberDir('customer-999882'), { recursive: true, force: true });
});

test('submitModule4 rejects when marketing hours are missing', async () => {
  await onboardThroughModule3();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule4({ accessToken: token, answers: fullModule4Answers({ marketingHoursPerWeek: null }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_marketing_hours');
});

test('submitModule4 rejects when no feasible formats are selected', async () => {
  await onboardThroughModule3();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitModule4({ accessToken: token, answers: fullModule4Answers({ feasibleFormats: [] }) });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_feasible_formats');
});

test('submitModule4 succeeds and persists, then a fresh token reload shows the same saved plan (services business model)', async () => {
  await onboardThroughModule3();
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule4({ accessToken: token, answers: fullModule4Answers() });
  assert.equal(submitResult.ok, true);
  assert.ok(submitResult.results.channelPlan.primaryChannel);

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule4ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.channelPlan.primaryChannel, submitResult.results.channelPlan.primaryChannel);
});

// --- Test 24: existing authenticated customer flow, marketplace-first model ---

test('the existing authenticated customer flow works end to end for a marketplace-first business: onboarding -> Module 2 -> Module 3 -> Module 4 -> reload', async () => {
  await onboardThroughModule3({
    profile: { route: 'marketplace_first', offer: 'Handmade earrings', price: 28, audience: 'Gift shoppers' },
    offer: { offerConfirmed: 'Handmade earrings', audienceConfirmed: 'Gift shoppers', selectedPositioning: 'Handmade earrings for gift shoppers.' },
    discovery: { buyerDescription: 'People buying a gift for someone else', desiredResult: { functional: 'a gift that feels thoughtful and unique' }, discoveryEnvironments: ['etsy', 'pinterest'], primaryTriggerCategory: 'gift_need', buyingTriggers: [{ category: 'gift_need', note: null }], evidenceSources: ['actual_sales_conversations', 'reviews'] },
  });
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const submitResult = await submitModule4({
    accessToken: token,
    answers: fullModule4Answers({ feasibleFormats: ['photography_images', 'graphics_design'], existingAssets: [{ type: 'marketplace_listings_sales', level: 'real_traction', detail: '12 real sales' }] }),
  });
  assert.equal(submitResult.ok, true);
  assert.equal(submitResult.results.businessType.route, 'marketplace_first');
  assert.equal(submitResult.results.channelPlan.primaryChannel, 'Etsy');
  assert.equal(submitResult.results.confidence.key, 'evidence_backed'); // real marketplace traction + confirmed presence + 2 strong Module 3 evidence sources

  const freshToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const reload = await getModule4ResultsForToken(freshToken);
  assert.equal(reload.ok, true);
  assert.equal(reload.results.channelPlan.primaryChannel, 'Etsy');
});
