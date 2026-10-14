/**
 * Module 6's sales-path reasoning engine.
 *
 * ATTENTION IS NOT THE OBJECTIVE -- revenue-producing customer movement is.
 * Every function here connects real Module 1-5 state to a concrete path,
 * never fabricates conversion performance, and distinguishes a customer's
 * own honest report ("I have a checkout page") from a Scrolly technical
 * verification (never claimed unless it actually happened -- it never does
 * in this deterministic, non-browsing codebase).
 *
 * MODULE 4 INTEGRATION RULE: every selected channel gets its OWN path to the
 * canonical destination -- a channel is never chained through another
 * channel (no "Google Search -> supports Instagram -> sale"). See
 * `buildChannelPaths`.
 */
import {
  DESTINATION_PRIORITY,
  DESTINATION_STEP_TEMPLATES,
  PATH_TYPE_BY_DESTINATION,
  TRUST_ASSET_CATEGORIES_BY_DESTINATION_KIND,
  closingStepsFor,
} from './sales-path-content.mjs';

/** The most direct/specific selected destination anchors the canonical path; all selections remain visible elsewhere (carried-forward context). */
export function pickCanonicalDestination(conversionDestinations = []) {
  const types = new Set(conversionDestinations.map((d) => d.type));
  for (const type of DESTINATION_PRIORITY) {
    if (types.has(type)) {
      const template = DESTINATION_STEP_TEMPLATES[type];
      return { type, template, detail: conversionDestinations.find((d) => d.type === type)?.detail || null };
    }
  }
  return null;
}

/**
 * A real, evidence-tied heuristic, never an arbitrary universal rule: a
 * meaningfully-priced considered purchase (services/digital at a real price
 * point) or an offer where buying criteria emphasize customization/expertise
 * plausibly needs a qualification/conversation step before booking or
 * payment. A $9.99 product or a low-price digital download does not.
 */
export function needsQualificationStep({ route, price, topBuyingCriteria = [] }) {
  const considersCustomizationOrExpertise = topBuyingCriteria.includes('customization') || topBuyingCriteria.includes('expertise');
  if (route === 'services') return (price ?? 0) >= 150 || considersCustomizationOrExpertise;
  if (route === 'digital_product') return (price ?? 0) >= 250 && considersCustomizationOrExpertise;
  return false;
}

/** Every selected channel gets its OWN path to the SAME canonical destination -- never chained through another channel. */
export function buildChannelPaths({ channels = [], canonicalDestination, needsQualification }) {
  if (!canonicalDestination || !canonicalDestination.template || canonicalDestination.template.kind === 'none') {
    return channels.map((c) => ({ channel: c.label, channelKey: c.key, job: c.job, steps: [c.label], destinationEstablished: false }));
  }
  const { template } = canonicalDestination;
  const closing = closingStepsFor(template.kind, needsQualification);
  const steps = [...template.steps, ...closing];
  return channels.map((c) => ({ channel: c.label, channelKey: c.key, job: c.job, steps: [c.label, ...steps], destinationEstablished: true }));
}

export function classifyPathType(canonicalDestination) {
  if (!canonicalDestination) return null;
  return PATH_TYPE_BY_DESTINATION[canonicalDestination.type] || null;
}

/** Real, direct buyer/behavior evidence -- existence of a destination or an account is never counted as this. */
export function hasQualifiedActivityEvidence({ profile, channelPlan, discoveryPlan, offerPlan }) {
  if (profile.currentRevenueUsd != null && profile.currentRevenueUsd > 0) return true;
  if ((channelPlan.existingAssets || []).some((a) => a.level === 'real_traction')) return true;
  if ((discoveryPlan.objections || []).some((o) => o.basis === 'observed')) return true;
  if ((offerPlan.proofInventory || []).some((p) => ['Sales/order history', 'Repeat customers'].includes(p.type))) return true;
  return false;
}

// --- B/C: Next-Step Clarity + Purchase/Contact Ability ----------------------

