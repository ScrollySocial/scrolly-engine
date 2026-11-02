// Quote posts (Mercedes 2026-11-02): 14 quotes from the planner's Quotes series, "cute, with a little magic in each".
// One 1080x1440 (3:4) image per quote. Look: her IG rules (Instrument Serif quote, Covered By Your Grace credit,
// sky as the colour dose, footer-style sparkle stars as the signature), no italic accent word, no marker band, no pink
// (pink means Mercedes; these are other people's words). Each quote gets one small magic device that fits its words.
// Usage: node quotes.mjs [n ...]   Output: out/quotes/quote-<n>.png + out/quotes/review.html, copies in OneDrive exports/ig-posts/quotes/
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc, cfg } from '../carousels/lib/common.mjs';
import { handStar } from '../carousels/lib/hand.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'quotes');
const EXPORTS = path.resolve(cfg('media').exportsDir, '../ig-posts/quotes');
const ASSETS = path.resolve(HERE, '../../website/scrolly-site/assets');
const FONTS = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;700&family=Instrument+Serif&family=Covered+By+Your+Grace&family=Lily+Script+One&family=Molle:ital@1&family=Caprasimo&family=Sansita+Swashed:wght@900&family=Sonsie+One&family=Shrikhand&family=Oleo+Script:wght@700&family=Lobster&family=Gloock&family=DM+Serif+Display&family=Fraunces:opsz,wght@9..144,600&family=Cormorant+Garamond:wght@600&family=Italiana&family=Abril+Fatface&family=Alfa+Slab+One&family=Rubik+Mono+One&display=block';
const C = { cream: '#f7f3ec', navy: '#0a1930', sky: '#4da3ff', mist: '#dfe4f0' };

// The 14 quotes (planner cards "Quote 1" to "Quote 14"); credit = the checked author, or Unknown.
export const QUOTES = [
  { n: 1, text: 'The only man who never makes mistakes is the man who never does anything.', by: 'Theodore Roosevelt', tile: 'collage', script: 'Caprasimo', fs: 100, get pieces() { return PIECES; } },
  { n: 2, text: 'It is not in the stars to hold our destiny but in ourselves.', by: 'Unknown', tile: 'athlete', art: 712808 },
  { n: 3, text: 'If you can’t explain it simply, you don’t understand it well enough.', by: 'Unknown', tile: 'athlete', art: 712799 },
  { n: 4, text: 'If you look for perfection, you’ll never be content.', by: 'Leo Tolstoy, Anna Karenina', tile: 'collage', script: 'Molle', fs: 100, get pieces() { return PIECES; } },
  { n: 5, text: 'Of course it’s hard. It’s supposed to be hard. If it’s easy, everyone would do it. Hard is what makes it great.', by: 'A League of Their Own', tile: 'athlete', art: 712793 },
  { n: 6, text: 'If you’re making mistakes, it means you’re out there doing something.', by: 'Neil Gaiman', tile: 'collage', script: 'Sansita Swashed', fs: 100, get pieces() { return PIECES; } },
  { n: 7, text: 'What a privilege it is to be exhausted by the work you once dreamed of.', by: 'Unknown', tile: 'note', bg: 12162, bgPos: '15% center', bgSize: 'auto 104%', noteTop: 120 },
  { n: 8, text: 'The greatest legacy is showing others what’s possible.', by: 'Unknown', tile: 'collage', script: 'Lily Script One', fs: 100, get pieces() { return PIECES; } },
  { n: 9, text: 'To inspire people, don’t show them your superpowers. Show them theirs.', by: 'Alexander den Heijer', tile: 'athlete', art: 712801 },
  { n: 10, text: 'A curious mind constantly uncovers magic.', by: 'Unknown', tile: 'athlete', art: 727249 },
  { n: 11, text: 'Enthusiasm is common. Endurance is rare.', by: 'Angela Duckworth', tile: 'rope' },
  { n: 12, text: 'The scariest place to be is the same place as last year. Grow.', by: 'Unknown', tile: 'ribbon', ribbon: ['The scariest place to be', 'is the same place as last year', 'Grow.'] },
  { n: 13, text: 'Excellence is to do a common thing in an uncommon way. Character, not circumstances, makes the man.', by: 'Booker T. Washington', tile: 'athlete', art: 712809 },
  { n: 14, text: 'You can beat 99% of people if you can master the shame of rejection, the boredom of repetition, and the pain of feedback.', by: 'Alex Hormozi', tile: 'athlete', art: 712794 },
];

const BASE = `* { margin: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1440px; overflow: hidden; position: relative; font-family: Jost, Arial, sans-serif; }
  .q { position: absolute; left: 110px; right: 110px; font: 400 104px/1.04 'Instrument Serif', Georgia, serif; letter-spacing: -.01em; text-align: center; text-wrap: balance; }
  .by { position: absolute; left: 0; right: 0; text-align: center; font: 400 54px/1 'Covered By Your Grace', cursive; letter-spacing: .03em; }
  .dd { position: absolute; pointer-events: none; }
  .dd svg { width: 100%; height: 100%; display: block; overflow: visible; }`;
const doodle = (svg, css) => `<div class="dd" style="${css}">${svg}</div>`;
const star = (c, o, css) => doodle(handStar(c, o), css);
const credit = (by) => (by === 'Unknown' ? '~ unknown' : `~ ${by}`);
// Hand-drawn dashed trail through points (a little wobble so it reads drawn, not plotted).
const trail = (pts, c, sw = 4) => `<svg viewBox="0 0 1080 1440" style="position:absolute;inset:0;width:1080px;height:1440px;pointer-events:none"><path d="M${pts.map((p) => p.join(' ')).join(' Q')}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="2 18"/></svg>`;

