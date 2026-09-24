// Shared page components for the Scrolly public site.
// The header, drawer menu and footer are NOT part of page content any more: they are rendered site-wide by the WPCode PHP snippet
// (see chrome/ + install-chrome.mjs), so every page — including product pages, /shop/ and 404s — gets the identical, menu-driven chrome.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const media = JSON.parse(fs.readFileSync(path.join(here, 'media-map.json'), 'utf8'));

export const img = (name) => {
  const m = media[name];
  if (!m) throw new Error('unknown asset ' + name);
  return m.url;
};

export const ICON_UR = (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M3 15L15 3M6 3h9v9"/></svg>`;
export const ICON_L = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M14 4L7 11l7 7"/></svg>`;
export const ICON_R = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M8 4l7 7-7 7"/></svg>`;

// Page-level behavior only (product rails + goal calculator). Drawer/menu behavior lives in chrome/chrome.js.
const SCRIPT = `(function(){var r=document.querySelector('.scx');if(!r||r.__init)return;r.__init=1;
r.querySelectorAll('.rail[data-rail]').forEach(function(rail){var box=rail.closest('.railsec'),p=box.querySelector('.prev'),n=box.querySelector('.next-b');function upd(){var can=rail.scrollWidth>rail.clientWidth+4;if(p)p.style.display=n.style.display=can?'':'none';if(!can)return;p.disabled=rail.scrollLeft<4;n.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4}
function go(s){rail.scrollBy({left:s*(rail.querySelector('.card').offsetWidth+24),behavior:'smooth'})}
p&&p.addEventListener('click',function(){go(-1)});n&&n.addEventListener('click',function(){go(1)});rail.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd()});
var hs=r.querySelector('.hsl');if(hs){var sl=[].slice.call(hs.querySelectorAll('.hsl-slide')),tb=[].slice.call(hs.querySelectorAll('.hsl-tab')),pb=hs.querySelector('.hsl-pause'),ix=0,tm=null,hov=false,stopped=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function show(n,u){ix=(n+sl.length)%sl.length;sl.forEach(function(s,i){var on=i===ix;s.classList.toggle('is-active',on);if(on){s.removeAttribute('inert');s.setAttribute('aria-hidden','false')}else{s.setAttribute('inert','');s.setAttribute('aria-hidden','true')}});tb.forEach(function(t,i){t.setAttribute('aria-selected',i===ix?'true':'false');t.tabIndex=i===ix?0:-1});hs.setAttribute('data-club',sl[ix].getAttribute('data-club'));if(u)halt(true)}
function tick(){if(!hov&&!document.hidden)show(ix+1)}
function play(){if(stopped||tm)return;tm=setInterval(tick,7000);if(pb){pb.textContent='Pause slideshow';pb.setAttribute('aria-pressed','false')}}
function halt(u){clearInterval(tm);tm=null;if(u)stopped=true;if(pb){pb.textContent='Play slideshow';pb.setAttribute('aria-pressed','true')}}
hs.querySelector('.hsl-prev').addEventListener('click',function(){show(ix-1,true)});hs.querySelector('.hsl-next').addEventListener('click',function(){show(ix+1,true)});
tb.forEach(function(t,i){t.addEventListener('click',function(){show(i,true)});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();show(ix+d,true);tb[ix].focus()}})});
if(pb){pb.hidden=false;pb.addEventListener('click',function(){if(tm){halt(true)}else{stopped=false;play()}});if(stopped){pb.textContent='Play slideshow';pb.setAttribute('aria-pressed','true')}}
hs.addEventListener('mouseenter',function(){hov=true});hs.addEventListener('mouseleave',function(){hov=false});hs.addEventListener('focusin',function(){hov=true});hs.addEventListener('focusout',function(){hov=false});
var x0=null,y0=null;hs.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});hs.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)show(ix+(dx<0?1:-1),true)},{passive:true});
show(0);play()}
var gl=r.querySelector('.goal');if(gl){if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){r.querySelectorAll('.tile[data-club]').forEach(function(t){var k=t.getAttribute('data-club');var er=r.querySelector('.earned');function on(){gl.setAttribute('data-club',k);if(er){er.setAttribute('data-club',k);er.querySelectorAll('.tee-club').forEach(function(s){s.hidden=s.getAttribute('data-club')!==k})}}function off(){gl.setAttribute('data-club','');if(er){er.setAttribute('data-club','');er.querySelectorAll('.tee-club').forEach(function(s){s.hidden=true})}}t.addEventListener('mouseenter',on);t.addEventListener('mouseleave',off);t.addEventListener('focusin',on);t.addEventListener('focusout',off)})}}
var g=r.querySelector('#calc-goal');if(g){var a=r.querySelector('#calc-avg'),dy=r.querySelector('#calc-days'),o=r.querySelector('#calc-out'),pp=r.querySelector('#calc-per');
function num(v){v=parseFloat(String(v).replace(/[^0-9.]/g,''));return isFinite(v)?v:0}
function fmt(v){return '$'+Math.round(v).toLocaleString('en-US')}
function calc(){var G=num(g.value),A=num(a.value),D=num(dy.value);if(G>0&&A>0){var s=Math.ceil(G/A);o.textContent=s.toLocaleString('en-US');var per=s/D;pp.textContent=D>0?'That is about '+(per>=10?Math.round(per):(Math.round(per*10)/10))+' sale'+(per===1?'':'s')+' per day over '+D+' days.':''}else{o.textContent='\\u2014';pp.textContent='Enter a goal and an average sale amount.'}}
[g,a].forEach(function(el){el.addEventListener('input',calc);el.addEventListener('blur',function(){if(num(el.value)>0)el.value=fmt(num(el.value))})});dy.addEventListener('change',calc);calc()}
var cf=r.querySelector('[data-focus-calc]');if(cf)cf.addEventListener('click',function(){setTimeout(function(){var el=r.querySelector('#calc-goal');el&&el.focus({preventScroll:true})},450)});
})();`;

export const min = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '').replace(/\s{2,}/g, ' ');
export const CSS = min(fs.readFileSync(path.join(here, 'shared.css'), 'utf8'));
export const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Caveat+Brush&family=Public+Sans:wght@400;500;600;700;800&display=swap');";

