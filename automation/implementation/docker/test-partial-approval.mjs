#!/usr/bin/env node
/**
 * Realistic-scope component 8 test: partial approval / revision handling.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadTasks, saveTasks } from '../lib/snapshot-store.mjs';

const run = promisify(execFile);
const slug = '_impl-agent-live-test';

async function mint(level, stage, taskIds) {
  const { stdout } = await run('node', ['implementation/mint-batch-approval-token.mjs', slug, String(level), stage, taskIds.join(',')], { cwd: process.cwd() });
  return JSON.parse(stdout);
}
async function consume(batchId, token, decisions) {
  const args = ['implementation/customer-approve.mjs', slug, batchId, token];
  if (decisions) args.push(JSON.stringify(decisions));
  const { stdout } = await run('node', args, { cwd: process.cwd() });
  return JSON.parse(stdout);
}
async function revise(taskId, newValue) {
  const { stdout } = await run('node', ['implementation/revise-task.mjs', slug, taskId, newValue], { cwd: process.cwd() });
  return stdout;
}

const allTasks = await loadTasks(slug);
const [taskA, taskB, taskC] = allTasks.slice(0, 3);
const testIds = [taskA.taskId, taskB.taskId, taskC.taskId];

for (const t of allTasks) {
  if (testIds.includes(t.taskId)) { t.approvalState = 'pending'; t.approvedBy = null; t.approvedAt = null; }
}
await saveTasks(slug, allTasks);
console.log(`Reset ${testIds.length} tasks to pending.`);

// --- Partial approval: approve A, reject B, revise C -----------------------
const l2 = await mint(2, 'built_result', testIds);
const decisions = { [taskA.taskId]: 'approve', [taskB.taskId]: 'reject', [taskC.taskId]: 'revise' };
const result = await consume(l2.batchId, l2.token, decisions);
console.log('Partial approval result:', result);

const afterPartial = await loadTasks(slug);
const stateOf = (id) => afterPartial.find((t) => t.taskId === id).approvalState;
console.log(`A approved: ${stateOf(taskA.taskId) === 'approved'}`);
console.log(`B rejected: ${stateOf(taskB.taskId) === 'rejected'}`);
console.log(`C revision_requested: ${stateOf(taskC.taskId) === 'revision_requested'}`);

// Snapshot A and B's full state before revising C, to prove isolation.
const beforeReviseA = JSON.stringify(afterPartial.find((t) => t.taskId === taskA.taskId));
const beforeReviseB = JSON.stringify(afterPartial.find((t) => t.taskId === taskB.taskId));

// --- Revise C only -----------------------------------------------------
const newValue = 'A genuinely revised proposed value for testing isolation.';
const reviseOutput = await revise(taskC.taskId, newValue);
console.log(reviseOutput.trim());

const afterRevise = await loadTasks(slug);
const afterReviseA = JSON.stringify(afterRevise.find((t) => t.taskId === taskA.taskId));
const afterReviseB = JSON.stringify(afterRevise.find((t) => t.taskId === taskB.taskId));
console.log(`Task A untouched by revising C: ${beforeReviseA === afterReviseA}`);
console.log(`Task B untouched by revising C: ${beforeReviseB === afterReviseB}`);
console.log(`Task C back to pending: ${afterRevise.find((t) => t.taskId === taskC.taskId).approvalState === 'pending'}`);
console.log(`Task C has the new proposed value: ${afterRevise.find((t) => t.taskId === taskC.taskId).proposedValue === newValue}`);

// --- Re-approve just C, without ever re-running propose.mjs -----------------
const l2c = await mint(2, 'built_result', [taskC.taskId]);
const finalResult = await consume(l2c.batchId, l2c.token);
console.log('Final re-approval of C:', finalResult);
const finalTasks = await loadTasks(slug);
console.log(`Task C now approved: ${finalTasks.find((t) => t.taskId === taskC.taskId).approvalState === 'approved'}`);
