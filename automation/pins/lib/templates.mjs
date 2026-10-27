// Pin layouts (1000x1500), palette, phone captures and rendering, shared by pin-templates.mjs and the batch scripts.
// Layouts come from the Pins Mercedes saved as references (2026-10-27): big headline in the top half, two fonts,
// a pill, real UI from her live site. Pins aren't limited to brand colours (her call); board covers are.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileUrl, esc } from '../../carousels/lib/common.mjs';

export const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = 'https://theambitiondepartment.com';
export const DOMAIN = 'theambitiondepartment.com';
export const SHOTS_DIR = path.join(HERE, 'out/shots');
const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Jost:wght@500;600;800&family=Instrument+Serif&display=block';

// Pin palette (Mercedes 2026-10-27: every colour needs a reason; no old Scrolly orange or yellow).
// Text is always brand navy, so every Pin still reads as hers. Grounds:
//  blush = soft pink, which she sees doing well on Pinterest (her observation; no trend data checked)
//  latte = warm neutral, the other look she sees doing well on Pinterest
//  navy  = brand; the same navy as her board covers and site, for the solid-colour layout
// The phones show her site (cream, sky, navy), which sits well on all three.
export const PAL = {
  blush: { bg: '#f2dcd6', ink: '#0a1930' },
  latte: { bg: '#e8ddcf', ink: '#0a1930', accent: '#4da3ff' },
  navy: { bg: '#0a1930', btn: '#4da3ff' },
};

