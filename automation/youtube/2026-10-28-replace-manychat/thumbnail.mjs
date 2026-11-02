// YouTube thumbnail options for YouTube 1 (1280×720), in the style working on YouTube now (Mercedes's reference,
// 2026-11-02: Modern Millie's channel): her centred, big and warm on her own softly blurred set, real-looking objects
// around her shoulders (glossy app tiles, phones, notification cards), two to four words in a heavy rounded white sans
// with a soft shadow. Not the site brand.
// Stills MUST be tone-mapped from the iPhone HLG footage (same TM as roughcut.mjs) or she looks pale and grey.
//   node thumbnail.mjs <dir with sdr-2043.jpg, cut-2043.png, sdr-2054.jpg, cut-2054.png> [outDir]
//   → thumb-a.png (two phones), thumb-b.png (app tiles), thumb-c.png (notification stack)
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { launch } from '../../carousels/lib/common.mjs';

const [src, out = src] = process.argv.slice(2);
const u = (f) => pathToFileURL(path.join(src, f)).href;

// headline: "Bye" in a script, MANYCHAT in a clean heavy sans (Mercedes 2026-11-02: the tight Poppins 900 was hard
// to read and she hated the outlined/boxed versions); pick the script with SCRIPT=<name>; she chose Sacramento (2026-11-02)
const SCRIPTS = { sacramento: ['Sacramento', 400], pacifico: ['Pacifico', 400], yellowtail: ['Yellowtail', 400], kaushan: ['Kaushan Script', 400],
  dancing: ['Dancing Script', 700], satisfy: ['Satisfy', 400], damion: ['Damion', 400] };
const SCRIPT = SCRIPTS[process.env.SCRIPT || 'sacramento'];

const page = (body) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800;900&family=${SCRIPT[0].replace(/ /g, '+')}:wght@${SCRIPT[1]}&family=Inter:wght@500;600;700&display=block">
<style>*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:720px;overflow:hidden;background:#000}
.abs{position:absolute}
.big{font-family:Poppins,sans-serif;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:.95;white-space:nowrap;
  text-shadow:0 4px 0 rgba(0,0,0,.25),0 10px 34px rgba(0,0,0,.55)}

