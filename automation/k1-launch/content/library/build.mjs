// Builds the $1K Challenge template library: one PPTX per template (imported into Canva Free by the customer),
// plus PNG previews of the template (with blue guide notes) and of a finished example (stock photos, no notes).
// One spec per template in src/ drives BOTH the PPTX and the previews, so they can't drift apart.
// Usage (from this folder): npm install, then  node build.mjs [slug ...]
import PptxGenJS from 'pptxgenjs';
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { C, F } from './src/design.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const STOCK = path.join(root, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock');
const FONTS = path.join(root, 'Scrolly Organic Engine/products/1k-club/playbook/design/fonts');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PX = 96; // px per inch in the PPTX (1080 px = 11.25 in)
const PT = 0.75; // px → pt

const only = process.argv.slice(2);
const specs = [];
// src/c04-*.mjs style files export one template; src/carousels-*.mjs / stories-*.mjs export an array of them.
for (const f of readdirSync(path.join(here, 'src')).filter((f) => /^([csr]\d\d-|carousels-|stories-).*\.mjs$/.test(f))) {
  const mod = (await import(pathToFileURL(path.join(here, 'src', f)))).default;
  for (const s of [].concat(mod)) if (!only.length || only.includes(s.slug) || only.includes(s.id)) specs.push(s);
}
const ids = specs.map((s) => s.id);
if (new Set(ids).size !== ids.length) throw new Error('duplicate template ids: ' + ids.filter((x, i) => ids.indexOf(x) !== i));

const pages = new Map(); // in-memory HTML served to the headless browser
const overflow = []; // text boxes whose words don't fit (checked on every preview)
const outDir = (s) => path.join(here, 'dist', ({ story: 'stories', reel: 'reels' }[s.kind] || 'carousels'), s.slug);
const hex = (c) => '#' + c;
const fam = (f) => ({ serif: `'${F.serif}',Georgia,serif`, sans: `'${F.sans}',Arial,sans-serif`, hand: `'${F.hand}',cursive` }[f]);

const BASE = `<meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=block"><style>
@font-face{font-family:'DM Serif Display';src:url(/fonts/dmserifdisplay-400.ttf)}
@font-face{font-family:'DM Sans';font-weight:400;src:url(/fonts/dmsans-400.ttf)}
@font-face{font-family:'DM Sans';font-weight:500;src:url(/fonts/dmsans-500.ttf)}
@font-face{font-family:'DM Sans';font-weight:700;src:url(/fonts/dmsans-700.ttf)}
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow:hidden}
.e{position:absolute}.t{display:flex;white-space:pre-wrap;overflow-wrap:break-word}
</style>`;

// ---------- placeholder images (what the customer replaces) ----------
function phHTML(w, h, label) {
  const [head, ...rest] = label.split(':');
  const fs = Math.max(30, Math.round(Math.min(w, h) * 0.05));
  // full-bleed slots: keep the label clear of the text and sticker boxes (carousel: upper area; Story: bottom band)
  // Story: bottom band. Full carousel slide: top-left, clear of the top-right note and the dark headline band.
  const just = h >= 1800 ? 'flex-end' : h >= 1400 ? 'flex-start' : 'center';
  const pad = h >= 1800 ? 'padding-bottom:90px;' : h >= 1400 ? `padding:90px 560px 0 76px;align-items:flex-start;text-align:left;` : '';
  return `<!doctype html><html><head>${BASE}<style>body{width:${w}px;height:${h}px;background:repeating-linear-gradient(135deg,#d6d1c6 0 34px,#cdc7bb 34px 68px);display:flex;flex-direction:column;align-items:center;justify-content:${just};gap:${fs * 0.6}px;text-align:center;padding:${fs * 2}px;${pad}font-family:'DM Sans';color:#4f4b44}
.i{width:${fs * 2.4}px;height:${fs * 2.4}px;border:${Math.max(4, fs / 7)}px solid #7d786e;border-radius:${fs / 2}px;position:relative}.i::after{content:'';position:absolute;left:22%;right:22%;bottom:22%;height:30%;background:#7d786e;clip-path:polygon(0 100%,35% 20%,60% 70%,75% 45%,100% 100%)}
b{font:700 ${fs * 1.1}px 'DM Sans';letter-spacing:.06em;text-transform:uppercase}p{font:500 ${fs}px/1.3 'DM Sans';max-width:${Math.round(w * 0.8)}px}
small{font:500 ${Math.round(fs * 0.72)}px 'DM Sans';opacity:.75}</style></head><body><div class="i"></div><b>${head}</b><p>${rest.join(':').trim()}</p><small>Select it → Replace, or drag yours onto it</small></body></html>`;
}

