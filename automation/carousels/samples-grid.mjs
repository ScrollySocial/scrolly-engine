// Mock Instagram profile grid (3:4 tiles) mixing text carousels (D), photo carousels (A/B) and carousels
// that open on a Reel clip, to judge how the feed looks together. Playbook stock photos stand in for Mercedes.
// Usage: node samples-grid.mjs → <exports>/_style-samples/feed-mix.png
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cfg, fileUrl, launch, REPO, W, H } from './lib/common.mjs';
import { pageHtml, SIZES } from './lib/templates.mjs';
import { fitSlides } from './lib/fit.mjs';

const brand = cfg('brand');
const out = path.join(cfg('media').exportsDir, '_style-samples');
mkdirSync(out, { recursive: true });
const STOCK = path.join(REPO, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock');
const mediaFor = (id, focus) => (id ? { url: fileUrl(path.join(STOCK, id + '.jpg')), focus } : null);

// kind: text | photo | reel (carousel whose first slide is a Reel clip)
const tiles = [
  ['photo', { style: 'B', slides: [{ text: 'A week of posts from one coffee run', media: 'coffeeRun', pos: 'top' }] }],
  ['text', { style: 'D', palette: 'navy', slides: [{ text: 'Pick the photo you *almost* deleted', pattern: 'rays' }] }],
  ['reel', { style: 'A', media: { background: 'talkCam' }, slides: [{ text: 'What I wish I knew before my first Reel', pos: 'bottom' }] }],
  ['photo', { style: 'B', slides: [{ text: '', media: 'girlField' }] }],
  ['reel', { style: 'A', media: { background: 'couchTee' }, slides: [{ text: 'Three Reels you can film from the couch', pos: 'top' }] }],
  ['wild', { style: 'D', palette: 'mist', slides: [{ text: 'Post the *messy* version', overlay: 'sparkle' }] }],
  ['text', { style: 'D', palette: 'offwhite', slides: [{ text: 'Your bio has *one* job', overlay: 'note', pattern: 'grid' }] }],
  ['photo', { style: 'B', slides: [{ text: 'Behind the scenes of a Tuesday', media: 'teeHeld', pos: 'bottom' }] }],
  ['reel', { style: 'A', media: { background: 'cameraBack' }, slides: [{ text: 'My no-tripod filming setup', pos: 'top' }] }],
  ['wild', { style: 'D', palette: 'mist', slides: [{ text: 'Your camera roll is a *content plan*', overlay: 'circle' }] }],
  ['photo', { style: 'B', slides: [{ text: '', media: 'familyHat' }] }],
  ['text', { style: 'D', palette: 'navy', slides: [{ text: 'Write the caption *first*', overlay: 'card' }] }],
];

const ICON_CAROUSEL = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M7 3h11a3 3 0 0 1 3 3v11a1 1 0 0 1-2 0V6a1 1 0 0 0-1-1H7a1 1 0 0 1 0-2zm-2 4h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';

const browser = await launch();
const pg = await browser.newPage();
const shots = [];
for (const [n, [kind, post]] of tiles.entries()) {
  if (!post.slides[0].text) post.slides[0].text = ' ';
  const f = path.join(out, `.mix-${n}.html`);
  let html = pageHtml({ tigerNod: null, ...post }, { brand, mediaFor });
  if (!post.slides[0].text.trim()) html = html.replace('<p class="fit hl">', '<p class="fit hl" style="display:none">');
  writeFileSync(f, html);
  await pg.setViewport({ width: W, height: H });
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await fitSlides(pg, SIZES[post.style]);
  await (await pg.$('section.s')).screenshot({ path: path.join(out, `.mix-${n}.png`) });
  shots.push({ png: `.mix-${n}.png`, kind });
}
const sheet = path.join(out, '.mix.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;font:15px system-ui,sans-serif;width:906px">
<div style="display:grid;grid-template-columns:repeat(3,300px);gap:3px">
${shots.map((s) => `<div style="position:relative"><img src="${s.png}" style="width:300px;height:400px;display:block">
<span style="position:absolute;top:10px;right:10px;width:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">${ICON_CAROUSEL}</span>
${s.kind === 'reel' ? `<span style="position:absolute;left:10px;top:10px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.4);display:grid;place-items:center"><span style="width:15px;margin-left:2px">${ICON_PLAY}</span></span>` : ''}</div>`).join('')}
</div>
<p style="margin:10px 12px;color:#52525b">Mock grid. Stock photos stand in for Mercedes. ▶ = carousel that opens on a Reel clip. Photo tiles = photo-only carousels. Pink + pale blue = wildcard backgrounds (really max 1 per 6 posts).</p></body>`);
await pg.setViewport({ width: 906, height: 1680 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(out, 'feed-mix.png'), fullPage: true });
await browser.close();
console.log(path.join(out, 'feed-mix.png'));
