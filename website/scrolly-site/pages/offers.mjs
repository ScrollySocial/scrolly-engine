// $1K / $10K / $24K Club + Challenge pages and the /clubs/ + /challenges/ collections.
// $1K copy comes from Mercedes's offer breakdown (2026-09-21). $10K/$24K stay "preview" copy: their contents are not decided yet, so nothing is invented.
// Purchase CTAs render ONLY when the WooCommerce product is published + in stock (status.mjs, checked at build time).
import { shell, img, ICON_UR, esc, endCta, min } from '../lib.mjs';
import { club1k, challenge1k, club1kVariations } from '../status.mjs';

const TIERS = {
  '1k': { amt: '$1K', word: '$1,000', cls: 't1', tag: 'Prove it.', tile: 'Make your first consistent $1K/month using organic marketing.', ids: { club: 291, challenge: 303 } },
  '10k': { amt: '$10K', word: '$10,000', cls: 't2', tag: 'Make it your living.', tile: 'Reach consistent $10K profit months using organic marketing.', ids: { club: 304, challenge: 305 } },
  '24k': { amt: '$24K', word: '$24,000', cls: 't3', tag: 'Scale it.', tile: 'Grow to $24K profit months using paid advertising for the next level.', ids: { club: 306, challenge: 307 } },
};

const mailto = (name) => `mailto:hello@scrollyseo.com?subject=${encodeURIComponent('Launch updates: ' + name)}&body=${encodeURIComponent(`Hi Scrolly, please let me know when ${name} is ready to launch. Thank you!`)}`;
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