// Navy starry night (footer art): a shooting star streaks across the sky above the words.
const starry = (q) => `<style>${BASE}
  body { background: ${C.navy} url('${fileUrl(path.join(ASSETS, 'ftr-sky.webp'))}') center/cover; color: #fff; }
  .stars { position: absolute; inset: 0; background: url('${fileUrl(path.join(ASSETS, 'ftr-stars.webp'))}') center/cover; opacity: .9; }
  .veil { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 40% at 50% 58%, rgba(10,25,48,.78), rgba(10,25,48,.25) 75%); }
  .q { top: 600px; font-size: 112px; }
  .by { top: 1050px; color: ${C.sky}; }
</style><div class="stars"></div><div class="veil"></div>
${trail([[150, 470], [420, 250, 740, 300], [740, 300]], C.mist, 5)}
${star(C.sky, { pts: 4, fill: true, seed: 11 }, 'left:690px;top:230px;width:150px;height:150px')}
${star('#fff', { pts: 8, seed: 21, sw: 3 }, 'left:860px;top:150px;width:60px;height:60px')}
${star(C.mist, { pts: 4, seed: 5, sw: 3 }, 'left:900px;top:1180px;width:70px;height:70px')}
<div class="q">${esc(q.text)}</div><div class="by">${esc(credit(q.by))}</div>`;

// Off-white with a hand-drawn magic wand: sparkles spill from its tip in an arc around (never over) the words.
const wandSvg = `<svg viewBox="0 0 300 300"><g fill="none" stroke="${C.navy}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M40 262 L203 99 L222 118 L59 281 Z" fill="${C.navy}"/><path d="M203 99 L222 118 L236 104 L217 85 Z" fill="#fff"/></g></svg>`;
const wand = (q) => `<style>${BASE}
  body { background: ${C.cream}; color: ${C.navy}; }
  .q { top: 380px; font-size: 128px; }
  .by { top: 900px; }
</style>
${trail([[895, 1140], [760, 960, 560, 1050], [560, 1050]], C.sky, 5)}
${doodle(wandSvg, 'left:700px;top:1080px;width:300px;height:300px;transform:rotate(-8deg)')}
${star(C.sky, { pts: 4, fill: true, seed: 7 }, 'left:830px;top:980px;width:120px;height:120px')}
${star(C.navy, { pts: 8, seed: 12, sw: 3 }, 'left:640px;top:1000px;width:56px;height:56px')}
${star(C.sky, { pts: 4, seed: 3, sw: 3.4 }, 'left:470px;top:1060px;width:64px;height:64px')}
${star(C.sky, { pts: 4, fill: true, seed: 9 }, 'left:380px;top:1150px;width:38px;height:38px')}
${star(C.navy, { pts: 4, fill: true, seed: 2 }, 'left:120px;top:150px;width:70px;height:70px')}
<div class="q">${esc(q.text)}</div><div class="by">${esc(credit(q.by))}</div>`;

// Blue mist with a crescent moon and a hand-drawn constellation: stars that kept shining, joined up.
const moonSvg = `<svg viewBox="0 0 200 200"><path d="M128 22 C70 34 40 92 62 144 C80 184 132 196 170 172 C116 176 84 132 92 86 C98 54 112 34 128 22 Z" fill="${C.sky}" stroke="${C.navy}" stroke-width="4" stroke-linejoin="round"/></svg>`;
const constellation = (q) => {
  const pts = [[140, 1130], [300, 1210], [470, 1150], [610, 1260], [800, 1190]];
  const lines = `<svg viewBox="0 0 1080 1440" style="position:absolute;inset:0;width:1080px;height:1440px;pointer-events:none"><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.navy}" stroke-width="3" stroke-dasharray="10 12" stroke-linecap="round"/></svg>`;
  return `<style>${BASE}
  body { background: ${C.mist}; color: ${C.navy}; }
  .q { top: 360px; font-size: 136px; }
  .by { top: 900px; }
</style>
${doodle(moonSvg, 'left:800px;top:90px;width:190px;height:190px;transform:rotate(-12deg)')}
${star(C.navy, { pts: 4, seed: 15, sw: 3 }, 'left:120px;top:150px;width:60px;height:60px')}
${lines}
${pts.map(([x, y], i) => star(i === 3 ? C.sky : C.navy, { pts: i % 2 ? 4 : 8, fill: i !== 1, seed: 40 + i * 3, sw: 3 }, `left:${x - (i === 3 ? 50 : 28)}px;top:${y - (i === 3 ? 50 : 28)}px;width:${i === 3 ? 100 : 56}px;height:${i === 3 ? 100 : 56}px`)).join('\n')}
<div class="q">${esc(q.text)}</div><div class="by">${esc(credit(q.by))}</div>`;
};

