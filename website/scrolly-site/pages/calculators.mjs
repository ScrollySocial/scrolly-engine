// Free Calculators (v3, 2026-10-03): the /calculators/ directory plus one page per calculator at /calculators/<slug>/.
// Directory source: Mercedes's scrolly-calculator-directory-reference (2).html. Calculator pages: her "Income Goal Calculator" wireframe.
// Both swept to the v3 rules: global chrome instead of their own header/footer, .s3 foundation (chrome/v3.css), no outlined cards or
// peach panels, no red/orange text links or eyebrows, no "→" in names, homepage club copy, and the conversion assumptions are visible inputs.
// The calculators themselves (fields, math, copy) live in ../calculators-data.mjs.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { img, media, s3shell } from '../lib.mjs';
import { CALCS, GROUPS, HELPERS, PRESET_JS, compute, presetHtml } from '../calculators-data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR_ID = 1132; // https://scrollyseo.com/calculators/
const href = (c) => `/calculators/${c.slug}/`;
const bySlug = Object.fromEntries(CALCS.map((c) => [c.slug, c]));

// Line icons (24px grid, stroke only) in warm circles: one per calculator card, one per result row.
const ICONS = {
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H6"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  bars: '<path d="M4 20v-7h4v7zM10 20V8h4v12zM16 20V4h4v16z"/>',
  funnel: '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5"/>',
  dollar: '<path d="M12 2v20M17 6.5C16.2 4.9 14.4 4 12 4 9.2 4 7.5 5.4 7.5 7.5c0 4.8 10 2.4 10 7.5 0 2.2-1.9 3.5-5 3.5-2.6 0-4.4-1-5.2-2.8"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  receipt: '<path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5-2 1.5-2.5-1.5L5 21zM9 8h6M9 12h6M9 16h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  scale: '<path d="M12 3v18M7 21h10M4 7h16M4 7l-3 6h6zM20 7l-3 6h6z"/>',
};
const ico = (k) => `<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></span>`;
// [card icon, result-row icons] per calculator
const ICON_BY_SLUG = {
  'income-goal': ['target', ['eye', 'people', 'cart']],
  'price-to-customers': ['tag', ['people', 'people', 'people']],
  'sales-goal': ['bars', ['cart', 'calendar', 'clock']],
  'traffic-to-sales': ['people', ['cart', 'dollar', 'people']],
  'conversion-rate': ['funnel', ['percent', 'people']],
  'content-output': ['layers', ['layers', 'calendar', 'trend']],
  'views-per-post': ['eye', ['eye', 'layers', 'trend']],
  'profit': ['dollar', ['dollar', 'dollar', 'percent']],
  'break-even': ['scale', ['dollar', 'flag', 'receipt']],
  'average-order-value': ['receipt', ['receipt', 'trend']],
};

// Same three Clubs and copy as the homepage.
const CLUBS = [
  ['$1K', 'Make your first $1,000.', '/1k-club/', 'Start here'],
  ['$10K', 'Reach $10K months.', '/10k-club/', 'Grow here'],
  ['$24K', 'Hit $24K months.', '/24k-club/', 'Scale here'],
];

const CSS = fs.readFileSync(path.join(here, '..', 'calculators.css'), 'utf8');

// Inline page script: reads the form, runs the calculator's fn, writes values (and sentences where shown). No '&' allowed (s3shell checks).
const script = (c) => `(function(){var f=document.getElementById('cdir-form');if(!f||f.__init)return;f.__init=1;
var H=${HELPERS},C=${c.fn},K=${JSON.stringify(c.fields.map((x) => x.k))};
function read(){var v={};K.forEach(function(k){var x=parseFloat(document.getElementById('cdir-'+k).value);v[k]=isFinite(x)?x:0});return v}
function sz(t){return t.length>7?' l':t.length>5?' m':''}
${PRESET_JS}
function run(){var o=C(read(),H),z=sz(o.reduce(function(m,r){return r[0].length>m.length?r[0]:m},''));o.forEach(function(r,i){var e=document.getElementById('cdir-v'+i);e.textContent=r[0];e.className='v'+z;var t=document.getElementById('cdir-t'+i);if(t)t.textContent=r[1]});presetSync(f)}
presets(f,run);
f.addEventListener('submit',function(e){e.preventDefault();run()});f.addEventListener('input',run)})();`;