// ---------- preview renderer ----------
function elHTML(e, mode, phFile) {
  const box = `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;${e.rot ? `transform:rotate(${e.rot}deg);` : ''}`;
  if (e.t === 'img') {
    if (mode === 'ex' && e.ex) return `<div class="e" style="${box}background:url(/stock/${e.ex}.jpg) center/cover"></div>`;
    return `<img class="e" style="${box}" src="/ph/${phFile(e)}">`;
  }
  if (e.t === 'rect') {
    return `<div class="e" style="${box}${e.fill ? `background:${hex(e.fill)};` : ''}opacity:${e.alpha ?? 1};${e.line ? `border:${e.line.w}px ${e.line.dash ? 'dashed' : 'solid'} ${hex(e.line.color)};` : ''}border-radius:${e.radius || 0}px;${e.shadow ? 'box-shadow:0 12px 30px rgba(0,0,0,.22);' : ''}"></div>`;
  }
  if (e.t === 'note') {
    if (mode === 'ex') return '';
    return `<div class="e t" style="${box}background:${hex(C.guide)};color:#fff;border-radius:14px;padding:18px 22px;font:700 29px/1.3 ${fam('sans')};align-items:flex-start">${esc(e.s)}</div>`;
  }
  if (e.t === 'zone') {
    const [l1, l2, l3] = zoneLines(e);
    return `<div class="e t" style="${box}border:6px dashed ${hex(C.guide)};background:rgba(255,255,255,.9);border-radius:28px;padding:24px;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;color:#13204a"><b style="font:700 36px/1.25 ${fam('sans')}">${esc(l1)}</b><span style="font:500 28px/1.3 ${fam('sans')};color:#222">${esc(l2)}</span><b style="font:700 28px/1.3 ${fam('sans')};color:#13204a">${esc(l3)}</b><span style="font:italic 500 28px/1.3 ${fam('sans')};color:#333">${esc(e.sub)}</span></div>`;
  }
  // text
  const ai = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[e.valign];
  const jc = { left: 'flex-start', center: 'center', right: 'flex-end' }[e.align];
  const wt = e.bold ? 700 : e.f === 'hand' ? 600 : 400;
  return `<div class="e t" style="${box}align-items:${ai};justify-content:${jc};text-align:${e.align};font:${wt} ${e.size}px/${e.lh} ${fam(e.f)};color:${hex(e.color)};${e.charSpacing ? `letter-spacing:${e.charSpacing / 30}em;` : ''}${e.strike ? `text-decoration:line-through;text-decoration-color:${hex(C.hi)};text-decoration-thickness:.12em;` : ''}${e.fill ? `background:${hex(e.fill)};padding:8px 26px;` : ''}border-radius:${e.radius || 0}px;${e.shadow ? 'box-shadow:0 8px 20px rgba(0,0,0,.25);' : ''}">${esc(e.s)}</div>`;
}
// ---------- ideas attachment (US Letter PDF, 4 businesses per page) ----------
function ideasHTML(s, thumb) {
  const story = s.kind !== 'carousel';
  const card = (r) => `<div class="card"><h3>${esc(r.biz)}</h3>${r.lines.map((l, i) => `<p><span>${esc(s.ideas.roles[i])}</span>${esc(l)}</p>`).join('')}</div>`;
  const rows = s.ideas.rows;
  const chunks = [];
  for (let i = 0; i < rows.length; i += 4) chunks.push(rows.slice(i, i + 4));
  const head = `<header><div><div class="eb">Template ideas · ${esc(s.id)}</div><h1>${esc(s.name)}</h1>
<p class="sub">The same ${{ story: 'Story', reel: 'Reel series' }[s.kind] || 'carousel'} template, filled in for ${rows.length} kinds of business. Find the one closest to yours, borrow the shape of each line, and write it in your own words. These are illustrative examples: prices, dates and numbers are made up, so use your real ones.${s.kind === 'story' ? ' Post the “offer” frame only when it’s true.' : ''}</p></div>
<img class="th ${story ? 'st' : ''}" src="${thumb}" alt=""></header>`;
  return `<!doctype html><html><head>${BASE}<style>@page{size:8.5in 11in;margin:0}html,body{overflow:visible;background:#${C.paper}}
.pg{width:8.5in;height:11in;padding:44px 50px 54px;position:relative;page-break-after:always;font-family:'DM Sans';color:#${C.ink}}
header{display:flex;gap:24px;align-items:flex-start;margin-bottom:18px}header>div{flex:1}
.eb{font:700 11px 'DM Sans';letter-spacing:.14em;text-transform:uppercase;color:#5a564e}
h1{font:400 34px/1.05 'DM Serif Display';margin:6px 0 8px}.sub{font:400 12.5px/1.5 'DM Sans';max-width:470px}
.th{width:120px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.18)}.th.st{width:92px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.card{background:#fff;border-radius:12px;padding:14px 16px}
.card h3{font:400 19px/1.1 'DM Serif Display';margin:0 0 8px;padding-bottom:6px;border-bottom:3px solid #${C.hi}}
.card p{font:400 11.5px/1.4 'DM Sans';margin:0 0 7px}.card span{display:block;font:700 9px/1.3 'DM Sans';letter-spacing:.1em;text-transform:uppercase;color:#6b665c;margin-bottom:1px}
.ft{position:absolute;left:50px;right:50px;bottom:24px;display:flex;justify-content:space-between;font:700 9px 'DM Sans';letter-spacing:.12em;text-transform:uppercase;color:#6b665c}</style></head><body>
${chunks.map((c, i) => `<div class="pg">${i === 0 ? head : `<div class="eb" style="margin-bottom:14px">Template ideas · ${esc(s.id)} ${esc(s.name)} (continued)</div>`}<div class="grid">${c.map(card).join('')}</div><div class="ft"><span>The Ambition Department $1K Challenge · template ideas</span><span>${i + 1} / ${chunks.length}</span></div></div>`).join('')}
</body></html>`;
}