export function evaluateNextStepClarity({ canonicalDestination, channelMessageMap }) {
  if (!canonicalDestination || canonicalDestination.template.kind === 'none') {
    return { state: 'not_established', headline: 'No clear next step exists yet', rationale: "There's no destination in place yet for an interested buyer to act on." };
  }
  const hasCtas = (channelMessageMap || []).length > 0;
  if (hasCtas) {
    return { state: 'clear', headline: 'The next step is reasonably clear', rationale: `Your channels point toward specific actions (${channelMessageMap.map((c) => c.ctaLabel).join(', ')}) that lead somewhere real.` };
  }
  return { state: 'working_hypothesis', headline: 'A destination exists, but the expected action isn\'t fully defined', rationale: 'A destination exists, but no channel-specific call to action has been established yet.' };
}

export function evaluatePurchaseContactAbility({ conversionDestinations }) {
  const real = (conversionDestinations || []).filter((d) => d.type !== 'not_set_up_yet');
  if (real.length === 0) {
    return { state: 'not_established', headline: 'No purchase/contact mechanism reported', rationale: 'No way for an interested buyer to complete a purchase or contact you has been reported yet.', verification: 'none' };
  }
  return {
    state: 'customer_reported', headline: 'A mechanism is reported to exist', rationale: `You've told us a real way to buy/book/contact exists (${real.map((d) => d.type.replace(/_/g, ' ')).join(', ')}). This reflects what you reported -- Scrolly has not technically tested it.`,
    verification: 'customer_reported',
  };
}

// --- D: Contextual Friction --------------------------------------------------

/**
 * Never "more steps = bad." Friction is only flagged when the actual step
 * count is mismatched with price/complexity/qualification-need evidence --
 * an unqualified low-price offer with an unusually long path, or a
 * meaningfully-priced considered offer with an unusually short one for a
 * plausibly-needed qualification step.
 */
export function evaluateContextualFriction({ route, price, needsQualification, pathSteps = [] }) {
  const stepCount = pathSteps.length;
  const simpleDirectRoutes = ['ecommerce', 'marketplace_first', 'digital_product'];
  if (simpleDirectRoutes.includes(route) && (price ?? 0) < 50 && !needsQualification && stepCount > 5) {
    return { state: 'growth_opportunity', headline: 'The path may be longer than this offer needs', rationale: `At ${price != null ? '$' + price : 'this price'}, a ${stepCount}-step path is more than a simple, low-price purchase usually needs.` };
  }
  if (route === 'services' && needsQualification && stepCount < 3) {
    return { state: 'growth_opportunity', headline: 'The path may be shorter than this offer needs', rationale: 'A meaningfully-priced, considered service usually benefits from a real qualification step before booking/payment -- right now the path skips straight there.' };
  }
  return { state: 'on_track', headline: 'Step count looks appropriate for this offer', rationale: 'The number of steps is reasonably matched to the price, complexity, and business model -- not flagged as friction.' };
}

// --- E: Trust at the Decision Point ------------------------------------------

/** Reuses Module 5's real proofPlan only -- never invents proof. Placement (whether it's actually AT the destination) is explicitly unknown unless the customer told us otherwise, which Module 6 doesn't ask. */
export function buildTrustGuidance({ canonicalDestination, proofPlan }) {
  const kind = canonicalDestination?.template?.kind || 'none';
  const relevantCategories = TRUST_ASSET_CATEGORIES_BY_DESTINATION_KIND[kind] || [];
  const existingRelevant = (proofPlan.existingProof || []).filter((p) => relevantCategories.includes(p.type));

  if ((proofPlan.existingProof || []).length === 0) {
    return { state: 'not_established', existing: [], placementKnown: false, toBuild: proofPlan.proofToBuild || [], rationale: 'No proof exists yet -- nothing to place at the decision point.' };
  }
  if (existingRelevant.length > 0) {
    return { state: 'exists_placement_unknown', existing: existingRelevant, placementKnown: false, toBuild: [], rationale: `You have relevant proof (${existingRelevant.map((p) => p.type).join(', ')}) for this kind of decision point, but whether it's actually placed where the buyer decides is unknown -- that's worth checking, not assumed.` };
  }
  return { state: 'exists_placement_unknown', existing: proofPlan.existingProof, placementKnown: false, toBuild: [], rationale: "You have proof on file, but it may not be the type most relevant to this decision point, and whether it's actually visible there is unknown." };
}

