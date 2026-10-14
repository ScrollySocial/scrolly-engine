/**
 * Content Role prioritizer -- the seven canonical roles are FUNCTIONS, not a
 * quota every customer fills equally. Each gets a priority tier
 * ('high'|'medium'|'low', never a numeric score) plus a customer-specific
 * rationale, derived from real Module 1-3 state. It is normal and expected
 * for some roles to land on 'low.'
 */
import { CONTENT_ROLE_LABELS } from './messaging-content.mjs';

const PROBLEM_DRIVEN_TRIGGERS = ['revenue_performance_problem', 'current_solution_stopped_working', 'current_solution_inadequate', 'frustration_with_paid_advertising', 'urgent_practical_need', 'knowledge_gap', 'new_responsibility_change'];
const DESIRE_DRIVEN_TRIGGERS = ['desire_want', 'gift_need', 'event_occasion', 'season', 'saw_someone_else_achieve_result', 'replacement_replenishment'];

function tier(role, priority, rationale) {
  return { role, label: CONTENT_ROLE_LABELS[role], priority, rationale };
}

function prioritizeProblem({ primaryTriggerCategory }) {
  if (PROBLEM_DRIVEN_TRIGGERS.includes(primaryTriggerCategory)) {
    return tier('problem', 'high', 'Your buyer\'s own trigger is problem-driven -- helping them recognize the problem clearly is likely to matter more than anything else right now.');
  }
  if (DESIRE_DRIVEN_TRIGGERS.includes(primaryTriggerCategory)) {
    return tier('problem', 'low', "Your buyer's trigger is desire-driven, not problem-driven -- there's little need to manufacture a problem that doesn't exist for them.");
  }
  return tier('problem', 'medium', 'Worth some attention, though the trigger evidence is not strongly problem- or desire-led either way yet.');
}

function prioritizeDesire({ primaryTriggerCategory, route }) {
  if (DESIRE_DRIVEN_TRIGGERS.includes(primaryTriggerCategory) || ['ecommerce', 'creator_affiliate', 'marketplace_first'].includes(route)) {
    return tier('desire', 'high', 'Either the buying trigger or the business model itself is desire/outcome-led -- showing the result clearly is likely to do real work here.');
  }
  return tier('desire', 'medium', 'Still worth showing the outcome, though it is less likely to be the deciding factor for this buyer/business model.');
}

function prioritizeEducation({ topBuyingCriteria, route, offerClarityState }) {
  if (offerClarityState === 'growth_opportunity' || offerClarityState === 'not_established') {
    return tier('education', 'high', 'Real evidence (or a genuine gap) suggests buyers do not yet clearly understand the offer -- education closes that gap directly.');
  }
  if ((topBuyingCriteria || []).includes('expertise') || ['digital_product', 'services'].includes(route)) {
    return tier('education', 'high', 'Expertise is something this buyer weighs, or the business model is inherently a considered purchase -- education builds the understanding that decision needs.');
  }
  return tier('education', 'medium', 'Useful as support, but not the most urgent lever for this buyer/offer right now.');
}

function prioritizeProofProcess({ proofInventoryCount, topBuyingCriteria, proofTrustState }) {
  if (proofInventoryCount === 0) {
    return tier('proof_process', 'high', 'No proof exists yet -- for an early-stage offer, deliberately building trust through process transparency, demonstration, or expertise is a real priority, not optional polish.');
  }
  if ((topBuyingCriteria || []).some((c) => ['proof', 'reviews', 'quality'].includes(c)) || proofTrustState === 'growth_opportunity' || proofTrustState === 'insufficient_data') {
    return tier('proof_process', 'high', 'Your buyer specifically weighs proof/quality/reviews, or trust is not yet an established strength -- real proof needs to be visible, not just implied.');
  }
  return tier('proof_process', 'medium', 'Proof already exists and trust is reasonably established -- keep reinforcing it, but it is less likely to be the current constraint.');
}

function prioritizeObjection({ hasObserved, hasHypothesis }) {
  if (hasObserved) {
    return tier('objection', 'high', 'A real buyer has actually raised an objection -- addressing it directly is one of the highest-confidence levers available.');
  }
  if (hasHypothesis) {
    return tier('objection', 'medium', 'Only a suspected (not yet observed) objection exists -- worth addressing lightly, but it should not dominate the messaging system until it is confirmed.');
  }
  return tier('objection', 'low', 'No objection, observed or suspected, is on file yet -- nothing specific to address right now.');
}

function prioritizeOffer({ startingStateKey, offerClarityState }) {
  if (startingStateKey === 'starting_from_zero' || offerClarityState === 'not_established' || offerClarityState === 'growth_opportunity') {
    return tier('offer', 'high', 'The offer itself still needs to be made clear before anything else can really land.');
  }
  return tier('offer', 'medium', 'The offer is reasonably clear already -- still worth presenting directly, just not the most urgent gap.');
}

function prioritizeStory({ route, differentiationCategory, hasFounderProof }) {
  const expertiseLed = differentiationCategory === 'Expertise' || hasFounderProof || ['services', 'creator_affiliate', 'digital_product'].includes(route);
  if (expertiseLed) {
    return tier('story_perspective', 'high', 'This business leans on expertise/perspective as part of the offer -- founder/business point of view is genuinely part of what is being sold.');
  }
  if (['local_hybrid', 'marketplace_first'].includes(route)) {
    return tier('story_perspective', 'low', 'This is a straightforward local/marketplace purchase -- an elaborate founder story is unlikely to be what moves this buyer.');
  }
  return tier('story_perspective', 'medium', 'Can help humanize the business, but is not the primary lever right now.');
}

/**
 * @param {object} params profile-derived: primaryTriggerCategory, route, startingStateKey,
 *   topBuyingCriteria, proofInventoryCount, hasFounderProof, differentiationCategory,
 *   objections ([{basis}]), offerClarityState, proofTrustState
 * @returns {Array} all 7 roles, each tiered + rationaled, ordered high -> medium -> low
 */
export function prioritizeContentRoles({ primaryTriggerCategory, route, startingStateKey, topBuyingCriteria = [], proofInventoryCount = 0, hasFounderProof = false, differentiationCategory = null, objections = [], offerClarityState, proofTrustState }) {
  const hasObserved = objections.some((o) => o.basis === 'observed');
  const hasHypothesis = objections.some((o) => o.basis === 'hypothesis');

  const roles = [
    prioritizeProblem({ primaryTriggerCategory }),
    prioritizeDesire({ primaryTriggerCategory, route }),
    prioritizeEducation({ topBuyingCriteria, route, offerClarityState }),
    prioritizeProofProcess({ proofInventoryCount, topBuyingCriteria, proofTrustState }),
    prioritizeObjection({ hasObserved, hasHypothesis }),
    prioritizeOffer({ startingStateKey, offerClarityState }),
    prioritizeStory({ route, differentiationCategory, hasFounderProof }),
  ];

  const rank = { high: 0, medium: 1, low: 2 };
  return roles.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
