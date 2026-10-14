/**
 * Content Studio service -- the browser-facing surface for
 * automation/club/public/content.html. Deliberately does not require
 * Module 5: if the full messaging pipeline is done, its real personalized
 * starterIdeas are used; otherwise the Module 1 profile alone (which every
 * Club member already has) drives quick-content-ideas.mjs's simpler
 * generator. Either way the response says which tier the ideas came from,
 * so the page can label them honestly instead of blurring the two.
 */
import { verifyAccessToken } from './club-access-token.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadMessagingPlan } from './messaging-plan-store.mjs';
import { loadOfferPlan } from './offer-plan-store.mjs';
import { loadDiscoveryPlan } from './discovery-plan-store.mjs';
import { loadChannelPlan } from './channel-plan-store.mjs';
import { computeModule5Results } from './module5.mjs';
import { generateQuickIdeas } from './quick-content-ideas.mjs';
import { loadSavedContent, saveContentItem, deleteContentItem } from './content-library-store.mjs';

function authenticate(accessToken) {
  const identity = verifyAccessToken(accessToken);
  if (!identity.valid) return { ok: false, reason: identity.reason };
  return { ok: true, slug: `customer-${identity.customerId}` };
}

export async function getContentStudioState(accessToken) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const { slug } = auth;

  const profile = await loadBusinessProfile(slug);
  if (!profile) return { ok: false, reason: 'module1_not_complete' };

  const messagingPlan = await loadMessagingPlan(slug);
  const savedItems = await loadSavedContent(slug);

  if (messagingPlan && messagingPlan.selectedCoreMessage) {
    // Full pipeline is done -- use the real, personalized ideas already
    // built from actual buyer/trigger/channel/message data.
    const [offerPlan, discoveryPlan, channelPlan] = await Promise.all([
      loadOfferPlan(slug), loadDiscoveryPlan(slug), loadChannelPlan(slug),
    ]);
    if (offerPlan && discoveryPlan && channelPlan) {
      const results = computeModule5Results(profile, offerPlan, discoveryPlan, channelPlan, messagingPlan);
      const ideas = (results.messagingContentPlan?.starterIdeas || []).map((i) => ({ ...i, tier: 'personalized' }));
      return { ok: true, tier: 'personalized', ideas, savedItems };
    }
  }

  // Fallback tier: quick ideas from the Module 1 profile alone.
  const ideas = generateQuickIdeas(profile);
  return { ok: true, tier: 'quick', ideas, savedItems };
}

export async function saveContent(accessToken, item) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  try {
    const record = await saveContentItem(auth.slug, item);
    return { ok: true, item: record };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export async function deleteContent(accessToken, id) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const items = await deleteContentItem(auth.slug, id);
  return { ok: true, items };
}
