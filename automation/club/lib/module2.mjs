/**
 * Module 2 — Build Something People Want to Buy (the Offer Builder).
 *
 * Reuses Module 1's building blocks directly rather than recomputing them
 * differently: the same $1K Math, the same route config, and Module 1's own
 * Trust dimension (mini-evaluation.mjs) instead of a second trust check
 * that could drift from it. Nothing here touches module1.mjs.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { computeThousandKMath } from './thousand-k-math.mjs';
import { evaluatePresence } from './mini-evaluation.mjs';
import { evaluateOffer, buildFixFirstKeepLearn, determineOfferExperiment } from './offer-evaluation.mjs';

// Duplicated intentionally rather than imported: module1.mjs's STARTING_STATES
// map is private to that file, and Module 1 is frozen -- re-deriving the
// same small, stable A/B/C -> title mapping here is cheaper and safer than
// exporting new surface area from a module explicitly not to be touched.
const STARTING_STATE_TITLES = { A: 'Starting From Zero', B: 'Ready to Sell', C: 'Building Momentum' };
const STARTING_STATE_KEYS = { A: 'starting_from_zero', B: 'ready_to_sell', C: 'building_momentum' };

const NEXT_MODULE = { label: 'Module 3 — Find the People Most Likely to Buy It' };
const TRANSITION_TO_MODULE_3 = "Now that we know what we're taking to market, the next step is understanding who is most likely to buy it, what makes them start looking, and where they can realistically be reached.";

function knownRatesFor(profile, routeConfig) {
  const key = routeConfig.closingMetricKey;
  const value = profile.existingMetrics ? profile.existingMetrics[key] : null;
  if (value == null) return {};
  const stages = routeConfig.funnelStages;
  const transitionKey = `${stages[stages.length - 2]}->${stages[stages.length - 1]}`;
  return { [transitionKey]: value };
}

/** Persisted decisions -> the "Your $1K Offer" artifact. Nothing here is stored beyond what's already in profile/plan. */
function buildYourOfferArtifact({ profile, plan, math, dims, fixKeepLearn, experiment }) {
  const observed = plan.objections.find((o) => o.basis === 'observed');
  const primaryConcern = observed
    ? { label: observed.type, basis: 'observed' }
    : plan.objections.length > 0
      ? { label: plan.objections[0].type, basis: 'hypothesis' }
      : { label: 'None identified yet', basis: 'hypothesis' };

  return {
    primaryOffer: plan.offerConfirmed,
    customer: plan.audienceConfirmed,
    whatTheyGet: plan.whatTheyGet,
    price: math.price,
    target: { salesRequired: math.requiredSales, resultingRevenue: math.resultingRevenue },
    whyTheyWantIt: plan.buyingMotivation,
    whyThisOffer: plan.differentiation.status === 'stated' ? plan.differentiation.detail : 'Working Hypothesis — not yet defined',
    primaryBuyingConcern: primaryConcern,
    bestAvailableProof: plan.proofInventory.length > 0 ? plan.proofInventory : [{ type: 'none yet', detail: null }],
    positioning: plan.selectedPositioning,
    fixFirst: fixKeepLearn.fixFirst,
    keep: fixKeepLearn.keep,
    learn: fixKeepLearn.learn,
    nextExperiment: experiment,
  };
}

/**
 * Pure function: BusinessProfile + OfferPlan -> the full Module 2 result.
 * No I/O, no caching, mirroring Module 1's computeModule1Results.
 */
export function computeModule2Results(profile, plan) {
  const routeConfig = getRouteConfig(profile.route);
  const math = computeThousandKMath({ price: profile.price, route: profile.route, knownRates: knownRatesFor(profile, routeConfig) });
  const module1TrustDim = evaluatePresence(profile, routeConfig).dimensions.find((d) => d.name === 'Trust');

  const dims = evaluateOffer({ profile, plan, math, module1TrustDim });
  const fixKeepLearn = buildFixFirstKeepLearn(dims, math);
  const startingStateKey = STARTING_STATE_KEYS[profile.stage] || 'ready_to_sell';
  const experiment = determineOfferExperiment(startingStateKey);
  const yourOffer = buildYourOfferArtifact({ profile, plan, math, dims, fixKeepLearn, experiment });

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 2, total: 7 },
    startingState: { title: STARTING_STATE_TITLES[profile.stage] || STARTING_STATE_TITLES.B },
    math,
    dimensions: dims,
    yourOffer,
    nextClubStep: { moduleLabel: NEXT_MODULE.label, transition: TRANSITION_TO_MODULE_3, cta: `Continue to ${NEXT_MODULE.label}` },
  };
}
