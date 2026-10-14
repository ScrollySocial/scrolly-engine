// Renders Scrolly's $1K Club promo carousels (posts.mjs) to ready-to-post PNGs: 1080×1440 (3:4), one folder per post,
// plus captions.md and an overview sheet per post for review. Brand = the approved Playbook/sales-page system:
// teal-dominant, black + cream, orange only as a fill (CTA slide), Archivo 900 / Public Sans / Caveat Brush.
// Usage (from this folder):  node build.mjs [slug ...]
// Renderer: puppeteer's Chrome headless shell (Edge can be mid-update and refuse to launch). Set CHROME to override.
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import posts from './posts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const u = (p) => 'file:///' + p.replace(/\\/g, '/');
const FONTS = path.join(root, 'Scrolly Organic Engine/products/1k-club/playbook/design/fonts');
const STOCK = path.join(root, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock');
const PAGES = path.join(root, 'Scrolly Organic Engine/products/1k-club/playbook/design/book-shots');
const ASSETS = path.join(root, 'website/scrolly-site/assets');
const CHROME = process.env.CHROME || path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell/win64-151.0.7922.71/chrome-headless-shell-win64/chrome-headless-shell.exe');
const W = 1080, H = 1440;

const only = process.argv.slice(2);
const list = posts.filter((p) => !only.length || only.some((o) => p.slug.startsWith(o)));

// ---------- copy helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(s).replace(/\{mark\}/g, '<span class="mk">').replace(/\{\/mark\}/g, '</span>').replace(/\{br\}/g, '<br>');
const plain = (s) => String(s).replace(/\{\/?mark\}|\{br\}/g, ' ');
for (const p of posts) for (const s of p.slides) for (const v of Object.values(s)) if (/—/.test(JSON.stringify(v))) throw new Error(`em dash in ${p.slug}`);
for (const p of posts) if (/—/.test(p.caption)) throw new Error(`em dash in ${p.slug} caption`);

const logo = `<svg class="logo" viewBox="26 -725 2725 935" aria-hidden="true">${(await import('node:fs')).readFileSync(path.join(ASSETS, 'scrolly-wordmark.svg'), 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>`;
const header = (tag = 'The $1K Club') => `<div class="hd">${logo}<span class="pill">${esc(tag)}</span></div>`;
const hand = (s, cls = '') => (s ? `<div class="hand ${cls}">${esc(s)}</div>` : '');
const photo = (name, pos = 'center') => `<div class="ph" style="background-image:url('${u(path.join(STOCK, name + '.jpg'))}');background-position:${pos}"></div>`;
const page = (id) => u(path.join(PAGES, id + '.png'));

// ---------- layouts ----------
const L = {
  cover: (s) => `${s.bg === 'teal' ? `<img class="strokes" src="${u(path.join(ASSETS, 'k1-strokes.webp'))}">` : ''}
    ${header()}
    <div class="body top"><h1 class="disp xl">${rich(s.title)}</h1>${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}${hand(s.hand, 'mt')}</div>
    ${s.art === 'tiger' ? `<img class="tiger" src="${u(path.join(ASSETS, 'k1-tiger.webp'))}">` : ''}
    <div class="swipe${s.art ? ' left' : ''}">Swipe <b>→</b></div>`,

  statement: (s) => `${header()}<div class="body mid">
    ${s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : ''}
    ${s.huge ? `<div class="huge">${esc(s.huge)}</div>` : ''}
    ${s.title ? `<h2 class="disp ${s.big ? 'xl' : 'lg'}">${rich(s.title)}</h2>` : ''}
    ${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}${hand(s.hand, 'mt')}
    ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}</div>`,

  list: (s) => `${header()}<div class="body mid"><h2 class="disp lg">${rich(s.title)}</h2>
    <ol class="steps ${s.items.some((i) => i[1]) ? '' : 'tight'}">${s.items.map((it, i) => `<li class="${s.strongLast && i === s.items.length - 1 ? 'strong' : ''}"><span class="n">${i + 1}</span><div><b>${esc(it[0])}</b>${it[1] ? `<span>${esc(it[1])}</span>` : ''}</div></li>`).join('')}</ol></div>`,

  checks: (s) => `${header()}<div class="body mid"><h2 class="disp lg">${rich(s.title)}</h2>
    <ul class="checks ${s.no ? 'no' : ''}">${s.items.map((it) => `<li><span class="ck">${s.no ? '✕' : '✓'}</span><span>${esc(it)}</span></li>`).join('')}</ul></div>`,

  table: (s) => `${header()}<div class="body mid"><h2 class="disp lg">${rich(s.title)}</h2>
    <div class="card"><table><thead><tr>${s.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
    ${s.rows.map((r, i) => `<tr class="${s.strongLast && i === s.rows.length - 1 ? 'strong' : ''}">${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}</div>`,

  // full-bleed photo, black fade at the bottom, cream type on the fade
  photo: (s) => `${photo(s.photo, s.pos)}<div class="fade"></div>${header()}
    <div class="body bottom on-photo">${s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : ''}<h2 class="disp ${s.cover ? 'xl' : 'lg'}">${rich(s.title)}</h2>${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}${hand(s.hand, 'mt')}</div>
    ${s.cover ? '<div class="swipe">Swipe <b>→</b></div>' : ''}`,

  // photo on top, solid color panel with type underneath
  panel: (s) => `<div class="ptop">${photo(s.photo, s.pos)}</div>${header()}
    <div class="pbot">${s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : ''}<h2 class="disp lg">${rich(s.title)}</h2>${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}</div>`,

  // before/after Instagram bio on top of a photo
  before: (s) => `${photo(s.photo, s.pos)}<div class="fade soft"></div>${header()}
    <div class="body bottom ba">
      <div class="bio was"><div class="lab">Before</div><p>${esc(s.before)}</p></div>
      <div class="bio now"><div class="lab">After</div><p>${esc(s.after)}</p></div>
      <div class="note light">Illustrative example</div></div>`,

  pages: (s) => `${header()}<div class="body ${s.cover ? 'top' : 'top'}"><h2 class="disp ${s.cover ? 'xl' : 'lg'}">${rich(s.title)}</h2>
    ${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}${hand(s.hand, 'mt')}
    ${s.items ? `<ul class="parts">${s.items.map((i) => `<li><b>${esc(i[0])}</b><span>${esc(i[1])}</span></li>`).join('')}</ul>` : ''}</div>
    <div class="fan n${s.pages.length}">${s.pages.map((p) => `<img src="${page(p)}">`).join('')}</div>
    ${s.cover ? '<div class="swipe">Swipe <b>→</b></div>' : ''}`,

  calc: (s) => `${header()}<div class="body top"><h2 class="disp lg">${rich(s.title)}</h2><p class="lede">${rich(s.body)}</p></div>
    <div class="calc"><div class="row"><span>Your average sale</span><b>$50</b></div><div class="row"><span>Your goal</span><b>$1,000</b></div>
    <div class="out"><span>Sales needed</span><b>20</b></div><div class="cap">Example: $1,000 ÷ $50 = 20 sales</div></div>`,

  shirt: (s) => `${header()}<div class="body top">${s.title ? `<h2 class="disp ${s.hand ? 'xl' : 'lg'}">${rich(s.title)}</h2>` : ''}${hand(s.hand, 'mt big')}${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}</div>
    <div class="shirts ${s.shirt}">${(s.shirt === 'both' ? ['back', 'front'] : [s.shirt]).map((k) => `<img src="${u(path.join(ASSETS, `shirt-1k-challenge-${k}-cut.webp`))}">`).join('')}</div>`,

  split: (s) => `${header()}<div class="body mid"><h2 class="disp lg">${rich(s.title)}</h2><div class="cols">
    ${[s.left, s.right].map(([h, items], i) => `<div class="col c${i}"><div class="ch">${esc(h)}</div><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></div>`,

  offer: (s) => `${header()}<div class="body mid"><div class="oname">${esc(s.name)}</div><div class="oprice">${esc(s.price)}</div><p class="lede">${esc(s.one)}</p>
    <ul class="checks">${s.items.map((it) => `<li><span class="ck">✓</span><span>${esc(it)}</span></li>`).join('')}</ul></div>`,

  versus: (s) => `${header()}<div class="body mid vs"><div class="disp xl">${esc(s.a[0])}<br><span class="dim">${esc(s.a[1])}</span></div>
    <div class="hand big">or</div><div class="disp xl">${esc(s.b[0])}<br><span class="tl">${esc(s.b[1])}</span></div></div><div class="swipe">Swipe <b>→</b></div>`,

  cta: (s) => `${header()}<div class="body mid"><h2 class="disp xl">${rich(s.title)}</h2>${s.body ? `<p class="lede">${rich(s.body)}</p>` : ''}
    <div class="price">${esc(s.price)}</div><div class="btn">Link in bio</div><div class="fine">${esc(s.fine)}</div></div>
    <div class="url">scrollyseo.com/1k-club</div>`,
};

// background per layout: photo layouts set their own; CTA is always orange
const bgOf = (s) => (s.l === 'cta' ? 'orange' : ['photo', 'before'].includes(s.l) ? 'photo' : s.l === 'panel' ? `panel ${s.bg}` : s.bg);

const CSS = `
@font-face{font-family:Archivo;font-weight:800;src:url('${u(path.join(FONTS, 'archivo-800.ttf'))}')}
@font-face{font-family:Archivo;font-weight:900;src:url('${u(path.join(FONTS, 'archivo-900.ttf'))}')}
@font-face{font-family:'Public Sans';font-weight:400;src:url('${u(path.join(FONTS, 'publicsans-400.ttf'))}')}
@font-face{font-family:'Public Sans';font-weight:600;src:url('${u(path.join(FONTS, 'publicsans-600.ttf'))}')}
@font-face{font-family:'Public Sans';font-weight:700;src:url('${u(path.join(FONTS, 'publicsans-700.ttf'))}')}
@font-face{font-family:'Public Sans';font-weight:800;src:url('${u(path.join(FONTS, 'publicsans-800.ttf'))}')}
@font-face{font-family:'Caveat Brush';src:url('${u(path.join(FONTS, 'caveatbrush-400.ttf'))}')}
@font-face{font-family:Sym;src:url('${u(path.join(FONTS, 'archivo-800.ttf'))}');unicode-range:U+2190-2193,U+00F7,U+00D7}
:root{--black:#000;--cream:#fbf8f3;--orange:#ff6338;--teal:#94ece1;--ink:#000;--paper:#fbf8f3}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.s{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:Sym,'Public Sans',sans-serif;color:var(--ink);padding:76px 84px 84px;display:flex;flex-direction:column}
.s.teal{background:var(--teal)}.s.cream{background:var(--cream)}.s.black{background:#000;color:var(--cream)}.s.orange{background:var(--orange)}
.s.photo{background:#000;color:var(--cream)}
.hd{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:3;flex:none}
.logo{height:46px;width:auto;fill:currentColor;color:var(--ink)}
.black .logo,.photo .logo{color:var(--cream)}
.pill{background:#000;color:var(--cream);font:800 24px/1 Archivo;letter-spacing:.08em;text-transform:uppercase;padding:16px 26px;border-radius:40px}
.black .pill{background:var(--teal);color:#000}.photo .pill{background:var(--cream);color:#000}
.body{position:relative;z-index:3;flex:1;display:flex;flex-direction:column}
.body.top{justify-content:flex-start;padding-top:70px}.body.mid{justify-content:center}.body.bottom{justify-content:flex-end}
.disp{font-family:Sym,Archivo;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:.93}
.xl{font-size:118px}.lg{font-size:84px}
.mk{white-space:nowrap;background:#000;color:var(--cream);border-radius:18px;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.black .mk{background:var(--teal);color:#000}.on-photo .mk{background:var(--teal);color:#000}
.orange .mk{white-space:nowrap;background:#000;color:var(--orange)}
.lede{font:600 40px/1.32 Sym,'Public Sans';margin-top:40px;max-width:880px}
.kick{font:800 30px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px}
.black .kick,.on-photo .kick{color:var(--teal)}
.hand{font-family:'Caveat Brush';font-size:84px;line-height:1;text-transform:uppercase}
.hand.mt{margin-top:36px}.hand.big{font-size:120px}
.black .hand,.on-photo .hand{color:var(--teal)}
.huge{font:900 400px/.8 Archivo;letter-spacing:-.04em;text-transform:uppercase;color:var(--orange);margin:10px 0 20px}
.note{margin-top:44px;font:600 26px/1 'Public Sans';opacity:.7;text-transform:uppercase;letter-spacing:.08em}
.note.light{color:var(--cream);opacity:.85}
.swipe{position:absolute;right:84px;bottom:70px;z-index:4;font:400 54px/1 'Caveat Brush';text-transform:uppercase;display:flex;gap:12px;align-items:center}
.swipe.left{right:auto;left:84px}
.swipe b{font:900 50px/1 Sym;}
.black .swipe,.photo .swipe{color:var(--teal)}
/* cover art */
.strokes{position:absolute;left:-200px;right:-200px;bottom:-40px;width:1480px;opacity:.9;z-index:1}
.tiger{position:absolute;right:-60px;bottom:40px;width:760px;z-index:2}
/* lists */
.steps{list-style:none;margin-top:56px;display:flex;flex-direction:column;gap:38px}
.steps.tight{gap:26px}
.steps li{display:flex;gap:34px;align-items:flex-start}
.steps .n{flex:none;width:84px;height:84px;border-radius:50%;background:#000;color:var(--cream);font:900 46px/84px Archivo;text-align:center}
.black .steps .n{background:var(--teal);color:#000}
.steps b{display:block;font:900 52px/1.02 Archivo;text-transform:uppercase;letter-spacing:-.01em;padding-top:14px}
.steps span{display:block;font:600 34px/1.3 'Public Sans';margin-top:12px;max-width:760px}
.steps.tight b{font-size:50px}
.steps li.strong .n{background:var(--orange);color:#000}
.cream .steps li.strong .n{background:#000;color:var(--cream)}
.checks{list-style:none;margin-top:52px;display:flex;flex-direction:column;gap:30px}
.checks li{display:flex;gap:28px;align-items:flex-start;font:700 42px/1.25 Sym,'Public Sans'}
.checks .ck{flex:none;width:64px;height:64px;border-radius:50%;background:#000;color:var(--cream);font:900 36px/64px Archivo;text-align:center;margin-top:-6px}
.black .checks .ck{background:var(--teal);color:#000}
/* table */
.card{background:#fff;border-radius:16px;padding:20px 44px;margin-top:52px}
.black .card{background:#111}
table{width:100%;border-collapse:collapse}
th{font:800 26px/1 Archivo;text-transform:uppercase;letter-spacing:.08em;text-align:left;padding:26px 0 22px;opacity:.6}
td{font:600 38px/1.2 Sym,'Public Sans';padding:26px 0;border-top:2px solid rgba(0,0,0,.1)}
td:first-child{font-weight:700}
tr td:not(:first-child),tr th:not(:first-child){text-align:right}
table td:last-child{font-family:Archivo;font-weight:900}
tr.strong td{font:900 44px/1.2 Archivo}
/* photo */
.ph{position:absolute;inset:0;background-size:cover;z-index:0}
.fade{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 38%,rgba(0,0,0,.78) 64%,rgba(0,0,0,.92) 100%)}
.fade.soft{background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,.25) 45%,rgba(0,0,0,.7) 100%)}
.on-photo .lede{color:var(--cream)}
.s.panel{padding:0}
.s.panel .hd{position:absolute;left:84px;right:84px;top:76px}
.s.panel .logo{color:var(--cream)}.s.panel .pill{background:var(--cream);color:#000}
.ptop{position:relative;height:780px;overflow:hidden}
.ptop .ph{position:absolute;inset:0}
.ptop::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,0) 30%)}
.pbot{flex:1;padding:64px 84px 84px;display:flex;flex-direction:column;justify-content:center}
.panel.teal .pbot{background:var(--teal)}.panel.cream .pbot{background:var(--cream)}
.pbot .lede{margin-top:28px}
/* before / after bios */
.ba{gap:26px}
.bio{border-radius:16px;padding:34px 40px}
.bio .lab{font:800 24px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
.bio p{font:700 40px/1.28 Sym,'Public Sans'}
.bio.was{background:rgba(251,248,243,.92);color:#000}
.bio.was p{text-decoration:line-through;text-decoration-thickness:4px;opacity:.75}
.bio.now{background:var(--teal);color:#000}
/* playbook pages */
.fan{position:absolute;z-index:2;left:0;right:0;bottom:-60px;height:720px}
.fan img{position:absolute;width:470px;border-radius:10px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.fan.n1 img{width:640px;left:220px;bottom:0;transform:rotate(-4deg)}
.fan.n3 img:nth-child(1){left:40px;bottom:-30px;transform:rotate(-9deg)}
.fan.n3 img:nth-child(2){left:305px;bottom:30px;transform:rotate(0deg);z-index:2}
.fan.n3 img:nth-child(3){right:40px;bottom:-30px;transform:rotate(9deg)}
.parts{list-style:none;margin-top:40px;display:flex;flex-direction:column;gap:16px}
.parts li{font:600 36px/1.2 'Public Sans'}.parts b{font:900 36px/1.2 Archivo;text-transform:uppercase;margin-right:16px}
/* calculator mock */
.calc{position:relative;z-index:2;background:var(--cream);color:#000;border-radius:16px;padding:50px 56px;margin-bottom:40px}
.calc .row{display:flex;justify-content:space-between;align-items:center;font:600 36px/1 'Public Sans';padding:24px 0;border-bottom:2px solid rgba(0,0,0,.1)}
.calc .row b{font:900 46px/1 Archivo}
.calc .out{display:flex;justify-content:space-between;align-items:center;margin-top:30px;background:var(--teal);border-radius:14px;padding:30px 36px;font:800 36px/1 Archivo;text-transform:uppercase}
.calc .out b{font:900 110px/1 Archivo}
.calc .cap{font:600 26px/1 'Public Sans';opacity:.65;margin-top:26px}
/* shirt */
.l-shirt .body{flex:none}
.shirts{position:relative;z-index:2;display:flex;justify-content:center;align-items:center;gap:0;flex:1;margin:0 -60px}
.shirts img{width:760px}
.shirts.both img{width:520px}
.shirts.front img{width:640px}
/* split columns */
.cols{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:52px}
.col{border-radius:16px;padding:40px 36px}
.col.c0{background:#000;color:var(--cream)}.col.c1{background:#fff;color:#000}
.cream .col.c1{background:var(--teal)}
.ch{font:900 40px/1 Archivo;text-transform:uppercase;margin-bottom:28px}
.col.c0 .ch{color:var(--teal)}
.col ul{list-style:none;display:flex;flex-direction:column;gap:22px}
.col li{font:600 37px/1.28 'Public Sans'}
/* offer */
.oname{font:800 34px/1 Archivo;text-transform:uppercase;letter-spacing:.08em}
.black .oname{color:var(--teal)}
.oprice{font:900 230px/.9 Archivo;letter-spacing:-.04em;margin-top:18px}
.offer-tight .checks li{font-size:38px}
/* versus */
.vs .disp{font-size:126px}.vs .dim{color:var(--orange)}.vs .tl{color:var(--teal)}
.vs .hand{margin:30px 0}
/* CTA */
.orange .logo{color:#000}
.price{font:900 52px/1.05 Archivo;text-transform:uppercase;margin-top:56px;letter-spacing:-.01em}
.btn{align-self:flex-start;background:#000;color:#fff;font:800 42px/1 Archivo;text-transform:uppercase;letter-spacing:.02em;padding:32px 56px;border-radius:60px;margin-top:40px}
.fine{font:600 28px/1.35 'Public Sans';margin-top:40px;max-width:820px}
.url{position:relative;z-index:3;font:800 30px/1 Archivo;letter-spacing:.04em;text-transform:uppercase}
`;

const slideHTML = (s) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="s ${bgOf(s)} l-${s.l}${s.l === 'offer' && s.items.length > 4 ? ' offer-tight' : ''}">${L[s.l](s)}</div></body></html>`;

// ---------- render ----------
const tmp = path.join(here, '.render');
mkdirSync(tmp, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H });
const problems = [];
let md = '# $1K Club promo carousels\n\nReady-to-post slides: 1080 × 1440 px (3:4). Post each folder\'s PNGs in order as one carousel. Captions below.\n\n';

for (const post of list) {
  const out = path.join(here, 'dist', post.slug);
  if (existsSync(out)) rmSync(out, { recursive: true });
  mkdirSync(out, { recursive: true });
  const files = [];
  for (const [i, s] of post.slides.entries()) {
    const f = path.join(tmp, `${post.slug}-${i + 1}.html`);
    writeFileSync(f, slideHTML(s));
    await pg.goto(u(f), { waitUntil: 'networkidle0' });
    await pg.evaluate(async () => { await Promise.all(['900 40px Archivo', '800 40px Archivo', '400 40px "Public Sans"', '600 40px "Public Sans"', '700 40px "Public Sans"', '40px "Caveat Brush"'].map((f) => document.fonts.load(f))); await document.fonts.ready; });
    // QA: text outside the canvas or colliding with the header, and fonts that failed to load
    const qa = await pg.evaluate(() => {
      const bad = [];
      const hd = document.querySelector('.hd').getBoundingClientRect();
      for (const el of document.querySelectorAll('.body > *, .pbot > *, .price, .btn, .fine, .url, .swipe')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.left < 60 || r.right > 1020 || r.bottom > 1400 || r.top < hd.bottom + 10) bad.push(`${el.className || el.tagName} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
      }
      const fonts = ['900 40px Archivo', '600 40px "Public Sans"', '40px "Caveat Brush"'].filter((f) => !document.fonts.check(f) || ![...document.fonts].some((x) => x.status === 'loaded' && f.includes(x.family.replace(/"/g, ''))));
      return { bad, fonts };
    });
    if (qa.bad.length || qa.fonts.length) problems.push(`${post.slug} slide ${i + 1}: ${[...qa.bad, ...qa.fonts.map((x) => 'font ' + x)].join('; ')}`);
    const png = path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await pg.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
    files.push(png);
  }
  // overview sheet for review
  const sheet = path.join(tmp, `${post.slug}-sheet.html`);
  writeFileSync(sheet, `<style>body{margin:0;background:#ddd;display:flex;gap:12px;padding:12px}img{width:300px;display:block}</style>${files.map((f) => `<img src="${u(f)}">`).join('')}`);
  await pg.setViewport({ width: 12 + files.length * 312, height: 424 });
  await pg.goto(u(sheet), { waitUntil: 'networkidle0' });
  await pg.screenshot({ path: path.join(here, 'dist', `${post.slug}-overview.png`) });
  await pg.setViewport({ width: W, height: H });
  md += `## ${post.slug}\n\nSlides: ${files.length} · Alt text for slide 1: ${plain(post.slides[0].title || post.slides[0].a?.join(' ') || '')}\n\n\`\`\`\n${post.caption}\n\`\`\`\n\n`;
  console.log('built', post.slug, files.length, 'slides');
}
await browser.close();
rmSync(tmp, { recursive: true });
if (!only.length) writeFileSync(path.join(here, 'dist', 'captions.md'), md);
if (problems.length) { console.log('\nLAYOUT PROBLEMS:\n' + problems.join('\n')); process.exitCode = 1; } else console.log('layout QA: 0 problems');
