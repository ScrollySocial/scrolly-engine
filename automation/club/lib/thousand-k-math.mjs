/**
 * $1K Math — the signature $1K Club tool.
 *
 * Core concept: price x required sales ~= $1,000, then worked backward
 * through the customer's own route-specific funnel (business-model-router.mjs)
 * to an activity/distribution requirement.
 *
 * Discipline (matches the existing Discover product's "never fabricate a
 * metric" rule and its established Conservative/Base/Upside scenario
 * framing — see clients/mulberry-creek/discover/status.md's Round 5 entry):
 * when the customer's own conversion data exists, use it and say so. When it
 * doesn't, use clearly-labeled, wide PLANNING ranges — never a single fake-
 * precise number presented as researched fact. Every output states which
 * source (known data vs. assumption) produced it.
 */

import { getRouteConfig } from './business-model-router.mjs';

// Generic, position-based conversion-rate assumption ranges for an unknown
// funnel step, keyed by how far the step sits from the final sale (0 = the
// last step, i.e. close rate). Deliberately wide and clearly a placeholder,
// not a benchmark citation — replace with the customer's real numbers via
// `knownRates` whenever available.
const DEFAULT_STEP_RANGE_FROM_END = [
  { low: 0.15, base: 0.25, high: 0.4 },  // closing step (e.g. lead -> sale, cart -> purchase)
  { low: 0.08, base: 0.15, high: 0.25 }, // mid step (e.g. view -> lead/cart)
  { low: 0.02, base: 0.05, high: 0.1 },  // top-of-funnel step (e.g. reach -> view)
];

// Exported so a caller (mini-evaluation.mjs's Conversion dimension) can
// compare a customer's REAL closing rate against this independent reference
// range -- never against `math.transitions`' own closing rate, which
// becomes identical to the real value once supplied (comparing a number to
// itself is always true, which is exactly the "0% meets or beats benchmark
// 0%" class of bug this separation exists to prevent).
export const CLOSING_STEP_DEFAULT_RANGE = DEFAULT_STEP_RANGE_FROM_END[0];

// A sales count this high or above gets flagged as a real interpretive note
// (see computeThousandKMath's `isHighTransactionCount`) -- not a
// prescription to raise price, just a fact worth surfacing.
const HIGH_TRANSACTION_COUNT_THRESHOLD = 20;

function rangeForStepIndex(stepsFromEnd) {
  return DEFAULT_STEP_RANGE_FROM_END[Math.min(stepsFromEnd, DEFAULT_STEP_RANGE_FROM_END.length - 1)];
}

/**
 * @param {object} input
 * @param {number} input.price - the customer's offer price in USD
 * @param {string} input.route - a BUSINESS_MODEL_ROUTES value
 * @param {object} [input.knownRates] - map of "stageFrom->stageTo" to a real observed rate (0-1), e.g. { "reach->product_view": 0.12 }
 * @param {number} [input.targetUsd=1000]
 */
export function computeThousandKMath({ price, route, knownRates = {}, targetUsd = 1000 }) {
  if (!price || price <= 0) throw new Error('computeThousandKMath requires a positive price');
  const config = getRouteConfig(route);
  const requiredSales = Math.ceil(targetUsd / price);

  const stages = config.funnelStages;
  const transitions = [];
  for (let i = stages.length - 1; i > 0; i--) {
    const from = stages[i - 1];
    const to = stages[i];
    const key = `${from}->${to}`;
    const stepsFromEnd = stages.length - 1 - i;
    const known = knownRates[key];
    const assumed = rangeForStepIndex(stepsFromEnd);
    transitions.unshift({
      from,
      to,
      source: known != null ? 'your_own_data' : 'planning_assumption',
      rate: known != null ? { low: known, base: known, high: known } : assumed,
    });
  }

  // Walk backward from the required sales count through each transition's
  // "base" rate to get a base-case volume at every stage, then do the same
  // for low/high to produce an honest range, not just a single number.
  function volumesFor(pick) {
    let need = requiredSales;
    const volumes = [{ stage: stages[stages.length - 1], count: need }];
    for (let i = transitions.length - 1; i >= 0; i--) {
      const t = transitions[i];
      const rate = t.rate[pick];
      // A real 0% rate (or any missing `need`) makes every upstream stage
      // mathematically undefined -- NOT zero. `null / rate` coerces to 0 in
      // JS arithmetic, which previously silently turned "undefined" into a
      // wrong "0 people needed" for every stage above a 0% real rate
      // (caught via live QA on a real 0%-conversion test profile).
      need = (need != null && rate > 0) ? Math.ceil(need / rate) : null;
      volumes.unshift({ stage: t.from, count: need });
    }
    return volumes;
  }

  const anyAssumed = transitions.some((t) => t.source === 'planning_assumption');

  return {
    price,
    targetUsd,
    requiredSales,
    // Never imply fractional customers: this is requiredSales whole units at
    // the real price, so it can meet or slightly exceed targetUsd, never land short.
    resultingRevenue: Math.round(price * requiredSales * 100) / 100,
    isHighTransactionCount: requiredSales >= HIGH_TRANSACTION_COUNT_THRESHOLD,
    route,
    routeLabel: config.label,
    transitions,
    // 2026-09-11 fix: this was backwards. A LOW conversion-rate assumption
    // means each person converts less often, so MORE upstream volume is
    // needed to hit the same sales target -- that is the cautious/
    // conservative planning case. A HIGH conversion-rate assumption needs
    // LESS upstream volume -- that's the optimistic/upside case. (The old
    // code picked 'high' for conservative and 'low' for upside, so a
    // better-converting scenario showed a bigger reach requirement than a
    // worse one -- caught via live customer QA on a $9.99 offer.)
    scenarios: {
      conservative: volumesFor('low'),  // worse conversion assumption -> more upstream volume required
      base: volumesFor('base'),
      upside: volumesFor('high'),       // better conversion assumption -> less upstream volume required
    },
    disclosure: anyAssumed
      ? 'One or more steps use a labeled planning-range assumption, not your own measured data. Replace any "planning_assumption" transition with your real numbers as soon as you have them — these ranges exist to make the goal actionable, not to predict your actual results.'
      : 'Every funnel step below used your own supplied conversion data.',
  };
}
