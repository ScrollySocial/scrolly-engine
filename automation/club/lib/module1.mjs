/**
 * Module 1 — Your $1K Starting Point.
 *
 * Turns the reused building blocks (Business Model Router, $1K Math, Mini
 * Organic Presence Evaluation, the persisted BusinessProfile) into the
 * actual customer-facing product decision: what does this business need to
 * accomplish to reach its first/next $1,000, what do we know, what don't we
 * know, and what should they work on first.
 *
 * Nothing here duplicates Router/Math/Evaluation logic -- it only
 * interprets their output into customer-facing language and one
 * prioritization decision. Deliberately avoids internal terms (stage
 * letters, raw metric keys, "benchmark" language) in every string a
 * customer will actually see.
 */
import { getRouteConfig } from './business-model-router.mjs';
import { computeThousandKMath } from './thousand-k-math.mjs';
import { evaluatePresence } from './mini-evaluation.mjs';

// Directly mirrors the onboarding question's own A/B/C copy -- reuses the
// same onboarding data instead of asking the customer to re-describe their
// starting point in different words.
const STARTING_STATES = {
  A: {
    key: 'starting_from_zero',
    title: 'Starting From Zero',
    copy: "You're building the foundation. Your first goal is not to scale. It's to get something clear enough in front of real people that you can start collecting evidence about what they want and what they will buy.",
    focus: 'Offer → customer → sales path → first buying activity',
  },
  B: {
    key: 'ready_to_sell',
    title: 'Ready to Sell',
    copy: 'You have something to sell. Now we need proof. The goal is to put the offer in front of qualified people, watch what produces interest, and learn what creates buying intent.',
    focus: 'Qualified exposure → interest → buying activity → evidence',
  },
  C: {
    key: 'building_momentum',
    title: 'Building Momentum',
    copy: "You've already proven someone will pay. Now the job is to identify what is driving sales, what is limiting growth, and what deserves more effort.",
    focus: 'Find the bottleneck → repeat what works → improve the constraint',
  },
};

function deriveStartingState(stage) {
  return STARTING_STATES[stage] || STARTING_STATES.A;
}

/** @param {object} profile @param {object} routeConfig */
function determineDataConfidence(profile, routeConfig) {
  const hasConversionData = profile.existingMetrics ? profile.existingMetrics[routeConfig.closingMetricKey] != null : false;
  const hasRevenueData = profile.currentRevenueUsd != null && profile.currentRevenueUsd > 0;
  if (hasConversionData && hasRevenueData) {
    return { key: 'strong_baseline', title: 'Strong baseline', copy: 'We have enough real performance data to model the path with reasonable confidence.' };
  }
  if (hasConversionData || hasRevenueData) {
    return { key: 'partial_baseline', title: 'Partial baseline', copy: 'Some of the model is based on real customer data and some still uses estimates.' };
  }
  return { key: 'establishing_baseline', title: 'Establishing a baseline', copy: "There isn't enough real activity yet to know conversion or volume requirements reliably." };
}

/**
 * One primary STRATEGIC priority -- never a checklist, never a specific
 * channel/tactic. Evidence-driven, not route-driven: a business model never
 * forces a specific channel (e.g. Search) to be "the" priority just because
 * of what kind of business it is.
 *
 * This is deliberately NOT the same thing as "what Club module comes next"
 * (see determineNextClubStep below) -- a business whose real constraint is
 * discovery/reach still goes to Module 2 next in the fixed curriculum, not
 * straight to the channel-selection module that directly matches the
 * diagnosis. Conflating the two used to make this page skip ahead to
 * "choose a channel" (Module 4 territory) inside what was supposed to be a
 * Module 1 result.
 */
function determineFirstPriority({ startingStateKey, discoveryExists, conversionState }) {
  if (startingStateKey === 'starting_from_zero') {
    return {
      type: 'clarify_offer',
      label: 'Clarify the offer',
      rationale: "There's no clearly defined, priced offer yet — everything else depends on that being in place first.",
    };
  }
  if (!discoveryExists) {
    return {
      type: 'increase_discovery',
      label: 'Increase qualified discovery',
      rationale: 'You have an offer, but no way yet for the right people to find it.',
    };
  }
  if (conversionState === 'insufficient_data') {
    return {
      type: 'generate_buying_activity',
      label: 'Generate qualified buying activity',
      rationale: "Right now we don't have enough evidence to say whether your primary constraint is discovery, the offer, conversion, trust, or something else. Your next objective is to put the offer in front of enough relevant people to start learning where the real constraint is.",
    };
  }
  if (conversionState === 'growth_opportunity') {
    return {
      type: 'improve_conversion',
      label: 'Improve conversion',
      rationale: 'People are already finding the offer, and real evidence shows conversion is the current constraint.',
    };
  }
  // Conversion is on_track or growth_strength and there's already a discovery channel: the more likely lever is reach, not a rebuild.
  return {
    type: 'increase_discovery',
    label: 'Increase qualified discovery',
    rationale: 'The offer already converts reasonably well — the more likely lever now is reaching more of the right people.',
  };
}