// Round 2 (Mercedes 2026-11-02, her Pinterest favourites): vintage-collage quote posts. Public-domain Met art
// (assets/met, credits.json), quote on torn paper label strips or set small over a moody painting, sparkle stars as the magic.
const MET = (id) => fileUrl(path.join(HERE, 'assets', 'met', `met-${id}.jpg`));
const COLLAGE = `
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .strips { position: absolute; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
  .strip { background: #f4efe4; color: ${C.navy}; font: 400 78px/1 'Instrument Serif', Georgia, serif; padding: 12px 26px 16px; box-shadow: 0 6px 14px rgba(10,25,48,.22);
    clip-path: polygon(0 4%, 6% 0, 14% 5%, 30% 1%, 47% 4%, 63% 0, 80% 4%, 94% 1%, 100% 5%, 99% 52%, 100% 96%, 88% 100%, 71% 96%, 52% 100%, 33% 97%, 17% 100%, 3% 96%, 1% 50%); }
  .strip.sm { font: 400 46px/1 'Covered By Your Grace', cursive; letter-spacing: .03em; padding: 10px 22px 8px; }
  .small { position: absolute; left: 140px; right: 140px; text-align: center; color: #fff; font: 400 74px/1.08 'Instrument Serif', Georgia, serif; text-wrap: balance; text-shadow: 0 2px 18px rgba(10,25,48,.55); }`;
const strips = (lines, by, css, tilt = [-2, 1.5, -1, 2, -1.5]) => `<div class="strips" style="${css}">${lines.map((l, i) => `<div class="strip" style="transform:rotate(${tilt[i % tilt.length]}deg)">${esc(l)}</div>`).join('')}<div class="strip sm" style="transform:rotate(1deg)">${esc(credit(by))}</div></div>`;

// 1635 full-moon engraving (Claude Mellan) cut out on a navy sky, quote small underneath, sparkles around the moon.
const moon = (q) => `<style>${BASE}${COLLAGE}
  body { background: radial-gradient(ellipse 80% 60% at 50% 36%, #16284a, ${C.navy} 70%); }
  .mw { position: absolute; left: 64px; top: 40px; filter: drop-shadow(0 0 70px rgba(223,228,240,.35)); }
  .mw img { display: block; width: 1000px; clip-path: circle(438px at 476px 484px); }
  .small { top: 1010px; }
  .by { top: 1220px; color: ${C.sky}; }
</style><div class="mw"><img src="${MET(393543)}"></div>
${star('#fff', { pts: 4, fill: true, seed: 11 }, 'left:90px;top:120px;width:90px;height:90px')}
${star(C.sky, { pts: 8, seed: 21, sw: 3 }, 'left:930px;top:90px;width:70px;height:70px')}
${star(C.mist, { pts: 4, seed: 5, sw: 3 }, 'left:960px;top:860px;width:60px;height:60px')}
${star(C.sky, { pts: 4, fill: true, seed: 9 }, 'left:70px;top:840px;width:44px;height:44px')}
<div class="small">${esc(q.text)}</div><div class="by">${esc(credit(q.by))}</div>`;

// 1872 Kensett seascape with an 1889 hot-air-balloon trade card floating in the sky, quote on paper strips.
const balloon = (q) => `<style>${BASE}${COLLAGE}
  .bg { object-position: 38% center; }
  .bl { position: absolute; left: 590px; top: 80px; width: 400px; transform: rotate(6deg); clip-path: inset(2% 0 0 0); filter: drop-shadow(0 10px 16px rgba(10,25,48,.25)); }
</style><img class="bg" src="${MET(11321)}"><img class="bl" src="${fileUrl(path.join(HERE, 'assets', 'met', 'met-727249-cut.png'))}">
${star('#fff', { pts: 4, fill: true, seed: 7 }, 'left:500px;top:150px;width:90px;height:90px')}
${star(C.navy, { pts: 8, seed: 12, sw: 3 }, 'left:990px;top:400px;width:56px;height:56px')}
${star('#fff', { pts: 4, seed: 3, sw: 3.4 }, 'left:470px;top:560px;width:60px;height:60px')}
${strips(q.lines, q.by, 'left:70px;bottom:110px')}`;

// Ryder's "Under a Cloud" (c. 1900): a small boat sailing on under a dark cloud, quote on paper strips in the cloud
// (white text over the painting was too hard to read, Mercedes 2026-11-02), sparkles by the moon.
const sail = (q) => `<style>${BASE}${COLLAGE}
  .bg { object-position: 60% center; filter: saturate(.9); transform: scale(1.06); }
</style><img class="bg" src="${MET(11974)}">
${star('#fff', { pts: 4, fill: true, seed: 11 }, 'left:345px;top:690px;width:62px;height:62px')}
${star(C.sky, { pts: 8, seed: 21, sw: 3 }, 'left:220px;top:720px;width:48px;height:48px')}
${star('#fff', { pts: 4, seed: 5, sw: 3 }, 'left:490px;top:800px;width:40px;height:40px')}
${strips(q.lines, q.by, 'left:70px;top:130px')}`;

// Unknown author = quiet (Mercedes 2026-11-02): plain soft paper, soft muted ink, no art, one tiny sparkle.
// Credited quotes get the stronger vintage-collage tiles above.
const quiet = (q) => `<style>${BASE}
  body { background: #f3eee5; color: #4a4e66; }
  .q { top: 50%; transform: translateY(-50%); font-size: 84px; line-height: 1.12; left: 150px; right: 150px; }
  .by { bottom: 150px; font: 500 28px/1 Jost, Arial, sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #8f8a83; }
</style>
${star('#a9c7ea', { pts: 4, seed: 5, sw: 3 }, 'left:510px;top:200px;width:60px;height:60px')}
<div class="q">${esc(q.text)}</div><div class="by">unknown</div>`;

// Round 3 (Mercedes 2026-11-02): every quote the same way, "scroll stopping, whimsical, but not hard to read".
// One big whimsical vintage subject, the quote large in navy on a calm part of the art, the credit small and quiet
// (Unknown included: never emphasised), sparkle stars as the magic.
const WHIM = `
  .art { position: absolute; }
  .big { position: absolute; color: ${C.navy}; font: 400 98px/1.02 'Instrument Serif', Georgia, serif; letter-spacing: -.01em; text-wrap: balance; }
  .cr { position: absolute; color: ${C.navy}; opacity: .7; font: 400 40px/1 'Covered By Your Grace', cursive; letter-spacing: .03em; }`;
