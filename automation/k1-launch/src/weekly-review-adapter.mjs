/**
 * Weekly Review adapter for the My Account launch (2026-09-26).
 *
 * Reuses Module 7's diagnosis engine (club/lib/growth-review-diagnosis.mjs) and
 * metric helpers (club/lib/growth-review-metrics.mjs) UNCHANGED. The only thing
 * this file replaces is the three inputs module7.mjs used to pull from Modules
 * 4 and 6, which the launch product doesn't have:
 *   - the metric list      -> Module 1's startingPointPlan.baselineMetrics (already route-specific)
 *   - attention vs intent  -> a fixed set of top-of-funnel labels (below)
 *   - channel/destination  -> what the customer told us in Start Here
 * Experiment suggestions (Modules 2-6) are not part of the launch, so experimentUpdates stays empty.
 */
import { buildReportableMetrics, mergeReportedMetrics } from '../../club/lib/growth-review-metrics.mjs';
import {
  determineConstraint, determineStrongestSignal, classifyReviewConfidence,
  determineRepeat, determineStop, determineTest, determineNextWeekFocus,
} from '../../club/lib/growth-review-diagnosis.mjs';

import { v1MetricLabel } from './v1-instagram.mjs';

// Top-of-funnel labels (module1.mjs METRIC_BASELINE_LABELS + the V1 Instagram relabels): seeing, not yet buying.
const ATTENTION_LABELS = new Set([
  'Qualified reach/visits', 'Product views', 'Audience engagement', 'Search impressions', 'Listing views', 'Local discovery views',
  'Instagram reach', 'Instagram profile visits',
]);

/** The metrics a customer is asked for in a weekly check-in, tagged attention / buying_intent, in funnel order (V1 Instagram labels). */
export function weeklyReviewMetrics(module1Results) {
  const measure = module1Results.startingPointPlan.baselineMetrics.map(v1MetricLabel);
  let earlyEvidenceCount = 0;
  for (const label of measure) { if (ATTENTION_LABELS.has(label)) earlyEvidenceCount++; else break; }
  return buildReportableMetrics({ measure, earlyEvidenceCount });
}

/**
 * One frozen weekly review record. Same output shape as module7.mjs's
 * computeGrowthReviewRecord (constraint, strongestSignal, confidence, repeat, stop, test, nextWeekFocus).
 * @param {object} module1Results - computeModule1Results(profile)
 * @param {{primaryChannelLabel?:string, destinationLabel?:string}} labels
 * @param {object} reviewInput - growth-review-schema.mjs newGrowthReviewInput() shape
 */
export function computeWeeklyReview(module1Results, labels, reviewInput) {
  const merged = mergeReportedMetrics(weeklyReviewMetrics(module1Results), reviewInput.pathMetrics);
  const attentionMetrics = merged.filter((m) => m.tier === 'attention');
  const intentMetrics = merged.filter((m) => m.tier === 'buying_intent');
  const primaryChannelLabel = labels.primaryChannelLabel || null;
  const destinationLabel = labels.destinationLabel || null;

  const constraint = determineConstraint({
    didAnyActivity: reviewInput.activity.actions.length > 0,
    attentionMetrics, intentMetrics,
    revenueUsd: reviewInput.revenueUsd, salesCount: reviewInput.salesCount,
    capacityConstrained: reviewInput.activity.capacityConstrained,
    isHighTransactionCount: module1Results.math.isHighTransactionCount,
    repeatabilityRegression: false, // multi-week detection is not part of the launch
  });
  const strongestSignal = determineStrongestSignal({ attentionMetrics, intentMetrics, revenueUsd: reviewInput.revenueUsd, salesCount: reviewInput.salesCount });
  return {
    input: reviewInput,
    reportableMetrics: merged,
    strongestSignal,
    constraint,
    confidence: classifyReviewConfidence({ constraintCategory: constraint.category, attributionState: reviewInput.revenueAttribution.state, hasMultipleReviews: false, patternConsistent: false }),
    repeat: determineRepeat({ constraint, strongestSignal, primaryChannelLabel, ranExperiments: [] }),
    stop: determineStop({ experimentUpdates: [] }),
    test: determineTest({ constraint, notRunExperiments: [] }),
    nextWeekFocus: determineNextWeekFocus({ constraint, primaryChannelLabel, destinationLabel }),
    context: { price: module1Results.math.price, requiredSales: module1Results.math.requiredSales, primaryChannelLabel, destinationLabel },
  };
}
