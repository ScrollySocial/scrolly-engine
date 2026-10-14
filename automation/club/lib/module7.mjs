/**
 * Module 7 -- Find What Works & Do More of It (the Weekly Growth Review).
 *
 * Pure computation only, mirroring Modules 1-6's compute*Results shape, with
 * one deliberate exception: computeGrowthReviewRecord() is meant to be
 * called ONCE, at submission time, and its result frozen into history by
 * growth-review-store.mjs -- never recomputed on a later read. See
 * growth-review-schema.mjs's header for why (a review is a historical
 * event, not current state that should silently rewrite itself when the
 * customer later edits their offer/channel/messaging).
 * computeUpstreamResults()/computeGrowthReviewContext() have no such
 * restriction -- they're read-only prefill data, safe to call on every page
 * load, same as every other module's getContext().
 *
 * Reuses Module 1-6's own compute*Results functions verbatim -- nothing
 * here re-derives Offer/Discovery/Channel/Messaging/SalesPath logic, and the
 * diagnosis itself (growth-review-diagnosis.mjs) is fully deterministic --
 * no LLM is used anywhere in this file or anything it calls.
 */
import { computeModule1Results } from './module1.mjs';
import { computeModule2Results } from './module2.mjs';
import { computeModule3Results } from './module3.mjs';
import { computeModule4Results } from './module4.mjs';
import { computeModule5Results } from './module5.mjs';
import { computeModule6Results } from './module6.mjs';
import { pickCanonicalDestination } from './sales-path-evaluation.mjs';
import { buildReportableMetrics, mergeReportedMetrics } from './growth-review-metrics.mjs';
import {
  determineConstraint,
  determineStrongestSignal,
  classifyReviewConfidence,
  determineRepeat,
  determineStop,
  determineTest,
  determineNextWeekFocus,
} from './growth-review-diagnosis.mjs';

const EXPERIMENT_SOURCE_LABELS = {
  module2_offer: 'Module 2 — Your Offer',
  module3_discovery: 'Module 3 — Customer Discovery Map',
  module4_channel: 'Module 4 — Channel Plan',
  module5_messaging: 'Module 5 — Messaging & Content Plan',
  module6_sales_path: 'Module 6 — Sales Path',
};

/** Computes every upstream module's result ONCE. Pure, no I/O -- callers own persistence. */
export function computeUpstreamResults(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan, salesPathPlan) {
  const module1Results = computeModule1Results(profile);
  const module2Results = computeModule2Results(profile, offerPlan);
  const module3Results = computeModule3Results(profile, offerPlan, discoveryPlan);
  const module4Results = computeModule4Results(profile, offerPlan, discoveryPlan, channelPlan);
  const module5Results = computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan);
  const module6Results = computeModule6Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan, salesPathPlan);
  return { module1Results, module2Results, module3Results, module4Results, module5Results, module6Results };
}

function destinationLabelFor(salesPathPlan) {
  const destination = pickCanonicalDestination(salesPathPlan.conversionDestinations);
  return destination?.template?.label || null;
}

/**
 * Only ever surfaces a source whose real, already-computed experiment text
 * is non-empty -- never invents one. Matches EXPERIMENT_SOURCES in
 * growth-review-schema.mjs exactly (5 sources, one per Module 2-6).
 */
export function candidateExperiments(upstream) {
  const bySource = {
    module2_offer: upstream.module2Results.yourOffer.nextExperiment,
    module3_discovery: upstream.module3Results.nextExperiment,
    module4_channel: upstream.module4Results.channelPlan.channelExperiment,
    module5_messaging: upstream.module5Results.messagingContentPlan.firstMessagingExperiment,
    module6_sales_path: upstream.module6Results.salesPath.firstSalesPathExperiment,
  };
  return Object.entries(bySource)
    .filter(([, text]) => !!text)
    .map(([source, experimentText]) => ({ source, label: EXPERIMENT_SOURCE_LABELS[source], experimentText }));
}

