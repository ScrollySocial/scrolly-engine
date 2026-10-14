/**
 * Read-back comparison for verification (apply.mjs/rollback.mjs) — NOT used
 * for the write itself, which always sends the plain proposed/original value
 * unchanged. Discovered during Checkpoint 1 live testing (see
 * implementation-agent.md §12): WooCommerce's REST API runs two content
 * filters on read for short_description/description that don't apply on
 * write:
 *   1. wpautop - "Plain text." is written, "<p>Plain text.</p>\n" comes back.
 *   2. wptexturize - straight apostrophes/quotes become smart-quote HTML
 *      entities ("Creek's" becomes "Creek&#8217;s").
 * Both are real, correct WordPress/WooCommerce behavior for rich-text
 * fields, not write failures. Exact string equality is the wrong check for
 * those field/target combinations; strip tags, decode entities, and fold
 * typographic punctuation back to its plain equivalent before comparing.
 */

const RICH_TEXT_FIELDS = new Set(['description', 'short_description']);

const TYPOGRAPHIC_TO_PLAIN = [
  [/[‘’]/g, "'"], // curly single quotes/apostrophe
  [/[“”]/g, '"'], // curly double quotes
  [/[–—]/g, '-'], // en/em dash
  [/…/g, '...'], // ellipsis
];

function decodeCommonEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function stripAndNormalize(value) {
  let v = decodeCommonEntities(value || '').replace(/<[^>]*>/g, '');
  for (const [pattern, replacement] of TYPOGRAPHIC_TO_PLAIN) v = v.replace(pattern, replacement);
  return v.replace(/\s+/g, ' ').trim();
}

export function valuesMatch(task, written, readBack) {
  const isRichText = (task.fieldType === 'wc_product_field' || task.fieldType === 'wc_category_field') && RICH_TEXT_FIELDS.has(task.targetField);
  if (!isRichText) return written === readBack;
  return stripAndNormalize(written) === stripAndNormalize(readBack);
}
