/**
 * Module 7's auth/persistence orchestration -- mirrors module6-service.mjs's
 * shape, extended one level to require a completed Module 6 (a submitted
 * SalesPathPlan with at least one conversion destination -- the same
 * "is Module N actually done" signal every prior *-service.mjs already used
 * for the module before it). Modules 1-6 are frozen and untouched by this
 * file.
 *
 * UNLIKE every other module, submitGrowthReview() does not save raw inputs
 * and let a getResults() re-derive fresh forever -- a Growth Review's
 * diagnosis is computed ONCE (module7.mjs) and appended as a frozen record
 * (growth-review-store.mjs). getGrowthReviewState() only ever reads that
 * frozen history back; it never recomputes an existing review's diagnosis
 * from current Module 1-6 state.
 *
 * This slice deliberately does not build multi-review trend detection --
 * hasMultipleReviews/patternConsistent/repeatabilityRegression are always
 * forced false here regardless of how many prior reviews exist. See
 * module7.mjs's doc comment and growth-review-diagnosis.mjs's own params.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan } from './discovery-plan-store.mjs';
import { loadChannelPlan } from './channel-plan-store.mjs';
import { loadMessagingPlan } from './messaging-plan-store.mjs';
import { loadSalesPathPlan } from './sales-path-plan-store.mjs';
import { loadGrowthReviews, appendGrowthReview } from './growth-review-store.mjs';
import { newGrowthReviewInput, assertValidGrowthReviewInput } from './growth-review-schema.mjs';
import { computeUpstreamResults, computeGrowthReviewContext, computeGrowthReviewRecord, candidateExperiments } from './module7.mjs';
import { getChallengeState } from './challenge-service.mjs';
import { getOpportunityState } from './opportunity-service.mjs';
import { loadOpportunityResults } from './opportunity-assignment-store.mjs';
import { computeWeeklyChallengeReview } from './weekly-challenge-review.mjs';

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/** Module 7 depends on a completed Module 6 -- every prior module's own gate, cascaded one level further. */
async function loadPrerequisites(slug) {
  const member = await loadMember(slug);
  if (!member || !member.club.purchased) return { ok: false, reason: 'not_a_club_member' };
  if (!member.profileComplete) return { ok: false, reason: 'module1_not_complete' };
  const profile = await loadBusinessProfile(slug);
  if (!profile) return { ok: false, reason: 'module1_not_complete' };
  const offerPlan = await loadOfferPlan(slug);
  if (!offerPlan || !offerPlan.selectedPositioning) return { ok: false, reason: 'module2_not_complete' };
  const discoveryPlan = await loadDiscoveryPlan(slug);
  if (!discoveryPlan || (discoveryPlan.discoveryEnvironments || []).length === 0) return { ok: false, reason: 'module3_not_complete' };
  const channelPlan = await loadChannelPlan(slug);
  if (!channelPlan || channelPlan.marketingHoursPerWeek == null) return { ok: false, reason: 'module4_not_complete' };
  const messagingPlan = await loadMessagingPlan(slug);
  if (!messagingPlan || !messagingPlan.selectedCoreMessage) return { ok: false, reason: 'module5_not_complete' };
  const salesPathPlan = await loadSalesPathPlan(slug);
  if (!salesPathPlan || (salesPathPlan.conversionDestinations || []).length === 0) return { ok: false, reason: 'module6_not_complete' };
  return { ok: true, profile, offerPlan, discoveryPlan, channelPlan, messagingPlan, salesPathPlan };
}

const REVIEW_INPUT_FIELDS = Object.keys(newGrowthReviewInput());

/**
 * A plain, factual side-by-side of the two most recent reviews' raw
 * reported numbers -- NOT the deferred multi-review trend/pattern
 * detection (hasMultipleReviews/patternConsistent/repeatabilityRegression
 * stay forced false in computeGrowthReviewRecord, unchanged). This only
 * ever restates what was already reported; it never infers a pattern or
 * claims consistency across periods -- display, not inference.
 */
function priorPeriodComparison(history) {
  if (history.length < 2) return null;
  const latest = history[history.length - 1];
  const prior = history[history.length - 2];
  const diff = (a, b) => (a == null || b == null ? null : a - b);
  return {
    latestPeriod: { periodStart: latest.input.periodStart, periodEnd: latest.input.periodEnd },
    priorPeriod: { periodStart: prior.input.periodStart, periodEnd: prior.input.periodEnd },
    revenueUsd: { latest: latest.input.revenueUsd, prior: prior.input.revenueUsd, change: diff(latest.input.revenueUsd, prior.input.revenueUsd) },
    salesCount: { latest: latest.input.salesCount, prior: prior.input.salesCount, change: diff(latest.input.salesCount, prior.input.salesCount) },
  };
}

