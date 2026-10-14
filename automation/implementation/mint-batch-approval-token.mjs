#!/usr/bin/env node
/**
 * Level 2/3 customer approval (implementation-agent.md §5/§6). Reuses the
 * exact single-use-token pattern from automation/n8n/scripts/
 * mint-approve-token.mjs / check-and-consume-token.mjs (built for the
 * audit-report approve-and-send flow) — applied to a BATCH of implementation
 * tasks instead of one report, per §6: "one customer approval can authorize
 * a batch — don't force per-item approval."
 *
 * Level 3's stricter rule (§5): approving the PLAN never by itself
 * authorizes publishing the BUILT result — the customer must see the
 * actual staged output before it goes live. Enforced here, not just
 * procedurally: minting a 'built_result' token for a batch requires that
 * batch's 'plan' token already be consumed. Skipping straight to
 * built_result approval is refused, not just discouraged.
 *
 * Usage: node mint-batch-approval-token.mjs <slug> <level:2|3> <stage:plan|built_result> <taskId1,taskId2,...>
 * stdout: {"token": "...", "batchId": "..."}
 */
import { randomBytes } from 'node:crypto';
import { writeFile, mkdir, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const [, , slug, levelArg, stage, taskIdsArg] = process.argv;
const level = Number(levelArg);
if (!slug || ![2, 3].includes(level) || !['plan', 'built_result'].includes(stage) || !taskIdsArg) {
  console.error('Usage: node mint-batch-approval-token.mjs <slug> <level:2|3> <stage:plan|built_result> <taskId1,taskId2,...>');
  process.exit(1);
}
const taskIds = taskIdsArg.split(',').filter(Boolean);

const approvalsDir = path.join(VAULT_DIR, 'clients', slug, 'implementation', 'approvals');
await mkdir(approvalsDir, { recursive: true });

if (level === 3 && stage === 'built_result') {
  // Enforce §5's rule at the code level: a built_result token for this
  // exact task set may only be minted if a 'plan' token covering the same
  // tasks was already successfully consumed. This is what makes "plan
  // approval never auto-authorizes publication" a guarantee, not a
  // convention someone could accidentally skip.
  const files = await readdir(approvalsDir).catch(() => []);
  let planApproved = false;
  for (const f of files) {
    const record = JSON.parse(await readFile(path.join(approvalsDir, f), 'utf8'));
    if (record.stage === 'plan' && record.level === 3 && record.consumedAt && taskIds.every((id) => record.taskIds.includes(id))) {
      planApproved = true;
      break;
    }
  }
  if (!planApproved) {
    console.error('Refusing to mint a built_result approval token: no consumed plan-stage approval found covering these exact tasks. Mint and consume a plan-stage token first.');
    process.exit(1);
  }
}

const token = randomBytes(24).toString('hex');
const batchId = randomBytes(8).toString('hex');
const record = { batchId, token, slug, level, stage, taskIds, mintedAt: new Date().toISOString(), consumedAt: null, approvedBy: null };
await writeFile(path.join(approvalsDir, `${batchId}.json`), JSON.stringify(record, null, 2));

process.stdout.write(JSON.stringify({ token, batchId }));
