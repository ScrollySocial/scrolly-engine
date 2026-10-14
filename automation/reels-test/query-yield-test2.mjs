// Test #2: attach finalists / trends / breakouts to each Test #2 query and compute yield per video and per dollar.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-02');
const qm = JSON.parse(fs.readFileSync(path.join(dir, 'query-metrics.json'), 'utf8'));
const sel = JSON.parse(fs.readFileSync(path.join(dir, 'final-selection.json'), 'utf8'));
const norm = JSON.parse(fs.readFileSync(path.join(dir, 'normalized.json'), 'utf8'));
const t2ById = new Map(norm.test2.map((v) => [v.url, v]));

for (const m of qm) Object.assign(m, { finalists: 0, trends: 0, breakouts: 0, finalistsNewVsSnapshot1: 0, trendFoundButRejected: 0 });
const Q = Object.fromEntries(qm.map((m) => [m.query, m]));
for (const r of sel.records) {
  const v = t2ById.get(r.example.url);
  const t2Queries = r.sourceFacts.foundBy.filter((f) => f.startsWith('test-02:')).map((f) => f.slice(8));
  for (const q of t2Queries) {
    const m = Q[q]; m.finalists++; r.classification === 'Breakout' ? m.breakouts++ : m.trends++;
    if (!r.sourceFacts.foundBy.some((f) => f.startsWith('snapshot-1:'))) m.finalistsNewVsSnapshot1++;
  }
  // a trend verified from a sound whose seed video came from a Test #2 query
  if (!v && r.classification !== 'Breakout') {
    const seed = norm.test2.find((x) => x.soundId === r.fingerprint.soundId);
    if (seed) for (const q of seed.foundByQueries) if (!t2Queries.includes(q)) { Q[q].trends++; Q[q].finalists++; Q[q].finalistsNewVsSnapshot1++; }
  }
}
for (const x of norm.test2.filter((x) => x.soundId === '7683515977018919713')) for (const q of x.foundByQueries) Q[q].trendFoundButRejected = 1;

const rows = qm.map((m) => ({ ...m, usablePerVideo: +(m.finalists / m.raw).toFixed(3), usablePerDollar: +(m.finalists / m.costUsd).toFixed(2) }))
  .sort((a, b) => b.finalistsNewVsSnapshot1 - a.finalistsNewVsSnapshot1 || b.finalists - a.finalists || b.performance - a.performance);
fs.writeFileSync(path.join(dir, 'query-metrics.json'), JSON.stringify(rows, null, 2));
const fam = {};
for (const m of rows) { const f = (fam[m.family] ||= { family: m.family, queries: 0, raw: 0, le15s: 0, performance: 0, finalists: 0, newFinalists: 0, costUsd: 0 }); f.queries++; f.raw += m.raw; f.le15s += m.le15s; f.performance += m.performance; f.finalists += m.finalists; f.newFinalists += m.finalistsNewVsSnapshot1; f.costUsd += m.costUsd; }
console.table(Object.values(fam).map((f) => ({ ...f, costUsd: +f.costUsd.toFixed(2), newPerDollar: +(f.newFinalists / f.costUsd).toFixed(2) })));
console.table(rows.map(({ query, family, raw, le15s, performance, finalists, finalistsNewVsSnapshot1, trends, breakouts, dupesOfSnapshot1, trendFoundButRejected, usablePerDollar }) => ({ query, family, raw, le15s, performance, finalists, newVsS1: finalistsNewVsSnapshot1, trends, breakouts, dupesOfS1: dupesOfSnapshot1, rejTrend: trendFoundButRejected, usablePerDollar })));
