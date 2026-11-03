// Christmas countdown Reels: 4 very quick Pexels cuts, then one longer clip. On top the whole time: the title in
// Mountains of Christmas (red, white outline) and the rest of her line in plain black text on white highlight boxes.
// Every clip is levelled first (exposure evened out), then gets the same look so the mixed stock reads as one set.
// The title pops in on frame 1 (with a soft sparkle), the white boxes slide up one line at a time (with one soft pop).
// The longer clip is always a lived-in one (hands, mugs, slippers...) with a slow handheld push-in.
//   node build.mjs 51 50              render those days (look C, natural: her pick 2026-11-03)
//   node build.mjs all --look A       render every line in lines.json, one at a time
//   node build.mjs sheet              before/after still of 8 clips: raw, look C, look A, look B
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
const LINES_AT = 0.3, LINE_GAP = 0.12;   // white boxes: first one at 0.3s, then one every 0.12s
const SFX = path.join(HERE, '../../reel-hf/lib/assets/sfx');
const SKIP = ['5766093-uhd_4096_2160_30fps.mp4']; // has its own "merry christmas" letters, fights the text
const RED = '#C2362F';                   // holiday kit red
const GREEN = '#1F7A45';                 // pairs with it in the script word

// per clip, before the look: even out exposure so dark and bright clips meet in the middle
const LEVEL = 'normalize=smoothing=24:independence=0.3:strength=0.55';
const LOOKS = {
  // C: natural match. Her colours kept (she liked the untouched clips best); only a touch of contrast, a hair warmer
  // so the blue snow sits with the cosy indoor clips, and a fine grain so they share one texture
  C: [
    'eq=contrast=1.04:saturation=1.03',
    'colorbalance=rs=0.02:bs=-0.03:rm=0.01:bm=-0.02:rh=0.02:bh=-0.02',
    'noise=alls=3:allf=t+u',
  ].join(','),
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

// the longer clip is always one of these: hands, mugs, slippers, a home. Empty pretty shots (snow, the city tree,
// landscapes) read as stock when they hold, so they only flash
const LIVED_IN = ['12649870_2160_3840_30fps.mp4', '12715369_2160_3840_30fps.mp4', '12726790_2160_3840_30fps.mp4',
  '14697192-hd_1080_1620_30fps.mp4', '14846655_2160_3840_30fps.mp4', '14988566_1080_1920_60fps.mp4',
  '19387113-uhd_2160_3840_60fps.mp4', '5970198-uhd_2160_4096_25fps.mp4', '6032907-hd_1080_1920_25fps.mp4',
  '6214615-hd_1080_1920_25fps.mp4', '6283475-hd_1080_1920_30fps.mp4', '6099570-hd_1080_1920_25fps.mp4'];

const shuffle = (list, seed) => {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// clips for every day, in posting order: heroes take turns (12 days apart), and no clip comes back within 5 days,
// so days 51-47 share none. Fixed seeds: a day always gets the same clips.
const SCHEDULE = (() => {
  const heroes = shuffle(LIVED_IN.filter((f) => clips.includes(f)), 7);
  const order = shuffle(clips, 11);
  const out = {};
  const recent = [];
  let q = 0;
  lines.forEach((l, i) => {
    const hero = heroes[i % heroes.length];
    // also don't flash a clip that holds in the next few days; with only ~27 clips, look less far ahead when needed
    let quick = [];
    for (let ahead = 4; ahead >= 0 && quick.length < QUICK; ahead--) {
      const soon = [...Array(ahead).keys()].map((k) => heroes[(i + k + 1) % heroes.length]);
      const blocked = new Set([hero, ...soon, ...recent.slice(-4).flat()]);
      const free = order.filter((c) => !blocked.has(c));
      if (free.length < QUICK) continue;
      quick = [];
      for (let k = 0; quick.length < QUICK; k++) {
        const c = order[(q + k) % order.length];
        if (!blocked.has(c) && !quick.includes(c)) quick.push(c);
      }
      q += QUICK;
    }
    out[l.day] = [...quick, hero];
    recent.push(out[l.day]);
  });
  return out;
})();

// long lines get a second longer so they can be read
const words = (l) => `${l.title.replace(/[*~]/g, '')} ${l.body}`.split(/\s+/).length;
const duration = (l) => (words(l) > 22 ? 7 : 6);

async function textPng(page, line, file) {
  await layout(page, line);
  await page.screenshot({ path: file, omitBackground: true });
}

// the text as two layers (title, body) plus where each piece sits, so ffmpeg can animate them
const PAD = 34; // room for the white outline + shadow around the title
async function textLayers(page, line, base) {
  await layout(page, line);
  const box = await page.evaluate((pad) => {
    const r = document.querySelector('.title').getBoundingClientRect();
    const t = { x: Math.max(0, Math.floor(r.left) - pad), y: Math.max(0, Math.floor(r.top) - pad) };
    t.w = Math.ceil(r.right) + pad - t.x; t.h = Math.ceil(r.bottom) + pad - t.y;
    t.w += t.w % 2; t.h += t.h % 2;
    const lines = [...document.querySelector('.hl').getClientRects()].map((q) => ({
      x: Math.floor(q.left) - 3, y: Math.floor(q.top) - 3, w: Math.ceil(q.width) + 6, h: Math.ceil(q.height) + 6 }));
    return { t, lines };
  }, PAD);
  const files = { title: `${base}-title.png`, body: `${base}-body.png` };
  await page.evaluate(() => { document.querySelector('.body').style.visibility = 'hidden'; });
  await page.screenshot({ path: files.title, omitBackground: true });
  await page.evaluate(() => { document.querySelector('.body').style.visibility = ''; document.querySelector('.title').style.visibility = 'hidden'; });
  await page.screenshot({ path: files.body, omitBackground: true });
  return { ...box, files };
}

async function layout(page, { title, body }) {
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
}

async function render(page, line, look) {
  const { day } = line;
  const total = duration(line);
  const picks = SCHEDULE[day];
  const lens = [...Array(QUICK).fill(QUICK_LEN), +(total - QUICK * QUICK_LEN).toFixed(2)];
  const durs = picks.map((f) => probe(path.join(CLIPS, f)));
  // a short hero clip plays a little less sped-up so it still fills the time
  const speeds = [...Array(QUICK).fill(SPEED_QUICK), Math.min(SPEED_HERO, (durs[QUICK] - 0.3) / lens[QUICK])];
  const T = await textLayers(page, line, path.join(OUT, `.day-${day}`));

  const args = [];
  const chains = [];
  picks.forEach((f, i) => {
    const need = lens[i] * speeds[i];
    const start = Math.max(0, Math.min(1, durs[i] - need - 0.1)); // skip the first second when there's room
    args.push('-ss', String(start), '-t', String(need + 0.2), '-i', path.join(CLIPS, f));
    const base = `[${i}:v]setpts=PTS/${speeds[i]},fps=${FPS},${FIT},${LEVEL},trim=duration=${lens[i]},setpts=PTS-STARTPTS`;
    if (i < QUICK) { chains.push(`${base}[v${i}]`); return; }
    // handheld feel on the longer clip: a slow push-in (3% → 7%) with a small drift that never repeats evenly
    const N = Math.round(lens[i] * FPS);
    chains.push(`${base},zoompan=z='1.03+0.04*on/${N}':x='iw/2-iw/zoom/2+7*sin(on/8)+3*sin(on/3.1)':` +
      `y='ih/2-ih/zoom/2+5*sin(on/11+1)+2*sin(on/4.3)':d=1:s=${W}x${H}:fps=${FPS}[v${i}]`);
  });
  const n = picks.length;
  args.push('-loop', '1', '-t', String(total), '-i', T.files.title);
  args.push('-loop', '1', '-t', String(total), '-i', T.files.body);
  args.push('-i', path.join(SFX, 'sparkle.mp3'), '-i', path.join(SFX, 'pop-light.mp3'));
  const [iT, iB, iS, iP] = [n, n + 1, n + 2, n + 3];

  // title: on screen from frame 1, pops from 75% to full size with a small overshoot (ease-out-back, 0.25s)
  const t = T.t;
  const S = `if(lt(t,0.25),0.75+0.25*(1+2.70158*pow(t/0.25-1,3)+1.70158*pow(t/0.25-1,2)),1)`;
  const fc = [...chains,
    `${picks.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0,${LOOKS[look]}[bg]`,
    `[${iT}:v]format=rgba,crop=${t.w}:${t.h}:${t.x}:${t.y},scale=w='2*trunc(iw*${S}/2)':h='2*trunc(ih*${S}/2)':eval=frame[tt]`,
    `[bg][tt]overlay=x='${t.x + t.w / 2}-overlay_w/2':y='${t.y + t.h / 2}-overlay_h/2':eval=frame[s0]`];
  // body: each white box rises 40px and fades in, one line after another
  const L = T.lines;
  fc.push(`[${iB}:v]format=rgba,split=${L.length}${L.map((_, i) => `[b${i}]`).join('')}`);
  L.forEach((r, i) => {
    const st = (LINES_AT + i * LINE_GAP).toFixed(2);
    fc.push(`[b${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},fade=in:st=${st}:d=0.2:alpha=1[l${i}]`);
    fc.push(`[s${i}][l${i}]overlay=x=${r.x}:y='${r.y}+40*pow(1-min(1,max(0,(t-${st})/0.25)),3)':eval=frame[s${i + 1}]`);
  });
  fc.push(`[s${L.length}]format=yuv420p[out]`);
  // sound: sparkle as the title lands, one soft pop as the first box arrives; quiet, so her Instagram song sits on top
  const ms = Math.round(LINES_AT * 1000);
  fc.push(`[${iS}:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.45[a1]`);
  fc.push(`[${iP}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms},volume=0.6[a2]`);
  fc.push(`[a1][a2]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:${total}[aout]`);

  const file = path.join(OUT, `day-${day}.mp4`);
  args.push('-filter_complex', fc.join(';'), '-map', '[out]', '-map', '[aout]', '-t', String(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-c:a', 'aac', '-movflags', '+faststart', file);
  ff(args);
  rmSync(T.files.title, { force: true }); rmSync(T.files.body, { force: true });
  console.log(`day ${day}: ${file}  (${total}s, look ${look}; clips ${picks.join(', ')})`);
}

// 8 clips across the range (snow, candles, pink flat-lay, ornaments...) in four rows: raw / C / A / B
function sheet() {
  const some = ['12948642_1080_1920_30fps.mp4', '6283475-hd_1080_1920_30fps.mp4', '5715559-hd_1080_1920_30fps.mp4',
    '14988566_1080_1920_60fps.mp4', '12726790_2160_3840_30fps.mp4', '19387113-uhd_2160_3840_60fps.mp4',
    '14846655_2160_3840_30fps.mp4', 'uhd_60fps.mp4'];
  const args = [];
  some.forEach((f) => args.push('-ss', '2', '-i', path.join(CLIPS, f)));
  const rows = { raw: '', C: `,${LEVEL},${LOOKS.C}`, A: `,${LEVEL},${LOOKS.A}`, B: `,${LEVEL},${LOOKS.B}` };
  const parts = [];
  some.forEach((_, i) => parts.push(`[${i}:v]trim=end_frame=1,${FIT},split=4[r${i}][c${i}][a${i}][b${i}]`));
  for (const [k, chain] of Object.entries(rows)) {
    const tag = k === 'raw' ? 'r' : k.toLowerCase();
    some.forEach((_, i) => parts.push(`[${tag}${i}]null${chain},scale=270:480[${tag}s${i}]`));
    parts.push(`${some.map((_, i) => `[${tag}s${i}]`).join('')}hstack=inputs=${some.length}[row${tag}]`);
  }
  parts.push('[rowr][rowc][rowa][rowb]vstack=inputs=4[out]');
  const file = path.join(OUT, 'filter-compare.png');
  ff([...args, '-filter_complex', parts.join(';'), '-map', '[out]', '-frames:v', '1', file]);
  console.log(`sheet: ${file}  (rows: original, look C, look A, look B)`);
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
const look = li >= 0 ? argv.splice(li, 2)[1].toUpperCase() : 'C';
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
