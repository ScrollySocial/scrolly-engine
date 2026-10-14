/**
 * Business Profile — the Business Model Router's data contract.
 *
 * Captured once at $1K Club onboarding, reused unmodified by the Challenge
 * Agent, $1K Math, and (later, not built here) $10K/$24K onboarding so that
 * work is never redone. Deliberately flat/small — see
 * `methodology/product-ladder.md`'s "do not overengineer" instruction.
 */

export const BUSINESS_MODEL_ROUTES = /** @type {const} */ ([
  'ecommerce',        // physical products, own store or marketplace-adjacent
  'services',         // service/freelance business
  'digital_product',  // digital product or course
  'creator_affiliate', // creator/affiliate
  'marketplace_first', // marketplace-first (e.g. Etsy) as the primary surface
  'local_hybrid',      // local/hybrid business selling online
]);

// A. no viable offer yet · B. offer exists, little/no revenue ·
// C. some revenue, not yet consistently at the $1K target.
export const ONBOARDING_STAGES = /** @type {const} */ (['A', 'B', 'C']);

/** @returns {object} an empty profile with every field explicitly present (never undefined-by-omission). */
export function newBusinessProfile() {
  return {
    businessName: null,         // 2026-09-17 rebuild: captured at onboarding, was previously absent entirely
    websiteUrl: null,           // 2026-09-17 rebuild: same -- the general site/store URL, distinct from the Connections page's Shopify-specific storeUrl
    route: null,               // one of BUSINESS_MODEL_ROUTES
    stage: null,                // one of ONBOARDING_STAGES
    offer: null,                // short description of what's sold
    oneSentenceOffer: null,     // filled in later via the Offer Builder module, not onboarding
    price: null,                // number, in USD, or null if not yet set
    audience: null,             // short description of who buys
    currentRevenueUsd: null,    // number or null ("not yet known" — never coerced to 0)
    sellingSurfaces: [],        // e.g. ['own_site', 'etsy', 'instagram_dm', 'in_person']
    discoveryChannels: [],      // channels already in use, e.g. ['instagram', 'referral', 'google']
    hasEmailList: null,         // boolean or null
    emailListSize: null,        // number or null
    timeAvailableHoursPerWeek: null, // number or null
    existingMetrics: {},        // free-form known-metric bag, e.g. { conversionRate: 0.02 } — only what's actually known, never invented
    notes: null,                // free text, optional
  };
}

/** Only checks structural validity (right shape/enum membership) — never judges business viability. */
export function assertValidBusinessProfile(profile) {
  const required = Object.keys(newBusinessProfile());
  for (const key of required) {
    if (!(key in profile)) throw new Error(`BusinessProfile missing required field "${key}"`);
  }
  if (profile.route !== null && !BUSINESS_MODEL_ROUTES.includes(profile.route)) {
    throw new Error(`BusinessProfile.route "${profile.route}" is not one of: ${BUSINESS_MODEL_ROUTES.join(', ')}`);
  }
  if (profile.stage !== null && !ONBOARDING_STAGES.includes(profile.stage)) {
    throw new Error(`BusinessProfile.stage "${profile.stage}" is not one of: ${ONBOARDING_STAGES.join(', ')}`);
  }
  return true;
}
