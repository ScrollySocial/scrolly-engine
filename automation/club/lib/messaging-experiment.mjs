/**
 * First Messaging Experiment -- ONE evidence-producing test that answers a
 * genuinely unresolved question, adapted to business/channel/evidence state.
 * Never an arbitrary universal posting quantity, never a revenue promise,
 * never Challenge-style 30-day execution management.
 */
import { topic } from './messaging-text-utils.mjs';

/**
 * @param {object} params
 * @param {string} params.primaryChannelLabel
 * @param {object} [params.observedObjection] - {type} or null
 * @param {string[]} [params.customerLanguageHypotheses]
 * @param {Array} [params.angles] - message-angle-generator.mjs output
 * @param {string} params.startingStateKey
 */
export function determineMessagingExperiment({ primaryChannelLabel, observedObjection, customerLanguageHypotheses = [], angles = [], startingStateKey }) {
  const channel = topic(primaryChannelLabel, 'your primary channel');

  if (observedObjection) {
    return `Test whether directly addressing "${observedObjection.type}" in your ${channel} messaging changes qualified response, compared to your current approach -- this is a real, observed objection, so it's worth confirming whether resolving it moves behavior.`;
  }
  if (customerLanguageHypotheses.length > 0) {
    return `Use one of your customer-language hypotheses ("${customerLanguageHypotheses[0]}") directly in a piece of ${channel} content, and see whether it produces more qualified response than your current generic phrasing.`;
  }
  if (angles.length >= 2) {
    return `Compare response between your two strongest message angles ("${angles[0].name}" vs "${angles[1].name}") on ${channel}, and see which produces more qualified engagement or inquiries.`;
  }
  const stagePrefix = startingStateKey === 'starting_from_zero' ? 'Before scaling up, ' : '';
  return `${stagePrefix}Publish one small, representative piece of content built from your Core Message on ${channel}, and track qualified response (not just views) to see whether the message actually resonates.`;
}
