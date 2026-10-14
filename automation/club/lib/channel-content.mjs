/**
 * Module 4 reference data: the channel universe, owner-execution format/
 * asset enums, and the static per-channel characteristics used as reasoning
 * inputs by channel-evaluation.mjs.
 *
 * The channel universe is deliberately Module 3's own `DISCOVERY_ENVIRONMENTS`
 * (imported, not duplicated) -- the spec explicitly says to "start with
 * Module 3's plausible discovery environments," so Module 4 reasons over the
 * same vocabulary the customer already answered in, rather than inventing a
 * second, slightly-different channel list.
 *
 * CHANNEL_REFERENCE is general, defensible knowledge about how each
 * environment typically behaves (what buying intent people usually have
 * there, what production effort it usually takes, whether work there tends
 * to keep paying off later) -- used only as deterministic REASONING inputs.
 * None of it is fabricated statistics, and none of it is ever shown to the
 * customer as a score. Business-model context adjusts which of a channel's
 * format-fit tags actually apply to THIS offer (see `offerFormatTagsForRoute`
 * below) -- it never hard-codes "route X -> channel Y".
 */
import { DISCOVERY_ENVIRONMENTS } from './discovery-content.mjs';

export { DISCOVERY_ENVIRONMENTS as CHANNEL_UNIVERSE };

export const FEASIBLE_FORMATS = /** @type {const} */ ([
  'short_form_video',
  'talking_head_video',
  'long_form_video',
  'writing_articles',
  'short_written_posts',
  'photography_images',
  'graphics_design',
  'audio',
  'live_conversation_networking',
  'direct_outreach',
  'product_demonstrations',
  'none_unsure',
]);

export const EXISTING_ASSET_TYPES = /** @type {const} */ ([
  'existing_social_audience',
  'website_traffic',
  'search_visibility',
  'email_list',
  'marketplace_listings_sales',
  'referral_relationships',
  'local_reputation',
  'community_presence',
  'youtube_library',
  'pinterest_account_content',
  'existing_content_library',
]);

export const CHANNEL_JOBS = /** @type {const} */ ([
  'discovery',
  'intent_capture',
  'education',
  'trust',
  'consideration',
  'follow_up',
  'conversion_support',
  'retention_repeat',
  'referral',
  'marketplace_discovery',
  'local_discovery',
]);

// Which asset types are real, corroborating evidence of traction on which
// channels -- "an account exists" (level: 'account_only' in the ChannelPlan)
// never reaches this map's effect; only 'real_traction' entries do.
export const ASSET_TYPE_TO_CHANNELS = {
  existing_social_audience: ['instagram', 'tiktok', 'facebook', 'threads', 'pinterest'],
  website_traffic: ['google_search'],
  search_visibility: ['google_search'],
  email_list: ['email_newsletters'],
  marketplace_listings_sales: ['etsy', 'amazon', 'marketplaces_directories'],
  referral_relationships: ['referrals_word_of_mouth'],
  local_reputation: ['google_maps_local_search', 'in_person_local_discovery'],
  community_presence: ['reddit_forums', 'professional_communities', 'facebook'],
  youtube_library: ['youtube'],
  pinterest_account_content: ['pinterest'],
  existing_content_library: ['google_search', 'youtube'],
};

