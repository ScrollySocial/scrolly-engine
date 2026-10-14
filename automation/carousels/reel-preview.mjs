// Renders a Reel preview MP4 from reels/<id>/reel.json: b-roll segments + timed on-screen text, NO music
// (Mercedes adds trending audio in Instagram's Edits app). 1080×1920, H.264, ~15s.
// Segments = hook (cover clip) → beats → CTA. Each can set clip, at (start second), dur, pos (top/center/bottom:
// keep text off her face). Text style: Instagram-classic white highlight boxes (Figtree), readable on any footage.
// Output: <reelExportsDir>/previews/<id>.mp4
// Usage: node reel-preview.mjs <reel-id> [more ids]
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { cfg, esc, fileUrl, launch } from './lib/common.mjs';
import { loadReel, reelDir, ffmpeg, clipPath } from './lib/reels.mjs';

const ids = process.argv.slice(2);
if (!ids.length) { console.log('Usage: node reel-preview.mjs <reel-id>'); process.exit(1); }
const brand = cfg('brand'), media = cfg('media');
const W = 1080, H = 1920;
const POS = { top: 'top:330px', center: 'top:50%;transform:translateY(-50%)', bottom: 'bottom:420px' };
const plain = (s) => esc(String(s).replace(/\*([^*]+)\*/g, '$1')).replace(/\n/g, '<br>');

const overlayHtml = (text, pos) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${brand.fonts.highlight.google.replace(/ /g, '+')}&display=block">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;background:transparent}
.t{position:absolute;left:90px;right:90px;${POS[pos] || POS.top};text-align:center;font:${brand.fonts.highlight.weight} 64px/1.45 '${brand.fonts.highlight.family}',sans-serif;color:#000}
.t span{background:#fff;padding:.08em .34em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}</style></head>
<body><p class="t"><span>${plain(text)}</span></p></body></html>`;

const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H });
for (const id of ids) {
  const reel = loadReel(id), c = reel.cover;
  const segs = [
    { text: c.text || reel.hook, clip: c.clip, at: c.at, pos: reel.hookPos || c.pos || 'top', dur: reel.hookDur || 2.6 },
    ...(reel.beats || []).map((b) => ({ text: b.reelText || b.text, clip: b.clip || c.clip, at: b.at, pos: b.reelPos || b.pos || 'top', dur: b.dur || 2.6 })),
    { text: reel.cta.reelText || reel.cta.text, clip: reel.cta.clip || c.clip, at: reel.cta.at, pos: reel.cta.reelPos || reel.cta.pos || 'top', dur: reel.cta.dur || 3.4 },
  ];
  const tmp = path.join(reelDir(id), '.preview');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const parts = [];
  for (const [i, s] of segs.entries()) {
    const html = path.join(tmp, `t${i}.html`), png = path.join(tmp, `t${i}.png`), mp4 = path.join(tmp, `s${i}.mp4`);
    writeFileSync(html, overlayHtml(s.text, s.pos));
    await pg.goto(fileUrl(html), { waitUntil: 'networkidle0' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: png, omitBackground: true });
    // Trim, cover-crop to 9:16, burn the text in (fades in over 0.2s), constant 30 fps, no audio.
    execFileSync(ffmpeg(), ['-v', 'error', '-y', '-ss', String(s.at || 0), '-t', String(s.dur), '-i', clipPath(s.clip), '-loop', '1', '-t', String(s.dur), '-i', png,
      '-filter_complex', `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=30,setsar=1[v];[1:v]format=rgba,fade=in:st=0:d=0.2:alpha=1[t];[v][t]overlay=0:0:shortest=1,format=yuv420p`,
      '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', mp4]);
    parts.push(mp4);
  }
  const list = path.join(tmp, 'list.txt');
  writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
  const outDir = path.join(media.reelExportsDir, 'previews');
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${id}.mp4`);
  execFileSync(ffmpeg(), ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
  console.log(`preview ${id} (${segs.length} segments, ${segs.reduce((a, s) => a + s.dur, 0).toFixed(1)}s) → ${out}`);
}
await browser.close();
