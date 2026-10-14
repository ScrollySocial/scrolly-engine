// Reel Engine Founding Beta sales page (DRAFT, 2026-10-13). Local preview only: no WordPress page exists, so `id` is null and
// publish.mjs skips it. Offer details come from vault products/content-engine/selling-research.md (price + seats are placeholders,
// not decided). Proof is only Mercedes's own engine-made Reels. Before publishing: upload the files in dist/reel-engine-beta/
// to WP media and swap ASSET for img(), point the buttons at the real product, and add the Instagram links once the Reels are live.
import { s3shell } from '../lib.mjs';

export const id = null;
export const title = 'Reel Engine Founding Beta, Scrolly';

const ASSET = (f) => `reel-engine-beta/${f}`;
const PRICE = '$97';
const SEATS = 10;
const SEAT_URL = `mailto:hello@scrollyseo.com?subject=${encodeURIComponent('Reel Engine Founding Beta')}`;

const REELS = [
  { v: 'know.mp4', poster: 'know-cover.jpg', label: 'Reel: Your AI should know what you’re selling' },
  { v: 'voice.mp4', poster: 'voice-cover.jpg', label: 'Reel: Stop rewriting every caption AI gives you' },
];

const STEPS = [
  ['Plan it', 'Read your script one moment at a time and click any word to cut it. See every moment’s graphics drawn over a still of you, and pick your cover.', 'step-1.jpg', 'The Plan it step: four moments of a Reel, each showing its graphics over a still of the speaker.'],
  ['Edit it', 'Watch your real footage with the real graphics, sounds and music, live. Change captions, transitions, sounds and lighting for the whole Reel or a single moment.', 'step-2.jpg', 'The Edit it step: the footage plays on the left beside lighting presets and sliders.'],
  ['Approve it', 'Watch the finished Reel, leave a note at any moment and polish the post caption. Approve it, and your MP4 and cover are ready to post.', 'step-3.jpg', 'The Approve it step: the finished Reel beside a note field and the post caption.'],
];

const INCLUDED = [
  ['The Reel Engine', 'Graphics library, Studio Reel template, review page, cover maker and a setup check.'],
  ['A 45-minute setup call', 'We install it on your computer together.'],
  ['Your brand kit', 'Made on the call: your colors, fonts, caption style and anything you never want in a Reel.'],
  ['A finished MP4 and cover', 'For every Reel you approve.'],
  ['Engine updates', 'Through the end of the beta.'],
];

const BRING = [
  ['A paid Claude plan', 'Pro ($20 a month) or higher, sold separately. <a href="https://claude.com/pricing" rel="noopener">See current prices</a>.'],
  ['A Windows computer', 'Mac is untested for the beta.'],
  ['10 free starter sounds', 'Downloaded from Mixkit with our link list. About 5 minutes, once.'],
  ['Your posting tool', 'Or post the MP4 straight to Instagram.'],
];

const FAQS = [
  ['What kind of Reels does it make?', 'Studio Reels: you talking to camera in one take, with graphics, captions and sounds built from what you say. Other Reel types are outside the beta.'],
  ['Which Claude plan do I need?', 'Pro is the minimum. Claude’s limits are shared with your chats, and rendering uses none of them because it runs on your computer. We’ll measure how many Reels a day fit on Pro with the founding group and share what we find.'],
  ['How long does a Reel take to render?', 'On my laptop, a 60-second Reel takes about 10 to 15 minutes. It runs in the background while you work.'],
  ['Why do I download the sounds myself?', 'Mixkit’s free license lets you use their sounds in your Reels but doesn’t allow sharing them inside a tool. You download the 10 starter sounds once, and a Reel still renders if one is missing.'],
  ['Does it post for me?', 'In the beta you get the finished MP4 and cover, ready for Instagram or your scheduler.'],
  ['Does my footage leave my computer?', 'Your video files, the review page and the renders all stay on your computer. Claude works from your transcript and still frames.'],
  ['Do I need to know code?', 'No. We install it together on the setup call, and you ask Claude for changes in plain words.'],
  ['What does founding mean?', `You’re one of the first ${SEATS} people using it, so expect a few setup bugs. You get the founding price and direct help while we fix them.`],
];

const half = Math.ceil(FAQS.length / 2);
const faqCol = (rows) => `<div>${rows.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('')}</div>`;
const list = (rows) => `<ul>${rows.map(([h, p]) => `<li><b>${h}</b><span>${p}</span></li>`).join('')}</ul>`;
const seatBtn = (cls = '') => `<a class="s3-btn ${cls}" href="${SEAT_URL}">Request a founding seat</a>`;

