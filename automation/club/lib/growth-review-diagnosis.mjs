/**
 * Module 7's core diagnostic engine: signal classification, strongest
 * signal, the highest-upstream-constraint decision tree, confidence,
 * Repeat/Stop/Test, and Next Week's Focus.
 *
 * CORE DIAGNOSTIC MODEL: OFFER -> BUYER -> CHANNEL -> MESSAGE -> SALES PATH
 * -> SALE -> REVENUE. Find the highest-upstream MEANINGFUL constraint --
 * never optimize/diagnose downstream mechanics when upstream activity
 * itself is unconfirmed. Every branch below is evidence-gated: a stage is
 * only judged "weak" when it was actually MEASURED and reported zero/low;
 * an untracked stage produces Insufficient Data, never an assumed problem
 * (the exact guardrail behind "no qualified discovery + zero sales does NOT
 * become a conversion constraint").
 */

export const CONSTRAINT_LABELS = {
  insufficient_data: 'Insufficient Data',
  discovery_constraint: 'Discovery Constraint',
  message_interest_constraint: 'Message / Interest Constraint',
  cta_movement_constraint: 'CTA / Movement Constraint',
  conversion_trust_constraint: 'Conversion / Trust Constraint',
  economics_volume_constraint: 'Economics / Volume Constraint',
  capacity_constraint: 'Capacity Constraint',
  repeatability_constraint: 'Repeatability Constraint',
  path_healthy: 'Path Appears Healthy — Scale Current Winner',
};

function hasAny(metrics, pred) { return metrics.some(pred); }

/**
 * Ordered, highest-upstream-first, exactly like every prior module's
 * Fix-First/Discovery-Gap decision trees -- never manufactures a problem,
 * never optimizes downstream without confirmed upstream activity.
 */
export function determineConstraint({ didAnyActivity, attentionMetrics = [], intentMetrics = [], revenueUsd, salesCount, capacityConstrained, isHighTransactionCount, repeatabilityRegression }) {
  const revenuePositive = revenueUsd != null && revenueUsd > 0;
  const salesPositive = salesCount != null && salesCount > 0;
  const attentionKnownAny = hasAny(attentionMetrics, (m) => m.known);
  const attentionPositiveAny = hasAny(attentionMetrics, (m) => m.known && m.value > 0);
  const intentKnownAny = hasAny(intentMetrics, (m) => m.known);
  const intentPositiveAny = hasAny(intentMetrics, (m) => m.known && m.value > 0);
  const lastIntent = intentMetrics[intentMetrics.length - 1];
  const lastIntentPositive = !!(lastIntent && lastIntent.known && lastIntent.value > 0);

  if (!didAnyActivity && !attentionKnownAny && !intentKnownAny && revenueUsd == null && salesCount == null) {
    return { category: 'insufficient_data', label: CONSTRAINT_LABELS.insufficient_data, rationale: 'Nothing was reported for this period yet -- there is nothing here to diagnose from.' };
  }

  if (repeatabilityRegression && !revenuePositive && !salesPositive) {
    return { category: 'repeatability_constraint', label: CONSTRAINT_LABELS.repeatability_constraint, rationale: 'A prior review showed real sales/revenue, but this period did not reproduce it -- the win exists, but it has not yet become repeatable.' };
  }

  if (revenuePositive || salesPositive) {
    if (isHighTransactionCount) {
      return { category: 'economics_volume_constraint', label: CONSTRAINT_LABELS.economics_volume_constraint, rationale: 'Real sales are happening, but the transaction volume required at this price to reach $1,000 is high enough to be the actual constraint, not conversion.' };
    }
    return { category: 'path_healthy', label: CONSTRAINT_LABELS.path_healthy, rationale: 'Real sales/revenue occurred this period and nothing else in the evidence points to a constraint -- this looks like a winner worth scaling, not a problem to fix.' };
  }

  if (capacityConstrained === true && (intentPositiveAny || attentionPositiveAny)) {
    return { category: 'capacity_constraint', label: CONSTRAINT_LABELS.capacity_constraint, rationale: 'You reported more interest/demand than you could take on this period -- the constraint is execution/fulfillment capacity, not marketing.' };
  }

  if (attentionMetrics.length > 0 && !attentionKnownAny) {
    return { category: 'insufficient_data', label: CONSTRAINT_LABELS.insufficient_data, rationale: "We don't yet know whether qualified people are reaching you at all -- that has to be known before anything downstream can be diagnosed." };
  }
  if (attentionKnownAny && !attentionPositiveAny && !intentPositiveAny) {
    return { category: 'discovery_constraint', label: CONSTRAINT_LABELS.discovery_constraint, rationale: 'Not enough relevant people are currently reaching the business/offer to evaluate anything downstream yet.' };
  }

  if (intentMetrics.length > 0 && !intentKnownAny) {
    return { category: 'insufficient_data', label: CONSTRAINT_LABELS.insufficient_data, rationale: "Relevant discovery appears to exist, but we don't yet know whether it produced any real buying interest -- that has to be known before diagnosing conversion." };
  }
  if ((attentionPositiveAny || attentionMetrics.length === 0) && intentKnownAny && !intentPositiveAny) {
    return { category: 'message_interest_constraint', label: CONSTRAINT_LABELS.message_interest_constraint, rationale: 'Relevant discovery exists, but meaningful buying interest is weak -- the message/audience fit is the more likely lever than the path itself.' };
  }

  if (intentPositiveAny && !lastIntentPositive) {
    return { category: 'cta_movement_constraint', label: CONSTRAINT_LABELS.cta_movement_constraint, rationale: 'Interest exists, but people are not meaningfully progressing toward the final step of the buying path.' };
  }
  if (lastIntentPositive && !revenuePositive && !salesPositive) {
    return { category: 'conversion_trust_constraint', label: CONSTRAINT_LABELS.conversion_trust_constraint, rationale: 'Qualified consideration reached the final step of the path, but purchase/inquiry completion did not follow -- worth investigating trust/offer at that exact decision point.' };
  }

  return { category: 'insufficient_data', label: CONSTRAINT_LABELS.insufficient_data, rationale: 'The evidence reported this period does not clearly point to one specific constraint yet.' };
}

