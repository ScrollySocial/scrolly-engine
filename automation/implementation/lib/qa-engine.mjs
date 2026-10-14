/**
 * Deterministic QA checks — no LLM calls in this file, per
 * implementation-agent.md's "use normal code, not an LLM, where code is
 * more reliable" rule. Runs after proposed-value generation, before human
 * approval — a proposal that fails a hard check never reaches review as if
 * it were ready.
 */

import { countOccurrences } from './content-replace.mjs';

const PLACEHOLDER_PATTERNS = [/^img_\d+/i, /^placeholder/i, /^screenshot/i, /^\s*$/, /^chatgpt image/i];

// Caught live during the full customer-journey test (2026-08-24): an
// alt-text generation prompt got a genuine LLM refusal ("Without seeing the
// actual photo, I cannot write accurate alt text...") back instead of real
// content — it passed every other check (non-empty, not a placeholder
// pattern, differs from original) and got applied to a live site before
// anyone caught it by reading the actual output. This is a hard-fail check
// across every generative field type, not just alt_text — a refusal is a
// refusal regardless of which field it happened on.
const REFUSAL_PATTERNS = [/^(i |i'm |i am )?(cannot|can't|unable to|don't have|do not have)/i, /without seeing/i, /please provide/i, /as an ai/i, /i need (more|additional) (information|context|details)/i];

function check(id, passed, detail) {
  return { id, passed, detail };
}

export function runQa(task, proposedValue) {
  const checks = [];

  checks.push(check('required_non_empty', typeof proposedValue === 'string' && proposedValue.trim().length > 0, 'Proposed value must not be empty.'));

  const looksLikeRefusal = typeof proposedValue === 'string' && REFUSAL_PATTERNS.some((re) => re.test(proposedValue.trim()));
  checks.push(check('not_an_llm_refusal', !looksLikeRefusal, looksLikeRefusal ? 'Proposed value looks like an LLM refusal/clarification request, not real content — do not apply this.' : 'Does not match refusal-language patterns.'));

  if (task.fieldType === 'seo_title') {
    checks.push(check('title_length', proposedValue.length > 0 && proposedValue.length <= 60, `Length ${proposedValue.length} (target <=60 for SERP display).`));
  }
  if (task.fieldType === 'meta_description') {
    checks.push(check('meta_desc_length', proposedValue.length >= 120 && proposedValue.length <= 160, `Length ${proposedValue.length} (target 120-160).`));
  }
  if (task.fieldType === 'alt_text') {
    const isPlaceholder = PLACEHOLDER_PATTERNS.some((re) => re.test(proposedValue.trim()));
    checks.push(check('alt_not_placeholder', !isPlaceholder, isPlaceholder ? 'Proposed alt text still matches a placeholder pattern.' : 'Not a placeholder pattern.'));
  }
  if (task.fieldType === 'content_append') {
    // proposedValue here is the FULL new content (original + appended
    // fragment), not just the fragment — see cms-adapter.mjs's comment.
    // This is the safety-critical check for this field type: appending must
    // never corrupt or drop existing content. A failure here is a hard
    // fail, not advisory, unlike the length checks above.
    checks.push(check('original_content_preserved', proposedValue.startsWith(task.originalValue), proposedValue.startsWith(task.originalValue) ? 'Original content intact, fragment appended after it.' : 'Proposed value does not start with the original content — this would overwrite/corrupt existing content, not append to it.'));
    checks.push(check('content_grew', proposedValue.length > task.originalValue.length, `Length ${task.originalValue.length} -> ${proposedValue.length}.`));
  }
  if (task.fieldType === 'content_replace') {
    // Defense in depth — the primary gate is the pre-creation uniqueness
    // check in content-replace.mjs (a task should never exist for an
    // ambiguous/absent target), but re-verify here too in case a task ever
    // reaches QA through a path that skipped it.
    const occurrences = countOccurrences(task.originalValue, task.replaceTarget);
    checks.push(check('unique_occurrence', occurrences === 1, `Target text occurs ${occurrences} time(s) in the original content (must be exactly 1).`));
    // Recompute the expected result independently and compare — guarantees
    // proposedValue wasn't corrupted/tampered between computation and QA,
    // and that it's a pure single-substring swap, nothing else changed.
    const expected = task.originalValue.replace(task.replaceTarget, task.replaceWith);
    checks.push(check('reconstruction_matches', proposedValue === expected, proposedValue === expected ? 'Proposed value is exactly the original with only the target text swapped.' : 'Proposed value does not match a clean single-substring replacement — refusing to trust it.'));
  }

  checks.push(check('not_identical_to_original', proposedValue !== task.originalValue, task.originalValue === proposedValue ? 'Proposed value is identical to the original — nothing to change.' : 'Differs from original.'));

  const hardFailIds = new Set(['required_non_empty', 'not_an_llm_refusal', 'not_identical_to_original', 'original_content_preserved', 'unique_occurrence', 'reconstruction_matches']);
  const passed = checks.filter((c) => hardFailIds.has(c.id)).every((c) => c.passed);

  return { passed, checks };
}
