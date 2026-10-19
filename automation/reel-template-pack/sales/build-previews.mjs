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
  const type = { jpg: 'jpeg', png: 'png', webp: 'webp' }[ext];
  return `data:image/${type};base64,${fs.readFileSync(path.join(here, 'img', f)).toString('base64')}`;
};

const BASE = `
.draft{background:#090909;color:#fff;padding:20px var(--s3-gut);font:var(--s3-fs-fine)/1.5 var(--s3-sans)}
.draft b{color:var(--s3-orange)}
.draft details{margin-top:8px}
.draft summary{cursor:pointer;font-weight:700}
.draft ul{margin:10px 0 0;padding-left:1.2em}
.draft li+li{margin-top:4px}
mark.ph{background:#ffd9c9;color:var(--s3-ink);padding:0 4px;border-radius:3px}
.s3-dark mark.ph{background:#5a2412;color:#fff}
.s3-btn mark.ph{background:#fff;color:#000}
.amt{font:400 var(--s3-fs-h3)/1 var(--s3-serif)}
.amt del{font-size:.62em;color:var(--s3-muted);margin-right:.35em}
.s3-dark .amt del{color:#a9a39b}
.buy{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;margin:32px 0 14px}
/* phones: one aligned row (Mercedes 2026-10-19); on a phone the row scrolls inside itself, never the page */
.phones{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(10px,1.6vw,24px);align-items:start}
.phone{aspect-ratio:9/16;border-radius:22px;background:#e6dfd3;border:6px solid #111;overflow:hidden;position:relative;display:flex;align-items:flex-end}
.phone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.phone span{position:relative;padding:12px;font:var(--s3-fs-label)/1.35 var(--s3-sans);color:#3d3a36}
.phone span b{display:block;font:400 var(--s3-fs-body)/1.2 var(--s3-serif);color:var(--s3-ink);margin-top:2px}
.cap{margin-top:12px;font:400 var(--s3-fs-body)/1.25 var(--s3-serif);text-align:center}
@media(max-width:800px){.phones{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;margin-right:calc(-1 * var(--s3-gut))}
 .phones>*{flex:0 0 58%;scroll-snap-align:start}}
.video{max-width:960px;aspect-ratio:16/9;border-radius:16px;background:#1b1b1b;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;margin:32px 0 40px}
.video .play{width:76px;height:76px;border-radius:50%;background:var(--s3-orange);display:flex;align-items:center;justify-content:center}
.video .play::after{content:"";border-left:24px solid #000;border-top:15px solid transparent;border-bottom:15px solid transparent;margin-left:6px}
.video p{font:var(--s3-fs-fine)/1.4 var(--s3-sans);color:#d8d3cc;max-width:30em}
.steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px;padding:0;list-style:none;counter-reset:st}
.steps li{counter-increment:st}
.steps li::before{content:counter(st);display:block;font:400 var(--s3-fs-h3)/1 var(--s3-serif);color:var(--s3-or-text);margin-bottom:10px}
.steps b{display:block;font:400 var(--s3-fs-title)/1.15 var(--s3-serif);margin-bottom:8px}
@media(max-width:900px){.steps{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.steps{grid-template-columns:1fr}}
.incl{margin-top:56px;max-width:46em}
.incl h3{margin-bottom:16px}
.incl ul{padding-left:1.3em}
.incl li+li{margin-top:10px}
.s3-faq{margin-top:32px}
.cta{text-align:center;position:relative;overflow:hidden}
.cta h2{margin-bottom:8px}
.cta .buy{justify-content:center}
.cta p+p{margin-top:12px}
.notes{border-top:1px solid var(--s3-line)}
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
<title>${esc(d.title)}</title><style>${v3}</style><style>${BASE}${css}</style></head><body style="margin:0;background:#f7f3ec">
<div class="draft"><b>DRAFT PREVIEW.</b> Local file only, not published. Highlighted [brackets] are open decisions. The site's global header and footer are left out.
<details><summary>Open decisions (${d.decisions.length})</summary><ul>${d.decisions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details></div>
<div class="s3"><div id="main">${body}</div></div></body></html>`;

const price = (d) => `<span class="amt">${d.was ? `<del>${esc(d.was)}</del>` : ''}${ph(d.price)}</span>`;
const howItWorks = (d) => `<section class="s3-sec" id="how"><div class="s3-wrap"><h2 class="s3-h2">How it works</h2>
  <div class="video"><div class="play" aria-hidden="true"></div><strong>Your how-to video goes here</strong>
  <p>Mercedes records it: film the clips, drop them in, double-click the installer, open CapCut.</p></div>
  <ol class="steps">${d.steps.map(([b, t]) => `<li><b>${esc(b)}</b>${esc(t)}</li>`).join('')}</ol></div></section>`;