/** Wrap a page body in the shared shell (component CSS + scoping root + page script). Output is a single wp:html block. */
export function shell(body) {
  const inner = `<style id="scx-css">${FONTS}${CSS}</style><div class="scx"><div id="main">${body.replace(/\n\s*/g, '')}</div></div><script id="scx-js">${SCRIPT}</script>`;
  return `<!-- wp:html -->\n${inner}\n<!-- /wp:html -->`;
}

/** Local preview document (never published; no global chrome here). */
export function previewDoc(html, title) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0">${html}</body></html>`;
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- reusable page blocks ----
export const productCover = (kind, title) => {
  const bg = { shopify: '#94ece1', pinterest: '#c1aefc', audit: '#ffb38f', impl: '#fbbad0' }[kind];
  const ico = {
    shopify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l1 13h-15z" fill="#000"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="#000" stroke-width="2"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6.5 6.5 0 0 0-6.5 6.5C5.5 13.5 12 22 12 22s6.5-8.5 6.5-13.5A6.5 6.5 0 0 0 12 2zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#000"/></svg>',
    audit: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="18" rx="2" fill="none" stroke="#000" stroke-width="2"/><path d="M9 3h6v3H9zM8 12l2.5 2.5L16 9" fill="none" stroke="#000" stroke-width="2"/></svg>',
    impl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18l6-6 3 3 7-8" fill="none" stroke="#000" stroke-width="2.4"/></svg>',
  }[kind];
  return `<div class="cover" style="background:${bg}"><b>${title}</b>${ico}<i>scrolly</i></div>`;
};

export const coverTitle = (name) => name.toUpperCase().replace('SEO ', 'SEO<br>').replace(' WORKBOOK', '<br>WORKBOOK').replace(' SITE AUDIT', '<br>SITE AUDIT');

export const productCard = ({ href, kind, title, sub, price, image }) =>
  `<a class="card" href="${href}"><div class="cv${image ? ' ph' : ''}">${image ? `<img src="${image.src}" alt="${esc(image.alt || title)}" width="${image.w}" height="${image.h}" loading="lazy">` : productCover(kind, coverTitle(title))}</div><h3>${esc(title)}</h3><div class="sub">${esc(sub)}</div>${price ? `<div class="pr">${price}</div>` : ''}</a>`;

export const railSection = ({ id, title, link, linkText = 'View all', cards, extra = '' }) =>
  `<section class="railsec" id="${id}"><div class="railhd"><h2 class="disp">${title}</h2><div class="ctl"><a href="${link}">${linkText}</a><button class="arr prev" type="button" aria-label="Previous">${ICON_L}</button><button class="arr next-b" type="button" aria-label="Next">${ICON_R}</button></div></div><div class="rail" data-rail>${cards}</div>${extra}</section>`;

// Live Printify tees (see shop-data.mjs): real mockup, name, price, link to the product page.
export const merchCards = (items) =>
  items.map((p) => `<a class="card merch" href="${p.href}"><div class="cv ph"><img src="${p.image.src}" alt="${esc(p.image.alt || p.name + ' t-shirt')}" width="${p.image.w}" height="${p.image.h}" loading="lazy"></div><h3>${esc(p.name)}</h3><div class="sub">T-shirt</div>${p.price ? `<div class="pr">${p.price}</div>` : ''}</a>`).join('');

export const endCta = ({ h = 'Go get ’em,', h2 = 'Tiger', btn = 'Explore Clubs + Challenges', href = '/#clubs', eyebrow = 'Your next move' } = {}) =>
  `<section class="next"><img class="sw" src="${img('stripes-swoosh.png')}" alt="" width="846" height="484" loading="lazy"><img class="tg" src="${img('tiger-leap.png')}" alt="Tiger leaping" width="1200" height="754" loading="lazy"><div class="cta"><div class="e">${eyebrow}</div><h2 class="disp">${h}</h2><h2 class="disp it or"><span>${h2}</span>!</h2><a class="btn btn-pill" href="${href}"><span>${btn}</span></a></div></section>`;

/** Style-only prelude for pages whose body content is NOT authored by us (WooCommerce, legacy sales pages, legal). */
export function pageStyle({ woo = false, extraCss = '' } = {}) {
  const marker = woo ? '<div class="scx scx-woo" hidden></div>' : '<div class="scx" hidden></div>';
  return `<!-- wp:html -->\n<style id="scx-css">${FONTS}${CSS}${extraCss ? min(extraCss) : ''}</style>${marker}\n<!-- /wp:html -->`;
}

/** Strip the previous direction's injected header/footer restyling blocks. */
export function stripLegacyShell(html) {
  // Drop per-page rules that restyle the theme's own header/footer/menu (the global chrome replaces it), including ones inside @media blocks.
  const rule = /[^{}@]*(?:#site-footer|#site-header|#menu-item-\d+|\.site-navigation)[^{}]*\{[^{}]*\}/g;
  return html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => open + css.replace(rule, '') + close).replace(/<style id="(?:scrolly-shared-shell-v1|scrolly-header-accessibility-fix|scrolly-footer-pages|\$\{marker\}|scrolly-page-shell[^"]*)">[\s\S]*?<\/style>/g, '');
}
