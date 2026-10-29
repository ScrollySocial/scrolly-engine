// Captures real screens for a YouTube video's screen takeovers (1600×900 at 2×, so they stay sharp at 1080p).
// Usage: node shots.mjs <id> <name> <url> [clickText]   → .cache/<id>/screens/<name>.png
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, '../hyperframes-test/package.json'));
const puppeteer = require('puppeteer-core');
const [id, name, url, click] = process.argv.slice(2);
const out = path.join(HERE, '.cache', id, 'screens');
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
if (click) {
  await page.evaluate((t) => [...document.querySelectorAll('a,button,[role=tab],li,div')].find((e) => e.childElementCount < 3 && e.textContent.trim() === t)?.click(), click);
  await new Promise((r) => setTimeout(r, 1200));
}
await page.screenshot({ path: path.join(out, name + '.png') });
await browser.close();
console.log(path.join(out, name + '.png'));
