// Small finished-example strips for the My Account Challenge Content pages (845/846).
//   dist/site/thumbs/<ID>-example.jpg : every slide/frame of the example side by side, 360px tall (shown at 180px).
// Usage: node site-thumbs.mjs [ids…]   (after node build.mjs)
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
const out = path.join(dist, 'site', 'thumbs');
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const page = await browser.newPage();
let n = 0;
const only = process.argv.slice(2).map((s) => s.toUpperCase());
for (const kind of ['carousels', 'stories', 'reels']) {
  for (const slug of readdirSync(path.join(dist, kind)).sort()) {
    const dir = path.join(dist, kind, slug);
    const id = slug.slice(0, 3).toUpperCase();
    if (only.length && !only.includes(id)) continue;
    const files = readdirSync(path.join(dir, 'previews')).filter((f) => f.startsWith('example')).sort();
    const imgs = files.map((f) => `<img src="data:image/png;base64,${readFileSync(path.join(dir, 'previews', f)).toString('base64')}" style="height:360px;border-radius:10px">`).join('');
    await page.setViewport({ width: 400, height: 360 });
    await page.setContent(`<html><body style="margin:0;background:#fff;display:inline-flex;gap:12px">${imgs}</body></html>`, { waitUntil: 'load' });
    const w = await page.evaluate(() => document.body.scrollWidth);
    await page.setViewport({ width: w, height: 360 });
    await page.screenshot({ path: path.join(out, `${id}-example.jpg`), type: 'jpeg', quality: 78 });
    n++;
  }
}
await browser.close();
console.log(`thumbs: ${n}`);
process.exit(0);
