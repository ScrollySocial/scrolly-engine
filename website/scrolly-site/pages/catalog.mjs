// Digital Products (312), Scrolly Shop (313), SEO Tools (316). v3 (2026-10-03): shared .s3 components (chrome/v3.css), cream canvas,
// no tinted panels, boxes or offset shadows, no eyebrow labels. Products, prices, links and add-to-cart are unchanged.
// Prices: live WooCommerce price from shop-data.mjs at build time, falling back to the values verified 2026-09-21 ($59 / $29 / $299).
// Merch: the tee grid is baked from live WooCommerce at build and refreshed on every page view by src/live-cards.js (category "merch").
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { s3shell, esc, merchCards } from '../lib.mjs';
import { merch, digital as digitalProducts, CATS, DIGITAL_MAP } from '../shop-data.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const LIVE = fs.readFileSync(path.join(here, '..', 'src', 'live-cards.js'), 'utf8').trim();

const PRODUCTS = {
  shopify: { id: 58, name: 'Shopify SEO Workbook', price: '$59', tag: 'For your online store', blurb: 'Research keywords, organize your store, improve product pages, and build a practical SEO plan.', page: '/shopify-seo-workbook/' },
  pinterest: { id: 69, name: 'Pinterest SEO Workbook', price: '$29', tag: 'For visual discovery', blurb: 'Turn audience research into an intentional keyword, board, Pin, and publishing system.', page: '/pinterest-seo-workbook/' },
  audit: { id: 24, name: 'SEO Site Audit', price: '$299', tag: 'Understand your priorities', blurb: 'Explore a personalized analysis of your site and a prioritized roadmap for what to improve.', page: '/seo-site-audit/' },
};
const live = (p) => digitalProducts.find((d) => d.id === p.id) || {};
const arrow = ' <span aria-hidden="true">→</span>';

// One product: cover on a quiet panel, audience line, name, blurb, price, then "View details" + "Add to cart".
function product(p, { buy = true } = {}) {
  const im = live(p).image;
  const cover = im ? `<img src="${im.src}" alt="${esc(im.alt || p.name + ' cover')}" width="${im.w}" height="${im.h}" loading="lazy">` : `<span class="soon">${esc(p.name)}</span>`;
  const price = live(p).price || p.price;
  return `<article class="cat-prod"><a class="cv" href="${p.page}" tabindex="-1" aria-hidden="true">${cover}</a><p class="s3-label tag">${p.tag}</p><h3><a href="${p.page}">${p.name}</a></h3><p>${p.blurb}</p><p class="amt">${price}</p><div class="acts"><a class="s3-btn black" href="${p.page}" aria-label="View details: ${esc(p.name)}">View details</a>${buy ? `<a class="s3-btn" href="/?add-to-cart=${p.id}" aria-label="Add to cart: ${esc(p.name)}">Add to cart</a>` : ''}</div></article>`;
}

const hero = ({ h1, em, lede, btn, href, fine = '', art = '' }) =>
  `<section class="cat-hero${art ? ' split' : ''}"><div class="s3-wrap"><div><h1>${h1} <em class="or">${em}</em></h1><p class="s3-lede">${lede}</p><div class="cat-acts"><a class="s3-btn" href="${href}">${btn}${arrow}</a></div>${fine ? `<p class="s3-fine">${fine}</p>` : ''}</div>${art}</div></section>`;

// The old pages ended with "Your next move / Go get 'em, Tiger!" over a stripe swoosh; the footer now says "Go get 'em, Tiger." right below, so the close keeps only "Your next move".
const close = (btn = 'Explore Clubs + Challenges', href = '/#clubs') =>
  `<section class="cat-end s3-sec"><div class="s3-wrap"><h2 class="s3-h2">Your next move.</h2><div class="cat-acts"><a class="s3-btn" href="${href}">${btn}${arrow}</a></div></div></section>`;

