#!/usr/bin/env node
/**
 * Reverse an applied task using its stored originalValue snapshot, then
 * verify the reversal via read-back. implementation-agent.md §8: rollback
 * must be exercised and verified, not assumed to work.
 *
 * Usage: node rollback.mjs <client-slug> <taskId>
 */
import { loadTasks, saveTasks, logEvent } from './lib/snapshot-store.mjs';
import { writeField, readField } from './lib/cms-adapter.mjs';
import { valuesMatch } from './lib/compare.mjs';

const [, , slug, taskSelector] = process.argv;
if (!slug || !taskSelector) {
  console.error('Usage: node rollback.mjs <client-slug> <taskId>');
  process.exit(1);
}

const tasks = await loadTasks(slug);
const task = tasks.find((t) => t.taskId === taskSelector || t.taskId.startsWith(taskSelector));
if (!task) {
  console.error('No matching task.');
  process.exit(1);
}
if (!task.rollback.available) {
  console.error('No snapshot available for this task — cannot roll back.');
  process.exit(1);
}
if (!task.apply.applied) {
  console.error('Task was never applied — nothing to roll back.');
  process.exit(1);
}

await writeField(task, task.originalValue);
const verifiedValue = await readField(task);
const rollbackVerified = valuesMatch(task, task.originalValue, verifiedValue);

task.rollback.rolledBackAt = new Date().toISOString();
task.rollback.rollbackVerified = rollbackVerified;

await logEvent(slug, { type: 'rollback', taskId: task.taskId, restoredValue: task.originalValue, verifiedValue, rollbackVerified });
await saveTasks(slug, tasks);

console.log(`${task.taskId.slice(0, 8)} (${task.fieldType}) rolled back to "${task.originalValue}" — verified: ${rollbackVerified}`);
if (!rollbackVerified) {
  console.error('WARNING: rollback verification failed — read-back value does not match the original snapshot.');
  process.exit(1);
}
