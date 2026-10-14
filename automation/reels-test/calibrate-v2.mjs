// Calibration v2 (no Apify calls): down-rank niche/performance-heavy formats in the 107 screen-passers using
// captions/hashtags/sound names only, and list the rest for visual review (cover frames next).
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-03-correction');
const screen = JSON.parse(fs.readFileSync(path.join(dir, 'mechanic-screen.json'), 'utf8'));

const DOWN = [
  ['outfit/fashion', /\b(outfit|ootd|fashion|styleinspo|suit|dress|hoco|grwm)\b/i],
  ['beauty/makeup', /\b(makeup|glowup|glow up|glam|skincare|acne|lash|brow|beauty)\b/i],
  ['hair', /\b(hair|braids|haircut|straightening|miracleknots)\b/i],
  ['nails', /\bnail/i],
  ['dance', /\b(dance|dancing|danc|joget|milly rock|2persondance|duo)\b/i],
  ['cosplay/costume', /\b(cosplay|costume|avatar|halloween)\b/i],
  ['gaming/fandom', /\b(roblox|gacha|genshin|mlbb)\b/i],
];
const rows = screen.videos.map((v) => {
  const hay = `${v.caption} ${v.soundName}`;
  const flags = DOWN.filter(([, re]) => re.test(hay)).map(([n]) => n);
  return { ...v, downFlags: flags };
});
const keep = rows.filter((r) => r.downFlags.length === 0);
const down = rows.filter((r) => r.downFlags.length > 0);
fs.writeFileSync(path.join(dir, 'calibrate-v2-prefilter.json'), JSON.stringify({ kept: keep, downRanked: down.map(({ videoId, url, author, downFlags }) => ({ videoId, url, author, downFlags })) }, null, 2));
console.log(`107 -> keep for visual review ${keep.length}, down-ranked ${down.length}`);
const tally = {}; for (const r of down) for (const f of r.downFlags) tally[f] = (tally[f] || 0) + 1; console.log('down-rank reasons:', JSON.stringify(tally));
keep.forEach((v, i) => console.log(`${String(i + 1).padStart(2)} ${Math.round(v.durationSec)}s ${Math.round(v.plays / 1e3)}K snd=${v.soundCreators}/${v.soundCreatorsRecent14}r @${v.author} | ${v.soundName.slice(0, 26)} | ${v.caption.slice(0, 70)}`));
fs.writeFileSync(path.join(dir, 'keep-urls.json'), JSON.stringify(keep.map((v) => v.url)));
