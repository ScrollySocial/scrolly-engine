#!/usr/bin/env node
import puppeteer from '../../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(here, 'workbook.pdf');
const outDir = path.join(here, 'qa-shots');
if (!existsSync(outDir)) mkdirSync(outDir);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await puppeteer.launch({ executablePath: edgePath, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 1300 });

// pages to visually spot-check (1-indexed PDF page numbers)
const targets = process.argv.slice(2).map(Number);

await page.goto(`file:///${pdfPath.replace(/\\/g, '/')}`, { waitUntil: 'load', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

for (const pnum of targets) {
  await page.evaluate((n) => { window.PDFViewerApplication.page = n; }, pnum);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, `p${pnum}.png`) });
  console.log('captured page', pnum);
}
await browser.close();
