// Christmas countdown Reels: 4 very quick Pexels cuts, then one longer clip. On top the whole time: the title in
// Mountains of Christmas (red, white outline) and the rest of her line in plain black text on white highlight boxes.
// Every clip is levelled first (exposure evened out), then gets the same look so the mixed stock reads as one set.
// The title pops in on frame 1 (with a soft sparkle), the white boxes slide up one line at a time (with one soft pop).
// The longer clip is always a lived-in one (hands, mugs, slippers...) with a slow handheld push-in.
//   node build.mjs 51 50              render those days (look C, natural: her pick 2026-11-03)
//   node build.mjs all --look A       render every line in lines.json, one at a time
//   node build.mjs sheet              before/after still of 8 clips: raw, look C, look A, look B
//   node build.mjs titles             every day's text on one still, to check them all at once
//   node build.mjs covers             each Reel + its cover into <exports>/christmas-countdown-day-<n>/ (the planner reads these)
// Clips: reel-template-pack/assets/Christmas. Output: <exports>/christmas-countdown/ (OneDrive, not git).
import { readFileSync, readdirSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs';
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
// 2026-11-03 round 3: every Reel = 2 stock clips then her. Hard cuts (crossfades read as edited/polished) and
// slower clips; round 2 (3 × 1s with crossfades) still felt too fast and repeated clips
const QUICK = 2, QUICK_LEN = 1.3;        // seconds each
const XF = 0;                            // 0 = hard cuts; > 0 = crossfade of that length
const SPEED_QUICK = 1.15, SPEED_HERO = 1.3; // playback speed-up
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
  'kitchen-coffee-pour-01.mp4': 'drink', 'kitchen-smoothie-sip-01.mp4': 'drink', 'kitchen-oven-tray-01.mp4': 'food',
};
const tags = (f) => (SUBJECT[path.basename(f)] || '').split('+').filter(Boolean);
// day 30 is approved as rendered (2026-11-03): never re-render it, and keep its stock clips out of every other Reel
const APPROVED = new Set([30]);
const RESERVED = ['19387113-uhd_2160_3840_60fps.mp4', '19733272-uhd_2160_3840_60fps.mp4', '15019021_2160_3840_30fps.mp4'];
// too dreamy/cinematic: they read as stock however they're graded
const TOO_POLISHED = ['6283475-hd_1080_1920_30fps.mp4', '19733270-uhd_2160_3840_60fps.mp4', '3321566-hd_1920_1080_25fps.mp4'];
// her own b-roll ends every Reel (she liked herself at the end of day 30). Already handheld: no added shake.
// Days without one wait ("later": true in lines.json) until she films more.
const BROLL = path.join(P.footage, 'broll');
const HER = {
  // wall-coffee-sip-01 scrapped by her; notebook-hand-01 turns into a knuckle close-up, not an end clip
  51: 'couch-lookup-smile-01.mp4', 50: 'kitchen-oven-tray-01.mp4', 49: 'desk-coffee-sip-01.mp4',
  48: 'kitchen-coffee-pour-01.mp4', 47: 'wall-coffee-sip-02.mp4', 45: 'couch-writing-01.mp4',
  44: 'kitchen-smoothie-sip-01.mp4', 42: 'desk-typing-01.mp4', 34: 'typing-overhead-01.mp4',
  31: 'desk-typing-from-behind-01.mp4', 30: 'wall-coffee-step-in-01.mp4',
};
// where the text block starts (y px), picked per Reel from her clip: calm space, never her face or the action
const TEXT_TOP = 300;
const TEXT_AT = {
  51: 960, // couch: face up top, text over the sweater
  50: 1000, // oven: her head at the top, text over the oven door
  49: 150, // desk: face mid-frame, text above her head
  48: 260, // coffee pour: the pour is low, text over the machine
  47: 960, 45: 960, 44: 1050, // face in the top half, text over her top
  31: 960, 30: 1100, // 31 turns round at the end; 30 steps in close
};
const textTop = (day) => TEXT_AT[day] ?? TEXT_TOP;
// where to start a clip and how fast, when the default picks a bad stretch
const CLIP_RANGE = {
  'desk-typing-from-behind-01.mp4': { start: 0, speed: 1 }, // she stands up at ~5s; stop before that
};
const RED = '#C2362F';                   // holiday kit red
const GREEN = '#1F7A45';                 // pairs with it in the script word

