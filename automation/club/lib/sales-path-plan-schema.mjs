/**
 * Module 6 (Turn Attention Into Sales) — the persisted SalesPathPlan.
 *
 * Same discipline as every prior module's plan: only DELIBERATE, GENUINELY
 * NEW customer decisions live here. Module 6 needs three small new pieces
 * of information the prior modules never asked for -- where a buyer can
 * currently complete the purchase/inquiry, whether the owner has actually
 * checked the path works on mobile (never Scrolly-verified), and whether a
 * follow-up mechanism exists for someone not yet ready to buy. Everything
 * else (the constructed path per channel, path type, the Sales Path Check,
 * the CTA -> Destination Map, the Conversion Gap, Direct vs Nurture, trust
 * placement guidance, the $1K Connection, metrics, Fix Now/Keep/Measure,
 * and the experiment) is derived FRESH every time by
 * sales-path-evaluation.mjs/module6.mjs from this plan plus Module 1-5's own
 * state -- never persisted separately, matching every prior module's
 * Fix-First/Discovery-Gap/Channel-Plan/Messaging-Plan-style judgments.
 */

export function newSalesPathPlan() {
  return {
    conversionDestinations: [],  // [{ type, detail }] -- where someone can currently buy/book/order/contact; 'not_set_up_yet' is itself a valid, honest type meaning none exist
    mobileStatus: null,          // 'confirmed' | 'likely' | 'unknown_needs_checking' -- the OWNER's own honest read, never a Scrolly technical verification
    followUpMechanism: null,     // one of FOLLOW_UP_MECHANISMS (sales-path-content.mjs), including 'none' | 'not_necessary_yet' as valid, honest answers
  };
}

export function assertValidSalesPathPlan(plan) {
  const required = Object.keys(newSalesPathPlan());
  for (const key of required) {
    if (!(key in plan)) throw new Error(`SalesPathPlan missing required field "${key}"`);
  }
  return true;
}
