// Renders the Pinterest profile photo (1000x1000, shown in a circle) and profile cover (1920x1080, 16:9;
// some guides say 2:1, so everything sits inside the middle 1920x960). Uses the navy board covers from board-covers.mjs.
// Usage: node profile-images.mjs   Output: pins/out/profile/
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/profile');
const COVERS = path.join(HERE, 'out/board-covers/navy');
// The website header logo: same paths, with "Ambition" as its own path (.amb) so it can be sky blue (Mercedes 2026-10-27).
const LOGO = readFileSync(path.join(HERE, '../../website/scrolly-site/chrome/logo.html'), 'utf8')
  .replace(/ aria-hidden="true" focusable="false"/, '');

const MIST = '#dfe4f0', NAVY = '#0a1930', SKY = '#4da3ff';
const GRAIN = `url("data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).toString('base64')}")`;
const BASE = `* { margin: 0; box-sizing: border-box; } body { background-color: ${MIST}; background-image: ${GRAIN}; color: ${NAVY}; overflow: hidden; } svg { display: block; width: 100%; height: auto; } .amb { fill: ${SKY}; }`;

// Profile photo: logo on blue mist, as big as the circle crop allows. The page measures the logo's actual ink
// (not its box, whose corners are empty), centres it, and scales it until the farthest inked pixel sits just inside the circle.
const photoHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
  body { width: 1000px; height: 1000px; position: relative; }
  .logo { position: absolute; transform-origin: 0 0; width: 1591px; }
</style></head><body><div class="logo">${LOGO}</div>
<script>
  window.fit = (async () => {
    const svg = document.querySelector('.logo svg');
    const src = new XMLSerializer().serializeToString(svg).replace('currentColor', '#000');
    const img = new Image(); img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(src)));
    await img.decode();
    const W = 1591, H = 540, cv = Object.assign(document.createElement('canvas'), { width: W, height: H });
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, W, H);
    const a = cx.getImageData(0, 0, W, H).data, pts = [];
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 40) {
      pts.push(x, y); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    let r = 0; for (let i = 0; i < pts.length; i += 2) r = Math.max(r, Math.hypot(pts[i] - mx, pts[i + 1] - my));
    const s = 470 / r; // 30px breathing room inside the 500px radius
    const el = document.querySelector('.logo');
    el.style.transform = 'translate(' + (500 - mx * s) + 'px,' + (500 - my * s) + 'px) scale(' + s + ')';
    return Math.round(W * s);
  })();
</script></body></html>`;

// Cover: logo, homepage line and a follow line on the left; a laptop (homepage) and phone (calculators) on the right,
// showing fresh captures of the live site from site-shots.mjs. Real device proportions: 16:10 laptop screen, ~19.5:9 phone.
const SHOT = (f) => fileUrl(path.join(OUT, f));
const coverHtml = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Jost:wght@600&display=block">
<style>${BASE}
  body { width: 1920px; height: 1080px; position: relative; }
  .left { position: absolute; left: 150px; top: 50%; transform: translateY(-50%); width: 760px; }
  .line { font-family: 'Instrument Serif', Georgia, serif; font-size: 88px; line-height: 1.05; margin-top: 34px; }
  .follow { display: inline-block; margin-top: 40px; background: ${NAVY}; color: #fff; font: 600 34px/1 Jost, Arial, sans-serif;
            padding: 22px 36px 24px; border-radius: 999px; }
  .laptop { position: absolute; left: 980px; top: 250px; width: 820px; filter: drop-shadow(0 26px 40px rgba(10,25,48,.22)); }
  .lid { background: #1b1f27; border-radius: 26px 26px 0 0; padding: 22px 22px 26px; }
  .screen { aspect-ratio: 16/10; background: center top/cover no-repeat; border-radius: 4px; }
  .base { height: 22px; margin: 0 -48px; background: linear-gradient(#c9cdd6, #a9aeb9); border-radius: 0 0 22px 22px; position: relative; }
  .base::before { content: ''; position: absolute; left: 50%; top: 0; width: 130px; height: 9px; transform: translateX(-50%);
                  background: #9ca1ad; border-radius: 0 0 10px 10px; }
  .phone { position: absolute; left: 1600px; top: 430px; width: 236px; aspect-ratio: 236/492; background: #1b1f27; border-radius: 40px;
           padding: 11px; filter: drop-shadow(0 26px 40px rgba(10,25,48,.28)); }
  .phone .screen { aspect-ratio: auto; height: 100%; border-radius: 30px; }
</style></head><body>
  <div class="left">
    <div class="logo" style="width:640px">${LOGO}</div>
    <div class="line">Less scrolling.<br>More selling.</div>
    <div class="follow">Follow for tips to grow your business online</div>
  </div>
  <div class="laptop"><div class="lid"><div class="screen" style="background-image:url('${SHOT('shot-laptop.png')}')"></div></div><div class="base"></div></div>
  <div class="phone"><div class="screen" style="background-image:url('${SHOT('shot-phone.png')}')"></div></div>
</body></html>`;

mkdirSync(OUT, { recursive: true });
const browser = await launch();
const pg = await browser.newPage();
for (const [name, html, w, h] of [['profile-photo', photoHtml, 1000, 1000], ['profile-cover', coverHtml, 1920, 1080]]) {
  const f = path.join(OUT, '.' + name + '.html');
  writeFileSync(f, html);
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await pg.goto(fileUrl(f), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  if (name === 'profile-photo') console.log(`logo   ${await pg.evaluate(() => window.fit)}px wide`);
  await pg.screenshot({ path: path.join(OUT, name + '.png') });
  console.log('image  ' + name);
}
// Circle preview so the crop can be checked.
const pv = path.join(OUT, '.circle.html');
writeFileSync(pv, `<body style="margin:0;background:#fff;padding:40px"><img src="${fileUrl(path.join(OUT, 'profile-photo.png'))}" style="width:240px;height:240px;border-radius:50%"></body>`);
await pg.setViewport({ width: 320, height: 320, deviceScaleFactor: 1 });
await pg.goto(fileUrl(pv), { waitUntil: 'networkidle0' });
await pg.screenshot({ path: path.join(OUT, 'profile-photo-circle-preview.png') });
await browser.close();
console.log('done   ' + OUT);
