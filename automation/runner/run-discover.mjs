#!/usr/bin/env node
/**
 * Headless Discover-engagement runner.
 *
 * Runs one client's full Discover engagement unattended, per
 * methodology/discover-engine.md's "Automated / Unattended Mode" section
 * (V0.5). Invoked by n8n's "Intake & Kickoff" workflow after a Tally
 * submission has been verified against a paid WooCommerce order (Stripe
 * runs through WooCommerce's own checkout as of 2026-08-24 — see
 * ../stripe-setup.md) and clients/<slug>/discover/input.md has been written.
 *
 * Usage:
 *   node runner/run-discover.mjs <client-slug>
 *
 * Required env (see ../.env.example):
 *   ANTHROPIC_API_KEY
 *   DATAFORSEO_USERNAME, DATAFORSEO_PASSWORD   (only used if DATAFORSEO_ENABLED=true)
 *   DATAFORSEO_ENABLED                          true|false
 *   DATAFORSEO_CALL_CEILING                     integer, default 60
 *   ANTHROPIC_MAX_BUDGET_USD                    float, default 15
 *   N8N_ENGAGEMENT_COMPLETE_WEBHOOK_URL
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { mdToPdf } from 'md-to-pdf';
import { readFile, writeFile, appendFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import { recordRunStarted, recordFailure, recordReadyForReview, setCurrentStep, updateOrder } from '../lib/order-state.mjs';
import { classifyStepFromPath, stepLabel, impliedCompletedSteps, evaluateRunOutcome } from '../lib/discover-completeness.mjs';
import { recordDataForSeoCall, loadDataForSeoCalls } from '../lib/dataforseo-call-log.mjs';
import { syncOrderToWordPress } from '../lib/wp-tracker-sync.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node runner/run-discover.mjs <client-slug>');
  process.exit(1);
}

const engagementDir = path.join(VAULT_DIR, 'clients', slug, 'discover');
const inputPath = path.join(engagementDir, 'input.md');
if (!existsSync(inputPath)) {
  console.error(`No input.md found at ${inputPath}. The Intake & Kickoff n8n workflow must create the client folder and write input.md before invoking this runner.`);
  process.exit(1);
}

const DATAFORSEO_ENABLED = String(process.env.DATAFORSEO_ENABLED).toLowerCase() === 'true';
const DATAFORSEO_CALL_CEILING = parseInt(process.env.DATAFORSEO_CALL_CEILING || '60', 10);
const ANTHROPIC_MAX_BUDGET_USD = parseFloat(process.env.ANTHROPIC_MAX_BUDGET_USD || '15');
const N8N_WEBHOOK = process.env.N8N_ENGAGEMENT_COMPLETE_WEBHOOK_URL;

const logPath = path.join(engagementDir, 'raw', 'agent-run.log');
await mkdir(path.dirname(logPath), { recursive: true });
async function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}\n`;
  process.stdout.write(stamped);
  await appendFile(logPath, stamped);
}

// Best-effort projection of the customer-safe status to WordPress after each
// meaningful order-state transition — see lib/wp-tracker-sync.mjs. Never
// throws (the module itself catches everything); this wrapper only adds a
// run-log line so sync outcomes are visible alongside the rest of the run.
async function syncTracker(reason) {
  const result = await syncOrderToWordPress(slug);
  if (result.ok) {
    await log(`[wp-tracker] synced (${reason}) -> ${result.customerStatus}`);
  } else if (result.skipped) {
    await log(`[wp-tracker] skipped (${reason}): ${result.reason}`);
  } else {
    await log(`[wp-tracker] FAILED (${reason}): ${result.reason || result.error || result.status}`);
  }
}

// --- Canonical order state ---------------------------------------------------
// order.json is the deterministic, application-code-owned record of this
// order's lifecycle (see lib/order-state.mjs's header comment for why this
// exists — mulberry-creek-2, 2026-08-26, got marked ready_for_delivery: true
// off a crashed run because the old logic trusted regex-parsed prose). The
// Claude Agent SDK session below never writes to order.json directly; every
// write in this file happens from runner code, driven by deterministic
// signals (process exit state, which file was just written, file mtimes).
//
// runStartedAt is captured BEFORE the agent starts and is the baseline for
// the stale-artifact freshness check below — report.md/appendix.md are only
// ever trusted as THIS run's output if their mtime is later than this.
const runStartedAt = new Date();
let contact = {};
try {
  contact = JSON.parse(await readFile(path.join(engagementDir, 'contact.json'), 'utf8'));
} catch {
  // contact.json is written by create-engagement.mjs before the runner is
  // ever launched — its absence here would be a real upstream bug, but this
  // runner shouldn't crash over it; order.json just starts with null identity fields.
}
await recordRunStarted(slug, 'discover', {
  orderId: contact.orderId || null,
  orderKey: contact.orderKey || null,
  businessName: contact.businessName || null,
  contactName: contact.contactName || null,
  contactEmail: contact.contactEmail || null,
});
await syncTracker('run_started');

// --- Step observability (best-effort — see discover-completeness.mjs's ------
// impliedCompletedSteps/STEP_FILE_HINTS doc comment for exactly what this
// can and cannot distinguish inside one continuous agent session).
function extractFilePath(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return null;
  return toolInput.file_path || toolInput.path || null;
}
const trackStepFromToolUse = async (input) => {
  if (input.hook_event_name !== 'PreToolUse') return {};
  if (input.tool_name !== 'Write' && input.tool_name !== 'Edit') return {};
  const step = classifyStepFromPath(extractFilePath(input.tool_input));
  if (!step) return {};
  const changed = await setCurrentStep(slug, 'discover', { id: step, label: stepLabel(step) });
  if (changed) {
    const implied = impliedCompletedSteps(step);
    if (implied.length > 0) {
      await updateOrder(slug, 'discover', (order) => {
        order.completedSteps = Array.from(new Set([...(order.completedSteps || []), ...implied]));
      });
    }
    await log(`[order-state] step -> ${step} (${stepLabel(step)})`);
    await syncTracker('step_changed');
  }
  return {};
};

// --- DataForSEO call-ceiling enforcement -----------------------------------
// Automated Mode (discover-engine.md, V0.5) replaces live manual approval of
// data-plan.md with a pre-authorized call ceiling. This hook is the code-level
// enforcement of that ceiling — the model can't just keep calling past it.
let dataforseoCallCount = 0;
let ceilingHit = false;

/** @type {import('@anthropic-ai/claude-agent-sdk').HookCallback} */
const enforceCeiling = async (input) => {
  if (input.hook_event_name !== 'PreToolUse') return {};
  if (!input.tool_name.startsWith('mcp__dataforseo__')) return {};

  dataforseoCallCount += 1;
  if (dataforseoCallCount > DATAFORSEO_CALL_CEILING) {
    ceilingHit = true;
    await log(`DENIED (ceiling): ${input.tool_name} — call #${dataforseoCallCount} exceeds ceiling of ${DATAFORSEO_CALL_CEILING}`);
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `DataForSEO call ceiling (${DATAFORSEO_CALL_CEILING} calls) reached for this automated engagement, ` +
          `per discover-engine.md's Automated/Unattended Mode section. Do not attempt further DataForSEO calls. ` +
          `Mark every remaining uncovered Data Capability "Not Evaluated / Data Required" in findings.md per ` +
          `discover.md's fallback rules, note in status.md that this engagement is ceiling-limited, and proceed ` +
          `to the Final Quality Gate rather than stopping the engagement.`,
      },
    };
  }
  await log(`ALLOWED (${dataforseoCallCount}/${DATAFORSEO_CALL_CEILING}): ${input.tool_name}`);
  return {};
};