/** Read-only prefill data for the intake form. Safe to call on every page load. */
export function computeGrowthReviewContext(upstream, salesPathPlan) {
  const { module1Results, module4Results, module6Results } = upstream;
  const channelPlan = module4Results.channelPlan;
  return {
    thousandKMath: {
      price: module1Results.math.price,
      requiredSales: module1Results.math.requiredSales,
      resultingRevenue: module1Results.math.resultingRevenue,
    },
    availableChannels: [
      channelPlan.primaryChannelKey ? { key: channelPlan.primaryChannelKey, label: channelPlan.primaryChannel, role: 'primary' } : null,
      channelPlan.secondaryChannelKey ? { key: channelPlan.secondaryChannelKey, label: channelPlan.secondaryChannel, role: 'secondary' } : null,
      channelPlan.compoundingAssetKey ? { key: channelPlan.compoundingAssetKey, label: channelPlan.compoundingAsset, role: 'compounding' } : null,
    ].filter(Boolean),
    reportableMetrics: buildReportableMetrics({
      measure: module6Results.salesPath.measure,
      earlyEvidenceCount: (channelPlan.earlyEvidence || []).length,
    }),
    candidateExperiments: candidateExperiments(upstream),
    primaryChannelLabel: channelPlan.primaryChannel || null,
    destinationLabel: destinationLabelFor(salesPathPlan),
  };
}

/**
 * Computes ONE frozen Growth Review record from an already-validated
 * GrowthReviewInput (see growth-review-schema.mjs). historyContext carries
 * the deliberately-false-for-this-slice trend flags -- this slice does not
 * build multi-review pattern/repeatability detection (see the module-level
 * doc comment); callers must not compute real values for these yet.
 */
export function computeGrowthReviewRecord(upstream, salesPathPlan, reviewInput, historyContext = {}) {
  const { module1Results, module4Results, module6Results } = upstream;
  const hasMultipleReviews = historyContext.hasMultipleReviews ?? false;
  const patternConsistent = historyContext.patternConsistent ?? false;
  const repeatabilityRegression = historyContext.repeatabilityRegression ?? false;

  const reportableMetrics = buildReportableMetrics({
    measure: module6Results.salesPath.measure,
    earlyEvidenceCount: (module4Results.channelPlan.earlyEvidence || []).length,
  });
  const mergedMetrics = mergeReportedMetrics(reportableMetrics, reviewInput.pathMetrics);
  const attentionMetrics = mergedMetrics.filter((m) => m.tier === 'attention');
  const intentMetrics = mergedMetrics.filter((m) => m.tier === 'buying_intent');

  // Reporting "did_nothing" is still a real, honest report -- distinct from
  // not answering at all -- so any non-empty actions list counts as activity.
  const didAnyActivity = reviewInput.activity.actions.length > 0;
  const primaryChannelLabel = module4Results.channelPlan.primaryChannel || null;
  const destinationLabel = destinationLabelFor(salesPathPlan);

  const constraint = determineConstraint({
    didAnyActivity,
    attentionMetrics,
    intentMetrics,
    revenueUsd: reviewInput.revenueUsd,
    salesCount: reviewInput.salesCount,
    capacityConstrained: reviewInput.activity.capacityConstrained,
    isHighTransactionCount: module1Results.math.isHighTransactionCount,
    repeatabilityRegression,
  });

  const strongestSignal = determineStrongestSignal({
    attentionMetrics,
    intentMetrics,
    revenueUsd: reviewInput.revenueUsd,
    salesCount: reviewInput.salesCount,
  });

  const confidence = classifyReviewConfidence({
    constraintCategory: constraint.category,
    attributionState: reviewInput.revenueAttribution.state,
    hasMultipleReviews,
    patternConsistent,
  });

  const notRunExperiments = reviewInput.experimentUpdates.filter((e) => e.status === 'not_run');

  return {
    input: reviewInput,
    reportableMetrics: mergedMetrics,
    strongestSignal,
    constraint,
    confidence,
    repeat: determineRepeat({ constraint, strongestSignal, primaryChannelLabel, ranExperiments: reviewInput.experimentUpdates }),
    stop: determineStop({ experimentUpdates: reviewInput.experimentUpdates }),
    test: determineTest({ constraint, notRunExperiments }),
    nextWeekFocus: determineNextWeekFocus({ constraint, primaryChannelLabel, destinationLabel }),
    context: {
      price: module1Results.math.price,
      requiredSales: module1Results.math.requiredSales,
      resultingRevenue: module1Results.math.resultingRevenue,
      primaryChannelLabel,
      destinationLabel,
    },
    // Frozen alongside the record so a later reader can see this review was
    // never claiming a multi-period pattern -- never recomputed afterward.
    trendContext: { hasMultipleReviews, patternConsistent, repeatabilityRegression },
  };
}
