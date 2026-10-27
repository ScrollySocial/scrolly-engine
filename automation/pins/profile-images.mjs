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

// Cover: logo + homepage line on the left, three board-cover Pins fanned on the right.
const pins = ['01-reels', '08-pricing', '05-planning'].map((f) => fileUrl(path.join(COVERS, f + '.png')));
const coverHtml = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=block">
<style>${BASE}
  body { width: 1920px; height: 1080px; position: relative; }
  .left { position: absolute; left: 190px; top: 50%; transform: translateY(-50%); width: 760px; }
  .line { font-family: 'Instrument Serif', Georgia, serif; font-size: 92px; line-height: 1.05; margin-top: 40px; }
  .pin { position: absolute; width: 290px; aspect-ratio: 2/3; background: center/cover no-repeat; border-radius: 20px;
         box-shadow: 0 24px 50px rgba(10,25,48,.22); }
  .p1 { left: 1010px; top: 290px; transform: rotate(-6deg); }
  .p2 { left: 1305px; top: 245px; transform: rotate(2deg); z-index: 2; }
  .p3 { left: 1600px; top: 300px; transform: rotate(7deg); }
</style></head><body>
  <div class="left"><div class="logo">${LOGO}</div><div class="line">Less scrolling.<br>More selling.</div></div>
  ${pins.map((u, i) => `<div class="pin p${i + 1}" style="background-image:url('${u}')"></div>`).join('')}
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
