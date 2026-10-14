/**
 * Deterministic, structured record of every mcp__dataforseo__api_request
 * call an engagement makes -- clients/<slug>/discover/dataforseo-calls.ndjson.
 * This is what the Completeness Gate now consults instead of regexing
 * historical 2.x tool names out of query-log.md prose.
 *
 * Four-state distinction this file exists to preserve:
 *   - not attempted        -> capability never appears in the log at all
 *   - attempted and failed -> a record exists with success:false
 *   - attempted and succeeded -> a record exists with success:true
 *   - succeeded but possibly insufficient evidence -> recorded as
 *     `resultCount` (best-effort, when countable) on a successful record,
 *     but NOT currently used to flip success:false -- see the module
 *     doc below capabilitySucceeded(). Surfaced as data, not yet wired into
 *     gate pass/fail, per the "restore correctness, don't redesign" scope.
 *
 * A 404 or an auth/billing error inside a "successful" MCP tool call (the
 * realistic v3 failure mode, since api_request is a generic passthrough)
 * must NOT read as success -- this is why parsing DataForSEO's OWN
 * status_code out of the response body, not just "did the tool call not
 * throw," is the actual success signal.
 */
import { appendFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { classifyEndpoint } from './dataforseo-capability-map.mjs';

export function callLogPath(engagementDir) {
  return path.join(engagementDir, 'dataforseo-calls.ndjson');
}

function firstResultArray(parsed) {
  // Two real shapes confirmed live (2026-08-27 probe against
  // dataforseo-mcp-server@3.1.1): DataForSEO's classic raw envelope nests
  // the array under tasks[0].result; the MCP wrapper's OWN normalized
  // response (confirmed via a real /v3/keywords_data/google_ads/search_volume/live
  // call) is flatter -- no tasks[] array at all, the data array is called
  // `items` directly on the top-level object. Both are checked; neither is guessed.
  const task = Array.isArray(parsed?.tasks) ? parsed.tasks[0] : null;
  if (Array.isArray(task?.result)) return task.result;
  if (Array.isArray(parsed?.items)) return parsed.items;
  return null;
}

/**
 * Tolerant of the tool_response being: a parsed object directly, a BARE
 * array of MCP content blocks ([{type:'text', text:'<json string>'}] --
 * confirmed live, 2026-08-27, this is what the PostToolUse hook's
 * tool_response actually is for dataforseo-mcp-server@3.1.1 -- there is no
 * wrapping {content: [...]} object), the same array wrapped in {content:
 * [...]} (kept for robustness in case a different tool/version does wrap
 * it), or a bare JSON string. Never throws.
 */
export function parseDataForSeoResponse(toolResponse) {
  let obj = toolResponse;
  const contentBlocks = Array.isArray(obj) ? obj : Array.isArray(obj?.content) ? obj.content : null;
  if (contentBlocks) {
    const textBlock = contentBlocks.find((b) => b && typeof b.text === 'string');
    if (textBlock) obj = textBlock.text;
  }
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      return { httpOk: null, statusCode: null, statusMessage: null, resultCount: null, parsed: null };
    }
  }
  if (!obj || typeof obj !== 'object') {
    return { httpOk: null, statusCode: null, statusMessage: null, resultCount: null, parsed: null };
  }

  // Task-level status (DataForSEO's classic envelope, if present) takes
  // priority over top-level status -- the top level can be 20000 "Ok" for
  // the HTTP round-trip even when the specific task inside it failed. The
  // MCP wrapper's own flattened shape (confirmed live) puts status_code
  // directly at the top level instead, with no tasks[] wrapper -- obj.status_code
  // covers that case once task is null.
  const task = Array.isArray(obj.tasks) ? obj.tasks[0] : null;
  const statusCode = task?.status_code ?? obj.status_code ?? null;
  const statusMessage = task?.status_message ?? obj.status_message ?? null;
  const httpOk = statusCode != null ? Number(statusCode) === 20000 : null;
  const result = firstResultArray(obj);

  return { httpOk, statusCode, statusMessage, resultCount: Array.isArray(result) ? result.length : null, parsed: obj };
}

/**
 * @param {string} engagementDir clients/<slug>/discover
 * @param {{method?: string, path?: string, toolResponse?: unknown, harnessError?: unknown}} call
 */
export async function recordDataForSeoCall(engagementDir, { method, path: reqPath, toolResponse, harnessError } = {}) {
  const capability = classifyEndpoint(method, reqPath);
  let success = false;
  let statusCode = null;
  let resultCount = null;
  let errorMessage = null;

  if (harnessError) {
    errorMessage = String(harnessError?.message || harnessError);
  } else {
    const parsed = parseDataForSeoResponse(toolResponse);
    statusCode = parsed.statusCode;
    resultCount = parsed.resultCount;
    if (parsed.httpOk === true) {
      success = true;
    } else if (parsed.httpOk === false) {
      errorMessage = parsed.statusMessage || `DataForSEO status_code ${parsed.statusCode}`;
    } else {
      errorMessage = 'Could not parse a DataForSEO status_code from the tool response.';
    }
  }

  const record = {
    at: new Date().toISOString(),
    method: method || null,
    path: reqPath || null,
    capability,
    attempted: true,
    success,
    statusCode,
    resultCount,
    error: success ? null : errorMessage,
  };

  await mkdir(engagementDir, { recursive: true });
  await appendFile(callLogPath(engagementDir), JSON.stringify(record) + '\n', 'utf8');
  return record;
}

export async function loadDataForSeoCalls(engagementDir) {
  try {
    const raw = await readFile(callLogPath(engagementDir), 'utf8');
    return raw
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * The one question the Completeness Gate needs answered: has `capability`
 * been successfully obtained at least once this engagement? Absence (never
 * attempted) and attempted-but-failed both correctly return false here --
 * only a recorded success:true counts.
 */
export function capabilitySucceeded(calls, capability) {
  return calls.some((c) => c.capability === capability && c.success === true);
}
