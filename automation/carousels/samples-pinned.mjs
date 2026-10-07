// Mock of a profile grid's pinned row: slide 1 of each post in a grid panorama, side by side with Instagram's thin gaps.
// Posts not built yet render their cover from `placeholders`. Usage: node samples-pinned.mjs [group]
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { cfg, fileUrl, launch, readJson, HERE, W, H } from './lib/common.mjs';
import { pageHtml, SIZES } from './lib/templates.mjs';
import { mediaResolver } from './lib/media.mjs';
import { fitSlides } from './lib/fit.mjs';

const group = process.argv[2] || 'pinned-2026-10';
const pano = readJson(path.join(HERE, 'data/panoramas.json'))[group];
const placeholders = { '2026-10-07-pinned-challenge': 'The $1K Challenge' };
const out = path.join(cfg('media').exportsDir, '_style-samples');
mkdirSync(out, { recursive: true });
const brand = cfg('brand'), { mediaFor } = mediaResolver();
const browser = await launch(); const pg = await browser.newPage();
const tiles = [];
for (const [i, id] of pano.posts.entries()) {
  const f = path.join(HERE, 'posts', id, 'post.json');
  const post = existsSync(f) ? readJson(f) : { id, style: 'D', palette: 'warm', slides: [{ layout: 'pano', grid: group, text: placeholders[id] || id }], tigerNod: null };
  post.slides = [post.slides[0]]; post.tigerNod = null;
  const html = path.join(out, `.pin-${i}.html`);
  writeFileSync(html, pageHtml(post, { brand, mediaFor }));
  await pg.setViewport({ width: W, height: H });
  await pg.goto(fileUrl(html), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await fitSlides(pg, SIZES[post.style]);
  await (await pg.$('section.s')).screenshot({ path: path.join(out, `.pin-${i}.png`) });
  tiles.push(`.pin-${i}.png`);
}
const sheet = path.join(out, '.pinned.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;width:906px;font:15px system-ui"><div style="display:grid;grid-template-columns:repeat(3,300px);gap:3px">${tiles.map((t) => `<div style="position:relative"><img src="${t}" style="width:300px;height:400px;display:block"><span style="position:absolute;top:8px;right:10px;color:#fff;font-size:18px;text-shadow:0 1px 3px #000">📌</span></div>`).join('')}</div><p style="margin:8px 10px;color:#555">Pinned row mock (${group}). Stand-in photo until Mercedes's is in.</p></body>`);
await pg.setViewport({ width: 906, height: 460 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(out, `${group}.png`), fullPage: true });
await browser.close();
console.log(path.join(out, `${group}.png`));
