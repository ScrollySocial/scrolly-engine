// Reel 3 v2 of "1 photo of soap, 9 posts", 7 seconds, from her Pinterest inspo (Vrija Life's "Retinol Face Serum" ad):
// words in mixed fonts stack up IN THE SHAPE OF THE PRODUCT on a podium, then a burst of golden sparkles swaps the words
// for the real product. Round 3 (her notes 2026-11-04): pink backdrop that fits the soap, a soap dish facing the camera,
// the words in the bar's shape, then the sparkle swap to her sunset bar (cut out of soap.webp, the ONE photo), no blue
// text. The words are her own facts from the earlier rounds (build.mjs: made by hand, all natural ingredients, smells like
// coconut + apple, pineapple, thyme, each bar one of a kind). Separate from build.mjs on purpose (other chats share it).
// Round 4 (her notes): no sound at all, a bit slower so the words can be read, big "Bar Soap" + "get yours now" at the
// end, and new word colours. Rounds 5-8: colours and backdrops; round 8 matches the grid's own looks (PALETTES).
//   node reel3-podium.mjs stills [palette]   key frames in <exports>/soap-9-posts/.work/r3p/ (strip.jpg + PNGs)
//   node reel3-podium.mjs colours            every backdrop side by side (full stack + end frame), colours.jpg
//   node reel3-podium.mjs render [palette]   renders <exports>/soap-9-posts/reel-3-v2.mp4 (no audio track)
// Dish: Pexels photo 13760293 (a beech soap dish on a tree stump, Pexels License, free, no attribution needed), saved as
// clips/soap-dish-13760293.jpg. Cut out along its outline; the soap that sat in it is replaced by plain wood from the
// dish's own front face (the word stack and then the bar stand right there, so that spot is never in plain view).
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work', 'r3p');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const SOAP = path.join(HERE, 'soap.webp');
const DISH = path.join(HERE, 'clips', 'soap-dish-13760293.jpg');
const W = 1080, H = 1920, FPS = 30, T = 7;
const b64 = (f) => readFileSync(f).toString('base64');

// the word stack, top to bottom, in the inspo's mix of type: script, heavy caps, hairline, serif. No em dashes.
// her order (rounds 9-11): the phrases arrive in her list's order, One of a kind BAR SOAP first (her pick: start with bar
// soap), each phrase's lines together, stacking up from the dish. Listed top to bottom; the third value is the phrase's
// turn (0 = first, at the bottom). Each line is in a different font from the one below it
const WORDS = [
  ['Sunshine', 'script', 4], ['SPLASH', 'heavy', 4], ['made by hand', 'thin', 3], ['All-natural', 'script', 2],
  ['INGREDIENTS', 'heavy', 2], ['Coconut + apple', 'thin', 1], ['One of a kind', 'script', 0], ['BAR SOAP', 'heavy', 0],
];
// Round 8 (her notes): the colour/shadow rounds (blue, plum, deep pinks, clouds, pop shadow) were all a no; it has to
// match the vibe of the other 8 posts. So each palette is one of the grid's own looks, same backdrop colours and lettering:
//   gridblue  Reel 2's sky blue (#A9D8F2) with white Anton (+ the shop's Great Vibes script, white)
//   gridpink  the "How big is it?" tile's pink (#F2D1CA) with Reel 6's lettering: yellow Corben with a white outline +
//             white Pacifico script
// words = the CSS per kind of word (sizes are set to fit later); end1/end2 = the end's "Bar Soap" + GET YOURS NOW;
// bg = centre, mid, edge of the soft glow; floor; sh = the dish's shadow colour
const SOFT_BLUE = 'text-shadow:0 3px 14px rgba(20,60,100,.22)';
const SOFT_PINK = 'filter:drop-shadow(0 3px 8px rgba(130,60,50,.4))';
const OUTLINED = 'font-family:Corben;font-weight:700;color:#FFD43B;-webkit-text-stroke:.17em #fff;paint-order:stroke fill;letter-spacing:-.01em;filter:drop-shadow(0 4px 10px rgba(130,60,50,.25))';
const PALETTES = {
  gridblue: {
    bg: ['#B8DFF5', '#A9D8F2', '#9DD0EE'], floor: '#93C8EA', sh: '30,70,110',
    words: { script: `font-family:GreatVibes;color:#fff;${SOFT_BLUE}`, heavy: `font-family:Anton;color:#fff;letter-spacing:.02em;${SOFT_BLUE}`,
      thin: `font-family:Figtree;font-weight:600;color:#fff;${SOFT_BLUE}`, serif: `font-family:InstrumentSerif;color:#fff;${SOFT_BLUE}`,
      black: `font-family:Anton;color:#fff;letter-spacing:.02em;${SOFT_BLUE}` },
    end1: `font:400 250px/1 Anton;text-transform:uppercase;letter-spacing:.02em;color:#fff;${SOFT_BLUE}`,
    end2: `margin-top:22px;font:700 58px/1.2 Figtree;letter-spacing:.22em;color:#fff;${SOFT_BLUE}`,
  },
  gridpink: {
    bg: ['#F7DED8', '#F2D1CA', '#EBC3BB'], floor: '#E6B8AF', sh: '120,60,55',
    words: { script: `font-family:Pacifico;color:#fff;${SOFT_PINK}`, heavy: OUTLINED,
      thin: `font-family:Figtree;font-weight:800;color:#fff;${SOFT_PINK}`, serif: `font-family:Pacifico;color:#fff;${SOFT_PINK}`,
      black: OUTLINED },
    end1: `font-size:200px;line-height:1.1;${OUTLINED}`,
    end2: `margin-top:10px;font:400 90px/1.2 Pacifico;color:#fff;${SOFT_PINK}`,
  },
};

