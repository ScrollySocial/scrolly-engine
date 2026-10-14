/**
 * Discover-pipeline-specific step mapping + the (now failure-first,
 * freshness-gated) ready-for-delivery decision.
 *
 * `evaluateRunOutcome` is the fixed version of the logic that used to live
 * inline at the tail of runner/run-discover.mjs. It is a pure function
 * (no filesystem/network access) specifically so it can be unit-tested
 * against fixtures without spending a cent on the Agent SDK or DataForSEO —
 * see automation/test/discover-completeness.test.mjs.
 *
 * Does NOT change methodology/discover-engine.md's 13-step protocol —
 * DISCOVER_STEPS below is just that protocol's steps given stable,
 * machine-readable ids.
 */

import { capabilitySucceeded } from './dataforseo-call-log.mjs';

// discover-engine.md's "Step-by-Step Protocol" (steps 1-13), unchanged.
export const DISCOVER_STEPS = [
  { id: 'step_1_validate_inputs', label: 'Validating & normalizing inputs' },
  { id: 'step_2_determine_mode', label: 'Determining engagement mode' },
  { id: 'step_3_data_plan', label: 'Drafting data plan' },
  { id: 'step_4_geo_screening', label: 'Geographic opportunity screening' },
  { id: 'step_5_query_sources', label: 'Collecting external data (SERP, keywords, crawl, etc.)' },
  { id: 'step_6_keyword_universe', label: 'Building keyword universe & clusters' },
  { id: 'step_7_organic_landscape', label: 'Analyzing organic landscape & competitors' },
  { id: 'step_8_analyze_evidence', label: 'Analyzing evidence (technical / AI-discovery)' },
  { id: 'step_9_structured_records', label: 'Writing structured findings' },
  { id: 'step_10_prioritize', label: 'Prioritizing findings' },
  { id: 'step_11_finalize_findings', label: 'Finalizing structured analysis' },
  { id: 'step_12_quality_gate', label: 'Running Final Quality Gate' },
  { id: 'step_13_derive_outputs', label: 'Generating report & appendix' },
];
const STEP_BY_ID = new Map(DISCOVER_STEPS.map((s) => [s.id, s]));
export function stepLabel(id) {
  return STEP_BY_ID.get(id)?.label || id;
}

/**
 * KNOWN LIMITATION (documented per the phase spec, not silently accepted):
 * Discover runs as ONE continuous Claude Agent SDK session covering all 13
 * protocol steps — the SDK gives no native mid-session checkpoint. The only
 * observation channel available without changing the methodology itself is
 * *which file the agent is about to Write/Edit*, via the same PreToolUse
 * hook mechanism already used for the DataForSEO ceiling.
 *
 * That gives real, deterministic (not prose-parsed) but COARSE step
 * observability:
 *  - Steps that produce a distinctly-named artifact (data-plan.md,
 *    query-log.md, specific normalized/*.md files, findings.md, report.md,
 *    appendix.md) are individually detectable.
 *  - Steps 1-2 (validate inputs / determine mode) both write into input.md
 *    and are NOT distinguishable from the file path alone — both map to
 *    step_1_validate_inputs; step_2 is inferred as complete only once a
 *    later step's file appears.
 *  - Steps 9-11 (structured records / prioritize / finalize findings) all
 *    write into the same findings.md and are NOT distinguishable from each
 *    other — all map to step_9_structured_records.
 *  - Step 12 (Final Quality Gate) produces no artifact of its own — it's a
 *    self-check against already-written findings.md. It cannot be observed
 *    directly; it is only ever inferred retroactively (see
 *    `backfillImpliedSteps` below) once report.md/appendix.md writes begin.
 *  - An engagement-specific normalized/*.md file this map doesn't recognize
 *    (e.g. a one-off "multimarket-local-search.md") returns null rather
 *    than guessing — no step change is recorded for it. This under-reports
 *    rather than fabricates.
 *
 * This is "the most reliable level of observability available now," not
 * exact protocol-step granularity — see the Phase 1 report's Remaining
 * Limitations section for the full caveat.
 */
const STEP_FILE_HINTS = [
  { re: /(^|[/\\])input\.md$/, step: 'step_1_validate_inputs' },
  { re: /(^|[/\\])data-plan\.md$/, step: 'step_3_data_plan' },
  { re: /normalized[/\\]geographic-screening\.md$/, step: 'step_4_geo_screening' },
  { re: /(^|[/\\])query-log\.md$/, step: 'step_5_query_sources' },
  { re: /(^|[/\\])raw[/\\]/, step: 'step_5_query_sources' },
  { re: /normalized[/\\](keyword-universe|content-topics)\.md$/, step: 'step_6_keyword_universe' },
  { re: /normalized[/\\](current-capture|serp-competitors|authority|competitor-site-evidence)\.md$/, step: 'step_7_organic_landscape' },
  { re: /normalized[/\\]technical\.md$/, step: 'step_8_analyze_evidence' },
  { re: /(^|[/\\])findings\.md$/, step: 'step_9_structured_records' },
  { re: /(^|[/\\])report\.md$/, step: 'step_13_derive_outputs' },
  { re: /(^|[/\\])appendix\.md$/, step: 'step_13_derive_outputs' },
];

