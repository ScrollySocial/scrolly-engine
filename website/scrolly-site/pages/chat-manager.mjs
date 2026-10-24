// Chat Manager sales page (DRAFT, rebuilt 2026-10-24 after Mercedes: "far too boring" next to /product-reels/). Local
// preview only: no WordPress page or product exists yet, so `id` is null and publish.mjs skips it. Plan: vault
// products/content-engine/chat-manager-kit-plan.md. PRICE is a placeholder (Mercedes decides). The hero phone and the
// feature screens are drawn in HTML/CSS from the real product (automation/n8n-comments/inbox/dashboard.html previews);
// the live demo is the real dashboard for a made-up shop (automation/n8n-comments/docker-compose.demo.yml), which
// allows being framed by scrollyseo.com only. ManyChat facts and their sources: vault comment-to-dm-n8n-plan.md,
// "Customer kit: honest comparison with ManyChat". Before publishing: create the WooCommerce download (kit/dist zip)
// and point BUY_URL at its add-to-cart link.
import { s3shell } from '../lib.mjs';

export const id = null;
export const title = 'Chat Manager, Scrolly';

const PRICE = '$97';
const BUY_URL = '#buy';
const DEMO_URL = 'https://demo.scrollyseo.com/inbox';

// Line icons (48x48, stroke only), drawn like the Product Reels page icons.
const I = {
  comment: '<path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"/><path d="M14 19h20M14 25h12"/>',
  dm: '<path d="M42 6L20 28M42 6l-14 36-8-14-14-8z"/>',
  mail: '<rect x="5" y="11" width="38" height="27" rx="3"/><path d="M6 13l18 14 18-14"/>',
  inbox: '<path d="M5 28l6-18h26l6 18v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 28h11l3 5h10l3-5h11"/>',
  reply: '<path d="M20 10L6 22l14 12v-7c9 0 16 3 22 11-2-11-9-19-22-20z"/>',
  heart: '<path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22z"/>',
  bell: '<path d="M12 34V22a12 12 0 0 1 24 0v12l4 4H8z"/><path d="M20 42a4 4 0 0 0 8 0"/>',
  yt: '<rect x="4" y="11" width="40" height="27" rx="7"/><path d="M20 18v13l11-6.5z"/>',
  chart: '<path d="M6 42h36"/><path d="M11 36V24M20 36V14M29 36V20M38 36V8"/>',
  pulse: '<path d="M4 25h9l4-11 7 22 5-15 3 4h12"/>',
  download: '<path d="M24 6v24M15 21l9 9 9-9"/><path d="M8 32v6a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3v-6"/>',
  spark: '<path d="M24 5l4 13 13 4-13 4-4 13-4-13-13-4 13-4z"/>',
  check: '<circle cx="24" cy="24" r="18"/><path d="M15 24l6 6 12-12"/>',
  power: '<path d="M24 6v16"/><path d="M14 12a15 15 0 1 0 20 0"/>',
};
const icon = (k) => `<svg viewBox="0 0 48 48" aria-hidden="true">${I[k]}</svg>`;

const FLOW = [
  ['comment', 'They comment', 'MATH under your Reel.'],
  ['dm', 'They get a DM', 'Plus a “check your DMs” reply.'],
  ['mail', 'They sign up', 'Their email goes to your list.'],
  ['inbox', 'You see it all', 'One inbox, every platform.'],
];

const FEATURES = [
  ['comment', 'Keywords', 'Comments, DMs and Story replies'],
  ['reply', '“Check your DMs”', 'A public reply, in rotating wordings'],
  ['heart', 'Only for followers', 'Optional: follow first, then the freebie'],
  ['mail', 'Email signups', 'MailerLite, Kit, Mailchimp and more'],
  ['bell', 'One reminder', 'If they forget to sign up'],
  ['yt', 'YouTube too', 'Keyword comments get a public reply'],
  ['chart', 'Stats', 'Signups, top posts, your reply time'],
  ['pulse', 'Health check', 'Tells you when something needs you'],
];

