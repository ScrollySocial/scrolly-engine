// Existing pages whose body content is preserved as-is (commerce, forms, legal copy, long sales pages) but which now get the shared header/footer
// and the new design tokens. Always built from the pre-redesign backup (website/backups/2026-09-21-pre-redesign), so re-running is idempotent.
// Elementor-built pages are flipped to plain wp:html (same approach the Home + legal pages already use) so the live render comes from post_content,
// not Elementor's separately-cached widget output; _elementor_data is left untouched for rollback.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pageStyle, stripLegacyShell } from '../lib.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const BK = path.resolve(here, '../../backups/2026-09-21-pre-redesign/pages');
const load = (file) => JSON.parse(fs.readFileSync(path.join(BK, file), 'utf8'));

function sourceHtml(p) {
  if (p.meta && p.meta._elementor_edit_mode === 'builder' && p.meta._elementor_data) {
    const w = JSON.parse(p.meta._elementor_data)[0].elements[0];
    return w.settings.html || w.settings.editor || p.content.raw;
  }
  return p.content.raw;
}

const AMBER = '#c23c14'; // orange for text/buttons on light backgrounds (AA on cream)

const CSS_SALES = `
.scx-sales{--bg:#fbf8f3;--bg-alt:#f9f2ea;--ink:#000;--ink-soft:#444;--line:#eadfd2;--indigo:${AMBER};--indigo-dark:#a93312;--indigo-bg:#ffe6dc;--blue:#735cff;--blue-bg:#efeaff;--violet:#735cff;--violet-bg:#efeaff;--cyan:#0f766e;--cyan-bg:#dcf7f2;--mint:#0f766e;--mint-bg:#dcf7f2;--pink:#d6336c;--amber:#b45309;
 font-family:'Public Sans',system-ui,Arial,sans-serif;color:#000;background:#fbf8f3;overflow-x:clip}
.scx-sales *:not(svg):not(svg *){font-family:'Public Sans',system-ui,Arial,sans-serif!important}
html .scx-sales h1,html .scx-sales h2{font-family:'Archivo','Arial Black',sans-serif!important;font-weight:900!important;text-transform:uppercase;letter-spacing:-.02em!important;line-height:1!important;color:var(--ink)}
html .scx-sales h1{font-size:clamp(2.2rem,5.2vw,3.9rem)!important}html .scx-sales h2{font-size:clamp(1.8rem,3.6vw,2.7rem)!important}
html .scx-sales h3,html .scx-sales h4{font-family:'Archivo',sans-serif!important;font-weight:800!important;letter-spacing:-.01em!important}
.scx-sales .btn,.scx-sales button,.scx-sales .btn-primary{font-family:'Public Sans',sans-serif!important}
.scx-sales .btn-primary,.scx-sales .section-pricing .btn-primary,.scx-sales .price-card .btn-primary{background:${AMBER}!important;color:#fff!important;border-color:${AMBER}!important;box-shadow:none!important}
.scx-sales .btn-primary:hover{background:#a93312!important;border-color:#a93312!important}
.scx-sales .btn-outline{border-color:#000!important;color:#000!important}
.scx-sales .section-gradient .btn-primary,.scx-sales .final-cta .btn-primary{background:#fff!important;color:#000!important;border-color:#fff!important}
.scx-sales .section-dark,.scx-sales .final-cta{background:#000!important}
.scx-sales .section-gradient{background:#000!important;color:#fff}
.scx-sales .section-pricing{background:#c1aefc!important}
.scx-sales .section-tint,.scx-sales .section-alt{background:#f9f2ea!important}
.scx-sales .hero{background:#fbf8f3!important}
.scx-sales .eyebrow,.scx-sales .cite{color:${AMBER}!important}
.scx-sales .section-dark .eyebrow,.scx-sales .section-gradient .eyebrow,.scx-sales .final-cta .eyebrow{color:#ffb38f!important}
.scx-sales .section-dark h2,.scx-sales .section-dark h3,.scx-sales .section-gradient h2,.scx-sales .section-gradient h3,.scx-sales .final-cta h2,.scx-sales .final-cta h3{color:#fff!important}
.scx-sales a:not(.btn){text-underline-offset:3px}
.scx-sales header.site{display:none!important}
`;

