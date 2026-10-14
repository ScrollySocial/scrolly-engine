// Step 5: initialise the trend store (JSON files, same pattern as automation/club's *-store.mjs) with Snapshot #1.
// See data/trend-store/SCHEMA.md. No historical data is invented: releases.json starts empty because nothing was published.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const SNAPSHOT = '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);
const storeDir = path.join(DATA_DIR, 'trend-store');
fs.mkdirSync(storeDir, { recursive: true });

const meta = JSON.parse(fs.readFileSync(path.join(snapDir, 'collection-meta.json'), 'utf8'));
const norm = JSON.parse(fs.readFileSync(path.join(snapDir, 'normalized.json'), 'utf8'));
const sel = JSON.parse(fs.readFileSync(path.join(snapDir, 'final-selection.json'), 'utf8'));

// snapshots.json: one entry per weekly collection, append-only
const snapshots = [{
  snapshotId: SNAPSHOT, sequence: 1, collectedAt: meta.collectedAt, source: meta.source,
  rawCount: norm.stage.raw, stageCounts: norm.stage, rules: norm.rules,
  files: { raw: `snapshots/${SNAPSHOT}/raw/`, normalized: `snapshots/${SNAPSHOT}/normalized.json`, clusters: `snapshots/${SNAPSHOT}/clusters.json`, selection: `snapshots/${SNAPSHOT}/final-selection.json` },
}];

// observations.json: every sound seen in this snapshot (whole raw pool, not just winners), so the
// "trending in 5 consecutive snapshots" check has real per-week evidence later.
const obs = new Map();
for (const v of norm.videos) {
  if (!v.soundId) continue;
  const key = `tiktok:sound:${v.soundId}`;
  const o = obs.get(key) || { fingerprint: key, snapshotId: SNAPSHOT, soundId: v.soundId, soundName: v.soundName, videosSeen: 0, creators: new Set(), maxPlays: 0, passedFilters: false };
  o.videosSeen++; o.creators.add(v.author); o.maxPlays = Math.max(o.maxPlays, v.plays || 0); if (!v.rejectedAt) o.passedFilters = true;
  obs.set(key, o);
}
const observations = [...obs.values()].map((o) => ({ ...o, creators: o.creators.size }));

// trends.json: registry of fingerprints we have assessed (formatTag is our label, not a source fact)
const trends = sel.records.map((r) => ({
  fingerprint: r.fingerprint.primary, soundId: r.fingerprint.soundId, formatTag: r.fingerprint.formatTag, trendName: r.trendName,
  firstSeenSnapshot: SNAPSHOT, snapshotsSeen: [SNAPSHOT], releasedIn: [],
}));

const write = (f, d) => fs.writeFileSync(path.join(storeDir, f), JSON.stringify(d, null, 2));
write('snapshots.json', snapshots);
write('observations.json', observations);
write('trends.json', trends);
write('releases.json', []); // nothing published yet: the 4-week exclusion has nothing to exclude
console.log(`snapshots=1 observations=${observations.length} (passed filters: ${observations.filter((o) => o.passedFilters).length}) trends=${trends.length} releases=0`);
