// Chat Manager sales page (DRAFT, 2026-10-24). Local preview only: no WordPress page or product exists yet, so `id` is
// null and publish.mjs skips it. Plan: vault products/content-engine/chat-manager-kit-plan.md. PRICE is a placeholder
// (evaluated $97 launch / ~$147 later; Mercedes decides). Screens come from the kit's demo dashboard (a made-up brand,
// automation/n8n-comments/test/demo-inbox.mjs; tracked copies in automation/n8n-comments/kit/sales/). ManyChat facts and their sources: vault comment-to-dm-n8n-plan.md,
// "Customer kit: honest comparison with ManyChat". Before publishing: upload dist/chat-manager/* to WP media and swap
// ASSET for img(), create the WooCommerce download (kit/dist zip) and point BUY_URL at its add-to-cart link.
import { s3shell } from '../lib.mjs';

export const id = null;
export const title = 'Chat Manager, Scrolly';

const ASSET = (f) => `chat-manager/${f}`;
const PRICE = '$97';
const BUY_URL = '#buy';
// The live demo (a made-up shop on Mercedes's server, nothing saved or sent): automation/n8n-comments/docker-compose.demo.yml.
// It allows being framed by scrollyseo.com only (DEMO_FRAME_ANCESTORS).
const DEMO_URL = 'https://demo.scrollyseo.com/inbox';

const STEPS = [
  ['Pick a keyword', 'Name your freebie, add its link and read the preview of every message before it goes live.'],
  ['They comment it', 'On Instagram, in your DMs, in a Story reply or under a YouTube video.'],
  ['They get it', 'A DM with the link, or a personal signup page that adds them to your email list and opens the freebie right away.'],
];

const INCLUDED = [
  ['Comment and DM keywords', 'Instagram comments, DMs and Story replies, plus YouTube comments. Start from a ready-made template.'],
  ['“Check your DMs” replies', 'A short public reply under their comment, in a few wordings that take turns.'],
  ['Only for followers', 'Optional: the freebie goes out once they follow you.'],
  ['Email signups', 'A signup page in your colors, one reminder DM, and your list in MailerLite, Kit, Mailchimp, beehiiv, Flodesk, a webhook, or kept on your server with a CSV download.'],
  ['One inbox', 'Instagram, YouTube and TikTok comments with suggested replies you approve.'],
  ['Stats and a health check', 'Signups, top posts and your reply time, plus a check that tells you when a connection needs you.'],
  ['Setup by Claude', 'Say “set up my Chat Manager”. Claude clicks through with you or follows the step-by-step guide.'],
  ['Updates', 'Say “update my Chat Manager” after downloading a new version.'],
];

const BRING = [
  ['A paid Claude plan', 'Pro or higher, sold separately.'],
  ['A $6 a month server', 'At DigitalOcean, in your name. Setup makes it for you.'],
  ['An Instagram Professional account', 'Creator or Business, free to switch.'],
  ['About an hour', 'You sign in, paste keys and press approve. Claude does the rest.'],
];

// Plain and checkable; no claim here without a source in the vault plan doc.
const COMPARE = [
  ['Instagram comment → DM', 'Yes', 'Yes'],
  ['Instagram DM and Story reply keywords', 'Yes', 'Yes'],
  ['YouTube comment keywords', 'Yes, as a public reply', 'No'],
  ['TikTok', 'Comments in your inbox, you paste the reply', 'DM replies in beta for TikTok Business accounts'],
  ['Email signup page with a personal link', 'Yes, with a reminder DM', 'Collects email inside the DM'],
  ['“Check your DMs” reply under the comment', 'Yes', 'Yes'],
  ['Price', `${PRICE} once + $6 a month server`, 'Pro from about $29 a month, more as contacts grow'],
  ['Your data', 'On your own server', 'On ManyChat’s servers'],
];

const FAQS = [
  ['Do I need to code?', 'No. Claude runs every command and asks a few plain questions.'],
  ['What does it cost each month?', 'The $6 server. Apify’s free monthly credit covers TikTok comments.'],
  ['Does it reply on TikTok?', 'TikTok gives no way to reply automatically, so TikTok comments land in your inbox with a suggested reply and a Copy & open TikTok button.'],
  ['I don’t have a website.', 'Setup gives you a free address (yourname.duckdns.org) with your privacy page on it.'],
  ['I don’t use an email tool.', 'Your list stays on your server. Download it as a CSV whenever you start one.'],
  ['Is it allowed by Instagram?', 'It uses Meta’s official Instagram API with an app that only works on your own account, so it needs no App Review.'],
  ['Who sees my comments and emails?', 'You. They live on your own server.'],
  ['Mac or Windows?', 'Setup is tested on Windows. It only needs tools Macs have built in too, and a Mac test is next.'],
];

