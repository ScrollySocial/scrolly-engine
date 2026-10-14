#!/usr/bin/env node
/**
 * The production orchestrator — dispatches EVERY classified finding to the
 * furthest-safe implementation path, not just the 3 original field types.
 * Resumable/idempotent: safe to re-invoke at any point, picks up from
 * engagement.json's `stage`.
 *
 * 2026-08-24 rewrite: wires content_replace (via content-target-extractor's
 * safe auto-extraction, falling back to Path 2 when extraction or the live
 * uniqueness check fails), Path 2 general dispatch, Path 3 dispatch (when
 * 2+ known pages exist), and real Level-2/Level-3 approval pause+resume
 * using the previously-idle mint-batch-approval-token.mjs/customer-approve.mjs
 * infrastructure. Level 1 (field tasks) is unchanged from the prior version.
 *
 * Approval routing:
 *   Level 1 (seo_title/meta_description/alt_text/wc fields) — Mercedes is
 *     the standing QA layer per §5; auto-applied unless REQUIRE_MERCEDES_REVIEW.
 *   Level 2 (content_replace/content_append) — customer-visible content
 *     change; NEVER auto-applied. One consolidated batch token minted,
 *     engagement genuinely pauses at 'awaiting_customer_approval' until
 *     it's consumed (by customer-approve.mjs, e.g. via a real click) —
 *     re-invoking this script afterward resumes and applies.
 *   Level 3 (Path 4 briefs) — a 'plan'-stage batch token represents
 *     customer sign-off on pursuing these page ideas. V1 has no further
 *     "build" step beyond the brief document itself (§13's documented
 *     rationale) — plan approval is Path 4's real terminus in V1, not an
 *     artificial second stage for a build step that doesn't exist yet.
 *
 * Stages: connected -> auditing -> analyzing -> implementing_level1 ->
 *   awaiting_customer_approval (only if unresolved Level-2 items exist) ->
 *   implementing_level2 -> verifying -> complete
 *
 * Usage: node run-implementation.mjs <slug>
 * Env: REQUIRE_MERCEDES_REVIEW=true|false (default false)
 *      MAX_PATH4_BRIEFS_PER_RUN=<n> (default 20 — bounds LLM cost per
 *        invocation without silently dropping findings; raise if a real
 *        audit legitimately has more confirmed-relevance new-page rows)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { loadSiteCredentials } from './lib/site-credentials.mjs';
import { classifyFindings, describeFinding } from './lib/finding-classifier.mjs';
import { translateFindingsToTasks } from './lib/translator.mjs';
import { createTask, markSnapshot } from './lib/task-schema.mjs';
import { readField, writeField, getContent } from './lib/cms-adapter.mjs';
import { complete } from './lib/llm-router.mjs';
import { runQa } from './lib/qa-engine.mjs';
import { saveTasks, loadTasks, logEvent } from './lib/snapshot-store.mjs';
import { valuesMatch } from './lib/compare.mjs';
import { extractReplaceTarget } from './lib/content-target-extractor.mjs';
import { computeUniqueReplacement } from './lib/content-replace.mjs';
import { isSafeForBodyContentEdit } from './lib/page-builder-adapter.mjs';
import { getPageMeta as getShopifyPageMeta } from './lib/shopify-client.mjs';
import { generateReadyToPasteContent, validateReadyToPaste, renderReadyToPasteReview } from './lib/ready-to-paste-generator.mjs';
import { generateInternalLinkPlan, validateLinkPlan, renderLinkPlanReview } from './lib/internal-link-planner.mjs';
import { generateStrategicBrief, validateBrief, renderBriefReview } from './lib/strategic-brief-generator.mjs';
import { renderCustomerActionItems } from './lib/customer-action-items.mjs';
import { writeCompletionSummary } from './lib/completion-summary.mjs';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');
const AUTOMATION_DIR = path.resolve(__dirname, '..');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node run-implementation.mjs <slug>');
  process.exit(1);
}

const implDir = path.join(VAULT_DIR, 'clients', slug, 'implementation');
const engagementPath = path.join(implDir, 'engagement.json');

async function loadEngagement() {
  try {
    return JSON.parse(await readFile(engagementPath, 'utf8'));
  } catch {
    return null;
  }
}
async function saveEngagement(e) {
  e.updatedAt = new Date().toISOString();
  await writeFile(engagementPath, JSON.stringify(e, null, 2));
}
async function setStage(engagement, stage) {
  engagement.stage = stage;
  await saveEngagement(engagement);
  await logEvent(slug, { type: 'stage_change', stage });
  console.log(`[stage] ${stage}`);
}
async function mintBatch(level, stage, taskIds) {
  const { stdout } = await run('node', [path.join(__dirname, 'mint-batch-approval-token.mjs'), slug, String(level), stage, taskIds.join(',')], { cwd: AUTOMATION_DIR });
  return JSON.parse(stdout);
}
async function readBatchRecord(batchId) {
  return JSON.parse(await readFile(path.join(implDir, 'approvals', `${batchId}.json`), 'utf8'));
}
function cell(value, maxLen) {
  // Table rows are single lines — a raw newline (e.g. multi-line generated
  // HTML/JSON-LD in actionGenerated) silently breaks the markdown table
  // structure, as confirmed live with the schema-markup finding's script
  // fragment. Collapse whitespace before truncating/escaping pipes.
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLen).replace(/\|/g, '\\|');
}
async function writeReconciliationDoc(rows) {
  const lines = [
    '# Whole-Audit Implementation Reconciliation',
    '',
    `Generated ${new Date().toISOString()}. ${rows.length} finding(s). Every finding is accounted for — 0 unclassified, 0 silently dropped.`,
    '',
    '| # | table | finding | classification | implementation path | action generated | approval requirement | execution/result | final disposition |',
    '|---|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.index} | ${r.table} | ${cell(r.finding, 70)} | ${r.classification} | ${r.implementationPath} | ${cell(r.actionGenerated, 90)} | ${r.approvalRequirement} | ${cell(r.executionResult, 90)} | ${r.finalDisposition} |`),
  ];
  await writeFile(path.join(implDir, 'implementation-reconciliation.md'), lines.join('\n') + '\n');
}

const engagement = await loadEngagement();
if (!engagement) {
  console.log(`No implementation engagement for ${slug} — nothing to do.`);
  process.exit(0);
}
if (engagement.intakeStatus !== 'connected') {
  console.log(`Engagement ${slug} not yet connected (intakeStatus=${engagement.intakeStatus}).`);
  process.exit(0);
}
if (engagement.stage === 'complete') {
  console.log('Engagement already complete — nothing to do.');
  process.exit(0);
}

const creds = await loadSiteCredentials(slug);
if (!creds) {
  console.error(`No stored credentials for ${slug} despite intakeStatus=connected.`);
  await setStage(engagement, 'failed');
  process.exit(1);
}
const platform = creds.platform || 'wordpress'; // frozen WP engagements never had a `platform` field — default preserves them exactly
if (platform === 'shopify') {
  process.env.SHOPIFY_SHOP_DOMAIN = creds.shopDomain;
  process.env.SHOPIFY_CLIENT_ID = creds.clientId;
  process.env.SHOPIFY_CLIENT_SECRET = creds.clientSecret;
} else {
  process.env.CMS_MODE = 'live';
  process.env.WP_BASE_URL = creds.baseUrl;
  process.env.WP_APP_USER = creds.wpUser;
  process.env.WP_APP_PASSWORD = creds.wpAppPassword;
  process.env.SEO_PLUGIN = creds.seoPlugin;
}

const findingsPath = path.join(VAULT_DIR, 'clients', slug, 'discover', 'findings.json');
let findingsExist = true;
try {
  await readFile(findingsPath, 'utf8');
} catch {
  findingsExist = false;
}
if (!findingsExist) {
  if (engagement.stage === 'auditing') {
    console.log('Still auditing — exiting; will resume once Discover completes.');
    process.exit(0);
  }
  console.log('No findings.json yet — launching Discover audit first.');
  await setStage(engagement, 'auditing');
  await run('node', [path.join(AUTOMATION_DIR, 'n8n', 'scripts', 'launch-runner.mjs'), slug], { cwd: AUTOMATION_DIR });
  process.exit(0);
}

await mkdir(implDir, { recursive: true });

const findingsRows = JSON.parse(await readFile(findingsPath, 'utf8'));
const { classified, counts, unclassifiedCount } = classifyFindings(findingsRows);
if (unclassifiedCount > 0) {
  console.error(`${unclassifiedCount} finding(s) unclassified — refusing to proceed.`);
  await setStage(engagement, 'failed');
  process.exit(1);
}

const siteMapPath = path.join(implDir, 'site-map.json');
let siteMap = null;
try {
  siteMap = JSON.parse(await readFile(siteMapPath, 'utf8'));
} catch {
  console.error(`No site-map.json for ${slug} — Level-1/2 field/content tasks cannot resolve a target page.`);
}

const businessName = engagement.businessName;
const siteUrl = platform === 'shopify' ? `https://${creds.shopDomain}` : creds.baseUrl;

// recordByIndex: the single source of truth for each finding's
// reconciliation row — built once during dispatch, then updated in place
// as tasks actually get applied. Never re-derived by string-matching later.
const recordByIndex = new Map();
function record(c, r) {
  const existing = recordByIndex.get(c.index) || { index: c.index, table: c.table, finding: c.finding, classification: c.disposition };
  const merged = { ...existing, ...r };
  recordByIndex.set(c.index, merged);
  return merged;
}

// ---------------------------------------------------------------------------
// DISPATCH PHASE — runs once per engagement. Resuming after approval must
// NOT re-propose/re-generate everything again.
// ---------------------------------------------------------------------------
if (!engagement.dispatchCompletedAt) {
  await setStage(engagement, 'analyzing');
  console.log(`Classification: ${JSON.stringify(counts)}`);

  let allTasks = await loadTasks(slug);

  // ============ PATH_1: existing field types (title/meta/alt/wc fields) ============
  const level1Tasks = siteMap ? translateFindingsToTasks(findingsRows, { engagementSlug: slug, targetSite: siteUrl, siteMap }) : [];
  const FIELD_PROMPTS = {
    seo_title: (t) => `Write ONE SEO title tag, <=60 chars, brand+service+location. Current: "${t.originalValue}". Instruction: "${t.rationale}". Business: ${businessName}. Reply with ONLY the title.`,
    meta_description: (t) => `Write ONE meta description, 120-160 chars. Current: "${t.originalValue || '(empty)'}". Instruction: "${t.rationale}". Business: ${businessName}. Reply with ONLY the description.`,
    alt_text: (t) => `Write ONE short descriptive alt text. Current placeholder: "${t.originalValue}". Instruction: "${t.rationale}". Business: ${businessName}. Reply with ONLY the alt text.`,
    wc_product_field: (t) => `Write short WooCommerce product content (1-2 sentences). Current: "${t.originalValue || '(empty)'}". Instruction: "${t.rationale}". Business: ${businessName}. Reply with ONLY the content.`,
    wc_category_field: (t) => `Write a short WooCommerce category description (1-2 sentences). Current: "${t.originalValue || '(empty)'}". Instruction: "${t.rationale}". Business: ${businessName}. Reply with ONLY the description.`,
  };
  for (const task of level1Tasks) {
    task.originalValue = await readField(task);
    markSnapshot(task, task.originalValue);
    const { text } = await complete({ prompt: FIELD_PROMPTS[task.fieldType](task), maxTokens: 200 });
    task.proposedValue = text.trim();
    task.qa = runQa(task, task.proposedValue);
    allTasks.push(task);
    const c = classified[task.sourceFindingRef.index];
    record(c, {
      implementationPath: `Path 1 — ${task.fieldType} field`,
      actionGenerated: `Proposed: "${task.proposedValue}"`,
      approvalRequirement: 'Level 1 (Mercedes standing QA)',
      executionResult: task.qa.passed ? 'Pending apply (Level 1, this run)' : 'QA FAILED — not applied',
      finalDisposition: task.qa.passed ? 'Implementing' : 'Blocked (QA failed)',
    });
    task._reconciliationIndex = c.index; // for the apply-phase lookup below
  }

  // ============ PATH_1 (continued): content_replace for H1/broken-link, ============
  // falling back to PATH_2 automatically when extraction or uniqueness fails.
  const claimedIndices = new Set(level1Tasks.map((t) => t.sourceFindingRef.index));
  const path1Remaining = classified.filter((c) => c.disposition === 'PATH_1' && !claimedIndices.has(c.index));

  const pageTarget = siteMap?.primary_page;
  const pageSafe = pageTarget
    ? await isSafeForBodyContentEdit({ platform, baseUrl: creds.baseUrl, wpUser: creds.wpUser, wpAppPassword: creds.wpAppPassword, shopDomain: creds.shopDomain, clientId: creds.clientId, clientSecret: creds.clientSecret }, { targetObjectType: pageTarget.objectType, targetObjectId: pageTarget.objectId })
    : false;

  const level2Tasks = [];
  const path2FallbackQueue = []; // { c, row, refusalReason }

  // ============ PATH_1 (continued): content_append for additive findings ============
  // (schema markup / structured data — nothing existing to replace, safe to
  // append new content to the end of the page body instead). This is the
  // content_append field type's real dispatch wiring — previously proven
  // component-tested (docker/live-test-content-append.mjs) but never
  // actually reachable from a real finding.
  const APPEND_SHAPED = /structured data|schema markup|json-ld/i;
  const appendCandidates = path1Remaining.filter((c) => APPEND_SHAPED.test(`${findingsRows[c.index].finding || ''} ${findingsRows[c.index].recommended_action || ''}`));
  const replaceCandidates = path1Remaining.filter((c) => !appendCandidates.includes(c));

  for (const c of appendCandidates) {
    const row = findingsRows[c.index];
    let fellBackReason = null;
    if (!pageTarget) fellBackReason = 'No site-map primary_page configured.';
    else if (!pageSafe) fellBackReason = 'Target page is page-builder-controlled — body content is not auto-edited.';

    let currentContent = null;
    let fragment = null;
    if (!fellBackReason) {
      currentContent = await getContent({ targetObjectType: pageTarget.objectType, targetObjectId: pageTarget.objectId });
      try {
        const raw = await generateReadyToPasteContent(describeFinding(row), { url: siteUrl, title: businessName }, 'auto-append attempt');
        fragment = raw.content;
        // Confirmed live (Mulberry Creek finding #31): WordPress silently
        // strips <script> tags from post_content on save even for an
        // Application-Password admin user — the write reports success and
        // an immediate read-back can even appear to match, but a fresh
        // re-fetch later shows the tag gone. content_append cannot safely
        // deliver executable/script content this way — route it to Path 2
        // (manual paste, e.g. into the theme's header or a plugin's custom
        // HTML field) instead of an auto-write we can't trust to persist.
        if (/<script[\s>]/i.test(fragment)) fellBackReason = 'Generated fragment contains a <script> tag — WordPress strips inline scripts from post content on save, so this cannot be safely auto-appended.';
      } catch (err) {
        fellBackReason = `Fragment generation failed: ${err.message}`;
      }
    }

    if (fellBackReason) {
      path2FallbackQueue.push({ c, row, refusalReason: fellBackReason });
      record(c, {
        implementationPath: 'Path 1 attempted (content_append) → Path 2 (fallback)',
        actionGenerated: `Fell back to ready-to-paste generation: ${fellBackReason}`,
        approvalRequirement: 'None (deliverable only)',
        executionResult: 'Pending Path 2 generation',
        finalDisposition: 'Delivering as ready-to-paste content',
      });
      continue;
    }

    const task = createTask({
      engagementSlug: slug,
      path: 'auto_implementable',
      fieldType: 'content_append',
      targetSite: siteUrl,
      targetObjectType: pageTarget.objectType,
      targetObjectId: pageTarget.objectId,
      targetField: 'content',
      sourceFindingRef: { table: c.table, index: c.index },
      rationale: row.recommended_action,
    });
    task.originalValue = currentContent;
    markSnapshot(task, currentContent);
    task.proposedValue = currentContent + '\n' + fragment;
    task.qa = runQa(task, task.proposedValue);
    task._reconciliationIndex = c.index;
    allTasks.push(task);
    level2Tasks.push(task);
    record(c, {
      implementationPath: 'Path 1 — content_append',
      actionGenerated: `Proposed appending: ${fragment.slice(0, 120)}${fragment.length > 120 ? '…' : ''} (QA ${task.qa.passed ? 'PASS' : 'FAIL'})`,
      approvalRequirement: 'Level 2 (customer batch approval — customer-visible content change)',
      executionResult: task.qa.passed ? 'Staged, awaiting customer approval' : 'QA FAILED — not staged',
      finalDisposition: task.qa.passed ? 'Pending customer approval' : 'Blocked (QA failed)',
    });
  }

  for (const c of replaceCandidates) {
    const row = findingsRows[c.index];
    let fellBackReason = null;
    let target = null;

    if (!pageTarget) fellBackReason = 'No site-map primary_page configured.';
    else if (!pageSafe) fellBackReason = 'Target page is page-builder-controlled — body content is not auto-edited.';

    if (!fellBackReason) {
      target = extractReplaceTarget(row);
      if (!target) fellBackReason = 'Finding text does not name exactly one unambiguous literal string to replace.';
    }

    let currentContent = null;
    let replacementText = null;
    let computedNew = null;
    if (!fellBackReason) {
      const contentTask = { targetObjectType: pageTarget.objectType, targetObjectId: pageTarget.objectId };
      currentContent = await getContent(contentTask);
      const { text } = await complete({
        prompt: `Write a corrected replacement for this exact text: "${target.targetText}". Context: "${row.finding} ${row.recommended_action}". Business: ${businessName}. Reply with ONLY the replacement text/value, matching the same format (e.g. if it's a URL, reply with a URL; if it's a heading, reply with heading text) — no explanation.`,
        maxTokens: 150,
      });
      replacementText = text.trim();
      computedNew = computeUniqueReplacement(currentContent, target.targetText, replacementText);
      if (computedNew === null) fellBackReason = `Target text "${target.targetText}" is not uniquely present in the live page content (0 or 2+ occurrences) — cannot safely auto-replace.`;
    }

    if (fellBackReason) {
      path2FallbackQueue.push({ c, row, refusalReason: fellBackReason });
      record(c, {
        implementationPath: 'Path 1 attempted → Path 2 (fallback)',
        actionGenerated: `Fell back to ready-to-paste generation: ${fellBackReason}`,
        approvalRequirement: 'None (deliverable only)',
        executionResult: 'Pending Path 2 generation',
        finalDisposition: 'Delivering as ready-to-paste content',
      });
      continue;
    }

    const task = createTask({
      engagementSlug: slug,
      path: 'auto_implementable',
      fieldType: 'content_replace',
      targetSite: siteUrl,
      targetObjectType: pageTarget.objectType,
      targetObjectId: pageTarget.objectId,
      targetField: 'content',
      sourceFindingRef: { table: c.table, index: c.index },
      rationale: row.recommended_action,
    });
    task.replaceTarget = target.targetText;
    task.replaceWith = replacementText;
    task.originalValue = currentContent;
    markSnapshot(task, currentContent);
    task.proposedValue = computedNew;
    task.qa = runQa(task, computedNew);
    task._reconciliationIndex = c.index;
    allTasks.push(task);
    level2Tasks.push(task);
    record(c, {
      implementationPath: 'Path 1 — content_replace',
      actionGenerated: `Proposed replacing "${target.targetText}" with "${replacementText}" (QA ${task.qa.passed ? 'PASS' : 'FAIL'})`,
      approvalRequirement: 'Level 2 (customer batch approval — customer-visible content change)',
      executionResult: task.qa.passed ? 'Staged, awaiting customer approval' : 'QA FAILED — not staged',
      finalDisposition: task.qa.passed ? 'Pending customer approval' : 'Blocked (QA failed)',
    });
  }

  // ============ PATH_2: schema-markup findings + Path-1 fallbacks above ============
  const path2Direct = classified.filter((c) => c.disposition === 'PATH_2').map((c) => ({ c, row: findingsRows[c.index], refusalReason: c.reason }));
  const pathForGeneration = { url: siteUrl, title: businessName };
  for (const { c, row, refusalReason } of [...path2Direct, ...path2FallbackQueue]) {
    try {
      const raw = await generateReadyToPasteContent(describeFinding(row), pathForGeneration, refusalReason);
      const validated = validateReadyToPaste(raw);
      const doc = renderReadyToPasteReview(validated, describeFinding(row), pathForGeneration, refusalReason);
      const fname = `path2-finding-${c.index}.md`;
      await writeFile(path.join(implDir, fname), doc);
      const priorPath = recordByIndex.get(c.index)?.implementationPath;
      const isFallback = priorPath === 'Path 1 attempted → Path 2 (fallback)' || priorPath === 'Path 1 attempted (content_append) → Path 2 (fallback)';
      record(c, {
        implementationPath: isFallback ? priorPath : 'Path 2 — ready-to-paste',
        actionGenerated: `Generated ready-to-paste content (${fname})`,
        approvalRequirement: 'None (deliverable only)',
        executionResult: `Delivered — QA ${validated.qa.passed ? 'PASS' : 'FAIL'}`,
        finalDisposition: 'Delivered (ready-to-paste content)',
      });
    } catch (err) {
      console.error(`Path 2 generation failed for finding #${c.index}: ${err.message}`);
      record(c, { implementationPath: 'Path 2 — ready-to-paste', actionGenerated: 'Generation failed', approvalRequirement: 'None (deliverable only)', executionResult: `Error: ${err.message}`, finalDisposition: 'Blocked (generation error)' });
    }
  }

  // ============ PATH_3: internal-link plan, only when 2+ real pages are known ============
  const knownPages = [];
  if (siteMap?.primary_page) knownPages.push(siteMap.primary_page);
  if (siteMap?.secondary_pages) knownPages.push(...siteMap.secondary_pages);
  const path3Findings = classified.filter((c) => c.disposition === 'PATH_3');
  if (path3Findings.length > 0 && knownPages.length >= 2) {
    async function pageMeta(p) {
      if (platform === 'shopify') return getShopifyPageMeta({ shopDomain: creds.shopDomain, clientId: creds.clientId, clientSecret: creds.clientSecret }, p.objectType, p.objectId);
      const token = Buffer.from(`${creds.wpUser}:${creds.wpAppPassword}`).toString('base64');
      const res = await fetch(`${creds.baseUrl}/wp-json/wp/v2/${p.objectType}s/${p.objectId}?context=edit`, { headers: { Authorization: `Basic ${token}` } });
      const obj = await res.json();
      return { url: obj.link, title: obj.title.raw, content: (obj.content?.raw || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
    }
    const pages = await Promise.all(knownPages.map(pageMeta));
    const rawPlan = await generateInternalLinkPlan(pages);
    const validatedPlan = validateLinkPlan(rawPlan, pages);
    await writeFile(path.join(implDir, 'internal-link-plan.md'), renderLinkPlanReview(validatedPlan));
    for (const c of path3Findings) {
      record(c, { implementationPath: 'Path 3 — internal-link plan', actionGenerated: `Generated internal-link plan (internal-link-plan.md, ${validatedPlan.length} opportunit(y/ies))`, approvalRequirement: 'None (deliverable only)', executionResult: `Delivered — all QA ${validatedPlan.every((e) => e.qa.passed) ? 'PASS' : 'mixed'}`, finalDisposition: 'Delivered (internal-link plan)' });
    }
  } else {
    for (const c of path3Findings) {
      record(c, { implementationPath: 'Path 3 — internal-link plan', actionGenerated: 'Not generated this run', approvalRequirement: 'None yet', executionResult: `Dependency not met: ${knownPages.length} known page(s), need 2+`, finalDisposition: 'Deferred (dependency not met)' });
    }
  }

  // ============ PATH_4: strategic briefs (Level 3, plan-approval terminus) ============
  const path4Findings = classified.filter((c) => c.disposition === 'PATH_4');
  const maxBriefs = Number(process.env.MAX_PATH4_BRIEFS_PER_RUN || 20);
  const briefContext = [{ url: siteUrl, title: businessName }];
  const generatedBriefFindings = [];
  for (const c of path4Findings.slice(0, maxBriefs)) {
    try {
      const raw = await generateStrategicBrief(describeFinding(findingsRows[c.index]), briefContext);
      const validated = validateBrief(raw, briefContext);
      const safeName = (validated.slug || `finding-${c.index}`).replace(/[^a-z0-9-]/gi, '-');
      // Index-prefixed so two findings that produce the same or similar
      // slug (real risk once briefs come from short/generic recommendation
      // text, e.g. multiple O2 market rows) can never overwrite each other
      // on disk — confirmed live failure mode before this fix (9 distinct
      // Mulberry Creek findings collapsed onto 2 filenames).
      const fname = `strategic-brief-${c.index}-${safeName}.md`;
      await writeFile(path.join(implDir, fname), renderBriefReview(validated));
      record(c, { implementationPath: 'Path 4 — strategic brief', actionGenerated: `Generated strategic brief (${fname})`, approvalRequirement: 'Level 3 (customer plan approval)', executionResult: `Generated — QA ${validated.qa.passed ? 'PASS' : 'FAIL'}`, finalDisposition: 'Pending plan approval' });
      generatedBriefFindings.push(c);
    } catch (err) {
      console.error(`Strategic brief generation failed for finding #${c.index}: ${err.message}`);
      record(c, { implementationPath: 'Path 4 — strategic brief', actionGenerated: 'Generation failed', approvalRequirement: 'Level 3 (customer plan approval)', executionResult: `Error: ${err.message}`, finalDisposition: 'Blocked (generation error)' });
    }
  }
  if (path4Findings.length > maxBriefs) {
    for (const c of path4Findings.slice(maxBriefs)) {
      record(c, { implementationPath: 'Path 4 — strategic brief', actionGenerated: 'Not generated this run (per-run cap reached)', approvalRequirement: 'Level 3 (customer plan approval)', executionResult: `Deferred — MAX_PATH4_BRIEFS_PER_RUN=${maxBriefs} reached`, finalDisposition: 'Deferred (re-run to generate)' });
    }
  }

  // ============ CUSTOMER_ACTION_REQUIRED + NOT_APPLICABLE ============
  const customerActionFindings = classified.filter((c) => c.disposition === 'CUSTOMER_ACTION_REQUIRED');
  for (const c of customerActionFindings) {
    record(c, { implementationPath: 'Customer/external action', actionGenerated: 'Recorded in customer-action-items.md', approvalRequirement: 'N/A', executionResult: c.reason, finalDisposition: 'Customer action required' });
  }
  await writeFile(path.join(implDir, 'customer-action-items.md'), renderCustomerActionItems(customerActionFindings));

  for (const c of classified.filter((cc) => cc.disposition === 'NOT_APPLICABLE')) {
    record(c, { implementationPath: 'None', actionGenerated: 'None', approvalRequirement: 'N/A', executionResult: c.reason, finalDisposition: 'Not applicable' });
  }

  await saveTasks(slug, allTasks);
  engagement.dispatchCompletedAt = new Date().toISOString();
  engagement.reconciliation = [...recordByIndex.values()].sort((a, b) => a.index - b.index);
  engagement.level1TaskIds = level1Tasks.map((t) => t.taskId);
  engagement.level2TaskIds = level2Tasks.map((t) => t.taskId);
  await saveEngagement(engagement);

  // ============ Level 1: apply now (or wait for Mercedes) ============
  const requireMercedesReview = String(process.env.REQUIRE_MERCEDES_REVIEW).toLowerCase() === 'true';
  if (!requireMercedesReview) {
    for (const task of level1Tasks) {
      if (!task.qa.passed) continue;
      task.approvalState = 'approved';
      task.approvedBy = 'mercedes';
      task.approvedAt = new Date().toISOString();
      await writeField(task, task.proposedValue);
      const verifiedValue = await readField(task);
      const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);
      task.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
      await logEvent(slug, { type: 'apply', taskId: task.taskId, fieldType: task.fieldType, verifiedMatch });
      const r = recordByIndex.get(task._reconciliationIndex);
      if (r) {
        r.executionResult = `Applied + verified live (match: ${verifiedMatch})`;
        r.finalDisposition = verifiedMatch ? 'Implemented' : 'Implemented (verification mismatch — needs review)';
      }
    }
    const merged = await loadTasks(slug);
    for (const t of merged) {
      const updated = level1Tasks.find((x) => x.taskId === t.taskId);
      if (updated) Object.assign(t, updated);
    }
    await saveTasks(slug, merged);
  }

  // ============ Level 2: mint consolidated batch token, pause if unresolved ============
  const qaPassedLevel2 = level2Tasks.filter((t) => t.qa.passed);
  if (qaPassedLevel2.length > 0) {
    const batch = await mintBatch(2, 'built_result', qaPassedLevel2.map((t) => t.taskId));
    engagement.pendingLevel2BatchId = batch.batchId;
    engagement.pendingLevel2Token = batch.token; // stored for test/ops convenience; a real deployment emails this token to the customer instead
    console.log(`Level-2 batch approval token minted for ${qaPassedLevel2.length} task(s): batchId=${batch.batchId}`);
  }

  // ============ Level 3: mint plan-approval batch for all generated briefs ============
  if (generatedBriefFindings.length > 0) {
    // Path-4 tasks aren't in tasks.json (briefs are documents, not CMS
    // write tasks) — synthetic IDs are fine since mint/consume only need
    // set-consistency between the two calls, not real task.taskId values.
    const briefIds = generatedBriefFindings.map((c) => `finding-${c.index}`);
    const batch = await mintBatch(3, 'plan', briefIds);
    engagement.pendingLevel3BatchId = batch.batchId;
    engagement.pendingLevel3Token = batch.token;
    console.log(`Level-3 plan-approval token minted for ${briefIds.length} brief(s): batchId=${batch.batchId}`);
  }

  engagement.reconciliation = [...recordByIndex.values()].sort((a, b) => a.index - b.index);
  await saveEngagement(engagement);
  await writeReconciliationDoc(engagement.reconciliation);

  if (qaPassedLevel2.length > 0) {
    await setStage(engagement, 'awaiting_customer_approval');
    console.log(`\n${qaPassedLevel2.length} Level-2 task(s) awaiting customer approval. Re-run this script after the batch token is consumed to apply them.`);
    process.exit(0);
  }
}

// ---------------------------------------------------------------------------
// RESUME PATH — dispatch already ran; apply Level-2 tasks once their batch
// is confirmed consumed, then finish.
// ---------------------------------------------------------------------------
if (engagement.pendingLevel2BatchId) {
  const record2 = await readBatchRecord(engagement.pendingLevel2BatchId);
  if (!record2.consumedAt) {
    console.log('Still awaiting customer approval for Level-2 changes — nothing further to do yet.');
    process.exit(0);
  }
  await setStage(engagement, 'implementing_level2');
  const tasks = await loadTasks(slug);
  const recon = new Map((engagement.reconciliation || []).map((r) => [r.index, r]));
  for (const task of tasks) {
    if (record2.taskIds.includes(task.taskId) && task.approvalState === 'approved' && !task.apply?.applied) {
      await writeField(task, task.proposedValue);
      const verifiedValue = await readField(task);
      const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);
      task.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
      await logEvent(slug, { type: 'apply', taskId: task.taskId, fieldType: task.fieldType, verifiedMatch });
      const r = recon.get(task.sourceFindingRef?.index);
      if (r) {
        r.executionResult = `Applied + verified live (match: ${verifiedMatch})`;
        r.finalDisposition = verifiedMatch ? 'Implemented' : 'Implemented (verification mismatch — needs review)';
      }
    }
  }
  await saveTasks(slug, tasks);
  engagement.reconciliation = [...recon.values()].sort((a, b) => a.index - b.index);
}

if (engagement.pendingLevel3BatchId) {
  const record3 = await readBatchRecord(engagement.pendingLevel3BatchId);
  if (record3.consumedAt) {
    for (const r of engagement.reconciliation || []) {
      if (r.finalDisposition === 'Pending plan approval') r.finalDisposition = 'Delivered, plan approved';
    }
  }
}

await saveEngagement(engagement);
await writeReconciliationDoc(engagement.reconciliation || []);

// ---------------------------------------------------------------------------
// Final verification + completion
// ---------------------------------------------------------------------------
await setStage(engagement, 'verifying');
const finalTasks = await loadTasks(slug);
const finalRecon = new Map((engagement.reconciliation || []).map((r) => [r.index, r]));
let verificationFailures = 0;
for (const t of finalTasks) {
  if (t.apply?.applied && !t.rollback?.rollbackVerified) {
    const fresh = await readField(t);
    const match = valuesMatch(t, t.proposedValue, fresh);
    if (!match) {
      verificationFailures++;
      console.error(`VERIFICATION MISMATCH: ${t.taskId} (${t.fieldType}) — the apply-time read-back matched, but a fresh re-fetch does not. Rolling back rather than leaving unverifiable content live.`);
      // The apply-time verification (readField immediately after writeField)
      // can be fooled by a CMS that echoes back what was sent rather than
      // what actually got persisted (confirmed live: WordPress strips
      // <script> tags from post_content on save, but the REST response
      // body still reflected the pre-strip content). This later, fresh
      // fetch is the one that can be trusted — on mismatch, roll back
      // automatically so the reconciliation/completion summary never
      // claims something is live that isn't, matching this system's
      // rollback guarantee.
      await writeField(t, t.originalValue);
      const rolledBackValue = await readField(t);
      const rollbackVerified = valuesMatch(t, t.originalValue, rolledBackValue);
      t.rollback = { ...(t.rollback || {}), rolledBackAt: new Date().toISOString(), rollbackVerified, reason: 'Post-apply verification mismatch — auto-rolled-back.' };
      await logEvent(slug, { type: 'auto_rollback', taskId: t.taskId, fieldType: t.fieldType, rollbackVerified });

      const idx = t._reconciliationIndex ?? t.sourceFindingRef?.index;
      const r = idx !== undefined ? finalRecon.get(idx) : null;
      if (r) {
        r.executionResult = rollbackVerified
          ? `Applied, but a fresh live re-check found the content did not persist as written (CMS likely stripped/altered it on save) — automatically rolled back to the original value, verified.`
          : `Applied, but a fresh live re-check found the content did not persist as written, AND the automatic rollback could not be verified — needs manual review.`;
        r.finalDisposition = rollbackVerified ? 'Blocked (auto-rolled-back — not live)' : 'Blocked (verification mismatch — rollback unverified, needs manual review)';
      }
    }
  }
}
await saveTasks(slug, finalTasks);
if (verificationFailures > 0) {
  engagement.reconciliation = [...finalRecon.values()].sort((a, b) => a.index - b.index);
  await saveEngagement(engagement);
  await writeReconciliationDoc(engagement.reconciliation);
}
const { outPath } = await writeCompletionSummary(slug);
engagement.completionSummaryPath = outPath;
await setStage(engagement, 'complete');
console.log(`\nEngagement ${slug} complete. Completion summary: ${outPath}`);
