// Captures fresh screenshots of the live site for the Pinterest profile cover's laptop and phone.
// Usage: node site-shots.mjs   Output: pins/out/profile/shot-laptop.png, shot-phone.png
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out/profile');
const SITE = 'https://theambitiondepartment.com';
const SHOTS = [
  { file: 'shot-laptop.png', url: SITE + '/', w: 1440, h: 900, mobile: false },
  { file: 'shot-phone.png', url: SITE + '/calculators/', w: 390, h: 844, mobile: true },
];

mkdirSync(OUT, { recursive: true });
const browser = await launch();
for (const s of SHOTS) {
  const pg = await browser.newPage();
  await pg.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 2, isMobile: s.mobile, hasTouch: s.mobile });
  await pg.goto(s.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  // Hide the cookie banner and floating buttons in the capture only (fixed elements not pinned to the top edge).
  await pg.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && el.getBoundingClientRect().top > 40) el.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.cmplz-cookiebanner, .cmplz-manage-consent').forEach((el) => el.style.setProperty('display', 'none', 'important'));
  });
  await pg.screenshot({ path: path.join(OUT, s.file) });
  console.log('shot   ' + s.file);
  await pg.close();
}
await browser.close();
