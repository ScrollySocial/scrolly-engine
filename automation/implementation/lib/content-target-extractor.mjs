/**
 * Closes the gap flagged in finding-classifier.mjs's original honest
 * boundary: deterministic extraction of the literal text a content_replace
 * task should target, straight from a finding's free-form prose. No LLM —
 * this is a safety gate, not a generation step, and must be inspectable/
 * predictable.
 *
 * Deliberately conservative: only returns a target when the finding text
 * contains EXACTLY ONE plausible quoted/backtick-delimited literal string.
 * Zero candidates (nothing quoted) or multiple candidates (ambiguous which
 * one is the fix target — e.g. a finding naming three separate H1 headings)
 * both return null. Callers MUST treat null as "route to Path 2," never as
 * "guess." This mirrors computeUniqueReplacement's null-means-unsafe
 * contract in content-replace.mjs exactly, one layer earlier.
 */

const QUOTE_PATTERNS = [/"([^"]{2,200})"/g, /`([^`]{2,200})`/g];
const REJECT_IF = [/^\d+$/, /^https?:\/\/[a-z.]+\/?$/i]; // pure numbers, or a bare well-formed URL (usually a citation, not a broken one worth replacing)

function extractQuotedCandidates(text) {
  const candidates = new Set();
  for (const pattern of QUOTE_PATTERNS) {
    for (const m of text.matchAll(pattern)) {
      const val = m[1].trim();
      if (val && !REJECT_IF.some((re) => re.test(val))) candidates.add(val);
    }
  }
  return [...candidates];
}

/**
 * @param {{finding:string, recommended_action:string}} row
 * @returns {{targetText: string}|null}
 */
export function extractReplaceTarget(row) {
  const text = `${row.finding || ''} ${row.recommended_action || ''}`;
  const candidates = extractQuotedCandidates(text);
  if (candidates.length !== 1) return null; // 0 = nothing to anchor on; 2+ = ambiguous, don't guess which one
  return { targetText: candidates[0] };
}
