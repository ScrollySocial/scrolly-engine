// Reel #2 cover, round 2 (Mercedes 2026-10-13): keep "Tired of fixing every AI post?" but NOT the same style as
// Reel #1 (cream, centered title over her cut-out): the feed has to stay interesting. Three different styles:
//   A text behind her (ink background, huge type, cut-out in front)
//   B real scene (the Reel's own frame + her correction bubbles above her head)
//   C off-center (blush, title big on the left, her on the right)
// Usage: node cover/build-cover-styles.mjs [A|B|C]   → cover/style-X.png (+ styles-sheet.png when all)
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SLUG = path.basename(ROOT);
const OUT = `C:/Users/merce/OneDrive/Scrolly Media/exports/reels/${SLUG}`;
const u = (p) => pathToFileURL(p).href;
const C = { ink: '#161210', peach: '#FFC9A8', cream: '#F6EEE5', cream2: '#FFF4DC', blush: '#F8DCE5', mist: '#E7EEF5', orange: '#E05A33' };
const CUT = u(path.join(HERE, 'cutout.png')), FRAME = u(path.join(HERE, 'frame-17.0.jpg'));

const head = `<meta charset="utf-8"><style>
@font-face{font-family:B;src:url('${u(path.join(ROOT, 'assets/fonts/bricolage-800.woff2'))}') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:H;src:url('${u(path.join(ROOT, 'assets/fonts/covered-by-your-grace.woff2'))}') format('woff2')}
@font-face{font-family:F;src:url('${u(path.join(ROOT, 'assets/fonts/figtree.woff2'))}') format('woff2');font-weight:300 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
.mk{position:relative;display:inline-block;padding:0 .1em;rotate:-1.5deg;white-space:nowrap}
.mk i{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};border-radius:.08em;skew:-6deg}
.mk b{position:relative;font-weight:800;color:${C.ink}}
.hand{position:absolute;font:84px/1 H;rotate:-5deg}
.her{position:absolute;inset:0;background:url('${CUT}') center top/1080px auto no-repeat}
</style>`;
const arrow = (c, x, y, r = 0) => `<svg style="position:absolute;left:${x}px;top:${y}px;rotate:${r}deg" width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"><path d="M100 12 C70 10 40 30 26 70"/><path d="M14 52 L26 72 L44 60"/></svg>`;

const STYLES = {
  // A: words behind her head. Text fills the upper band; she stands in front of the lower lines.
  A: `<!doctype html><html><head>${head}<style>
body{background:${C.ink}}
.t{position:absolute;left:30px;right:30px;top:300px;text-align:center;font:800 232px/.84 B;font-stretch:76%;color:${C.cream2};letter-spacing:-.015em;text-transform:uppercase}
.her{top:450px;filter:drop-shadow(0 20px 50px rgba(0,0,0,.45))}
</style></head><body>
<div class="t">Tired of<br><span class="mk"><i></i><b>fixing</b></span><br>every AI<br>post?</div>
<div class="her"></div>
</body></html>`,

  // B: the Reel's own scene: her real frame, her three corrections stacked above her head, title on top.
  B: `<!doctype html><html><head>${head}<style>
body{background:#000}
.bg{position:absolute;inset:0;background:url('${FRAME}') center/cover}
.fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,.3) 32%,rgba(0,0,0,0) 48%)}
.t{position:absolute;left:50px;right:50px;top:300px;text-align:center;font:800 138px/.9 B;font-stretch:78%;color:#fff;text-shadow:0 6px 26px rgba(0,0,0,.4)}
.chat{position:absolute;left:46px;top:1230px;display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.msg{font:500 42px/1.25 'Segoe UI',F,sans-serif;background:#2f2f2f;color:#fff;padding:22px 34px;border-radius:46px;border-bottom-right-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3)}
</style></head><body>
<div class="bg"></div><div class="fade"></div>
<div class="t">Tired of <span class="mk"><i></i><b>fixing</b></span><br>every AI post?</div>
<div class="chat"><div class="msg">it’s $24</div><div class="msg" style="rotate:-1deg">it comes with a jar too</div><div class="msg" style="rotate:1deg">it’s for first-time bakers</div></div>
</body></html>`,

  // C: off-center: big left-aligned title, her on the right, handwritten aside pointing at her.
  C: `<!doctype html><html><head>${head}<style>
body{background:${C.blush}}
.her{left:250px;top:430px;filter:drop-shadow(0 18px 40px rgba(22,18,16,.18))}
.t{position:absolute;left:64px;width:640px;top:300px;text-align:left;font:800 168px/.88 B;font-stretch:76%;color:${C.ink};letter-spacing:-.01em}
.hand{left:70px;top:1150px;color:${C.ink}}
</style></head><body>
<div class="her"></div>
<div class="t">Tired of <span class="mk"><i></i><b>fixing</b></span> every AI post?</div>
<div class="hand">try this${arrow(C.ink, 270, 20, 200)}</div>
</body></html>`,
};

const only = process.argv[2] ? [process.argv[2]] : Object.keys(STYLES);
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1080, height: 1920 });
for (const k of only) {
  const f = path.join(HERE, `.style-${k}.html`);
  writeFileSync(f, STYLES[k]);
  await pg.goto(u(f), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(HERE, `style-${k}.png`) });
  console.log(`style-${k}.png`);
}
if (only.length > 1) {
  const r1 = u('C:/Users/merce/OneDrive/Scrolly Media/exports/reels/2026-10-13-bb-voice-file/cover.png');
  const cell = (src, cap) => `<figure><div class="c"><img src="${src}"><i></i></div><figcaption>${cap}</figcaption></figure>`;
  const f = path.join(HERE, '.styles-sheet.html');
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#efe7dd;font:800 28px sans-serif;color:#161210;display:grid;grid-template-columns:repeat(4,300px);gap:22px}
.c{position:relative;width:300px;height:533px;overflow:hidden;border-radius:10px}.c img{width:100%}.c i{position:absolute;left:0;right:0;top:84px;height:366px;outline:3px dashed rgba(255,255,255,.6)}figure{margin:0}figcaption{text-align:center;margin-top:6px}</style></head><body>
${cell(r1, 'Reel #1 (posted look)')}${only.map((k) => cell(u(path.join(HERE, `style-${k}.png`)), k)).join('')}</body></html>`);
  await pg.setViewport({ width: 1340, height: 700 });
  await pg.goto(u(f), { waitUntil: 'load' });
  await pg.screenshot({ path: path.join(HERE, 'styles-sheet.png'), fullPage: true });
  console.log('styles-sheet.png');
} else {
  mkdirSync(OUT, { recursive: true });
  copyFileSync(path.join(HERE, `style-${only[0]}.png`), `${OUT}/cover.png`);
  console.log(`${OUT}/cover.png`);
}
await browser.close();
