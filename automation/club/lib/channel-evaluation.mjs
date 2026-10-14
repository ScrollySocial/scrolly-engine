/**
 * Module 4's channel-selection reasoning engine.
 *
 * This is a PRIORITIZATION system, not a channel-availability checklist: a
 * channel being available, popular, or containing some of the target buyer
 * never automatically makes it recommended. Every candidate is scored across
 * the spec's seven reasoning dimensions (customer presence, discovery/buying
 * intent, offer/format fit, owner execution fit, existing traction, time to
 * feedback, compounding potential) with a deterministic internal weighted
 * sum -- used ONLY to rank candidates. The number itself is never returned
 * to a caller/customer (see module4.mjs's public result shape, which exposes
 * `total`/`breakdown` fields only in evaluatedChannels for internal
 * debugging-shaped tests, never as a "score" the customer sees rendered).
 *
 * "An account exists" is never treated as "traction exists": only
 * ChannelPlan.existingAssets entries explicitly marked `level: 'real_traction'`
 * contribute to the Existing Traction dimension (see channel-plan-schema.mjs).
 */
import {
  channelRef,
  isEvaluableChannel,
  ASSET_TYPE_TO_CHANNELS,
  baseOfferFormatTagsForRoute,
  CRITERIA_TO_FORMAT_TAGS,
  PROOF_TYPE_TO_FORMAT_TAGS,
  ROUTE_SURFACED_CHANNELS,
} from './channel-content.mjs';

const INTENT_WEIGHTS = {
  actively_searching: 3,
  comparing_products: 3,
  seeking_recommendations: 2.5,
  seeking_education: 2,
  browsing_ideas: 1.5,
  participating_in_communities: 1.5,
  maintaining_relationships: 1,
  consuming_entertainment: 1,
};
const TIME_TO_FEEDBACK_WEIGHTS = { fast: 1, medium: 0.5, slow: 0 };
const COMPOUNDING_WEIGHTS = { high: 0.5, medium: 0.25, low: 0 };
const PRESENCE_WEIGHTS = { confirmed: 3, surfaced: 1 };

// Existing channels already in use per Module 1's onboarding, normalized
// onto the same channel vocabulary where the mapping is unambiguous. An
// existing channel is a CANDIDATE (presence: 'confirmed'), never automatic
// traction -- traction is decided entirely by ChannelPlan.existingAssets.
const MODULE1_CHANNEL_NORMALIZATION = {
  instagram: 'instagram', tiktok: 'tiktok', pinterest: 'pinterest', facebook: 'facebook', threads: 'threads',
  etsy: 'etsy', amazon: 'amazon', youtube: 'youtube', reddit: 'reddit_forums',
  google: 'google_search', search: 'google_search', seo: 'google_search',
  referral: 'referrals_word_of_mouth', referrals: 'referrals_word_of_mouth', 'word of mouth': 'referrals_word_of_mouth',
  email: 'email_newsletters', newsletter: 'email_newsletters',
  'in person': 'in_person_local_discovery', 'in-person': 'in_person_local_discovery', local: 'google_maps_local_search',
};

/**
 * Candidates come from Module 3's own confirmed discovery environments plus
 * Module 1's already-in-use channels, per the spec's explicit "start with
 * Module 3's plausible discovery environments plus relevant existing
 * channels/assets." A route may additionally surface one strongly relevant,
 * easy-to-overlook channel (see ROUTE_SURFACED_CHANNELS) -- always flagged
 * as business-model-surfaced, never presented as customer-confirmed.
 */
export function gatherCandidateChannels({ discoveryPlan, profile }) {
  const confirmed = new Map();
  for (const env of discoveryPlan.discoveryEnvironments || []) {
    if (isEvaluableChannel(env)) confirmed.set(env, { key: env, presence: 'confirmed' });
  }
  for (const raw of profile.discoveryChannels || []) {
    const norm = MODULE1_CHANNEL_NORMALIZATION[String(raw).trim().toLowerCase()];
    if (norm && isEvaluableChannel(norm) && !confirmed.has(norm)) {
      confirmed.set(norm, { key: norm, presence: 'confirmed' });
    }
  }

  const candidates = [...confirmed.values()];
  const surfaceRule = ROUTE_SURFACED_CHANNELS[profile.route];
  if (surfaceRule && !surfaceRule.candidates.some((c) => confirmed.has(c))) {
    candidates.push({ key: surfaceRule.surface, presence: 'surfaced', surfacedReason: surfaceRule.reason });
  }
  return candidates;
}

