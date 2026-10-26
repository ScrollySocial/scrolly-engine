// Homepage v3 (2026-10-03): approved reference = scrolly-claude-package.zip / scrolly-homepage-reference.html (copy in dist/ref.html, gitignored).
// Self-contained page (home.css, not shared.css). Header + footer are the global chrome (chrome/), not part of this page.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { img, min } from '../lib.mjs';
import { merch } from '../shop-data.mjs';
import { CALCS, HELPERS, compute } from '../calculators-data.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const CSS = min(fs.readFileSync(path.join(here, '..', 'home.css'), 'utf8'));

// Real member quotes only (with permission). The section stays hidden while this is empty. Shape: { q: 'quote text', who: 'Name, business' }
const TESTIMONIALS = [];

// Free Resources (images 2026-10-07: real calculator screenshot, the three real free PDF titles, a B&W tiger; the old photos showed books and mugs that aren't products). href: a URL, a list of [label, URL] links (Downloads = the free MailerLite lead magnets), or null, which renders "Coming soon" instead of an arrow link (tracked in Notion: theambitiondepartment.com missing links).
const RESOURCES = [
  // 2026-10-10: Blog card removed (no blog yet, and no image matched the phone-screen cards). The old Downloads card linked to free
  // scorecards that no longer exist on the workbook pages, so the row is now the two free quizzes + calculators, all real screens.
  ['Offer Quiz', 'hp3-res-quiz-offer.webp', '/quiz/', 'Find your first offer'],
  ['Next Move Quiz', 'hp3-res-quizzes.webp', '/next-move/', 'Find your next move'],
  ['Calculators', 'hp3-res-calculators-v3.webp', '/calculators/'],
];

// Hand-drawn doodles over the Club tigers (Mercedes 2026-10-20): a crown on the $24K tiger, sparkles on $1K, speed swooshes on $10K, so the
// three read as a set. Navy lines, crown filled sky blue, no pink (pink = Mercedes only). Drawn in each image's own pixel space
// (viewBox = image size) and laid over the <img>, so they scale with it; overflow lets the crown rise above the head.
const D = 'fill="none" stroke="#0a1930" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"';
const spark = (x, y, r) => `<path d="M${x} ${y - r}Q${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y}Q${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r}Q${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y}Q${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r}Z"/>`;
const DOODLES = {
  '$1K': ['0 0 1000 363', `<g ${D}>${spark(908, 26, 44)}${spark(975, 112, 26)}${spark(730, 2, 24)}<path d="M960 30q9 -4 14 -14"/><path d="M700 40q-8 -6 -16 -4"/></g>`],
  '$10K': ['0 0 1000 357', `<g ${D}><path d="M58 120q-26 4 -52 -4"/><path d="M50 182q-34 2 -68 -2"/><path d="M66 246q-24 4 -48 0"/></g>`],
  '$24K': ['0 0 1000 347', `<g transform="translate(838 -14) rotate(-14)"><path d="M-58 28Q-62 -2 -66 -30L-30 -2Q-14 -26 2 -46Q14 -24 28 -2L66 -30Q60 0 58 28Q2 36 -58 28Z" fill="#4da3ff" stroke="#0a1930" stroke-width="6" stroke-linejoin="round"/><path d="M-52 14Q2 22 54 14" fill="none" stroke="#0a1930" stroke-width="5" stroke-linecap="round"/><circle cx="-66" cy="-34" r="7" fill="#0a1930"/><circle cx="2" cy="-52" r="7" fill="#0a1930"/><circle cx="66" cy="-34" r="7" fill="#0a1930"/></g><g ${D}><path d="M748 -20l-14 -12"/><path d="M930 -24l14 -14"/><path d="M952 6l20 -2"/></g>`],
};
const doodle = (amt) => { const d = DOODLES[amt]; return d ? `<svg class="dd" viewBox="${d[0]}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${d[1]}</svg>` : ''; };

// Earned band art (Mercedes 2026-10-20): a torn-paper collage sky (made from mockups/rebrand-2026-10/shirt-background-prompt.md) with the
// cut-out shirt on top. Files assets/earned-soft-s2-*.webp + shirt-1k-graphite-front-cut-clean.webp (the cut-out with its pale haze removed).
// Upload them with `node upload-media.mjs <file>` before publishing; until then the URL is the expected upload path (preview-chrome.mjs
// swaps in the local file).
const EARNED_ART = ['earned-soft-s2-card.webp', 'earned-soft-s2-top.webp', 'earned-soft-s2-bottom.webp', 'earned-soft-s2-stars.webp'];
const MEDIA = JSON.parse(fs.readFileSync(path.join(here, '..', 'media-map.json'), 'utf8'));
const artUrl = (n) => MEDIA[n]?.url || `https://theambitiondepartment.com/wp-content/uploads/2026/10/scrolly-${n}`;

