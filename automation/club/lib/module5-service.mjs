/**
 * Module 5's auth/persistence orchestration -- mirrors module4-service.mjs's
 * role for Module 4, kept in its own file since Module 4 is frozen for this
 * slice. Like Modules 2/3 (and unlike Module 4), Module 5 has one "generate
 * then select" round trip -- the Core Message is generated from stored
 * state, then the customer selects/edits/writes the final version.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { slugFromCustomerId } from './onboarding-service.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMember } from './club-state.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan } from './discovery-plan-store.mjs';
import { loadChannelPlan } from './channel-plan-store.mjs';
import { loadMessagingPlan, saveMessagingPlan } from './messaging-plan-store.mjs';
import { newMessagingPlan, assertValidMessagingPlan } from './messaging-plan-schema.mjs';
import { computeModule3Results } from './module3.mjs';
import { generateCoreMessageOptions } from './core-message-generator.mjs';
import { computeModule5Results } from './module5.mjs';

const PLAN_FIELDS = Object.keys(newMessagingPlan());

function authenticate(accessToken) {
  const verification = verifyAccessToken(accessToken);
  if (!verification.valid) return { ok: false, reason: verification.reason };
  return { ok: true, customerId: verification.customerId, slug: slugFromCustomerId(verification.customerId) };
}

/**
 * Module 5 depends on a completed Module 4 -- the same channel plan the
 * customer already built, never re-asked. `channelPlan.marketingHoursPerWeek
 * != null` is the same "is Module 4 actually done" signal
 * module4-service.mjs's own submitModule4() requires before saving.
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
  return { ok: true, profile, offerPlan, discoveryPlan, channelPlan };
}

/** Everything Module 5's page needs to render, in one call. */
export async function getModule5Context(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const existingPlan = await loadMessagingPlan(auth.slug);
  return {
    ok: true,
    profile: { route: prereq.profile.route, stage: prereq.profile.stage },
    offer: prereq.offerPlan.offerConfirmed,
    existingMessagingPlan: existingPlan,
  };
}

/** Core Message generation needs no new customer answers -- it's built entirely from already-known state, unlike Module 2/3's generate steps. */
export async function generateCoreMessage({ accessToken }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const module3Results = computeModule3Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan);
  const options = generateCoreMessageOptions({
    offer: prereq.offerPlan.offerConfirmed,
    buyerDescription: prereq.discoveryPlan.buyerDescription,
    primaryTriggerCategory: prereq.discoveryPlan.primaryTriggerCategory,
    desiredResultFunctional: prereq.discoveryPlan.desiredResult.functional,
    differentiation: prereq.offerPlan.differentiation,
    topBuyingCriteria: module3Results.topBuyingCriteria,
  });
  return { ok: true, coreMessageOptions: options };
}

export async function submitModule5({ accessToken, answers }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;

  const plan = newMessagingPlan();
  for (const field of PLAN_FIELDS) {
    if (answers && answers[field] !== undefined) plan[field] = answers[field];
  }
  if (!plan.selectedCoreMessage || !plan.selectedCoreMessage.trim()) return { ok: false, reason: 'missing_core_message' };
  assertValidMessagingPlan(plan);

  await saveMessagingPlan(auth.slug, plan);
  return { ok: true, slug: auth.slug, results: computeModule5Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, plan) };
}

/** Re-derives fresh every time, same principle as Modules 1-4's getResultsForToken. */
export async function getModule5ResultsForToken(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const prereq = await loadPrerequisites(auth.slug);
  if (!prereq.ok) return prereq;
  const plan = await loadMessagingPlan(auth.slug);
  if (!plan) return { ok: false, reason: 'module5_not_complete' };
  return { ok: true, slug: auth.slug, results: computeModule5Results(prereq.profile, prereq.offerPlan, prereq.discoveryPlan, prereq.channelPlan, plan) };
}
