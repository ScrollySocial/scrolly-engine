// Local HTML previews of the two Reel Template Pack sales-page drafts (v3 type, buttons and FAQ; Halloween gets its own
// night look and the templates' real props, per Mercedes 2026-10-19: "isn't very FUN"). Never published.
// Copy source: halloween-sales-draft.md and physical-sales-draft.md (keep them in step).
// Run: node build-previews.mjs  ->  halloween-sales-preview.html, physical-sales-preview.html (images inlined, one file each)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const v3 = fs.readFileSync(path.join(here, '../../../website/scrolly-site/chrome/v3.css'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// [PLACEHOLDER] text gets a highlight so it can't be missed in review (the buyer's own "[brackets]" stay plain)
const ph = (s) => esc(s).replace(/\[(?!brackets\])([^\]]+)\]/g, '<mark class="ph">[$1]</mark>');
const img = (f) => {
  const ext = path.extname(f).slice(1);
  if (ext === 'mp4') return `data:video/mp4;base64,${fs.readFileSync(path.join(here, 'img', f)).toString('base64')}`;
  const type = { jpg: 'jpeg', png: 'png', webp: 'webp' }[ext];
  return `data:image/${type};base64,${fs.readFileSync(path.join(here, 'img', f)).toString('base64')}`;
};

const BASE = `
.draft{background:#0a1930;color:#fff;padding:20px var(--s3-gut);font:var(--s3-fs-fine)/1.5 var(--s3-sans)}
.draft b{color:var(--s3-orange)}
.draft details{margin-top:8px}
.draft summary{cursor:pointer;font-weight:700}
.draft ul{margin:10px 0 0;padding-left:1.2em}
.draft li+li{margin-top:4px}
mark.ph{background:#ffd9c9;color:var(--s3-ink);padding:0 4px;border-radius:3px}
.s3-dark mark.ph{background:#5a2412;color:#fff}
.s3-btn mark.ph{background:#fff;color:#000}
.amt{font:400 var(--s3-fs-h3)/1 var(--s3-serif)}
.audio-note{margin-top:28px;text-align:center}
.amt del{font-size:.62em;color:var(--s3-muted);margin-right:.35em}
.s3-dark .amt del{color:#a9a39b}
.buy{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;margin:32px 0 14px}
/* phones: one aligned row (Mercedes 2026-10-19); on a phone the row scrolls inside itself, never the page */
.phones{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(10px,1.6vw,24px);align-items:start}
.phone{aspect-ratio:9/16;border-radius:22px;background:#e6dfd3;border:6px solid #111;overflow:hidden;position:relative;display:flex;align-items:flex-end}
.phone img,.phone video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.phone span{position:relative;padding:12px;font:var(--s3-fs-label)/1.35 var(--s3-sans);color:#3d3a36}
.phone span b{display:block;font:400 var(--s3-fs-body)/1.2 var(--s3-serif);color:var(--s3-ink);margin-top:2px}
.cap{margin-top:12px;font:400 var(--s3-fs-body)/1.25 var(--s3-serif);text-align:center}
@media(max-width:800px){.phones{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;margin-right:calc(-1 * var(--s3-gut))}
 .phones>*{flex:0 0 58%;scroll-snap-align:start}}
/* How it works: a strip of film with the how-to video on a desktop screen (Mercedes 2026-10-19) */
.film{background:var(--s3-navy);color:#fff;position:relative;padding:calc(var(--s3-sec) + 22px) 0}
.film::before,.film::after{content:"";position:absolute;left:0;right:0;height:34px;
 background:var(--s3-navy);
 background-image:repeating-linear-gradient(90deg,transparent 0 14px,#f7f3ec 14px 34px,transparent 34px 48px);
 -webkit-mask:linear-gradient(#000 0 0) center/100% 16px no-repeat;mask:linear-gradient(#000 0 0) center/100% 16px no-repeat}
.film::before{top:10px}.film::after{bottom:10px}
.film h2{color:#fff!important;text-align:center}
.monitor{max-width:900px;margin:40px auto 0}
.screen{aspect-ratio:16/9;border:14px solid #2b2b2b;border-bottom-width:30px;border-radius:16px;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;box-shadow:0 0 0 1px #3a3a3a}
.screen .play{width:76px;height:76px;border-radius:50%;background:var(--s3-orange);display:flex;align-items:center;justify-content:center}
.screen .play::after{content:"";border-left:24px solid #000;border-top:15px solid transparent;border-bottom:15px solid transparent;margin-left:6px}
.screen p{font:var(--s3-fs-fine)/1.4 var(--s3-sans);color:#d8d3cc;max-width:30em}
.stand{width:18%;height:56px;margin:0 auto;background:linear-gradient(#3a3a3a,#262626);clip-path:polygon(22% 0,78% 0,100% 100%,0 100%)}
.base{width:34%;height:12px;margin:0 auto;border-radius:6px;background:#333}
/* steps as one line above the monitor; "see it in action" in handwriting on the screen (Mercedes 2026-10-20) */
.steps-line{list-style:none;padding:0;margin:28px 0 0;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px 18px;font:400 var(--s3-fs-h3)/1.1 var(--s3-serif);color:#fff}
.steps-line li+li::before{content:"→";color:var(--s3-sky);margin-right:18px}
.monitor{position:relative}
.see-note{position:absolute;z-index:2;right:-10px;top:-6px;display:flex;align-items:flex-end;gap:4px;font:400 2rem/1 "Covered By Your Grace",cursive;color:#fff;transform:rotate(-6deg)}
.see-note img{width:80px;transform:scaleX(-1) rotate(30deg) translateY(28px)}
@media(max-width:1000px){.see-note{right:0;top:-46px;font-size:1.6rem}}
@media(max-width:560px){.screen{border-width:8px 8px 18px}.steps-line{font-size:1.5rem}}
/* Who it's for: the peach band breaks up the page (Mercedes 2026-10-19; brand peach from the Reel covers) */
.peach{background:var(--s3-baby)}
.stick{position:relative;overflow:hidden}
.stick h2{text-align:center}
.stick .sq{display:block;width:min(300px,60vw);margin:10px auto 0}
.notes-row{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(18px,3vw,40px);margin-top:48px}
.sticky{position:relative;width:200px;aspect-ratio:400/389;background:url("${img('sticky.webp')}") center/100% 100% no-repeat;transform:rotate(var(--r));transition:transform .25s;color:var(--s3-ink)}
.sticky:hover{transform:rotate(0) scale(1.05)}
.sticky.extra{filter:hue-rotate(-28deg) saturate(1.25)}
.sticky.extra b{filter:hue-rotate(28deg)}
.plus-note{align-self:center;font:400 3.4rem/1 var(--s3-serif);color:var(--s3-orange)}
.sticky .nt{position:absolute;left:3%;top:3%;width:90%;height:90%;display:flex;align-items:center;justify-content:center;text-align:center;padding:22% 10% 10%}
.sticky .pin{position:absolute;top:7%;left:48%;width:30px;transform:translateX(-50%);filter:drop-shadow(1px 3px 2px rgba(0,0,0,.35))}
.sticky b{font:400 2.1rem/1.05 "Covered By Your Grace",cursive}
@media(min-width:1100px){.notes-row{flex-wrap:nowrap;gap:12px}.sticky{width:min(180px,12.6vw)}.sticky b{font-size:clamp(1.45rem,1.8vw,2.1rem)}.plus-note{font-size:2.6rem}}
@media(max-width:560px){.notes-row{gap:22px 10px}.sticky{width:158px}.sticky b{font-size:1.7rem}.sticky .pin{width:24px}}
details.notes{padding:40px 0}
details.notes>summary{cursor:pointer;font:700 var(--s3-fs-label)/1.4 var(--s3-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--s3-muted)}
.s3-faq{margin-top:32px}
.cta{text-align:center;position:relative;overflow:hidden}
.cta h2{margin-bottom:8px}
.cta .buy{justify-content:center}
.cta p+p{margin-top:12px}
.rc-head{text-align:center}
@media(min-width:1100px){.rc-head{white-space:nowrap;font-size:clamp(2.2rem,3.5vw,4rem)!important}}
.rc .rc-vis{justify-content:center;margin-top:64px}
.rc{padding-bottom:24px!important}
.after-rc{padding-top:40px!important}
.rc-row{display:flex;align-items:center;justify-content:space-between;gap:40px}
.rc-text{max-width:24em}
.rc-vis{display:flex;align-items:flex-start;gap:22px;flex:none}
.rc-vis .phone{width:170px;flex:none}
.slides-wrap{position:relative}
.rc-vis .slides{display:flex;gap:10px}
.rc-vis .slides img{width:204px;aspect-ratio:3/4;object-fit:cover;border-radius:4px;box-shadow:0 8px 20px rgba(0,0,0,.14)}
.ig-dots{display:flex;justify-content:center;gap:6px;margin-top:14px}
.ig-dots span{width:8px;height:8px;border-radius:50%;background:#cfc8bf}.ig-dots span.on{background:var(--s3-orange)}
.swipe-note{position:absolute;right:6px;top:-50px;display:flex;align-items:flex-end;gap:6px;font:400 1.8rem/1 "Covered By Your Grace",cursive;color:var(--s3-ink)}
.swipe-note img{width:70px;transform:translateY(16px)}
@media(max-width:1000px){.rc-row{flex-direction:column;align-items:flex-start;gap:60px}}
@media(max-width:700px){.rc-vis{gap:10px}.rc-vis .phone{width:116px}.rc-vis .slides img{width:150px}.rc-vis .slides img:nth-child(n+2){display:none}}
/* compact: text left, the phone with handwritten callouts right (Mercedes: section was too tall) */
/* Make it yours: text and the burst map sit close together; lines burst out from what you can edit on the phone */
.edits-row{display:flex;align-items:center;justify-content:center;gap:clamp(24px,4vw,64px)}
.edit-text{max-width:20em}
.burst-map{position:relative;width:680px;height:340px;flex:none}
.burst-map .rays{position:absolute;inset:0;width:100%;height:100%}
.burst-map .rays path{fill:none;stroke:var(--s3-pink);stroke-width:2.5;stroke-linecap:round;stroke-dasharray:2 7}
.burst-map .rays circle{fill:var(--s3-pink)}
.burst-map .phone{position:absolute;left:265px;top:20px;width:150px;border-color:var(--s3-ink);box-shadow:0 14px 30px rgba(10,25,48,.18)}
.burst-map .lbl{position:absolute;display:flex;align-items:center;gap:8px;white-space:nowrap;font:400 1.6rem/1 "Covered By Your Grace",cursive;color:var(--s3-ink)}
.burst-map .lbl.l{flex-direction:row-reverse}
.burst-map .lbl svg{width:28px;height:28px;flex:none;stroke:var(--s3-ink);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:1150px){.edits-row{flex-direction:column;align-items:flex-start;gap:20px}.burst-map{align-self:center}}
@media(max-width:760px){.burst-map{width:auto;height:auto;display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px}.burst-map .rays{display:none}.burst-map .phone{position:relative;left:auto;top:auto;width:140px;flex-basis:100%;max-width:140px;margin:0 auto 10px}.burst-map .lbl{position:static;font-size:1.5rem}.burst-map .lbl.l{flex-direction:row}}
.notes{border-top:1px solid var(--s3-line)}
.notes[open]>div{margin-top:24px}
.notes h2{margin-bottom:20px}
.notes h3{margin:40px 0 14px}
.notes ul{padding-left:1.3em;max-width:46em}
.notes li+li{margin-top:8px}
.notes table{width:100%;border-collapse:collapse;font-size:var(--s3-fs-fine)}
.notes th,.notes td{text-align:left;vertical-align:top;padding:10px 12px 10px 0;border-bottom:1px solid var(--s3-line)}
.notes .listing{font:var(--s3-fs-body-serif)/1.55 var(--s3-serif);max-width:40em}
@media(max-width:700px){.notes table,.notes tbody,.notes tr,.notes td,.notes th{display:block}.notes thead{display:none}.notes td{border:0;padding:4px 0}.notes tr{border-bottom:1px solid var(--s3-line);padding:10px 0}}
`;

