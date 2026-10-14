/**
 * Module 5 reference data: the seven canonical Content Roles, the Channel-
 * Job -> Content-Role and Channel-Job -> CTA-category mappings, objection-
 * type safe-messaging directions, and proof-type usage guidance.
 *
 * All FUNCTIONS, not quotas (per the spec) -- these maps describe what a
 * role/job/objection/proof-type CAN mean, never a required checklist every
 * customer must fill in equally.
 */

export const CONTENT_ROLES = /** @type {const} */ ([
  'problem', 'desire', 'education', 'proof_process', 'objection', 'offer', 'story_perspective',
]);

export const CONTENT_ROLE_LABELS = {
  problem: 'Problem',
  desire: 'Desire',
  education: 'Education',
  proof_process: 'Proof & Process',
  objection: 'Objection',
  offer: 'Offer',
  story_perspective: 'Story & Perspective',
};

export const CONTENT_ROLE_DESCRIPTIONS = {
  problem: 'Help the buyer recognize a relevant problem, friction, need, or situation.',
  desire: 'Show the result, experience, state, convenience, identity, or outcome the buyer wants.',
  education: 'Help the buyer understand something useful to their decision.',
  proof_process: 'Give the buyer reasons to believe, trust, or understand how/why the offer works or is delivered.',
  objection: 'Address meaningful reasons the buyer may hesitate.',
  offer: 'Show what is actually being sold, who it is for, what they get, and why it may matter.',
  story_perspective: 'Communicate useful founder/business perspective, process, philosophy, origin, point of view, or personality where appropriate.',
};

// Which Content Roles a given Module 4 Channel Job most naturally calls for
// -- informs the Channel -> Message Map's "priority content roles" per
// channel, never a rule that overrides the role prioritizer's own ranking
// (the map intersects this list with whatever roles are ALREADY prioritized
// for the business).
export const JOB_TO_CONTENT_ROLES = {
  discovery: ['problem', 'desire', 'offer'],
  intent_capture: ['education', 'offer', 'proof_process'],
  education: ['education', 'proof_process'],
  trust: ['proof_process', 'objection', 'story_perspective'],
  consideration: ['proof_process', 'objection', 'education'],
  follow_up: ['education', 'objection', 'offer'],
  conversion_support: ['offer', 'objection'],
  retention_repeat: ['story_perspective', 'offer'],
  referral: ['story_perspective', 'proof_process'],
  marketplace_discovery: ['offer', 'proof_process', 'desire'],
  local_discovery: ['proof_process', 'offer'],
};

// Which CTA category a Channel Job most naturally supports -- see the
// spec's own CTA categories (Discover/Educate/Trust/Consider/Buy-Convert/
// Follow-Up). A category, not a specific button label -- module5.mjs
// pairs it with a small set of example phrasings, never a single forced CTA.
export const JOB_TO_CTA_CATEGORY = {
  discovery: 'discover',
  intent_capture: 'consider',
  education: 'educate',
  trust: 'trust',
  consideration: 'consider',
  follow_up: 'follow_up',
  conversion_support: 'buy_convert',
  retention_repeat: 'follow_up',
  referral: 'trust',
  marketplace_discovery: 'buy_convert',
  local_discovery: 'consider',
};

export const CTA_CATEGORY_LABELS = {
  discover: 'Discover', educate: 'Educate', trust: 'Trust', consider: 'Consider', buy_convert: 'Buy / Convert', follow_up: 'Follow-Up',
};

export const CTA_CATEGORY_EXAMPLES = {
  discover: ['learn more', 'explore', 'see the product/service'],
  educate: ['read', 'watch', 'compare', 'understand'],
  trust: ['see reviews', 'see the process', 'view examples'],
  consider: ['view details', 'compare options', 'see pricing', 'see availability'],
  buy_convert: ['shop', 'book', 'start', 'order', 'inquire'],
  follow_up: ['join the email list', 'save', 'follow'],
};

/**
 * Safe messaging directions for the objection types module2.html/
 * module3.html's own OBJECTION_TYPES enum uses (so a checked objection
 * always resolves to specific guidance), plus a general-purpose fallback
 * for a customer's own free-typed "Other" objection. NEVER a fix -- every
 * direction clarifies/demonstrates/observes, never discounts, guarantees,
 * rushes, or attacks a competitor (per the spec's explicit prohibitions).
 */
