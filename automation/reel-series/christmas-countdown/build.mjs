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
// 2026-11-03 round 2: 4 × 0.4s at 2x was too fast to take in; now 3 × 1s with soft crossfades, less speed-up
const QUICK = 3, QUICK_LEN = 1.0;        // seconds each (including the crossfade)
const XF = 0.35;                         // crossfade between clips
const SPEED_QUICK = 1.25, SPEED_HERO = 1.3; // playback speed-up
const ZOOM = 1.04;                       // crops stray edges off every clip
const POP = 0.45;                        // title grows in over this long
const LINES_AT = 0.6, LINE_GAP = 0.35, LINE_IN = 0.45; // white boxes: first at 0.6s, then one every 0.35s
const SFX = path.join(HERE, '../../reel-hf/lib/assets/sfx');
// these have their own words (MERRY, merry christmas) that the text covers or fights
const SKIP = ['5766093-uhd_4096_2160_30fps.mp4', '5715559-hd_1080_1920_30fps.mp4'];
// what each clip shows, as tags: a Reel never has two clips sharing a tag (two trees, two hot drinks looked odd).
// 'tree' = a Christmas tree anywhere in the shot, also behind ornaments, slippers, the train or candles (day 48 had 3)
const SUBJECT = {
  '12649870_2160_3840_30fps.mp4': 'food', '6214615-hd_1080_1920_25fps.mp4': 'food',
  '12715369_2160_3840_30fps.mp4': 'drink', '12726790_2160_3840_30fps.mp4': 'drink', '14697192-hd_1080_1620_30fps.mp4': 'drink',
  '12748878_2160_3606_60fps.mp4': 'ornament+tree', '12840394_1080_1920_25fps.mp4': 'ornament', '5970198-uhd_2160_4096_25fps.mp4': 'ornament+tree',
  '6098629-hd_1080_1920_25fps.mp4': 'ornament+tree', '6099394-hd_1080_1920_25fps.mp4': 'ornament+tree', '6099570-hd_1080_1920_25fps.mp4': 'ornament+tree',
  '12948642_1080_1920_30fps.mp4': 'bird', '20585555-hd_1080_1920_30fps.mp4': 'bird',
  '14827864_1080_1920_30fps.mp4': 'snow', '15019021_2160_3840_30fps.mp4': 'snow', 'uhd_60fps.mp4': 'snow',
  '14884414_1080_1920_60fps.mp4': 'tree', '15177846_2160_3840_30fps.mp4': 'tree+snow', '19733270-uhd_2160_3840_60fps.mp4': 'tree+lights',
  '6032907-hd_1080_1920_25fps.mp4': 'tree',
  '14846655_2160_3840_30fps.mp4': 'toy+tree', '14988566_1080_1920_60fps.mp4': 'candle', '6283475-hd_1080_1920_30fps.mp4': 'candle+tree',
  '19387113-uhd_2160_3840_60fps.mp4': 'cosy+tree', '19733272-uhd_2160_3840_60fps.mp4': 'lights', '3321566-hd_1920_1080_25fps.mp4': 'nativity',
  // her b-roll
  'desk-coffee-sip-01.mp4': 'drink', 'wall-coffee-sip-02.mp4': 'drink', 'wall-coffee-step-in-01.mp4': 'drink',
};
const tags = (f) => (SUBJECT[path.basename(f)] || '').split('+').filter(Boolean);
// her picks for the longer clip on a stock day (instead of the rotation)
const HERO_FOR = { 48: '14697192-hd_1080_1620_30fps.mp4' }; // the hot chocolate
// her own b-roll as the longer clip on the days where the line is her talking (already handheld: no added drift)
const BROLL = path.join(P.footage, 'broll');
const HER = {
  // 47 had wall-coffee-sip-01: she scrapped it (2026-11-03), so 47 is a stock day now
  51: 'couch-lookup-smile-01.mp4', 49: 'desk-coffee-sip-01.mp4', 45: 'couch-writing-01.mp4',
  42: 'desk-typing-01.mp4', 39: 'notebook-hand-01.mp4', 37: 'wall-coffee-sip-02.mp4', 34: 'typing-overhead-01.mp4',
  31: 'desk-typing-from-behind-01.mp4', 30: 'wall-coffee-step-in-01.mp4',
};
// on these her face is in the top half, so the text sits lower (over her sweater/desk), never over her face
const LOW_TEXT = new Set([51, 45, 37, 31, 30]); // 31: she turns round at the end
// exact spots where the usual ones touch her face: 49 mid-frame face (higher), 30 steps in close (lower)
const TEXT_TOP = 300, TEXT_TOP_LOW = 960, TEXT_AT = { 49: 150, 30: 1100 };
// where to start a clip and how fast, when the default picks a bad stretch
const CLIP_RANGE = {
  'desk-typing-from-behind-01.mp4': { start: 0, speed: 1 }, // she stands up at ~5s; stop before that
};
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

