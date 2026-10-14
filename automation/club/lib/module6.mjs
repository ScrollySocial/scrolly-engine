/**
 * Module 6 -- Turn Attention Into Sales (the Sales Path Builder).
 *
 * Reuses Module 1's BusinessProfile, Module 2's OfferPlan, Module 3's
 * DiscoveryPlan, Module 4's ChannelPlan, and Module 5's MessagingPlan
 * directly (via their own compute*Results functions) rather than re-asking
 * for or re-deriving anything. Nothing here touches module1-5.mjs -- all
 * five stay frozen. Module 4/5's own field names are read verbatim.
 *
 * MODULE 4 INTEGRATION RULE: Primary/Secondary are resource priority, not
 * dependency -- every selected channel gets its OWN path to the canonical
 * destination (see sales-path-evaluation.mjs's buildChannelPaths), never
 * chained through another channel.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { computeModule1Results } from './module1.mjs';
import { computeModule2Results } from './module2.mjs';
import { computeModule3Results } from './module3.mjs';
import { computeModule4Results } from './module4.mjs';
import { computeModule5Results } from './module5.mjs';
import {
  pickCanonicalDestination,
  needsQualificationStep,
  buildChannelPaths,
  classifyPathType,
  hasQualifiedActivityEvidence,
  evaluateNextStepClarity,
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
} from './sales-path-evaluation.mjs';

const STARTING_STATE_KEYS = { A: 'starting_from_zero', B: 'ready_to_sell', C: 'building_momentum' };
const MOBILE_HEAVY_CHANNEL_KEYS = ['instagram', 'tiktok', 'pinterest', 'facebook', 'threads'];

const NEXT_MODULE_LABEL = 'Module 7 — Find What Works & Do More of It';
const TRANSITION_TO_MODULE_7 =
  "Your marketing now has a path from discovery to purchase. Next, we'll build the simple review system that shows what's working, where the path is breaking, and what you should repeat, stop, or test next.";

/** Selected channels only (never Not Now), never duplicated across roles -- same shape/logic Module 5 already established for its own channel list. */
function selectedChannelsFrom(channelPlanArtifact) {
  const channels = [];
  if (channelPlanArtifact.primaryChannelKey) {
    channels.push({ key: channelPlanArtifact.primaryChannelKey, label: channelPlanArtifact.primaryChannel, job: channelPlanArtifact.primaryJob });
  }
  if (channelPlanArtifact.secondaryChannelKey) {
    channels.push({ key: channelPlanArtifact.secondaryChannelKey, label: channelPlanArtifact.secondaryChannel, job: channelPlanArtifact.secondaryJob });
  }
  if (channelPlanArtifact.compoundingAssetKey && !channelPlanArtifact.compoundingIsPrimary && !channelPlanArtifact.compoundingIsSecondary) {
    channels.push({ key: channelPlanArtifact.compoundingAssetKey, label: channelPlanArtifact.compoundingAsset, job: channelPlanArtifact.compoundingJob });
  }
  return channels;
}

/**
 * Pure function: BusinessProfile + OfferPlan + DiscoveryPlan + ChannelPlan +
 * MessagingPlan + SalesPathPlan -> the full Module 6 result. No I/O, no
 * caching, mirroring Module 1-5's compute*Results functions.
 */
