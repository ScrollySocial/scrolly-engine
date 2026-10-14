/**
 * Module 3 -- Find the People Most Likely to Buy It (Customer Discovery Map).
 *
 * Reuses Module 1's BusinessProfile and Module 2's OfferPlan directly
 * (offer/audience/objections carried forward, confirm-or-refine) rather than
 * re-deriving or re-asking for them. Nothing here touches module1.mjs or
 * module2.mjs -- both stay completely frozen.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { discoveryLanguageForRoute } from './discovery-content.mjs';
import {
  classifyConfidence,
  buildWhatThisTellsUs,
  determineDiscoveryGap,
  determineDiscoveryExperiment,
  deriveTopBuyingCriteria,
} from './discovery-evaluation.mjs';

const STARTING_STATE_KEYS = { A: 'starting_from_zero', B: 'ready_to_sell', C: 'building_momentum' };

const NEXT_MODULE_LABEL = 'Module 4 — Choose How People Will Find You';
const TRANSITION_TO_MODULE_4 =
  "Now that we understand who is most likely to buy, what starts their search, what they care about, and where they may already look, Scrolly can decide where YOUR business should focus its marketing effort.";

/**
 * The consolidated "Your Customer Discovery Map" artifact -- built entirely
 * from already-persisted DiscoveryPlan fields plus the derived top-criteria/
 * confidence values. Nothing new is stored beyond what's already in
 * discovery-plan.json (same discipline as Module 1/2's Plan artifacts).
 */
function buildDiscoveryMap({ plan, topCriteria, confidence }) {
  return {
    likelyBuyer: plan.buyerDescription,
    currentSituation: plan.currentSituation,
    tryingToAccomplish: plan.tryingToAccomplish,
    whyNow: plan.whyNow,
    buyingTrigger: {
      selected: plan.buyingTriggers,
      strongest: plan.primaryTriggerCategory,
    },
    desiredResult: plan.desiredResult,
    whatTheyCareAbout: topCriteria,
    likelyObjections: plan.objections,
    whereTheyMayLook: plan.discoveryEnvironments,
    customerLanguageHypotheses: plan.customerLanguageHypotheses,
    evidence: plan.evidenceSources,
    confidence: confidence.label,
  };
}

/**
 * Pure function: BusinessProfile + OfferPlan + DiscoveryPlan -> the full
 * Module 3 result. No I/O, no caching, mirroring Module 1/2's
 * compute*Results functions.
 */
export function computeModule3Results(profile, offerPlan, discoveryPlan) {
  const routeConfig = getRouteConfig(profile.route);
  const routeLanguage = discoveryLanguageForRoute(profile.route);
  const startingStateKey = STARTING_STATE_KEYS[profile.stage] || 'ready_to_sell';

  const confidence = classifyConfidence(discoveryPlan.evidenceSources);
  const topCriteria = deriveTopBuyingCriteria(discoveryPlan.buyingCriteria, routeLanguage);
  const whatThisTellsUs = buildWhatThisTellsUs({ plan: discoveryPlan, confidence });
  const discoveryGap = determineDiscoveryGap({ plan: discoveryPlan, confidence });
  const nextExperiment = determineDiscoveryExperiment({ startingStateKey, route: profile.route });
  const discoveryMap = buildDiscoveryMap({ plan: discoveryPlan, topCriteria, confidence });

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 3, total: 7 },
    routeLanguage,
    offerContext: { offer: offerPlan.offerConfirmed, positioning: offerPlan.selectedPositioning },
    confidence,
    discoveryMap,
    topBuyingCriteria: topCriteria,
    whatThisTellsUs,
    discoveryGap,
    nextExperiment,
    nextClubStep: { moduleLabel: NEXT_MODULE_LABEL, transition: TRANSITION_TO_MODULE_4, cta: `Continue to ${NEXT_MODULE_LABEL}` },
  };
}
