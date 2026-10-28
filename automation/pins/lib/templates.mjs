// Pin layouts (1000x1500), styles, phone captures and rendering, shared by pin-templates.mjs and the batch scripts.
// Layouts come from the Pins Mercedes saved as references (2026-10-27): big headline in the top half, two fonts,
// a pill, real UI from her live site. Pins aren't limited to brand colours (her call); board covers are.
// v3 (2026-10-27, "too cookie cutter"): every Pin gets its own style: ground, pattern, headline font, accent,
// hand-drawn doodles (her ScrollyDoodles font from the Reel packs) and phone position. See styleFor().
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileUrl, esc } from '../../carousels/lib/common.mjs';

export const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = 'https://theambitiondepartment.com';
export const DOMAIN = 'theambitiondepartment.com';
export const SHOTS_DIR = path.join(HERE, 'out/shots');
const PACK_FONTS = path.resolve(HERE, '../reel-template-pack/assets/fonts');
const GOOGLE = 'https://fonts.googleapis.com/css2?family=Anton&family=Jost:wght@500;600;800&family=Instrument+Serif&family=Reenie+Beanie&family=Caveat+Brush&family=Permanent+Marker&family=Sacramento&family=Covered+By+Your+Grace&display=block';
const FACES = `@font-face { font-family: 'Doodles'; src: url('${fileUrl(path.join(PACK_FONTS, 'ScrollyDoodles.otf'))}'); }
  @font-face { font-family: 'DM Serif Display'; src: url('${fileUrl(path.join(PACK_FONTS, 'dmserifdisplay-DMSerifDisplay-Regular.ttf'))}'); }
  @font-face { font-family: 'Bodoni Moda'; src: url('${fileUrl(path.join(PACK_FONTS, 'BodoniModa.ttf'))}'); font-weight: 400 900; }`;

// Grounds (Mercedes 2026-10-27: every colour needs a reason; no old Scrolly orange or yellow).
//  brand: navy, cream, mist (same as her site and board covers); sky is the brand accent.
//  Pinterest look she sees doing well (her observation; no trend data checked): blush and rose pinks, latte and oat neutrals.
//  deep rose and espresso are the darker partners of those pinks and neutrals, for solid-colour Pins with white text.
// ink = text colour; accent = the one highlighted word or doodle; sub = quieter line.
export const GROUNDS = {
  blush: { bg: '#f2dcd6', ink: '#0a1930', accent: '#b5485f', sub: '#0a1930' },
  rose: { bg: '#e9c6c4', ink: '#0a1930', accent: '#0a1930', sub: '#0a1930' },
  latte: { bg: '#e8ddcf', ink: '#3b2a22', accent: '#b5485f', sub: '#3b2a22' },
  oat: { bg: '#f3ede4', ink: '#3b2a22', accent: '#4da3ff', sub: '#3b2a22' },
  cream: { bg: '#f7f3ec', ink: '#0a1930', accent: '#4da3ff', sub: '#0a1930' },
  mist: { bg: '#dfe4f0', ink: '#0a1930', accent: '#b5485f', sub: '#0a1930' },
  navy: { bg: '#0a1930', ink: '#ffffff', accent: '#4da3ff', sub: '#dfe4f0', dark: true },
  deeprose: { bg: '#a8435a', ink: '#ffffff', accent: '#ffd9df', sub: '#ffe9ec', dark: true },
  espresso: { bg: '#3b2a22', ink: '#f7f3ec', accent: '#e9c6c4', sub: '#e8ddcf', dark: true },
};
export const PAL = { blush: GROUNDS.blush, latte: { ...GROUNDS.latte, ink: '#0a1930', accent: '#4da3ff' }, navy: { ...GROUNDS.navy, btn: '#4da3ff' } };

// Headline fonts: condensed, heavy sans, DM Serif Display (Reel packs) and her site serif. Bodoni Moda looked spindly at Pin size, so it is out of the rotation.
const HEAD = {
  anton: { css: "400 {s}px/.92 Anton, Impact, sans-serif", upper: true, size: 170 },
  jost: { css: "800 {s}px/.95 Jost, Arial, sans-serif", upper: true, size: 140 },
  dmserif: { css: "400 {s}px/.95 'DM Serif Display', Georgia, serif", upper: false, size: 160 },
  bodoni: { css: "800 {s}px/.95 'Bodoni Moda', Georgia, serif", upper: false, size: 150 },
  instrument: { css: "400 {s}px/.92 'Instrument Serif', Georgia, serif", upper: false, size: 200 },
};
const SERIF = { instrument: "'Instrument Serif', Georgia, serif", dmserif: "'DM Serif Display', Georgia, serif", bodoni: "'Bodoni Moda', Georgia, serif" };

