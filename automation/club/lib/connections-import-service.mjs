import { verifyAccessToken } from './club-access-token.mjs';
import { loadBusinessProfile, saveBusinessProfile } from './business-profile-store.mjs';
import { newBusinessProfile, assertValidBusinessProfile } from './business-profile-schema.mjs';
import { fetchPublicStoreInfo, describeAuthorizedIntegrationRequirements } from './public-store-import.mjs';

function authenticate(accessToken) {
  const identity = verifyAccessToken(accessToken);
  if (!identity.valid) return { ok: false, reason: identity.reason };
  return { ok: true, slug: `customer-${identity.customerId}` };
}

export async function importFromUrl(accessToken, url) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  if (!url || typeof url !== 'string') return { ok: false, reason: 'missing_url' };
  const info = await fetchPublicStoreInfo(url);
  if (!info.ok) return info;
  return {
    ok: true,
    imported: info,
    // Candidate values for the editable summary -- nothing is saved yet.
    // Price uses the low end of the real detected range, a defensible
    // starting point the member can edit before confirming.
    suggestedOffer: info.sampleTitles[0] || null,
    suggestedPriceUsd: info.priceRangeUsd.min,
  };
}

export async function applyImportToProfile(accessToken, { offer, priceUsd, audience }) {
  const auth = authenticate(accessToken);
  if (!auth.ok) return auth;
  const existing = (await loadBusinessProfile(auth.slug)) || newBusinessProfile();
  const next = { ...existing };
  if (offer != null && String(offer).trim()) next.offer = String(offer).trim();
  if (priceUsd != null && Number.isFinite(Number(priceUsd))) next.price = Number(priceUsd);
  if (audience != null && String(audience).trim()) next.audience = String(audience).trim();
  assertValidBusinessProfile(next);
  await saveBusinessProfile(auth.slug, next);
  return { ok: true, profile: next };
}

export function getIntegrationRequirements() {
  return { ok: true, integrations: describeAuthorizedIntegrationRequirements() };
}
