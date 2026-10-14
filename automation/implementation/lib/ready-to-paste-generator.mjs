/**
 * Path 2 — implementation-ready content (implementation-agent.md §4).
 *
 * Closes the gap between "we can't safely auto-apply this" and "here's
 * useless generic advice." Used when content_append's page-builder gate or
 * content_replace's uniqueness gate refuses a Path-1 auto-apply — the
 * finding still gets a real, finished, placement-specific deliverable
 * instead of being silently dropped. No CMS write here either — same
 * "pure generation" shape as Path 3/4.
 */

import { completeJson } from './llm-json.mjs';

/**
 * @param {{finding:string, recommended_action:string}} finding
 * @param {{url:string, title:string}} page
 * @param {string} refusalReason - why Path 1 couldn't handle this (for the human reader's context)
 */
export async function generateReadyToPasteContent(finding, page, refusalReason) {
  const prompt = `You are preparing ready-to-paste website content for a non-technical business owner to add themselves (an automated tool could not safely apply this change directly — reason: ${refusalReason}).

Audit finding: "${finding.finding}"
Recommended action: "${finding.recommended_action}"
Target page: "${page.title}" (${page.url})

Keep the content itself simple: plain semantic HTML only (h2/h3/p/ul/li), NO inline styles, NO CSS, NO class names — this gets pasted directly into a WordPress editor, which handles its own styling. Verbose inline-styled markup wastes space and won't match the site's design anyway.

Produce a JSON object with EXACTLY these fields:
{
  "content": "the exact finished HTML/text content, ready to paste as-is — plain semantic HTML only, no inline styles",
  "placement": "specific, non-technical instructions for where on the page to add it (e.g. 'Add this as a new paragraph right after the paragraph that describes your services')",
  "rationale": "one sentence on why this helps"
}

Reply with ONLY the JSON object, no other text, no markdown code fences.`;

  return completeJson({ prompt, maxTokens: 1200, label: 'ready-to-paste-generator' });
}

export function validateReadyToPaste(entry) {
  const checks = [];
  const push = (id, passed, detail) => checks.push({ id, passed, detail });
  push('content_present', !!(entry.content && entry.content.trim()), entry.content ? 'Content present.' : 'Content missing.');
  push('placement_present', !!(entry.placement && entry.placement.trim()), entry.placement ? 'Placement instructions present.' : 'Placement instructions missing.');
  push('placement_specific', (entry.placement || '').length > 20, (entry.placement || '').length > 20 ? 'Placement instructions are specific enough to be useful.' : 'Placement instructions look too generic/short to be actionable.');
  const passed = checks.every((c) => c.passed);
  return { ...entry, qa: { passed, checks } };
}

export function renderReadyToPasteReview(entry, finding, page, refusalReason) {
  return [
    '# Implementation-Ready Content (Path 2)',
    '',
    `Generated ${new Date().toISOString()}. This finding could not be safely auto-applied (${refusalReason}) — here is the finished content ready to paste manually, per implementation-agent.md §4 Path 2.`,
    '',
    `## ${page.title} (${page.url})`,
    '',
    `**Audit finding:** ${finding.finding}`,
    '',
    '### Content to add',
    '',
    entry.content,
    '',
    `### Where to add it`,
    '',
    entry.placement,
    '',
    `**Why:** ${entry.rationale}`,
    '',
    `**QA:** ${entry.qa.passed ? 'PASS' : 'FAIL — ' + entry.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ')}`,
  ].join('\n');
}
