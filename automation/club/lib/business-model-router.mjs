/**
 * Business Model Router V1 — minimal, not a rules platform.
 *
 * Maps a BusinessProfile.route to the handful of things $1K Club/Challenge
 * content actually needs to differ by: funnel shape (for $1K Math), which
 * metrics are relevant to ask about/track, and a sane default channel pair
 * (one primary + one secondary + one compounding asset, per the canonical
 * "don't launch eight channels" rule). Extend this table, don't restructure
 * it, if a new route is ever needed.
 */

import { BUSINESS_MODEL_ROUTES } from './business-profile-schema.mjs';

const ROUTES = {
  ecommerce: {
    label: 'Ecommerce / physical products',
    funnelStages: ['reach', 'product_view', 'add_to_cart', 'purchase'],
    relevantMetrics: ['visitors', 'conversionRate', 'averageOrderValue', 'repeatPurchaseRate'],
    defaultChannels: { primary: 'seo_or_marketplace_search', secondary: 'social_content', compoundingAsset: 'email_list' },
    discoverabilityAngle: 'product-level search (own site and/or marketplace) plus shareable content',
    closingMetricKey: 'conversionRate', // maps to the final funnel transition for $1K Math / the Conversion evaluation dimension
    searchIsFoundational: true,
  },
  services: {
    label: 'Services / freelance',
    funnelStages: ['reach', 'lead_or_inquiry', 'qualified_conversation', 'booked_client'],
    relevantMetrics: ['inquiries', 'conversationToClientRate', 'averageClientValue'],
    defaultChannels: { primary: 'referral_or_niche_content', secondary: 'local_or_search_presence', compoundingAsset: 'case_studies_portfolio' },
    discoverabilityAngle: 'being found for the specific problem solved, plus referral surface area',
    closingMetricKey: 'conversationToClientRate',
    searchIsFoundational: false,
  },
  digital_product: {
    label: 'Digital product / course',
    funnelStages: ['reach', 'lead_capture', 'sales_page_view', 'purchase'],
    relevantMetrics: ['visitors', 'optInRate', 'salesPageConversionRate'],
    defaultChannels: { primary: 'content_that_teaches', secondary: 'email_list', compoundingAsset: 'search_or_evergreen_content' },
    discoverabilityAngle: 'content that answers the exact question the product solves',
    closingMetricKey: 'salesPageConversionRate',
    searchIsFoundational: true,
  },
  creator_affiliate: {
    label: 'Creator / affiliate',
    funnelStages: ['reach', 'engagement', 'click_through', 'conversion_or_commission'],
    relevantMetrics: ['reach', 'engagementRate', 'clickThroughRate'],
    defaultChannels: { primary: 'platform_native_content', secondary: 'cross_post_to_search_indexed_surface', compoundingAsset: 'audience_list' },
    discoverabilityAngle: 'platform algorithm fit plus at least one search-indexed surface (not platform-only)',
    closingMetricKey: 'affiliateConversionRate',
    searchIsFoundational: false,
  },
  marketplace_first: {
    label: 'Marketplace-first (e.g. Etsy)',
    funnelStages: ['marketplace_search_impression', 'listing_view', 'add_to_cart', 'purchase'],
    relevantMetrics: ['impressions', 'clickThroughRate', 'listingConversionRate'],
    defaultChannels: { primary: 'marketplace_search_optimization', secondary: 'social_content_driving_marketplace_traffic', compoundingAsset: 'repeat_buyer_list_if_platform_allows' },
    discoverabilityAngle: 'marketplace search/tag optimization first — that surface is the primary discovery channel',
    closingMetricKey: 'listingConversionRate',
    searchIsFoundational: true,
  },
  local_hybrid: {
    label: 'Local / hybrid selling online',
    funnelStages: ['reach', 'local_discovery', 'inquiry_or_visit', 'purchase'],
    relevantMetrics: ['localDiscoveryViews', 'inquiryRate', 'closeRate'],
    defaultChannels: { primary: 'local_search_and_maps_presence', secondary: 'community_or_local_social', compoundingAsset: 'review_and_referral_base' },
    discoverabilityAngle: 'local discovery surfaces (Maps/local search) plus community presence',
    closingMetricKey: 'closeRate',
    searchIsFoundational: true,
  },
};

/** @returns {object} the route config, or throws if route is unset/unknown — callers must route before using this. */
export function getRouteConfig(route) {
  if (!BUSINESS_MODEL_ROUTES.includes(route)) {
    throw new Error(`Unknown business model route "${route}" — cannot route without a valid BusinessProfile.route`);
  }
  return ROUTES[route];
}

export function listRoutes() {
  return BUSINESS_MODEL_ROUTES.map((route) => ({ route, label: ROUTES[route].label }));
}
