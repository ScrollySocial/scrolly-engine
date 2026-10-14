/**
 * Module 5 -- Give Them a Reason to Pay Attention (Messaging & Content
 * Builder).
 *
 * Reuses Module 1's BusinessProfile, Module 2's OfferPlan, Module 3's
 * DiscoveryPlan, and Module 4's ChannelPlan directly (via their own
 * compute*Results functions) rather than re-asking for or re-deriving
 * anything. Nothing here touches module1-4.mjs -- all four stay frozen.
 * Module 4's own field names (primaryChannel/primaryJob/secondaryChannel/
 * secondaryJob/compoundingAsset/notNow/availableCapacity/earlyEvidence/
 * strategySynthesis/channelExperiment) are read verbatim, not re-derived
 * under different names.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { computeModule1Results } from './module1.mjs';
import { computeModule2Results } from './module2.mjs';
import { computeModule3Results } from './module3.mjs';
import { computeModule4Results } from './module4.mjs';
import { generateMessageAngles } from './message-angle-generator.mjs';
import { prioritizeContentRoles } from './content-role-prioritizer.mjs';
import { buildChannelMessageMap } from './channel-message-map-builder.mjs';
import { buildProofPlan } from './proof-plan-builder.mjs';
import { buildObjectionMessaging } from './objection-messaging-builder.mjs';
import { generateStarterIdeas } from './idea-generator.mjs';
import { determineMessagingExperiment } from './messaging-experiment.mjs';

const STARTING_STATE_KEYS = { A: 'starting_from_zero', B: 'ready_to_sell', C: 'building_momentum' };

const NEXT_MODULE_LABEL = 'Module 6 — Turn Attention Into Sales';
const TRANSITION_TO_MODULE_6 =
  "Now we know what your business needs to communicate, where those messages belong, and how to keep generating relevant ideas. Next, we'll make sure that attention has a clear path toward becoming a sale.";

/** Never false certainty just because copy reads well -- reuses the same three labels every module uses. */
function classifyMessagingConfidence({ module3ConfidenceKey, hasObservedObjection, hasRealProof }) {
  if (module3ConfidenceKey === 'evidence_backed' && (hasObservedObjection || hasRealProof)) {
    return { key: 'evidence_backed', label: 'Evidence-Backed', explanation: 'This messaging strategy is grounded in real buyer evidence (an observed objection and/or real discovery-map evidence), not primarily owner assumption.' };
  }
  if (module3ConfidenceKey === 'working_hypothesis') {
    return { key: 'working_hypothesis', label: 'Working Hypothesis', explanation: "This is a reasonable starting strategy, but it's still built mostly on assumption -- treat it as something to test, not a settled fact." };
  }
  return { key: 'partially_validated', label: 'Partially Validated', explanation: 'Some real evidence supports this strategy, but not enough yet to call it fully confirmed.' };
}

/** Builds the { key, label, job } channel list Module 5 messages against -- Module 4's actual selection only, never Not Now channels, never a duplicate entry for a channel serving two roles. */
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
 * MessagingPlan -> the full Module 5 result. No I/O, no caching, mirroring
 * Module 1-4's compute*Results functions.
 */