// the dish photo (6016×4000) is cropped to C and drawn at scale K. OUTLINE is the dish in crop pixels; GAP is where the
// old soap sat (filled with front-face wood), its front lip at GAP.y1
const C = { x: 2240, y: 2660, w: 2060, h: 940 }, K = 0.44;
const OUTLINE = [[280, 44], [1990, 150], [1986, 530], [1952, 900], [56, 772], [46, 446]];
const GAP = { x0: 560, x1: 1636, y1: 516 }, FACE = { y0: 560, y1: 760 };
const POD = { left: 57, top: 1235 };
const BAR = { w: 540, cx: POD.left + ((GAP.x0 + GAP.x1) / 2) * K, bottom: POD.top + GAP.y1 * K };

const font = (fam, file, fmt, w = 'normal') => `@font-face{font-family:${fam};src:url(data:font/${fmt};base64,${b64(file)}) format('${fmt === 'ttf' ? 'truetype' : fmt}');font-weight:${w}}`;
const CSS = font('Figtree', path.join(FONTS, 'figtree.woff2'), 'woff2', '300 900') +
  font('GreatVibes', path.join(HERE, 'fonts/great-vibes.ttf'), 'ttf') +
  font('Jost', path.join(HERE, 'fonts/jost.ttf'), 'ttf', '100 900') +
  font('InstrumentSerif', path.join(FONTS, 'instrument-serif.ttf'), 'ttf') +
  font('Anton', path.join(HERE, 'fonts/anton.ttf'), 'ttf') + font('Corben', path.join(HERE, 'fonts/corben-bold.ttf'), 'ttf', 700) +
  font('Pacifico', path.join(HERE, '../christmas-countdown/fonts/pacifico.ttf'), 'ttf') +
  `html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}`;

