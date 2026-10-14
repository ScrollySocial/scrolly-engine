/**
 * Path 4 — strategic implementation briefs (implementation-agent.md §4/§13).
 *
 * Same architecture as Path 3 (internal-link-planner.mjs): pure LLM
 * analysis/generation, no CMS write path, no apply/rollback lifecycle.
 * Structural changes (new pages, nav changes) are never auto-executed in
 * V1 (§4 Path 4 / §7) — this turns a raw audit finding like "create a
 * nursery page" into a genuinely implementation-ready brief instead of
 * leaving it as vague strategic advice.
 */

import { completeJson } from './llm-json.mjs';

/**
 * @param {object} finding - a raw findings.json row (category/finding/recommended_action/etc.)
 * @param {{url: string, title: string}[]} siteContext - existing pages, for real (not invented) internal-link suggestions
 */
export async function generateStrategicBrief(finding, siteContext) {
  const pageList = siteContext.map((p) => `- ${p.url} ("${p.title}")`).join('\n');

  const prompt = `You are an SEO strategist turning an audit finding into an implementation-ready brief for a new website page.

Audit finding: "${finding.finding}"
Recommended action: "${finding.recommended_action}"

Existing pages on this site (use ONLY these exact URLs for internal link suggestions — do not invent URLs):
${pageList}

Produce a strategic implementation brief as a JSON object with EXACTLY these fields:
{
  "purpose": "one sentence — why this page should exist",
  "title": "proposed page title",
  "slug": "proposed-url-slug-lowercase-hyphens-only",
  "targetKeyword": "primary target keyword",
  "keywordCluster": ["supporting keyword 1", "supporting keyword 2"],
  "navPlacement": "where in site navigation this page belongs",
  "contentOutline": ["Section heading 1", "Section heading 2", "..."],
  "draftContent": "a short draft opening paragraph for the page (2-3 sentences)",
  "internalLinksIn": ["exact URL from the list above that should link TO this new page"],
  "internalLinksOut": ["exact URL from the list above this new page should link OUT to"],
  "schema": "suggested schema.org type, e.g. LocalBusiness or Service",
  "rationale": "why this structure/approach"
}

Reply with ONLY the JSON object, no other text, no markdown code fences.`;

  return completeJson({ prompt, maxTokens: 900, label: 'strategic-brief-generator' });
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function validateBrief(brief, siteContext) {
  const knownUrls = new Set(siteContext.map((p) => p.url));
  const checks = [];
  const push = (id, passed, detail) => checks.push({ id, passed, detail });

  push('slug_url_safe', SLUG_PATTERN.test(brief.slug || ''), SLUG_PATTERN.test(brief.slug || '') ? 'Slug is URL-safe.' : `Slug "${brief.slug}" is not lowercase/digits/hyphens only.`);
  push('title_present', !!(brief.title && brief.title.trim()), brief.title ? 'Title present.' : 'Title missing.');
  push('target_keyword_present', !!(brief.targetKeyword && brief.targetKeyword.trim()), brief.targetKeyword ? 'Target keyword present.' : 'Target keyword missing.');
  push('content_outline_present', Array.isArray(brief.contentOutline) && brief.contentOutline.length > 0, Array.isArray(brief.contentOutline) && brief.contentOutline.length > 0 ? `${brief.contentOutline?.length} outline section(s).` : 'Content outline missing or empty.');

  const linksIn = Array.isArray(brief.internalLinksIn) ? brief.internalLinksIn : [];
  const linksOut = Array.isArray(brief.internalLinksOut) ? brief.internalLinksOut : [];
  const invalidIn = linksIn.filter((u) => !knownUrls.has(u));
  const invalidOut = linksOut.filter((u) => !knownUrls.has(u));
  push('internal_links_in_known', invalidIn.length === 0, invalidIn.length === 0 ? 'All internalLinksIn URLs are real known pages.' : `Invented/unknown URL(s) in internalLinksIn: ${invalidIn.join(', ')}`);
  push('internal_links_out_known', invalidOut.length === 0, invalidOut.length === 0 ? 'All internalLinksOut URLs are real known pages.' : `Invented/unknown URL(s) in internalLinksOut: ${invalidOut.join(', ')}`);

  const passed = checks.every((c) => c.passed);
  return { ...brief, qa: { passed, checks } };
}

export function renderBriefReview(validatedBrief) {
  const b = validatedBrief;
  return [
    '# Strategic Implementation Brief',
    '',
    `Generated ${new Date().toISOString()}. Path 4 (implementation-agent.md §4) — structural change, requires Level 3 customer approval before any execution (§5); this brief itself performs no write.`,
    '',
    `## ${b.title}`,
    '',
    `- **Purpose:** ${b.purpose}`,
    `- **Proposed slug:** /${b.slug}/`,
    `- **Target keyword:** ${b.targetKeyword}`,
    `- **Supporting keywords:** ${(b.keywordCluster || []).join(', ')}`,
    `- **Navigation placement:** ${b.navPlacement}`,
    `- **Schema type:** ${b.schema}`,
    '',
    '### Content outline',
    ...(b.contentOutline || []).map((s) => `1. ${s}`),
    '',
    '### Draft opening',
    b.draftContent || '(none provided)',
    '',
    `### Internal links in (existing pages that should link here)`,
    ...(b.internalLinksIn || []).map((u) => `- ${u}`),
    '',
    `### Internal links out (this page should link to)`,
    ...(b.internalLinksOut || []).map((u) => `- ${u}`),
    '',
    `**Rationale:** ${b.rationale}`,
    '',
    `**QA:** ${b.qa.passed ? 'PASS' : 'FAIL — ' + b.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ')}`,
  ].join('\n');
}
