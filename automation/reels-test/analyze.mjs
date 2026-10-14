// Step 2: normalize raw candidates, apply deterministic filters, group into sound-level trends.
// Everything here is SOURCE FACT or a rule computed from source facts. No AI judgment in this file.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const SNAPSHOT = process.argv[2] || '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);
const meta = JSON.parse(fs.readFileSync(path.join(snapDir, 'collection-meta.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(snapDir, 'raw', 'clockworks-search.json'), 'utf8'));
const collectedAt = new Date(meta.collectedAt).getTime();

export const RULES = {
  maxDurationSec: 15,            // compliant
  flagDurationSec: 30,           // 15-30s kept but FLAGGED; >30s rejected
  maxAgeDays: 8,                 // PAST_WEEK search, small grace for timezones
  minPlays: 50_000,
  // "unusually strong" = plays well beyond the creator's own audience, or big in absolute terms
  minPlaysPerFollower: 3,
  bigPlays: 500_000,
};

// ---- normalize (source facts only)
const byId = new Map();
for (const r of raw) {
  const id = String(r.id);
  const prev = byId.get(id);
  if (prev) { prev.foundByQueries.push(r.searchQuery); continue; }
  byId.set(id, {
    videoId: id,
    url: r.webVideoUrl,
    author: r.authorMeta?.name, authorFollowers: r.authorMeta?.fans ?? null, authorVerified: !!r.authorMeta?.verified,
    postedAt: r.createTimeISO, durationSec: r.videoMeta?.duration ?? null, isSlideshow: !!r.isSlideshow,
    plays: r.playCount ?? null, likes: r.diggCount ?? null, comments: r.commentCount ?? null, shares: r.shareCount ?? null, saves: r.collectCount ?? null,
    soundId: r.musicMeta?.musicId ? String(r.musicMeta.musicId) : null, soundName: r.musicMeta?.musicName ?? null, soundAuthor: r.musicMeta?.musicAuthor ?? null,
    soundIsOriginal: r.musicMeta?.musicOriginal ?? null,
    hashtags: (r.hashtags || []).map((h) => (h.name || h).toString().toLowerCase()).filter(Boolean),
    caption: r.text ?? '', language: r.textLanguage ?? null, locationCreated: r.locationCreated ?? null,
    isAd: !!r.isAd, isSponsored: !!r.isSponsored, effects: (r.effectStickers || []).map((e) => e.name).filter(Boolean),
    foundByQueries: [r.searchQuery],
  });
}
const all = [...byId.values()];

// ---- filters (deterministic, in order; each record keeps its reason)
const stage = { raw: raw.length, uniqueVideos: all.length };
const reject = (v, why) => { v.rejectedAt = why; return false; };

const afterBasic = all.filter((v) => (v.isAd || v.isSponsored) ? reject(v, 'ad/sponsored') : true);
stage.notAdOrSponsored = afterBasic.length;

const afterDuration = afterBasic.filter((v) => {
  if (v.durationSec == null) return reject(v, 'duration unknown');
  if (v.durationSec <= RULES.maxDurationSec) { v.durationFlag = 'compliant'; return true; }
  if (v.durationSec <= RULES.flagDurationSec) { v.durationFlag = 'FLAG_over_15s_recreatable?'; return true; }
  return reject(v, `duration ${Math.round(v.durationSec)}s > ${RULES.flagDurationSec}s`);
});
stage.duration = afterDuration.length;
stage.durationCompliant = afterDuration.filter((v) => v.durationFlag === 'compliant').length;
stage.durationFlagged = afterDuration.length - stage.durationCompliant;

const afterRecency = afterDuration.filter((v) => {
  const ageDays = (collectedAt - new Date(v.postedAt).getTime()) / 86_400_000;
  v.ageDays = Math.round(ageDays * 10) / 10;
  return ageDays <= RULES.maxAgeDays ? true : reject(v, `posted ${v.ageDays} days ago`);
});
stage.recency = afterRecency.length;

const afterPerf = afterRecency.filter((v) => {
  v.playsPerFollower = v.authorFollowers ? Math.round((v.plays / v.authorFollowers) * 10) / 10 : null;
  if ((v.plays ?? 0) < RULES.minPlays) return reject(v, `plays ${v.plays} < ${RULES.minPlays}`);
  const outperform = v.playsPerFollower == null || v.playsPerFollower >= RULES.minPlaysPerFollower;
  return (outperform || v.plays >= RULES.bigPlays) ? true : reject(v, `plays/follower ${v.playsPerFollower} and plays < ${RULES.bigPlays}`);
});
stage.performance = afterPerf.length;

// ---- group into sound-level clusters (exact soundId). A sound reused by a creator other than its author is reuse evidence.
const clusters = new Map();
for (const v of afterPerf) {
  const key = v.soundId || `nosound:${v.videoId}`;
  if (!clusters.has(key)) clusters.set(key, { soundId: v.soundId, soundName: v.soundName, soundAuthor: v.soundAuthor, soundIsOriginal: v.soundIsOriginal, videos: [] });
  clusters.get(key).videos.push(v);
}
// Pool-wide reuse: how many distinct creators in the WHOLE raw pool (any duration/performance) used each sound this week
const poolUse = new Map();
for (const v of all) if (v.soundId) { if (!poolUse.has(v.soundId)) poolUse.set(v.soundId, new Set()); poolUse.get(v.soundId).add(v.author); }
const clusterList = [...clusters.values()].map((c) => {
  const vids = c.videos.sort((a, b) => b.plays - a.plays);
  return {
    ...c,
    videos: vids,
    creatorsInSurvivors: new Set(vids.map((v) => v.author)).size,
    creatorsInWholePool: c.soundId ? poolUse.get(c.soundId).size : 1,
    totalPlays: vids.reduce((s, v) => s + (v.plays || 0), 0),
    topPlays: vids[0].plays,
    usedByNonAuthor: vids.some((v) => c.soundAuthor && v.author && !c.soundAuthor.toLowerCase().includes(v.author.toLowerCase())),
  };
}).sort((a, b) => b.topPlays - a.topPlays);
stage.soundClusters = clusterList.length;
stage.clustersWithMultipleCreators = clusterList.filter((c) => c.creatorsInWholePool > 1).length;

fs.writeFileSync(path.join(snapDir, 'normalized.json'), JSON.stringify({ snapshot: SNAPSHOT, rules: RULES, stage, videos: all }, null, 2));
fs.writeFileSync(path.join(snapDir, 'clusters.json'), JSON.stringify(clusterList, null, 2));

console.log('STAGES', JSON.stringify(stage, null, 1));
const rejects = {}; for (const v of all) if (v.rejectedAt) { const k = v.rejectedAt.replace(/[\d.]+/g, 'N'); rejects[k] = (rejects[k] || 0) + 1; }
console.log('REJECT REASONS', JSON.stringify(rejects, null, 1));
const k = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'K';
console.log('\nCLUSTERS (survivors), sorted by top plays:');
clusterList.forEach((c, i) => {
  const v = c.videos[0];
  console.log(`${String(i + 1).padStart(2)}. [${c.creatorsInSurvivors}/${c.creatorsInWholePool} creators] ${k(v.plays)} plays ${Math.round(v.durationSec)}s ${v.durationFlag === 'compliant' ? '' : 'FLAG'} ${v.ageDays}d ppf=${v.playsPerFollower} | sound: ${(c.soundName || '').slice(0, 38)} (${c.soundIsOriginal ? 'orig' : 'track'}) | @${v.author} | q=${v.foundByQueries.join('+')} | ${v.caption.replace(/\s+/g, ' ').slice(0, 110)}`);
});
