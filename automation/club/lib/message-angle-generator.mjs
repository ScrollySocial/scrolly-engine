/**
 * Message Angle generator -- approximately 4-6 prioritized distinct reasons/
 * perspectives through which the offer becomes relevant to the likely
 * buyer, each drawn from a DIFFERENT real source of customer state (never
 * mechanically generating every possible category -- see the spec's
 * explicit "choose the strongest angles from the actual customer state").
 *
 * Every angle's `evidenceState` is inherited directly from whichever prior
 * module already rated that source's evidence quality -- never invented
 * here: a stated-but-unvalidated Module 2 differentiator stays
 * `working_hypothesis` (the literal state offer-evaluation.mjs already
 * assigns it); a trigger/desired-result/buying-criterion inherits Module
 * 3's own overall confidence in its discovery map; an observed objection is
 * `evidence_backed` (a real buyer said it); proof existing is capped at
 * `partially_validated` at best -- existence is not performance, the exact
 * discipline mini-evaluation.mjs/offer-evaluation.mjs already established.
 */
import { clause, topic } from './messaging-text-utils.mjs';

const TRIGGER_LABELS = {
  revenue_performance_problem: 'A Real Performance Problem', upcoming_launch: 'An Upcoming Launch',
  deadline: 'A Real Deadline', event_occasion: 'A Specific Occasion', season: 'The Season',
  gift_need: 'Buying For Someone Else', frustration_with_paid_advertising: 'Frustration With Paid Ads',
  current_solution_stopped_working: 'What They Had Stopped Working', current_solution_inadequate: "What They Have Isn't Enough",
  saw_someone_else_achieve_result: 'Seeing Someone Else Get The Result', new_responsibility_change: 'A New Responsibility',
  knowledge_gap: 'A Knowledge Gap', urgent_practical_need: 'An Urgent Practical Need', desire_want: 'A Simple, Honest Want',
  replacement_replenishment: 'Needing A Replacement', other: 'Their Specific Trigger', not_sure_yet: 'The Right Moment',
};

function angle(name, whyThisBuyerMayCare, evidenceState, sourceType) {
  return { name, whyThisBuyerMayCare, evidenceState, sourceType };
}

const CRITERIA_ANGLE_NAMES = {
  price_value: 'Real Value For The Price', quality: 'Genuine Quality', speed: 'How Fast It Happens', ease: 'How Easy It Is',
  expertise: 'Real Expertise', proof: 'Proof It Works', design_style: 'How It Looks And Feels', materials: "What It's Actually Made Of",
  customization: 'A Fit For Their Situation', convenience: 'Real Convenience', reviews: 'What Other Buyers Say', support: 'The Support Behind It',
  policies: 'Clear, Fair Policies', shipping: 'Reliable Delivery', availability: 'Being Able To Get It', location: 'Being Nearby',
  values: 'Shared Values', selection: 'Having The Right Options',
};

/**
 * @param {object} params carried-forward state: buyerDescription, primaryTriggerCategory,
 *   desiredResultFunctional, differentiation, topBuyingCriteria, objections
 *   ([{type,basis}]), proofInventory ([{type,detail}]), module3ConfidenceKey,
 *   hasRealRevenue (boolean)
 * @returns {Array} 4-6 prioritized angle objects, most-evidenced first
 */
export function generateMessageAngles({ buyerDescription, primaryTriggerCategory, desiredResultFunctional, differentiation, topBuyingCriteria = [], objections = [], proofInventory = [], module3ConfidenceKey, hasRealRevenue }) {
  const buyer = topic(buyerDescription, 'this buyer');
  const angles = [];

  const observed = objections.find((o) => o.basis === 'observed');
  if (observed) {
    angles.push(angle(
      `Answering "${observed.type}" Directly`,
      `A real buyer has raised "${observed.type}" -- addressing it directly removes a genuine, known point of hesitation rather than guessing at one.`,
      'evidence_backed', 'objection_observed'
    ));
  }

  if (primaryTriggerCategory) {
    angles.push(angle(
      TRIGGER_LABELS[primaryTriggerCategory] || TRIGGER_LABELS.not_sure_yet,
      `Messaging that meets ${buyer} right around this trigger is more likely to land than generic awareness content aimed at anyone.`,
      module3ConfidenceKey || 'working_hypothesis', 'trigger'
    ));
  }

  if (desiredResultFunctional) {
    angles.push(angle(
      'The Result They Actually Want',
      `For ${buyer}, the offer itself matters less than the result: ${topic(desiredResultFunctional, 'the outcome they want')}. Leading with that result may resonate more than leading with product detail.`,
      module3ConfidenceKey || 'working_hypothesis', 'desired_result'
    ));
  }

  if (differentiation?.status === 'stated' && differentiation.detail) {
    angles.push(angle(
      differentiation.category || 'What Sets This Apart',
      `You believe ${clause(differentiation.detail)} is what sets this apart -- real information, but not yet validated by buyer behavior.`,
      'working_hypothesis', 'differentiation'
    ));
  }

  for (const c of topBuyingCriteria.slice(0, 2)) {
    const name = CRITERIA_ANGLE_NAMES[c];
    if (!name) continue;
    angles.push(angle(
      name,
      `${buyer} weigh this specifically when deciding, per your Module 3 answers -- worth speaking to directly rather than assuming it's obvious.`,
      module3ConfidenceKey || 'working_hypothesis', 'buying_criteria'
    ));
  }

  if (proofInventory.length > 0) {
    angles.push(angle(
      'Real Proof, Not Just Claims',
      `You already have ${proofInventory.map((p) => p.type).join(', ')} on hand -- showing it directly is more persuasive than describing the offer alone.`,
      hasRealRevenue ? 'partially_validated' : 'working_hypothesis', 'proof'
    ));
  }

  const evidenceRank = { evidence_backed: 0, partially_validated: 1, working_hypothesis: 2 };
  angles.sort((a, b) => (evidenceRank[a.evidenceState] ?? 3) - (evidenceRank[b.evidenceState] ?? 3));

  return angles.slice(0, 6);
}
