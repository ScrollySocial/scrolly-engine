/**
 * Module 4 -- Choose How People Will Find You (Channel Selector + $1K
 * Channel Plan).
 *
 * Reuses Module 1's BusinessProfile, Module 2's OfferPlan, and Module 3's
 * DiscoveryPlan directly (via their own compute*Results functions, never
 * re-derived differently) rather than re-asking for anything. Nothing here
 * touches module1.mjs, module2.mjs, or module3.mjs -- all three stay frozen.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { computeModule1Results } from './module1.mjs';
import { computeModule2Results } from './module2.mjs';
import { computeModule3Results } from './module3.mjs';
import {
  gatherCandidateChannels,
  deriveOfferFormatTags,
  scoreCandidate,
  selectChannelPlan,
  classifyChannelConfidence,
  pickJobForRole,
  reasonForNotNow,
  buildChannelStrategySynthesis,
  determineChannelExperiment,
} from './channel-evaluation.mjs';

const STARTING_STATE_KEYS = { A: 'starting_from_zero', B: 'ready_to_sell', C: 'building_momentum' };

const NEXT_MODULE_LABEL = 'Module 5 — Give Them a Reason to Pay Attention';
const TRANSITION_TO_MODULE_5 =
  "Now we know where your marketing effort should go and what each channel is supposed to accomplish. Next, we'll decide what your business needs to say and create to earn attention from the people most likely to buy.";

function buildWhyPrimary(primary, constrainedTradeoff) {
  const parts = [];
  parts.push(primary.presence === 'confirmed'
    ? 'This is a place your likely buyer already plausibly looks, per your own Module 3 answers.'
    : (primary.surfacedReason || `${primary.ref.label} is usually foundational for this kind of business.`));
  if (primary.breakdown.traction > 0) parts.push('You already have real traction here, not just an account.');
  if (primary.breakdown.formatFit > 0) parts.push('The offer itself naturally fits what this channel rewards.');
  if (primary.breakdown.executionLevel === 'fits') parts.push("It's realistic to execute given the time and formats you have available.");
  if (constrainedTradeoff) {
    parts.push(`${constrainedTradeoff.ref.label} would otherwise have looked like the strongest option here, but you said you won't use it -- ${primary.ref.label} is the best realistic alternative.`);
  }
  return parts.join(' ');
}

function buildWhySecondary(secondary, primary) {
  return `${secondary.ref.label} supports ${primary ? primary.ref.label : 'your primary channel'} rather than replacing it -- it's a smaller, additional effort, not a second full focus.`;
}

function buildWhyCompounds(compounding, isPrimary, isSecondary, primary, secondary) {
  if (isPrimary) return `Work on ${primary.ref.label} keeps paying off after it's published, so your Primary Channel effort compounds instead of disappearing.`;
  if (isSecondary) return `Work on ${secondary.ref.label} keeps paying off after it's published, adding to discovery beyond your Secondary Channel's immediate reach.`;
  return `${compounding.ref.label} keeps working after the initial effort, unlike channels that require constant new output to stay visible.`;
}

/** Final customer-facing artifact -- built entirely from already-computed selection/job/confidence data, nothing new persisted. */
function buildChannelPlanArtifact({ selection, jobs, confidence, notNowList, channelPlan, strategySynthesis, channelExperiment }) {
  const { primary, secondary, compounding, compoundingIsPrimary, compoundingIsSecondary, constrainedTradeoff } = selection;

  return {
    primaryChannel: primary ? primary.ref.label : null,
    primaryChannelKey: primary ? primary.key : null,
    primaryJob: jobs.primary,
    whyPrimary: primary ? buildWhyPrimary(primary, constrainedTradeoff) : "Not enough discovery-environment evidence yet to choose a primary channel -- revisit Module 3's discovery environments.",
    earlyEvidence: primary ? primary.ref.earlyEvidenceExamples : [],

    secondaryChannel: secondary ? secondary.ref.label : 'No Secondary Channel Yet',
    secondaryChannelKey: secondary ? secondary.key : null,
    secondaryJob: secondary ? jobs.secondary : null,
    whySecondary: secondary ? buildWhySecondary(secondary, primary) : "Focus is the recommendation right now -- splitting attention wouldn't clearly help at your current stage and capacity.",

    compoundingAsset: compounding ? compounding.ref.label : 'Not Yet',
    compoundingAssetKey: compounding ? compounding.key : null,
    compoundingIsPrimary: !!compoundingIsPrimary,
    compoundingIsSecondary: !!compoundingIsSecondary,
    compoundingJob: compounding ? jobs.compounding : null,
    whyItCompounds: compounding
      ? buildWhyCompounds(compounding, compoundingIsPrimary, compoundingIsSecondary, primary, secondary)
      : 'Nothing here compounds strongly enough yet to justify building it before the primary channel is validated.',

    notNow: notNowList,

    availableCapacity: { hoursPerWeek: channelPlan.marketingHoursPerWeek },
    formatsToLeanInto: channelPlan.feasibleFormats,

    strategySynthesis,
    channelExperiment,
  };
}

