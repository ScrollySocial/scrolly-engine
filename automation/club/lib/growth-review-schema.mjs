/**
 * Module 7 (Find What Works & Do More of It) -- the Weekly Growth Review
 * INPUT schema.
 *
 * ARCHITECTURAL NOTE (a deliberate departure from Modules 1-6's pattern):
 * every prior module's "plan" holds decisions, and its "results" are always
 * re-derived fresh from CURRENT Module 1-N state -- there is only one
 * "current" Offer/Discovery Map/Channel Plan/Sales Path. A Weekly Growth
 * Review is different: it is a HISTORICAL EVENT ("what we determined for
 * the week of X"), not current state. If it were re-derived from
 * ever-changing Module 1-6 state, old reviews would silently rewrite their
 * own diagnosis whenever the customer later edited their offer/channel/
 * messaging -- corrupting the historical record and breaking week-over-week
 * comparison. So a review's full diagnosis is computed ONCE at submission
 * time (module7.mjs) and persisted verbatim as part of the review record
 * (growth-review-store.mjs) -- never recomputed on later reads. This file
 * defines only the INPUT half: what the customer actually reports for one
 * review period. See module7.mjs for the frozen OUTPUT record shape.
 *
 * UNKNOWN vs ZERO is structural, not incidental: revenueUsd/salesCount are
 * `null` for "not tracked," never coerced to 0; each pathMetrics entry
 * carries its own explicit `known` flag alongside `value`.
 */

export const ACTIVITY_ACTION_TYPES = /** @type {const} */ ([
  'published_content', 'sent_outreach', 'updated_listing', 'ran_messaging_experiment',
  'changed_cta', 'added_proof', 'did_nothing', 'other',
]);

export const EXPERIMENT_STATUSES = /** @type {const} */ (['ran', 'partially_ran', 'not_run', 'no_longer_relevant']);

export const ATTRIBUTION_STATES = /** @type {const} */ (['known', 'partially_known', 'unknown']);

// Matches the modules that actually persist/derive an experiment string --
// never invented; module7-service.mjs only surfaces one of these when the
// corresponding module's real experiment text is non-empty.
export const EXPERIMENT_SOURCES = /** @type {const} */ ([
  'module2_offer', 'module3_discovery', 'module4_channel', 'module5_messaging', 'module6_sales_path',
]);

export function newGrowthReviewInput() {
  return {
    periodStart: null,   // ISO date string (yyyy-mm-dd)
    periodEnd: null,     // ISO date string (yyyy-mm-dd)
    activity: {
      channelsUsed: [],          // channel keys actually used this period (subset of Module 4's selected channels)
      actions: [],                // ACTIVITY_ACTION_TYPES
      capacityConstrained: null,  // boolean|null -- "did you have more demand/interest than you could take on?" -- asked directly, never inferred
      notes: null,                 // small free text, optional -- not an essay
    },
    revenueUsd: null,      // number or null ("unknown/not tracked" -- never coerced to 0)
    salesCount: null,      // number or null
    pathMetrics: [],       // [{ label, value: number|null, known: boolean }] -- one per Module 6 measurement point (Revenue excluded, collected via revenueUsd above)
    revenueAttribution: {
      state: 'unknown',    // one of ATTRIBUTION_STATES
      breakdown: [],        // [{ source, amountUsd }] -- only meaningful when state !== 'unknown'; never invented
    },
    experimentUpdates: [], // [{ source, experimentText, status, result }] -- experimentText is a frozen snapshot of the module's real experiment string at submission time
  };
}

export function assertValidGrowthReviewInput(input) {
  const required = Object.keys(newGrowthReviewInput());
  for (const key of required) {
    if (!(key in input)) throw new Error(`GrowthReviewInput missing required field "${key}"`);
  }
  for (const a of input.activity.actions) {
    if (!ACTIVITY_ACTION_TYPES.includes(a)) throw new Error(`GrowthReviewInput activity action "${a}" is not one of: ${ACTIVITY_ACTION_TYPES.join(', ')}`);
  }
  if (!ATTRIBUTION_STATES.includes(input.revenueAttribution.state)) {
    throw new Error(`GrowthReviewInput revenueAttribution.state "${input.revenueAttribution.state}" is not one of: ${ATTRIBUTION_STATES.join(', ')}`);
  }
  for (const e of input.experimentUpdates) {
    if (!EXPERIMENT_STATUSES.includes(e.status)) throw new Error(`GrowthReviewInput experiment status "${e.status}" is not one of: ${EXPERIMENT_STATUSES.join(', ')}`);
  }
  return true;
}
