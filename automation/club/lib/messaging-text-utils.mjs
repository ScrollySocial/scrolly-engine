/**
 * Shared safe-text-embedding helpers for every Module 5 generator.
 *
 * 2026-09-12 Module 2 lesson, deliberately re-applied here rather than
 * imported (offer-positioning.mjs is frozen Module 2 surface area): a raw
 * customer free-text field embedded as the object of a specific verb/
 * preposition ("designed to {diff}") breaks the moment the customer's answer
 * isn't a bare infinitive/noun ("designed to Made with all-natural
 * ingredients"). Module 5 embeds FAR more free-text fields than Module 2 did
 * (buyer description, current situation, desired result, differentiation,
 * objections, angles) into generated sentences, so this class of bug is a
 * bigger risk here, not a smaller one -- every embedding in this module goes
 * through `clause()` rather than a bespoke connector.
 */

/** Drops a trailing sentence-stop and lowercases the first letter, so a fragment reads naturally mid-sentence regardless of how the customer originally typed it (a full sentence, a fragment, a capitalized noun phrase). */
export function clause(raw, fallback = null) {
  const text = (raw || '').trim();
  if (!text) return fallback;
  const stripped = text.replace(/[.!]+$/, '');
  return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

/** Same as clause() but preserves original casing -- for use as a topic/label rather than a mid-sentence continuation. */
export function topic(raw, fallback = null) {
  const text = (raw || '').trim().replace(/[.!]+$/, '');
  return text || fallback;
}
