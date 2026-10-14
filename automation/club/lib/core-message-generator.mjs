/**
 * Core Message generator -- three distinct directions answering "what does
 * this buyer most need to understand for this offer to become relevant?"
 * NOT a tagline/slogan/headline -- the central marketing idea other
 * messages/content can express in different ways.
 *
 * Each direction is built from a DIFFERENT real source (the buying trigger,
 * the desired result, the stated differentiation or, absent one, the top
 * buying criterion) so the three options are genuinely distinct rather than
 * three rewordings of the same sentence -- and so a customer with no stated
 * differentiator still gets three usable, honest options instead of a
 * fabricated one.
 */
import { clause, topic } from './messaging-text-utils.mjs';

const TRIGGER_PHRASES = {
  revenue_performance_problem: 'results start slipping',
  upcoming_launch: 'a launch is coming up',
  deadline: 'a real deadline is approaching',
  event_occasion: 'a specific occasion comes up',
  season: 'the season makes it relevant',
  gift_need: "they're buying this for someone else",
  frustration_with_paid_advertising: "paid ads stop paying off",
  current_solution_stopped_working: 'what they were using stops working',
  current_solution_inadequate: "what they have isn't good enough anymore",
  saw_someone_else_achieve_result: 'they see someone else get the result they want',
  new_responsibility_change: 'something new lands on their plate',
  knowledge_gap: "they realize they don't know how to do this themselves",
  urgent_practical_need: 'a practical need becomes urgent',
  desire_want: 'they simply want it',
  replacement_replenishment: "what they have runs out or needs replacing",
  other: 'the right moment comes up',
  not_sure_yet: 'the right moment comes up',
};

export function triggerPhrase(category) {
  return TRIGGER_PHRASES[category] || TRIGGER_PHRASES.not_sure_yet;
}

// 2026-09-12 Module 5 grammar fix (the same class of bug Module 2's
// positioning generator had): a raw customer-typed noun (the offer, the
// buyer description) can be singular OR plural/collective, so pairing it
// directly with a Scrolly-written conjugated verb ("{offer} becomes...",
// "{buyer} aren't...") breaks agreement roughly half the time ("soaps
// actually becomes" reads wrong; "soaps actually become" would be right,
// but a singular offer like "brand strategy consulting" needs the opposite).
// Every direction below keeps the ONLY conjugated verb attached to a fixed,
// invariant subject ("the moment that matters," "the real goal," "what
// matters most to X") and uses the customer's own text solely as an
// appositive/object -- never as the subject or the completion of "to VERB"
// (which additionally assumes a bare-verb-phrase shape the customer's text
// may not have -- e.g. "a gentle, truly natural soap" is a noun phrase, not
// a verb phrase, so "a way to {that}" would break just like "designed to
// {that}" did in Module 2).
function triggerLedDirection({ buyerDescription, primaryTriggerCategory, offer }) {
  const buyer = topic(buyerDescription, 'the right buyer');
  const offerPhrase = topic(offer, 'this');
  return `For ${buyer}, the moment that matters is when ${triggerPhrase(primaryTriggerCategory)} -- that's what makes ${offerPhrase} worth paying attention to.`;
}

function outcomeLedDirection({ buyerDescription, desiredResultFunctional, offer }) {
  const buyer = topic(buyerDescription, 'the right buyer');
  const outcome = topic(desiredResultFunctional, 'the outcome they actually want');
  const offerPhrase = topic(offer, 'this');
  return `For ${buyer}, the real goal isn't ${offerPhrase} -- it's this: ${outcome}.`;
}

const CRITERIA_TOPIC = {
  price_value: 'getting real value for the price', quality: 'genuine quality', speed: 'how quickly it happens',
  ease: 'how easy it is', expertise: 'real expertise behind it', proof: 'proof it actually works',
  design_style: 'how it looks and feels', materials: 'what it is actually made of', customization: 'how well it fits their specific situation',
  convenience: 'how convenient it is', reviews: 'what other real buyers say', support: 'the support behind it',
  policies: 'clear, fair policies', shipping: 'reliable delivery', availability: 'being able to get it when they need it',
  location: 'being nearby', values: 'whether it matches what they value', selection: 'having the right options to choose from',
};

function reasonLedDirection({ buyerDescription, differentiation, topBuyingCriteria, offer }) {
  const buyer = topic(buyerDescription, 'the right buyer');
  const offerPhrase = clause(offer, 'this');
  if (differentiation?.status === 'stated' && differentiation.detail) {
    return `What makes ${buyer} choose ${offerPhrase} is ${clause(differentiation.detail)}.`;
  }
  const topCriterion = (topBuyingCriteria || [])[0];
  const criteriaPhrase = CRITERIA_TOPIC[topCriterion] || 'a clear reason to choose this over the alternatives';
  return `What matters most to ${buyer} is ${criteriaPhrase} -- that's the case worth making for ${offerPhrase}.`;
}

/**
 * @param {object} params
 * @param {string} params.offer - Module 2's offerConfirmed
 * @param {string} params.buyerDescription - Module 3's buyerDescription
 * @param {string} params.primaryTriggerCategory - Module 3's primaryTriggerCategory
 * @param {string} params.desiredResultFunctional - Module 3's desiredResult.functional
 * @param {object} params.differentiation - Module 2's differentiation ({category, detail, status})
 * @param {string[]} params.topBuyingCriteria - Module 3's topBuyingCriteria (already-prioritized categories)
 * @returns {string[]} exactly 3 distinct Core Message directions
 */
export function generateCoreMessageOptions({ offer, buyerDescription, primaryTriggerCategory, desiredResultFunctional, differentiation, topBuyingCriteria }) {
  return [
    triggerLedDirection({ buyerDescription, primaryTriggerCategory, offer }),
    outcomeLedDirection({ buyerDescription, desiredResultFunctional, offer }),
    reasonLedDirection({ buyerDescription, differentiation, topBuyingCriteria, offer }),
  ];
}
