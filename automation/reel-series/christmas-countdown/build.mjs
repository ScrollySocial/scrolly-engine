// Christmas countdown Reels: 4 very quick Pexels cuts, then one longer clip. On top the whole time: the title in
// Mountains of Christmas (red, white outline) and the rest of her line in plain black text on white highlight boxes.
// Every clip is levelled first (exposure evened out), then gets the same look so the mixed stock reads as one set.
//   node build.mjs 51 50              render those days (look A)
//   node build.mjs all --look B       render every line in lines.json, one at a time
//   node build.mjs sheet              before/after still of 8 clips: raw, look A, look B
//   node build.mjs titles             every day's text on one still, to check them all at once
// Clips: reel-template-pack/assets/Christmas. Output: <exports>/christmas-countdown/ (OneDrive, not git).
import { readFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(HERE, '../../reel-template-pack/assets/Christmas');
const OUT = path.join(P.exports, 'christmas-countdown');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const b64 = (f) => readFileSync(path.join(FONTS, f)).toString('base64');
const BODY_FONT = b64('figtree.woff2');
const own = (f) => readFileSync(path.join(HERE, 'fonts', f)).toString('base64');
const TITLE_FONT = own('mountains-of-christmas-bold.ttf'); // her pick 2026-11-03
// a title with *a word* in it: that word in a red/green script on its own line, the rest handwritten (day 51)
const HAND_FONT = b64('covered-by-your-grace.woff2'), SCRIPT_FONT = own('pacifico.ttf');

const W = 1080, H = 1920, FPS = 30;
const QUICK = 4, QUICK_LEN = 0.4;        // seconds each on screen
const SPEED_QUICK = 2, SPEED_HERO = 1.5; // playback speed-up
const ZOOM = 1.04;                       // crops stray edges off every clip
const SKIP = ['5766093-uhd_4096_2160_30fps.mp4']; // has its own "merry christmas" letters, fights the text
const RED = '#C2362F';                   // holiday kit red
const GREEN = '#1F7A45';                 // pairs with it in the script word

// per clip, before the look: even out exposure so dark and bright clips meet in the middle
const LEVEL = 'normalize=smoothing=24:independence=0.3:strength=0.55';
const LOOKS = {
  // A: warm film. Matte blacks, golden highlights, less colour, glow, grain
  A: [
    'eq=contrast=1.05:saturation=0.74:gamma=1.04',
    'colorbalance=rs=0.06:gs=0.01:bs=-0.06:rm=0.05:bm=-0.05:rh=0.07:gh=0.02:bh=-0.08',
    "curves=all='0/0.09 0.3/0.3 0.7/0.72 1/0.94'",
    'split[a][b];[b]gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.18',
    'vignette=PI/5.5', 'noise=alls=7:allf=t+u', // grain after the vignette dithers away its rings
  ].join(','),
  // B: faded cream. Softer and lighter, cream-tinted, very muted colour
  B: [
    'eq=contrast=0.94:saturation=0.62:gamma=1.10',
    'colorbalance=rs=0.04:bs=-0.03:rm=0.04:gm=0.01:bm=-0.04:rh=0.04:gh=0.03:bh=-0.03',
    "curves=all='0/0.14 0.5/0.54 1/0.95'",
    'vignette=PI/6', 'noise=alls=6:allf=t+u',
  ].join(','),
};
// fit to 9:16, a little zoom, and an even-pixel centre crop (an odd crop left a coloured line on the edge)
const FIT = `scale=${Math.round(W * ZOOM / 2) * 2}:${Math.round(H * ZOOM / 2) * 2}:force_original_aspect_ratio=increase,` +
  `crop=${W}:${H}:floor((iw-${W})/4)*2:floor((ih-${H})/4)*2,setsar=1`;

const lines = JSON.parse(readFileSync(path.join(HERE, 'lines.json'), 'utf8'));
const clips = readdirSync(CLIPS).filter((f) => f.toLowerCase().endsWith('.mp4') && !SKIP.includes(f)).sort();
const probe = (f) => +execFileSync(tool('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

// seeded shuffle so a day always gets the same clips, and neighbouring days get different ones
function pick(day) {
  let s = day * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a = [...clips];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, QUICK + 1);
}

// long lines get a second longer so they can be read
const words = (l) => `${l.title.replace(/[*~]/g, '')} ${l.body}`.split(/\s+/).length;
const duration = (l) => (words(l) > 22 ? 7 : 6);

async function textPng(page, { title, body }, file) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/(\p{Extended_Pictographic}️?)/gu, '<span class="e">$1</span>');
  const plain = title.replace(/[*~]/g, '');
  const tSize = plain.length <= 26 ? 132 : plain.length <= 40 ? 108 : 90; // a thin font, so a size up
  const mixed = title.includes('*');
  const alternate = (w) => [...w].map((ch, i) => `<span style="color:${i % 2 ? GREEN : RED}">${ch}</span>`).join('');
  const titleHtml = esc(title).replace(/\*([^*]+)\*/g, (_, w) => `<span class="script">${alternate(w)}</span>`)
    .replace(/~([^~]+)~/g, '<span class="hand">$1</span>'); // ~words~ = that part handwritten on its own line (day 50)
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Figtree; src: url(data:font/woff2;base64,${BODY_FONT}) format('woff2'); font-weight: 300 900; }
    @font-face { font-family: Cute; src: url(data:font/ttf;base64,${TITLE_FONT}); font-weight: 700; }
    @font-face { font-family: Hand; src: url(data:font/woff2;base64,${HAND_FONT}) format('woff2'); }
    @font-face { font-family: Script; src: url(data:font/ttf;base64,${SCRIPT_FONT}); }
    html, body { margin: 0; width: ${W}px; height: ${H}px; background: transparent; }
    .wrap { position: absolute; left: 70px; right: 70px; top: 300px; text-align: center; }
    /* line-height 1.18: at 1.02 the white outlines of the two lines ran into each other */
    .title { font: 700 ${tSize}px/1.18 Cute, cursive; color: ${RED}; -webkit-text-stroke: 14px #fff;
             paint-order: stroke fill; margin-bottom: 34px; filter: drop-shadow(0 4px 10px rgba(0,0,0,.25)); }
    .title.mixed { font: 400 ${tSize}px/1.1 Hand, cursive; }
    .hand { display: block; font: 400 ${tSize}px/1.1 Hand, cursive; margin-top: 4px; }
    .script { display: block; font: 400 ${Math.round(tSize * 1.25)}px/1.3 Script, cursive; margin-top: 6px; }
    .title, .body { text-wrap: balance; }  /* even line lengths, no lone last word */
    .body { font: 600 54px/1.5 Figtree, sans-serif; color: #000; }
    .body span.hl { background: #fff; padding: 6px 18px; border-radius: 12px;
                    -webkit-box-decoration-break: clone; box-decoration-break: clone; }
    .e { font-family: 'Segoe UI Emoji', sans-serif; -webkit-text-stroke: 0; }
  </style></head><body><div class="wrap">
    <div class="title${mixed ? ' mixed' : ''}">${titleHtml}</div>
    <div class="body"><span class="hl">${esc(body)}</span></div>
  </div></body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: true });
}