/**
 * Best-effort Challenge/opportunity context -- most members have never
 * touched the Challenge, so this must never fail the whole Growth Review
 * page. Returns nulls, not errors, when there's nothing to show.
 */
async function challengeContextFor(accessToken, slug) {
  const challenge = await getChallengeState(accessToken);
  if (!challenge.ok || !challenge.active) {
    return { challenge: null, opportunityProgress: null, weeklyChallengeReview: null };
  }
  const opportunities = await getOpportunityState(accessToken);
  const opportunityProgress = opportunities.ok ? opportunities.progress : null;

  const allResults = await loadOpportunityResults(slug);
  const attemptResults = allResults.filter((r) => r.challengeAttemptId === challenge.active.challengeId);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const periodResults = attemptResults.filter((r) => new Date(r.recordedAt).getTime() >= sevenDaysAgo);
  const weeklyChallengeReview = await computeWeeklyChallengeReview({ periodResults });

  return { challenge: challenge.active, opportunityProgress, weeklyChallengeReview };
}

/**
 * Everything the Growth Review page needs in one call: eligibility, prefill
 * context for a new review, the frozen history (oldest first, same order
 * growth-review-store.mjs persists it in), a factual prior-period
 * comparison, and current Challenge/opportunity context when applicable.
 * Deliberately consolidates what earlier modules split into /context +
 * /results into one route -- Growth Review has no "generate then select"
 * round trip, so a second round-trip call would buy nothing here.
 */
export async function getGrowthReviewState(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const upstream = computeUpstreamResults(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, prereq.messagingPlan, prereq.salesPathPlan);
  const history = await loadGrowthReviews(auth.slug);
  const challengeContext = await challengeContextFor(accessToken, auth.slug);

  return {
    ok: true,
    slug: auth.slug,
    context: computeGrowthReviewContext(upstream, prereq.salesPathPlan),
    reviewCount: history.length,
    latestReview: history.length ? history[history.length - 1] : null,
    priorPeriodComparison: priorPeriodComparison(history),
    history,
    ...challengeContext,
  };
}

function buildReviewInput(answers = {}) {
  const input = newGrowthReviewInput();
  for (const field of REVIEW_INPUT_FIELDS) {
    if (answers[field] !== undefined) input[field] = answers[field];
  }
  return input;
}

/**
 * The customer's POST only ever sends {source, status, result} per
 * experiment row -- experimentText is always overwritten here from the SAME
 * live module state computeUpstreamResults just read, so a stale or
 * spoofed client-supplied string can never end up frozen into history as if
 * it were the real experiment text. A submitted row whose source no longer
 * has a real, non-empty experiment (or was never a valid source) is dropped.
 */
function reconcileExperimentUpdates(submittedUpdates, upstream) {
  const candidates = new Map(candidateExperiments(upstream).map((c) => [c.source, c.experimentText]));
  return (submittedUpdates || [])
    .filter((u) => u && candidates.has(u.source))
    .map((u) => ({ source: u.source, experimentText: candidates.get(u.source), status: u.status, result: u.result ?? null }));
}

function isValidOptionalNonNegativeNumber(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

export async function submitGrowthReview({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const upstream = computeUpstreamResults(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, prereq.messagingPlan, prereq.salesPathPlan);

  const input = buildReviewInput(answers);
  input.experimentUpdates = reconcileExperimentUpdates(input.experimentUpdates, upstream);

  if (!input.periodStart || !input.periodEnd) return { ok: false, reason: 'missing_period' };
  if (input.periodEnd < input.periodStart) return { ok: false, reason: 'invalid_period_range' };
  if (!isValidOptionalNonNegativeNumber(input.revenueUsd)) return { ok: false, reason: 'invalid_revenueUsd' };
  if (!isValidOptionalNonNegativeNumber(input.salesCount)) return { ok: false, reason: 'invalid_salesCount' };

  try {
    assertValidGrowthReviewInput(input);
  } catch (err) {
    return { ok: false, reason: 'invalid_input', message: err.message };
  }

  // Deliberately forced false for this slice -- see this file's header and
  // module7.mjs's doc comment. Never derived from `history` (unused here).
  const record = computeGrowthReviewRecord(upstream, prereq.salesPathPlan, input, {
    hasMultipleReviews: false,
    patternConsistent: false,
    repeatabilityRegression: false,
  });

  const saved = await appendGrowthReview(auth.slug, record);
  return { ok: true, slug: auth.slug, review: saved };
}
