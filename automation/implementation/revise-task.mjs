#!/usr/bin/env node
/**
 * §6 partial-approval/revision: revise ONE task that's in
 * approvalState='revision_requested' with a new proposed value, re-run QA,
 * reset to 'pending' for re-review. Touches only this task — never re-runs
 * propose.mjs or regenerates anything else in the batch. This IS the "continue
 * without rerunning the entire implementation job" requirement, not just a
 * description of it.
 *
 * Usage: node revise-task.mjs <slug> <taskId> <newProposedValue>
 */
import { loadTasks, saveTasks, logEvent } from './lib/snapshot-store.mjs';
import { runQa } from './lib/qa-engine.mjs';

const [, , slug, taskId, newProposedValue] = process.argv;
if (!slug || !taskId || newProposedValue === undefined) {
  console.error('Usage: node revise-task.mjs <slug> <taskId> <newProposedValue>');
  process.exit(1);
}

const tasks = await loadTasks(slug);
const task = tasks.find((t) => t.taskId === taskId || t.taskId.startsWith(taskId));
if (!task) {
  console.error('No matching task.');
  process.exit(1);
}
if (task.approvalState !== 'revision_requested') {
  console.error(`Task ${task.taskId.slice(0, 8)} is not in 'revision_requested' state (currently '${task.approvalState}') — refusing to revise a task nobody asked to revise.`);
  process.exit(1);
}

task.proposedValue = newProposedValue;
task.qa = runQa(task, newProposedValue);
task.approvalState = 'pending';
task.approvedBy = null;
task.approvedAt = null;

await saveTasks(slug, tasks);
await logEvent(slug, { type: 'task_revised', taskId: task.taskId, newProposedValue, qaPassed: task.qa.passed });

console.log(`${task.taskId.slice(0, 8)} revised — QA ${task.qa.passed ? 'PASS' : 'FAIL'} — state reset to 'pending' for re-review.`);