// Background treatments, drawn in the ink colour at low strength so text stays readable.
const tint = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const pattern = (st, g) => ({
  none: '',
  dots: `background-image: radial-gradient(${tint(g.ink, g.dark ? .14 : .1)} 7px, transparent 8px); background-size: 56px 56px;`,
  grid: `background-image: linear-gradient(${tint(g.ink, .08)} 2px, transparent 2px), linear-gradient(90deg, ${tint(g.ink, .08)} 2px, transparent 2px); background-size: 50px 50px;`,
  stripes: `background-image: repeating-linear-gradient(90deg, ${tint(g.ink, .06)} 0 40px, transparent 40px 80px);`,
}[st.pattern] ?? '');
// Shapes behind the phone: a big circle or an arch, or the bottom of the Pin in a second tone.
const shape = (st, g) => ({
  circle: `<div style="position:absolute;width:760px;height:760px;border-radius:50%;left:${st.phone === 'left' ? -60 : st.phone === 'right' ? 300 : 120}px;top:760px;background:${tint(g.accent, g.dark ? .25 : .22)}"></div>`,
  arch: `<div style="position:absolute;width:560px;height:900px;border-radius:280px 280px 0 0;left:${st.phone === 'left' ? 60 : st.phone === 'right' ? 380 : 220}px;top:820px;background:${tint(g.accent, g.dark ? .25 : .2)}"></div>`,
  split: `<div style="position:absolute;left:0;right:0;top:1000px;bottom:0;background:${tint(g.ink, g.dark ? .12 : .08)}"></div>`,
}[st.shape] ?? '');

// Hand-drawn doodles from her ScrollyDoodles font. Each one has a job (Mercedes 2026-10-21): point at the phone,
// underline the key word, mark a list item, or sit in an empty corner as a sparkle. Never touching text.
const DOOD = { arrowCurve: 'C', arrowLoop: 'D', arrowCorner: 'J', arrowSquig: 'H', sparkle: 'b', sparkle2: 'a', star: 'S', heart: 'U', burst: 'L', under: 'g', under2: 'm', tick: '6', box: 'Â' };
const HAND_DIGIT = ['Ì', 'Í', 'Î', 'Ï', 'Ð']; // hand-drawn 1-5
// Hand-drawn underline (Reel pack doodle PNG, white stroke on black), used as a luminance mask so it takes the accent colour and stretches to the word.
const UNDERLINE = fileUrl(path.resolve(HERE, '../reel-template-pack/assets/props/doodles/underlines/02.png'));
const doodle = (ch, css) => `<span class="dd" style="${css}">${ch}</span>`;

const phone = (p, w, st) => {
  const x = { left: 'left:120px', right: 'right:120px', center: `left:${500 - w / 2}px` }[st.phone];
  const rot = { left: -5, right: 5, center: 0 }[st.phone] + (st.tilt || 0);
  return `<div class="phone" style="width:${w}px;${x};transform:rotate(${rot}deg)"><div class="scr" style="background-image:url('${fileUrl(shotFile(p.link))}')"></div></div>`;
};
// One hand-drawn straight arrow (Reel pack arrows/00.png as a luminance mask, so it takes the accent colour), placed
// by geometry: it starts in the empty space beside the phone and its tip stops just short of the phone's screen.
// Mercedes 2026-10-27: no double-headed loop arrow; the curved glyph had a stray dash; the arrow must point at the phone.
const ARROW = fileUrl(path.resolve(HERE, '../reel-template-pack/assets/props/doodles/arrows/00.png'));
const arrowToPhone = (st, g, w) => {
  if (!st.doodles.includes('arrow')) return '';
  const h = w * 492 / 236, top = 1500 - 70 - h;
  const left = { left: 120, right: 1000 - 120 - w, center: 500 - w / 2 }[st.phone];
  const fromRight = st.phone === 'left';
  const tip = { x: fromRight ? left + w + 28 : left - 28, y: top + h * (st.phone === 'center' ? .28 : .38) };
  const start = { x: tip.x + (fromRight ? 250 : -250), y: tip.y - 120 };
  if (st.phone === 'center') { start.x = tip.x - 220; start.y = tip.y - 140; }
  const len = Math.hypot(tip.x - start.x, tip.y - start.y), ang = Math.atan2(tip.y - start.y, tip.x - start.x) * 180 / Math.PI;
  const ht = Math.round(len * 152 / 420);
  return `<div class="dd" style="left:${start.x}px;top:${start.y}px;width:${Math.round(len)}px;height:${ht}px;transform-origin:0 50%;transform:translateY(-50%) rotate(${ang.toFixed(1)}deg);background:${g.accent};-webkit-mask:url('${ARROW}') center/100% 100% no-repeat;mask:url('${ARROW}') center/100% 100% no-repeat;mask-mode:luminance"></div>`;
};
const sparkles = (st, g) => (st.doodles.includes('sparkle') ? doodle(DOOD.sparkle, `right:44px;top:30px;font-size:90px;color:${g.accent}`) : '')
  + (st.doodles.includes('heart') ? doodle(DOOD.heart, `${st.phone === 'right' ? 'left' : 'right'}:70px;bottom:120px;font-size:110px;color:${g.accent};transform:rotate(12deg)`) : '')
  + (st.doodles.includes('star') ? doodle(DOOD.star, `${st.phone === 'left' ? 'right' : 'left'}:60px;bottom:${st.doodles.includes('heart') ? 300 : 110}px;font-size:120px;color:${g.accent};transform:rotate(-10deg)`) : '');

