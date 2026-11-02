// Renders Instagram Story Highlight covers (1080x1920 Story images; Instagram crops a centre circle for the cover)
// plus preview.png showing each circle at profile size on light and dark mode.
// Usage: node highlight-covers.mjs        Output: ig-highlights/out/
// Stars are cut from the footer foil art (website/scrolly-site/assets/ftr-stars.webp), the one place foil is allowed.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
// The website header logo: "Ambition" is its own path (class="amb") so it can be sky blue (Mercedes 2026-10-26).
// The website's highlighter stroke (--s3-mark in chrome/v3.css): see-through, ragged, slightly tilted.
const MARK = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/v3.css'), 'utf8').match(/--s3-mark:(url\("[^"]+"\)[^;]*);/)[1];
const LOGO = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/logo.html'), 'utf8').match(/<svg[\s\S]*<\/svg>/)[0];
const STAR = (n) => fileUrl(path.join(HERE, 'assets/stars', n + '.png'));
const W = 1080, H = 1920, CIRCLE = 1000; // keep everything that matters inside the centre circle

const GRAIN = (a) => `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${a} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;

// Star placements are relative to the circle centre: [file, x, y, size, rotate].
const COVERS = [
  // Freebies cover APPROVED by Mercedes 2026-11-02 (option F2): tilted crinkled gold foil star (her prop library,
  // images/Gold foil star sticker-95) on blue mist, FREEBIES on a sky label with navy text, centred on the star.
  // Rejected on the way: words with small stars scattered around, navy grounds, handwritten, FREE/FREEBIE words.
  // The other highlights reuse this look; only the word changes.
  {
    file: 'freebies', label: 'Freebies (approved)',
    bg: '#dfe4f0', grain: 0.07,
    stars: [['foil-95', 0, 25, 960, -8]],
    word: { text: 'FREEBIES', font: 'Jost', weight: 800, color: '#0a1930', size: 140, y: 60, rotate: -8, bg: '#4da3ff' },
    // Seen when the Story itself plays (outside the circle crop): a headline above, logo + site below.
    top: 'Free tools for your business', sub: 'Tap through for quizzes, calculators and guides',
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;800&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: ${c.bg}; background-image: ${GRAIN(c.grain)}; overflow: hidden; }
  .c { position: absolute; left: ${(W - CIRCLE) / 2}px; top: ${(H - CIRCLE) / 2}px; width: ${CIRCLE}px; height: ${CIRCLE}px; }
  .fx { position: absolute; inset: 0; width: 100%; height: 100%; }
  .word { position: absolute; left: 50%; top: 50%; transform: translate(-50%, calc(-50% + ${c.word.y}px)) rotate(${c.word.rotate || 0}deg);
          font-family: '${c.word.font}', Arial, sans-serif; font-weight: ${c.word.weight}; font-size: ${c.word.size}px;
          color: ${c.word.color}; line-height: 1;${c.word.bg ? ` background: ${c.word.bg}; padding: .1em .32em .14em; border-radius: .12em;` : ''} letter-spacing: ${c.word.font === 'Jost' ? '-.01em' : '0'}; white-space: nowrap; }
  .star { position: absolute; filter: drop-shadow(0 6px 8px rgba(10,25,48,.22)); }
  /* Outside the circle: Instagram's top bar ends near 230px and the reply bar starts near 1700px. */
  .top { position: absolute; left: 80px; right: 80px; top: 250px; text-align: center; color: #0a1930; }
  .top h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 92px; line-height: 1; letter-spacing: -.01em; }
  .top p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 38px; margin-top: 16px; }
  .foot { position: absolute; left: 0; right: 0; top: 1520px; text-align: center; color: #0a1930; }
  .foot .amb { fill: #4da3ff; }
  .top mark { background: ${MARK}; color: #0a1930; padding: 0 .3em; }
  .foot svg { width: 340px; height: auto; display: block; margin: 0 auto; }
  .foot p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 34px; margin-top: 14px; }
</style></head><body><div class="c">
  ${c.sparkle ? sparkle(c.sparkle) : ''}${c.loop ? LOOP : ''}${c.swoosh ? SWOOSH : ''}
  ${c.stars.map(([f, x, y, s, r]) => `<img class="star" src="${STAR(f)}" style="width:${s}px;left:${CIRCLE / 2 + x - s / 2}px;top:${CIRCLE / 2 + y - s / 2}px;transform:rotate(${r}deg)">`).join('\n  ')}
  <div class="word">${esc(c.word.text)}</div>
</div>
${c.top ? `<div class="top"><h1>${esc(c.top)}</h1><p><mark>${esc(c.sub)}</mark></p></div>
<div class="foot">${LOGO}<p>theambitiondepartment.com</p></div>` : ''}
</body></html>`;

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
  .full { width: 360px; border-radius: 14px; border: 1px solid #dbdbdb; }
  p { font-size: 18px; font-weight: 700; margin-top: 12px; }
  .small p { font-size: 14px; font-weight: 500; margin-top: 6px; }
</style></head><body>
${['big', 'small', 'small dark'].map((cls) => `<div class="row ${cls}">${COVERS.map((c) => `<div class="cell"><div class="crop"><img src="${fileUrl(path.join(OUT, c.file + '.png'))}"></div><p>${esc(cls === 'big' ? c.label : 'Freebies')}</p></div>`).join('')}</div>`).join('\n')}
<div class="row story">${COVERS.map((c) => `<div class="cell"><img class="full" src="${fileUrl(path.join(OUT, c.file + '.png'))}"><p>Full Story view</p></div>`).join('')}</div>
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
