// Style D sample sheet: the locked palettes with every pattern and overlay, for review.
// Uses a Playbook stock photo as a stand-in for Mercedes in the polaroid sample.
// Usage: node samples.mjs → <exports>/_style-samples/D-variety.png
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cfg, fileUrl, launch, REPO, W, H } from './lib/common.mjs';
import { pageHtml } from './lib/templates.mjs';
import { mediaResolver } from './lib/media.mjs';

const brand = cfg('brand');
const out = path.join(cfg('media').exportsDir, '_style-samples');
mkdirSync(out, { recursive: true });
const stock = fileUrl(path.join(REPO, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock/barista.jpg'));
const real = mediaResolver().mediaFor;
const mediaFor = (id, focus) => (!id ? null : id === 'x' ? { url: stock, focus: '50% 30%' } : real(id, focus));

const samples = [
  ['offwhite', { text: 'Your next post is already in your camera roll' }, 'plain'],
  ['navy', { text: 'Pick the photo you almost deleted', pattern: 'rays' }, 'rays'],
  ['offwhite', { text: 'Your bio has one job', overlay: 'note', pattern: 'grid' }, 'note + grid'],
  ['navy', { text: 'Write the caption first', overlay: 'card' }, 'card'],
  ['offwhite', { text: 'Batch a week in *one hour*', overlay: 'circle', pattern: 'dots' }, 'circle + dots'],
  ['navy', { text: 'Your first slide is the ad', overlay: 'sparkle', pattern: 'stars' }, 'sparkle + stars'],
  ['offwhite', { text: 'Film it where you already are', overlay: ['polaroid', 'arrow'], media: 'x' }, 'polaroid + arrow (stock stand-in)'],
  ['mist', { text: 'Three posts, one photo', overlay: ['note', 'sparkle'], pattern: 'stripes' }, 'note + sparkle + stripes'],
  ['offwhite', { layout: 'text', text: 'Your $1,000 goal is secretly a views goal', photoBg: '1e629b09ae', scrim: 'bottom', doodles: [{ k: 'star', x: 880, y: 120, w: 80 }, { k: 'star', x: 960, y: 230, w: 40 }] }, 'photo + doodles (new)'],
  ['offwhite', { text: 'Start with your price', pattern: 'dots', doodles: [{ k: 'note', text: 'start here', x: 120, y: 330, rot: -8 }, { k: 'arrow', x: 230, y: 410, w: 80, rot: -20 }, { k: 'star', x: 860, y: 1050, w: 70 }, { k: 'underline', x: 300, y: 860, w: 480, h: 40 }] }, 'doodles (new)'],
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
writeFileSync(sheet, `<body style="margin:0;background:#fff;font:600 17px sans-serif;display:grid;grid-template-columns:repeat(5,300px);gap:14px 10px;padding:14px;width:max-content">
${shots.map((s) => `<div><img src="${s.png}" style="width:300px;height:400px;display:block">${s.label}</div>`).join('')}</body>`);
await pg.setViewport({ width: 28 + 5 * 310, height: 400 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(out, 'D-variety.png'), fullPage: true });
await browser.close();
console.log(path.join(out, 'D-variety.png'));