// The domain sits at the top: at the bottom it ran across the phone. The whole phone stays inside the Pin; cut off it looked odd (Mercedes 2026-10-27).
const BASE = (g, st) => `* { margin: 0; box-sizing: border-box; } ${FACES}
  body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; background-color: ${g.bg}; color: ${g.ink}; ${pattern(st, g)} }
  .phone { position: absolute; bottom: 70px; aspect-ratio: 236/492; background: #1b1f27; border-radius: 52px; padding: 14px; box-shadow: 0 30px 60px rgba(0,0,0,.25); z-index: 2; }
  .phone .scr { width: 100%; height: 100%; border-radius: 40px; background: center top/cover no-repeat; }
  .dom { position: absolute; top: 56px; left: 0; right: 0; text-align: center; font: 600 26px/1 Jost, Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: ${g.ink}; z-index: 3; }
  .h { position: absolute; z-index: 3; }
  .dd { position: absolute; font-family: Doodles; line-height: 1; z-index: 1; pointer-events: none; }
  .acc { color: ${g.accent}; }
  .ul { position: relative; display: inline-block; }
  .ul::after { content: ''; position: absolute; left: -4%; right: -4%; bottom: -.38em; height: .3em; background: ${g.accent}; -webkit-mask: url('${UNDERLINE}') center/100% 100% no-repeat; mask: url('${UNDERLINE}') center/100% 100% no-repeat; mask-mode: luminance; }`;

// The one highlighted line: accent colour, or a hand-drawn underline under it.
const accentLine = (t, st) => (st.accentMode === 'underline' ? `<span class="ul">${esc(t)}</span>` : `<span class="acc">${esc(t)}</span>`);

// A: big headline + serif line + chip, phone at the bottom (her "20 content ideas" / Kutcher-ad structure).
export const A = (p) => {
  const st = p.style, g = GROUNDS[st.ground], h = HEAD[st.head];
  const lines = p.big.map((l, i) => (i === st.accentLine ? accentLine(l, st) : esc(l)));
  const chipBg = st.chip === 'accent' ? g.accent : g.ink, chipInk = st.chip === 'accent' ? (g.dark ? g.bg : '#fff') : g.bg;
  return `<style>${BASE(g, st)}
  .h { top: 130px; left: 60px; right: 60px; text-align: center; }
  .big { font: ${h.css.replace('{s}', h.size)}; ${h.upper ? 'text-transform: uppercase;' : ''} letter-spacing: .005em; }
  .ser { font: 400 88px/1.02 ${SERIF[st.serif]}; margin-top: ${st.accentMode === 'underline' && st.accentLine === p.big.length - 1 ? 46 : 18}px; color: ${g.sub}; }
  .chip { display: inline-block; margin-top: 34px; background: ${chipBg}; color: ${chipInk}; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 20px 36px 22px; border-radius: ${st.chipShape === 'tag' ? '10px' : '999px'}; ${st.chipShape === 'tag' ? 'transform: rotate(-3deg);' : ''} }
</style>${shape(st, g)}<div class="h"><div class="big">${lines.join('<br>')}</div><div class="ser">${esc(p.serif)}</div><div class="chip">${esc(p.chip)}</div></div>
${phone(p, 290, st)}${arrowToPhone(st, g, 290)}${sparkles(st, g)}<div class="dom">${DOMAIN}</div>`;
};

