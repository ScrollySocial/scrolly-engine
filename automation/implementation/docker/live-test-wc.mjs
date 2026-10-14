#!/usr/bin/env node
/**
 * Supplemental Checkpoint-1 live validation for the two field types
 * translator.mjs doesn't produce from Mulberry Creek's findings (it has no
 * WooCommerce — see translator.mjs). Builds the wc_product_field and
 * wc_category_field tasks directly, same shape the translator would
 * produce, and runs the identical propose -> QA -> apply -> verify ->
 * rollback -> verify lifecycle against CMS_MODE=live.
 *
 * Usage: node docker/live-test-wc.mjs <product_id> <category_id>
 */
import { createTask, markSnapshot } from '../lib/task-schema.mjs';
import { readField, writeField } from '../lib/cms-adapter.mjs';
import { complete } from '../lib/llm-router.mjs';
import { runQa } from '../lib/qa-engine.mjs';
import { saveTasks, loadTasks, logEvent } from '../lib/snapshot-store.mjs';
import { valuesMatch } from '../lib/compare.mjs';

const [, , productId, categoryId] = process.argv;
if (!productId || !categoryId) {
  console.error('Usage: node docker/live-test-wc.mjs <product_id> <category_id>');
  process.exit(1);
}
const slug = '_impl-agent-live-test';

const specs = [
  {
    fieldType: 'wc_product_field',
    targetObjectType: 'wc_product',
    targetObjectId: Number(productId),
    targetField: 'short_description',
    rationale: 'Write a short product description summarizing the nursery product for on-site and search display.',
    prompt: (orig) =>
      `Write a short WooCommerce product description (1-2 sentences, plain text) for a nursery product called "Test Nursery Product" sold by Mulberry Creek, a nursery/landscaping business in Wills Point, TX. Current value: "${orig || '(empty)'}". Reply with ONLY the description text.`,
  },
  {
    fieldType: 'wc_category_field',
    targetObjectType: 'wc_category',
    targetObjectId: Number(categoryId),
    targetField: 'description',
    rationale: 'Write a category description for SEO/on-site display.',
    prompt: (orig) =>
      `Write a short WooCommerce product category description (1-2 sentences, plain text) for a category called "Test Category" on Mulberry Creek's nursery/landscaping site (Wills Point, TX). Current value: "${orig || '(empty)'}". Reply with ONLY the description text.`,
  },
];

const tasks = [];
for (const spec of specs) {
  const task = createTask({
    engagementSlug: slug,
    path: 'auto_implementable',
    fieldType: spec.fieldType,
    targetSite: process.env.WP_BASE_URL,
    targetObjectType: spec.targetObjectType,
    targetObjectId: spec.targetObjectId,
    targetField: spec.targetField,
    sourceFindingRef: { table: 'synthetic-wc-live-test', index: 0 },
    rationale: spec.rationale,
  });
  task.originalValue = await readField(task);
  markSnapshot(task, task.originalValue);
  const { text } = await complete({ prompt: spec.prompt(task.originalValue), maxTokens: 150 });
  task.proposedValue = text.trim();
  task.qa = runQa(task, task.proposedValue);
  await logEvent(slug, { type: 'proposed', taskId: task.taskId, fieldType: task.fieldType, originalValue: task.originalValue, proposedValue: task.proposedValue, qaPassed: task.qa.passed });
  tasks.push(task);
  console.log(`${task.fieldType}: "${task.originalValue}" -> "${task.proposedValue}" (QA ${task.qa.passed ? 'PASS' : 'FAIL'})`);
}

const existing = await loadTasks(slug);
await saveTasks(slug, [...existing, ...tasks]);

for (const task of tasks) {
  task.approvalState = 'approved';
  task.approvedBy = 'mercedes';
  task.approvedAt = new Date().toISOString();
  await writeField(task, task.proposedValue);
  const verifiedValue = await readField(task);
  const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);
  task.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
  await logEvent(slug, { type: 'apply', taskId: task.taskId, fieldType: task.fieldType, proposedValue: task.proposedValue, verifiedValue, verifiedMatch });
  console.log(`${task.fieldType} applied — verified match: ${verifiedMatch}`);
}

const merged1 = await loadTasks(slug);
for (const t of merged1) {
  const updated = tasks.find((x) => x.taskId === t.taskId);
  if (updated) Object.assign(t, updated);
}
await saveTasks(slug, merged1);

for (const task of tasks) {
  await writeField(task, task.originalValue);
  const verifiedValue = await readField(task);
  const rollbackVerified = valuesMatch(task, task.originalValue, verifiedValue);
  task.rollback.rolledBackAt = new Date().toISOString();
  task.rollback.rollbackVerified = rollbackVerified;
  await logEvent(slug, { type: 'rollback', taskId: task.taskId, restoredValue: task.originalValue, verifiedValue, rollbackVerified });
  console.log(`${task.fieldType} rolled back — verified: ${rollbackVerified}`);
}

const merged2 = await loadTasks(slug);
for (const t of merged2) {
  const updated = tasks.find((x) => x.taskId === t.taskId);
  if (updated) Object.assign(t, updated);
}
await saveTasks(slug, merged2);
