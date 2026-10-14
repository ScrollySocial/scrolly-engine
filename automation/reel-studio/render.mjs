// Render a prepped Reel with Remotion.
//   node render.mjs <id> storyboard   → one still per key beat + storyboard.png sheet (approve this first: cheap)
//   node render.mjs <id> full         → final MP4
// Output: <reelExportsDir>/studio/<id>/ (OneDrive, so it reaches Mercedes's phone).
// Browser: Remotion's own headless Chrome; set CHROME to another Chromium (e.g. Edge) if that one hangs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill, renderMedia, openBrowser } from '@remotion/renderer';
import { cfg, launch, fileUrl, esc } from '../carousels/lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [id, mode = 'storyboard'] = process.argv.slice(2);
if (!id) { console.log('Usage: node render.mjs <id> [storyboard|full]'); process.exit(1); }
const props = JSON.parse(readFileSync(path.join(HERE, 'public', id, 'props.json'), 'utf8'));
const comp = { yap: 'Yap' }[props.kit] || 'Yap';
const out = path.join(cfg('media').reelExportsDir, 'studio', id);
mkdirSync(out, { recursive: true });
const browserExecutable = process.env.CHROME || null;

console.log('bundling…');
const serveUrl = await bundle({ entryPoint: path.join(HERE, 'src/index.jsx'), publicDir: path.join(HERE, 'public') });
// One shared browser for every step: launching Chromium can take ~60s on this laptop.
const puppeteerInstance = await openBrowser('chrome', { browserExecutable });
const common = { serveUrl, inputProps: props, browserExecutable, puppeteerInstance, timeoutInMilliseconds: 240000 };
const composition = await selectComposition({ ...common, id: comp });

if (mode === 'full') {
  const file = path.join(out, `${id}.mp4`);
  let last = -1;
  await renderMedia({ ...common, composition, codec: 'h264', crf: 18, outputLocation: file, concurrency: 2,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
  await puppeteerInstance.close({ silent: true });
  console.log(`full → ${file}`);
} else {
  // Key beats: title, each emphasis (mid), a frame after a few cuts, the end card.
  const beats = [{ t: 1.2, label: 'Title + first caption' }];
  for (const e of props.emphasis) beats.push({ t: (e.s + e.e) / 2, label: `Zoom: "${props.words.slice(e.from, e.to + 1).map((w) => w.w).join(' ')}"` });
  for (const c of props.cuts.slice(1).filter((_, k) => k % 2 === 0).slice(0, 3)) beats.push({ t: c + 0.6, label: 'After a cut (alternate framing)' });
  if (props.end) beats.push({ t: props.duration - props.end.dur / 2, label: 'End card' });
  beats.sort((a, b) => a.t - b.t);
  const caption = (t) => props.words.filter((w) => w.s <= t + 1.2 && w.e >= t - 1.2).map((w) => w.w).join(' ');
  for (const [k, b] of beats.entries()) {
    b.file = path.join(out, `beat-${String(k + 1).padStart(2, '0')}.png`);
    await renderStill({ ...common, composition, output: b.file, frame: Math.min(composition.durationInFrames - 1, Math.round(b.t * props.fps)) });
    console.log(`still ${k + 1}/${beats.length} @ ${b.t.toFixed(1)}s`);
  }
  const html = path.join(out, 'storyboard.html');
  writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#F6EEE5;font:15px/1.4 system-ui,sans-serif;color:#161210;width:1600px}
h1{font-size:22px;margin:20px 24px 4px}.sub{margin:0 24px 16px;color:#52525b}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;padding:0 24px 24px}
figure{margin:0;background:#fff;border-radius:10px;overflow:hidden}img{width:100%;display:block}
figcaption{padding:8px 10px}b{display:block}i{color:#52525b;font-style:normal}</style></head><body>
<h1>${esc(id)} · storyboard</h1><p class="sub">${props.duration.toFixed(1)}s · ${props.kit} kit · ${props.music ? 'music: ' + esc(props.music.file) : 'no music (add in Edits)'} · ${props.sfx ? 'sound effects on' : 'no sound effects yet'}</p>
<div class="g">${beats.map((b) => `<figure><img src="${fileUrl(b.file)}"><figcaption><b>${b.t.toFixed(1)}s · ${esc(b.label)}</b><i>“…${esc(caption(b.t))}…”</i></figcaption></figure>`).join('')}</div></body></html>`);
  const browser = await launch();
  const pg = await browser.newPage();
  await pg.setViewport({ width: 1600, height: 900 });
  await pg.goto(fileUrl(html), { waitUntil: 'load' });
  await pg.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
  await pg.screenshot({ path: path.join(out, 'storyboard.png'), fullPage: true });
  await browser.close();
  await puppeteerInstance.close({ silent: true });
  console.log(`storyboard → ${path.join(out, 'storyboard.png')}`);
}
