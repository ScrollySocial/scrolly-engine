/**
 * The reusable idea formula: BUYER TRIGGER + MESSAGE ROLE + MESSAGE ANGLE +
 * CHANNEL JOB + CTA -> a natural content/message idea. This is the
 * permanent-Club value component the spec calls out -- the customer and the
 * future reactive Club Agent can regenerate more evergreen ideas later from
 * stored strategy alone, with no fresh research required.
 *
 * Every template composes natural sentences via messaging-text-utils'
 * clause()/topic() helpers -- never raw concatenation, and never a claim
 * that a customer's stated problem/concern is something the product
 * resolves (see messaging-safety.mjs's header comment for the exact
 * distinction this file's templates are built to respect: a topic to
 * explore/show/address, never an asserted cure).
 */
import { topic } from './messaging-text-utils.mjs';
import { CONTENT_ROLES, CONTENT_ROLE_LABELS, CONTENT_ROLE_DESCRIPTIONS } from './messaging-content.mjs';
import { triggerPhrase } from './core-message-generator.mjs';

// See core-message-generator.mjs's header comment for why every template
// below keeps conjugated verbs attached to a fixed, invariant subject and
// never to raw customer text (buyer/trigger/result), and never completes a
// "to VERB" infinitive with free text that may not be a verb phrase at all.
const ROLE_IDEA_TEMPLATES = {
  problem: (ctx) => `Show what's going on right around the moment when ${ctx.trigger} -- help ${ctx.buyer} recognize themselves in it before you mention the offer at all.`,
  desire: (ctx) => `Show what it actually looks and feels like once they have it: ${ctx.result}. Make the outcome vivid before explaining how you get there.`,
  education: () => `Explain, in plain terms, how this actually works -- the goal is a clearer decision, not a sales pitch.`,
  proof_process: (ctx) => `Show the real process behind the offer -- something ${ctx.buyer} can verify for themselves, not just a claim.`,
  objection: (ctx) => `Address "${ctx.objectionType || 'a real concern'}" directly and specifically -- don't wait for ${ctx.buyer} to ask.`,
  offer: (ctx) => `Present exactly what's included and who it's for, clearly enough that there's no guesswork left for ${ctx.buyer}.`,
  story_perspective: (ctx) => `Share the real reasoning or perspective behind why this exists -- relevant to ${ctx.buyer}, specifically.`,
};

// 2026-09-12 fix: falling back to "whatever angle sorted first" for a role
// with no explicit mapping produced real nonsense once starter ideas started
// "topping up" every role against the primary channel -- the 'education'
// role's template says "how {angleTopic} actually works", which only makes
// sense for a differentiation/mechanism-shaped angle. Pairing it with
// whatever trigger-labeled angle happened to rank first produced "how what
// they have isn't enough actually works." Now 'education' only pairs with a
// differentiation/buying-criteria angle (or none, which falls back to the
// template's own generic "how this actually works"); 'offer' and
// 'objection' never take an angle at all -- neither template's copy
// references one, so attaching an unrelated angle label would only mislabel
// the idea card, never fix a sentence.
function pickAngleForRole(role, angles = []) {
  const bySource = {
    problem: 'trigger', desire: 'desired_result', proof_process: 'proof',
    story_perspective: 'differentiation', objection: 'objection_observed',
  }[role];
  if (bySource) {
    const found = angles.find((a) => a.sourceType === bySource);
    if (found) return found;
  }
  if (role === 'education') {
    return angles.find((a) => a.sourceType === 'differentiation' || a.sourceType === 'buying_criteria') || null;
  }
  if (role === 'offer' || role === 'objection') return null;
  return angles[0] || null;
}

/**
 * The canonical formula, exposed directly for the future reactive Club
 * Agent (per the spec's example prompts: "give me an idea for my primary
 * channel," "turn this angle into an Instagram idea").
 *
 * @param {object} ctx
 * @param {string} ctx.role - one of CONTENT_ROLES
 * @param {string} [ctx.buyerDescription]
 * @param {string} [ctx.primaryTriggerCategory]
 * @param {string} [ctx.desiredResultFunctional]
 * @param {object} [ctx.angle] - from message-angle-generator.mjs, or null
 * @param {string} [ctx.observedObjectionType]
 * @param {string} ctx.channelLabel
 * @param {string} ctx.channelJob
 * @param {string} ctx.ctaLabel
 * @returns {{idea:string, channel:string, role:string, angle:string|null, purpose:string, ctaDirection:string}}
 */
export function buildContentIdea({ role, buyerDescription, primaryTriggerCategory, desiredResultFunctional, angle, observedObjectionType, channelLabel, ctaLabel }) {
  const template = ROLE_IDEA_TEMPLATES[role] || ROLE_IDEA_TEMPLATES.offer;
  const ideaText = template({
    buyer: topic(buyerDescription, 'your buyer'),
    trigger: triggerPhrase(primaryTriggerCategory),
    result: topic(desiredResultFunctional, 'the outcome they want'),
    objectionType: observedObjectionType,
  });
  return {
    idea: ideaText,
    channel: channelLabel,
    role: CONTENT_ROLE_LABELS[role] || role,
    angle: angle ? angle.name : null,
    purpose: CONTENT_ROLE_DESCRIPTIONS[role] || null,
    ctaDirection: ctaLabel,
  };
}

/**
 * Personalized, bounded (10-15) evergreen starter ideas -- never generic
 * placeholders, never a 30-day calendar, never claimed as current trends.
 * Every idea is generated from the customer's own stored strategy via the
 * formula above; a real deterministic cap (never fewer than what's
 * available, never more than 15) keeps this a useful starter set rather
 * than an unbounded feed.
 *
 * @param {object} params
 * @param {Array} params.channelEntries - Channel -> Message Map entries (primary first)
 * @param {Array} params.angles - message-angle-generator.mjs output
 * @param {string} params.buyerDescription
 * @param {string} params.primaryTriggerCategory
 * @param {string} params.desiredResultFunctional
 * @param {Array} params.objections - [{type, basis}]
 * @returns {Array} 10-15 idea objects
 */
export function generateStarterIdeas({ channelEntries = [], angles = [], buyerDescription, primaryTriggerCategory, desiredResultFunctional, objections = [] }) {
  const observed = objections.find((o) => o.basis === 'observed');
  const ideas = [];
  const seen = new Set();

  function addIdea(entry, role) {
    const key = `${entry.channelKey}::${role}`;
    if (seen.has(key)) return;
    seen.add(key);
    const angle = pickAngleForRole(role, angles);
    ideas.push(buildContentIdea({
      role, buyerDescription, primaryTriggerCategory, desiredResultFunctional, angle,
      observedObjectionType: observed?.type, channelLabel: entry.channel, ctaLabel: entry.ctaLabel,
    }));
  }

  for (const entry of channelEntries) {
    for (const { role } of entry.priorityRoles) addIdea(entry, role);
  }

  // Top up against the primary channel with any remaining canonical roles
  // (still real, still specific -- never a generic filler idea) until the
  // bounded 10-15 range is reached.
  const primary = channelEntries[0];
  if (primary) {
    for (const role of CONTENT_ROLES) {
      if (ideas.length >= 10) break;
      addIdea(primary, role);
    }
  }

  return ideas.slice(0, 15);
}