// presets: Weak / Typical / Strong buttons that fill the box (calculator pages only; the directory's one-row form keeps plain inputs).
const field = (x, presets) => {
  const unit = x.pre ? ' (dollars)' : x.suf ? ' (percent)' : '';
  const pre = presets ? x.presets : null;
  const extra = pre ? presetHtml(x, 'cdir-') : '';
  return `<div class="s3-field"><label for="cdir-${x.k}">${x.label}${unit ? `<span class="s3-sr">${unit}</span>` : ''}</label><div class="cdir-in${x.pre ? ' pre' : ''}${x.suf ? ' suf' : ''}">${x.pre ? '<span aria-hidden="true">$</span>' : ''}<input id="cdir-${x.k}" type="number" inputmode="decimal" value="${x.val}" min="0" step="${x.step}"${pre ? ` aria-describedby="cdir-h-${x.k}"` : ''}>${x.suf ? '<span aria-hidden="true">%</span>' : ''}</div>${extra}</div>`;
};
// Long result numbers (views can run to six or seven digits) step down a size so they never break mid-number. The longest result sets the
// size for every row, so one calculator's numbers always match (Mercedes, 2026-10-15). Same rule as sz() in the page script.
const sz = (t) => (t.length > 7 ? ' l' : t.length > 5 ? ' m' : '');
const szAll = (res) => sz(res.reduce((m, [v]) => (v.length > m.length ? v : m), ''));
const NOTE = '<p class="s3-fine cdir-note">Estimates, not guarantees. Change the numbers to match your business.</p>';
const BTN = '<button class="s3-btn" type="submit">Calculate <span aria-hidden="true">→</span></button>';

// Cards link only to calculator pages that are published (id set in calculators-data.mjs); the rest say "Coming soon".
// Calculator pages: the climbing tiger (Mercedes, 2026-10-03), cropped to the tiger + rocks on the right and faded into the cream on the left.
const climb = () => {
  const t = media['calc-tiger-climb.webp'];
  return `<img class="climb" src="${img('calc-tiger-climb.webp')}" alt="" width="${t.w}" height="${t.h}" fetchpriority="high">`;
};

const card = (c) => `<li>${ico(ICON_BY_SLUG[c.slug][0])}<div class="body"><h3>${c.name}</h3><p>${c.short}</p>${c.id ? `<a class="s3-link" href="${href(c)}" aria-label="Open the ${c.name}"><span class="tx">Calculate</span> <span aria-hidden="true">→</span></a>` : '<span class="soon s3-label">Coming soon</span>'}</div></li>`;

const BRIDGE = `
<section class="cdir-bridge s3-sec" aria-labelledby="cdir-bridge-h"><div class="s3-wrap s3-split">
 <div>
  <h2 class="s3-h2" id="cdir-bridge-h">Numbers aren’t a <em class="or">plan.</em></h2>
  <p class="s3-lede">You know how many sales you need. Now build the business that gets them.</p>
  <a class="s3-btn inline" href="/#clubs">Explore the Clubs <span aria-hidden="true">→</span></a>
 </div>
 <ul class="cdir-clubs">${CLUBS.map(([amt, line, h, cta]) => `<li><div class="amt">${amt}<small>Club</small></div><p>${line}</p><a class="s3-link" href="${h}" aria-label="${cta}: ${amt} Club"><span class="tx">${cta}</span> <span aria-hidden="true">→</span></a></li>`).join('')}</ul>
</div></section>`;

