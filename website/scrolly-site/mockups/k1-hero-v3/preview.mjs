// Local preview only: loads the live /1k-club/ page and swaps the hero image for the new file (nothing is saved to the site).
// Usage: node preview.mjs
import puppeteer from '../../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync, readFileSync } from 'node:fs';
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const data = 'data:image/webp;base64,' + readFileSync('../../assets/k1-hero-v3.webp').toString('base64');
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
for (const [name, w, h, mob] of [['desktop', 1600, 850, false], ['phone', 375, 812, true]]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
  await p.goto('https://theambitiondepartment.com/1k-club/', { waitUntil: 'networkidle2', timeout: 90000 });
  await p.addStyleTag({ content: '.cmplz-cookiebanner{display:none!important}' });
  await p.evaluate((d) => { const i = document.querySelector('.cl-hero .prodimg'); i.removeAttribute('srcset'); i.src = d; return new Promise((r) => (i.complete ? r() : (i.onload = r))); }, data);
  await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: `PREVIEW-${name}.png`, fullPage: mob ? false : false, ...(mob ? { clip: { x: 0, y: 0, width: 375, height: 1300 }, captureBeyondViewport: true } : {}) });
}
await b.close();
