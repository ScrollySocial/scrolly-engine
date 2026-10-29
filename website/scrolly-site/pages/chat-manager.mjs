// Chat Manager sales page (DRAFT). Rebuilt 2026-10-24 after Mercedes: "far too boring" next to /product-reels/, then
// her round 2: a real-looking phone (no star doodle), flow icons joined by a line (arrows sat against the icons), the
// demo on a laptop that fits one screen, "vs", a reworked hero, and the real benefits: one flat ~$6 a month whatever
// your audience (ManyChat charges by contacts, and Pro is not even its top tier), YouTube, and it's your own software.
// LIVE 2026-10-26 as WP page 1767 (/chat-manager/), product 1764 (founding beta, stock 10). PRICE is a
// placeholder (Mercedes decides). The live demo is the real dashboard for a made-up shop
// (automation/n8n-comments/docker-compose.demo.yml), framed by theambitiondepartment.com only.
// ManyChat prices: checked on manychat.com/pricing 2026-10-26 (monthly: Free 25, Essential $17/250, Pro $39/2,500,
// Business $99/7,500, Advanced $199/25,000 active contacts; channels Instagram, TikTok, WhatsApp, Messenger, no YouTube).
// Others, checked on their own pricing pages 2026-10-26: LinkDM Free 1,000 DMs/mo, Pro $19/mo (comment auto-reply is Pro);
// CreatorFlow Free 500 DMs/mo incl. comment-to-DM, Pro $15/mo monthly ($12 yearly), email gate on paid; Inro Free 100
// active contacts, Pro from EUR 12.99/mo for 500, priced by contacts. None list YouTube.
// Before publishing: create the WooCommerce download (kit/dist zip) and point BUY_URL at its add-to-cart link.
import { s3shell } from '../lib.mjs';

export const id = 1767; // WP page, published 2026-10-26 (founding beta)
export const title = 'Chat Manager, The Ambition Department';

const PRICE = '$97';
const BUY_URL = '/?add-to-cart=1764'; // WooCommerce product 1764 (private until the page is approved)
const BETA = 'Founding beta price · first 10 buyers';
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
  gift: '<rect x="6" y="18" width="36" height="24" rx="2"/><path d="M4 12h40v6H4zM24 12v30"/><path d="M24 12c-4-8-14-6-10 0M24 12c4-8 14-6 10 0"/>',
  server: '<rect x="8" y="7" width="32" height="13" rx="3"/><rect x="8" y="27" width="32" height="13" rx="3"/><path d="M15 13.5h2M15 33.5h2M25 13.5h8M25 33.5h8"/>',
  camera: '<rect x="6" y="6" width="36" height="36" rx="10"/><circle cx="24" cy="24" r="8"/><circle cx="34.5" cy="13.5" r="1.5"/>',
  clock: '<circle cx="24" cy="24" r="18"/><path d="M24 13v11l7 5"/>',
  flat: '<path d="M6 24V8a2 2 0 0 1 2-2h16l18 18-18 18z"/><circle cx="15" cy="15" r="3"/>',
  brush: '<path d="M38 6L20 24l4 4L42 10z"/><path d="M18 26c-6 0-8 4-8 8 0 3-2 5-4 6 8 2 16-2 16-10z"/>',
};
const icon = (k) => `<svg viewBox="0 0 48 48" aria-hidden="true">${I[k]}</svg>`;

const FLOW = [
  ['comment', 'They comment', 'A keyword under your Reel.'],
  ['dm', 'They get a DM', 'Plus a “check your DMs” reply.'],
  ['gift', 'They get the freebie', 'And their email joins your list.'],
  ['inbox', 'You see it all', 'One inbox, every platform.'],
];

// The three reasons it beats a monthly bill (Mercedes 2026-10-24).
const WHY = [
  ['flat', 'One flat cost', 'About $6 a month to run, whether 50 people message you or 50,000. No contact limits, no surprise upgrades, no ongoing Claude costs.'],
  ['yt', 'YouTube too', 'Keyword comments under your videos get an automatic reply. ManyChat doesn’t do YouTube.'],
  ['brush', 'It’s your software', 'Change the colors and fonts, add a chart, add a feature. Just ask Claude.'],
];