const lines = JSON.parse(readFileSync(path.join(HERE, "lines.json"), "utf8"));
const making = lines.filter((l) => !l.skip); // she wants 14 Reels max (2026-11-03); "skip": true parks a line
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
// clips for every day, in posting order (full paths). The longer clip is hers on HER days, else a lived-in stock clip
// in turn. Flashes: no two of one subject in a Reel, and no clip back within a few days (days 51-47 share none).
// Fixed seeds: a day always gets the same clips.
const SCHEDULE = (() => {
  const picked = Object.values(HERO_FOR);
  const stockHeroes = shuffle(LIVED_IN.filter((f) => clips.includes(f) && !picked.includes(f)), 7);
  const heroOf = [];
  let h = 0;
  making.forEach((l) => heroOf.push(HER[l.day] ? null : HERO_FOR[l.day] || stockHeroes[h++ % stockHeroes.length]));
  const order = shuffle(clips, 11);
  const out = {};
  const recent = [];
  let q = 0;
  making.forEach((l, i) => {
    const hero = heroOf[i];
    // relax step by step if ~26 clips can't satisfy everything: first look less far ahead, then less far back
    let quick = [];
    for (const [ahead, back] of [[4, 4], [2, 4], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0]]) {
      const soon = heroOf.slice(i + 1, i + 1 + ahead).filter(Boolean);
      const blocked = new Set([hero, ...soon, ...recent.slice(-back || recent.length).flat()].filter(Boolean));
      if (!back) blocked.clear(), hero && blocked.add(hero);
      const subjects = new Set(tags(hero || HER[l.day]));
      quick = [];
      for (let k = 0; k < order.length && quick.length < QUICK; k++) {
        const c = order[(q + k) % order.length];
        if (blocked.has(c) || tags(c).some((t) => subjects.has(t))) continue;
        quick.push(c); tags(c).forEach((t) => subjects.add(t));
      }
      if (quick.length === QUICK) break;
    }
    q += QUICK;
    out[l.day] = [...quick.map((c) => path.join(CLIPS, c)), hero ? path.join(CLIPS, hero) : path.join(BROLL, HER[l.day])];
    recent.push([...quick, hero].filter(Boolean));
  });
  return out;
})();
const isHers = (f) => f.startsWith(BROLL);

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

