// Pin templates v1 (1000x1500): four layouts taken from the Pins Mercedes saved as references (2026-10-27).
// Big headline in the top half or more, two fonts, a pill or badge, real UI from her live site, domain at the foot.
// Pins are not limited to brand colours (her call); board covers are. Copy comes from the live pages only.
// Usage: node pin-templates.mjs   Output: pins/out/templates/<id>.png + sheet.png
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/templates');
const SITE = 'https://theambitiondepartment.com';
const DOMAIN = 'theambitiondepartment.com';
const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Jost:wght@500;600;800&family=Instrument+Serif&family=Caveat:wght@600&display=block';

// Real phone captures of the page each Pin links to (cookie banner hidden in the capture only).
const SHOTS = { 'income-goal': '/calculators/income-goal/', 'price-to-customers': '/calculators/price-to-customers/', 'chat-manager': '/chat-manager/', calculators: '/calculators/' };

const phone = (shot, w) => `<div class="phone" style="width:${w}px"><div class="scr" style="background-image:url('${fileUrl(path.join(OUT, 'shot-' + shot + '.png'))}')"></div></div>`;
const BASE = `* { margin: 0; box-sizing: border-box; } body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; }
  .phone { position: absolute; aspect-ratio: 236/492; background: #1b1f27; border-radius: 52px; padding: 14px; box-shadow: 0 30px 60px rgba(0,0,0,.22); }
  .phone .scr { width: 100%; height: 100%; border-radius: 40px; background: center top/cover no-repeat; }
  .dom { position: absolute; bottom: 44px; left: 0; right: 0; text-align: center; font: 600 30px/1 Jost, Arial, sans-serif; letter-spacing: .14em; text-transform: uppercase; }`;

// A: bold condensed headline + serif line, phone rising from the bottom (her "20 content ideas" / Kutcher-ad structure).
const A = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: ${p.ink}; }
  .h { position: absolute; top: 90px; left: 70px; right: 70px; text-align: center; }
  .big { font: 400 170px/.92 Anton, Impact, sans-serif; text-transform: uppercase; letter-spacing: .005em; }
  .ser { font: 400 92px/1 'Instrument Serif', Georgia, serif; margin-top: 18px; }
  .chip { display: inline-block; margin-top: 34px; background: ${p.ink}; color: ${p.bg}; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 20px 36px 22px; border-radius: 999px; }
  .phone { left: 50%; transform: translateX(-50%); top: 840px; }
  .dom { color: ${p.ink}; bottom: 40px; z-index: 3; background: ${p.bg}; padding: 16px 0 0; }
</style><div class="h"><div class="big">${p.big.map(esc).join('<br>')}</div><div class="ser">${esc(p.serif)}</div><div class="chip">${esc(p.chip)}</div></div>
${phone(p.shot, 330)}<div class="dom">${DOMAIN}</div>`;

// B: stacked label bars, handwritten line between, round badge (her leveeroadstudio reference).
const B = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: #111; }
  .h { position: absolute; top: 80px; left: 40px; right: 40px; text-align: center; }
  .hand { font: 600 120px/1 Caveat, cursive; color: #111; margin: 6px 0 14px; }
  .bar { display: inline-block; background: #fff; font: 800 118px/1 Jost; text-transform: uppercase; letter-spacing: -.01em; padding: 18px 34px 22px; margin: 8px 0; }
  .phone { left: 90px; top: 830px; transform: rotate(-6deg); }
  .badge { position: absolute; right: 70px; top: 1000px; width: 330px; height: 330px; border-radius: 50%; background: #1d1d1f; color: #fff; display: flex; align-items: center; justify-content: center; text-align: center; font: 800 46px/1.08 Jost; text-transform: uppercase; padding: 40px; }
  .dom { color: #111; z-index: 3; }
</style><div class="h">${p.lines.map((l) => (l.hand ? `<div class="hand">${esc(l.t)}</div>` : `<div><span class="bar">${esc(l.t)}</span></div>`)).join('')}</div>
${phone(p.shot, 300)}<div class="badge">${esc(p.badge)}</div><div class="dom">${DOMAIN}</div>`;

// C: numbered list Pin (her "4 content planning tips" / "6 steps" references).
const C = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: ${p.ink}; }
  .h { position: absolute; top: 100px; left: 80px; right: 80px; }
  .num { font: 400 300px/.8 Anton, Impact, sans-serif; color: ${p.accent}; }
  .t { font: 800 98px/.98 Jost; text-transform: uppercase; letter-spacing: -.01em; margin-top: 10px; }
  .ser { font: 400 70px/1.05 'Instrument Serif', Georgia, serif; margin-top: 18px; }
  ol { list-style: none; position: absolute; left: 80px; right: 80px; top: 700px; padding: 0; }
  li { display: flex; gap: 32px; align-items: baseline; padding: 40px 0; border-top: 3px solid ${p.ink}; font: 600 64px/1.15 Jost; }
  li b { font: 400 80px/1 Anton, Impact, sans-serif; color: ${p.accent}; min-width: 50px; }
  .dom { color: ${p.ink}; }