// ---------------------------------------------------------------- $1K Club + Challenge (one page, v3 2026-09-23)
// Follows website/scrolly-site/CLAUDE.md + products/1k-club/sales-page-v2-brief.md: teal-dominant, black text, homepage components
// (.goal stripe tracker, .tile-style solid panels, .earned band, pill buttons), no outlined boxes, no dash marks, no orange text on
// cream/teal, no em dashes. Buttons add straight to checkout; the shirt size is asked at checkout (challenge-shirt-size-checkout.php).
const K1_CSS = `
.scx .k1h{background:var(--tier);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);align-items:center;gap:clamp(20px,3vw,48px);padding:clamp(40px,5.5vw,84px) var(--gut) clamp(44px,5.5vw,84px);min-height:560px}
.scx .k1h h1{font-size:clamp(42px,5.2vw,84px);line-height:.92;letter-spacing:-.03em;text-wrap:balance}
.scx .k1h .lede{margin-top:26px;max-width:560px;font-size:clamp(20px,1.8vw,26px);line-height:1.3;font-weight:700}
.scx .k1h .sub2{margin-top:14px;max-width:540px;font-size:clamp(17px,1.4vw,20px);line-height:1.4;font-weight:500}
.scx .k1-acts{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}
.scx .k1-acts .btn{min-height:62px;font-size:clamp(17px,1.4vw,20px);padding:0 30px}
.scx .btn.k1-white,.scx .btn.k1-white:hover,.scx .btn.k1-white:focus{background:#fff;border-color:#fff;color:#000!important}
.scx .btn.k1-teal,.scx .btn.k1-teal:hover,.scx .btn.k1-teal:focus{background:var(--tier);border-color:var(--tier);color:#000!important}
.scx .btn.k1-teal *,.scx .btn.k1-white *{color:#000!important}
.scx .k1h .fine{margin-top:16px;font-size:14px}
.scx .k1h{position:relative;overflow:hidden}
.scx .k1h .art{position:relative;container-type:size;pointer-events:none}
.scx .k1h .art img{position:absolute;max-width:none;margin:0;height:auto}
.scx .k1h .art:not(.lay) img{left:0;top:0;width:100%;height:100%;object-fit:contain}
.scx .k1h .art.l1 .ly-s{width:min(112cqw,158cqh);left:-4%;top:48%;transform:translateY(-58%)}
.scx .k1h .art.l1 .ly-t{width:min(100cqw,176cqh);left:0;top:52%;transform:translateY(-50%)}
.scx .k1h .art.l10 .ly-s{width:min(120cqw,196cqh);left:-6%;top:44%;transform:translateY(-50%)}
.scx .k1h .art.l10 .ly-t{width:min(92cqw,138cqh);left:4%;bottom:0}
.scx .k1h .art.l24 .ly-s{width:min(130cqw,210cqh);left:-24%;top:42%;transform:translateY(-50%)}
.scx .k1h .art.l24 .ly-t{width:min(100cqw,150cqh);right:-2%;bottom:0}
/* every tier page shares one hero box: same height and same art area on desktop, same height on mobile */
@media(min-width:901px){.scx .k1h{height:clamp(540px,44vw,700px);min-height:0;padding-top:0;padding-bottom:0;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr)}.scx .k1h .art{position:absolute;top:0;right:0;bottom:0;width:49%}}
@media(max-width:900px){.scx .k1h{min-height:840px;grid-template-rows:1fr auto;align-items:center}.scx .k1h .art{height:clamp(260px,78vw,360px);align-self:end;margin:0 calc(-1*var(--gut)) calc(-1*clamp(44px,5.5vw,84px))}.scx .k1h .art.l1 .ly-s{width:124%;left:-12%;top:auto;bottom:0;transform:none}.scx .k1h .art.l1 .ly-t{width:108%;left:-4%;top:auto;bottom:8%;transform:none}.scx .k1h .art.l10 .ly-s{width:120%;left:-10%;top:0;transform:none}.scx .k1h .art.l10 .ly-t{width:96%;left:2%}.scx .k1h .art.l24 .ly-s{width:130%;left:-20%;top:auto;bottom:10%;transform:none}.scx .k1h .art.l24 .ly-t{width:112%;left:auto;right:-4%;bottom:0}}
.scx .goal .yg{color:#fff}
.scx .goal .big.k1-one{font-size:clamp(28px,3.5vw,50px);line-height:1;max-width:calc(100% - clamp(0px,18vw,260px))}
@media(max-width:760px){.scx .goal .big.k1-one{max-width:none}}
.scx .k1-goal .track i{width:40%;background:var(--tier)}
.scx .k1-goal .pct b{color:var(--tier)}
.scx .k1-pick{background:var(--cream);padding:clamp(48px,6vw,90px) var(--gut);text-align:center}
.scx .k1-pick h2{font-size:clamp(44px,6.2vw,92px)}
.scx .k1-pick .intro{margin:16px auto 0;max-width:620px;font-size:clamp(18px,1.5vw,21px);line-height:1.4}
.scx .k1-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px;max-width:1120px;margin:clamp(30px,3.4vw,48px) auto 0;text-align:left}
.scx .k1-tile{display:flex;flex-direction:column;gap:24px;padding:44px 36px 36px;transition:transform .15s,box-shadow .15s}
.scx .k1-tile:hover,.scx .k1-tile:focus-within{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
.scx .k1-tile.club{background:var(--tier);color:#000}
.scx .k1-tile.chal{background:#000;color:#fff}
.scx .k1-tile.chal:hover,.scx .k1-tile.chal:focus-within{box-shadow:6px 6px 0 var(--tier)}
.scx .k1-tile .amt{font-family:var(--disp);font-weight:900;font-size:clamp(70px,7vw,104px);line-height:.85;letter-spacing:-.03em}
.scx .k1-tile.chal .amt{color:var(--tier)}
.scx .k1-tile h3{font-family:var(--disp);font-weight:900;font-size:clamp(28px,2.6vw,38px);line-height:.95;text-transform:uppercase;margin-top:14px}
.scx .k1-tile .one{margin-top:10px;font-size:18px;font-weight:600}
.scx .k1-tile ul{list-style:none;padding:0;margin:0;display:grid;gap:14px;flex:1}
.scx .k1-tile li{font-size:17px;line-height:1.35}
.scx .k1-tile li b{display:block;font-weight:800;font-size:18px}
.scx .k1-tile .btn{align-self:flex-start;min-height:60px;font-size:19px;padding:0 30px}
.scx .k1-earned{background:#000;color:#fff}
.scx .k1-earned .btn{margin-top:26px}
.scx .k1-earned .k1-cap{margin-top:18px;max-width:440px;text-align:center;font-size:clamp(18px,1.6vw,22px);line-height:1.35;font-weight:700;color:var(--cap)}
.scx .k1-earned .r{flex-direction:column;align-items:center}
.scx .k1-shirtrow{position:relative;width:100%;display:flex;justify-content:center;padding-left:clamp(0px,11vw,170px)}
.scx .k1-doodle{position:absolute;left:-10px;top:-6%;z-index:2;display:flex;flex-direction:column;align-items:flex-end}
.scx .k1-doodle .hand{font-size:clamp(24px,2.4vw,34px);line-height:1.05;color:#fff;transform:rotate(-8deg);text-align:center}
.scx .k1-doodle svg{width:clamp(90px,8vw,130px);height:auto;margin-top:10px;}
@media(max-width:900px){.scx .k1-shirtrow{flex-direction:column;align-items:center;padding-left:0}.scx .k1-doodle{position:static;align-items:center;margin:0 0 8px}.scx .k1-doodle svg{transform:rotate(55deg)}}
.scx .faq summary{font-size:clamp(19px,1.7vw,23px)}
.scx .faq details p{font-size:clamp(18px,1.4vw,20px);line-height:1.5}
.scx .k1-faqimg{display:block;width:100%;max-width:520px;height:auto;margin:14px 0;border-radius:10px}
.scx .earned.k1-earned{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)}
.scx .k1-tees{display:flex;gap:clamp(4px,1vw,14px);width:100%;max-width:820px}
.scx .earned .k1-tees img{display:block;width:50%;max-width:none;height:auto}
.scx .faq summary::after{color:#000}
.scx .eyebrow.or.k1-eb{color:#000}
.scx .k1-end{position:relative;background:#000;color:#fff;text-align:center;padding:clamp(64px,8vw,120px) var(--gut) clamp(64px,7vw,110px);overflow:hidden}
.scx .k1-end h2{font-size:clamp(48px,7.4vw,116px);color:#fff}
.scx .k1-end h2 span{color:var(--tier)}
.scx .k1-end p{margin-top:16px;font-size:19px}
.scx .k1-end .k1-acts{justify-content:center}
@media(max-width:900px){.scx .k1h{grid-template-columns:1fr}.scx .k1-tiles{grid-template-columns:1fr;gap:18px}.scx .k1-tile{padding:32px 24px 28px}}
`;

