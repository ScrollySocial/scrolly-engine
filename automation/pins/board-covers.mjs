// Renders the 13 Pinterest board covers (1000x1500 Pins; Pinterest crops a centre square for the cover)
// plus profile-preview.png showing the square crops side by side, the way the profile grid shows them.
// Usage: node board-covers.mjs [navy|cream]   (one ground for the whole set; default navy)
// Output: pins/out/board-covers/<ground>/
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOGO = readFileSync(path.join(HERE, '../../Scrolly Organic Engine/brand/assets/ambition-department-logo.svg'), 'utf8');

// Brand grounds (brand/visual-system.md). Hot pink means Mercedes, so it stays off product boards.
// Mercedes 2026-10-27: one colour for the whole set, no bright sky-blue grounds.
const GROUNDS = {
  navy: { bg: '#0a1930', ink: '#ffffff', serif: '#dfe4f0', chipBg: '#4da3ff', chipInk: '#0a1930', grain: 0.10 },
  cream: { bg: '#f7f3ec', ink: '#0a1930', serif: '#0a1930', chipBg: '#0a1930', chipInk: '#ffffff', grain: 0.07 },
};
const gName = process.argv[2] || 'navy';
const c = GROUNDS[gName];
if (!c) { console.log('Usage: node board-covers.mjs [navy|cream]'); process.exit(1); }
const OUT = path.join(HERE, 'out/board-covers', gName);

// Exact live board names (pin-generator-plan.md). Pin anatomy from her references: serif lead-in, heavy sans keyword, chip.
const BOARDS = [
  { file: '01-reels', board: 'Instagram Reels Ideas for Small Business', top: 'Instagram', big: ['Reels'], chip: 'Ideas for small business' },
  { file: '02-capcut', board: 'CapCut Reel Templates', top: 'Editable', big: ['CapCut'], chip: 'Reel templates' },
  { file: '03-growth', board: 'Instagram Growth Tips for Small Business', top: 'Instagram', big: ['Growth'], chip: 'Tips for small business' },
  { file: '04-carousels', board: 'Instagram Carousel and Canva Templates', top: 'Instagram', big: ['Carousels'], chip: 'Canva templates' },
  { file: '05-planning', board: 'Social Media Content Planning', top: 'Social media', big: ['Content', 'planning'], chip: 'Plan a week in one sitting' },
  { file: '06-dm', board: 'Instagram DM Automation', top: 'Instagram', big: ['DM', 'automation'], chip: 'Comment to DM' },
  { file: '07-ai', board: 'AI Tools for Small Business', top: 'Small business', big: ['AI tools'], chip: 'ChatGPT and Claude' },
  { file: '08-pricing', board: 'Pricing Your Products and Services', top: 'Your products', big: ['Pricing'], chip: 'Free calculators' },
  { file: '09-goals', board: 'Small Business Goal Setting', top: 'Small business', big: ['Goal', 'setting'], chip: 'Free calculators' },
  { file: '10-seo', board: 'Website SEO for Small Business', top: 'Website', big: ['SEO'], chip: 'For small business' },
  { file: '11-marketing', board: 'Business Marketing Ideas', top: 'Business', big: ['Marketing'], chip: 'Ideas' },
  { file: '12-holiday', board: 'Holiday Marketing Ideas for Small Business', top: 'Holiday', big: ['Marketing'], chip: 'Black Friday to Christmas' },
  { file: '13-pinterest', board: 'Pinterest Marketing for Small Business', top: 'Small business', big: ['Pinterest'], chip: 'Marketing tips' },
];

const W = 1000, H = 1500, SQ = 1000; // the cover crop is the middle 1000x1000

// Paper grain so flat colour reads as printed stock, not a web panel.
const GRAIN = `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${c.grain} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;

const coverHtml = (b) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@600;800&family=Instrument+Serif&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: ${c.bg}; background-image: ${GRAIN}; color: ${c.ink}; font-family: Jost, Arial, sans-serif; overflow: hidden; }
  .sq { position: absolute; left: 0; top: ${(H - SQ) / 2}px; width: ${SQ}px; height: ${SQ}px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 80px 90px; }
  .top { font-family: 'Instrument Serif', Georgia, serif; font-size: 120px; line-height: 1; color: ${c.serif}; margin-bottom: 18px; }
  .big { font-weight: 800; text-transform: uppercase; line-height: .88; letter-spacing: -.015em; }
  .big span { display: block; white-space: nowrap; }
  .chip { margin-top: 48px; background: ${c.chipBg}; color: ${c.chipInk}; font-weight: 600; font-size: 58px; line-height: 1;
          padding: 24px 46px 27px; border-radius: 999px; white-space: nowrap; }
  .logo { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); width: 210px; color: ${c.ink}; }
  .logo svg { width: 100%; height: auto; display: block; }
</style></head><body>
  <div class="sq">
    <div class="top">${esc(b.top)}</div>
    <div class="big">${b.big.map((w) => `<span>${esc(w)}</span>`).join('')}</div>
    <div class="chip">${esc(b.chip)}</div>
    <div class="logo">${LOGO}</div>
  </div>
<script>
  // Largest size where every line fits the safe width and the block leaves room for the lead-in, chip and logo.
  const big = document.querySelector('.big'), maxW = ${SQ - 160}, maxH = ${b.big.length > 1 ? 380 : 260};
  let s = 300; big.style.fontSize = s + 'px';
  while (s > 60 && ([...big.children].some((l) => l.scrollWidth > maxW) || big.offsetHeight > maxH)) { s -= 2; big.style.fontSize = s + 'px'; }
</script></body></html>`;

const previewHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;700&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { background: #fff; font-family: Jost, Arial, sans-serif; padding: 40px; width: 1240px; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 28px 20px; }
  .card img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 16px; display: block; }
  .card p { font-weight: 700; font-size: 17px; margin-top: 8px; color: #111; line-height: 1.25; }
</style></head><body><div class="grid">
${BOARDS.map((b) => `<div class="card"><img src="${fileUrl(path.join(OUT, b.file + '.png'))}"><p>${esc(b.board)}</p></div>`).join('\n')}
</div></body></html>`;

mkdirSync(OUT, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
for (const b of BOARDS) {
  const f = path.join(OUT, '.' + b.file + '.html');
  writeFileSync(f, coverHtml(b));
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  const missing = await pg.evaluate(() => ['Jost', 'Instrument Serif'].filter((n) => ![...document.fonts].some((x) => x.family.replace(/"/g, '') === n && x.status === 'loaded')));
  if (missing.length) console.log(`WARN ${b.file}: ${missing.join(', ')} did not load`);
  const chipW = await pg.evaluate(() => document.querySelector('.chip').offsetWidth);
  if (chipW > 840) console.log(`WARN ${b.file}: chip is ${chipW}px wide, shorten it`);
  await pg.screenshot({ path: path.join(OUT, b.file + '.png') });
  console.log('cover  ' + b.file);
}
const pf = path.join(OUT, '.preview.html');
writeFileSync(pf, previewHtml());
await pg.setViewport({ width: 1240, height: 800, deviceScaleFactor: 1 });
await pg.goto(fileUrl(pf), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: path.join(OUT, 'profile-preview.png'), fullPage: true });
await browser.close();
console.log('done   ' + OUT);
