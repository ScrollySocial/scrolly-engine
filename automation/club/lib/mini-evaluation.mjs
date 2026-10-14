/**
 * Mini Organic Presence Evaluation (V1, not the future full $10K Growth
 * Evaluation).
 *
 * 2026-09-11 Module 1 rework: the original version conflated "this input
 * exists" with "this is performing well" (an offer being defined at all
 * was enough to call it "On Track"). That is not honest, and it produced a
 * real bug: once a customer supplied their own real conversion rate, it got
 * compared against $1K Math's OWN computed benchmark -- which, for a
 * supplied rate, is just that same rate reflected back (see
 * thousand-k-math.mjs's `knownRates` handling) -- so ANY real rate, including
 * a genuine 0%, satisfied "meets or beats the benchmark" and was
 * misclassified `growth_strength`. Fixed by comparing against the
 * independent `CLOSING_STEP_DEFAULT_RANGE` instead.
 *
 * Every dimension now has an explicit `kind`:
 * - 'existence' -- did the customer tell us this thing exists at all?
 *   `state` is 'exists' or 'not_established'. Never a performance judgment.
 * - 'performance' -- do we have real evidence of how well it's working?
 *   `state` is one of the canonical labels below, and is 'insufficient_data'
 *   by default -- existence of an input is never enough on its own to earn
 *   growth_opportunity/on_track/growth_strength.
 *
 * Canonical performance labels: 'growth_opportunity' | 'on_track' |
 * 'growth_strength' | 'insufficient_data'. No numeric scores, ever.
 */
import { CLOSING_STEP_DEFAULT_RANGE } from './thousand-k-math.mjs';

export const PERFORMANCE_LABELS = /** @type {const} */ ([
  'growth_opportunity',
  'on_track',
  'growth_strength',
  'insufficient_data',
]);
export const EXISTENCE_STATES = /** @type {const} */ (['exists', 'not_established']);

const TRUST_METRIC_HINTS = ['reviewCount', 'testimonialCount', 'repeatPurchaseRate'];

const EXISTENCE_ICONS = { exists: '✓', not_established: '○' }; // check / open circle
const PERFORMANCE_ICONS = { insufficient_data: '?', growth_opportunity: '!', on_track: '✓', growth_strength: '★' }; // ? / ! / check / star

function existence(name, state, headline, rationale, evidence = {}) {
  return { name, kind: 'existence', state, icon: EXISTENCE_ICONS[state], headline, rationale, evidence };
}
function performance(name, state, headline, rationale, evidence = {}) {
  return { name, kind: 'performance', state, icon: PERFORMANCE_ICONS[state], headline, rationale, evidence };
}

// --- existence-type dimensions: presence, never a performance verdict -----

function evalOfferExistence(profile) {
  const has = !!profile.offer && profile.price != null;
  return has
    ? existence('Offer', 'exists', 'Offer exists', 'You have a priced offer people can actually buy.', { offer: profile.offer, price: profile.price })
    : existence('Offer', 'not_established', 'Offer not yet defined', "There's no clearly priced offer yet.", {});
}

function evalCustomerExistence(profile) {
  return profile.audience
    ? existence('Customer', 'exists', 'Customer defined', "You've identified who you believe is most likely to buy.", { audience: profile.audience })
    : existence('Customer', 'not_established', 'Customer not yet defined', "The likely buyer hasn't been described yet.", {});
}

function evalDiscoveryExistence(profile) {
  const n = (profile.discoveryChannels || []).length;
  return n > 0
    ? existence('Discovery channel', 'exists', 'Discovery channel exists', 'At least one way for people to find you is already in use.', { discoveryChannels: profile.discoveryChannels })
    : existence('Discovery channel', 'not_established', 'Discovery channel not established', 'No way for new people to find you is in active use yet.', {});
}

function evalFollowUpExistence(profile) {
  if (profile.hasEmailList === true) {
    return existence('Follow-up', 'exists', 'Follow-up exists', 'You have a way to stay in touch with people after they show interest.', { emailListSize: profile.emailListSize });
  }
  return existence('Follow-up', 'not_established', 'Follow-up not established', "You don't currently have a follow-up mechanism. We won't assume you need one until we understand your sales path.", {});
}

// --- performance-type dimensions: only real evidence earns a verdict ------

function evalConversionPerformance(profile, routeConfig) {
  const key = routeConfig.closingMetricKey;
  const known = profile.existingMetrics ? profile.existingMetrics[key] : null;
  if (known == null) {
    return performance('Conversion', 'insufficient_data', 'Conversion unknown', "We don't have enough buying activity yet to know how effectively the offer converts.", {});
  }
  const benchmark = CLOSING_STEP_DEFAULT_RANGE; // independent of anything the customer supplied -- never self-referential
  if (known >= benchmark.base) {
    return performance('Conversion', 'growth_strength', 'Conversion is a strength', 'The real conversion rate you reported is at or above what a typical early-stage business sees at this step.', { known });
  }
  if (known < benchmark.low) {
    return performance('Conversion', 'growth_opportunity', 'Conversion needs work', 'The real conversion rate you reported is meaningfully below what a typical early-stage business sees at this step -- a concrete, evidenced gap.', { known });
  }
  return performance('Conversion', 'on_track', 'Conversion is on track', 'The real conversion rate you reported is in a reasonable range for an early-stage business.', { known });
}

function evalTrustPerformance(profile) {
  const metrics = profile.existingMetrics || {};
  const present = TRUST_METRIC_HINTS.find((k) => metrics[k] != null);
  if (!present) {
    return performance('Trust', 'insufficient_data', 'Trust unknown', "We don't yet have enough information about proof or buyer confidence.", {});
  }
  const value = metrics[present];
  if (present === 'repeatPurchaseRate') {
    return value >= 0.2
      ? performance('Trust', 'growth_strength', 'Trust is a strength', 'Real repeat-purchase evidence suggests buyers already trust this business.', { [present]: value })
      : performance('Trust', 'growth_opportunity', 'Trust needs work', 'Real repeat-purchase evidence is low -- a concrete trust/retention gap.', { [present]: value });
  }
  return value > 0
    ? performance('Trust', 'on_track', 'Trust is on track', 'Some real trust signal exists, though not yet a strong one.', { [present]: value })
    : performance('Trust', 'growth_opportunity', 'Trust needs work', 'The trust signal we have is reported as zero.', { [present]: value });
}

/**
 * @param {object} profile - a BusinessProfile
 * @param {object} routeConfig - from business-model-router.mjs's getRouteConfig()
 * @returns {{dimensions: Array<object>}}
 */
export function evaluatePresence(profile, routeConfig) {
  const dimensions = [
    evalOfferExistence(profile),
    evalCustomerExistence(profile),
    evalDiscoveryExistence(profile),
    evalFollowUpExistence(profile),
    evalConversionPerformance(profile, routeConfig),
    evalTrustPerformance(profile),
  ];
  return { dimensions };
}
