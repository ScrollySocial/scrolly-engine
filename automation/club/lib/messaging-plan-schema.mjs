/**
 * Module 5 (Give Them a Reason to Pay Attention) — the persisted
 * MessagingPlan.
 *
 * Unlike the other modules' plans, Module 5 has almost no new DECISIONS to
 * capture: the spec's only customer decision point is the Core Message
 * (generate 3 directions, then the customer selects one / edits one / writes
 * their own -- exactly Module 2's positioning-selection shape). Every other
 * output (Message Angles, Content Role priorities, the Channel -> Message
 * Map, the Proof Plan, Objection Messaging, CTA Strategy, the reusable Idea
 * Formula, Starter Ideas, the Messaging Experiment) is derived FRESH every
 * time by module5.mjs from Module 1-4's own persisted state -- never stored
 * here, same discipline as Module 2/3/4's Fix-First/Discovery-Gap/Channel-
 * Plan-style judgments.
 */

export function newMessagingPlan() {
  return {
    coreMessageOptions: [],   // the 3 generated directions, kept for reference/Agent context (mirrors Module 2's positioningOptions)
    selectedCoreMessage: null, // customer-selected, edited, or self-written final version
  };
}

export function assertValidMessagingPlan(plan) {
  const required = Object.keys(newMessagingPlan());
  for (const key of required) {
    if (!(key in plan)) throw new Error(`MessagingPlan missing required field "${key}"`);
  }
  return true;
}
