// Long sales pages + Implementation, v3 reskin (2026-10-04): SEO Site Audit 16, Shopify SEO Workbook 50, Pinterest SEO Workbook 71,
// Implementation 263. These pages are large hand-built HTML (diagrams, worksheet mockups, lead-magnet forms + popups whose ids the
// homepage links to). Instead of a rewrite, the LIVE content (snapshot website/backups/2026-10-03-pre-v3-migration) is kept as is and:
//  1. the old shared prelude (<style id="scx-css">, the .scx marker) is dropped and the page is wrapped in the v3 root (.s3.s3s);
//  2. every hard-coded color in its CSS, inline styles and SVGs is remapped into the v3 palette by role (see remapColor);
//  3. SKIN (below) applies v3 type, cream canvas, buttons and removes shadows + eyebrow labels;
//  4. em dashes are removed from the customer-facing text (Mercedes, 2026-10-03).
// To change copy on these pages, edit the snapshot-derived source in content/sales/<key>.html (written on first build) and rebuild.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { min } from '../lib.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const BK = path.resolve(here, '../../backups/2026-10-03-pre-v3-migration/pages');
const SRC = path.resolve(here, '../content/sales');

const PAGES = [
  ['seo-site-audit', 16, '16-seo-site-audit.json'],
  ['shopify-seo-workbook', 50, '50-shopify-seo-workbook.json'],
  ['pinterest-seo-workbook', 71, '71-pinterest-seo-workbook.json'],
  ['implementation', 263, '263-implementation.json'],
];