async function layout(page, { day, title, body }) {
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
    .wrap { position: absolute; left: 70px; right: 70px; top: ${TEXT_AT[day] ?? (LOW_TEXT.has(day) ? TEXT_TOP_LOW : TEXT_TOP)}px; text-align: center; }
    /* line-height 1.18: at 1.02 the white outlines of the two lines ran into each other */
    .title { font: 700 ${tSize}px/1.18 Cute, cursive; color: ${RED}; -webkit-text-stroke: 14px #fff;
             paint-order: stroke fill; margin-bottom: 34px; filter: drop-shadow(0 4px 14px rgba(0,0,0,.45)); } /* separates it from white snow */
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
  // each clip runs XF longer than it shows on its own, because neighbours overlap in the crossfade
  const lens = [...Array(QUICK).fill(QUICK_LEN), +(total - QUICK * QUICK_LEN + QUICK * XF).toFixed(2)];
  const durs = picks.map(probe);
  // a short clip plays a little less sped-up so it still fills its time
  // her clips can slow to 0.7x (they're 60 fps, so it stays smooth) when they're shorter than the time they fill
  const speeds = lens.map((len, i) => CLIP_RANGE[path.basename(picks[i])]?.speed ?? Math.max(isHers(picks[i]) ? 0.7 : 1,
    Math.min(i < QUICK ? SPEED_QUICK : SPEED_HERO, (durs[i] - 0.3) / len)));
  const T = await textLayers(page, line, path.join(OUT, `.day-${day}`));

  const args = [];
  const chains = [];
  picks.forEach((f, i) => {
    const need = lens[i] * speeds[i];
    const start = CLIP_RANGE[path.basename(f)]?.start ?? Math.max(0, Math.min(1, durs[i] - need - 0.1)); // skip the first second when there's room
    args.push('-ss', String(start), '-t', String(need + 0.3), '-i', f);
    // stock gets levelled to meet in the middle; hers is kept as filmed. tpad holds the last frame if a clip runs short
    const base = `[${i}:v]setpts=PTS/${speeds[i]},fps=${FPS},${FIT}${isHers(f) ? '' : `,${LEVEL}`},` +
      `tpad=stop_mode=clone:stop_duration=1,trim=duration=${lens[i]},setpts=PTS-STARTPTS`;
    if (isHers(f)) { chains.push(`${base},fps=${FPS},settb=1/${FPS},format=yuv420p[v${i}]`); return; } // hers is already handheld
    // phone-filmed feel on stock (tripod) clips: a slow push-in with a drift that never repeats evenly;
    // gentler on the short clips, more on the longer one
    const N = Math.round(lens[i] * FPS);
    const k = i < QUICK ? 0.6 : 1;
    chains.push(`${base},zoompan=z='1.04+${0.05 * k}*on/${N}':x='iw/2-iw/zoom/2+${14 * k}*sin(on/9)+${5 * k}*sin(on/3.3)':` +
      `y='ih/2-ih/zoom/2+${10 * k}*sin(on/12+1)+${4 * k}*sin(on/4.7)':d=1:s=${W}x${H}:fps=${FPS},settb=1/${FPS},format=yuv420p[v${i}]`);
  });
  const n = picks.length;
  args.push('-loop', '1', '-t', String(total), '-i', scrim(LOW_TEXT.has(day)));
  args.push('-loop', '1', '-t', String(total), '-i', T.files.title);
  args.push('-loop', '1', '-t', String(total), '-i', T.files.body);
  args.push('-i', path.join(SFX, 'sparkle.mp3'));
  const [iG, iT, iB, iS] = [n, n + 1, n + 2, n + 3];

  // clips joined with soft crossfades, then the look
  const fc = [...chains];
  let prev = 'v0', at = 0;
  for (let i = 1; i < n; i++) {
    at += lens[i - 1] - XF;
    fc.push(`[${prev}][v${i}]xfade=transition=fade:duration=${XF}:offset=${at.toFixed(3)}[x${i}]`);
    prev = `x${i}`;
  }
  // a light shade behind the text area so it reads on white snow
  fc.push(`[${prev}]${LOOKS[look]}[g0]`, `[g0][${iG}:v]overlay=0:0[bg]`);
  // title: on screen from frame 1, grows from 80% to full size with a small overshoot (ease-out-back)
  const t = T.t;
  const S = `if(lt(t,${POP}),0.8+0.2*(1+2.70158*pow(t/${POP}-1,3)+1.70158*pow(t/${POP}-1,2)),1)`;
  fc.push(`[${iT}:v]format=rgba,crop=${t.w}:${t.h}:${t.x}:${t.y},scale=w='2*trunc(iw*${S}/2)':h='2*trunc(ih*${S}/2)':eval=frame[tt]`,
    `[bg][tt]overlay=x='${t.x + t.w / 2}-overlay_w/2':y='${t.y + t.h / 2}-overlay_h/2':eval=frame[s0]`);
  // body: each white box rises 40px and fades in, one line after another
  const L = T.lines;
  fc.push(`[${iB}:v]format=rgba,split=${L.length}${L.map((_, i) => `[b${i}]`).join('')}`);
  L.forEach((r, i) => {
    const st = (LINES_AT + i * LINE_GAP).toFixed(2);
    fc.push(`[b${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},fade=in:st=${st}:d=${LINE_IN}:alpha=1[l${i}]`);
    fc.push(`[s${i}][l${i}]overlay=x=${r.x}:y='${r.y}+40*pow(1-min(1,max(0,(t-${st})/${LINE_IN})),3)':eval=frame[s${i + 1}]`);
  });
  fc.push(`[s${L.length}]format=yuv420p[out]`);
  // sound: just the sparkle as the title lands (the pop didn't fit); quiet, so her Instagram song sits on top
  fc.push(`[${iS}:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.45,apad,atrim=0:${total}[aout]`);

  const file = path.join(OUT, `day-${day}.mp4`);
  args.push('-filter_complex', fc.join(';'), '-map', '[out]', '-map', '[aout]', '-t', String(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-c:a', 'aac', '-movflags', '+faststart', file);
  ff(args);
  rmSync(T.files.title, { force: true }); rmSync(T.files.body, { force: true });
  console.log(`day ${day}: ${file}  (${total}s, look ${look}; clips ${picks.map((p) => path.basename(p)).join(', ')})`);
}

// a soft shade behind the text: from the top (about 28% black, gone by 60% of the height), or for low text a band
// that peaks behind it (y 1000-1500) and fades out above and below
function scrim(low) {
  const file = path.join(OUT, low ? '.scrim-low.png' : '.scrim.png');
  if (!existsSync(file)) {
    const a = low ? `'72*exp(-pow((Y-1250)/420,2))'` : `'if(lt(Y,${H * 0.6}),72*pow(1-Y/${H * 0.6},1.5),0)'`;
    ff(['-f', 'lavfi', '-i', `color=black:s=${W}x${H}:d=0.04`, '-vf', `format=rgba,geq=r=0:g=0:b=0:a=${a}`, '-frames:v', '1', file]);
  }
  return file;
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
  for (const [i, l] of making.entries()) await textPng(page, l, path.join(dir, `${String(i).padStart(2, '0')}.png`));
  const file = path.join(OUT, 'titles-all.png');
  ff(['-i', bg, '-i', path.join(dir, '%02d.png'), '-filter_complex',
    `[0:v]loop=${making.length - 1}:1:0[b];[b][1:v]overlay,scale=270:-2,tile=6x${Math.ceil(making.length / 6)}`,
    '-frames:v', '1', file]);
  rmSync(dir, { recursive: true, force: true });
  console.log(`titles: ${file}`);
}

const argv = process.argv.slice(2);
const li = argv.indexOf('--look');
const look = li >= 0 ? argv.splice(li, 2)[1].toUpperCase() : 'C';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (argv.includes('sheet')) { sheet(); process.exit(0); }
const todo = argv.includes('all') ? making : lines.filter((l) => argv.includes(String(l.day)));
if ((!todo.length && !argv.includes('titles')) || !LOOKS[look]) { console.log('usage: node build.mjs <day> [day...] | all | sheet | titles  [--look A|B]'); process.exit(1); }
const b = await launch();
const page = await b.newPage();
await page.setViewport({ width: W, height: H });
if (argv.includes('titles')) await titles(page);
for (const l of todo) await render(page, l, look);
await b.close();
