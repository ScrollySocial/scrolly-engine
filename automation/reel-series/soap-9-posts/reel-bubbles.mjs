// "1 photo of soap, 9 posts": the BUBBLES Reel (bottom-middle tile; replaces Carousel 2). Her inspo 2026-11-04: a
// Pinterest "philosophy purity made simple" foaming-cleanser ad, beat for beat, with her own three lines:
//   0-2.3s   the bar scene: her bar HUGE and cut off at the left (like the inspo's bottle), a wall of real foam beside
//            it, glossy bubbles floating, "all-natural / BAR SOAP" + "Sunshine Splash" (the bar settles, words fade in)
//   2.3-3.8  split screen: shea butter video on top, coconut oil video below, one white line on the seam; "with shea
//            butter" slides up out of the line and "and coconut oil" down out of it
//   3.8-5.3  three equal boxes: her two bath clips top and bottom, a band between: "moisturizing formula", then "made by hand" (two phrases)
//   5.3-7    the end, like the inspo's end card: plain yellow, the WHOLE bar rising into the middle, the words around it
// Every word sits inside the 3:4 part the main Reel's grid tile shows (y 240-1680).
//   node reel-bubbles.mjs              prep + every frame, then renders <exports>/soap-9-posts/reel-bubbles-v3.mp4
//   node reel-bubbles.mjs still 1.9 3 4.5 6.5   PNGs to <exports>/soap-9-posts/.work/rbub/still-<bg>-<t>.png
//   BG=sage node reel-bubbles.mjs still 1.9     another background (COLOURS below)
// The bar is bar.png (cut from her ONE bar photo by build.mjs). The foam wall and the floating bubbles are both from
// Pexels 7630329 (bubbles clustered on glass), recoloured to the background: the foam lifted to a pale tint, the bubbles
// cut round from its edge. Clips (Pexels License, free to use, no attribution required): 7020148 (whipped butter in a
// jar) for shea butter, 5899711 (coconut halves) for coconut oil, and her picks 7020174 + 4155522 (bubble baths). A clip
// not downloaded yet stands in as its Pexels preview still (cand/<id>-big.jpg). Fonts match the other soap posts:
// Bricolage 800 + Figtree (reel-hf assets) and Pacifico (christmas-countdown fonts).
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { P, tool, launch, pythonCmd } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const WORK = path.join(TMP, 'rbub');
const SRC = path.join(WORK, 'src', '7630329-full.jpg');  // https://images.pexels.com/photos/7630329/pexels-photo-7630329.jpeg
const W = 1080, H = 1920, FPS = 30, LEN = 7;
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const url = (f) => pathToFileURL(f).href;
const b64 = (f) => readFileSync(f).toString('base64');

// round 2 (her note): not beige. Two to pick from, both from the bar's own sunset; neither is a neighbour's colour
const COLOURS = { sun: '#F4D98B', sage: '#C9D6BC' };
const BGK = process.env.BG || 'sun', BG = COLOURS[BGK];
const INK = process.env.INK || '#1C5C9C';  // her pick: ocean blue from the bar's sea (black looked wrong on yellow)
const CUT = [2.3, 3.8, 5.3];  // bar scene > split > band > end
// clip panels: [name, clip id, start s, panel height, crop position 0-1 (x, y)]. 1.5s each, warmed slightly
const PANELS = [
  ['p2a', 7020148, 1.0, 960, 0.5, 0.5],    // beat 2, top: shea butter
  ['p2b', 5899711, 1.0, 960, 0.5, 0.45],   // beat 2, bottom: coconut oil
  ['p3a', 7020174, 1.8, 640, 0.5, 0.22],   // beat 3, top: foam held to her face (three equal boxes, her note)
  ['p3b', 4155522, 29.5, 640, 0.5, 0.55],  // beat 3, bottom: blowing the foam
];
const PN = Math.round(1.5 * FPS);

