// Step 3: sound-level trend verification for the shortlisted clusters (clockworks/tiktok-sound-scraper).
// For each sound: pull up to N videos using it and count distinct creators posting with it recently. Source facts only.
import fs from 'node:fs';
import path from 'node:path';
import { runActor, DATA_DIR } from './apify.mjs';

const SNAPSHOT = '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);
const clusters = JSON.parse(fs.readFileSync(path.join(snapDir, 'clusters.json'), 'utf8'));
const shortlist = JSON.parse(fs.readFileSync(path.join(snapDir, 'shortlist.json'), 'utf8')); // [{rank, soundId}]
const PER_SOUND = 10;

const musics = shortlist.map((s) => `https://www.tiktok.com/music/original-sound-${s.soundId}`);
const { items, rec } = await runActor('clockworks/tiktok-sound-scraper', { musics, resultsPerPage: PER_SOUND },
  { maxItems: musics.length * PER_SOUND + 5, maxTotalChargeUsd: 0.8, timeoutSecs: 900, label: `verify:${SNAPSHOT}:sound-scraper` });
fs.writeFileSync(path.join(snapDir, 'raw', 'clockworks-sound-verify.json'), JSON.stringify(items));

const now = Date.now();
const out = {};
for (const s of shortlist) {
  const vids = items.filter((i) => String(i.musicMeta?.musicId) === String(s.soundId));
  const recent = (days) => new Set(vids.filter((v) => now - new Date(v.createTimeISO).getTime() <= days * 86_400_000).map((v) => v.authorMeta?.name)).size;
  out[s.soundId] = {
    sampled: vids.length,
    distinctCreatorsSampled: new Set(vids.map((v) => v.authorMeta?.name)).size,
    creatorsLast7d: recent(7), creatorsLast14d: recent(14),
    newestPost: vids.map((v) => v.createTimeISO).sort().at(-1) ?? null,
    oldestPostInSample: vids.map((v) => v.createTimeISO).sort()[0] ?? null,
    samplePlays: vids.map((v) => v.playCount).sort((a, b) => b - a).slice(0, 5),
    musicVideoCountIfProvided: vids[0]?.musicMeta?.musicVideoCount ?? vids[0]?.musicMeta?.videoCount ?? null,
    extraExamples: vids.sort((a, b) => b.playCount - a.playCount).slice(0, 3).map((v) => ({ url: v.webVideoUrl, plays: v.playCount, postedAt: v.createTimeISO, durationSec: v.videoMeta?.duration })),
  };
}
fs.writeFileSync(path.join(snapDir, 'sound-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), perSoundRequested: PER_SOUND, run: rec, sounds: out }, null, 2));
console.log(JSON.stringify(rec));
for (const s of shortlist) { const o = out[s.soundId]; const c = clusters[s.rank - 1]; console.log(`#${s.rank} ${(c.soundName || '').slice(0, 36).padEnd(36)} sampled=${o.sampled} creators=${o.distinctCreatorsSampled} last7d=${o.creatorsLast7d} last14d=${o.creatorsLast14d} oldest=${(o.oldestPostInSample || '').slice(0, 10)} newest=${(o.newestPost || '').slice(0, 10)} topPlays=${o.samplePlays.join(',')}`); }
if (items[0]) console.log('musicMeta keys:', Object.keys(items[0].musicMeta || {}).join(','));