const SIGNAL_RANK = { revenue: 0, sales: 1, buying_intent: 2, attention: 3 };

/** Prefers the strongest downstream evidence available; never claims causation, never calls attention-only evidence a buying signal. */
export function determineStrongestSignal({ attentionMetrics = [], intentMetrics = [], revenueUsd, salesCount }) {
  if (revenueUsd != null && revenueUsd > 0) {
    return { label: 'Revenue', tier: 'revenue', rationale: `Real revenue ($${revenueUsd}) is the strongest evidence available this period.` };
  }
  if (salesCount != null && salesCount > 0) {
    return { label: 'Sales', tier: 'sales', rationale: `${salesCount} real sale(s)/order(s) is the strongest evidence available this period.` };
  }
  const positiveIntent = [...intentMetrics].reverse().find((m) => m.known && m.value > 0);
  if (positiveIntent) {
    return { label: positiveIntent.label, tier: 'buying_intent', rationale: `"${positiveIntent.label}" is your strongest observed buying-intent signal this period.` };
  }
  const positiveAttention = attentionMetrics.find((m) => m.known && m.value > 0);
  if (positiveAttention) {
    return { label: positiveAttention.label, tier: 'attention', rationale: `You generated real attention (${positiveAttention.label}), but there isn't yet enough downstream activity to identify a buying signal -- this is attention, not evidence of buying intent.` };
  }
  return { label: null, tier: 'none', rationale: "No meaningful signal -- attention or downstream -- was reported this period." };
}

export function classifyReviewConfidence({ constraintCategory, attributionState, hasMultipleReviews, patternConsistent }) {
  if (constraintCategory === 'insufficient_data') {
    return { key: 'insufficient_data', label: 'Insufficient Data', explanation: "There isn't enough reported evidence yet to responsibly diagnose what's limiting growth." };
  }
  if (attributionState === 'known' && hasMultipleReviews && patternConsistent) {
    return { key: 'evidence_backed', label: 'Evidence-Backed', explanation: 'This is based on real, attributed data that has shown a consistent pattern across more than one review.' };
  }
  if (attributionState === 'unknown' && !hasMultipleReviews) {
    return { key: 'working_hypothesis', label: 'Working Hypothesis', explanation: "This is a reasonable read of a single period with unattributed data -- worth testing, not yet a settled pattern." };
  }
  return { key: 'partially_validated', label: 'Partially Validated', explanation: 'Some real evidence supports this read, but not enough yet (in attribution or repetition) to call it fully confirmed.' };
}

// --- Repeat / Stop / Test / Next Week's Focus -------------------------------

export function determineRepeat({ constraint, strongestSignal, primaryChannelLabel, ranExperiments = [] }) {
  const items = [];
  for (const e of ranExperiments) {
    if (e.status === 'ran' && e.result) {
      items.push({ title: `Continue the "${e.experimentText}" experiment.`, rationale: `You ran it and it produced a real result: ${e.result}` });
    }
  }
  if (constraint.category === 'path_healthy' && strongestSignal.tier !== 'none') {
    items.push({ title: `Repeat what you did on ${primaryChannelLabel || 'your primary channel'} this period.`, rationale: 'Real sales/revenue resulted and no constraint was identified -- this is worth doing again, not changing.' });
  }
  if (strongestSignal.tier === 'buying_intent' || strongestSignal.tier === 'sales' || strongestSignal.tier === 'revenue') {
    items.push({ title: `Keep whatever produced "${strongestSignal.label}" -- it's your strongest real evidence this period.`, rationale: strongestSignal.rationale });
  }
  if (items.length === 0) {
    return [{ title: 'Not enough evidence yet to confidently repeat anything specific.', rationale: 'No meaningful positive signal was reported this period to justify repeating a specific action.' }];
  }
  // de-dup by title
  return [...new Map(items.map((i) => [i.title, i])).values()];
}

