// Step 1 pictures: every moment drawn with the Reel's REAL graphics (final positions) over a still of the speaker, with its
// caption, as review/frames/fNN.jpg. Re-rendered only when the drawn frames change.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from '../settings.mjs';

export async function renderFrames(R, { stills, dir = 'review/frames' }) {
  mkdirSync(dir, { recursive: true });
  const n = R.F.length - 1, files = Array.from({ length: n }, (_, i) => `${dir}/f${String(i + 1).padStart(2, '0')}.jpg`);
  const page = path.resolve('_review-frames.html'); // in the Reel root so asset paths resolve
  R.storyboard(page, { stills, full: true });
  const stamp = createHash('sha1').update(readFileSync(page)).digest('hex'), stampFile = `${dir}/.stamp`;
  if (existsSync(stampFile) && readFileSync(stampFile, 'utf8') === stamp && files.every(existsSync)) { rmSync(page, { force: true }); return files; }
  const b = await launch({ headless: true, userDataDir: path.resolve(dir, '.edge'), timeout: 90000 });
  try {
    const p = await b.newPage();
    await p.setViewport({ width: 1080, height: 1920 });
    await p.goto(pathToFileURL(page).href, { waitUntil: 'load', timeout: 120000 });
    await p.evaluate(() => document.fonts.ready);
    for (let k = 1; k <= n; k++) await (await p.$(`#f${k}`)).screenshot({ path: files[k - 1], type: 'jpeg', quality: 86 });
  } finally { await b.close(); rmSync(page, { force: true }); rmSync(path.resolve(dir, '.edge'), { recursive: true, force: true }); }
  writeFileSync(stampFile, stamp);
  console.log(`${n} moment pictures → ${dir}`);
  return files;
}
