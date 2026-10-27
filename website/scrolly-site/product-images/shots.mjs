// Digital-product card photos, v3 (2026-10-27). ONE look for every card on /digital-products/: square 1200x1200,
// blue-mist ground, the real product (Reel covers in phones, the audit report, the Chat Manager DMs) centred at the same
// scale under the same soft light. Phones keep real proportions. Writes PNG + WebP to out-v3/ for review; uploading is separate.
// Run: node website/scrolly-site/product-images/shots.mjs   (needs local Edge/Chrome)
// To add a product: append to SHOTS using one of the layouts below (fan, pair, print).
import puppeteer from '../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out-v3'); mkdirSync(out, { recursive: true });
const reelImg = (f) => pathToFileURL(path.join(here, '../../../automation/reel-template-pack/sales/img', f)).href;
const UP = 'https://theambitiondepartment.com/wp-content/uploads/2026/10/';

const phone = (inner, cls = '') => `<div class="phone ${cls}"><div class="scr">${inner}<i class="isl"></i></div></div>`;
const poster = (f) => `<img src="${reelImg(f)}" alt="">`;

// The Chat Manager screens, same words as the current product image.
const comments = `<div class="ui"><div class="bar"><b>9:41</b><b>5G</b></div><p class="hd">‹ &nbsp;Comments</p>
<div class="cm"><i class="av"></i><p><b>sam.makes</b> MATH</p></div>
<div class="cm rep"><i class="av dk"></i><p><b>yourshop</b> Sent it to your DMs! 💌</p></div></div>`;
const dms = `<div class="ui"><div class="bar"><b>9:41</b><b>5G</b></div><p class="hd">‹ &nbsp;sam.makes</p>
<p class="b out">Want the free calculator? Reply READY 👇</p><p class="b in">READY</p>
<p class="b out">Here you go! yourshop.com/f/…</p><p class="ok">✓ Sam joined your list</p></div>`;

const SHOTS = [
  { slug: 'chat-manager', layout: 'pair', html: phone(comments, 'l') + phone(dms, 'r') },
  { slug: 'halloween-reel-pack', layout: 'fan', html: phone(poster('h3.jpg'), 'l') + phone(poster('h5.jpg'), 'r') + phone(poster('h6.jpg'), 'c') },
  { slug: 'product-reel-pack', layout: 'fan', html: phone(poster('p12.jpg'), 'l') + phone(poster('p22.jpg'), 'r') + phone(poster('p10.jpg'), 'c') },
  { slug: 'seo-site-audit', layout: 'print', html: `<div class="sheet back"></div><div class="sheet front"><img src="${pathToFileURL(path.join(here, '../assets/cover-seo-site-audit-v3.webp')).href}" alt=""></div>` },
];

const css = `
*{box-sizing:border-box;margin:0}
body{width:1200px;height:1200px;overflow:hidden;font-family:Jost,Arial,sans-serif;color:#0a1930;
 background:radial-gradient(120% 90% at 50% 30%,#e9edf6 0%,#dfe4f0 55%,#d3d9e8 100%)}
.stage{position:absolute;inset:0}
.floor{position:absolute;left:50%;top:1010px;width:820px;height:90px;transform:translateX(-50%);border-radius:50%;
 background:radial-gradient(closest-side,rgba(10,25,48,.22),rgba(10,25,48,0));filter:blur(6px)}
/* phone: real proportions (71.5 x 147 mm) */
.phone{position:absolute;width:380px;height:781px;border-radius:58px;background:#0f1520;padding:13px;
 box-shadow:0 2px 0 1px #2b3240 inset,0 40px 70px -20px rgba(10,25,48,.45),0 12px 24px rgba(10,25,48,.18)}
.scr{position:relative;width:100%;height:100%;border-radius:46px;overflow:hidden;background:#fff}
.scr>img{width:100%;height:100%;object-fit:cover;display:block}
.isl{position:absolute;left:50%;top:14px;width:104px;height:30px;margin-left:-52px;border-radius:20px;background:#0f1520}
.fan .phone{top:200px}.fan .c{left:410px;top:180px;z-index:3}
.fan .l{left:95px;top:235px;transform:rotate(-8deg) scale(.86);z-index:1}.fan .r{left:725px;top:235px;transform:rotate(8deg) scale(.86);z-index:2}
.pair .phone{top:190px}.pair .l{left:205px;transform:rotate(-5deg);z-index:1}.pair .r{left:615px;top:215px;transform:rotate(5deg);z-index:2}
.ui{padding:20px 22px;font-size:23px;line-height:1.3}
.ui .bar{display:flex;justify-content:space-between;font-size:18px;padding:0 14px 40px}
.ui .hd{font-weight:700;border-bottom:1px solid #e6e8ee;padding-bottom:14px;margin-bottom:18px}
.cm{display:flex;gap:12px;align-items:flex-start;margin-bottom:26px}.cm.rep{margin-left:40px}
.av{flex:none;width:36px;height:36px;border-radius:50%;background:#d5d9e2}.av.dk{background:#0a1930}
.b{max-width:86%;padding:16px 20px;border-radius:24px;margin:0 0 20px}
.b.out{margin-left:auto;background:#3d8bfd;color:#fff}.b.in{background:#eceef3;width:max-content}
.ok{text-align:center;color:#4a4e66;font-size:20px;margin-top:26px}
/* print: the report as a real printed booklet, a second copy behind */
.sheet{position:absolute;width:520px;height:780px;background:#fff;box-shadow:0 40px 70px -20px rgba(10,25,48,.45),0 12px 24px rgba(10,25,48,.18)}
.sheet img{width:100%;height:100%;object-fit:cover;display:block}
.sheet.back{left:390px;top:215px;transform:rotate(7deg);background:#f4f1ec}
.sheet.front{left:330px;top:200px;transform:rotate(-3deg)}
`;

const page = (s) => `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap" rel="stylesheet">
<style>${css}</style><div class="stage ${s.layout}"><div class="floor"></div>${s.html}</div>`;

const exe = [process.env.USERPROFILE + '/.cache/puppeteer/chrome-headless-shell/win64-155.0.8059.39/chrome-headless-shell-win64/chrome-headless-shell.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((x) => existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--allow-file-access-from-files'] });
for (const s of SHOTS) {
  const pg = await b.newPage(); await pg.setViewport({ width: 1200, height: 1200 });
  const f = path.join(out, s.slug + '.html'); writeFileSync(f, page(s));
  await pg.goto(pathToFileURL(f).href, { waitUntil: 'networkidle0', timeout: 60000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(out, s.slug + '.png') });
  console.log('wrote', s.slug); await pg.close();
}
await b.close();
