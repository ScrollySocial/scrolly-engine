// $1K / $10K / $24K Club + Challenge pages and the /clubs/ + /challenges/ collections.
// $1K copy comes from Mercedes's offer breakdown (2026-09-21). $10K/$24K stay "preview" copy: their contents are not decided yet, so nothing is invented.
// Purchase CTAs render ONLY when the WooCommerce product is published + in stock (status.mjs, checked at build time).
import { shell, s3shell, media, img, ICON_UR, esc, endCta, min } from '../lib.mjs';
import { CALCS, HELPERS, PRESET_JS, compute, presetHtml } from '../calculators-data.mjs';
import { club1k, challenge1k, club1kVariations } from '../status.mjs';

const TIERS = {
  '1k': { amt: '$1K', word: '$1,000', cls: 't1', tag: 'Prove it.', tile: 'Make your first consistent $1K/month using organic marketing.', ids: { club: 291, challenge: 303 } },
  '10k': { amt: '$10K', word: '$10,000', cls: 't2', tag: 'Make it your living.', tile: 'Reach consistent $10K profit months using organic marketing.', ids: { club: 304, challenge: 305 } },
  '24k': { amt: '$24K', word: '$24,000', cls: 't3', tag: 'Scale it.', tile: 'Grow to $24K profit months using paid advertising for the next level.', ids: { club: 306, challenge: 307 } },
};

const mailto = (name) => `mailto:hello@theambitiondepartment.com?subject=${encodeURIComponent('Launch updates: ' + name)}&body=${encodeURIComponent(`Hi there, please let me know when ${name} is ready to launch. Thank you!`)}`;
const money = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const cart = (id) => `/?add-to-cart=${id}`;

const ladder = `<section class="tick"><div class="ladder" aria-label="Build, Grow, Earn Your Stripes"><span>Build</span><span>Grow</span><span class="or">Earn your Stripes</span></div></section>`;

const disclaimer = '<p class="fine">Revenue figures are goals, not guaranteed results.</p>';

function hero({ cls, title, lede, cost, btn, art, pill }) {
  return `<section class="ohero ${cls}"><div><span class="pill pill-navy">${pill}</span><h1 class="disp">${title}</h1><p class="lede">${lede}</p>${cost ? `<div class="cost">${cost}</div>` : ''}${btn}${disclaimer}</div><div class="art"><img src="${img(art)}" alt="" width="1200" height="754" fetchpriority="high"></div></section>`;
}

const btnCart = (id, label) => `<a class="btn btn-black" href="${cart(id)}"><span>${label}</span>${ICON_UR(20)}</a>`;
const btnMail = (name) => `<a class="btn btn-black" href="${mailto(name)}"><span>Request launch news</span>${ICON_UR(20)}</a>`;