.big{font-weight:800;letter-spacing:.01em}
.bye{font-family:'${SCRIPT[0]}',cursive;font-weight:${SCRIPT[1]};font-size:1.7em;letter-spacing:0;margin-right:.18em;display:inline-block;rotate:-6deg;translate:0 .1em;text-shadow:0 3px 10px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.6)}
.phone{position:absolute;width:250px;height:510px;border-radius:44px;background:#111;padding:11px;
  box-shadow:0 30px 60px rgba(0,0,0,.5),inset 0 0 0 2px #3a3a3a}
.scr{width:100%;height:100%;border-radius:34px;background:#f2f2f7;overflow:hidden;position:relative;font-family:Inter,sans-serif;color:#111}
.island{position:absolute;left:50%;top:10px;width:84px;height:24px;margin-left:-42px;border-radius:14px;background:#000}
.tile{position:absolute;border-radius:28%;box-shadow:0 26px 50px rgba(0,0,0,.45),inset 0 -10px 22px rgba(0,0,0,.18),inset 0 8px 18px rgba(255,255,255,.35)}
.note{position:absolute;width:430px;padding:16px 18px;border-radius:24px;background:rgba(250,250,252,.93);font-family:Inter,sans-serif;
  color:#111;box-shadow:0 14px 34px rgba(0,0,0,.35);display:flex;gap:14px;align-items:center}
.note .ic{width:46px;height:46px;border-radius:12px;flex:none}
.note b{display:block;font-size:19px;font-weight:700}.note span{font-size:18px;color:#3c3c43}
.note i{position:absolute;right:18px;top:14px;font-style:normal;font-size:15px;color:#8a8a8e}
</style></head><body>${body}</body></html>`;

// her on her own set: the blurred frame behind, the sharp cut-out on top, same placement (portrait-mode look)
const set = (id, left, top, h) => `
<img class="abs" src="${u(`sdr-${id}.jpg`)}" style="left:${left - h * .25}px;top:${top - h * .1}px;height:${h * 1.3}px;filter:blur(16px) brightness(.92) saturate(1.1)">
<img class="abs" src="${u(`cut-${id}.png`)}" style="left:${left}px;top:${top}px;height:${h}px">`;

// a subscription screen, like the phone's own Settings > Subscriptions page
const subScreen = (app, price, ok) => `<div class="scr"><div class="island"></div>
<div style="padding:56px 18px 0;font-size:15px;color:#8a8a8e;font-weight:600">SUBSCRIPTION</div>
<div style="margin:10px 12px;background:#fff;border-radius:16px;padding:18px 16px">
<div style="font-size:22px;font-weight:700">${app}</div>
<div style="font-size:15px;color:#8a8a8e;margin-top:4px">Monthly</div>
<div style="font-family:Poppins;font-weight:800;font-size:64px;margin-top:22px;letter-spacing:-.03em;color:${ok ? '#1a9e4b' : '#111'}">${price}</div>
<div style="font-size:16px;color:#8a8a8e">per month</div></div>
<div style="margin:10px 12px;background:#fff;border-radius:16px;padding:16px;font-size:17px;font-weight:600;color:${ok ? '#1a9e4b' : '#d70015'}">${ok ? 'Active ✓' : 'Cancel Subscription'}</div></div>`;

// Claude's mark: a starburst of tapered rays on its orange tile
const claudeTile = (x, y, s, rot) => {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 + (i % 2 ? 7 : 0), L = i % 3 === 0 ? .36 : .3;
    return `<path d="M0 -${s * .05} L${s * L} 0 L0 ${s * .05} Z" fill="#fff" transform="rotate(${a})"/>`;
  }).join('');
  return `<div class="tile" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:linear-gradient(160deg,#f08a62,#d4613a);rotate:${rot}deg">
<svg width="${s}" height="${s}"><g transform="translate(${s / 2} ${s / 2})">${rays}<circle r="${s * .06}" fill="#fff"/></g></svg></div>`;
};
// a DM tile: paper plane on Instagram's gradient
const dmTile = (x, y, s, rot) => `<div class="tile" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:radial-gradient(circle at 25% 110%,#fdc468 0%,#fa7e1e 25%,#d62976 55%,#962fbf 80%,#4f5bd5 100%);rotate:${rot}deg">
<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="M24 50 L78 26 L62 78 L50 56 Z M50 56 L78 26" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></svg></div>`;

const GLYPH = {
  ig: '<rect x="12" y="12" width="22" height="22" rx="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="23" cy="23" r="5" fill="none" stroke="#fff" stroke-width="3"/>',
  dm: '<path d="M12 24 L34 14 L28 34 L23 26 Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>',
  mail: '<rect x="11" y="15" width="24" height="17" rx="3" fill="none" stroke="#fff" stroke-width="3"/><path d="M12 17 L23 25 L34 17" fill="none" stroke="#fff" stroke-width="3"/>',
  usd: '<text x="23" y="32" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="24" fill="#fff">$</text>',
};
const note = (top, left, icon, glyph, title, text, when = 'now') =>
  `<div class="note" style="top:${top}px;left:${left}px"><div class="ic" style="background:${icon}"><svg width="46" height="46">${GLYPH[glyph]}</svg></div><div><b>${title}</b><span>${text}</span></div><i>${when}</i></div>`;
const IG = 'radial-gradient(circle at 25% 110%,#fdc468,#fa7e1e 25%,#d62976 55%,#962fbf 80%,#4f5bd5)';

const designs = {
  // A: two phones (the 0 → 10,000 followers layout): ManyChat's bill on the left, hers on the right
  a: page(`${set('2043', 28, 10, 860)}
<div class="phone" style="left:40px;top:200px;rotate:-11deg">${subScreen('ManyChat Pro', '$39', false)}</div>
<div class="phone" style="left:990px;top:200px;rotate:10deg">${subScreen('My DM tool', '$6', true)}</div>
<div class="abs big" style="left:0;right:0;top:34px;text-align:center;font-size:110px"><span class="bye">Bye</span>MANYCHAT</div>`),

  // B: glossy app tiles either side of her, the price line across the bottom
  b: page(`${set('2054', 28, -20, 860)}
${claudeTile(70, 120, 270, -9)}${dmTile(950, 110, 270, 9)}
<div class="abs big" style="left:0;right:0;bottom:22px;text-align:center;font-size:112px">$6 AUTO DMs</div>`),

  // C: her to the left, what the tool does all day stacked beside her as phone notifications
  c: page(`${set('2043', -282, 10, 860)}
${note(150, 800, IG, 'ig', 'Instagram', 'New comment: "MATH"', '9:41')}
${note(250, 800, IG, 'dm', 'Auto-DM sent ✓', 'Reply READY for the calculator', '9:41')}
${note(350, 800, '#2db36b', 'mail', 'New subscriber', '+1 on your email list', '9:42')}
${note(450, 800, '#3a7bd5', 'usd', 'Server bill', '$6.00 this month', '1st')}
<div class="abs big" style="left:0;right:0;top:28px;text-align:center;font-size:96px">NO MORE MANYCHAT</div>`),
};

mkdirSync(out, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: 1280, height: 720 });
for (const [k, html] of Object.entries(designs)) {
  // a file page, so the file:// images load (setContent's about:blank can't read them)
  const f = path.join(tmpdir(), `yt-thumb-${k}.html`);
  writeFileSync(f, html);
  await pg.goto(pathToFileURL(f).href, { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(out, `thumb-${k}.png`) });
  console.log('thumb-' + k);
}
await browser.close();