// C: numbered list Pin (her "4 content planning tips" / "6 steps" references). Three items.
export const C = (p) => {
  const st = p.style, g = GROUNDS[st.ground], h = HEAD[st.head];
  const mark = (i) => (st.marker === 'tick' ? `<b class="mk dd2">${DOOD.tick}</b>` : st.marker === 'hand' ? `<b class="mk dd2">${HAND_DIGIT[i]}</b>` : `<b class="mk">${i + 1}</b>`);
  // More than three items (e.g. a five-check list): tighter rows and a smaller number so the list stays on the Pin.
  const many = p.items.length > 3;
  const bigNum = st.marker === 'hand' ? `<span style="font-family:Doodles">${HAND_DIGIT[Number(p.num) - 1] || esc(p.num)}</span>` : esc(p.num);
  return `<style>${BASE(g, st)}
  .col { position: absolute; top: 150px; left: 80px; right: 80px; z-index: 3; }
  .h { position: static; ${st.align === 'center' ? 'text-align:center;' : ''} }
  .num { font: 400 ${many ? 200 : 300}px/.8 Anton, Impact, sans-serif; color: ${g.accent}; }
  .t { font: ${h.css.replace('{s}', Math.round(h.size * .62))}; ${h.upper ? 'text-transform: uppercase;' : ''} margin-top: 14px; }
  .ser { font: 400 70px/1.05 ${SERIF[st.serif]}; margin-top: 18px; color: ${g.sub}; }
  ol { list-style: none; margin-top: ${many ? 50 : 90}px; padding: 0; }
  li { display: flex; gap: 32px; align-items: center; padding: ${many ? 22 : 38}px ${st.cards ? '36px' : '0'}; ${st.cards ? `background: ${tint(g.dark ? '#ffffff' : '#ffffff', g.dark ? .1 : .6)}; border-radius: 22px; margin-bottom: 22px;` : `border-top: 3px solid ${tint(g.ink, .5)};`} font: 600 ${many ? 50 : 62}px/1.15 Jost; }
  .mk { font: 400 80px/1 Anton, Impact, sans-serif; color: ${g.accent}; min-width: 60px; text-align: center; }
  .dd2 { font-family: Doodles; font-weight: 400; }
</style>${shape(st, g)}<div class="col"><div class="h"><div class="num">${bigNum}</div><div class="t">${accentLine(p.head, { ...st, accentMode: st.accentMode === 'underline' ? 'underline' : 'none' })}</div><div class="ser">${esc(p.serif)}</div></div>
<ol>${p.items.map((x, i) => `<li>${mark(i)}<span>${esc(x)}</span></li>`).join('')}</ol></div>${sparkles(st, g)}<div class="dom">${DOMAIN}</div>`;
};

// D: one solid colour, big serif line, pill button, phone (Jenna Kutcher ad structure).
export const D = (p) => {
  const st = p.style, g = GROUNDS[st.ground];
  return `<style>${BASE(g, st)}
  .h { top: 140px; left: 50px; right: 50px; text-align: center; }
  .ser { font: 400 ${st.serif === 'bodoni' ? 116 : 128}px/1 ${SERIF[st.serif]}; ${st.serif === 'bodoni' ? 'font-weight: 600;' : ''} }
  .sub { font: 500 46px/1.25 Jost; margin-top: 30px; color: ${g.sub}; }
  .btn { display: inline-block; margin-top: 40px; background: ${g.accent}; color: ${g.bg}; font: 800 36px/1 Jost; letter-spacing: .12em; text-transform: uppercase; padding: 24px 42px 26px; border-radius: 999px; }
</style>${shape(st, g)}<div class="h"><div class="ser">${esc(p.serif)}</div><div class="sub">${esc(p.sub)}</div><div class="btn">${esc(p.btn_t)}</div></div>
${phone(p, 280, st)}${arrowToPhone(st, g, 280)}${sparkles(st, g)}<div class="dom">${DOMAIN}</div>`;
};

// Photo Pins (2026-10-28, from her Digital Priestess / "lazy way to edit" references). Photos are free stock from
// Pexels (her call; she picks against "lame" stock: warm, cosy, real-looking, nobody posing at the camera), kept in
// assets/stock/ with a credits file. The text never speaks for the person in the photo.
const PROPS = path.resolve(HERE, '../reel-template-pack/assets/props');
const photoBg = (p) => `<div style="position:absolute;inset:0;background:url('${fileUrl(stockFile(p.photo))}') ${p.focus || 'center'}/cover no-repeat"></div>`;

// Fun fonts for the highlighted line (Mercedes 2026-10-28: the plain sans highlight wasn't fun enough). Size factor
// evens out how big each font looks. Shown side by side in the test set so she can pick.
export const HL = {
  reenie: { css: "'Reenie Beanie', cursive", k: 1.5 },
  caveatbrush: { css: "'Caveat Brush', cursive", k: 1.15 },
  marker: { css: "'Permanent Marker', cursive", k: 1 },
  sacramento: { css: "'Sacramento', cursive", k: 1.45 },
};
const hlCss = (p, px) => { const f = HL[p.hl || 'caveatbrush']; return `font: 400 ${Math.round(px * f.k)}px/1.15 ${f.css};`; };
// Photo or video: for a video Pin the page is rendered with a see-through background and laid over the clip by ffmpeg.
const bg = (p) => (p.video ? '' : photoBg(p));
const bodyBg = (p) => (p.video ? 'background: transparent;' : '');