// ---- color remap: hex -> v3 palette by role (luminance + saturation; 2026-10 rebrand: navy, sky, blue mist, never pink) ----
// role 'text' (color, -webkit-text-fill-color) or 'fill' (backgrounds, borders, SVG paint). Sky is a fill only: sky text on off-white
// is 2.4:1, so an accent used as text becomes navy.
const KEEP = new Set(['#ffffff', '#f7f3ec', '#0a1930', '#4da3ff', '#dfe4f0', '#c9d1e6', '#4a4e66', '#d9d3ca', '#8f8a83', '#ece6dc']);
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
function remapColor(hex, role = 'fill') {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((x) => x + x).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return hex;
  if (KEEP.has('#' + h)) return '#' + h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
  let hue = 0;
  if (mx !== mn) { const d = mx - mn; hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hue = (hue * 60 + 360) % 360; }
  if (L >= 0.97 && sat < 0.05) return '#ffffff'; // white stays white
  // light colors keep their relative lightness, so layered tints (mockup bg vs placeholder bars) stay distinct: neutral tints on a warm
  // ladder, tinted ones (old peach, lavender, mint panels) on blue mist
  if (L >= 0.9) return '#f7f3ec';
  if (L >= 0.68 && sat >= 0.12) return L >= 0.8 ? '#dfe4f0' : '#c9d1e6';
  if (L >= 0.8) return '#efe9df';
  if (L >= 0.68) return '#e5ddd0';
  if (L <= 0.03) return '#0a1930'; // near-black, navy, ink
  if (sat < 0.12) return L > 0.45 ? '#d9d3ca' : L > 0.12 ? '#4a4e66' : '#0a1930'; // grays: line / muted / navy
  const accent = role === 'text' ? '#0a1930' : '#4da3ff';
  if (hue >= 5 && hue <= 35 && L > 0.18) return accent; // bright orange / coral: the one accent (sky fills)
  if ((hue >= 300 || hue < 5) && L > 0.08 && L < 0.45 && sat > 0.35) return accent; // pinks + reds: second data series in charts becomes sky (never pink or red)
  if (L >= 0.45) return '#c9d1e6'; // mid-light saturated (lavender, teal, peach, mint): deeper blue mist
  return '#0a1930'; // mid/dark saturated accents (indigo, violet, cyan, pink, red, burnt orange): navy
}
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const TEXT = new Set(['color', '-webkit-text-fill-color']);
// white text on a sky fill is 2.6:1, so a block (or style="") that paints sky without navy gets navy text instead
const SKY = /background(?:-color)?:[^;}]*(?:#4da3ff|var\(--(?:pink|amber|red)\))/i;
const onSky = (blk) => {
  if (!SKY.test(blk) || /background(?:-color)?:[^;}]*#0a1930/i.test(blk)) return blk;
  if (!/(^|[;{\s])color:/i.test(blk)) return blk.replace(/;?\s*(\}?)$/, ';color:#0a1930$1');
  return blk.replace(/(^|[;{\s])(color|-webkit-text-fill-color):\s*#fff(?:fff)?\b/gi, '$1$2:#0a1930');
};
// each declaration is recolored by its property's role
const recolor = (css) => css.replace(/([\w-]+)(\s*:\s*)([^;{}]*)/g, (m, prop, sep, val) => prop + sep + val.replace(HEX, (x) => remapColor(x, TEXT.has(prop.toLowerCase()) ? 'text' : 'fill')))
  // the old pages' accent custom properties are fills now; where one colors text, the text stays navy
  .replace(/(^|[^\w-])color:\s*var\(--(?:pink|amber|red)\)/g, '$1color:var(--s3-ink)')
  .replace(/\{[^{}]*\}/g, onSky);

// ---- em dashes -> commas / colons / parentheses (customer-facing text only) ----
function fixDashes(text) {
  return text
    .replace(/&mdash;|&#8212;|&#x2014;/gi, '—')
    .replace(/a customer\s*—\s*and Google\s*—\s*would/g, 'a customer (and Google) would')
    .replace(/decisions\s*—\s*what to fix, what to build, in what order\s*—\s*with/g, 'decisions (what to fix, what to build, in what order), with')
    .replace(/Guided workbooks\s*—\s*/g, 'Guided workbooks: ')
    .replace(/(Worksheet|Checklist)\s*—\s*/g, '$1: ')
    .replace(/(RED|GREEN|YELLOW|AMBER)\s*—\s*/g, '$1: ')
    .replace(/\s*—\s*(what|who|where|why|how)\b/g, ': $1')
    .replace(/(<\/(?:strong|b|a)>)\s*—\s*/g, '$1: ')
    .replace(/Ideas\s*—\s*Small-Space/g, 'Ideas: Small-Space')
    .replace(/\s*—\s*/g, ', ');
}
// Apply a text transform outside <style>/<script> blocks only.
const outsideCode = (html, fn) => html.split(/(<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>)/g).map((part, i) => (i % 2 ? part : fn(part))).join('');

const SKIN = `
body:has(.s3s) #content,body:has(.s3s) .site-main,body:has(.s3s) .page-content{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}
.s3s{background:var(--s3-cream)!important;color:var(--s3-ink)!important;font:var(--s3-fs-body)/1.6 var(--s3-sans)}
.s3s :where(*):not(svg):not(svg *){font-family:var(--s3-sans)!important;box-shadow:none!important;text-shadow:none!important}
.s3s :is(h1,h2,h3,h4){color:var(--s3-ink)!important}
.s3s :is(h1,h2,h3,h4,.price-amount,.ls-price,.value-price,.c2-h1,.big,.c2-stat,.case-metrics,.pam-num){font-family:var(--s3-serif)!important;font-weight:400!important;text-transform:none!important}
.s3s :is(.price-amount,.value-price,.ls-price) *{font-family:var(--s3-serif)!important;font-weight:400!important}
.s3s h1{font-size:clamp(2.8rem,5.4vw,5.4rem)!important;line-height:.98!important;letter-spacing:-.045em!important}
.s3s h2{font-size:var(--s3-fs-h2)!important;line-height:1.05!important;letter-spacing:-.03em!important}
.s3s h3{font-size:var(--s3-fs-title)!important;line-height:1.15!important;letter-spacing:-.01em!important}
.s3s h4{font-size:var(--s3-fs-lede)!important;line-height:1.2!important}
.s3s :is(p,li,dd,td,th,label,blockquote){font-size:max(var(--s3-fs-label),1em)}
.s3s .lede,.s3s .si-lead,.s3s .lm-intro,.s3s .lm-p-intro,.s3s .lm-o-intro{font:var(--s3-fs-lede)/1.45 var(--s3-serif)!important;color:var(--s3-ink)!important}
.s3s :is(.eyebrow,.si-eyebrow,.c2-eyebrow,.lm-free-badge,.lm-p-badge,.lm-o-badge){display:none!important}
.s3s :is(section,.hero,.final-cta,.si-hero,.si-section,.si-close,[class*="section-"]):not(.srp-dialog):not(.section-dark):not(.section-gradient):not(.section-board){background:var(--s3-cream)!important;background-image:none!important;color:var(--s3-ink)!important}
.s3s :is(.final-cta,.section-pricing,.si-close) :is(h1,h2,h3,h4,p,li,small,strong,em,.lede){color:var(--s3-ink)!important}
/* the one dark moment per page: navy, white type */
.s3s :is(.section-dark,.section-gradient,.section-board){background:var(--s3-navy)!important;background-image:none!important;color:#fff!important}
.s3s :is(.section-dark,.section-gradient,.section-board) :is(h1,h2,h3,h4,p,li,.lede,small,strong){color:#fff!important}
html body .s3s :is(.section-dark,.section-gradient,.section-board) a:not(.btn):not(.btn-primary):not(.s3-btn){color:#fff!important}
.s3s :is(.section-dark,.section-gradient,.section-board) :is(.cc-cite,.cite,.cc-cite *,.cite *){color:#d9d3ca!important}
.s3s :is(.section-dark,.section-gradient,.section-board) :is(a,button,summary):focus-visible{outline-color:#fff!important}
/* no decorative vertical bars */
.s3s :is(.askai,.callout,.dc-callout,.copilot-note,.si-separate,.case-disclaimer,blockquote){border-left:0!important}
/* worksheet thumbnails: the label sits above the scaled page instead of on its title bar */
.s3s .wb-thumb .wb-tag{font-size:var(--s3-fs-label)!important;padding:6px 13px!important;background:var(--s3-navy)!important;color:#fff!important}
.s3s .wb-thumb .wb-embed-pad{padding-top:80px!important}
.s3s :is(.blob,.blob-1,.hero-visual-slot .blob,.lm-rule,.lm-p-rule,.lm-o-rule){display:none!important}
.s3s .cat-icon{background:var(--s3-navy)!important;color:#fff!important}
.s3s .pam-num{color:#fff!important}
.s3s .method-card{background:rgba(255,255,255,.06)!important;border-color:rgba(255,255,255,.18)!important}
.s3s .si-safety-item{border-left:0!important;padding-left:0!important}
.s3s .si-wrap{width:calc(100% - 2 * var(--s3-gut))!important;max-width:1180px!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important;box-sizing:border-box}
.s3s .si-form{flex-wrap:wrap!important;max-width:100%}
.s3s .si-form input[type=email]{flex:1 1 220px;min-width:0;width:100%}
.s3s .si-hero-grid>*{min-width:0}
@media(max-width:900px){.s3s .si-hero-grid{grid-template-columns:minmax(0,1fr)!important}}
@media(max-width:600px){.s3s .si-form{display:flex!important;flex-direction:column!important;align-items:stretch!important;width:100%!important;grid-template-columns:none!important}.s3s .si-form input[type=email],.s3s .si-form button{width:100%!important;max-width:100%!important;flex:0 0 auto!important}}
@media(max-width:520px){html body .s3s :is(.btn,.btn-primary,.si-form button,form button[type=submit]):not(.loading){padding:16px 18px!important;letter-spacing:.05em!important}.s3s h1{font-size:clamp(2.3rem,10.5vw,2.8rem)!important}.s3s h2{font-size:clamp(2rem,8.6vw,2.4rem)!important}}
.s3s .screen-reader-text{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.s3s :is(h1,h2,h3,h4) *:not(svg):not(svg *){font-family:inherit!important}
.s3s .final-cta .ftag{color:var(--s3-ink)!important;background:#ece6dc!important;border-color:transparent!important}
.s3s .gallery-item{min-width:0}
/* worksheet previews (2026-10-05): real pages rendered from the workbooks (render-worksheets.mjs), readable at ~15px, two per row */
.s3s .gallery-row:has(.ws-shot){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:48px 32px!important;max-width:1180px;margin-left:auto!important;margin-right:auto!important}
.s3s .gallery-row:has(.ws-shot) .gallery-item{width:auto!important;max-width:none!important}
.s3s .ws-shot{display:block;width:100%;align-self:stretch;position:relative;max-height:560px;overflow:hidden;border-radius:14px;background:#fff;border:1px solid var(--s3-line);text-decoration:none!important}
.s3s .ws-shot img{display:block;width:100%;height:auto}
.s3s .ws-shot::after{content:"";position:absolute;left:0;right:0;bottom:0;height:90px;background:linear-gradient(rgba(255,255,255,0),#fff);pointer-events:none}
.s3s .ws-shot .wb-tag{position:absolute;top:auto;bottom:14px;left:14px;right:auto;z-index:2;display:inline-flex;padding:6px 13px;border-radius:999px;background:var(--s3-navy);color:#fff!important;font:800 var(--s3-fs-label)/1 var(--s3-sans)!important;letter-spacing:.06em;text-transform:uppercase}
.s3s .ws-shot:hover{border-color:var(--s3-navy)}
@media(max-width:800px){.s3s .gallery-row:has(.ws-shot){grid-template-columns:minmax(0,1fr)!important}}
.s3s .gallery-item .wb-thumb{max-width:100%!important}
.s3s .gallery-item p{font:var(--s3-fs-body)/1.5 var(--s3-sans)!important;color:var(--s3-ink)!important;max-width:420px!important}
html body .s3s :is(.lm-signup-card,.lm-p-card,.lm-o-card) input{font:var(--s3-fs-ui)/1.4 var(--s3-sans)!important;border-radius:4px!important;border:1px solid #8f8a83!important}
.s3s a:not(.btn):not(.btn-primary):not(.s3-btn){color:var(--s3-ink)!important;text-decoration-color:currentColor}
html body .s3s :is(.btn,.btn-primary,.si-form button,.lm-signup-card button,.lm-p-card button,.lm-o-card button,.srp-form button,form button[type=submit]):not(.loading):not([hidden]){display:inline-flex!important;align-items:center;justify-content:center;gap:12px;min-height:56px!important;padding:17px 32px!important;border:0!important;border-radius:999px!important;background:var(--s3-sky)!important;color:var(--s3-navy)!important;font:800 var(--s3-fs-label)/1 var(--s3-sans)!important;letter-spacing:.12em!important;text-transform:uppercase!important;text-decoration:none!important;cursor:pointer}
html body .s3s :is(.btn,.btn-primary,.si-form button,form button[type=submit]):not(.loading):hover{background:var(--s3-navy)!important;color:#fff!important}
.s3s :is(.btn,.btn-primary,form button[type=submit]) *{color:inherit!important}
.s3s :is(input[type=text],input[type=email],textarea,select){min-height:52px;padding:13px 16px!important;background:rgba(255,255,255,.7)!important;border:1px solid #8f8a83!important;border-radius:4px!important;color:var(--s3-ink)!important;font:var(--s3-fs-ui)/1.4 var(--s3-sans)!important}
.s3s :is(a,button,input,select,textarea,summary,[tabindex]):focus-visible{outline:3px solid var(--s3-navy)!important;outline-offset:3px}
/* lead-magnet blocks sat flush to the screen edge on the old pages too */
.s3s :is(.lm-layout,.lm-p-layout,.lm-o-layout){width:calc(100% - 2 * var(--s3-gut))!important;max-width:1280px!important;margin-left:auto!important;margin-right:auto!important}
/* lead-magnet blocks (2026-10-05): v3 layout, no card box, cover + form side by side, nothing under 15px */
.s3s :is(.lm-section,.lm-p-section,.lm-o-section){padding:var(--s3-sec) 0!important;border:0!important}
.s3s :is(.lm-layout,.lm-p-layout,.lm-o-layout){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)!important;gap:clamp(40px,5vw,88px)!important;align-items:center!important}
.s3s :is(.lm-copy,.lm-p-copy,.lm-o-copy){max-width:560px!important}
.s3s :is(.lm-copy,.lm-p-copy,.lm-o-copy) h2{margin:0 0 20px!important}
.s3s :is(.lm-copy,.lm-p-copy,.lm-o-copy) h2 span{display:inline!important}
.s3s :is(.lm-copy,.lm-p-copy,.lm-o-copy) h2 span+span::before{content:" "}
.s3s :is(.lm-benefits,.lm-p-benefits,.lm-o-benefits){display:grid!important;gap:22px!important;margin-top:32px!important}
.s3s :is(.lm-benefit,.lm-p-benefit,.lm-o-benefit){display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:16px!important;align-items:start!important}
.s3s :is(.lm-benefit,.lm-p-benefit,.lm-o-benefit)>b{display:grid!important;place-items:center!important;width:44px!important;height:44px!important;border-radius:50%!important;background:var(--s3-navy)!important;color:#fff!important;font:400 1.25rem/1 var(--s3-sans)!important}
.s3s :is(.lm-benefit,.lm-p-benefit,.lm-o-benefit)>b svg{width:22px!important;height:22px!important;fill:none!important;stroke:#fff!important;stroke-width:1.8!important}
.s3s :is(.lm-benefit,.lm-p-benefit,.lm-o-benefit) p{margin:0!important;font:var(--s3-fs-body)/1.5 var(--s3-sans)!important;color:var(--s3-ink)!important}
.s3s :is(.lm-benefit,.lm-p-benefit,.lm-o-benefit) strong{display:block!important;margin:0 0 4px!important;font:400 var(--s3-fs-lede)/1.2 var(--s3-serif)!important;color:var(--s3-ink)!important}
.s3s :is(.lm-signup-card,.lm-p-card,.lm-o-card){display:grid!important;grid-template-columns:238px minmax(0,1fr)!important;gap:clamp(32px,4vw,56px)!important;align-items:center!important;min-height:0!important;max-width:none!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important}
.s3s .lm-o-cover img{display:block;width:100%;height:auto}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form) h3{margin:0 0 12px!important;font-size:var(--s3-fs-title)!important}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form) h3 span{display:inline!important}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form) h3 span+span::before{content:" "}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form)>p{margin:0 0 22px!important;font:var(--s3-fs-body)/1.55 var(--s3-sans)!important;color:var(--s3-ink)!important}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form) button{width:100%!important}
.s3s :is(.lm-layout,.lm-p-layout,.lm-o-layout) :is(h2,h3,h2 span,h3 span){white-space:normal!important}
.s3s :is(.lm-form-panel,.lm-p-form,.lm-o-form){min-width:0!important}
.s3s :is(.lm-privacy,.lm-p-privacy,.lm-o-privacy),.s3s :is(.lm-privacy,.lm-p-privacy,.lm-o-privacy) *{white-space:normal!important}
.s3s .lm-form-panel h3 br{display:inline!important}
.s3s :is(.lm-signup-card,.lm-p-card,.lm-o-card) :is(.ml-embedded,.ml-form-embedContainer,.ml-form-embedWrapper,form,input,button){max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
html body .s3s :is(.lm-signup-card,.lm-p-card,.lm-o-card) button{white-space:normal!important;line-height:1.3!important}
.s3s :is(.lm-privacy,.lm-p-privacy,.lm-o-privacy){display:block!important;margin:16px 0 0!important;font:var(--s3-fs-label)/1.5 var(--s3-sans)!important;color:var(--s3-ink)!important}
.s3s :is(.lm-privacy,.lm-p-privacy,.lm-o-privacy) svg{display:inline-block;vertical-align:-2px;width:16px;height:16px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2}
/* audit scorecard cover: v3 HTML cover in place of the old purple image (matches the two workbook covers) */
.s3s .lm-o-cover.s3-cover{position:relative;display:flex;flex-direction:column;width:238px;height:338px;padding:24px 21px;box-sizing:border-box;background:var(--s3-navy);color:#fff;transform:rotate(-6deg);overflow:hidden}
.s3s .s3-cover .c-top{display:flex;justify-content:space-between;align-items:flex-start;font:700 12px/1 var(--s3-sans)!important;color:#fff!important}
.s3s .s3-cover .c-num{display:grid;place-items:center;align-content:center;width:56px;height:56px;border:4px solid var(--s3-sky);border-radius:50%;font:400 22px/1 var(--s3-serif)!important;color:#fff!important}
.s3s .s3-cover .c-num small{font:700 7px/1 var(--s3-sans)!important;letter-spacing:.08em;color:#fff!important}
.s3s .s3-cover .c-title{margin-top:44px;font:400 26px/1.08 var(--s3-serif)!important;color:#fff!important;text-transform:uppercase;letter-spacing:-.01em}
.s3s .s3-cover .c-foot{margin-top:auto;font:700 12px/1 var(--s3-sans)!important;color:var(--s3-sky)!important}
@media(max-width:1100px){.s3s :is(.lm-layout,.lm-p-layout,.lm-o-layout){grid-template-columns:minmax(0,1fr)!important}.s3s :is(.lm-copy,.lm-p-copy,.lm-o-copy){max-width:720px!important}}
@media(max-width:640px){.s3s :is(.lm-signup-card,.lm-p-card,.lm-o-card){grid-template-columns:minmax(0,1fr)!important}.s3s :is(.lm-book,.lm-p-book){margin:0 auto!important}.s3s .lm-o-cover{max-width:238px;margin:0 auto}}
.s3s :is(.faq-list details,.faq-list .faq-item){border-radius:0!important;background:transparent!important;border-left:0!important;border-right:0!important}
`;

function source(key, file) {
  // First build writes the transformed source into content/sales/<key>.html so later copy edits happen there, not in the backup.
  const out = path.join(SRC, key + '.html');
  if (fs.existsSync(out)) return fs.readFileSync(out, 'utf8');
  let raw = JSON.parse(fs.readFileSync(path.join(BK, file), 'utf8')).content.raw;
  raw = raw.replace(/<style id="scx-css">[\s\S]*?<\/style>/, '').replace(/<div class="scx" hidden><\/div>/, '').replace(/<!-- wp:html -->\s*<!-- \/wp:html -->\s*/, '');
  if (raw.includes('<div class="scx-sales">')) raw = raw.replace('<div class="scx-sales">', '<div class="s3 s3s">');
  else raw = raw.replace(/<!-- wp:html -->/, '<!-- wp:html -->\n<div class="s3 s3s">').replace(/<!-- \/wp:html -->(?![\s\S]*<!-- \/wp:html -->)/, '</div>\n<!-- /wp:html -->');
  raw = outsideCode(raw, fixDashes);
  fs.mkdirSync(SRC, { recursive: true });
  fs.writeFileSync(out, `<!-- ${key}: v3 source (from the live page 2026-10-03, dashes fixed). Edit copy here; colors are remapped at build. -->\n` + raw);
  return fs.readFileSync(out, 'utf8');
}

function page([key, id, file]) {
  let html = source(key, file).replace(/^<!--[^\n]*-->\n/, '');
  // two-series charts (Pinterest trend curve): the teal series becomes the sky accent so navy vs sky stays readable
  html = html.replace(/stroke="#0f766e"/gi, 'stroke="#4da3ff"').replace(/(<i style="background:)#0f766e;/gi, '$1#4da3ff;');
  // recolor only CSS: <style> blocks, style="" and SVG/HTML paint attributes (never text, never scripts)
  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, c) => a + recolor(css) + c)
    .replace(/\b(style|fill|stroke|stop-color|color|bgcolor)="([^"]*)"/g, (m, attr, val) => `${attr}="${attr === 'style' ? onSky(recolor(val)) : val.replace(HEX, (x) => remapColor(x, attr === 'color' ? 'text' : 'fill'))}"`);
  // MailerLite embeds style their submit button with ID-level !important rules; match each embed's ID so the button is a v3 pill
  // (the embeds render client-side, so their runtime IDs are listed here; read from the live pages 2026-10-05)
  const ml = ['mlb2-45214084', 'mlb2-45213976', 'mlb2-45213342']
    .map((id) => `#${id}.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.primary{background-color:#4da3ff!important;border-color:#4da3ff!important;color:#0a1930!important;border-radius:999px!important;font-family:Arial,Helvetica,sans-serif!important;font-weight:800!important;letter-spacing:.1em!important;text-transform:uppercase!important;font-size:15px!important;min-height:52px!important}#${id}.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.primary:hover{background-color:#0a1930!important;border-color:#0a1930!important;color:#fff!important}#${id}.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input.form-control{font-size:18px!important;font-family:Arial,Helvetica,sans-serif!important;color:#0a1930!important;border-color:#8f8a83!important;border-radius:4px!important;min-height:56px!important}`).join('');
  html = html.replace('<div class="s3 s3s">', `<style id="s3-sales">${min(SKIN)}${ml}</style><div class="s3 s3s">`);
  return { key, id, meta: { _elementor_edit_mode: '' }, html };
}

export function buildAll() {
  return PAGES.map(page);
}
