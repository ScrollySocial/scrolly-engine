// Freebies highlight as short Story videos (1080x1920 MP4). Step 1 records the live page being used (real clicks and
// typing, with a tap dot so viewers see where the finger goes); step 2 composites that recording into a device prop,
// frame by frame, with the call to action, a foil star, "tap the link" and the logo.
// Every video has its own ground, device, layout and motion (Mercedes 2026-11-02: "they all need to be different").
// Usage: node story-videos.mjs <key> [--record] [--tiktok]   (--record re-captures the page; otherwise the last recording
// is reused. --tiktok swaps "tap the link" for the page's web address, since TikTok has no link stickers: <key>-tiktok.mp4)
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

// Device props from the shared prop library (tech/), cut out by cut-device.py; screen = the green area.
const DEVICES = {
  phone: { file: 'assets/phone-graphite.png', w: 1024, h: 1536, screen: { x: 205, y: 115, w: 614, h: 1306 }, radius: 36 },
  hand: { file: 'assets/hand-phone.png', w: 884, h: 1444, screen: { x: 133, y: 25, w: 471, h: 1010 }, radius: 40 },
  laptop: { file: 'assets/laptop.png', w: 1294, h: 928, screen: { x: 154, y: 37, w: 986, h: 586 }, radius: 6 },
  tablet: { file: 'assets/tablet.png', w: 1275, h: 808, screen: { x: 39, y: 42, w: 1070, h: 725 }, radius: 22 },
};
const GROUNDS = {
  mist: { bg: '#dfe4f0', ink: '#0a1930', grain: 0.07 },
  cream: { bg: '#f7f3ec', ink: '#0a1930', grain: 0.07 },
  navy: { bg: '#0a1930', ink: '#ffffff', grain: 0.10 },
};

// Shared motion helpers, available inside every anim() (they run in the page).
const HELPERS = `
  const cl = (x) => Math.max(0, Math.min(1, x));
  const prog = (a, b) => cl((t - a) / (b - a));
  const out = (x) => 1 - Math.pow(1 - x, 3);
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const back = (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
  const words = (id, start, gap, dy = 30, dx = 0) => [...$(id).children].forEach((w, k) => { const e = out(prog(start + k * gap, start + k * gap + 0.3)); w.style.opacity = e; w.style.transform = 'translate(' + dx * (1 - e) + 'px,' + dy * (1 - e) + 'px)'; });
  const pop = (id, a) => { const p = prog(a, a + 0.45); $(id).style.opacity = p > 0 ? 1 : 0; return p > 0 ? back(p) : 0; };
  const bounce = (since, every = 2) => { const ph = ((t - since) % every) / every; return t > since && ph < 0.25 ? Math.sin((ph / 0.25) * Math.PI) : 0; };
  const sweep = (a, b) => { $('cta').firstChild.style.backgroundSize = (100 * out(prog(a, b))) + '% 74%'; };
  const arrow = (since) => { const a = $('tap').querySelector('svg'); if (a) a.style.transform = 'translateY(' + 16 * Math.abs(Math.sin((t - since) * Math.PI * 1.5)) + 'px)'; };
  const dev = (tx, ty, s, rot) => { $('dev').style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ') translate(' + g.DW / 2 + 'px,' + g.DH / 2 + 'px) rotate(' + rot + 'deg) translate(' + -g.DW / 2 + 'px,' + -g.DH / 2 + 'px)'; };
`;

