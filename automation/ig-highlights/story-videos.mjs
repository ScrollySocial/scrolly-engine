// Freebies highlight as short Story videos (1080x1920 MP4). Step 1 records the live page being used at phone size
// (real clicks, with a tap dot so viewers see where the finger goes); step 2 composites that recording into the
// device prop, frame by frame, with the call to action, a bouncing foil star and the logo.
// Usage: node story-videos.mjs <key> [--record]   (--record re-captures the page; otherwise the last recording is reused)
// Output: ig-highlights/out/video/<key>.mp4. Render one video at a time (Mercedes's PC, 2026-10-20).
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { tool } from '../reel-hf/lib/settings.mjs';

const FFMPEG = tool('ffmpeg'); // the Reel engine's own copy (ffmpeg isn't on PATH)

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/video');
const SITE = 'https://theambitiondepartment.com';
const MARK = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/v3.css'), 'utf8').match(/--s3-mark:(url\("[^"]+"\)[^;]*);/)[1];
const LOGO = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/logo.html'), 'utf8').match(/<svg[\s\S]*<\/svg>/)[0];
const W = 1080, H = 1920, FPS = 30;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Each video gets its own layout so the highlight doesn't repeat itself (Mercedes 2026-11-02).
const VIDEOS = {
  '1-offer-quiz': {
    url: '/quiz/', seconds: 8,
    q: "Don't have a digital product yet?", cta: 'Take the quiz',
    phone: { file: 'assets/phone-graphite.png', w: 1024, h: 1536, screen: { x: 205, y: 115, w: 614, h: 1306 }, height: 780, top: 515, rotate: -4 },
    star: { file: 'foil-95', size: 190, dx: -120, dy: 10, rotate: 14 },
    // Ticks a few skills on step 1. Never presses Next: the quiz records answers, so the recording stays read-only.
    async script(fr, tap) {
      await wait(900);
      for (const v of ['writing', 'design', 'teaching', 'organizing']) { await tap(`input[value="${v}"]`); await wait(650); }
      await fr.page().evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' })); // the page scrolls, not the tall iframe
      await wait(1400);
      for (const v of ['food', 'local']) { await tap(`input[value="${v}"]`); await wait(650); }
      await wait(900);
    },
  },
};

const key = process.argv[2];
const v = VIDEOS[key];
if (!v) { console.log('Usage: node story-videos.mjs <' + Object.keys(VIDEOS).join('|') + '> [--record]'); process.exit(1); }
const WORK = path.join(OUT, '.work-' + key);
const REC = path.join(WORK, 'rec'), SCR = path.join(WORK, 'screen'), COMP = path.join(WORK, 'comp');
mkdirSync(OUT, { recursive: true });
const browser = await launch();