// cut-outs, made once in the browser: the bar (per row, first to last pixel that isn't white, like build.mjs, no baked
// shadow) and the dish (clipped to its outline, the old soap's spot filled with wood from the dish's front face)
async function cutouts(page) {
  const bar = path.join(TMP, 'bar.png'), pod = path.join(TMP, 'dish.png');
  if (existsSync(bar) && existsSync(pod)) return { bar, pod };
  await page.setContent('<body></body>');
  const [barB64, podB64] = await page.evaluate(async (soapSrc, dishSrc, C, OUTLINE, GAP, FACE) => {
    const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
    const out = async (c) => { const blob = await c.convertToBlob({ type: 'image/png' });
      return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result.split(',')[1]); f.readAsDataURL(blob); }); };
    // bar
    const s = await load(soapSrc), w = s.width, h = s.height, a = new OffscreenCanvas(w, h), x = a.getContext('2d');
    x.drawImage(s, 0, 0);
    const d = x.getImageData(0, 0, w, h), px = d.data, solid = (i) => (765 - px[i] - px[i + 1] - px[i + 2]) > 36;
    let top = h, bot = 0, L = w, R = 0;
    for (let y = 0; y < h; y++) {
      let l = -1, r = -1;
      for (let i = 0; i < w; i++) if (solid((y * w + i) * 4)) { l = i; break; }
      for (let i = w - 1; i >= 0; i--) if (solid((y * w + i) * 4)) { r = i; break; }
      for (let i = 0; i < w; i++) if (l < 0 || i < l + 2 || i > r - 2) px[(y * w + i) * 4 + 3] = 0;
      if (l >= 0 && r - l > w * 0.3) { top = Math.min(top, y); bot = y; L = Math.min(L, l + 2); R = Math.max(R, r - 2); }
    }
    x.putImageData(d, 0, 0);
    top += 6; const bc = new OffscreenCanvas(R - L, bot - top); bc.getContext('2d').drawImage(a, -L, -top);
    // dish: each row of the old soap's spot blends from the wood just left of it to the wood just right of it (so the
    // bowl, rim and back strip carry on across), with the grain of the dish's front face laid over it
    const im = await load(dishSrc), raw = new OffscreenCanvas(C.w, C.h), rx = raw.getContext('2d');
    rx.drawImage(im, -C.x, -C.y);
    const e = rx.getImageData(0, 0, C.w, C.h), q = e.data, gw = GAP.x1 - GAP.x0, fh = FACE.y1 - FACE.y0;
    const avg = (i, y, n) => { const o = [0, 0, 0]; for (let j = 0; j < n; j++) for (let ch = 0; ch < 3; ch++) o[ch] += q[(y * C.w + i + j) * 4 + ch] / n; return o; };
    let mean = 0; for (let y = FACE.y0; y < FACE.y1; y++) for (let i = GAP.x0; i < GAP.x1; i++) mean += q[(y * C.w + i) * 4] / (gw * fh);
    for (let y = 0; y < GAP.y1; y++) {
      const L = avg(GAP.x0 - 14, y, 8), R = avg(GAP.x1 + 8, y, 8);
      for (let i = GAP.x0; i < GAP.x1; i++) {
        const u = (i - GAP.x0) / gw, k = (y * C.w + i) * 4, grain = (q[((FACE.y0 + (y % fh)) * C.w + i) * 4] - mean) * 0.55;
        for (let ch = 0; ch < 3; ch++) q[k + ch] = L[ch] * (1 - u) + R[ch] * u + grain;
      }
    }
    rx.putImageData(e, 0, 0);
    const c = new OffscreenCanvas(C.w, C.h), cx = c.getContext('2d');
    cx.beginPath(); OUTLINE.forEach(([px2, py], i) => (i ? cx.lineTo(px2, py) : cx.moveTo(px2, py))); cx.closePath(); cx.clip();
    cx.drawImage(raw, 0, 0);
    return [await out(bc), await out(c)];
  }, `data:image/webp;base64,${b64(SOAP)}`, `data:image/jpeg;base64,${b64(DISH)}`, C, OUTLINE, GAP, FACE);
  writeFileSync(bar, Buffer.from(barB64, 'base64'));
  writeFileSync(pod, Buffer.from(podB64, 'base64'));
  return { bar, pod };
}

// sparkles: a fixed set (seeded), each with its own birth, life, size and drift, all around the bar
function sparkles() {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const g = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  return Array.from({ length: 280 }, (_, i) => {
    const big = i < 45;
    return { x: BAR.cx + g() * 460, y: BAR.bottom - 340 + g() * 520, r: big ? 30 + rnd() * 55 : 4 + rnd() * 13,
      born: 3.8 + rnd() * 0.75, life: big ? 1.4 + rnd() * 1.2 : 0.9 + rnd() * 1.6, dx: g() * 60, dy: -30 - rnd() * 90,
      tw: 6 + rnd() * 10, ph: rnd() * 6.28, col: rnd() < 0.7 ? '255,226,150' : '255,250,235', big };
  });
}
const SP = sparkles();

