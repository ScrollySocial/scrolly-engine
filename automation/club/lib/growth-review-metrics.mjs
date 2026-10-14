/**
 * Builds the reportable, business-model-adapted metric list for a Weekly
 * Growth Review directly from Module 6's ACTUAL measurement state
 * (`salesPath.measure`) -- never a generic universal analytics form.
 *
 * Each metric is tagged into the Signal Hierarchy (spec section 7):
 * 'attention' for Module 4's Early Evidence Signals (upstream, weaker
 * evidence -- impressions/saves/clicks-shaped) vs 'buying_intent' for the
 * sales path's own mid-funnel steps (stronger, already ordered from
 * earliest to most-downstream by Module 6 -- see sales-path-evaluation.mjs's
 * buildPathMetrics). Revenue itself is collected via a dedicated field
 * (not this list) since it's the strongest, final signal and has its own
 * $1K-target framing.
 */

/**
 * @param {string[]} measure - Module 6's salesPath.measure (already ordered upstream -> downstream, ending in 'Revenue')
 * @param {number} earlyEvidenceCount - Module 4's earlyEvidence.length (how many of `measure`'s leading entries are attention-tier)
 * @returns {Array<{label:string, tier:'attention'|'buying_intent', order:number}>}
 */
export function buildReportableMetrics({ measure = [], earlyEvidenceCount = 0 }) {
  const withoutRevenue = measure.filter((m) => m !== 'Revenue');
  return withoutRevenue.map((label, i) => ({
    label,
    tier: i < earlyEvidenceCount ? 'attention' : 'buying_intent',
    order: i,
  }));
}

/** Merges the customer's reported values onto the metric definitions, preserving unknown-vs-zero (never coerces missing to 0). */
export function mergeReportedMetrics(reportableMetrics, reportedPathMetrics = []) {
  const byLabel = new Map(reportedPathMetrics.map((m) => [m.label, m]));
  return reportableMetrics.map((m) => {
    const reported = byLabel.get(m.label);
    return { ...m, value: reported && reported.known ? reported.value : null, known: !!(reported && reported.known) };
  });
}