/**
 * Pure function: BusinessProfile + OfferPlan + DiscoveryPlan + ChannelPlan ->
 * the full Module 4 result. No I/O, no caching, mirroring Module 1/2/3's
 * compute*Results functions.
 */
export function computeModule4Results(profile, offerPlan, discoveryPlan, channelPlan) {
  const routeConfig = getRouteConfig(profile.route);
  const startingStateKey = STARTING_STATE_KEYS[profile.stage] || 'ready_to_sell';

  const module1Results = computeModule1Results(profile);
  const module2Results = computeModule2Results(profile, offerPlan);
  const module3Results = computeModule3Results(profile, offerPlan, discoveryPlan);

  const offerFormatTags = deriveOfferFormatTags({ route: profile.route, buyingCriteria: discoveryPlan.buyingCriteria, proofInventory: offerPlan.proofInventory });
  const candidates = gatherCandidateChannels({ discoveryPlan, profile });
  const scored = candidates.map((c) => scoreCandidate(c, { offerFormatTags, channelPlan }));
  const selection = selectChannelPlan(scored, channelPlan);

  const confidence = classifyChannelConfidence({ module3Confidence: module3Results.confidence.key, primary: selection.primary });

  const jobs = { primary: selection.primary ? pickJobForRole(selection.primary.ref, 'primary') : null };
  jobs.secondary = selection.secondary ? pickJobForRole(selection.secondary.ref, 'secondary', jobs.primary) : null;
  jobs.compounding = selection.compounding ? pickJobForRole(selection.compounding.ref, 'compounding', jobs.primary) : null;

  const notNowList = selection.notNow.map((c) => ({
    channel: c.key, label: c.ref.label, reason: reasonForNotNow(c, selection.primary, channelPlan), constrained: c.constrained,
  }));

  const channelExperiment = selection.primary ? determineChannelExperiment({ primaryRef: selection.primary.ref, startingStateKey }) : null;

  const strategySynthesis = selection.primary
    ? buildChannelStrategySynthesis({ primary: selection.primary, secondary: selection.secondary, compounding: selection.compounding, compoundingIsPrimary: selection.compoundingIsPrimary, compoundingIsSecondary: selection.compoundingIsSecondary, notNow: notNowList, jobs })
    : "Not enough discovery-environment evidence yet to build a channel strategy -- revisit Module 3's discovery environments.";

  const channelPlanArtifact = buildChannelPlanArtifact({ selection, jobs, confidence, notNowList, channelPlan, strategySynthesis, channelExperiment });

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 4, total: 7 },
    carriedForward: {
      module1: {
        startingState: module1Results.startingState,
        dataConfidence: module1Results.dataConfidence,
        firstPriority: module1Results.firstPriority,
        baselineMetrics: module1Results.startingPointPlan.baselineMetrics,
        requiredSales: module1Results.math.requiredSales,
        price: module1Results.math.price,
      },
      module2: {
        deliverable: offerPlan.whatTheyGet,
        positioning: offerPlan.selectedPositioning,
        fixFirst: module2Results.yourOffer.fixFirst,
        keep: module2Results.yourOffer.keep,
        learn: module2Results.yourOffer.learn,
        offerExperiment: module2Results.yourOffer.nextExperiment,
      },
      module3: {
        likelyBuyer: discoveryPlan.buyerDescription,
        buyingTrigger: discoveryPlan.primaryTriggerCategory,
        desiredResult: discoveryPlan.desiredResult,
        topBuyingCriteria: module3Results.topBuyingCriteria,
        discoveryEnvironments: discoveryPlan.discoveryEnvironments,
        customerLanguageHypotheses: discoveryPlan.customerLanguageHypotheses,
        confidence: module3Results.confidence,
        discoveryGap: module3Results.discoveryGap,
        discoveryExperiment: module3Results.nextExperiment,
        whatThisTellsUs: module3Results.whatThisTellsUs,
      },
    },
    evaluatedChannels: scored.map((c) => ({ channel: c.key, label: c.ref.label, presence: c.presence, constrained: c.constrained })),
    confidence,
    channelPlan: channelPlanArtifact,
    nextClubStep: { moduleLabel: NEXT_MODULE_LABEL, transition: TRANSITION_TO_MODULE_5, cta: `Continue to ${NEXT_MODULE_LABEL}` },
  };
}