/**
 * Offer/format fit tags: the route's base tags (business-model-informed
 * reasoning, not a rule) layered with tags earned by THIS business's real
 * Module 2 proof inventory and Module 3 buying criteria -- ties the fit
 * evaluation to actual customer-specific evidence, not just a category
 * default.
 */
export function deriveOfferFormatTags({ route, buyingCriteria = [], proofInventory = [] }) {
  const tags = new Set(baseOfferFormatTagsForRoute(route));
  for (const c of buyingCriteria) {
    for (const t of CRITERIA_TO_FORMAT_TAGS[c.category] || []) tags.add(t);
  }
  for (const p of proofInventory) {
    for (const t of PROOF_TYPE_TO_FORMAT_TAGS[p.type] || []) tags.add(t);
  }
  return [...tags];
}

/** @returns {{score:number, level:'unknown'|'fits'|'partial'|'poor'}} */
function ownerExecutionFit(ref, channelPlan) {
  const feasible = channelPlan.feasibleFormats || [];
  const formatsKnown = feasible.length > 0 && !(feasible.length === 1 && feasible[0] === 'none_unsure');
  if (!formatsKnown) return { score: 0, level: 'unknown' };
  if (ref.requiredFormats.length === 0) return { score: 2, level: 'fits' }; // no specific production required (e.g. a marketplace listing, a local profile)
  const overlap = ref.requiredFormats.filter((f) => feasible.includes(f));
  if (overlap.length === ref.requiredFormats.length) return { score: 2, level: 'fits' };
  if (overlap.length > 0) return { score: 1, level: 'partial' };
  const lowHours = (channelPlan.marketingHoursPerWeek ?? 5) <= 3;
  return { score: ref.effortLevel === 'high' || lowHours ? -2 : -1, level: 'poor' };
}

function existingTractionScore(key, channelPlan) {
  const real = (channelPlan.existingAssets || []).filter((a) => a.level === 'real_traction');
  return real.some((a) => (ASSET_TYPE_TO_CHANNELS[a.type] || []).includes(key)) ? 3 : 0;
}

/**
 * The one deterministic internal weighted sum -- a reasoning aid for
 * ranking only. Never exposed to the customer as a score (see module4.mjs's
 * public artifact, which surfaces recommendation/job/reasoning/confidence,
 * not `total`).
 */
export function scoreCandidate(candidate, { offerFormatTags, channelPlan }) {
  const ref = channelRef(candidate.key);
  const presence = PRESENCE_WEIGHTS[candidate.presence] || 0;
  const intent = INTENT_WEIGHTS[ref.intent] || 0;
  const formatFit = ref.formatFit.filter((t) => offerFormatTags.includes(t)).length;
  const execution = ownerExecutionFit(ref, channelPlan);
  const traction = existingTractionScore(candidate.key, channelPlan);
  const timeToFeedback = TIME_TO_FEEDBACK_WEIGHTS[ref.timeToFeedback] || 0;
  const compounding = COMPOUNDING_WEIGHTS[ref.compounding] || 0;
  const constrained = (channelPlan.hardConstraints || []).includes(candidate.key);
  const total = presence + intent + formatFit + execution.score + traction + timeToFeedback + compounding;

  return {
    key: candidate.key, ref, presence: candidate.presence, surfacedReason: candidate.surfacedReason || null,
    constrained, total,
    breakdown: { presence, intent, formatFit, execution: execution.score, executionLevel: execution.level, traction, timeToFeedback, compounding },
  };
}

/**
 * Selects Primary (exactly one, unless nothing is eligible at all), at most
 * one Secondary, and at most one Compounding Asset (which may equal Primary
 * or Secondary), from already-scored candidates. Constrained (hard-excluded)
 * candidates are still scored so a genuine tradeoff can be explained, but
 * are never selected for Primary/Secondary/Compounding.
 */
