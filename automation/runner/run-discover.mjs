#!/usr/bin/env node
/**
 * Headless Discover-engagement runner.
 *
 * Runs one client's full Discover engagement unattended, per
 * methodology/discover-engine.md's "Automated / Unattended Mode" section
 * (V0.5). Invoked by n8n's "Intake & Kickoff" workflow after a Tally
 * submission has been verified against a paid Stripe session and
 * clients/<slug>/discover/input.md has been written.
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
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

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

// --- MCP servers -------------------------------------------------------------
const mcpServers = {};
if (DATAFORSEO_ENABLED) {
  if (!process.env.DATAFORSEO_USERNAME || !process.env.DATAFORSEO_PASSWORD) {
    console.error('DATAFORSEO_ENABLED=true but DATAFORSEO_USERNAME/DATAFORSEO_PASSWORD are not set.');
    process.exit(1);
  }
  mcpServers.dataforseo = {
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['-y', 'dataforseo-mcp-server'],
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
- Update status.md throughout so it accurately reflects the step reached, ceiling-limited status (if applicable), Quality Gate result, and completion state at the end.

Work autonomously start to finish. Do not stop to ask a question — where the protocol would normally pause for human input, apply Automated Mode's rules instead and keep going. When finished (or if you determine the engagement cannot reasonably continue), stop.`;

// --- Run -------------------------------------------------------------------
await log(`Starting Discover engagement for "${slug}" — DATAFORSEO_ENABLED=${DATAFORSEO_ENABLED}, ceiling=${DATAFORSEO_CALL_CEILING}, budget=$${ANTHROPIC_MAX_BUDGET_USD}`);

let result = { is_error: true, num_turns: 0, total_cost_usd: 0 };
let runError = null;

try {
  const q = query({
    prompt,
    options: {
      cwd: VAULT_DIR,
      tools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch'],
      mcpServers,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 250,
      maxBudgetUsd: ANTHROPIC_MAX_BUDGET_USD,
      hooks: { PreToolUse: [{ hooks: [enforceCeiling] }] },
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

async function renderPdf(mdName, pdfName) {
  const mdPath = path.join(engagementDir, mdName);
  const pdfPath = path.join(engagementDir, pdfName);
  if (!existsSync(mdPath)) {
    await log(`Skipping PDF render — ${mdName} does not exist.`);
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

const reportPdfOk = await renderPdf('report.md', 'report.pdf');
const appendixPdfOk = await renderPdf('appendix.md', 'appendix.pdf');

// --- Read status.md for the completion summary --------------------------
let statusText = '';
try {
  statusText = await readFile(path.join(engagementDir, 'status.md'), 'utf8');
} catch {
  statusText = '';
}
const qualityGateRan = /Final Quality Gate run.*yes/i.test(statusText);
// \s* alone doesn't span markdown emphasis markers (e.g. "Completed: **yes"),
// which the agent's own status.md writes commonly use — allow optional **.
const completed = /Completed:\s*\*{0,2}\s*yes/i.test(statusText);

// --- Minimum Paid-Report Completeness Gate (added 2026-08-17) ------------
// Per methodology/discover-engine.md's REQUIRED TO SHIP classification.
// Mechanical, conservative check over query-log.md/input.md/findings.md —
// not a re-run of the full Final Quality Gate's judgment (that's Step 12,
// performed by the agent itself), but a hard backstop specifically for the
// failure mode that step is meant to catch but an unattended run could
// still miss: a required source failing silently while the report ships
// anyway. Never manufactures data to pass — a failed check here means the
// engagement is genuinely blocked pending retry, fallback, or human review.
async function readIfExists(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return '';
  }
}

const inputText = await readIfExists(path.join(engagementDir, 'input.md'));
const queryLogText = await readIfExists(path.join(engagementDir, 'query-log.md'));
const findingsText = await readIfExists(path.join(engagementDir, 'findings.md'));

const modeMatch = inputText.match(/Determined mode:\s*Mode\s*(\d)/i);
const mode = modeMatch ? modeMatch[1] : null;
const hasExistingSite = mode === '1';
const isLocalRegional = /service area|physical location/i.test(inputText) && !/national|e-?commerce only/i.test(inputText);

// tool-name -> [label, applies-when] — mirrors data-sources.md's mapping.
// A tool counts as "failed" only if query-log.md logs it with an explicit
// failure marker (402, "FAILED", "error") and no later successful retry of
// the same tool for the same target follows it.
function toolFailed(toolNamePattern) {
  const re = new RegExp(`${toolNamePattern}[^\\n]*(FAILED|402|Payment Required|error)`, 'gi');
  const failures = [...queryLogText.matchAll(re)];
  if (failures.length === 0) return false;
  const successRe = new RegExp(`${toolNamePattern}(?![^\\n]*(FAILED|402|Payment Required|error))`, 'i');
  return !successRe.test(queryLogText);
}

const requiredChecks = [
  ['Geographically appropriate keyword-demand validation', () => !toolFailed('kw_data_google_ads_search_volume')],
  ['Ranking difficulty / SERP competition validation', () => !toolFailed('(bulk_keyword_difficulty|search_intent)')],
  ['Competitor comparison / keyword-gap data', () => !toolFailed('domain_intersection')],
  ['Backlink baseline', () => !toolFailed('backlinks_summary')],
  // TODO (added 2026-08-19, not yet enforced): discover-engine.md's Completeness
  // Gate table now also requires the individual-record backlink endpoint
  // (distinct from the backlinks_summary aggregate above — see
  // methodology/data-sources.md). Not wired in here yet because this session
  // has no DataForSEO access to confirm the real MCP tool name against the
  // live tool list — guessing wrong would silently make this check always
  // fail (or never fire) for every future engagement. Verify the exact name
  // first, then add: ['Backlink individual-record list', () => toolCalled('<verified-name>') && !toolFailed('<verified-name>')]
  // (toolCalled would need to be added alongside toolFailed above — currently
  // only "called and failed" is detected, not "never called at all").
];
if (hasExistingSite) {
  requiredChecks.push(
    ['Current visibility / ranking baseline', () => !toolFailed('ranked_keywords')],
    ['Technical crawl', () => !toolFailed('on_page_content_parsing')],
    [
      'Lighthouse / Core Web Vitals',
      () => !toolFailed('on_page_lighthouse') || /Lighthouse|Core Web Vitals/i.test(findingsText), // 3-tier fallback satisfies this if ANY tier produced real findings
    ]
  );
}
if (isLocalRegional) {
  requiredChecks.push(
    ['GBP category/profile completeness', () => !toolFailed('business_data_google_my_business_info')],
    ['Review analysis', () => !toolFailed('business_data_google_reviews')]
  );
}

const failedRequired = requiredChecks.filter(([, test]) => !test()).map(([label]) => label);
const readyForDelivery = failedRequired.length === 0 && qualityGateRan && completed;
const engagementStatus = readyForDelivery ? 'COMPLETE' : 'INCOMPLETE_REVIEW_REQUIRED';

if (!readyForDelivery) {
  const reasons = [
    ...failedRequired.map((r) => `required source failed: ${r}`),
    !qualityGateRan ? 'Final Quality Gate not confirmed run in status.md' : null,
    !completed ? 'status.md does not confirm Completed: yes' : null,
  ].filter(Boolean);
  await log(`COMPLETENESS GATE: engagement marked INCOMPLETE_REVIEW_REQUIRED — ${reasons.join('; ')}. Automatic delivery blocked; human review required. No substitute data was manufactured to pass this gate.`);
} else {
  await log('COMPLETENESS GATE: all REQUIRED TO SHIP sources present, Final Quality Gate confirmed run, engagement marked COMPLETE — ready for delivery.');
}

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