const CSS = `
.s3 .cat-hero{padding:clamp(40px,6vw,96px) 0 clamp(16px,3vw,40px)}
.s3 .cat-hero h1{font-size:clamp(3rem,6vw,6.2rem)!important;line-height:.94!important;letter-spacing:-.05em!important}
.s3 .cat-hero h1 em{display:block}
.s3 .cat-hero .s3-lede{margin-top:26px}
.s3 .cat-acts{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}
.s3 .cat-hero .s3-fine{margin-top:18px}
.s3 .cat-hero.split .s3-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,5vw,96px);align-items:center}
.s3 .cat-hero .art{width:100%;aspect-ratio:1;object-fit:cover;background:#ece6dc}
.s3 .cat-head{max-width:780px}
.s3 .cat-head .s3-lede{margin-top:18px}
.s3 .cat-prods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(40px,5vw,80px);margin-top:clamp(40px,5vw,64px)}
.s3 .cat-prod{display:flex;flex-direction:column;min-width:0}
.s3 .cat-prod .cv{display:flex;align-items:center;justify-content:center;min-height:clamp(260px,30vw,440px);background:#ece6dc;padding:clamp(24px,3.5vw,52px)}
.s3 .cat-prod .cv img{width:min(52%,280px);height:auto}
.s3 .cat-tees.dig .cv img{object-fit:contain}
.s3 .cat-tees .sub{color:var(--s3-muted)}
.s3 .cat-prod .soon{font:400 var(--s3-fs-title)/1.1 var(--s3-serif);text-align:center}
.s3 .cat-prod .tag{margin-top:26px;color:var(--s3-muted)}
.s3 .cat-prod h3{margin-top:10px;font-size:var(--s3-fs-h3)!important;line-height:1.08!important}
.s3 .cat-prod h3 a{text-decoration:none}
.s3 .cat-prod h3 a:hover{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1px}
.s3 .cat-prod>p:not(.tag):not(.amt){margin-top:12px;max-width:34em}
.s3 .cat-prod .amt{margin-top:18px;font:400 var(--s3-fs-title)/1 var(--s3-serif)}
.s3 .cat-prod .acts{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.s3 .cat-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(40px,6vw,120px);align-items:center}
.s3 .cat-split .s3-lede{margin-top:18px}
.s3 .cat-tees{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:48px clamp(20px,3vw,40px);margin-top:clamp(32px,4vw,48px)}
.s3 .cat-tees .card{display:block;text-decoration:none;min-width:0}
.s3 .cat-tees .cv img{width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:#ece6dc}
.s3 .cat-tees h3{margin-top:16px;font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important}
.s3 .cat-tees .sub,.s3 .cat-tees .pr{margin-top:6px;font-size:var(--s3-fs-ui)}
.s3 .cat-tees .card:hover h3{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1px}
.s3 .cat-note{margin-top:28px}
.s3 .cat-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(32px,5vw,96px);margin-top:clamp(32px,4vw,48px)}
.s3 .cat-two p{margin-top:10px}
.s3 .cat-end{text-align:center}
.s3 .cat-end .cat-acts{justify-content:center}
@media(max-width:900px){.s3 .cat-hero.split .s3-wrap,.s3 .cat-prods,.s3 .cat-split,.s3 .cat-two{grid-template-columns:1fr}.s3 .cat-tees{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:420px){.s3 .cat-end .s3-btn{letter-spacing:.04em;padding-left:14px;padding-right:14px}.s3 .cat-end .s3-btn span[aria-hidden]{display:none}}
@media(max-width:520px){.s3 .cat-tees{gap:36px 16px}.s3 .cat-tees h3{font-size:var(--s3-fs-lede)!important}}
`;

// Same grid as the tees on Scrolly Shop. Every published product in the Digital products category shows up here,
// refreshed from the Store API on each view, so a new product needs no page edit. DIGITAL_MAP (shop-data.mjs) points cards at sales pages.
const digitalCards = (items) =>
  items.map((p) => `<a class="card" href="${p.href}"><div class="cv ph"><img src="${p.image.src}" alt="${esc(p.image.alt || p.name)}" width="${p.image.w}" height="${p.image.h}" loading="lazy"></div><h3>${esc(p.name)}</h3>${p.sub ? `<div class="sub">${esc(p.sub)}</div>` : ''}${p.price ? `<div class="pr">${p.price}</div>` : ''}</a>`).join('');