// ManyChat by audience size (monthly billing, plan limits) vs Chat Manager's hosting.
const TIERS = [
  ['250', 'Essential', 17],
  ['2,500', 'Pro', 39],
  ['7,500', 'Business', 99],
  ['25,000', 'Advanced', 199],
];
// Monthly cost at the same four audience sizes, from each tool's own pricing page (2026-10-26). LinkDM and CreatorFlow
// count DMs, not people: counted as one DM per person (the cheapest reading for them). Inro bills in euros (its calculator).
// null = no plan of that size listed. [label, amount, shown]
const OTHERS = [
  ['LinkDM', [[0, 'Free'], [19, '$19'], [19, '$19'], [19, '$19']]],
  ['CreatorFlow', [[0, 'Free'], [15, '$15'], [30, '$30'], [null, 'No plan this size']]],
  ['Inro', [[12.99, '€12.99'], [49.99, '€49.99'], [124.99, '€124.99'], [339.99, '€339.99']]],
];

const FEATURES = [
  ['comment', 'Keywords', 'Comments, DMs and Story replies'],
  ['reply', '“Check your DMs”', 'A public reply, in rotating wordings'],
  ['heart', 'Only for followers', 'Optional: follow first, then the freebie'],
  ['mail', 'Email signups', 'MailerLite, Kit, Mailchimp and more'],
  ['bell', 'One reminder', 'If they forget to sign up'],
  ['yt', 'YouTube', 'Keyword comments get a public reply'],
  ['chart', 'Stats', 'Signups, top posts, your reply time'],
  ['pulse', 'Health check', 'Tells you when something needs you'],
];

const SETUP = [
  ['download', 'Download', 'Get the kit.'],
  ['spark', 'Ask Claude', '“Set up my Chat Manager.”'],
  ['check', 'Connect', 'Make a few free accounts, sign in, paste the keys.'],
  ['power', 'Go live', 'Turn your first keyword on.'],
];

// Plain words first (Mercedes 2026-10-24: "a $6 a month server" scares people off).
const BRING = [
  ['spark', 'A paid Claude plan', 'Pro or higher, for setup and any changes you ask for. Day to day, Chat Manager runs on its own, with no Claude costs.'],
  ['server', 'About $6 a month for hosting', 'Chat Manager needs a spot online that’s always on, like a tiny rented computer. Claude creates it for you at DigitalOcean, in your name. You only add a card.'],
  ['camera', 'An Instagram Professional account', 'Creator or Business. It’s free to switch.'],
  ['clock', 'About an hour, once', 'You make a few free accounts (Meta for developers, Google Cloud, DigitalOcean), sign in, paste keys and press approve.'],
];

// Plain and checkable; no claim here without a source (vault comment-to-dm-n8n-plan.md and the prices above).
// Columns: Chat Manager, ManyChat, LinkDM, CreatorFlow, Inro. Competitors only get "Yes" where their own pricing page
// lists the feature (2026-10-26); otherwise "Not listed".
const TOOLS = ['Chat Manager', 'ManyChat', 'LinkDM', 'CreatorFlow', 'Inro'];
const COMPARE = [
  ['What you pay', `${PRICE} once + about $6 a month`, 'Free for 25 people a month, then from $17 a month', 'Free for 1,000 DMs a month, then $19 a month', 'Free for 500 DMs a month, then $15 a month', 'Free for 100 contacts a month, then from €12.99 a month'],
  ['Price tied to how many people message you', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Instagram comment and DM keywords', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Story reply keywords', 'Yes', 'Yes', 'Yes', 'Yes', 'Not listed'],
  ['“Check your DMs” reply under the comment', 'Yes', 'Yes', 'Yes, on Pro', 'Not listed', 'Not listed'],
  ['YouTube comment keywords', 'Yes', 'No', 'Not listed', 'Not listed', 'Not listed'],
  ['Collect emails', 'Yes, on a signup page with a reminder DM', 'Yes, inside the DM', 'Lead capture, on Pro', 'Yes, on Pro', 'Not listed'],
  ['Change the look or add features', 'Yes, it’s your own copy', 'No', 'No', 'No', 'No'],
  ['Your data', 'On your own server', 'On ManyChat’s servers', 'On LinkDM’s servers', 'On CreatorFlow’s servers', 'On Inro’s servers'],
];

