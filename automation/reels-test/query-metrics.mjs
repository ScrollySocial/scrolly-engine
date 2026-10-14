// Test #2 prep (no Apify calls): per-query yield from an existing snapshot, read-only.
// Also measures WHERE in each query's result list the survivors sat, to test whether 10/query would lose much vs 20.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const SNAPSHOT = process.argv[2] || '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);
const raw = JSON.parse(fs.readFileSync(path.join(snapDir, 'raw', 'clockworks-search.json'), 'utf8'));
const norm = JSON.parse(fs.readFileSync(path.join(snapDir, 'normalized.json'), 'utf8'));
const sel = JSON.parse(fs.readFileSync(path.join(snapDir, 'final-selection.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(snapDir, 'collection-meta.json'), 'utf8'));
const costPerVideo = meta.run.usageTotalUsd ? meta.run.usageTotalUsd / meta.run.items : 0.0063;

const byId = new Map(norm.videos.map((v) => [v.videoId, v]));
const finalByUrl = new Map(sel.records.map((r) => [r.example.url, r]));
const familyOf = (q) => (meta.queryFamilies.trendCarriers.includes(q) ? 'trend-discovery' : 'business');

const perQuery = {};
const positions = { survivorsInTop10: 0, survivorsIn11to20: 0, finalsInTop10: 0, finalsIn11to20: 0 };
const seenPos = {};
for (const r of raw) {
  const q = r.searchQuery;
  seenPos[q] = (seenPos[q] || 0) + 1;
  const pos = seenPos[q];
  const v = byId.get(String(r.id));
  const m = (perQuery[q] ||= { query: q, family: familyOf(q), raw: 0, le15s: 0, performance: 0, finalists: 0, rising: 0, breakout: 0, dupes: 0, costUsd: 0 });
  m.raw++; m.costUsd += costPerVideo;
  if (v.durationSec != null && v.durationSec <= 15) m.le15s++;
  if (v.foundByQueries.length > 1 && v.foundByQueries[0] !== q) m.dupes++;
  if (!v.rejectedAt) { m.performance++; pos <= 10 ? positions.survivorsInTop10++ : positions.survivorsIn11to20++; }
  const f = finalByUrl.get(v.url);
  if (f) { m.finalists++; f.status === 'Rising' ? m.rising++ : m.breakout++; pos <= 10 ? positions.finalsInTop10++ : positions.finalsIn11to20++; }
}
const rows = Object.values(perQuery).map((m) => ({ ...m, costUsd: +m.costUsd.toFixed(3), usablePerVideo: +(m.finalists / m.raw).toFixed(3), usablePerDollar: +(m.finalists / m.costUsd).toFixed(2) }));
const fam = {};
for (const m of rows) {
  const f = (fam[m.family] ||= { family: m.family, queries: 0, raw: 0, le15s: 0, performance: 0, finalists: 0, rising: 0, breakout: 0, costUsd: 0 });
  f.queries++; for (const k of ['raw', 'le15s', 'performance', 'finalists', 'rising', 'breakout', 'costUsd']) f[k] += m[k];
}
const out = { snapshot: SNAPSHOT, costPerVideo: +costPerVideo.toFixed(4), positions, families: Object.values(fam).map((f) => ({ ...f, costUsd: +f.costUsd.toFixed(2), usablePerVideo: +(f.finalists / f.raw).toFixed(3), usablePerDollar: +(f.finalists / f.costUsd).toFixed(2) })), queries: rows.sort((a, b) => b.finalists - a.finalists || b.performance - a.performance) };
const outDir = path.join(DATA_DIR, 'tests', 'test-02');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `query-metrics-${SNAPSHOT}.json`), JSON.stringify(out, null, 2));
console.log('cost/video', out.costPerVideo, '| positions', JSON.stringify(positions));
console.table(out.families);
console.table(out.queries.map(({ query, family, raw, le15s, performance, finalists, rising, breakout, usablePerDollar }) => ({ query, family, raw, le15s, performance, finalists, rising, breakout, usablePerDollar })));
