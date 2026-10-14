// Test #2, Stage 1b: normalize + deterministic filters + breakout scoring, for Test #2 AND a read-only re-score of Snapshot #1.
// Output: data/tests/test-02/{normalized.json, candidates.json, query-metrics.json}. Source facts + rules only (no AI judgment).
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-02');
const s1Dir = path.join(DATA_DIR, 'snapshots', '2026-W39');

export const RULES = {
  maxDurationSec: 15, flagDurationSec: 30, maxAgeDays: 8,
  // Breakout = the video beat its creator's normal reach. Followers are floored at 1,000 so a 111-follower account
  // can't produce a meaningless 3,500x ratio. Two ways to qualify:
  breakout: { minPlays: 100_000, minRatio: 5, bigPlays: 1_000_000, bigMinRatio: 1, followerFloor: 1000 },
};

function normalize(r, source) {
  return {
    videoId: String(r.id), url: r.webVideoUrl, source,
    author: r.authorMeta?.name, authorFollowers: r.authorMeta?.fans ?? null,
    postedAt: r.createTimeISO, durationSec: r.videoMeta?.duration ?? null,
    plays: r.playCount ?? 0, likes: r.diggCount ?? 0, comments: r.commentCount ?? 0, shares: r.shareCount ?? 0, saves: r.collectCount ?? 0,
    soundId: r.musicMeta?.musicId ? String(r.musicMeta.musicId) : null, soundName: r.musicMeta?.musicName ?? null, soundAuthor: r.musicMeta?.musicAuthor ?? null, soundIsOriginal: r.musicMeta?.musicOriginal ?? null,
    hashtags: (r.hashtags || []).map((h) => String(h.name || h).toLowerCase()).filter(Boolean),
    caption: r.text ?? '', language: r.textLanguage ?? null, locationCreated: r.locationCreated ?? null,
    isAd: !!r.isAd, isSponsored: !!r.isSponsored, isSlideshow: !!r.isSlideshow,
    templateSticker: (r.effectStickers || []).some((e) => /template/i.test(e.name || '')),
    foundByQueries: [r.searchQuery],
  };
}

function score(v, collectedAt) {
  const B = RULES.breakout;
  v.ageDays = Math.round(((collectedAt - Date.parse(v.postedAt)) / 86_400_000) * 10) / 10;
  v.ratio = Math.round((v.plays / Math.max(v.authorFollowers || 0, B.followerFloor)) * 10) / 10;
  v.shareRate = v.plays ? +(v.shares / v.plays).toFixed(4) : 0;
  v.saveRate = v.plays ? +(v.saves / v.plays).toFixed(4) : 0;
  // Rank score: absolute reach + creator-relative reach + engagement bonuses (log scale so no single term dominates)
  v.breakoutScore = +(Math.log10(Math.max(v.plays, 1)) + Math.log10(Math.max(v.ratio, 0.1)) + (v.saveRate >= 0.01 ? 0.5 : 0) + (v.shareRate >= 0.01 ? 0.5 : 0)).toFixed(2);
  if (v.isAd || v.isSponsored) return (v.rejectedAt = 'ad/sponsored');
  if (v.durationSec == null) return (v.rejectedAt = 'duration unknown');
  if (v.durationSec > RULES.flagDurationSec) return (v.rejectedAt = 'over 30s');
  v.durationFlag = v.durationSec <= RULES.maxDurationSec ? 'compliant' : 'FLAG_15-30s';
  if (v.ageDays > RULES.maxAgeDays) return (v.rejectedAt = 'too old');
  const passes = (v.plays >= B.minPlays && v.ratio >= B.minRatio) || (v.plays >= B.bigPlays && v.ratio >= B.bigMinRatio);
  if (!passes) return (v.rejectedAt = v.plays < B.minPlays ? 'under 100K plays' : 'not above creator\'s normal reach');
  return null;
}

function load(pool, rawPath, metaPath) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const at = Date.parse(meta.collectedAt);
  const byId = new Map();
  const perQueryPos = {};
  for (const r of raw) {
    perQueryPos[r.searchQuery] = (perQueryPos[r.searchQuery] || 0) + 1;
    const id = String(r.id);
    if (byId.has(id)) { byId.get(id).foundByQueries.push(r.searchQuery); continue; }
    const v = normalize(r, pool); v.position = perQueryPos[r.searchQuery]; score(v, at); byId.set(id, v);
  }
  return { meta, videos: [...byId.values()], rawCount: raw.length, costPerVideo: meta.run.usageTotalUsd / meta.run.items };
}

