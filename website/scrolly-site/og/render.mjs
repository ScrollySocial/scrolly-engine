// Usage: node og/render.mjs   Renders og/out/<key>.jpg (1200x630) for DEFAULT + PAGES, and og/out/sheet.html for review.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT, PAGES } from './og-data.mjs';
import { cardHtml } from './card.mjs';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
fs.mkdirSync(out, { recursive: true });
import { launch } from '../../../automation/carousels/lib/common.mjs';
const b = await launch(); // Chrome headless shell (Edge can be mid-update)
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
const all = [DEFAULT, ...PAGES];
for (const e of all) {
  await p.setContent(cardHtml(e), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() => document.querySelector('.u').getBoundingClientRect().bottom > 600);
  await p.screenshot({ path: path.join(out, e.key + '.jpg'), type: 'jpeg', quality: 88 });
  console.log(e.key, over ? 'OVERFLOW' : 'ok');
}
await b.close();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.writeFileSync(path.join(out, 'sheet.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link previews</title>
<style>body{font:16px/1.4 Arial,sans-serif;background:#eee;margin:0;padding:24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px}
.c{background:#fff;border:1px solid #ddd;border-radius:12px;overflow:hidden}.c img{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block}.c small{color:#666;display:block;margin-top:4px;font-size:15px}.c i{color:#999;font-style:normal;font-size:15px}</style>
<h1>theambitiondepartment.com link previews</h1><p>How each page looks when its link is shared (Pinterest, iMessage, Facebook, LinkedIn). Pages not listed use the first card.</p><div class="g">
${all.map((e) => `<div class="c"><img src="${e.key}.jpg" alt=""><div><i>${e.id ? 'page ' + e.id : 'default (every other page)'}</i><b>${esc(e.title)}</b><small>${esc(e.desc)}</small></div></div>`).join('\n')}</div>`);
console.log('sheet:', path.join(out, 'sheet.html'));
