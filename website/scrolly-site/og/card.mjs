// HTML for one 1200x630 share card (v3: cream, ink serif, orange only as a small mark).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const assets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export function cardHtml(e) {
  const art = 'data:image/' + (e.art.endsWith('.png') ? 'png' : 'webp') + ';base64,' + fs.readFileSync(path.join(assets, e.art)).toString('base64');
  const cover = e.fit === 'cover';
  const size = e.title.length > 24 ? 58 : 72;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f7f3ec;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;display:grid;grid-template-columns:${cover ? '600px 600px' : '660px 540px'};overflow:hidden}
.t{padding:64px 0 56px 72px;display:flex;flex-direction:column}
.wm{font:400 30px/1 Georgia,serif;letter-spacing:.08em}
.mk{width:56px;height:6px;background:#ff4b16;margin-top:22px}
.lb{margin-top:auto;font:700 18px/1.3 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#6b6762}
h1{font:400 ${size}px/1.02 Georgia,serif;letter-spacing:-.03em;margin-top:14px;max-width:560px}
.u{margin-top:28px;font:400 22px/1 Arial,sans-serif;color:#6b6762}
.a{height:630px;display:flex;align-items:center;justify-content:center;${cover ? '' : 'padding:40px 48px 40px 0'}}
.a img{${cover ? 'width:600px;height:630px;object-fit:cover;object-position:' + (e.pos || 'center') : 'max-width:100%;max-height:550px;object-fit:contain'}}
</style></head><body><div class="t"><div class="wm">SCROLLY</div><div class="mk"></div>
<div class="lb">${e.label ? esc(e.label) : ''}</div><h1>${esc(e.title)}</h1><div class="u">scrollyseo.com</div></div>
<div class="a"><img src="${art}" alt=""></div></body></html>`;
}
