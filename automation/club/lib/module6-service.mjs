/**
 * Module 6's auth/persistence orchestration -- mirrors module4-service.mjs's
 * shape (no "generate then select" round trip; the three new inputs are
 * direct customer selections, not generated content to choose among).
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan } from './discovery-plan-store.mjs';
import { loadChannelPlan } from './channel-plan-store.mjs';
import { loadMessagingPlan } from './messaging-plan-store.mjs';
import { loadSalesPathPlan, saveSalesPathPlan } from './sales-path-plan-store.mjs';
import { newSalesPathPlan, assertValidSalesPathPlan } from './sales-path-plan-schema.mjs';
import { computeModule6Results } from './module6.mjs';

const PLAN_FIELDS = Object.keys(newSalesPathPlan());

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/**
 * Module 6 depends on a completed Module 5 -- the same messaging plan the
 * customer already built, never re-asked. `messagingPlan.selectedCoreMessage`
 * non-empty is the same "is Module 5 actually done" signal
 * module5-service.mjs's own submitModule5() requires before saving.
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
  const channelPlan = await loadChannelPlan(slug);
  if (!channelPlan || channelPlan.marketingHoursPerWeek == null) return { ok: false, reason: 'module4_not_complete' };
  const messagingPlan = await loadMessagingPlan(slug);
  if (!messagingPlan || !messagingPlan.selectedCoreMessage) return { ok: false, reason: 'module5_not_complete' };
  return { ok: true, profile, offerPlan, discoveryPlan, channelPlan, messagingPlan };
}

/** Everything Module 6's page needs to render, in one call. */
export async function getModule6Context(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const existingPlan = await loadSalesPathPlan(auth.slug);
  return {
    ok: true,
    profile: { route: prereq.profile.route, stage: prereq.profile.stage },
    existingSalesPathPlan: existingPlan,
  };
}

export async function submitModule6({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const plan = newSalesPathPlan();
  for (const field of PLAN_FIELDS) {
    if (answers && answers[field] !== undefined) plan[field] = answers[field];
  }
  if (plan.conversionDestinations.length === 0) return { ok: false, reason: 'missing_conversion_destinations' };
  if (!plan.mobileStatus) return { ok: false, reason: 'missing_mobile_status' };
  if (!plan.followUpMechanism) return { ok: false, reason: 'missing_follow_up_mechanism' };
  assertValidSalesPathPlan(plan);

  await saveSalesPathPlan(auth.slug, plan);
  return { ok: true, slug: auth.slug, results: computeModule6Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, prereq.messagingPlan, plan) };
}

/** Re-derives fresh every time, same principle as Modules 1-5's getResultsForToken. */
export async function getModule6ResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;
  const plan = await loadSalesPathPlan(auth.slug);
  if (!plan) return { ok: false, reason: 'module6_not_complete' };
  return { ok: true, slug: auth.slug, results: computeModule6Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, prereq.messagingPlan, plan) };
}
