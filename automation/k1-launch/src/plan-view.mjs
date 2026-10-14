/**
 * My $1K Plan view model (launch, 2026-09-26).
 *
 * All intelligence is REUSED, unchanged, from automation/club/lib:
 *   computeModule1Results (Router + $1K Math + Mini Evaluation + First Priority + Starting Point Plan)
 * This file only (1) maps the saved Start Here answers into a BusinessProfile, and
 * (2) shapes the results for display: bottom-of-funnel first, labeled planning
 * ranges, offer economics, work-on-now / not-yet, clean punctuation, and an
 * executionKey (route + channel + constraint) that This Week will key off later.
 */
import { newBusinessProfile } from '../../club/lib/business-profile-schema.mjs';
import { computeModule1Results } from '../../club/lib/module1.mjs';
import { getRouteConfig, listRoutes } from '../../club/lib/business-model-router.mjs';
import { v1MetricLabel, V1_TOP_STAGE_NOUN, V1_STAGE_NOUN, CROSS_POST_NOTE } from './v1-instagram.mjs';

export { listRoutes };

// ---- Start Here vocabularies (what the form offers; keys are stored, labels shown)
// V1 ($1K Club + Challenge) is Instagram-first: the channel is fixed, not asked. The other channel keys and the
// engine's multi-channel routing stay in place (dormant) for future products; flip V1_CHANNEL to null to re-enable choice.
export const V1_CHANNEL = 'instagram';
export const CHANNELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  other: 'another channel',
};
export const channelFor = (saved) => V1_CHANNEL || (CHANNELS[saved.channel] ? saved.channel : 'instagram');
// Every option is a trackable online next step (the sale itself may happen offline, e.g. an estimate request that becomes a paid job).
export const WHERE_THEY_BUY = {
  own_site: 'your website',
  etsy: 'your Etsy shop',
  marketplace: 'your marketplace listing',
  booking: 'your booking link',
  quote: 'your quote or inquiry form',
  dm: 'a DM or message',
  phone: 'a call or text',
};
export const FOUND_VIA = {
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', google: 'Google',
  marketplace_search: 'Etsy or marketplace search', referral: 'Word of mouth or referrals', local: 'Local events or in person',
};

/** Saved Start Here answers (flat, as PHP stores them) -> a BusinessProfile the reused logic understands. */
export function buildProfile(saved) {
  const route = saved.route;
  const cfg = getRouteConfig(route);
  const existingMetrics = {};
  const closePct = Number(saved.closePct);
  if (saved.closePct !== '' && saved.closePct != null && Number.isFinite(closePct) && closePct >= 0) existingMetrics[cfg.closingMetricKey] = closePct / 100;
  const reviews = Number(saved.reviews);
  if (saved.reviews !== '' && saved.reviews != null && Number.isFinite(reviews)) existingMetrics.reviewCount = reviews;
  const revenue = Number(saved.revenue);
  return {
    ...newBusinessProfile(),
    businessName: saved.business || null,
    route,
    stage: saved.stage === 'C' ? 'C' : 'B', // stage A (no offer yet) is out of scope for launch
    offer: saved.offer || null,
    price: Number(saved.price) > 0 ? Number(saved.price) : null,
    audience: saved.audience || null,
    currentRevenueUsd: saved.revenue !== '' && saved.revenue != null && Number.isFinite(revenue) ? revenue : null,
    sellingSurfaces: saved.where ? [saved.where] : [],
    discoveryChannels: Array.isArray(saved.found) ? saved.found : [],
    hasEmailList: saved.emailList === 'yes' ? true : saved.emailList === 'no' ? false : null,
    existingMetrics,
  };
}

// Services split by their next step: a booking link means booked clients; a quote form, call, or DM means jobs won through outreach.
export const serviceVariant = (saved) => (saved.where === 'booking' ? 'booking' : 'outreach');
export function saleWords(saved) {
  if (saved.route === 'services') return serviceVariant(saved) === 'booking' ? { avg: 'booking', one: 'client', many: 'clients' } : { avg: 'job', one: 'job', many: 'jobs' };
  if (saved.route === 'marketplace_first' || saved.route === 'ecommerce') return { avg: 'order', one: 'sale', many: 'sales' };
  if (saved.route === 'local_hybrid') return { avg: 'order', one: 'order', many: 'orders' };
  if (saved.route === 'creator_affiliate') return { avg: 'payout', one: 'conversion', many: 'conversions' };
  return { avg: 'sale', one: 'sale', many: 'sales' };
}

