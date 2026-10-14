/**
 * Module 4's auth/persistence orchestration -- mirrors module3-service.mjs's
 * role for Module 3, kept in its own file since Module 3 is frozen for this
 * slice. Unlike Modules 2/3, there is no "generate then select" round trip
 * here (no positioning/hypothesis generation step) -- Module 4's whole job
 * is deterministic reasoning over already-known state plus the 4 small new
 * owner-execution inputs, so context + submit + results is the complete
 * surface, same shape as Module 1's simpler onboarding + results.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan } from './discovery-plan-store.mjs';
import { loadChannelPlan, saveChannelPlan } from './channel-plan-store.mjs';
import { newChannelPlan, assertValidChannelPlan } from './channel-plan-schema.mjs';
import { computeModule4Results } from './module4.mjs';

const PLAN_FIELDS = Object.keys(newChannelPlan());

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/**
 * Module 4 depends on a completed Module 3 -- the same discovery map the
 * customer already built, never re-asked. `discoveryPlan.discoveryEnvironments`
 * non-empty is the same "is Module 3 actually done" signal module3-service.mjs's
 * own submitModule3() requires before saving.
 */
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
  return { ok: true, profile, offerPlan, discoveryPlan };
}

/**
 * Everything Module 4's page needs to render, in one call: the carried-
 * forward Module 1/2/3 context (via a preview computation with a blank
 * ChannelPlan, so the page can show "what we already know" before the owner
 * answers anything new) and any previously-saved ChannelPlan for a
 * returning customer.
 */
export async function getModule4Context(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const existingPlan = await loadChannelPlan(auth.slug);
  return {
    ok: true,
    profile: { route: prereq.profile.route, stage: prereq.profile.stage },
    discoveryEnvironments: prereq.discoveryPlan.discoveryEnvironments,
    existingChannelPlan: existingPlan,
  };
}

export async function submitModule4({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const plan = newChannelPlan();
  for (const field of PLAN_FIELDS) {
    if (answers && answers[field] !== undefined) plan[field] = answers[field];
  }
  if (plan.marketingHoursPerWeek == null) return { ok: false, reason: 'missing_marketing_hours' };
  if (plan.feasibleFormats.length === 0) return { ok: false, reason: 'missing_feasible_formats' };
  assertValidChannelPlan(plan);

  await saveChannelPlan(auth.slug, plan);
  return { ok: true, slug: auth.slug, results: computeModule4Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, plan) };
}

/** Re-derives fresh every time, same principle as Modules 1/2/3's getResultsForToken. */
export async function getModule4ResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;
  const plan = await loadChannelPlan(auth.slug);
  if (!plan) return { ok: false, reason: 'module4_not_complete' };
  return { ok: true, slug: auth.slug, results: computeModule4Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, plan) };
}