/** @returns {string|null} a DISCOVER_STEPS id, or null if the path isn't a recognized checkpoint marker (never guessed). */
export function classifyStepFromPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const normalized = filePath.replace(/\\/g, '/');
  for (const { re, step } of STEP_FILE_HINTS) {
    if (re.test(normalized)) return step;
  }
  return null;
}

/**
 * When a later step's artifact appears, every step BEFORE it in
 * DISCOVER_STEPS's fixed order must, per the protocol's own stated
 * dependencies (discover-engine.md's steps build on each other in order),
 * have already happened — record them as completed too, rather than
 * leaving gaps that look like they were skipped. Step 12 (no artifact of
 * its own) is included here specifically because this is the only way it
 * is ever marked at all — see the limitation note above.
 */
export function impliedCompletedSteps(reachedStepId) {
  const idx = DISCOVER_STEPS.findIndex((s) => s.id === reachedStepId);
  if (idx === -1) return [];
  return DISCOVER_STEPS.slice(0, idx).map((s) => s.id);
}

// --- Failure taxonomy -------------------------------------------------------
// Small and extensible by design (per the phase spec) — add a case, don't
// restructure the shape.
export function classifyDiscoverFailure({ result, runError, failedRequired } = {}) {
  if (runError) {
    const msg = String(runError?.message || runError);
    if (result?.subtype === 'error_max_budget_usd' || /reached maximum budget/i.test(msg)) {
      return { errorClass: 'budget_ceiling', message: msg, retryAvailable: true, customerActionRequired: false };
    }
    if (/dataforseo/i.test(msg) && /(402|payment required)/i.test(msg)) {
      return { errorClass: 'dataforseo_billing', message: msg, retryAvailable: false, customerActionRequired: false };
    }
    if (/(timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED)/i.test(msg)) {
      return { errorClass: 'api_timeout', message: msg, retryAvailable: true, customerActionRequired: false };
    }
    return { errorClass: 'runner_crash', message: msg, retryAvailable: true, customerActionRequired: false };
  }
  if (result?.is_error) {
    if (result.subtype === 'error_max_budget_usd') {
      return {
        errorClass: 'budget_ceiling',
        message: `Reached maximum Anthropic budget for this engagement (cost at stop: $${result.total_cost_usd ?? 'unknown'}).`,
        retryAvailable: true,
        customerActionRequired: false,
      };
    }
    return {
      errorClass: 'unknown_agent_error',
      message: `Agent SDK returned an error result (subtype: ${result.subtype || 'unknown'}).`,
      retryAvailable: true,
      customerActionRequired: false,
    };
  }
  if (failedRequired && failedRequired.length > 0) {
    return {
      errorClass: 'completeness_gate_failed',
      message: `Required source(s) failed or were never captured: ${failedRequired.join('; ')}`,
      retryAvailable: true,
      customerActionRequired: false,
    };
  }
  return null; // no failure
}

// --- Completeness regexes ---------------------------------------------------
// Fixed 2026-08-26: the ORIGINAL regexes (/Completed:\s*\*{0,2}\s*yes/i etc.)
// matched against the untouched engagement-template's own placeholder text
// ("Completed: yes/no (date)", "Final Quality Gate run ...: yes/no") because
// "yes" is a literal substring of "yes/no". A negative lookahead blocking
// "yes" immediately followed by "/no" closes that specific hole. This is
// still prose-regex parsing (kept as a secondary, ANDed signal — see
// evaluateRunOutcome, which does NOT let this alone flip readyForDelivery
// true) rather than a deterministic source, per the "prefer deterministic
// signals wherever reasonably possible" instruction — the deterministic
// primary gates are runFailed and artifact freshness, below.
const QUALITY_GATE_RAN_RE = /Final Quality Gate run[^\n]*:\s*\*{0,2}\s*yes\b(?!\s*\/\s*no)/i;
const COMPLETED_RE = /Completed:\s*\*{0,2}\s*yes\b(?!\s*\/\s*no)/i;

export function parseStatusSignals(statusText) {
  return {
    qualityGateRan: QUALITY_GATE_RAN_RE.test(statusText || ''),
    completed: COMPLETED_RE.test(statusText || ''),
  };
}