const CSS = `
.s3 .rb-hero{padding:clamp(28px,4vw,64px) 0 var(--s3-sec)}
.s3 .rb-hero .s3-wrap{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);align-items:center;gap:clamp(32px,4vw,80px)}
.s3 .rb-hero h1{font-size:clamp(3rem,5.4vw,6rem)!important;line-height:.95!important;letter-spacing:-.045em!important}
.s3 .rb-hero h1 span{display:block}
.s3 .rb-hero h1 em,.s3 .rb-end h2{font-style:normal;color:var(--s3-or-text)!important}
.s3 .rb-hero .s3-lede{margin-top:28px}
.s3 .rb-buy{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-top:36px}
.s3 .rb-cost{font:400 clamp(2.6rem,3.6vw,3.4rem)/1 var(--s3-serif)}
.s3 .rb-cost small{display:block;margin-top:10px;font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.16em;text-transform:uppercase}
.s3 .rb-reels{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.6vw,24px)}
.s3 .rb-reels video{display:block;width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:16px;background:#ece6dc}
.s3 .rb-reels figcaption{grid-column:1/-1;font-size:var(--s3-fs-fine);color:var(--s3-muted)}
.s3 .rb-steps{margin-top:clamp(40px,5vw,80px);display:grid;gap:clamp(56px,6vw,104px)}
.s3 .rb-step img{width:100%;border-radius:16px;box-shadow:0 0 0 1px var(--s3-line)}
.s3 .rb-step h3{display:flex;align-items:baseline;gap:18px}
.s3 .rb-step h3 .s3-num{font-size:clamp(3rem,4.4vw,4.4rem)!important}
.s3 .rb-step p{margin-top:18px;font:var(--s3-fs-body-serif)/1.55 var(--s3-serif);max-width:28em}
.s3 .rb-pack{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,2.4vw,40px);margin-top:clamp(32px,4vw,56px)}
.s3 .rb-card{background:#fff;border-radius:16px;padding:clamp(28px,3vw,48px)}
.s3 .rb-card ul{list-style:none;margin:20px 0 0;padding:0}
.s3 .rb-card li{display:grid;gap:4px;padding:18px 0;border-top:1px solid var(--s3-line)}
.s3 .rb-card li:first-child{border-top:0}
.s3 .rb-card b{font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .rb-card a{text-decoration:underline;text-underline-offset:3px}
.s3 .rb-faq .s3-faq{display:grid;grid-template-columns:1fr 1fr;gap:0 48px;margin-top:20px}
.s3 .rb-faq .s3-faq>div details:first-child{border-top:1px solid var(--s3-line)}
.s3 .rb-end{background:#f7e9de}
.s3 .rb-end .s3-lede{margin:18px 0 28px}
.s3 .rb-end .s3-fine{margin-top:28px}
@media(max-width:900px){
 .s3 .rb-hero .s3-wrap,.s3 .rb-pack,.s3 .rb-faq .s3-faq{grid-template-columns:1fr}
 .s3 .rb-faq .s3-faq>div+div details:first-child{border-top:0}
 .s3 .rb-step img{order:2}
}
@media(max-width:700px){.s3 .rb-buy{flex-direction:column;align-items:stretch}}
`;

export function build() {
  const body = `
<section class="rb-hero"><div class="s3-wrap">
 <div>
  <h1><span>Film one take.</span><em>Claude edits it.</em></h1>
  <p class="s3-lede">The Scrolly Reel Engine turns one talking-head take into a finished Reel with graphics, captions, sounds and a cover, in your brand. You check it in three steps, and it renders on your computer.</p>
  <div class="rb-buy"><div class="rb-cost">${PRICE}<small>One-time. Founding beta, ${SEATS} seats</small></div>${seatBtn()}</div>
 </div>
 <figure class="rb-reels">
  ${REELS.map((r) => `<video controls playsinline preload="none" poster="${ASSET(r.poster)}" aria-label="${r.label}"><source src="${ASSET(r.v)}" type="video/mp4"></video>`).join('')}
  <figcaption>Two of my Reels, edited with the engine.</figcaption>
 </figure>
</div></section>
<section class="s3-sec" id="how"><div class="s3-wrap">
 <h2 class="s3-h2">Three steps, one page.</h2>
 <p class="s3-lede" style="margin-top:20px">You film. Claude transcribes the take, trims the pauses and plans the graphics for every moment. Then you review.</p>
 <div class="rb-steps">
  ${STEPS.map(([h, p, f, alt], i) => `<div class="rb-step s3-split${i % 2 ? ' flip' : ''}"><div><h3 class="s3-h3"><span class="s3-num">${i + 1}</span>${h}</h3><p>${p}</p></div><img src="${ASSET(f)}" alt="${alt}" width="800" height="${f === 'step-3.jpg' ? 393 : 500}" loading="lazy"></div>`).join('')}
 </div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">What you get, and what you bring.</h2>
 <div class="rb-pack">
  <article class="rb-card"><h3 class="s3-h3">Included</h3>${list(INCLUDED)}</article>
  <article class="rb-card"><h3 class="s3-h3">You bring</h3>${list(BRING)}</article>
 </div>
</div></section>
<section class="rb-faq s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Before you join.</h2>
 <div class="s3-faq">${faqCol(FAQS.slice(0, half))}${faqCol(FAQS.slice(half))}</div>
</div></section>
<section class="rb-end s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Your next Reel, edited for you.</h2>
 <p class="s3-lede">${PRICE} one-time. ${SEATS} founding seats.</p>
 ${seatBtn()}
 <p class="s3-fine">Built on HyperFrames, open source by HeyGen. Claude is made by Anthropic and is sold separately.</p>
</div></section>`;
  return s3shell(body, CSS);
}