// --- CTA -> Destination Map --------------------------------------------------

const TRANSACTIONAL_DESTINATION_KINDS = ['purchase'];

/** A real, evidence-based mismatch check -- never invents a "generic homepage" destination that wasn't reported. */
export function buildCtaDestinationMap({ channelMessageMap = [], canonicalDestination }) {
  return channelMessageMap.map((c) => {
    const destinationLabel = canonicalDestination?.template?.label || null;
    let mismatch = false;
    let mismatchReason = null;
    if (!canonicalDestination || canonicalDestination.template.kind === 'none') {
      mismatch = true;
      mismatchReason = "This CTA has nowhere real to send someone yet -- no destination has been established.";
    } else if (c.ctaCategory === 'buy_convert' && !TRANSACTIONAL_DESTINATION_KINDS.includes(canonicalDestination.template.kind)) {
      mismatch = true;
      mismatchReason = `This CTA implies a direct purchase, but the current destination (${destinationLabel}) is not a direct-purchase mechanism -- it may need a qualification/conversation step instead of a hard sell.`;
    }
    return { channel: c.channel, ctaCategory: c.ctaCategory, ctaLabel: c.ctaLabel, destination: destinationLabel, mismatch, mismatchReason };
  });
}

// --- Conversion Gap: the single most important issue or unknown ------------

const GAP_CATEGORY_LABELS = {
  no_purchase_path: 'No Purchase Path Established',
  no_inquiry_path: 'No Inquiry Path Established',
  insufficient_qualified_activity: 'Insufficient Qualified Activity',
  cta_destination_mismatch: 'CTA / Destination Mismatch',
  unnecessary_friction: 'Unnecessary Friction',
  decision_point_trust_gap: 'Decision-Point Trust Gap',
  offer_information_gap: 'Offer Information Gap',
  mobile_path_unknown: 'Mobile Path Unknown',
  follow_up_opportunity: 'Follow-Up Opportunity',
  path_appears_sound: 'Path Appears Structurally Sound',
};

/**
 * Ordered decision tree, exactly like Module 1-5's Fix-First/Discovery-Gap
 * trees -- never manufactures a problem merely because this module needs an
 * output. CRITICAL: insufficient qualified activity is checked BEFORE any
 * friction/trust nuance, so "we don't have enough activity to know" is never
 * silently replaced by "your checkout isn't converting."
 */
export function determineConversionGap({ route, canonicalDestination, hasActivity, ctaMap, friction, trustGuidance, offerClarityState, mobileStatus, mobileRelevant, followUpMechanism, followUpPlausiblyNeeded }) {
  if (!canonicalDestination || canonicalDestination.template.kind === 'none') {
    const key = ['services', 'digital_product'].includes(route) && route !== 'ecommerce' ? 'no_inquiry_path' : 'no_purchase_path';
    return { category: key, label: GAP_CATEGORY_LABELS[key], rationale: 'No real way for an interested buyer to complete a purchase or contact you has been reported yet -- this is the actual current blocker, before anything else can be evaluated.' };
  }
  if (!hasActivity) {
    return { category: 'insufficient_qualified_activity', label: GAP_CATEGORY_LABELS.insufficient_qualified_activity, rationale: "We don't yet have enough qualified buying activity to know how effectively this path converts. Low sales right now does not necessarily mean a conversion problem." };
  }
  const mismatch = ctaMap.find((c) => c.mismatch);
  if (mismatch) {
    return { category: 'cta_destination_mismatch', label: GAP_CATEGORY_LABELS.cta_destination_mismatch, rationale: mismatch.mismatchReason };
  }
  if (friction.state === 'growth_opportunity') {
    return { category: 'unnecessary_friction', label: GAP_CATEGORY_LABELS.unnecessary_friction, rationale: friction.rationale };
  }
  if (trustGuidance.state === 'not_established') {
    return { category: 'decision_point_trust_gap', label: GAP_CATEGORY_LABELS.decision_point_trust_gap, rationale: 'No proof exists yet to support the buying decision at this destination.' };
  }
  if (offerClarityState === 'growth_opportunity' || offerClarityState === 'not_established') {
    return { category: 'offer_information_gap', label: GAP_CATEGORY_LABELS.offer_information_gap, rationale: "Real evidence (or a genuine gap) suggests the offer itself isn't clearly understood yet -- worth resolving before optimizing the path further." };
  }
  if (mobileRelevant && mobileStatus === 'unknown_needs_checking') {
    return { category: 'mobile_path_unknown', label: GAP_CATEGORY_LABELS.mobile_path_unknown, rationale: "Discovery here is plausibly mobile-heavy, and whether the buying path works well on mobile hasn't been checked yet." };
  }
  if (followUpMechanism === 'none' && followUpPlausiblyNeeded) {
    return { category: 'follow_up_opportunity', label: GAP_CATEGORY_LABELS.follow_up_opportunity, rationale: 'There is a plausible reason an interested-but-not-ready buyer would benefit from a way to stay in touch, and none exists yet.' };
  }
  return { category: 'path_appears_sound', label: GAP_CATEGORY_LABELS.path_appears_sound, rationale: 'No structural issue or gap stands out right now given the actual evidence on file.' };
}