// 1. Record the page: screenshots in a loop while the script clicks, then retimed to a steady 30 fps.
if (process.argv.includes('--record') || !existsSync(path.join(WORK, 'screen.mp4'))) {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(REC, { recursive: true });
  const pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 830, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pg.goto(SITE + v.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await wait(2000);
  await pg.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.cmplz-cookiebanner, .cmplz-manage-consent').forEach((el) => el.style.setProperty('display', 'none', 'important'));
  });
  const fr = pg.frames().find((f) => f !== pg.mainFrame() && f.url().includes(new URL(SITE).host)) || pg.mainFrame();
  // A soft dot where the finger lands, drawn in the main page over the iframe.
  const tap = async (sel) => {
    // Styled checkboxes hide the real input, so aim at its visible label.
    const el = (await fr.evaluateHandle((s) => { const i = document.querySelector(s); return i.closest('label') || i; }, sel)).asElement();
    const r = await el.evaluate((n) => { const b = n.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    const off = fr === pg.mainFrame() ? { x: 0, y: 0 } : await pg.evaluate(() => { const b = document.querySelector('iframe').getBoundingClientRect(); return { x: b.x, y: b.y }; });
    const x = r.x + off.x, y = r.y + off.y;
    await pg.evaluate((x, y) => {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(77,163,255,.45);border:2px solid rgba(10,25,48,.35);z-index:99999;pointer-events:none;transition:transform .35s,opacity .35s`;
      document.body.appendChild(d);
      setTimeout(() => { d.style.transform = 'scale(1.5)'; d.style.opacity = '0'; }, 220);
      setTimeout(() => d.remove(), 700);
    }, x, y);
    await wait(120);
    await el.evaluate((n) => n.click());
  };
  const stamps = [];
  let recording = true;
  const t0 = Date.now();
  const loop = (async () => {
    while (recording) {
      const f = path.join(REC, String(stamps.length).padStart(5, '0') + '.jpg');
      await pg.screenshot({ path: f, type: 'jpeg', quality: 92 });
      stamps.push({ f, t: Date.now() - t0 });
    }
  })();
  await v.script(fr, tap);
  while (Date.now() - t0 < v.seconds * 1000) await wait(100);
  recording = false;
  await loop;
  await pg.close();
  const list = stamps.map((s, i) => `file '${s.f.replace(/\\/g, '/')}'\nduration ${(((stamps[i + 1]?.t ?? v.seconds * 1000) - s.t) / 1000).toFixed(3)}`).join('\n') + `\nfile '${stamps.at(-1).f.replace(/\\/g, '/')}'\n`;
  writeFileSync(path.join(WORK, 'list.txt'), list);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(WORK, 'list.txt'), '-vf', `fps=${FPS},scale=780:-2`, '-t', String(v.seconds), '-pix_fmt', 'yuv420p', path.join(WORK, 'screen.mp4')]);
  console.log(`record ${stamps.length} shots over ${v.seconds}s`);
}

// 2. Composite: the screen recording sits under the device prop, so the bezel and notch frame it naturally.
rmSync(SCR, { recursive: true, force: true }); mkdirSync(SCR, { recursive: true });
rmSync(COMP, { recursive: true, force: true }); mkdirSync(COMP, { recursive: true });
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', path.join(WORK, 'screen.mp4'), '-q:v', '2', path.join(SCR, '%05d.jpg')]);
const shots = readdirSync(SCR).filter((f) => f.endsWith('.jpg')).sort();

const p = v.phone, SC = p.height / p.h, PW = p.w * SC, PX = (W - PW) / 2;
const scr = { x: p.screen.x * SC, y: p.screen.y * SC, w: p.screen.w * SC, h: p.screen.h * SC };
const GRAIN = `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;800&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: #dfe4f0; background-image: ${GRAIN}; overflow: hidden; color: #0a1930; }
  .top { position: absolute; left: 50px; right: 50px; top: 250px; text-align: center; }
  .top p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 42px; }
  .top h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 170px; line-height: 1; letter-spacing: -.01em; margin-top: 14px; white-space: nowrap; }
  .top h1 span { background: ${MARK}; padding: 0 .12em; }
  .phone { position: absolute; left: ${PX}px; top: ${p.top}px; width: ${PW}px; height: ${p.height}px; transform: rotate(${p.rotate}deg); filter: drop-shadow(0 24px 30px rgba(10,25,48,.25)); }
  .phone .scr { position: absolute; left: ${scr.x}px; top: ${scr.y}px; width: ${scr.w}px; height: ${scr.h}px; border-radius: 36px; overflow: hidden; background: #fff; }
  .phone .scr img { width: 100%; display: block; }
  .phone .body { position: absolute; inset: 0; width: 100%; height: 100%; }
  .star { position: absolute; width: ${v.star.size}px; left: ${PX + PW + v.star.dx}px; top: ${p.top + v.star.dy}px; filter: drop-shadow(0 6px 8px rgba(10,25,48,.25)); }
  .tap { position: absolute; left: 0; right: 0; top: 1300px; text-align: center; font-family: 'Covered By Your Grace', cursive; font-size: 60px; line-height: 1; }
  .tap svg { display: block; margin: 4px auto 0; width: 60px; height: 70px; }
  .foot { position: absolute; left: 0; right: 0; top: 1560px; text-align: center; }
  .foot svg { width: 300px; height: auto; display: block; margin: 0 auto; }
  .foot .amb { fill: #4da3ff; }
  .foot p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 32px; margin-top: 12px; }
</style></head><body>
  <div class="top"><p>${esc(v.q)}</p><h1><span>${esc(v.cta)}</span></h1></div>
  <div class="phone"><div class="scr"><img id="s"></div><img class="body" src="${fileUrl(path.join(HERE, p.file))}"></div>
  <img class="star" id="star" src="${fileUrl(path.join(HERE, 'assets/stars', v.star.file + '.png'))}">
  <div class="tap" id="tap">tap the link<svg viewBox="0 0 60 70"><path d="M31 4c-2 18 1 38-1 58M14 46c7 6 12 12 16 17c4-7 9-12 16-18" fill="none" stroke="#4da3ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="foot">${LOGO}<p>theambitiondepartment.com</p></div>
</body></html>`;
const hf = path.join(WORK, 'frame.html');
writeFileSync(hf, html);
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await pg.goto(fileUrl(hf), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
await pg.evaluate(() => { const h = document.querySelector('.top h1'); let z = 170; while (z > 80 && h.scrollWidth > 980) h.style.fontSize = (z -= 4) + 'px'; });
for (let i = 0; i < shots.length; i++) {
  const t = i / FPS;
  await pg.evaluate(async (src, t, rot) => {
    const img = document.getElementById('s');
    img.src = src; await img.decode();
    // Star: a little bounce every 2 seconds. Arrow: nudges down and back.
    const ph = (t % 2) / 2, b = ph < 0.25 ? Math.sin((ph / 0.25) * Math.PI) : 0;
    document.getElementById('star').style.transform = `translateY(${-28 * b}px) rotate(${rot + 10 * b}deg) scale(${1 + 0.08 * b})`;
    document.querySelector('#tap svg').style.transform = `translateY(${10 * Math.abs(Math.sin(t * Math.PI))}px)`;
  }, fileUrl(path.join(SCR, shots[i])), t, v.star.rotate);
  await pg.screenshot({ path: path.join(COMP, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
}
await browser.close();
const mp4 = path.join(OUT, key + '.mp4');
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(COMP, '%05d.jpg'), '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
console.log('video  ' + mp4);