const CSS_IMPL = `
.si-page{--si-blue:${AMBER};--si-indigo:${AMBER};--si-ink:#000;--si-soft:#444;--si-line:#eadfd2;--si-bg:#fbf8f3;font-family:'Public Sans',system-ui,sans-serif!important;background:#fbf8f3!important}
.si-page h1,.si-page h2{font-family:'Archivo','Arial Black',sans-serif!important;font-weight:900!important;text-transform:uppercase;letter-spacing:-.02em!important;line-height:1!important}
.si-page h1{font-size:clamp(2.3rem,5.2vw,4.2rem)!important}.si-page h2{font-size:clamp(1.8rem,3.4vw,2.7rem)!important}
.si-page h3{font-family:'Archivo',sans-serif!important;font-weight:800!important}
.si-page .si-hero{background:#c1aefc!important}
.si-page .si-eyebrow{background:#000!important;color:#fff!important;border-radius:20px!important}
.si-page .si-form button{background:#c23c14!important;color:#fff!important;font-family:'Public Sans',sans-serif!important;box-shadow:none!important;border-radius:32px!important}
.si-page .si-form input{border:2px solid #000!important;border-radius:32px!important}
.si-page .si-flow{border:2px solid #000!important;box-shadow:6px 6px 0 #000!important}
.si-page [style*="gradient"],.si-page .si-cta{background-image:none!important}
`;

const CSS_FOOTERPAGE = `
body:has(.footerpage){background:#fbf8f3}
.footerpage{width:100%!important;margin:0!important;background:#fbf8f3!important;color:#000!important;min-height:0!important;padding:clamp(40px,6vw,84px) clamp(20px,6.1vw,88px) 90px!important;font:500 17px/1.65 'Public Sans',system-ui,sans-serif!important}
.footerpage *{box-sizing:border-box}
.footerpage .fp-wrap{width:min(900px,100%);margin:0 auto}
.footerpage .fp-head{text-align:left!important;margin:0 0 34px!important;max-width:760px}
.footerpage .fp-kicker{color:${AMBER}!important;font-weight:800;text-transform:uppercase;letter-spacing:.16em;font-size:.85rem}
.footerpage h1{color:#000!important;font:900 clamp(2.4rem,5.4vw,4.2rem)/.98 'Archivo','Arial Black',sans-serif!important;text-transform:uppercase;letter-spacing:-.02em!important;margin:12px 0 16px!important}
.footerpage .fp-intro{color:#444!important;font-size:1.15rem}
.footerpage .fp-card{background:#fff!important;border:2px solid #000!important;border-radius:16px!important;padding:clamp(24px,4.5vw,46px)!important;box-shadow:6px 6px 0 #000!important}
.footerpage h2{color:#000!important;font:800 clamp(1.35rem,2.6vw,1.8rem)/1.15 'Archivo',sans-serif!important;letter-spacing:-.01em!important;margin:1.5em 0 .5em!important}
.footerpage h2:first-child{margin-top:0!important}
.footerpage p,.footerpage li{color:#222!important}
.footerpage a{color:#000!important;text-decoration:underline;text-underline-offset:3px;font-weight:700}
.footerpage strong{color:#000!important}
.footerpage .note{border-left:6px solid #ff6338!important;background:#f9f2ea!important;padding:16px 18px;border-radius:0 10px 10px 0}
.footerpage .contact-box{margin-top:38px;background:#c1aefc!important;border-radius:16px;padding:28px}
.footerpage .contact-box h2{margin-top:0!important}
.footerpage .contact-box p{color:#000!important}
.footerpage input,.footerpage textarea,.footerpage select{width:100%!important;background:#fff!important;color:#000!important;border:2px solid #000!important;border-radius:10px!important;padding:12px!important;font:inherit}
.footerpage label{color:#000!important;font-weight:700!important}
.footerpage button,.footerpage input[type=submit]{width:auto!important;background:#c23c14!important;color:#fff!important;border:0!important;border-radius:32px!important;padding:14px 28px!important;font-weight:800!important;cursor:pointer}
@media(max-width:650px){.footerpage .fp-card{box-shadow:4px 4px 0 #000!important}}
`;

