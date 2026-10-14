#!/usr/bin/env node
/**
 * Level 1 approval (implementation-agent.md §5): Mercedes approves/rejects
 * directly — no customer-facing token needed for this level. The
 * token/email flow (§6) is reused for Level 2/3 customer approval later;
 * building it now would be work Checkpoint 1 doesn't need.
 *
 * Usage:
 *   node approve.mjs <client-slug> all approve
 *   node approve.mjs <client-slug> <taskId> approve|reject
 */
import { loadTasks, saveTasks, logEvent } from './lib/snapshot-store.mjs';

const [, , slug, taskSelector, decision] = process.argv;
if (!slug || !taskSelector || !['approve', 'reject'].includes(decision)) {
  console.error('Usage: node approve.mjs <client-slug> <taskId|all> approve|reject');
  process.exit(1);
}

const tasks = await loadTasks(slug);
const targets = taskSelector === 'all' ? tasks : tasks.filter((t) => t.taskId === taskSelector || t.taskId.startsWith(taskSelector));

if (targets.length === 0) {
  console.error('No matching task(s).');
  process.exit(1);
}

for (const task of targets) {
  if (task.qa.passed === false && decision === 'approve') {
    console.warn(`Skipping ${task.taskId.slice(0, 8)} — QA failed, cannot approve. Fix and re-propose first.`);
    continue;
  }
  task.approvalState = decision === 'approve' ? 'approved' : 'rejected';
  task.approvedBy = 'mercedes';
  task.approvedAt = new Date().toISOString();
  await logEvent(slug, { type: 'approval', taskId: task.taskId, decision: task.approvalState });
  console.log(`${task.taskId.slice(0, 8)} (${task.fieldType}) -> ${task.approvalState}`);
}

await saveTasks(slug, tasks);