const cr = (by) => (by === 'Unknown' ? 'unknown' : by);

// Hokusai's tortoise hanging on a string (c. 1800), floating in sparkles on its own paper; quote below.
const tortoise = (q) => `<style>${BASE}${WHIM}
  body { background: #e9dcc0; }
  .art { left: -490px; top: -700px; width: 2000px; }
  .big { left: 90px; right: 90px; bottom: 150px; text-align: center; }
  .cr { left: 0; right: 0; bottom: 78px; text-align: center; }
</style><img class="art" src="${MET(57274)}">
${star(C.sky, { pts: 4, fill: true, seed: 7 }, 'left:220px;top:330px;width:84px;height:84px')}
${star(C.navy, { pts: 8, seed: 12, sw: 3 }, 'left:760px;top:250px;width:52px;height:52px')}
${star('#fff', { pts: 4, seed: 3, sw: 3.4 }, 'left:920px;top:330px;width:60px;height:60px')}
${star(C.sky, { pts: 4, seed: 9, sw: 3 }, 'left:150px;top:620px;width:46px;height:46px')}
<div class="big">${esc(q.text)}</div><div class="cr">${esc(cr(q.by))}</div>`;

// 1889 balloon trade card, cut out and huge, rising over Kensett's 1872 sea; quote large on the calm sky.
const balloon2 = (q) => `<style>${BASE}${WHIM}
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 38% center; }
  .art { left: 560px; top: 30px; width: 520px; transform: rotate(7deg); clip-path: inset(2% 0 0 0); filter: drop-shadow(0 14px 22px rgba(10,25,48,.28)); }
  .big { left: 80px; width: 520px; top: 130px; }
  .cr { left: 84px; top: 720px; }
</style><img class="bg" src="${MET(11321)}"><img class="art" src="${fileUrl(path.join(HERE, 'assets', 'met', 'met-727249-cut.png'))}">
${star('#fff', { pts: 4, fill: true, seed: 7 }, 'left:520px;top:860px;width:90px;height:90px')}
${star(C.navy, { pts: 8, seed: 12, sw: 3 }, 'left:440px;top:1000px;width:50px;height:50px')}
${star('#fff', { pts: 4, seed: 3, sw: 3.4 }, 'left:640px;top:1010px;width:56px;height:56px')}
<div class="big">${esc(q.text)}</div><div class="cr">${esc(cr(q.by))}</div>`;

// 1889 tightrope-walker trade card (Kimball "Pretty Athletes"), cut out, walking a hand-drawn rope across a soft sky.
const rope = (q) => `<style>${BASE}${WHIM}
  body { background: linear-gradient(#d9e2f1, #f4efe6 78%); }
  .art { left: 270px; top: 360px; width: 560px; filter: drop-shadow(0 14px 20px rgba(10,25,48,.22)); }
  .big { left: 70px; right: 70px; top: 80px; text-align: center; }
  .cr { left: 0; right: 0; bottom: 120px; text-align: center; }
</style>
<svg viewBox="0 0 1080 1440" style="position:absolute;inset:0;width:1080px;height:1440px"><path d="M-20 1150 Q545 1268 1100 1120" fill="none" stroke="${C.navy}" stroke-width="5" stroke-linecap="round"/></svg>
<img class="art" src="${fileUrl(path.join(HERE, 'assets', 'met', 'met-712792-cut.png'))}">
${star(C.sky, { pts: 4, fill: true, seed: 7 }, 'left:150px;top:520px;width:90px;height:90px')}
${star(C.navy, { pts: 8, seed: 12, sw: 3 }, 'left:880px;top:470px;width:52px;height:52px')}
${star('#fff', { pts: 4, fill: true, seed: 3 }, 'left:900px;top:720px;width:64px;height:64px')}
${star(C.sky, { pts: 4, seed: 9, sw: 3 }, 'left:120px;top:800px;width:46px;height:46px')}
<div class="big">${esc(q.text)}</div><div class="cr">${esc(cr(q.by))}</div>`;

// The full set (Mercedes 2026-11-02, "yes, make them all" after the balloon and the tightrope walker): one 1889
// Kimball "Pretty Athletes" trade-card woman per quote, cut out, standing under the quote on a soft sky, sparkles beside her.
const SKIES = ['linear-gradient(#d9e2f1, #f4efe6 78%)', 'linear-gradient(#cfe1f7, #f6f1e8 80%)', 'linear-gradient(#f4efe6, #e2e7f1)'];
const athlete = (q) => {
  const fs = q.text.length <= 60 ? 98 : q.text.length <= 100 ? 82 : 70;
  const side = [[150, 520, 84, C.sky, 4, true], [880, 470, 52, C.navy, 8, false], [900, 760, 62, '#fff', 4, true], [120, 860, 46, C.sky, 4, false]];
  return `<style>${BASE}${WHIM}
  body { background: ${SKIES[q.n % 3]}; display: flex; flex-direction: column; align-items: center; padding: 80px 70px 70px; }
  .big { position: static; text-align: center; font-size: ${fs}px; }
  .fig { flex: 1; min-height: 0; width: 100%; display: flex; justify-content: center; align-items: flex-end; padding-top: 40px; }
  .fig img { max-height: 100%; max-width: 640px; filter: drop-shadow(0 14px 20px rgba(10,25,48,.22)); }
  .cr { position: static; margin-top: 34px; }
</style>
${side.map(([x, y, w, c, pts, fill], i) => star(c, { pts, fill, seed: q.n * 7 + i, sw: 3 }, `left:${x}px;top:${y}px;width:${w}px;height:${w}px`)).join('\n')}
<div class="big">${esc(q.text)}</div>
<div class="fig"><img src="${fileUrl(path.join(HERE, 'assets', 'met', `met-${q.art}-cut.png`))}"></div>
<div class="cr">${esc(cr(q.by))}</div>`;
};