const faq = (rows) => `<section class="band cr"><div class="in"><div class="head"><span class="eyebrow or k1-eb">A few useful answers</span><h2 class="disp" style="margin-top:12px">Before you join.</h2></div><div class="faq">${rows.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;

const PREVIEW = {
  '10k-club': { h1: 'Build toward your next $10,000.', lede: 'The next Club is taking shape: practical organic-growth direction for businesses ready to work toward a bigger goal.', steps: [['Find opportunities', 'Identify organic-growth opportunities that fit your business and stage.'], ['Put ideas to work', 'Turn the next growth priorities into practical actions.'], ['Learn as you go', 'Review what you tried and use real results to inform the next step.']] },
  '24k-club': { h1: 'Build toward a $24,000 month.', lede: 'The next Club is taking shape: practical organic-growth direction for businesses ready to work toward a bigger goal.', steps: [['Find opportunities', 'Identify organic-growth opportunities that fit your business and stage.'], ['Put ideas to work', 'Turn the next growth priorities into practical actions.'], ['Learn as you go', 'Review what you tried and use real results to inform the next step.']] },
  '10k-challenge': { h1: 'Take on your next $10,000.', lede: 'A focused Challenge for businesses ready to take on a bigger revenue goal. The format and entry details are being developed.', steps: [['Set your goal', 'Work toward your next $10,000. Challenge duration and entry requirements will be confirmed before launch.'], ['Take action', 'Put focused organic-growth work into practice. The final support and opportunity format is still being developed.'], ['Review your progress', 'Track your attempt and review the evidence of progress.']] },
  '24k-challenge': { h1: 'Take on a $24,000 month.', lede: 'A focused Challenge for businesses ready to take on a bigger revenue goal. The format and entry details are being developed.', steps: [['Set your goal', 'Work toward a $24,000 month. Challenge duration and entry requirements will be confirmed before launch.'], ['Take action', 'Put focused organic-growth work into practice. The final support and opportunity format is still being developed.'], ['Review your progress', 'Track your attempt and review the evidence of progress.']] },
};

const TIER_PAGES = {
  '1k': { key: '1k-club', id: 291, amt: '$1K', tier: 'var(--teal)', cap: 'var(--lav)', art: 'tiger-stride.png', layers: [['k1-strokes.webp', 1536, 1024], ['k1-tiger.webp', 1774, 887]], lay: 'l1',
    h1: 'Want to start making money online?', h1b: 'We’ve got you.',
    goal: 'Earn your first $1,000.00 online', pct: ['$1K', 'your first goal'], end: 'Earn your <span>first stripe.</span>',
    intro: 'The Club gives you the plan. The Challenge gives you 30 consecutive days to go get it, and a shirt when you do.',
    club: { one: 'Your plan, yours to keep. One-time.', items: [['The $1K Club playbook (PDF)', 'Make your first $1K with Instagram, step by step.'], ['Reel guide + carousel template', 'A Reel safe-zone guide and one 3:4 carousel template.'], ['Setup checklist + worksheets', 'An Instagram setup checklist and printable worksheets.'], ['$1K Math calculator', 'In your account: how many sales it takes to reach $1,000.']] },
    chal: { one: 'Everything in the Club, plus:', items: [['Your personal $1K Plan', 'Your $1K number, what to do each week, and a weekly check-in.'], ['25 Reel ideas every week', 'Current formats, ready to film. Plus 30 carousel and 30 Story templates.'], ['30 consecutive days, one goal', '$1,000 in total revenue.'], ['Your stripe shirt', 'Hit $1,000 and it ships free in the lower 48. Pick your size at checkout.']] },
    // 2026-10-10: graphite winner shirt replaces the teal one (front print only, so front + model photo).
    shirt: ['shirt-1k-graphite-front-cut.webp', 'Front of the graphite $1K Club winner shirt: a white line tiger above The $1k Club and Earn your stripes.', 'shirt-1k-graphite-model.webp', 'A man wearing the graphite $1K Club winner shirt.'],
    caption: 'Hit $1,000 in 30 consecutive days and your stripe shirt ships free in the lower 48.',
    faqs: [
      ['Is $1,000 guaranteed?', 'No, and that’s the point. It isn’t a guarantee. It’s a realistic plan built to give you a real shot at it, and the win means something because it isn’t handed to you. Results depend on your offer, your customers and the work you put in.'],
      ['What counts toward the $1,000?', 'Total money your business collects for its products or services during your 30 consecutive days. Sales tax, shipping you charge and refunds don’t count. It doesn’t have to be one product.'],
      ['How do I earn the shirt?', 'Hit $1,000 in total revenue inside your 30 consecutive days, then show your sales records. Once they’re verified, your stripe shirt ships to you. Everyone who hits the goal earns one.'],
      ['Is shipping free?', 'Free to addresses in the lower 48 US states. Anywhere else, you can still earn your shirt: we’ll email you to arrange shipping, which you pay.'],
      ['When do I pick my shirt size?', `At the top of checkout, right under your email. It looks like this:<img class="k1-faqimg" src="${img('checkout-shirt-size-v2.png')}" alt="The Stripe shirt size dropdown at checkout" width="900" height="164" loading="lazy">Shirts are adult men’s S to 4XL in Comfort Colors 1717 (Graphite), a heavyweight cotton tee with a relaxed fit.`],
      ['What if I don’t hit $1,000 in 30 days?', 'You keep everything in the Club. Club members can start another 30-day attempt for $35, with fresh Reel ideas and another go at the shirt.'],
      ['Can I buy the Challenge on its own?', 'No. The Challenge is built on the Club, so your first one comes with Club + Challenge.'],
      ['Can I get a refund?', 'No. The Club and Challenge are digital products, so all sales are final. See our <a class="ulink" href="/refund/">Refund Policy</a>.'],
    ] },
  '10k': { key: '10k-club', id: 304, amt: '$10K', tier: 'var(--lav)', cap: 'var(--lav)', art: 'tiger-leap.png', layers: [['k10-clouds.webp', 1774, 887], ['k10-tiger.webp', 1536, 1024]], lay: 'l10',
    h1: 'Ready to make it your living?', h1b: 'Coming soon.',
    goal: 'Earn your first $10,000.00 month', pct: ['$10K', 'your next goal'], end: 'Earn your <span>next stripe.</span>',
    intro: 'The $10K Club and Challenge are on the way. Get launch news and be first in.',
    club: { one: 'Coming soon.', items: PREVIEW['10k-club'].steps },
    chal: { one: 'Coming soon.', items: PREVIEW['10k-challenge'].steps },
    shirt: ['shirt-10k-challenge-back-cut.webp', 'Back of the $10K Challenge stripe shirt: Higher goals ahead. Built it. Living it. Scrolly $10K Club.', 'shirt-10k-challenge-front-cut.webp'],
    caption: 'Finish the $10K Challenge and earn the $10K stripe shirt.',
    faqs: [
      ['Can I join today?', 'Not yet. The $10K Club and Challenge are coming soon. Get launch news and we’ll tell you first.'],
      ['Is $10,000 guaranteed?', 'No. It is a revenue goal, not a promise. Results depend on your offer, your customers and the work you put in.'],
      ['What will it cost and include?', 'Pricing and what’s included will be posted before it opens.'],
      ['Where should I start?', 'With the <a class="ulink" href="/1k-club/">$1K Club + Challenge</a>.'],
    ] },
  '24k': { key: '24k-club', id: 306, amt: '$24K', tier: 'var(--peach)', cap: 'var(--peach)', art: 'tiger-leap.png', layers: [['k24-strokes.webp', 1774, 887], ['k24-tiger.webp', 1536, 1024]], lay: 'l24',
    h1: 'Ready to scale it?', h1b: 'Coming soon.',
    goal: 'Earn your first $24,000.00 month', pct: ['$24K', 'your big goal'], end: 'Earn your <span>top stripe.</span>',
    intro: 'The $24K Club and Challenge are on the way. Get launch news and be first in.',
    club: { one: 'Coming soon.', items: PREVIEW['24k-club'].steps },
    chal: { one: 'Coming soon.', items: PREVIEW['24k-challenge'].steps },
    shirt: ['shirt-24k-challenge-back-cut.webp', 'Back of the $24K Challenge stripe shirt: Turns out, I could reach them. Scrolly $24K Club.', 'shirt-24k-challenge-front-cut.webp'],
    caption: 'Finish the $24K Challenge and earn the $24K stripe shirt.',
    faqs: [
      ['Can I join today?', 'Not yet. The $24K Club and Challenge are coming soon. Get launch news and we’ll tell you first.'],
      ['Is $24,000 guaranteed?', 'No. It is a revenue goal, not a promise. Results depend on your offer, your customers and the work you put in.'],
      ['What will it cost and include?', 'Pricing and what’s included will be posted before it opens.'],
      ['Where should I start?', 'With the <a class="ulink" href="/1k-club/">$1K Club + Challenge</a>.'],
    ] },
};

// ---------------------------------------------------------------- $1K / $10K / $24K Club + Challenge pages (v3, 2026-10-03)
// 2026-10-05 product-page redesign (Mercedes's wireframe, rebuilt on v3 through mockups v1 to v4): hero, "Everything you get" product
// cards (Club / Challenge only), a mini Income Goal calculator under "You don't need a huge audience", optional explainer video,
// compact Club or Challenge cards, earned shirt, two-column FAQ, and the calculators' peach end band above the footer.
// Orange text: none (Mercedes, 2026-10-05: at most once per page, never mid-heading). Orange stays on buttons and the Challenge label.
// Product images: set `img` (a media-map.json file) per product. Until a real image exists the card shows a typographic tile.
const PRODUCTS = {
  '1k': [
    { n: '$1K Club Playbook', d: 'Step by step to your first $1K.', club: true, img: 'k1-cover-playbook-fill.webp', full: true },
    { n: 'Social Media Quality Tips', d: 'Make your content stop the scroll.', club: true, img: 'k1-cover-quality-tips-fill.webp', full: true },
    { n: 'Reel guide + carousel template', d: 'A Reel safe-zone guide and one 3:4 carousel template. The Challenge adds 60 ready-made Canva templates.', club: true, img: 'k1-tile-templates-filled.webp', full: true },
    { n: '$1K Math calculator', d: 'How many sales it takes to reach $1,000.', club: true, img: 'k1-tile2-calculator.webp', full: true },
    { n: 'Your $1K Plan', d: 'Your number, weekly steps and a weekly check-in.', img: 'k1-tile2-plan.webp', full: true },
    { n: '25 Reel ideas a week', d: 'Fresh, current formats, ready to film.', img: 'k1-tile2-reels.webp', full: true },
    { n: 'Notion content tracker', d: 'Plan and track every post in one place.', img: 'k1-tile3-notion.webp', full: true },
    { n: 'Auto-posting with your AI', d: 'Claude or ChatGPT queues your posts in Buffer for Instagram, TikTok and YouTube.', img: 'k1-tile3-autopost.webp', full: true },
    { n: 'Stripe shirt', d: 'Earned when you hit $1,000 and verify it.', img: 'shirt-1k-graphite-front-cut.webp' },
  ],
};
// Comparison rows (short names). Coming-soon tiers fall back to their preview step names.
const COMPARE = {
  '1k': {
    // 2026-10-23: Club lists only what Club buyers get (the calculator is in their My $1K Plan tab); Challenge templates named as 60 Canva.
    club: ['$1K Club Playbook', 'Social Media Quality Tips', 'Reel safe-zone guide + 1 carousel template', 'Instagram setup checklist + worksheets', '$1K Math calculator in your account'],
    chal: ['Everything in the Club', 'Your personal $1K Plan + weekly check-in', '25 Reel ideas every week', '60 Canva templates (30 carousel, 30 Story)', 'Notion content tracker template', 'Auto-posting to Buffer with your AI', 'Stripe shirt when you prove $1K in revenue'],
  },
};
// Explainer video per tier (URL of an uploaded MP4). '' = no video section until the video exists (Mercedes 2026-10-09:
// the "Video coming soon" slot looked unfinished on the live /1k-club/ page).
const VIDEO = { '1k': '', '10k': '', '24k': '' };
// Hero product image per tier (media-map.json file). '' = show the image slot until the collage exists; a tier missing here keeps its tiger.
const HERO_IMG = { '1k': 'k1-hero-fan.webp', '10k': '', '24k': '' };
const slot = (label, cls = '') => `<div class="cl-slot ${cls}" aria-hidden="true"><span>${label}</span></div>`;

const calc = CALCS.find((c) => c.slug === 'income-goal');
const CALC_SCRIPT = `(function(){var f=document.getElementById('cl-form');if(!f||f.__init)return;f.__init=1;
var H=${HELPERS},C=${calc.fn},K=${JSON.stringify(calc.fields.map((x) => x.k))};
function read(){var v={};K.forEach(function(k){var x=parseFloat(document.getElementById('cl-'+k).value);v[k]=isFinite(x)?x:0});return v}
${PRESET_JS}
function run(){C(read(),H).forEach(function(r,i){document.getElementById('cl-v'+i).textContent=r[0]});presetSync(f)}
presets(f,run);
f.addEventListener('submit',function(e){e.preventDefault();run()});f.addEventListener('input',run)})();`;

const TIER_CSS = `
.s3 .cl-hero{padding:clamp(28px,4vw,64px) 0 clamp(40px,4.5vw,72px)}
.s3 .cl-hero .s3-wrap{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:center;gap:clamp(24px,3vw,56px)}
.s3 .cl-hero h1{font-size:clamp(3rem,5.2vw,5.8rem)!important;line-height:.95!important;letter-spacing:-.01em!important}
.s3 .cl-hero h1 span{display:block}
/* Rebrand 2026-10-19: the hero question is Georgia italic in navy. It is too long for the hot-pink marker (.or in v3.css), which is for one or two words. */
.s3 .cl-hero h1 em{font-style:italic;background:none;padding:0}
.s3 .cl-acts{display:flex;flex-wrap:wrap;gap:14px;margin-top:38px}
.s3 .cl-slot{display:flex;align-items:center;justify-content:center;border-radius:16px;background:repeating-linear-gradient(45deg,#ebe5da 0 12px,#e4ddd0 12px 24px);color:var(--s3-muted);font:700 var(--s3-fs-label)/1.3 var(--s3-sans);letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:16px}
.s3 .cl-slot.hero{aspect-ratio:5/4}
.s3 .cl-slot.video{aspect-ratio:16/9;border-radius:0;background:repeating-linear-gradient(45deg,#1d1c1a 0 12px,#252321 12px 24px);color:#a9a49c}
.s3 .cl-hero .prodimg{width:100%;height:auto}
.s3 .cl-hero .tiger{width:128%;max-width:none;margin-right:-28%;transform:scaleX(-1)}
.s3 .cl-sec{padding:clamp(40px,4.5vw,72px) 0}
/* Everything you get: one scrolling row of product cards */
.s3 .cl-get{padding-top:0;padding-bottom:clamp(24px,2.5vw,36px)}
.s3 .cl-calc{padding-top:0}
.s3 .cl-get-head{display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap}
.s3 .cl-get-head .s3-lede{margin-top:10px}
.s3 .cl-arrows{display:flex;gap:8px}
.s3 .cl-arrows button{width:52px;height:52px;border-radius:50%;border:1px solid var(--s3-ink);background:none;color:var(--s3-ink);font:400 1.25rem/1 var(--s3-sans);cursor:pointer}
.s3 .cl-prods{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;list-style:none;margin:24px 0 0;padding:4px 2px}
.s3 .cl-prods::-webkit-scrollbar{display:none}
.s3 .cl-prod{flex:0 0 calc((100% - 84px) / 6.4);min-width:206px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border-radius:14px;padding:14px}
.s3 .cl-prod h3{min-height:2.6em;font:700 var(--s3-fs-label)/1.3 var(--s3-sans)!important;letter-spacing:.02em!important}
.s3 .cl-prod .pic{aspect-ratio:3/4;margin:10px 0 12px;border-radius:10px;overflow:hidden;background:#f1e9df;display:flex;align-items:center;justify-content:center;padding:14px;text-align:center;font:400 1.375rem/1.15 var(--s3-serif)}
.s3 .cl-prod .pic img{width:100%;height:100%;object-fit:contain}
.s3 .cl-prod .pic.full{padding:0}
.s3 .cl-prod .pic.full img{object-fit:cover}
.s3 .cl-prod p{flex:1;margin:0 0 12px;font-size:var(--s3-fs-label);line-height:1.4;color:var(--s3-muted)}
.s3 .cl-tag{align-self:flex-start;max-width:100%;padding:3px 8px;border:1px solid var(--s3-ink);border-radius:999px;font:700 var(--s3-fs-label)/1.2 var(--s3-sans);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;letter-spacing:.02em}
.s3 .cl-tag.ch{background:var(--s3-sky);border-color:var(--s3-sky);color:var(--s3-navy)}
/* Mini Income Goal calculator (same math as /calculators/income-goal/) */
.s3 .cl-calc .panel{background:var(--s3-mist);padding:clamp(20px,2.6vw,40px)}
.s3 .cl-calc h2{font-size:var(--s3-fs-h3)!important;line-height:1.1!important}
.s3 .cl-calc .s3-lede{margin-top:8px}
.s3 .cl-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 20px;align-items:start;margin-top:20px}
.s3 .cl-form .s3-btn{grid-column:1/-1;justify-self:start}
.s3 .cl-form .s3-pres{gap:4px}.s3 .cl-form .s3-pre{padding:8px 2px}
.s3 .cl-form label{font-size:var(--s3-fs-ui)!important;letter-spacing:.01em!important}
.s3 .cl-in{position:relative}
.s3 .cl-in input{min-height:52px;background:#fff;border-color:#8f8a83;font:400 var(--s3-fs-num)/1.2 var(--s3-serif)}
.s3 .cl-in>span{position:absolute;top:0;bottom:0;display:flex;align-items:center;font:400 var(--s3-fs-num) var(--s3-serif);color:var(--s3-muted);pointer-events:none}
.s3 .cl-in.pre>span{left:16px}.s3 .cl-in.pre input{padding-left:38px}
.s3 .cl-in.suf>span{right:18px}.s3 .cl-in.suf input{padding-right:50px}
.s3 .cl-form .s3-btn{min-height:52px}
.s3 .cl-res{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:20px;padding-top:18px;border-top:1px solid #b8c1d6}
.s3 .cl-res>div{display:flex;align-items:baseline;gap:12px}
.s3 .cl-res .v{font:400 clamp(2.2rem,3.4vw,3rem)/1 var(--s3-serif)}
.s3 .cl-calc .s3-fine{margin-top:12px}
/* Explainer video on a monitor */
.s3 .cl-video{background:var(--s3-black);color:#fff;text-align:center}
.s3 .cl-video h2{color:#fff!important}
.s3 .cl-video .s3-lede{margin:12px auto 0;color:#d8d3cb}
.s3 .cl-screen{max-width:820px;margin:28px auto 0;border:12px solid #2a2826;border-bottom-width:26px;border-radius:18px;background:#111;overflow:hidden}
.s3 .cl-screen video,.s3 .cl-screen iframe{display:block;width:100%;aspect-ratio:16/9;border:0}
.s3 .cl-stand{width:22%;height:36px;margin:0 auto;background:linear-gradient(#2a2826,#1a1918);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)}
/* Club or Challenge: compact, centered, fits one screen */
.s3 .cl-pick{padding:clamp(32px,3.5vw,56px) 0}
.s3 .cl-pick h2,.s3 .cl-pick .intro{text-align:center}
.s3 .cl-pick .intro{margin:12px auto 0}
.s3 .cl-offers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;max-width:1080px;margin:28px auto 0;align-items:start}
.s3 .cl-offer{background:#fff;border-radius:16px;padding:clamp(20px,2.4vw,32px)}
.s3 .cl-offer.feat{outline:3px solid var(--s3-ink)}
.s3 .cl-offer .top{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px 14px;margin-bottom:10px}
.s3 .cl-offer .cost{font:400 clamp(2.6rem,4vw,3.4rem)/1 var(--s3-serif);letter-spacing:-.01em}
.s3 .cl-offer h3{font-size:1.5rem!important}
.s3 .cl-best{padding:4px 12px;border-radius:999px;background:var(--s3-ink);color:#fff;font:700 var(--s3-fs-label)/1.2 var(--s3-sans);letter-spacing:.08em;text-transform:uppercase}
.s3 .cl-offer ul{list-style:none;margin:0 0 20px;padding:0}
.s3 .cl-offer li{padding:8px 0;border-bottom:1px solid var(--s3-line);font-size:var(--s3-fs-body)}
.s3 .cl-offer li.add::before{content:"+ ";font-weight:700}
.s3 .cl-pick .s3-fine{margin-top:16px;text-align:center}
/* Earned shirt */
.s3 .cl-earned .s3-split{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)}
/* Earned band: navy, its italic word in sky blue via .s3-dark .or (less girly tone, 2026-10-20) */
.s3 .cl-earned p{margin-top:20px}
.s3 .cl-earned .s3-btn{margin-top:28px}
.s3 .cl-tees{display:flex;align-items:center;gap:clamp(4px,1vw,16px)}
.s3 .cl-tees img{width:50%;border-radius:6px}
/* FAQ in two columns */
.s3 .cl-faq .s3-faq{display:grid;grid-template-columns:1fr 1fr;gap:0 48px;margin-top:20px}
.s3 .cl-faq .s3-faq>div details:first-child{border-top:1px solid var(--s3-line)}
.s3 .cl-faq a{text-decoration:underline;text-underline-offset:3px}
.s3 .cl-faq .shot{width:100%;max-width:520px;margin:16px 0;border-radius:6px}
/* End band: same format as the calculators' "Numbers aren't a plan" band */
.s3 .cl-end{background:var(--s3-mist)}
.s3 .cl-end .s3-split{align-items:center}
.s3 .cl-end h2{margin-bottom:18px}
.s3 .cl-end .s3-lede{margin-bottom:28px}
.s3 .cl-end .s3-btn{white-space:nowrap}
.s3 .cl-opts{display:grid;grid-template-columns:1fr 1fr;list-style:none;margin:0;padding:0}
.s3 .cl-opts li{padding:4px clamp(16px,2vw,32px);border-left:1px solid #b8c1d6}
.s3 .cl-opts .amt{font:400 2.75rem/1 var(--s3-serif)}
.s3 .cl-opts li{display:flex;flex-direction:column}
.s3 .cl-opts li p{flex:1}
.s3 .cl-opts .s3-link{align-self:flex-start;white-space:nowrap;letter-spacing:.1em}
.s3 .cl-opts .amt small{margin-left:8px;font:700 var(--s3-fs-label)/1 var(--s3-sans);letter-spacing:.2em;text-transform:uppercase}
.s3 .cl-opts p{margin:12px 0 8px;font:var(--s3-fs-body-serif)/1.5 var(--s3-sans)}
/* two columns until the rate pills fit four across (they need about 290px each) */
@media(max-width:1439px){.s3 .cl-form{grid-template-columns:1fr 1fr}.s3 .cl-form .s3-btn{grid-column:1/-1;justify-self:start}}
@media(max-width:900px){
 .s3 .cl-hero .s3-wrap,.s3 .cl-offers,.s3 .cl-earned .s3-split,.s3 .cl-faq .s3-faq,.s3 .cl-end .s3-split{grid-template-columns:1fr}
 .s3 .cl-hero .tiger{width:112%;margin:8px -12% 0 0}
 .s3 .cl-res{grid-template-columns:1fr;gap:10px}
 .s3 .cl-faq .s3-faq>div+div details:first-child{border-top:0}
 .s3 .cl-opts{grid-template-columns:1fr}.s3 .cl-opts li{padding:20px 0;border-left:0;border-top:1px solid #b8c1d6}
}
@media(max-width:560px){.s3 .cl-form{grid-template-columns:1fr}.s3 .cl-prod{flex-basis:72%}}
`;

const HERO_TIGER = {
  '1k': ['hp3-club-1k-tiger.webp', 'Black and white tiger walking'],
  '10k': ['hp3-club-10k-tiger.webp', 'Black and white tiger running'],
  '24k': ['hp3-club-24k-tiger.webp', 'Black and white tiger leaping'],
};

// One template for every tier. Sections without data for a tier (products, video) are left out.
function tierPage(tk) {
  const c = TIER_PAGES[tk];
  let clubV, chalV, open = false;
  if (tk === '1k') {
    clubV = club1kVariations.find((v) => v.pkg === 'Club only');
    chalV = club1kVariations.find((v) => v.pkg === 'Club + Challenge');
    open = club1k.open && !!clubV && !!chalV;
  }
  const clubP = open ? money(clubV.price) : 'Soon';
  const chalP = open ? money(chalV.price) : 'Soon';
  const arrow = ' <span aria-hidden="true">→</span>';
  const news = (cls = '') => `<a class="s3-btn ${cls}" href="${mailto(`${c.amt} Club + Challenge`)}">Get launch news${arrow}</a>`;
  // Long-form links (parent id + variation id): the $1K checkout snippet replaces an existing package only for these on the live snippet version.
  const joinUrl = (v) => `/checkout/?add-to-cart=279&amp;variation_id=${v.id}&amp;attribute_package=${encodeURIComponent(v.pkg)}`;
  const joinClub = (cls = 'black') => open ? `<a class="s3-btn ${cls}" href="${joinUrl(clubV)}">Join the Club, ${clubP}</a>` : '';
  const joinChal = (cls = '') => open ? `<a class="s3-btn ${cls}" href="${joinUrl(chalV)}">Join the Challenge, ${chalP}${arrow}</a>` : news(cls);
  const [tf, talt] = HERO_TIGER[tk];
  const m = media[tf];
  const faqs = c.faqs.map(([q, a]) => [q, a.replace(/class="k1-faqimg"/g, 'class="shot"').replace(/ class="ulink"/g, '')]);
  const half = Math.ceil(faqs.length / 2);
  const faqCol = (rows) => `<div>${rows.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('')}</div>`;
  // Coming-soon tiers show their preview items until real products are decided (nothing invented).
  const prods = PRODUCTS[tk] || [...c.club.items.map(([n, d]) => ({ n, d, club: true })), ...c.chal.items.map(([n, d]) => ({ n, d }))];
  const cmp = COMPARE[tk] || { club: c.club.items.map(([h]) => h), chal: c.chal.items.map(([h]) => h) };
  const goal = { '1k': 1000, '10k': 10000, '24k': 24000 }[tk];
  const vals = Object.fromEntries(calc.fields.map((f) => [f.k, f.k === 'goal' ? goal : f.val]));
  const res = compute(calc, vals);
  const field = (x) => `<div class="s3-field"><label for="cl-${x.k}">${x.label}${x.pre ? '<span class="s3-sr"> (dollars)</span>' : x.suf ? '<span class="s3-sr"> (percent)</span>' : ''}</label><div class="cl-in${x.pre ? ' pre' : ''}${x.suf ? ' suf' : ''}">${x.pre ? '<span aria-hidden="true">$</span>' : ''}<input id="cl-${x.k}" type="number" inputmode="decimal" min="0" step="${x.step}" value="${vals[x.k]}"${x.presets ? ` aria-describedby="cl-h-${x.k}"` : ''}>${x.suf ? '<span aria-hidden="true">%</span>' : ''}</div>${x.presets ? presetHtml(x, 'cl-', vals[x.k]) : ''}</div>`;
  const pic = (p) => {
    if (!p.img) return `<div class="pic" aria-hidden="true">${p.n}</div>`;
    const im = media[p.img];
    return `<div class="pic${p.full ? ' full' : ''}"><img src="${img(p.img)}" alt="${esc(p.n)}" width="${im.w}" height="${im.h}" loading="lazy"></div>`;
  };
  const body = `
<section class="cl-hero"><div class="s3-wrap">
 <div>
  <h1><em class="or">${c.h1}</em> <span>${c.h1b}</span></h1>
  <div class="cl-acts">${joinChal()}${joinClub()}</div>
 </div>
 ${tk in HERO_IMG ? (HERO_IMG[tk] ? `<img class="prodimg" src="${img(HERO_IMG[tk])}" alt="Everything in the ${c.amt} Challenge" width="${media[HERO_IMG[tk]].w}" height="${media[HERO_IMG[tk]].h}" fetchpriority="high">` : slot('Product image coming soon', 'hero')) : `<img class="tiger" src="${img(tf)}" alt="${talt}" width="${m.w}" height="${m.h}" fetchpriority="high">`}
</div></section>
${prods.length ? `<section class="cl-get cl-sec" aria-labelledby="cl-get-h"><div class="s3-wrap">
 <div class="cl-get-head"><div><h2 class="s3-h2" id="cl-get-h">Everything you get in the ${c.amt} Challenge</h2><p class="s3-lede">${PRODUCTS[tk] ? `A complete toolkit to plan, create and go after your first ${TIERS[tk].word}.` : 'Coming soon. Here’s what’s taking shape.'}</p></div>
  <div class="cl-arrows"><button type="button" aria-label="Scroll products left" onclick="document.getElementById('cl-prods').scrollBy({left:-400,behavior:'smooth'})">←</button><button type="button" aria-label="Scroll products right" onclick="document.getElementById('cl-prods').scrollBy({left:400,behavior:'smooth'})">→</button></div></div>
 <ul class="cl-prods" id="cl-prods">${prods.map((p) => `<li class="cl-prod"><h3>${p.n}</h3>${pic(p)}<p>${p.d}</p><span class="cl-tag${p.club ? '' : ' ch'}">${p.club ? 'Club' : 'Challenge only'}</span></li>`).join('')}</ul>
</div></section>` : ''}
<section class="cl-calc cl-sec" aria-labelledby="cl-calc-h"><div class="s3-wrap"><div class="panel">
 <h2 class="s3-h2" id="cl-calc-h">You don’t need a huge audience. You need a plan.</h2>
 <p class="s3-lede">Turn a revenue goal into sales, website visitors and views.</p>
 <form id="cl-form" class="cl-form" novalidate>${calc.fields.map(field).join('')}<button class="s3-btn" type="submit">Calculate${arrow}</button></form>
 <div class="cl-res" aria-live="polite">${res.map(([v], i) => `<div><div class="v" id="cl-v${i}">${v}</div><div class="s3-label">${calc.outs[i].replace(/ needed$/, '').replace(/^Estimated v/, 'V')}</div></div>`).join('')}</div>
 <p class="s3-fine">Estimates, not guarantees. Change the numbers to match your business.</p>
</div></div></section>
${VIDEO[tk] ? `<section class="cl-video cl-sec"><div class="s3-wrap">
 <h2 class="s3-h2">See how it works.</h2>
 <p class="s3-lede">A quick walk-through of the Club and the Challenge.</p>
 <div class="cl-screen">${VIDEO[tk] ? `<video src="${VIDEO[tk]}" controls preload="metadata" playsinline></video>` : slot('Video coming soon', 'video')}</div><div class="cl-stand"></div>
</div></section>` : ''}
<section class="cl-pick" id="join"><div class="s3-wrap">
 <h2 class="s3-h2">Club or Challenge?</h2>
 <p class="s3-lede intro">${tk === '1k' ? 'A deadline and a weekly check-in make a goal a lot easier to stick with. That’s what the Challenge adds, plus everything you need to go after your first $1,000.' : c.intro}</p>
 <div class="cl-offers">
  <article class="cl-offer"><div class="top"><span class="cost">${clubP}</span><h3>The ${c.amt} Club</h3></div><ul>${cmp.club.map((r) => `<li>${r}</li>`).join('')}</ul>${open ? joinClub() : news('black')}</article>
  <article class="cl-offer feat"><div class="top"><span class="cost">${chalP}</span><h3>Club + Challenge</h3>${open ? '<span class="cl-best">Best value</span>' : ''}</div><ul>${cmp.chal.map((r, i) => `<li${COMPARE[tk] && i ? ' class="add"' : ''}>${r}</li>`).join('')}</ul>${joinChal()}</article>
 </div>
 <p class="s3-fine">${open ? 'One-time purchase, no subscription. ' : ''}Results not guaranteed. Revenue before costs.</p>
</div></section>
<section class="cl-earned cl-sec s3-dark"><div class="s3-wrap s3-split">
 <div>
  <h2 class="s3-h2">Some things can’t be bought. <em class="or">They’re earned.</em></h2>
  <p class="s3-lede">${c.caption}</p>
  ${joinChal()}
 </div>
 <div class="cl-tees"><img src="${img(c.shirt[0])}" alt="${c.shirt[1]}" width="${media[c.shirt[0]]?.w || 1367}" height="${media[c.shirt[0]]?.h || 1400}" loading="lazy"><img src="${img(c.shirt[2])}" alt="${c.shirt[3] || 'Front of the shirt: Scrolly Challenge Winner paw print'}" width="${media[c.shirt[2]]?.w || 1360}" height="${media[c.shirt[2]]?.h || 1400}" loading="lazy"></div>
</div></section>
<section class="cl-faq cl-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Before you join.</h2>
 <div class="s3-faq">${faqCol(faqs.slice(0, half))}${faqCol(faqs.slice(half))}</div>
</div></section>
<section class="cl-end cl-sec"><div class="s3-wrap s3-split">
 <div>
  <h2 class="s3-h2">Ready to earn your ${tk === '1k' ? 'first' : 'next'} stripe?</h2>
  <p class="s3-lede">${open ? 'Get the plan, follow it for 30 consecutive days, and go after your first $1,000.' : 'Coming soon. Get launch news first.'}</p>
  ${joinChal()}
 </div>
 ${open ? `<ul class="cl-opts">
  <li><div class="amt">${chalP}<small>Challenge</small></div><p>The Club plus 30 consecutive days, weekly Reel ideas and the shirt.</p><a class="s3-link" href="${joinUrl(chalV)}"><span class="tx">Join the Challenge</span>${arrow}</a></li>
  <li><div class="amt">${clubP}<small>Club</small></div><p>The Playbook and starter tools, yours to keep.</p><a class="s3-link" href="${joinUrl(clubV)}"><span class="tx">Join the Club</span>${arrow}</a></li>
 </ul>` : ''}
</div></section>`;
  return { key: c.key, id: c.id, title: `${c.amt} Club + Challenge, The Ambition Department`, html: s3shell(body, TIER_CSS, CALC_SCRIPT) };
}

function forwardPage(key, id, title, to, label) {
  const html = shell(`<section class="k1s" style="text-align:center;padding:80px 20px"><h1 class="disp" style="font-size:clamp(36px,5vw,64px)">${title}</h1><p style="margin-top:22px"><a class="btn btn-pill btn-black" href="${to}"><span>${label}</span></a></p></section><script>location.replace('${to}')</script>`);
  return { key, id, title, html };
}

// ---------------------------------------------------------------- $1K Challenge
function challenge1kPage() {
  const price = money(challenge1k.price);
  const open = challenge1k.open;
  const btn = open ? btnCart(challenge1k.id, `Add to cart — ${price} per attempt`) : btnMail('$1K Challenge');
  const t = (n, h, p, i) => `<div class="mod m${(i % 3) + 1}"><b>${n}</b><div><h3>${h}</h3><p>${p}</p></div></div>`;
  const tiles = [
    ['25', 'Trending content opportunities', 'Every week — roughly 100 over your 30 days.'],
    ['5', 'Relevant SEO Quick Wins', 'Focused search improvements you can act on.'],
    ['30', 'Days of Challenge Agent access', 'Help prioritizing and executing, all sprint long.'],
    ['Weekly', 'Growth Review + Game Plan', 'Check what happened and decide the week ahead.'],
    ['Track', 'Revenue + Challenge progress', 'See where you stand against your $1,000 goal.'],
    ['Verify', 'A defined 30-day attempt', 'With an achievement-verification process.'],
    ['Earn', 'Eligibility to Earn Your Stripe', 'For verified successful Challenges.'],
    ['Tee', 'An exclusive winner shirt', 'After a verified successful Challenge.'],
  ].map(([n, h, p], i) => t(n, h, p, i)).join('');
  const body = `
${hero({ cls: 't1', title: '$1K<br>Challenge', lede: 'Turn your Club strategy into a concentrated 30-day execution sprint toward $1,000 in revenue.', cost: `${price} per 30-day attempt · requires the $1K Club`, btn, art: 'tiger-leap.png', pill: open ? 'Available now' : 'Coming soon · Not open for purchase' })}
${ladder}
<section class="band cr"><div class="in">
 <div class="head"><span class="eyebrow or">Your 30 days</span><h2 class="disp" style="margin-top:12px">${open ? 'What’s in' : 'What’s planned for'}<br><span class="it or">every attempt.</span></h2><p class="sub">Each paid attempt gives you a fresh 30-day execution period — not another copy of the underlying course.</p></div>
 <div class="mods">${tiles}</div>
 <p class="callout"><strong>The opportunities are a resource, not a requirement.</strong> The 100 content opportunities are there to choose from. You don’t have to post 100 times — pick the ones that make sense for your business.</p>
</div></section>
<section class="band lv"><div class="in split">
 <div><span class="eyebrow">Your Challenge Agent</span><h2 class="disp" style="margin-top:12px">Help you execute.</h2>
  <p class="sub">The Challenge Agent helps you prioritize your work, adapt content ideas, create hooks and captions, work through your SEO Quick Wins, interpret your performance, and decide what to focus on next.</p></div>
 <div class="box"><h3>What it isn’t</h3><p>It is not an autonomous implementation agent. It does not modify your website, your store, or your social accounts — you stay in control of what gets published.</p></div>
</div></section>
<section class="earned" id="earned"><div class="l"><div class="k">Some things can’t be bought.</div><h2 class="disp">They’re earned</h2><p style="margin-top:18px;max-width:560px;font-size:clamp(18px,1.6vw,22px);line-height:1.35;font-weight:600">Complete a verified, successful Challenge to Earn Your Stripe, and the exclusive winner shirt.</p><a class="btn btn-pill btn-black" href="/1k-club/"><span>Start with the $1K Club</span></a></div><div class="r"><div class="hand sl" aria-hidden="true"><div>Success</div><div>looks good</div><div>on you!</div></div><img src="${img('shirt-earned-edition.png')}" alt="Earned Edition shirt" width="454" height="347" loading="lazy"><p>FREE, EXCLUSIVE T-SHIRTS FOR CHALLENGE WINNERS!</p></div></section>
${faq([
    ['Do I need the $1K Club first?', 'Yes. The Challenge is optional and sits on top of the Club. Each paid attempt is a new 30-day period, not another copy of the course.'],
    ['Is $1,000 guaranteed?', 'No. It is a revenue goal, not a promise. Revenue is not profit, and results vary with your offer, customers, market, and effort.'],
    ['Do I have to use all 100 opportunities?', 'No. They are a menu to choose from. Post what makes sense for your business.'],
    ['Will the Agent change my website or social accounts?', 'No. It helps you decide and draft; you publish. It never modifies your website, store, or social accounts.'],
    ['How do I earn the shirt?', 'By completing a verified, successful Challenge. Verification details will be listed with the Challenge rules.'],
  ])}
<section class="cta-end"><span class="eyebrow" style="color:var(--lav)">Ready when you are</span><h2 class="disp" style="margin-top:14px">Take on your <span class="it or">30 days.</span></h2><p>${open ? `${price} per 30-day attempt. Requires the $1K Club.` : 'The $1K Challenge is not open for purchase yet. Request launch news by email.'}</p><div class="actions">${open ? `<a class="btn btn-white" href="${cart(challenge1k.id)}"><span>Add to cart — ${price}</span></a>` : `<a class="btn btn-white" href="${mailto('$1K Challenge')}"><span>Request launch news</span></a>`}<a class="btn btn-line" href="/1k-club/"><span>See the $1K Club</span></a></div></section>`;
  void body; // 2026-09-23: the Challenge is sold on the combined /1k-club/ page; this URL forwards there. Old body kept above for reference.
  const fwd = `<section class="k1s" style="text-align:center"><h1 class="disp" style="font-size:clamp(40px,6vw,80px)">The $1K Challenge lives here now.</h1><p style="margin-top:18px"><a class="btn btn-black" href="/1k-club/#how"><span>See the $1K Club + Challenge</span></a></p></section><script>location.replace('/1k-club/#how')</script>`;
  return { key: '1k-challenge', id: 303, title: '$1K Challenge, The Ambition Department', html: shell(fwd) };
}

// ---------------------------------------------------------------- $10K / $24K previews (contents not decided — no invented details)

function previewPage(tierKey, kind) {
  const t = TIERS[tierKey];
  const key = `${tierKey}-${kind}`;
  const c = PREVIEW[key];
  const Kind = kind === 'club' ? 'Club' : 'Challenge';
  const name = `${t.amt} ${Kind}`;
  const body = `
${hero({ cls: t.cls, title: `${t.amt}<br>${Kind}`, lede: esc(c.lede), cost: '', btn: btnMail(name), art: kind === 'club' ? 'tiger-stride.png' : 'tiger-leap.png', pill: 'Coming soon · Not open for purchase' })}
${ladder}
<section class="band cr"><div class="in">
 <div class="head"><span class="eyebrow or">The direction</span><h2 class="disp" style="margin-top:12px">${esc(c.h1)}</h2><p class="sub">This is a preview of the direction. Detailed features, pricing, and enrollment terms will be published before launch.</p></div>
 <div class="mods c3g">${c.steps.map(([h, p], i) => `<div class="mod m${i + 1}"><b>0${i + 1}</b><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></div>`).join('')}</div>
 <p class="callout">No sales, profit, or timing outcome is guaranteed. The ${t.amt} figure describes a revenue goal, not the price of this offer.</p>
</div></section>
${faq([
    [`Can I buy ${name} today?`, `No. ${name} is coming soon and is not open for purchase.`],
    [`Is ${t.amt} a guaranteed outcome?`, 'No. It is a revenue goal. Revenue is not profit, and results vary with your offer, customers, market, and execution.'],
    ['What will it cost and include?', 'Final pricing, features, and access terms will be confirmed before checkout opens.'],
    ['Can I start with the $1K Club?', 'Yes — the <a class="ulink" href="/1k-club/">$1K Club</a> is where it all starts.'],
  ])}
<section class="cta-end"><span class="eyebrow" style="color:var(--lav)">Next up</span><h2 class="disp" style="margin-top:14px">${name} is <span class="it or">coming soon.</span></h2><p>Request launch news by email, or use our contact form to ask a question. The launch-news button opens your email app; your request is sent only when you send the email.</p><div class="actions"><a class="btn btn-white" href="${mailto(name)}"><span>Request launch news</span></a><a class="btn btn-line" href="/contact/"><span>Contact us</span></a></div></section>`;
  return { key, id: t.ids[kind], title: `${name}, The Ambition Department`, html: shell(body) };
}

// ---------------------------------------------------------------- collections
function collection(kind) {
  const isClub = kind === 'club';
  const K = isClub ? 'Club' : 'Challenge';
  const openFor = (k) => (k === '1k' ? (isClub ? club1k.open : challenge1k.open) : false);
  const body = `
<section class="phero">
 <div class="in">
  <div>
   <div class="eyebrow">Ambition Department ${K}s</div>
   <h1 class="disp h-xl" style="margin-top:12px">${isClub ? 'Choose a goal.<br><span class="it or">Build your approach.</span>' : 'Choose a goal.<br><span class="it or">Put it into action.</span>'}</h1>
   <p class="lede">${isClub ? 'Practical organic-growth ideas and tools, organized around the revenue goal you want to work toward next.' : 'A focused attempt with a defined goal, actions to try, and progress to review — organized around the revenue goal you want to work toward next.'}</p>
   <div class="actions"><a class="btn" href="#goals"><span>Choose your goal</span>${ICON_UR(20)}</a></div>
   ${disclaimer}
  </div>
  <div class="art"><img src="${img(isClub ? 'tiger-hero.png' : 'tiger-leap.png')}" alt="" width="1200" height="754" style="border-radius:0"></div>
 </div>
</section>
<section class="tilesec" id="goals" style="padding-top:44px">
 <h2 class="disp h-md">Where do you want to go next?</h2>
 <div class="tiles">
  ${Object.entries(TIERS).map(([k, t]) => `<div class="tile ${t.cls}"><div><div class="amt">${t.amt}</div><h3>${t.tag}</h3><p>${t.tile}</p></div><div class="links"><span class="pill pill-navy" style="align-self:flex-start">${openFor(k) ? 'Available now' : 'Coming soon'}</span><a class="ulink" href="/${k}-${kind}/">Explore ${t.amt} ${K} ↗</a><a class="ulink" style="font-size:.8em;font-weight:700" href="/${k}-${isClub ? 'challenge' : 'club'}/">or the ${t.amt} ${isClub ? 'Challenge' : 'Club'}</a></div></div>`).join('')}
 </div>
 <p class="fine">The amounts are revenue goals, not product prices or promised outcomes. Availability and pricing are shown on each page.</p>
</section>
${endCta({ h: 'Go get ’em,', h2: 'Tiger', btn: 'Browse digital products', href: '/digital-products/', eyebrow: 'Start today' })}`;
  return { key: isClub ? 'clubs' : 'challenges', id: isClub ? 314 : 315, title: `${K}s, The Ambition Department`, html: shell(body) };
}

export function buildAll() {
  return [
    tierPage('1k'), tierPage('10k'), tierPage('24k'),
    forwardPage('1k-challenge', 303, 'The $1K Challenge lives here now.', '/1k-club/#join', 'See the $1K Club + Challenge'),
    forwardPage('10k-challenge', 305, 'The $10K Challenge lives here now.', '/10k-club/#join', 'See the $10K Club + Challenge'),
    forwardPage('24k-challenge', 307, 'The $24K Challenge lives here now.', '/24k-club/#join', 'See the $24K Club + Challenge'),
    forwardPage('clubs', 314, 'Choose your Club.', '/#clubs', 'See all Clubs + Challenges'),
    forwardPage('challenges', 315, 'Choose your Challenge.', '/#clubs', 'See all Clubs + Challenges'),
  ];
}
export const homeStatus = { club: club1k.open, challenge: challenge1k.open };
