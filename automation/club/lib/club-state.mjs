/**
 * Per-member Club/Challenge/Achievement state — automation/club/members/<slug>/state.json.
 *
 * Same file-backed-JSON + separate append-only event-log convention as
 * automation/lib/order-state.mjs (see that file's header for the rationale:
 * no database at this scale, and nothing here trusts agent-authored prose as
 * an authority on state). Kept as its own store under automation/club/
 * rather than the vault's clients/ tree, because Club members are an
 * ongoing-relationship product (permanent Club + repeatable Challenges), not
 * a one-off per-engagement folder the way a Discover/Implementation client is.
 *
 * Club / Challenge / Achievement are deliberately independent state, per the
 * canonical rule: a customer can qualify for and decline the physical
 * reward while keeping verified achievement status and merch access, and a
 * customer can run a new Challenge attempt without repurchasing the Club.
 */

import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMBERS_DIR = path.resolve(__dirname, '..', 'members');

export { MEMBERS_DIR };

export function memberDir(slug) {
  return path.join(MEMBERS_DIR, slug);
}
export function memberStatePath(slug) {
  return path.join(memberDir(slug), 'state.json');
}
export function memberEventLogPath(slug) {
  return path.join(memberDir(slug), 'events.ndjson');
}

export const ACHIEVEMENT_REWARD_CHOICES = /** @type {const} */ (['pending', 'accepted', 'declined']);

/** @returns {object} a fresh member record. Club is not yet purchased -- callers set that via recordClubPurchase. */
export function newClubMember(slug) {
  const now = new Date().toISOString();
  return {
    slug,
    email: null,
    wcCustomerId: null,
    firstName: null, // real, from WooCommerce billing.first_name -- see recordFirstName()
    club: {
      purchased: false,
      purchasedAt: null,
      wcOrderId: null,
      wcOrderKey: null,
    },
    profileComplete: false, // set true once business-profile.json has been written and validated
    challenges: [], // each: see startChallenge()
    timestamps: { createdAt: now, updatedAt: now },
  };
}

export async function loadMember(slug) {
  const p = memberStatePath(slug);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch (err) {
    throw new Error(`state.json for club member "${slug}" exists but is not valid JSON: ${err.message}`);
  }
}

export async function saveMember(member) {
  member.timestamps = member.timestamps || {};
  member.timestamps.updatedAt = new Date().toISOString();
  await mkdir(memberDir(member.slug), { recursive: true });
  await writeFile(memberStatePath(member.slug), JSON.stringify(member, null, 2), 'utf8');
  return member;
}

export async function updateMember(slug, mutateFn) {
  const existing = await loadMember(slug);
  const member = existing || newClubMember(slug);
  mutateFn(member);
  return saveMember(member);
}

/** Best-effort append-only audit trail -- never blocks a state write on a logging failure. */
export async function logMemberEvent(slug, event) {
  try {
    await mkdir(memberDir(slug), { recursive: true });
    const line = JSON.stringify({ at: new Date().toISOString(), slug, ...event }) + '\n';
    await appendFile(memberEventLogPath(slug), line, 'utf8');
  } catch (err) {
    console.error(`[club-state] failed to append event log for "${slug}": ${err.message}`);
  }
}

/** Real WooCommerce Club-order verification is the caller's job (mirrors order-state's recordIntakeReceived) -- this only records the fact once verified. */
export async function recordClubPurchase(slug, { email, wcCustomerId, wcOrderId, wcOrderKey } = {}) {
  await updateMember(slug, (member) => {
    member.email = email ?? member.email;
    member.wcCustomerId = wcCustomerId ?? member.wcCustomerId;
    member.club = {
      purchased: true,
      purchasedAt: new Date().toISOString(),
      wcOrderId: wcOrderId ?? null,
      wcOrderKey: wcOrderKey ?? null,
    };
  });
  await logMemberEvent(slug, { type: 'club_purchased', wcOrderId });
}

export async function recordProfileComplete(slug) {
  await updateMember(slug, (member) => { member.profileComplete = true; });
  await logMemberEvent(slug, { type: 'profile_complete' });
}

/** Caches a real first name (see club-order-verify.mjs's fetchCustomerFirstName) so the dashboard doesn't re-fetch it from WooCommerce on every load. */
export async function recordFirstName(slug, firstName) {
  await updateMember(slug, (member) => { member.firstName = firstName; });
}