// Round 5 (Mercedes 2026-11-02): no pin-up women. Collage scenes from her new pins: painted landscapes, torn paper,
// and the quote built into the scene as an object (a winding ribbon, a taped note, a sticker). Readable first.
const torn = (seed, y0, amp = 26, n = 28) => { // jagged top edge polygon (percent x, px y)
  let r = seed; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: n + 1 }, (_, i) => `${(i / n * 100).toFixed(1)}% ${Math.round(y0 + (rnd() - .5) * amp + Math.sin(i / 3) * amp * .6)}px`);
  return `polygon(${pts.join(', ')}, 100% 100%, 0 100%)`;
};
const tag = (by, css) => `<div class="tag" style="${css}">${esc(cr(by))}</div>`;
const SCENE = `
  .layer { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .tag { position: absolute; background: #f4efe6; color: ${C.navy}; font: 400 38px/1 'Covered By Your Grace', cursive; letter-spacing: .03em; padding: 10px 22px 6px; box-shadow: 0 4px 10px rgba(10,25,48,.25); }`;

// Ribbon: starry night above, a torn strip of Van Gogh's Irises below, the quote riding a winding ribbon across both.
const ribbon = (q) => {
  const d = 'M -60 520 C 160 380, 330 420, 420 600 S 600 900, 760 820 S 1000 640, 1140 760';
  const d2 = 'M -60 1010 C 200 900, 420 1120, 640 1060 S 960 900, 1140 980';
  return `<style>${BASE}${SCENE}
  body { background: ${C.navy}; }
  .tp { font: 700 50px/1 Jost, Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; fill: ${C.navy}; }
</style>
<div class="layer" style="background-image:url('${fileUrl(path.join(ASSETS, 'ftr-sky.webp'))}')"></div>
<div class="layer" style="background-image:url('${fileUrl(path.join(ASSETS, 'ftr-stars.webp'))}');opacity:.9"></div>
<div class="layer" style="background:#efe6d3;clip-path:${torn(3, 690, 30)}"></div>
<div class="layer" style="background-image:url('${MET(436528)}');background-position:50% 70%;clip-path:${torn(3, 706, 30)}"></div>
<svg viewBox="0 0 1080 1440" style="position:absolute;inset:0;width:1080px;height:1440px">
  <defs><path id="r1" d="${d}"/><path id="r2" d="${d2}"/></defs>
  <g style="filter:drop-shadow(0 8px 12px rgba(10,25,48,.35))">
    <path d="${d}" fill="none" stroke="#7f9ea6" stroke-width="104" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#e7ecef" stroke-width="80" stroke-linecap="round"/>
    <path d="${d2}" fill="none" stroke="#7f9ea6" stroke-width="104" stroke-linecap="round"/><path d="${d2}" fill="none" stroke="#e7ecef" stroke-width="80" stroke-linecap="round"/>
  </g>
  <text class="tp" dy="17"><textPath href="#r1" startOffset="50%" text-anchor="middle">${esc(q.ribbon[0])}</textPath></text>
  <text class="tp" dy="17"><textPath href="#r2" startOffset="50%" text-anchor="middle">${esc(q.ribbon[1])}</textPath></text>
</svg>
${star('#fff', { pts: 4, fill: true, seed: 7 }, 'left:800px;top:150px;width:80px;height:80px')}
${star(C.sky, { pts: 8, seed: 12, sw: 3 }, 'left:130px;top:200px;width:56px;height:56px')}
<div style="position:absolute;left:80px;bottom:150px;transform:rotate(-5deg);font:800 150px/1 Jost,Arial,sans-serif;text-transform:uppercase;color:${C.navy};-webkit-text-stroke:34px #f6f1e6;paint-order:stroke fill;filter:drop-shadow(0 10px 14px rgba(10,25,48,.35))">${esc(q.ribbon[2])}</div>
${tag(q.by, 'right:70px;bottom:80px;transform:rotate(-2deg)')}`;
};

// Taped note: a handwritten paper note taped over a painted forest (Durand, In the Woods, 1855).
const note = (q) => `<style>${BASE}${SCENE}
  .note { position: absolute; left: 110px; right: 110px; top: 470px; background: #f6f1e6; padding: 90px 70px 80px; transform: rotate(-1.5deg);
    box-shadow: 0 18px 30px rgba(10,25,48,.35); clip-path: polygon(0 1%, 8% 0, 22% 1.2%, 40% .3%, 58% 1.4%, 77% .2%, 92% 1%, 100% 0, 99.4% 30%, 100% 64%, 99.2% 100%, 80% 99%, 61% 100%, 42% 98.8%, 24% 100%, 7% 99%, 0 100%, .6% 60%); }
    .note p { text-wrap: balance; color: ${C.navy}; font: 400 72px/1.18 'Covered By Your Grace', cursive; letter-spacing: .02em; text-align: center; }
  .note small { display: block; margin-top: 34px; text-align: center; color: ${C.navy}; opacity: .7; font: 400 38px/1 'Covered By Your Grace', cursive; }
  .tape { position: absolute; left: 400px; top: calc(var(--nt) - 40px); width: 280px; height: 86px; background: rgba(255,255,255,.62); transform: rotate(2deg); box-shadow: 0 2px 6px rgba(10,25,48,.12); }
</style>
<div class="layer" style="background-image:url('${MET(q.bg || 10790)}');background-position:${q.bgPos || '50% 40%'};background-size:${q.bgSize || 'cover'}"></div>
<div class="note" style="top:${q.noteTop || 470}px"><p>${esc(q.text)}</p><small>${esc(cr(q.by))}</small></div><div class="tape" style="--nt:${q.noteTop || 470}px"></div>
${star('#fff', { pts: 4, fill: true, seed: 7 }, 'left:900px;top:640px;width:70px;height:70px')}
${star(C.sky, { pts: 8, seed: 12, sw: 3 }, 'left:150px;top:1150px;width:56px;height:56px')}`;