const SETUP = [
  ['download', 'Download', 'Get the kit.'],
  ['spark', 'Ask Claude', '“Set up my Chat Manager.”'],
  ['check', 'Approve', 'Sign in and paste a few keys.'],
  ['power', 'Go live', 'Turn your first keyword on.'],
];

// You bring: plain words first (Mercedes 2026-10-24: "a $6 a month server" scares people off).
const BRING = [
  ['A paid Claude plan', 'Pro or higher. Claude does the setup with you.'],
  ['About $6 a month for hosting', 'Chat Manager needs a spot online that’s always on, like a tiny rented computer. Claude creates it for you at DigitalOcean, in your name. You only add a card.'],
  ['An Instagram Professional account', 'Creator or Business. It’s free to switch.'],
  ['About an hour, once', 'You sign in, paste a few keys and press approve.'],
];

// Plain and checkable; no claim here without a source in the vault plan doc.
const COMPARE = [
  ['Instagram comment → DM', 'Yes', 'Yes'],
  ['DM and Story reply keywords', 'Yes', 'Yes'],
  ['“Check your DMs” reply under the comment', 'Yes', 'Yes'],
  ['YouTube comment keywords', 'Yes, as a public reply', 'No'],
  ['TikTok', 'Comments in your inbox, you paste the reply', 'DM replies in beta for TikTok Business accounts'],
  ['Email signup page with a personal link', 'Yes, with a reminder DM', 'Collects email inside the DM'],
  ['Your data', 'On your own server', 'On ManyChat’s servers'],
];

const FAQS = [
  ['Do I need to code?', 'No. Claude runs every command and asks a few plain questions.'],
  ['What does it cost each month?', 'About $6 for hosting. Apify’s free monthly credit covers TikTok comments.'],
  ['What is the hosting, exactly?', 'A small computer in a data center that stays on day and night, so your keywords answer even when your laptop is closed. Claude sets it up and you never need to touch it.'],
  ['Does it work on Facebook?', 'Not yet. It works on Instagram and YouTube, and brings your TikTok comments into your inbox.'],
  ['Does it reply on TikTok?', 'TikTok gives no way to reply automatically, so TikTok comments land in your inbox with a suggested reply and a Copy and open TikTok button.'],
  ['I don’t have a website.', 'Setup gives you a free address (yourname.duckdns.org) with your privacy page on it.'],
  ['I don’t use an email tool.', 'Your list stays on your server. Download it as a CSV whenever you start one.'],
  ['Is it allowed by Instagram?', 'It uses Meta’s official Instagram API with an app that only works on your own account.'],
  ['Who sees my comments and emails?', 'You. They live on your own server.'],
  ['Mac or Windows?', 'Setup is tested on Windows. It only needs tools Macs have built in too, and a Mac test is next.'],
];

const half = Math.ceil(FAQS.length / 2);
const faqCol = (rows) => `<div>${rows.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('')}</div>`;
const buyBtn = (cls = '') => `<a class="s3-btn ${cls}" href="${BUY_URL}">Get Chat Manager</a>`;
const steps = (rows) => rows.map(([k, b, p]) => `<li>${icon(k)}<b>${b}</b><span>${p}</span></li>`).join('');

// The hero phone: the real flow, drawn the way Instagram shows it. Bubbles pop in one after another, then loop.
const heroPhone = `
<div class="cm-phone" role="img" aria-label="Someone comments MATH under a Reel, gets a public reply saying it was sent to their DMs, then a DM with a signup link, and joins the email list">
 <div class="cm-ph-head"><span class="cm-av me"></span><b>yourshop</b></div>
 <div class="cm-ph-post">
  <div class="cm-c a1"><span class="cm-av"></span><div><b>sam.makes</b> MATH</div></div>
  <div class="cm-c reply a2"><span class="cm-av me"></span><div><b>yourshop</b> Sent it to your DMs! 💌</div></div>
 </div>
 <div class="cm-ph-dm">
  <p class="cm-sys a3">In their DMs</p>
  <div class="cm-b me a3">Want the free calculator? Reply READY and I’ll send it over.</div>
  <div class="cm-b them a4">READY</div>
  <div class="cm-b me a5">Here you go! Pop in your email and it opens right away: yourshop.com/f/…</div>
  <p class="cm-sys a6">✓ Sam joined your email list</p>
 </div>
</div>`;

