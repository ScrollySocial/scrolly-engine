// Renders Instagram Story Highlight covers (1080x1920 Story images; Instagram crops a centre circle for the cover)
// plus preview.png showing each circle at profile size on light and dark mode.
// Usage: node highlight-covers.mjs        Output: ig-highlights/out/
// Stars are cut from the footer foil art (website/scrolly-site/assets/ftr-stars.webp), the one place foil is allowed.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const STAR = (n) => fileUrl(path.join(HERE, 'assets/stars', n + '.png'));
const W = 1080, H = 1920, CIRCLE = 1000; // keep everything that matters inside the centre circle

const GRAIN = (a) => `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${a} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;

// Star placements are relative to the circle centre: [file, x, y, size, rotate].
const COVERS = [
  // Mercedes 2026-11-02: A (blue mist) chosen; stars must read at profile size, so fewer and much bigger.
  {
    file: 'free-a1-two-stars', label: 'A1. Two big stars',
    bg: '#dfe4f0', grain: 0.07,
    word: { text: 'FREE', font: 'Jost', weight: 800, color: '#0a1930', size: 210, y: 10 },
    stars: [['00-gold', 275, -290, 330, 8], ['02-silver', -275, 300, 290, -10]],
  },
  {
    file: 'free-a2-three-stars', label: 'A2. Three big stars',
    bg: '#dfe4f0', grain: 0.07,
    word: { text: 'FREE', font: 'Jost', weight: 800, color: '#0a1930', size: 210, y: 10 },
    stars: [['00-gold', -265, -295, 300, -6], ['02-silver', 290, -270, 230, 10], ['01-gold', 255, 310, 260, 4]],
  },
  {
    file: 'free-a3-one-hero-star', label: 'A3. One hero star',
    bg: '#dfe4f0', grain: 0.07,
    word: { text: 'FREE', font: 'Jost', weight: 800, color: '#0a1930', size: 210, y: 130 },
    stars: [['00-gold', 0, -200, 370, 0], ['02-silver', -320, 250, 180, -10], ['01-gold', 320, 250, 160, 6]],
  },
];

// Hand-drawn, slightly uneven loop around the word (sky blue, never touching the letters).
const LOOP = `<svg class="fx" viewBox="-500 -500 1000 1000"><path d="M-370,-20 C-385,-180 -160,-245 40,-240 C250,-235 405,-170 400,-5 C395,150 210,215 -10,212 C-220,209 -395,140 -388,0 C-384,-95 -300,-165 -200,-195" fill="none" stroke="#4da3ff" stroke-width="16" stroke-linecap="round"/></svg>`;
// Hand-drawn underline under the handwritten word.
const SWOOSH = `<svg class="fx" viewBox="-500 -500 1000 1000"><path d="M-310,135 C-180,110 20,105 300,120 M-250,165 C-100,150 80,148 230,158" fill="none" stroke="#4da3ff" stroke-width="15" stroke-linecap="round"/></svg>`;
// Eight-point sparkle badge behind the word.
const sparkle = (fill) => {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? 230 : (i % 4 === 0 ? 420 : 330), t = (i * Math.PI) / 8 - Math.PI / 2;
    pts.push(`${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`);
  }
  return `<svg class="fx" viewBox="-500 -500 1000 1000"><polygon points="${pts.join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="40" stroke-linejoin="round"/></svg>`;
};

const coverHtml = (c) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@800&family=Covered+By+Your+Grace&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: ${c.bg}; background-image: ${GRAIN(c.grain)}; overflow: hidden; }
  .c { position: absolute; left: ${(W - CIRCLE) / 2}px; top: ${(H - CIRCLE) / 2}px; width: ${CIRCLE}px; height: ${CIRCLE}px; }
  .fx { position: absolute; inset: 0; width: 100%; height: 100%; }
  .word { position: absolute; left: 50%; top: 50%; transform: translate(-50%, calc(-50% + ${c.word.y}px));
          font-family: '${c.word.font}', Arial, sans-serif; font-weight: ${c.word.weight}; font-size: ${c.word.size}px;
          color: ${c.word.color}; line-height: 1; letter-spacing: ${c.word.font === 'Jost' ? '-.01em' : '0'}; white-space: nowrap; }
  .star { position: absolute; filter: drop-shadow(0 6px 8px rgba(10,25,48,.22)); }
</style></head><body><div class="c">
  ${c.sparkle ? sparkle(c.sparkle) : ''}${c.loop ? LOOP : ''}${c.swoosh ? SWOOSH : ''}
  <div class="word">${esc(c.word.text)}</div>
  ${c.stars.map(([f, x, y, s, r]) => `<img class="star" src="${STAR(f)}" style="width:${s}px;left:${CIRCLE / 2 + x - s / 2}px;top:${CIRCLE / 2 + y - s / 2}px;transform:rotate(${r}deg)">`).join('\n  ')}
</div></body></html>`;

// Each cover as Instagram shows it: a circle, big for judging and at real profile size (77px) on light and dark.
const previewHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;700&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { background: #fff; font-family: Jost, Arial, sans-serif; width: 1400px; }
  .row { display: grid; grid-template-columns: repeat(${COVERS.length}, 1fr); gap: 20px; padding: 36px 40px; }
  .dark { background: #000; color: #f5f5f5; }
  .cell { text-align: center; }
  .crop { margin: 0 auto; border-radius: 50%; overflow: hidden; position: relative; border: 2px solid #dbdbdb; }
  .dark .crop { border-color: #363636; }
  .crop img { position: absolute; left: 0; width: 100%; top: 50%; transform: translateY(-50%); }
  .big .crop { width: 280px; height: 280px; }
  .small .crop { width: 77px; height: 77px; }
  p { font-size: 18px; font-weight: 700; margin-top: 12px; }
  .small p { font-size: 14px; font-weight: 500; margin-top: 6px; }
</style></head><body>
${['big', 'small', 'small dark'].map((cls) => `<div class="row ${cls}">${COVERS.map((c) => `<div class="cell"><div class="crop"><img src="${fileUrl(path.join(OUT, c.file + '.png'))}"></div><p>${esc(cls === 'big' ? c.label : 'Freebies')}</p></div>`).join('')}</div>`).join('\n')}
</body></html>`;

mkdirSync(OUT, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
for (const c of COVERS) {
  const f = path.join(OUT, '.' + c.file + '.html');
  writeFileSync(f, coverHtml(c));
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(OUT, c.file + '.png') });
  console.log('cover  ' + c.file);
}
const pf = path.join(OUT, '.preview.html');
writeFileSync(pf, previewHtml());
await pg.setViewport({ width: 1400, height: 800, deviceScaleFactor: 1 });
await pg.goto(fileUrl(pf), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: path.join(OUT, 'preview.png'), fullPage: true });
await browser.close();
console.log('done   ' + OUT);