const FAQS = [
  ['Do I need to code?', 'No. Claude runs every command and asks a few plain questions.'],
  ['Are there ongoing Claude costs?', 'No. Keyword replies, signups and stats run on your hosting without Claude. Claude is only used when you ask it to set up, update or change something. The one exception: if you choose to have replies drafted automatically, that runs through Claude’s pay-as-you-go API or as a scheduled task on your Claude plan.'],
  ['What does it cost each month?', 'About $6 for hosting, the same however many people message you. Apify’s free monthly credit covers TikTok comments.'],
  ['What is the hosting, exactly?', 'A small computer in a data center that stays on day and night, so your keywords answer even when your laptop is closed. Claude sets it up and you never need to touch it.'],
  ['Can I really change it?', 'Yes. It’s your own copy of the software. Ask Claude for new colors, fonts, a chart or a feature, and it edits your copy.'],
  ['Does it work on Facebook?', 'Not out of the box. The software can work with Facebook Pages, but Meta first has to review and approve your app by hand, which takes days and isn’t guaranteed. So Facebook isn’t part of the setup included.'],
  ['Does it reply on TikTok?', 'TikTok gives no way to reply automatically, so TikTok comments land in your inbox with a suggested reply and a Copy and open TikTok button.'],
  ['I don’t have a website.', 'Setup gives you a free web address (yourname.duckdns.org) with a secure https connection and your privacy page on it. Your dashboard is behind your own password.'],
  ['I don’t use an email tool.', 'Freebies still go out: people see theirs right after signing up. The emails are kept on your server, ready to download as a CSV whenever you start an email tool.'],
  ['Can people get it in the DM instead?', 'Yes. Give them two buttons, “Send it here” and “By email”, and they pick. The DM link reaches everyone; the email button grows your list.'],
  ['Can I run it for my clients?', 'Yes, one copy per client. Each copy runs one Instagram account on its own hosting (about $6 a month each), so every client’s inbox, list and data stay separate. Setting up each one takes about an hour, with that client’s Meta account.'],
  ['Does it work with my client’s email tool?', 'MailerLite, Kit, Mailchimp, beehiiv and Flodesk connect directly: the client shares one key. Klaviyo, ActiveCampaign, HubSpot and others connect through a webhook (Zapier, Make or n8n). Or download the list as a CSV.'],
  ['Is it allowed by Instagram?', 'It uses Meta’s official Instagram API with an app that only works on your own account.'],
  ['Mac or Windows?', 'Both. Setup uses tools that work on Windows and Mac.'],
];

// Limits to know before buying: the platforms' own rules, stated plainly.
const LIMITS = [
  ['Instagram’s 24-hour rule', 'Follow-ups and reminders only reach people who messaged you in the last 24 hours. Each comment gets one private reply.'],
  ['Professional accounts only', 'Instagram needs a Creator or Business account. Personal accounts can’t be automated.'],
  ['YouTube replies in public', 'YouTube has no DMs, so keyword comments get a public reply with the link.'],
  ['TikTok and Facebook', 'TikTok comments come into your inbox to answer by hand. Facebook Pages need Meta’s manual review (days, and not guaranteed), so they aren’t part of the setup included.'],
  ['Other comments', 'Keyword replies are automatic. Other comments wait in your inbox for you to answer. Want Claude to answer them on its own? It’s your software, so ask Claude to add it.'],
  ['You own the upkeep', 'It runs on your own hosting. Updates are one sentence to Claude, and there are no setup calls.'],
  ['Claude is separate', 'You need your own Claude plan to set it up and change it. Claude is made by Anthropic and sold separately.'],
  ['How we compared prices', 'Each tool’s monthly plan from its own pricing page, checked October 2026. DMs count as one per person, the cheapest case for them. Inro bills in euros. “Not listed” means their page doesn’t mention it.'],
];

const half = Math.ceil(FAQS.length / 2);
const faqCol = (rows) => `<div>${rows.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('')}</div>`;
const buyBtn = (cls = '') => `<a class="s3-btn ${cls}" href="${BUY_URL}">Get Chat Manager</a>`;
const steps = (rows) => rows.map(([k, b, p]) => `<li>${icon(k)}<b>${b}</b><span>${p}</span></li>`).join('');