export const OBJECTION_TYPE_DIRECTIONS = {
  'Price': 'Clarify the value and what makes this worth its price, and observe whether price actually comes up in real buyer behavior before discounting or changing the offer.',
  'Trust': 'Show real proof, process transparency, or track record -- let buyers verify credibility themselves rather than asserting it.',
  'Uncertainty about results': 'Set realistic, honest expectations and show the actual process or examples, rather than promising a specific outcome.',
  'Unclear fit': 'Be explicit about who this is for (and who it is not for), so the right buyer can self-identify quickly.',
  'Lack of proof': 'Prioritize building and surfacing real proof (see the Proof Plan) before leaning harder on claims alone.',
  'Time commitment': 'Be upfront about what is actually required from the buyer, and show how it fits into a realistic routine.',
  'Shipping': 'Be specific and honest about real shipping timelines and costs before the buyer has to ask.',
  'Delivery timing': 'Set a clear, honest expectation for when/how the buyer receives what they paid for.',
  'Complexity': 'Break the offer or process into clear, simple steps so it reads as manageable, not complicated.',
  'Switching cost': 'Acknowledge the real effort of switching and address it directly rather than ignoring it.',
  'Unfamiliar brand': 'Lean on proof, transparency, and specificity to build familiarity -- unfamiliarity fades with real information, not claims.',
  'Unclear product information': 'Answer the exact product questions buyers actually have, in plain language.',
  'Unclear next step': 'Make the very next action obvious and low-friction.',
};
const GENERIC_OBJECTION_DIRECTION = 'Address this directly and specifically with real information, rather than avoiding it or changing the offer/price in response to an unconfirmed concern.';

export function directionForObjectionType(type) {
  return OBJECTION_TYPE_DIRECTIONS[type] || GENERIC_OBJECTION_DIRECTION;
}

/** How to actually use each proof type module2.html's PROOF_TYPES enum offers -- never invents proof, only guides use of what's real. */
export const PROOF_TYPE_USAGE = {
  'Customer reviews': 'Surface real review language (especially phrases buyers repeat) directly in your content and listings.',
  'Testimonials': 'Quote real testimonials verbatim, with attribution the customer agreed to -- never paraphrase into a stronger claim than they made.',
  'Ratings': 'Show the real rating prominently anywhere a buyer is deciding.',
  'Sales/order history': 'Reference real transaction volume/repeat orders as evidence other buyers already chose this.',
  'Portfolio/work samples': 'Show real, specific examples of the actual work/product.',
  'Before/after examples': 'Show real before/after examples exactly as they occurred, without exaggeration.',
  'Case studies': 'Walk through one real case in detail -- specific beats generic.',
  'Credentials': 'State real credentials plainly, letting them speak for themselves.',
  'Demonstrations': 'Show the product/process in action so buyers can judge for themselves.',
  'Product photography': 'Use real photography to answer the practical questions buyers have before purchase.',
  'Process transparency': 'Show how the offer is actually made/delivered -- real process detail builds trust on its own.',
  'Guarantees/policies': 'State the real policy plainly and simply, without manufacturing urgency around it.',
  'Founder expertise': 'Let real background/expertise inform how you explain and stand behind the offer.',
  'Community/social proof': 'Show real community activity/engagement as evidence others are already involved.',
  'Repeat customers': 'Reference real repeat-purchase behavior as evidence of ongoing satisfaction.',
};
export function usageForProofType(type) {
  return PROOF_TYPE_USAGE[type] || 'Use this real proof directly and specifically -- let it speak for itself rather than restating it as a bigger claim.';
}

// Legitimate proof-to-build suggestions for a business with no proof yet --
// never testimonials/reviews (those can't be fabricated), route-adapted
// since what's realistic to build first differs by business model.
const ROUTE_PROOF_TO_BUILD = {
  ecommerce: ['Detailed, honest product photography', 'Clear product/process transparency', 'Clear policies (shipping, returns)'],
  services: ['Founder reasoning/expertise write-up', 'Process transparency (how you actually work)', 'A portfolio or work sample'],
  digital_product: ['A demonstration of the actual product/course content', 'Founder reasoning for why this approach works', 'Clear, detailed product information'],
  creator_affiliate: ['Demonstrations of real use', 'Founder/creator perspective and expertise', 'Process transparency'],
  marketplace_first: ['Detailed, honest listing photography', 'Clear policies stated on the listing', 'Process transparency (how it is made)'],
  local_hybrid: ['Clear service/process transparency', 'Detailed, honest photography', 'Clear policies'],
};
export function proofToBuildForRoute(route) {
  return ROUTE_PROOF_TO_BUILD[route] || ROUTE_PROOF_TO_BUILD.services;
}