/**
 * The Minimum Paid-Report Completeness Gate, per discover-engine.md.
 *
 * Source-detection was rewritten 2026-08-27 to stop depending on 2.x
 * DataForSEO tool names appearing in query-log.md prose (dataforseo-mcp-server
 * 3.x has no such names — see dataforseo-capability-map.mjs). `dataforseoCalls`
 * is the structured, already-loaded array from dataforseo-call-log.mjs
 * (loadDataForSeoCalls) — each required capability now needs an actual
 * recorded SUCCESS, not merely "no failure logged." This is a deliberate
 * correctness fix, not a new requirement: the old regex-based `toolFailed()`
 * treated "never called at all" the same as "passed" (a known, previously
 * documented gap — see the TODO this replaced), which meant a DataForSEO-disabled
 * or silently-broken run could sail through this gate showing zero failures.
 * A 404 or auth/billing error, or a capability that was simply never
 * attempted, now both correctly fail their check — neither satisfies a
 * required source. Only DataForSEO source-detection changed; the
 * non-DataForSEO checks (mode detection, local/regional detection, the
 * Lighthouse free-fallback text check) are unchanged.
 */
export function runRequiredChecks({ dataforseoCalls, inputText, findingsText }) {
  const modeMatch = (inputText || '').match(/Determined mode:\s*Mode\s*(\d)/i);
  const mode = modeMatch ? modeMatch[1] : null;
  const hasExistingSite = mode === '1';
  const isLocalRegional = /service area|physical location/i.test(inputText || '') && !/national|e-?commerce only/i.test(inputText || '');

  const calls = dataforseoCalls || [];
  function capabilityOk(...capabilities) {
    return capabilities.some((cap) => capabilitySucceeded(calls, cap));
  }

  const requiredChecks = [
    ['Geographically appropriate keyword-demand validation', () => capabilityOk('google_ads_search_volume')],
    ['Ranking difficulty / SERP competition validation', () => capabilityOk('bulk_keyword_difficulty', 'search_intent')],
    ['Competitor comparison / keyword-gap data', () => capabilityOk('domain_intersection')],
    ['Backlink baseline', () => capabilityOk('backlinks_summary')],
  ];
  if (hasExistingSite) {
    requiredChecks.push(
      ['Current visibility / ranking baseline', () => capabilityOk('ranked_keywords')],
      ['Technical crawl', () => capabilityOk('on_page_content')],
      ['Lighthouse / Core Web Vitals', () => capabilityOk('on_page_lighthouse') || /Lighthouse|Core Web Vitals/i.test(findingsText || '')]
    );
  }
  if (isLocalRegional) {
    requiredChecks.push(
      ['GBP category/profile completeness', () => capabilityOk('business_gbp_profile')],
      ['Review analysis', () => capabilityOk('business_reviews')]
    );
  }

  return requiredChecks.filter(([, test]) => !test()).map(([label]) => label);
}

/**
 * THE central fix. Order of operations matters and is enforced structurally,
 * not just by convention:
 *   1. runFailed (result.is_error / runError) is checked FIRST. If true,
 *      completeness parsing, status.md interpretation, and required-source
 *      checks are skipped entirely — a failed run cannot reach any code
 *      path that could produce readyForDelivery: true.
 *   2. Even for a non-failed run, readyForDelivery additionally requires
 *      reportFresh && appendixFresh (this run's own process, not a stale
 *      leftover, wrote them — see run-discover.mjs's mtime check) — this is
 *      what makes the exact mulberry-creek-2 scenario (crash + stale
 *      Aug-10 report.md) impossible even if every other signal were wrong.
 *
 * Pure function — no I/O. Callers pass in already-read file contents so
 * this can be exercised in tests without touching disk or a network.
 */
export function evaluateRunOutcome({ result, runError, statusText, dataforseoCalls, inputText, findingsText, reportFresh, appendixFresh }) {
  const runFailed = Boolean(result?.is_error || runError);

  if (runFailed) {
    return {
      runFailed: true,
      readyForDelivery: false,
      engagementStatus: 'FAILED',
      failure: classifyDiscoverFailure({ result, runError }),
      qualityGateRan: false,
      completed: false,
      failedRequired: [],
    };
  }

  const { qualityGateRan, completed } = parseStatusSignals(statusText);
  const failedRequired = runRequiredChecks({ dataforseoCalls, inputText, findingsText });
  const readyForDelivery = failedRequired.length === 0 && qualityGateRan && completed && reportFresh && appendixFresh;

  let failure = null;
  if (!readyForDelivery) {
    const reasons = [...failedRequired];
    if (!qualityGateRan) reasons.push('Final Quality Gate not confirmed run in status.md');
    if (!completed) reasons.push('status.md does not confirm Completed: yes');
    if (!reportFresh) reasons.push('report.md was not modified by this run (stale artifact from a previous run)');
    if (!appendixFresh) reasons.push('appendix.md was not modified by this run (stale artifact from a previous run)');
    failure = classifyDiscoverFailure({ failedRequired: reasons });
  }

  return {
    runFailed: false,
    readyForDelivery,
    engagementStatus: readyForDelivery ? 'COMPLETE' : 'INCOMPLETE_REVIEW_REQUIRED',
    failure,
    qualityGateRan,
    completed,
    failedRequired,
  };
}
