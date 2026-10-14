/**
 * Opportunity assignment/execution auth + orchestration. Gates on an
 * ACTIVE Challenge attempt (reuses challenge-service.mjs -- never
 * re-derives eligibility) -- once a Challenge attempt is no longer
 * 'active' (completed/expired/claim_available/etc.), new recommendations
 * stop and planning/posting against that attempt's assignments stops too
 * ("stop active Challenge execution state", per the spec) -- recording a
 * RESULT for something already posted stays allowed regardless, since a
 * customer checking results a few days after the window closes is normal.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadChannelPlan } from './channel-plan-store.mjs';
import { getLatestGrowthReview } from './growth-review-store.mjs';
import { getChallengeState } from './challenge-service.mjs';
import { OPPORTUNITY_CATALOG, PLATFORMS } from './opportunity-catalog.mjs';
import { recommendOpportunities } from './opportunity-ranking.mjs';
import { newAssignment } from './opportunity-assignment-schema.mjs';
import { loadAssignments, addAssignments, updateAssignmentState, appendOpportunityResult } from './opportunity-assignment-store.mjs';

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

async function requireActiveChallenge(accessToken) {
  const state = await getChallengeState(accessToken);
  if (!state.ok) return { ok: false, reason: state.reason };
  if (!state.active) return { ok: false, reason: 'no_active_challenge' };
  return { ok: true, slug: state.slug, activeChallengeId: state.active.challengeId, day: state.active.day, windowDays: state.active.windowDays };
}

// 2026-09-16: real weekly delivery, not a flat list shown all at once.
// 4 attempt-relative weekly unlocks (day 1-7 / 8-14 / 15-21 / 22-30), each
// revealing WEEKLY_OPPORTUNITY_BUDGET more ranked opportunities than the
// last -- cumulative, so nothing already unlocked ever disappears.
// Idempotent addAssignments() already means calling this again never
// duplicates or resets what a member already has; this only changes how
// much of the ranked list is eligible to be assigned in the first place.
const WEEKLY_OPPORTUNITY_BUDGET = 4;
function weekNumberForDay(day) {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

/** Real Module 4 capacity input, reused rather than asking a new question -- <5h/week: low, 5-15h: medium, >15h: high. */
function capacityFromChannelPlan(channelPlan) {
  const hours = channelPlan?.marketingHoursPerWeek;
  if (hours == null) return 'medium';
  if (hours < 5) return 'low';
  if (hours <= 15) return 'medium';
  return 'high';
}

function withOpportunityContent(assignment) {
  const opportunity = OPPORTUNITY_CATALOG.find((o) => o.opportunityId === assignment.opportunityId);
  if (!opportunity) return { ...assignment, opportunity: null };
  return {
    ...assignment,
    opportunity: {
      coreConcept: opportunity.coreConcept,
      hookAngle: opportunity.hookAngle,
      funnelJob: opportunity.funnelJob,
      difficulty: opportunity.difficulty,
      shelfLife: opportunity.shelfLife,
      adaptation: opportunity.platformAdaptations.find((p) => p.platform === assignment.platform) || null,
    },
  };
}

/**
 * Returns (and, the first time, persists) this attempt's recommended
 * subset -- never the whole catalog. Idempotent: calling it again with the
 * same inputs recommends nothing new (already-assigned opportunities are
 * skipped), so it's safe to call on every page load.
 */