// the foam wall: the photo recoloured to BG. Its foam is darker than its backdrop (backlit), the inspo's is paler, so
// the broad tone inside the foam is lifted and the bubble rims/highlights (the fine detail) ride on top
const PREP = String.raw`
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
src, work, hx = sys.argv[1], sys.argv[2], sys.argv[3]
bg = np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)], float)
im = Image.open(src).convert('L')
s = 2100 / im.height
im = im.resize((round(im.width * s), 2100), Image.LANCZOS)
L = np.asarray(im).astype(float)
base = np.asarray(im.filter(ImageFilter.GaussianBlur(28))).astype(float)
det = L - base
fo = np.asarray(im.filter(ImageFilter.GaussianBlur(60))).astype(float)
m = np.clip((166 - fo) / 18, 0, 1)                       # 1 inside the foam, 0 on the plain backdrop
nb = 172 + m * 52                                          # backdrop -> 172 (= BG), foam -> 224 (pale tint)
v = np.clip(nb + det * (1.5 + 0.4 * m), 0, 255)
xs = [0, 70, 172, 226, 255]
w = np.array([255, 255, 255], float)
cols = np.array([bg * 0.42, bg * 0.68, bg, bg + (w - bg) * 0.7, w * 0.995])
rgb = np.stack([np.interp(v, xs, cols[:, k]) for k in range(3)], -1)
Image.fromarray(rgb.astype(np.uint8)).save(work + '/foam.jpg', quality=93)
# the floating bubbles: round edge bubbles of the same photo (centre x, y, radius in 1600-px-wide coords)
k = rgb.shape[1] / 1600
for i, (cx, cy, r) in enumerate([(834, 828, 82), (816, 1110, 68), (828, 1602, 64), (850, 1422, 44), (830, 272, 50)]):
    cx, cy, r = cx * k, cy * k, r * k
    box = (round(cx - r * 1.15), round(cy - r * 1.15), round(cx + r * 1.15), round(cy + r * 1.15))
    crop = Image.fromarray(rgb.astype(np.uint8)).crop(box)
    a = Image.new('L', crop.size, 0)
    d = ImageDraw.Draw(a); c = crop.size[0] / 2
    d.ellipse((c - r * 1.02, c - r * 1.02, c + r * 1.02, c + r * 1.02), 255)
    a = a.filter(ImageFilter.GaussianBlur(r * 0.05))
    crop.putalpha(a); crop.save(work + '/bub%d.png' % i)
`;

const CW = path.join(WORK, BGK);  // colour-specific foam + bubbles
function prep() {
  mkdirSync(CW, { recursive: true });
  if (!existsSync(path.join(CW, 'foam.jpg')) || process.env.PREP) {
    const py = path.join(WORK, 'prep.py');
    writeFileSync(py, PREP);
    execFileSync(pythonCmd(), ['-I', py, SRC, CW, BG], { stdio: 'inherit' });
  }
  for (const [name, id, ss, h, fx, fy] of PANELS) {
    const clip = path.join(HERE, 'clips', `${id}.mp4`), still = path.join(WORK, 'cand', `${id}-big.jpg`);
    const real = existsSync(clip), dir = path.join(WORK, name), mark = path.join(dir, real ? 'clip' : 'still');
    if (existsSync(mark) && !process.env.PREP) continue;
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    const vf = `fps=${FPS},scale=${W}:${h}:force_original_aspect_ratio=increase,crop=${W}:${h}:(iw-${W})*${fx}:(ih-${h})*${fy},` +
      'colorbalance=rs=.04:gs=.015:bs=-.05:rm=.03:bm=-.04,eq=saturation=0.92';
    ff([...(real ? ['-ss', `${ss}`, '-i', clip] : ['-loop', '1', '-i', still]), '-frames:v', `${PN + 1}`, '-vf', vf,
      '-q:v', '3', path.join(dir, '%03d.jpg')]);
    writeFileSync(mark, '');
  }
}

// floating bubbles: [png, size px, x, y at 0s, rise px over 7s, sway px, phase]
const BUBS = [
  [0, 210, 840, 1330, 150, 14, 0.0], [1, 150, 960, 520, 130, 10, 1.7], [2, 120, 700, 1600, 170, 12, 3.1],
  [3, 80, 1010, 1740, 110, 8, 0.9], [4, 96, 740, 420, 120, 9, 2.4], [3, 56, 660, 600, 90, 6, 4.0],
  [1, 70, 1030, 1600, 140, 7, 5.2], [4, 44, 880, 330, 80, 5, 0.4],
];

