// Test #2, Stage 1: discovery with format-first and format x business searches, 10 results each.
// Saved under data/tests/test-02/ (Snapshot #1 is untouched).
import fs from 'node:fs';
import path from 'node:path';
import { apify, runActor, DATA_DIR } from './apify.mjs';

const TEST = 'test-02';
const dir = path.join(DATA_DIR, 'tests', TEST);
const plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
const searchQueries = plan.reducedDesign.queriesChosen;
const FAMILY = Object.fromEntries([
  ...plan.taxonomy.formatMechanics.map((q) => [q, 'format-first']),
  ...plan.taxonomy.formatByBusiness.map((q) => [q, 'format-x-business']),
]);

const lim = (await apify('/users/me/limits')).data;
const remaining = lim.limits.maxMonthlyUsageUsd - lim.current.monthlyUsageUsd;
const CAP = 1.45;
console.log(`remaining free credit $${remaining.toFixed(3)}; this run capped at $${CAP}`);
if (remaining < CAP + 0.3) { console.log('Not enough headroom for discovery + verification. Stopping.'); process.exit(1); }

const input = { searchQueries, searchSection: '/video', videoSearchSorting: 'MOST_LIKED', videoSearchDateFilter: 'PAST_WEEK', resultsPerPage: 10, proxyCountryCode: 'None' };
const { items, rec } = await runActor('clockworks/tiktok-scraper', input,
  { maxItems: searchQueries.length * 10 + 5, maxTotalChargeUsd: CAP, timeoutSecs: 1200, label: `collect:${TEST}:clockworks-search` });

fs.mkdirSync(path.join(dir, 'raw'), { recursive: true });
fs.writeFileSync(path.join(dir, 'raw', 'clockworks-search.json'), JSON.stringify(items));
fs.writeFileSync(path.join(dir, 'collection-meta.json'), JSON.stringify({
  test: TEST, snapshotWeek: '2026-W39', collectedAt: new Date().toISOString(), source: 'clockworks/tiktok-scraper', input, queryFamily: FAMILY, run: rec,
}, null, 2));
console.log(JSON.stringify(rec));
const per = {}; for (const i of items) per[i.searchQuery] = (per[i.searchQuery] || 0) + 1;
console.log('per query:', JSON.stringify(per));