// ---- small display helpers
const clean = (s) => (s == null ? s : String(s).replace(/\s*(?:—|–|--)\s*/g, ', ').replace(/,\s*,/g, ','));
const STAGE_NOUN = {
  reach: 'people reached', product_view: 'product views', add_to_cart: 'cart adds', purchase: 'sales',
  lead_or_inquiry: 'inquiries', qualified_conversation: 'sales conversations', booked_client: 'clients',
  lead_capture: 'email or lead signups', sales_page_view: 'sales page visits', engagement: 'engaged viewers',
  click_through: 'link clicks', conversion_or_commission: 'conversions', marketplace_search_impression: 'search impressions',
  listing_view: 'listing views', local_discovery: 'people who find you locally', inquiry_or_visit: 'inquiries or visits',
};
const noun = (stage) => V1_STAGE_NOUN[stage] || STAGE_NOUN[stage] || stage.replace(/_/g, ' ');

// ---- offer economics (the math already flags 20+ sales as isHighTransactionCount)
const AOV_LEVERS = {
  ecommerce: ['Bundles ("buy 2, save")', 'Matching add-ons at checkout', 'A gift or multi-item set'],
  marketplace_first: ['Bundle listings (2 or 3 items)', 'A premium or personalized version', 'Matching add-ons in the same listing'],
  digital_product: ['A bundle of related templates or resources', 'A premium version (for example with a setup walkthrough)', 'A small add-on at checkout'],
  local_hybrid: ['Party or event packs', 'A minimum order box', 'Add-ons like delivery or personalization'],
  services: ['Packages (for example 3 sessions instead of 1)', 'A monthly option for ongoing work'],
};
// Guidance only: the numbers (sales, visitors, views) live in the My $1K Plan calculator, the single source of truth.
function economics(math, route) {
  const out = { highVolume: math.isHighTransactionCount, note: null, levers: [], scenarios: [], trustNote: null };
  if (math.isHighTransactionCount && AOV_LEVERS[route]) {
    out.levers = AOV_LEVERS[route];
    out.note = 'At your average sale it takes a lot of sales to reach $1,000, which is a high-volume path for a new organic presence. Raising what the average customer spends (without simply raising your price) can shorten it a lot.';
  } else if (math.isHighTransactionCount && route === 'creator_affiliate') {
    out.note = 'For creator income, volume of clicks is the main lever, so pick offers with a higher payout where you can.';
  }
  if (math.price >= 300 && route !== 'creator_affiliate') {
    out.trustNote = 'Each sale is a bigger decision for your buyers. Proof (results, reviews, examples) and an easy next step matter more for you than raw reach.';
  }
  return out;
}

