// Minimal Apify REST helper for the reels trend test (2026-09-25). Plain fetch, token from automation/.env.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const TEST_DIR = here;
export const DATA_DIR = path.join(here, 'data');

function loadToken() {
  const envText = fs.readFileSync(path.join(here, '..', '.env'), 'utf8');
  const line = envText.split(/\r?\n/).find((l) => /^\s*APIFY_TOKEN\s*=/.test(l));
  if (!line) throw new Error('APIFY_TOKEN missing from automation/.env');
  return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}
const TOKEN = loadToken();
const API = 'https://api.apify.com/v2';

export async function apify(pathname, opts = {}) {
  // GETs are safe to retry on transient 5xx / network errors; POSTs (which start paid runs) are never retried.
  const tries = (opts.method || 'GET') === 'GET' ? 5 : 1;
  for (let t = 1; ; t++) {
    try { return await apifyOnce(pathname, opts); } catch (e) {
      if (t >= tries || (e.status && e.status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * t));
    }
  }
}

async function apifyOnce(pathname, { method = 'GET', body, query = {} } = {}) {
  const url = new URL(API + pathname);
  for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v));
  const r = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) { const e = new Error(`Apify ${method} ${pathname} -> ${r.status}: ${text.slice(0, 400)}`); e.status = r.status; throw e; }
  return json;
}

/** Append one line per Actor run to data/apify-runs.ndjson (cost + record log). */
export function logRun(rec) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(path.join(DATA_DIR, 'apify-runs.ndjson'), JSON.stringify({ at: new Date().toISOString(), ...rec }) + '\n');
}

/**
 * Run an Actor synchronously with hard caps, then fetch its dataset.
 * maxTotalChargeUsd caps pay-per-event spend; timeout caps compute; maxItems caps results.
 */
export async function runActor(actorId, input, { maxItems = 200, maxTotalChargeUsd = 0.5, timeoutSecs = 300, memoryMbytes = 1024, label = '' } = {}) {
  const id = actorId.replace('/', '~');
  // RESUME_RUN=<runId> reattaches to a run that was already started (e.g. after a polling error) instead of paying for a new one.
  const run = process.env.RESUME_RUN
    ? await apify(`/actor-runs/${process.env.RESUME_RUN}`)
    : await apify(`/acts/${id}/runs`, {
      method: 'POST', body: input,
      query: { maxItems, maxTotalChargeUsd, timeout: timeoutSecs, memory: memoryMbytes, waitForFinish: 60 },
    });
  let data = run.data;
  const started = Date.now();
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(data.status)) {
    if (Date.now() - started > (timeoutSecs + 120) * 1000) break;
    data = (await apify(`/actor-runs/${data.id}`, { query: { waitForFinish: 60 } })).data;
  }
  const items = data.defaultDatasetId
    ? await apify(`/datasets/${data.defaultDatasetId}/items`, { query: { clean: true, format: 'json', limit: maxItems } })
    : [];
  const rec = {
    label, actorId, runId: data.id, status: data.status, items: Array.isArray(items) ? items.length : 0,
    usageTotalUsd: data.usageTotalUsd ?? null, chargedEventCounts: data.chargedEventCounts ?? null,
    computeUnits: data.stats?.computeUnits ?? null, durationSecs: data.stats?.runTimeSecs ?? null,
    maxItems, maxTotalChargeUsd,
  };
  logRun(rec);
  return { run: data, items: Array.isArray(items) ? items : [], rec };
}
