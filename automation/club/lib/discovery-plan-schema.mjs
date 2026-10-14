/**
 * Module 3 (Find the People Most Likely to Buy It) — the persisted
 * CustomerDiscoveryMap decisions.
 *
 * Same discipline as offer-plan-schema.mjs: only DELIBERATE CUSTOMER
 * DECISIONS live here (confirmed/refined buyer facts, selected trigger/
 * criteria/discovery-environment/evidence-source categories, generated-then-
 * selected customer-language hypotheses). Judgments (confidence,
 * interpretation, the Discovery Gap, the next experiment) are never stored
 * here -- they're derived fresh every time by discovery-evaluation.mjs/
 * module3.mjs, same principle as Module 1/2's profile/results split.
 *
 * Objections reuse Module 2's exact OBJECTION_BASES enum (observed/
 * hypothesis) rather than inventing a parallel one. Module 3 carries
 * Module 2's objections forward as a starting point (confirm/refine, per
 * the spec), but persists its own copy here -- Module 2's frozen
 * offer-plan.json is never written to by this module.
 */
import { OBJECTION_BASES } from './offer-plan-schema.mjs';

export { OBJECTION_BASES };

export function newDiscoveryPlan() {
  return {
    // 1. Likely buyer
    buyerDescription: null,        // confirmed/refined description of who's most likely to buy
    currentSituation: null,        // their current situation, in the route-adapted language
    tryingToAccomplish: null,
    whyNow: null,

    // 2. Buying trigger
    buyingTriggers: [],            // [{ category, note }] -- plausible trigger categories selected
    primaryTriggerCategory: null,  // the single strongest current hypothesis/evidence-backed trigger

    // 3. Desired result
    desiredResult: {
      functional: null,            // the practical outcome/change they want
      practicalEmotional: null,    // how they want it to feel / what it makes easier -- not forced
    },

    // 4. Objections -- carried forward from Module 2's OfferPlan, confirm/refine allowed
    objections: [],                // [{ type, note, basis: 'observed' | 'hypothesis' }]

    // 5. Buying criteria
    buyingCriteria: [],            // [{ category }] -- selected categories this buyer is likely to compare

    // 6. Where they may discover the offer (NOT a channel recommendation -- see discovery-content.mjs)
    discoveryEnvironments: [],     // selected plausible discovery environments

    // 7. Customer-language hypotheses -- generated, then selected/edited by the customer.
    // Always CUSTOMER-LANGUAGE HYPOTHESES, never "validated keywords," unless real
    // query/customer-language evidence exists in evidenceSources.
    customerLanguageHypotheses: [],

    // 8. Evidence source
    evidenceSources: [],           // selected evidence-source categories underlying everything above
  };
}

export function assertValidDiscoveryPlan(plan) {
  const required = Object.keys(newDiscoveryPlan());
  for (const key of required) {
    if (!(key in plan)) throw new Error(`DiscoveryPlan missing required field "${key}"`);
  }
  for (const o of plan.objections) {
    if (!OBJECTION_BASES.includes(o.basis)) {
      throw new Error(`DiscoveryPlan objection basis "${o.basis}" is not one of: ${OBJECTION_BASES.join(', ')}`);
    }
  }
  return true;
}
