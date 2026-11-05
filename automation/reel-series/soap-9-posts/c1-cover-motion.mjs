// The bathtub carousel cover (carousel-1/slide-01.png, her approved Canva v4, design DAHaAkk7la4) in motion for the main
// Reel's grid tile. Two ways (her note 2026-11-04: the stuff gets LOADED INTO the tub):
//   into  starts on the cover itself; each label fades, then the bar, loofah, body brush and sea sponge hop one by one
//         into the tub with a splash, and sit there peeking over the rim with bubbles
//   out   the alternate: they start in the tub and hop out to their spots, labels fade up, and it ends on the cover
// The pieces are cut from the slide itself (flat #F4D3CA background, so each piece un-blends exactly), never redrawn, and
// whenever the layout is the cover, the frame IS the approved slide, untouched.
//   node c1-cover-motion.mjs into v4   renders <exports>/soap-9-posts/carousel-1/cover-motion-into-v4.mp4 (a preview)
//   node c1-cover-motion.mjs into      renders .../carousel-1/cover-motion.mp4 (the approved one, for build.mjs)
import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const DIR = path.join(P.exports, 'soap-9-posts', 'carousel-1');
const SLIDE = path.join(DIR, 'slide-01.png');
const TMP = path.join(P.exports, 'soap-9-posts', '.work', 'c1cov');
const W = 1080, H = 1440, FPS = 30, LEN = 3.3;
const [mode = 'into', ver] = process.argv.slice(2);
if (!['into', 'out'].includes(mode)) throw new Error('mode is into or out');
const OUT = path.join(DIR, ver ? `cover-motion-${mode}-${ver}.mp4` : 'cover-motion.mp4');

// each piece's box on the slide [x0, y0, x1, y1]; the boxes tile the slide with no overlap, so laying every piece back
// at home over the background gives the slide again. rest = where it sits in the tub [x, y, scale, degrees], peeking over
// the rim; via = the two bezier handles of its hop (the sponge goes round the tub's left end, behind it)
const TUB = [229, 540, 868, 916];
const ITEMS = [
  { name: 'soap', box: [380, 200, 700, 478], label: [380, 478, 700, 545], rest: [600, 545, 0.7, -10], via: [[560, 150], [610, 250]] },
  { name: 'loofah', box: [0, 580, 229, 764], label: [0, 764, 229, 830], rest: [405, 562, 0.75, 18], via: [[150, 380], [380, 300]] },
  { name: 'brush', box: [868, 580, 1080, 772], label: [868, 772, 1080, 830], rest: [735, 565, 0.75, -14], via: [[950, 380], [780, 300]] },
  { name: 'sponge', box: [400, 930, 680, 1130], label: [400, 1130, 680, 1200], rest: [505, 572, 0.75, 8], via: [[-60, 1150], [-60, 250]] },
];
const START = 0.35, GAP = 0.4, HOP = 0.6; // item i moves at START + GAP * i, for HOP seconds
const LAST = START + GAP * 3;
// out: every item has landed and every label is in from here, so the frames are the slide itself
const DONE = mode === 'out' ? LAST + HOP + 0.3 : Infinity;

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
const b = await launch(), page = await b.newPage();
await page.setViewport({ width: W, height: H });
await page.setContent(`<style>html,body{margin:0;background:#F4D3CA}</style><canvas id=c width=${W} height=${H}></canvas>`);
await page.evaluate(async (src, TUB, ITEMS) => {
  const img = new Image(); img.src = src; await img.decode();
  const cv = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const full = cv(1080, 1440).getContext('2d');
  full.drawImage(img, 0, 0);
  const BG = [244, 211, 202];
  // un-blend a box from the flat background: the least alpha that explains each pixel; solid where it's clearly the object
  // solid: rows of the tub's body (its light grey is close to the pink, so it would come out see-through); every pixel
  // between the first and last white-ish one in a row is solid, title included, so the items vanish behind it
  const cut = ([x0, y0, x1, y1], solid) => {
    const w = x1 - x0, h = y1 - y0, c = cv(w, h), g = c.getContext('2d');
    const d = full.getImageData(x0, y0, w, h), p = d.data;
    const fill = new Uint8Array(w * h);
    if (solid) for (let y = solid[0] - y0; y < solid[1] - y0; y++) {
      let lo = -1, hi = -1;
      for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (p[i + 1] > 215 && p[i + 2] > 206) { if (lo < 0) lo = x; hi = x; } }
      for (let x = lo; lo >= 0 && x <= hi; x++) fill[y * w + x] = 1;
    }
    for (let i = 0; i < p.length; i += 4) {
      let a = 0, far = 0;
      for (let k = 0; k < 3; k++) {
        const v = p[i + k], o = BG[k];
        far = Math.max(far, Math.abs(v - o));
        a = Math.max(a, v > o ? (v - o) / (255 - o) : (o - v) / o);
      }
      if (far > 30 || fill[i / 4]) a = 1;
      if (a < 0.004) { p[i + 3] = 0; continue; }
      for (let k = 0; k < 3; k++) p[i + k] = Math.round(Math.max(0, Math.min(255, BG[k] + (p[i + k] - BG[k]) / a)));
      p[i + 3] = Math.round(a * 255);
    }
    g.putImageData(d, 0, 0);
    return c;
  };
  window.SLIDE = img;
  window.TUB = { c: cut(TUB, [555, 805]), x: TUB[0], y: TUB[1] };
  window.ITEMS = ITEMS.map((it) => ({ ...it, c: cut(it.box), l: cut(it.label) }));
}, `data:image/png;base64,${readFileSync(SLIDE).toString('base64')}`, TUB, ITEMS);

