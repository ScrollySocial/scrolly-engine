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
.num{font:900 150px/.95 Fig;color:${C.navy};letter-spacing:-.03em}
.num small{font-size:60px;font-weight:700}
.hand{position:absolute;font:400 54px/1.05 Hand;color:${C.navy}}
.note{background:${C.paper};padding:18px 28px 22px;box-shadow:0 12px 30px rgba(10,25,48,.35);border-radius:4px}
.receipt{position:absolute;width:520px;background:${C.paper};padding:40px 44px 70px;font:400 44px/1.25 Hand;color:#2b2724;rotate:-3deg;box-shadow:0 18px 40px rgba(10,25,48,.35);
  -webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 22px) no-repeat,radial-gradient(circle 16px at 16px 100%,#0000 98%,#000) bottom/32px 22px repeat-x}
.receipt b{font-weight:400;color:${C.navy};box-shadow:inset 0 -.32em 0 ${C.sky}}
.receipt .row{display:flex;justify-content:space-between;gap:20px}
.receipt .tot{border-top:3px dashed #2b2724;margin-top:16px;padding-top:12px;font-size:54px;color:${C.navy}}
.giant{position:absolute;font:900 400px/.85 Fig;color:${C.navy};-webkit-text-stroke:30px ${C.paper};paint-order:stroke fill;letter-spacing:-.03em;text-transform:uppercase}
.num.xl{font-size:210px}.num.xl small{font-size:80px}
.head{left:70px;top:70px;width:880px;font:900 104px/.95 Fig;letter-spacing:-.03em;color:${C.navy};-webkit-text-stroke:22px ${C.paper};paint-order:stroke fill}
.head .sky{color:${C.sky}}
.scan{inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.08) 0 2px,transparent 2px 5px)}
.glare{inset:0;background:radial-gradient(120% 90% at 30% 15%,rgba(255,255,255,.22),transparent 45%),radial-gradient(140% 120% at 50% 50%,transparent 60%,rgba(0,0,0,.35))}
.pill{position:absolute;background:${C.cream};color:${C.navy};font:600 34px/1 Fig;padding:20px 34px;border-radius:999px;box-shadow:0 10px 30px rgba(10,25,48,.3)}
`;
const RING = 'M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40';
const ring = (x, y, w, h, color = C.sky, sw = 7, halo = false) => `<svg class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible" viewBox="0 0 200 100" preserveAspectRatio="none">${halo ? `<path d="${RING}" fill="none" stroke="${C.navy}" stroke-width="${sw + 6}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` : ''}<path d="${RING}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
const arrowPath = (color, w) => `<path d="M8 12 C40 4 86 18 98 64" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><path d="M80 52 L99 70 L110 46" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const arrow = (x, y, w, r = 0, color = C.navy) => `<svg class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${w * 0.75}px;rotate:${r}deg;overflow:visible" viewBox="0 0 120 90">${arrowPath(C.paper, 14)}${arrowPath(color, 6)}</svg>`;


