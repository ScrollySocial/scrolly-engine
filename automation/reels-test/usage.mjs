// Read-only: account usage this cycle + per-run cost from our run log.
import fs from 'node:fs';
import path from 'node:path';
import { apify, DATA_DIR } from './apify.mjs';

const lim = (await apify('/users/me/limits')).data;
console.log('cycle usage USD (Apify-reported):', lim.current?.monthlyUsageUsd, 'of', lim.limits?.maxMonthlyUsageUsd);
const logPath = path.join(DATA_DIR, 'apify-runs.ndjson');
if (fs.existsSync(logPath)) {
  const runs = fs.readFileSync(logPath, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  let sum = 0, items = 0;
  for (const r of runs) {
    const run = (await apify(`/actor-runs/${r.runId}`)).data;
    sum += run.usageTotalUsd || 0; items += r.items;
    console.log(`${r.label.padEnd(34)} ${run.status.padEnd(10)} items=${String(r.items).padStart(4)} usage=$${(run.usageTotalUsd || 0).toFixed(4)} events=${JSON.stringify(run.chargedEventCounts || {})}`);
  }
  console.log(`runs=${runs.length} items=${items} sum usageTotalUsd=$${sum.toFixed(4)}`);
}