// The hero phone: a real-proportioned iPhone-style frame with the real flow inside, drawn the way Instagram shows it.
// Bubbles pop in one after another, then loop.
const heroPhone = `
<div class="cm-phone" role="img" aria-label="Someone comments MATH under a Reel and gets a public reply saying it was sent to their DMs. In their DMs they reply READY, get a signup link and join the email list.">
 <div class="cm-screen">
  <div class="cm-status"><span>9:41</span><i class="cm-island"></i><span>5G</span></div>
  <div class="cm-ph-head"><span class="cm-back">‹</span><b>Comments</b></div>
  <div class="cm-ph-post">
   <div class="cm-c a1"><span class="cm-av"></span><div><b>sam.makes</b> MATH</div></div>
   <div class="cm-c reply a2"><span class="cm-av me"></span><div><b>yourshop</b> Sent it to your DMs! 💌</div></div>
  </div>
  <div class="cm-ph-dm">
   <p class="cm-sys a3">In Sam’s DMs</p>
   <div class="cm-b me a3">Want the free calculator? Reply READY 👇</div>
   <div class="cm-b them a4">READY</div>
   <div class="cm-b me a5">Here you go! yourshop.com/f/…</div>
   <p class="cm-sys a6">✓ Sam joined your list</p>
  </div>
  <i class="cm-home"></i>
 </div>
</div>`;

// One grouped bar chart: five bars per audience size, all on one scale (the most expensive bar = full height).
const SERIES = [
  ['ManyChat', 'mc', TIERS.map((t) => [t[2], `$${t[2]}`])],
  ...OTHERS.map(([name, v], k) => [name, ['ld', 'cf', 'in'][k], v.map(([a, shown]) => [a, a === null ? 'None' : a === 0 ? 'Free' : `${shown[0]}${Math.round(a)}`])]),
  ['Chat Manager', 'us', TIERS.map(() => [6, '$6'])],
];
const maxCost = Math.max(...SERIES.flatMap(([, , v]) => v.map(([a]) => a || 0)));
const tierChart = `
<div class="cm-tiers" role="img" aria-label="Monthly cost by audience size. ${TIERS.map(([n], i) => `${n} people: ${SERIES.map(([name, , v]) => `${name} ${v[i][1]}`).join(', ')}`).join('. ')}.">
 ${TIERS.map(([n], i) => `<div class="cm-tier">
  <div class="cm-cols">${SERIES.map(([name, cls, v]) => `<div class="${cls}${v[i][0] === null ? ' none' : ''}" style="height:${v[i][0] === null ? 0 : Math.max(2, Math.round(((v[i][0] || 0) / maxCost) * 100))}%"><span>${v[i][1]}</span></div>`).join('')}</div>
  <p><b>${n}</b> people a month</p>
 </div>`).join('')}
</div>
<div class="cm-key" aria-hidden="true">${SERIES.map(([name, cls]) => `<span class="${cls}">${name}</span>`).join('')}</div>
<p class="cm-keynote">Monthly cost to run. Chat Manager is ${PRICE} once, then about $6 a month for hosting.</p>`;

// "It's your software": what owning the code looks like, as a chat with Claude.
const yoursChat = `
<div class="cm-chat" role="img" aria-label="Example requests to Claude: make my dashboard match my brand colors; add a chart of signups by day of the week; use my brand fonts on the signup page. Claude answers that each one is done.">
 <div class="cm-q">Make my dashboard match my brand colors.</div>
 <div class="cm-a">Done. Your pink and navy are on every page.</div>
 <div class="cm-q">Add a chart of signups by day of the week.</div>
 <div class="cm-a">Added to Stats. Saturdays are your best day.</div>
 <div class="cm-q">Use my brand fonts on the signup page.</div>
 <div class="cm-a">Done.</div>
</div>`;