export function computeModule6Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan, salesPathPlan) {
  const routeConfig = getRouteConfig(profile.route);
  const startingStateKey = STARTING_STATE_KEYS[profile.stage] || 'ready_to_sell';

  const module1Results = computeModule1Results(profile);
  const module2Results = computeModule2Results(profile, offerPlan);
  const module3Results = computeModule3Results(profile, offerPlan, discoveryPlan);
  const module4Results = computeModule4Results(profile, offerPlan, discoveryPlan, channelPlan);
  const module5Results = computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan);

  const topBuyingCriteria = module3Results.topBuyingCriteria;
  const canonicalDestination = pickCanonicalDestination(salesPathPlan.conversionDestinations);
  const needsQualification = needsQualificationStep({ route: profile.route, price: profile.price, topBuyingCriteria });

  const selectedChannels = selectedChannelsFrom(module4Results.channelPlan);
  const channelPaths = buildChannelPaths({ channels: selectedChannels, canonicalDestination, needsQualification });
  const pathType = classifyPathType(canonicalDestination);

  const hasActivity = hasQualifiedActivityEvidence({ profile, channelPlan, discoveryPlan, offerPlan });

  const offerClarityState = module2Results.dimensions.offerClarity.state;
  const proofTrustState = module2Results.dimensions.proofTrust.state;
  const hasObservedTrustObjection = discoveryPlan.objections.some((o) => o.basis === 'observed' && /trust|proof|fit|results/i.test(o.type));

  const primarySteps = channelPaths[0]?.steps || [];
  const nextStepClarity = evaluateNextStepClarity({ canonicalDestination, channelMessageMap: module5Results.messagingContentPlan.channelMessageMap });
  const purchaseContactAbility = evaluatePurchaseContactAbility({ conversionDestinations: salesPathPlan.conversionDestinations });
  const friction = evaluateContextualFriction({ route: profile.route, price: profile.price, needsQualification, pathSteps: primarySteps });
  const trustGuidance = buildTrustGuidance({ canonicalDestination, proofPlan: module5Results.messagingContentPlan.proofPlan });
  const ctaMap = buildCtaDestinationMap({ channelMessageMap: module5Results.messagingContentPlan.channelMessageMap, canonicalDestination });

  const primaryChannelKey = module4Results.channelPlan.primaryChannelKey;
  const mobileRelevant = MOBILE_HEAVY_CHANNEL_KEYS.includes(primaryChannelKey);

  const conversionApproach = determineConversionApproach({ route: profile.route, canonicalDestination, needsQualification, offerClarityState, proofTrustState, hasObservedTrustObjection });
  const followUpPlausiblyNeeded = conversionApproach.approach !== 'direct_conversion' && conversionApproach.approach !== 'marketplace_native';

  const gap = determineConversionGap({
    route: profile.route, canonicalDestination, hasActivity, ctaMap, friction, trustGuidance, offerClarityState,
    mobileStatus: salesPathPlan.mobileStatus, mobileRelevant, followUpMechanism: salesPathPlan.followUpMechanism, followUpPlausiblyNeeded,
  });

  const fixNow = determineFixNow(gap);
  const keep = determineKeep({ conversionApproach, canonicalDestination });
  const measureFirst = determineMeasureFirst({ gap, hasActivity });
  const salesPathExperiment = determineSalesPathExperiment({ gap, canonicalDestination, primaryChannelLabel: module4Results.channelPlan.primaryChannel });
  const metrics = buildPathMetrics({ earlyEvidence: module4Results.channelPlan.earlyEvidence, canonicalDestination });

  const salesPathArtifact = {
    primarySalesPath: channelPaths[0] || null,
    pathType,
    channelRevenuePaths: channelPaths,
    ctaDestinationMap: ctaMap,
    whatsWorking: [
      ...(purchaseContactAbility.state === 'customer_reported' ? ['A real purchase/contact mechanism is already reported to exist.'] : []),
      ...(friction.state === 'on_track' ? ['The number of steps is appropriately matched to this offer.'] : []),
      ...(keep.title ? [keep.title] : []),
    ],
    conversionGap: gap,
    frictionToRemove: friction.state === 'growth_opportunity' ? friction : null,
    trustAtDecisionPoint: trustGuidance,
    followUp: {
      mechanism: salesPathPlan.followUpMechanism,
      state: salesPathPlan.followUpMechanism === 'none' ? (followUpPlausiblyNeeded ? 'needed' : 'not_necessary_yet') : (salesPathPlan.followUpMechanism === 'not_necessary_yet' ? 'not_necessary_yet' : 'in_place'),
      rationale: salesPathPlan.followUpMechanism === 'none' && followUpPlausiblyNeeded
        ? 'This path involves more than a single direct purchase step, so a way to stay in touch with an interested-but-not-ready buyer is plausibly useful.'
        : 'A low-friction direct path does not necessarily need a separate follow-up system.',
    },
    thousandKConnection: {
      price: module1Results.math.price,
      salesRequired: module1Results.math.requiredSales,
      resultingRevenue: module1Results.math.resultingRevenue,
      interpretation: hasActivity
        ? 'This is what the sales path ultimately needs to produce.'
        : "This is what the sales path ultimately needs to produce -- conversion performance along this path still needs to be established with real activity, not assumed from planning scenarios.",
    },
    measure: metrics,
    fixNow,
    keep,
    measureFirst,
    conversionApproach,
    mobilePracticality: { status: salesPathPlan.mobileStatus, relevant: mobileRelevant },
    firstSalesPathExperiment: salesPathExperiment,
  };

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 6, total: 7 },
    carriedForward: {
      module1: { price: module1Results.math.price, salesRequired: module1Results.math.requiredSales, resultingRevenue: module1Results.math.resultingRevenue, dataConfidence: module1Results.dataConfidence },
      module2: { deliverable: offerPlan.whatTheyGet, positioning: offerPlan.selectedPositioning, offerClarity: module2Results.dimensions.offerClarity },
      module3: { likelyBuyer: discoveryPlan.buyerDescription, buyingTrigger: discoveryPlan.primaryTriggerCategory },
      module4: {
        primaryChannel: module4Results.channelPlan.primaryChannel, primaryJob: module4Results.channelPlan.primaryJob,
        secondaryChannel: module4Results.channelPlan.secondaryChannel, secondaryJob: module4Results.channelPlan.secondaryJob,
        earlyEvidence: module4Results.channelPlan.earlyEvidence,
      },
      module5: {
        coreMessage: module5Results.messagingContentPlan.coreMessage,
        ctaStrategy: module5Results.messagingContentPlan.ctaStrategy,
        proofPlan: module5Results.messagingContentPlan.proofPlan,
        objectionsToAddress: module5Results.messagingContentPlan.objectionsToAddress,
      },
    },
    salesPath: salesPathArtifact,
    nextClubStep: { moduleLabel: NEXT_MODULE_LABEL, transition: TRANSITION_TO_MODULE_7, cta: `Continue to ${NEXT_MODULE_LABEL}` },
  };
}
