/**
 * Focused tests for the $1K Club vertical slice: Business Model Router,
 * $1K Math, Mini Organic Presence Evaluation (existence vs. performance),
 * Module 1's interpretation/priority logic, the signed access-token gate,
 * and the onboarding orchestrator. No real network anywhere in this file.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { getRouteConfig, listRoutes } from '../club/lib/business-model-router.mjs';
import { computeThousandKMath } from '../club/lib/thousand-k-math.mjs';
import { evaluatePresence } from '../club/lib/mini-evaluation.mjs';
import { computeModule1Results } from '../club/lib/module1.mjs';
import { newBusinessProfile } from '../club/lib/business-profile-schema.mjs';
import { memberDir } from '../club/lib/club-state.mjs';
import { signAccessToken, verifyAccessToken, extractBearerToken } from '../club/lib/club-access-token.mjs';
import { computeResults, submitOnboarding, getResultsForToken, slugFromCustomerId } from '../club/lib/onboarding-service.mjs';

const CUSTOMER_ID = 424242;
const EMAIL = 'club-test@example.com';
const SLUG = slugFromCustomerId(CUSTOMER_ID);

process.env.CLUB_ACCESS_TOKEN_SECRET = process.env.CLUB_ACCESS_TOKEN_SECRET || 'test-secret-not-the-real-one';

beforeEach(async () => {
  await rm(memberDir(SLUG), { recursive: true, force: true });
});
afterEach(async () => {
  await rm(memberDir(SLUG), { recursive: true, force: true });
});

function baseProfile(overrides = {}) {
  const profile = newBusinessProfile();
  Object.assign(profile, { route: 'services', stage: 'B', offer: 'Freelance design', price: 200, audience: 'Small business owners' }, overrides);
  return profile;
}

// --- Business Model Router ---------------------------------------------

test('all 6 canonical routes resolve to a config', () => {
  assert.equal(listRoutes().length, 6);
  for (const { route } of listRoutes()) {
    const config = getRouteConfig(route);
    assert.ok(config.label);
    assert.equal(config.funnelStages.length, 4);
  }
});

test('an unknown route throws rather than silently falling back', () => {
  assert.throws(() => getRouteConfig('not_a_real_route'));
});

// --- $1K Math -------------------------------------------------------------

test('sales count rounds UP correctly and resulting revenue never implies a fractional customer', () => {
  const math = computeThousandKMath({ price: 149, route: 'services' });
  assert.equal(math.requiredSales, 7); // ceil(1000/149) = ceil(6.71) = 7
  assert.equal(math.resultingRevenue, 149 * 7); // 1043, a whole-unit product, never a fraction
});

test('a low price with a high resulting sales count is flagged, without prescribing a price change', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'digital_product' });
  assert.equal(math.requiredSales, 101); // ceil(1000/9.99) = ceil(100.1001...) = 101
  assert.equal(math.isHighTransactionCount, true);
});

test('a normal price does not get flagged as a high transaction count', () => {
  const math = computeThousandKMath({ price: 200, route: 'services' });
  assert.equal(math.isHighTransactionCount, false);
});

test('a supplied real conversion rate is labeled "your_own_data", not an assumption', () => {
  const math = computeThousandKMath({
    price: 250,
    route: 'services',
    knownRates: { 'qualified_conversation->booked_client': 0.3 },
  });
  const closing = math.transitions[math.transitions.length - 1];
  assert.equal(closing.source, 'your_own_data');
  assert.equal(closing.rate.base, 0.3);
});

test('with no known rates every transition is a labeled planning assumption', () => {
  const math = computeThousandKMath({ price: 50, route: 'ecommerce' });
  assert.ok(math.transitions.every((t) => t.source === 'planning_assumption'));
  assert.match(math.disclosure, /planning-range assumption/);
});

// --- Mini Organic Presence Evaluation: existence vs. performance ----------

test('existence of an offer is not automatically treated as proof of performance', () => {
  const profile = baseProfile(); // offer + price set, no revenue, no conversion data
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  const offer = dimensions.find((d) => d.name === 'Offer');
  assert.equal(offer.kind, 'existence');
  assert.equal(offer.state, 'exists');
  // The dimension carries no performance verdict at all -- only 'exists'/'not_established' are valid states for it.
  assert.ok(['exists', 'not_established'].includes(offer.state));
});

test('a business with no offer/price shows Offer as not_established, not a performance label', () => {
  const profile = newBusinessProfile();
  profile.route = 'services';
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  const offer = dimensions.find((d) => d.name === 'Offer');
  assert.equal(offer.kind, 'existence');
  assert.equal(offer.state, 'not_established');
});

test('no conversion data does NOT produce growth_strength -- it is insufficient_data', () => {
  const profile = baseProfile();
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  const conversion = dimensions.find((d) => d.name === 'Conversion');
  assert.equal(conversion.state, 'insufficient_data');
  assert.notEqual(conversion.state, 'growth_strength');
});

test('a real, honestly-reported 0% conversion rate is NOT classified as growth_strength (the "0 meets benchmark 0" bug)', () => {
  const profile = baseProfile({ existingMetrics: { conversationToClientRate: 0 } });
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  const conversion = dimensions.find((d) => d.name === 'Conversion');
  assert.notEqual(conversion.state, 'growth_strength');
  assert.notEqual(conversion.state, 'on_track');
  assert.equal(conversion.state, 'growth_opportunity'); // a real, evidenced gap -- not a fabricated pass
});

test('a real conversion rate at or above the independent benchmark is growth_strength, compared against a fixed reference, not itself', () => {
  const profile = baseProfile({ existingMetrics: { conversationToClientRate: 0.5 } });
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  assert.equal(dimensions.find((d) => d.name === 'Conversion').state, 'growth_strength');
});

test('Trust with no signal is insufficient_data, not a penalty', () => {
  const profile = baseProfile();
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  assert.equal(dimensions.find((d) => d.name === 'Trust').state, 'insufficient_data');
});

// --- Module 1: starting state, data confidence, first priority -----------

test('Starting From Zero (no offer) always prioritizes clarifying the offer, regardless of other signals', () => {
  // Onboarding always requires a price to run $1K Math at all (even an early/unproven target price) --
  // "Starting From Zero" means no PROVEN offer, not literally no price answered on the form.
  const profile = newBusinessProfile();
  Object.assign(profile, { route: 'ecommerce', stage: 'A', price: 40, discoveryChannels: ['instagram'] });
  const results = computeModule1Results(profile);
  assert.equal(results.startingState.key, 'starting_from_zero');
  assert.equal(results.firstPriority.type, 'clarify_offer');
});

test('missing performance data results in "Establishing a baseline" and a qualified-activity priority, not a fabricated pass', () => {
  const profile = baseProfile({ stage: 'B', discoveryChannels: ['instagram'] }); // offer+audience+discovery exist, no conversion/revenue data
  const results = computeModule1Results(profile);
  assert.equal(results.dataConfidence.key, 'establishing_baseline');
  assert.equal(results.firstPriority.type, 'generate_buying_activity');
});

test('no discovery channel takes priority over conversion, even with a defined offer', () => {
  const profile = baseProfile({ discoveryChannels: [] });
  const results = computeModule1Results(profile);
  assert.equal(results.firstPriority.type, 'increase_discovery');
});

test('ecommerce does NOT automatically get a Search/SEO priority just because it is ecommerce', () => {
  const profile = baseProfile({ route: 'ecommerce', discoveryChannels: ['instagram'] }); // discovery exists, no conversion evidence
  const results = computeModule1Results(profile);
  assert.equal(results.firstPriority.type, 'generate_buying_activity');
  assert.doesNotMatch(results.firstPriority.label + ' ' + results.firstPriority.rationale, /search|seo/i);
});

test('marketplace/local paths do not get website-specific language either', () => {
  for (const route of ['marketplace_first', 'local_hybrid']) {
    const profile = baseProfile({ route, discoveryChannels: ['etsy'] });
    const results = computeModule1Results(profile);
    assert.doesNotMatch(results.firstPriority.label + ' ' + results.firstPriority.rationale, /website/i);
  }
});

test('a real, low conversion rate below benchmark prioritizes improving conversion, not more discovery', () => {
  const profile = baseProfile({ discoveryChannels: ['instagram'], existingMetrics: { conversationToClientRate: 0.02 } });
  const results = computeModule1Results(profile);
  assert.equal(results.firstPriority.type, 'improve_conversion');
});

test('a strong real conversion rate shifts the priority to discovery, not "start over"', () => {
  const profile = baseProfile({ discoveryChannels: ['instagram'], existingMetrics: { conversationToClientRate: 0.4 } });
  const results = computeModule1Results(profile);
  assert.equal(results.firstPriority.type, 'increase_discovery');
});

test('the interpretation for a high-transaction-count offer never instructs the customer to raise their price', () => {
  const profile = baseProfile({ price: 9.99, route: 'digital_product', discoveryChannels: ['instagram'] });
  const results = computeModule1Results(profile);
  assert.equal(results.math.isHighTransactionCount, true);
  assert.doesNotMatch(results.interpretation, /raise (your )?price|increase (your )?price|charge more/i);
  assert.match(results.interpretation, /transaction count/i);
});

test('computeModule1Results never leaks internal terms into interpretation or priority copy', () => {
  const profile = baseProfile({ discoveryChannels: ['instagram'], existingMetrics: { conversationToClientRate: 0.3 } });
  const results = computeModule1Results(profile);
  const allCopy = [results.interpretation, results.firstPriority.label, results.firstPriority.rationale, results.startingState.title, results.startingState.copy].join(' ');
  assert.doesNotMatch(allCopy, /conversationToClientRate|conversionRate|stage [ABC]\b|planning benchmark \(0\)/i);
});

// --- Module 1 completion pass (2026-09-11): scenario semantics, baseline metrics, next-Club-step ---

test('$9.99 offer resolves to exactly 101 sales and $1,008.99 resulting revenue', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'ecommerce' });
  assert.equal(math.requiredSales, 101);
  assert.equal(math.resultingRevenue, 1008.99);
});

test('a better-performing (upside) scenario requires LESS upstream activity than a weaker (conservative) one, for the same sales target', () => {
  const math = computeThousandKMath({ price: 9.99, route: 'ecommerce' });
  const topStage = math.scenarios.base[0].stage; // "reach" -- the most volume-sensitive stage
  const conservativeReach = math.scenarios.conservative.find((v) => v.stage === topStage).count;
  const baseReach = math.scenarios.base.find((v) => v.stage === topStage).count;
  const upsideReach = math.scenarios.upside.find((v) => v.stage === topStage).count;
  assert.ok(conservativeReach > baseReach, `conservative (${conservativeReach}) should need MORE reach than base (${baseReach})`);
  assert.ok(baseReach > upsideReach, `base (${baseReach}) should need MORE reach than upside (${upsideReach})`);
});

test('a real 0% closing rate makes upstream volume undefined ("—"), never a wrong "0 people needed" (live-QA regression)', () => {
  const math = computeThousandKMath({
    price: 9.99,
    route: 'ecommerce',
    knownRates: { 'add_to_cart->purchase': 0 },
  });
  for (const scenario of [math.scenarios.conservative, math.scenarios.base, math.scenarios.upside]) {
    assert.equal(scenario.find((v) => v.stage === 'reach').count, null);
    assert.equal(scenario.find((v) => v.stage === 'product_view').count, null);
  }
});

test('missing benchmark/reference data never creates a positive performance classification (generic sweep, not just Conversion)', () => {
  const profile = baseProfile(); // no existingMetrics at all
  const { dimensions } = evaluatePresence(profile, getRouteConfig('services'));
  for (const d of dimensions.filter((x) => x.kind === 'performance')) {
    assert.equal(d.state, 'insufficient_data', `${d.name} should be insufficient_data with no evidence, got ${d.state}`);
  }
});

test('ecommerce gets ecommerce-relevant baseline metrics to start measuring', () => {
  const profile = baseProfile({ route: 'ecommerce' });
  const results = computeModule1Results(profile);
  assert.deepEqual(results.startingPointPlan.baselineMetrics, ['Qualified reach/visits', 'Product views', 'Add-to-cart activity', 'Purchases', 'Revenue']);
});

test('a service business gets service-relevant baseline metrics, not ecommerce ones', () => {
  const profile = baseProfile({ route: 'services' });
  const results = computeModule1Results(profile);
  // Both routes legitimately start with a "reach" stage (per the example spec's own
  // "qualified discovery/reach" item for services) -- what must differ is everything after it.
  assert.deepEqual(results.startingPointPlan.baselineMetrics, ['Qualified reach/visits', 'Inquiries/leads', 'Sales conversations', 'Clients', 'Revenue']);
  assert.ok(!results.startingPointPlan.baselineMetrics.includes('Product views'));
  assert.ok(!results.startingPointPlan.baselineMetrics.includes('Add-to-cart activity'));
});

test('Module 1 always points the customer to Module 2 next, never straight to a later module like Channel Selector', () => {
  for (const discoveryChannels of [[], ['instagram']]) {
    const profile = baseProfile({ discoveryChannels });
    const results = computeModule1Results(profile);
    assert.equal(results.nextClubStep.moduleLabel, 'Module 2 — Build Something People Want to Buy');
    assert.doesNotMatch(results.nextClubStep.cta + results.nextClubStep.transition, /channel|Module 4/i);
  }
});

test('the Starting Point Plan is a correct, consolidated, customer-specific summary', () => {
  const profile = baseProfile({ route: 'ecommerce', price: 9.99, discoveryChannels: ['instagram'], audience: 'Home shoppers' });
  const results = computeModule1Results(profile);
  const plan = results.startingPointPlan;
  assert.equal(plan.startingState.title, 'Ready to Sell');
  assert.equal(plan.primaryOffer.price, 9.99);
  assert.equal(plan.target.salesRequired, 101);
  assert.equal(plan.target.resultingRevenue, 1008.99);
  assert.equal(plan.dataConfidence.title, 'Establishing a baseline');
  assert.ok(plan.whatExists.includes('Offer exists'));
  assert.ok(plan.whatExists.includes('Discovery channel exists'));
  assert.ok(plan.whatsUnknown.includes('Actual conversion performance'));
  assert.equal(plan.currentPriority, results.firstPriority.label);
  assert.equal(plan.nextClubStep.moduleLabel, 'Module 2 — Build Something People Want to Buy');
});

// --- club-access-token: the WooCommerce-account-gating replacement --------

test('a freshly signed token verifies with the same customerId/email', () => {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = verifyAccessToken(token);
  assert.equal(result.valid, true);
  assert.equal(result.customerId, CUSTOMER_ID);
  assert.equal(result.email, EMAIL);
});

test('a tampered payload fails signature verification', () => {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const [, signature] = token.split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ customerId: 1, email: 'attacker@example.com', iat: 0, exp: 9999999999 })).toString('base64url');
  const result = verifyAccessToken(`${forgedPayload}.${signature}`);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'bad_signature');
});

test('an expired token is rejected', () => {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL, ttlSeconds: -10 });
  const result = verifyAccessToken(token);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'expired');
});

test('signAccessToken refuses a guest (customerId 0/undefined)', () => {
  assert.throws(() => signAccessToken({ customerId: 0, email: EMAIL }));
});

test('extractBearerToken reads "Authorization: Bearer <token>" and nothing else', () => {
  assert.equal(extractBearerToken({ authorization: 'Bearer abc.def' }), 'abc.def');
  assert.equal(extractBearerToken({}), null);
  assert.equal(extractBearerToken({ authorization: 'Basic xyz' }), null);
});

// --- onboarding-service: end-to-end via a signed token (no network) ------

test('submitOnboarding rejects a malformed/missing token', async () => {
  const result = await submitOnboarding({ accessToken: 'not-a-real-token', answers: { route: 'ecommerce', stage: 'B', price: 25 } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'malformed_token');
});

test('submitOnboarding rejects incomplete answers even for a valid token', async () => {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitOnboarding({ accessToken: token, answers: { route: 'ecommerce' } }); // missing stage/price
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_stage');
});

test('submitOnboarding end to end: valid token + complete answers persists a member keyed by customer id, and returns full Module 1 results', async () => {
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Candles', price: 25, audience: 'Home decor shoppers' },
  });
  assert.equal(result.ok, true);
  assert.equal(result.slug, SLUG);
  assert.equal(result.results.businessType.route, 'ecommerce');
  assert.ok(result.results.startingState);
  assert.ok(result.results.firstPriority);
  assert.equal(computeResults, computeModule1Results); // onboarding-service re-exports module1's function, doesn't reimplement it
});

test('2026-09-17 rebuild: businessName and websiteUrl are captured and persisted (previously absent from onboarding entirely)', async () => {
  const { loadBusinessProfile } = await import('../club/lib/business-profile-store.mjs');
  const token = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  const result = await submitOnboarding({
    accessToken: token,
    answers: { route: 'ecommerce', stage: 'B', offer: 'Candles', price: 25, audience: 'Home decor shoppers', businessName: 'Juniper Lane Candle Co.', websiteUrl: 'junipercandles.com' },
  });
  assert.equal(result.ok, true);
  const saved = await loadBusinessProfile(SLUG);
  assert.equal(saved.businessName, 'Juniper Lane Candle Co.');
  assert.equal(saved.websiteUrl, 'junipercandles.com');
});

test('2026-09-17 rebuild: a profile saved before businessName/websiteUrl existed still loads and re-saves cleanly (backward compatibility)', async () => {
  const { businessProfilePath, loadBusinessProfile, saveBusinessProfile } = await import('../club/lib/business-profile-store.mjs');
  const { mkdir, writeFile } = await import('node:fs/promises');
  const path = await import('node:path');
  await mkdir(memberDir(SLUG), { recursive: true });
  // Simulate an old on-disk profile from before this field existed -- no
  // businessName/websiteUrl key at all, not just null.
  const oldShapeProfile = { route: 'ecommerce', stage: 'B', offer: 'Candles', oneSentenceOffer: null, price: 25, audience: null, currentRevenueUsd: null, sellingSurfaces: [], discoveryChannels: [], hasEmailList: null, emailListSize: null, timeAvailableHoursPerWeek: null, existingMetrics: {}, notes: null };
  await writeFile(businessProfilePath(SLUG), JSON.stringify(oldShapeProfile), 'utf8');

  const loaded = await loadBusinessProfile(SLUG);
  assert.equal(loaded.businessName, null, 'missing key is backfilled from the schema default, not left undefined');
  assert.equal(loaded.route, 'ecommerce', 'real saved data is preserved, not overwritten by the backfill');

  // Re-saving (e.g. Connections' apply-import does load-then-save) must not throw.
  loaded.offer = 'Updated offer';
  await saveBusinessProfile(SLUG, loaded);
  const reloaded = await loadBusinessProfile(SLUG);
  assert.equal(reloaded.offer, 'Updated offer');
});

test('getResultsForToken re-derives the SAME customer\'s results on a later visit with a fresh token', async () => {
  const firstToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: firstToken, answers: { route: 'services', stage: 'C', price: 250 } });

  const laterToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL }); // simulates clicking "Go to $1K Club" again later
  const result = await getResultsForToken(laterToken);
  assert.equal(result.ok, true);
  assert.equal(result.slug, SLUG);
  assert.equal(result.results.businessType.route, 'services');
  // No regression from the Module 1 completion pass: a pre-existing customer's reload still gets the full shape.
  assert.ok(result.results.startingPointPlan);
  assert.ok(result.results.nextClubStep);
});

test('getResultsForToken never lets one customer see another customer\'s data', async () => {
  const ownerToken = signAccessToken({ customerId: CUSTOMER_ID, email: EMAIL });
  await submitOnboarding({ accessToken: ownerToken, answers: { route: 'services', stage: 'C', price: 250 } });

  const otherToken = signAccessToken({ customerId: 999999, email: 'someone-else@example.com' });
  const result = await getResultsForToken(otherToken);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_a_club_member');

  await rm(memberDir(slugFromCustomerId(999999)), { recursive: true, force: true });
});
