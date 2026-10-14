/**
 * Local, mock-only tests for the DataForSEO v3 compatibility layer — no
 * DataForSEO calls, no Agent SDK, no network. Mock response payloads use
 * DataForSEO's real, documented envelope shape
 * ({status_code, status_message, tasks:[{status_code, status_message, result}]}),
 * confirmed against real query-log.md entries from the 2026-08-10
 * mulberry-creek engagement ("status_code 20000" appears throughout).
 *
 * Covers Step 8 cases A-G. Cases H-I (full completeness-gate fixtures) are
 * in discover-completeness.test.mjs, alongside the Phase 1 cases.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile } from 'node:fs/promises';
import path from 'node:path';

import { classifyEndpoint, KNOWN_CAPABILITIES } from '../lib/dataforseo-capability-map.mjs';
import { recordDataForSeoCall, loadDataForSeoCalls, parseDataForSeoResponse, capabilitySucceeded, callLogPath } from '../lib/dataforseo-call-log.mjs';

const TEST_DIR = path.join(process.cwd(), '.test-scratch', 'dataforseo-call-log');

// Confirmed live (2026-08-27 Step 9 probe against dataforseo-mcp-server@3.1.1,
// a real /v3/keywords_data/google_ads/search_volume/live call): the MCP
// wrapper's actual response has NO tasks[] array -- status_code sits at the
// top level and the data array is called `items`, not `result`. This is
// what real calls produce; DataForSEO's classic tasks[]-nested envelope is
// tested separately below for backward-compatible parsing only.
function ok(items) {
  return { id: 'mock-id', status_code: 20000, status_message: 'Ok.', items };
}
function failed(code, message) {
  return { id: 'mock-id', status_code: code, status_message: message, items: [] };
}
function okLegacyTasksShape(result) {
  return { status_code: 20000, status_message: 'Ok.', tasks: [{ status_code: 20000, status_message: 'Ok.', result }] };
}
function taskFailed(code, message) {
  return { status_code: 20000, status_message: 'Ok.', tasks: [{ status_code: code, status_message: message, result: null }] };
}

test.beforeEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

// --- A: SERP organic ---------------------------------------------------------
test('A — successful /v3/serp/google/organic/live/advanced records google_organic_serp success', async () => {
  const record = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/serp/google/organic/live/advanced',
    toolResponse: ok([{ type: 'organic', rank_absolute: 1 }]),
  });
  assert.equal(record.capability, 'google_organic_serp');
  assert.equal(record.attempted, true);
  assert.equal(record.success, true);
  assert.equal(record.statusCode, 20000);
});

// --- B: Google Ads search volume --------------------------------------------
test('B — successful google_ads/search_volume endpoint records google_ads_search_volume', async () => {
  const record = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/keywords_data/google_ads/search_volume/live',
    toolResponse: ok([{ keyword: 'plant nursery', search_volume: 10 }]),
  });
  assert.equal(record.capability, 'google_ads_search_volume');
  assert.equal(record.success, true);
});

// --- C: DataForSEO Labs related/ideas ----------------------------------------
test('C — related_keywords and keyword_ideas map to distinct correct capabilities', async () => {
  const related = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/dataforseo_labs/google/related_keywords/live',
    toolResponse: ok([{ keyword: 'landscape design' }]),
  });
  const ideas = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/dataforseo_labs/google/keyword_ideas/live',
    toolResponse: ok([{ keyword: 'landscaping company' }]),
  });
  assert.equal(related.capability, 'related_keywords');
  assert.equal(ideas.capability, 'keyword_ideas');
  assert.equal(related.success, true);
  assert.equal(ideas.success, true);
});

// --- D: Backlinks -------------------------------------------------------------
test('D — backlinks summary and individual-record endpoints map correctly and distinctly', async () => {
  const summary = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/backlinks/summary/live',
    toolResponse: ok([{ target: 'mulberrycreektx.com', backlinks: 21 }]),
  });
  const individual = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/backlinks/backlinks/live',
    toolResponse: ok([{ domain_from: 'example.com', url_to: 'mulberrycreektx.com' }]),
  });
  assert.equal(summary.capability, 'backlinks_summary');
  assert.equal(individual.capability, 'backlinks_individual');
  assert.notEqual(summary.capability, individual.capability);
});

// --- E: Business/local data ---------------------------------------------------
test('E — business_data endpoints map to distinct correct capabilities', async () => {
  const listings = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/business_data/business_listings/search/live',
    toolResponse: ok([{ title: 'Mulberry Creek' }]),
  });
  const gbp = await recordDataForSeoCall(TEST_DIR, {
    method: 'GET',
    path: '/v3/business_data/google/my_business_info/live',
    toolResponse: ok([{ category: 'Garden center' }]),
  });
  const reviews = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/business_data/google/reviews/task_post',
    toolResponse: ok([{ rating: 4.8 }]),
  });
  assert.equal(listings.capability, 'business_listings_search');
  assert.equal(gbp.capability, 'business_gbp_profile');
  assert.equal(reviews.capability, 'business_reviews');
});

// --- F: 404 must not satisfy completeness -------------------------------------
test('F — a failed request records attempted+failed and does not satisfy the capability', async () => {
  // Representation 1: the MCP tool call succeeds, but the response body's
  // own status_code indicates the underlying REST call failed (DataForSEO's
  // real failure mode for a bad path/params, per the compatibility layer's
  // whole reason for parsing status_code rather than trusting "the tool
  // didn't throw"). Uses the confirmed-real flat shape.
  const viaBadStatusCode = await recordDataForSeoCall(TEST_DIR, {
    method: 'GET',
    path: '/v3/serp/google/organic/live/advanced/bogus',
    toolResponse: failed(40400, 'Not Found.'),
  });
  assert.equal(viaBadStatusCode.attempted, true);
  assert.equal(viaBadStatusCode.success, false);
  assert.equal(viaBadStatusCode.statusCode, 40400);
  assert.ok(viaBadStatusCode.error);

  // Representation 2: the harness itself reports failure (PostToolUseFailure).
  const viaHarnessError = await recordDataForSeoCall(TEST_DIR, {
    method: 'GET',
    path: '/v3/serp/google/organic/live/advanced/bogus',
    harnessError: new Error('HTTP 404'),
  });
  assert.equal(viaHarnessError.attempted, true);
  assert.equal(viaHarnessError.success, false);

  const calls = await loadDataForSeoCalls(TEST_DIR);
  assert.equal(calls.length, 2);
  assert.equal(capabilitySucceeded(calls, 'google_organic_serp'), false, '404s must not satisfy the capability');
});

// --- G: unknown endpoint ------------------------------------------------------
test('G — an unrecognized endpoint records capability=unknown and satisfies nothing else', async () => {
  const record = await recordDataForSeoCall(TEST_DIR, {
    method: 'POST',
    path: '/v3/merchant/amazon/products/live',
    toolResponse: ok([{ asin: 'B000000000' }]),
  });
  assert.equal(record.capability, 'unknown');
  assert.equal(classifyEndpoint('POST', '/v3/some/totally/novel/path'), 'unknown');

  const calls = await loadDataForSeoCalls(TEST_DIR);
  // Even though this call succeeded, it must not accidentally satisfy any
  // real requirement — 'unknown' is never a member of KNOWN_CAPABILITIES.
  assert.ok(!KNOWN_CAPABILITIES.includes('unknown'));
  for (const cap of KNOWN_CAPABILITIES) {
    assert.equal(capabilitySucceeded(calls, cap), false);
  }
});

// --- Response-shape tolerance ------------------------------------------------
// The content-block-wrapped-JSON-string shape and the flat {status_code,
// items} envelope (no tasks[]) are both confirmed live against a real
// dataforseo-mcp-server@3.1.1 call (2026-08-27 Step 9 probe) — not guessed.
test('parseDataForSeoResponse handles the CONFIRMED real 3.1.1 shape: a bare array of content blocks', () => {
  // Confirmed live 2026-08-27 (Step 9 probe, with debug logging on the raw
  // hook payload): tool_response is the bare array itself, e.g.
  // [{type:'text', text:'<json string>'}] -- NOT wrapped in {content:[...]}.
  // Getting this wrong is what made every real probe call record
  // success:false until this was traced down.
  const bareArray = [{ type: 'text', text: JSON.stringify(ok([{ a: 1 }])) }];
  const parsed = parseDataForSeoResponse(bareArray);
  assert.equal(parsed.httpOk, true);
  assert.equal(parsed.statusCode, 20000);
  assert.equal(parsed.resultCount, 1);
});
test('parseDataForSeoResponse also tolerates the array wrapped in {content: [...]}, for robustness', () => {
  const wrapped = { content: [{ type: 'text', text: JSON.stringify(ok([{ a: 1 }])) }] };
  const parsed = parseDataForSeoResponse(wrapped);
  assert.equal(parsed.httpOk, true);
  assert.equal(parsed.statusCode, 20000);
});
test('parseDataForSeoResponse also accepts DataForSEO\'s classic tasks[]-nested envelope, for robustness', () => {
  const parsed = parseDataForSeoResponse(okLegacyTasksShape([{ a: 1 }, { b: 2 }]));
  assert.equal(parsed.httpOk, true);
  assert.equal(parsed.statusCode, 20000);
  assert.equal(parsed.resultCount, 2);
});
test('parseDataForSeoResponse returns nulls, not a throw, for genuinely unparseable input', () => {
  const parsed = parseDataForSeoResponse('not json at all {{{');
  assert.equal(parsed.httpOk, null);
  assert.equal(parsed.statusCode, null);
});

test('the log file is real NDJSON at the expected path', async () => {
  await recordDataForSeoCall(TEST_DIR, { method: 'GET', path: '/v3/serp/google/locations/US', toolResponse: ok([{ location_code: 2840 }]) });
  const raw = await readFile(callLogPath(TEST_DIR), 'utf8');
  const lines = raw.trim().split('\n');
  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]); // throws if malformed
  assert.equal(parsed.capability, 'serp_locations_reference');
});