// One phone capture per site path, e.g. /calculators/income-goal/ -> out/shots/calculators-income-goal.png
export const shotFile = (link) => path.join(SHOTS_DIR, (link.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home') + '.png');

const phone = (p, w) => `<div class="phone" style="width:${w}px"><div class="scr" style="background-image:url('${fileUrl(shotFile(p.link))}')"></div></div>`;
// The domain sits at the top: at the bottom it ran across the phone. The whole phone stays inside the Pin; cut off it looked odd (Mercedes 2026-10-27).
const BASE = `* { margin: 0; box-sizing: border-box; } body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; }
  .phone { position: absolute; aspect-ratio: 236/492; background: #1b1f27; border-radius: 52px; padding: 14px; box-shadow: 0 30px 60px rgba(0,0,0,.22); }
  .phone .scr { width: 100%; height: 100%; border-radius: 40px; background: center top/cover no-repeat; }
  .dom { position: absolute; top: 56px; left: 0; right: 0; text-align: center; font: 600 26px/1 Jost, Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }`;

// A: bold condensed headline + serif line + chip, phone at the bottom (her "20 content ideas" / Kutcher-ad structure).
export const A = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: ${p.ink}; }
  .h { position: absolute; top: 130px; left: 70px; right: 70px; text-align: center; }
  .big { font: 400 170px/.92 Anton, Impact, sans-serif; text-transform: uppercase; letter-spacing: .005em; }
  .ser { font: 400 92px/1 'Instrument Serif', Georgia, serif; margin-top: 18px; }
  .chip { display: inline-block; margin-top: 34px; background: ${p.ink}; color: ${p.bg}; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 20px 36px 22px; border-radius: 999px; }
  .phone { left: 50%; transform: translateX(-50%); bottom: 60px; }
  .dom { color: ${p.ink}; }
</style><div class="h"><div class="big">${p.big.map(esc).join('<br>')}</div><div class="ser">${esc(p.serif)}</div><div class="chip">${esc(p.chip)}</div></div>
${phone(p, 290)}<div class="dom">${DOMAIN}</div>`;

// C: numbered list Pin (her "4 content planning tips" / "6 steps" references). Three items.
export const C = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: ${p.ink}; }
  .h { position: absolute; top: 140px; left: 80px; right: 80px; }
  .num { font: 400 300px/.8 Anton, Impact, sans-serif; color: ${p.accent}; }
  .t { font: 800 98px/.98 Jost; text-transform: uppercase; letter-spacing: -.01em; margin-top: 10px; }
  .ser { font: 400 70px/1.05 'Instrument Serif', Georgia, serif; margin-top: 18px; }
  ol { list-style: none; position: absolute; left: 80px; right: 80px; top: 760px; padding: 0; }
  li { display: flex; gap: 32px; align-items: baseline; padding: 40px 0; border-top: 3px solid ${p.ink}; font: 600 64px/1.15 Jost; }
  li b { font: 400 80px/1 Anton, Impact, sans-serif; color: ${p.ink}; min-width: 50px; }
  .dom { color: ${p.ink}; }
</style><div class="h"><div class="num">${esc(p.num)}</div><div class="t">${esc(p.head)}</div><div class="ser">${esc(p.serif)}</div></div>
<ol>${p.items.map((x, i) => `<li><b>${i + 1}</b><span>${esc(x)}</span></li>`).join('')}</ol><div class="dom">${DOMAIN}</div>`;

// D: one solid colour, big serif line, pill button, phone (Jenna Kutcher ad structure).
export const D = (p) => `<style>${BASE}
  body { background: ${p.bg}; color: #fff; }
  .h { position: absolute; top: 140px; left: 50px; right: 50px; text-align: center; }
  .ser { font: 400 132px/.98 'Instrument Serif', Georgia, serif; }
  .sub { font: 500 46px/1.25 Jost; margin-top: 30px; opacity: .95; }
  .btn { display: inline-block; margin-top: 40px; background: ${p.btn}; color: ${p.bg}; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 24px 42px 26px; border-radius: 999px; }
  .phone { left: 50%; transform: translateX(-50%) rotate(4deg); bottom: 70px; }
  .dom { color: #fff; }
</style><div class="h"><div class="ser">${esc(p.serif)}</div><div class="sub">${esc(p.sub)}</div><div class="btn">${esc(p.btn_t)}</div></div>
${phone(p, 280)}<div class="dom">${DOMAIN}</div>`;

export const LAYOUTS = { A, C, D };

// Phone captures of each linked page (cookie banner and floating buttons hidden in the capture only).
// Captured once; delete out/shots/<file>.png to refresh after the page changes.
export async function captureShots(browser, links) {
  mkdirSync(SHOTS_DIR, { recursive: true });
  for (const link of [...new Set(links)]) {
    const f = shotFile(link);
    if (existsSync(f)) continue;
    const pg = await browser.newPage();
    await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pg.goto(SITE + link, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    await pg.evaluate(() => { for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important'); });
    await pg.screenshot({ path: f });
    await pg.close();
    console.log('shot   ' + link);
  }
}

// Renders each pin ({ id, layout, ...fields }) to <outDir>/<id>.png and checks that nothing spills off the Pin.
export async function renderPins(browser, pins, outDir) {
  mkdirSync(outDir, { recursive: true });
  const problems = [];
  const pg = await browser.newPage();
  await pg.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });
  for (const p of pins) {
    const f = path.join(outDir, '.' + p.id + '.html');
    writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"></head><body>${LAYOUTS[p.layout](p)}</body></html>`);
    await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
    await pg.evaluate(() => document.fonts.ready);
    // Headline block must end above the phone (or list) and stay inside the side margins.
    const clash = await pg.evaluate(() => {
      const h = document.querySelector('.h').getBoundingClientRect();
      const below = document.querySelector('.phone, ol');
      const b = below ? below.getBoundingClientRect() : null;
      const wide = [...document.querySelectorAll('.h *')].some((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).display !== 'inline');
      return (b && h.bottom > b.top - 20 ? 'headline runs into the ' + (below.tagName === 'OL' ? 'list' : 'phone') : '') + (wide ? ' a headline line is too wide' : '');
    });
    if (clash) problems.push(`${p.id}: ${clash.trim()}`);
    await pg.screenshot({ path: path.join(outDir, p.id + '.png') });
  }
  await pg.close();
  return problems;
}