export function selectChannelPlan(scoredCandidates, channelPlan) {
  const eligible = [...scoredCandidates].filter((c) => !c.constrained).sort((a, b) => b.total - a.total);
  if (eligible.length === 0) {
    return { primary: null, secondary: null, compounding: null, compoundingIsPrimary: false, compoundingIsSecondary: false, notNow: scoredCandidates, constrainedTradeoff: null };
  }

  const primary = eligible[0];
  const strongestOverall = [...scoredCandidates].sort((a, b) => b.total - a.total)[0];
  const constrainedTradeoff = strongestOverall.constrained && strongestOverall.total > primary.total ? strongestOverall : null;

  const remaining = eligible.slice(1);
  const lowCapacity = (channelPlan.marketingHoursPerWeek ?? 5) <= 2;
  const secondary = !lowCapacity && remaining.length > 0 && remaining[0].total > 0 && remaining[0].total >= primary.total * 0.4
    ? remaining[0]
    : null;

  let compounding = null;
  let compoundingIsPrimary = false;
  let compoundingIsSecondary = false;
  if (primary.ref.compounding === 'high') {
    compounding = primary; compoundingIsPrimary = true;
  } else if (secondary && secondary.ref.compounding === 'high') {
    compounding = secondary; compoundingIsSecondary = true;
  } else {
    compounding = eligible.find((c) => c !== primary && c !== secondary && c.ref.compounding === 'high') || null;
  }

  const selectedKeys = new Set([primary.key, secondary?.key, compoundingIsPrimary || compoundingIsSecondary ? null : compounding?.key].filter(Boolean));
  const notNow = scoredCandidates.filter((c) => !selectedKeys.has(c.key));

  return { primary, secondary, compounding, compoundingIsPrimary, compoundingIsSecondary, notNow, constrainedTradeoff };
}

/** Never a numeric score -- reuses the same three labels prior modules already established. */
export function classifyChannelConfidence({ module3Confidence, primary }) {
  if (!primary) {
    return { key: 'working_hypothesis', label: 'Working Hypothesis', explanation: 'Not enough discovery-environment evidence yet to recommend a channel with confidence.' };
  }
  if (primary.presence === 'surfaced') {
    return { key: 'working_hypothesis', label: 'Working Hypothesis', explanation: 'This channel was surfaced based on your business model, not confirmed customer evidence yet -- treat it as a starting hypothesis to test.' };
  }
  if (module3Confidence === 'evidence_backed' && primary.breakdown.traction > 0) {
    return { key: 'evidence_backed', label: 'Evidence-Backed', explanation: 'This is supported by real buyer evidence from Module 3 and real existing traction on this channel, not just an assumption.' };
  }
  if (module3Confidence === 'working_hypothesis') {
    return { key: 'working_hypothesis', label: 'Working Hypothesis', explanation: "This is a reasonable starting point, but the customer evidence behind it isn't strong yet." };
  }
  return { key: 'partially_validated', label: 'Partially Validated', explanation: 'Some real evidence supports this recommendation, but not enough yet to call it fully confirmed.' };
}

const ROLE_JOB_PRIORITY = {
  primary: ['marketplace_discovery', 'local_discovery', 'intent_capture', 'discovery', 'education'],
  secondary: ['trust', 'education', 'consideration', 'follow_up', 'referral', 'discovery'],
  compounding: ['discovery', 'intent_capture', 'trust', 'retention_repeat'],
};

/** Derives the job from the channel's own supported jobs -- never labels every platform "Discovery" by default. */
export function pickJobForRole(ref, role, avoidJob = null) {
  const priority = ROLE_JOB_PRIORITY[role] || ref.jobsSupported;
  const ordered = priority.filter((j) => ref.jobsSupported.includes(j));
  const withoutAvoid = avoidJob ? ordered.filter((j) => j !== avoidJob) : ordered;
  return withoutAvoid[0] || ordered[0] || ref.jobsSupported[0];
}

export const JOB_PHRASES = {
  discovery: 'put the business in front of people who do not already know it',
  intent_capture: 'show up when people are actively looking for something like this',
  education: 'help buyers understand the problem or the offer',
  trust: 'build confidence through proof and visibility',
  consideration: 'help people compare and evaluate before buying',
  follow_up: 'stay in touch with people after they show interest',
  conversion_support: 'help existing interest turn into a purchase',
  retention_repeat: 'support repeat buying',
  referral: 'generate introductions and recommendations',
  marketplace_discovery: 'capture buying intent that is already happening on the marketplace',
  local_discovery: 'capture geographically relevant demand',
};

/**
 * Ordered decision tree -- never labels a channel "bad," always explains the
 * most specific reason it isn't the current focus.
 */