// per clip, before the look: even out exposure so dark and bright clips meet in the middle
const LEVEL = 'normalize=smoothing=24:independence=0.3:strength=0.55';
// stock only: look like her phone clips, not an ad. Brighter, lifted shadows, flatter, a touch softer than 4K-crisp
const PHONE = "eq=brightness=0.035:contrast=0.9:saturation=1.06:gamma=1.07,curves=all='0/0.04 0.5/0.53 1/1',gblur=sigma=0.6";
const LOOKS = {
  // C: natural match. Her colours kept (she liked the untouched clips best); only a touch of contrast, a hair warmer
  // so the blue snow sits with the cosy indoor clips, and a fine grain so they share one texture
  C: [
    'eq=contrast=1.04:saturation=1.03',
    'colorbalance=rs=0.02:bs=-0.03:rm=0.01:bm=-0.02:rh=0.02:bh=-0.02',
    'format=yuv420p', 'noise=alls=3:allf=t+u', // yuv first: noise straight after colorbalance smeared a red strip down the right edge
  ].join(','),
  // A: warm film. Matte blacks, golden highlights, less colour, glow, grain
  A: [
    'eq=contrast=1.05:saturation=0.74:gamma=1.04',
    'colorbalance=rs=0.06:gs=0.01:bs=-0.06:rm=0.05:bm=-0.05:rh=0.07:gh=0.02:bh=-0.08',
    "curves=all='0/0.09 0.3/0.3 0.7/0.72 1/0.94'",
    'split[a][b];[b]gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.18',
    'vignette=PI/5.5', 'format=yuv420p', 'noise=alls=7:allf=t+u', // grain after the vignette dithers away its rings
  ].join(','),
  // B: faded cream. Softer and lighter, cream-tinted, very muted colour
  B: [
    'eq=contrast=0.94:saturation=0.62:gamma=1.10',
    'colorbalance=rs=0.04:bs=-0.03:rm=0.04:gm=0.01:bm=-0.04:rh=0.04:gh=0.03:bh=-0.03',
    "curves=all='0/0.14 0.5/0.54 1/0.95'",
    'vignette=PI/6', 'format=yuv420p', 'noise=alls=6:allf=t+u',
  ].join(','),
};
// fit to 9:16, a little zoom, and an even-pixel centre crop (an odd crop left a coloured line on the edge)
const FIT = `scale=${Math.round(W * ZOOM / 2) * 2}:${Math.round(H * ZOOM / 2) * 2}:force_original_aspect_ratio=increase,` +
  `crop=${W}:${H}:floor((iw-${W})/4)*2:floor((ih-${H})/4)*2,setsar=1`;