// --- DataForSEO structured call recording -----------------------------------
// dataforseo-mcp-server 3.x's mcp__dataforseo__api_request(method, path, data)
// is a generic passthrough — recording it here (PostToolUse, once the real
// response is known) is what lets the Completeness Gate ask "was capability
// X obtained?" instead of regexing for a 2.x tool name that no longer exists.
// A 404/auth error inside a "successful" tool call must not read as success —
// recordDataForSeoCall parses DataForSEO's own status_code out of the
// response body for that reason, not just whether the tool call itself threw.
const recordDataForSeoResult = async (input) => {
  if (input.tool_name !== 'mcp__dataforseo__api_request') return {};
  const { method, path: reqPath } = input.tool_input || {};
  if (input.hook_event_name === 'PostToolUse') {
    const record = await recordDataForSeoCall(engagementDir, { method, path: reqPath, toolResponse: input.tool_response });
    await log(`[dataforseo] ${method} ${reqPath} -> capability=${record.capability} success=${record.success} statusCode=${record.statusCode}`);
  } else if (input.hook_event_name === 'PostToolUseFailure') {
    const record = await recordDataForSeoCall(engagementDir, { method, path: reqPath, harnessError: input.error });
    await log(`[dataforseo] ${method} ${reqPath} -> capability=${record.capability} success=false (harness error: ${input.error})`);
  }
  return {};
};

