/**
 * In-place native-content rewrite safety logic (implementation-agent.md §13,
 * "content_replace"). The uniqueness check IS the safety mechanism: a
 * substring replace is only safe to auto-apply when the target text
 * appears in the page exactly once — zero occurrences means the audit
 * evidence is stale/wrong, more than one means we can't know which
 * occurrence was actually meant. Both cases route to Path 2 instead of
 * guessing.
 */

export function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

/**
 * @returns {string|null} the full new content if the replacement is safe
 *   (target appears exactly once), or null if it's ambiguous/absent —
 *   callers must treat null as "do not create a Path-1 task."
 */
export function computeUniqueReplacement(content, targetText, replacementText) {
  if (countOccurrences(content, targetText) !== 1) return null;
  return content.replace(targetText, replacementText);
}