const CSS = `
.s3 .cm-hero{padding:clamp(24px,3vw,48px) 0;overflow:hidden}
.s3 .cm-hero .s3-wrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);align-items:center;gap:clamp(32px,4vw,80px)}
.s3 .cm-hero h1{font-size:clamp(3rem,min(5vw,9vh),5.4rem)!important;line-height:.95!important;letter-spacing:-.015em!important}
.s3 .cm-hero h1 span{display:block}
.s3 .cm-hero h1 em{font-style:italic}
.s3 .cm-hero .s3-lede{margin-top:24px;max-width:31em}
.s3 .cm-buy{display:flex;flex-wrap:wrap;align-items:center;gap:20px 28px;margin-top:32px}
.s3 .cm-link{font:500 var(--s3-fs-ui)/1.3 var(--s3-sans);color:var(--s3-ink);text-underline-offset:4px}
.s3 .cm-beta{display:inline-block;margin:0 0 18px;padding:8px 18px;border-radius:999px;background:var(--s3-navy);color:#fff;font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.14em;text-transform:uppercase}
/* two cream sections in a row: one gap between them, not two */
.s3 .s3-sec:not(.cm-band):not(.cm-end)+.s3-sec:not(.cm-band):not(.cm-end){padding-top:0}
.s3 .cm-stage{display:flex;justify-content:center}
.s3 .cm-phone{height:min(540px,calc(100vh - 190px));min-height:430px;aspect-ratio:9/17;max-width:100%;padding:10px;border-radius:46px;background:#141518;box-shadow:inset 0 0 0 2px #3a3c42,0 40px 80px rgba(10,25,48,.22)}
.s3 .cm-screen{position:relative;height:100%;border-radius:37px;background:#fff;overflow:hidden;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#000}
.s3 .cm-status{display:flex;align-items:center;justify-content:space-between;padding:12px 24px 4px;font-size:15px;font-weight:600}
.s3 .cm-island{width:84px;height:24px;border-radius:999px;background:#000}
.s3 .cm-ph-head{display:flex;align-items:center;gap:10px;padding:4px 14px 8px;border-bottom:1px solid #efefef;font-size:15px}
.s3 .cm-ph-head small{display:block;color:#737373;font-size:15px}
.s3 .cm-back{font-size:28px;line-height:1;margin-right:2px}
.s3 .cm-av{width:30px;height:30px;border-radius:50%;background:#d9d9d9;flex:none}
.s3 .cm-av.me{background:var(--s3-navy)}
.s3 .cm-ph-post{padding:10px 14px;border-bottom:1px solid #efefef;display:grid;gap:8px;font-size:15px;line-height:1.3}
.s3 .cm-c{display:flex;gap:10px;align-items:flex-start}
.s3 .cm-c.reply{margin-left:30px}
.s3 .cm-ph-dm{flex:1;padding:8px 12px;display:flex;flex-direction:column;justify-content:center;gap:7px}
.s3 .cm-b{max-width:84%;padding:8px 13px;border-radius:20px;font-size:15px;line-height:1.3}
.s3 .cm-b.me{align-self:flex-end;background:#3797f0;color:#fff}
.s3 .cm-b.them{align-self:flex-start;background:#efefef}
.s3 .cm-sys{align-self:center;margin:2px 0;font-size:15px;color:#555}
.s3 .cm-home{display:block;flex:none;width:110px;height:5px;margin:6px auto 9px;border-radius:999px;background:#000}
.s3 .cm-phone .a1,.s3 .cm-phone .a2,.s3 .cm-phone .a3,.s3 .cm-phone .a4,.s3 .cm-phone .a5,.s3 .cm-phone .a6{animation:cm-in 12s infinite both}
.s3 .cm-phone .a2{animation-delay:1.2s}.s3 .cm-phone .a3{animation-delay:2.4s}.s3 .cm-phone .a4{animation-delay:3.6s}.s3 .cm-phone .a5{animation-delay:4.8s}.s3 .cm-phone .a6{animation-delay:6s}
@keyframes cm-in{0%{opacity:0;transform:translateY(10px)}4%,90%{opacity:1;transform:none}100%{opacity:0}}
@media(prefers-reduced-motion:reduce){.s3 .cm-phone .a1,.s3 .cm-phone .a2,.s3 .cm-phone .a3,.s3 .cm-phone .a4,.s3 .cm-phone .a5,.s3 .cm-phone .a6{animation:none}}
.s3 .cm-band{background:var(--s3-navy);color:#fff}
.s3 .cm-mid>.s3-h2,.s3 .cm-mid>.s3-lede,.s3 .cm-mid>.cm-swipe{text-align:center}
.s3 .cm-mid>.s3-lede{max-width:none}
.s3 .cm-mid .cm-key{justify-content:center}
.s3 .cm-mid .cm-keynote{text-align:center}
.s3 .cm-band .s3-h2{color:#fff!important}
.s3 .cm-flow{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,32px);margin:clamp(28px,3vw,48px) 0 0;list-style:none;padding:0;text-align:center}
.s3 .cm-flow::before{content:"";position:absolute;top:40px;left:12.5%;right:12.5%;border-top:2px dashed var(--s3-sky);opacity:.6}
.s3 .cm-flow li{position:relative}
.s3 .cm-flow svg{position:relative;box-sizing:content-box;width:44px;height:44px;padding:16px;border-radius:50%;background:var(--s3-navy);box-shadow:0 0 0 2px var(--s3-sky);color:var(--s3-sky);fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.s3 .cm-feat svg,.s3 .cm-why svg{width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.s3 .cm-flow b,.s3 .cm-feat b,.s3 .cm-why b{display:block;margin-top:14px;font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .cm-flow span,.s3 .cm-feat span,.s3 .cm-why span{display:block;margin-top:6px}
.s3 .cm-band .cm-flow span{color:var(--s3-mist)}
.s3 .cm-demo{padding:clamp(40px,4vw,64px) 0}
.s3 .cm-demo-head{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:16px 32px}
.s3 .cm-demo .s3-lede{margin-top:10px}
.s3 .cm-laptop{width:min(100%,calc((100vh - 250px) * 1.5));min-width:min(100%,640px);margin:clamp(16px,2vw,28px) auto 0}
.s3 .cm-lid{padding:2.2% 2.2% 2.6%;border-radius:18px 18px 4px 4px;background:#141518;box-shadow:inset 0 0 0 2px #3a3c42}
.s3 .cm-lid iframe{display:block;width:100%;aspect-ratio:16/10;border:0;border-radius:4px;background:#fff}
.s3 .cm-base{position:relative;height:14px;margin:0 -9%;border-radius:2px 2px 16px 16px;background:linear-gradient(#e2e5ec,#b3b9c8)}
.s3 .cm-base::before{content:"";position:absolute;left:50%;top:0;width:16%;height:6px;transform:translateX(-50%);border-radius:0 0 8px 8px;background:#9aa2b5}
.s3 .cm-demo-phone{display:none}
.s3 .cm-why{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(12px,1.6vw,24px);margin:clamp(28px,3vw,48px) 0 0;list-style:none;padding:0}
.s3 .cm-why li{background:#fff;border-radius:20px;padding:clamp(24px,2.6vw,36px)}
.s3 .cm-yours{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(24px,4vw,72px);align-items:center}
.s3 .cm-yours .s3-lede{margin-top:16px}
.s3 .cm-chat{display:flex;flex-direction:column;gap:10px;padding:clamp(20px,2.4vw,32px);border-radius:20px;background:#fff}
.s3 .cm-q,.s3 .cm-a{max-width:80%;padding:12px 16px;border-radius:18px}
.s3 .cm-q{align-self:flex-end;background:var(--s3-navy);color:#fff}
.s3 .cm-a{align-self:flex-start;background:var(--s3-mist)}
.s3 .cm-tiers{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,2vw,32px);margin-top:clamp(40px,4vw,64px)}
.s3 .cm-cols{display:flex;align-items:flex-end;justify-content:center;gap:clamp(4px,.6vw,8px);height:min(240px,30vh);border-bottom:2px solid var(--s3-ink)}
.s3 .cm-cols div{position:relative;flex:1;max-width:44px;border-radius:8px 8px 0 0;border:1.5px solid var(--s3-navy);border-bottom:0}
.s3 .cm-cols div.none{border:0}
.s3 .cm-cols span{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding-bottom:5px;font:500 15px/1 var(--s3-sans);white-space:nowrap}
.s3 .cm-cols .us span{font-weight:700}
.s3 .mc{--c:var(--s3-navy)}.s3 .ld{--c:#3f5579}.s3 .cf{--c:#8592ad}.s3 .in{--c:#fff}.s3 .us{--c:var(--s3-sky)}
.s3 .cm-cols div{background:var(--c)}
.s3 .cm-cols .us{border-color:var(--s3-sky)}
.s3 .cm-tier p{margin:12px 0 0;text-align:center}
.s3 .cm-key{display:flex;flex-wrap:wrap;gap:12px 24px;margin-top:28px}
.s3 .cm-key span{display:flex;align-items:center;gap:8px}
.s3 .cm-key span::before{content:"";width:18px;height:18px;border-radius:4px;background:var(--c);border:1.5px solid var(--s3-navy)}
.s3 .cm-key .us::before{border-color:var(--s3-sky)}
.s3 .cm-keynote{margin:14px 0 0}
.s3 .cm-feat{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.6vw,24px);margin:clamp(28px,3vw,48px) 0 0;list-style:none;padding:0}
.s3 .cm-feat li{background:#fff;border-radius:18px;padding:clamp(18px,1.8vw,24px)}
.s3 .cm-need span{font-size:var(--s3-fs-fine)}
.s3 .cm-know{border-radius:24px;background:var(--s3-mist);padding:clamp(28px,3.4vw,52px)}
.s3 .cm-limits{display:grid;grid-template-columns:repeat(2,1fr);gap:18px clamp(24px,4vw,64px);margin:clamp(20px,2.4vw,32px) 0 0;padding:0;list-style:none}
.s3 .cm-limits li{position:relative;padding-left:40px}
.s3 .cm-limits li::before{content:"i";position:absolute;left:0;top:1px;width:26px;height:26px;border-radius:50%;background:var(--s3-navy);color:#fff;font:italic 400 1.1rem/26px var(--s3-serif);text-align:center}
.s3 .cm-limits b{display:block;font-weight:600}
.s3 .cm-limits span{display:block;margin-top:2px}
.s3 .cm-bring{display:grid;grid-template-columns:1fr 1fr;gap:0 clamp(24px,3vw,56px);margin-top:clamp(28px,3vw,40px)}
.s3 .cm-bring div{padding:18px 0;border-top:1px solid var(--s3-line)}
.s3 .cm-bring b{display:block;font:400 var(--s3-fs-title)/1.15 var(--s3-serif)}
.s3 .cm-bring span{display:block;margin-top:6px}
.s3 .cm-compare{margin-top:clamp(24px,3vw,40px);overflow-x:auto}
.s3 .cm-compare table{width:100%;min-width:900px;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden}
.s3 .cm-compare th,.s3 .cm-compare td{text-align:left;padding:11px 18px;border-bottom:1px solid var(--s3-line);vertical-align:top}
.s3 .cm-compare thead th{font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.12em;text-transform:uppercase}
.s3 .cm-compare thead th:nth-child(2){background:var(--s3-sky)}
.s3 .cm-compare tbody th{font-weight:500;position:sticky;left:0;background:#fff;min-width:11em}
.s3 .cm-compare thead th:first-child{position:sticky;left:0;background:#fff}
.s3 .cm-swipe{display:none;margin:12px 0 0;color:var(--s3-muted)}
.s3 .cm-faq .s3-faq{display:grid;grid-template-columns:1fr 1fr;gap:0 48px;margin-top:20px}
.s3 .cm-faq .s3-faq>div details:first-child{border-top:1px solid var(--s3-line)}
.s3 .cm-end{background:var(--s3-mist);text-align:center}
.s3 .cm-end .s3-lede{margin:18px auto 28px;max-width:30em}
@media(max-width:900px){
 .s3 .cm-hero .s3-wrap,.s3 .cm-faq .s3-faq,.s3 .cm-bring,.s3 .cm-yours,.s3 .cm-why,.s3 .cm-limits{grid-template-columns:1fr}
 .s3 .cm-phone{height:auto;width:min(300px,100%);min-height:0}
 .s3 .cm-flow,.s3 .cm-feat{grid-template-columns:1fr 1fr;row-gap:40px}
 .s3 .cm-tiers{grid-template-columns:1fr 1fr;row-gap:48px}
 .s3 .cm-flow::before{display:none}
 .s3 .cm-faq .s3-faq>div+div details:first-child{border-top:0}
}
@media(max-width:700px){
 .s3 .cm-laptop{display:none}
 .s3 .cm-buy{flex-direction:column;align-items:stretch}
 .s3 .cm-link{text-align:center}
 .s3 .cm-tiers{grid-template-columns:1fr;row-gap:36px}
 .s3 .cm-cols{height:170px}
 .s3 .cm-compare table{min-width:0;width:auto}
 .s3 .cm-compare tbody th{min-width:8.2em;max-width:8.2em}
 .s3 .cm-compare td{min-width:9.5em}
 .s3 .cm-swipe{display:block}
 .s3 .cm-compare th,.s3 .cm-compare td{padding:12px 8px}
 .s3 .cm-compare thead th{letter-spacing:.06em}
}
@media(max-width:460px){
 .s3 .cm-flow,.s3 .cm-feat{grid-template-columns:1fr}
}
`;

