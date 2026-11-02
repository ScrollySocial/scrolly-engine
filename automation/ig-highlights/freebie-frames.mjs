// Renders the Freebies highlight Story frames (1080x1920): blue mist like the cover, a real phone prop showing the
// freebie's page, a small gold foil star on the phone, headline + highlighted line on top, logo + site at the bottom,
// and an empty band under the phone for the Instagram link sticker (added in the app when posting).
// Usage: node freebie-frames.mjs [--shots] [key ...]   --shots re-captures the page screenshots first.
// Output: ig-highlights/out/frames/
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/frames');
const SHOTS = path.join(HERE, 'out/shots');
const SITE = 'https://theambitiondepartment.com';
const MARK = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/v3.css'), 'utf8').match(/--s3-mark:(url\("[^"]+"\)[^;]*);/)[1];
const LOGO = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/logo.html'), 'utf8').match(/<svg[\s\S]*<\/svg>/)[0];
const W = 1080, H = 1920;

// Phone prop from the shared prop library (tech/Graphite Smartphone With Green Screen-38), cut out with the green
// screen made transparent; SCREEN is the green area in the 1024x1536 prop.
const PHONE = { file: 'assets/phone-graphite.png', w: 1024, h: 1536, screen: { x: 205, y: 115, w: 614, h: 1306 } };

// Mercedes 2026-11-02: the call to action is the BIG thing on each frame; the question sits small above it, and a
// handwritten "tap the link" points at a clear band where the link sticker goes.
const FRAMES = [
  { key: '1-offer-quiz', url: '/quiz/', q: "Don't have a digital product yet?", cta: 'Take the quiz' },
  { key: '2-next-move', url: '/next-move/', q: 'Not sure what to do next in your business?', cta: 'Find your next step' },
  { key: '3-calculators', url: '/calculators/', q: 'How many views does your goal take?', cta: 'Do the math' },
  { key: '4-blog', url: '/blog/', q: 'Want step-by-step guides?', cta: 'Read the blog' },
];

const GRAIN = `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;

// Phone placement on the Story: scaled so the screen shows a real phone-sized page.
const PH = 760, SC = PH / PHONE.h, PW = PHONE.w * SC, PX = (W - PW) / 2, PY = 520;
const scr = { x: PHONE.screen.x * SC, y: PHONE.screen.y * SC, w: PHONE.screen.w * SC, h: PHONE.screen.h * SC };

const frameHtml = (f) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;800&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: #dfe4f0; background-image: ${GRAIN}; overflow: hidden; color: #0a1930; }
  /* Instagram's top bar ends near 230px and the reply bar starts near 1700px. */
  .top { position: absolute; left: 50px; right: 50px; top: 250px; text-align: center; }
  .top p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 42px; }
  .top h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 170px; line-height: 1; letter-spacing: -.01em; margin-top: 14px; white-space: nowrap; }
  .top h1 span { background: ${MARK}; padding: 0 .12em; }
  .tap { position: absolute; left: 0; right: 0; top: 1290px; text-align: center; font-family: 'Covered By Your Grace', cursive; font-size: 60px; line-height: 1; }
  .tap svg { display: block; margin: 4px auto 0; width: 60px; height: 70px; }
  .phone { position: absolute; left: ${PX}px; top: ${PY}px; width: ${PW}px; height: ${PH}px; transform: rotate(-4deg); filter: drop-shadow(0 24px 30px rgba(10,25,48,.25)); }
  .phone .scr { position: absolute; left: ${scr.x}px; top: ${scr.y}px; width: ${scr.w}px; height: ${scr.h}px; border-radius: 40px; overflow: hidden; background: #fff; }
  .phone .scr img { width: 100%; display: block; }
  .phone .body { position: absolute; inset: 0; width: 100%; height: 100%; }
  .star { position: absolute; width: 190px; left: ${PX + PW - 120}px; top: ${PY + 10}px; transform: rotate(14deg); filter: drop-shadow(0 6px 8px rgba(10,25,48,.25)); }
  .foot { position: absolute; left: 0; right: 0; top: 1560px; text-align: center; }
  .foot svg { width: 300px; height: auto; display: block; margin: 0 auto; }
  .foot .amb { fill: #4da3ff; }
  .foot p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 32px; margin-top: 12px; }
</style></head><body>
  <div class="top"><p>${esc(f.q)}</p><h1><span>${esc(f.cta)}</span></h1></div>
  <div class="phone"><div class="scr"><img src="${fileUrl(path.join(SHOTS, f.key + '.png'))}"></div><img class="body" src="${fileUrl(path.join(HERE, PHONE.file))}"></div>
  <img class="star" src="${fileUrl(path.join(HERE, 'assets/stars/foil-95.png'))}">
  <div class="tap">tap the link<svg viewBox="0 0 60 70"><path d="M31 4c-2 18 1 38-1 58M14 46c7 6 12 12 16 17c4-7 9-12 16-18" fill="none" stroke="#4da3ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <!-- the link sticker goes in the clear band below (about 1380 to 1540) -->
  <div class="foot">${LOGO}<p>theambitiondepartment.com</p></div>
</body></html>`;

const args = process.argv.slice(2);
const pick = args.filter((a) => !a.startsWith('--'));
const list = FRAMES.filter((f) => !pick.length || pick.some((p) => f.key.startsWith(p)));
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOTS, { recursive: true });
const browser = await launch();

// Phone-size captures of each live page (cookie banner and floating buttons hidden in the capture only).
for (const f of list) {
  const shot = path.join(SHOTS, f.key + '.png');
  if (existsSync(shot) && !args.includes('--shots')) continue;
  const pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 830, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pg.goto(SITE + f.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));
  await pg.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.cmplz-cookiebanner, .cmplz-manage-consent').forEach((el) => el.style.setProperty('display', 'none', 'important'));
  });
  await pg.screenshot({ path: shot });
  console.log('shot   ' + f.key);
  await pg.close();
}

const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
for (const f of list) {
  const file = path.join(OUT, '.' + f.key + '.html');
  writeFileSync(file, frameHtml(f));
  await pg.goto(fileUrl(file), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => { const h = document.querySelector('.top h1'); let z = 170; while (z > 80 && h.scrollWidth > 980) h.style.fontSize = (z -= 4) + 'px'; });
  await pg.screenshot({ path: path.join(OUT, f.key + '.png') });
  console.log('frame  ' + f.key);
}
await browser.close();