function page() {
  const bubs = BUBS.map((b, i) => `<img class="b" id="b${i}" src="${url(path.join(CW, `bub${b[0]}.png`))}" style="width:${b[1]}px">`).join('');
  return `<!doctype html><html><head><style>
@font-face{font-family:Figtree;src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'figtree.woff2'))});font-weight:300 900}
@font-face{font-family:Bricolage;src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'bricolage-800.woff2'))});font-weight:800}
@font-face{font-family:Pacifico;src:url(data:font/ttf;base64,${b64(path.join(HERE, '../christmas-countdown/fonts/pacifico.ttf'))})}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
.s{position:absolute;inset:0;overflow:hidden;background:${BG}}
#foam{position:absolute;left:-150px;top:0;height:2100px}
img.b{position:absolute;left:0;top:0;filter:drop-shadow(0 6px 10px rgba(90,70,40,.10))}
#bar{position:absolute;left:0;top:0;z-index:3;filter:drop-shadow(-18px 26px 26px rgba(80,60,30,.28))}
.t{position:absolute;color:${INK};z-index:4;white-space:nowrap}
#small{left:612px;top:700px;font:700 68px/1 Figtree}
#big{left:606px;top:786px;font:800 158px/0.9 Bricolage;letter-spacing:-2px}
#name{left:604px;top:1240px;font:400 92px/1.2 Pacifico}
.pan{position:absolute;left:0;width:${W}px;height:auto}
.band{position:absolute;left:0;width:100%;box-sizing:border-box;border-top:14px solid #fff;border-bottom:14px solid #fff;overflow:hidden;background:${BG};display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3}
.band div{color:${INK};text-align:center}
#glow{position:absolute;left:0;top:760px;width:100%;height:400px;z-index:3;background:radial-gradient(ellipse 60% 46% at 50% 50%,rgba(45,30,15,.62),rgba(45,30,15,.25) 60%,rgba(45,30,15,0))}
#seam{position:absolute;left:0;top:953px;width:100%;height:14px;background:#fff;z-index:4}
.half{position:absolute;left:0;width:100%;height:150px;overflow:hidden;z-index:5}
#h2a{top:803px}#h2b{top:967px}
.half div{position:absolute;left:0;width:100%;text-align:center;color:#fff;font:800 96px/150px Bricolage;letter-spacing:-1px;
  text-shadow:0 2px 18px rgba(40,25,10,.7),0 0 34px rgba(40,25,10,.5),0 0 3px rgba(40,25,10,.5)}
#band3{top:640px;height:640px;gap:40px}
#band3 .a{font:800 92px/1 Bricolage;letter-spacing:-1px}
#band3 .h{font:400 96px/1.1 Pacifico}
#s4 .c{position:absolute;left:0;width:100%;text-align:center;color:${INK};z-index:4}
#e1{top:290px;font:700 68px/1 Figtree}
#e2{top:366px;font:800 150px/1 Bricolage;letter-spacing:-2px}
#e3{top:1420px;font:400 104px/1.25 Pacifico}
#bar4{position:absolute;left:0;top:0;width:820px;filter:drop-shadow(0 26px 30px rgba(80,60,30,.25))}
</style></head><body>
<div class="s" id="s1">
<img id="foam" src="${url(path.join(CW, 'foam.jpg'))}">${bubs}
<img id="bar" src="${url(path.join(TMP, 'bar.png'))}">
<div class="t" id="small">all-natural</div><div class="t" id="big">BAR<br>SOAP</div>
<div class="t" id="name">Sunshine<br>Splash</div>
</div>
<div class="s" id="s2">
<img class="pan" id="p2a" style="top:0"><img class="pan" id="p2b" style="top:960px">
<div id="glow"></div><div id="seam"></div><div class="half" id="h2a"><div id="t2a">with shea butter</div></div>
<div class="half" id="h2b"><div id="t2b">and coconut oil</div></div>
</div>
<div class="s" id="s3">
<img class="pan" id="p3a" style="top:0"><img class="pan" id="p3b" style="top:1280px">
<div class="band" id="band3"><div class="a" id="t3a">moisturizing formula</div><div class="h" id="t3b">made by hand</div></div>
</div>
<div class="s" id="s4">
<div class="c" id="e1">all-natural</div><div class="c" id="e2">BAR SOAP</div>
<img id="bar4" src="${url(path.join(TMP, 'bar.png'))}"><div class="c" id="e3">Sunshine Splash</div>
</div>
<script>
const BUBS = ${JSON.stringify(BUBS)}, CUT = ${JSON.stringify(CUT)}, PN = ${PN}, FPS = ${FPS};
const DIRS = ${JSON.stringify(Object.fromEntries(PANELS.map(([n]) => [n, url(path.join(WORK, n))])))};
const cl = (p) => Math.min(Math.max(p, 0), 1);
const outCubic = (p) => 1 - Math.pow(1 - cl(p), 3);
const outQuint = (p) => 1 - Math.pow(1 - cl(p), 5);
const fade = (el, t, t0, d, rise) => { const p = outCubic((t - t0) / d); el.style.opacity = p;
  el.style.transform = 'translateY(' + (rise * (1 - p)) + 'px)'; el.style.filter = 'blur(' + (6 * (1 - p)) + 'px)'; };
const frame = (id, t0, t) => { const e = document.getElementById(id), k = Math.min(PN, Math.max(0, Math.round((t - t0) * FPS)));
  const src = DIRS[id] + '/' + String(k + 1).padStart(3, '0') + '.jpg';
  if (e.src !== src) { e.src = src; return e.decode(); } };
window.setT = async (t) => {
  const sc = t < CUT[0] ? 1 : t < CUT[1] ? 2 : t < CUT[2] ? 3 : 4;
  ['s1', 's2', 's3', 's4'].forEach((s, i) => document.getElementById(s).style.display = sc === i + 1 ? 'block' : 'none');
  // the wall drifts up slowly
  document.getElementById('foam').style.transform = 'translateY(' + (-20 - 22 * t) + 'px)';
  BUBS.forEach((b, i) => { const e = document.getElementById('b' + i);
    const x = b[2] + b[5] * Math.sin(t * 1.1 + b[6]), y = b[3] - b[4] * t / 7 + 6 * Math.sin(t * 1.6 + b[6]);
    e.style.transform = 'translate(' + (x - b[1] / 2) + 'px,' + (y - b[1] / 2) + 'px)';
    e.style.opacity = outCubic((t - 0.1 * i) / 0.8); });
  const bar = document.getElementById('bar');
  {
    // round 2 (her note): the bar HUGE, sliding in from off screen at the left until it's partly in view, cut off at the
    // left like the inspo's bottle; then a gentle bob
    const p = outCubic(t / 2.1), y = 960 + 6 * Math.sin(t * 1.3) * p;  // round 4: slower, gliding most of the scene
    bar.style.width = '1500px'; bar.style.opacity = 1;
    bar.style.transform = 'translate(' + (-770 - 640 * (1 - p)) + 'px,' + (y - 750) + 'px) rotate(' + (-4 * (1 - p)) + 'deg)';
  }
  // round 3 (her note): the end like the inspo's end card: plain yellow, no foam or bubbles, the WHOLE bar rising into
  // the middle (bar.png's visible part is centred at 48% across, 51% down), the words around it
  const q = outQuint((t - CUT[2]) / 0.9), bar4 = document.getElementById('bar4');
  bar4.style.opacity = cl((t - CUT[2]) / 0.25);
  bar4.style.transform = 'translate(' + (540 - 0.483 * 820) + 'px,' + (975 - 0.509 * 820 + 260 * (1 - q) + 5 * Math.sin(t * 1.3) * q) +
    'px) rotate(' + (-5 * (1 - q)) + 'deg)';
  fade(document.getElementById('e1'), t, CUT[2] + 0.35, 0.5, 20);
  fade(document.getElementById('e2'), t, CUT[2] + 0.5, 0.5, 24);
  fade(document.getElementById('e3'), t, CUT[2] + 0.75, 0.5, 20);
  fade(document.getElementById('small'), t, 0.55, 0.8, 24);
  fade(document.getElementById('big'), t, 0.8, 0.9, 30);
  fade(document.getElementById('name'), t, 1.2, 0.8, 24);
  // round 4 (her note, the inspo's move): no band, one white line on the seam; each line of words starts AT the line and
  // slides outward to its place, the top one up out of it, the bottom one down out of it
  const r = outCubic((t - CUT[0] - 0.1) / 0.6);
  document.getElementById('glow').style.opacity = r;
  document.getElementById('t2a').style.transform = 'translateY(' + (150 * (1 - r)) + 'px)';
  document.getElementById('t2b').style.transform = 'translateY(' + (-150 * (1 - r)) + 'px)';
  // round 2 (her note): the two phrases kept apart, one after the other
  fade(document.getElementById('t3a'), t, CUT[1] + 0.1, 0.45, 20);
  fade(document.getElementById('t3b'), t, CUT[1] + 0.6, 0.45, 20);
  if (sc === 2) await Promise.all([frame('p2a', CUT[0], t), frame('p2b', CUT[0], t)]);
  if (sc === 3) await Promise.all([frame('p3a', CUT[1], t), frame('p3b', CUT[1], t)]);
};
</script></body></html>`;
}

