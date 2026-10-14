/**
 * Pure-function tests for the fixed completeness/failure logic — no Agent
 * SDK calls, no DataForSEO calls, no filesystem/network access. Exactly the
 * cases the Phase 1 spec asks to demonstrate (A-D), plus one isolating the
 * stale-artifact gate on its own.
 *
 * Run: node --test automation/test  (or `npm test` from automation/)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateRunOutcome, parseStatusSignals } from '../lib/discover-completeness.mjs';
import { classifyEndpoint } from '../lib/dataforseo-capability-map.mjs';

// The literal, untouched engagement-template/status.md content (see
// methodology/engagement-template/status.md) — this is what mulberry-creek-2
// actually had on disk when it crashed.
const TEMPLATE_STATUS_MD = `# Discover Status — <business name>

- Engagement started:
- Mode:
- Step reached (1–13, per discover-engine.md):
- Data plan approved: yes/no
- Queries: see query-log.md (n complete / n planned)
- Opportunity Engine layers complete: O1[ ] O2[ — mark n/a if not geo-bound ] O3[ ] O4[ ] O5[ ] O6[ ] O7[ ] O8[ ] O9[ ] O10[ ]
- Findings by category complete (A–N, Supporting Audit): A[ ] B[ ] C[ ] D[ ] E[ ] F[ ] G[ ] H[ ] I[ ] J[ ] K[ ] L[ ] M[ ] N[ ]
- Final Quality Gate run (report-contract.md, Step 12): yes/no
- Report generated: yes/no (structured per report-contract.md)
- Appendix generated: yes/no
- Completed: yes/no (date)
- Last updated:

A new session resumes here first — jump to the first incomplete step, load only the \`normalized/\` files relevant to remaining work.`;

const REAL_COMPLETED_STATUS_MD = `# Discover Status — Acme Landscaping

- Engagement started: 2026-08-01
- Mode: Mode 1
- Step reached (1–13, per discover-engine.md): 13 — complete
- Final Quality Gate run (report-contract.md, Step 12): yes
- Report generated: yes
- Appendix generated: yes
- Completed: yes
- Last updated: 2026-08-01`;

// A structured dataforseoCalls fixture with every capability required for
// Mode 1 (existing site) — no legacy 2.x tool names anywhere, per Step 8
// Case H's requirement — only v3 REST paths, classified through the same
// dataforseo-capability-map.mjs the real runner uses.
function successCall(cap, capabilityPath) {
  return { at: new Date().toISOString(), method: 'POST', path: capabilityPath, capability: cap, attempted: true, success: true, statusCode: 20000, resultCount: 3, error: null };
}
const ALL_REQUIRED_CALLS_MODE1 = [
  successCall('google_ads_search_volume', '/v3/keywords_data/google_ads/search_volume/live'),
  successCall('bulk_keyword_difficulty', '/v3/dataforseo_labs/google/bulk_keyword_difficulty/live'),
  successCall('domain_intersection', '/v3/dataforseo_labs/google/domain_intersection/live'),
  successCall('backlinks_summary', '/v3/backlinks/summary/live'),
  successCall('ranked_keywords', '/v3/dataforseo_labs/google/ranked_keywords/live'),
  successCall('on_page_content', '/v3/on_page/content_parsing'),
  successCall('on_page_lighthouse', '/v3/on_page/lighthouse/live/json'),
];

// --- Case A: failed AI run --------------------------------------------------
test('Case A — a crashed/errored agent run can never be ready_for_delivery', () => {
  const outcome = evaluateRunOutcome({
    result: { is_error: true, subtype: 'error_max_budget_usd', total_cost_usd: 2.0472715, num_turns: 20 },
    runError: new Error('Claude Code returned an error result: Reached maximum budget ($2)'),
    // Even fully-passing signals are supplied here to prove they're never consulted.
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });

  assert.equal(outcome.runFailed, true);
  assert.equal(outcome.readyForDelivery, false);
  assert.equal(outcome.engagementStatus, 'FAILED');
  assert.ok(outcome.failure, 'failure must be populated');
  assert.equal(outcome.failure.errorClass, 'budget_ceiling');
  assert.equal(outcome.failure.customerActionRequired, false);
  assert.equal(outcome.failure.retryAvailable, true);
});

// --- Case B: stale report/appendix/status artifacts present while the run fails ---
test('Case B — stale artifacts from a previous run cannot cause a failed run to look complete', () => {
  const outcome = evaluateRunOutcome({
    result: { is_error: true, subtype: 'error_max_budget_usd' },
    runError: new Error('Reached maximum budget ($2)'),
    statusText: REAL_COMPLETED_STATUS_MD, // a fully "complete"-looking status.md, left over from an unrelated prior run
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: false, // the key stale-artifact signal: report.md predates this run
    appendixFresh: false,
  });

  assert.equal(outcome.runFailed, true);
  assert.equal(outcome.readyForDelivery, false);
  assert.equal(outcome.engagementStatus, 'FAILED');
});

// --- Case C: blank/template status.md ---------------------------------------
test('Case C — the untouched status.md TEMPLATE ("yes/no" placeholders) does not satisfy completion', () => {
  const { qualityGateRan, completed } = parseStatusSignals(TEMPLATE_STATUS_MD);
  assert.equal(qualityGateRan, false, 'template\'s "yes/no" placeholder must not read as "quality gate ran: yes"');
  assert.equal(completed, false, 'template\'s "yes/no" placeholder must not read as "completed: yes"');

  // End-to-end: a run that otherwise "succeeded" (no crash) but left the
  // template untouched must still not be ready for delivery. This is the
  // exact mulberry-creek-2 combination minus the crash — isolating the
  // regex fix from the runFailed short-circuit tested in A/B.
  const outcome = evaluateRunOutcome({
    result: { is_error: false },
    runError: null,
    statusText: TEMPLATE_STATUS_MD,
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });
  assert.equal(outcome.readyForDelivery, false);
  assert.equal(outcome.engagementStatus, 'INCOMPLETE_REVIEW_REQUIRED');
});

// --- Case D: successful path -------------------------------------------------
test('Case D — a genuinely successful, fresh run with every capability obtained reaches COMPLETE', () => {
  const outcome = evaluateRunOutcome({
    result: { is_error: false, total_cost_usd: 6.4, num_turns: 80 },
    runError: null,
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });

  assert.equal(outcome.runFailed, false);
  assert.equal(outcome.readyForDelivery, true);
  assert.equal(outcome.engagementStatus, 'COMPLETE');
  assert.equal(outcome.failure, null);
});

// --- Stale-artifact gate in isolation (success path, but stale files) -------
test('stale report.md alone blocks delivery even when every other signal passes', () => {
  const outcome = evaluateRunOutcome({
    result: { is_error: false },
    runError: null,
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: false, // only this is wrong
    appendixFresh: true,
  });
  assert.equal(outcome.readyForDelivery, false);
  assert.ok(outcome.failure.message.includes('report.md was not modified by this run'));
});

// --- Step 8 Case H: every required logical source obtained, zero legacy tool names anywhere ---
test('Case H — a fixture with every required capability succeeded passes the DataForSEO portion of the gate with no legacy 2.x tool names anywhere', () => {
  // Prove every record is classified from a REAL v3 REST path via
  // classifyEndpoint — never a hardcoded/asserted capability label sitting
  // disconnected from any actual endpoint. This is the property that
  // actually matters: capability comes from api_request's real `path`
  // argument, not from a legacy MCP tool name ever appearing anywhere
  // (dataforseo-mcp-server 3.x has no such tool names to appear in the
  // first place — there is nothing named e.g. "kw_data_google_ads_search_volume"
  // for prose to even contain any more).
  for (const call of ALL_REQUIRED_CALLS_MODE1) {
    assert.ok(call.path.startsWith('/v3/'), `record path "${call.path}" must be a real v3 REST path, not a legacy tool name`);
    assert.equal(classifyEndpoint(call.method, call.path), call.capability, `fixture capability must match what classifyEndpoint derives from the real path`);
  }

  const outcome = evaluateRunOutcome({
    result: { is_error: false },
    runError: null,
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: ALL_REQUIRED_CALLS_MODE1,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });
  assert.equal(outcome.readyForDelivery, true);
  assert.deepEqual(outcome.failedRequired, []);
});

// --- Step 8 Case I: missing exactly one required capability fails the gate ---
test('Case I — a fixture missing one required logical capability fails the gate', () => {
  const missingBacklinks = ALL_REQUIRED_CALLS_MODE1.filter((c) => c.capability !== 'backlinks_summary');
  const outcome = evaluateRunOutcome({
    result: { is_error: false },
    runError: null,
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: missingBacklinks,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });
  assert.equal(outcome.readyForDelivery, false);
  assert.deepEqual(outcome.failedRequired, ['Backlink baseline']);
});

// --- Required-source failure (agent didn't crash, but a required source did) ---
test('a failed (non-20000) DataForSEO call blocks delivery on an otherwise-clean run', () => {
  const callsWithOneFailure = ALL_REQUIRED_CALLS_MODE1.map((c) =>
    c.capability === 'google_ads_search_volume' ? { ...c, success: false, statusCode: 40501, error: 'Payment Required.' } : c
  );
  const outcome = evaluateRunOutcome({
    result: { is_error: false },
    runError: null,
    statusText: REAL_COMPLETED_STATUS_MD,
    dataforseoCalls: callsWithOneFailure,
    inputText: 'Determined mode: Mode 1',
    findingsText: '',
    reportFresh: true,
    appendixFresh: true,
  });
  assert.equal(outcome.readyForDelivery, false);
  assert.equal(outcome.failure.errorClass, 'completeness_gate_failed');
  assert.ok(outcome.failedRequired.some((r) => r.includes('keyword-demand')));
});