// --- Direct vs Nurture-Supported ---------------------------------------------

export function determineConversionApproach({ route, canonicalDestination, needsQualification, offerClarityState, proofTrustState, hasObservedTrustObjection }) {
  if (route === 'marketplace_first') {
    return { approach: 'marketplace_native', rationale: 'This is a marketplace-first business -- the marketplace itself (not a separate website/nurture system) is the natural buying environment.' };
  }
  if (needsQualification) {
    return { approach: 'qualification_led', rationale: 'The price/complexity of this offer plausibly warrants a real qualification or conversation step before booking or payment -- not full email nurture, just a conversation.' };
  }
  if (hasObservedTrustObjection || offerClarityState === 'growth_opportunity' || proofTrustState === 'growth_opportunity') {
    return { approach: 'nurture_supported', rationale: 'Real evidence (an observed trust-related objection, or a genuine clarity/trust gap) suggests buyers need more context before they\'re ready -- a supporting step (not necessarily email) may help before the ask.' };
  }
  if (canonicalDestination && canonicalDestination.template.kind === 'purchase') {
    return { approach: 'direct_conversion', rationale: 'No evidence suggests buyers need extra convincing before purchasing -- a direct path is appropriate, and adding steps now would be unjustified complexity.' };
  }
  return { approach: 'direct_conversion', rationale: 'No evidence currently justifies additional steps before conversion.' };
}

// --- Fix Now / Keep / Measure First ------------------------------------------

const FIX_NOW_BY_GAP = {
  no_purchase_path: { title: 'Set up a real way for an interested buyer to complete a purchase or contact you.', rationale: 'Nothing else in the path matters until this exists.' },
  no_inquiry_path: { title: 'Set up a real way for an interested buyer to reach you (inquiry form, DM, phone, or booking link).', rationale: 'Nothing else in the path matters until this exists.' },
  cta_destination_mismatch: { title: 'Send each CTA to the specific destination it implies, not a generic or mismatched one.', rationale: 'A mismatched destination wastes the attention the marketing already earned.' },
  unnecessary_friction: { title: 'Remove the step(s) that don\'t match this offer\'s actual price/complexity.', rationale: 'The path currently asks for more than this buyer likely needs to decide.' },
  decision_point_trust_gap: { title: 'Add real proof at the decision point before investing further in traffic.', rationale: 'No proof exists yet to support the buying decision.' },
  offer_information_gap: { title: 'Clarify the offer itself before optimizing the rest of the path.', rationale: 'Buyers may not yet understand what they\'d be buying.' },
  mobile_path_unknown: { title: 'Check that the buying path actually works on a phone before increasing mobile-heavy traffic.', rationale: 'Discovery here is plausibly mobile-heavy and this has not been checked yet.' },
  follow_up_opportunity: { title: 'Add a simple way for an interested-but-not-ready buyer to stay in touch.', rationale: 'Right now that interest has nowhere to go if they\'re not ready today.' },
  insufficient_qualified_activity: { title: 'No structural rebuild is justified yet -- focus on generating enough qualified activity to learn from.', rationale: 'There isn\'t enough real activity yet to know what, if anything, actually needs fixing.' },
  path_appears_sound: { title: 'No structural rebuild is justified yet -- make the current path measurable.', rationale: 'The path appears structurally sound given the evidence on file.' },
};

