// SEO Site Audit cover, v3 look (2026-10-27): replaces the orange cover-seo-site-audit-tad.webp (marketing art only;
// the report PDF keeps its own design, methodology/report-design-system.md). 1024x1536, cream, navy serif title with the
// sky marker on the italic word, header logo, the B&W walking tiger. Writes assets/cover-seo-site-audit-v3.webp.
// Run from website/scrolly-site: node covers/render-audit-cover.mjs
import puppeteer from '../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const site = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(path.join(site, 'chrome/logo.html'), 'utf8');
const tiger = pathToFileURL(path.join(site, 'assets/hp3-hero-tiger.webp')).href;

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Jost:wght@500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1024px;height:1536px;overflow:hidden;position:relative;background:#f7f3ec;color:#0a1930;font-family:Jost,Arial,sans-serif}
.logo{position:absolute;left:84px;top:84px;width:300px;color:#0a1930}.logo svg{width:100%;height:auto;display:block}.logo .amb{fill:#4da3ff}
.lbl{position:absolute;left:88px;top:330px;font:700 26px/1 Jost;letter-spacing:.16em;text-transform:uppercase}
h1{position:absolute;left:80px;top:380px;font:400 236px/.86 'Instrument Serif',serif;letter-spacing:-.015em}
h1 em{font-style:italic;padding:0 .14em;margin:0 -.06em;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 60' preserveAspectRatio='none'%3E%3Cpath d='M7 19C40 12 95 10 160 11s110 2 134 6c4 7 4 17 1 26c-3 6-6 9-10 10c-60 2-130 3-190 2c-35 0-70-1-88-3c-4-5-5-12-4-20c1-6 2-10 4-13z' fill='%234da3ff' fill-opacity='.55'/%3E%3Cpath d='M12 27c50-4 140-5 270-1c3 6 2 14-2 20c-90 3-180 3-264 1c-5-6-6-13-4-20z' fill='%234da3ff' fill-opacity='.3'/%3E%3C/svg%3E") 0 62%/100% 74% no-repeat}
.tiger{position:absolute;right:-70px;bottom:-24px;width:780px}
</style>
<div class="logo">${logo}</div>
<p class="lbl">Personalized report</p>
<h1>SEO<br>Site<br><em>Audit</em></h1>
<img class="tiger" src="${tiger}" alt="">`;

const f = path.join(site, 'covers/audit-cover.html'); writeFileSync(f, html);
const b = await puppeteer.launch({ executablePath: process.env.USERPROFILE + '/.cache/puppeteer/chrome-headless-shell/win64-155.0.8059.39/chrome-headless-shell-win64/chrome-headless-shell.exe', headless: 'shell', args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: 1024, height: 1536 });
await p.goto(pathToFileURL(f).href, { waitUntil: 'networkidle0', timeout: 60000 }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(site, 'covers/audit-cover.png') });
await b.close();
console.log('wrote covers/audit-cover.png');