const VIDEOS = {
  // Mist, tilted phone. Question types in big and shrinks to the top, CTA pops with the highlighter sweep, the quiz
  // plays full screen and zooms out into the phone, then "tap the link".
  '1-offer-quiz': {
    url: '/quiz/', view: { w: 390, h: 830, mobile: true }, seconds: 8, end: 10.5, full: 3.35,
    ground: 'mist', device: 'phone', place: { height: 780, left: (W - 780 * 1024 / 1536) / 2, top: 515, rotate: -4 },
    q: "Don't have a digital product yet?", cta: 'Take the quiz',
    star: { file: 'foil-95', size: 190, x: 680, y: 525, rotate: 14 },
    css: `.top { left: 50px; right: 50px; top: 250px; text-align: center; } .tap { left: 0; right: 0; top: 1290px; text-align: center; } .foot { left: 0; right: 0; top: 1560px; text-align: center; } .foot svg { margin: 0 auto; }`,
    // Ticks a few skills on step 1. Never presses Next: the quiz records answers, so the recording stays read-only.
    async script({ fr, pg, tap }) {
      await wait(900);
      for (const x of ['writing', 'design', 'teaching', 'organizing']) { await tap(fr, `input[value="${x}"]`); await wait(650); }
      await pg.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' })); // the page scrolls, not the tall iframe
      await wait(2300);
    },
    anim() {
      words('q', 0.25, 0.22);
      const sh = inOut(prog(1.75, 2.35));
      $('q').style.transform = `translateY(${(860 - 275) * (1 - sh)}px) scale(${1.6 - 0.6 * sh})`;
      $('cta').firstChild.style.transform = `scale(${0.6 + 0.4 * pop('cta', 2.35)})`;
      sweep(2.85, 3.35);
      // full screen (screen fills the Story), slides up, plays, then zooms out into the phone
      const ZOOM = W / g.sw, z = inOut(prog(6.3, 7.25)), slide = (1 - out(prog(3.35, 3.8))) * H;
      $('dev').style.visibility = t < 3.35 ? 'hidden' : 'visible';
      dev((-g.left - ZOOM * g.sx) * (1 - z), (-g.top - ZOOM * g.sy) * (1 - z) + slide, ZOOM + (1 - ZOOM) * z, g.rot * z);
      const b = bounce(7.85);
      $('star').style.transform = `translateY(${-28 * b}px) rotate(${g.srot + 10 * b}deg) scale(${pop('star', 7.15) * (1 + 0.08 * b)})`;
      $('tap').style.transform = `scale(${pop('tap', 7.35)})`;
      arrow(7.35);
    },
  },

  // Cream, a hand holding the phone from the right edge. The question builds as three big serif lines sliding in from
  // the left, then they shrink to the top and the CTA swipes in from the right. The hand rises in; "tap the link" on the
  // left, with the logo bottom left.
  '2-next-move': {
    url: '/next-move/', view: { w: 390, h: 836, mobile: true }, seconds: 8, end: 10, full: 2.9,
    ground: 'cream', device: 'hand', place: { height: 1240, left: 470, top: 690, rotate: -6 },
    q: 'Not sure what to do next in your business?', cta: 'Find your next step',
    lines: ['Not sure', 'what to do', 'next?'],
    star: { file: 'foil-106', size: 170, x: 440, y: 650, rotate: -12 },
    css: `.top { left: 60px; right: 60px; top: 250px; text-align: left; } .top h1 { font-size: 150px; }
      .lines { position: absolute; left: 70px; top: 640px; font-family: 'Instrument Serif', Georgia, serif; font-size: 190px; line-height: .95; }
      .lines b { display: block; font-weight: 400; }
      .tap { left: 60px; width: 380px; top: 1150px; text-align: left; } .tap svg { margin: 6px 0 0 60px; } .tap .addr { margin-left: 0; font-size: 26px; padding: 12px 22px 14px; } .tap .addr b { font-size: 38px; }
      .foot { left: 60px; top: 1580px; text-align: left; } .foot svg { margin: 0; }`,
    // Picks the first answer and moves to question 2. The email step at the end is never reached.
    async script({ fr, tap }) {
      await wait(1000);
      await tap(fr, 'input[name="offer"][value="none"]'); await wait(900);
      await tap(fr, '#next'); await wait(1300);
      const second = await fr.evaluate(() => { const i = [...document.querySelectorAll('input[type=radio]')].find((x) => x.offsetParent && !x.checked && x.name !== 'offer'); return i ? `input[name="${i.name}"][value="${i.value}"]` : null; });
      if (second) await tap(fr, second);
      await wait(2000);
    },
    anim() {
      [...$('lines').children].forEach((l, k) => { const e = out(prog(0.2 + k * 0.35, 0.65 + k * 0.35)); l.style.opacity = e; l.style.transform = `translateX(${-260 * (1 - e)}px)`; });
      const gone = inOut(prog(1.7, 2.2));
      $('lines').style.transform = `translateY(${-380 * gone}px) scale(${1 - 0.75 * gone})`;
      $('lines').style.opacity = 1 - gone;
      const qa = out(prog(1.9, 2.3));
      $('q').style.opacity = qa;
      $('q').style.transform = `translateY(${20 * (1 - qa)}px)`;
      const c = out(prog(2.2, 2.65));
      $('cta').style.opacity = c > 0 ? 1 : 0;
      $('cta').style.transform = `translateX(${700 * (1 - c)}px)`;
      sweep(2.65, 3.15);
      // the hand rises in from below with a little overshoot, then sways gently
      const r = prog(2.9, 3.7), rise = r > 0 ? back(r) : 0;
      $('dev').style.visibility = t < 2.9 ? 'hidden' : 'visible';
      dev(0, (1 - rise) * 1100, 1, g.rot + 1.5 * Math.sin((t - 3) * 1.4));
      const b = bounce(4.6);
      $('star').style.transform = `translateY(${-24 * b}px) rotate(${g.srot - 10 * b}deg) scale(${pop('star', 3.8) * (1 + 0.08 * b)})`;
      $('tap').style.transform = `scale(${pop('tap', 4.3)})`;
      arrow(4.3);
      $('foot').style.opacity = out(prog(2.9, 3.4));
    },
  },

  // Navy, a laptop. A huge sky number counts up (the views a $1,000 goal takes on the calculator's defaults), then the
  // CTA lands and the laptop rises in with the calculator being typed into.
  '3-calculators': {
    url: '/calculators/', view: { w: 1000, h: 594, mobile: false }, seconds: 8, end: 10, full: 3.1,
    ground: 'navy', device: 'laptop', place: { width: 820, left: 130, top: 650, rotate: 0 }, // smaller so the link sticker fits under the arrow
    q: 'How many views does your goal take?', cta: 'Do the math', count: { to: 476334, label: 'views for a $1,000 month, at typical rates' },
    star: { file: 'foil-103', size: 150, x: 830, y: 595, rotate: 10 },
    css: `.top { left: 50px; right: 50px; top: 250px; text-align: center; } .top h1 { color: #4da3ff; } .top h1 span { background: none !important; }
      .count { position: absolute; left: 0; right: 0; top: 620px; text-align: center; color: #4da3ff; font-family: 'Instrument Serif', Georgia, serif; font-size: 230px; line-height: 1; }
      .count small { display: block; font-family: Jost, Arial, sans-serif; font-size: 40px; color: #dfe4f0; margin-top: 8px; }
      .tap { left: 0; right: 0; top: 1255px; text-align: center; }
      .foot { left: 0; right: 0; top: 1600px; text-align: center; } .foot svg { margin: 0 auto; }`,
    // Types a new monthly goal so the results change live. Nothing is submitted (the calculator has no form).
    async script({ pg, tap, type }) {
      await wait(600);
      await pg.evaluate(() => window.scrollBy({ top: 120, behavior: 'smooth' })); // bring the results row fully on screen
      await wait(600);
      await tap(pg.mainFrame(), '#cdir-goal'); await wait(300);
      await type('#cdir-goal', '2500'); await wait(1500);
      await tap(pg.mainFrame(), '#cdir-aov'); await wait(300);
      await type('#cdir-aov', '35'); await wait(2000);
    },
    anim() {
      words('q', 0.15, 0.12, 20);
      const c = out(prog(0.5, 2.2)), n = Math.round(g.count.to * c);
      $('count').firstChild.textContent = n.toLocaleString('en-US');
      $('count').style.opacity = t < 2.6 ? out(prog(0.4, 0.7)) : 1 - prog(2.6, 3.0);
      $('count').style.transform = `scale(${t < 2.6 ? 0.85 + 0.15 * out(prog(0.4, 1)) : 1 - 0.3 * prog(2.6, 3)})`;
      $('cta').firstChild.style.transform = `scale(${0.6 + 0.4 * pop('cta', 2.7)})`;
      const r = out(prog(3.1, 3.9));
      $('dev').style.visibility = t < 3.1 ? 'hidden' : 'visible';
      dev(0, (1 - r) * 1200, 0.9 + 0.1 * r, 0);
      const b = bounce(5);
      $('star').style.transform = `translateY(${-24 * b}px) rotate(${g.srot + 10 * b}deg) scale(${pop('star', 4.2) * (1 + 0.08 * b)})`;
      $('tap').style.transform = `scale(${pop('tap', 4.5)})`;
      arrow(4.5);
    },
  },

  // Mist, a tablet that drops in tilted and settles. The CTA comes first this time, letter by letter, then the guide
  // scrolls on the tablet; the question sits small under it.
  '4-blog': {
    url: '/guides/can-claude-answer-instagram-dms/', addr: '/blog/', view: { w: 1180, h: 800, mobile: false }, seconds: 8, end: 10, full: 1.2,
    ground: 'mist', device: 'tablet', place: { width: 940, left: 70, top: 640, rotate: 5 },
    q: 'Step-by-step guides with real costs', cta: 'Read the blog',
    star: { file: 'foil-97', size: 180, x: 60, y: 560, rotate: -16 },
    css: `.top { left: 50px; right: 50px; top: 250px; text-align: center; } .top h1 { margin: 0 0 18px; } .top { display: flex; flex-direction: column-reverse; }
      .top h1 span i { font-style: normal; display: inline-block; }
      .tap { left: 0; right: 0; top: 1300px; text-align: center; }
      .foot { left: 0; right: 0; top: 1580px; text-align: center; } .foot svg { margin: 0 auto; }`,
    // Scrolls through the newest guide. (Clicking through from /blog/ broke the capture loop mid-navigation, so the
    // recording starts on the guide itself.)
    async script({ pg }) {
      await wait(1000);
      for (let k = 0; k < 5; k++) { await pg.evaluate(() => window.scrollBy({ top: 360, behavior: 'smooth' })); await wait(1150); }
    },
    anim() {
      [...$('cta').firstChild.children].forEach((ch, k) => { const e = out(prog(0.15 + k * 0.06, 0.45 + k * 0.06)); ch.style.opacity = e; ch.style.transform = `translateY(${40 * (1 - e)}px) rotate(${-8 * (1 - e)}deg)`; });
      sweep(1.1, 1.6);
      $('cta').style.opacity = 1;
      words('q', 1.5, 0.1, 16);
      const d = prog(1.2, 2.2), drop = d > 0 ? back(d) : 0;
      $('dev').style.visibility = t < 1.2 ? 'hidden' : 'visible';
      dev(0, (drop - 1) * 900, 1, g.rot + 14 * (1 - drop));
      const b = bounce(3.4);
      $('star').style.transform = `translateY(${-24 * b}px) rotate(${g.srot - 10 * b}deg) scale(${pop('star', 2.4) * (1 + 0.08 * b)})`;
      $('tap').style.transform = `scale(${pop('tap', 3.0)})`;
      arrow(3.0);
    },
  },
};