const CSS = `
.s3 .cm-hero{padding:clamp(28px,4vw,64px) 0 var(--s3-sec);overflow:hidden}
.s3 .cm-hero .s3-wrap{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:center;gap:clamp(32px,4vw,80px)}
.s3 .cm-hero h1{font-size:clamp(3rem,5.6vw,6.2rem)!important;line-height:.95!important;letter-spacing:-.015em!important}
.s3 .cm-hero h1 span{display:block}
.s3 .cm-hero h1 em{font-style:italic}
.s3 .cm-hero .s3-lede{margin-top:24px;max-width:30em}
.s3 .cm-buy{display:flex;flex-wrap:wrap;align-items:center;gap:20px 28px;margin-top:32px}
.s3 .cm-cost{font:400 clamp(2.6rem,3.6vw,3.4rem)/1 var(--s3-serif)}
.s3 .cm-cost small{display:block;margin-top:10px;font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.16em;text-transform:uppercase}
.s3 .cm-link{font:500 var(--s3-fs-ui)/1.3 var(--s3-sans);color:var(--s3-ink);text-underline-offset:4px}
.s3 .cm-stage{position:relative;display:flex;justify-content:center;padding:24px 0}
.s3 .cm-stage::before{content:"";position:absolute;width:min(560px,100%);aspect-ratio:1;top:50%;left:50%;transform:translate(-50%,-50%) rotate(8deg);background:var(--s3-sky);clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.s3 .cm-phone{position:relative;width:min(340px,100%);background:#fff;border:10px solid var(--s3-navy);border-radius:40px;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#000;box-shadow:0 30px 60px rgba(10,25,48,.18)}
.s3 .cm-ph-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #efefef;font-size:15px}
.s3 .cm-av{width:28px;height:28px;border-radius:50%;background:#d9d9d9;flex:none}
.s3 .cm-av.me{background:var(--s3-navy)}
.s3 .cm-ph-post{padding:12px 14px;border-bottom:1px solid #efefef;display:grid;gap:10px;font-size:15px;line-height:1.35}
.s3 .cm-c{display:flex;gap:10px;align-items:flex-start}
.s3 .cm-c.reply{margin-left:30px}
.s3 .cm-ph-dm{padding:12px;display:flex;flex-direction:column;gap:8px;min-height:300px}
.s3 .cm-b{max-width:82%;padding:9px 13px;border-radius:20px;font-size:15px;line-height:1.35}
.s3 .cm-b.me{align-self:flex-end;background:#3797f0;color:#fff}
.s3 .cm-b.them{align-self:flex-start;background:#efefef}
.s3 .cm-sys{align-self:center;margin:4px 0;font-size:15px;color:#555}
.s3 .cm-phone .a1,.s3 .cm-phone .a2,.s3 .cm-phone .a3,.s3 .cm-phone .a4,.s3 .cm-phone .a5,.s3 .cm-phone .a6{animation:cm-in 12s infinite both}
.s3 .cm-phone .a2{animation-delay:1.2s}.s3 .cm-phone .a3{animation-delay:2.4s}.s3 .cm-phone .a4{animation-delay:3.6s}.s3 .cm-phone .a5{animation-delay:4.8s}.s3 .cm-phone .a6{animation-delay:6s}
@keyframes cm-in{0%{opacity:0;transform:translateY(10px)}4%,90%{opacity:1;transform:none}100%{opacity:0}}
@media(prefers-reduced-motion:reduce){.s3 .cm-phone .a1,.s3 .cm-phone .a2,.s3 .cm-phone .a3,.s3 .cm-phone .a4,.s3 .cm-phone .a5,.s3 .cm-phone .a6{animation:none}}
.s3 .cm-band{background:var(--s3-navy);color:#fff}
.s3 .cm-band .s3-h2{color:#fff!important}
.s3 .cm-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,32px);margin:clamp(28px,3vw,48px) 0 0;list-style:none;padding:0}
.s3 .cm-flow li{position:relative}
.s3 .cm-flow li+li::before{content:"→";position:absolute;left:calc(-1 * clamp(16px,2vw,32px));top:14px;width:clamp(16px,2vw,32px);text-align:center;color:var(--s3-sky);font-size:1.5rem}
.s3 .cm-flow svg,.s3 .cm-feat svg{width:56px;height:56px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.s3 .cm-band .cm-flow svg{color:var(--s3-sky)}
.s3 .cm-flow b,.s3 .cm-feat b{display:block;margin-top:12px;font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .cm-flow span,.s3 .cm-feat span{display:block;margin-top:6px}
.s3 .cm-band .cm-flow span{color:var(--s3-mist)}
.s3 .cm-demo .s3-lede{margin-top:14px;max-width:40em}
.s3 .cm-window{margin-top:clamp(24px,3vw,40px);border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px var(--s3-line),0 30px 60px rgba(10,25,48,.12)}
.s3 .cm-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--s3-mist)}
.s3 .cm-bar i{width:12px;height:12px;border-radius:50%;background:#fff}
.s3 .cm-bar span{margin-left:12px;padding:4px 14px;border-radius:999px;background:#fff;font-size:var(--s3-fs-label)}
.s3 .cm-window iframe{display:block;width:100%;height:min(760px,80vh);border:0}
.s3 .cm-demo .cm-buy{margin-top:24px}
.s3 .cm-feat{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.6vw,24px);margin:clamp(28px,3vw,48px) 0 0;list-style:none;padding:0}
.s3 .cm-feat li{background:#fff;border-radius:18px;padding:clamp(20px,2vw,28px)}
.s3 .cm-feat li:nth-child(even){background:var(--s3-mist)}
.s3 .cm-save{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(28px,3vw,48px)}
.s3 .cm-bars{display:grid;gap:22px}
.s3 .cm-bars p{display:flex;justify-content:space-between;gap:12px;margin:0 0 8px;font-weight:500}
.s3 .cm-bars .bar{height:44px;border-radius:999px}
.s3 .cm-bars .mc .bar{width:100%;background:var(--s3-navy)}
.s3 .cm-bars .us .bar{width:49%;background:var(--s3-sky)}
.s3 .cm-big{font:400 clamp(4rem,9vw,8rem)/.9 var(--s3-serif);margin:0}
.s3 .cm-big+p{margin-top:12px;max-width:24em}
.s3 .cm-bring{display:grid;grid-template-columns:1fr 1fr;gap:0 clamp(24px,3vw,56px);margin-top:clamp(28px,3vw,40px)}
.s3 .cm-bring div{padding:18px 0;border-top:1px solid var(--s3-line)}
.s3 .cm-bring b{display:block;font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .cm-bring span{display:block;margin-top:6px}
.s3 .cm-compare{margin-top:clamp(24px,3vw,40px);overflow-x:auto}
.s3 .cm-compare table{width:100%;min-width:560px;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden}
.s3 .cm-compare th,.s3 .cm-compare td{text-align:left;padding:14px 18px;border-bottom:1px solid var(--s3-line);vertical-align:top}
.s3 .cm-compare thead th{font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.12em;text-transform:uppercase}
.s3 .cm-compare tbody th{font-weight:500}
.s3 .cm-faq .s3-faq{display:grid;grid-template-columns:1fr 1fr;gap:0 48px;margin-top:20px}
.s3 .cm-faq .s3-faq>div details:first-child{border-top:1px solid var(--s3-line)}
.s3 .cm-end{background:var(--s3-mist);text-align:center}
.s3 .cm-end .s3-lede{margin:18px auto 28px;max-width:30em}
.s3 .cm-end .s3-fine{margin-top:28px}
@media(max-width:900px){
 .s3 .cm-hero .s3-wrap,.s3 .cm-faq .s3-faq,.s3 .cm-save,.s3 .cm-bring{grid-template-columns:1fr}
 .s3 .cm-flow,.s3 .cm-feat{grid-template-columns:1fr 1fr;row-gap:32px}
 .s3 .cm-flow li:nth-child(odd)::before{display:none}
 .s3 .cm-faq .s3-faq>div+div details:first-child{border-top:0}
}
@media(max-width:700px){
 .s3 .cm-window{display:none}
 .s3 .cm-buy{flex-direction:column;align-items:stretch}
 .s3 .cm-link{text-align:center}
 .s3 .cm-compare table{min-width:0}
 .s3 .cm-compare th,.s3 .cm-compare td{padding:12px 8px}
 .s3 .cm-compare thead th{letter-spacing:.06em}
}
@media(max-width:460px){
 .s3 .cm-flow,.s3 .cm-feat{grid-template-columns:1fr}
 .s3 .cm-flow li::before{display:none}
}
`;

