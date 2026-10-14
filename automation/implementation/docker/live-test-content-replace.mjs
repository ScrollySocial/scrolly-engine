#!/usr/bin/env node
/**
 * Realistic-scope component 6 live validation: content_replace (in-place
 * native-content rewrite), gated by BOTH page-builder detection (reused
 * from content_append) AND the uniqueness check (new — see
 * lib/content-replace.mjs). Mirrors live-test-content-append.mjs's
 * structure; also exercises the ambiguous-target refusal case explicitly.
 *
 * Usage: node docker/live-test-content-replace.mjs <page_id> <mode>
 *   mode: "unique" (expect success)  | "ambiguous" (expect refusal, target absent)
 */
import { createTask, markSnapshot } from '../lib/task-schema.mjs';
import { readField, writeField } from '../lib/cms-adapter.mjs';
import { runQa } from '../lib/qa-engine.mjs';
import { saveTasks, loadTasks, logEvent } from '../lib/snapshot-store.mjs';
import { valuesMatch } from '../lib/compare.mjs';
import { isSafeForBodyContentEdit } from '../lib/page-builder-adapter.mjs';
import { computeUniqueReplacement } from '../lib/content-replace.mjs';

const [, , pageId, mode] = process.argv;
if (!pageId || !mode) {
  console.error('Usage: node docker/live-test-content-replace.mjs <page_id> <unique|ambiguous>');
  process.exit(1);
}
const slug = '_impl-agent-live-test';
const targetObjectType = 'page';
const targetObjectId = Number(pageId);

const siteConfig = { baseUrl: process.env.WP_BASE_URL, wpUser: process.env.WP_APP_USER, wpAppPassword: process.env.WP_APP_PASSWORD };

const REPLACE_TARGET =
  mode === 'unique'
    ? 'serving Wills Point, Texas and the surrounding area'
    : 'this exact phrase does not exist anywhere in the page content'; // 0 occurrences — deliberately ambiguous/absent case
const REPLACE_WITH = 'proudly serving Wills Point, Texas, Terrell, and the greater Van Zandt County area';

const task = createTask({
  engagementSlug: slug,
  path: 'auto_implementable',
  fieldType: 'content_replace',
  targetSite: siteConfig.baseUrl,
  targetObjectType,
  targetObjectId,
  targetField: 'content',
  sourceFindingRef: { table: 'synthetic-content-replace-live-test', index: 0 },
  rationale: 'Expand the stated service area to match the confirmed multi-market findings (Category A/C) rather than naming Wills Point only.',
});
task.replaceTarget = REPLACE_TARGET;
task.replaceWith = REPLACE_WITH;

// --- Gate 1: page-builder detection (reused from content_append) ----------
const safeBuilder = await isSafeForBodyContentEdit(siteConfig, task);
if (!safeBuilder) {
  console.log(`Page ${targetObjectId} is page-builder-controlled — routing to Path 2. No task created, no write attempted. Gate worked correctly.`);
  process.exit(0);
}

// --- Gate 2: uniqueness check (new for content_replace) --------------------
task.originalValue = await readField(task);
markSnapshot(task, task.originalValue);

const computed = computeUniqueReplacement(task.originalValue, REPLACE_TARGET, REPLACE_WITH);
if (computed === null) {
  console.log(`Target text is not uniquely present in page ${targetObjectId}'s content (0 or 2+ occurrences) — routing to Path 2 instead of guessing. No task created, no write attempted. Gate worked correctly.`);
  process.exit(0);
}
console.log(`Page ${targetObjectId}: target text found exactly once — safe to proceed with Path 1 auto-apply.`);
task.proposedValue = computed;

// --- QA, approve, apply, verify ---------------------------------------------
task.qa = runQa(task, task.proposedValue);
console.log(`QA: ${task.qa.passed ? 'PASS' : 'FAIL'} — ${task.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ') || 'all checks passed'}`);

const existing = await loadTasks(slug);
await saveTasks(slug, [...existing, task]);
await logEvent(slug, { type: 'proposed', taskId: task.taskId, fieldType: task.fieldType, replaceTarget: REPLACE_TARGET, qaPassed: task.qa.passed });

if (!task.qa.passed) {
  console.error('QA failed — stopping before apply.');
  process.exit(1);
}

task.approvalState = 'approved';
task.approvedBy = 'mercedes';
task.approvedAt = new Date().toISOString();

await writeField(task, task.proposedValue);
const verifiedValue = await readField(task);
const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);
task.apply = { applied: true, appliedAt: new Date().toISOString(), writeOk: true, verifiedAt: new Date().toISOString(), verifiedValue, verifiedMatch };
await logEvent(slug, { type: 'apply', taskId: task.taskId, fieldType: task.fieldType, verifiedMatch });
console.log(`Applied — verified match: ${verifiedMatch}`);
console.log(`New content contains replacement text: ${verifiedValue.includes(REPLACE_WITH)}`);
console.log(`Rest of content intact (contains unrelated later sentence): ${verifiedValue.includes('landscape design and installation services')}`);

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
