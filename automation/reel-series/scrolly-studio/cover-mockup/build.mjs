// Masthead/layout options for The Scrolly Studio Reel covers. Run: node build.mjs
import puppeteer from '../../../hyperframes-test/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';

const opts = [
  { id: 'a-limelight', font: 'Limelight', css: 'font-family:Limelight;font-size:118px;letter-spacing:-1px', color: '#9E2A2B' },
  { id: 'c-federo', font: 'Federo', css: 'font-family:Federo;font-size:124px;letter-spacing:-2px', color: '#7A1F3D' },
];

const page = (o) => `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=${o.font}&family=Libre+Caslon+Text:ital@0;1&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:#efe6d6;position:relative;overflow:hidden;font-family:'Libre Caslon Text'}
/* the "painted" world fills the whole 9:16 so nothing looks cut off outside the grid crop */
.art{position:absolute;inset:0;background:
  radial-gradient(ellipse 60% 30% at 50% 78%, #8fae7c 0 60%, transparent 61%),
  radial-gradient(circle at 72% 30%, #f6d58a 0 70px, transparent 72px),
  linear-gradient(#f3c6c9 0%, #f7dcc8 55%, #b9cfa6 56%, #9dbb89 100%)}
.art::after{content:'';position:absolute;inset:0;opacity:.35;mix-blend-mode:multiply;
  background:repeating-linear-gradient(115deg,rgba(0,0,0,.05) 0 3px,transparent 3px 9px)}
.curtain{position:absolute;top:0;bottom:0;width:230px;background:repeating-linear-gradient(90deg,#e58fa2 0 28px,#d77a90 28px 46px,#ec9fb0 46px 70px)}
.curtain.l{left:0;border-radius:0 0 140px 0}.curtain.r{right:0;border-radius:0 0 0 140px}
.label{position:absolute;left:0;right:0;top:1120px;text-align:center;font-style:italic;font-size:30px;color:#6b5a4a;opacity:.7}
/* 3:4 grid band = y 240..1680 */
.band{position:absolute;left:0;right:0;top:240px;height:1440px}
.top{position:absolute;top:70px;left:70px;right:70px;display:flex;justify-content:space-between;font-size:30px;color:#2b2420}
.mast{position:absolute;top:150px;white-space:nowrap;left:0;right:0;text-align:center;line-height:1;color:${o.color};${o.css}}
.the{position:absolute;top:112px;left:0;right:0;text-align:center;font-size:38px;letter-spacing:4px;color:${o.color};font-family:inherit}
.hook{position:absolute;bottom:90px;left:110px;right:110px;text-align:center;font-size:58px;line-height:1.15;color:#2b2420}
.hook i{display:block;font-size:30px;letter-spacing:3px;font-style:normal;margin-bottom:18px}
</style></head><body>
<div class="art"></div><div class="curtain l"></div><div class="curtain r"></div>
<div class="label">( this episode's world, illustrated )</div>
<div class="band">
  <div class="top"><span>Oct. 20, 2026</span><span>Episode 1</span></div>
  <div class="mast"><span>SCROLLY STUDIO</span></div>
  <div class="the" style="${o.css.replace(/font-size:\d+px/,'font-size:34px')}">THE</div>
  <div class="hook"><i>INSIDE THIS EPISODE</i>Your hook line goes right here</div>
</div></body></html>`;

console.log('launching');
const browser = await puppeteer.launch();
console.log('launched');
const p = await browser.newPage();
await p.setViewport({ width: 1080, height: 1920 });
for (const o of opts) {
  await p.setContent(page(o), { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(async () => { await document.fonts.ready; const m = document.querySelector('.mast'); let s = parseFloat(getComputedStyle(m).fontSize); while (m.firstChild.getBoundingClientRect().width > 940 && s > 40) { s -= 2; m.style.fontSize = s + 'px'; } m.style.width = '100%'; });
  await p.screenshot({ path: `${o.id}.png` }); console.log(o.id);
}
// contact sheet: full 9:16 on top row, grid crop (3:4) below
const imgs = opts.map(o => 'data:image/png;base64,' + fs.readFileSync(`${o.id}.png`).toString('base64'));
await p.setViewport({ width: 1800, height: 1500 });
await p.setContent(`<body style="margin:0;background:#222;color:#eee;font:22px sans-serif;display:flex;gap:30px;padding:30px">
${opts.map((o, i) => `<div style="text-align:center"><div>${o.id}</div>
<img src="${imgs[i]}" style="width:300px;margin:10px 0;display:block">
<div style="width:300px;height:400px;overflow:hidden;position:relative"><img src="${imgs[i]}" style="width:300px;position:absolute;left:0;top:-66.7px"></div>
<div style="font-size:16px;opacity:.7">grid crop</div></div>`).join('')}</body>`);
await p.screenshot({ path: 'options-sheet.png', fullPage: false, clip: { x: 0, y: 0, width: 1050, height: 1060 } });
await browser.close();
console.log('done');