const html = (barSrc, podSrc, pal) => `<style>${CSS}
body{background:${pal.img ? `url(data:image/jpeg;base64,${b64(path.join(HERE, 'clips', pal.img))}) center/cover` : `radial-gradient(120% 70% at 50% 34%,${pal.bg[0]} 0%,${pal.bg[1]} 55%,${pal.bg[2]} 100%)`}}
#scene{position:absolute;inset:0;transform-origin:50% 66%}
#floor{position:absolute;left:0;right:0;top:${POD.top + 260}px;bottom:0;${pal.img ? 'display:none' : `background:linear-gradient(${pal.bg[2]}00,${pal.floor} 70%)`}}
#pod{position:absolute;left:${POD.left}px;top:${POD.top}px;width:${C.w * K}px;filter:drop-shadow(0 18px 22px rgba(${pal.sh},.4)) drop-shadow(0 4px 6px rgba(${pal.sh},.32))}
#words{position:absolute;left:${BAR.cx - BAR.w / 2}px;width:${BAR.w}px;bottom:${H - BAR.bottom + 6}px;display:flex;flex-direction:column;align-items:center}
#words div{white-space:nowrap;line-height:.9}
#bar{position:absolute;left:${BAR.cx - BAR.w / 2}px;width:${BAR.w}px;bottom:${H - BAR.bottom}px;transform-origin:50% 100%;opacity:0}
#bar img{width:100%;display:block;filter:drop-shadow(0 10px 18px rgba(90,40,40,.22))}
#glow{position:absolute;left:${BAR.cx - 520}px;width:1040px;top:${BAR.bottom - 900}px;height:1000px;border-radius:50%;opacity:0;
  background:radial-gradient(closest-side,rgba(255,236,190,.95),rgba(255,214,150,.45) 45%,rgba(255,214,150,0))}
.sp{position:absolute;border-radius:50%;opacity:0;pointer-events:none}
#end{position:absolute;left:40px;right:40px;top:250px;text-align:center}
#end1{${pal.end1};white-space:nowrap;opacity:0}
#end2{${pal.end2};white-space:nowrap;opacity:0}
</style>
<div id=scene><div id=floor></div><img id=pod src="${podSrc}">
<div id=words>${WORDS.map(([t, k]) => `<div style="${pal.words[k]}">${t}</div>`).join('')}</div>
<div id=end><div id=end1>Bar Soap</div><div id=end2>${pal.end2.includes('Pacifico') ? 'get yours now' : 'GET YOURS NOW'}</div></div>
<div id=glow></div><div id=bar><img src="${barSrc}"></div>
${SP.map((p, i) => `<div class=sp id=p${i} style="left:${p.x - p.r}px;top:${p.y - p.r}px;width:${p.r * 2}px;height:${p.r * 2}px;background:radial-gradient(closest-side,rgba(${p.col},${p.big ? 0.75 : 1}),rgba(${p.col},${p.big ? 0.3 : 0.6}) 45%,rgba(${p.col},0));${p.big ? 'filter:blur(2px)' : ''}"></div>`).join('')}
</div>`;

// timing (s). The empty dish first; phrases build from the bottom up from 0.3s (One of a kind BAR SOAP enters too), one
// every 0.7s (round 12: slower, to be read); the full stack is up by 3.4 and holds to 4.0. Sparkles 3.8-6.2; the words
// fade 4.0-4.4 while the bar glows in 4.1-4.7; "Bar Soap" fades in 5.0-5.4 above it, get yours now 5.3-5.6, held to the
// end. Slow push-in throughout.
const FIRST = 0.3, STEP = 0.7, SWAP = { wordsOut: [4.0, 4.4], barIn: [4.1, 4.7] }, END = { big: [5.0, 5.4], caps: [5.3, 5.6] };
const clamp = (v) => Math.max(0, Math.min(1, v)), sm = (v) => v * v * (3 - 2 * v), seg = (t, [a, b]) => sm(clamp((t - a) / (b - a)));
function pose(t) {
  const words = WORDS.map(([, , g]) => sm(clamp((t - FIRST - g * STEP) / 0.3)));
  const out = 1 - seg(t, SWAP.wordsOut), bar = seg(t, SWAP.barIn);
  const sp = SP.map((p) => { const u = (t - p.born) / p.life; if (u <= 0 || u >= 1) return [0, 0, 0, 1];
    const env = Math.sin(Math.PI * u) * (p.big ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(p.ph + t * p.tw)));
    return [env, p.dx * u, p.dy * u, p.big ? 1 : 0.6 + 0.6 * env]; });
  return { words, out, bar, glow: 1 + 0.45 * (1 - seg(t, [4.45, 5.25])) * bar, halo: seg(t, [3.8, 4.2]) * (1 - seg(t, [4.55, 5.5])), sp,
    e1: seg(t, END.big), e2: seg(t, END.caps), zoom: 1 + 0.04 * sm(clamp(t / 7)) };
}
const apply = (p) => {
  document.querySelectorAll('#words div').forEach((d, i) => { d.style.opacity = p.words[i] * p.out; d.style.transform = `translateY(${(1 - p.words[i]) * 26}px)`; });
  const bar = document.getElementById('bar');
  bar.style.opacity = p.bar; bar.style.transform = `scale(${0.965 + 0.035 * p.bar})`; bar.style.filter = `brightness(${p.glow})`;
  p.sp.forEach(([o, dx, dy, s], i) => { const e = document.getElementById('p' + i); e.style.opacity = o; e.style.transform = `translate(${dx}px,${dy}px) scale(${s})`; });
  document.getElementById('glow').style.opacity = p.halo;
  const e1 = document.getElementById('end1'), e2 = document.getElementById('end2');
  e1.style.opacity = p.e1; e1.style.transform = `translateY(${(1 - p.e1) * 30}px)`; e2.style.opacity = p.e2;
  document.getElementById('scene').style.transform = `scale(${p.zoom})`;
};

