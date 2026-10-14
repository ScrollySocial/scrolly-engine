/**
 * Pure, deterministic Challenge status computation. No LLM anywhere in this
 * file. Reuses club-state.mjs's `currentChallengeDay()` rather than
 * re-deriving day math -- club-state.mjs itself stays completely frozen
 * (its own internal `challenge.status` field -- 'active'|'completed'|
 * 'expired'|'abandoned' -- is never read or written here); the 7-value
 * customer-facing status below is a read-only VIEW layered on top, computed
 * fresh every time, never persisted redundantly.
 *
 * CHALLENGE_STATUSES is the full customer-facing state machine:
 *   not_started -> active -> (completed | claim_available -> expired | stripe_submitted -> stripe_verified)
 *
 * The $1,000 goal is the Challenge's own literal, named target (see
 * methodology/product-ladder.md: "$25/30-day attempt... toward your $1K
 * goal") -- not the customer's own price-dependent $1K Math target, which
 * answers a different question ("how many sales at your price").
 */
import { currentChallengeDay } from './club-state.mjs';

export const CHALLENGE_STATUSES = /** @type {const} */ ([
  'not_started', 'active', 'completed', 'expired', 'claim_available', 'stripe_submitted', 'stripe_verified',
]);

export const CHALLENGE_WINDOW_DAYS = 30;
export const CLAIM_GRACE_PERIOD_DAYS = 14;
export const CHALLENGE_REVENUE_GOAL_USD = 1000;

/**
 * Whether reported revenue since the Challenge started suggests the $1,000
 * goal was met. Never guesses from missing data -- `known: false` whenever
 * either the start snapshot or current revenue is unreported.
 * @param {{value:number,state:string}|null} startRevenue - the Challenge Start snapshot's revenueUsd metric
 * @param {{value:number,state:string}|null} currentRevenue - the member's current revenueUsd metric
 */
export function revenueGoalSignal(startRevenue, currentRevenue) {
  const startKnown = !!startRevenue && startRevenue.state !== 'unknown';
  const currentKnown = !!currentRevenue && currentRevenue.state !== 'unknown';
  if (!startKnown || !currentKnown) return { known: false, gained: null, met: false };
  const gained = currentRevenue.value - startRevenue.value;
  return { known: true, gained, met: gained >= CHALLENGE_REVENUE_GOAL_USD };
}

/**
 * @param {object} challenge - one entry from member.challenges (club-state.mjs shape)
 * @param {{known:boolean, met:boolean}} goalSignal - from revenueGoalSignal()
 * @param {Date} [now]
 */
export function computeChallengeStatus(challenge, goalSignal, now = new Date()) {
  if (challenge.achievement.verified) return 'stripe_verified';
  if (challenge.achievement.claim) return 'stripe_submitted';

  const day = currentChallengeDay(challenge, now);
  if (day < CHALLENGE_WINDOW_DAYS) return 'active';
  // Window closed (day has been clamped to CHALLENGE_WINDOW_DAYS by
  // currentChallengeDay once elapsed -- real elapsed days are recovered
  // from startedAt directly, only for the grace-period check below).
  const daysSinceStart = Math.floor((now - new Date(challenge.startedAt)) / (1000 * 60 * 60 * 24)) + 1;
  const daysPastWindow = daysSinceStart - CHALLENGE_WINDOW_DAYS;

  if (!goalSignal.known || !goalSignal.met) return 'completed';
  if (daysPastWindow <= CLAIM_GRACE_PERIOD_DAYS) return 'claim_available';
  return 'expired';
}

/** @returns {number} 1-30, clamped -- see club-state.mjs's own currentChallengeDay for the underlying math. */
export function dayNumber(challenge, now = new Date()) {
  return currentChallengeDay(challenge, now);
}