async function frames(times, name) {
  prep();
  const html = path.join(WORK, 'page.html');
  writeFileSync(html, page());
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: W, height: H });
  await pg.goto(url(html), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  for (const [k, t] of times.entries()) {
    await pg.evaluate((t) => window.setT(t), t);
    await pg.screenshot({ path: name(k, t) });
  }
  await b.close();
}

if (process.argv[2] === 'still') {
  const ts = process.argv.slice(3).map(Number);
  await frames(ts, (k, t) => path.join(WORK, `still-${BGK}-${t}.png`));
  console.log(ts.map((t) => path.join(WORK, `still-${BGK}-${t}.png`)).join('\n'));
} else {
  const dir = path.join(WORK, 'f');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  await frames(Array.from({ length: LEN * FPS }, (_, k) => k / FPS), (k) => path.join(dir, `${String(k).padStart(4, '0')}.png`));
  const out = path.join(OUT, 'reel-bubbles-v3.mp4');
  // no sound effects (her ask): a silent audio track, so it joins the other Reels the same way
  ff(['-framerate', `${FPS}`, '-i', path.join(dir, '%04d.png'), '-f', 'lavfi', '-t', `${LEN}`, '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', '[0:v]format=yuv420p,noise=alls=3:allf=t+u,format=yuv420p[v]',
    '-map', '[v]', '-map', '1:a', '-t', `${LEN}`, '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}