export function reasonForNotNow(candidate, primary, channelPlan) {
  if (candidate.constrained) {
    const wouldHaveWon = primary && candidate.total > primary.total;
    return `You said you won't use ${candidate.ref.label}${wouldHaveWon ? ' -- it otherwise looks like a strong fit here, but we respect that constraint' : ''}. The best realistic alternative is ${primary ? primary.ref.label : 'your current primary channel'}.`;
  }
  if (candidate.breakdown.executionLevel === 'poor') {
    return 'This would require more production capacity than you currently have available -- worth revisiting once you have more time or the format gets easier.';
  }
  if (candidate.presence === 'surfaced') {
    return "We don't have evidence yet that your buyers actually use this for this kind of purchase -- worth revisiting once the primary channel is validated.";
  }
  if (primary && (INTENT_WEIGHTS[candidate.ref.intent] || 0) < (INTENT_WEIGHTS[primary.ref.intent] || 0)) {
    return 'Customer intent here looks weaker than on the channel you are already focusing on.';
  }
  if (candidate.ref.compounding === 'high') {
    return 'A good candidate for later -- worth building once your core message is validated on the primary channel.';
  }
  return 'Useful for visibility or trust, but not the current acquisition bottleneck.';
}

function jobLabel(job) {
  return JOB_PHRASES[job] || job.replace(/_/g, ' ');
}

/** A natural synthesis sentence, composed from whichever fields are actually present -- not a rigid fill-in-the-blank template. */
export function buildChannelStrategySynthesis({ primary, secondary, compounding, compoundingIsPrimary, compoundingIsSecondary, notNow, jobs }) {
  const parts = [`Use ${primary.ref.label} to ${jobLabel(jobs.primary)}.`];

  parts.push(secondary
    ? `Use ${secondary.ref.label} primarily to ${jobLabel(jobs.secondary)}.`
    : "No second channel is worth splitting attention with yet -- focus stays on one place.");

  if (compounding) {
    if (compoundingIsPrimary) parts.push(`${primary.ref.label} also builds a compounding asset over time, so this effort keeps working beyond individual marketing actions.`);
    else if (compoundingIsSecondary) parts.push(`${secondary.ref.label} also compounds, adding to discovery beyond its immediate reach.`);
    else parts.push(`Build ${compounding.ref.label} as a compounding asset, so discovery can continue beyond individual marketing actions.`);
  } else {
    parts.push('No compounding asset is worth building yet at this stage.');
  }

  if (notNow.length > 0) {
    const list = notNow.slice(0, 3).map((c) => c.ref.label).join(', ');
    parts.push(`Ignore ${list} for now until there is evidence that additional distribution is worth the added complexity.`);
  }

  return parts.join(' ');
}

const EXPERIMENT_BY_INTENT = {
  actively_searching: 'publish or optimize a small, real set of content or pages targeting your actual customer-language hypotheses from Module 3, then track search impressions, clicks, or page visits over the next couple of weeks.',
  comparing_products: 'optimize your existing listing (photos, description, the language your buyers actually use) and track views, saves, and messages over the next couple of weeks.',
  seeking_recommendations: 'deliberately reach out to a small number of real referral sources or relevant communities, and track the resulting conversations or inquiries.',
  seeking_education: 'publish one or two representative educational pieces and track whether they reach and engage people matching your Module 3 buyer description.',
  browsing_ideas: 'publish a small, representative set of content in a format you can realistically sustain, and track qualified engagement (saves, DMs, profile visits) from people matching your buyer description.',
  participating_in_communities: 'participate genuinely in a specific community for a short period and track direct questions or introductions that follow.',
  maintaining_relationships: 'use this channel deliberately with a small, specific group of contacts and track the resulting conversations.',
  consuming_entertainment: 'publish a small, representative set of content and track qualified engagement from people matching your buyer description, not just views.',
};
const EXPERIMENT_STATE_PREFIX = {
  starting_from_zero: 'Before doing much else, ',
  ready_to_sell: 'Next, ',
  building_momentum: 'Since you already have some traction, ',
};

/** One small, evidence-generating action -- never a 30-day plan, never a revenue promise. */
export function determineChannelExperiment({ primaryRef, startingStateKey }) {
  const base = EXPERIMENT_BY_INTENT[primaryRef.intent] || EXPERIMENT_BY_INTENT.browsing_ideas;
  const prefix = EXPERIMENT_STATE_PREFIX[startingStateKey] || EXPERIMENT_STATE_PREFIX.ready_to_sell;
  return prefix + base;
}
