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
  { n: 1, text: 'The only man who never makes mistakes is the man who never does anything.', by: 'Theodore Roosevelt' },
  { n: 2, text: 'It is not in the stars to hold our destiny but in ourselves.', by: 'Unknown', tile: 'starry' },
  { n: 3, text: 'If you can’t explain it simply, you don’t understand it well enough.', by: 'Unknown' },
  { n: 4, text: 'If you look for perfection, you’ll never be content.', by: 'Leo Tolstoy, Anna Karenina' },
  { n: 5, text: 'Of course it’s hard. It’s supposed to be hard. If it’s easy, everyone would do it. Hard is what makes it great.', by: 'A League of Their Own' },
  { n: 6, text: 'If you’re making mistakes, it means you’re out there doing something.', by: 'Neil Gaiman' },
  { n: 7, text: 'What a privilege it is to be exhausted by the work you once dreamed of.', by: 'Unknown' },
  { n: 8, text: 'The greatest legacy is showing others what’s possible.', by: 'Unknown' },
  { n: 9, text: 'To inspire people, don’t show them your superpowers. Show them theirs.', by: 'Alexander den Heijer' },
  { n: 10, text: 'A curious mind constantly uncovers magic.', by: 'Unknown', tile: 'wand' },
  { n: 11, text: 'Enthusiasm is common. Endurance is rare.', by: 'Angela Duckworth', tile: 'constellation' },
  { n: 12, text: 'The scariest place to be is the same place as last year. Grow.', by: 'Unknown' },
  { n: 13, text: 'Excellence is to do a common thing in an uncommon way. Character, not circumstances, makes the man.', by: 'Booker T. Washington' },
  { n: 14, text: 'You can beat 99% of people if you can master the shame of rejection, the boredom of repetition, and the pain of feedback.', by: 'Alex Hormozi' },
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

const TILES = { starry, wand, constellation };
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