const t2 = load('test-02', path.join(dir, 'raw', 'clockworks-search.json'), path.join(dir, 'collection-meta.json'));
const s1 = load('snapshot-1', path.join(s1Dir, 'raw', 'clockworks-search.json'), path.join(s1Dir, 'collection-meta.json'));

// cross-pool duplicates (same video found in both collections)
const s1Ids = new Set(s1.videos.map((v) => v.videoId));
for (const v of t2.videos) v.alsoInSnapshot1 = s1Ids.has(v.videoId);

// sound reuse across the combined pool (distinct creators per exact soundId, any duration)
const soundCreators = new Map();
for (const v of [...s1.videos, ...t2.videos]) if (v.soundId) { if (!soundCreators.has(v.soundId)) soundCreators.set(v.soundId, new Set()); soundCreators.get(v.soundId).add(v.author); }
for (const v of [...s1.videos, ...t2.videos]) v.soundCreatorsInCombinedPool = v.soundId ? soundCreators.get(v.soundId).size : 0;

function funnel(videos) {
  const f = { unique: videos.length, notAd: 0, le30s: 0, le15s: 0, recent: 0, performance: 0 };
  for (const v of videos) {
    if (v.rejectedAt === 'ad/sponsored') continue; f.notAd++;
    if (['duration unknown', 'over 30s'].includes(v.rejectedAt)) continue; f.le30s++;
    if (v.durationSec <= 15) f.le15s++;
    if (v.rejectedAt === 'too old') continue; f.recent++;
    if (!v.rejectedAt) f.performance++;
  }
  return f;
}

// per-query metrics for Test #2 (finalists/trends filled in later by build step)
const qm = {};
for (const v of t2.videos) for (const [i, q] of v.foundByQueries.entries()) {
  const m = (qm[q] ||= { query: q, family: t2.meta.queryFamily[q], raw: 0, le15s: 0, performance: 0, dupesOfOtherQuery: 0, dupesOfSnapshot1: 0, costUsd: 0 });
  m.raw++; m.costUsd += t2.costPerVideo;
  if (i > 0) m.dupesOfOtherQuery++;
  if (v.alsoInSnapshot1) m.dupesOfSnapshot1++;
  if (v.durationSec != null && v.durationSec <= 15) m.le15s++;
  if (!v.rejectedAt) m.performance++;
}

const survivors = [...t2.videos, ...s1.videos].filter((v) => !v.rejectedAt).sort((a, b) => b.breakoutScore - a.breakoutScore);
fs.writeFileSync(path.join(dir, 'normalized.json'), JSON.stringify({ rules: RULES, funnel: { test2: { raw: t2.rawCount, ...funnel(t2.videos) }, snapshot1Rescored: { raw: s1.rawCount, ...funnel(s1.videos) } }, test2: t2.videos, snapshot1Rescored: s1.videos }, null, 2));
fs.writeFileSync(path.join(dir, 'candidates.json'), JSON.stringify(survivors, null, 2));
fs.writeFileSync(path.join(dir, 'query-metrics.json'), JSON.stringify(Object.values(qm).map((m) => ({ ...m, costUsd: +m.costUsd.toFixed(3) })), null, 2));

console.log('FUNNEL test2', JSON.stringify({ raw: t2.rawCount, ...funnel(t2.videos) }), '\nFUNNEL snapshot1 rescored', JSON.stringify({ raw: s1.rawCount, ...funnel(s1.videos) }));
const kf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'K');
survivors.forEach((v, i) => console.log(`${String(i + 1).padStart(2)} ${v.source === 'test-02' ? 'T2' : 'S1'} sc=${v.breakoutScore} ${kf(v.plays)} r=${v.ratio} ${Math.round(v.durationSec)}s${v.durationFlag === 'compliant' ? '' : 'F'} sv=${(v.saveRate * 100).toFixed(1)}% sh=${(v.shareRate * 100).toFixed(1)}% ${v.templateSticker ? 'TPL ' : ''}pool=${v.soundCreatorsInCombinedPool} ${v.language}/${v.locationCreated} | ${(v.soundName || '').slice(0, 30)} | @${v.author} | q=${v.foundByQueries.join('+')} | ${v.caption.replace(/\s+/g, ' ').slice(0, 90)}`));
