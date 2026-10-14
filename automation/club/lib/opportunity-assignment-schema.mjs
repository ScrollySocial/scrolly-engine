/**
 * The per-customer, per-attempt link between a shared catalog opportunity
 * (opportunity-catalog.mjs) and one Challenge attempt on one platform.
 *
 * ARCHITECTURE NOTE: the catalog itself is shared/attempt-neutral (the same
 * "Behind-the-scenes" idea is reused by every customer). `challengeAttemptId`
 * therefore lives on THIS assignment record, not on the catalog entry --
 * a shared idea can't carry one customer's attempt ID. This is the record
 * that answers "did this customer do this idea, on this platform, for this
 * attempt" -- exactly what section 4's "link back to opportunity, attempt,
 * platform" needs, without duplicating the catalog's content per customer.
 *
 * State machine: recommended -> planned -> posted. A customer is never
 * required to move every recommendation through it -- most stay
 * "recommended" forever, by design (see opportunity-ranking.mjs).
 */
import { randomUUID } from 'node:crypto';

export const ASSIGNMENT_STATES = /** @type {const} */ (['recommended', 'planned', 'posted']);

export function newAssignment({ challengeAttemptId, opportunityId, platform }) {
  const now = new Date().toISOString();
  return {
    assignmentId: randomUUID(),
    challengeAttemptId,
    opportunityId,
    platform,
    state: 'recommended',
    recommendedAt: now,
    plannedAt: null,
    postedAt: null,
  };
}

export function assertValidAssignment(a) {
  const required = ['assignmentId', 'challengeAttemptId', 'opportunityId', 'platform', 'state', 'recommendedAt'];
  for (const key of required) {
    if (!(key in a) || a[key] == null) throw new Error(`Assignment missing required field "${key}"`);
  }
  if (!ASSIGNMENT_STATES.includes(a.state)) {
    throw new Error(`Assignment state "${a.state}" is not one of: ${ASSIGNMENT_STATES.join(', ')}`);
  }
  return true;
}
