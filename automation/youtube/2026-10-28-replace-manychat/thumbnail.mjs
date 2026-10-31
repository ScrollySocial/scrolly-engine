// YouTube thumbnail options for YouTube 1 (1280×720). YouTube-style, not the site brand (Mercedes 2026-10-31): her
// face big, three or four huge words in heavy condensed type, bright yellow and white with hard shadows.
// Stills MUST be tone-mapped from the iPhone HLG footage (same TM as roughcut.mjs) or she looks pale and grey.
// Cut-outs straight from hyperframes remove-background; no hand trimming around her hair.
//   node thumbnail.mjs <dir with cut-2043.png, cut-2054.png, 2043.jpg> [outDir]   → thumb-a.png, thumb-b.png, thumb-c.png
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { launch } from '../../carousels/lib/common.mjs';

const [src, out = src] = process.argv.slice(2);
const u = (f) => pathToFileURL(path.join(src, f)).href;
const Y = '#ffd60a';

const page = (body, bg) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@900&display=block">
<style>*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:720px;overflow:hidden;background:${bg}}
.abs{position:absolute}
.anton{font-family:Anton,sans-serif;text-transform:uppercase;line-height:.9;letter-spacing:.005em}
.mont{font-family:Montserrat,sans-serif;font-weight:900;text-transform:uppercase;line-height:.92;letter-spacing:-.02em}
.pop{text-shadow:0 6px 0 #000,0 0 22px rgba(0,0,0,.55);-webkit-text-stroke:3px #000;paint-order:stroke fill}
</style></head><body>${body}</body></html>`;

// her cut-out: the 16:9 frame scaled to height h, shifted so she sits where we want her
const her = (file, left, top, h) =>
  `<img class="abs" src="${u(file)}" style="left:${left}px;top:${top}px;height:${h}px;filter:drop-shadow(0 0 0 #fff) drop-shadow(0 10px 30px rgba(0,0,0,.45))">`;

const designs = {
  // A: bold blue, the price drop is the hero, her surprised face big on the right
  a: page(`<div class="abs" style="inset:0;background:radial-gradient(circle at 70% 45%,#3d8bff 0%,#1747c9 55%,#0b2170 100%)"></div>
${her('cut-2054.png', 230, 40, 900)}
<div class="abs anton pop" style="left:48px;top:40px;font-size:96px;color:#fff">I replaced<br>ManyChat</div>
<div class="abs anton pop" style="left:48px;top:290px;font-size:250px;color:${Y}">$6</div>
<div class="abs anton pop" style="left:290px;top:440px;font-size:76px;color:#fff">/month</div>`, '#1747c9'),

  // B: her real set (blurred) behind her smiling cut-out, dark fade left, a blunt line
  b: page(`<img class="abs" src="${u('2043.jpg')}" style="left:-1280px;top:-360px;height:1440px;filter:blur(18px) brightness(.8)">
<div class="abs" style="inset:0;background:linear-gradient(90deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.45) 45%,rgba(0,0,0,0) 70%)"></div>
${her('cut-2043.png', 430, 30, 900)}
<div class="abs anton pop" style="left:50px;top:60px;font-size:150px;color:#fff">Bye,<br>ManyChat</div>
<div class="abs anton pop" style="left:50px;top:430px;font-size:170px;color:${Y}">$39 → $6</div>`, '#000'),

  // C: split comparison, ManyChat side vs mine, her in the middle
  c: page(`<div class="abs" style="left:0;top:0;width:640px;height:720px;background:#e8313b"></div>
<div class="abs" style="left:640px;top:0;width:640px;height:720px;background:#19c46a"></div>
<div class="abs mont pop" style="left:30px;top:44px;font-size:64px;color:#fff">ManyChat</div>
<div class="abs mont pop" style="left:30px;top:120px;font-size:170px;color:#fff">$39</div>
<div class="abs mont pop" style="right:30px;top:44px;font-size:64px;color:#fff;text-align:right">Mine</div>
<div class="abs mont pop" style="right:30px;top:120px;font-size:170px;color:${Y};text-align:right">$6</div>
${her('cut-2043.png', 0, -10, 900)}`, '#000'),
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