const PREVIEW = {
  '10k-club': { h1: 'Build toward your next $10,000.', lede: 'The next Scrolly Club is taking shape: practical organic-growth direction for businesses ready to work toward a bigger goal.', steps: [['Find opportunities', 'Identify organic-growth opportunities that fit your business and stage.'], ['Put ideas to work', 'Turn the next growth priorities into practical actions.'], ['Learn as you go', 'Review what you tried and use real results to inform the next step.']] },
  '24k-club': { h1: 'Build toward a $24,000 month.', lede: 'The next Scrolly Club is taking shape: practical organic-growth direction for businesses ready to work toward a bigger goal.', steps: [['Find opportunities', 'Identify organic-growth opportunities that fit your business and stage.'], ['Put ideas to work', 'Turn the next growth priorities into practical actions.'], ['Learn as you go', 'Review what you tried and use real results to inform the next step.']] },
  '10k-challenge': { h1: 'Take on your next $10,000.', lede: 'A focused Scrolly Challenge for businesses ready to take on a bigger revenue goal. The format and entry details are being developed.', steps: [['Set your goal', 'Work toward your next $10,000. Challenge duration and entry requirements will be confirmed before launch.'], ['Take action', 'Put focused organic-growth work into practice. The final support and opportunity format is still being developed.'], ['Review your progress', 'Track your attempt and review the evidence of progress.']] },
  '24k-challenge': { h1: 'Take on a $24,000 month.', lede: 'A focused Scrolly Challenge for businesses ready to take on a bigger revenue goal. The format and entry details are being developed.', steps: [['Set your goal', 'Work toward a $24,000 month. Challenge duration and entry requirements will be confirmed before launch.'], ['Take action', 'Put focused organic-growth work into practice. The final support and opportunity format is still being developed.'], ['Review your progress', 'Track your attempt and review the evidence of progress.']] },
};