// E: a paper note card pinned onto the photo with a real photographed push pin (Reel pack prop). No small label on top
// (she dislikes the eyebrow line): just the benefit headline and one highlighted line in a fun font.
export const E = (p) => {
  const st = p.style || {}, top = p.cardTop ?? 760;
  return `<style>* { margin: 0; box-sizing: border-box; } ${FACES}
  body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; ${bodyBg(p)} }
  .dom { position: absolute; top: 46px; left: 0; right: 0; text-align: center; font: 600 26px/1 Jost; letter-spacing: .16em; text-transform: uppercase; color: ${p.domInk || '#fff'}; text-shadow: 0 1px 8px rgba(0,0,0,.45); z-index: 3; }
  .h { position: absolute; left: 90px; right: 90px; top: ${top}px; background: #fbf8f2; border-radius: 6px; padding: 66px 60px 54px; transform: rotate(${p.tilt ?? -2}deg); box-shadow: 0 24px 50px rgba(0,0,0,.28); z-index: 2; color: #2b2320; }
  .ser { font: 400 ${p.size || 104}px/1 ${SERIF[st.serif || 'instrument']}; }
  .small { margin-top: 26px; ${hlCss(p, 62)} }
  .small { white-space: nowrap; } .small span { background: ${p.mark || '#cfe3ff'}; padding: 0 10px; }
  .pinhead { position: absolute; left: 50%; top: -34px; width: 74px; transform: translateX(-50%) rotate(-12deg); filter: drop-shadow(0 6px 6px rgba(0,0,0,.35)); }
</style>${bg(p)}<div class="h"><img class="pinhead" src="${fileUrl(path.join(PROPS, 'pin-head-' + (p.pin || 'blue') + '.png'))}"><div class="ser">${esc(p.serif)}</div><div class="small"><span>${esc(p.small)}</span></div></div><div class="dom">${DOMAIN}</div>`;
};