const CSS_ABOUT = `
body:has(.about-wrap){background:#fbf8f3}
.about-wrap{--indigo:${AMBER};--indigo-bg:#ffe6dc;--bg-alt:#f9f2ea;--ink:#000;--ink-soft:#444;max-width:820px!important;padding:clamp(40px,6vw,84px) clamp(20px,6.1vw,88px) 96px!important;font-family:'Public Sans',system-ui,sans-serif!important;color:#000!important;font-size:17px}
.about-wrap h1{font:900 clamp(2.4rem,5.4vw,4.2rem)/.98 'Archivo','Arial Black',sans-serif!important;text-transform:uppercase;letter-spacing:-.02em!important;margin:0 0 .5em!important}
.about-wrap h2{font:800 clamp(1.4rem,2.6vw,1.9rem)/1.15 'Archivo',sans-serif!important;letter-spacing:-.01em!important;margin:1.6em 0 .5em!important}
.about-eyebrow{font-family:'Public Sans',sans-serif!important;letter-spacing:.16em!important;color:${AMBER}!important}
.about-wrap a{color:#000!important;text-decoration-color:#ff6338!important}
.method-list{background:#fff!important;border:2px solid #000;box-shadow:6px 6px 0 #000;border-radius:16px!important}
`;

const CSS_WOO = `
body:has(.scx-woo){background:#fbf8f3}
body:has(.scx-woo) .page-content{max-width:none!important;width:100%!important;margin:0!important;padding:0!important}
body:has(.scx-woo) .page-content>:not(.scx):not(style):not(script){max-width:1264px;width:100%;margin-left:auto!important;margin-right:auto!important;padding-left:clamp(20px,6.1vw,88px)!important;padding-right:clamp(20px,6.1vw,88px)!important;box-sizing:border-box}
body:has(.scx-woo) .page-content>h1:first-of-type,body:has(.scx-woo) .page-content>.wp-block-heading:first-of-type{padding-top:clamp(28px,4vw,56px)!important}
body:has(.scx-woo) .page-content>.woocommerce,body:has(.scx-woo) .page-content>.wp-block-woocommerce-cart,body:has(.scx-woo) .page-content>.wp-block-woocommerce-checkout{padding-bottom:80px!important}
body:has(.scx-woo) .page-content>h1,body:has(.scx-woo) .page-content .wp-block-heading:first-child{font-family:'Archivo','Arial Black',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;font-size:clamp(2.2rem,4.6vw,3.6rem);line-height:1;margin:0 0 .6em;color:#000}
body:has(.scx-woo) .wc-block-components-button:not(.is-link),body:has(.scx-woo) .woocommerce a.button,body:has(.scx-woo) .woocommerce button.button,body:has(.scx-woo) .woocommerce input.button,body:has(.scx-woo) .woocommerce #respond input#submit{background:#f95f34!important;color:#000!important;border:0!important;border-radius:32px!important;font-weight:700!important}
body:has(.scx-woo) .woocommerce a.button:hover,body:has(.scx-woo) .woocommerce button.button:hover,body:has(.scx-woo) .wc-block-components-button:not(.is-link):hover{background:#d94a1e!important}
body:has(.scx-woo) .page-content a:not(.button):not(.wc-block-components-button){color:#000}
`;

const strip = (html) => stripLegacyShell(html);

