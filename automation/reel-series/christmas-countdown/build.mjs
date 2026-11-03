// Christmas countdown Reels: 4 very quick Pexels cuts, then one longer clip, one line of her text on top the whole time.
// Every clip gets the same warm film grade so the mixed stock reads as one set, and is sped up.
//   node build.mjs 51 50        render those days
//   node build.mjs all          render every line in lines.json (one at a time, never in parallel)
// Clips: reel-template-pack/assets/Christmas. Output: <exports>/christmas-countdown/day-<n>.mp4 (OneDrive, not git).
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(HERE, '../../reel-template-pack/assets/Christmas');
const OUT = path.join(P.exports, 'christmas-countdown');
const FONT_B64 = readFileSync(path.join(HERE, '../../reel-hf/lib/assets/fonts/figtree.woff2')).toString('base64');

const W = 1080, H = 1920, FPS = 30;
const QUICK = 4, QUICK_LEN = 0.4;        // seconds each on screen
const SPEED_QUICK = 2, SPEED_HERO = 1.5; // playback speed-up
const SKIP = ['5766093-uhd_4096_2160_30fps.mp4']; // has its own "merry christmas" letters, fights the text
const INK = '#0a1930';                    // navy text, white outline

// same look on every clip: lifted blacks, warm highlights, a little less colour, soft grain + vignette
const GRADE = [
  'eq=contrast=1.06:saturation=0.86:brightness=0.01',
  'colorbalance=rs=0.04:bs=-0.04:rm=0.03:bm=-0.03:rh=0.05:gh=0.01:bh=-0.05',
  "curves=all='0/0.05 0.25/0.24 0.75/0.78 1/0.96'",
  'noise=alls=5:allf=t+u',
  'vignette=PI/5',
].join(',');

const lines = JSON.parse(readFileSync(path.join(HERE, 'lines.json'), 'utf8'));
const clips = readdirSync(CLIPS).filter((f) => f.toLowerCase().endsWith('.mp4') && !SKIP.includes(f)).sort();
const probe = (f) => +execFileSync(tool('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

// seeded shuffle so a day always gets the same clips, and neighbouring days get different ones
function pick(day) {
  let s = day * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a = [...clips];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, QUICK + 1);
}

// long lines get a second longer so they can be read
const duration = (text) => (text.split(/\s+/).length > 22 ? 7 : 6);

async function textPng(page, text, file) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = esc(text).replace(/(\p{Extended_Pictographic}️?)/gu, '<span class="e">$1</span>');
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Figtree; src: url(data:font/woff2;base64,${FONT_B64}) format('woff2'); font-weight: 300 900; }
    html, body { margin: 0; width: ${W}px; height: ${H}px; background: transparent; }
    .t { position: absolute; left: 80px; right: 80px; top: 360px; text-align: center;
         font: 800 70px/1.18 Figtree, sans-serif; color: ${INK}; letter-spacing: -0.5px;
         -webkit-text-stroke: 11px #fff; paint-order: stroke fill; }
    .e { -webkit-text-stroke: 0; font-family: 'Segoe UI Emoji', sans-serif; }
  </style></head><body><div class="t">${html}</div></body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: true });
}

async function render(page, { day, text }) {
  const total = duration(text);
  const picks = pick(day);
  const lens = [...Array(QUICK).fill(QUICK_LEN), +(total - QUICK * QUICK_LEN).toFixed(2)];
  const speeds = [...Array(QUICK).fill(SPEED_QUICK), SPEED_HERO];
  const png = path.join(OUT, `.day-${day}-text.png`);
  await textPng(page, text, png);

  const args = ['-v', 'error', '-y'];
  const chains = [];
  picks.forEach((f, i) => {
    const src = path.join(CLIPS, f);
    const need = lens[i] * speeds[i];
    const start = Math.max(0, Math.min(1, probe(src) - need - 0.1)); // skip the first second when there's room
    args.push('-ss', String(start), '-t', String(need + 0.2), '-i', src);
    chains.push(`[${i}:v]setpts=PTS/${speeds[i]},fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,` +
      `crop=${W}:${H},setsar=1,trim=duration=${lens[i]},setpts=PTS-STARTPTS[v${i}]`);
  });
  const n = picks.length;
  args.push('-loop', '1', '-t', String(total), '-i', png);
  args.push('-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=r=48000:cl=stereo');
  const fc = [...chains,
    `${picks.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0,${GRADE}[bg]`,
    `[bg][${n}:v]overlay=0:0:shortest=1,format=yuv420p[out]`].join(';');
  const file = path.join(OUT, `day-${day}.mp4`);
  args.push('-filter_complex', fc, '-map', '[out]', '-map', `${n + 1}:a`, '-t', String(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-c:a', 'aac', '-shortest', '-movflags', '+faststart', file);
  execFileSync(tool('ffmpeg'), args, { stdio: ['ignore', 'inherit', 'inherit'] });
  console.log(`day ${day}: ${file}  (${total}s; clips ${picks.join(', ')})`);
}

const want = process.argv.slice(2);
const todo = want.includes('all') ? lines : lines.filter((l) => want.includes(String(l.day)));
if (!todo.length) { console.log('usage: node build.mjs <day> [day...] | all'); process.exit(1); }
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const b = await launch();
const page = await b.newPage();
await page.setViewport({ width: W, height: H });
for (const l of todo) await render(page, l);
await b.close();
