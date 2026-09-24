import { shell, img, ICON_UR, ICON_L, ICON_R, productCard, railSection, merchCards, endCta } from '../lib.mjs';
import { club1k, challenge1k } from '../status.mjs';
import { merch, digital } from '../shop-data.mjs';

const tile = (cls, amt, h3, p, club, ch) =>
  `<div class="tile ${cls}" data-club="${club[0].split('/')[1].split('-')[0]}"><div><div class="amt">${amt}</div><h3>${h3}</h3><p>${p}</p></div><div class="links"><a class="ulink stretch" href="${club[0]}">${club[1]} ↗</a>${ch ? `<a class="ulink" href="${ch[0]}">${ch[1]} ↗</a>` : ''}</div></div>`;

const reelCells = [
  '<div class="cell">Learn &amp; earn!</div>',
  '<div class="cell"><span>Less scrolling,</span><em>More Scrolly!</em></div>',
];
const reel = `<section class="reel" id="reel" aria-label="Less scrolling, More Scrolly"><div class="perf" aria-hidden="true"></div><div class="track">${[...reelCells, ...reelCells, ...reelCells, ...reelCells].join('')}</div><div class="perf b" aria-hidden="true"></div></section>`;

// Goal slider that sits directly under the hero. Only the $1K Club is purchasable today (status.mjs); the others say "Coming soon".
const SLIDES = [
  ['1k', '$1K', 'Prove it.', 'Make your first $1K month using organic marketing.', 'tiger-stride.png', () => club1k.open],
  ['10k', '$10K', 'Make it your living.', 'Reach consistent $10K profit months using organic marketing.', 'tiger-leap.png', () => false],
  ['24k', '$24K', 'Scale it.', 'Grow to $24K profit months using paid advertising for the next level.', 'tiger-stride.png', () => false],
];
function heroCarousel() {
  const first = `<div class="hsl-slide hero is-active" data-club="stripes" role="group" aria-roledescription="slide" aria-label="1 of 4: Earn your Stripes"><div class="txt"><h1 class="disp h-xl"><span>Earn your</span><span class="it or">Stripes</span></h1><p class="lede">Online-marketing systems, Clubs and Challenges to help you build, grow and put your goals to work.</p><div class="actions"><a class="btn" href="#clubs"><span>Explore Clubs + Challenges</span>${ICON_UR(20)}</a></div></div><div class="art"><img src="${img('tiger-hero.png')}" alt="Illustrated tiger" width="638" height="418" fetchpriority="high"></div></div>`;
  const rest = SLIDES.map(([k, amt, tag, desc, art, open], i) => `<div class="hsl-slide" data-club="${k}" role="group" aria-roledescription="slide" aria-label="${i + 2} of 4: ${amt}"><div><span class="pill pill-navy">${amt} Club · ${open() ? 'Available now' : 'Coming soon'}</span><h2 class="disp">I want to<br><span class="it">make ${amt}</span></h2><p class="sub"><strong>${tag}</strong> ${desc}</p><a class="btn btn-black" href="/${k}-club/"><span>Show me how</span>${ICON_UR(20)}</a></div><div class="hsl-art" aria-hidden="true"><img src="${img(art)}" alt="" width="1200" height="754" loading="lazy"></div></div>`).join('');
  const tabs = [['stripes', 'Home'], ...SLIDES.map(([k, amt]) => [k, amt])].map(([k, label], i) => `<button type="button" class="hsl-tab" role="tab" aria-selected="${i === 0}" data-club="${k}">${label}</button>`).join('');
  return `<section class="hsl" data-club="stripes" aria-roledescription="carousel" aria-label="Scrolly highlights">${first}${rest}<div class="hsl-bar"><button type="button" class="hsl-nav hsl-prev" aria-label="Previous slide">${ICON_L}</button><div class="hsl-tabs" role="tablist" aria-label="Choose a slide">${tabs}</div><button type="button" class="hsl-nav hsl-next" aria-label="Next slide">${ICON_R}</button><button type="button" class="hsl-pause" aria-pressed="false" hidden>Pause slideshow</button></div></section>`;
}

// Real Challenge shirts (same cut-out art as the tier pages). $1K shows by default; hovering a club tile swaps in that club's shirt.
const TEES = {
  '1k': ['shirt-1k-challenge-back-cut.webp', 'Back of the $1K Challenge stripe shirt: Earned my first stripe. Built it. Proved it. Scrolly $1K Club.', 1367],
  '10k': ['shirt-10k-challenge-back-cut.webp', 'Back of the $10K Challenge stripe shirt: Higher goals ahead. Built it. Living it. Scrolly $10K Club.', 1374],
  '24k': ['shirt-24k-challenge-back-cut.webp', 'Back of the $24K Challenge stripe shirt: Turns out, I could reach them. Scrolly $24K Club.', 1374],
};
const tee = (k) => `<img class="tee-club" data-club="${k}" src="${img(TEES[k][0])}" alt="${TEES[k][1]}" width="${TEES[k][2]}" height="1400" loading="lazy" hidden>`;

