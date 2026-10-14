// Test #2, Stages 3-4: sound verification for newly shortlisted sounds (clockworks/tiktok-sound-scraper).
// Source facts only: distinct creators, recent uses, earliest/newest sampled use, high performers, and the other
// creators' videos (which become extra examples / extra breakout candidates).
import fs from 'node:fs';
import path from 'node:path';
import { apify, runActor, DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-02');
const soundIds = process.argv.slice(2);
const PER_SOUND = 10;

const lim = (await apify('/users/me/limits')).data;
const remaining = lim.limits.maxMonthlyUsageUsd - lim.current.monthlyUsageUsd;
const CAP = 0.5; // Clockworks minimum; actual charge is bounded by maxItems (~$0.005 x items)
const expected = soundIds.length * PER_SOUND * 0.005 + 0.01;
console.log(`remaining $${remaining.toFixed(3)}, expected ~$${expected.toFixed(2)}`);
if (expected > remaining - 0.05) { console.log('Would exceed free credit. Stopping.'); process.exit(1); }

const { items, rec } = await runActor('clockworks/tiktok-sound-scraper',
  { musics: soundIds.map((id) => `https://www.tiktok.com/music/original-sound-${id}`), resultsPerPage: PER_SOUND },
  { maxItems: soundIds.length * PER_SOUND, maxTotalChargeUsd: CAP, timeoutSecs: 900, label: 'verify:test-02:sound-scraper' });
fs.writeFileSync(path.join(dir, 'raw', 'clockworks-sound-verify.json'), JSON.stringify(items));

const now = Date.now();
const out = {};
for (const id of soundIds) {
  const vids = items.filter((i) => String(i.musicMeta?.musicId) === id);
  const inDays = (d) => vids.filter((v) => now - Date.parse(v.createTimeISO) <= d * 86_400_000);
  out[id] = {
    soundName: vids[0]?.musicMeta?.musicName ?? null, sampled: vids.length,
    distinctCreators: new Set(vids.map((v) => v.authorMeta?.name)).size,
    creatorsLast7d: new Set(inDays(7).map((v) => v.authorMeta?.name)).size,
    creatorsLast14d: new Set(inDays(14).map((v) => v.authorMeta?.name)).size,
    highPerformers100k: vids.filter((v) => v.playCount >= 100_000).length,
    earliestSampledUse: vids.map((v) => v.createTimeISO).sort()[0] ?? null,
    newestSampledUse: vids.map((v) => v.createTimeISO).sort().at(-1) ?? null,
    examples: vids.sort((a, b) => b.playCount - a.playCount).map((v) => ({ url: v.webVideoUrl, author: v.authorMeta?.name, followers: v.authorMeta?.fans, plays: v.playCount, postedAt: v.createTimeISO, durationSec: v.videoMeta?.duration, template: (v.effectStickers || []).some((e) => /template/i.test(e.name || '')) })),
  };
}
fs.writeFileSync(path.join(dir, 'sound-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), perSound: PER_SOUND, run: rec, sounds: out }, null, 2));
console.log(JSON.stringify(rec));
for (const [id, o] of Object.entries(out)) console.log(`${(o.soundName || id).slice(0, 36).padEnd(36)} sampled=${o.sampled} creators=${o.distinctCreators} last7d=${o.creatorsLast7d} last14d=${o.creatorsLast14d} >=100K=${o.highPerformers100k} earliest=${(o.earliestSampledUse || '').slice(0, 10)} newest=${(o.newestSampledUse || '').slice(0, 10)}`);
