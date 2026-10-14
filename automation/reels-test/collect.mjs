// Step 1: broad candidate collection for Snapshot #1.
// Source: clockworks/tiktok-scraper video search, past week, most liked. (apidojo/tiktok-scraper was tried first:
// cheapest, but capped at 10 items on the Free plan and it rounds sound IDs, so it can't fingerprint trends.)
// Raw items are saved untouched; nothing is filtered here.
import fs from 'node:fs';
import path from 'node:path';
import { runActor, DATA_DIR } from './apify.mjs';

export const SNAPSHOT = '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);

// Two query families: (a) terms that carry trend formats, (b) the business niches our members are in.
export const QUERIES = {
  trendCarriers: ['trend', 'trending sound', 'capcut template', 'new trend', 'pov', 'transition', 'viral sound'],
  business: ['small business', 'smallbusinesscheck', 'packing orders', 'product reveal', 'business owner', 'digital products', 'hair stylist', 'realtor', 'fitness coach'],
};
const PER_QUERY = 20;

const searchQueries = [...QUERIES.trendCarriers, ...QUERIES.business];
const input = { searchQueries, searchSection: '/video', videoSearchSorting: 'MOST_LIKED', videoSearchDateFilter: 'PAST_WEEK', resultsPerPage: PER_QUERY, proxyCountryCode: 'None' };
const cap = searchQueries.length * PER_QUERY + 20;
const { items, rec } = await runActor('clockworks/tiktok-scraper', input,
  { maxItems: cap, maxTotalChargeUsd: 2.2, timeoutSecs: 1200, memoryMbytes: 1024, label: `collect:${SNAPSHOT}:clockworks-search` });

fs.mkdirSync(path.join(snapDir, 'raw'), { recursive: true });
fs.writeFileSync(path.join(snapDir, 'raw', 'clockworks-search.json'), JSON.stringify(items));
fs.writeFileSync(path.join(snapDir, 'collection-meta.json'), JSON.stringify({
  snapshot: SNAPSHOT, collectedAt: new Date().toISOString(), source: 'clockworks/tiktok-scraper', input, queryFamilies: QUERIES, run: rec,
}, null, 2));
console.log(JSON.stringify(rec));
const perQuery = {};
for (const i of items) perQuery[i.searchQuery] = (perQuery[i.searchQuery] || 0) + 1;
console.log('per query:', JSON.stringify(perQuery));
