// Renders a Reel cover from reels/<id>/reel.json: a frame from the reel + the series' cover template.
// Writes <reelExportsDir>/<id>/cover.png (1080×1920, upload as the Reel cover) and cover-grid.png (the 3:4 crop
// the profile grid shows), then refreshes <reelExportsDir>/covers.html (every cover, phone + grid view).
// Usage: node reel-cover.mjs <reel-id> [more ids]   |   node reel-cover.mjs --all
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { cfg, fileUrl, esc, launch } from './lib/common.mjs';
import { loadReel, lintReel, grabFrame, reelDir, allReelIds, seriesFor } from './lib/reels.mjs';
import { coverHtml, linesFor, CW, CH } from './lib/reel-covers.mjs';
import { execFileSync } from 'node:child_process';
import { HERE } from './lib/common.mjs';

const args = process.argv.slice(2);
const ids = args.includes('--all') ? allReelIds() : args;
if (!ids.length) { console.log('Usage: node reel-cover.mjs <reel-id> | --all'); process.exit(1); }
const brand = cfg('brand'), media = cfg('media');

const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: CW, height: CH, deviceScaleFactor: 1 });
let failed = 0;
for (const id of ids) {
  const reel = loadReel(id);
  const { errors, series } = lintReel(reel);
  for (const e of errors) console.log(`ERROR   ${id}: ${e}`);
  if (!reel.cover?.clip) { failed++; continue; }
  const c = reel.cover;
  const frame = grabFrame(c.clip, c.at, path.join(reelDir(id), '.cover-frame.jpg'), { w: CW, h: CH, focus: c.focus });
  const template = c.template || series?.cover.template;
  // "behind": cut her out of the frame so the big text can sit behind her (local rembg, first run downloads the model).
  let matte = null;
  if (template === 'behind') {
    matte = path.join(reelDir(id), '.cover-matte.png');
    execFileSync(path.join(HERE, '.venv/Scripts/python.exe'), [path.join(HERE, 'cutout.py'), '--matte', frame, matte], { stdio: 'ignore' });
  }
  const html = coverHtml({
    template, lines: linesFor(c, c.text || reel.hook), pos: c.pos, photoUrl: fileUrl(frame), matteUrl: matte && fileUrl(matte),
    theme: c.theme || series?.cover.theme, accent: c.accent || series?.cover.accent, arrow: c.arrow !== false, serifStyle: process.env.SERIF_STYLE || c.serifStyle || series?.cover.serifStyle,
  }, brand);
  const file = path.join(reelDir(id), '.cover.html');
  writeFileSync(file, html);
  await pg.goto(fileUrl(file), { waitUntil: 'networkidle0' });
  await pg.waitForFunction(() => document.body.dataset.fit, { timeout: 15000 });
  const fit = await pg.evaluate(() => document.body.dataset.fit);
  const out = path.join(media.reelExportsDir, id + (process.env.SERIF_STYLE ? '-' + process.env.SERIF_STYLE : ''));
  mkdirSync(out, { recursive: true });
  await pg.screenshot({ path: path.join(out, 'cover.png') });
  await pg.screenshot({ path: path.join(out, 'cover-grid.png'), clip: { x: 0, y: 240, width: CW, height: 1440 } });
  if (fit.startsWith('fail')) { failed++; console.log(`ERROR   ${id}: cover text doesn't fit the grid-safe band even at ${fit.slice(5)}px; shorten it`); }
  else console.log(`cover   ${id} (${template}, scale ${fit.slice(3)}) → ${path.join(out, 'cover.png')}`);
}
await browser.close();

// Review page: grid view (how the profile shows them) + full 9:16 covers.
const done = allReelIds().filter((id) => existsSync(path.join(media.reelExportsDir, id, 'cover.png')));
const rows = done.map((id) => { const r = loadReel(id); return { id, r, s: seriesFor(r.series) }; });
writeFileSync(path.join(media.reelExportsDir, 'covers.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reel covers</title><style>
body{font:16px/1.5 system-ui,sans-serif;margin:0;background:#f4f4f5;color:#18181b}main{max-width:1200px;margin:0 auto;padding:24px 16px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 10px}p{color:#52525b;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;max-width:520px;background:#fff}.grid img{width:100%;display:block}
.full{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}.full figure{margin:0}
.full img{width:100%;display:block;border-radius:10px}.full figcaption{font-size:15px;color:#3f3f46;margin-top:6px}
</style></head><body><main><h1>Reel covers</h1><p>Covers are 1080×1920. The grid shows the middle 3:4, which is where all text sits.</p>
<h2>Profile grid view</h2><div class="grid">${rows.map(({ id }) => `<img src="${esc(id)}/cover-grid.png" alt="">`).join('')}</div>
<h2>Full covers</h2><div class="full">${rows.map(({ id, r, s }) => `<figure><img src="${esc(id)}/cover.png" alt=""><figcaption><b>${esc(s?.name || r.series)}</b><br>${esc(r.cover?.template || s?.cover.template)}</figcaption></figure>`).join('')}</div>
</main></body></html>`);
console.log(`\nreview page: ${path.join(media.reelExportsDir, 'covers.html')}`);
if (failed) process.exit(1);