// Sticker: big chunky words with a thick paper outline, stuck on Van Gogh's Wheat Field with Cypresses.
const sticker = (q) => `<style>${BASE}${SCENE}
  .st { position: absolute; left: 70px; right: 70px; top: ${q.top || '50%'}; transform: translateY(-52%) rotate(-3deg); text-align: center;
    font: ${q.script ? `${q.script === 'Molle' ? 'italic ' : ''}400 ${q.fs || 112}px/1.12 '${q.script}', cursive;` : `800 ${q.fs || 118}px/1.06 Jost, Arial, sans-serif; text-transform: uppercase; letter-spacing: -.01em;`} color: ${q.script ? '#2f7fe0' : C.navy}; text-wrap: balance;
    -webkit-text-stroke: ${q.script ? 26 : 30}px #fbf8f1; paint-order: stroke fill; filter: drop-shadow(0 10px 14px rgba(10,25,48,.35)); }
</style>
<div class="layer" style="background-image:url('${MET(q.bg || 436535)}');background-position:${q.bgPos || '30% center'};background-size:${q.bgSize || 'auto 112%'}"></div>
<div class="st">${esc(q.text)}</div>
${star('#fff', { pts: 4, fill: true, seed: 7 }, q.top ? 'left:880px;top:80px;width:72px;height:72px' : 'left:850px;top:180px;width:80px;height:80px')}
${star(C.sky, { pts: 8, seed: 21, sw: 3 }, 'left:130px;top:1120px;width:60px;height:60px')}
${tag(q.by, 'left:50%;bottom:90px;transform:translateX(-50%) rotate(2deg)')}`;

