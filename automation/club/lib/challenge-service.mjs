/**
 * Challenge auth/persistence orchestration. Reuses club-state.mjs's
 * existing challenge/achievement data model verbatim (frozen, untouched)
 * and member-growth-state.mjs's existing (previously unwired)
 * startChallengeSnapshot()/currentMetrics -- this file is the wiring
 * between two already-built, previously-disconnected systems, not a new
 * data model.
 *
 * 2026-09-15 sprint: startChallengeAttempt() now requires a real, unused
 * $25 product-280 WooCommerce order (see findAvailableChallengeOrder in
 * club-order-verify.mjs) -- Club membership alone is no longer sufficient
 * to start a paid attempt. getChallengeState() (read-only) deliberately
 * still only requires Club membership -- viewing existing Challenge
 * history should never cost a live WooCommerce round trip.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadMember, startChallenge, recordAchievementClaim, recordRewardChoice } from './club-state.mjs';
import { createMemberGrowthStore, startChallengeSnapshot } from './member-growth-state.mjs';
import { captureFinalSnapshotOnce, getChallengeCompletion } from './challenge-completion-store.mjs';
import { computeChallengeStatus, dayNumber, revenueGoalSignal, CHALLENGE_WINDOW_DAYS, CHALLENGE_REVENUE_GOAL_USD } from './challenge-lifecycle.mjs';
import { findAvailableChallengeOrder } from './club-order-verify.mjs';

export const CHALLENGE_PRODUCT_ID = 280; // "$1K Challenge" -- confirm in wp-admin before relying on this.

const growthStore = createMemberGrowthStore();

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

async function loadEligibility(slug) {
  const member = await loadMember(slug);
  if (!member || !member.club.purchased) return { ok: false, reason: 'not_a_club_member' };
  return { ok: true, member };
}

function findStartSnapshot(growthState, challengeId) {
  return (growthState.challengeStarts || []).find((s) => s.challengeId === challengeId) || null;
}

function buildView(challenge, growthState) {
  const startSnapshot = findStartSnapshot(growthState, challenge.challengeId);
  const startRevenue = startSnapshot?.metrics?.revenueUsd ?? null;
  const currentRevenue = growthState.currentMetrics?.revenueUsd ?? null;
  const goalSignal = revenueGoalSignal(startRevenue, currentRevenue);
  const status = computeChallengeStatus(challenge, goalSignal);
  return {
    challengeId: challenge.challengeId,
    startedAt: challenge.startedAt,
    day: dayNumber(challenge),
    windowDays: CHALLENGE_WINDOW_DAYS,
    status,
    goal: { usd: CHALLENGE_REVENUE_GOAL_USD, known: goalSignal.known, gained: goalSignal.gained, met: goalSignal.met },
    achievement: {
      qualified: challenge.achievement.qualified,
      verified: challenge.achievement.verified,
      rewardChoice: challenge.achievement.rewardChoice,
      merchUnlocked: challenge.achievement.merchUnlocked,
    },
    hasStartSnapshot: !!startSnapshot,
  };
}

const TERMINAL_STATUSES = ['completed', 'claim_available', 'expired', 'stripe_submitted', 'stripe_verified'];

/** Everything the Challenge UI needs: full history (never trimmed) + which attempt, if any, is current. */
export async function getChallengeState(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const elig = await loadEligibility(auth.slug);
  if (!elig.ok) return elig;

  const growthState = await growthStore.load(auth.slug);
  const attempts = elig.member.challenges || [];
  const history = [];
  for (const challenge of attempts) {
    const view = buildView(challenge, growthState);
    if (TERMINAL_STATUSES.includes(view.status)) {
      // Idempotent lazy capture -- a read never overwrites a snapshot that
      // already exists, so this is safe to run on every state fetch.
      await captureFinalSnapshotOnce(auth.slug, challenge.challengeId, growthState.currentMetrics);
    }
    history.push(view);
  }
  const active = history.find((v) => v.status === 'active') || null;
  return { ok: true, slug: auth.slug, active, history, canStartNewAttempt: !active };
}