// F: big serif headline straight on the photo, with the next line in a phone-style text-selection highlight (blue box
// with the two round drag handles), like her "Want the lazy way to edit TikToks & Reels?" reference.
export const F = (p) => {
  const st = p.style || {}, ink = p.ink || '#ffffff';
  return `<style>* { margin: 0; box-sizing: border-box; } ${FACES}
  body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; ${bodyBg(p)} }
  .shade { position: absolute; inset: 0; background: linear-gradient(${p.textBottom ? '0deg' : '180deg'}, rgba(0,0,0,${p.shade ?? .5}) 0%, rgba(0,0,0,0) 58%); }
  .dom { position: absolute; top: 46px; left: 0; right: 0; text-align: center; font: 600 26px/1 Jost; letter-spacing: .16em; text-transform: uppercase; color: ${ink}; text-shadow: 0 1px 8px rgba(0,0,0,.45); z-index: 3; }
  .h { position: absolute; left: 70px; right: 70px; ${p.textBottom ? 'bottom: 120px;' : 'top: 130px;'} color: ${ink}; z-index: 3; }
  .ser { font: 400 ${p.size || 136}px/.98 ${SERIF[st.serif || 'instrument']}; text-shadow: 0 2px 18px rgba(0,0,0,.25); }
  .sel { position: relative; display: inline-block; margin-top: 34px; ${hlCss(p, 72)} color: #fff; background: rgba(46,120,246,.85); padding: 4px 16px 8px; white-space: nowrap; }
  .sel::before, .sel::after { content: ''; position: absolute; width: 4px; background: #2e78f6; top: -8px; bottom: -8px; }
  .sel::before { left: -4px; } .sel::after { right: -4px; }
  .sel i { position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #2e78f6; }
  .sel i.a { left: -11px; top: -24px; } .sel i.b { right: -11px; bottom: -24px; }
</style>${bg(p)}${p.dim ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${p.dim})"></div>` : ''}<div class="shade"></div><div class="h"><div class="ser">${esc(p.serif)}</div><div class="sel"><i class="a"></i>${esc(p.sel)}<i class="b"></i></div></div><div class="dom">${DOMAIN}</div>`;
};

// G: stacked white label bars in a heavy sans, script lines between, a photo filling the bottom and a round dark badge
// with a hand-drawn arrow pointing at it (her Levee Road "explode your Pinterest traffic" reference, 2026-10-28).
// lines: [{ t, script: true } | { t }]
// scriptFont swaps Sacramento for another hand with room above and below (Mercedes 2026-10-28: Sacramento capitals were
// hard to read and touched the bars; Caveat Brush was too small and not liked).
const SCRIPT_FONTS = { caveatbrush: ["'Caveat Brush'", 120], marker: ["'Permanent Marker'", 104], grace: ["'Covered By Your Grace'", 170] };
export const G = (p) => {
  const g = GROUNDS[p.ground || 'blush'];
  return `<style>* { margin: 0; box-sizing: border-box; } ${FACES}
  body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; background: ${g.bg}; color: #15110f; }
  .photo { position: absolute; left: 0; right: 0; bottom: 0; height: ${p.photoH || 520}px; background: url('${fileUrl(stockFile(p.photo))}') ${p.focus || 'center'}/cover no-repeat; }
  .dom { position: absolute; top: 46px; left: 0; right: 0; text-align: center; font: 600 24px/1 Jost; letter-spacing: .16em; text-transform: uppercase; z-index: 3; }
  .h { position: absolute; top: 110px; left: 30px; right: 30px; text-align: center; z-index: 2; }
  .bar { display: inline-block; background: #fff; font: 800 ${p.barSize || 178}px/1 Jost; white-space: nowrap; text-transform: uppercase; letter-spacing: -.01em; padding: 16px 28px 20px; margin: 6px 0; }
  .scr { font: 400 ${p.scriptSize || 176}px/1 Sacramento, cursive; margin: -10px 0 -6px; white-space: nowrap; }
  ${p.scriptFont && SCRIPT_FONTS[p.scriptFont] ? `.scr { font: 400 ${p.scriptSize || SCRIPT_FONTS[p.scriptFont][1]}px/1.05 ${SCRIPT_FONTS[p.scriptFont][0]}, cursive; margin: 14px 0 10px; }` : ''}
  .badge { position: absolute; right: 50px; bottom: ${(p.photoH || 520) - 250}px; width: 280px; height: 280px; border-radius: 50%; background: #2b2b2b; color: #fff; display: flex; align-items: center; justify-content: center; text-align: center; font: 800 40px/1.05 Jost; text-transform: uppercase; padding: 46px; transform: rotate(-10deg); z-index: 3; }
  .arr { position: absolute; left: 260px; bottom: ${(p.photoH || 520) - 140}px; width: 360px; height: 120px; background: #fff; filter: drop-shadow(0 3px 8px rgba(0,0,0,.65)); -webkit-mask: url('${ARROW}') center/100% 100% no-repeat; mask: url('${ARROW}') center/100% 100% no-repeat; mask-mode: luminance; transform: rotate(10deg); z-index: 3; }
</style><div class="photo"></div><div class="h">${p.lines.map((l) => (l.script ? `<div class="scr">${esc(l.t)}</div>` : `<div><span class="bar">${esc(l.t)}</span></div>`)).join('')}</div>
${p.arrow === false ? "" : `<div class="arr"></div>`}<div class="badge">${esc(p.badge)}</div><div class="dom">${DOMAIN}</div>`;
};

// H: a cream graphic with a serif headline, one panel showing a video (or photo) of a person, and handwritten notes with
// hand-drawn arrows pointing into it (her Digital Priestess "Set up & monetise Pinterest in one weekend" reference,
// 2026-10-28, where the panel is a video). For a video Pin the panel is a see-through hole; video.mjs puts the clip there.
// Window: left 50, top 440, 500x960. Notes sit to its right with an arrow beside each note's first line.
export const H_WINDOW = { x: 50, y: 440, w: 500, h: 960 };
export const H = (p) => {
  const g = GROUNDS[p.ground || 'cream'], W = H_WINDOW, accent = p.accent || '#b5485f';
  const win = p.video ? '' : `background:url('${fileUrl(stockFile(p.photo))}') ${p.focus || 'center'}/cover no-repeat;`;
  // The page background is drawn as four panels around the window so the window itself stays see-through.
  const frame = `<div style="position:absolute;left:0;top:0;width:1000px;height:${W.y}px;background:${g.bg}"></div><div style="position:absolute;left:0;top:${W.y}px;width:${W.x}px;height:${1500 - W.y}px;background:${g.bg}"></div><div style="position:absolute;left:${W.x + W.w}px;top:${W.y}px;width:${1000 - W.x - W.w}px;height:${1500 - W.y}px;background:${g.bg}"></div><div style="position:absolute;left:${W.x}px;top:${W.y + W.h}px;width:${W.w}px;height:${1500 - W.y - W.h}px;background:${g.bg}"></div>`;
  const corners = `<div style="position:absolute;left:${W.x - 30}px;top:${W.y - 30}px;width:${W.w + 60}px;height:${W.h + 60}px;border-radius:64px;border:30px solid ${g.bg};z-index:1"></div>`;
  const notes = p.notes.map((n, i) => `<div class="note" style="top:${W.y + 90 + i * 300}px">${esc(n)}</div><div class="nar" style="top:${W.y + 100 + i * 300}px"></div>`).join('');
  return `<style>* { margin: 0; box-sizing: border-box; } ${FACES}
  body { width: 1000px; height: 1500px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; ${p.video ? 'background: transparent;' : `background: ${g.bg};`} color: ${g.ink}; }
  .win { position: absolute; left: ${W.x}px; top: ${W.y}px; width: ${W.w}px; height: ${W.h}px; border-radius: 34px; ${win} }
  .dom { position: absolute; top: 46px; left: 0; right: 0; text-align: center; font: 600 24px/1 Jost; letter-spacing: .16em; text-transform: uppercase; z-index: 3; }
  .h { position: absolute; top: 110px; left: 60px; right: 60px; text-align: center; z-index: 3; }
  .ser { font: 400 ${p.size || 112}px/.98 'Instrument Serif', Georgia, serif; }
  .ser em { font-style: normal; font-family: ${HL[p.hl || 'sacramento'].css}; color: ${accent}; font-size: 1.2em; }
  .note { position: absolute; left: ${W.x + W.w + 130}px; right: 30px; z-index: 3; ${hlCss(p, 44)} transform: rotate(-4deg); }
  .nar { position: absolute; left: ${W.x + W.w - 24}px; width: 140px; height: 52px; background: ${g.ink}; -webkit-mask: url('${ARROW}') center/100% 100% no-repeat; mask: url('${ARROW}') center/100% 100% no-repeat; mask-mode: luminance; transform: scaleX(-1) rotate(-14deg); z-index: 3; }
</style>${p.video ? frame : ''}<div class="win"></div>${corners}<div class="h"><div class="ser">${p.headHtml}</div></div>${notes}<div class="dom">${DOMAIN}</div>`;
};
export const LAYOUTS = { A, C, D, E, F, G, H };

// Stock photos: id -> local file in assets/stock/ (downloaded once from Pexels, credits in assets/stock/credits.json).
export const STOCK_DIR = path.join(HERE, 'assets/stock');
export const stockFile = (id) => path.join(STOCK_DIR, id + '.jpg');
export async function ensureStock(list) {
  mkdirSync(STOCK_DIR, { recursive: true });
  const credFile = path.join(STOCK_DIR, 'credits.json');
  const cred = existsSync(credFile) ? JSON.parse(readFileSync(credFile, 'utf8')) : {};
  for (const s of list) {
    if (!existsSync(stockFile(s.id))) {
      const r = await fetch(s.src + (s.src.includes('?') ? '&' : '?') + 'auto=compress&cs=tinysrgb&w=1500');
      if (!r.ok) throw new Error(`stock ${s.id}: ${r.status}`);
      writeFileSync(stockFile(s.id), Buffer.from(await r.arrayBuffer()));
      console.log('stock  ' + s.id);
    }
    cred[s.id] = { source: s.page, license: 'Pexels License (free to use, no attribution required)', picked: s.picked };
  }
  writeFileSync(credFile, JSON.stringify(cred, null, 1) + '\n');
}

// Style rotation: each list is cycled at a different pace, so neighbouring Pins never share the same mix.
const CYCLE = {
  A: { ground: ['blush', 'cream', 'oat', 'mist', 'rose', 'latte'], head: ['anton', 'dmserif', 'jost', 'instrument'], serif: ['instrument', 'dmserif', 'instrument'],
    pattern: ['dots', 'none', 'grid', 'none', 'stripes'], shape: ['circle', 'none', 'arch', 'split', 'none'], phone: ['center', 'right', 'left'],
    accentMode: ['color', 'underline'], chip: ['ink', 'accent'], chipShape: ['pill', 'tag', 'pill'], doodles: [['arrow', 'sparkle'], ['heart'], ['arrow'], ['sparkle', 'star'], ['arrow', 'heart']] },
  C: { ground: ['latte', 'cream', 'blush', 'mist', 'oat'], head: ['jost', 'dmserif', 'anton'], serif: ['instrument', 'dmserif'],
    pattern: ['grid', 'none', 'dots'], shape: ['none'], marker: ['tick', 'num', 'hand'], cards: [false, true], align: ['left', 'left', 'center'], accentMode: ['underline', 'none'], doodles: [['sparkle'], [], ['sparkle'], []] },
  D: { ground: ['navy', 'deeprose', 'espresso'], serif: ['instrument', 'dmserif'], pattern: ['none', 'dots', 'none', 'stripes'], shape: ['none', 'circle', 'arch'],
    phone: ['center', 'left', 'right'], doodles: [['sparkle'], ['arrow'], ['arrow', 'star'], ['heart']] },
};
export function styleFor(layout, n) {
  const c = CYCLE[layout], st = { phone: 'center' };
  for (const [k, list] of Object.entries(c)) st[k] = list[n % list.length];
  st.accentLine = 1; // the second headline line carries the accent
  return st;
}

// One phone capture per site path, e.g. /calculators/income-goal/ -> out/shots/calculators-income-goal.png
export const shotFile = (link) => path.join(SHOTS_DIR, (link.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home') + '.png');

// Phone captures of each linked page (cookie banner and floating buttons hidden in the capture only).
// Captured once; delete out/shots/<file>.png to refresh after the page changes.
export async function captureShots(browser, links) {
  mkdirSync(SHOTS_DIR, { recursive: true });
  for (const link of [...new Set(links)]) {
    const f = shotFile(link);
    if (existsSync(f)) continue;
    const pg = await browser.newPage();
    await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pg.goto(SITE + link, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    await pg.evaluate(() => { for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important'); });
    await pg.screenshot({ path: f });
    await pg.close();
    console.log('shot   ' + link);
  }
}

// Renders each pin ({ id, layout, style, ...fields }) to <outDir>/<id>.png and checks layout problems:
// headline running into the phone or list, a line too wide, a doodle touching text, the phone off the Pin.
export async function renderPins(browser, pins, outDir) {
  mkdirSync(outDir, { recursive: true });
  const problems = [];
  const pg = await browser.newPage();
  await pg.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });
  for (const p of pins) {
    const f = path.join(outDir, '.' + p.id + '.html');
    writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${GOOGLE}"></head><body>${LAYOUTS[p.layout](p)}</body></html>`);
    await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
    await pg.evaluate(() => document.fonts.ready);
    // Shrink the headline until every line fits the width and it ends above the phone or list.
    const issue = await pg.evaluate(() => {
      const h = document.querySelector('.h'), below = document.querySelector('.phone, ol');
      const big = h.querySelector('.big, .ser, .t');
      const fits = () => [...h.querySelectorAll('.big, .ser, .t')].every((c) => c.scrollWidth <= c.clientWidth + 2) && (!below || h.getBoundingClientRect().bottom < below.getBoundingClientRect().top - 24);
      let s = big ? parseFloat(getComputedStyle(big).fontSize) : 0;
      while (big && !fits() && s > 60) { s -= 4; big.style.fontSize = s + 'px'; }
      // Highlighted lines (and handwritten notes) never wrap or run off the Pin: shrink each until it fits (Mercedes 2026-10-28: cut-off fonts).
      for (const el of document.querySelectorAll('.bar, .scr')) { let fs = parseFloat(getComputedStyle(el).fontSize); while (el.getBoundingClientRect().width > 940 && fs > 40) { fs -= 4; el.style.fontSize = fs + 'px'; } }
      // G: the whole text block must end above the photo (110px spare: script descenders hang below the line box); shrink bars and script lines together until it does.
      const gph = document.querySelector('.photo');
      if (gph) { let k = 1; const parts = [...document.querySelectorAll('.bar, .scr')].map((e) => [e, parseFloat(getComputedStyle(e).fontSize)]);
        while (h.getBoundingClientRect().bottom > gph.getBoundingClientRect().top - 110 && k > .5) { k -= .03; parts.forEach(([e, s]) => { e.style.fontSize = s * k + 'px'; }); } }
      for (const b of document.querySelectorAll('.badge')) { let fs = parseFloat(getComputedStyle(b).fontSize); while ((b.scrollWidth > b.clientWidth || b.scrollHeight > b.clientHeight) && fs > 20) { fs -= 2; b.style.fontSize = fs + 'px'; } }
      for (const el of document.querySelectorAll('.sel, .small')) {
        const ink = el.querySelector('span') || el, card = el.closest('.h').getBoundingClientRect(), pad = el.classList.contains('small') ? 40 : 0;
        let fs = parseFloat(getComputedStyle(el).fontSize);
        while (ink.getBoundingClientRect().right > Math.min(card.right - pad, 970) && fs > 24) { fs -= 2; el.style.fontSize = fs + 'px'; }
      }
      const out = [];
      if (!fits()) out.push('headline does not fit above the ' + (below?.tagName === 'OL' ? 'list' : 'phone'));
      const ph = document.querySelector('.phone')?.getBoundingClientRect();
      if (ph && (ph.bottom > 1500 || ph.left < 0 || ph.right > 1000)) out.push('phone runs off the Pin');
      // Text = the actual lines of glyphs (not the full-width blocks), plus pills and list rows.
      const texts = [];
      for (const root of document.querySelectorAll('.h, ol, .dom')) {
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const r = document.createRange(); r.selectNodeContents(w.currentNode); texts.push(...r.getClientRects()); }
        root.querySelectorAll('.chip, .btn, li').forEach((e) => texts.push(e.getBoundingClientRect()));
      }
      for (const d of document.querySelectorAll('.dd')) {
        const r = d.getBoundingClientRect(), pad = 6;
        if (texts.some((t) => r.left < t.right - pad && r.right > t.left + pad && r.top < t.bottom - pad && r.bottom > t.top + pad)) out.push(`doodle "${d.textContent}" touches text`);
      }
      return out.join('; ');
    });
    if (issue) problems.push(`${p.id}: ${issue}`);
    // Video Pins: a see-through overlay that ffmpeg lays over the clip (see video.mjs).
    await pg.screenshot({ path: path.join(outDir, p.id + (p.video ? '.overlay' : '') + '.png'), omitBackground: !!p.video });
  }
  await pg.close();
  return problems;
}