// --- MCP servers -------------------------------------------------------------
// Pinned to 3.1.1 (2026-08-27) -- npx -y with no version was silently
// resolving to whatever npm's "latest" tag currently points to. The prior
// pin attempt (2.9.11 -- the last version before dataforseo-mcp-server's
// 3.0.0 tool-surface redesign, 2026-08-11) turned out to be a dead end: its
// bundled @modelcontextprotocol/sdk (1.29.0, exact) can no longer complete
// an MCP handshake with the currently-installed @anthropic-ai/claude-agent-sdk
// (confirmed live: 2.9.11 connects with status "failed"; 3.1.1, whose
// @modelcontextprotocol/sdk is ^1.30.0, connects successfully). 3.1.1's tool
// surface is a generic api_request(method,path,data) passthrough, not the
// named per-endpoint tools (serp_locations, kw_data_google_ads_search_volume,
// etc.) data-sources.md was written against -- lib/dataforseo-capability-map.mjs
// bridges that gap by classifying each api_request call's REST path into the
// same logical capabilities the methodology and completeness gate expect, so
// neither had to be rewritten. Do not change this pin without re-verifying
// against that map first -- same class of failure already documented for
// n8nio/n8n:latest in this repo.
const mcpServers = {};
if (DATAFORSEO_ENABLED) {
  if (!process.env.DATAFORSEO_USERNAME || !process.env.DATAFORSEO_PASSWORD) {
    console.error('DATAFORSEO_ENABLED=true but DATAFORSEO_USERNAME/DATAFORSEO_PASSWORD are not set.');
    process.exit(1);
  }
  mcpServers.dataforseo = {
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['-y', 'dataforseo-mcp-server@3.1.1'],
    env: {
      DATAFORSEO_USERNAME: process.env.DATAFORSEO_USERNAME,
      DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD,
    },
  };
}

// --- Task prompt ---------------------------------------------------------
const dataforseoNote = DATAFORSEO_ENABLED
  ? `DataForSEO MCP tools are available, capped at ${DATAFORSEO_CALL_CEILING} paid calls total for this engagement (enforced automatically — you will get a denial with instructions if you hit it).`
  : `DataForSEO is NOT available for this run (unfunded). Every DataForSEO-dependent Data Capability in data-sources.md must be handled via discover.md's "Missing always-required capability" fallback: state the limitation explicitly, mark the affected findings "Not Evaluated / Data Required", and continue. Do not skip those sections — mark them, don't omit them. Lighthouse/performance data must still be gathered, using the free PageSpeed Insights API via WebFetch (per data-sources.md's fallback note) in place of the DataForSEO Lighthouse tool.`;

