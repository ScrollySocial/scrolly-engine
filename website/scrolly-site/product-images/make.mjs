// Scrolly digital-product image template. Renders 1200x1200 PNGs (WooCommerce square) from ONE layout.
// Run: node website/scrolly-site/product-images/make.mjs   (needs local Edge/Chrome + internet for fonts/cover art)
// To add a product: append an entry to PRODUCTS. Copy must come from the product's real listing; never invent claims.
import puppeteer from '../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out'); mkdirSync(out, { recursive: true });
const UP = 'https://scrollyseo.com/wp-content/uploads/2026/08/';

const PRODUCTS = [
  { slug: 'shopify-seo-workbook', kicker: 'Digital workbook', title: ['Shopify', 'SEO', 'Workbook'],
    line: 'Research keywords, organize your store, improve product pages, and build a practical SEO plan.', cover: UP + 'real-shopify-workbook-preview.png' },
  { slug: 'pinterest-seo-workbook', kicker: 'Digital workbook', title: ['Pinterest', 'SEO', 'Workbook'],
    line: 'Turn audience research into an intentional keyword, board, Pin, and publishing system.', cover: UP + 'real-pinterest-workbook-preview.png' },
  { slug: 'seo-site-audit', kicker: 'Report', title: ['SEO Site', 'Audit'],
    line: 'What’s working, what’s broken, and exactly what to build next. Every finding sourced and scored.', cover: null },
];

const html = p => `<!doctype html><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Public+Sans:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1200px;height:1200px;background:#08152c;color:#fff;font-family:'Public Sans',sans-serif;position:relative;overflow:hidden}
.bar{position:absolute;left:0;right:0;bottom:0;height:18px;display:flex}.bar i{flex:1}
.bar i:nth-child(1){background:#ff6338}.bar i:nth-child(2){background:#ffc233}.bar i:nth-child(3){background:#735cff}.bar i:nth-child(4){background:#94ece1}.bar i:nth-child(5){background:#c1aefc}
.wm{position:absolute;left:84px;top:76px;font:900 44px/1 'Archivo';letter-spacing:-.04em}
.kick{position:absolute;left:84px;top:168px;display:inline-block;padding:10px 22px;border-radius:999px;background:#94ece1;color:#08152c;font:800 22px/1 'Public Sans';letter-spacing:.12em;text-transform:uppercase}
h1{position:absolute;left:84px;top:240px;width:${p.cover ? 600 : 1000}px;font:900 ${p.cover ? 92 : 168}px/.94 'Archivo';letter-spacing:-.03em;text-transform:uppercase}
h1 em{display:block;color:#ff6338;font-style:italic}
p.line{position:absolute;left:84px;bottom:110px;width:${p.cover ? 560 : 880}px;font:500 34px/1.3 'Public Sans';color:rgba(255,255,255,.88)}
.cover{position:absolute;right:36px;top:210px;width:430px;height:610px;display:flex;align-items:center;justify-content:center;transform:rotate(3deg)}
.cover img{max-width:100%;max-height:100%;box-shadow:0 30px 60px rgba(0,0,0,.45),0 0 0 6px #fbf8f3;background:#fff}
.disc{position:absolute;right:-120px;top:150px;width:700px;height:700px;border-radius:50%;background:#c1aefc;opacity:.95}
</style>
${p.cover ? '<div class="disc"></div>' : ''}
<div class="wm">scrolly</div><div class="kick">${p.kicker}</div>
<h1>${p.title.slice(0, -1).join('<br>')}<em>${p.title.at(-1)}</em></h1>
${p.cover ? `<div class="cover"><img src="${p.cover}"></div>` : ''}
<p class="line">${p.line}</p><div class="bar"><i></i><i></i><i></i><i></i><i></i></div>`;

const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(x => existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
for (const p of PRODUCTS) {
  const pg = await b.newPage(); await pg.setViewport({ width: 1200, height: 1200 });
  const f = path.join(out, p.slug + '.html'); writeFileSync(f, html(p));
  await pg.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(out, p.slug + '.png') });
  console.log('wrote', p.slug + '.png'); await pg.close();
}
await b.close();
