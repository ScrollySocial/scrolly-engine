#!/usr/bin/env node
/**
 * Realistic-scope component 7 test: Level 2/3 customer approval workflow.
 * Synthetic/CLI-level per the documented test plan (no real
 * email/Resend/Tally wiring exists for this product yet — that's real
 * customer-facing infra, out of scope to fake).
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
async function consume(batchId, token) {
  const { stdout } = await run('node', ['implementation/customer-approve.mjs', slug, batchId, token], { cwd: process.cwd() });
  return JSON.parse(stdout);
}

// Reset three real existing tasks to 'pending' so we can prove the flip.
const tasks = await loadTasks(slug);
const testTaskIds = tasks.slice(0, 3).map((t) => t.taskId);
for (const t of tasks) {
  if (testTaskIds.includes(t.taskId)) {
    t.approvalState = 'pending';
    t.approvedBy = null;
    t.approvedAt = null;
  }
}
await saveTasks(slug, tasks);
console.log(`Reset ${testTaskIds.length} tasks to pending for this test.`);

// --- Level 2: single mint/consume, batch flips to approved -----------------
console.log('\n=== Level 2 batch approval ===');
const l2 = await mint(2, 'built_result', testTaskIds);
console.log('Minted token for batch', l2.batchId);
const l2consume1 = await consume(l2.batchId, l2.token);
console.log('First consume:', l2consume1);
const l2consume2 = await consume(l2.batchId, l2.token);
console.log('Second consume attempt (must fail, single-use):', l2consume2);

const afterL2 = await loadTasks(slug);
const allApproved = testTaskIds.every((id) => afterL2.find((t) => t.taskId === id)?.approvalState === 'approved' && afterL2.find((t) => t.taskId === id)?.approvedBy === 'customer');
console.log(`All 3 tasks flipped to approved/customer in one action: ${allApproved}`);
console.log(`Single-use enforced (second consume correctly rejected): ${l2consume2.valid === false && l2consume2.reason.includes('already consumed')}`);

// --- Level 3: plan approval must NOT authorize publication ------------------
console.log('\n=== Level 3 two-stage approval ===');

// Reset again for a clean Level-3 test on the same task set.
const tasks2 = await loadTasks(slug);
for (const t of tasks2) {
  if (testTaskIds.includes(t.taskId)) {
    t.approvalState = 'pending';
    t.approvedBy = null;
  }
}
await saveTasks(slug, tasks2);

// Attempt to skip straight to built_result approval — must be refused.
try {
  await mint(3, 'built_result', testTaskIds);
  console.log('ERROR: minting built_result without a consumed plan approval should have failed but did not.');
} catch (err) {
  console.log(`Skip-ahead correctly refused: ${err.stderr?.trim() || err.message}`);
}

const planToken = await mint(3, 'plan', testTaskIds);
const planConsume = await consume(planToken.batchId, planToken.token);
console.log('Plan-stage consumed:', planConsume);

const afterPlan = await loadTasks(slug);
const stillPending = testTaskIds.every((id) => afterPlan.find((t) => t.taskId === id)?.approvalState === 'pending');
console.log(`Tasks still pending after PLAN approval (not yet publish-authorized): ${stillPending}`);

const builtToken = await mint(3, 'built_result', testTaskIds);
console.log('built_result token minted successfully now that plan is consumed:', !!builtToken.token);
const builtConsume = await consume(builtToken.batchId, builtToken.token);
console.log('built_result consumed:', builtConsume);

const afterBuilt = await loadTasks(slug);
const nowApproved = testTaskIds.every((id) => afterBuilt.find((t) => t.taskId === id)?.approvalState === 'approved');
console.log(`Tasks approved only after BUILT_RESULT approval: ${nowApproved}`);
