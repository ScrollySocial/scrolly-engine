/**
 * Proof Plan -- brings forward the ACTUAL Module 2 proof inventory (never
 * invents proof, never invents testimonials/customer quotes, never upgrades
 * "proof exists" into "proof works"). Suggests legitimate Proof To Build
 * only when none exists yet, adapted by business model, and deliberately
 * never suggests fabricating reviews/testimonials as a way to build proof.
 */
import { usageForProofType, proofToBuildForRoute } from './messaging-content.mjs';

/**
 * @param {Array} proofInventory - Module 2's OfferPlan.proofInventory ([{type, detail}])
 * @param {string} route - the BusinessProfile route
 */
export function buildProofPlan({ proofInventory = [], route }) {
  if (proofInventory.length === 0) {
    return {
      existingProof: [],
      proofToBuild: proofToBuildForRoute(route),
    };
  }
  return {
    existingProof: proofInventory.map((p) => ({ type: p.type, detail: p.detail, howToUse: usageForProofType(p.type) })),
    proofToBuild: [],
  };
}