const prompt = `Read CLAUDE.md, then current-state.md, then methodology/discover-engine.md — in particular its "Automated / Unattended Mode" section — before doing anything else.

Run a complete Discover engagement for clients/${slug}/discover, whose input.md is already populated from client intake. Follow discover-engine.md's 13-step protocol exactly, in Automated Mode:

- ${dataforseoNote}
- No human is present to approve data-plan.md live — Automated Mode's pre-authorized ceiling is your approval. Still write data-plan.md before querying, per Step 3.
- Run the full Opportunity Engine (O1-O10) and every applicable Supporting Audit category (A-N) for the determined mode, per discover.md and report-contract.md. Never silently drop a required section — mark it "Not Evaluated / Data Required" if evidence is unavailable, per report-contract.md's Core Rule and Final Quality Gate.
- Run the Final Quality Gate (Step 12) before finishing. Record its result in status.md.
- Generate report.md and appendix.md from the completed findings.md, structured per report-contract.md, per Step 13.
- Also write clients/${slug}/discover/findings.json: a JSON array with one object per findings.md table row (every row across Categories A-J and the O2/O4/O9/O10 Opportunity Engine tables), using each table's own documented column headers as JSON keys exactly (e.g. {"table":"A","category":"A","finding":"...","recommended_action":"...","evidence":"...","evidence_type":"...","source":"...","confidence":"...","priority":"...","expected_impact":"...","effort":"...","dependencies_limitations":"..."} for an A-J row; O2/O4/O9/O10 rows use their own documented columns the same way, plus "table":"O2"/"O4"/"O9"/"O10"). This is the machine-readable source of truth downstream automation (e.g. the Implementation Agent) consumes instead of re-parsing findings.md or report.md — it must contain every row findings.md contains, exactly, never a summarized or reduced subset.
- Update status.md throughout so it accurately reflects the step reached, ceiling-limited status (if applicable), Quality Gate result, and completion state at the end.

Work autonomously start to finish. Do not stop to ask a question — where the protocol would normally pause for human input, apply Automated Mode's rules instead and keep going. When finished (or if you determine the engagement cannot reasonably continue), stop.`;

// --- Run -------------------------------------------------------------------
await log(`Starting Discover engagement for "${slug}" — DATAFORSEO_ENABLED=${DATAFORSEO_ENABLED}, ceiling=${DATAFORSEO_CALL_CEILING}, budget=$${ANTHROPIC_MAX_BUDGET_USD}`);

let result = { is_error: true, num_turns: 0, total_cost_usd: 0 };
let runError = null;

// The `tools` allowlist governs BOTH built-in tools AND MCP-server tools —
// it's not scoped to built-ins only despite the SDK's own doc comment
// suggesting otherwise. Confirmed the hard way: mulberry-creek-2's real run
// (2026-08-26) had DATAFORSEO_ENABLED=true with real credentials and a
// correctly-built `mcpServers.dataforseo` entry, yet the agent's own
// data-plan.md reported zero mcp__dataforseo__* tools in its actual tool
// set — this array (missing any dataforseo entry) is why. `mcp__<server>`
// (bare, no suffix) is the same server-level wildcard pattern the SDK's
// disallowedTools doc documents for the inverse (blocking) case.
const BASE_TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch'];
const agentTools = DATAFORSEO_ENABLED ? [...BASE_TOOLS, 'mcp__dataforseo'] : BASE_TOOLS;

