// Renders the 13 Pinterest board covers (1000x1500 Pins; Pinterest crops a centre square for the cover)
// plus profile-preview.png showing the square crops side by side, the way the profile grid shows them.
// Usage: node board-covers.mjs   Output: pins/out/board-covers/
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/board-covers');
const LOGO = readFileSync(path.join(HERE, '../../Scrolly Organic Engine/brand/assets/ambition-department-logo.svg'), 'utf8');

// Brand grounds (brand/visual-system.md). Hot pink means Mercedes, so it stays off product boards.
const GROUNDS = {
  navy: { bg: '#0a1930', ink: '#ffffff', sub: '#4da3ff' },
  sky: { bg: '#4da3ff', ink: '#0a1930', sub: '#0a1930' },
  mist: { bg: '#dfe4f0', ink: '#0a1930', sub: '#4a4e66' },
  cream: { bg: '#f7f3ec', ink: '#0a1930', sub: '#4a4e66' },
};

// Exact live board names (pin-generator-plan.md). Big words read at thumbnail size; the full name sits under the cover.
const BOARDS = [
  { file: '01-reels', board: 'Instagram Reels Ideas for Small Business', big: ['Reels'], sub: 'ideas for small business', g: 'navy' },
  { file: '02-capcut', board: 'CapCut Reel Templates', big: ['CapCut'], sub: 'Reel templates', g: 'sky' },
  { file: '03-growth', board: 'Instagram Growth Tips for Small Business', big: ['Instagram', 'growth'], sub: 'tips for small business', g: 'mist' },
  { file: '04-carousels', board: 'Instagram Carousel and Canva Templates', big: ['Carousel'], sub: 'and Canva templates', g: 'cream' },
  { file: '05-planning', board: 'Social Media Content Planning', big: ['Content', 'planning'], sub: 'for social media', g: 'sky' },
  { file: '06-dm', board: 'Instagram DM Automation', big: ['DM', 'automation'], sub: 'for Instagram', g: 'navy' },
  { file: '07-ai', board: 'AI Tools for Small Business', big: ['AI tools'], sub: 'for small business', g: 'cream' },
  { file: '08-pricing', board: 'Pricing Your Products and Services', big: ['Pricing'], sub: 'products and services', g: 'mist' },
  { file: '09-goals', board: 'Small Business Goal Setting', big: ['Goal', 'setting'], sub: 'for small business', g: 'navy' },
  { file: '10-seo', board: 'Website SEO for Small Business', big: ['Website', 'SEO'], sub: 'for small business', g: 'sky' },
  { file: '11-marketing', board: 'Business Marketing Ideas', big: ['Marketing', 'ideas'], sub: 'for business', g: 'mist' },
  { file: '12-holiday', board: 'Holiday Marketing Ideas for Small Business', big: ['Holiday', 'marketing'], sub: 'ideas for small business', g: 'cream' },
  { file: '13-pinterest', board: 'Pinterest Marketing for Small Business', big: ['Pinterest', 'marketing'], sub: 'for small business', g: 'navy' },
];

const W = 1000, H = 1500, SQ = 1000; // the cover crop is the middle 1000x1000

const coverHtml = (b) => {
  const c = GROUNDS[b.g];
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;800&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background: ${c.bg}; color: ${c.ink}; font-family: Jost, Arial, sans-serif; overflow: hidden; }
  .sq { position: absolute; left: 0; top: ${(H - SQ) / 2}px; width: ${SQ}px; height: ${SQ}px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 90px; }
  .big { font-weight: 800; text-transform: uppercase; line-height: .9; letter-spacing: -.01em; }
  .big span { display: block; white-space: nowrap; }
  .sub { margin-top: 44px; font-weight: 500; font-size: 74px; line-height: 1.1; color: ${c.sub}; }
  .logo { position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); width: 230px; color: ${c.ink}; }
  .logo svg { width: 100%; height: auto; display: block; }
</style></head><body>
  <div class="sq">
    <div class="big">${b.big.map((w) => `<span>${esc(w)}</span>`).join('')}</div>
    <div class="sub">${esc(b.sub)}</div>
    <div class="logo">${LOGO}</div>
  </div>
<script>
  // Largest size where every line fits the safe width and the block leaves room for the sub line and logo.
  const big = document.querySelector('.big'), maxW = ${SQ - 180}, maxH = ${b.big.length > 1 ? 420 : 300};
  let s = 260; big.style.fontSize = s + 'px';
  while (s > 60 && ([...big.children].some((l) => l.scrollWidth > maxW) || big.offsetHeight > maxH)) { s -= 2; big.style.fontSize = s + 'px'; }
</script></body></html>`;
};

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
  const ok = await pg.evaluate(() => [...document.fonts].some((x) => x.family.replace(/"/g, '') === 'Jost' && x.status === 'loaded'));
  if (!ok) console.log(`WARN ${b.file}: Jost did not load`);
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