async function render(page, line, look) {
  const { day } = line;
  const total = duration(line);
  const picks = pick(day);
  const lens = [...Array(QUICK).fill(QUICK_LEN), +(total - QUICK * QUICK_LEN).toFixed(2)];
  const speeds = [...Array(QUICK).fill(SPEED_QUICK), SPEED_HERO];
  const png = path.join(OUT, `.day-${day}-text.png`);
  await textPng(page, line, png);

  const args = [];
  const chains = [];
  picks.forEach((f, i) => {
    const src = path.join(CLIPS, f);
    const need = lens[i] * speeds[i];
    const start = Math.max(0, Math.min(1, probe(src) - need - 0.1)); // skip the first second when there's room
    args.push('-ss', String(start), '-t', String(need + 0.2), '-i', src);
    chains.push(`[${i}:v]setpts=PTS/${speeds[i]},fps=${FPS},${FIT},${LEVEL},trim=duration=${lens[i]},setpts=PTS-STARTPTS[v${i}]`);
  });
  const n = picks.length;
  args.push('-loop', '1', '-t', String(total), '-i', png);
  args.push('-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=r=48000:cl=stereo');
  const fc = [...chains,
    `${picks.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0,${LOOKS[look]}[bg]`,
    `[bg][${n}:v]overlay=0:0:shortest=1,format=yuv420p[out]`].join(';');
  const file = path.join(OUT, `day-${day}.mp4`);
  args.push('-filter_complex', fc, '-map', '[out]', '-map', `${n + 1}:a`, '-t', String(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-c:a', 'aac', '-shortest', '-movflags', '+faststart', file);
  ff(args);
  rmSync(png, { force: true });
  console.log(`day ${day}: ${file}  (${total}s, look ${look}; clips ${picks.join(', ')})`);
}

// 8 clips across the range (snow, candles, pink flat-lay, ornaments...) in three rows: raw / A / B
function sheet() {
  const some = ['12948642_1080_1920_30fps.mp4', '6283475-hd_1080_1920_30fps.mp4', '5715559-hd_1080_1920_30fps.mp4',
    '14988566_1080_1920_60fps.mp4', '12726790_2160_3840_30fps.mp4', '19387113-uhd_2160_3840_60fps.mp4',
    '14846655_2160_3840_30fps.mp4', 'uhd_60fps.mp4'];
  const args = [];
  some.forEach((f) => args.push('-ss', '2', '-i', path.join(CLIPS, f)));
  const rows = { raw: '', A: `,${LEVEL},${LOOKS.A}`, B: `,${LEVEL},${LOOKS.B}` };
  const parts = [];
  some.forEach((_, i) => parts.push(`[${i}:v]trim=end_frame=1,${FIT},split=3[r${i}][a${i}][b${i}]`));
  for (const [k, chain] of Object.entries(rows)) {
    const tag = k === 'raw' ? 'r' : k.toLowerCase();
    some.forEach((_, i) => parts.push(`[${tag}${i}]null${chain},scale=270:480[${tag}s${i}]`));
    parts.push(`${some.map((_, i) => `[${tag}s${i}]`).join('')}hstack=inputs=${some.length}[row${tag}]`);
  }
  parts.push('[rowr][rowa][rowb]vstack=inputs=3[out]');
  const file = path.join(OUT, 'filter-compare.png');
  ff([...args, '-filter_complex', parts.join(';'), '-map', '[out]', '-frames:v', '1', file]);
  console.log(`sheet: ${file}  (top: original, middle: look A, bottom: look B)`);
}

// every day's text over one clip still, 6 across, to check all the titles without rendering videos
async function titles(page) {
  const dir = path.join(OUT, '.titles');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const bg = path.join(dir, 'bg.png');
  ff(['-ss', '2', '-i', path.join(CLIPS, '14988566_1080_1920_60fps.mp4'), '-frames:v', '1', '-vf', `${FIT},${LEVEL},${LOOKS.A}`, bg]);
  for (const [i, l] of lines.entries()) await textPng(page, l, path.join(dir, `${String(i).padStart(2, '0')}.png`));
  const file = path.join(OUT, 'titles-all.png');
  ff(['-i', bg, '-i', path.join(dir, '%02d.png'), '-filter_complex',
    `[0:v]loop=${lines.length - 1}:1:0[b];[b][1:v]overlay,crop=${W}:1000:0:240,scale=360:-2,tile=6x${Math.ceil(lines.length / 6)}`,
    '-frames:v', '1', file]);
  rmSync(dir, { recursive: true, force: true });
  console.log(`titles: ${file}`);
}

const argv = process.argv.slice(2);
const li = argv.indexOf('--look');
const look = li >= 0 ? argv.splice(li, 2)[1].toUpperCase() : 'A';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (argv.includes('sheet')) { sheet(); process.exit(0); }
const todo = argv.includes('all') ? lines : lines.filter((l) => argv.includes(String(l.day)));
if ((!todo.length && !argv.includes('titles')) || !LOOKS[look]) { console.log('usage: node build.mjs <day> [day...] | all | sheet | titles  [--look A|B]'); process.exit(1); }
const b = await launch();
const page = await b.newPage();
await page.setViewport({ width: W, height: H });
if (argv.includes('titles')) await titles(page);
for (const l of todo) await render(page, l, look);
await b.close();
