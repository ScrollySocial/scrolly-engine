/**
 * Module 2's auth/persistence orchestration -- mirrors onboarding-
 * service.mjs's role for Module 1, kept in its own file rather than added
 * to that one, since onboarding-service.mjs is Module 1 surface area and
 * Module 1 is frozen for this slice.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan, saveOfferPlan } from './offer-plan-store.mjs';
import { newOfferPlan, assertValidOfferPlan } from './offer-plan-schema.mjs';
import { generatePositioningOptions } from './offer-positioning.mjs';
import { computeModule2Results } from './module2.mjs';
import { computeModule1Results } from './module1.mjs';

const PLAN_FIELDS = Object.keys(newOfferPlan());

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/** Module 2 depends on a completed Module 1 -- same profile the customer already gave, never re-asked. */
async function loadPrerequisites(slug) {
  const member = await loadMember(slug);
  if (!member || !member.club.purchased) return { ok: false, reason: 'not_a_club_member' };
  if (!member.profileComplete) return { ok: false, reason: 'module1_not_complete' };
  const profile = await loadBusinessProfile(slug);
  if (!profile) return { ok: false, reason: 'module1_not_complete' };
  return { ok: true, profile };
}

/**
 * Everything Module 2's page needs to render prepopulated, in one call:
 * the raw profile fields to prefill the form, Module 1's own results (for
 * the Price/$1K Economics carryover and the starting-state framing), and
 * any previously-saved OfferPlan for a returning customer.
 */
export async function getModule2Context(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const existingPlan = await loadOfferPlan(auth.slug);
  return {
    ok: true,
    profile: {
      route: prereq.profile.route,
      stage: prereq.profile.stage,
      offer: prereq.profile.offer,
      price: prereq.profile.price,
      audience: prereq.profile.audience,
    },
    module1Results: computeModule1Results(prereq.profile),
    existingOfferPlan: existingPlan,
  };
}

export async function generatePositioning({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const options = generatePositioningOptions({
    offer: answers?.offerConfirmed,
    audience: answers?.audienceConfirmed,
    whatTheyGet: answers?.whatTheyGet,
    motivation: answers?.buyingMotivation,
    differentiationDetail: answers?.differentiation?.status === 'stated' ? answers?.differentiation?.detail : null,
    route: prereq.profile.route,
  });
  return { ok: true, positioningOptions: options };
}

export async function submitModule2({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const plan = newOfferPlan();
  for (const field of PLAN_FIELDS) {
    if (answers && answers[field] !== undefined) plan[field] = answers[field];
  }
  if (!plan.offerConfirmed || !plan.whatTheyGet) return { ok: false, reason: 'missing_offer_description' };
  if (!plan.audienceConfirmed) return { ok: false, reason: 'missing_audience' };
  if (!plan.selectedPositioning) return { ok: false, reason: 'missing_positioning' };
  assertValidOfferPlan(plan);

  await saveOfferPlan(auth.slug, plan);
  return { ok: true, slug: auth.slug, results: computeModule2Results(prereq.profile, plan) };
}

/** Re-derives fresh every time, same principle as Module 1's getResultsForToken. */
export async function getModule2ResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;
  const plan = await loadOfferPlan(auth.slug);
  if (!plan) return { ok: false, reason: 'module2_not_complete' };
  return { ok: true, slug: auth.slug, results: computeModule2Results(prereq.profile, plan) };
}
