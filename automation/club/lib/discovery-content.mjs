/**
 * Module 3 reference data: buying-trigger categories, buying-criteria
 * categories, discovery environments, and evidence sources, plus the
 * route-adapted language/suggestions the spec requires ("do not force all
 * businesses into the same customer-discovery language" -- a service
 * business has a decision-maker and a business problem; an Etsy product has
 * an occasion/use case and marketplace search behavior; a local business has
 * geographic need; a digital product has a knowledge/problem trigger; a
 * creator/affiliate business has audience intent).
 *
 * Pure data, no evaluation logic (see discovery-evaluation.mjs) and no
 * persistence. The route-adapted "suggested" lists never restrict what a
 * customer can actually select -- the full category enums below always
 * remain choosable; suggestions only change ordering/highlighting/labels so
 * a service business isn't asked in ecommerce language.
 */

export const TRIGGER_CATEGORIES = /** @type {const} */ ([
  'revenue_performance_problem',
  'upcoming_launch',
  'deadline',
  'event_occasion',
  'season',
  'gift_need',
  'frustration_with_paid_advertising',
  'current_solution_stopped_working',
  'current_solution_inadequate',
  'saw_someone_else_achieve_result',
  'new_responsibility_change',
  'knowledge_gap',
  'urgent_practical_need',
  'desire_want',
  'replacement_replenishment',
  'other',
  'not_sure_yet',
]);

export const CRITERIA_CATEGORIES = /** @type {const} */ ([
  'price_value',
  'quality',
  'speed',
  'ease',
  'expertise',
  'proof',
  'design_style',
  'materials',
  'customization',
  'convenience',
  'reviews',
  'support',
  'policies',
  'shipping',
  'availability',
  'location',
  'values',
  'selection',
  'other',
  'not_sure',
]);

// Discovery environments are CUSTOMER DISCOVERY, not Channel Selection --
// this list is deliberately generic/business-model-agnostic. Module 4 (not
// built here) is the one that turns this plus channel fit/format fit/owner
// ability/traction/time-to-feedback/buying intent/compounding potential into
// an actual channel decision.
export const DISCOVERY_ENVIRONMENTS = /** @type {const} */ ([
  'google_search',
  'google_maps_local_search',
  'youtube',
  'instagram',
  'tiktok',
  'pinterest',
  'threads',
  'facebook',
  'reddit_forums',
  'etsy',
  'amazon',
  'referrals_word_of_mouth',
  'email_newsletters',
  'professional_communities',
  'marketplaces_directories',
  'in_person_local_discovery',
  'other',
  'unsure',
]);

export const EVIDENCE_SOURCES = /** @type {const} */ ([
  'existing_buyers',
  'actual_sales_conversations',
  'customer_emails',
  'dms_comments',
  'reviews',
  'search_query_data',
  'interviews',
  'repeat_customer_behavior',
  'customer_support_questions',
  'personal_business_experience',
  'competitor_community_observation',
  'best_guess_intuition',
  'other',
]);

// Evidence sources that reflect REAL, observed buyer behavior/language, as
// opposed to the founder's own belief -- used by discovery-evaluation.mjs's
// confidence classification. Deliberately excludes
// personal_business_experience, competitor_community_observation,
// best_guess_intuition, and other -- none of those are direct buyer evidence.
export const STRONG_EVIDENCE_SOURCES = /** @type {const} */ ([
  'existing_buyers',
  'actual_sales_conversations',
  'customer_emails',
  'dms_comments',
  'reviews',
  'search_query_data',
  'interviews',
  'repeat_customer_behavior',
  'customer_support_questions',
]);

const ROUTE_DISCOVERY_LANGUAGE = {
  ecommerce: {
    buyerNoun: 'buyer',
    situationPrompt: "What's going on for them right now that relates to this kind of product?",
    suggestedTriggerCategories: ['desire_want', 'gift_need', 'season', 'saw_someone_else_achieve_result', 'replacement_replenishment'],
    suggestedCriteriaCategories: ['price_value', 'quality', 'design_style', 'reviews', 'shipping'],
    suggestedDiscoveryEnvironments: ['google_search', 'instagram', 'pinterest', 'tiktok'],
  },
  services: {
    buyerNoun: 'decision-maker',
    situationPrompt: "What business problem or situation are they dealing with right now?",
    suggestedTriggerCategories: ['revenue_performance_problem', 'current_solution_inadequate', 'new_responsibility_change', 'urgent_practical_need', 'deadline'],
    suggestedCriteriaCategories: ['expertise', 'proof', 'price_value', 'availability', 'reviews'],
    suggestedDiscoveryEnvironments: ['referrals_word_of_mouth', 'google_search', 'professional_communities'],
  },
  digital_product: {
    buyerNoun: 'buyer',
    situationPrompt: "What knowledge gap or problem are they trying to solve right now?",
    suggestedTriggerCategories: ['knowledge_gap', 'urgent_practical_need', 'current_solution_inadequate', 'new_responsibility_change'],
    suggestedCriteriaCategories: ['expertise', 'proof', 'price_value', 'reviews'],
    suggestedDiscoveryEnvironments: ['youtube', 'google_search', 'email_newsletters'],
  },
  creator_affiliate: {
    buyerNoun: 'audience member',
    situationPrompt: "What are they already engaging with or interested in right now?",
    suggestedTriggerCategories: ['desire_want', 'saw_someone_else_achieve_result', 'knowledge_gap'],
    suggestedCriteriaCategories: ['reviews', 'values', 'price_value', 'convenience'],
    suggestedDiscoveryEnvironments: ['instagram', 'tiktok', 'youtube'],
  },
  marketplace_first: {
    buyerNoun: 'shopper',
    situationPrompt: "What occasion or use case brings them to search for this?",
    suggestedTriggerCategories: ['event_occasion', 'gift_need', 'season', 'desire_want', 'replacement_replenishment'],
    suggestedCriteriaCategories: ['price_value', 'reviews', 'shipping', 'selection'],
    suggestedDiscoveryEnvironments: ['etsy', 'google_search', 'pinterest'],
  },
  local_hybrid: {
    buyerNoun: 'local customer',
    situationPrompt: "What local or practical need are they dealing with right now?",
    suggestedTriggerCategories: ['urgent_practical_need', 'event_occasion', 'current_solution_inadequate', 'new_responsibility_change'],
    suggestedCriteriaCategories: ['location', 'availability', 'reviews', 'price_value'],
    suggestedDiscoveryEnvironments: ['google_maps_local_search', 'referrals_word_of_mouth', 'in_person_local_discovery'],
  },
};

export function discoveryLanguageForRoute(route) {
  return ROUTE_DISCOVERY_LANGUAGE[route] || ROUTE_DISCOVERY_LANGUAGE.services;
}