try {
  const q = query({
    prompt,
    options: {
      cwd: VAULT_DIR,
      tools: agentTools,
      mcpServers,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 250,
      maxBudgetUsd: ANTHROPIC_MAX_BUDGET_USD,
      hooks: {
        PreToolUse: [{ hooks: [enforceCeiling, trackStepFromToolUse] }],
        PostToolUse: [{ hooks: [recordDataForSeoResult] }],
        PostToolUseFailure: [{ hooks: [recordDataForSeoResult] }],
      },
      stderr: (data) => log(`[stderr] ${data}`),
    },
  });

  for await (const message of q) {
    if (message.type === 'result') {
      result = message;
    }
    // Keep a compact trace; full transcripts aren't needed for this audit log.
    if (message.type === 'assistant' || message.type === 'result') {
      await log(`SDK message: ${message.type}${message.subtype ? '/' + message.subtype : ''}`);
    }
  }
} catch (err) {
  runError = err;
  await log(`RUNNER ERROR: ${err?.stack || err}`);
}

await log(`Finished — is_error=${result.is_error}, num_turns=${result.num_turns}, total_cost_usd=${result.total_cost_usd}, dataforseo_calls=${dataforseoCallCount}, ceiling_hit=${ceilingHit}`);

// --- Failure check — deliberately the FIRST thing decided after the run ----
// finishes, and recorded to order.json before completeness parsing, PDF
// readiness, status-markdown interpretation, or the engagement-complete
// notification even run. This is the actual fix for the mulberry-creek-2
// bug (2026-08-26): a crashed/errored run must be structurally incapable of
// reaching any code path that could produce ready_for_delivery: true — not
// just "should" via a downstream flag check.
const runFailed = Boolean(result.is_error || runError);
// One call either way — when runFailed is true this short-circuits before
// touching statusText/queryLogText/etc (all undefined here, which is fine,
// since evaluateRunOutcome never reads them on the failure path). The
// non-failure path re-derives the full outcome below once status.md/
// query-log.md/etc are actually read, but the failure branch's own
// classification never has to happen twice or risk drifting.
if (runFailed) {
  const { failure } = evaluateRunOutcome({ result, runError });
  await log(`RUN FAILED — error class: ${failure.errorClass} — ${failure.message}. Recording order.json failure state before any completeness/PDF/status-markdown handling runs.`);
  await recordFailure(slug, 'discover', failure);
  await syncTracker('run_failed');
}

// --- Stale-artifact protection ----------------------------------------------
// report.md/appendix.md are only ever trusted as THIS run's output if their
// mtime is later than runStartedAt (captured before the agent started).
// Least-fragile mechanism available without asking the methodology/agent to
// embed a run id in markdown — see lib/order-state.mjs's header comment.
async function isFreshArtifact(p) {
  try {
    const st = await stat(p);
    return st.mtimeMs > runStartedAt.getTime();
  } catch {
    return false;
  }
}
const reportFresh = await isFreshArtifact(path.join(engagementDir, 'report.md'));
const appendixFresh = await isFreshArtifact(path.join(engagementDir, 'appendix.md'));
if (!reportFresh) await log('report.md was NOT modified by this run (mtime <= runStartedAt) — treating as a stale artifact from a previous run, not this run\'s output.');
if (!appendixFresh) await log('appendix.md was NOT modified by this run (mtime <= runStartedAt) — treating as a stale artifact from a previous run, not this run\'s output.');

// --- PDF generation ----------------------------------------------------------
// Scrolly SEO brand stylesheet (methodology/report-design-system.md is the
// companion spec the report-writing agent reads; this is the implementation).
// Fonts are embedded as base64 inside the CSS, so no network access is
// required at render time.
const REPORT_STYLESHEET = path.resolve(__dirname, '..', 'report-theme', 'scrolly-report.css');
const displayName = slug
  .split(/[-_]+/)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');
const renderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

