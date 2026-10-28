// Video Pins: downloads Pexels clips once (assets/stock/<id>.mp4, gitignored, credits in credits.json) and lays the
// rendered see-through overlay PNG over the clip with ffmpeg: cropped to 1000x1500 (2:3), no sound, first N seconds.
// Also writes <id>.png, a still from second 1 with the overlay, for contact sheets.
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { HERE, STOCK_DIR } from './templates.mjs';

// The Reel engine's ffmpeg (automation/hyperframes-test/bin).
export const FFMPEG = path.resolve(HERE, '../hyperframes-test/bin/ffmpeg.exe');
export const clipFile = (id) => path.join(STOCK_DIR, id + '.mp4');

export async function ensureClips(list) {
  const credFile = path.join(STOCK_DIR, 'credits.json');
  const cred = existsSync(credFile) ? JSON.parse(readFileSync(credFile, 'utf8')) : {};
  for (const c of list) {
    if (!existsSync(clipFile(c.id))) {
      const r = await fetch(c.src);
      if (!r.ok) throw new Error(`clip ${c.id}: ${r.status}`);
      writeFileSync(clipFile(c.id), Buffer.from(await r.arrayBuffer()));
      console.log('clip   ' + c.id);
    }
    cred[c.id] = { source: c.page, license: 'Pexels License (free to use, no attribution required)', picked: c.picked };
  }
  writeFileSync(credFile, JSON.stringify(cred, null, 1) + '\n');
}

// p: { id, video: clip id, start?: seconds, seconds?: length, focusX?: 0..1 for landscape clips }
export function composeVideoPin(p, outDir) {
  const overlay = path.join(outDir, p.id + '.overlay.png'), mp4 = path.join(outDir, p.id + '.mp4');
  const x = p.focusX ?? .5;
  // Full-bleed clip, or (p.window = {x, y, w, h}) the clip only inside a panel, e.g. layout H.
  const W = p.window || { x: 0, y: 0, w: 1000, h: 1500 };
  const crop = `scale=${W.w}:${W.h}:force_original_aspect_ratio=increase,crop=${W.w}:${W.h}:(iw-${W.w})*${x}:(ih-${W.h})/2,setsar=1`;
  const graph = p.window
    ? `color=c=black:s=1000x1500:r=25[base];[0:v]${crop}[v];[base][v]overlay=${W.x}:${W.y}:shortest=1[bg];[bg][1:v]overlay=0:0,format=yuv420p`
    : `[0:v]${crop}[bg];[bg][1:v]overlay=0:0,format=yuv420p`;
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-ss', String(p.start || 0), '-t', String(p.seconds || 8), '-i', clipFile(p.video), '-i', overlay,
    '-filter_complex', graph, '-an', '-r', '25', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', mp4]);
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-ss', '1', '-i', mp4, '-frames:v', '1', path.join(outDir, p.id + '.png')]);
  return mp4;
}
