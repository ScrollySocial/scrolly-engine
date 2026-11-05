// "1 photo, 9 posts": the soap shop's single image post (1080×1350). Built to her inspo, a Pinterest "Touché Vitamin C"
// post: the product big and tilted on a soft surface in warm window light with deep shadows, small neat white
// handwriting with lots of room around each note, thin loopy arrows and outline sparkles, the name centred at the top.
// Her changes: the surface is a bubble bath (Pexels 13297451, the tap shows so it reads as a bath), BAR SOAP big, no
// hearts, more contrast between the writing and the background (the writing sits in the shadows).
// Only the ONE bar photo (the cut-out .work/bar.png from build.mjs). Facts only from her listing; no "all natural"
// (the bar has fragrance oil + micas).
//   node image-post.mjs [file-name.png]     (default image-post-6.png; new name per version, her player caches)
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const W = 1080, H = 1350;
const NAME = process.argv[2] || 'image-post-6.png';
const FILE = path.isAbsolute(NAME) ? NAME : path.join(OUT, 'image-post', NAME);

const b64 = (f) => readFileSync(f).toString('base64');
const BATH = `data:image/jpeg;base64,${b64(path.join(HERE, 'clips/bubble-bath-13297451.jpg'))}`;
const BAR = `data:image/png;base64,${b64(path.join(TMP, 'bar.png'))}`;
// Patrick Hand (Google Fonts, OFL, fonts/): the neat rounded print hand closest to the inspo's notes
const CSS = `@font-face{font-family:Hand;src:url(data:font/ttf;base64,${b64(path.join(HERE, 'fonts/patrick-hand.ttf'))})}
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#8a735f}
  .t{position:absolute;color:#fff;font:46px/1.08 Hand;text-align:center;text-shadow:0 1px 10px rgba(50,28,12,.35)}
  svg{position:absolute;left:0;top:0;overflow:visible}
  svg .ink{fill:none;stroke:#fff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}`;

// the bath (mirrored so the tap sits half off the top right edge), warmed, then window light: deep warm shadows where
// the writing sits, a bright sunlit band across the middle where the bar lies
const bath = (f) => `<img src="${BATH}" style="position:absolute;left:0;top:-120px;width:1660px;transform:scaleX(-1);filter:${f}">`;
const bg = bath('sepia(.14) saturate(1.05) brightness(1.08) contrast(1.06)') + `
  <svg width="${W}" height="${H}" style="mix-blend-mode:multiply"><defs>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
    <mask id="sun"><rect x="-200" y="-200" width="1480" height="1750" fill="#fff"/><g filter="url(#soft)" fill="#000">
      <path d="M915,-120 L1180,-120 L1180,120 L420,1470 L120,1470 Z"/>
      <path d="M1180,980 L1180,1180 L1060,1470 L960,1470 Z" opacity=".8"/>
    </g></mask></defs>
    <rect x="-200" y="-200" width="1480" height="1750" fill="rgb(156,136,120)" mask="url(#sun)"/></svg>
  <svg width="${W}" height="${H}" style="mix-blend-mode:soft-light"><defs><filter id="glow"><feGaussianBlur stdDeviation="30"/></filter></defs>
    <path filter="url(#glow)" d="M935,-120 L1180,-120 L1180,80 L400,1470 L160,1470 Z" fill="rgba(255,205,140,.8)"/></svg>`;

// the bar, big and tilted with its top leaning right like the Touché bottle (her note: more upright than round 1)
const bar = `<div style="position:absolute;left:255px;top:400px;width:580px;height:580px;transform:rotate(17deg)">
  <div style="position:absolute;left:90px;top:90px;width:400px;height:420px;border-radius:30px;background:rgba(70,40,20,.5);filter:blur(30px);transform:translate(-30px,34px)"></div>
  <img src="${BAR}" style="position:absolute;inset:0;width:580px;filter:sepia(.1) saturate(1.05)"></div>`;

const t = (x, y, w, s, extra = '') => `<div class="t" style="left:${x - w / 2}px;top:${y}px;width:${w}px;${extra}">${s}</div>`;
const words = [
  t(540, 52, 900, 'SUNSHINE SPLASH', 'font-size:64px;letter-spacing:7px'),
  t(540, 118, 900, 'BAR SOAP', 'font-size:128px;letter-spacing:10px;line-height:1'),
  t(540, 252, 600, 'handmade · cold process', 'font-size:42px;letter-spacing:2px'),
  t(185, 420, 360, 'smells like<br>pineapple, coconut<br>water, apple, thyme', 'white-space:nowrap'),
  t(150, 860, 270, '10% superfat<br>for soft skin'),
  t(935, 850, 280, 'shea butter +<br>castor oil for<br>a creamy lather'),
  t(900, 1130, 320, 'every bar is<br>one of a kind'),
].join('');

// thin hand-drawn arrows with a little loop, open heads; outline sparkles; sun rays off the bar's corner
const loopArrow = (x0, y0, mx, my, x1, y1, r = 16) =>
  `<path class="ink arrow" d="M${x0},${y0} Q${(x0 + mx) / 2 + 20},${(y0 + my) / 2 - 20} ${mx},${my} a${r},${r} 0 1,1 0,${-2 * r} a${r},${r} 0 1,1 0,${2 * r} Q${(mx + x1) / 2 - 10},${(my + y1) / 2 + 20} ${x1},${y1}"/>`;
const curve = (d) => `<path class="ink arrow" d="${d}"/>`;
const sparkle = (x, y, s) => `<path class="ink" transform="translate(${x} ${y}) scale(${s})" style="stroke-width:${3.5 / s}" d="M0,-1 C.1,-.15 .15,-.1 1,0 C.15,.1 .1,.15 0,1 C-.1,.15 -.15,.1 -1,0 C-.15,-.1 -.1,-.15 0,-1Z"/>`;
const doodles = `<svg width="${W}" height="${H}">
  ${loopArrow(200, 600, 260, 655, 345, 650)}
  ${curve('M890,835 C880,780 845,755 785,760')}
  ${loopArrow(170, 965, 235, 1000, 340, 960)}
  ${curve('M790,1150 C740,1140 715,1100 705,1035')}
  <path class="ink" d="M690,395 L705,365 M725,405 L752,382 M748,432 L782,422"/>
  ${sparkle(240, 300, 20)}${sparkle(870, 300, 14)}${sparkle(930, 640, 16)}${sparkle(130, 1080, 18)}${sparkle(560, 1230, 13)}
</svg>`;

mkdirSync(path.dirname(FILE), { recursive: true });
const b = await launch(), page = await b.newPage();
await page.setViewport({ width: W, height: H });
await page.setContent(`<style>${CSS}</style>${bg}${bar}${words}${doodles}`);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => {
  for (const p of document.querySelectorAll('path.arrow')) {
    const L = p.getTotalLength(), e = p.getPointAtLength(L), q = p.getPointAtLength(L - 6);
    const a = Math.atan2(e.y - q.y, e.x - q.x), h = (d) => `${e.x + 18 * Math.cos(a + d)},${e.y + 18 * Math.sin(a + d)}`;
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    head.setAttribute('class', 'ink');
    head.setAttribute('d', `M${h(2.5)} L${e.x},${e.y} L${h(-2.5)}`);
    p.after(head);
  }
});
await page.screenshot({ path: FILE });
await b.close();
console.log(FILE);