const includes = (d) => `<div class="incl"><h3 class="s3-h3">Every template comes with</h3><ul>${d.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  ${d.formatNote ? `<p style="margin-top:20px">${ph(d.formatNote)}</p>` : ''}</div>`;
const faq = (d) => `<section class="s3-sec"><div class="s3-read"><h2 class="s3-h2">Questions</h2><div class="s3-faq">${d.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${ph(a)}</div></details>`).join('')}</div></div></section>`;
const notes = (d) => `<section class="s3-sec notes"><div class="s3-wrap">
  <h2 class="s3-h2">Review notes (not part of the page)</h2>
  <h3 class="s3-h3">Other headline options</h3><ul>${d.headlines.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
  <h3 class="s3-h3">Listing description</h3><p class="listing">${esc(d.listing)}</p>
  <h3 class="s3-h3">Demo footage to film</h3><p style="max-width:46em;margin-bottom:16px">${esc(d.demoNote)}</p>
  <table><thead><tr>${d.demoHead.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.demo.map((r) => `<tr>${r.map((c, i) => `<td>${i ? esc(c) : `<b>${esc(c)}</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table>
</div></section>`;

const STEPS = (extra) => [
  ['Film your clips', `The shot list says what to film and for how long. Hold your phone upright${extra} and start each clip right on the action.`],
  ['Drop them in', 'Unzip the template and put your clips in the folder "1 Put your clips here", named 1, 2, 3 in shot-list order.'],
  ['Double-click the installer', '"2 Double-click to install" copies the template into CapCut under a new name and adds your clips. Your other projects stay as they are.'],
  ['Type your words', 'Open CapCut: the template is on the home screen. Double-click each text box, type over the [brackets], and export.'],
  ['Add a sound and post', 'Pick a sound in Instagram after you upload, then share it.'],
];
const INCLUDES = (projectNote) => [
  `The CapCut project, with ${projectNote}`,
  'A shot list: every clip to film, in order, and how long it is',
  'An installer that puts the template on CapCut\'s home screen with your clips already in it',
  'A recipe card with the words to type, and a one-page How to use guide',
  'A phone kit for CapCut on your phone: the shot guide video, the shot list and every graphic as a PNG',
];
const FAQ = (fonts) => [
  ['Do I need CapCut on a computer?', 'For the full template, yes: it opens in CapCut for computer (the free download). Install it and open it once before you run the installer.'],
  ['Can I use it on my phone?', 'Yes. Every template comes with a phone kit: the shot guide video, the shot list and the graphics as PNG images. In the CapCut phone app you add your clips and words, then place the graphics as overlays. The full animation is built for you in the computer version.'],
  ['Is music included?', "No sound files are included, so your Reel never gets muted for a song you don't have the rights to. Each template suggests a sound [SOUND PICKS]. Add it in Instagram after you upload: on a business account, Instagram only shows sounds cleared for business use."],
  ['Do I need to install any fonts?', fonts],
  ['How do I change the words?', 'Double-click a text box in CapCut and type over the [brackets]. Keep it to a few words so people can read it in time.'],
  ['My computer warns me about the installer. Is that normal?', "Yes, Windows shows this for installers it hasn't seen before. Choose More info, then Run anyway."],
  ['What if I want a different clip in one shot?', "Right-click the clip on CapCut's timeline, choose Replace, and pick another."],
];

/* ------------------------------------------------------------------ Halloween: night look, real template props */
const HCSS = `
.night{background:#0b0a10;color:#fff;position:relative;overflow:hidden}
.night h1{color:var(--s3-orange)!important;max-width:9em;position:relative;z-index:2}
.night .s3-lede{color:#efe9e1;position:relative;z-index:2}
.night .s3-fine{color:#cfc8bf}
.night .moon{position:absolute;right:-90px;top:-70px;width:min(520px,62vw);opacity:.95;z-index:0;filter:drop-shadow(0 0 60px rgba(255,90,40,.35))}
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
.cta.night .moon{right:auto;left:50%;top:auto;bottom:-260px;transform:translateX(-50%);width:520px;opacity:.5}
.cta.night h2{color:var(--s3-orange)!important;position:relative;z-index:2}
.cta.night .s3-read{position:relative;z-index:2}
`;

function halloweenPage(d) {
  const ph5 = d.templates.map((t) => `<div><div class="phone"><img src="${img(t.poster)}" alt="${esc(t.name)}: a frame from the template"></div><p class="cap">${esc(t.name)}</p></div>`).join('');
  const tpls = d.templates.map((t) => `<div class="tpl"><div class="phone"><img src="${img(t.poster)}" alt=""></div>
    <h3>${esc(t.name)}</h3><p>${ph(t.job)}</p><p class="meta">You film ${esc(t.film)}.${t.len ? ` About ${t.len} seconds.` : ''}</p></div>`).join('');
  const body = `
<section class="night s3-sec hero-h"><img class="moon" src="${img('moon.webp')}" alt="">
  <img class="hang" src="${img('bat.png')}" alt="" style="left:44%"><img class="hang b2" src="${img('bat.png')}" alt="" style="left:58%;width:clamp(44px,5vw,72px)">
  <img class="fly" src="${img('batfly.png')}" alt="" style="top:18%;left:0"><img class="fly f2" src="${img('batfly.png')}" alt="" style="left:0">
  <div class="spider" style="left:6%;top:-10px"><img src="${img('spider.png')}" alt=""></div>
  <div class="s3-wrap">
    <h1 class="s3-display">${esc(d.headline)}</h1>
    <p class="s3-lede" style="margin-top:28px">${esc(d.sub)}</p>
    <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
    <p class="s3-fine">${ph(d.priceLine)}</p>
    <div class="phones">${ph5}</div>
  </div></section>
<section class="s3-sec"><div class="s3-wrap">
  <h2 class="s3-h2">${esc(d.getTitle)}</h2><p class="s3-lede" style="margin-top:20px">${esc(d.getLede)}</p>
  <div class="tpls">${tpls}</div>${includes(d)}</div></section>
${howItWorks(d)}
<section class="s3-sec"><div class="s3-wrap s3-split"><h2 class="s3-h2">Who it's for</h2><p class="s3-lede">${esc(d.who)}</p></div></section>
${faq(d)}
<section class="s3-sec night cta" id="buy"><img class="moon" src="${img('moon.webp')}" alt="">
  <img class="hang" src="${img('bat.png')}" alt="" style="left:12%"><img class="hang b2" src="${img('bat.png')}" alt="" style="right:12%;width:clamp(44px,5vw,72px)">
  <div class="s3-read"><h2 class="s3-h2">${esc(d.ctaHead)}</h2>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.ctaLine)}</p>
  <p class="s3-fine">${ph('[REEL EDITOR UPSELL: one line once it has a name, link and launch date]')}</p></div></section>
${notes(d)}`;
  return shell(d, HCSS, body);
}

/* ------------------------------------------------------------------ Physical: v3 cream, 25 templates with examples */
const PCSS = `
.hero-p{padding-top:clamp(48px,6vw,96px)}
.hero-p h1{max-width:8.5em}
.hero-p .phones{margin-top:clamp(40px,5vw,72px)}
.list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:0 clamp(24px,3vw,48px);margin-top:40px}
.item{padding:24px 0;border-top:1px solid var(--s3-line)}
.item h3{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important;margin-bottom:8px}
.item p+p{margin-top:8px}
.item .ex{font-size:var(--s3-fs-fine);color:#3d3a36}
.item .ex b{font-weight:700}
`;

function physicalPage(d) {
  const phones = d.heroPhones.map((n) => `<div><div class="phone"><span>Demo to film<b>${esc(n)}</b></span></div></div>`).join('');
  const list = d.templates.map((t) => `<div class="item"><h3>${esc(t.name)}</h3><p>${esc(t.job)}</p>
    <p class="ex"><b>Soap shop:</b> ${esc(t.soap)}</p><p class="ex"><b>T-shirt store:</b> ${esc(t.tee)}</p></div>`).join('');
  const body = `
<section class="s3-sec hero-p"><div class="s3-wrap">
  <h1 class="s3-display or">${esc(d.headline)}</h1>
  <p class="s3-lede" style="margin-top:28px">${esc(d.sub)}</p>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.priceLine)}</p>
  <div class="phones">${phones}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
  <h2 class="s3-h2">${esc(d.getTitle)}</h2><p class="s3-lede" style="margin-top:20px">${esc(d.getLede)}</p>
  <div class="list">${list}</div>${includes(d)}</div></section>
${howItWorks(d)}
<section class="s3-sec"><div class="s3-wrap s3-split"><h2 class="s3-h2">Who it's for</h2><p class="s3-lede">${esc(d.who)}</p></div></section>
${faq(d)}
<section class="s3-sec s3-dark cta" id="buy"><div class="s3-read">
  <h2 class="s3-h2 or">${esc(d.ctaHead)}</h2>
  <div class="buy">${price(d)}<a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.ctaLine)}</p>
  <p class="s3-fine">${ph('[REEL EDITOR UPSELL: one line once it has a name, link and launch date]')}</p></div></section>
${notes(d)}`;
  return shell(d, PCSS, body);
}

const halloween = {
  file: 'halloween-sales-preview.html',
  title: 'Halloween Reels draft',
  headline: 'Cute Halloween Reels that sell',
  headlines: ['Halloween Reels with a selling job', 'Five Halloween Reels. Your clips, your words, posted before the 31st.', 'Bats, webs and a blood moon, all working for your sales', 'Spooky-cute Reels for your October sale'],
  sub: 'Five ready-made Reels for October. Film a few clips on your phone, drop them in, and each one opens in CapCut with your clips already in place.',
  was: '$9.99', price: '$4.99',
  button: 'Get all 5 Reels',
  priceLine: '5 CapCut templates, with a shot list and a phone kit for each. [LAUNCH FORMAT line].',
  ctaLine: '5 templates, shot lists and phone kits. [LAUNCH FORMAT line].',
  getTitle: 'Five Reels, five jobs',
  getLede: 'Each template is a whole Reel with a business job and an ending that tells people where to buy. Cute and playful, with real photographed props.',
  includes: INCLUDES('real photographed props and the playful layer (washi tape, sticker edges, handwritten words)'),
  templates: [
    { name: 'Once in a blood moon', poster: 'h6.jpg', job: 'Open a rare, once-a-year sale. A full moon turns blood red, becomes your video, and the deal arrives with bats and a haunted house.', film: '3 clips: your product, you or your shop, your product again', len: 14 },
    { name: 'Caught in our web', poster: 'h3.jpg', job: "Show what's included or why people love it. A friendly spider drops in, the web forms, and each point gets caught in it.", film: '5 clips: your product held up, then four points', len: 15 },
    { name: "Things I'm batty about", poster: 'h2.jpg', job: 'Share your favourites: best-sellers, a gift guide, the tools you use. Real cute bats carry each one in.', film: '4 clips: an opening, then three favourites', len: 15 },
    { name: 'Trick or treat', poster: 'h5.jpg', job: 'Fix a common mistake, then make your offer. Door 1 opens on the trick, door 2 on the treat.', film: '3 clips: the mistake, your product, the proof', len: 17.5 },
    { name: 'Now you see it', poster: 'h1.jpg', job: 'Last chance: a limited drop or a sale ending. A snap, real smoke rolls in, and the product is gone.', film: 'you with your product, the same shot without it, then your product', len: 14 },
  ],
  steps: STEPS(''),
  who: 'Online business owners and creators who want a Halloween Reel that sells something: a product, a sale, a freebie or an offer. It works for physical products, digital products and services, since every clip is your own footage.',
  faq: FAQ('No. The big Halloween lettering is part of the artwork. The words you edit use Arial or Bodoni Moda, and Bodoni Moda comes inside the template.'),
  ctaHead: 'Post your Halloween Reel before the 31st',
  listing: "Five cute Halloween Reel templates for CapCut, each with a selling job: open a once-a-year sale, show what's included, share your favourites, turn a common mistake into your offer, or announce a last chance. Film a few clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Each template comes with a shot list, a recipe card, a one-page guide and a phone kit. Each one suggests a sound to add in Instagram (no sound files included).",
  decisions: [
    'Price: $4.99, shown with $9.99 crossed out (decided 2026-10-19).',
    'Launch format: sell all 5 now, or open before Now you see it is finished?',
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
  sub: '25 Reel templates for shops that sell physical products. Film your product on your phone, drop the clips in, and each template opens in CapCut with your clips already in place.',
  price: '[PRICE]',
  button: 'Get all 25 Reels',
  priceLine: '25 CapCut templates, with a shot list and a phone kit for each. [LAUNCH FORMAT line].',
  ctaLine: '25 templates, shot lists and phone kits. [LAUNCH FORMAT line].',
  heroPhones: ['One product, three ways', 'Pack an order with me', 'Before and after', 'Put it to the test', 'Every option in 10 seconds'],
  getTitle: '25 Reels, 25 selling jobs',
  getLede: "Real photographed props, playful collage and fast cuts. Each one ends with your product's name and where to buy it. Here's how two shops would use them.",
  includes: INCLUDES('real photographed props, collage and motion already built'),
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
  steps: STEPS(', keep your product in the middle of the frame,'),
  who: 'Small business owners who sell physical products: makers, small-batch brands and anyone who packs and ships orders. If you can film your product on your phone, you can make these.',
  faq: FAQ('No. The words you edit use Montserrat, which comes inside each template, and the big lettering is part of the artwork.'),
  ctaHead: 'A month of Reels, ready for your clips',
  listing: "25 Reel templates for CapCut, made for shops that sell physical products: packing videos, before and afters, gift guides, unboxings, reviews, tests, new drops and more. Film a few clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Each template comes with a shot list, a recipe card, a one-page guide and a phone kit. Each one suggests a sound to add in Instagram (no sound files included).",
  decisions: [
    'Price.',
    'Launch format: 10 of the 25 are built today (01, 02, 03, 08, 09, 10, 12, 20, 22, 23); the other 15 are in review or being built. Sell when all 25 are done, or open early with the rest as free updates?',
    '01, 02 and 03 are built in the older look and not zipped yet.',
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
