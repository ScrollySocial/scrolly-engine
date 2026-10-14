/**
 * Architecture for ONE lightweight weekly Challenge review -- not a nightly
 * job, not an LLM call. Follows the pipeline the spec asks for exactly:
 *
 *   connected data -> deterministic metrics -> structured summary -> (small model call)
 *
 * This file implements the first three stages only. The fourth is a named,
 * documented hook (`MODEL_SUMMARY_HOOK_NOT_INVOKED`) that nothing calls in
 * this slice -- adding a real model call later is a config/wiring change
 * here, not a redesign. Computed on demand (e.g. on a Growth Review page
 * load), never on a schedule -- "runs only when sufficient data exists"
 * falls out naturally from being computed fresh each time, not cached or
 * cron-triggered.
 *
 * Reuses member-growth-state.mjs's existing analyzeWhenReady() gate rather
 * than inventing a second one -- missing required connections/metrics
 * short-circuits before any summarization happens, exactly the same
 * pattern the Overview page's sections already use.
 */
import { analyzeWhenReady } from './member-growth-state.mjs';

export const MODEL_SUMMARY_HOOK_NOT_INVOKED = 'not_invoked_in_this_slice';

function summarizePostedResults(results) {
  const known = (m) => m && m.state !== 'unknown';
  const byPlatform = {};
  for (const r of results) {
    const bucket = (byPlatform[r.platform] ||= { posted: 0, viewsKnown: 0, viewsTotal: 0 });
    bucket.posted += 1;
    if (known(r.metrics?.views)) {
      bucket.viewsKnown += 1;
      bucket.viewsTotal += r.metrics.views.value;
    }
  }
  const bestPerformingPlatform =
    Object.entries(byPlatform)
      .filter(([, v]) => v.viewsKnown > 0)
      .sort((a, b) => b[1].viewsTotal - a[1].viewsTotal)[0]?.[0] || null;

  return {
    postedThisPeriod: results.length,
    byPlatform,
    bestPerformingPlatform,
    modelSummary: MODEL_SUMMARY_HOOK_NOT_INVOKED,
  };
}

/**
 * @param {object} opts
 * @param {Array} opts.periodResults - this week's posted-opportunity results (already date-filtered by the caller)
 * @param {object} [opts.connectionsState] - member-growth-state.mjs's `connections` shape, for future requiredConnections use
 * @param {object} [opts.currentMetrics] - member-growth-state.mjs's `currentMetrics` shape
 * @param {string[]} [opts.requiredConnections]
 * @param {string[]} [opts.requiredMetrics]
 */
export async function computeWeeklyChallengeReview({ periodResults, connectionsState = {}, currentMetrics = {}, requiredConnections = [], requiredMetrics = [] }) {
  if (periodResults.length === 0) {
    return { status: 'not_enough_data', missingConnections: [], missingMetrics: [], reason: 'no_posted_results_this_period', analysis: null };
  }
  return analyzeWhenReady({
    state: { connections: connectionsState, currentMetrics },
    requiredConnections,
    requiredMetrics,
    analyze: async () => summarizePostedResults(periodResults),
  });
}
