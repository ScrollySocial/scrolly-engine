#!/usr/bin/env node
/**
 * Realistic-scope component 3 live validation: the content_append Path-1
 * task type (append-only FAQ/short-copy additions to native WordPress
 * content), gated through page-builder detection so Elementor-controlled
 * pages are correctly refused rather than corrupted.
 *
 * Usage: node docker/live-test-content-append.mjs <page_id>
 *   page 10 (native)   -> expect the full lifecycle to succeed
 *   page 15 (elementor) -> expect a clean refusal, no task created, no write
 */
import { createTask, markSnapshot } from '../lib/task-schema.mjs';
import { readField, writeField } from '../lib/cms-adapter.mjs';
import { complete } from '../lib/llm-router.mjs';
import { runQa } from '../lib/qa-engine.mjs';
import { saveTasks, loadTasks, logEvent } from '../lib/snapshot-store.mjs';
import { valuesMatch } from '../lib/compare.mjs';
import { isSafeForBodyContentEdit } from '../lib/page-builder-adapter.mjs';

const [, , pageId] = process.argv;
if (!pageId) {
  console.error('Usage: node docker/live-test-content-append.mjs <page_id>');
  process.exit(1);
}
const slug = '_impl-agent-live-test';
const targetObjectType = 'page';
const targetObjectId = Number(pageId);

const siteConfig = {
  baseUrl: process.env.WP_BASE_URL,
  wpUser: process.env.WP_APP_USER,
  wpAppPassword: process.env.WP_APP_PASSWORD,
};

// --- Gate: page-builder detection (implementation-agent.md §7/§13) --------
const task = createTask({
  engagementSlug: slug,
  path: 'auto_implementable',
  fieldType: 'content_append',
  targetSite: siteConfig.baseUrl,
  targetObjectType,
  targetObjectId,
  targetField: 'content',
  sourceFindingRef: { table: 'synthetic-content-append-live-test', index: 0 },
  rationale: 'Add an FAQ item to strengthen on-page content and answer a common customer question.',
});

const safe = await isSafeForBodyContentEdit(siteConfig, task);
if (!safe) {
  console.log(`Page ${targetObjectId} is page-builder-controlled — routing to Path 2 (ready-to-paste content) instead of auto-apply. No task created, no write attempted. Gate worked correctly.`);
  process.exit(0);
}
console.log(`Page ${targetObjectId} is native content — safe to proceed with Path 1 auto-apply.`);

// --- Propose: snapshot, generate fragment, compute full new content -------
task.originalValue = await readField(task);
markSnapshot(task, task.originalValue);

const { text } = await complete({
  prompt: `Write one short FAQ item (a question and a 1-2 sentence answer) about nursery/landscaping services, suitable for adding to a business's existing web page. Business: Mulberry Creek, a nursery/landscaping business in Wills Point, TX. Reply with ONLY the HTML fragment in this exact shape: <h3>Question here?</h3><p>Answer here.</p> — no other text, no markdown code fences.`,
  maxTokens: 200,
});
const fragment = text.trim();
task.proposedValue = task.originalValue + '\n' + fragment; // full new content — see cms-adapter.mjs's comment on why

task.qa = runQa(task, task.proposedValue);
console.log(`Fragment: ${fragment}`);
console.log(`QA: ${task.qa.passed ? 'PASS' : 'FAIL'} — ${task.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ') || 'all checks passed'}`);

const existing = await loadTasks(slug);
await saveTasks(slug, [...existing, task]);
await logEvent(slug, { type: 'proposed', taskId: task.taskId, fieldType: task.fieldType, originalLength: task.originalValue.length, proposedLength: task.proposedValue.length, qaPassed: task.qa.passed });

if (!task.qa.passed) {
  console.error('QA failed — stopping before apply (would have needed approval to override, per Level 1 workflow).');
  process.exit(1);
}

// --- Approve (Level 1: Mercedes-only, per §5) + Apply ----------------------
task.approvalState = 'approved';
task.approvedBy = 'mercedes';
task.approvedAt = new Date().toISOString();

await writeField(task, task.proposedValue);
const verifiedValue = await readField(task);
const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);
task.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
await logEvent(slug, { type: 'apply', taskId: task.taskId, fieldType: task.fieldType, verifiedMatch });
console.log(`Applied — verified match: ${verifiedMatch}`);
if (!verifiedValue.includes(fragment.replace(/&/g, '&amp;')) && !verifiedValue.includes(fragment)) {
  console.warn('WARNING: read-back content does not contain the appended fragment in any recognizable form.');
}

async function persist() {
  const merged = await loadTasks(slug);
  const t = merged.find((x) => x.taskId === task.taskId);
  if (t) Object.assign(t, task);
  await saveTasks(slug, merged);
}
await persist();

// --- Rollback + verify ------------------------------------------------------
await writeField(task, task.originalValue);
const rolledBackValue = await readField(task);
const rollbackVerified = valuesMatch(task, task.originalValue, rolledBackValue);
task.rollback.rolledBackAt = new Date().toISOString();
task.rollback.rollbackVerified = rollbackVerified;
await logEvent(slug, { type: 'rollback', taskId: task.taskId, rollbackVerified });
console.log(`Rolled back — verified: ${rollbackVerified}`);
await persist();