// TV stack for the cold open. Screen rects measured from the cut-outs (fractions of each prop's width/height).
const PROPS = path.join(HERE, '../../reel-template-pack/build/.cache/hq');
const prop = (n) => url(path.join(PROPS, n + '.png'));
const screen = (src, x, y, w, h, r) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r};overflow:hidden;background:#1d1f22">${src ? `<div class="abs" style="inset:0;background:url('${src}') center/cover"></div><div class="abs scan"></div><div class="abs glare"></div>` : `<div class="abs" style="inset:0;background:radial-gradient(#3a3d42,#15171a)"></div><div class="abs glare"></div>`}</div>`;
function tvs({ her, herOn = 'big', head, push }) {
  const W = { x: 230, y: 333, w: 760 }, Wh = W.w * 1131 / 1215;            // walnut TV, bottom left: her, then her inbox
  const R = { x: 1010, w: 660 }; R.h = R.w * 1062 / 1163; R.y = 1040 - R.h;  // CRT, bottom right: the calculator
  const T = { w: 440 }; T.h = T.w * 1131 / 1215; T.x = 1090; T.y = R.y - T.h + 14; // small walnut on top of the CRT: off, then her
  const wal = (o, hh, src) => `<img class="abs" src="${prop('Vintage Walnut Rabbit-Ear Television')}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px">` +
    screen(src, o.x + o.w * 0.095, o.y + hh * 0.39, o.w * 0.638, hh * 0.48, '7%/10%');
  const stack = `<div class="abs" style="left:150px;right:180px;top:1010px;height:60px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%)"></div>
    ${wal(W, Wh, herOn === 'big' ? frame('tv-her-' + her) : url(path.join(CACHE, 'screens', 'tv-inbox.png')))}
    <img class="abs" src="${prop('Beige CRT monitor with green screen-56')}" style="left:${R.x}px;top:${R.y}px;width:${R.w}px">
    ${screen(url(path.join(CACHE, 'screens', 'tv-calc.png')), R.x + R.w * 0.066, R.y + R.h * 0.105, R.w * 0.588, R.h * 0.602, '4%')}
    ${wal(T, T.h, herOn === 'small' ? frame('tv-her-' + her) : null)}`;
  const [o, oh] = herOn === 'big' ? [W, Wh] : [T, T.h];
  const sx = o.x + o.w * 0.414, sy = o.y + oh * 0.63; // her screen's centre: the push-in goes through it
  return `<div class="bg" style="background-image:url('${frame('curtain-bw')}')"></div>
    <div class="abs" style="inset:0;${push ? `transform-origin:${sx}px ${sy}px;transform:translate(${960 - sx}px,${540 - sy}px) scale(${herOn === 'big' ? 3.2 : 6})` : ''}">${stack}</div>
    ${head ? `<div class="abs head">${head}</div>` : ''}`;
}

const stills = {
  // 0:00 cold open: the stack of TVs (her Style Board pin "Video transitions"): her real curtain in black and white,
  // her own prop TVs in colour. She starts on the big walnut TV (the vertical take fits a TV), then jumps into the small top TV and the big
  // TV switches to her inbox. CRT = the real ManyChat cost
  // calculator. On "Here's what I do" the camera pushes into her small TV and comes out on the wide hook.
  '0a-tvs-hundreds': tvs({ her: '2.7', head: 'MANYCHAT:<br>UP TO <span class="sky">$100s</span><br>A MONTH' }),
  '0b-tvs-six': tvs({ her: '7.0', herOn: 'small', head: 'MINE:<br><span class="sky">$6</span><br>A MONTH' }),
  '0c-tvs-push-in': tvs({ her: '10.3', herOn: 'small', head: '', push: true }),
  // 0:10 hook: ManyChat Pro on the left, hers on the right, ringed; hand note for "even if my computer is off".
  '1-side-statements': `<div class="bg" style="background-image:url('${frame('IMG_2040')}')"></div>
    <div class="card" style="left:20px;top:250px;rotate:-2deg"><div class="lbl" style="font-size:38px">MANYCHAT PRO</div><div class="num xl">$39<small>/mo</small></div></div>
    <div class="card" style="left:1330px;top:200px;rotate:2deg"><div class="lbl" style="font-size:38px">MINE</div><div class="num xl">$6<small>/mo</small></div></div>
    ${ring(1240, 140, 660, 460, C.sky, 9, true)}
    <div class="hand note" style="left:1400px;top:660px;rotate:-4deg">still runs when<br>my laptop is off</div>
    ${arrow(1310, 590, 100, 200)}`,
  // chapter card, 1.5 s: number + title (same words become the YouTube chapter).
  '2-chapter-card': `<div class="abs" style="inset:0;background:${C.navy}"></div>
    <div class="abs" style="left:0;right:0;top:360px;text-align:center;font:700 40px/1 Fig;letter-spacing:.3em;color:${C.sky}">CHAPTER 5</div>
    <div class="abs" style="left:0;right:0;top:430px;text-align:center;font:900 180px/1 Fig;letter-spacing:-.03em;color:${C.cream}">The costs</div>
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
    <svg class="abs" style="left:380px;top:610px;width:110px;height:110px" viewBox="0 0 100 100"><path d="M18 16 L84 86 M82 14 L20 84" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M18 16 L84 86 M82 14 L20 84" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" fill="none"/></svg>`,
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