const lines = JSON.parse(readFileSync(path.join(HERE, "lines.json"), "utf8"));
// she wants 14 Reels max; "skip": true parks a line, "later": true waits for her next b-roll (2026-11-03)
const making = lines.filter((l) => !l.skip && !l.later);
const clips = readdirSync(CLIPS).filter((f) => f.toLowerCase().endsWith('.mp4') && !SKIP.includes(f)).sort();
const probe = (f) => +execFileSync(tool('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

const shuffle = (list, seed) => {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// clips for every day being made, in posting order (full paths): 2 stock clips, then hers. Every stock clip is used
// once across the series (she noticed repeats). Within a Reel no two clips share a subject tag, and where it can, a
// Reel avoids the subjects of the Reel before. Fixed seed: a day always gets the same clips.
const SCHEDULE = (() => {
  const pool = shuffle(clips.filter((c) => !RESERVED.includes(c) && !TOO_POLISHED.includes(c)), 11);
  const used = new Set();
  const out = {};
  let prevTags = new Set();
  for (const l of making.filter((m) => !APPROVED.has(m.day))) {
    const end = HER[l.day] ? path.join(BROLL, HER[l.day]) : null;
    const pick = (avoidPrev, allowReuse) => {
      const subjects = new Set(tags(end || ''));
      const got = [];
      for (const c of pool) {
        if (got.length === QUICK + (end ? 0 : 1)) break;
        if ((!allowReuse && used.has(c)) || got.includes(c)) continue;
        if (tags(c).some((t) => subjects.has(t) || (avoidPrev && prevTags.has(t)))) continue;
        got.push(c); tags(c).forEach((t) => subjects.add(t));
      }
      return got.length === QUICK + (end ? 0 : 1) ? got : null;
    };
    const got = pick(true, false) || pick(false, false) || pick(false, true);
    if (!got) throw new Error(`not enough clips for day ${l.day}`);
    if (got.some((c) => used.has(c))) console.log(`note: day ${l.day} reuses a stock clip (ran out of unused ones)`);
    got.forEach((c) => used.add(c));
    out[l.day] = [...got.map((c) => path.join(CLIPS, c)), ...(end ? [end] : [])];
    prevTags = new Set(out[l.day].flatMap(tags));
  }
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

async function layout(page, { day, title, body, top, noTitle }) {
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
    .wrap { position: absolute; left: 70px; right: 70px; top: ${top ?? textTop(day)}px; text-align: center; }
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
    ${noTitle ? '' : `<div class="title${mixed ? ' mixed' : ''}">${titleHtml}</div>`}
    <div class="body"><span class="hl">${esc(body)}</span></div>
  </div></body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

// which stretch of each clip a Reel plays: picks, seconds on screen, speed, where in the clip it starts
function timing(line) {
  const total = duration(line);
  const picks = SCHEDULE[line.day];
  // each clip runs XF longer than it shows on its own, because neighbours overlap in the crossfade
  const lens = [...Array(QUICK).fill(QUICK_LEN), +(total - QUICK * QUICK_LEN + QUICK * XF).toFixed(2)];
  const durs = picks.map(probe);
  // a short clip plays a little less sped-up so it still fills its time
  // her clips can slow to 0.7x (they're 60 fps, so it stays smooth) when they're shorter than the time they fill
  const speeds = lens.map((len, i) => CLIP_RANGE[path.basename(picks[i])]?.speed ?? Math.max(isHers(picks[i]) ? 0.7 : 1,
    Math.min(i < QUICK ? SPEED_QUICK : SPEED_HERO, (durs[i] - 0.3) / len)));
  // skip the first second when there's room
  const starts = picks.map((f, i) => CLIP_RANGE[path.basename(f)]?.start ?? Math.max(0, Math.min(1, durs[i] - lens[i] * speeds[i] - 0.1)));
  return { total, picks, lens, speeds, starts };
}

async function render(page, line, look) {
  const { day } = line;
  const { total, picks, lens, speeds, starts } = timing(line);
  const T = await textLayers(page, line, path.join(OUT, `.day-${day}`));

  const args = [];
  const chains = [];
  picks.forEach((f, i) => {
    const need = lens[i] * speeds[i];
    args.push('-ss', String(starts[i]), '-t', String(need + 0.3), '-i', f);
    // stock is levelled and made to look phone-shot; hers is kept as filmed. tpad holds the last frame if a clip runs short
    const base = `[${i}:v]setpts=PTS/${speeds[i]},fps=${FPS},${FIT}${isHers(f) ? '' : `,${LEVEL},${PHONE}`},` +
      `tpad=stop_mode=clone:stop_duration=1,trim=duration=${lens[i]},setpts=PTS-STARTPTS`;
    if (isHers(f)) { chains.push(`${base},fps=${FPS},settb=1/${FPS},format=yuv420p[v${i}]`); return; } // hers is already handheld
    // a hand holding a phone, not a smooth glide: several wobbles at unrelated speeds plus a fast tremor, no push-in.
    // Different phase per clip so two clips never shake alike
    const p = (day * 7 + i * 3) % 10;
    chains.push(`${base},zoompan=z='1.06+0.006*sin(on/23+${p})':` +
      `x='iw/2-iw/zoom/2+9*sin(on/5.3+${p})+6*sin(on/2.2+${p * 2})+4*sin(on/11.7)+1.5*sin(on*1.9)':` +
      `y='ih/2-ih/zoom/2+7*sin(on/4.1+${p})+5*sin(on/9.3+2)+1.5*sin(on*2.3+${p})':` +
      `d=1:s=${W}x${H}:fps=${FPS},settb=1/${FPS},format=yuv420p[v${i}]`);
  });
  const n = picks.length;
  args.push('-loop', '1', '-t', String(total), '-i', scrim(textTop(day) >= 900));
  args.push('-loop', '1', '-t', String(total), '-i', T.files.title);
  args.push('-loop', '1', '-t', String(total), '-i', T.files.body);
  args.push('-i', path.join(SFX, 'sparkle.mp3'));
  const [iG, iT, iB, iS] = [n, n + 1, n + 2, n + 3];

  // clips joined (hard cuts, or crossfades when XF > 0), then the look
  const fc = [...chains];
  let prev = 'v0', at = 0;
  if (!XF) { fc.push(`${picks.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0[x]`); prev = 'x'; }
  for (let i = 1; XF && i < n; i++) {
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

// Covers (her pick 2026-11-03: a pause from the Reel, a mix of Christmas shots and good ones of her, no bad faces).
// No Christmas title on covers (Mercedes 2026-11-03, for a cohesive grid): only the white caption box, so every cover
// is rebuilt from its clip rather than taken from the Reel.
// Value = seconds into the Reel. { at, top } = the grid only shows the middle 3:4 band (y 240-1680), so when the Reel's
// text sits higher than that, `top` moves it down (kept inside y 420-1500 so even a square crop shows it).
const COVERS = { 51: 3.8, 50: 2.3, 49: { at: 2.3, top: 470 }, 48: { at: 3.8, top: 450 }, 47: 5.4, 45: 2.3, 44: 2.3, 30: 5.4 };
const COVER_CLIP = { 45: '14697192-hd_1080_1620_30fps.mp4', 44: '20585555-hd_1080_1920_30fps.mp4' }; // marshmallow mug, cardinal
const slug = (day) => `christmas-countdown-day-${day}`;

// one folder per Reel in the Reel exports (what the planner looks in): <slug>/<slug>.mp4 + <slug>/cover.png
async function covers(page, days) {
  for (const day of days) {
    const spec = COVERS[day];
    if (spec == null) { console.log(`day ${day}: no cover picked yet`); continue; }
    const at = spec.at ?? spec;
    const dir = path.join(P.exports, slug(day));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const mp4 = path.join(OUT, `day-${day}.mp4`);
    copyFileSync(mp4, path.join(dir, `${slug(day)}.mp4`));
    const file = path.join(dir, 'cover.png');
    {
      const line = lines.find((l) => l.day === day);
      // the clip list has moved on since some Reels were rendered: pin the clip their cover frame actually showed
      if (COVER_CLIP[day] && SCHEDULE[day]) SCHEDULE[day] = SCHEDULE[day].map((c, k) => (k === Math.min(QUICK, Math.floor(at / QUICK_LEN)) ? path.join(CLIPS, COVER_CLIP[day]) : c));
      // an approved day keeps no clip list (it's never re-rendered): its cover frame comes from her own end clip
      const { picks, lens, speeds, starts } = SCHEDULE[day] ? timing(line)
        : { picks: [path.join(BROLL, HER[day])], lens: [99], speeds: [SPEED_HERO], starts: [0] };
      let i = 0, from = SCHEDULE[day] ? 0 : QUICK * QUICK_LEN;
      while (i < picks.length - 1 && at >= from + lens[i] - XF) { from += lens[i] - XF; i++; }
      const bg = path.join(OUT, `.cover-${day}-bg.png`), txt = path.join(OUT, `.cover-${day}-text.png`);
      ff(['-ss', String(starts[i] + (at - from) * speeds[i]), '-i', picks[i], '-frames:v', '1',
        '-vf', `${FIT}${isHers(picks[i]) ? '' : `,${PHONE}`},${LOOKS.C}`, bg]);
      await textPng(page, { ...line, top: spec.top ?? textTop(day), noTitle: true }, txt);
      ff(['-i', bg, '-i', scrim((spec.top ?? textTop(day)) >= 900), '-i', txt, '-filter_complex', '[0:v][1:v]overlay[a];[a][2:v]overlay',
        '-frames:v', '1', file]);
      rmSync(bg, { force: true }); rmSync(txt, { force: true });
    }
    console.log(`day ${day}: ${dir}`);
  }
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
const todo = (argv.includes('all') ? making : lines.filter((l) => argv.includes(String(l.day))))
  .filter((l) => !APPROVED.has(l.day) || (console.log(`day ${l.day} is approved, left as it is`), false));
if ((!todo.length && !argv.includes('titles') && !argv.includes('covers')) || !LOOKS[look]) { console.log('usage: node build.mjs <day> [day...] | all | sheet | titles | covers  [--look A|B]'); process.exit(1); }
const b = await launch();
const page = await b.newPage();
await page.setViewport({ width: W, height: H });
if (argv.includes('titles')) await titles(page);
if (argv.includes('covers')) await covers(page, Object.keys(COVERS).map(Number));
for (const l of todo) await render(page, l, look);
await b.close();