const half = Math.ceil(FAQS.length / 2);
const faqCol = (rows) => `<div>${rows.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('')}</div>`;
const list = (rows) => `<ul>${rows.map(([h, p]) => `<li><b>${h}</b><span>${p}</span></li>`).join('')}</ul>`;
const buyBtn = (cls = '') => `<a class="s3-btn ${cls}" href="${BUY_URL}">Get Chat Manager</a>`;
const demoBtn = (cls = 'black') => `<a class="s3-btn ${cls}" href="${DEMO_URL}" target="_blank" rel="noopener">Try the demo</a>`;

const CSS = `
.s3 .cm-hero{padding:clamp(28px,4vw,64px) 0 var(--s3-sec)}
.s3 .cm-hero .s3-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:clamp(32px,4vw,80px)}
.s3 .cm-hero h1{font-size:clamp(3rem,5.4vw,6rem)!important;line-height:.95!important;letter-spacing:-.045em!important}
.s3 .cm-hero h1 span{display:block}
.s3 .cm-hero .s3-lede{margin-top:28px}
.s3 .cm-buy{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-top:36px}
.s3 .cm-cost{font:400 clamp(2.6rem,3.6vw,3.4rem)/1 var(--s3-serif)}
.s3 .cm-cost small{display:block;margin-top:10px;font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.16em;text-transform:uppercase}
.s3 .cm-shots{display:grid;grid-template-columns:1fr .78fr;gap:clamp(12px,1.6vw,24px);align-items:start}
.s3 .cm-shots img{display:block;width:100%;height:auto;border-radius:16px;box-shadow:0 0 0 1px var(--s3-line)}
.s3 .cm-shots figcaption{grid-column:1/-1;font-size:var(--s3-fs-fine);color:var(--s3-muted)}
.s3 .cm-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(20px,2.4vw,40px);margin-top:clamp(28px,3vw,48px)}
.s3 .cm-steps h3{display:flex;align-items:baseline;gap:14px}
.s3 .cm-steps p{margin-top:12px}
.s3 .cm-inbox{margin-top:clamp(32px,4vw,56px)}
.s3 .cm-inbox img{width:100%;height:auto;border-radius:16px;box-shadow:0 0 0 1px var(--s3-line)}
.s3 .cm-pack{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,2.4vw,40px);margin-top:clamp(28px,3vw,48px)}
.s3 .cm-card{background:#fff;border-radius:16px;padding:clamp(24px,3vw,44px)}
.s3 .cm-card ul{list-style:none;margin:16px 0 0;padding:0}
.s3 .cm-card li{display:grid;gap:4px;padding:16px 0;border-top:1px solid var(--s3-line)}
.s3 .cm-card li:first-child{border-top:0}
.s3 .cm-card b{font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .cm-compare{margin-top:clamp(24px,3vw,40px);overflow-x:auto}
.s3 .cm-compare table{width:100%;min-width:560px;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden}
.s3 .cm-compare th,.s3 .cm-compare td{text-align:left;padding:14px 18px;border-bottom:1px solid var(--s3-line);vertical-align:top}
.s3 .cm-compare thead th{font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.12em;text-transform:uppercase}
.s3 .cm-compare tbody th{font-weight:500}
.s3 .cm-faq .s3-faq{display:grid;grid-template-columns:1fr 1fr;gap:0 48px;margin-top:20px}
.s3 .cm-faq .s3-faq>div details:first-child{border-top:1px solid var(--s3-line)}
.s3 .cm-link{font:500 var(--s3-fs-ui)/1.3 var(--s3-sans);color:var(--s3-ink);text-underline-offset:4px}
.s3 .cm-demo .s3-lede{margin-top:16px;max-width:720px}
.s3 .cm-window{margin-top:clamp(24px,3vw,40px);border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px var(--s3-line)}
.s3 .cm-window iframe{display:block;width:100%;height:min(760px,80vh);border:0}
.s3 .cm-demo .cm-buy{margin-top:24px}
.s3 .cm-end{background:var(--s3-mist)}
.s3 .cm-end .s3-lede{margin:18px 0 28px}
.s3 .cm-end .s3-fine{margin-top:28px}
@media(max-width:900px){
 .s3 .cm-hero .s3-wrap,.s3 .cm-pack,.s3 .cm-faq .s3-faq,.s3 .cm-steps{grid-template-columns:1fr}
 .s3 .cm-faq .s3-faq>div+div details:first-child{border-top:0}
}
@media(max-width:700px){
 .s3 .cm-window{display:none}
 .s3 .cm-buy{flex-direction:column;align-items:stretch}
 .s3 .cm-compare table{min-width:0}
 .s3 .cm-compare th,.s3 .cm-compare td{padding:12px 8px}
 .s3 .cm-compare thead th{letter-spacing:.06em}
}
`;

