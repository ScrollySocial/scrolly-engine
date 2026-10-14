#!/usr/bin/env node
/**
 * The full customer-journey test (implementation-agent.md §13's sellable-V1
 * definition): one real, continuous run threading every component built
 * this cycle together, rather than re-testing pieces in isolation.
 *
 * Purchase/intake (simulated — real Tally/Stripe wiring is a different,
 * already-built track, not this product's concern) -> audit findings
 * (real, Mulberry Creek's) -> structured implementation tasks -> proposed
 * changes -> deterministic QA -> Level 1 (Mercedes) approval -> Level 2
 * (customer) batch approval -> apply -> verify -> Path 2/3/4 for what
 * can't safely auto-apply -> completion summary.
 *
 * This run leaves its changes live (does not roll back at the end) —
 * deliberately, because that's what a real completed engagement looks
 * like. The disposable Docker environment can be wiped independently.
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { translateFindingsToTasks } from '../lib/translator.mjs';
import { markSnapshot } from '../lib/task-schema.mjs';
import { readField, writeField, getContent } from '../lib/cms-adapter.mjs';
import { complete } from '../lib/llm-router.mjs';
import { runQa } from '../lib/qa-engine.mjs';
import { saveTasks, loadTasks, logEvent } from '../lib/snapshot-store.mjs';
import { valuesMatch } from '../lib/compare.mjs';
import { generateInternalLinkPlan, validateLinkPlan, renderLinkPlanReview } from '../lib/internal-link-planner.mjs';
import { generateStrategicBrief, validateBrief, renderBriefReview } from '../lib/strategic-brief-generator.mjs';
import { writeCompletionSummary } from '../lib/completion-summary.mjs';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');
const slug = '_impl-agent-live-test';

console.log('=== STEP 1: Load real audit findings (Mulberry Creek) ===');
const findingsRows = JSON.parse(await readFile(path.join(VAULT_DIR, 'clients', 'mulberry-creek', 'discover', 'findings.json'), 'utf8'));
console.log(`Loaded ${findingsRows.length} findings.`);

console.log('\n=== STEP 2: Translate to implementation tasks (Path 1: title/meta/alt) ===');
const siteMap = { primary_page: { objectType: 'page', objectId: 10 }, primary_media: { objectType: 'media', objectId: 11 } };
const tasks = translateFindingsToTasks(findingsRows, { engagementSlug: slug, targetSite: process.env.WP_BASE_URL, siteMap });
console.log(`Translated ${tasks.length} Path-1 task(s).`);

console.log('\n=== STEP 3: Propose (read, snapshot, generate, QA) ===');
const PROMPTS = {
  seo_title: (t) => `Write ONE SEO title tag, <=60 chars, brand+service+location, for Mulberry Creek (Wills Point TX nursery/landscaping). Current: "${t.originalValue}". Instruction: "${t.rationale}". Reply with ONLY the title.`,
  meta_description: (t) => `Write ONE meta description, 120-160 chars, for Mulberry Creek (Wills Point TX nursery/landscaping/design/install). Current: "${t.originalValue || '(empty)'}". Instruction: "${t.rationale}". Reply with ONLY the description.`,
  alt_text: (t) => `Write ONE short descriptive alt text for a Mulberry Creek business photo. Current placeholder: "${t.originalValue}". Instruction: "${t.rationale}". Reply with ONLY the alt text.`,
};
for (const task of tasks) {
  task.originalValue = await readField(task);
  markSnapshot(task, task.originalValue);
  const { text } = await complete({ prompt: PROMPTS[task.fieldType](task), maxTokens: 200 });
  task.proposedValue = text.trim();
  task.qa = runQa(task, task.proposedValue);
  console.log(`  ${task.fieldType}: QA ${task.qa.passed ? 'PASS' : 'FAIL'}`);
}
await saveTasks(slug, [...(await loadTasks(slug)), ...tasks]);

console.log('\n=== STEP 4: Level 1 approval (Mercedes QA + approve) ===');
for (const task of tasks) {
  if (task.qa.passed) {
    task.approvalState = 'approved';
    task.approvedBy = 'mercedes';
    task.approvedAt = new Date().toISOString();
    console.log(`  ${task.fieldType} -> approved (Level 1)`);
  }
}
{
  const all = await loadTasks(slug);
  for (const t of all) {
    const updated = tasks.find((x) => x.taskId === t.taskId);
    if (updated) Object.assign(t, updated);
  }
  await saveTasks(slug, all);
}

console.log('\n=== STEP 5: Level 2 customer batch approval (real token mint/consume) ===');
const taskIds = tasks.filter((t) => t.approvalState === 'approved').map((t) => t.taskId);
const { stdout: mintOut } = await run('node', ['implementation/mint-batch-approval-token.mjs', slug, '2', 'built_result', taskIds.join(',')], { cwd: path.resolve(__dirname, '..', '..') });
const { batchId, token } = JSON.parse(mintOut);
const { stdout: consumeOut } = await run('node', ['implementation/customer-approve.mjs', slug, batchId, token], { cwd: path.resolve(__dirname, '..', '..') });
console.log('Customer approval:', JSON.parse(consumeOut));

console.log('\n=== STEP 6: Apply approved tasks live ===');
{
  const all = await loadTasks(slug);
  for (const task of tasks) {
    const t = all.find((x) => x.taskId === task.taskId);
    if (t?.approvalState !== 'approved') continue;
    await writeField(t, t.proposedValue);
    const verifiedValue = await readField(t);
    const verifiedMatch = valuesMatch(t, t.proposedValue, verifiedValue);
    t.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
    await logEvent(slug, { type: 'apply', taskId: t.taskId, fieldType: t.fieldType, verifiedMatch });
    console.log(`  ${t.fieldType} applied — verified: ${verifiedMatch}`);
  }
  await saveTasks(slug, all);
}

console.log('\n=== STEP 7: Path 3 (internal links) + Path 4 (strategic brief) from real findings ===');
async function getPageMeta(id) {
  const site = { baseUrl: process.env.WP_BASE_URL, wpUser: process.env.WP_APP_USER, wpAppPassword: process.env.WP_APP_PASSWORD };
  const t = Buffer.from(`${site.wpUser}:${site.wpAppPassword}`).toString('base64');
  const res = await fetch(`${site.baseUrl}/wp-json/wp/v2/pages/${id}?context=edit`, { headers: { Authorization: `Basic ${t}` } });
  const obj = await res.json();
  return { url: obj.link, title: obj.title.raw, content: obj.content.raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
}
const pages = [await getPageMeta(10), await getPageMeta(18)];
const rawLinkPlan = await generateInternalLinkPlan(pages);
const validatedLinkPlan = validateLinkPlan(rawLinkPlan, pages);
await (await import('node:fs/promises')).writeFile(path.join(VAULT_DIR, 'clients', slug, 'implementation', 'internal-link-plan.md'), renderLinkPlanReview(validatedLinkPlan));
console.log(`  Internal link plan: ${validatedLinkPlan.length} opportunity(ies), all QA-passed: ${validatedLinkPlan.every((e) => e.qa.passed)}`);

const dFinding = findingsRows.find((r) => r.table === 'D' && r.finding.includes('Plant Nursery / Garden Center'));
const rawBrief = await generateStrategicBrief(dFinding, pages.map((p) => ({ url: p.url, title: p.title })));
const validatedBrief = validateBrief(rawBrief, pages.map((p) => ({ url: p.url, title: p.title })));
await (await import('node:fs/promises')).writeFile(path.join(VAULT_DIR, 'clients', slug, 'implementation', 'strategic-brief-nursery-page.md'), renderBriefReview(validatedBrief));
console.log(`  Strategic brief generated, QA: ${validatedBrief.qa.passed ? 'PASS' : 'FAIL'}`);

console.log('\n=== STEP 8: Final verification (independent, fresh reads) ===');
for (const task of tasks) {
  const all = await loadTasks(slug);
  const t = all.find((x) => x.taskId === task.taskId);
  if (t?.apply?.applied) {
    const fresh = await readField(t);
    console.log(`  ${t.fieldType} — fresh read matches applied value: ${valuesMatch(t, t.proposedValue, fresh)}`);
  }
}

console.log('\n=== STEP 9: Completion summary (customer-facing final document) ===');
const { outPath } = await writeCompletionSummary(slug);
console.log(`Wrote ${outPath}`);

console.log('\n=== JOURNEY COMPLETE ===');
