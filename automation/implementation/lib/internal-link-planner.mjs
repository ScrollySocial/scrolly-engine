/**
 * Path 3 — internal-link implementation plans (implementation-agent.md §4/§13).
 *
 * Never touches the CMS write path. Automatic body-content link insertion is
 * deferred (Aggressive scope, §15) — this module produces the analysis and
 * an executable, human-reviewable plan instead: source page, destination
 * page, anchor text, and the EXACT existing sentence the anchor would sit
 * in, so a human (or a future auto-apply component) never has to guess
 * placement. No apply/rollback lifecycle here — there's nothing to roll
 * back, since nothing gets written.
 */

import { completeJson } from './llm-json.mjs';

/**
 * @param {{url: string, title: string, content: string}[]} pages
 * @returns {Promise<Array<{sourceUrl:string, destinationUrl:string, anchorText:string, contextSentence:string, placement:string, rationale:string}>>}
 */
export async function generateInternalLinkPlan(pages) {
  const pageDescriptions = pages.map((p) => `URL: ${p.url}\nTitle: ${p.title}\nContent: ${p.content}`).join('\n\n---\n\n');

  const prompt = `You are an SEO analyst identifying internal linking opportunities between pages on a small business website. Here are the pages:

${pageDescriptions}

Identify 1-3 genuine internal-linking opportunities BETWEEN these pages (a sentence on one page that could link to another page's URL). For each opportunity, you MUST quote an EXACT sentence that already appears verbatim in the source page's Content above — do not paraphrase or invent a sentence. The anchor text must be a substring of that exact sentence.

Reply with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"sourceUrl": "...", "destinationUrl": "...", "anchorText": "...", "contextSentence": "...", "placement": "...", "rationale": "..."}]

"placement" should briefly describe where in the sentence/paragraph the link goes (e.g. "wrap the anchor text in the existing sentence about landscape design"). If no genuine opportunity exists, reply with an empty array: []`;

  const plan = await completeJson({ prompt, maxTokens: 800, label: 'internal-link-planner' });
  if (!Array.isArray(plan)) throw new Error('internal-link-planner: expected a JSON array.');
  return plan;
}

/** Deterministic QA — a different shape than qa-engine.mjs's field-type checks, so kept separate rather than shoehorned in. */
export function validateLinkPlan(plan, pages) {
  const knownUrls = new Set(pages.map((p) => p.url));
  return plan.map((entry) => {
    const checks = [];
    const push = (id, passed, detail) => checks.push({ id, passed, detail });

    push('source_known', knownUrls.has(entry.sourceUrl), knownUrls.has(entry.sourceUrl) ? 'Source URL is a known page.' : `Source URL "${entry.sourceUrl}" is not in the provided page set.`);
    push('destination_known', knownUrls.has(entry.destinationUrl), knownUrls.has(entry.destinationUrl) ? 'Destination URL is a known page.' : `Destination URL "${entry.destinationUrl}" is not in the provided page set.`);
    push('source_ne_destination', entry.sourceUrl !== entry.destinationUrl, entry.sourceUrl === entry.destinationUrl ? 'Source and destination are the same page.' : 'Source and destination differ.');

    const sourcePage = pages.find((p) => p.url === entry.sourceUrl);
    const anchorInContext = typeof entry.contextSentence === 'string' && typeof entry.anchorText === 'string' && entry.contextSentence.toLowerCase().includes(entry.anchorText.toLowerCase());
    push('anchor_in_context', anchorInContext, anchorInContext ? 'Anchor text appears in the cited context sentence.' : 'Anchor text does not appear in the cited context sentence — LLM may have invented it.');

    const contextInSource = sourcePage && typeof entry.contextSentence === 'string' && sourcePage.content.includes(entry.contextSentence.trim());
    push('context_verbatim_in_source', !!contextInSource, contextInSource ? 'Context sentence exists verbatim in the source page content.' : 'Context sentence was not found verbatim in the source page — this is a hallucination risk, treat as unverified.');

    const passed = checks.every((c) => c.passed); // every check here is hard-fail — a link plan with an invented sentence is not "executable," it's misleading
    return { ...entry, qa: { passed, checks } };
  });
}

/** Same spirit as propose.mjs's review.md — human-reviewable, executable, not vague (§4 Path 3). */
export function renderLinkPlanReview(validatedPlan) {
  const lines = [
    '# Internal Link Implementation Plan',
    '',
    `Generated ${new Date().toISOString()}. ${validatedPlan.length} opportunity(ies) identified. Path 3 (implementation-agent.md §4) — analysis and executable instructions only; body-content link insertion is not auto-applied.`,
    '',
  ];
  validatedPlan.forEach((entry, i) => {
    lines.push(`## ${i + 1}. ${entry.sourceUrl} → ${entry.destinationUrl}`);
    lines.push('');
    lines.push(`- **Anchor text:** "${entry.anchorText}"`);
    lines.push(`- **Existing sentence to link from:** "${entry.contextSentence}"`);
    lines.push(`- **Placement:** ${entry.placement}`);
    lines.push(`- **Rationale:** ${entry.rationale}`);
    lines.push(`- **QA:** ${entry.qa.passed ? 'PASS' : 'FAIL — do not implement, ' + entry.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ')}`);
    lines.push('');
  });
  return lines.join('\n');
}