export const title ='Scrolly — Earn your Stripes';
export const slug = 'scrolly-home';
export const id = 161;

export function build() {
  const body = `
${heroCarousel()}


<section class="goal" data-club="">
 <div class="disp big">Big goals.</div>
 <div class="disp big2">One stripe at a time...</div>
 <div class="hand yg" aria-hidden="true"><div>You got this!</div><svg viewBox="0 0 70 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M4 8L60 3M12 20L66 15"/></svg></div>
 <div class="prog">
  <div class="bar"><div class="track" role="img" aria-label="Illustration: a progress bar filled 62 percent"><i></i></div>
   <ol><li><em>01</em> Start</li><li><em>02</em> Build</li><li class="on"><em>03</em> Progress</li><li><em>04</em> Verify</li><li><em>05</em> Stripe earned</li></ol></div>
  <div class="pct"><b>62%</b><span>towards goal</span></div>
 </div>
</section>

<section class="tilesec" id="clubs">
 <h2 class="disp h-md">Choose your challenge</h2>
 <div class="tiles">
  ${tile('t1', '$1K', 'Prove it.', 'Make your first $1K month using organic marketing.', ['/1k-club/', '$1K Club + Challenge'], null)}
  ${tile('t2', '$10K', 'Make it<br>your living.', 'Reach consistent $10K profit months using organic marketing.', ['/10k-club/', '$10K Club + Challenge'], null)}
  ${tile('t3', '$24K', 'Scale it.', 'Grow to $24K profit months using paid advertising for the next level.', ['/24k-club/', '$24K Club + Challenge'], null)}
 </div>
 <p class="fine">Revenue figures are goals, not guaranteed results.</p>
</section>

<section class="earned home-earned" id="earned" data-club="">
 <div class="l">
  <div class="k">Some things can’t be bought.</div>
  <h2 class="disp">They’re earned</h2>
  <a class="btn btn-pill btn-or" href="/1k-club/#join"><span>EARN YOUR FREE SHIRT</span></a>
 </div>
 <div class="r">
  <div class="hand sl" aria-hidden="true"><div>Success</div><div>looks good</div><div>on you!</div></div>
  <img class="tee-photo" src="${img(TEES['1k'][0])}" alt="${TEES['1k'][1]}" width="1367" height="1400" loading="lazy">${Object.keys(TEES).map(tee).join('')}
  <p>FREE, EXCLUSIVE T-SHIRTS FOR CHALLENGE WINNERS!</p>
 </div>
</section>

<section class="steps3" aria-label="How Scrolly works">
 <div><b>Build</b><span>Clarify your offer</span></div>
 <div><b>Grow</b><span>Try, learn, repeat</span></div>
 <div><b>Earn</b><span>Earn your Stripes</span></div>
</section>

<section class="cat">
 <img src="${img('tiger-stride.png')}" alt="Tiger mid-stride" width="1774" height="887" loading="lazy">
 <h2 class="disp">Big cat<br>Energy.</h2>
</section>

<section class="calc" id="calculator">
 <div>
  <div class="hd"><div class="disp a">Goal planning made</div><div class="disp b or it">Easy tiger<span>.</span></div></div>
  <form class="calcard" onsubmit="return false" aria-label="Sales goal calculator">
   <div class="r2">
    <div><label for="calc-goal">Your goal</label><input class="f" id="calc-goal" inputmode="decimal" autocomplete="off" value="$10,000"></div>
    <div><label for="calc-avg">Average sale amount</label><input class="f" id="calc-avg" inputmode="decimal" autocomplete="off" value="$200"></div>
   </div>
   <div class="tf"><label for="calc-days">Timeframe</label>
    <select class="f" id="calc-days"><option value="7">7 days</option><option value="14">14 days</option><option value="30" selected>30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></div>
   <div class="out"><b id="calc-out" aria-live="polite">50</b><span>sales required</span></div>
   <div class="per" id="calc-per" aria-live="polite"></div>
   <div class="note">Illustrative calculation. Revenue before costs.</div>
  </form>
 </div>
 <div class="side">
  <h2 class="disp">Free business<br>Calculators</h2>
  <a class="btn btn-pill" href="#calculator" data-focus-calc><span>TRY IT OUT</span></a>
 </div>
</section>

<section class="tag"><h2 class="disp"><span>Less scrolling,</span><span class="it or">More Scrolly!</span></h2></section>

${railSection({
  id: 'products', title: 'Digital products', link: '/digital-products/',
  cards: digital.map((p) => productCard({ href: p.href, title: p.name, sub: p.sub, price: p.price, image: p.image })).join(''),
})}

${railSection({ id: 'shop-merch', title: 'Merch', link: '/scrolly-shop/', cards: merchCards(merch) })}

${reel}

${endCta()}
`;
  return shell(body);
}