// The long sales pages hard-code the previous direction's indigo/violet/pink gradients in many places CSS variables can't reach. Remap them to brand colors.
const REMAP = { '#4f46e5': AMBER, '#3730a3': '#a93312', '#332d99': '#000', '#8b5cf6': '#735cff', '#818cf8': '#c1aefc', '#a5b4fc': '#c1aefc', '#c7d2fe': '#e6dcff', '#a78bfa': '#c1aefc', '#e879f9': '#ffb38f', '#fb7185': '#ff8f6b', '#fda4af': '#ffb38f', '#eef0fe': '#f3eeff', '#edeafe': '#ffe6dc', '#e4e8ff': '#efeaff', '#0891b2': '#0f766e', '#2563eb': '#5a44e6', '#1d4ed8': '#4a35cf', '#db2777': '#c93a70', '#4338ca': '#a93312' };
const remap = (html) => html.replace(/#[0-9a-fA-F]{6}/g, (h) => REMAP[h.toLowerCase()] || h);

function salesPage({ file, key, id, active }) {
  const p = load(file);
  let html = remap(strip(sourceHtml(p)));
  // Old header-fix / "site" chrome inside the page is dead now that the theme header is replaced.
  const head = pageStyle({ extraCss: CSS_SALES });
  const foot = '';
  const content = `<!-- wp:html -->\n<div class="scx-sales">${html}</div>\n<!-- /wp:html -->`;
  return { key, id, title: p.title.raw, meta: { _elementor_edit_mode: '' }, html: head + '\n' + content + '\n' + foot };
}

function wrapPage({ file, key, id, css, active = '', woo = false, meta, palette = false, edit }) {
  const p = load(file);
  let html = strip(sourceHtml(p));
  if (edit) html = edit(html);
  if (palette) html = remap(html);
  const head = pageStyle({ woo, extraCss: css });
  const foot = '';
  const hasBlocks = /<!-- wp:/.test(html);
  const content = hasBlocks ? html : `<!-- wp:html -->\n${html}\n<!-- /wp:html -->`;
  return { key, id, title: p.title.raw, meta, html: head + '\n' + content + '\n' + foot };
}

// 2026-09-23 (Mercedes): every digital product is final sale. Replaces the intro + product sections; keeps the rest of the page.
function refundEdit(html) {
  const a = html.indexOf('<p class="fp-intro">Please review this policy');
  const b = html.indexOf('<h2>Customer delays</h2>');
  if (a < 0 || b < 0) throw new Error('refund page markers not found');
  const intro = '<p class="fp-intro">All digital products are final sale. Please review this policy before you buy.</p>\n\n</header>\n<div class="fp-card">\n\n<strong>Effective date:</strong> September 23, 2026\n';
  const body = [
    '<h2>All digital products are final sale</h2>',
    'Every Scrolly digital product is final sale and nonrefundable once the order is completed, because access is delivered electronically. This includes the $1K, $10K and $24K Clubs and Challenges, downloadable workbooks and personalized SEO audits.',
    '<h2>Personalized SEO audits</h2>',
    'If Scrolly SEO fails to deliver an audit within the stated delivery window and has not communicated a delay, you may request a full refund.',
    '<h2>Challenge stripe shirts</h2>',
    'Stripe shirts are earned rewards for verified Challenge results, not purchases. If your shirt arrives damaged or misprinted, contact us and we will make it right.',
    '',
  ].join('\n');
  return html.slice(0, a) + intro + body + html.slice(b);
}

export function buildAll() {
  const un = { _elementor_edit_mode: '' };
  return [
    // Moved to v3 (2026-10-03/04): Privacy, Terms, Refund, Accessibility, Contact, About -> pages/legal.mjs;
    // SEO Site Audit, Shopify + Pinterest workbooks, Implementation -> pages/sales.mjs; My Account -> pages/account.mjs.
    // Cart + Checkout below are owned by the commerce session; never publish them from here (stale 2026-09-21 baseline).
    wrapPage({ file: '6-cart.json', key: 'cart', id: 6, css: CSS_WOO, woo: true }),
    wrapPage({ file: '7-checkout.json', key: 'checkout', id: 7, css: CSS_WOO, woo: true }),
  ];
}
