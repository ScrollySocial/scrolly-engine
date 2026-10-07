// The five carousel styles. Each slide renders to one 1080×1440 (3:4) <section class="s">.
// A  One photo: the same photo of Mercedes on every slide, Instagram-style highlight text.
// B  Photo dump: a different photo per slide, same highlight text.
// C  Trending format: a reusable format recipe (post.format), not a fixed design.
// D  Text style 1: clean, paper-white, big black type. Placeholder until inspiration is picked.
// E  Text style 2: bold solid color block. Placeholder until inspiration is picked.
// Copy markup: *word* = emphasis (D/E/C only; ignored in highlight styles). \n = forced line break.
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { W, H, REPO, esc, fileUrl } from './common.mjs';
import { LAYOUTS, LAYOUT_CSS } from './layouts.mjs';

const rich = (s, emph = true) => esc(s).replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, emph ? '<em>$1</em>' : '$1');

// Font sizes are starting points; build.mjs shrinks to fit and fails below `min` (then the slide must be split).
export const SIZES = {
  A: { cover: 92, body: 60, min: 46 }, B: { cover: 92, body: 60, min: 46 },
  C: { cover: 68, body: 60, min: 46 },
  D: { cover: 168, body: 136, min: 72 }, E: { cover: 104, body: 78, min: 54 },
};

function nod(post, brand, isLast) {
  if (!isLast || !post.tigerNod) return '';
  const t = brand.tigerNod;
  if (post.tigerNod === 'line') return `<div class="nod line">${esc(post.tigerNodText || t.lines[0])}</div>`;
  if (post.tigerNod === 'emoji') return `<div class="nod emoji">${t.emoji}</div>`;
  if (post.tigerNod === 'image') return `<img class="nod img" src="${fileUrl(path.join(REPO, t.image))}" alt="">`;
  return '';
}