/** Conservative by design -- one poor result never justifies abandoning a channel; only a real, customer-declared signal (an experiment explicitly marked no-longer-relevant) triggers a STOP. */
export function determineStop({ experimentUpdates = [] }) {
  const resolved = experimentUpdates.filter((e) => e.status === 'no_longer_relevant');
  if (resolved.length === 0) {
    return [{ title: 'Nothing to stop yet.', rationale: 'No evidence of clearly misaligned effort, duplicated work, or a resolved experiment has surfaced yet.' }];
  }
  return resolved.map((e) => ({ title: `Stop the "${e.experimentText}" experiment.`, rationale: 'You indicated this is no longer relevant -- no need to keep spending effort on it.' }));
}

const TEST_BY_CONSTRAINT = {
  insufficient_data: 'Track the specific metrics relevant to your path for one more period before diagnosing anything further.',
  discovery_constraint: 'Send a small, deliberate amount of qualified traffic through your primary channel and confirm it actually reaches your destination.',
  message_interest_constraint: 'Test a different message/angle on your primary channel and see whether buying interest improves.',
  cta_movement_constraint: 'Simplify or clarify the next step from your channel to your destination and see whether movement improves.',
  conversion_trust_constraint: 'Place your strongest proof directly at the final decision point and see whether completion improves.',
  economics_volume_constraint: 'Test whether a repeat-purchase or bundle approach changes the transaction volume needed, rather than changing the path.',
  capacity_constraint: 'Test a small process change to handle existing demand before generating more of it.',
  repeatability_constraint: 'Deliberately repeat the exact activity that worked before and see whether the result reproduces.',
  path_healthy: 'Test putting slightly more effort behind exactly what worked, and confirm the result holds at a larger scale.',
};

/** ONE experiment, never five, never a 30-day plan -- prefers a genuinely unresolved prior-module experiment over inventing a new one. */
export function determineTest({ constraint, notRunExperiments = [] }) {
  const relevantSourceByConstraint = {
    discovery_constraint: 'module4_channel', message_interest_constraint: 'module5_messaging',
    cta_movement_constraint: 'module6_sales_path', conversion_trust_constraint: 'module6_sales_path',
  };
  const relevantSource = relevantSourceByConstraint[constraint.category];
  if (relevantSource) {
    const pending = notRunExperiments.find((e) => e.source === relevantSource);
    if (pending) return `Run the experiment you already have queued for this: "${pending.experimentText}"`;
  }
  return TEST_BY_CONSTRAINT[constraint.category] || TEST_BY_CONSTRAINT.insufficient_data;
}

const FOCUS_BY_CONSTRAINT = {
  insufficient_data: () => 'Establish basic tracking for your path before trying to optimize anything.',
  discovery_constraint: (ctx) => `Generate enough qualified reach from ${ctx.primaryChannelLabel} to have real activity to evaluate.`,
  message_interest_constraint: (ctx) => `Sharpen what you're saying on ${ctx.primaryChannelLabel} so it produces real buying interest, not just reach.`,
  cta_movement_constraint: (ctx) => `Make the next step from ${ctx.primaryChannelLabel} to ${ctx.destinationLabel} as obvious as possible.`,
  conversion_trust_constraint: (ctx) => `Get real proof visible right at ${ctx.destinationLabel} before changing anything else.`,
  economics_volume_constraint: () => 'Focus on transaction volume and repeat purchases -- the path itself is already working.',
  capacity_constraint: () => 'Prioritize fulfilling the demand you already have before generating more of it.',
  repeatability_constraint: () => 'Deliberately repeat exactly what produced the prior result before assuming anything else needs to change.',
  path_healthy: (ctx) => `Keep doing what worked on ${ctx.primaryChannelLabel} -- nothing here needs to change yet.`,
};

export function determineNextWeekFocus({ constraint, primaryChannelLabel, destinationLabel }) {
  const fn = FOCUS_BY_CONSTRAINT[constraint.category] || FOCUS_BY_CONSTRAINT.insufficient_data;
  return fn({ primaryChannelLabel: primaryChannelLabel || 'your primary channel', destinationLabel: destinationLabel || 'your destination' });
}