// Sticker placeholder wording (Mercedes, 2026-10-01).
const zoneLines = (e) => [`PLACEHOLDER: Instagram ${e.title}`, `Add the real ${e.title} in the Instagram app.`, 'Delete this before downloading from Canva.'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slidesOf = (s) => s.slides || s.frames;

// ---------- PPTX writer ----------
function addEl(pptx, slide, e, phPath) {
  const pos = { x: e.x / PX, y: e.y / PX, w: e.w / PX, h: e.h / PX, ...(e.rot ? { rotate: e.rot } : {}) };
  const shadow = { type: 'outer', color: '000000', opacity: 0.22, blur: 14, offset: 6, angle: 90 };
  if (e.t === 'img') return slide.addImage({ path: phPath(e), ...pos });
  if (e.t === 'rect') {
    return slide.addShape(e.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
      ...pos, fill: e.fill ? { color: e.fill, transparency: Math.round((1 - (e.alpha ?? 1)) * 100) } : { type: 'none' },
      line: e.line ? { color: e.line.color, width: e.line.w * PT, ...(e.line.dash ? { dashType: 'dash' } : {}) } : { type: 'none' },
      ...(e.radius ? { rectRadius: e.radius / PX } : {}), ...(e.shadow ? { shadow } : {}),
    });
  }
  if (e.t === 'note') {
    return slide.addText(e.s, { ...pos, shape: pptx.ShapeType.roundRect, rectRadius: 14 / PX, fill: { color: C.guide }, color: 'FFFFFF',
      fontFace: F.sans, fontSize: 29 * PT, bold: true, align: 'left', valign: 'top', margin: 14, lineSpacingMultiple: 1.08 });
  }
  if (e.t === 'zone') {
    const [l1, l2, l3] = zoneLines(e);
    return slide.addText([
      { text: l1, options: { bold: true, fontSize: 36 * PT, color: '13204A', breakLine: true } },
      { text: l2, options: { fontSize: 28 * PT, color: '222222', breakLine: true } },
      { text: l3, options: { bold: true, fontSize: 28 * PT, color: '13204A', breakLine: true } },
      { text: e.sub, options: { italic: true, fontSize: 28 * PT, color: '333333' } },
    ], { ...pos, shape: pptx.ShapeType.roundRect, rectRadius: 28 / PX, fill: { color: 'FFFFFF', transparency: 10 },
      line: { color: C.guide, width: 6 * PT, dashType: 'dash' }, fontFace: F.sans, align: 'center', valign: 'middle', margin: 18, paraSpaceAfter: 6 });
  }
  return slide.addText(e.s, {
    ...pos, fontFace: F[e.f], fontSize: e.size * PT, color: e.color, bold: !!e.bold, align: e.align, valign: e.valign,
    lineSpacingMultiple: +(e.lh / 1.2).toFixed(2), margin: e.fill ? [6, 20, 6, 20] : 0, fit: 'none',
    ...(e.charSpacing ? { charSpacing: e.charSpacing } : {}), ...(e.strike ? { strike: 'sngStrike' } : {}),
    ...(e.fill ? { fill: { color: e.fill }, shape: e.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, ...(e.radius ? { rectRadius: e.radius / PX } : {}) } : {}),
  });
}

