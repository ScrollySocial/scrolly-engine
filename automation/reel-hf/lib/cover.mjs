// Reel covers (Mercedes 2026-10-13): she picks 1) a frame from the video, 2) a style, 3) the text.
// Styles: 'cut' = her cut-out on a flat brand color (bg), 'photo' = the full video frame with the title on top.
// Title in the Reel's own type (Bricolage 800 condensed, <m>phrase</m> on a peach marker swipe, optional handwritten
// aside with an arrow), in the middle 3:4 band the grid shows (y 300-1620). Never italic serif, never color-changed
// words, never a solid band or box behind the text.
//   await renderCovers({ options: [{ text: 'Stop rewriting <m>every caption</m> AI gives you', aside: "here's the fix" }],
//                        cut: 'sketch/f05-cut.png', bg: 'cream', outDir: 'review/covers' })   → cover-1.png …
// cut = a 1080×1920 transparent PNG of her (hyperframes remove-background); photo = a 1080×1920 still.
// asset(path) → URL: file URLs for rendering here, http paths when the review page shows a live preview.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../carousels/lib/common.mjs';
import scrolly from './brand/scrolly.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const u = (p) => pathToFileURL(path.resolve(p)).href;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const COVER_BGS = ['cream', 'blush', 'mist', 'peach', 'ink'];

export function coverHtml({ text, aside, cut, photo, style = photo && !cut ? 'photo' : 'cut', bg = 'cream', brand = scrolly, asset = u }) {
  const C = brand.C, onPhoto = style === 'photo', dark = !onPhoto && bg === 'ink';
  const ink = onPhoto || dark ? '#fff' : C.ink;
  // *word* in her own text works like <m>word</m>
  const title = esc(text.replace(/\*(.+?)\*/g, '<m>$1</m>')).replace(/&lt;m&gt;(.*?)&lt;\/m&gt;/g, '<span class="mk"><i></i><b>$1</b></span>');
  const size = text.replace(/<\/?m>|\*/g, '').length > 34 ? 128 : 150;
  const shadow = onPhoto ? 'text-shadow:0 4px 24px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.4);' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url('${asset(path.join(HERE, 'assets/fonts/bricolage-800.woff2'))}') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:H;src:url('${asset(path.join(HERE, 'assets/fonts/covered-by-your-grace.woff2'))}') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${onPhoto ? '#000' : C[bg] || bg}}
.photo{position:absolute;inset:0;background:url('${onPhoto ? asset(photo) : ''}') center/cover no-repeat}
.shade{position:absolute;left:0;right:0;top:0;height:60%;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0))}
.her{position:absolute;inset:0;background:url('${!onPhoto && cut ? asset(cut) : ''}') center bottom/cover no-repeat;filter:drop-shadow(0 18px 40px rgba(22,18,16,.18))}
.t{position:absolute;left:60px;right:60px;top:300px;text-align:center;font:800 ${size}px/.92 B;font-stretch:78%;color:${ink};letter-spacing:-.01em;${shadow}}
.mk{position:relative;display:inline-block;padding:0 .12em;rotate:-1.5deg;text-shadow:none}
.mk i{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};border-radius:.08em;skew:-6deg}
.mk b{position:relative;font-weight:800;color:${C.ink}}
.hand{position:absolute;right:46px;width:300px;text-align:center;font:58px/1.05 H;color:${ink};rotate:-4deg;${shadow}}
.hand svg{display:block;margin:6px 0 0 30px}
</style></head><body>${onPhoto ? '<div class="photo"></div><div class="shade"></div>' : '<div class="her"></div>'}<div class="t">${title}</div>
${aside ? `<div class="hand">${esc(aside)}<svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"><path d="M100 12 C70 10 40 30 26 70"/><path d="M14 52 L26 72 L44 60"/></svg></div>` : ''}
<script>
// cut-out style: keep the title above her head and the aside beside it (never over her face): find the top of the
// cut-out, move her down so her head starts just under the title, then hang the aside next to her head.
window.coverReady = new Promise((ok) => {
  const her = document.querySelector('.her'), hand = document.querySelector('.hand');
  const src = her && getComputedStyle(her).backgroundImage.slice(5, -2);
  if (!her || !src) { if (hand) hand.style.top = '760px'; return ok(); }
  const img = new Image(); img.onerror = ok; img.src = src;
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let top = 0;
    find: for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i += 4) if (d[(y * c.width + i) * 4 + 3] > 40) { top = y * 1920 / c.height; break find; }
    const shift = Math.max(0, document.querySelector('.t').getBoundingClientRect().bottom + 60 - top);
    her.style.transform = 'translateY(' + shift + 'px)';
    if (hand) hand.style.top = (top + shift + 30) + 'px';
    ok();
  };
});
</script>
</body></html>`;
}

// options: [{ text, aside, style, bg, cut, photo }] (each falls back to the shared cut / bg)
export async function renderCovers({ options, cut, bg = 'cream', outDir = 'review/covers', names }) {
  mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const files = [];
  try {
    const pg = await browser.newPage();
    await pg.setViewport({ width: 1080, height: 1920 });
    for (const [k, o] of options.entries()) {
      const tmp = path.resolve(outDir, `.cover-${k + 1}.html`);
      writeFileSync(tmp, coverHtml({ cut, ...o, bg: o.bg || bg }));
      await pg.goto(u(tmp), { waitUntil: 'load' });
      await pg.evaluate(() => document.fonts.ready);
      await pg.evaluate(() => window.coverReady);
      const out = path.join(outDir, names?.[k] || `cover-${k + 1}.png`);
      await pg.screenshot({ path: out });
      rmSync(tmp, { force: true });
      files.push(out.replace(/\\/g, '/'));
    }
  } finally { await browser.close(); }
  console.log(`${files.length} cover(s) → ${outDir}`);
  return files;
}