// Static, general characteristics of each discovery environment. Every field
// is a reasoning input, never a customer-facing score.
//
// intent: what the person is mostly doing there (used for the Discovery/
//   Buying Intent dimension -- higher-intent categories weigh more).
// formatFit: which offer characteristics this channel naturally suits.
// requiredFormats: FEASIBLE_FORMATS this channel typically needs the owner
//   to be able to produce (used for Owner Execution Fit).
// effortLevel: typical production effort ('low' | 'medium' | 'high').
// timeToFeedback: how quickly the channel can produce useful evidence for a
//   first/next $1K goal ('fast' | 'medium' | 'slow') -- a planning
//   consideration, never a revenue-speed promise.
// compounding: whether work done now keeps paying off later
//   ('low' | 'medium' | 'high').
// jobsSupported: CHANNEL_JOBS this channel can plausibly perform, ordered
//   roughly by how naturally it fits that job.
// earlyEvidenceExamples: channel-appropriate BEHAVIORAL evidence of early
//   success -- never a revenue promise.
export const CHANNEL_REFERENCE = {
  google_search: {
    label: 'Google Search', intent: 'actively_searching',
    formatFit: ['searchable', 'educational', 'comparison_driven', 'expertise_driven'],
    requiredFormats: ['writing_articles'], effortLevel: 'medium', timeToFeedback: 'slow', compounding: 'high',
    jobsSupported: ['intent_capture', 'education', 'trust'],
    earlyEvidenceExamples: ['search impressions/clicks for relevant queries', 'organic visits to a specific page'],
  },
  google_maps_local_search: {
    label: 'Google Maps / local search', intent: 'actively_searching',
    formatFit: ['local', 'comparison_driven'],
    requiredFormats: [], effortLevel: 'low', timeToFeedback: 'medium', compounding: 'high',
    jobsSupported: ['local_discovery', 'intent_capture', 'trust'],
    earlyEvidenceExamples: ['profile views/direction requests', 'calls or messages from the listing'],
  },
  youtube: {
    label: 'YouTube', intent: 'seeking_education',
    formatFit: ['demonstrable', 'educational', 'visual'],
    requiredFormats: ['long_form_video', 'talking_head_video'], effortLevel: 'high', timeToFeedback: 'slow', compounding: 'high',
    jobsSupported: ['education', 'discovery', 'trust'],
    earlyEvidenceExamples: ['watch time from the intended audience', 'comments/questions from likely buyers'],
  },
  instagram: {
    label: 'Instagram', intent: 'browsing_ideas',
    formatFit: ['visual', 'conversational'],
    requiredFormats: ['short_form_video', 'photography_images'], effortLevel: 'medium', timeToFeedback: 'medium', compounding: 'low',
    jobsSupported: ['discovery', 'trust', 'follow_up'],
    earlyEvidenceExamples: ['saves/shares/DMs from people matching your buyer description', 'profile visits leading to a click-through'],
  },
  tiktok: {
    label: 'TikTok', intent: 'consuming_entertainment',
    formatFit: ['visual', 'demonstrable'],
    requiredFormats: ['short_form_video'], effortLevel: 'medium', timeToFeedback: 'medium', compounding: 'low',
    jobsSupported: ['discovery'],
    earlyEvidenceExamples: ['qualified profile visits/click-throughs', 'comments from people matching your buyer description'],
  },
  pinterest: {
    label: 'Pinterest', intent: 'browsing_ideas',
    formatFit: ['visual', 'searchable'],
    requiredFormats: ['photography_images', 'graphics_design'], effortLevel: 'medium', timeToFeedback: 'medium', compounding: 'high',
    jobsSupported: ['discovery', 'intent_capture'],
    earlyEvidenceExamples: ['saves on pins linking to the offer', 'outbound clicks to the site/listing'],
  },
  threads: {
    label: 'Threads', intent: 'maintaining_relationships',
    formatFit: ['conversational'],
    requiredFormats: ['short_written_posts'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'low',
    jobsSupported: ['trust', 'follow_up'],
    earlyEvidenceExamples: ['replies/DMs from people matching your buyer description'],
  },
  facebook: {
    label: 'Facebook', intent: 'participating_in_communities',
    formatFit: ['conversational', 'community_driven'],
    requiredFormats: ['short_written_posts', 'photography_images'], effortLevel: 'low', timeToFeedback: 'medium', compounding: 'low',
    jobsSupported: ['discovery', 'trust', 'referral'],
    earlyEvidenceExamples: ['comments/shares from people matching your buyer description', 'messages from a group/page post'],
  },
  reddit_forums: {
    label: 'Reddit / forums', intent: 'seeking_recommendations',
    formatFit: ['community_driven', 'expertise_driven'],
    requiredFormats: ['writing_articles', 'short_written_posts'], effortLevel: 'low', timeToFeedback: 'medium', compounding: 'medium',
    jobsSupported: ['trust', 'consideration', 'referral'],
    earlyEvidenceExamples: ['upvotes/replies from relevant threads', 'direct messages asking for more detail'],
  },
  etsy: {
    label: 'Etsy', intent: 'comparing_products',
    formatFit: ['visual', 'searchable', 'comparison_driven'],
    requiredFormats: ['photography_images'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'high',
    jobsSupported: ['marketplace_discovery', 'intent_capture'],
    earlyEvidenceExamples: ['listing views', 'favorites/saves', 'messages from interested buyers'],
  },
  amazon: {
    label: 'Amazon', intent: 'comparing_products',
    formatFit: ['searchable', 'comparison_driven'],
    requiredFormats: ['photography_images'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'high',
    jobsSupported: ['marketplace_discovery', 'intent_capture'],
    earlyEvidenceExamples: ['listing views/click-through rate', 'add-to-cart activity'],
  },
  referrals_word_of_mouth: {
    label: 'Referrals / word of mouth', intent: 'seeking_recommendations',
    formatFit: ['referral_driven', 'conversational'],
    requiredFormats: ['live_conversation_networking', 'direct_outreach'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'medium',
    jobsSupported: ['referral', 'trust', 'conversion_support'],
    earlyEvidenceExamples: ['warm introductions/conversations', 'inquiries that mention a specific referrer'],
  },
  email_newsletters: {
    label: 'Email / owned audience', intent: 'maintaining_relationships',
    formatFit: ['conversational', 'educational'],
    requiredFormats: ['writing_articles', 'short_written_posts'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'high',
    jobsSupported: ['follow_up', 'conversion_support', 'retention_repeat'],
    earlyEvidenceExamples: ['open/click engagement', 'replies from your list'],
  },
  professional_communities: {
    label: 'Professional communities', intent: 'participating_in_communities',
    formatFit: ['expertise_driven', 'community_driven'],
    requiredFormats: ['writing_articles', 'live_conversation_networking'], effortLevel: 'low', timeToFeedback: 'medium', compounding: 'medium',
    jobsSupported: ['trust', 'referral', 'discovery'],
    earlyEvidenceExamples: ['direct messages/questions after participating', 'introductions from other members'],
  },
  marketplaces_directories: {
    label: 'Marketplaces / directories', intent: 'comparing_products',
    formatFit: ['searchable', 'comparison_driven'],
    requiredFormats: [], effortLevel: 'low', timeToFeedback: 'medium', compounding: 'medium',
    jobsSupported: ['marketplace_discovery', 'trust'],
    earlyEvidenceExamples: ['profile/listing views', 'inquiries from the directory'],
  },
  in_person_local_discovery: {
    label: 'In-person / local discovery', intent: 'maintaining_relationships',
    formatFit: ['local', 'conversational', 'demonstrable'],
    requiredFormats: ['live_conversation_networking', 'product_demonstrations'], effortLevel: 'low', timeToFeedback: 'fast', compounding: 'low',
    jobsSupported: ['local_discovery', 'referral', 'trust'],
    earlyEvidenceExamples: ['conversations that turn into a follow-up', 'people asking how to buy on the spot'],
  },
};

/** Not a real, evaluable channel -- Module 3's own escape-hatch values. */
const NON_EVALUABLE_ENVIRONMENTS = ['other', 'unsure'];

export function isEvaluableChannel(key) {
  return Object.prototype.hasOwnProperty.call(CHANNEL_REFERENCE, key) && !NON_EVALUABLE_ENVIRONMENTS.includes(key);
}

export function channelRef(key) {
  return CHANNEL_REFERENCE[key] || null;
}

// Base offer/format-fit tags per business model -- informs reasoning, never
// replaces it (see deriveOfferFormatTags in channel-evaluation.mjs, which
// layers real Module 2/3 evidence -- proof inventory, buying criteria -- on
// top of this base set rather than relying on the route alone).
const ROUTE_BASE_FORMAT_TAGS = {
  ecommerce: ['visual', 'comparison_driven', 'searchable'],
  services: ['expertise_driven', 'referral_driven', 'comparison_driven'],
  digital_product: ['educational', 'searchable', 'comparison_driven'],
  creator_affiliate: ['visual', 'community_driven', 'conversational'],
  marketplace_first: ['comparison_driven', 'searchable', 'visual'],
  local_hybrid: ['local', 'referral_driven', 'conversational'],
};

export function baseOfferFormatTagsForRoute(route) {
  return ROUTE_BASE_FORMAT_TAGS[route] || ROUTE_BASE_FORMAT_TAGS.services;
}

// Real customer evidence (Module 3's buying criteria, Module 2's proof
// inventory) that adds format-fit tags beyond the route default -- ties the
// reasoning to THIS business, not just its category.
export const CRITERIA_TO_FORMAT_TAGS = {
  price_value: ['comparison_driven'],
  quality: ['demonstrable', 'comparison_driven'],
  expertise: ['expertise_driven', 'educational'],
  proof: ['demonstrable', 'comparison_driven'],
  design_style: ['visual'],
  materials: ['demonstrable'],
  customization: ['conversational'],
  reviews: ['comparison_driven'],
  support: ['conversational'],
  location: ['local'],
  values: ['community_driven'],
  selection: ['comparison_driven', 'searchable'],
};

export const PROOF_TYPE_TO_FORMAT_TAGS = {
  'Product photography': ['visual'],
  'Demonstrations': ['demonstrable'],
  'Before/after examples': ['visual', 'demonstrable'],
  'Case studies': ['expertise_driven'],
  'Credentials': ['expertise_driven'],
  'Founder expertise': ['expertise_driven'],
  'Community/social proof': ['community_driven'],
  'Repeat customers': ['comparison_driven'],
};

// Route-based "strongly relevant, easy to overlook" channel surfacing --
// limited to the two clear, named cases the spec itself calls out
// (marketplace-first's built-in marketplace discovery; local's Maps/local
// search). Always explained to the customer as business-model-surfaced,
// never presented as customer-confirmed evidence.
export const ROUTE_SURFACED_CHANNELS = {
  marketplace_first: { candidates: ['etsy', 'amazon', 'marketplaces_directories'], surface: 'etsy', reason: 'Marketplace-first businesses usually get most of their real buying intent from the marketplace itself, not from building an external audience from scratch.' },
  local_hybrid: { candidates: ['google_maps_local_search'], surface: 'google_maps_local_search', reason: 'A local/hybrid business is usually found through local search and Maps before any other channel, even before real evidence accumulates.' },
};
