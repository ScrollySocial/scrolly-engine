/**
 * The vertical-slice orchestrator: authenticated eligible customer ->
 * onboarding -> persisted business profile -> Business Model Router ->
 * personalized $1K Math -> Mini Organic Presence Evaluation -> results.
 *
 * Composes the existing modules; contains no Router/Math/Evaluation logic of
 * its own (that would duplicate them -- see business-model-router.mjs,
 * thousand-k-math.mjs, mini-evaluation.mjs).
 *
 * Identity: keyed by the customer's stable WooCommerce/WordPress user id
 * (via a signed access token -- see club-access-token.mjs), NOT by order
 * credentials. This is the 2026-09-11 fast-follow that replaced the
 * temporary order_id+order_key gate: a customer's profile/club/challenge
 * state must survive across orders and be the same foundation $10K/$24K
 * entitlements attach to later, which an order-derived identity can't
 * guarantee (a customer's email can change; their account id doesn't).
 *
 * `club-order-verify.mjs` (the old order-based check) is intentionally left
 * intact and unused by this file -- WordPress now does the ownership check
 * (via WooCommerce's own `wc_customer_bought_product()`) before minting a
 * token, so re-checking a specific order here would be redundant. It stays
 * available for a future need to verify a *specific* order (e.g. which
 * Challenge attempt was just paid for).
 */
import { newBusinessProfile, assertValidBusinessProfile } from './business-profile-schema.mjs';
import { loadBusinessProfile, saveBusinessProfile } from './business-profile-store.mjs';
import { computeModule1Results } from './module1.mjs';
import { recordClubPurchase, recordProfileComplete, loadMember } from './club-state.mjs';
import { verifyAccessToken } from './club-access-token.mjs';

const PROFILE_FIELDS = Object.keys(newBusinessProfile());

/** The one durable identity scheme -- a WC customer id, never an order or email. */
export function slugFromCustomerId(customerId) {
  return `customer-${customerId}`;
}

/**
 * Pure function: profile -> the Module 1 result (see module1.mjs). Kept as
 * a re-export under this name so callers/tests don't need to know Module 1
 * logic lives in its own file -- this stays the one place onboarding-
 * service.mjs computes "the results" for a profile.
 */
export const computeResults = computeModule1Results;

/** Verifies the access token and returns the identity, or a reason string. Never throws. */
function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, email: verification.email, slug: slugFromCustomerId(verification.customerId) };
}

/**
 * @param {object} params
 * @param {string} params.accessToken - signed token from the WordPress club-access-route.php link (see club-access-token.mjs)
 * @param {object} params.answers - raw onboarding form answers (subset of BusinessProfile fields)
 * @returns {Promise<{ok:true, slug:string, results:object} | {ok:false, reason:string}>}
 */
export async function submitOnboarding({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;

  const profile = newBusinessProfile();
  for (const field of PROFILE_FIELDS) {
    if (answers && answers[field] !== undefined) profile[field] = answers[field];
  }
  if (!profile.route) return { ok: false, reason: 'missing_route' };
  if (!profile.stage) return { ok: false, reason: 'missing_stage' };
  if (profile.price == null) return { ok: false, reason: 'missing_price' };
  assertValidBusinessProfile(profile);

  // wcOrderId/wcOrderKey are left null: ownership was already established by
  // WordPress's wc_customer_bought_product() check before the token was
  // minted, so there's no single "the" order to attach here (a repeat
  // Challenge purchase later is a separate order, same customer identity).
  await recordClubPurchase(auth.slug, { email: auth.email, wcCustomerId: auth.customerId });
  await saveBusinessProfile(auth.slug, profile);
  await recordProfileComplete(auth.slug);

  return { ok: true, slug: auth.slug, results: computeResults(profile) };
}

/**
 * Re-derives results fresh from stored state every time -- never caches a
 * stale computed result. Slug is ALWAYS derived from the verified token,
 * never accepted from the caller -- accepting a client-supplied slug here
 * would let anyone view another customer's business data by guessing it.
 */
export async function getResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const member = await loadMember(auth.slug);
  if (!member || !member.club.purchased) return { ok: false, reason: 'not_a_club_member' };
  const profile = await loadBusinessProfile(auth.slug);
  if (!profile || !member.profileComplete) return { ok: false, reason: 'onboarding_not_complete' };
  return { ok: true, slug: auth.slug, results: computeResults(profile) };
}