// Round 6 (Mercedes 2026-11-02, her Van Gogh / painted-meadow / mountain collage pins): several public-domain paintings
// cut into soft blobs and layered edge to edge, the quote on its own cut-out patch in the middle, in her picked scripts.
const blob = (cx, cy, rx, ry, seed, n = 9, wob = .22) => { // smooth closed blob path
  let r = seed; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, k = 1 + (rnd() - .5) * wob * 2; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M ${mid(pts[n - 1], pts[0]).map(Math.round).join(' ')}`;
  pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % n]); d += ` Q ${p.map(Math.round).join(' ')} ${m.map(Math.round).join(' ')}`; });
  return d + ' Z';
};
const ART = { wheat: [436535, 4000, 3184], olive: [437998, 3811, 3040], orchard: [436527, 2985, 4000], irises: [436528, 4000, 3172] };
const artUrl = (k) => (k === 'stars' ? fileUrl(path.join(ASSETS, 'ftr-sky.webp')) : MET(ART[k][0]));
const artSize = (k) => (k === 'stars' ? [1672, 941] : ART[k].slice(1));
// piece: [art, cx, cy, rx, ry, seed, fx, fy, zoom] — fx/fy = point of the painting (0-1) shown at the blob centre
const collage = (q) => {
  const keys = ['stars', 'olive', 'orchard', 'irises', 'wheat'];
  const FOCUS = { irises: [.42, .2, 2.4], stars: [.42, .42, 1.6] }; // flowers only (no vase), the swirl (no plain navy)
  const pieces = q.pieces.map((p) => { const k = keys[(keys.indexOf(p[0]) + q.n) % keys.length]; return FOCUS[k] ? [k, ...p.slice(1, 6), ...FOCUS[k]] : [k, ...p.slice(1)]; });
  const defs = pieces.map(([, cx, cy, rx, ry, sd], i) => `<clipPath id="c${i}"><path d="${blob(cx, cy, rx, ry, sd, 13, .3)}"/></clipPath>`).join('');
  const imgs = pieces.map(([k, cx, cy, rx, ry, , fx = .5, fy = .5, zoom = 1], i) => {
    const [w0, h0] = artSize(k); const w = Math.max(rx, ry) * 2.6 * zoom * (w0 > h0 ? w0 / h0 : 1); const h = w * h0 / w0;
    return `<g clip-path="url(#c${i})" filter="url(#sh)"><image href="${artUrl(k)}" x="${Math.round(cx - w * fx)}" y="${Math.round(cy - h * fy)}" width="${Math.round(w)}" height="${Math.round(h)}"/></g>`;
  }).join('');
  const py = q.patchY || 720, pry = q.patchRy || 300;
  const patch = blob(540, py, 460, pry, q.n * 13 + 5, 14, .14);
  const script = q.script || 'Lily Script One';
  return `<style>${BASE}${SCENE}
  body { background: #c9b98f; }
  .st { position: absolute; left: 200px; right: 200px; top: ${py}px; transform: translateY(-50%) rotate(-2deg); text-align: center; text-wrap: balance;
    font: ${script === 'Molle' ? 'italic ' : ''}${script === 'Sansita Swashed' ? 900 : script === 'Oleo Script' ? 700 : 400} ${q.fs || 96}px/1.14 '${script}', cursive; color: #2f7fe0; -webkit-text-stroke: 16px #fbf8f1; paint-order: stroke fill; }
</style>
<svg viewBox="0 0 1080 1440" style="position:absolute;inset:0;width:1080px;height:1440px">
  <defs>${defs}<filter id="sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#0a1930" flood-opacity=".45"/></filter></defs>
  <image href="${artUrl('wheat')}" x="-700" y="-200" width="2400" height="1910"/>
  ${imgs}
  <path d="${patch}" fill="#f4efe4" filter="url(#sh)"/>
</svg>
${star('#f3d36b', { pts: 4, fill: true, seed: 7 }, 'left:860px;top:150px;width:90px;height:90px')}
${star('#fff', { pts: 4, seed: 12, sw: 3 }, 'left:120px;top:250px;width:60px;height:60px')}
${star('#f3d36b', { pts: 4, fill: true, seed: 5 }, 'left:150px;top:1180px;width:70px;height:70px')}
${star('#fff', { pts: 8, seed: 21, sw: 3 }, 'left:900px;top:1230px;width:56px;height:56px')}
<div class="st" data-fit="${Math.round(pry * 1.25)}">${esc(q.text)}</div>
${tag(q.by, `left:50%;top:${py + pry - 30}px;transform:translateX(-50%) rotate(2deg)`)}`;
};
const PIECES = [
  ['stars', 250, 180, 420, 280, 3, .45, .5, 1.1], ['olive', 850, 170, 360, 260, 7, .5, .25, 1.2], ['orchard', 120, 600, 300, 340, 11, .55, .3, 1.4],
  ['irises', 960, 620, 280, 320, 17, .45, .45, 1.8], ['wheat', 280, 1150, 420, 320, 23, .5, .8, 1.1], ['stars', 860, 1120, 360, 300, 29, .3, .45, 1.2],
  ['olive', 560, 1400, 520, 200, 31, .5, .8, 1.1], ['orchard', 1010, 1390, 220, 200, 37, .5, .75, 1.3], ['irises', 60, 1380, 220, 220, 41, .4, .3, 1.6],
];

// Final set (Mercedes 2026-11-02, "just make the rest considering my inspiration": pink Van Gogh village, meadow with
// a wavy label, ransom letters over mountains, small serif on a painted hill). One bright painting full-bleed, a soft
// dreamy wash, the quote small and calm in one of four text styles, gold star stickers, small credit. Fonts vary.
const goldStar = (x, y, w, rot) => `<svg class="gs" viewBox="0 0 100 100" style="left:${x}px;top:${y}px;width:${w}px;height:${w}px;transform:rotate(${rot}deg)"><defs><linearGradient id="g${x}${y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc84"/><stop offset=".55" stop-color="#d9ae45"/><stop offset="1" stop-color="#b78a2c"/></linearGradient></defs><path d="M50 6 L62 37 L95 38 L69 58 L79 91 L50 72 L21 91 L31 58 L5 38 L38 37 Z" fill="url(#g${x}${y})" stroke="#a87d24" stroke-width="2" stroke-linejoin="round"/></svg>`;
const STARS = [[80, 120, 84, -12], [920, 90, 70, 18], [110, 930, 66, 10], [900, 1010, 80, -20], [500, 1200, 74, 8], [120, 1320, 60, -6], [930, 1330, 66, 22]];
const RANSOM = ['#f3e9d2', '#e8d3c0', '#cfd8e6', '#e9d9a8', '#d7e2cf', '#f1d6dc'];
const RFONTS = [["'Abril Fatface'", 400], ["'Alfa Slab One'", 400], ["'DM Serif Display'", 400], ["Fraunces", 600], ["Gloock", 400]];
const RCOL = ['#0a1930', '#7a3b2e', '#2f5d3a', '#2f4f86', '#8a5a14'];
const dreamy = (q) => {
  const [art, pos] = q.paint;
  const font = q.font || "'Instrument Serif'";
  let text;
  if (q.style === 'strips') text = `<div class="fit strips" style="font-family:${font}"><span>${esc(q.text)}</span></div>`;
  else if (q.style === 'plain') text = `<div class="fit plain" style="font-family:${font}">${esc(q.text)}</div>`;
  else if (q.style === 'label') text = `<div class="fit label" style="font-family:${font}">${esc(q.text)}</div>`;
  else { let i = 0; text = `<div class="fit ransom">${q.text.split(' ').map((w) => `<span class="w">${[...w].map((ch) => { i++; const [f, wt] = RFONTS[(i * 7 + q.n) % RFONTS.length]; return `<span class="l" style="background:${RANSOM[(i * 5 + q.n) % RANSOM.length]};color:${RCOL[(i * 3) % RCOL.length]};font-family:${f};font-weight:${wt};transform:rotate(${((i * 37) % 11) - 5}deg) translateY(${((i * 13) % 7) - 3}px)">${esc(ch)}</span>`; }).join('')}</span>`).join(' ')}</div>`; }
  return `<style>${BASE}${SCENE}
  .paint { position: absolute; inset: 0; background: url('${typeof art === 'number' ? MET(art) : fileUrl(path.join(HERE, 'assets', 'photos', art + '.jpg'))}') ${pos}/${q.size || (typeof art !== 'number' ? 'cover' : [436527, 437980, 437307].includes(art) ? '124% auto' : 'auto 118%')} no-repeat; filter: saturate(1.12) brightness(1.06); }
  .wash { position: absolute; inset: 0; background: linear-gradient(rgba(255,232,236,.30), rgba(255,246,232,.10) 55%, rgba(255,255,255,0)); }
  .glow { position: absolute; left: 0; right: 0; top: 200px; height: 700px; background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,246,238,.82), rgba(250,246,238,0) 74%); }
  .box { position: absolute; left: 130px; right: 130px; top: 230px; height: 640px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
  .fit { position: relative; width: 100%; max-height: 500px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .strips span { line-height: 1.5; color: ${C.navy}; background: #f7f2e7; padding: 4px 16px; -webkit-box-decoration-break: clone; box-decoration-break: clone; border-radius: 6px; box-shadow: 0 3px 8px rgba(10,25,48,.18); }
  .strips { display: block; font-size: 64px; padding-top: 40px; }
  .plain { font-size: 72px; line-height: 1.12; color: #16261a; text-wrap: balance; text-shadow: 0 0 18px rgba(250,246,238,.9), 0 0 4px rgba(250,246,238,.8); }
  .label { font-size: 52px; line-height: 1.2; letter-spacing: .06em; text-transform: uppercase; color: #1d1d1d; text-wrap: balance; background: #f8f4ec; padding: 50px 96px; border-radius: 48% 52% 46% 54% / 60% 40% 60% 40%; transform: rotate(-4deg); box-shadow: 0 8px 18px rgba(10,25,48,.28); width: auto; max-width: 100%; }
  .ransom { font-size: 76px; flex-direction: row; flex-wrap: wrap; align-content: center; gap: 14px 30px; }
  .ransom .w { display: inline-flex; white-space: nowrap; }
  .ransom .l { display: inline-block; font-size: 1em; line-height: 1; padding: 6px 6px 8px; margin: 0 1px; box-shadow: 0 2px 5px rgba(10,25,48,.25); }
  .gs { position: absolute; filter: drop-shadow(0 4px 5px rgba(10,25,48,.3)); }
</style><div class="paint"></div><div class="wash"></div>${q.style === 'plain' ? '<div class="glow"></div>' : ''}
${STARS.map(([x, y, w, r]) => goldStar(x, y, w, r)).join('')}
<div class="box">${text}${tag(q.by, 'position:static;margin-top:34px;transform:rotate(-2deg)')}</div>`;
};
const W = 436535, O = 437998, F = 436527, Y = 437980, S = 11321;
const DREAMY = { // one background per post, real variety (Mercedes 2026-11-02: "stuck on Tuscany"): photos + Van Gogh + Hokusai
  1: { style: 'strips', paint: [W, '30% 20%'], font: "'Instrument Serif'" },
  2: { style: 'label', paint: [Y, '70% 30%'], font: "'Cormorant Garamond'" },
  3: { style: 'plain', paint: ['mountain-sunrise-pink-0', 'center'], font: "Gloock" },
  4: { style: 'label', paint: [O, '70% 30%'], font: "Italiana" },
  5: { style: 'strips', paint: ['sunflower-field-1', 'center 30%'], font: "Fraunces" },
  6: { style: 'strips', paint: ['poppy-field-0', 'center'], font: "Fraunces" },
  7: { style: 'strips', paint: ['pink-sunset-clouds-1', 'center'], font: "'DM Serif Display'" },
  8: { style: 'label', paint: ['clouds-blue-sky-meadow-0', 'center'], font: "'Cormorant Garamond'" },
  9: { style: 'plain', paint: [437683, '68% center'], font: "'DM Serif Display'" },
  10: { style: 'ransom', paint: ['poppy-field-2', 'center'] },
  11: { style: 'ransom', paint: ['pink-sunset-clouds-0', 'center'] },
  12: { style: 'label', paint: ['sunflower-field-2', 'center 70%'], font: "Italiana" },
  13: { style: 'strips', paint: [45434, '62% 40%'], size: 'auto 125%', font: "Gloock" },
  14: { style: 'strips', paint: [437307, '50% 15%'], size: '140% auto', font: "'Instrument Serif'" },
};

const TILES = { starry, wand, constellation, moon, balloon, sail, quiet, tortoise, balloon2, rope, athlete, ribbon, note, sticker, collage, dreamy };
const only = process.argv.slice(2).map(Number);
const list = QUOTES.map((q) => (DREAMY[q.n] ? { ...q, ...DREAMY[q.n], tile: 'dreamy' } : q)).filter((q) => q.tile && (!only.length || only.includes(q.n)));

mkdirSync(OUT, { recursive: true });
mkdirSync(EXPORTS, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 1 });
for (const q of list) {
  const f = path.join(OUT, `.quote-${q.n}.html`);
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"></head><body>${TILES[q.tile](q)}</body></html>`);
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => { for (const el of document.querySelectorAll('[data-fit], .fit')) { const max = el.dataset.fit ? +el.dataset.fit : 480; let fs = parseFloat(getComputedStyle(el).fontSize); while ((el.scrollHeight > max || el.scrollWidth > el.clientWidth) && fs > 40) { fs -= 2; el.style.fontSize = fs + 'px'; } } });
  const png = path.join(OUT, `quote-${q.n}.png`);
  await pg.screenshot({ path: png });
  copyFileSync(png, path.join(EXPORTS, `quote-${q.n}.png`));
  console.log(`image  quote-${q.n}`);
}
await browser.close();
