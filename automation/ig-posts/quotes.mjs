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
const FONTS = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;700&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block';
const C = { cream: '#f7f3ec', navy: '#0a1930', sky: '#4da3ff', mist: '#dfe4f0' };

// The 14 quotes (planner cards "Quote 1" to "Quote 14"); credit = the checked author, or Unknown.
export const QUOTES = [
  { n: 1, text: 'The only man who never makes mistakes is the man who never does anything.', by: 'Theodore Roosevelt', tile: 'athlete', art: 712795 },
  { n: 2, text: 'It is not in the stars to hold our destiny but in ourselves.', by: 'Unknown', tile: 'athlete', art: 712808 },
  { n: 3, text: 'If you can’t explain it simply, you don’t understand it well enough.', by: 'Unknown', tile: 'athlete', art: 712799 },
  { n: 4, text: 'If you look for perfection, you’ll never be content.', by: 'Leo Tolstoy, Anna Karenina', tile: 'athlete', art: 712807 },
  { n: 5, text: 'Of course it’s hard. It’s supposed to be hard. If it’s easy, everyone would do it. Hard is what makes it great.', by: 'A League of Their Own', tile: 'athlete', art: 712793 },
  { n: 6, text: 'If you’re making mistakes, it means you’re out there doing something.', by: 'Neil Gaiman', tile: 'athlete', art: 712790 },
  { n: 7, text: 'What a privilege it is to be exhausted by the work you once dreamed of.', by: 'Unknown', tile: 'note', bg: 12162, bgPos: '15% center', bgSize: 'auto 104%', noteTop: 120 },
  { n: 8, text: 'The greatest legacy is showing others what’s possible.', by: 'Unknown', tile: 'sticker', serif: true, fs: 150 },
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
  .st { position: absolute; left: 70px; right: 70px; top: 50%; transform: translateY(-52%) rotate(-3deg); text-align: center;
    font: ${q.serif ? `400 ${q.fs || 150}px/1 'Instrument Serif', Georgia, serif; letter-spacing: -.005em;` : `800 ${q.fs || 118}px/1.06 Jost, Arial, sans-serif; text-transform: uppercase; letter-spacing: -.01em;`} color: ${C.navy}; text-wrap: balance;
    -webkit-text-stroke: 30px #f6f1e6; paint-order: stroke fill; filter: drop-shadow(0 10px 14px rgba(10,25,48,.35)); }
</style>
<div class="layer" style="background-image:url('${MET(436535)}');background-position:30% center;background-size:auto 112%"></div>
<div class="st">${esc(q.text)}</div>
${star('#fff', { pts: 4, fill: true, seed: 7 }, 'left:850px;top:180px;width:80px;height:80px')}
${star(C.sky, { pts: 8, seed: 21, sw: 3 }, 'left:130px;top:1120px;width:60px;height:60px')}
${tag(q.by, 'left:50%;bottom:90px;transform:translateX(-50%) rotate(2deg)')}`;

const TILES = { starry, wand, constellation, moon, balloon, sail, quiet, tortoise, balloon2, rope, athlete, ribbon, note, sticker };
const only = process.argv.slice(2).map(Number);
const list = QUOTES.filter((q) => q.tile && (!only.length || only.includes(q.n)));

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
  const png = path.join(OUT, `quote-${q.n}.png`);
  await pg.screenshot({ path: png });
  copyFileSync(png, path.join(EXPORTS, `quote-${q.n}.png`));
  console.log(`image  quote-${q.n}`);
}
await browser.close();