async function renderPdf(mdName, pdfName, fresh) {
  const mdPath = path.join(engagementDir, mdName);
  const pdfPath = path.join(engagementDir, pdfName);
  if (!existsSync(mdPath)) {
    await log(`Skipping PDF render — ${mdName} does not exist.`);
    return false;
  }
  if (!fresh) {
    await log(`Skipping PDF render for ${mdName} — stale artifact (not written by this run); rendering it would risk presenting the wrong report as current.`);
    return false;
  }
  try {
    const pdfConfig = {
      dest: pdfPath,
      document_title: `${displayName} — Organic Search Opportunity Report`,
      stylesheet: [REPORT_STYLESHEET],
      pdf_options: {
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.75in', bottom: '0.75in', left: '0.6in', right: '0.6in' },
        displayHeaderFooter: true,
        headerTemplate:
          '<div style="font-family:Arial,sans-serif;font-size:7px;color:#5c6478;width:100%;text-align:center;padding-top:6px;">ScrollySEO | Organic Search Opportunity Report</div>',
        footerTemplate:
          `<div style="font-family:Arial,sans-serif;font-size:7px;color:#5c6478;width:100%;text-align:center;padding-bottom:6px;">${displayName} &bull; Confidential &bull; ${renderDate} &bull; Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      },
    };
    // Puppeteer's own bundled Chromium download is unreliable on this
    // machine (left broken from an unrelated failed npm install sharing the
    // same ~/.cache/puppeteer path) — point at the system's installed Edge
    // instead when present, rather than depending on that download at all.
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (existsSync(edgePath)) {
      pdfConfig.launch_options = { executablePath: edgePath };
    }
    await mdToPdf({ path: mdPath }, pdfConfig);
    await log(`Rendered ${pdfName}`);
    return true;
  } catch (err) {
    await log(`PDF render failed for ${mdName}: ${err?.stack || err}`);
    return false;
  }
}

const reportPdfOk = await renderPdf('report.md', 'report.pdf', reportFresh);
const appendixPdfOk = await renderPdf('appendix.md', 'appendix.pdf', appendixFresh);

// Cost/usage/artifact-path fields are persisted regardless of outcome —
// useful on a failed run too (e.g. "$2.05 spent before hitting the ceiling").
await updateOrder(slug, 'discover', (order) => {
  order.costUsd = result.total_cost_usd ?? order.costUsd;
  order.dataforseoCallsUsed = dataforseoCallCount;
  if (reportPdfOk) order.reportPdfPath = `clients/${slug}/discover/report.pdf`;
  if (appendixPdfOk) order.appendixPdfPath = `clients/${slug}/discover/appendix.pdf`;
});

async function readIfExists(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return '';
  }
}

// --- Completeness parsing — SKIPPED ENTIRELY when the run already failed ---
// (runFailed was decided and recorded to order.json above, before this
// point). This is the literal enforcement of "the failure check must occur
// before completeness parsing / status-markdown interpretation": a failed
// run never calls readIfExists()/parseStatusSignals() on status.md at all.
//
// Per methodology/discover-engine.md's REQUIRED TO SHIP classification —
// see lib/discover-completeness.mjs's evaluateRunOutcome for the actual
// logic (Minimum Paid-Report Completeness Gate, added 2026-08-17, now also
// gated on reportFresh/appendixFresh). Never manufactures data to pass — a
// failed check here means the engagement is genuinely blocked pending
// retry, fallback, or human review.
let outcome;
if (runFailed) {
  outcome = { readyForDelivery: false, engagementStatus: 'FAILED', qualityGateRan: false, completed: false, failedRequired: [] };
} else {
  const statusText = await readIfExists(path.join(engagementDir, 'status.md'));
  const inputText = await readIfExists(path.join(engagementDir, 'input.md'));
  const findingsText = await readIfExists(path.join(engagementDir, 'findings.md'));
  // Structured DataForSEO evidence (dataforseo-calls.ndjson), not query-log.md
  // prose — see dataforseo-call-log.mjs. query-log.md still gets written by
  // the agent as human-readable documentation; it just no longer feeds the gate.
  const dataforseoCalls = await loadDataForSeoCalls(engagementDir);
  outcome = evaluateRunOutcome({ result, runError, statusText, dataforseoCalls, inputText, findingsText, reportFresh, appendixFresh });

  if (!outcome.readyForDelivery) {
    await log(`COMPLETENESS GATE: engagement marked ${outcome.engagementStatus} — ${outcome.failure?.message}. Automatic delivery blocked; human review required. No substitute data was manufactured to pass this gate.`);
    await recordFailure(slug, 'discover', outcome.failure);
    await syncTracker('completeness_gate_failed');
  } else {
    await log('COMPLETENESS GATE: all REQUIRED TO SHIP sources present, Final Quality Gate confirmed run, report/appendix confirmed freshly written by this run — engagement marked COMPLETE, ready for delivery.');
    await recordReadyForReview(slug, 'discover', {
      reportPdfPath: reportPdfOk ? `clients/${slug}/discover/report.pdf` : null,
      appendixPdfPath: appendixPdfOk ? `clients/${slug}/discover/appendix.pdf` : null,
    });
    await syncTracker('ready_for_review');
  }
}

const readyForDelivery = outcome.readyForDelivery;
const engagementStatus = outcome.engagementStatus;
const failedRequired = outcome.failedRequired || [];
const qualityGateRan = outcome.qualityGateRan;
const completed = outcome.completed;

// --- Notify n8n ----------------------------------------------------------
// NOTE: `success` means only "the agent run completed without crashing" —
// it is unchanged from before and must not be repurposed. `ready_for_delivery`
// is the NEW, separate completeness-gate flag: the n8n workflow step that
// actually sends a report to a paying customer must gate on THIS field, not
// `success`. A run can succeed (no crash) and still not be ready_for_delivery
// (a required source failed and no fallback resolved it).
if (N8N_WEBHOOK) {
  try {
    const res = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        success: !result.is_error && !runError,
        ready_for_delivery: readyForDelivery,
        engagement_status: engagementStatus,
        completeness_gate_blocking_reasons: failedRequired,
        num_turns: result.num_turns,
        total_cost_usd: result.total_cost_usd,
        dataforseo_calls_used: dataforseoCallCount,
        dataforseo_call_ceiling: DATAFORSEO_CALL_CEILING,
        ceiling_hit: ceilingHit,
        dataforseo_enabled: DATAFORSEO_ENABLED,
        quality_gate_ran: qualityGateRan,
        completed,
        report_pdf_generated: reportPdfOk,
        appendix_pdf_generated: appendixPdfOk,
        runner_error: runError ? String(runError?.message || runError) : null,
      }),
    });
    await log(`Notified n8n (${N8N_WEBHOOK}) — HTTP ${res.status}`);
  } catch (err) {
    await log(`Failed to notify n8n: ${err?.stack || err}`);
  }
} else {
  await log('N8N_ENGAGEMENT_COMPLETE_WEBHOOK_URL not set — skipping completion webhook.');
}

// Also leave a plain marker file n8n could poll as a fallback if the webhook
// call itself fails (e.g. n8n was down when this run finished).
await writeFile(
  path.join(engagementDir, 'run-result.json'),
  JSON.stringify(
    {
      slug,
      finishedAt: new Date().toISOString(),
      success: !result.is_error && !runError,
      ready_for_delivery: readyForDelivery,
      engagement_status: engagementStatus,
      completeness_gate_blocking_reasons: failedRequired,
      num_turns: result.num_turns,
      total_cost_usd: result.total_cost_usd,
      dataforseo_calls_used: dataforseoCallCount,
      dataforseo_call_ceiling: DATAFORSEO_CALL_CEILING,
      ceiling_hit: ceilingHit,
      dataforseo_enabled: DATAFORSEO_ENABLED,
      quality_gate_ran: qualityGateRan,
      completed,
    },
    null,
    2
  )
);

process.exit(result.is_error || runError ? 1 : 0);
