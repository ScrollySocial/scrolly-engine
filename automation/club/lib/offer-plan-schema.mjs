/**
 * Module 2 (Build Something People Want to Buy) — the persisted OfferPlan.
 *
 * Only DELIBERATE CUSTOMER DECISIONS live here (confirmed/refined offer
 * facts, stated beliefs, selected positioning). Judgments about how well
 * any of this performs are never stored -- they're derived fresh every
 * time by offer-evaluation.mjs/module2.mjs, same principle as Module 1's
 * profile/results split.
 */

export const OBJECTION_BASES = /** @type {const} */ (['observed', 'hypothesis']);
export const DIFFERENTIATION_STATUSES = /** @type {const} */ (['stated', 'unknown']);

export function newOfferPlan() {
  return {
    offerConfirmed: null,      // confirmed/refined short offer description (may equal the Module 1 profile.offer, or refine it)
    whatTheyGet: null,         // the concrete deliverable
    audienceConfirmed: null,   // confirmed/refined buyer description
    buyingMotivation: null,    // why they want it -- practical and/or emotional, not forced into transformation language
    differentiation: {
      category: null,          // e.g. 'price', 'convenience', 'specialization', ... or null
      detail: null,             // free-text elaboration
      status: 'unknown',        // 'stated' | 'unknown' -- "I don't know yet" is a valid, honest answer
    },
    objections: [],            // [{ type, note, basis: 'observed' | 'hypothesis' }]
    proofInventory: [],        // [{ type, detail }] -- empty array IS "none yet", a real, known state, not missing data
    positioningOptions: [],    // the 3 generated one-sentence options, kept for reference/Agent context
    selectedPositioning: null, // customer-selected, edited, or self-written final version
  };
}

export function assertValidOfferPlan(plan) {
  const required = Object.keys(newOfferPlan());
  for (const key of required) {
    if (!(key in plan)) throw new Error(`OfferPlan missing required field "${key}"`);
  }
  if (!DIFFERENTIATION_STATUSES.includes(plan.differentiation?.status)) {
    throw new Error(`OfferPlan.differentiation.status "${plan.differentiation?.status}" is not one of: ${DIFFERENTIATION_STATUSES.join(', ')}`);
  }
  for (const o of plan.objections) {
    if (!OBJECTION_BASES.includes(o.basis)) {
      throw new Error(`OfferPlan objection basis "${o.basis}" is not one of: ${OBJECTION_BASES.join(', ')}`);
    }
  }
  return true;
}
