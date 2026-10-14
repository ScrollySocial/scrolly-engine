/**
 * Module 5 safety/claims guardrails -- enforced structurally in every
 * generator in this module (no LLM anywhere in this codebase; every string
 * Module 5 produces comes from a deterministic template that only ever
 * echoes back customer-SUPPLIED facts as topic/context, never as an
 * invented or upgraded claim) AND checked here as a defense-in-depth
 * scanner every generator can be tested against.
 *
 * The critical distinction (named explicitly in the spec): a customer's
 * stated PROBLEM/CONCERN is not evidence the product solves it. If a soap
 * buyer is worried about breakouts, that fact may inform a topic/question
 * ("what's actually in this soap," "how sensitive skin reacts to it") but
 * must never become "clears your skin" or "clears acne naturally" -- an
 * unsupported product-efficacy claim. Every content-generating function in
 * this module frames a customer's stated concern as something to ADDRESS/
 * EXPLAIN/SHOW THE PROCESS BEHIND, never as something the product is
 * asserted to RESOLVE, CURE, or GUARANTEE.
 */

// Efficacy/health/medical claim shapes: a verb asserting the product resolves
// a condition, paired with a condition/outcome noun. Deliberately broad
// (covers common skin/health/pain/disease framings) since this is a
// last-resort catch, not the primary defense (the templates themselves never
// construct these).
// "clears your skin," "treats their acne," "cures the infection" -- a verb
// asserting the OFFER acts on a possessive/determined health condition.
// Deliberately requires a determiner (your/their/his/her/its/the) right
// after the verb, so a BUYER'S OWN DESCRIBED desire ("a way to clear, calm
// skin without breakouts," lifted straight from their Module 3 answer) is
// never mistaken for a claim the offer makes -- that phrase uses "clear" as
// an adjective directly before "skin" with no determiner in between, a
// structurally different (and safe) shape than an actual efficacy claim.
const EFFICACY_CLAIM_PATTERNS = [
  /\b(clears?|cures?|heals?|treats?|eliminates?|fixes?|reverses?|prevents?)\s+(your|their|his|her|its|the)\s*([a-z]+\s+){0,2}(acne|breakouts?|skin|disease|illness|pain|condition|anxiety|depression|weight|wrinkles?|infection)\b/i,
  /\bclinically proven\b/i,
  /\bFDA[- ](approved|cleared)\b/i,
  /\bguarantees? (results|weight loss|clear skin|to (work|cure|heal))\b/i,
];

// Fabricated evidence: statistics, certifications/credentials, and
// testimonial-shaped quotes the generator itself invented rather than
// echoing from the customer's own proofInventory.
const FABRICATED_EVIDENCE_PATTERNS = [
  /\b\d{1,3}%\s*(of (customers|buyers|users)|off|discount)\b/i,
  /"\s*[A-Z][^"]{10,}"\s*[-—]\s*[A-Z]/, // a quoted, attributed sentence -- shaped like an invented testimonial
];

// Scarcity/urgency/discounting/guarantee/competitor-attack language --
// forbidden as an automatic response to an objection (see spec section 6:
// "Do not automatically: discount / lower price / create urgency / add
// guarantees / attack competitors").
const PRESSURE_TACTIC_PATTERNS = [
  /\blimited time\b/i,
  /\bact now\b/i,
  /\bhurry\b/i,
  /\bonly \d+ (left|spots?|seats?)\b/i,
  /\b\d{1,3}%\s*off\b/i,
  /\b(money[- ]back|satisfaction) guarantee\b/i,
  /\b(better|beats?|unlike|cheaper than) (our |the )?competitors?\b/i,
];

export function scanForUnsafeClaims(text) {
  const t = String(text || '');
  const violations = [];
  for (const p of EFFICACY_CLAIM_PATTERNS) if (p.test(t)) violations.push({ type: 'efficacy_claim', pattern: p.source });
  for (const p of FABRICATED_EVIDENCE_PATTERNS) if (p.test(t)) violations.push({ type: 'fabricated_evidence', pattern: p.source });
  for (const p of PRESSURE_TACTIC_PATTERNS) if (p.test(t)) violations.push({ type: 'pressure_tactic', pattern: p.source });
  return violations;
}

/** Convenience for tests/generators: true if the text is clean. */
export function isSafeCopy(text) {
  return scanForUnsafeClaims(text).length === 0;
}
