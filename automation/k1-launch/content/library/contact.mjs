// QA contact sheet: every preview of the given templates on one image.
// Usage: node contact.mjs <template|example> <out.png> C01 C02 ...   (no ids = all built templates)
import puppeteer from 'puppeteer-core';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [mode = 'example', out = 'contact.png', ...ids] = process.argv.slice(2);
const dirs = [];
for (const kind of ['carousels', 'stories']) {
  const base = path.join(here, 'dist', kind);
  if (!existsSync(base)) continue;
  for (const d of readdirSync(base).sort()) if (!ids.length || ids.some((id) => d.toUpperCase().startsWith(id.toUpperCase() + '-'))) dirs.push(path.join(base, d));
}
const rows = dirs.map((d) => {
  const files = readdirSync(path.join(d, 'previews')).filter((f) => f.startsWith(mode)).sort();
  const imgs = files.map((f) => `<img src="data:image/png;base64,${readFileSync(path.join(d, 'previews', f)).toString('base64')}">`).join('');
  return `<div class="r"><b>${path.basename(d)}</b><div>${imgs}</div></div>`;
}).join('');
const html = `<html><body style="margin:0;padding:16px;background:#ddd;font:14px Arial"><style>.r{margin:0 0 14px}.r div{display:flex;gap:6px}img{height:240px;border-radius:4px}</style>${rows}</body></html>`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 800 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out, `(${dirs.length} templates)`);