function directory() {
  const feat = bySlug['income-goal'];
  const res = compute(feat);
  const body = `
<section class="cdir-hero tool"><div class="s3-wrap">
 <div class="copy">
  <nav class="cdir-crumbs s3-label" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Calculators</li></ol></nav>
  <h1 class="s3-display">Free business calculators</h1>
  <p class="s3-lede">Work out what it takes to reach your income goal, and the numbers behind it.</p>
  <p class="s3-label">No signup. No spreadsheet.</p>
 </div>
 ${climb()}
</div></section>

<section class="cdir-feat s3-sec tight" aria-labelledby="cdir-feat-h"><div class="s3-wrap"><div class="cdir-panel">
 <div class="intro">
  <p class="s3-label eyebrow">Featured calculator</p>
  <h2 class="s3-h2" id="cdir-feat-h">How many views does it take to make $1,000?</h2>
  <p class="s3-lede">Turn a revenue goal into sales, website visitors and views.</p>
 </div>
 <div>
  <form id="cdir-form" class="cdir-form row" novalidate>${feat.fields.map((x) => field(x)).join('')}${BTN}</form>
  <div class="cdir-res" aria-live="polite">${res.map(([v], i) => `<div>${ico(ICON_BY_SLUG[feat.slug][1][i])}<div><div class="v" id="cdir-v${i}">${v}</div><div class="s3-label">${feat.outs[i].replace(/ needed$/, '').replace(/^Estimated v/, 'V')}</div></div></div>`).join('')}</div>
  <p class="s3-fine">Estimates, not guarantees. Change the numbers to match your business.</p>
  ${feat.id ? `<a class="s3-link more" href="${href(feat)}"><span class="tx">Open the full calculator</span> <span aria-hidden="true">→</span></a>` : ''}
 </div>
</div></div></section>

<section class="s3-sec tight" aria-label="All calculators"><div class="s3-wrap">
 ${GROUPS.map(([k, g]) => `<div class="cdir-group"><h2 class="s3-h3" id="cdir-g-${k}">${g}</h2><ul class="cdir-cards" aria-labelledby="cdir-g-${k}">${CALCS.filter((c) => c.group === k).map(card).join('')}</ul></div>`).join('')}
</div></section>
${BRIDGE}`;
  return s3shell(`<div class="cdir">${body}</div>`, CSS, script(feat));
}

function tool(c) {
  const res = compute(c);
  const body = `
<section class="cdir-hero tool"><div class="s3-wrap">
 <div class="copy">
  <nav class="cdir-crumbs s3-label" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/calculators/">Calculators</a></li><li aria-current="page">${c.name.replace(/ Calculator$/, '')}</li></ol></nav>
  <p class="s3-label eyebrow">Free calculator</p>
  <h1 class="s3-display">${c.name}</h1>
  <p class="s3-lede">${c.lede}</p>
 </div>
 ${climb()}
</div></section>

<section class="cdir-tool s3-sec tight"><div class="s3-wrap"><div class="cdir-panel s3-split">
 <div class="left">
  <h2 class="s3-h3">Your numbers</h2>
  <p class="sub">Enter your numbers to see what it takes.</p>
  <form id="cdir-form" class="cdir-form" novalidate>${c.fields.map((x) => field(x, true)).join('')}${NOTE}${BTN}</form>
 </div>
 <div>
  <h2 class="s3-h3">Your results</h2>
  <p class="sub">Here’s what it takes.</p>
  <div class="cdir-rows" aria-live="polite">${res.map(([v, t], i) => `<div><div class="v${szAll(res)}" id="cdir-v${i}">${v}</div>${ico(ICON_BY_SLUG[c.slug][1][i])}<div><p class="s3-label">${c.outs[i]}</p><p class="t" id="cdir-t${i}">${t}</p></div></div>`).join('')}</div>
  <div class="cdir-adjust">${ico('trend')}<p><b>Want to adjust your assumptions?</b>Change any number to see how your results move.</p></div>
 </div>
</div></div></section>

<section class="cdir-why s3-sec tight"><div class="s3-wrap s3-split">
 <div><h2 class="s3-h3">Why these numbers matter</h2><p>${c.why}</p></div>
 <div><h2 class="s3-h3">Tips to improve your results</h2><ol class="cdir-tips">${c.tips.map((t) => `<li>${t}</li>`).join('')}</ol></div>
</div></section>

<section class="s3-sec tight" aria-labelledby="cdir-rel-h"><div class="s3-wrap">
 <div class="cdir-head"><h2 class="s3-h3" id="cdir-rel-h">Related calculators</h2><a class="s3-link" href="/calculators/"><span class="tx">All calculators</span> <span aria-hidden="true">→</span></a></div>
 <ul class="cdir-cards">${c.related.map((s) => card(bySlug[s])).join('')}</ul>
</div></section>
${BRIDGE}`;
  return s3shell(`<div class="cdir">${body}</div>`, CSS, script(c));
}

export function buildAll() {
  return [
    { key: 'calculators', id: DIR_ID, title: 'Free Calculators', html: directory() },
    ...CALCS.map((c) => ({ key: 'calc-' + c.slug, id: c.id, title: c.name, html: tool(c) })),
  ];
}
