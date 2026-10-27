// Instagram single-image posts with long captions (2026-10-27). One 1080x1440 (3:4) image per post; the caption lives
// in automation/planner/data/captions/<id>.md (one home, the planner reads it). The image carries the post's core
// idea and points down to the caption, which does the teaching.
// Look: her IG carousel rules (vault brand/writing-and-content-rules.md + Reel graphics memory): Instrument Serif
// headlines and big numbers, Jost text, Covered By Your Grace handwritten line, sky as the colour dose, hand-drawn
// doodles with a job only, no italic accent word, no marker band. No photo yet: the b-roll stills read as bad photos,
// so these use the approved graphic tiles (off-white big number, mist with phone, navy list) until she sends photos.
// Usage: node build.mjs [id ...]   Output: out/<id>.png + out/review.html, copies in OneDrive exports/ig-posts/
import { writeFileSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc, cfg } from '../carousels/lib/common.mjs';
import { handStar, handCircle, handBox } from '../carousels/lib/hand.mjs';
import { POSTS } from './posts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const CAPTIONS = path.resolve(HERE, '../planner/data/captions');
const EXPORTS = path.resolve(cfg('media').exportsDir, '../ig-posts');
const ARROW = fileUrl(path.resolve(HERE, '../reel-template-pack/assets/props/doodles/arrows/00.png'));
const FONTS = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block';
const C = { cream: '#f7f3ec', navy: '#0a1930', sky: '#4da3ff', mist: '#dfe4f0', muted: '#4a4e66' };

const BASE = `* { margin: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1440px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; }
  .ser { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -.01em; }
  .hand { position: absolute; font: 400 58px/1.1 'Covered By Your Grace', cursive; letter-spacing: .03em; }
  .dd { position: absolute; pointer-events: none; }
  .dd svg { width: 100%; height: 100%; display: block; }`;
const doodle = (svg, css) => `<div class="dd" style="${css}">${svg}</div>`;
// Hand-drawn straight arrow (Reel pack doodle as a mask, so it takes any colour) from (x1,y1) to (x2,y2).
const arrow = (x1, y1, x2, y2, c) => {
  const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `<div class="dd" style="left:${x1}px;top:${y1}px;width:${Math.round(len)}px;height:${Math.round(len * 152 / 420)}px;transform-origin:0 50%;transform:translateY(-50%) rotate(${ang.toFixed(1)}deg);background:${c};-webkit-mask:url('${ARROW}') center/100% 100% no-repeat;mask:url('${ARROW}') center/100% 100% no-repeat;mask-mode:luminance"></div>`;
};

// Off-white big-number tile: three prices, the customers each needs, the smallest circled.
const prices = (p) => `<style>${BASE}
  body { background: ${C.cream}; color: ${C.navy}; }
  h1 { position: absolute; left: 96px; top: 120px; font-size: 118px; line-height: .98; }
  .rows { position: absolute; left: 96px; right: 96px; top: 470px; }
  .row { display: grid; grid-template-columns: 210px 300px 1fr; align-items: baseline; height: 250px; border-top: 2px solid #d9d3ca; padding-top: 18px; }
  .pr { font: 800 76px/1 Jost; }
  .n { font-size: 236px; line-height: .9; color: ${C.sky}; text-align: right; padding-right: 90px; }
  .n span { position: relative; display: inline-block; }
  .n .dd { left: -60px; right: -60px; top: -75px; bottom: -40px; }
  .lab { font: 500 46px/1.1 Jost; }
</style>
<h1 class="ser">${p.head.map(esc).join('<br>')}</h1>
${doodle(handStar(C.sky, { pts: 4, fill: true, seed: 7 }), 'right:92px;top:96px;width:130px;height:130px')}
${doodle(handStar(C.navy, { pts: 8, seed: 12, sw: 3 }), 'right:230px;top:210px;width:62px;height:62px')}
<div class="rows">${p.rows.map(([pr, n, lab]) => `<div class="row"><div class="pr">${esc(pr)}</div><div class="n ser"><span>${esc(n)}${n === p.circle ? doodle(handCircle(C.navy, { sw: 4, seed: 8 }), '') : ''}</span></div><div class="lab">${esc(lab)}</div></div>`).join('')}</div>
<div class="hand" style="left:96px;bottom:70px;transform:rotate(-3deg)">${esc(p.hand)}</div>`;

