// Reel #2 cover options: her cut-out (frame 17.0s, chin on hand) on a flat brand color + the title in the Reel's own
// type (Bricolage 800 condensed, one peach marker swipe, handwritten aside with a drawn arrow). Text stays in the
// middle 3:4 band (y 300-1620). Pattern: 2026-10-13-bb-voice-file/cover/build-cover.mjs.
// Usage: node cover/build-cover.mjs        → cover/option-N.png + cover/options-sheet.png
//        node cover/build-cover.mjs 3      → only option 3, also copied to OneDrive exports/reels/<slug>/cover.png
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SLUG = path.basename(ROOT);
const OUT = `C:/Users/merce/OneDrive/Scrolly Media/exports/reels/${SLUG}`;
const u = (p) => pathToFileURL(p).href;
const C = { ink: '#161210', peach: '#FFC9A8', cream: '#F6EEE5', blush: '#F8DCE5', mist: '#E7EEF5' };

// [title with <m>swipe</m>, aside, background]
export const COVERS = [
  ['Your AI doesn’t know <m>what you sell</m>', 'easy fix', 'blush'],
  ['Tired of <m>fixing</m> every AI post?', 'try this', 'cream'],
  ['Why does AI keep <m>guessing</m> your prices?', 'here’s why', 'mist'],
  ['Stop explaining <m>your products</m> to&nbsp;AI', 'one setup', 'blush'],
  ['Faster to just <m>write it yourself</m>?', 'nope', 'cream'],
  ['AI keeps writing <m>[PRICE]</m>', 'the fix', 'mist'],
];

const html = ([title, aside, bg]) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url('${u(path.join(ROOT, 'assets/fonts/bricolage-800.woff2'))}') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:H;src:url('${u(path.join(ROOT, 'assets/fonts/covered-by-your-grace.woff2'))}') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${C[bg]}}
.her{position:absolute;left:0;right:0;top:190px;height:1920px;background:url('${u(path.join(HERE, 'cutout.png'))}') center top/1080px auto no-repeat;filter:drop-shadow(0 18px 40px rgba(22,18,16,.18))}
.t{position:absolute;left:50px;right:50px;top:300px;text-align:center;font:800 150px/.9 B;font-stretch:78%;color:${C.ink};letter-spacing:-.01em}
.mk{position:relative;display:inline-block;padding:0 .12em;rotate:-1.5deg;white-space:nowrap}
.mk i{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};border-radius:.08em;skew:-6deg}
.mk b{position:relative;font-weight:800}
.hand{position:absolute;right:46px;top:var(--ht);font:84px/1 H;color:${C.ink};rotate:-5deg}
.hand svg{position:absolute;left:-118px;top:36px}
</style></head><body>
<div class="her"></div>
<div class="t">${title.replace(/<m>(.*?)<\/m>/, '<span class="mk"><i></i><b>$1</b></span>')}</div>
<div class="hand" style="--ht:0px">${aside}<svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"><path d="M100 12 C70 10 40 30 26 70"/><path d="M14 52 L26 72 L44 60"/></svg></div>
<script>
// aside sits just under the title, right side, beside her head (never over her face)
// her head top sits ~676px below the cut-out's top edge; keep it 120px under the title, aside beside her head
const t = document.querySelector('.t').getBoundingClientRect();
document.querySelector('.her').style.top = (t.bottom + 120 - 676) + 'px';
document.querySelector('.hand').style.setProperty('--ht', (t.bottom + 18) + 'px');
</script>
</body></html>`;

const only = process.argv[2] ? [+process.argv[2]] : COVERS.map((_, i) => i + 1);
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1080, height: 1920 });
for (const n of only) {
  const f = path.join(HERE, `.cover-${n}.html`);
  writeFileSync(f, html(COVERS[n - 1]));
  await pg.goto(u(f), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(HERE, `option-${n}.png`) });
  console.log(`option-${n}.png`);
}
if (only.length > 1) {
  // review sheet: all options side by side with the 3:4 grid crop marked
  const cells = only.map((n) => `<figure><div class="c"><img src="${u(path.join(HERE, `option-${n}.png`))}"><i></i></div><figcaption>${n}</figcaption></figure>`).join('');
  const f = path.join(HERE, '.sheet.html');
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#efe7dd;font:800 34px sans-serif;color:#161210;display:grid;grid-template-columns:repeat(3,330px);gap:24px}
.c{position:relative;width:330px;height:587px;overflow:hidden;border-radius:10px}.c img{width:100%}.c i{position:absolute;left:0;right:0;top:92px;height:403px;outline:3px dashed rgba(22,18,16,.35)}figure{margin:0}figcaption{text-align:center;margin-top:6px}</style></head><body>${cells}</body></html>`);
  await pg.setViewport({ width: 1100, height: 1400 });
  await pg.goto(u(f), { waitUntil: 'load' });
  await pg.screenshot({ path: path.join(HERE, 'options-sheet.png'), fullPage: true });
  console.log('options-sheet.png');
} else {
  mkdirSync(OUT, { recursive: true });
  copyFileSync(path.join(HERE, `option-${only[0]}.png`), `${OUT}/cover.png`);
  console.log(`${OUT}/cover.png`);
}
await browser.close();
