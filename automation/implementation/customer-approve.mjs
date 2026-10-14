#!/usr/bin/env node
/**
 * Consumes a batch approval token (see mint-batch-approval-token.mjs),
 * single-use, timing-safe compare — same mechanics as
 * automation/n8n/scripts/check-and-consume-token.mjs. On success, flips
 * every task in the batch to approvalState='approved', approvedBy='customer'
 * (Level-1's approve.mjs uses approvedBy='mercedes' — the audit trail
 * should show who actually authorized what, not just that something was
 * approved).
 *
 * A 'plan'-stage consumption does NOT touch task.approvalState — approving
 * the plan authorizes building the draft, not publishing it (§5's rule).
 * Only a 'built_result'-stage consumption flips tasks to approved.
 *
 * Partial approval (§6): pass an optional 5th arg, a JSON map
 * {taskId: 'approve'|'reject'|'revise'} covering exactly the batch's task
 * IDs, to approve/reject/request-revision per task instead of approving
 * the whole batch identically. Omit it to approve everything (default,
 * unchanged from the original all-or-nothing behavior).
 *
 * Usage: node customer-approve.mjs <slug> <batchId> <token> [decisionsJson]
 * stdout: {"valid": true|false, "reason"?: "..."}
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { loadTasks, saveTasks, logEvent } from './lib/snapshot-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const [, , slug, batchId, token, decisionsJson] = process.argv;
if (!slug || !batchId || !token) {
  console.error('Usage: node customer-approve.mjs <slug> <batchId> <token> [decisionsJson]');
  process.exit(1);
}

const VALID_DECISIONS = new Set(['approve', 'reject', 'revise']);
const DECISION_TO_STATE = { approve: 'approved', reject: 'rejected', revise: 'revision_requested' };
let decisions = null;
if (decisionsJson) {
  try {
    decisions = JSON.parse(decisionsJson);
  } catch {
    process.stdout.write(JSON.stringify({ valid: false, reason: 'decisions argument is not valid JSON' }));
    process.exit(0);
  }
}

const recordPath = path.join(VAULT_DIR, 'clients', slug, 'implementation', 'approvals', `${batchId}.json`);
let record;
try {
  record = JSON.parse(await readFile(recordPath, 'utf8'));
} catch {
  process.stdout.write(JSON.stringify({ valid: false, reason: 'no such approval batch' }));
  process.exit(0);
}

if (record.consumedAt) {
  process.stdout.write(JSON.stringify({ valid: false, reason: 'token already consumed (single-use)' }));
  process.exit(0);
}

const a = Buffer.from(record.token);
const b = Buffer.from(token);
const valid = a.length === b.length && timingSafeEqual(a, b);

if (!valid) {
  process.stdout.write(JSON.stringify({ valid: false, reason: 'token mismatch' }));
  process.exit(0);
}

if (decisions) {
  const decisionKeys = Object.keys(decisions);
  const coversExactly = decisionKeys.length === record.taskIds.length && record.taskIds.every((id) => decisionKeys.includes(id));
  const allValidValues = decisionKeys.every((id) => VALID_DECISIONS.has(decisions[id]));
  if (!coversExactly || !allValidValues) {
    process.stdout.write(JSON.stringify({ valid: false, reason: 'decisions map must cover exactly this batch\'s task IDs with valid decisions (approve|reject|revise)' }));
    process.exit(0);
  }
}

record.consumedAt = new Date().toISOString();
record.approvedBy = 'customer';
record.decisions = decisions;
await writeFile(recordPath, JSON.stringify(record, null, 2));
await logEvent(slug, { type: 'customer_batch_approval', batchId, stage: record.stage, level: record.level, taskIds: record.taskIds, decisions });

if (record.stage === 'built_result') {
  const tasks = await loadTasks(slug);
  for (const task of tasks) {
    if (record.taskIds.includes(task.taskId)) {
      const state = decisions ? DECISION_TO_STATE[decisions[task.taskId]] : 'approved';
      task.approvalState = state;
      task.approvedBy = state === 'approved' ? 'customer' : null;
      task.approvedAt = state === 'approved' ? record.consumedAt : null;
    }
  }
  await saveTasks(slug, tasks);
}

process.stdout.write(JSON.stringify({ valid: true, stage: record.stage, taskIds: record.taskIds, decisions }));