export function computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan) {
  const routeConfig = getRouteConfig(profile.route);
  const startingStateKey = STARTING_STATE_KEYS[profile.stage] || 'ready_to_sell';

  const module2Results = computeModule2Results(profile, offerPlan);
  const module3Results = computeModule3Results(profile, offerPlan, discoveryPlan);
  const module4Results = computeModule4Results(profile, offerPlan, discoveryPlan, channelPlan);

  const topBuyingCriteria = module3Results.topBuyingCriteria;
  const hasRealRevenue = profile.currentRevenueUsd != null && profile.currentRevenueUsd > 0;
  const observedObjection = discoveryPlan.objections.find((o) => o.basis === 'observed') || null;

  const angles = generateMessageAngles({
    buyerDescription: discoveryPlan.buyerDescription,
    primaryTriggerCategory: discoveryPlan.primaryTriggerCategory,
    desiredResultFunctional: discoveryPlan.desiredResult.functional,
    differentiation: offerPlan.differentiation,
    topBuyingCriteria,
    objections: discoveryPlan.objections,
    proofInventory: offerPlan.proofInventory,
    module3ConfidenceKey: module3Results.confidence.key,
    hasRealRevenue,
  });

  const contentPriorities = prioritizeContentRoles({
    primaryTriggerCategory: discoveryPlan.primaryTriggerCategory,
    route: profile.route,
    startingStateKey,
    topBuyingCriteria,
    proofInventoryCount: offerPlan.proofInventory.length,
    hasFounderProof: offerPlan.proofInventory.some((p) => p.type === 'Founder expertise'),
    differentiationCategory: offerPlan.differentiation.category,
    objections: discoveryPlan.objections,
    offerClarityState: module2Results.dimensions.offerClarity.state,
    proofTrustState: module2Results.dimensions.proofTrust.state,
  });

  const selectedChannels = selectedChannelsFrom(module4Results.channelPlan);
  const coreMessage = messagingPlan.selectedCoreMessage;
  const channelMessageMap = buildChannelMessageMap({ channels: selectedChannels, feasibleFormats: channelPlan.feasibleFormats, coreMessage, angles });

  const proofPlan = buildProofPlan({ proofInventory: offerPlan.proofInventory, route: profile.route });
  const objectionsToAddress = buildObjectionMessaging(discoveryPlan.objections);
  const ctaStrategy = channelMessageMap.map((c) => ({ channel: c.channel, job: c.job, ctaCategory: c.ctaLabel, examples: c.ctaExamples }));

  const starterIdeas = generateStarterIdeas({
    channelEntries: channelMessageMap,
    angles,
    buyerDescription: discoveryPlan.buyerDescription,
    primaryTriggerCategory: discoveryPlan.primaryTriggerCategory,
    desiredResultFunctional: discoveryPlan.desiredResult.functional,
    objections: discoveryPlan.objections,
  });

  const firstMessagingExperiment = determineMessagingExperiment({
    primaryChannelLabel: module4Results.channelPlan.primaryChannel,
    observedObjection,
    customerLanguageHypotheses: discoveryPlan.customerLanguageHypotheses,
    angles,
    startingStateKey,
  });

  const confidence = classifyMessagingConfidence({
    module3ConfidenceKey: module3Results.confidence.key,
    hasObservedObjection: !!observedObjection,
    hasRealProof: offerPlan.proofInventory.length > 0,
  });

  const messagingContentPlan = {
    coreMessage,
    topMessageAngles: angles,
    contentPriorities,
    channelMessageMap,
    proofPlan,
    objectionsToAddress,
    ctaStrategy,
    reusableIdeaFormula: {
      formula: 'Buyer Trigger + Message Role + Message Angle + Channel Job + CTA',
      description: 'This is the same formula behind every idea above -- reusable any time to generate another idea from your own stored strategy, no fresh research required.',
    },
    starterIdeas,
    firstMessagingExperiment,
  };

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 5, total: 7 },
    carriedForward: {
      module1: { startingState: module4Results.carriedForward.module1.startingState, price: module4Results.carriedForward.module1.price, requiredSales: module4Results.carriedForward.module1.requiredSales },
      module2: { deliverable: module4Results.carriedForward.module2.deliverable, positioning: module4Results.carriedForward.module2.positioning, fixFirst: module4Results.carriedForward.module2.fixFirst, keep: module4Results.carriedForward.module2.keep, learn: module4Results.carriedForward.module2.learn },
      module3: { likelyBuyer: module4Results.carriedForward.module3.likelyBuyer, buyingTrigger: module4Results.carriedForward.module3.buyingTrigger, desiredResult: module4Results.carriedForward.module3.desiredResult, topBuyingCriteria: module4Results.carriedForward.module3.topBuyingCriteria },
      module4: {
        primaryChannel: module4Results.channelPlan.primaryChannel, primaryJob: module4Results.channelPlan.primaryJob,
        secondaryChannel: module4Results.channelPlan.secondaryChannel, secondaryJob: module4Results.channelPlan.secondaryJob,
        compoundingAsset: module4Results.channelPlan.compoundingAsset,
        notNow: module4Results.channelPlan.notNow,
        availableCapacity: module4Results.channelPlan.availableCapacity,
        formatsToLeanInto: module4Results.channelPlan.formatsToLeanInto,
        earlyEvidence: module4Results.channelPlan.earlyEvidence,
        channelStrategy: module4Results.channelPlan.strategySynthesis,
        channelExperiment: module4Results.channelPlan.channelExperiment,
        channelConfidence: module4Results.confidence,
      },
    },
    confidence,
    messagingContentPlan,
    nextClubStep: { moduleLabel: NEXT_MODULE_LABEL, transition: TRANSITION_TO_MODULE_6, cta: `Continue to ${NEXT_MODULE_LABEL}` },
  };
}