export function build() {
  const body = `
<section class="cm-hero"><div class="s3-wrap">
 <div>
  <h1><span>Comment a word.</span><span>Get the freebie.</span></h1>
  <p class="s3-lede">Chat Manager sends your freebie when someone comments or DMs a keyword, signs them up to your email list, and puts every Instagram, YouTube and TikTok comment in one inbox. It runs on your own server, and Claude sets it up with you.</p>
  <div class="cm-buy"><div class="cm-cost">${PRICE}<small>One-time, plus a $6 a month server</small></div>${buyBtn()}<a class="cm-link" href="#demo">Try the demo →</a></div>
 </div>
 <figure class="cm-shots">
  <img src="${ASSET('preview-dm.png')}" alt="Preview of the Instagram DMs a keyword sends: reply READY, the signup link, the freebie and one reminder" width="570" height="927">
  <img src="${ASSET('signup-phone.png')}" alt="Signup page on a phone asking for an email to get a free tote bag pattern" width="780" height="1520">
  <figcaption>An example shop’s keyword preview and signup page, in its own colors.</figcaption>
 </figure>
</div></section>
<section class="s3-sec" id="how"><div class="s3-wrap">
 <h2 class="s3-h2">Three steps.</h2>
 <div class="cm-steps">${STEPS.map(([h, p], i) => `<div><h3 class="s3-h3"><span class="s3-num">${i + 1}</span>${h}</h3><p>${p}</p></div>`).join('')}</div>
 <figure class="cm-inbox"><img src="${ASSET('inbox.png')}" alt="The Chat Manager inbox with an Instagram comment, an Instagram DM and a TikTok comment waiting for replies" width="1260" height="840" loading="lazy"></figure>
</div></section>
<section class="cm-demo s3-sec" id="demo"><div class="s3-wrap">
 <h2 class="s3-h2">Click around the real thing.</h2>
 <p class="s3-lede">This is Chat Manager for a made-up shop. Open a conversation, try a keyword template, look at the stats. Nothing you do here is saved or sent.</p>
 <div class="cm-window"><iframe src="${DEMO_URL}" title="Chat Manager demo for a made-up shop"></iframe></div>
 <div class="cm-buy">${demoBtn()}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">What you get, and what you bring.</h2>
 <div class="cm-pack">
  <article class="cm-card"><h3 class="s3-h3">Included</h3>${list(INCLUDED)}</article>
  <article class="cm-card"><h3 class="s3-h3">You bring</h3>${list(BRING)}</article>
 </div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Chat Manager and ManyChat.</h2>
 <div class="cm-compare"><table>
  <thead><tr><th scope="col"></th><th scope="col">Chat Manager</th><th scope="col">ManyChat</th></tr></thead>
  <tbody>${COMPARE.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody>
 </table></div>
</div></section>
<section class="cm-faq s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Good to know.</h2>
 <div class="s3-faq">${faqCol(FAQS.slice(0, half))}${faqCol(FAQS.slice(half))}</div>
</div></section>
<section class="cm-end s3-sec" id="buy"><div class="s3-wrap">
 <h2 class="s3-h2">Your keywords, your list, your server.</h2>
 <p class="s3-lede">${PRICE} one-time. Download it, open it in Claude and say “set up my Chat Manager”.</p>
 ${buyBtn()}
 <p class="s3-fine">Claude is made by Anthropic and is sold separately. ManyChat is a trademark of ManyChat, Inc.; prices checked October 2026.</p>
</div></section>`;
  return s3shell(body, CSS);
}
