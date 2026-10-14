/**
 * Module 6 reference data: the conversion-destination universe, the step
 * sequence and descriptive Path Type each destination implies, follow-up
 * mechanisms, and trust-placement guidance per destination shape.
 *
 * All static, general knowledge used as deterministic reasoning inputs --
 * never fabricated statistics, never shown to the customer as a score.
 */

export const CONVERSION_DESTINATION_TYPES = /** @type {const} */ ([
  'website_product_page',
  'sales_page',
  'marketplace_listing',
  'checkout',
  'payment_link',
  'booking_page',
  'inquiry_contact_form',
  'dm',
  'email',
  'phone',
  'physical_location',
  'application',
  'sales_call',
  'affiliate_destination',
  'other',
  'not_set_up_yet',
]);

export const FOLLOW_UP_MECHANISMS = /** @type {const} */ ([
  'email', 'dm', 'consultation_follow_up', 'phone', 'marketplace_native', 'reminder', 'referral_relationship', 'none', 'not_necessary_yet',
]);

export const MOBILE_STATUSES = /** @type {const} */ (['confirmed', 'likely', 'unknown_needs_checking']);

// Ordered by how specific/direct the destination is -- when a customer
// selects several, the most direct/specific one anchors the canonical path
// (a specific product page beats a vague "other," a checkout beats a bare
// inquiry form) without discarding the rest (all selected destinations are
// still shown in the carried-forward context).
export const DESTINATION_PRIORITY = [
  'checkout', 'payment_link', 'website_product_page', 'marketplace_listing', 'sales_page',
  'booking_page', 'application', 'sales_call', 'inquiry_contact_form',
  'dm', 'email', 'phone', 'physical_location', 'affiliate_destination', 'other', 'not_set_up_yet',
];

// Base step sequence per destination type, BEFORE any contextual
// qualification step is inserted (see sales-path-evaluation.mjs's
// needsQualificationStep -- price/complexity-driven, never automatic).
// 'purchase_or_inquiry' step Label is filled in by the caller based on
// whether this destination is a purchase or an inquiry/contact mechanism.
export const DESTINATION_STEP_TEMPLATES = {
  website_product_page: { label: 'Product Page', steps: ['Product Page', 'Add to Cart', 'Checkout', 'Purchase'], kind: 'purchase' },
  sales_page: { label: 'Sales Page', steps: ['Sales Page', 'Checkout', 'Purchase'], kind: 'purchase' },
  marketplace_listing: { label: 'Marketplace Listing', steps: ['Listing', 'Product Evaluation', 'Checkout', 'Purchase'], kind: 'purchase' },
  checkout: { label: 'Checkout', steps: ['Checkout', 'Purchase'], kind: 'purchase' },
  payment_link: { label: 'Payment Link', steps: ['Payment Link', 'Purchase'], kind: 'purchase' },
  booking_page: { label: 'Booking Page', steps: ['Booking Page', 'Schedule', 'Confirmation'], kind: 'purchase' },
  inquiry_contact_form: { label: 'Inquiry Form', steps: ['Inquiry'], kind: 'inquiry' },
  dm: { label: 'Direct Message', steps: ['DM Conversation'], kind: 'inquiry' },
  email: { label: 'Email', steps: ['Email Reply'], kind: 'inquiry' },
  phone: { label: 'Phone', steps: ['Phone Call'], kind: 'inquiry' },
  physical_location: { label: 'Physical Location', steps: ['Visit or Call'], kind: 'local' },
  application: { label: 'Application', steps: ['Application', 'Review'], kind: 'inquiry' },
  sales_call: { label: 'Sales Call', steps: ['Sales Call'], kind: 'inquiry' },
  affiliate_destination: { label: 'Affiliate Destination', steps: ['Affiliate Link', 'Merchant Checkout'], kind: 'purchase' },
  other: { label: 'Your Destination', steps: ['Your Destination'], kind: 'other' },
  not_set_up_yet: { label: null, steps: [], kind: 'none' },
};

// Trailing step appended once the buyer completes the destination's own
// steps, adapted to whether it's a purchase-kind or inquiry-kind
// destination -- inquiry-kind destinations need a closing step
// (qualification/booking/payment) the destination itself doesn't include.
export function closingStepsFor(kind, needsQualification) {
  if (kind === 'purchase') return [];
  if (kind === 'inquiry') return needsQualification ? ['Qualification / Conversation', 'Booking or Payment'] : ['Booking or Payment'];
  if (kind === 'local') return ['Service', 'Payment'];
  if (kind === 'other') return ['Next Step', 'Conversion'];
  return [];
}

// Descriptive-only Path Type classification (never a score) -- omitted
// entirely for 'other'/'not_set_up_yet' where forcing a label adds no value.
export const PATH_TYPE_BY_DESTINATION = {
  website_product_page: 'Direct Conversion', sales_page: 'Direct Conversion', checkout: 'Direct Conversion', payment_link: 'Direct Conversion',
  marketplace_listing: 'Marketplace', booking_page: 'Booking-Led',
  inquiry_contact_form: 'Inquiry-Led', application: 'Inquiry-Led', sales_call: 'Inquiry-Led',
  dm: 'Conversation / DM-Led', email: 'Inquiry-Led', phone: 'Inquiry-Led',
  physical_location: 'Local / Offline', affiliate_destination: 'Direct Conversion',
};

// What plausibly belongs at each destination shape's decision point --
// never invented; sales-path-evaluation.mjs only ever surfaces items that
// intersect with the customer's REAL Module 5 proof inventory, or names the
// category as something to build if none exists yet.
export const TRUST_ASSET_CATEGORIES_BY_DESTINATION_KIND = {
  purchase: ['Customer reviews', 'Testimonials', 'Ratings', 'Product photography', 'Demonstrations', 'Guarantees/policies', 'Before/after examples'],
  inquiry: ['Case studies', 'Testimonials', 'Credentials', 'Founder expertise', 'Process transparency'],
  local: ['Customer reviews', 'Ratings', 'Community/social proof'],
  other: ['Customer reviews', 'Testimonials'],
  none: [],
};
