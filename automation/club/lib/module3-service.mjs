/**
 * Module 3's auth/persistence orchestration -- mirrors module2-service.mjs's
 * role for Module 2, kept in its own file rather than added to that one,
 * since Module 2 is frozen for this slice.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan, saveDiscoveryPlan } from './discovery-plan-store.mjs';
import { newDiscoveryPlan, assertValidDiscoveryPlan } from './discovery-plan-schema.mjs';
import { generateCustomerLanguageHypotheses } from './customer-language-hypotheses.mjs';
import { computeModule3Results } from './module3.mjs';

const PLAN_FIELDS = Object.keys(newDiscoveryPlan());

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/**
 * Module 3 depends on a completed Module 2 -- the same offer/audience/
 * objections the customer already gave, never re-asked from scratch.
 * `offerPlan.selectedPositioning` is the same "is Module 2 actually done"
 * signal module2-service.mjs's own submitModule2() requires before saving.
 */
async function loadPrerequisites(slug) {
  const member = await loadMember(slug);
  if (!member || !member.club.purchased) return { ok: false, reason: 'not_a_club_member' };
  if (!member.profileComplete) return { ok: false, reason: 'module1_not_complete' };
  const profile = await loadBusinessProfile(slug);
  if (!profile) return { ok: false, reason: 'module1_not_complete' };
  const offerPlan = await loadOfferPlan(slug);
  if (!offerPlan || !offerPlan.selectedPositioning) return { ok: false, reason: 'module2_not_complete' };
  return { ok: true, profile, offerPlan };
}

/**
 * Everything Module 3's page needs to render prepopulated, in one call: the
 * Module 2 offer/audience/objections to carry forward (confirm-or-refine,
 * never re-ask from a blank form), and any previously-saved DiscoveryPlan
 * for a returning customer.
 */
export async function getModule3Context(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const existingPlan = await loadDiscoveryPlan(auth.slug);
  return {
    ok: true,
    profile: { route: prereq.profile.route, stage: prereq.profile.stage },
    offerPlan: {
      offerConfirmed: prereq.offerPlan.offerConfirmed,
      audienceConfirmed: prereq.offerPlan.audienceConfirmed,
      whatTheyGet: prereq.offerPlan.whatTheyGet,
      buyingMotivation: prereq.offerPlan.buyingMotivation,
      objections: prereq.offerPlan.objections,
      positioning: prereq.offerPlan.selectedPositioning,
    },
    existingDiscoveryPlan: existingPlan,
  };
}

export async function generateLanguageHypotheses({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const hypotheses = generateCustomerLanguageHypotheses({
    offer: prereq.offerPlan.offerConfirmed,
    audience: answers?.buyerDescription || prereq.offerPlan.audienceConfirmed,
    functionalResult: answers?.desiredResult?.functional,
    triggerCategory: answers?.primaryTriggerCategory,
    route: prereq.profile.route,
  });
  return { ok: true, customerLanguageHypotheses: hypotheses };
}

export async function submitModule3({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const plan = newDiscoveryPlan();
  for (const field of PLAN_FIELDS) {
    if (answers && answers[field] !== undefined) plan[field] = answers[field];
  }
  if (!plan.buyerDescription) return { ok: false, reason: 'missing_buyer_description' };
  if (!plan.desiredResult?.functional) return { ok: false, reason: 'missing_desired_result' };
  if (plan.buyingTriggers.length === 0) return { ok: false, reason: 'missing_buying_trigger' };
  if (!plan.primaryTriggerCategory) return { ok: false, reason: 'missing_primary_trigger' };
  if (plan.buyingCriteria.length === 0) return { ok: false, reason: 'missing_buying_criteria' };
  if (plan.discoveryEnvironments.length === 0) return { ok: false, reason: 'missing_discovery_environments' };
  if (plan.evidenceSources.length === 0) return { ok: false, reason: 'missing_evidence_sources' };
  assertValidDiscoveryPlan(plan);

  await saveDiscoveryPlan(auth.slug, plan);
  return { ok: true, slug: auth.slug, results: computeModule3Results(prereq.profile, prereq.offerPlan, plan) };
}

/** Re-derives fresh every time, same principle as Module 1/2's getResultsForToken. */
export async function getModule3ResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;
  const plan = await loadDiscoveryPlan(auth.slug);
  if (!plan) return { ok: false, reason: 'module3_not_complete' };
  return { ok: true, slug: auth.slug, results: computeModule3Results(prereq.profile, prereq.offerPlan, plan) };
}
