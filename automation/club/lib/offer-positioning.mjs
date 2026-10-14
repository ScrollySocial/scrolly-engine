/**
 * One-sentence positioning generator. Three distinct, route-adapted
 * options built from the customer's actual offer data -- never a single
 * forced "I help X do Y without Z" template for every business model.
 *
 * Never invents a differentiator: when none is stated, every template
 * substitutes an honest placeholder clause instead of fabricating one.
 *
 * 2026-09-12 fix: every differentiator slot used to sit inside a
 * grammatically rigid connector ("designed to {diff}", "featuring {diff}"),
 * which assumes the customer's free-text answer is a bare infinitive/noun
 * object. A real customer typed "Made with all-natural, locally sourced
 * ingredients" (a capitalized participial fragment) into that slot,
 * producing "designed to Made with..." -- broken regardless of which
 * differentiator phrasing happens to be typed in (noun phrase, adjective
 * phrase, verb phrase, full sentence, feature, method, or benefit all hit
 * the same problem). Fixed by never embedding the differentiator as the
 * grammatical object of a specific verb/preposition -- every template now
 * appends it as an independent, comma-joined trailing clause (`, {diffClause}`),
 * which reads naturally regardless of the fragment's part of speech, and
 * `normalizeClause()` makes it embeddable (drops a trailing sentence stop,
 * lowercases the first letter the way any mid-sentence clause would be).
 */

const NO_DIFFERENTIATOR_CLAUSE = 'though what makes it different is still being defined';

function phrase(value, fallback) {
  const v = (value || '').trim();
  return v || fallback;
}

/**
 * Makes a free-text fragment safe to embed as a trailing appositive clause
 * (", ...") regardless of whether it was typed as a noun phrase ("all-natural
 * ingredients"), an adjective phrase ("affordable and fast"), a verb/
 * participial phrase ("made with locally sourced ingredients"), a feature/
 * method ("hand-poured in small batches"), or a full sentence ("We use only
 * organic ingredients."). A comma-joined trailing clause is grammatical
 * English no matter which of those it is -- unlike a specific connector verb
 * ("designed to") or preposition ("featuring"), which only fits some of them.
 */
function normalizeClause(raw) {
  const text = (raw || '').trim();
  if (!text) return null;
  const stripped = text.replace(/[.!]+$/, ''); // drop a trailing sentence stop so it composes into a larger sentence
  return stripped.charAt(0).toLowerCase() + stripped.slice(1); // mid-sentence clauses read lowercase, same as any appositive
}

/**
 * Narrow, explicit presentation fixes for common unhyphenated compound
 * adjectives ("healthy conscious" -> "health-conscious") -- not a general
 * grammar engine, just the specific, safe, meaning-preserving normalization
 * this product actually needs. Extend this list only for other equally
 * unambiguous, common cases; do not grow it into a parser.
 */
const PHRASING_FIXES = [[/\bhealthy conscious\b/gi, 'health-conscious']];
function normalizePresentation(text) {
  if (!text) return text;
  return PHRASING_FIXES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

const TEMPLATE_BUILDERS = {
  ecommerce: (o) => [
    `${o.offer} for ${o.audience}, ${o.diffClause}.`,
    `${o.offer} — for ${o.audience} who want ${o.motivation}.`,
    `The ${o.offerLower} that gives ${o.audience} ${o.get}.`,
  ],
  services: (o) => [
    `${o.offer} for ${o.audience} who need ${o.motivation}.`,
    `${o.offer}, built for ${o.audience} — ${o.diffClause}.`,
    `Helping ${o.audience} get ${o.motivation} through ${o.offerLower}.`,
  ],
  digital_product: (o) => [
    `${o.offer} that helps ${o.audience} accomplish ${o.motivation}.`,
    `${o.offer} for ${o.audience}, ${o.diffClause}.`,
    `A way for ${o.audience} to get ${o.motivation} through ${o.offerLower}.`,
  ],
  creator_affiliate: (o) => [
    `${o.offer} for ${o.audience} who want ${o.motivation}.`,
    `${o.offer} for ${o.audience} — ${o.diffClause}.`,
    `What ${o.audience} turn to for ${o.motivation}: ${o.offerLower}.`,
  ],
  marketplace_first: (o) => [
    `${o.offer} for ${o.audience}, ${o.diffClause}.`,
    `${o.offer} — ${o.motivation}, for ${o.audience}.`,
    `${o.audience} choose ${o.offerLower}, ${o.diffClause}.`,
  ],
  local_hybrid: (o) => [
    `${o.offer} for ${o.audience}, ${o.diffClause}.`,
    `${o.offer}, for ${o.audience} who want ${o.motivation}.`,
    `The local choice for ${o.audience}: ${o.offerLower}, ${o.diffClause}.`,
  ],
};

/**
 * @param {object} params
 * @param {string} params.offer - offerConfirmed
 * @param {string} params.audience - audienceConfirmed
 * @param {string} [params.whatTheyGet]
 * @param {string} [params.motivation] - buyingMotivation
 * @param {string} [params.differentiationDetail]
 * @param {string} params.route
 * @returns {string[]} exactly 3 distinct positioning options
 */
export function generatePositioningOptions({ offer, audience, whatTheyGet, motivation, differentiationDetail, route }) {
  const builder = TEMPLATE_BUILDERS[route];
  if (!builder) throw new Error(`No positioning templates for route "${route}"`);
  const o = {
    offer: phrase(offer, 'This offer'),
    offerLower: phrase(offer, 'offer').toLowerCase(),
    audience: normalizePresentation(phrase(audience, 'the right customer')),
    // `get` and `motivation` are embedded mid-sentence too ("gives X {get}",
    // "who want {motivation}") -- same normalization as the differentiator,
    // for the same reason: raw customer text often starts capitalized like
    // a sentence, which reads as broken once it's not sentence-initial.
    get: normalizeClause(whatTheyGet) || 'exactly what they need',
    motivation: normalizeClause(motivation) || 'what they need',
    diffClause: normalizeClause(differentiationDetail) || NO_DIFFERENTIATOR_CLAUSE,
  };
  return builder(o);
}
