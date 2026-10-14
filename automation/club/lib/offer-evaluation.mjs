/**
 * Module 2's offer evaluation: Offer Clarity, Buyer Fit, Reason to Choose,
 * Price / $1K Economics, Proof / Trust, Buying Friction.
 *
 * Same discipline as mini-evaluation.mjs (Module 1), extended with one more
 * honest state this domain actually needs: a customer's own stated belief
 * (a claimed differentiator, an assumed audience) is real information, but
 * it is NOT the same as validated evidence -- calling it 'on_track' would
 * overstate confidence, and calling it 'insufficient_data' would understate
 * what we actually know. 'working_hypothesis' names that middle state
 * explicitly, so nothing gets manufactured into a performance judgment it
 * hasn't earned.
 *
 * States used across dimensions: 'not_established' | 'working_hypothesis' |
 * 'insufficient_data' | 'growth_opportunity' | 'on_track' | 'growth_strength'.
 * Never a numeric score.
 */

function dim(name, state, headline, rationale, evidence = {}) {
  return { name, state, headline, rationale, evidence };
}

function hasText(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function evalOfferClarity(plan) {
  const described = hasText(plan.offerConfirmed) && hasText(plan.whatTheyGet);
  if (!described) {
    return dim('Offer Clarity', 'not_established', 'Offer not yet clearly described', "We don't have a clear description of what the buyer actually receives yet.", {});
  }
  const clarityObjection = plan.objections.find((o) => o.basis === 'observed' && /unclear product information|unclear next step|complexity/i.test(o.type));
  if (clarityObjection) {
    return dim('Offer Clarity', 'growth_opportunity', 'Buyers have reported confusion', `A real, observed objection ("${clarityObjection.type}") suggests the offer isn't landing clearly yet.`, { objection: clarityObjection });
  }
  return dim('Offer Clarity', 'working_hypothesis', 'Described, not yet buyer-tested', "The offer is clearly described on paper. Whether real buyers find it just as clear hasn't been tested yet.", {});
}

function evalBuyerFit(plan, profile) {
  if (!hasText(plan.audienceConfirmed)) {
    return dim('Buyer Fit', 'not_established', 'Buyer not yet defined', "The most likely buyer hasn't been described yet.", {});
  }
  const fitObjection = plan.objections.find((o) => o.basis === 'observed' && /unclear fit/i.test(o.type));
  if (fitObjection) {
    return dim('Buyer Fit', 'growth_opportunity', 'Fit has been questioned', 'A real, observed objection suggests the described buyer may not be the right fit.', { objection: fitObjection });
  }
  if (profile.currentRevenueUsd != null && profile.currentRevenueUsd > 0) {
    return dim('Buyer Fit', 'growth_strength', 'Real buyers match the description', 'Real revenue exists, which is direct evidence that someone matching this description actually buys.', { currentRevenueUsd: profile.currentRevenueUsd });
  }
  return dim('Buyer Fit', 'working_hypothesis', 'A described, unvalidated buyer', "The likely buyer is described, but that's a working assumption until real buying activity confirms it.", {});
}

function evalReasonToChoose(plan) {
  if (plan.differentiation.status === 'unknown') {
    return dim('Reason to Choose', 'insufficient_data', "Differentiation isn't known yet", "\"I don't know yet\" is a valid, honest answer here — this is something to learn, not invent.", {});
  }
  return dim('Reason to Choose', 'working_hypothesis', 'A stated, unvalidated reason', `A reason is stated (${plan.differentiation.category || 'differentiation'}), but it hasn't been validated with real buyers yet.`, { category: plan.differentiation.category, detail: plan.differentiation.detail });
}

/** Deliberately never labels a low price a problem -- see evaluateOffer's header note. */
function evalPriceEconomics(math) {
  const note = math.isHighTransactionCount
    ? `At $${math.price} the plan requires ${math.requiredSales} sales — a relatively high transaction count worth understanding operationally, not a signal the price itself is wrong.`
    : `${math.requiredSales} sales at this price is a reasonable, workable transaction count.`;
  return dim('Price / $1K Economics', 'on_track', 'Price is a workable starting point', note, { price: math.price, requiredSales: math.requiredSales, isHighTransactionCount: math.isHighTransactionCount });
}

/** Existence (has any proof been listed) and performance (is it demonstrated to matter) are reported separately -- existence alone never implies performance. */
function evalProofTrust(plan, module1TrustDim) {
  const existenceState = plan.proofInventory.length > 0 ? 'exists' : 'not_established';
  const headline = existenceState === 'exists' ? 'Proof exists' : 'No proof/trust assets yet';
  const rationale = existenceState === 'exists'
    ? `${plan.proofInventory.length} proof item(s) on file. That alone does not establish how much they actually move a buying decision.`
    : "No reviews, testimonials, samples, or other trust assets recorded yet — expected and fine for an early-stage offer.";
  return dim('Proof / Trust', module1TrustDim.state, headline, rationale, {
    existenceState,
    proofCount: plan.proofInventory.length,
    proofTypes: plan.proofInventory.map((p) => p.type),
    performanceNote: module1TrustDim.rationale,
  });
}

function evalBuyingFriction(plan, profile) {
  const observed = plan.objections.filter((o) => o.basis === 'observed');
  const hypothesized = plan.objections.filter((o) => o.basis === 'hypothesis');
  if (observed.length > 0) {
    return dim('Buying Friction', 'growth_opportunity', 'A real objection has come up', `Real buyers have raised: ${observed.map((o) => o.type).join(', ')}.`, { observed });
  }
  if (profile.currentRevenueUsd != null && profile.currentRevenueUsd > 0 && hypothesized.length === 0) {
    return dim('Buying Friction', 'growth_strength', 'No known friction, and sales exist', 'Real revenue exists and no objection has been reported — the buying process evidently works for at least some buyers.', {});
  }
  if (hypothesized.length > 0) {
    return dim('Buying Friction', 'working_hypothesis', 'Possible friction, not yet confirmed', `Possible concerns noted but not yet observed from a real buyer: ${hypothesized.map((o) => o.type).join(', ')}.`, { hypothesized });
  }
  return dim('Buying Friction', 'not_established', 'No friction identified yet', "No buying objections — real or suspected — have been captured yet.", {});
}

/**
 * @param {object} profile - the Module 1 BusinessProfile
 * @param {object} plan - the Module 2 OfferPlan
 * @param {object} math - from thousand-k-math.mjs's computeThousandKMath() (reused from Module 1, not recomputed differently)
 * @param {object} module1TrustDim - Module 1's own Trust dimension result (mini-evaluation.mjs), reused rather than re-derived
 */
export function evaluateOffer({ profile, plan, math, module1TrustDim }) {
  return {
    offerClarity: evalOfferClarity(plan),
    buyerFit: evalBuyerFit(plan, profile),
    reasonToChoose: evalReasonToChoose(plan),
    priceEconomics: evalPriceEconomics(math),
    proofTrust: evalProofTrust(plan, module1TrustDim),
    buyingFriction: evalBuyingFriction(plan, profile),
  };
}

// --- Fix First / Keep / Learn ---------------------------------------------

/**
 * 2026-09-12 fix: this used to stop checking after 4 specific
 * growth_opportunity/not_established branches and fall through to a single
 * hardcoded generic clarity line for every other case -- which is most
 * real profiles (an early-stage offer usually has everything sitting at
 * "stated but unvalidated," not yet escalated to a real observed problem).
 * That made FIX FIRST say the same generic thing regardless of what the
 * system actually knew. Fixed with a full, ordered scan across all 6
 * dimensions, deterministic and evidence-only (no LLM, no guessing):
 *
 * 1. A foundational dimension is missing outright (not_established) --
 *    nothing else can be judged meaningfully before this exists.
 * 2. Any dimension has a REAL, evidenced problem (growth_opportunity),
 *    checked in foundational order -- always outranks an unvalidated guess.
 * 3. Nothing is evidenced as broken, but real unused material exists:
 *    proof/trust assets are on file but not yet known to move a buying
 *    decision -- a concrete, low-risk, specific action using something
 *    the customer already has, so this outranks generic hypothesis-tier
 *    dimensions that have no comparably concrete lever.
 * 4. A stated-but-unvalidated differentiator -- sharpening/validating a
 *    claimed reason to choose is a more specific, higher-leverage action
 *    than re-polishing a description that's already complete.
 * 5. A stated-but-unvalidated buyer description -- deliberately ranked
 *    below 3 and 4, not defaulted to just because it's often unresolved.
 * 6. The offer description itself hasn't been buyer-tested -- true for
 *    almost every early profile, so it's the last resort before the
 *    generic catch-all, not the default.
 */
function determineFixFirst(dims) {
  if (dims.offerClarity.state === 'not_established') {
    return { title: 'Clarify what the buyer receives.', rationale: "There's no clear description of the deliverable yet — everything else (positioning, proof, friction) is easier to judge once this exists." };
  }
  if (dims.buyerFit.state === 'not_established') {
    return { title: 'Clarify who this offer is for.', rationale: "There's no description yet of who's most likely to buy — positioning and proof are hard to judge without this." };
  }

  const opportunityChecks = [
    ['offerClarity', () => ({ title: 'Clarify what the buyer receives — buyers have said this is confusing.', rationale: dims.offerClarity.rationale })],
    ['buyerFit', () => ({ title: 'Clarify who this offer is really for.', rationale: dims.buyerFit.rationale })],
    ['buyingFriction', () => ({ title: `Address the "${dims.buyingFriction.evidence.observed[0].type}" concern buyers have raised.`, rationale: 'This is a real, observed objection — the highest-confidence issue currently on file.' })],
  ];
  for (const [key, build] of opportunityChecks) {
    if (dims[key].state === 'growth_opportunity') return build();
  }

  if (dims.proofTrust.evidence.existenceState === 'exists' && dims.proofTrust.state !== 'growth_strength' && dims.proofTrust.state !== 'on_track') {
    const proofList = dims.proofTrust.evidence.proofTypes.join(', ');
    return {
      title: `Put your existing proof (${proofList}) somewhere a new buyer will actually see it before they decide.`,
      rationale: "Real proof exists but hasn't been shown to move a buying decision yet — a concrete, low-risk improvement using something you already have, not a sign the offer needs to change.",
    };
  }
  if (dims.reasonToChoose.state === 'working_hypothesis') {
    return {
      title: `Make the case for "${dims.reasonToChoose.evidence.category}" concrete enough that a new buyer would actually notice it.`,
      rationale: 'A reason to choose this offer is stated but hasn\'t been made visible or validated with real buyers yet.',
    };
  }
  if (dims.buyerFit.state === 'working_hypothesis') {
    return { title: "Get specific about who this is for, so it's easy to tell if the right people are responding.", rationale: dims.buyerFit.rationale };
  }
  if (dims.offerClarity.state === 'working_hypothesis') {
    return {
      title: 'Tighten the one-sentence description of the offer so it reads clearly at a glance.',
      rationale: "No evidence-backed issue stands out yet, and the offer description itself hasn't been tested with real buyers.",
    };
  }
  return {
    title: 'Tighten the one-sentence description of the offer so it reads clearly at a glance.',
    rationale: 'No evidence-backed issue stands out right now — this is a lightweight clarity pass, not a sign the offer needs to change.',
  };
}

function determineKeep(dims, math) {
  return {
    title: `Keep the $${math.price} price for now.`,
    rationale: 'There is not enough evidence that price is the constraint — changing it now would be a guess, not a response to real evidence.',
  };
}

function determineLearn(dims) {
  if (dims.reasonToChoose.state === 'insufficient_data') {
    return { title: "Whether buyers understand why this offer is different from alternatives.", rationale: 'No differentiator is stated yet — this is genuinely unknown, not just unclear.' };
  }
  if (dims.buyerFit.state === 'working_hypothesis') {
    return { title: 'Whether the people believed to be the buyer are actually the ones who buy.', rationale: 'The audience is described but not yet confirmed by real buying activity.' };
  }
  if (dims.proofTrust.evidence.existenceState === 'not_established') {
    return { title: 'What kind of proof would actually help buyers feel confident.', rationale: 'No proof/trust assets exist yet — normal at this stage, but worth learning what would matter most.' };
  }
  if (dims.buyingFriction.state === 'not_established' || dims.buyingFriction.state === 'working_hypothesis') {
    return { title: 'What actually makes a real buyer hesitate.', rationale: 'No confirmed objection exists yet — this can only be learned from real buyer exposure.' };
  }
  return { title: 'Whether the current offer converts as well as it could.', rationale: 'The best way to find out is a real test, not more analysis.' };
}

export function buildFixFirstKeepLearn(dims, math) {
  return { fixFirst: determineFixFirst(dims), keep: determineKeep(dims, math), learn: determineLearn(dims) };
}

// --- Offer Experiment -------------------------------------------------------

const EXPERIMENT_BY_STARTING_STATE = {
  starting_from_zero: 'Show the clarified offer to a small number of relevant potential buyers and record the questions/objections they have.',
  ready_to_sell: 'Put the offer in front of qualified prospects through an existing viable channel and watch for meaningful buying intent.',
  building_momentum: 'Compare the revised positioning/offer presentation against current behavior and measure whether buying activity improves.',
};

export function determineOfferExperiment(startingStateKey) {
  return EXPERIMENT_BY_STARTING_STATE[startingStateKey] || EXPERIMENT_BY_STARTING_STATE.ready_to_sell;
}