function digital() {
  const map = esc(JSON.stringify(DIGITAL_MAP));
  const body = `
${hero({ h1: 'Good tools.', em: 'Useful next steps.', lede: 'Workbooks and tools to help you research, plan, and get your business found.', btn: 'Browse the products', href: '#products', fine: 'Revenue figures are goals, not guaranteed results.' })}
<section class="s3-sec" id="products"><div class="s3-wrap">
 <h2 class="s3-h2">The products</h2>
 <div class="rail cat-tees dig" data-live="${CATS.digital}" data-live-map="${map}">${digitalCards(digitalProducts)}</div>
</div></section>
${close()}`;
  return { key: 'digital-products', id: 312, title: 'Digital products, The Ambition Department', html: s3shell(body, CSS, LIVE) };
}

function shop() {
  const heroTee = merch.find((p) => p.name === 'Goal Digger') || merch[0];
  const art = `<img class="art" src="${heroTee.image.src}" alt="${esc(heroTee.name)} t-shirt" width="${heroTee.image.w}" height="${heroTee.image.h}" fetchpriority="high">`;
  const body = `
${hero({ h1: 'For the builders.', em: 'For the doers.', lede: 'Tees printed to order. Free shipping in the US.', btn: 'Shop the tees', href: '#tees', art })}
<section class="s3-sec" id="tees"><div class="s3-wrap">
 <h2 class="s3-h2">The tees</h2>
 <div class="rail cat-tees" data-live="${CATS.merch}" data-live-kind="merch">${merchCards(merch)}</div>
 <p class="s3-fine cat-note">Free US shipping. International shipping is added at checkout.</p>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <h2 class="s3-h2">Wear the brand. <em class="or">Earn the stripe.</em></h2>
 <div class="cat-two">
  <div><h3 class="s3-h3">Ambition Department tees</h3><p>Open to everyone.</p></div>
  <div><h3 class="s3-h3">Challenge stripe shirts</h3><p>Earned by hitting a verified Challenge goal. Not sold here.</p><p><a class="s3-link" href="/#clubs">Explore the Challenges${arrow}</a></p></div>
 </div>
</div></section>
${close()}`;
  return { key: 'scrolly-shop', id: 313, title: 'The Ambition Department merch', html: s3shell(body, CSS, LIVE) };
}

function seoTools() {
  const impl = `<article class="cat-prod"><a class="cv" href="/implementation/" tabindex="-1" aria-hidden="true"><span class="soon">Coming soon</span></a><p class="s3-label tag">Coming soon</p><h3><a href="/implementation/">Implementation</a></h3><p>Support for turning approved recommendations into real website changes. Still in development: join the early-access list to hear when it is ready.</p><div class="acts"><a class="s3-btn black" href="/implementation/">View Implementation</a></div></article>`;
  const body = `
${hero({ h1: 'Be easier', em: 'to discover.', lede: 'SEO is one part of organic growth. Keep moving with a site audit, implementation help, or a practical platform workbook.', btn: 'Explore the tools', href: '#tools' })}
<section class="s3-sec" id="tools"><div class="s3-wrap">
 <div class="cat-head"><h2 class="s3-h2">A focused plan for your search presence.</h2></div>
 <div class="cat-prods">${product(PRODUCTS.audit)}${impl}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
 <div class="cat-head"><h2 class="s3-h2">Build with a workbook.</h2><p class="s3-lede">Prefer to work through it yourself? Choose Shopify or Pinterest.</p></div>
 <div class="cat-prods">${product(PRODUCTS.shopify)}${product(PRODUCTS.pinterest)}</div>
</div></section>
${close()}`;
  return { key: 'seo-tools', id: 316, title: 'SEO tools and services, The Ambition Department', html: s3shell(body, CSS) };
}

export function buildAll() {
  return [digital(), shop(), seoTools()];
}