export function determineFixNow(gap) {
  return FIX_NOW_BY_GAP[gap.category] || FIX_NOW_BY_GAP.path_appears_sound;
}

export function determineKeep({ conversionApproach, canonicalDestination }) {
  if (conversionApproach.approach === 'direct_conversion' && canonicalDestination) {
    return { title: `Keep the direct path through ${canonicalDestination.template.label}.`, rationale: 'A nurture funnel or extra steps are not justified by the evidence yet.' };
  }
  if (conversionApproach.approach === 'marketplace_native') {
    return { title: 'Keep relying on the marketplace itself rather than building a separate website funnel.', rationale: 'A marketplace-first business rarely needs to replace its own marketplace discovery/checkout.' };
  }
  if (conversionApproach.approach === 'qualification_led') {
    return { title: 'Keep the qualification/conversation step.', rationale: 'This is appropriate given the price/complexity of the offer, not unnecessary friction.' };
  }
  return { title: 'Keep the current path shape for now.', rationale: 'No evidence suggests the current approach itself is the problem.' };
}

export function determineMeasureFirst({ gap, hasActivity }) {
  if (!hasActivity) {
    return { title: 'Whether real, qualified buying activity is reaching your destination at all.', rationale: 'This has to be known before conversion itself can be evaluated.' };
  }
  if (gap.category === 'cta_destination_mismatch' || gap.category === 'unnecessary_friction') {
    return { title: 'Whether qualified visitors reach and move through the corrected path.', rationale: 'This directly tests whether the fix actually changes behavior.' };
  }
  if (gap.category === 'decision_point_trust_gap') {
    return { title: 'Whether adding proof at the decision point changes buying behavior.', rationale: 'This is the most useful unresolved question once real proof exists to test.' };
  }
  return { title: 'How many qualified, interested people actually move through the existing path to a real outcome.', rationale: 'This is the most useful next question given the current evidence.' };
}

// --- First Sales-Path Experiment ---------------------------------------------

export function determineSalesPathExperiment({ gap, canonicalDestination, primaryChannelLabel }) {
  const destinationLabel = canonicalDestination?.template?.label || 'your destination';
  const channel = primaryChannelLabel || 'your primary channel';
  switch (gap.category) {
    case 'no_purchase_path':
    case 'no_inquiry_path':
      return `Set up the single simplest version of a real destination (even a basic payment link, DM process, or contact form) before sending any more traffic there.`;
    case 'cta_destination_mismatch':
      return `Correct the mismatched CTA to point directly at ${destinationLabel}, and observe whether qualified clicks turn into real next steps.`;
    case 'unnecessary_friction':
      return `Remove the one step that doesn't match this offer's price/complexity, and observe whether qualified visitors move through the path more easily.`;
    case 'decision_point_trust_gap':
      return `Place your existing proof directly at ${destinationLabel} and observe whether it changes buying behavior.`;
    case 'mobile_path_unknown':
      return `Verify the buying path actually works on a phone before increasing traffic from ${channel}, since discovery there is plausibly mobile-heavy.`;
    case 'insufficient_qualified_activity':
      return `Send a small, representative amount of qualified traffic from ${channel} to ${destinationLabel} and establish a real baseline for how far people actually get.`;
    default:
      return `Send a small, representative amount of qualified traffic from ${channel} to ${destinationLabel}, and track how far people actually get before deciding anything needs to change.`;
  }
}

// --- Path-Specific Metrics ----------------------------------------------------

/** The smallest useful measurement set -- Module 4's own Early Evidence Signals as the upstream layer, this path's own steps as the mid-funnel layer, revenue as the outcome. Never forces an unavailable metric. */
export function buildPathMetrics({ earlyEvidence = [], canonicalDestination }) {
  const upstream = [...earlyEvidence];
  const midFunnel = canonicalDestination && canonicalDestination.template.kind !== 'none' ? canonicalDestination.template.steps.slice(0, -1) : [];
  return [...upstream, ...midFunnel, 'Revenue'];
}