const key = process.argv[2];
const TIKTOK = process.argv.includes('--tiktok');
const v = VIDEOS[key];
if (!v) { console.log('Usage: node story-videos.mjs <' + Object.keys(VIDEOS).join('|') + '> [--record]'); process.exit(1); }
const D = DEVICES[v.device], G = GROUNDS[v.ground];
const WORK = path.join(OUT, '.work-' + key);
const REC = path.join(WORK, 'rec'), SCR = path.join(WORK, 'screen'), COMP = path.join(WORK, 'comp');
mkdirSync(OUT, { recursive: true });
const browser = await launch();

// 1. Record the page: screenshots in a loop while the script clicks and types, then retimed to a steady 30 fps.
if (process.argv.includes('--record') || !existsSync(path.join(WORK, 'screen.mp4'))) {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(REC, { recursive: true });
  const pg = await browser.newPage();
  const vw = v.view;
  await pg.setViewport({ width: vw.w, height: vw.h, deviceScaleFactor: vw.mobile ? 2 : 1, isMobile: vw.mobile, hasTouch: vw.mobile });
  await pg.goto(SITE + v.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await wait(2000);
  // Hide the cookie banner and floating buttons in the capture only.
  await pg.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.cmplz-cookiebanner, .cmplz-manage-consent').forEach((el) => el.style.setProperty('display', 'none', 'important'));
  });
  const fr = pg.frames().find((f) => f !== pg.mainFrame() && f.url().includes(new URL(SITE).host)) || pg.mainFrame();
  // A soft dot where the finger lands, drawn in the main page (over the iframe when the page uses one).
  const dot = (x, y) => pg.evaluate((x, y) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(77,163,255,.45);border:2px solid rgba(10,25,48,.35);z-index:99999;pointer-events:none;transition:transform .35s,opacity .35s`;
    document.body.appendChild(d);
    setTimeout(() => { d.style.transform = 'scale(1.5)'; d.style.opacity = '0'; }, 220);
    setTimeout(() => d.remove(), 700);
  }, x, y);
  const tap = async (frame, sel) => {
    // Styled checkboxes and radios hide the real input, so aim at its visible label.
    const el = (await frame.evaluateHandle((s) => { const i = document.querySelector(s); return i.closest('label') || i; }, sel)).asElement();
    const r = await el.evaluate((n) => { const b = n.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    const off = frame === pg.mainFrame() ? { x: 0, y: 0 } : await pg.evaluate(() => { const b = document.querySelector('iframe').getBoundingClientRect(); return { x: b.x, y: b.y }; });
    await dot(r.x + off.x, r.y + off.y);
    await wait(120);
    await el.evaluate((n) => { n.click(); n.focus?.(); });
  };
  // Clears a field and types like a person, firing input events so live results update.
  const type = async (sel, text) => {
    await pg.evaluate((s) => { const i = document.querySelector(s); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }, sel);
    for (const ch of text) { await pg.type(sel, ch); await wait(170); }
  };
  const stamps = [];
  let recording = true;
  const t0 = Date.now();
  const loop = (async () => {
    while (recording) {
      const f = path.join(REC, String(stamps.length).padStart(5, '0') + '.jpg');
      try { await pg.screenshot({ path: f, type: 'jpeg', quality: 92 }); stamps.push({ f, t: Date.now() - t0 }); } catch { await wait(50); } // mid-navigation
    }
  })();
  await v.script({ fr, pg, tap, type });
  while (Date.now() - t0 < v.seconds * 1000) await wait(100);
  recording = false;
  await loop;
  await pg.close();
  const list = stamps.map((s, i) => `file '${s.f.replace(/\\/g, '/')}'\nduration ${(((stamps[i + 1]?.t ?? v.seconds * 1000) - s.t) / 1000).toFixed(3)}`).join('\n') + `\nfile '${stamps.at(-1).f.replace(/\\/g, '/')}'\n`;
  writeFileSync(path.join(WORK, 'list.txt'), list);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(WORK, 'list.txt'), '-vf', `fps=${FPS},scale=${Math.min(1280, vw.w * (vw.mobile ? 2 : 1))}:-2`, '-t', String(v.seconds), '-pix_fmt', 'yuv420p', path.join(WORK, 'screen.mp4')]);
  console.log(`record ${stamps.length} shots over ${v.seconds}s`);
}

// 2. Composite: the screen recording sits under the device prop, so the bezel (and the hand) frame it naturally.
rmSync(SCR, { recursive: true, force: true }); mkdirSync(SCR, { recursive: true });
rmSync(COMP, { recursive: true, force: true }); mkdirSync(COMP, { recursive: true });
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', path.join(WORK, 'screen.mp4'), '-q:v', '2', path.join(SCR, '%05d.jpg')]);
const shots = readdirSync(SCR).filter((f) => f.endsWith('.jpg')).sort();

const pl = v.place, SC = pl.height ? pl.height / D.h : pl.width / D.w;
const g = {
  left: pl.left, top: pl.top, DW: D.w * SC, DH: D.h * SC, rot: pl.rotate, srot: v.star.rotate,
  sx: D.screen.x * SC, sy: D.screen.y * SC, sw: D.screen.w * SC, sh: D.screen.h * SC, count: v.count,
};
const GRAIN = `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${G.grain} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;
const ctaHtml = key === '4-blog' ? [...v.cta].map((c) => (c === ' ' ? ' ' : `<i>${esc(c)}</i>`)).join('') : esc(v.cta);
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@500;800&family=Instrument+Serif&family=Covered+By+Your+Grace&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background-color: ${G.bg}; background-image: ${GRAIN}; overflow: hidden; color: ${G.ink}; }
  /* Instagram's top bar ends near 230px and the reply bar starts near 1700px. */
  .top, .tap, .foot { position: absolute; }
  .top p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 42px; transform-origin: 50% 50%; }
  .top p b { font-weight: 500; display: inline-block; }
  .top h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 170px; line-height: 1; letter-spacing: -.01em; margin-top: 14px; white-space: nowrap; }
  .top h1 span { display: inline-block; background: ${MARK}; padding: 0 .12em; background-size: 0% 74%; }
  .dev { position: absolute; left: ${g.left}px; top: ${g.top}px; width: ${g.DW}px; height: ${g.DH}px; transform-origin: 0 0; filter: drop-shadow(0 24px 30px rgba(10,25,48,.28)); visibility: hidden; }
  .dev .scr { position: absolute; left: ${g.sx}px; top: ${g.sy}px; width: ${g.sw}px; height: ${g.sh}px; border-radius: ${D.radius * SC * 1.6}px; overflow: hidden; background: #fff; }
  .dev .scr img { width: 100%; display: block; }
  .dev .body { position: absolute; inset: 0; width: 100%; height: 100%; }
  .star { position: absolute; width: ${v.star.size}px; left: ${v.star.x}px; top: ${v.star.y}px; opacity: 0; filter: drop-shadow(0 6px 8px rgba(10,25,48,.25)); }
  .tap { font-family: 'Covered By Your Grace', cursive; font-size: 72px; line-height: 1; opacity: 0; }
  .tap svg { display: block; width: 60px; height: 70px; margin: 0 auto; }
  .foot svg { width: 300px; height: auto; display: block; }
  .foot .amb { fill: #4da3ff; }
  .foot p { font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 32px; margin-top: 12px; }
  #cta { opacity: 0; }
  .addr { display: block; width: max-content; margin: 10px auto 0; padding: 14px 30px 16px; border-radius: 22px; background: #4da3ff; color: #0a1930; font-family: Jost, Arial, sans-serif; font-weight: 500; font-size: 34px; line-height: 1.2; text-align: center; }
  .addr b { display: block; font-weight: 800; font-size: 46px; }
  ${v.css}
</style></head><body>
  <div class="top"><p id="q">${esc(v.q).split(' ').map((w) => `<b>${w}</b>`).join(' ')}</p><h1 id="cta"><span>${ctaHtml}</span></h1></div>
  ${v.lines ? `<div class="lines" id="lines">${v.lines.map((l) => `<b>${esc(l)}</b>`).join('')}</div>` : ''}
  ${v.count ? `<div class="count" id="count">0<small>${esc(v.count.label)}</small></div>` : ''}
  <div class="foot" id="foot">${LOGO}<p>theambitiondepartment.com</p></div>
  ${TIKTOK ? `<div class="tap" id="tap">free at<span class="addr">theambitiondepartment.com<b>${esc((v.addr || v.url).replace(/\/$/, ''))}</b></span></div>` : `<div class="tap" id="tap">tap the link<svg viewBox="0 0 60 70"><path d="M31 4c-2 18 1 38-1 58M14 46c7 6 12 12 16 17c4-7 9-12 16-18" fill="none" stroke="#4da3ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`}
  <div class="dev" id="dev"><div class="scr"><img id="s"></div><img class="body" src="${fileUrl(path.join(HERE, D.file))}"></div>
  <img class="star" id="star" src="${fileUrl(path.join(HERE, 'assets/stars', v.star.file + '.png'))}">
</body></html>`;
const hf = path.join(WORK, 'frame.html');
writeFileSync(hf, html);
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await pg.goto(fileUrl(hf), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
await pg.evaluate(() => { const h = document.querySelector('.top h1'); let z = parseFloat(getComputedStyle(h).fontSize); while (z > 80 && h.scrollWidth > 980) h.style.fontSize = (z -= 4) + 'px'; });
const body = v.anim.toString();
const animSrc = `(async (src, t, g, W, H) => { const $ = (id) => document.getElementById(id); ${HELPERS}
  const img = $('s'); if (img.getAttribute('src') !== src) { img.src = src; await img.decode(); }
  ${body.slice(body.indexOf('{') + 1, body.lastIndexOf('}'))} })`;
await pg.evaluate((s) => { window.__anim = eval(s); }, animSrc);
const total = Math.round(v.end * FPS);
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  const shot = shots[Math.max(0, Math.min(shots.length - 1, Math.floor((t - v.full) * FPS)))];
  await pg.evaluate((src, t, g, W, H) => window.__anim(src, t, g, W, H), fileUrl(path.join(SCR, shot)), t, g, W, H);
  await pg.screenshot({ path: path.join(COMP, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
}
await browser.close();
const mp4 = path.join(OUT, key + (TIKTOK ? '-tiktok' : '') + '.mp4');
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(COMP, '%05d.jpg'), '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
console.log('video  ' + mp4);
