/**
 * Module 3's evaluation logic: confidence classification, "What This Tells
 * Us" interpretation, the Discovery Gap, the Customer Discovery Experiment,
 * and top-buying-criteria derivation.
 *
 * CONFIDENCE is never a numeric score (per the spec) -- it's one of three
 * customer-facing states: Evidence-Backed / Partially Validated / Working
 * Hypothesis, derived from how many independent, REAL buyer-evidence
 * sources (see discovery-content.mjs's STRONG_EVIDENCE_SOURCES) the customer
 * actually selected. A customer's own intuition/experience/competitor
 * observation is real information but never counted as buyer evidence here
 * -- exactly the discipline mini-evaluation.mjs and offer-evaluation.mjs
 * already established for Modules 1/2 (a stated belief is never silently
 * upgraded into a validated fact).
 */
import { STRONG_EVIDENCE_SOURCES } from './discovery-content.mjs';

const CONFIDENCE_LEVELS = {
  working_hypothesis: {
    key: 'working_hypothesis',
    label: 'Working Hypothesis',
    explanation: "This is a reasonable current belief, but it isn't yet backed by real buyer evidence -- treat it as something to test, not a settled fact.",
  },
  partially_validated: {
    key: 'partially_validated',
    label: 'Partially Validated',
    explanation: 'Some real evidence exists, but not enough yet to treat this as a confirmed picture of who buys and why.',
  },
  evidence_backed: {
    key: 'evidence_backed',
    label: 'Evidence-Backed',
    explanation: 'Multiple real, independent sources of buyer evidence support this picture -- a meaningfully confident starting point, not a guess.',
  },
};

/** @param {string[]} evidenceSources @returns {object} one of CONFIDENCE_LEVELS -- never a numeric score. */
export function classifyConfidence(evidenceSources = []) {
  const strongCount = evidenceSources.filter((s) => STRONG_EVIDENCE_SOURCES.includes(s)).length;
  if (strongCount >= 2) return CONFIDENCE_LEVELS.evidence_backed;
  if (strongCount === 1) return CONFIDENCE_LEVELS.partially_validated;
  return CONFIDENCE_LEVELS.working_hypothesis;
}

/**
 * "The most relevant criteria, not simply dump every checked item into an
 * undifferentiated list" -- surfaces up to `max` categories, prioritizing
 * ones the route config already flags as typically relevant to this
 * business model, but ONLY among what the customer actually selected
 * (never adds a category the customer didn't check).
 */
export function deriveTopBuyingCriteria(buyingCriteria = [], routeLanguage, max = 4) {
  const selected = buyingCriteria.map((c) => c.category);
  if (selected.length === 0) return [];
  const suggested = routeLanguage.suggestedCriteriaCategories.filter((c) => selected.includes(c));
  const rest = selected.filter((c) => !suggested.includes(c));
  return [...suggested, ...rest].slice(0, max);
}

/**
 * Ordered, evidence-gated interpretation notes -- each one only fires when
 * the underlying data actually supports it. Never invents a claim the
 * supplied answers don't back up.
 */
export function buildWhatThisTellsUs({ plan, confidence }) {
  const notes = [];

  if (plan.primaryTriggerCategory && plan.primaryTriggerCategory !== 'not_sure_yet' && confidence.key !== 'working_hypothesis') {
    notes.push('This purchase appears trigger-driven rather than casual discovery -- something specific tends to happen right before this buyer starts looking.');
  }

  const criteriaSet = new Set((plan.buyingCriteria || []).map((c) => c.category));
  if (criteriaSet.has('proof') || criteriaSet.has('reviews') || criteriaSet.has('expertise')) {
    notes.push("Trust appears especially important to this buyer's decision -- proof, reviews, or expertise showed up as something they compare.");
  }

  const envs = new Set(plan.discoveryEnvironments || []);
  const marketplaceEnvs = ['etsy', 'amazon', 'marketplaces_directories'].filter((e) => envs.has(e));
  const socialEnvs = ['instagram', 'tiktok', 'facebook', 'threads', 'pinterest'].filter((e) => envs.has(e));
  if (marketplaceEnvs.length > 0 && marketplaceEnvs.length >= socialEnvs.length) {
    notes.push('Marketplace intent may matter more here than social reach, based on where this buyer is expected to look.');
  }

  const observedObjections = (plan.objections || []).filter((o) => o.basis === 'observed');
  if (observedObjections.length > 0) {
    notes.push('At least one real, observed objection exists -- this buyer appears to research or compare before purchasing rather than buying on impulse.');
  }

  if (confidence.key === 'working_hypothesis') {
    notes.push('Customer language and buying behavior here are still mostly hypothetical -- none of it has been confirmed by real buyer evidence yet.');
  } else if (confidence.key === 'evidence_backed') {
    notes.push('Existing buyer evidence is strong enough to meaningfully inform channel selection in the next module.');
  }

  return notes;
}

/**
 * The single most important unresolved customer question -- an ordered
 * decision tree, not a menu. Only reaches "refinement, not a foundational
 * gap" once the picture is genuinely strong (never manufactures a gap when
 * evidence is already strong; identifies the most useful remaining
 * refinement instead, per the spec).
 */
export function determineDiscoveryGap({ plan, confidence }) {
  if (confidence.key === 'working_hypothesis') {
    return {
      title: "Who is actually buying, and why -- right now this is entirely an assumption.",
      rationale: 'No real evidence source (existing buyers, sales conversations, reviews, support questions, etc.) has been recorded yet.',
    };
  }
  if ((plan.customerLanguageHypotheses || []).length === 0) {
    return {
      title: 'What buyers actually call this problem when they start looking for help.',
      rationale: 'No real search/query/customer-language evidence has been captured yet -- the exact phrasing buyers use is still unknown.',
    };
  }
  if ((plan.discoveryEnvironments || []).length === 0) {
    return {
      title: 'Where buyers actually discover something like this.',
      rationale: 'No plausible discovery environment has been identified yet.',
    };
  }
  const hasObservedObjection = (plan.objections || []).some((o) => o.basis === 'observed');
  if (!hasObservedObjection) {
    return {
      title: 'Real evidence about why buyers choose this over alternatives.',
      rationale: 'Every objection on file so far is a hypothesis, not something an actual buyer has said.',
    };
  }
  if (confidence.key === 'partially_validated') {
    return {
      title: 'Whether the strongest hypothesis here holds up across more than one real buyer.',
      rationale: 'Real evidence exists but currently comes from a single source type -- worth confirming it generalizes.',
    };
  }
  return {
    title: 'Which discovery environment actually matters most, now that the buyer and trigger are well evidenced.',
    rationale: 'The picture here is already strong -- the most useful next question is refinement, not a foundational gap.',
  };
}

const EXPERIMENT_BY_STARTING_STATE = {
  starting_from_zero: 'Review any existing customer messages, comments, or questions you already have (even a handful) and write down the exact words used.',
  ready_to_sell: 'Ask the next few real prospects or buyers what specifically triggered them to start looking, and record their exact answer.',
  building_momentum: 'Pull the actual wording from your existing reviews or repeat-customer messages and compare it against your customer-language hypotheses above.',
};

/** One practical, small evidence-generating action -- never an elaborate formal-research requirement. */
export function determineDiscoveryExperiment({ startingStateKey, route }) {
  if (route === 'marketplace_first') {
    return 'Look at your actual marketplace search/listing data (impressions, the search terms that led to a view) if it is available, and compare it against your hypotheses above.';
  }
  return EXPERIMENT_BY_STARTING_STATE[startingStateKey] || EXPERIMENT_BY_STARTING_STATE.ready_to_sell;
}
