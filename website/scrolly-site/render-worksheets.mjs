// node render-worksheets.mjs  -> assets/ws-<workbook>-<n>.png : crisp, readable images of real worksheets for the sales-page previews.
// Renders each workbook's print HTML in headless Edge/Chrome, finds the worksheet by its title, narrows + zooms it so its text is ~15px
// at display size, and screenshots just that element at 2x. Title-bar em dashes become colons (site copy rule) and colors follow the site palette; content is otherwise exact.
import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const P = (wb) => path.resolve(here, `../../Scrolly Organic Engine/products/${wb}/build/workbook-print.html`);
export const SHEETS = {
  'shopify-seo-workbook': ['Your Keyword Universe', 'Draw Your Search-Optimized Store', 'Google Product Visibility Checklist', 'My First 30 Organic Content Opportunities', 'My Shopify Technical SEO Check', 'AI Search Readiness Checklist'],
  'pinterest-seo-workbook': ['My Pinterest Demand Universe', 'My Topic Architecture', 'My Shopify + Pinterest Setup', 'Diagnose a Real Pattern', 'My First 30 Pinterest Opportunities', 'The Page-Optimization Workflow'],
};
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((x) => existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
for (const [wb, titles] of Object.entries(SHEETS)) {
  const p = await b.newPage();
  await p.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(P(wb)).href, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  // site previews use the v3 palette (black bars, warm table heads) instead of the workbooks' indigo; layout and text are unchanged
  await p.addStyleTag({ content: '.worksheet{border-color:#0a0a0a!important}.ws-bar{background:#0a0a0a!important;color:#fff!important}.ws-group{color:#0a0a0a!important}.worksheet th{background:#efe9df!important;color:#3a3732!important}.worksheet a{color:#0a0a0a!important}' });
  for (let i = 0; i < titles.length; i++) {
    const ok = await p.evaluate((t, idx) => {
      const bar = [...document.querySelectorAll('.ws-bar')].find((b) => b.textContent.replace(/\s+/g, ' ').includes(t));
      if (!bar) return false;
      const ws = bar.closest('.worksheet') || bar.parentElement;
      ws.id = 'ws-shot-' + idx;
      bar.innerHTML = bar.innerHTML.replace(/\s*(&mdash;|—)\s*/g, ': ');
      Object.assign(ws.style, { width: '460px', zoom: '1.22', margin: '0', breakInside: 'auto' });
      return true;
    }, titles[i], i);
    if (!ok) { console.log('NOT FOUND', wb, titles[i]); continue; }
    const el = await p.$('#ws-shot-' + i);
    const out = path.join(here, 'assets', `ws-${wb.split('-')[0]}-${i + 1}.png`);
    await el.screenshot({ path: out });
    const box = await el.boundingBox();
    console.log(path.basename(out), Math.round(box.width) + 'x' + Math.round(box.height), titles[i]);
  }
  await p.close();
}
await b.close();