export async function getOpportunityState(accessToken, { activePlatforms } = {}) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const gate = await requireActiveChallenge(accessToken);
  if (!gate.ok) return gate;

  const profile = await loadBusinessProfile(auth.slug);
  if (!profile) return { ok: false, reason: 'module1_not_complete' };
  const channelPlan = await loadChannelPlan(auth.slug);
  const latestReview = await getLatestGrowthReview(auth.slug);
  const constraintCategory = latestReview?.constraint?.category || null;
  const contentCapacity = capacityFromChannelPlan(channelPlan);
  const platforms = activePlatforms && activePlatforms.length ? activePlatforms : PLATFORMS.slice();

  const existing = await loadAssignments(auth.slug);
  const alreadyAssignedKeys = new Set(
    existing.filter((a) => a.challengeAttemptId === gate.activeChallengeId).map((a) => `${a.opportunityId}::${a.platform}`),
  );

  const week = weekNumberForDay(gate.day);
  const unlockedCount = week * WEEKLY_OPPORTUNITY_BUDGET;
  // recommendOpportunities defaults to limit:8 internally -- must pass the
  // real unlocked count explicitly, or week 3/4 would silently stay capped
  // at 8 regardless of how many weeks have actually unlocked.
  const recommended = recommendOpportunities(OPPORTUNITY_CATALOG, { businessModel: profile.route, activePlatforms: platforms, constraintCategory, contentCapacity, limit: unlockedCount });

  const toAssign = [];
  for (const opportunity of recommended) {
    for (const platform of platforms) {
      if (!opportunity.platformAdaptations.some((p) => p.platform === platform)) continue;
      const key = `${opportunity.opportunityId}::${platform}`;
      if (alreadyAssignedKeys.has(key)) continue;
      toAssign.push(newAssignment({ challengeAttemptId: gate.activeChallengeId, opportunityId: opportunity.opportunityId, platform }));
    }
  }
  const allAssignments = toAssign.length ? await addAssignments(auth.slug, toAssign) : existing;
  // A real, confirmed bug found in testing: this used to return every
  // assignment ever created for the attempt regardless of the CURRENT
  // activePlatforms filter, so switching focus track (e.g. Instagram to
  // LinkedIn) never actually narrowed what showed here -- once any platform
  // was assigned, it stayed visible forever. Filtering the return set (not
  // just what gets newly assigned) makes the visible list track the
  // member's current chosen track, while the underlying assignment record
  // (state, plannedAt, postedAt) is never deleted -- switching back to a
  // previous track still shows prior progress on it.
  const requestedPlatforms = activePlatforms && activePlatforms.length ? new Set(activePlatforms) : null;
  const thisAttempt = allAssignments
    .filter((a) => a.challengeAttemptId === gate.activeChallengeId)
    .filter((a) => !requestedPlatforms || requestedPlatforms.has(a.platform))
    .map(withOpportunityContent);

  return {
    ok: true,
    slug: auth.slug,
    challengeAttemptId: gate.activeChallengeId,
    assignments: thisAttempt,
    week,
    // First day of the next week's unlock, or null once week 4 (the last)
    // is already showing everything this attempt will ever unlock.
    nextUnlockDay: week < 4 ? week * 7 + 1 : null,
    progress: {
      recommended: thisAttempt.filter((a) => a.state === 'recommended').length,
      planned: thisAttempt.filter((a) => a.state === 'planned').length,
      posted: thisAttempt.filter((a) => a.state === 'posted').length,
    },
  };
}

async function requireOwnActiveAssignment(accessToken, assignmentId) {
  const gate = await requireActiveChallenge(accessToken);
  if (!gate.ok) return gate;
  const assignments = await loadAssignments(gate.slug);
  const assignment = assignments.find((a) => a.assignmentId === assignmentId);
  if (!assignment) return { ok: false, reason: 'assignment_not_found' };
  if (assignment.challengeAttemptId !== gate.activeChallengeId) return { ok: false, reason: 'assignment_not_in_active_attempt' };
  return { ok: true, slug: gate.slug };
}

export async function planOpportunity(accessToken, { assignmentId }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const owns = await requireOwnActiveAssignment(accessToken, assignmentId);
  if (!owns.ok) return owns;
  const updated = await updateAssignmentState(owns.slug, assignmentId, { state: 'planned', plannedAt: new Date().toISOString() });
  return { ok: true, assignment: withOpportunityContent(updated) };
}

export async function markOpportunityPosted(accessToken, { assignmentId }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const owns = await requireOwnActiveAssignment(accessToken, assignmentId);
  if (!owns.ok) return owns;
  const updated = await updateAssignmentState(owns.slug, assignmentId, { state: 'posted', postedAt: new Date().toISOString() });
  return { ok: true, assignment: withOpportunityContent(updated) };
}

const RESULT_METRIC_KEYS = ['views', 'engagement', 'followersGained', 'siteClicks', 'leadsOrSales'];

/** Preserves unknown vs. a real zero, same discipline as every other metric in this codebase. */
function normalizeResultMetrics(raw = {}) {
  const out = {};
  for (const key of RESULT_METRIC_KEYS) {
    const v = raw[key];
    if (v === null || v === undefined || v === '') { out[key] = { value: null, state: 'unknown' }; continue; }
    const num = Number(v);
    if (!Number.isFinite(num) || num < 0) throw new Error(`Invalid ${key}: must be a non-negative number or omitted`);
    out[key] = { value: num, state: num === 0 ? 'zero' : 'known' };
  }
  return out;
}

/** Not gated on the attempt still being active -- checking results after the window closes is normal and always allowed for a customer's own posted item. */
export async function recordOpportunityResult(accessToken, { assignmentId, metrics }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const assignments = await loadAssignments(auth.slug);
  const assignment = assignments.find((a) => a.assignmentId === assignmentId);
  if (!assignment) return { ok: false, reason: 'assignment_not_found' };
  if (assignment.state !== 'posted') return { ok: false, reason: 'assignment_not_posted' };

  let normalized;
  try {
    normalized = normalizeResultMetrics(metrics);
  } catch (err) {
    return { ok: false, reason: 'invalid_metrics', message: err.message };
  }
  const record = await appendOpportunityResult(auth.slug, {
    assignmentId, opportunityId: assignment.opportunityId, challengeAttemptId: assignment.challengeAttemptId, platform: assignment.platform,
    metrics: normalized,
  });
  return { ok: true, result: record };
}
