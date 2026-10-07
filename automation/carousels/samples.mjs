// Style D sample sheet: the locked palettes with every pattern and overlay, for review.
// Uses a Playbook stock photo as a stand-in for Mercedes in the polaroid sample.
// Usage: node samples.mjs → <exports>/_style-samples/D-variety.png
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cfg, fileUrl, launch, REPO, W, H } from './lib/common.mjs';
import { pageHtml } from './lib/templates.mjs';

const brand = cfg('brand');
const out = path.join(cfg('media').exportsDir, '_style-samples');
mkdirSync(out, { recursive: true });
const stock = fileUrl(path.join(REPO, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock/barista.jpg'));
const mediaFor = (id) => (id ? { url: stock, focus: '50% 30%' } : null);

const samples = [
  ['warm', { text: 'Your next post is already *in your camera roll*' }, 'plain'],
  ['tangerine', { text: 'Pick the photo you *almost* deleted', pattern: 'rays' }, 'rays'],
  ['warm', { text: 'Your bio has *one* job', overlay: 'note', pattern: 'grid' }, 'note + grid'],
  ['tangerine', { text: 'Write the caption *first*', overlay: 'card' }, 'card'],
  ['warm', { text: 'Batch a week in *one hour*', overlay: 'circle', pattern: 'dots' }, 'circle + dots'],
  ['tangerine', { text: 'Your first slide is *the ad*', overlay: ['highlight', 'sparkle'], pattern: 'stars' }, 'highlight + sparkle + stars'],
  ['warm', { text: 'Film it *where you already are*', overlay: ['polaroid', 'arrow'], media: 'x' }, 'polaroid + arrow'],
  ['tangerine', { text: 'Three posts, *one* photo', overlay: ['note', 'sparkle'], pattern: 'stripes' }, 'note + sparkle + stripes'],
];

const browser = await launch();
const pg = await browser.newPage();
const shots = [];
for (const [n, [palette, slide, label]] of samples.entries()) {
  const post = { style: 'D', palette, slides: [slide], tigerNod: null };
  const f = path.join(out, `.var-${n}.html`);
  writeFileSync(f, pageHtml(post, { brand, mediaFor }));
  await pg.setViewport({ width: W, height: H });
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await (await pg.$('section.s')).screenshot({ path: path.join(out, `.var-${n}.png`) });
  shots.push({ png: `.var-${n}.png`, label: `${palette} · ${label}` });
}
const sheet = path.join(out, '.variety.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;font:600 17px sans-serif;display:grid;grid-template-columns:repeat(4,300px);gap:14px 10px;padding:14px;width:max-content">
${shots.map((s) => `<div><img src="${s.png}" style="width:300px;height:400px;display:block">${s.label}</div>`).join('')}</body>`);
await pg.setViewport({ width: 28 + 4 * 310, height: 400 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(out, 'D-variety.png'), fullPage: true });
await browser.close();
console.log(path.join(out, 'D-variety.png'));