const TIER_PAGES = {
  '1k': { key: '1k-club', id: 291, amt: '$1K', tier: 'var(--teal)', cap: 'var(--lav)', art: 'tiger-stride.png', layers: [['k1-strokes.webp', 1536, 1024], ['k1-tiger.webp', 1774, 887]], lay: 'l1',
    h1: 'Don’t know where to start making money online?', h1b: 'We’ve got you.',
    goal: 'Earn your first $1,000.00 online', pct: ['$1K', 'your first goal'], end: 'Earn your <span>first stripe.</span>',
    intro: 'The Club gives you the plan. The Challenge gives you 30 consecutive days to go get it, and a shirt when you do.',
    club: { one: 'Your plan, yours to keep. One-time.', items: [['The $1K Club playbook (PDF)', 'Make your first $1K with Instagram, step by step.'], ['Reel and carousel templates', 'A Reel safe-zone guide and a 3:4 carousel template.'], ['Setup checklist and worksheets', 'Printable, for every step in the playbook.'], ['$1K Math calculator', 'How many sales it takes to reach $1,000.']] },
    chal: { one: 'Everything in the Club, plus:', items: [['Your personal $1K Plan', 'Your $1K number, what to do each week, and a weekly check-in.'], ['25 Reel ideas every week', 'Current formats, ready to film. Plus 30 carousel and 30 Story templates.'], ['30 consecutive days, one goal', '$1,000 in total revenue.'], ['Your stripe shirt', 'Hit $1,000 and it ships free in the lower 48. Pick your size at checkout.']] },
    shirt: ['shirt-1k-challenge-back-teal.webp', 'Back of the $1K Challenge stripe shirt: Earned my first stripe. Built it. Proved it. Scrolly $1K Club.', 'shirt-1k-challenge-front-teal.webp'],
    caption: 'Hit $1,000 in 30 consecutive days and your stripe shirt ships free in the lower 48.',
    faqs: [
      ['Is $1,000 guaranteed?', 'No, and that’s the point. It isn’t a guarantee. It’s a realistic plan built to give you a real shot at it, and the win means something because it isn’t handed to you. Results depend on your offer, your customers and the work you put in.'],
      ['What counts toward the $1,000?', 'Total money your business collects for its products or services during your 30 consecutive days. Sales tax, shipping you charge and refunds don’t count. It doesn’t have to be one product.'],
      ['How do I earn the shirt?', 'Hit $1,000 in total revenue inside your 30 consecutive days, then show your sales records. Once they’re verified, your stripe shirt ships to you. Everyone who hits the goal earns one.'],
      ['Is shipping free?', 'Free to addresses in the lower 48 US states. Anywhere else, you can still earn your shirt: we’ll email you to arrange shipping, which you pay.'],
      ['When do I pick my shirt size?', `At the top of checkout, right under your email. It looks like this:<img class="k1-faqimg" src="${img('checkout-shirt-size-v2.png')}" alt="The Stripe shirt size dropdown at checkout" width="900" height="164" loading="lazy">Shirts are adult men’s S to 4XL in Comfort Colors 1717, a heavyweight cotton tee with a relaxed fit.`],
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

// One template for every tier: hero, stripe tracker, Club/Challenge tiles, shirt band, FAQ, closing CTA.
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
  const news = (cls) => `<a class="btn btn-pill ${cls}" href="${mailto(`${c.amt} Club + Challenge`)}"><span>Get launch news</span>${ICON_UR(20)}</a>`;
  const joinClub = (cls) => open ? `<a class="btn btn-pill ${cls}" href="/checkout/?add-to-cart=${clubV.id}"><span>Join the Club, ${clubP}</span></a>` : '';
  const joinChal = (cls) => open ? `<a class="btn btn-pill ${cls}" href="/checkout/?add-to-cart=${chalV.id}"><span>Join the Challenge, ${chalP}</span>${ICON_UR(20)}</a>` : news(cls);
  const list = (items) => `<ul>${items.map(([h, p]) => `<li><b>${h}</b>${p}</li>`).join('')}</ul>`;
  const body = `<style>${min(K1_CSS)}.scx{--tier:${c.tier};--cap:${c.cap}}</style>
<section class="k1h"><div>
 <h1 class="disp">${c.h1}<br><span class="it">${c.h1b}</span></h1>
 <div class="k1-acts">${joinChal('btn-black')}${joinClub('k1-white')}</div>
 <p class="fine">Results not guaranteed. Revenue before costs.</p>
</div>${c.layers ? `<div class="art lay ${c.lay}"><img class="ly-s" src="${img(c.layers[0][0])}" alt="" width="${c.layers[0][1]}" height="${c.layers[0][2]}"><img class="ly-t" src="${img(c.layers[1][0])}" alt="Illustrated tiger" width="${c.layers[1][1]}" height="${c.layers[1][2]}" fetchpriority="high"></div>` : `<div class="art"><img src="${img(c.art)}" alt="Illustrated tiger" width="1200" height="754" fetchpriority="high"></div>`}</section>
<section class="goal k1-goal">
 <div class="disp big k1-one">${c.goal}</div>
 <div class="hand yg" aria-hidden="true"><div>You got this!</div><svg viewBox="0 0 70 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M4 8L60 3M12 20L66 15"/></svg></div>
 <div class="prog">
  <div class="bar"><div class="track" role="img" aria-label="Illustration: the five steps from start to stripe earned"><i></i></div>
   <ol><li><em>01</em> Start</li><li class="on"><em>02</em> Build</li><li><em>03</em> Progress</li><li><em>04</em> Verify</li><li><em>05</em> Stripe earned</li></ol></div>
  <div class="pct"><b>${c.pct[0]}</b><span>${c.pct[1]}</span></div>
 </div>
</section>
<section class="k1-pick" id="join">
 <h2 class="disp">Club or Challenge?</h2>
 <p class="intro">${c.intro}</p>
 <div class="k1-tiles">
  <div class="k1-tile club"><div><div class="amt">${clubP}</div><h3>The ${c.amt} Club</h3><div class="one">${c.club.one}</div></div>${list(c.club.items)}${open ? joinClub('btn-black') : news('btn-black')}</div>
  <div class="k1-tile chal"><div><div class="amt">${chalP}</div><h3>Club + Challenge</h3><div class="one">${c.chal.one}</div></div>${list(c.chal.items)}${joinChal('k1-teal')}</div>
 </div>
</section>
<section class="earned k1-earned">
 <div class="l">
  <div class="k">Some things can’t be bought.</div>
  <h2 class="disp">They’re earned</h2>
  ${joinChal('k1-teal')}
 </div>
 <div class="r">
  <div class="k1-shirtrow"><div class="k1-doodle" aria-hidden="true"><span class="hand">Success looks<br>good on you!</span><svg viewBox="0 0 140 80" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12c26-10 48 0 42 18-4 13-23 10-19-3 5-15 38-14 60 4 11 9 21 17 42 22"/><path d="M114 40l18 13-20 9"/></svg></div>
  <div class="k1-tees"><img class="bk" src="${img(c.shirt[0])}" alt="${c.shirt[1]}" width="1367" height="1400" loading="lazy"><img class="fr" src="${img(c.shirt[2])}" alt="Front of the shirt: Scrolly Challenge Winner paw print" width="1360" height="1400" loading="lazy"></div></div>
  <p class="k1-cap">${c.caption}</p>
 </div>
</section>
${faq(c.faqs)}
<section class="k1-end"><h2 class="disp">${c.end}</h2><p>${open ? 'One-time. No subscription, ever.' : 'Coming soon. Get launch news first.'}</p><div class="k1-acts">${joinChal('k1-teal')}${joinClub('k1-white')}</div></section>`;
  return { key: c.key, id: c.id, title: `${c.amt} Club + Challenge, Scrolly`, html: shell(body) };
}

// Old URLs (separate Challenge pages, /clubs/, /challenges/) forward to the combined pages.
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
    ['Tee', 'An exclusive winner shirt', 'Two design choices, after a verified successful Challenge.'],
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
<section class="earned" id="earned"><div class="l"><div class="k">Some things can’t be bought.</div><h2 class="disp">They’re earned</h2><p style="margin-top:18px;max-width:560px;font-size:clamp(18px,1.6vw,22px);line-height:1.35;font-weight:600">Complete a verified, successful Challenge to Earn Your Stripe — and an exclusive winner shirt, with two design choices.</p><a class="btn btn-pill btn-black" href="/1k-club/"><span>Start with the $1K Club</span></a></div><div class="r"><div class="hand sl" aria-hidden="true"><div>Success</div><div>looks good</div><div>on you!</div></div><img src="${img('shirt-earned-edition.png')}" alt="Earned Edition shirt" width="454" height="347" loading="lazy"><p>FREE, EXCLUSIVE T-SHIRTS FOR CHALLENGE WINNERS!</p></div></section>
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
  return { key: '1k-challenge', id: 303, title: '$1K Challenge — Scrolly', html: shell(fwd) };
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
    ['Can I start with the $1K Club?', 'Yes — the <a class="ulink" href="/1k-club/">$1K Club</a> is where Scrolly starts.'],
  ])}
<section class="cta-end"><span class="eyebrow" style="color:var(--lav)">Next up</span><h2 class="disp" style="margin-top:14px">${name} is <span class="it or">coming soon.</span></h2><p>Request launch news by email, or use our contact form to ask a question. The launch-news button opens your email app; your request is sent only when you send the email.</p><div class="actions"><a class="btn btn-white" href="${mailto(name)}"><span>Request launch news</span></a><a class="btn btn-line" href="/contact/"><span>Contact Scrolly</span></a></div></section>`;
  return { key, id: t.ids[kind], title: `${name} — Scrolly`, html: shell(body) };
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
   <div class="eyebrow">Scrolly ${K}s</div>
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
  return { key: isClub ? 'clubs' : 'challenges', id: isClub ? 314 : 315, title: `Scrolly ${K}s`, html: shell(body) };
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
