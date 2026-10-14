// Correction pass (no Apify calls): re-read ALL already-paid data looking for short, repeatable mechanics.
// Pools: Snapshot #1 search (320), Test #2 search (213), Test #1 + Test #2 sound-check samples (162).
// Deterministic signals only. AI/visual judgment happens afterwards and is recorded separately.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const S1 = path.join(DATA_DIR, 'snapshots', '2026-W39');
const T2 = path.join(DATA_DIR, 'tests', 'test-02');
const out = path.join(DATA_DIR, 'tests', 'test-03-correction');
fs.mkdirSync(out, { recursive: true });
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const COLLECTED = Date.parse('2026-09-25T19:30:00Z');

const pools = [
  ['s1-search', read(path.join(S1, 'raw', 'clockworks-search.json'))],
  ['t2-search', read(path.join(T2, 'raw', 'clockworks-search.json'))],
  ['s1-soundcheck', read(path.join(S1, 'raw', 'clockworks-sound-verify.json'))],
  ['t2-soundcheck', read(path.join(T2, 'raw', 'clockworks-sound-verify.json'))],
];

const vids = new Map();
for (const [pool, items] of pools) for (const r of items) {
  const id = String(r.id);
  const v = vids.get(id) || {
    videoId: id, url: r.webVideoUrl, pools: [], queries: [], author: r.authorMeta?.name, followers: r.authorMeta?.fans ?? null,
    postedAt: r.createTimeISO, durationSec: r.videoMeta?.duration ?? null, isSlideshow: !!r.isSlideshow,
    plays: r.playCount ?? 0, shares: r.shareCount ?? 0, saves: r.collectCount ?? 0,
    soundId: r.musicMeta?.musicId ? String(r.musicMeta.musicId) : null, soundName: r.musicMeta?.musicName ?? '', soundAuthor: r.musicMeta?.musicAuthor ?? '',
    soundOriginal: !!r.musicMeta?.musicOriginal, caption: (r.text || '').replace(/\s+/g, ' '), lang: r.textLanguage, loc: r.locationCreated,
    template: (r.effectStickers || []).some((e) => /template/i.test(e.name || '')), isAd: !!r.isAd || !!r.isSponsored,
  };
  v.pools.push(pool); if (r.searchQuery) v.queries.push(r.searchQuery);
  vids.set(id, v);
}
const all = [...vids.values()];

// Sound adoption across everything we paid for (distinct creators per exact sound ID, and recent ones)
const soundUse = new Map();
for (const v of all) if (v.soundId) {
  const s = soundUse.get(v.soundId) || { creators: new Set(), recent14: new Set(), name: v.soundName };
  s.creators.add(v.author);
  if (COLLECTED - Date.parse(v.postedAt) <= 14 * 86_400_000) s.recent14.add(v.author);
  soundUse.set(v.soundId, s);
}

for (const v of all) {
  v.ageDays = Math.round(((COLLECTED - Date.parse(v.postedAt)) / 86_400_000) * 10) / 10;
  const s = v.soundId ? soundUse.get(v.soundId) : null;
  v.soundCreators = s ? s.creators.size : 0;
  v.soundCreatorsRecent14 = s ? s.recent14.size : 0;
  // "borrowed sound": an original sound whose name/author is another account, i.e. this creator copied someone's audio
  const origin = v.soundName.startsWith('original sound - ') ? v.soundName.slice(17).toLowerCase() : null;
  v.borrowedSound = v.soundOriginal && origin != null && v.author && !origin.includes(v.author.toLowerCase()) && !v.author.toLowerCase().includes(origin);
  v.ratio = Math.round((v.plays / Math.max(v.followers || 0, 1000)) * 10) / 10;
  // mechanic-candidate screen (deliberately looser than before; no business-fit test here)
  const reasons = [];
  if (v.isAd) reasons.push('ad');
  if (v.durationSec == null || v.durationSec === 0) reasons.push(v.isSlideshow || v.durationSec === 0 ? 'slideshow/no duration' : 'no duration');
  else if (v.durationSec > 15) reasons.push('over 15s');
  if (v.ageDays > 14) reasons.push('older than 14d');
  if (v.plays < 50_000) reasons.push('under 50K plays');
  const proof = v.soundCreatorsRecent14 >= 2 || v.borrowedSound || v.template || v.ratio >= 5;
  if (!proof) reasons.push('no reuse/breakout signal');
  v.screenOut = reasons;
}
const pass = all.filter((v) => v.screenOut.length === 0);
const sweet = pass.filter((v) => v.durationSec <= 10);
const prevFinal = new Set(read(path.join(T2, 'final-selection.json')).records.map((r) => r.example.url));
fs.writeFileSync(path.join(out, 'mechanic-screen.json'), JSON.stringify({ totalUniqueVideos: all.length, passedScreen: pass.length, fiveToTenSec: sweet.length, videos: pass.sort((a, b) => b.soundCreatorsRecent14 - a.soundCreatorsRecent14 || b.plays - a.plays) }, null, 2));

console.log(`unique videos ${all.length}; pass mechanic screen ${pass.length} (${sweet.length} at <=10s); previously final ${pass.filter((v) => prevFinal.has(v.url)).length}`);
const why = {}; for (const v of all) for (const r of v.screenOut) why[r] = (why[r] || 0) + 1; console.log('screen-out reasons (multi):', JSON.stringify(why));
const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'K');
pass.forEach((v, i) => console.log(`${String(i + 1).padStart(2)} ${Math.round(v.durationSec)}s ${v.ageDays}d ${k(v.plays)} r=${v.ratio} snd=${v.soundCreators}/${v.soundCreatorsRecent14}r ${v.borrowedSound ? 'BORROW ' : ''}${v.template ? 'TPL ' : ''}${prevFinal.has(v.url) ? 'PREV ' : ''}${v.lang}/${v.loc} [${v.pools.join(',')}] @${v.author} | ${v.soundName.slice(0, 28)} | ${v.caption.slice(0, 80)}`));