export async function startChallengeAttempt(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const elig = await loadEligibility(auth.slug);
  if (!elig.ok) return elig;

  const growthState = await growthStore.load(auth.slug);
  const attempts = elig.member.challenges || [];
  const alreadyActive = attempts.some((c) => buildView(c, growthState).status === 'active');
  if (alreadyActive) return { ok: false, reason: 'challenge_already_active' };

  // A real, unused $25 order is required -- consumed orders (already
  // recorded as a wcOrderId on a past attempt) don't count again, so one
  // purchase funds exactly one attempt, and repeat attempts require a
  // repeat purchase.
  const consumedOrderIds = attempts.map((c) => c.wcOrderId).filter(Boolean);
  const order = await findAvailableChallengeOrder(auth.customerId, CHALLENGE_PRODUCT_ID, consumedOrderIds);
  if (!order.ok) return { ok: false, reason: 'no_valid_challenge_purchase', detail: order.reason };

  const challengeId = await startChallenge(auth.slug, { wcOrderId: order.orderId, wcOrderKey: order.orderKey });
  // A fresh, per-attempt snapshot -- never overwrites a prior attempt's
  // snapshot (startChallengeSnapshot always pushes a new entry keyed by its
  // own challengeId; club-state.mjs's member.challenges array is likewise
  // append-only -- see startChallenge()).
  startChallengeSnapshot(growthState, { challengeId, metrics: growthState.currentMetrics });
  await growthStore.save(auth.slug, growthState);
  return { ok: true, slug: auth.slug, challengeId };
}

/**
 * Customer says they hit the $1,000 goal during an attempt's active window
 * or its 14-day grace period ("$1K Stripe" achievement claim -- see
 * methodology naming: "Stripe" is the merch reward's name, not the payment
 * processor; no payment integration is involved anywhere in this flow).
 * This records the claim only -- it does NOT verify it. Verification is a
 * separate, explicit founder/operator review step (V1 has no automated
 * verification path, by design -- see recordAchievementVerification's own
 * doc comment in club-state.mjs). Only allowed while the computed status is
 * genuinely 'claim_available', so a member can't jump the queue by
 * submitting a claim before the window/goal math actually supports one.
 */
export async function submitAchievementClaim(accessToken, { challengeId, claimedRevenueUsd, note } = {}) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const elig = await loadEligibility(auth.slug);
  if (!elig.ok) return elig;
  if (!challengeId) return { ok: false, reason: 'missing_challenge_id' };

  const challenge = (elig.member.challenges || []).find((c) => c.challengeId === challengeId);
  if (!challenge) return { ok: false, reason: 'challenge_not_found' };
  const growthState = await growthStore.load(auth.slug);
  const view = buildView(challenge, growthState);
  if (view.status !== 'claim_available') return { ok: false, reason: 'not_claimable', status: view.status };

  await recordAchievementClaim(auth.slug, challengeId, { claimedRevenueUsd, note });
  return { ok: true };
}

/** Only meaningful once achievement.verified is true (merch unlocks on verification, independent of this choice -- see club-state.mjs). */
export async function submitRewardChoice(accessToken, { challengeId, choice } = {}) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const elig = await loadEligibility(auth.slug);
  if (!elig.ok) return elig;
  if (!challengeId) return { ok: false, reason: 'missing_challenge_id' };

  const challenge = (elig.member.challenges || []).find((c) => c.challengeId === challengeId);
  if (!challenge) return { ok: false, reason: 'challenge_not_found' };
  if (!challenge.achievement.verified) return { ok: false, reason: 'not_yet_verified' };

  try {
    await recordRewardChoice(auth.slug, challengeId, choice);
  } catch (err) {
    return { ok: false, reason: 'invalid_choice', message: err.message };
  }
  return { ok: true };
}

export { getChallengeCompletion };