// Small 4-point stars scattered on a 360px tile, in the palette's accent color.
const starsSvg = (color) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><g fill="${color}" opacity=".55">${[[60, 40, 16], [250, 130, 12], [140, 265, 10], [318, 300, 7]].map(([x, y, r]) => `<path d="M${x} ${y - r}l${r * .3} ${r * .7} ${r * .7} ${r * .3}-${r * .7} ${r * .3}-${r * .3} ${r * .7}-${r * .3}-${r * .7}-${r * .7}-${r * .3} ${r * .7}-${r * .3}z"/>`).join('')}</g></svg>`).replace(/'/g, '%27');

// Overlays for style D/E. Holders (one per slide): note, card, polaroid. Decorations: circle, highlight, arrow, sparkle.
export const OVERLAYS = ['note', 'card', 'polaroid', 'circle', 'highlight', 'arrow', 'sparkle'];
export const PATTERNS = ['none', 'stripes', 'grid', 'stars', 'dots', 'rays'];
const svgUrl = (svg) => 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
const CLIP = svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 150"><path d="M42 30v80a17 17 0 0 1-34 0V22a12 12 0 0 1 24 0v80a5 5 0 0 1-10 0V36" fill="none" stroke="#8a8f98" stroke-width="5" stroke-linecap="round"/></svg>');
const SPARK = '<svg viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>';
const ARROW = '<svg viewBox="0 0 220 160"><path d="M12 20c60-12 140 6 170 92" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M150 96l34 22 12-40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function bg(media) {
  if (!media) return '';
  return `<div class="bg" style="background-image:url('${media.url}');background-position:${media.focus || 'center'}"></div>`;
}

export function slideHtml(post, slide, i, ctx) {
  const { brand, mediaFor } = ctx;
  const n = post.slides.length, isCover = i === 0, isLast = i === n - 1;
  const kind = isCover ? 'cover' : 'body';
  const style = post.style;
  const pos = slide.pos || (isCover ? 'center' : 'center');

  if (style === 'A' || style === 'B') {
    const m = mediaFor(style === 'A' ? (slide.media || post.media?.background) : slide.media, slide.focus);
    return `<section class="s hl-style ${kind}" data-i="${i}">${bg(m)}
      <div class="txt pos-${pos}"><p class="fit hl"><span>${rich(slide.text, false)}</span></p>${nod(post, brand, isLast)}</div></section>`;
  }

  if (style === 'C') {
    const f = post.format;
    if (f === 'notes') {
      return `<section class="s fmt-notes ${kind}" data-i="${i}">
        <div class="nbar"><span class="back">‹ Notes</span><span class="dots">•••</span></div>
        ${isCover && post.formatDate ? `<div class="ndate">${esc(post.formatDate)}</div>` : ''}
        <div class="txt"><p class="fit">${rich(slide.text)}</p>${nod(post, brand, isLast)}</div></section>`;
    }
    if (f === 'post-card') {
      const av = mediaFor(post.media?.avatar);
      return `<section class="s fmt-card ${kind}" data-i="${i}"><div class="card">
        <div class="who">${av ? `<div class="av" style="background-image:url('${av.url}');background-position:${av.focus || 'center'}"></div>` : '<div class="av blank"></div>'}
          <div><div class="nm">${esc(post.formatName || brand.handle.replace('@', ''))}</div><div class="hd">${esc(brand.handle)}</div></div></div>
        <div class="txt"><p class="fit">${rich(slide.text)}</p>${nod(post, brand, isLast)}</div>
        </div></section>`;
    }
    throw new Error(`Unknown style C format "${f}". Known: notes, post-card`);
  }

  if (style === 'D' || style === 'E') {
    const pal = brand.palettes[slide.palette || post.palette || 'warm'];
    if (!pal) throw new Error(`Unknown palette "${slide.palette || post.palette}"`);
    const vars = `--bg:${pal.bg};--ink:${pal.ink};--accent:${pal.accent};--tex:${pal.tex || pal.bg};--paper:${pal.paper};--paper-ink:${pal.paperInk};--paper-accent:${pal.paperAccent};--mark:${pal.mark};--deco:${pal.accent}`;
    const tex = slide.pattern ?? slide.texture ?? post.pattern ?? post.texture ?? 'none';
    const ov = [].concat(slide.overlay || []);
    const unknown = ov.filter((o) => !OVERLAYS.includes(o));
    if (unknown.length) throw new Error(`Unknown overlay "${unknown}". Known: ${OVERLAYS.join(', ')}`);
    const holder = ov.find((o) => ['note', 'card', 'polaroid'].includes(o));
    const photo = holder === 'polaroid' ? mediaFor(slide.media, slide.focus) : null;
    if (holder === 'polaroid' && !photo) throw new Error(`slide ${i + 1}: polaroid overlay needs slide.media`);
    const cut = style === 'D' && slide.cutout ? mediaFor(slide.cutout) : null;
    const bgImg = tex === 'stars' ? `;background-image:url('${starsSvg(pal.accent)}')` : '';
    const tilt = (i % 2 ? 1 : -1) * (slide.tilt ?? 2);
    if (slide.layout && slide.layout !== 'cover') {
      const fn = LAYOUTS[slide.layout];
      if (!fn) throw new Error(`slide ${i + 1}: unknown layout "${slide.layout}". Known: cover, ${Object.keys(LAYOUTS).join(', ')}`);
      if (slide.layout === 'pano' && slide.grid && !slide.media) {
        // Shared grid panorama across several posts' covers (data/panoramas.json).
        const g = JSON.parse(readFileSync(path.join(REPO, 'automation/carousels/data/panoramas.json'), 'utf8'))[slide.grid];
        if (!g) throw new Error(`unknown grid panorama "${slide.grid}"`);
        slide._pano = { i: Math.max(0, g.posts.indexOf(post.id)), n: g.posts.length };
        slide.media = g.media; slide.focus = slide.focus || g.focus;
      } else if (slide.layout === 'pano') {
        const panoSlides = post.slides.filter((x) => x.layout === 'pano' && !x.grid);
        slide._pano = { i: panoSlides.indexOf(slide), n: panoSlides.length };
        slide.media = slide.media || post.media?.pano;
      }
      const m = slide.media ? mediaFor(slide.media, slide.focus) : null;
      if (['photo', 'pano', 'image'].includes(slide.layout) && !m) throw new Error(`slide ${i + 1}: photo layout needs slide.media`);
      return `<section class="s blk lay lay-${slide.layout} tex-${tex} ${kind}" style="${vars}${bgImg}" data-i="${i}" data-min="48">${fn(slide, m)}${nod(post, brand, isLast)}</section>`;
    }
    const top = cut || photo;
    return `<section class="s blk blk-${style} tex-${tex} ${kind}${ov.map((o) => ' ov-' + o).join('')}" style="${vars}${bgImg};--tilt:${tilt}deg" data-i="${i}">
      ${photo ? `<div class="polaroid" style="--ptilt:${-tilt}deg"><div class="pimg" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}"></div></div>` : ''}
      <div class="txt pos-${top ? (photo ? 'bottom' : 'top') : pos}${holder && holder !== 'polaroid' ? ' holder holder-' + holder : ''}">
        ${holder === 'note' ? '<span class="tape"></span>' : ''}${holder === 'card' ? `<img class="clip" src="${CLIP}" alt="">` : ''}
        <p class="fit">${rich(slide.text)}</p>${nod(post, brand, isLast)}
        ${ov.includes('sparkle') ? `<span class="spk spk1">${SPARK}</span><span class="spk spk2">${SPARK}</span>` : ''}
      </div>
      ${ov.includes('arrow') ? `<span class="arrow">${ARROW}</span>` : ''}
      ${cut ? `<img class="cut" src="${cut.url}" alt="">` : ''}
      </section>`;
  }
  throw new Error(`Unknown style "${style}"`);
}

export function pageHtml(post, ctx) {
  const { brand } = ctx;
  const fams = [...new Set(Object.values(brand.fonts).map((f) => f.google))].map((g) => `family=${g.replace(/ /g, '+')}`).join('&');
  const font = brand.fonts.highlight.family, disp = brand.fonts.display.family;
  const sz = SIZES[post.style];
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams}&display=block">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#888;width:${W}px}
.s{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:'${font}',sans-serif;display:flex;flex-direction:column}
.s .fit{font-size:${sz.body}px}
.s.cover .fit{font-size:${sz.cover}px}

/* A / B: Instagram-style highlight text over a photo */
.hl-style{background:#222}
.bg{position:absolute;inset:0;background-size:cover}
.hl-style .txt{position:absolute;left:80px;right:80px;text-align:center;display:flex;flex-direction:column;align-items:center}
.hl-style .pos-top{top:150px}
.hl-style .pos-center{top:50%;transform:translateY(-50%)}
.hl-style .pos-bottom{bottom:170px}
.hl{font-weight:${brand.fonts.highlight.weight};line-height:1.42;color:#000}
.hl span{background:#fff;padding:.08em .32em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}

/* C: notes */
.fmt-notes{background:#fff;color:#1c1c1e;padding:0 84px}
.nbar{display:flex;justify-content:space-between;padding:70px 0 30px;color:#d4a20a;font-size:44px;font-weight:500}
.ndate{color:#8e8e93;font-size:34px;text-align:center;margin-bottom:30px}
.fmt-notes .txt{flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:120px}
.fmt-notes .fit{font-weight:500;line-height:1.35}
.fmt-notes.cover .fit{font-weight:700}

/* C: post card */
.fmt-card{background:#eef0f3;align-items:center;justify-content:center;padding:90px 70px}
.card{position:relative;background:#fff;border-radius:40px;padding:64px 64px 90px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.08);display:flex;flex-direction:column}
.who{display:flex;align-items:center;gap:26px;margin-bottom:44px}
.av{width:112px;height:112px;border-radius:50%;background-size:cover;flex:none}.av.blank{background:#d9dce1}
.nm{font-weight:700;font-size:42px;color:#0f1419}.hd{font-size:36px;color:#6b7280}
.fmt-card .fit{font-weight:500;line-height:1.38;color:#0f1419}
.fmt-card .ct{position:absolute;right:56px;bottom:40px;font-size:32px;color:#9aa0a6}

/* D / E: text-only blocks */
.blk{background:var(--bg);color:var(--ink);font-family:'${disp}',sans-serif}
.blk .txt{position:absolute;left:96px;right:96px;display:flex;flex-direction:column}
.blk .pos-left{top:50%;transform:translateY(-50%);text-align:left;align-items:flex-start}
.blk .pos-center{top:50%;transform:translateY(-50%);text-align:center;align-items:center}
.blk .pos-top{top:170px;text-align:center;align-items:center}
.blk .pos-bottom{bottom:200px;text-align:center;align-items:center}
.blk-E .fit{font-weight:800;line-height:1.08;letter-spacing:-.025em}
.blk em{font-style:normal;color:var(--accent);background:linear-gradient(transparent 62%,color-mix(in srgb,var(--accent) 22%,transparent) 0)}
.blk-E em{background:none;text-decoration:underline;text-decoration-thickness:.07em;text-underline-offset:.12em}
.blk .ct{position:absolute;top:70px;right:96px;font-size:34px;color:var(--muted);font-weight:600}
.blk .handle{position:absolute;bottom:70px;left:96px;font-size:32px;color:var(--muted);font-weight:600}
.blk-E .handle{left:0;right:0;text-align:center}
em{font-style:normal}

/* D: bold type */
.blk-D{font-family:'${brand.fonts.bold.family}',sans-serif}
.blk-D .fit{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;text-transform:uppercase;line-height:.92;letter-spacing:-.005em;text-wrap:balance}
.blk-D em{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;text-transform:none;color:var(--accent);font-size:1.12em;letter-spacing:0;line-height:.8;background:none}
.blk-D .txt{left:80px;right:80px}
.blk-D .nod.line{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-size:64px;font-weight:400;color:var(--accent);opacity:1;margin-top:40px}
.blk-D .pos-top{top:150px}
.blk-D .cut{position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:62%;width:auto;filter:drop-shadow(0 12px 24px rgba(0,0,0,.18))}
.tex-stripes{background-image:repeating-linear-gradient(0deg,var(--tex) 0 90px,transparent 90px 180px)}
.tex-grid{background-image:linear-gradient(var(--tex) 3px,transparent 3px),linear-gradient(90deg,var(--tex) 3px,transparent 3px);background-size:90px 90px}
.tex-stars{background-repeat:repeat}

/* D/E patterns */
.tex-dots{background-image:radial-gradient(var(--tex) 9px,transparent 10px);background-size:64px 64px}
.tex-rays{background-image:repeating-conic-gradient(from 0deg at 50% 50%,var(--tex) 0 6deg,transparent 6deg 18deg)}

/* D/E overlays: holders */
.holder{background:var(--paper);color:var(--paper-ink);--accent:var(--paper-accent);padding:90px 70px;rotate:var(--tilt);box-shadow:0 18px 40px rgba(60,20,0,.16)}
.blk .holder.pos-center{left:120px;right:120px}
.holder-note{border-radius:6px}
.holder-card{border-radius:28px;padding-top:110px}
.tape{position:absolute;top:-34px;left:50%;width:240px;height:68px;translate:-50% 0;rotate:calc(var(--tilt) * -2);background:color-mix(in srgb,var(--mark) 75%,transparent)}
.clip{position:absolute;top:-70px;right:90px;width:60px;rotate:8deg}
.polaroid{position:absolute;top:100px;left:50%;width:640px;padding:28px 28px 110px;background:#fff;translate:-50% 0;rotate:var(--ptilt);box-shadow:0 18px 40px rgba(60,20,0,.18)}
.pimg{width:100%;height:600px;background-size:cover}
.ov-polaroid .txt.pos-bottom{bottom:110px}
/* decorations */
.ov-circle em{display:inline-block;white-space:nowrap;padding:.3em .78em .26em;margin:-.14em -.2em;background:url("${svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 100" preserveAspectRatio="none"><path d="M40 16C80 3 168 4 194 34c18 22-6 52-70 58-48 5-104-2-116-30C-2 40 24 20 62 13c22-4 50-5 74-2" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round"/></svg>')}") center/100% 100% no-repeat}
.ov-highlight em{background:linear-gradient(transparent 72%,var(--mark) 72% 90%,transparent 90%);padding:0 .1em}
.ov-highlight .holder em{background:linear-gradient(transparent 55%,color-mix(in srgb,var(--paper-accent) 25%,transparent) 55% 92%,transparent 92%)}
.arrow{position:absolute;right:120px;bottom:150px;width:260px;color:var(--deco);rotate:150deg}
.ov-polaroid .arrow{right:40px;bottom:auto;top:620px;width:240px;rotate:190deg}
.spk{position:absolute;width:88px;color:var(--deco)}
.spk svg,.arrow svg{display:block;width:100%;height:auto}
.spk1{top:-80px;left:-50px}.spk2{bottom:-70px;right:-40px;width:58px}

${LAYOUT_CSS(brand)}
/* Tiger nod: small, last slide only */
.nod.line{margin-top:44px;font-size:40px;font-weight:600;opacity:.85}
.hl-style .nod.line{background:#fff;color:#000;padding:.1em .45em;border-radius:.3em}
.nod.emoji{margin-top:36px;font-size:72px;line-height:1}
.nod.img{margin-top:40px;width:280px;height:auto}
</style></head><body>
${post.slides.map((s, i) => slideHtml(post, s, i, ctx)).join('\n')}
</body></html>`;
}