// The canonical 7-module curriculum. Module 1 always sends the customer to
// Module 2 next -- the STRATEGIC priority above (which can point straight
// at a later module's subject) never causes a skip-ahead. The bridge
// sentence explains why Module 2 still comes first even when the priority
// sounds unrelated to "build an offer."
const NEXT_MODULE = { label: 'Module 2 — Build Something People Want to Buy', cta: 'Continue to Module 2 — Build Your Offer' };
const TRANSITION_TO_NEXT_MODULE = {
  clarify_offer: "Module 2 is exactly where we'll do that — building an offer clear enough to test.",
  generate_buying_activity: "Next, we'll evaluate the offer itself before deciding where and how to promote it.",
  improve_conversion: "Before changing how you reach people, Module 2 will check whether the offer itself is part of why conversion is low.",
  increase_discovery: "Module 2 will sharpen the offer itself first, so the extra reach you generate next converts as well as possible.",
};

function determineNextClubStep(firstPriority) {
  return {
    moduleLabel: NEXT_MODULE.label,
    transition: TRANSITION_TO_NEXT_MODULE[firstPriority.type] || TRANSITION_TO_NEXT_MODULE.generate_buying_activity,
    cta: NEXT_MODULE.cta,
  };
}

// Natural-language plural phrasing for a funnel stage, used only in
// generated sentences (the raw stage_name is fine in table headers, which
// already get spaces via a simple underscore replace).
const STAGE_PROSE_LABELS = {
  reach: 'people reached',
  product_view: 'product views',
  add_to_cart: 'cart adds',
  purchase: 'purchases',
  lead_or_inquiry: 'leads or inquiries',
  qualified_conversation: 'qualified conversations',
  booked_client: 'booked clients',
  lead_capture: 'leads',
  sales_page_view: 'sales page views',
  engagement: 'engaged people',
  click_through: 'clicks',
  conversion_or_commission: 'conversions',
  marketplace_search_impression: 'search impressions',
  listing_view: 'listing views',
  local_discovery: 'people who discovered the business locally',
  inquiry_or_visit: 'inquiries or visits',
};
function stageProseLabel(stageName) {
  return STAGE_PROSE_LABELS[stageName] || stageName.replace(/_/g, ' ');
}

// Clean, list-friendly metric names for the Starting Point Plan's "baseline
// to start measuring" -- reuses routeConfig.funnelStages (already adapted
// per business model) rather than a separate hardcoded per-route list, so
// ecommerce and services never get forced through identical metrics.
const METRIC_BASELINE_LABELS = {
  reach: 'Qualified reach/visits',
  product_view: 'Product views',
  add_to_cart: 'Add-to-cart activity',
  purchase: 'Purchases',
  lead_or_inquiry: 'Inquiries/leads',
  qualified_conversation: 'Sales conversations',
  booked_client: 'Clients',
  lead_capture: 'Leads',
  sales_page_view: 'Sales page views',
  engagement: 'Audience engagement',
  click_through: 'Clicks',
  conversion_or_commission: 'Conversions',
  marketplace_search_impression: 'Search impressions',
  listing_view: 'Listing views',
  local_discovery: 'Local discovery views',
  inquiry_or_visit: 'Inquiries/visits',
};
function baselineMetricsFor(routeConfig) {
  return [...routeConfig.funnelStages.map((s) => METRIC_BASELINE_LABELS[s] || s.replace(/_/g, ' ')), 'Revenue'];
}

function formatMoney(n) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

function volumeAtStage(math, stageName) {
  return math.scenarios.base.find((v) => v.stage === stageName)?.count ?? null;
}

