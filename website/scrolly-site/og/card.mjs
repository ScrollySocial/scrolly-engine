// HTML for one 1200x630 share card (v3 rename 2026-10-27: cream, navy Instrument Serif headline, two-colour
// The Ambition Department logo from the site header, Jost label and domain; no orange).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(here, '../assets');
const LOGO = fs.readFileSync(path.resolve(here, '../chrome/logo.html'), 'utf8').replace(/ aria-hidden="true" focusable="false"/, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export function cardHtml(e) {
  const art = 'data:image/' + (e.art.endsWith('.png') ? 'png' : 'webp') + ';base64,' + fs.readFileSync(path.join(assets, e.art)).toString('base64');
  const cover = e.fit === 'cover';
  const size = e.title.length > 24 ? 64 : 80;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Jost:wght@500;700&display=block">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f7f3ec;color:#0a1930;font-family:Jost,Arial,sans-serif;display:grid;grid-template-columns:${cover ? '600px 600px' : '660px 540px'};overflow:hidden}
.t{padding:56px 0 52px 72px;display:flex;flex-direction:column}
.wm{width:250px;color:#0a1930}.wm svg{width:100%;height:auto;display:block}.wm .amb{fill:#4da3ff}
.lb{margin-top:auto;font:700 18px/1.3 Jost,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#4a4e66}
h1{font:400 ${size}px/1.02 'Instrument Serif',Georgia,serif;letter-spacing:-.01em;margin-top:12px;max-width:540px}
.u{margin-top:26px;font:500 22px/1 Jost,Arial,sans-serif;color:#4a4e66}
.a{height:630px;display:flex;align-items:center;justify-content:center;${cover ? '' : 'padding:40px 48px 40px 0'}}
.a img{${cover ? 'width:600px;height:630px;object-fit:cover;object-position:' + (e.pos || 'center') : 'max-width:100%;max-height:550px;object-fit:contain'}}
</style></head><body><div class="t"><div class="wm">${LOGO}</div>
<div class="lb">${e.label ? esc(e.label) : ''}</div><h1>${esc(e.title)}</h1><div class="u">theambitiondepartment.com</div></div>
<div class="a"><img src="${art}" alt=""></div></body></html>`;
}
