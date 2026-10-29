// Storyboard stills for YouTube 1 (Replace ManyChat): the 5 key looks at 1920×1080, for Mercedes's OK before animating.
// Backgrounds are real tone-mapped frames (.cache/<id>/frames) and the real demo inbox (.cache/<id>/screens, shots.mjs).
// Graphics sit in the side thirds, never over her face. Usage: node storyboard.mjs → .cache/<id>/storyboard/*.png
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ID = path.basename(HERE);
const require = createRequire(path.join(HERE, '../../hyperframes-test/package.json'));
const puppeteer = require('puppeteer-core');
const CACHE = path.join(HERE, '../.cache', ID);
const OUT = path.join(CACHE, 'storyboard');
mkdirSync(OUT, { recursive: true });
const url = (p) => pathToFileURL(p).href;
const frame = (n) => url(path.join(CACHE, 'frames', n + '.jpg'));
const font = (f) => url(path.join(HERE, '../../reel-hf/lib/assets/fonts', f));
const C = { navy: '#0a1930', sky: '#4da3ff', cream: '#f7f3ec', paper: '#fffdf7' };

const css = `
@font-face{font-family:Fig;src:url('${font('figtree.woff2')}') format('woff2');font-weight:300 900}
@font-face{font-family:Serif;src:url('${font('instrument-serif.ttf')}') format('truetype')}
@font-face{font-family:Hand;src:url('${font('covered-by-your-grace.woff2')}') format('woff2')}
*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;overflow:hidden;position:relative;background:${C.navy};font-family:Fig}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.abs{position:absolute}
.card{position:absolute;background:${C.paper};color:${C.navy};padding:34px 44px 38px;box-shadow:0 18px 44px rgba(10,25,48,.35);border-radius:6px}
.lbl{font:700 30px/1 Fig;letter-spacing:.02em;color:${C.navy};opacity:.75}
.num{font:400 170px/.9 Serif;color:${C.navy};letter-spacing:-.01em}
.num small{font-size:70px}
.hand{position:absolute;font:400 54px/1.05 Hand;color:${C.cream};text-shadow:0 3px 14px rgba(10,25,48,.75)}
.receipt{position:absolute;width:520px;background:${C.paper};padding:40px 44px 70px;font:400 44px/1.25 Hand;color:#2b2724;rotate:-3deg;box-shadow:0 18px 40px rgba(10,25,48,.35);
  -webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 22px) no-repeat,radial-gradient(circle 16px at 16px 100%,#0000 98%,#000) bottom/32px 22px repeat-x}
.receipt b{font-weight:400;color:${C.navy};box-shadow:inset 0 -.32em 0 ${C.sky}}
.receipt .row{display:flex;justify-content:space-between;gap:20px}
.receipt .tot{border-top:3px dashed #2b2724;margin-top:16px;padding-top:12px;font-size:54px;color:${C.navy}}
.pill{position:absolute;background:${C.cream};color:${C.navy};font:600 34px/1 Fig;padding:20px 34px;border-radius:999px;box-shadow:0 10px 30px rgba(10,25,48,.3)}
`;
const ring = (x, y, w, h, color = C.sky, sw = 7) => `<svg class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
const arrow = (x, y, w, r = 0, color = C.cream) => `<svg class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${w * 0.75}px;rotate:${r}deg;overflow:visible;filter:drop-shadow(0 3px 8px rgba(10,25,48,.6))" viewBox="0 0 120 90"><path d="M8 12 C40 4 86 18 98 64" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path d="M80 52 L99 70 L110 46" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const stills = {
  // 0:10 hook: ManyChat Pro on the left, hers on the right, ringed; hand note for "even if my computer is off".
  '1-side-statements': `<div class="bg" style="background-image:url('${frame('IMG_2040')}')"></div>
    <div class="card" style="left:70px;top:300px;rotate:-2deg"><div class="lbl">MANYCHAT PRO</div><div class="num">$39<small>/mo</small></div></div>
    <div class="card" style="left:1400px;top:270px;rotate:2deg"><div class="lbl">MINE</div><div class="num">$6<small>/mo</small></div></div>
    ${ring(1395, 330, 380, 200)}
    <div class="hand" style="left:1450px;top:640px;rotate:-4deg">still runs when<br>my laptop is off</div>
    ${arrow(1330, 560, 110, 200)}`,
  // chapter card, 1.5 s: number + title (same words become the YouTube chapter).
  '2-chapter-card': `<div class="abs" style="inset:0;background:${C.navy}"></div>
    <div class="abs" style="left:0;right:0;top:360px;text-align:center;font:700 40px/1 Fig;letter-spacing:.3em;color:${C.sky}">CHAPTER 5</div>
    <div class="abs" style="left:0;right:0;top:430px;text-align:center;font:400 200px/1 Serif;color:${C.cream}">The costs</div>
    <div class="abs" style="left:860px;width:200px;top:690px;height:4px;background:${C.sky}"></div>`,
  // demo: the real inbox fills the frame, her in a rounded box bottom-right (outside the inbox column), PATTERN ringed.
  '3-screen-takeover': `<div class="bg" style="background:#fff3f0 url('${url(path.join(CACHE, 'screens', 'inbox.png'))}') top center/1920px auto no-repeat"></div>
    ${ring(768, 428, 214, 62, C.sky, 6)}
    <div class="abs" style="right:44px;bottom:44px;width:440px;height:330px;border-radius:28px;border:6px solid ${C.cream};box-shadow:0 16px 40px rgba(10,25,48,.35);background:url('${frame('IMG_2046')}') 50% 38%/880px auto"></div>
    <svg class="abs" style="left:0;top:0;width:1920px;height:1080px;overflow:visible" viewBox="0 0 1920 1080"><path d="M1470 330 C1300 340 1100 380 1000 440" fill="none" stroke="${C.navy}" stroke-width="6" stroke-linecap="round"/><path d="M1030 410 L996 443 L1042 452" fill="none" stroke="${C.navy}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="hand" style="left:1480px;top:200px;rotate:-3deg;color:${C.navy};text-shadow:none">asks them to<br>reply first</div>`,
  // 6:44 costs: receipt unrolls in the right third; ManyChat Pro on the left with a drawn ✗ beside it (never across it).
  '4-receipt': `<div class="bg" style="background-image:url('${frame('IMG_2050')}')"></div>
    <div class="receipt" style="left:1340px;top:150px"><b>My monthly bill</b><br><br>
      <div class="row"><span>Claude plan</span><span>have it</span></div>
      <div class="row"><span>Server</span><span>$6</span></div>
      <div class="row"><span>Apify</span><span>free credit</span></div>
      <div class="row"><span>Web address</span><span>free</span></div>
      <div class="row tot"><span>Total</span><span>$6/mo</span></div></div>
    <div class="card" style="left:70px;top:330px;rotate:-2deg"><div class="lbl">MANYCHAT PRO</div><div class="num">$39<small>/mo</small></div></div>
    <svg class="abs" style="left:380px;top:610px;width:110px;height:110px;filter:drop-shadow(0 3px 8px rgba(10,25,48,.6))" viewBox="0 0 100 100"><path d="M18 16 L84 86 M82 14 L20 84" stroke="${C.cream}" stroke-width="9" stroke-linecap="round" fill="none"/></svg>`,
  // end screen, 19 s: she moves to the left, the right side stays clear for YouTube's own cards (outlines = where they land).
  '5-end-screen': `<div class="abs" style="inset:0;background:${C.navy}"></div>
    <div class="abs" style="left:-420px;top:0;width:1920px;height:1080px;background:url('${frame('IMG_2063')}') center/cover"></div>
    <div class="abs" style="left:1180px;top:0;width:740px;height:1080px;background:${C.navy}"></div>
    <div class="abs" style="left:1260px;top:150px;font:400 76px/1 Serif;color:${C.cream}">Watch next</div>
    <div class="abs" style="left:1260px;top:260px;width:580px;height:326px;border:3px dashed ${C.sky};border-radius:12px;display:grid;place-items:center;font:600 28px Fig;color:${C.sky}">YouTube's video card goes here</div>
    <div class="abs" style="left:1260px;top:650px;width:170px;height:170px;border:3px dashed ${C.sky};border-radius:50%;display:grid;place-items:center;text-align:center;font:600 24px/1.2 Fig;color:${C.sky}">Subscribe<br>button</div>
    <div class="abs" style="left:1470px;top:695px;font:700 32px/1.3 Fig;color:${C.cream}">@AmbitionDeptHQ<br><span style="font-weight:400;font-size:28px;opacity:.8">theambitiondepartment.com</span></div>`,
};

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
for (const [name, body] of Object.entries(stills)) {
  const f = path.join(OUT, name + '.html');
  writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${css}</style>${body}`);
  await page.goto(url(f), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, name + '.png'), type: 'png' });
  console.log(path.join(OUT, name + '.png'));
}
await browser.close();