/** Never overstates certainty; never auto-prescribes a price change (see math.isHighTransactionCount handling). */
function buildInterpretation({ math, conversionDim, firstPriority }) {
  const salesPhrase = math.requiredSales === 1 ? '1 sale' : `${math.requiredSales} sales`;
  const highCountNote = math.isHighTransactionCount
    ? ` At ${formatMoney(math.price)}, that's a relatively high transaction count for an early-stage business. That's mathematically possible, and it's worth keeping in mind as a later question about the offer — not something to solve today.`
    : '';

  if (conversionDim.state === 'insufficient_data') {
    return (
      `You need approximately ${salesPhrase} at ${formatMoney(math.price)} to cross $1,000. Because you don't yet have reliable conversion data, ` +
      `your first objective isn't hitting an arbitrary traffic target — it's generating enough qualified activity to learn what percentage of interested people actually buy.` +
      highCountNote
    );
  }

  const closingTransition = math.transitions[math.transitions.length - 1];
  const knownRatePercent = Math.round(conversionDim.evidence.known * 1000) / 10;
  const volumeStageLabel = stageProseLabel(closingTransition.from);
  const impliedVolume = volumeAtStage(math, closingTransition.from);
  const constraintPhrase = firstPriority.type === 'improve_conversion' ? 'conversion' : firstPriority.type === 'increase_discovery' ? 'discovery volume' : 'the offer itself';

  let text = `You already convert about ${knownRatePercent}% of qualified ${volumeStageLabel}. At your current ${formatMoney(math.price)} price, you need approximately ${salesPhrase}.`;
  if (impliedVolume != null) {
    text += ` If that rate holds, that implies roughly ${impliedVolume} qualified ${volumeStageLabel}.`;
  }
  text += ` Your primary constraint appears more likely to be ${constraintPhrase} than rebuilding the offer.${highCountNote}`;
  return text;
}

const UNKNOWN_QUESTION_BY_DIMENSION = {
  Conversion: 'Actual conversion performance',
  Trust: 'Whether trust/proof is sufficient',
};

/**
 * A durable, consolidated summary -- not a repeat of the whole page. Built
 * entirely from fields already computed above; nothing new is persisted,
 * per the instruction to prefer derived results over duplicated storage.
 */
function buildStartingPointPlan({ profile, startingState, math, dataConfidence, dimensions, firstPriority, nextClubStep, routeConfig }) {
  const whatExists = dimensions.filter((d) => d.kind === 'existence' && d.state === 'exists').map((d) => d.headline);
  const whatsUnknown = dimensions
    .filter((d) => d.kind === 'performance' && d.state === 'insufficient_data')
    .map((d) => UNKNOWN_QUESTION_BY_DIMENSION[d.name] || d.headline);

  const discoveryExists = dimensions.find((d) => d.name === 'Discovery channel')?.state === 'exists';
  const conversionUnknown = dimensions.find((d) => d.name === 'Conversion')?.state === 'insufficient_data';
  if (discoveryExists && conversionUnknown) {
    whatsUnknown.push('Whether existing discovery produces qualified traffic');
  }

  return {
    startingState: { title: startingState.title },
    primaryOffer: { name: profile.offer || null, price: math.price },
    target: { salesRequired: math.requiredSales, resultingRevenue: math.resultingRevenue },
    dataConfidence: { title: dataConfidence.title },
    whatExists,
    whatsUnknown,
    currentPriority: firstPriority.label,
    baselineMetrics: baselineMetricsFor(routeConfig),
    nextClubStep,
  };
}

/** Maps existingMetrics.<routeConfig.closingMetricKey> to $1K Math's final-transition knownRates key, if present. */
function knownRatesFor(profile, routeConfig) {
  const key = routeConfig.closingMetricKey;
  const value = profile.existingMetrics ? profile.existingMetrics[key] : null;
  if (value == null) return {};
  const stages = routeConfig.funnelStages;
  const transitionKey = `${stages[stages.length - 2]}->${stages[stages.length - 1]}`;
  return { [transitionKey]: value };
}

/**
 * Pure function: BusinessProfile -> the full Module 1 result. No I/O, no
 * caching -- always re-derived from the profile so it can never drift from
 * the source data (same principle as onboarding-service.mjs's
 * getResultsForToken never caching a stale result).
 */
export function computeModule1Results(profile) {
  const routeConfig = getRouteConfig(profile.route);
  const math = computeThousandKMath({ price: profile.price, route: profile.route, knownRates: knownRatesFor(profile, routeConfig) });
  const { dimensions } = evaluatePresence(profile, routeConfig);

  const startingState = deriveStartingState(profile.stage);
  const discoveryDim = dimensions.find((d) => d.name === 'Discovery channel');
  const conversionDim = dimensions.find((d) => d.name === 'Conversion');
  const dataConfidence = determineDataConfidence(profile, routeConfig);
  const firstPriority = determineFirstPriority({
    startingStateKey: startingState.key,
    discoveryExists: discoveryDim.state === 'exists',
    conversionState: conversionDim.state,
  });
  const interpretation = buildInterpretation({ math, conversionDim, firstPriority });
  const nextClubStep = determineNextClubStep(firstPriority);
  const startingPointPlan = buildStartingPointPlan({ profile, startingState, math, dataConfidence, dimensions, firstPriority, nextClubStep, routeConfig });

  return {
    businessType: { route: profile.route, label: routeConfig.label },
    moduleProgress: { current: 1, total: 7 },
    startingState,
    math,
    dataConfidence,
    whatWeKnow: dimensions,
    interpretation,
    firstPriority,
    nextClubStep,
    startingPointPlan,
  };
}