export function build() {
  const body = `
<section class="cm-hero"><div class="s3-wrap">
 <div>
  <h1><span>Comment a word.</span><span>Get the <em>freebie.</em></span></h1>
  <p class="s3-lede">Your freebie goes out the second someone comments or DMs a keyword. They join your email list, and every comment lands in one inbox. No ManyChat bill.</p>
  <div class="cm-buy"><div class="cm-cost">${PRICE}<small>One-time</small></div>${buyBtn()}<a class="cm-link" href="#demo">Try the demo →</a></div>
 </div>
 <div class="cm-stage">${heroPhone}</div>
</div></section>
<section class="cm-band s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">How it works</h2>
 <ol class="cm-flow">${steps(FLOW)}</ol>
</div></section>
<section class="cm-demo s3-sec" id="demo"><div class="s3-wrap">
 <h2 class="s3-h2">Click around the real thing.</h2>
 <p class="s3-lede">Chat Manager for a made-up shop. Open a conversation, try a keyword template, look at the stats. Nothing here is saved or sent.</p>
 <div class="cm-window"><div class="cm-bar" aria-hidden="true"><i></i><i></i><i></i><span>demo.scrollyseo.com</span></div><iframe src="${DEMO_URL}" title="Chat Manager demo for a made-up shop"></iframe></div>
 <div class="cm-buy"><a class="s3-btn black" href="${DEMO_URL}" target="_blank" rel="noopener">Open the demo full screen</a></div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Everything it does</h2>
 <ul class="cm-feat">${steps(FEATURES)}</ul>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Pay once. Keep it.</h2>
 <div class="cm-save">
  <div><p class="cm-big">${PRICE}</p><p>One time, plus about $6 a month for hosting. ManyChat Pro starts around $29 a month and goes up as more people message you.</p></div>
  <div class="cm-bars" role="img" aria-label="First year: ManyChat Pro about $348 or more; Chat Manager about $169 including hosting">
   <div class="mc"><p><span>ManyChat Pro, first year</span><span>$348+</span></p><div class="bar"></div></div>
   <div class="us"><p><span>Chat Manager, first year</span><span>about $169</span></p><div class="bar"></div></div>
  </div>
 </div>
</div></section>
<section class="cm-band s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Set up in an afternoon</h2>
 <ol class="cm-flow">${steps(SETUP)}</ol>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">What you need</h2>
 <div class="cm-bring">${BRING.map(([b, p]) => `<div><b>${b}</b><span>${p}</span></div>`).join('')}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Chat Manager and ManyChat</h2>
 <div class="cm-compare"><table>
  <thead><tr><th scope="col"></th><th scope="col">Chat Manager</th><th scope="col">ManyChat</th></tr></thead>
  <tbody>${COMPARE.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody>
 </table></div>
</div></section>
<section class="cm-faq s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Questions</h2>
 <div class="s3-faq">${faqCol(FAQS.slice(0, half))}${faqCol(FAQS.slice(half))}</div>
</div></section>
<section class="cm-end s3-sec" id="buy"><div class="s3-wrap">
 <h2 class="s3-h2">Your keywords, your list, your server.</h2>
 <p class="s3-lede">${PRICE} one-time. Download it, open it in Claude and say “set up my Chat Manager”.</p>
 ${buyBtn()}
 <p class="s3-fine">Claude is made by Anthropic and is sold separately. ManyChat is a trademark of ManyChat, Inc.; prices checked October 2026. First-year totals are estimates: ManyChat Pro at its lowest tier, Chat Manager with 12 months of hosting.</p>
</div></section>`;
  return s3shell(body, CSS);
}
