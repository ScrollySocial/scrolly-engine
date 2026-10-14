#!/usr/bin/env node
/**
 * Step 1 of the Checkpoint-1 lifecycle: findings -> structured tasks -> read
 * current state -> snapshot -> generate proposed change (LLM) -> deterministic
 * QA -> review doc. Stops before any write — apply.mjs is a separate step,
 * gated on Mercedes's approval (Level 1, implementation-agent.md §5).
 *
 * Usage: node propose.mjs <client-slug>
 * Reads env CMS_MODE (default "mock") — see lib/cms-adapter.mjs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translateFindingsToTasks } from './lib/translator.mjs';
import { markSnapshot } from './lib/task-schema.mjs';
import { readField } from './lib/cms-adapter.mjs';
import { complete } from './lib/llm-router.mjs';
import { runQa } from './lib/qa-engine.mjs';
import { saveTasks, logEvent } from './lib/snapshot-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node propose.mjs <client-slug>');
  process.exit(1);
}

const findingsPath = path.join(VAULT_DIR, 'clients', slug, 'discover', 'findings.json');
if (!existsSync(findingsPath)) {
  console.error(`No findings.json at ${findingsPath}. Run the Discover engagement first (or the backfill script for pre-existing engagements).`);
  process.exit(1);
}
const findingsRows = JSON.parse(await readFile(findingsPath, 'utf8'));

// Per-engagement object map (implementation-agent.md gap noted in translator.mjs).
// Loaded from clients/<slug>/implementation/site-map.json if present (real
// engagement: populated from site intake); falls back to Checkpoint-1's
// known mock IDs otherwise, so mock-mode runs keep working unchanged.
const siteMapPath = path.join(VAULT_DIR, 'clients', slug, 'implementation', 'site-map.json');
const siteMap = existsSync(siteMapPath)
  ? JSON.parse(await readFile(siteMapPath, 'utf8'))
  : { primary_page: { objectType: 'post', objectId: 1 }, primary_media: { objectType: 'media', objectId: 501 } };

const tasks = translateFindingsToTasks(findingsRows, {
  engagementSlug: slug,
  targetSite: process.env.WP_BASE_URL || `mock://${slug}`,
  siteMap,
});

console.log(`Translated ${tasks.length} Path-1 task(s) from findings.json.`);

const PROMPTS = {
  seo_title: (task) =>
    `You are writing an SEO title tag for a local service business. Current (broken) value: "${task.originalValue}". Audit finding/instruction: "${task.rationale}". Business context: Mulberry Creek, a nursery/landscaping business in Wills Point, TX. Write ONE replacement title tag, <=60 characters, including brand name, core service, and location. Reply with ONLY the title text, no quotes, no explanation.`,
  meta_description: (task) =>
    `You are writing an SEO meta description for a local service business. Current value: "${task.originalValue || '(empty)'}". Audit finding/instruction: "${task.rationale}". Business context: Mulberry Creek, a nursery/landscaping business in Wills Point, TX, offering nursery/plant retail, landscape design, and landscape installation. Write ONE replacement meta description, 120-160 characters, summarizing the business and its core services. Reply with ONLY the description text, no quotes, no explanation.`,
  alt_text: (task) =>
    `You are writing descriptive alt text for a product/business photo. Current (placeholder) value: "${task.originalValue}". Audit finding/instruction: "${task.rationale}". Business context: Mulberry Creek, a nursery/landscaping business — this image is on the "About" section of their homepage. Write ONE short, descriptive, accurate alt text for a photo in this context (do not invent specific visual details you can't know — describe it generically but usefully, e.g. subject + business context). Reply with ONLY the alt text, no quotes, no explanation.`,
};

const savedTasks = [];
for (const task of tasks) {
  task.originalValue = await readField(task);
  markSnapshot(task, task.originalValue);

  const { text } = await complete({ prompt: PROMPTS[task.fieldType](task), maxTokens: 200 });
  task.proposedValue = text.trim();

  task.qa = runQa(task, task.proposedValue);

  await logEvent(slug, { type: 'proposed', taskId: task.taskId, fieldType: task.fieldType, originalValue: task.originalValue, proposedValue: task.proposedValue, qaPassed: task.qa.passed });
  savedTasks.push(task);
}

await saveTasks(slug, savedTasks);

// Review doc — before/after table, same spirit as findings.md's own tables.
const implDir = path.join(VAULT_DIR, 'clients', slug, 'implementation');
await mkdir(implDir, { recursive: true });
const reviewLines = [
  `# Implementation Review — ${slug}`,
  '',
  `Generated ${new Date().toISOString()}. ${savedTasks.length} proposed change(s), Level 1 (Mercedes-only approval, implementation-agent.md §5).`,
  '',
  '| task_id | field | original | proposed | qa_passed | qa_notes |',
  '|---|---|---|---|---|---|',
  ...savedTasks.map(
    (t) =>
      `| ${t.taskId.slice(0, 8)} | ${t.fieldType} | ${(t.originalValue || '(empty)').replace(/\|/g, '\\|')} | ${t.proposedValue.replace(/\|/g, '\\|')} | ${t.qa.passed ? 'PASS' : 'FAIL'} | ${t.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ') || '—'} |`
  ),
];
await writeFile(path.join(implDir, 'review.md'), reviewLines.join('\n') + '\n');

console.log(`Wrote clients/${slug}/implementation/tasks.json and review.md`);