// Blue mist tile: headline, a real-looking Instagram comment, an arrow to a phone showing the DM it triggers.
const dm = (p) => `<style>${BASE}
  body { background: ${C.mist}; color: ${C.navy}; }
  h1 { position: absolute; left: 90px; top: 110px; font-size: 112px; line-height: .98; }
  .cm { position: absolute; left: 60px; top: 760px; width: 470px; background: #fff; border-radius: 26px; padding: 26px 28px; display: flex; gap: 20px; align-items: flex-start; font-family: Arial, sans-serif; }
  .av { flex: none; width: 64px; height: 64px; border-radius: 50%; background: #e9c6c4; }
  .cm b { font-size: 26px; } .cm .t { font-size: 34px; margin-top: 6px; } .cm small { display: block; font-size: 22px; color: #737373; margin-top: 10px; }
  .phone { position: absolute; left: 600px; top: 470px; width: 420px; height: 880px; background: #1b1f27; border-radius: 58px; padding: 14px; box-shadow: 0 30px 60px rgba(10,25,48,.25); transform: rotate(3deg); }
  .scr { width: 100%; height: 100%; background: #fff; border-radius: 46px; overflow: hidden; font-family: Arial, sans-serif; color: #000; }
  .bar { display: flex; align-items: center; gap: 14px; padding: 58px 22px 18px; border-bottom: 1px solid #efefef; font-size: 22px; }
  .bar .av { width: 46px; height: 46px; background: ${C.navy}; }
  .ctx { font-size: 17px; color: #737373; text-align: center; margin: 26px 20px 10px; }
  .scr { position: relative; }
  .compose { position: absolute; left: 20px; right: 20px; bottom: 34px; border: 1px solid #dbdbdb; border-radius: 30px; padding: 16px 22px; font-size: 20px; color: #737373; }
  .msg { overflow-wrap: anywhere; margin: 0 22px; background: #efefef; border-radius: 26px; padding: 16px 20px; font-size: 21px; line-height: 1.35; }
  .msg u { color: #00376b; text-decoration: none; }
</style>
<h1 class="ser">${p.head.map(esc).join('<br>')}</h1>
<div class="cm"><div class="av"></div><div><b>yourshop</b><div class="t">${esc(p.keyword)}</div><small>1m · Reply</small></div></div>
${arrow(420, 950, 590, 1010, C.navy)}
<div class="phone"><div class="scr"><div class="bar"><div class="av"></div><b>ambitiondepthq</b></div>
<div class="ctx">Replied to your comment</div><div class="msg">${p.dm.map((l) => (/^https?:|\.com/.test(l) ? `<u>${esc(l)}</u>` : esc(l))).join('<br>')}</div><div class="compose">Message...</div></div></div>
${doodle(handStar(C.sky, { pts: 4, fill: true, seed: 4 }), 'right:70px;top:120px;width:120px;height:120px')}
<div class="hand" style="left:70px;bottom:240px;transform:rotate(-4deg);width:460px">${esc(p.aside)}</div>
<div class="hand" style="left:70px;bottom:70px;transform:rotate(-3deg);width:470px">${esc(p.hand)}</div>`;

// Navy tile: question headline and five hand-drawn tick boxes.
const checks = (p) => `<style>${BASE}
  body { background: ${C.navy}; color: #fff; }
  h1 { position: absolute; left: 96px; top: 120px; font-size: 128px; line-height: .96; }
  .sub { position: absolute; left: 100px; top: 400px; font: 700 34px/1 Jost; letter-spacing: .14em; text-transform: uppercase; color: ${C.sky}; }
  ul { position: absolute; left: 96px; right: 80px; top: 500px; list-style: none; padding: 0; }
  li { display: flex; align-items: center; gap: 34px; height: 132px; font: 500 50px/1.1 Jost; }
  .bx { flex: none; width: 70px; height: 70px; }
  .bx svg { width: 100%; height: 100%; display: block; }
</style>
<h1 class="ser">${p.head.map(esc).join('<br>')}</h1><div class="sub">${esc(p.sub)}</div>
<ul>${p.items.map((t, i) => `<li><span class="bx">${handBox(C.sky, { tick: true, seed: 30 + i * 7 })}</span>${esc(t)}</li>`).join('')}</ul>
${doodle(handStar(C.sky, { pts: 8, fill: true, seed: 5 }), 'right:84px;top:110px;width:140px;height:140px')}
${doodle(handStar(C.mist, { pts: 4, seed: 15, sw: 3 }), 'right:240px;top:260px;width:64px;height:64px')}
<div class="hand" style="left:96px;bottom:84px;color:${C.mist};transform:rotate(-3deg)">${esc(p.hand)}</div>`;

const TILES = { prices, dm, checks };
const only = process.argv.slice(2);
const posts = POSTS.filter((p) => !only.length || only.includes(p.id));

mkdirSync(OUT, { recursive: true });
mkdirSync(EXPORTS, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 1 });
for (const p of posts) {
  const f = path.join(OUT, '.' + p.id + '.html');
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"></head><body>${TILES[p.tile](p.image)}</body></html>`);
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  const png = path.join(OUT, p.id + '.png');
  await pg.screenshot({ path: png });
  copyFileSync(png, path.join(EXPORTS, p.id + '.png'));
  console.log('image  ' + p.id);
}
await browser.close();

// Review page: each image beside its full caption, with the character count and the part shown before "more".
const caption = (id) => readFileSync(path.join(CAPTIONS, id + '.md'), 'utf8').split(/^---$/m).slice(2).join('---').trim();
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IG single-image posts</title>
<style>body{font:17px/1.5 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}h1{font-size:26px}.p{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:28px;background:#fff;border-radius:14px;padding:20px;margin-bottom:28px}
.p img{width:100%;border-radius:8px}.cap{white-space:pre-wrap}.cap mark{background:#dfe4f0}small{display:block;color:#555;margin-bottom:10px}@media(max-width:700px){.p{grid-template-columns:1fr}}</style>
<h1>Instagram single-image posts: samples</h1><p>Shaded text = what shows before "more" (about 125 characters).</p>
${posts.map((p) => { const t = caption(p.id); return `<div class="p"><img src="${p.id}.png" alt=""><div><small>${esc(p.id)} · ${[...t].length} of 2,200 characters · teaches ${esc(p.link)}</small><div class="cap"><mark>${esc(t.slice(0, 125))}</mark>${esc(t.slice(125))}</div></div></div>`; }).join('\n')}`);
console.log('done   ' + OUT);
