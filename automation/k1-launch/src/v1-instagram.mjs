/**
 * V1 Instagram-first display vocabulary for the $1K Club + Challenge (2026-09-26).
 * The engine (club/lib Router funnels) stays multi-channel; this only relabels the top of each funnel
 * as Instagram activity for customer-facing text and the weekly check-in. One place, shared by the
 * Plan, This Week, and the Weekly Review adapter so labels always match.
 */

// Router funnel metric labels (module1 METRIC_BASELINE_LABELS) -> Instagram-first labels. Others pass through.
const METRIC_LABEL_V1 = {
  'Qualified reach/visits': 'Instagram reach',
  'Search impressions': 'Instagram reach',      // marketplace route: traffic comes from Instagram, not marketplace search
  'Local discovery views': 'Instagram profile visits', // local route: profile visits, not Maps views
};
export const v1MetricLabel = (label) => METRIC_LABEL_V1[label] || label;

// Funnel stage nouns for the Plan's "What it takes" (top-of-funnel stages only).
export const V1_TOP_STAGE_NOUN = 'people reached on Instagram';
export const V1_STAGE_NOUN = { local_discovery: 'Instagram profile visits' };

export const CROSS_POST_NOTE = 'Make the Reel once for Instagram. If useful, repost the finished video to TikTok and YouTube Shorts, or pin it to Pinterest, for extra reach. It still counts as 1 created.';
