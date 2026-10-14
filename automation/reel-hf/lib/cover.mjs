// Reel covers (Mercedes 2026-10-13): she picks 1) a frame from the video, 2) a style, 3) the text.
// Styles (rotate them so grid neighbors never match: brand/writing-and-content-rules.md, Reel covers):
//   'cut'    = centered: her cut-out on a flat brand color (bg), title above her head
//   'behind' = text behind her: huge capitals fill the top, she stands in front of the lower lines (ink looks best)
//   'side'   = off-center: big left-aligned title, her to the right, the aside pointing at her
//   'photo'  = the full video frame with the title on top
// Title in the Reel's own type (Bricolage 800 condensed, <m>phrase</m> on a peach marker swipe, optional handwritten
// aside with a drawn arrow that points at her head), in the middle 3:4 band the grid shows (y 300-1620). Never italic
// serif, never color-changed words, never a solid band or box behind the text.
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
export const COVER_STYLES = { cut: 'Centered', behind: 'Text behind you', side: 'Off-center', photo: 'Full video frame' };

export function coverHtml({ text, aside, cut, photo, style = photo && !cut ? 'photo' : 'cut', bg = 'cream', brand = scrolly, asset = u }) {
  const C = brand.C;
  if (style !== 'photo' && !cut) style = 'photo';
  const onPhoto = style === 'photo', dark = !onPhoto && bg === 'ink';
  const ink = onPhoto || dark ? '#fff' : C.ink, titleInk = dark ? (C.cream2 || '#FFF4DC') : ink;
  // *word* in her own text works like <m>word</m>
  // the marker never wraps (a wrapped marker reads as a box), and punctuation right after it stays on its line
  const title = esc(text.replace(/\*(.+?)\*/g, '<m>$1</m>')).replace(/&lt;m&gt;(.*?)&lt;\/m&gt;([?!.,:;]*)/g, '<span class="nw"><span class="mk"><i></i><b>$1</b></span>$2</span>');
  const len = text.replace(/<\/?m>|\*/g, '').length;
  const T = {
    cut: `left:60px;right:60px;text-align:center;font-size:${len > 34 ? 128 : 150}px;line-height:.92`,
    photo: `left:60px;right:60px;text-align:center;font-size:${len > 34 ? 128 : 150}px;line-height:.92`,
    behind: `left:30px;right:30px;text-align:center;font-size:${len > 30 ? 190 : 232}px;line-height:.84;text-transform:uppercase;letter-spacing:-.015em`,
    side: `left:64px;width:${len > 30 ? 700 : 640}px;text-align:left;font-size:${len > 30 ? 140 : 168}px;line-height:.88`,
  }[style];
  const shadow = onPhoto ? 'text-shadow:0 4px 24px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.4);' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url('${asset(path.join(HERE, 'assets/fonts/bricolage-800.woff2'))}') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:H;src:url('${asset(path.join(HERE, 'assets/fonts/covered-by-your-grace.woff2'))}') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${onPhoto ? '#000' : C[bg] || bg}}
