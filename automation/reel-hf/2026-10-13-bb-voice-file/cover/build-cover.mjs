// Custom Reel cover (2026-10-13): her cut-out on a flat brand color + the title in the Reel's own type
// (Bricolage 800 condensed, peach marker swipe, handwritten aside). Renders one PNG per background.
// Usage: node cover/build-cover.mjs   → OneDrive/Scrolly Media/exports/reels/2026-10-13-bb-voice-file/cover-<bg>.png
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const CUT = path.join(ROOT, '../../carousels/reels/2026-10-13-bb-voice-file/.cutout.png');
const OUT = 'C:/Users/merce/OneDrive/Scrolly Media/exports/reels/2026-10-13-bb-voice-file';
const u = (p) => pathToFileURL(p).href;
const C = { ink: '#161210', peach: '#FFC9A8', cream: '#F6EEE5', blush: '#F8DCE5', mist: '#E7EEF5' };

const html = (bg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url('${u(path.join(ROOT, 'assets/fonts/bricolage-800.woff2'))}') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:H;src:url('${u(path.join(ROOT, 'assets/fonts/covered-by-your-grace.woff2'))}') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${C[bg]}}
.her{position:absolute;inset:0;background:url('${u(CUT)}') center/cover no-repeat;filter:drop-shadow(0 18px 40px rgba(22,18,16,.18))}
.t{position:absolute;left:60px;right:60px;top:300px;text-align:center;font:800 150px/.9 B;font-stretch:78%;color:${C.ink};letter-spacing:-.01em}
.mk{position:relative;display:inline-block;padding:0 .12em;rotate:-1.5deg}
.mk i{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};border-radius:.08em;skew:-6deg}
.mk b{position:relative;font-weight:800}
.hand{position:absolute;right:120px;top:770px;font:62px/1 H;color:${C.ink};rotate:-4deg}
.hand svg{position:absolute;left:-120px;top:20px}
</style></head><body>
<div class="her"></div>
<div class="t">Stop rewriting<br><span class="mk"><i></i><b>every caption</b></span><br>AI gives you</div>
<div class="hand">here's the fix<svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"><path d="M100 12 C70 10 40 30 26 70"/><path d="M14 52 L26 72 L44 60"/></svg></div>
</body></html>`;

const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1080, height: 1920 });
for (const bg of ['blush', 'cream', 'mist']) {
  const f = path.join(HERE, `.cover-${bg}.html`);
  writeFileSync(f, html(bg));
  await pg.goto(u(f), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${OUT}/cover-${bg}.png` });
  console.log(`${OUT}/cover-${bg}.png`);
}
await browser.close();
