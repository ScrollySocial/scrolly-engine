/**
 * Deterministic filter/rank/recommend over the shared opportunity catalog.
 * No LLM, no randomness -- same inputs always produce the same ranked list,
 * which is what makes this testable and honest ("why was I shown this" has
 * a real, inspectable answer). Reuses growth-review-diagnosis.mjs's own
 * constraint categories rather than inventing a parallel priority system.
 */

/** Which funnelJobs (channel-content.mjs's CHANNEL_JOBS) most directly address each Growth Review constraint. Empty arrays are deliberate -- not every constraint has a content-shaped fix. */
const CONSTRAINT_TO_FUNNEL_JOBS = {
  discovery_constraint: ['discovery', 'marketplace_discovery', 'local_discovery'],
  message_interest_constraint: ['education', 'consideration'],
  cta_movement_constraint: ['conversion_support', 'intent_capture'],
  conversion_trust_constraint: ['trust'],
  economics_volume_constraint: ['retention_repeat', 'referral'],
  capacity_constraint: [],
  repeatability_constraint: [],
  insufficient_data: [],
  path_healthy: ['retention_repeat', 'referral'],
};

const DIFFICULTY_RANK = { low: 0, medium: 1, high: 2 };

/** An opportunity is eligible only if it applies to this business model AND has at least one adaptation for a platform the customer actually uses. */
export function filterEligibleOpportunities(catalog, { businessModel, activePlatforms }) {
  return catalog.filter(
    (o) => o.applicableBusinessModels.includes(businessModel) && o.platformAdaptations.some((p) => activePlatforms.includes(p.platform)),
  );
}

/** Higher score = more relevant to the customer's current, real constraint and current production capacity. Ties broken toward lower difficulty (an easier real win beats a harder theoretical one). */
export function rankOpportunities(eligible, { constraintCategory, contentCapacity = 'medium' }) {
  const relevantJobs = CONSTRAINT_TO_FUNNEL_JOBS[constraintCategory] || [];
  const capacityRank = DIFFICULTY_RANK[contentCapacity] ?? DIFFICULTY_RANK.medium;
  return eligible
    .map((opportunity) => {
      let score = 0;
      if (relevantJobs.includes(opportunity.funnelJob)) score += 10;
      if (DIFFICULTY_RANK[opportunity.difficulty] <= capacityRank) score += 5;
      if (opportunity.difficulty === 'low') score += 1;
      return { opportunity, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.opportunity);
}

/**
 * A small, bounded recommended subset -- never "all of them." The Challenge
 * never implies a customer must work through the whole catalog.
 */
export function recommendOpportunities(catalog, { businessModel, activePlatforms, constraintCategory, contentCapacity, limit = 8 }) {
  const eligible = filterEligibleOpportunities(catalog, { businessModel, activePlatforms });
  return rankOpportunities(eligible, { constraintCategory, contentCapacity }).slice(0, limit);
}
