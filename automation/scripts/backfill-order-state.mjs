#!/usr/bin/env node
/**
 * One-time/rare dev utility: reconstructs clients/<slug>/order.json for a
 * Discover engagement that ran BEFORE order.json existed, using whatever
 * deterministic evidence is still on disk (contact.json, run-result.json,
 * raw/agent-run.log, file mtimes) — never by re-running the engagement.
 *
 * Deliberately reuses the exact same evaluateRunOutcome() from
 * lib/discover-completeness.mjs that a live run now uses, fed with
 * historical inputs — so a backfilled record reflects the FIXED logic, not
 * a re-implementation of it. For mulberry-creek-2 specifically this also
 * doubles as a real-world confirmation of the fix: replaying the actual
 * on-disk evidence through evaluateRunOutcome produces readyForDelivery:
 * false, where the pre-fix runner had produced true.
 *
 * Mirrors implementation/scripts/backfill-findings-json.mjs's role/shape —
 * a one-off reconstruction tool, not part of the production run path.
 *
 * Usage: node scripts/backfill-order-state.mjs <client-slug>
 */
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { recordRunStarted, recordFailure, recordReadyForReview, updateOrder } from '../lib/order-state.mjs';
import { evaluateRunOutcome, impliedCompletedSteps } from '../lib/discover-completeness.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/backfill-order-state.mjs <client-slug>');
  process.exit(1);
}

const engagementDir = path.join(VAULT_DIR, 'clients', slug, 'discover');
async function readIfExists(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return '';
  }
}
async function readJsonIfExists(p) {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return null;
  }
}
async function mtimeOf(p) {
  try {
    return (await stat(p)).mtimeMs;
  } catch {
    return null;
  }
}

const contact = (await readJsonIfExists(path.join(engagementDir, 'contact.json'))) || {};
const oldRunResult = await readJsonIfExists(path.join(engagementDir, 'run-result.json'));
const agentLog = await readIfExists(path.join(engagementDir, 'raw', 'agent-run.log'));

// runStartedAt didn't exist as a recorded field before order.json — the best
// available proxy is the runner's own first log line for this run. Approximate,
// stated as such (not presented as an exact captured timestamp).
const startMatch = agentLog.match(/^\[([^\]]+)]\s+Starting Discover engagement/m);
const runStartedAtApprox = startMatch ? new Date(startMatch[1]) : null;
if (!runStartedAtApprox) {
  console.error(`Could not find a "Starting Discover engagement" line in raw/agent-run.log for "${slug}" — refusing to guess a run-start time.`);
  process.exit(1);
}

// Reconstruct a result/runError pair equivalent to what the live runner
// would have had, from the log's own recorded lines — same subtype-matching
// evaluateRunOutcome/classifyDiscoverFailure already do live.
const errorLineMatch = agentLog.match(/^\[[^\]]+]\s+RUNNER ERROR:\s+(.+)$/m);
const subtypeMatch = agentLog.match(/SDK message: result\/(\S+)/);
const result = {
  is_error: Boolean(oldRunResult && oldRunResult.success === false),
  subtype: subtypeMatch ? subtypeMatch[1] : undefined,
  num_turns: oldRunResult?.num_turns ?? null,
  total_cost_usd: oldRunResult?.total_cost_usd ?? null,
};
const runError = errorLineMatch ? new Error(errorLineMatch[1].split('\n')[0]) : null;

const reportFresh = (await mtimeOf(path.join(engagementDir, 'report.md'))) > runStartedAtApprox.getTime();
const appendixFresh = (await mtimeOf(path.join(engagementDir, 'appendix.md'))) > runStartedAtApprox.getTime();

const statusText = await readIfExists(path.join(engagementDir, 'status.md'));
const inputText = await readIfExists(path.join(engagementDir, 'input.md'));
const queryLogText = await readIfExists(path.join(engagementDir, 'query-log.md'));
const findingsText = await readIfExists(path.join(engagementDir, 'findings.md'));

await recordRunStarted(slug, 'discover', {
  orderId: contact.orderId || null,
  orderKey: contact.orderKey || null,
  businessName: contact.businessName || null,
  contactName: contact.contactName || null,
  contactEmail: contact.contactEmail || null,
});
await updateOrder(slug, 'discover', (order) => {
  order.timestamps.runStartedAt = runStartedAtApprox.toISOString();
  order.costUsd = result.total_cost_usd;
  order.dataforseoCallsUsed = oldRunResult?.dataforseo_calls_used ?? null;
  order.notes.push(
    `Backfilled ${new Date().toISOString()} from historical evidence (contact.json, run-result.json, raw/agent-run.log, file mtimes) — this engagement ran before order.json/step-tracking hooks existed, so currentStep/lastCheckpoint below are inferred from which files exist and their mtimes, NOT from live per-step observation. runStartedAt is approximate (parsed from agent-run.log's first line, not a recorded field).`
  );
});

// Best-effort last checkpoint: findings.md existing + fresh-relative-to-run
// is the most advanced artifact this run actually produced (no normalized/
// dir exists, and report.md/appendix.md are confirmed stale, i.e. NOT
// written by this run) — see STEP_FILE_HINTS in discover-completeness.mjs.
const findingsMtimeMs = await mtimeOf(path.join(engagementDir, 'findings.md'));
const findingsWrittenThisRun = findingsMtimeMs > runStartedAtApprox.getTime();
if (findingsWrittenThisRun) {
  const reachedStep = 'step_9_structured_records';
  await updateOrder(slug, 'discover', (order) => {
    order.completedSteps = Array.from(new Set([...(order.completedSteps || []), ...impliedCompletedSteps(reachedStep)]));
    order.lastCheckpoint = { step: reachedStep, at: new Date(findingsMtimeMs).toISOString(), approximate: true };
  });
}

const outcome = evaluateRunOutcome({ result, runError, statusText, queryLogText, inputText, findingsText, reportFresh, appendixFresh });

if (outcome.runFailed || !outcome.readyForDelivery) {
  await recordFailure(slug, 'discover', outcome.failure);
} else {
  await recordReadyForReview(slug, 'discover', {
    reportPdfPath: reportFresh && existsSync(path.join(engagementDir, 'report.pdf')) ? `clients/${slug}/discover/report.pdf` : null,
    appendixPdfPath: appendixFresh && existsSync(path.join(engagementDir, 'appendix.pdf')) ? `clients/${slug}/discover/appendix.pdf` : null,
  });
}

console.log(
  JSON.stringify(
    {
      slug,
      runStartedAtApprox: runStartedAtApprox.toISOString(),
      reportFresh,
      appendixFresh,
      outcome: { runFailed: outcome.runFailed, readyForDelivery: outcome.readyForDelivery, engagementStatus: outcome.engagementStatus, failure: outcome.failure },
    },
    null,
    2
  )
);
