// YouTube thumbnail options for YouTube 1 (1280×720). Her cut-out from the raw footage, brand v3 colours, Instrument
// Serif numbers, Jost 800 caps, Covered By Your Grace asides. No italic accents, no marker bands, doodles only where
// they point at or circle something, nothing over her face.
//   node thumbnail.mjs <dir with cut-2043.png, cut-2054.png, 2043.jpg> [outDir]   → thumb-a.png, thumb-b.png, thumb-c.png
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { launch } from '../../carousels/lib/common.mjs';

const [src, out = src] = process.argv.slice(2);
const u = (f) => pathToFileURL(path.join(src, f)).href;
const C = { cream: '#f7f3ec', ink: '#0a1930', sky: '#4da3ff', mist: '#dfe4f0', pink: '#ff3b7f' };

const arrow = (x1, y1, x2, y2, bend, col, sw = 6) => {
  const mx = (x1 + x2) / 2 + bend * (y2 - y1) * .35, my = (y1 + y2) / 2 - bend * (x2 - x1) * .35;
  const a = Math.atan2(y2 - my, x2 - mx), L = 26, s = .5, p = (r) => `${x2 - L * Math.cos(a + r)} ${y2 - L * Math.sin(a + r)}`;
  return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>
<path d="M${p(s)} L${x2} ${y2} L${p(-s)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const page = (body, bg) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Jost:wght@700;800&family=Covered+By+Your+Grace&display=block">
<style>*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:720px;overflow:hidden;background:${bg}}
.abs{position:absolute}.serif{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.01em}
.caps{font-family:Jost,sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.005em}
.hand{font-family:'Covered By Your Grace',cursive}
svg{position:absolute;left:0;top:0;overflow:visible}</style></head><body>${body}</body></html>`;

// her cut-out: the 16:9 frame scaled to height h, shifted so her body sits where we want it
const her = (file, left, top, h, shadow = '.22') =>
  `<img class="abs" src="${u(file)}" style="left:${left}px;top:${top}px;height:${h}px;filter:drop-shadow(0 14px 30px rgba(10,25,48,${shadow}))">`;

const designs = {
  // A: off-white, the price drop is the hero, her smiling on the right
  a: page(`${her('cut-2043.png', 330, 40, 760)}
<div class="abs caps" style="left:64px;top:56px;font-size:58px;line-height:1;color:${C.ink}">I replaced ManyChat</div>
<div class="abs serif" style="left:56px;top:150px;font-size:250px;line-height:1;color:${C.ink};opacity:.55">$39</div>
<div class="abs serif" style="left:300px;top:330px;font-size:330px;line-height:1;color:${C.sky}">$6</div>
<div class="abs hand" style="left:74px;top:470px;font-size:56px;color:${C.ink};rotate:-4deg">a month</div>
<svg width="1280" height="720">${arrow(368, 222, 392, 350, -.5, C.ink)}</svg>`, C.cream),

  // B: navy, her surprised on the left, a short blunt line on the right
  b: page(`${her('cut-2054.png', -200, 60, 740, '.45')}
<div class="abs caps" style="left:700px;top:70px;width:560px;font-size:86px;line-height:.95;color:#fff">Bye,<br>ManyChat</div>
<div class="abs serif" style="left:700px;top:300px;font-size:210px;line-height:1;color:${C.sky}">$6/mo</div>
<div class="abs hand" style="left:720px;top:540px;font-size:58px;color:${C.mist};rotate:-3deg">built it with Claude</div>
<svg width="1280" height="720">${arrow(705, 585, 610, 600, .4, C.mist)}</svg>`, C.ink),

  // C: her real set (curtain) full-bleed, navy fade left, the comparison stacked
  c: page(`<img class="abs" src="${u('2043.jpg')}" style="left:180px;top:0;height:720px">
<div class="abs" style="inset:0;background:linear-gradient(90deg,${C.ink} 0%,${C.ink} 34%,rgba(10,25,48,.0) 62%)"></div>
<div class="abs caps" style="left:60px;top:80px;font-size:64px;line-height:1;color:${C.mist}">ManyChat</div>
<div class="abs serif" style="left:56px;top:140px;font-size:170px;line-height:1;color:#fff;opacity:.6">$39</div>
<div class="abs caps" style="left:60px;top:350px;font-size:64px;line-height:1;color:${C.mist}">Mine</div>
<div class="abs serif" style="left:56px;top:410px;font-size:220px;line-height:1;color:${C.sky}">$6</div>
<div class="abs hand" style="left:290px;top:540px;font-size:52px;color:#fff;rotate:-5deg">my own tool</div>`, C.ink),
};

mkdirSync(out, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1280, height: 720 });
for (const [k, html] of Object.entries(designs)) {
  // a file page, so the file:// images load (setContent's about:blank can't read them)
  const f = path.join(tmpdir(), `yt-thumb-${k}.html`);
  writeFileSync(f, html);
  await pg.goto(pathToFileURL(f).href, { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(out, `thumb-${k}.png`) });
  console.log('thumb-' + k);
}
await browser.close();
