#!/usr/bin/env node
import puppeteer from '../../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, 'workbook-print.html');
const pdfPath = path.join(here, 'workbook.pdf');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let executablePath = existsSync(edgePath) ? edgePath : (existsSync(chromePath) ? chromePath : undefined);
if (!executablePath) { console.error('No local Chromium-based browser found (checked Edge, Chrome).'); process.exit(1); }

const browser = await puppeteer.launch({ executablePath, headless: 'new' });
const page = await browser.newPage();
await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });

// let webfont load
await new Promise(r => setTimeout(r, 800));

await page.pdf({
  path: pdfPath,
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-family:Arial,sans-serif;font-size:7.5px;color:#5c6478;padding:0 0.75in;display:flex;justify-content:space-between;">' +
    '<span>ScrollySEO &middot; Shopify SEO Workbook &middot; &copy; 2026 Scrolly SEO</span>' +
    '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>' +
    '</div>',
  margin: { top: '0', bottom: '0.35in', left: '0', right: '0' },
});

const pageCount = await getPdfPageCount(pdfPath);
console.log('Rendered PDF:', pdfPath, '—', pageCount, 'pages');

await browser.close();

async function getPdfPageCount(p) {
  const { readFileSync } = await import('node:fs');
  const buf = readFileSync(p, 'latin1');
  const matches = buf.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : -1;
}