/** The engine's interpretation minus its numbers (sales, rates, implied volumes), which now live in the calculator. */
function guidanceOnly(text) {
  const sentences = String(text || '').match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map((s) => s.trim())
    // "That's mathematically possible..." only makes sense after the (removed) numeric high-count sentence.
    .filter((s) => !/[0-9$%]/.test(s) && !/^That's mathematically possible/.test(s))
    .join(' ');
}

// ---- what to work on now / what to ignore (route + channel + priority, so identical priorities still differ)
const PRIORITY_ACTION = {
  clarify_offer: () => 'Write one clear sentence: what you sell, who it is for, and the price.',
  increase_discovery: (c) => `Make ${c.channel} your one main channel and post there several times this week, with every post pointing to ${c.destination}.`,
  generate_buying_activity: (c) => `Put your offer in front of potential buyers on ${c.channel} every day this week, and ask for the next step (${c.destination}) every time.`,
  improve_conversion: (c) => `People already find you. Fix the moment they decide: make ${c.destination} quick, clear, and full of proof.`,
};
const ROUTE_ACTION = {
  services: () => 'Tell past clients and contacts you have openings this month and ask who they know. Referrals are usually the fastest route to a booked service.',
  ecommerce: () => 'Link straight to your best-selling product page (not your homepage) and make sure it shows the price, clear photos, and one line of proof.',
  digital_product: () => 'Show the product working: a short screen recording of the result it gives, with a direct link to checkout.',
  marketplace_first: () => 'Refresh the titles and first photo of your top 3 listings with the words buyers actually search, and send social traffic straight to those listings.',
  local_hybrid: () => 'Make ordering or booking effortless: one link in your Instagram bio that goes straight to ordering or booking.',
  creator_affiliate: () => 'Pick the one product you will recommend this week and end every post with the link to it.',
};
const NOT_YET_COMMON = ['Paid ads (wait until you know what converts)', 'Building separate strategies for additional platforms (create once, then cross-post)', 'Redesigning your logo, brand, or website', 'SEO and blogging (a later-stage lever)'];
const NOT_YET_ROUTE = {
  services: 'Creating a course or digital product on the side',
  ecommerce: 'Adding lots of new products before your best seller sells steadily',
  digital_product: 'Building a long email funnel before your first 10 sales',
  marketplace_first: 'Opening your own website before your shop is working',
  local_hybrid: 'Expanding to a new area or new locations',
  creator_affiliate: 'Chasing follower counts instead of link clicks',
};

/**
 * @param {object} saved - flat Start Here answers (see buildProfile)
 * @returns {object} the Plan view model
 */
export function computePlanView(saved) {
  const profile = buildProfile(saved);
  if (!profile.price) throw new Error('A price above $0 is required to build your plan.');
  const r = computeModule1Results(profile);
  const cfg = getRouteConfig(profile.route);
  const channelKey = channelFor(saved);
  const ctx = { channel: CHANNELS[channelKey], destination: WHERE_THEY_BUY[saved.where] || 'the place people buy from you' };
  const { math } = r;
  const stages = cfg.funnelStages;
  const at = (scenario, i) => math.scenarios[scenario][i]?.count ?? null;

  // Bottom of funnel first: the sale, then the steps right before it (with ranges); reach last, as a range only.
  const steps = [];
  for (let i = stages.length - 1; i >= 1; i--) {
    steps.push({ stage: stages[i], label: noun(stages[i]), base: at('base', i), low: at('upside', i), high: at('conservative', i), isSale: i === stages.length - 1 });
  }
  const reach = { stage: stages[0], label: V1_TOP_STAGE_NOUN, low: at('upside', 0), high: at('conservative', 0) };

  return {
    business: profile.businessName,
    offer: profile.offer,
    price: math.price,
    goalUsd: math.targetUsd,
    route: { key: profile.route, label: cfg.label },
    channel: { key: channelKey, label: ctx.channel },
    destination: ctx.destination,
    // Same words as the goal gap ("jobs" for quote-based services, "clients" for booked services, "sales" for shops).
    number: { requiredSales: math.requiredSales, saleNoun: math.requiredSales === 1 ? saleWords(saved).one : saleWords(saved).many, resultingRevenue: math.resultingRevenue },
    funnel: { steps, reach, usesYourData: !math.transitions.some((t) => t.source === 'planning_assumption') },
    economics: economics(math, profile.route),
    startingState: { title: r.startingState.title, copy: clean(r.startingState.copy) },
    dataConfidence: { title: r.dataConfidence.title, copy: clean(r.dataConfidence.copy) },
    interpretation: clean(r.interpretation),
    guidance: clean(guidanceOnly(r.interpretation)),
    whatWeKnow: r.whatWeKnow.map((d) => ({ icon: d.icon, headline: d.headline, rationale: clean(d.rationale), kind: d.kind })),
    firstPriority: { type: r.firstPriority.type, label: r.firstPriority.label, rationale: clean(r.firstPriority.rationale) },
    workOnNow: [PRIORITY_ACTION[r.firstPriority.type](ctx), ROUTE_ACTION[profile.route](ctx)],
    notYet: [...NOT_YET_COMMON, NOT_YET_ROUTE[profile.route]],
    crossPost: channelKey === 'instagram' || channelKey === 'tiktok' ? CROSS_POST_NOTE : null,
    checkInMetrics: r.startingPointPlan.baselineMetrics.map(v1MetricLabel),
    // This Week (next build step) keys off all three, so identical priorities still get different actions.
    executionKey: { route: profile.route, channel: channelKey, constraint: r.firstPriority.type },
  };
}