for (let f = 0; f < Math.round(LEN * FPS); f++) {
  const png = await page.evaluate((t, mode, START, GAP, HOP, LAST, DONE) => {
    const g = document.getElementById('c').getContext('2d');
    const done = () => document.getElementById('c').toDataURL('image/png');
    if (t >= DONE || (mode === 'into' && t < START)) { g.drawImage(SLIDE, 0, 0); return done(); }
    const c = (x) => Math.max(0, Math.min(1, x)), out3 = (x) => 1 - Math.pow(1 - c(x), 3);
    const io3 = (x) => { x = c(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    // fixed "random" numbers, so every render is the same
    const rnd = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const bubble = (bx, by, r, a) => {
      g.globalAlpha = a;
      g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
      g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
      g.beginPath(); g.arc(bx - r * 0.35, by - r * 0.35, r * 0.22, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.globalAlpha = 1;
    };
    g.fillStyle = '#F4D3CA'; g.fillRect(0, 0, 1080, 1440);
    const items = [], fx = [];
    ITEMS.forEach((it, i) => {
      const s = START + GAP * i, [x0, y0, x1, y1] = it.box, w = x1 - x0, h = y1 - y0, hx = x0 + w / 2, hy = y0 + h / 2;
      const [rx, ry, rs, rr] = it.rest;
      // k: 0 = at home on the cover, 1 = sitting in the tub
      const p = (t - s) / HOP, k = mode === 'into' ? io3(p) : 1 - io3(p);
      const b3 = (a, b, cc, d) => (1 - k) ** 3 * a + 3 * k * (1 - k) ** 2 * b + 3 * k * k * (1 - k) * cc + k ** 3 * d;
      const bob = 5 * Math.sin(2 * Math.PI * t / 1.4 + i * 1.7) * k ** 4; // a gentle float while it sits in the water
      items.push({ it, x: b3(hx, it.via[0][0], it.via[1][0], rx), y: b3(hy, it.via[0][1], it.via[1][1], ry) + bob,
        sc: 1 + (rs - 1) * k, rot: rr * k, w, h, home: k === 0 });
      // the label: fades away as its item leaves the cover, or up once it lands back there
      const lk = mode === 'into' ? 1 - c((t - s + 0.1) / 0.15) : out3((t - s - HOP) / 0.2);
      if (lk > 0) fx.push(() => { g.globalAlpha = lk; g.drawImage(it.l, it.label[0], it.label[1] + (mode === 'out' ? 14 * (1 - lk) : 0)); g.globalAlpha = 1; });
      // the splash where it goes in (or jumps out): bubbles float up and pop, droplets fly out and fall
      const bt = t - (mode === 'into' ? s + HOP * 0.72 : s + HOP * 0.12);
      if (bt > 0 && bt < 0.8) fx.push(() => {
        for (let n = 0; n < 11; n++) {
          const r0 = 5 + 12 * rnd(i * 50 + n), life = 0.5 + 0.3 * rnd(i * 50 + n + 20), q = bt / life;
          if (q >= 1) continue;
          const bx = rx + (rnd(i * 50 + n + 7) - 0.5) * 170 + 10 * Math.sin(bt * 9 + n);
          const by = 600 - 20 * rnd(i * 50 + n + 3) - (60 + 120 * rnd(i * 50 + n + 11)) * out3(q);
          bubble(bx, by, r0 * (q < 0.85 ? Math.min(1, q / 0.12) : 1 + (q - 0.85) * 3), q < 0.85 ? 1 : 1 - (q - 0.85) / 0.15);
        }
        for (let n = 0; n < 7; n++) {
          const q = bt / 0.55; if (q >= 1) continue;
          const dir = (n / 6 - 0.5) * 2.2 + (rnd(i * 30 + n) - 0.5) * 0.3, sp = 240 + 160 * rnd(i * 30 + n + 5);
          const dx = rx + Math.sin(dir) * sp * bt, dy = 590 - Math.cos(dir) * sp * bt + 900 * bt * bt;
          g.globalAlpha = 1 - q;
          g.beginPath(); g.ellipse(dx, dy, 5, 7, dir, 0, Math.PI * 2); g.fillStyle = '#FFFFFF'; g.fill();
          g.lineWidth = 1.5; g.strokeStyle = 'rgba(150,190,215,.8)'; g.stroke();
          g.globalAlpha = 1;
        }
      });
    });
    // while there's anything in the tub, a few small bubbles keep drifting up off the water
    const foam = mode === 'into' ? c((t - LAST - HOP * 0.7) / 0.3) : 1 - c((t - START) / (LAST - START + 0.2));
    if (foam > 0) fx.push(() => {
      for (let n = 0; n < 9; n++) {
        const per = 1.1 + 0.5 * rnd(n + 400), q = ((t + per * rnd(n + 300)) % per) / per;
        const bx = 360 + 440 * rnd(n + 200) + 8 * Math.sin(t * 5 + n), by = 598 - 110 * q;
        bubble(bx, by, (4 + 7 * rnd(n + 100)) * Math.min(1, q / 0.15), foam * (q < 0.8 ? 1 : (1 - q) / 0.2));
      }
    });
    // everything sits behind the tub, so in the tub only the tops show over the rim
    for (const { it, x, y, sc, rot, w, h, home } of items) {
      if (home) { g.drawImage(it.c, it.box[0], it.box[1]); continue; }
      g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(sc, sc);
      g.drawImage(it.c, -w / 2, -h / 2); g.restore();
    }
    g.drawImage(TUB.c, TUB.x, TUB.y);
    fx.forEach((fn) => fn());
    return done();
  }, f / FPS, mode, START, GAP, HOP, LAST, DONE);
  writeFileSync(path.join(TMP, `${String(f + 1).padStart(4, '0')}.png`), Buffer.from(png.split(',')[1], 'base64'));
}
await b.close();

execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', '-framerate', `${FPS}`, '-i', path.join(TMP, '%04d.png'),
  '-r', `${FPS}`, '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-an', OUT],
  { stdio: ['ignore', 'inherit', 'inherit'] });
console.log(OUT);