/** A repeatable attempt -- does NOT require repurchasing the Club, only Club.purchased === true (enforced by the caller before charging the $25). */
export async function startChallenge(slug, { wcOrderId, wcOrderKey } = {}) {
  const challengeId = randomUUID();
  const now = new Date().toISOString();
  await updateMember(slug, (member) => {
    member.challenges.push({
      challengeId,
      wcOrderId: wcOrderId ?? null,
      wcOrderKey: wcOrderKey ?? null,
      purchasedAt: now,
      startedAt: now,
      status: 'active', // active | completed | expired | abandoned
      achievement: {
        qualified: null,        // null = not yet claimed/evaluated
        qualifiedAt: null,
        verified: false,
        verifiedAt: null,
        verificationMethod: null, // e.g. 'customer_claim_reviewed'
        rewardChoice: 'pending', // pending | accepted | declined -- independent of verified/merchUnlocked
        rewardRedeemedAt: null,
        merchUnlocked: false,    // independent of rewardChoice: unlocked on verification, usable even if the physical reward is declined
      },
      lastActivityAt: now,
    });
  });
  await logMemberEvent(slug, { type: 'challenge_started', challengeId });
  return challengeId;
}

/** Day is computed from startedAt, never stored as a counter that can drift. */
export function currentChallengeDay(challenge, now = new Date()) {
  const started = new Date(challenge.startedAt);
  const days = Math.floor((now - started) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(days, 1), 30);
}

function findChallenge(member, challengeId) {
  const challenge = member.challenges.find((c) => c.challengeId === challengeId);
  if (!challenge) throw new Error(`No challenge "${challengeId}" for member "${member.slug}"`);
  return challenge;
}

export async function recordChallengeStatus(slug, challengeId, status) {
  await updateMember(slug, (member) => {
    const challenge = findChallenge(member, challengeId);
    challenge.status = status;
    challenge.lastActivityAt = new Date().toISOString();
  });
  await logMemberEvent(slug, { type: 'challenge_status', challengeId, status });
}

/**
 * Achievement claim = customer says they qualified. This does NOT verify --
 * verification is a separate, explicit step (claim/review workflow for V1,
 * per the canonical instruction that it need not require a permanent
 * payment-account connection).
 */
export async function recordAchievementClaim(slug, challengeId, { claimedRevenueUsd, note } = {}) {
  await updateMember(slug, (member) => {
    const challenge = findChallenge(member, challengeId);
    challenge.achievement.qualified = null; // stays null (unverified) until recordAchievementVerification runs
    challenge.achievement.claim = { claimedRevenueUsd: claimedRevenueUsd ?? null, note: note ?? null, claimedAt: new Date().toISOString() };
  });
  await logMemberEvent(slug, { type: 'achievement_claimed', challengeId, claimedRevenueUsd });
}

export async function recordAchievementVerification(slug, challengeId, { verified, verificationMethod, operator } = {}) {
  await updateMember(slug, (member) => {
    const challenge = findChallenge(member, challengeId);
    challenge.achievement.qualified = !!verified;
    challenge.achievement.qualifiedAt = verified ? new Date().toISOString() : null;
    challenge.achievement.verified = !!verified;
    challenge.achievement.verifiedAt = verified ? new Date().toISOString() : null;
    challenge.achievement.verificationMethod = verificationMethod ?? 'customer_claim_reviewed';
    // Merch unlocks on verification regardless of what the customer later
    // decides about the physical reward -- reward choice is recorded separately.
    if (verified) challenge.achievement.merchUnlocked = true;
  });
  await logMemberEvent(slug, { type: 'achievement_verified', challengeId, verified, operator: operator ?? null });
}

export async function recordRewardChoice(slug, challengeId, choice) {
  if (!ACHIEVEMENT_REWARD_CHOICES.includes(choice)) {
    throw new Error(`Invalid reward choice "${choice}" -- must be one of ${ACHIEVEMENT_REWARD_CHOICES.join(', ')}`);
  }
  await updateMember(slug, (member) => {
    const challenge = findChallenge(member, challengeId);
    challenge.achievement.rewardChoice = choice;
    if (choice === 'accepted') challenge.achievement.rewardRedeemedAt = new Date().toISOString();
    // Declining does NOT touch merchUnlocked -- independent per the canonical rule.
  });
  await logMemberEvent(slug, { type: 'reward_choice', challengeId, choice });
}