// ---------- server + browser ----------
const MIME = { '.html': 'text/html', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
let phRoot = '';
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (pages.has(u)) { r.writeHead(200, { 'Content-Type': 'text/html' }); return r.end(pages.get(u)); }
  const f = u.startsWith('/fonts/') ? path.join(FONTS, u.slice(7)) : u.startsWith('/stock/') ? path.join(STOCK, u.slice(7)) : u.startsWith('/ph/') ? path.join(phRoot, u.slice(4))
    : u.startsWith('/_prev/') ? path.join(path.dirname(phRoot), 'previews', path.basename(u)) : null;
  if (!f || !existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
const page = await browser.newPage();
async function shoot(url, w, h, out) {
  await page.setViewport({ width: w, height: h });
  await page.goto(origin + url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => Promise.all(['DM Serif Display', 'DM Sans', '600 32px Caveat'].map((f) => document.fonts.load(f.includes('px') ? f : `32px "${f}"`))));
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() => ['DM Serif Display', 'DM Sans', 'Caveat'].filter((f) => !document.fonts.check(`32px "${f}"`)));
  if (missing.length) throw new Error(`fonts not loaded for ${out}: ${missing.join(', ')}`);
  // real overflow only: ignore big decorative glyphs (arrows, numbers, quote marks) whose ink pokes past the line box
  const over = await page.evaluate(() => [...document.querySelectorAll('.t')].filter((d) => {
    const fs = parseFloat(getComputedStyle(d).fontSize);
    if (d.textContent.trim().length <= 3) return false;
    return d.scrollHeight > d.clientHeight + fs * 0.25 || d.scrollWidth > d.clientWidth + 3;
  }).map((d) => d.textContent.slice(0, 50)));
  if (over.length) overflow.push(`${path.basename(path.dirname(path.dirname(out)))}/${path.basename(out)}: ${over.join(' | ')}`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
}

for (const s of specs) {
  const dir = outDir(s);
  for (const d of ['', 'assets', 'previews']) mkdirSync(path.join(dir, d), { recursive: true });
  phRoot = path.join(dir, 'assets');
  const list = slidesOf(s);

  // placeholders: one PNG per image slot
  const phName = new Map();
  let n = 0;
  for (const [i, sl] of list.entries()) for (const e of sl.els.filter((e) => e.t === 'img')) {
    const name = `placeholder-${String(i + 1).padStart(2, '0')}-${++n}.png`;
    phName.set(e, name);
    pages.set(`/_ph/${name}`, phHTML(e.w, e.h, e.ph));
    await shoot(`/_ph/${name}`, e.w, e.h, path.join(phRoot, name));
  }
  const phFile = (e) => phName.get(e);

  // previews
  for (const [i, sl] of list.entries()) for (const mode of ['tpl', 'ex']) {
    const key = `/_slide/${s.slug}-${i}-${mode}.html`;
    pages.set(key, `<!doctype html><html><head>${BASE}</head><body style="position:relative;width:${s.W}px;height:${s.H}px;background:${hex(sl.bg)}">${sl.els.map((e) => elHTML(e, mode, phFile)).join('')}</body></html>`);
    await shoot(key, s.W, s.H, path.join(dir, 'previews', `${mode === 'tpl' ? 'template' : 'example'}-${String(i + 1).padStart(2, '0')}.png`));
  }

  // PPTX (the file customers import into Canva). Guidance = blue notes on the slide, also copied into the page
  // notes. (Tested 2026-10-01: Canva keeps page notes but DROPS PowerPoint comments on import, so no comments.)
  async function makePptx() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: s.kind, width: s.W / PX, height: s.H / PX });
    pptx.layout = s.kind;
    pptx.title = `${s.id} ${s.name}`;
    for (const sl of list) {
      const slide = pptx.addSlide();
      slide.background = { color: sl.bg };
      for (const e of sl.els) addEl(pptx, slide, e, (e) => path.join(phRoot, phFile(e)));
      const tips = sl.els.filter((e) => e.t === 'note').map((e) => e.s).join('\n');
      if (tips) slide.addNotes(tips);
    }
    return pptx.write({ outputType: 'nodebuffer' });
  }
  const file = `${s.id}-${s.slug.slice(4)}-${s.kind}-template.pptx`;
  writeFileSync(path.join(dir, file), await makePptx());

  // ideas attachment (PDF): the template filled in for several kinds of business
  const ideasFile = `${s.id}-${s.slug.slice(4)}-ideas.pdf`;
  pages.set(`/_ideas/${s.slug}.html`, ideasHTML(s, `/_prev/${s.slug}/example-01.png`));
  await page.goto(`${origin}/_ideas/${s.slug}.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dir, ideasFile), printBackground: true, preferCSSPageSize: true });

  // instructions (short; the Playbook teaches strategy, this is execution)
  const md = [`# ${s.id} · ${s.name}`, '', `**What it's for:** ${s.forr}`, '', `**When to use it:** ${s.when}`, '',
    `**File:** \`${file}\` · ${s.W} × ${s.H} px (${{ story: '9:16 Story', reel: '9:16 Reel' }[s.kind] || '3:4 carousel'})`, '',
    '## Customize it', s.kind === 'reel'
      ? "1. Open the template in Canva. Change the series name once, then keep it the same every week.\n2. Page 1 is the cover: type this week's episode title and number. Keep the words in the middle, so the grid doesn't crop them.\n3. Pages 2 to 4: drag your clips onto the video placeholders and type over the words. The blue notes tell you what to write.\n4. Delete everything blue.\n5. Download page 1 as PNG (your cover). Download pages 2 to 4 as one MP4 (your Reel).\n6. In Instagram: post the MP4 as a Reel, then Edit cover → Add from camera roll → your cover PNG.\n7. Next week: duplicate the design and change only the episode title, number and clips."
      : s.kind === 'story'
      ? '1. On a computer, open canva.com and drag the file onto the page (first time only; after that it opens on your phone too).\n2. Replace each photo: select it → Replace, or drag your own photo or video onto it.\n3. Type over the words. The blue notes tell you what to write.\n4. Delete everything blue: the notes and the dashed sticker boxes.\n5. Download each frame (PNG, or MP4 if it has video).\n6. In Instagram, upload the frame, then add the real sticker where the box was.'
      : '1. On a computer, open canva.com and drag the file onto the page (first time only; after that it opens on your phone too).\n2. Type over the words. The blue notes tell you what to write.\n3. Replace each photo with your own: select it → Replace, or drag yours onto it.\n4. Change colors: click a color, then "Change all."\n5. Delete everything blue.\n6. Download as PNG and post all slides as one carousel. Put the action in your caption too.',
    '', s.caption ? `## Caption ask\n${s.caption}\n` : `## Did it do its job?\nLook at ${s.check}\n`,
    '## The same template for other businesses', `See \`${ideasFile}\`: this template filled in for ${s.ideas.rows.length} kinds of business (${s.ideas.rows.map((r) => r.biz).join(', ')}).`, '',
    `## Example\n${s.example}. See \`previews/example-*.png\`. Photos in the example are licensed stock (Unsplash/Pexels) standing in for the business's own; customers use their own photos.`, ''].join('\n');
  writeFileSync(path.join(dir, 'instructions.md'), md);
  console.log(`built ${s.id} → ${path.relative(here, dir)} (${list.length} ${s.kind === 'carousel' ? 'slides' : 'frames'})`);
}
await browser.close(); server.close();
if (overflow.length) console.log(`\nTEXT OVERFLOW (${overflow.length}) — fix copy or box:\n` + overflow.join('\n'));
else console.log('No text overflow.');
