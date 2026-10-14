/**
 * Customer-language hypothesis generator: search-style phrases, questions,
 * problem statements, and comparison/purchase-intent language a buyer might
 * use -- built FROM the customer's own confirmed offer/audience/result data,
 * never invented facts.
 *
 * CRITICAL (per the Module 3 spec): these are always CUSTOMER-LANGUAGE
 * HYPOTHESES, never "validated keywords" or "search volume findings," unless
 * real query/customer-language evidence actually exists. This file only
 * generates the raw candidate phrases -- module3.mjs/discovery-evaluation.mjs
 * are responsible for the confidence/labeling distinction, never this one.
 * No search volumes or SEO metrics are fabricated here or anywhere else in
 * this module.
 */

function clean(text) {
  return (text || '').trim().replace(/[.!]+$/, '');
}

/**
 * @param {object} params
 * @param {string} [params.offer] - the confirmed/refined offer (Module 2's offerConfirmed)
 * @param {string} [params.audience] - the confirmed/refined buyer description
 * @param {string} [params.functionalResult] - Module 3's own desiredResult.functional
 * @param {string} [params.triggerCategory] - Module 3's primaryTriggerCategory, if set
 * @param {string} [params.route] - the BusinessProfile route
 * @returns {string[]} deduplicated candidate phrases -- always to be labeled hypotheses, never validated data
 */
export function generateCustomerLanguageHypotheses({ offer, audience, functionalResult, triggerCategory, route }) {
  const offerLower = clean(offer).toLowerCase() || 'this';
  const audienceLower = clean(audience).toLowerCase();
  const resultPhrase = clean(functionalResult).toLowerCase();

  const phrases = [
    `best ${offerLower}`,
    `${offerLower} reviews`,
    `is ${offerLower} worth it`,
  ];
  if (resultPhrase) phrases.push(`how to ${resultPhrase}`);
  if (resultPhrase) phrases.push(`${offerLower} for ${resultPhrase}`);
  if (audienceLower) phrases.push(`${offerLower} for ${audienceLower}`);
  if (triggerCategory === 'current_solution_stopped_working' || triggerCategory === 'current_solution_inadequate') {
    phrases.push(`alternative to my current ${offerLower}`);
  }
  if (route === 'local_hybrid') phrases.push(`${offerLower} near me`);
  if (route === 'marketplace_first') phrases.push(`${offerLower} on etsy`);
  if (route === 'services') phrases.push(`who can help me with ${resultPhrase || offerLower}`);
  phrases.push(`${offerLower} vs`);

  return [...new Set(phrases.filter(Boolean))];
}