async function frames(page, times, dir, name, pal) {
  const { bar, pod } = await cutouts(page);
  await page.setContent(html(`data:image/png;base64,${b64(bar)}`, `data:image/png;base64,${b64(pod)}`, pal));
  await page.evaluate(() => document.fonts.ready);
  // each word sized to the bar's width (the inspo's block), then the whole stack scaled to the bar's height
  const barH = await page.evaluate(async (bw) => { const i = document.querySelector('#bar img'); await i.decode(); return bw * i.naturalHeight / i.naturalWidth; }, BAR.w);
  await page.evaluate((bw, bh) => {
    const ds = [...document.querySelectorAll('#words div')];
    for (const d of ds) { d.style.fontSize = '100px'; d.style.fontSize = (100 * bw / d.getBoundingClientRect().width) + 'px'; }
    const tot = ds.reduce((s, d) => s + d.getBoundingClientRect().height, 0), k = Math.min(1, (bh - 12) / tot);
    for (const d of ds) d.style.fontSize = (parseFloat(d.style.fontSize) * k) + 'px';
    const e = document.getElementById('end1'), ew = e.scrollWidth;
    if (ew > 900) e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * 900 / ew) + 'px';
  }, BAR.w * 0.97, barH);
  const shots = [];
  for (const [i, t] of times.entries()) {
    await page.evaluate(`(${apply})(${JSON.stringify(pose(t))})`);
    const f = path.join(dir, name(i, t));
    await page.screenshot({ path: f });
    shots.push(f);
  }
  return shots;
}

const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

async function stills(key) {
  mkdirSync(TMP, { recursive: true });
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  const s = await frames(page, [0.05, 1.2, 3.6, 4.1, 4.4, 5.2, 6.5], TMP, (_, t) => `still-${t.toFixed(2)}s.png`, PALETTES[key]);
  ff([...s.flatMap((f) => ['-i', f]), '-filter_complex', `${s.map((_, i) => `[${i}:v]scale=300:534[s${i}]`).join(';')};${s.map((_, i) => `[s${i}]`).join('')}hstack=inputs=${s.length}`, path.join(TMP, 'strip.jpg')]);
  await b.close();
  console.log('stills in', TMP);
}

// every palette: the full word stack and the end frame, side by side
async function colours() {
  mkdirSync(TMP, { recursive: true });
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  const s = [];
  for (const k of Object.keys(PALETTES)) s.push(...await frames(page, [3.6, 6.5], TMP, (_, t) => `colour-${k}-${t.toFixed(1)}s.png`, PALETTES[k]));
  ff([...s.flatMap((f) => ['-i', f]), '-filter_complex', `${s.map((_, i) => `[${i}:v]scale=300:534[s${i}]`).join(';')};${s.map((_, i) => `[s${i}]`).join('')}hstack=inputs=${s.length}`, path.join(TMP, 'colours.jpg')]);
  await b.close();
  console.log('colours in', TMP);
}

async function render(key) {
  const dir = path.join(TMP, 'frames');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  await frames(page, Array.from({ length: T * FPS }, (_, i) => i / FPS), dir, (i) => `${String(i + 1).padStart(4, '0')}.png`, PALETTES[key]);
  await b.close();
  const out = path.join(OUT, 'reel-3-v2.mp4');
  // no audio track (her note: no sound effects on this one)
  ff(['-framerate', `${FPS}`, '-i', path.join(dir, '%04d.png'), '-vf', 'format=yuv420p,noise=alls=3:allf=t+u',
    '-t', `${T}`, '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out]);
  console.log('wrote', out);
}

const [cmd = 'stills', key = 'gridpink'] = process.argv.slice(2);
if (!PALETTES[key]) throw new Error(`palette ${key}? one of ${Object.keys(PALETTES).join(', ')}`);
if (cmd === 'stills') await stills(key);
else if (cmd === 'colours') await colours();
else if (cmd === 'render') await render(key);
else console.log('node reel3-podium.mjs stills|colours|render [palette]');