const shell = (d, css, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap" rel="stylesheet"><style>${v3}</style><style>${BASE}${css}</style></head><body style="margin:0;background:#f7f3ec">
<div class="draft"><b>DRAFT PREVIEW.</b> Local file only, not published. Highlighted [brackets] are open decisions. The site's global header and footer are left out.
<details><summary>Open decisions (${d.decisions.length})</summary><ul>${d.decisions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details></div>
<div class="s3"><div id="main">${body}</div></div></body></html>`;

const price = (d) => `<span class="amt">${d.was ? `<del>${esc(d.was)}</del>` : ''}${ph(d.price)}</span>`;
const howItWorks = (d) => `<section class="film" id="how"><div class="s3-wrap"><h2 class="s3-h2">How it works</h2>
  <ol class="steps-line">${STEPS.map(([icon, b]) => `<li>${esc(b)}</li>`).join('')}</ol>
  <div class="monitor"><p class="see-note" aria-hidden="true">see it in action<img src="${img('arrow-curve-w.webp')}" alt=""></p><div class="screen"><div class="play" aria-hidden="true"></div><strong>Your how-to video</strong></div><div class="stand"></div><div class="base"></div></div></div></section>`;
// "Every template comes with": real sticky notes pinned on, from Trick or treat (Mercedes 2026-10-19: cards were "boring")
const ROT = [-4, 3, -2, 4, -3, 2];
// one line icon per item in "Every template comes with" (Mercedes: "can we communicate this visually?")
const INC_ICONS = [
  '<rect x="5" y="10" width="38" height="28" rx="3"/><path d="M5 17h38M5 31h38M12 10v7M20 10v7M28 10v7M36 10v7M12 31v7M20 31v7M28 31v7M36 31v7"/><path d="M21 20l7 4-7 4z"/>',
  '<rect x="10" y="7" width="28" height="36" rx="3"/><path d="M18 7v-1h12v1"/><path d="M16 18h3M23 18h11M16 26h3M23 26h11M16 34h3M23 34h11"/>',
  '<path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"/><path d="M13 19h22M13 25h14"/>',
  '<rect x="6" y="14" width="26" height="30" rx="3"/><path d="M14 14v-5a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3h-7"/><path d="M11 37l6-7 5 5 4-3 6 5"/>',
];
const includes = (d) => d.brandIncludes ? `<section class="s3-sec tight incl-b after-rc"><div class="s3-wrap">
  <ul class="swipes">${d.includes.map(([b], i) => i === d.includes.length - 1 ? `<li class="plus" aria-hidden="true">+</li><li class="extra"><svg viewBox="0 0 48 48" aria-hidden="true">${INC_ICONS[i]}</svg><span>${esc(b)}</span></li>` : `<li><svg viewBox="0 0 48 48" aria-hidden="true">${INC_ICONS[i]}</svg><span>${esc(b)}</span></li>`).join('')}</ul></div></section>` : `<section class="s3-sec stick after-rc"><div class="s3-wrap">
  <div class="notes-row">${d.includes.map(([b, x], i) => `${i === d.includes.length - 1 ? '<span class="plus-note" aria-hidden="true">+</span>' : ''}<div class="sticky${i === d.includes.length - 1 ? ' extra' : ''}" style="--r:${ROT[i]}deg"><img class="pin" src="${img('pin-blue.webp')}" alt=""><span class="nt"><b>${esc(b)}</b></span></div>`).join('')}</div>
  ${d.formatNote ? `<p style="margin-top:32px">${ph(d.formatNote)}</p>` : ''}</div></section>`;
const reelCarousel = (d) => `<section class="s3-sec tight rc"><div class="s3-wrap"><h2 class="s3-h2 rc-head">Every template comes with a Reel + carousel</h2>
  <div class="rc-vis" aria-hidden="true"><div class="phone"><img src="${img(d.rc.phone)}" alt=""></div>
  <div class="slides-wrap"><p class="swipe-note">swipe<img src="${img('arrow-curve.webp')}" alt=""></p><div class="slides">${d.rc.slides.map((f) => `<img src="${img(f)}" alt="">`).join('')}</div>
  <div class="ig-dots"><span class="on"></span><span></span><span></span><span></span><span></span></div></div></div></div></section>`;
const EDITS_OLD = [
  ['<path d="M8 40L20 8h4l12 32M12 30h20"/>', 'Every word'],
  ['<path d="M6 40h14M13 40L22 10l9 30M35 40h7M30 26h10"/>', 'Fonts'],
  ['<circle cx="24" cy="24" r="17"/><circle cx="17" cy="18" r="3"/><circle cx="29" cy="15" r="3"/><circle cx="33" cy="27" r="3"/><path d="M22 41c-3-4 1-7 5-6"/>', 'Text colours'],
  ['<path d="M24 6l4 12h12l-10 8 4 13-10-8-10 8 4-13-10-8h12z"/>', 'Doodle colours'],
  ['<rect x="6" y="8" width="36" height="32" rx="3"/><path d="M6 32l10-10 8 8 6-6 12 12"/>', 'Background'],
  ['<rect x="15" y="5" width="18" height="38" rx="4"/><path d="M21 19l8 5-8 5z"/>', 'Your clips'],
  ['<path d="M18 36V10l22-5v26"/><circle cx="13" cy="36" r="5"/><circle cx="35" cy="31" r="5"/>', 'Your audio'],
];
// label: [icon path, text, label x,y in the 680x340 stage (anchor = where the ray ends), side, origin x,y on the phone]
const EDIT_MAP = [
  ['<path d="M8 40L20 8h4l12 32M12 30h20"/>', 'Every word', 196, 40, 'l', 300, 92],
  ['<path d="M6 40h14M13 40L22 10l9 30M35 40h7M30 26h10"/>', 'Fonts', 196, 150, 'l', 296, 112],
  ['<circle cx="24" cy="24" r="17"/><circle cx="17" cy="18" r="3"/><circle cx="29" cy="15" r="3"/><circle cx="33" cy="27" r="3"/>', 'Text colours', 196, 260, 'l', 318, 104],
  ['<path d="M24 6l4 12h12l-10 8 4 13-10-8-10 8 4-13-10-8h12z"/>', 'Doodle colours', 484, 30, 'r', 368, 236],
  ['<rect x="6" y="8" width="36" height="32" rx="3"/><path d="M6 32l10-10 8 8 6-6 12 12"/>', 'Background', 484, 120, 'r', 384, 64],
  ['<rect x="15" y="5" width="18" height="38" rx="4"/><path d="M21 19l8 5-8 5z"/>', 'Your clips', 484, 210, 'r', 334, 178],
  ['<path d="M18 36V10l22-5v26"/><circle cx="13" cy="36" r="5"/><circle cx="35" cy="31" r="5"/>', 'Your audio', 484, 300, 'r', 352, 300],
];
const editSection = (d) => `<section class="s3-sec tight edits"><div class="s3-wrap edits-row"><div class="edit-text"><h2 class="s3-h2">Make it yours</h2>
  <p class="s3-lede" style="margin-top:12px">Change it all in CapCut, on your phone or computer. ${ph('[CONFIRM: phone editing, from the CapCut test]')}</p></div>
  <div class="burst-map"><svg class="rays" viewBox="0 0 680 340" aria-hidden="true">${EDIT_MAP.map(([, , x, y, side, ox, oy]) => `<path d="M${ox} ${oy} L${side === 'l' ? x + 6 : x - 6} ${y}"/><circle cx="${ox}" cy="${oy}" r="4"/>`).join('')}</svg>
  <div class="phone"><img src="${img(d.editPhone)}" alt=""></div>
  ${EDIT_MAP.map(([icon, b, x, y, side]) => `<span class="lbl ${side}" style="${side === 'l' ? `right:${680 - x}px` : `left:${x}px`};top:${y - 16}px"><svg viewBox="0 0 48 48" aria-hidden="true">${icon}</svg>${esc(b)}</span>`).join('')}</div></div></section>`;
const faq = (d) => `<section class="s3-sec"><div class="s3-read"><h2 class="s3-h2">Questions</h2><div class="s3-faq">${d.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${ph(a)}</div></details>`).join('')}</div></div></section>`;
const notes = (d) => `<details class="s3-sec notes"><summary class="s3-wrap">Review notes for Mercedes (not on the page): headlines, listing, demo footage</summary><div class="s3-wrap">
  <h3 class="s3-h3">Other headline options</h3><ul>${d.headlines.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
  <h3 class="s3-h3">Listing description</h3><p class="listing">${esc(d.listing)}</p>
  <h3 class="s3-h3">Demo footage to film</h3><p style="max-width:46em;margin-bottom:16px">${esc(d.demoNote)}</p>
  <table><thead><tr>${d.demoHead.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.demo.map((r) => `<tr>${r.map((c, i) => `<td>${i ? esc(c) : `<b>${esc(c)}</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table>
</div></details>`;

// icon, step, one short line (Mercedes: "a lot of text there", icons instead of numbers)
const STEPS = [
  ['<path d="M24 6v24M15 21l9 9 9-9"/><path d="M8 32v6a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3v-6"/>', 'Download', 'Get the template.'],
  ['<rect x="15" y="5" width="18" height="38" rx="4"/><circle cx="24" cy="37" r="1.6"/><circle cx="24" cy="19" r="5"/>', 'Film', 'Follow the shot list.'],
  ['<path d="M30 9l9 9-21 21H9v-9z"/><path d="M26 13l9 9"/>', 'Edit', 'Make it yours in CapCut.'],
  ['<path d="M42 6L20 28M42 6l-14 36-8-14-14-8z"/>', 'Post', 'Add a sound in Instagram.'],
];
const INCLUDES = (projectNote) => [
  ['A CapCut Reel template', projectNote],
  ['A shot list', 'Every clip to film, in order.'],
  ['A caption template', 'Ready to edit and post.'],
  ['A matching carousel', 'Same story as slides. Edit free in Canva.'],
];
const FAQ = (fonts) => [
  ['Can I do it all on my phone?', '[CONFIRM after the CapCut test: what needs a computer (install) and what works on a phone (edit, post)]'],
  ['How do I edit the carousel?', 'Open its Canva link (a free account works), swap the photos and type over the [brackets].'],
  ['Is music included?', 'No. The Reels have no audio: no music and no sound effects. Add a sound in Instagram after you upload, so your Reel never gets muted.'],
  ['Do I need to install fonts?', fonts],
  ['How do I change the words?', 'Double-click a text box and type.'],
  ['My computer warns me about the installer.', 'That is normal. Click More info, then Run anyway.'],
  ['Can I swap a clip?', 'Yes. Right-click it on the timeline and choose Replace.'],
  ['Do I need CapCut Pro or Canva Pro?', 'No. The templates open in free CapCut and the carousels in free Canva. [CONFIRM: no Pro features, from the CapCut test of all 25]'],
];

/* ------------------------------------------------------------------ Halloween: night look, real template props */
const HCSS = `
.night{background:#0b0a10;color:#fff;position:relative;overflow:hidden}
.night h1{color:var(--s3-orange)!important;max-width:9em;position:relative;z-index:2}
.night .s3-lede{color:#efe9e1;position:relative;z-index:2}
.night .s3-fine{color:#cfc8bf}
.night .moon{position:absolute;right:-90px;top:-70px;width:min(520px,36vw);opacity:.95;z-index:0;filter:drop-shadow(0 0 60px rgba(255,90,40,.35))}
.night .hang{position:absolute;top:0;width:clamp(56px,7vw,96px);transform-origin:50% 0;animation:swing 3.6s ease-in-out infinite;z-index:1}
.night .hang.b2{animation-delay:-1.4s;animation-duration:4.2s}
.night .fly{position:absolute;width:clamp(60px,7vw,110px);z-index:1;animation:fly 9s linear infinite}
.night .fly.f2{animation-duration:12s;animation-delay:-5s;top:46%!important;width:clamp(44px,5vw,80px)}
.spider{position:absolute;z-index:3;width:clamp(70px,8vw,120px);animation:drop 4.5s ease-in-out infinite}
.spider::before{content:"";position:absolute;left:50%;bottom:72%;width:1.5px;height:600px;background:rgba(255,255,255,.55)}
.spider img{position:relative}
@keyframes swing{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes fly{0%{transform:translate(-20vw,0) scaleX(1)}50%{transform:translate(55vw,-30px)}100%{transform:translate(120vw,10px)}}
@keyframes drop{0%,100%{transform:translateY(0)}50%{transform:translateY(26px)}}
@media(max-width:700px){.night.hero-h .moon{width:62vw;opacity:.55}}
.night h1,.night .s3-lede{text-shadow:0 2px 16px rgba(0,0,0,.7)}
@media(prefers-reduced-motion:reduce){.hang,.fly,.spider{animation:none!important}}
.hero-h{padding-top:clamp(72px,9vw,140px)}
.night>.s3-wrap{position:relative;z-index:2}
.night .phones{margin-top:clamp(40px,5vw,72px);position:relative;z-index:2}
.night .phone{border-color:#2a2733;background:#1b1922}
.night .cap{color:#efe9e1}
.tpls{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:40px clamp(16px,2vw,32px);margin-top:48px}
.tpl .phone{margin-bottom:18px}
.tpl h3{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important;margin-bottom:10px}
.tpl p+p{margin-top:10px}
.tpl .meta{color:var(--s3-muted);font-size:var(--s3-fs-fine)}
@media(max-width:1100px){.tpls{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){.tpls{grid-template-columns:1fr 1fr}}
@media(max-width:460px){.tpls{grid-template-columns:1fr}}
.reels{position:relative;overflow:hidden}.reels .s3-wrap{position:relative;z-index:1}
.dots{background:#1b1325 url("${img('dots.jpg')}") center/cover;color:#fff;position:relative;overflow:hidden}
.dots h2{color:#fff!important}.dots .s3-lede{color:#f1ecf6}.dots .tpl h3{color:#fff!important}.dots .tpl p{color:#ece6f2}
.dots .s3-wrap{position:relative;z-index:1}
.dots .phone{border-color:#120d1a}
.dd{position:absolute;z-index:0;pointer-events:none}
@media(max-width:1199px){.dd{display:none}}
.dd.crown{width:90px;top:18px;right:3%;transform:rotate(12deg)}
.dots h2,.dots .s3-lede,.dots .tpl{text-shadow:0 2px 10px rgba(10,5,20,.9)}
.dd.burst{width:120px;top:46%;left:2%;transform:rotate(-10deg)}
.dd.heart{width:90px;bottom:40px;right:4%;transform:rotate(-8deg)}
.who-h{position:relative;overflow:hidden;background:#2b1f3f;color:#fff;padding-top:calc(var(--s3-sec) + min(230px,36vw))}
.who-h h2{color:#fff!important}.who-h .s3-lede{color:#f1ecf6}
.who-h .branch{position:absolute;top:8px;right:-40px;width:min(560px,70vw)}
.who-h .hang{position:absolute;width:clamp(48px,5vw,70px);transform-origin:50% 0;animation:swing 3.8s ease-in-out infinite}
.who-h .hang.h1{top:min(118px,19vw);right:min(330px,40vw)}.who-h .hang.h2{top:min(128px,21vw);right:min(170px,22vw);animation-delay:-1.6s}
.who-h .s3-wrap{position:relative;z-index:1}
.who-h .branch,.who-h .hang{z-index:0}

.tickets{display:flex;flex-wrap:wrap;gap:14px 18px;margin-top:28px}
.ticket{display:inline-flex;align-items:center;justify-content:center;width:200px;height:86px;padding:0 30px 0 18px;background:url("${img('ticket.webp')}") center/contain no-repeat;transform:rotate(var(--r));font:400 1.3rem/1.1 var(--s3-serif);color:var(--s3-ink);text-align:center}
@media(max-width:560px){.tickets{gap:10px 6px}.ticket{width:150px;height:66px;padding:0 22px 0 12px;font-size:1.05rem}}
.faq-h .s3-split{align-items:start}
.faq-h h2{color:var(--s3-orange)!important}
.faq-h .s3-faq summary{color:#fff}
.faq-h .s3-faq details>div{color:#e6e0d8}
.faq-h .s3-faq details{border-color:rgba(255,255,255,.18)!important}
.faq-h .s3-faq summary:focus-visible{outline-color:#fff}
.faq-h .s3-wrap{position:relative;z-index:1}
.wolfmoon{position:absolute;left:calc(var(--s3-gut) - 40px);bottom:0;width:480px;height:470px;z-index:0;pointer-events:none}
.wolfmoon .m{position:absolute;width:440px;left:20px;top:0;opacity:.95;filter:drop-shadow(0 0 40px rgba(255,90,40,.35))}
.wolfmoon .w{position:absolute;width:240px;left:110px;bottom:-4px}
@media(max-width:900px){.faq-h{padding-bottom:340px}.wolfmoon{left:50%;transform:translateX(-50%);width:320px;height:320px}.wolfmoon .m{width:300px;left:10px}.wolfmoon .w{width:170px;left:80px}}
.cta.night .moon{right:auto;left:50%;top:auto;bottom:-260px;transform:translateX(-50%);width:520px;opacity:.5}
.cta.night h2{color:#fff!important;position:relative;z-index:2}
.cta.night .s3-read{position:relative;z-index:2}
.cta.peach .s3-read{position:relative;z-index:1}.cta.peach .s3-fine{color:#2b2a28}.cta.peach .amt del{color:#5c4a3e}
`;

function halloweenPage(d) {
  const ph5 = d.templates.map((t) => `<div><div class="phone"><img src="${img(t.poster)}" alt="${esc(t.name)}: a frame from the template"></div><p class="cap">${esc(t.name)}</p></div>`).join('');
  const tpls = d.templates.map((t) => `<div class="tpl"><div class="phone"><img src="${img(t.poster)}" alt=""></div>
    <h3>${esc(t.name)}</h3><p>${ph(t.job)}</p></div>`).join('');
  const body = `
<section class="night s3-sec hero-h"><img class="moon" src="${img('moon.webp')}" alt="">
  <img class="hang" src="${img('bat.png')}" alt="" style="left:44%"><img class="hang b2" src="${img('bat.png')}" alt="" style="left:58%;width:clamp(44px,5vw,72px)">
  <img class="fly" src="${img('batfly.png')}" alt="" style="top:18%;left:0"><img class="fly f2" src="${img('batfly.png')}" alt="" style="left:0">
  <div class="spider" style="right:clamp(60px,15vw,210px);top:-10px"><img src="${img('spider.png')}" alt=""></div>
  <div class="s3-wrap">
    <h1 class="s3-display">${esc(d.headline)}</h1>
    <p class="s3-lede" style="margin-top:28px">${esc(d.sub)}</p>
    <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
    <p class="s3-fine">${ph(d.priceLine)}</p>
    <div class="phones">${ph5}</div>
  </div></section>
<section class="s3-sec reels"><img class="dd crown" src="${img('crown.webp')}" alt=""><img class="dd burst" src="${img('burst.webp')}" alt=""><img class="dd heart" src="${img('heart.webp')}" alt=""><div class="s3-wrap">
  <h2 class="s3-h2">${esc(d.getTitle)}</h2><p class="s3-lede" style="margin-top:20px">${esc(d.getLede)}</p>
  <div class="tpls">${tpls}</div></div></section>
${reelCarousel(d)}
${includes(d)}
${editSection(d)}
${howItWorks(d)}
<section class="s3-sec who-h"><img class="branch" src="${img('branch.webp')}" alt=""><img class="hang h1" src="${img('bat.png')}" alt=""><img class="hang h2 b2" src="${img('bat.png')}" alt="">
  <div class="s3-wrap s3-split"><h2 class="s3-h2">Who it's for</h2><div><p class="s3-lede">${esc(d.who)}</p>
  <div class="tickets">${d.whoTags.map((t, i) => `<span class="ticket" style="--r:${ROT[i]}deg">${esc(t)}</span>`).join('')}</div></div></div></section>
<section class="s3-sec night faq-h"><div class="wolfmoon"><img class="m" src="${img('moon.webp')}" alt=""><img class="w" src="${img('wolf.webp')}" alt=""></div><div class="s3-wrap s3-split"><div class="howl"><h2 class="s3-h2">Questions</h2></div>
  <div class="s3-faq">${d.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${ph(a)}</div></details>`).join('')}</div></div></section>
<section class="s3-sec peach cta" id="buy"><img class="dd burst" src="${img('burst.webp')}" alt=""><img class="dd heart" src="${img('heart.webp')}" alt="">
  <div class="s3-read"><h2 class="s3-h2">${esc(d.ctaHead)}</h2>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.ctaLine)}</p>
  <p class="s3-fine">${ph('[REEL EDITOR UPSELL: one line once it has a name, link and launch date]')}</p></div></section>
${notes(d)}`;
  return shell(d, HCSS, body);
}

/* ------------------------------------------------------------------ Physical (Mercedes 2026-10-19, round 3): Scrolly colours (v3 cream, ink,
   black, orange, peach) with the pink Who it's for and label-maker tags she likes; the 25 Reels scroll sideways; no box,
   peanuts or kitchen timer (she offered to supply better images). Plain backgrounds behind text, props never cover words. */
const PCSS = `
.incl-b{text-align:center}
.incl-b h2{margin-bottom:32px}
.swipes{list-style:none;padding:0;margin:0 auto;max-width:1200px;display:flex;flex-wrap:wrap;justify-content:center;gap:28px 40px}
.swipes li{display:flex;flex-direction:column;align-items:center;gap:14px}
.swipes svg{width:64px;height:64px;stroke:var(--s3-ink);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.swipes li{font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
/* six items on one line on a computer: size and gaps scale with the screen */
@media(min-width:1100px){.swipes{flex-wrap:nowrap;justify-content:space-between;max-width:none;gap:clamp(14px,1.8vw,36px)}.swipes li{white-space:nowrap;font-size:clamp(1.15rem,1.7vw,1.75rem)}}
.swipes span{position:relative;z-index:0;padding:0 .14em}
.swipes .plus{align-self:center;font:400 clamp(2.4rem,3.4vw,3.6rem)/1 var(--s3-serif);color:var(--s3-orange);margin-top:44px}
.swipes .extra span{background:var(--s3-lav);color:var(--s3-ink);border-radius:999px;padding:.12em .7em .18em}
.swipes .extra span::before{display:none}
.swipes span::before{content:"";position:absolute;z-index:-1;left:0;right:0;top:.55em;bottom:.04em;background:var(--s3-pink);opacity:.9;border-radius:.1em .35em .15em .4em;transform:rotate(-1.5deg)}
.incl-b .aside{margin-top:30px;font:400 1.9rem/1.1 "Covered By Your Grace",cursive;color:var(--s3-ink);transform:rotate(-2deg)}
.hero-p{padding-top:clamp(56px,7vw,110px);position:relative;overflow:hidden}
/* headline: "Your month's content:" on one line, DONE in handwriting (Mercedes 2026-10-19) */
.head-p .l1{display:block;white-space:nowrap;font-size:clamp(2rem,6.2vw,6.4rem)}
.head-p .done{font-style:italic!important;display:inline-block;position:relative;z-index:0;color:var(--s3-ink);font-size:clamp(4rem,9vw,9rem);letter-spacing:-.04em;margin-top:6px;padding:0 .12em}
.head-p .done::before{content:"";position:absolute;z-index:-1;left:-.06em;right:-.1em;top:.5em;bottom:.06em;background:var(--s3-pink);border-radius:.12em .4em .2em .5em;transform:rotate(-2deg)}
.hero-p .s3-wrap{position:relative;z-index:2}
.hero-p .s3-fine{max-width:620px}
.prop{position:absolute;pointer-events:none;z-index:1}
.hero-p .tri{right:5%;bottom:-6px;width:clamp(200px,20vw,300px);transform:rotate(-4deg)}
.hero-p .burst-h{right:calc(5% - 90px);top:50%;width:clamp(380px,36vw,560px);transform:translateY(-58%) rotate(8deg);opacity:.9}
@media(max-width:1299px){.hero-p .tri,.hero-p .burst-h{display:none}}
.hero-p .seal{width:64px;transform:rotate(-10deg)}
.reels-p{background:var(--s3-navy);color:#fff}
.reels-p h2{color:#fff!important}.reels-p .s3-lede{color:#e6e0d8}
.row-wrap{position:relative}
.arrow{position:absolute;z-index:3;top:calc(28px + clamp(160px,12.5vw,200px) * .89 - 30px);width:60px;height:60px;border-radius:50%;border:0;background:var(--s3-orange);color:#000;font:700 1.6rem/1 var(--s3-sans);cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.arrow.prev{left:calc(-1 * var(--s3-gut) + 12px)}.arrow.next{right:calc(-1 * var(--s3-gut) + 12px)}
.arrow:hover{background:#fff}
.arrow:focus-visible{outline:3px solid #fff;outline-offset:3px}
/* the 25 Reels scroll sideways (Mercedes: "a scrolling section, not rows and rows") */
.scroller{display:flex;gap:clamp(14px,1.6vw,24px);overflow-x:auto;scroll-snap-type:x mandatory;margin:28px calc(-1 * var(--s3-gut)) 0;padding:0 var(--s3-gut) 8px;scroll-padding:0 var(--s3-gut);scrollbar-width:none}
/* no scrollbar: the arrows (desktop) and swipe (phone) move the row (Mercedes 2026-10-20) */
.scroller::-webkit-scrollbar{display:none}
/* a phone only partly on screen is dimmed */
.rg{transition:opacity .25s}.rg.partial{opacity:.35}
.rg{flex:0 0 clamp(160px,12.5vw,200px);scroll-snap-align:start}
.rg .phone{margin-bottom:16px;border-color:#2a2a2a}
.rg .num .in{color:#fff;margin-left:8px}.rg .num .soon{color:#a9a39b;margin-left:8px}
.rg .num{font:700 var(--s3-fs-label)/1 var(--s3-sans);letter-spacing:.14em;color:var(--s3-orange);margin-bottom:12px}
.rg h3{font:400  1.25rem/1.1 var(--s3-serif)!important;color:#fff!important;margin-bottom:6px}
.rg p{color:#e6e0d8}
.rg p+p{margin-top:6px}
.rg .ex{font-size:var(--s3-fs-fine);color:#cfc8bf}
.rg .ex b{font-weight:700;color:#fff}
@media(max-width:700px){.rg{flex-basis:62vw}.arrow{display:none}}
.pink{background:#f9c9df}
.labels{display:flex;flex-wrap:wrap;gap:16px 18px;margin-top:28px}
.dymo{display:inline-flex;align-items:center;height:46px;padding:0 22px;background:#111 url("${img('labeltape.webp')}") center/100% 100%;color:#fff;font:700 var(--s3-fs-ui)/1 "Courier New",monospace;letter-spacing:.14em;text-transform:uppercase;transform:rotate(var(--r));border-radius:3px}
.faq-p h2{color:var(--s3-ink)!important}
/* questions in two columns (Mercedes: "make this 2 columns to compact it") */
.faq-p .two{display:grid;grid-template-columns:1fr 1fr;column-gap:56px;align-items:start}
.faq-p .two details{border-top:0;border-bottom:1px solid var(--s3-line)}
.faq-p .two details:nth-child(-n+2){border-top:1px solid var(--s3-line)}
@media(max-width:800px){.faq-p .two{grid-template-columns:1fr}.faq-p .two details:nth-child(2){border-top:0}}
/* compact: two lines of content get one short band (Mercedes: "look how tall this section is") */
.who-row{display:flex;align-items:center;justify-content:space-between;gap:32px}
.fan{position:relative;flex:none;width:400px;height:330px}
.fan-burst{position:absolute;z-index:0;width:360px;left:20px;top:-10px;opacity:.85;transform:rotate(-8deg)}
.fan-spark{position:absolute;z-index:3;width:44px}.fan-spark.s1{left:-18px;top:30px}.fan-spark.s2{right:-12px;bottom:40px;width:34px}
.fan .phone{z-index:1}
.fan .phone{position:absolute;bottom:0;width:150px;border-color:#111;box-shadow:0 14px 30px rgba(80,30,10,.25);background:#f7f3ec}
.fan .todo{position:relative;padding:12px;font:var(--s3-fs-label)/1.3 var(--s3-sans);color:#5c4a3e}
.fan .todo b{display:block;margin-top:4px;font:400 1.05rem/1.2 var(--s3-serif);color:var(--s3-ink)}
.fan .phone:nth-child(1){left:0;transform:rotate(-9deg)}
.fan .phone:nth-child(2){left:125px;bottom:22px;z-index:2}
.fan .phone:nth-child(3){left:250px;transform:rotate(9deg)}
@media(max-width:900px){.who-row{flex-direction:column;align-items:flex-start}.fan{width:330px;height:270px;margin-top:8px}.fan .phone{width:124px}.fan .phone:nth-child(2){left:103px}.fan .phone:nth-child(3){left:206px}}
.cta-p{text-align:center;position:relative;overflow:hidden}
.cta-card{background:var(--s3-lav);border-radius:20px;padding:clamp(32px,4vw,56px) 24px}
.cta-p h2{margin-bottom:8px}
.cta-p .buy{justify-content:center}
.cta-p .s3-fine{color:#2b2a28}
.cta-p h2{color:var(--s3-or-text)!important}
@media(min-width:1100px){.cta-p h2{white-space:nowrap}}
.cta-p .s3-read{position:relative;z-index:1}
.cta-p .seal2{right:8%;top:50%;width:130px;transform:translateY(-50%) rotate(12deg)}
@media(max-width:1199px){.cta-p .seal2{display:none}}
`;

// arrow buttons scroll the row by about three phones (no "&" anywhere: WordPress mangles it in page scripts)
const SCROLL_JS = `(function(){var row=document.getElementById('reel-row');if(!row||!window.IntersectionObserver)return;var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('partial',e.intersectionRatio<0.97)})},{root:row,threshold:[0,0.5,0.97,1]});row.querySelectorAll('.rg').forEach(function(c){io.observe(c)})})();function placeArrows(){var ph=document.querySelector('#reel-row .phone');if(!ph)return;var y=ph.offsetTop+ph.offsetHeight/2-30;document.querySelectorAll('.arrow').forEach(function(a){a.style.top=y+'px'})}placeArrows();window.addEventListener('resize',placeArrows);window.addEventListener('load',placeArrows);document.querySelectorAll('[data-scroll]').forEach(function(b){b.addEventListener('click',function(){var s=document.getElementById('reel-row');s.scrollBy({left:Number(b.dataset.scroll)*s.clientWidth*0.8,behavior:'smooth'})})})`;

function physicalPage(d) {
  // all 25 as phone previews in one sideways-scrolling row
  const list = d.templates.map((t, i) => `<div class="rg"><p class="num">${i + 1} of 25${d.launchNow ? (d.launchNow.includes(i + 1) ? ' <span class="in">In today</span>' : ' <span class="soon">Arriving soon</span>') : ''}</p><div class="phone"><img src="${img(`p${String(i + 1).padStart(2, '0')}.jpg`)}" alt="${esc(t.name)}: a frame from the template" loading="lazy"></div>
    <h3>${esc(t.name)}</h3></div>`).join('');
  const body = `
<section class="s3-sec hero-p"><img class="prop burst-h" src="${img('burst-baby.webp')}" alt=""><img class="prop tri" src="${img('tripod.webp')}" alt=""><div class="s3-wrap">
  <h1 class="s3-display or head-p"><span class="l1">${esc(d.headline.split(': ')[0])}:</span> <span class="done">${esc(d.headline.split(': ')[1])}</span></h1>
  <p class="s3-lede" style="margin-top:28px">${esc(d.sub)}</p>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.priceLine)}</p>
</div></section>
<section class="s3-sec tight reels-p"><div class="s3-wrap">
  <h2 class="s3-h2">${esc(d.getTitle)}</h2>
  <div class="row-wrap"><button type="button" class="arrow prev" data-scroll="-1" aria-label="Scroll back">&#8592;</button>
  <div class="scroller" id="reel-row" tabindex="0" aria-label="All 25 Reel templates">${list}</div>
  <button type="button" class="arrow next" data-scroll="1" aria-label="Scroll forward">&#8594;</button></div></div></section>
${reelCarousel(d)}
${includes(d)}
${editSection(d)}
${howItWorks(d)}
<section class="s3-sec tight peach who-p"><div class="s3-wrap who-row"><div class="who-text"><h2 class="s3-h2">Who it's for</h2><p class="s3-lede" style="margin-top:14px">${esc(d.who)}</p>
  <div class="labels">${d.whoTags.map((t, i) => `<span class="dymo" style="--r:${[-2, 1.5, -1, 2][i % 4]}deg">${esc(t)}</span>`).join('')}</div></div><div class="fan"><img class="fan-burst" src="${img('burst-hot.webp')}" alt=""><img class="fan-spark s1" src="${img('spark-w.webp')}" alt=""><img class="fan-spark s2" src="${img('spark-w.webp')}" alt="">${d.whoPhotos.map(([f, label]) => `<div class="phone">${fs.existsSync(path.join(here, 'img', f)) ? (f.endsWith('.mp4') ? `<video src="${img(f)}" autoplay muted loop playsinline aria-label="${esc(label)}"></video>` : `<img src="${img(f)}" alt="${esc(label)}">`) : `<span class="todo">Photo to make:<b>${esc(label)}</b></span>`}</div>`).join('')}</div></div></section>
<section class="s3-sec tight faq-p"><div class="s3-wrap"><h2 class="s3-h2">Questions</h2>
  <div class="s3-faq two">${d.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${ph(a)}</div></details>`).join('')}</div></div></section>
<section class="s3-sec cta-p" id="buy"><div class="s3-wrap cta-card">
  <h2 class="s3-h2">${esc(d.ctaHead)}</h2>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.ctaLine)}</p>
  <p class="s3-fine">${ph('[REEL EDITOR UPSELL: one line once it has a name, link and launch date]')}</p></div></section>
${notes(d)}
<script>${SCROLL_JS}</script>`;
  return shell(d, PCSS, body);
}

const halloween = {
  file: 'halloween-sales-preview.html',
  title: 'Halloween Reels draft',
  headline: 'Cute Halloween Reels that sell',
  headlines: ['Halloween Reels with a selling job', 'Five Halloween Reels. Your clips, your words, posted before the 31st.', 'Bats, webs and a blood moon, all working for your sales', 'Spooky-cute Reels for your October sale'],
  sub: 'Five ready-made Reels for October. Add your clips and post.',
  was: '$9.99', price: '$4.99',
  button: 'Get all 5 Reels',
  priceLine: 'Instant download.',
  ctaLine: 'Instant download.',
  getTitle: 'Five Reels, five jobs',
  getLede: 'Each one sells something.',
  includes: INCLUDES('Real props and motion, built in.'),
  templates: [
    { name: 'Once in a blood moon', poster: 'h6.jpg', job: 'Open a once-a-year sale.', film: '3 clips: your product, you or your shop, your product again', len: 14 },
    { name: 'Caught in our web', poster: 'h3.jpg', job: "Show what's included.", film: '5 clips: your product held up, then four points', len: 15 },
    { name: "Things I'm batty about", poster: 'h2.jpg', job: 'Share your favourites.', film: '4 clips: an opening, then three favourites', len: 15 },
    { name: 'Trick or treat', poster: 'h5.jpg', job: 'A mistake, then your offer.', film: '3 clips: the mistake, your product, the proof', len: 17.5 },
    { name: 'Now you see it', poster: 'h1.jpg', job: "Last chance before it's gone.", film: 'you with your product, the same shot without it, then your product', len: 14 },
  ],
  whoTags: ['Product shops', 'Digital products', 'Services', 'Creators'],
  editPhone: 'h2.jpg',
  rc: { phone: 'h6.jpg', slides: ['ch6-2.jpg', 'ch6-4.jpg', 'ch6-6.jpg'] },
  who: 'Anyone with something to sell this October.',
  faq: FAQ('No, they come with the template.'),
  ctaHead: 'Post your Halloween Reel before the 31st',
  listing: "Five cute Halloween Reel templates for CapCut, each with a selling job: open a once-a-year sale, show what's included, share your favourites, turn a common mistake into your offer, or announce a last chance. Film a few clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Each template comes with a shot list, a recipe card, a one-page guide, a phone kit and a matching Instagram carousel you can edit free in Canva. Each one suggests a sound to add in Instagram (no sound files included).",
  decisions: [
    'Price: $4.99, shown with $9.99 crossed out (decided 2026-10-19).',
    'Instant download, so Now you see it (h1) must be built and zipped before the page goes live.',
    'Carousels (2026-10-20): Canva links for h2, h3, h5, h6. h1 needs its carousel too, since "Every template comes with" lists it.',
    'Now you see it (h1): motion test only. It needs the CapCut build and zip before the page goes live.',
    'Sound picks: none chosen for Halloween yet.', 'Reel Editor upsell: no name, link or launch yet.',
    'Mac: Mercedes is testing. The installer is a Windows script; the page names no platform until the test is done.',
    'Before live: check h2 and h5 in CapCut and the highlight boxes, then install one zip on a second computer.',
    'Phone frames show real frames from the templates (graphics only). Swap in your demo videos when they are filmed.',
  ],
  demoNote: "One finished demo Reel per template, made from your own clips run through the real installer. Never the after.mp4 previews (they show other brands' products). Use your own product throughout, for example a Scrolly tee or the Business Brain on your laptop screen. Also film the how-to video for the How it works section.",
  demoHead: ['Template', 'Clips to film', "You'll also need"],
  demo: [
    ['Once in a blood moon', 'Your product close up (4 s+), you or your workspace (5 s+), your product again (3 s+)', 'Your sale'],
    ['Caught in our web', 'Your product held up (15 s+), then four things it includes or does (12, 10, 8, 6 s+)', 'Four features'],
    ["Things I'm batty about", 'An opening shot (3 s+), then three favourite products or tools (4 s+ each)', 'Three favourites'],
    ['Trick or treat', 'The trick: a common mistake acted out (5 s+), the treat: your product (6 s+), the proof: it working (6 s+)', 'A mistake and your offer'],
    ['Now you see it', 'You with your product, then the same shot without it (from the final shot list once built), then your product', 'Your last-chance offer'],
  ],
};

const T = (name, job, soap, tee) => ({ name, job, soap, tee });
const physical = {
  file: 'physical-sales-preview.html',
  title: 'Product Reels draft',
  headline: "Your month's content: DONE",
  headlines: ['Reels for the things you make, pack and ship', '25 Reels your product can star in', 'Film a few clips. Drop them in. Post a Reel that sells.', 'Collage Reels for physical products, ready for your clips'],
  sub: 'A growing pack of 25 Reels for your product. Add your clips and post.',
  price: '$17.99',
  button: 'Get all 25 Reels',
  priceLine: '[N] templates in your download today, about 5 more every day until all 25 are in. [DATE WORDING: your OK]',
  ctaLine: '[N] in today, the rest arrive as updates. [DATE WORDING: your OK]',
  whoTags: ['Print on demand', 'Makers', 'Etsy sellers', 'Shopify stores', 'Small-batch brands', 'Boutiques'],
  whoPhotos: [['who-maker.mp4', 'A maker pouring candles'], ['who-pod.mp4', 'Screen printing a design'], ['who-shop.mp4', 'A shop owner packing an order']],
  brandIncludes: true,
  editPhone: 'p23.jpg',
  rc: { phone: 'p09.jpg', slides: ['c09-2.jpg', 'c09-3.jpg', 'c09-6.jpg'] },
  // the templates in the download on launch day, e.g. [8, 9, 10, 12, 20]; null = not picked yet (shows [N])
  launchNow: null,
  getTitle: 'All 25 Reels',
  getLede: 'Swipe to see all 25. [N] are in today; the rest arrive as updates.',
  includes: INCLUDES('Real props, collage and motion, built in.'),
  formatNote: '',
  templates: [
    T('One product, three ways', 'Show three uses for one product.', 'one bar for hands, face and shaving', 'one tee tucked, knotted and layered'),
    T('Pack an order with me', 'The packing video people love to watch.', 'packing a three-bar gift box', 'packing a tee order with a thank-you note'),
    T('Before and after', 'Show the change your product makes.', 'muddy garden hands, then clean', 'a blank tee, then the finished print'),
    T('A or B?', 'Let people pick between two versions.', 'lavender or eucalyptus?', 'sand or black?'),
    T("Details you'd miss in a photo", 'Close-ups that photos flatten.', 'the swirl, the cut edge, the stamp', 'the stitching, the tag, the print up close'),
    T('Start to finish', 'The making of one product, step by step.', 'from the pour to the cured bar', 'from the blank tee to the pressed print'),
    T('How big is it really?', 'Show the real size next to everyday things.', 'a bar next to a phone and in a hand', 'the same tee from S to XL'),
    T('A real customer question', 'Answer the question you keep getting, by showing it.', '"Will it dry out my skin?"', '"Does the print crack in the wash?"'),
    T("Who it's for", 'Call out your buyer so they see themselves in it.', 'for the gardener with muddy hands', 'for the coffee-before-talking crowd'),
    T('Three people to gift it to', 'A ready-made gift guide.', 'your sister, your teacher, your host', 'your dad, your best friend, your coworker'),
    T('A day with it', 'Morning to night with your product.', 'morning shower to evening hand wash', 'school run to dinner out'),
    T('Your order just arrived', 'The unboxing your customer gets.', 'the paper-wrapped box at the door', 'the mailer and the folded tee'),
    T('How to use it in 3 steps', 'A quick how-to.', 'wet, lather, rinse with a shampoo bar', 'how to wash it so the print lasts'),
    T('The annoying moment', 'The everyday annoyance your product fixes.', 'when the bar turns to mush in the dish', 'when the collar stretches after one wash'),
    T('New drop reveal', 'Launch a new product or a restock.', 'the new pumpkin spice bar', 'the new fall design'),
    T('What it feels like', 'Texture people want to touch through the screen.', 'creamy, smooth, rich', 'soft, heavy, cozy'),
    T('Everything that goes into one', 'Every material that makes one product.', 'oils, clay, scent, wrap', 'blank, ink, screen, press'),
    T('Check this before you buy', 'Three helpful checks for your category.', 'three things to check on a soap label', 'weight, seams and print on a tee'),
    T('Pair it with', 'Bundles and add-ons.', 'bar, dish and scrubber', 'tee, cap and tote'),
    T('What buyers said', 'Your reviews on screen, word for word.', 'three soap reviews', 'three tee reviews'),
    T('Small batch', "This week's batch, counted.", "this week's batch of bars, cut and stacked", "this week's run of hand-pressed tees"),
    T('Put it to the test', 'Prove a claim you make, in one uncut take.', 'does it really lather in cold water?', 'does it really survive 50 washes?'),
    T('Every option in 10 seconds', 'Every colour, scent, size or design, fast.', 'every scent', 'every colour'),
    T('Make it last', 'One care habit that keeps it looking good.', 'keep your bar dry between uses', 'wash it inside out'),
    T('Mine vs the usual kind', 'Show how yours is made differently.', 'a handmade bar next to a store bar', 'a heavyweight tee next to a thin one'),
  ],
  who: 'If you sell a product you can film, these are for you.',
  faq: [['When do I get all 25?', '[N] are in your download today. About 5 more are added every day until all 25 are in. [DATE WORDING + how buyers get each update: your OK]'], ...FAQ('No, they come with the template.')],
  ctaHead: 'A month of Reels, ready for your clips',
  listing: "25 Reel templates for CapCut, made for shops that sell physical products: packing videos, before and afters, gift guides, unboxings, reviews, tests, new drops and more. Film a few clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Each template comes with a shot list, a recipe card, a one-page guide, a phone kit and a matching Instagram carousel you can edit free in Canva. Each one suggests a sound to add in Instagram (no sound files included).",
  decisions: [
    'Price: $17.99 (decided 2026-10-19).',
    'Carousels (2026-10-20): Canva links exist for 01 to 16, 20, 22, 23; 17, 18, 19, 21, 25 are being finished; 24 has none yet. "Every template comes with" lists the carousel, so a template only goes in the download once its carousel link is ready.',
    'Growing pack (2026-10-20): at least 5 templates at launch, about 5 more a day until all 25. Which ones are in on day one, and the date wording, are yours to pick. All 25 have upload zips now.',
    'Sound picks: none for the zipped templates yet.', 'Reel Editor upsell: no name, link or launch yet.',
    'Mac: Mercedes is testing. The installer is a Windows script; the page names no platform until the test is done.',
    'Before live: the CapCut check of the highlight boxes, then install one zip on a second computer.',
    'Soap shop and T-shirt store lines are examples of what a buyer would make (Mercedes 2026-10-19). Demos can follow the same two shops.',
  ],
  demoNote: "Film the demos as two example shops, a soap shop and a T-shirt store, using real products of those kinds, run through the real installer. Never the after.mp4 previews (they show other brands' products). Also film the how-to video for the How it works section. The full shot list for each template is in its zip.",
  demoHead: ['Example shop', 'Templates to demo first', 'Props'],
  demo: [
    ['Soap shop', 'Before and after, Pack an order with me, Every option in 10 seconds, What it feels like, Put it to the test', 'Bars in several scents, a gift box, paper wrap, a dish'],
    ['T-shirt store', 'One product, three ways, Your order just arrived, A or B?, Three people to gift it to, Start to finish', 'Tees in a few colours, mailers, a hanger, a thank-you note'],
  ],
};

fs.writeFileSync(path.join(here, halloween.file), halloweenPage(halloween));
fs.writeFileSync(path.join(here, physical.file), physicalPage(physical));
console.log('wrote', halloween.file, physical.file);