const CLUBS = [
  ['$1K', 'Make your first $1,000.', 'hp3-club-1k-tiger.webp', 'Tiger walking', '/1k-club/', 'Start here.'],
  ['$10K', 'Make $10,000 organically.', 'hp3-club-10k-tiger.webp', 'Tiger running', '/10k-club/', 'Grow here.'],
  ['$24K', 'Make $24,000 and beyond.', 'hp3-club-24k-tiger.webp', 'Tiger leaping', '/24k-club/', 'Scale here.'],
];

const pic = (name, alt, cls, extra = '') => {
  const m = JSON.parse(fs.readFileSync(path.join(here, '..', 'media-map.json'), 'utf8'))[name];
  return `<img class="${cls}" src="${img(name)}" alt="${alt}" width="${m.w}" height="${m.h}"${extra}>`;
};

function quotes() {
  if (!TESTIMONIALS.length) return '';
  const many = TESTIMONIALS.length > 1;
  const items = TESTIMONIALS.map((t, i) => `<blockquote${i ? ' hidden' : ''}><p class="q">“${t.q}”</p>${t.who ? `<p class="who eyebrow">${t.who}</p>` : ''}</blockquote>`).join('');
  return `<section class="hp-quotes" aria-labelledby="hp-quotes-h"><div class="wrap"><h2 id="hp-quotes-h">What customers are saying</h2>
<div class="row">${many ? '<button type="button" class="prev" aria-label="Previous testimonial">←</button>' : '<span></span>'}<div aria-live="polite">${items}</div>${many ? '<button type="button" class="next" aria-label="Next testimonial">→</button>' : '<span></span>'}</div>
${many ? `<div class="dots" aria-hidden="true">${TESTIMONIALS.map((_, i) => `<span${i ? '' : ' class="on"'}></span>`).join('')}</div>` : ''}</div></section>`;
}

// Inline page script. Keep it free of '&': WordPress can mangle it inside page content.
// The calculator runs the Income Goal calculator's own math and defaults (calculators-data.mjs), so the two never disagree.
// Its results come back as [views, visitors, sales].
const IG = CALCS.find((c) => c.slug === 'income-goal');
const IG_RES = compute(IG);
const SCRIPT = `(function(){var r=document.querySelector('.hp');if(!r||r.__init)return;r.__init=1;
var f=r.querySelector('#hp-calc-form');if(f){var H=${HELPERS},C=${IG.fn},K=${JSON.stringify(IG.fields.map((x) => x.k))};
function calc(){var v={};K.forEach(function(k){var x=parseFloat(r.querySelector('#hp-'+k).value);v[k]=isFinite(x)?x:0});var o=C(v,H),n=Math.ceil(v.goal/v.aov);
r.querySelector('#hp-sales').textContent=o[2][0];r.querySelector('#hp-word').textContent=n===1?'sale':'sales';r.querySelector('#hp-caption').textContent='to make '+H.money(v.goal);
r.querySelector('#hp-visitors').textContent=o[1][0];r.querySelector('#hp-views').textContent=o[0][0]}
f.addEventListener('submit',function(e){e.preventDefault();calc()});f.addEventListener('input',calc);calc()}
var qs=r.querySelector('.hp-quotes');if(qs){var bq=[].slice.call(qs.querySelectorAll('blockquote')),ds=[].slice.call(qs.querySelectorAll('.dots span')),ix=0;
function show(n){ix=(n+bq.length)%bq.length;bq.forEach(function(b,i){b.hidden=i!==ix});ds.forEach(function(d,i){d.classList.toggle('on',i===ix)})}
var p=qs.querySelector('.prev'),nx=qs.querySelector('.next');if(p)p.addEventListener('click',function(){show(ix-1)});if(nx)nx.addEventListener('click',function(){show(ix+1)})}
})();`;
if (SCRIPT.includes('&')) throw new Error('home script must not contain &');

export const title = 'The Ambition Department: Make your first $1,000';
export const slug = 'scrolly-home';
export const id = 161;