export function build() {
  const body = `
<section class="cm-hero"><div class="s3-wrap">
 <div>
  <h1><span>Turn comments into</span><span><em class="or">email signups.</em></span></h1>
  <p class="s3-lede">Your own comment-to-DM software for Instagram and YouTube.<br>About $6 a month to run, whatever your list size.</p>
  <div class="cm-buy">${buyBtn()}<a class="cm-link" href="#demo">Try the demo →</a></div>
 </div>
 <div class="cm-stage">${heroPhone}</div>
</div></section>
<section class="cm-band s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">How it works</h2>
 <ol class="cm-flow">${steps(FLOW)}</ol>
</div></section>
<section class="cm-demo" id="demo"><div class="s3-wrap">
 <div class="cm-demo-head"><div><h2 class="s3-h2">Click around the real thing.</h2><p class="s3-lede">A made-up shop. Nothing here is saved or sent.</p></div><a class="s3-btn" href="${DEMO_URL}" target="_blank" rel="noopener">Open full screen</a></div>
 <div class="cm-laptop"><div class="cm-lid"><iframe src="${DEMO_URL}" title="Chat Manager demo for a made-up shop"></iframe></div><div class="cm-base" aria-hidden="true"></div></div>
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Why it beats a monthly bill</h2>
 <ul class="cm-why">${steps(WHY)}</ul>
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Grow all you like. The cost doesn’t.</h2>
 <p class="s3-lede" style="margin-top:16px">The monthly tools charge more as more people message you. Chat Manager’s hosting stays about $6, whatever your size.</p>
 ${tierChart}
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-yours">
 <div><h2 class="s3-h2">It’s your software.</h2><p class="s3-lede">You get your own copy, not a login to someone else’s app. Want new colors, your fonts, another chart or a whole new feature? Ask Claude and it changes your copy.</p></div>
 ${yoursChat}
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Everything it does</h2>
 <ul class="cm-feat">${steps(FEATURES)}</ul>
</div></section>
<section class="cm-band s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Set up in an afternoon</h2>
 <ol class="cm-flow">${steps(SETUP)}</ol>
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">What you need</h2>
 <ul class="cm-feat cm-need">${steps(BRING)}</ul>
</div></section>
<section class="s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Chat Manager vs the monthly tools</h2>
 <p class="cm-swipe">Swipe the table to see every tool →</p>
 <div class="cm-compare"><table>
  <thead><tr><th scope="col"></th>${TOOLS.map((t) => `<th scope="col">${t}</th>`).join('')}</tr></thead>
  <tbody>${COMPARE.map(([a, ...v]) => `<tr><th scope="row">${a}</th>${v.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
 </table></div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <div class="cm-know">
  <h2 class="s3-h2">Good to know before you buy</h2>
  <ul class="cm-limits">${LIMITS.map(([b, p]) => `<li><b>${b}</b><span>${p}</span></li>`).join('')}</ul>
 </div>
</div></section>
<section class="cm-faq s3-sec"><div class="s3-wrap cm-mid">
 <h2 class="s3-h2">Questions</h2>
 <div class="s3-faq">${faqCol(FAQS.slice(0, half))}${faqCol(FAQS.slice(half))}</div>
</div></section>
<section class="cm-end s3-sec" id="buy"><div class="s3-wrap">
 <p class="cm-beta">${BETA}</p>
 <h2 class="s3-h2">Your keywords, your list, your software.</h2>
 <p class="s3-lede">${PRICE} one-time. Download it, open it in Claude and say “set up my Chat Manager”.</p>
 ${buyBtn()}
</div></section>`;
  return s3shell(body, CSS);
}
