// Homepage v3 (2026-10-03): approved reference = scrolly-claude-package.zip / scrolly-homepage-reference.html (copy in dist/ref.html, gitignored).
// Self-contained page (home.css, not shared.css). Header + footer are the global chrome (chrome/), not part of this page.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { img, min } from '../lib.mjs';
import { merch } from '../shop-data.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const CSS = min(fs.readFileSync(path.join(here, '..', 'home.css'), 'utf8'));

// Real member quotes only (with permission). The section stays hidden while this is empty. Shape: { q: 'quote text', who: 'Name, business' }
const TESTIMONIALS = [];

// Free Resources (images 2026-10-07: real calculator screenshot, the three real free PDF titles, a B&W tiger; the old photos showed books and mugs that aren't products). href: a URL, a list of [label, URL] links (Downloads = the free MailerLite lead magnets), or null, which renders "Coming soon" instead of an arrow link (tracked in Notion: scrollyseo.com missing links).
const RESOURCES = [
  // 2026-10-10: Blog card removed (no blog yet, and no image matched the phone-screen cards). The old Downloads card linked to free
  // scorecards that no longer exist on the workbook pages, so the row is now the two free quizzes + calculators, all real screens.
  ['Offer Quiz', 'hp3-res-quiz-offer.webp', '/quiz/', 'Find your first offer'],
  ['Next Move Quiz', 'hp3-res-quizzes.webp', '/next-move/', 'Find your next move'],
  ['Calculators', 'hp3-res-calculators-v2.webp', '/calculators/'],
];

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
const SCRIPT = `(function(){var r=document.querySelector('.hp');if(!r||r.__init)return;r.__init=1;
var f=r.querySelector('#hp-calc-form');if(f){var g=r.querySelector('#hp-goal'),a=r.querySelector('#hp-aov'),o=r.querySelector('#hp-sales'),c=r.querySelector('#hp-caption'),w=r.querySelector('#hp-word');
function calc(){var G=Math.max(1,Number(g.value)||1000),A=Math.max(1,Number(a.value)||50),n=Math.ceil(G/A);o.textContent=n.toLocaleString('en-US');w.textContent=n===1?'sale':'sales';c.textContent='to make '+G.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})}
f.addEventListener('submit',function(e){e.preventDefault();calc()});g.addEventListener('input',calc);a.addEventListener('input',calc);calc()}
var qs=r.querySelector('.hp-quotes');if(qs){var bq=[].slice.call(qs.querySelectorAll('blockquote')),ds=[].slice.call(qs.querySelectorAll('.dots span')),ix=0;
function show(n){ix=(n+bq.length)%bq.length;bq.forEach(function(b,i){b.hidden=i!==ix});ds.forEach(function(d,i){d.classList.toggle('on',i===ix)})}
var p=qs.querySelector('.prev'),nx=qs.querySelector('.next');if(p)p.addEventListener('click',function(){show(ix-1)});if(nx)nx.addEventListener('click',function(){show(ix+1)})}
})();`;
if (SCRIPT.includes('&')) throw new Error('home script must not contain &');

export const title = 'Scrolly: Make your first $1,000';
export const slug = 'scrolly-home';
export const id = 161;

export function build() {
  const body = `
<section class="hp-hero"><div class="wrap">
 <div class="copy">
  <h1><span>Build an audience</span> <span><em class="or">that buys.</em></span></h1>
  <div class="act"><p class="lede"><span>Find your path to more customers</span> <span>without depending on paid ads.</span></p>
  <a class="btn" href="/next-move/">Find my starting point <span aria-hidden="true">→</span></a></div>
 </div>
 ${pic('hp3-hero-tiger.webp', 'Black and white tiger walking forward', 'tiger', ' fetchpriority="high"')}
</div></section>

<section class="hp-calc" id="calculator" aria-labelledby="hp-calc-h"><div class="wrap">
 <div>
  <h2 id="hp-calc-h">What would it take?</h2>
  <form id="hp-calc-form" novalidate>
   <div><input id="hp-goal" type="number" inputmode="numeric" value="1000" min="1" step="50"><label for="hp-goal">Revenue goal</label></div>
   <div><input id="hp-aov" type="number" inputmode="numeric" value="50" min="1" step="1"><label for="hp-aov">Average order value</label></div>
   <button class="go" type="submit" aria-label="Calculate sales needed">→</button>
  </form>
 </div>
 <div class="res" aria-live="polite"><div class="row"><div class="num" id="hp-sales">20</div><div class="word" id="hp-word">sales</div></div><div class="cap" id="hp-caption">to make $1,000</div></div>
</div></section>

<section class="hp-clubs" id="clubs" aria-labelledby="hp-clubs-h"><div class="wrap">
 <h2 id="hp-clubs-h">Make your next move.</h2>
 <div class="grid">
  ${CLUBS.map(([amt, head, f, alt, href, cta]) => `<article class="hp-club"><h3>${head}</h3>${pic(f, alt, '', ' loading="lazy"')}<div class="cta"><a class="btn" href="${href}" aria-label="${cta.replace('.', '')}: ${amt} Club">${cta} <span aria-hidden="true">→</span></a></div></article>`).join('')}
 </div>
</div></section>

<section class="hp-earned" id="earned"><div class="wrap">
 <div class="copy">
  <h2><span>Some things can’t be bought.</span> <span><em class="or">They’re earned.</em></span></h2>
  <p>Reach your verified Challenge goal and earn the exclusive Club T-shirt.</p>
  <nav class="tabs" aria-label="Challenges"><a href="/1k-club/#join">$1K Club</a><a href="/10k-club/">$10K Club</a><a href="/24k-club/">$24K Club</a></nav>
 </div>
 <!-- 2026-10-10: the graphite winner shirt (Printify) replaced the teal one; same shirt as /1k-club/. -->
 ${pic('shirt-1k-graphite-model.webp', 'A man wearing the graphite $1K Club winner shirt: a white line tiger above The $1k Club and Earn your stripes.', 'shot', ' loading="lazy"')}
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
  <div><h2>Less scrolling.<br><em class="or">More Scrolly.</em></h2>
  <div class="links"><a href="/digital-products/">Digital products <span aria-hidden="true">→</span></a><a href="/scrolly-shop/">Shop <span aria-hidden="true">→</span></a></div></div>
  <!-- Real shop tees (2026-10-07): replaced the hp3-merch.webp photo, whose cap, mug and bottle aren't real products. -->
  <ul class="tees">${merch.slice(0, 4).map((p) => `<li><a href="${p.href}"><img src="${p.image.src}" alt="${p.image.alt.replace(/"/g, '&quot;')}" width="${p.image.w}" height="${p.image.h}" loading="lazy"><span>${p.name.trim()}</span></a></li>`).join('')}</ul>
 </div>
</div></section>
`;
  const inner = `<style id="hp-css">${CSS}</style><div class="hp"><div id="main">${body.replace(/\n\s*/g, '')}</div></div><script id="hp-js">${SCRIPT}</script>`;
  return `<!-- wp:html -->\n${inner}\n<!-- /wp:html -->`;
}