export function build() {
  const body = `
<section class="hp-hero"><div class="wrap">
 <div class="copy">
  <h1 class="one">Stand out <em class="or">online.</em></h1>
  <div class="act"><p class="lede"><span>Find your path to more customers</span> <span>without depending on paid ads.</span></p>
  <a class="btn" href="/next-move/">Find my starting point <span aria-hidden="true">→</span></a></div>
 </div>
 ${pic('hp3-hero-tiger.webp', 'Black and white tiger walking forward', 'tiger', ' fetchpriority="high"')}
</div></section>

<section class="hp-calc" id="calculator" aria-labelledby="hp-calc-h"><div class="wrap">
 <div>
  <h2 id="hp-calc-h">What would it take?</h2>
  <form id="hp-calc-form" novalidate>
   ${IG.fields.map((x) => `<div><div class="in${x.suf ? ' suf' : ''}"><input id="hp-${x.k}" type="number" inputmode="decimal" value="${x.val}" min="0" step="${x.step}">${x.suf ? '<span aria-hidden="true">%</span>' : ''}</div><label for="hp-${x.k}">${x.k === 'goal' ? 'Revenue goal' : x.label}${x.suf ? '<span class="sr"> (percent)</span>' : ''}</label></div>`).join('')}
   <button class="go" type="submit" aria-label="Calculate sales, visitors and views">→</button>
  </form>
 </div>
 <div class="res" aria-live="polite"><dl class="more"><div><dt class="n" id="hp-views">${IG_RES[0][0]}</dt><dd>views</dd></div><div><dt class="n" id="hp-visitors">${IG_RES[1][0]}</dt><dd>website visitors</dd></div></dl>
  <div class="row"><div class="num" id="hp-sales">${IG_RES[2][0]}</div><div class="word" id="hp-word">sales</div></div><div class="cap" id="hp-caption">to make $1,000</div></div>
</div></section>

<section class="hp-clubs" id="clubs" aria-labelledby="hp-clubs-h"><div class="wrap">
 <h2 id="hp-clubs-h">Make your next move.</h2>
 <div class="grid">
  ${CLUBS.map(([amt, head, f, alt, href, cta]) => `<article class="hp-club"><h3>${head}</h3><div class="tg">${pic(f, alt, '', ' loading="lazy"')}${doodle(amt)}</div><div class="cta"><a class="btn" href="${href}" aria-label="${cta.replace('.', '')}: ${amt} Club">${cta} <span aria-hidden="true">→</span></a></div></article>`).join('')}
 </div>
</div></section>

<section class="hp-earned" id="earned"><div class="earned-art" aria-hidden="true"><div class="e-top">${EARNED_ART.map((n, i) => `<img${n.includes('-stars') ? ' class="stars"' : ''} src="${artUrl(n)}" alt="" width="1672" height="941"${i ? '' : ' fetchpriority="high"'}>`).join('')}</div><div class="e-bot">${EARNED_ART.map((n) => `<img src="${artUrl(n)}" alt="" width="1672" height="941">`).join('')}</div></div><div class="wrap">
 <div class="copy">
  <h2><span>Some things can’t be bought.</span> <span><em class="or">They’re earned.</em></span></h2>
  <p>Reach your verified Challenge goal and earn the exclusive Club T-shirt.</p>
  <nav class="tabs" aria-label="Challenges"><a href="/1k-club/#join">$1K Club</a><a href="/10k-club/">$10K Club</a><a href="/24k-club/">$24K Club</a></nav>
 </div>
 <!-- 2026-10-26: the chambray "Dared to Succeed" earned shirt (framed model photo) replaced the graphite one. -->
 <div class="shot-col"><img class="cut framed" src="${artUrl('shirt-1k-dared-model.webp')}" alt="A woman wearing the chambray $1K Challenge earned shirt: a knight riding a leaping tiger above Dared to Succeed." width="1200" height="1200" loading="lazy" style="border:12px solid #fff;border-radius:6px;box-shadow:0 24px 50px rgba(10,25,48,.35);transform:rotate(2.5deg);aspect-ratio:1/1;object-fit:cover;width:100%;max-width:420px;height:auto"></div>
</div></section>

${quotes()}

<section class="hp-res" id="resources" aria-labelledby="hp-res-h"><div class="wrap">
 <h2 id="hp-res-h">Free Resources</h2>
 <div class="grid">
  ${RESOURCES.map(([t, f, href, label]) => `<article>${pic(f, '', 'thumb', ' loading="lazy"')}<h3>${t}</h3>${Array.isArray(href) ? `<ul class="dl">${href.map(([l, u]) => `<li><a href="${u}">${l} <span aria-hidden="true">→</span></a></li>`).join('')}</ul>` : href ? `<a class="arrow" href="${href}">${label || `Open the ${t.toLowerCase()}`} <span aria-hidden="true">→</span></a>` : '<span class="soon eyebrow">Coming soon</span>'}</article>`).join('')}
 </div>
</div></section>

<section class="hp-merch" id="products"><div class="wrap">
 <div class="grid">
  <div><h2>Less scrolling.<br><em class="or">More selling.</em></h2>
  <div class="links"><a href="/digital-products/">Digital products <span aria-hidden="true">→</span></a><a href="/scrolly-shop/">Shop <span aria-hidden="true">→</span></a></div></div>
  <!-- Real shop tees (2026-10-07): replaced the hp3-merch.webp photo, whose cap, mug and bottle aren't real products. -->
  <ul class="tees">${merch.slice(0, 4).map((p) => `<li><a href="${p.href}"><img src="${p.image.src}" alt="${p.image.alt.replace(/"/g, '&quot;')}" width="${p.image.w}" height="${p.image.h}" loading="lazy"><span>${p.name.trim()}</span></a></li>`).join('')}</ul>
 </div>
</div></section>
`;
  const inner = `<style id="hp-css">${CSS}</style><div class="hp"><div id="main">${body.replace(/\n\s*/g, '')}</div></div><script id="hp-js">${SCRIPT}</script>`;
  return `<!-- wp:html -->\n${inner}\n<!-- /wp:html -->`;
}