</style><div class="h"><div class="num">${esc(p.num)}</div><div class="t">${esc(p.title)}</div><div class="ser">${esc(p.serif)}</div></div>
<ol>${p.items.map((x, i) => `<li><b>${i + 1}</b><span>${esc(x)}</span></li>`).join('')}</ol><div class="dom">${DOMAIN}</div>`;

// D: one bold solid colour, big serif question, pill button, phone (Jenna Kutcher ad structure).
const D = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: #fff; }
  .h { position: absolute; top: 110px; left: 50px; right: 50px; text-align: center; }
  .ser { font: 400 132px/.98 'Instrument Serif', Georgia, serif; }
  .sub { font: 500 46px/1.25 Jost; margin-top: 30px; opacity: .95; }
  .btn { display: inline-block; margin-top: 40px; background: ${p.btn}; color: #111; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 24px 42px 26px; border-radius: 999px; }
  .phone { left: 50%; transform: translateX(-50%) rotate(4deg); top: 860px; }
  .dom { color: #fff; z-index: 3; background: ${p.bg}; padding-top: 16px; }
</style><div class="h"><div class="ser">${esc(p.serif)}</div><div class="sub">${esc(p.sub)}</div><div class="btn">${esc(p.btn_t)}</div></div>
${phone(p.shot, 320)}<div class="dom">${DOMAIN}</div>`;

// Sample Pins for batch 1 (site pages). Each line comes from the linked page's own text.
const SAMPLES = [
  { id: 'A-income-goal', t: A, board: 'Small Business Goal Setting', link: '/calculators/income-goal/', bg: '#f6df6b', ink: '#141414', big: ['How many', 'sales'], serif: 'do you need to hit your income goal?', chip: 'Free calculator', shot: 'income-goal' },
  { id: 'B-price', t: B, board: 'Pricing Your Products and Services', link: '/calculators/price-to-customers/', bg: '#f4d3d8', lines: [{ t: 'Compare', hand: true }, { t: '3 prices' }, { t: 'side by side', hand: true }], badge: 'See how many customers each needs', shot: 'price-to-customers' },
  { id: 'C-numbers', t: C, board: 'Pricing Your Products and Services', link: '/calculators/', bg: '#e9efe6', ink: '#1f3a2e', accent: '#d9603b', num: '3', title: 'numbers to know', serif: 'before you set your prices', items: ['Profit per sale', 'Break-even point', 'Average order value'] },
  { id: 'D-dm', t: D, board: 'Instagram DM Automation', link: '/chat-manager/', bg: '#d9603b', btn: '#ffe3d6', serif: 'Reply to every comment with a DM', sub: 'Someone comments your keyword. They get your link in their inbox automatically.', btn_t: 'See how it works', shot: 'chat-manager' },
];

mkdirSync(OUT, { recursive: true });
const browser = await launch();
// 1. Phone captures (once; delete out/templates/shot-*.png to refresh).
for (const [key, url] of Object.entries(SHOTS)) {
  const f = path.join(OUT, 'shot-' + key + '.png');
  if (existsSync(f)) continue;
  const pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pg.goto(SITE + url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  await pg.evaluate(() => { for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important'); });
  await pg.screenshot({ path: f });
  await pg.close();
  console.log('shot   ' + key);
}
// 2. Pins.
const pg = await browser.newPage();
await pg.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });
for (const s of SAMPLES) {
  const f = path.join(OUT, '.' + s.id + '.html');
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"></head><body>${s.t(s)}</body></html>`);
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(OUT, s.id + '.png') });
  console.log('pin    ' + s.id + '  -> ' + s.board + '  ' + s.link);
}
// 3. Side-by-side sheet at feed size.
const sheet = path.join(OUT, '.sheet.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;padding:30px;display:flex;gap:24px;width:${SAMPLES.length * 324 + 36}px">${SAMPLES.map((s) => `<img src="${fileUrl(path.join(OUT, s.id + '.png'))}" style="width:300px;border-radius:16px">`).join('')}</body>`);
await pg.setViewport({ width: SAMPLES.length * 324 + 36, height: 520, deviceScaleFactor: 1 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();
console.log('done   ' + OUT);