.photo{position:absolute;inset:0;background:url('${onPhoto ? asset(photo) : ''}') center/cover no-repeat}
.shade{position:absolute;left:0;right:0;top:0;height:60%;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0))}
.her{position:absolute;left:0;top:0;width:1080px;height:1920px;background:url('${!onPhoto && cut ? asset(cut) : ''}') center bottom/cover no-repeat;filter:drop-shadow(0 18px 40px rgba(22,18,16,${dark ? '.45' : '.18'}))}
.t{position:absolute;top:300px;font-family:B;font-weight:800;font-stretch:78%;color:${titleInk};letter-spacing:-.01em;${T};${shadow}}
.nw,.mk{white-space:nowrap}
.mk{position:relative;display:inline-block;padding:0 .12em;rotate:-1.5deg;text-shadow:none}
.mk i{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};border-radius:.08em;skew:-6deg}
.mk b{position:relative;font-weight:800;color:${C.ink}}
.hand{position:absolute;width:330px;font:76px/1 H;color:${ink};rotate:-4deg;${shadow}}
svg.arrow{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
</style></head><body>${onPhoto ? '<div class="photo"></div><div class="shade"></div>' : '<div class="her"></div>'}<div class="t">${title}</div>
${aside ? `<div class="hand" style="text-align:${style === 'side' ? 'left' : 'center'}">${esc(aside)}</div><svg class="arrow" width="1080" height="1920"><path id="a1" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/><path id="a2" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
<script>
// Place her under (or in front of) the title and point the aside's arrow at her head, never over her face.
window.coverReady = new Promise((ok) => {
  const style = ${JSON.stringify(style)}, her = document.querySelector('.her'), hand = document.querySelector('.hand'), t = document.querySelector('.t');
  // a hand-drawn arrow from (x1,y1) curving to (x2,y2), with a two-stroke head
  const arrow = (x1, y1, x2, y2, bend) => {
    const mx = (x1 + x2) / 2 + bend * (y2 - y1) * .35, my = (y1 + y2) / 2 - bend * (x2 - x1) * .35;
    document.getElementById('a1').setAttribute('d', 'M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + my + ' ' + x2 + ' ' + y2);
    const a = Math.atan2(y2 - my, x2 - mx), L = 34, s = .5;
    const p = (r) => (x2 - L * Math.cos(a + r)) + ' ' + (y2 - L * Math.sin(a + r));
    document.getElementById('a2').setAttribute('d', 'M' + p(s) + ' L' + x2 + ' ' + y2 + ' L' + p(-s));
  };
  const src = her && getComputedStyle(her).backgroundImage.slice(5, -2);
  if (!her || !src) { // full video frame: aside low on the right, arrow toward the middle
    if (hand) { hand.style.left = '690px'; hand.style.top = '1060px'; arrow(820, 1220, 700, 1330, -1); }
    return ok();
  }
  const img = new Image(); img.onerror = ok; img.src = src;
  img.onload = async () => {
    await document.fonts.ready; // the title's real size decides where she goes
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, k = 1920 / c.height, W = c.width;
    const solid = (px, py) => d[(py * W + px) * 4 + 3] > 40;
    let top = 0; find: for (let y = 0; y < c.height; y++) for (let i = 0; i < W; i += 2) if (solid(i, y)) { top = y; break find; }
    // her head's left/right edges, a little below the top of her hair
    const row = Math.min(c.height - 1, top + Math.round(200 / k)); let L = W, R = 0;
    for (let i = 0; i < W; i++) if (solid(i, row)) { L = Math.min(L, i); R = Math.max(R, i); }
    const tb = t.getBoundingClientRect();
    let dx = 0, dy;
    if (style === 'behind') dy = tb.top + tb.height * .52 - top * k;            // her head covers the lower lines
    else if (style === 'side') { dx = 250; dy = Math.max(tb.top + tb.height * .55, 760) - top * k; }
    else dy = Math.max(0, tb.bottom + 60 - top * k);                           // centered: head just under the title
    her.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    if (!hand) return ok();
    const headTop = top * k + dy, left = L * k + dx, right = R * k + dx, mid = headTop + 190;
    if (style === 'side') {                                                       // aside on the left, arrow → her
      hand.style.left = '70px'; hand.style.top = Math.max(tb.bottom + 60, headTop + 80) + 'px';
      const hb = hand.getBoundingClientRect(); arrow(hb.left + 40, hb.bottom + 20, left - 20, Math.max(hb.bottom + 90, mid + 80), -1);
    } else {
      const roomRight = 1080 - right, onRight = roomRight >= left;               // the side with more space
      const w = 330; hand.style.width = Math.min(w, Math.max(roomRight, left) - 40) + 'px';
      hand.style.left = (onRight ? Math.min(1080 - parseFloat(hand.style.width) - 30, right + 40) : 30) + 'px';
      hand.style.top = Math.max(headTop - 20, tb.bottom + 30) + 'px';
      const hb = hand.getBoundingClientRect();
      const fx = onRight ? hb.left + hb.width * .35 : hb.left + hb.width * .65;
      arrow(fx, hb.bottom + 14, onRight ? right + 14 : left - 14, Math.max(hb.bottom + 110, mid + 40), onRight ? -1 : 1);
    }
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
