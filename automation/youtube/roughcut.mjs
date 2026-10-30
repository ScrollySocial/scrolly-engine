// YouTube long-form rough cut: the Reel engine's cut rules (reel-studio/prep.mjs) for horizontal 16:9 video.
// Reads youtube/<id>/plan.json:
//   { "title": "...", "maxPause": 0.6, "segments": [ { "src": "<under footage folder>", "in": 1.0, "out": 23.3, "beat": "Hook", "cropY": 0.2 } ] }
//   "hardIn"/"hardOut": true cut exactly at in/out instead of snapping into the nearest silence; "pad": muted seconds after a hard out (default 0.3)
//   cropY = where a 16:9 window sits on a vertical take; "fit": "blur" shows the whole vertical take over a blurred copy instead
// Each cut point moves into real silence (0.12s air before speech, 0.2s after), pauses longer than maxPause shrink
// to a breath when no transcript word starts inside them, HDR (iPhone HLG) is tone-mapped to SDR.
// Writes <exports>/<id>/roughcut.mp4 (1920×1080 30fps, -14 LUFS), youtube/<id>/timeline.md (where each beat starts) and
// youtube/<id>/words.json (every word's time in the cut, for graphics and captions).
// Usage: node roughcut.mjs <id>
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FF = path.join(HERE, '../hyperframes-test/bin/ffmpeg.exe');
const FOOTAGE = 'C:/Users/merce/OneDrive/Scrolly Media/videos';
const EXPORTS = 'C:/Users/merce/OneDrive/Scrolly Media/exports/youtube';
const AUDIO = path.join(HERE, '../carousels/reels/_work/audio');
const id = process.argv[2];
if (!id) { console.log('Usage: node roughcut.mjs <id>'); process.exit(1); }
const plan = JSON.parse(readFileSync(path.join(HERE, id, 'plan.json'), 'utf8'));
const W = 1920, H = 1080, FPS = 30;
const out = path.join(EXPORTS, id), cache = path.join(HERE, '.cache', id);
mkdirSync(out, { recursive: true }); mkdirSync(cache, { recursive: true });

const src = (s) => path.join(FOOTAGE, s.src);
const transcript = (s) => path.join(AUDIO, s.src.replace(/\.[^.]+$/, '').replace(/[\\/]/g, '__').replace(/\s+/g, '_') + '.json');
const isHdr = (f) => /arib-std-b67|smpte2084/.test(spawnSync(FF, ['-i', f], { encoding: 'utf8' }).stderr);
const TM = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,';

function silences(f, a, b, noise = plan.noiseDb ?? -34) {
  const r = spawnSync(FF, ['-ss', String(Math.max(0, a)), '-t', String(b - Math.max(0, a)), '-i', f, '-vn', '-af', `silencedetect=noise=${noise}dB:d=0.12`, '-f', 'null', '-'], { encoding: 'utf8' });
  const res = [], base = Math.max(0, a);
  let st = null;
  for (const line of r.stderr.split('\n')) {
    const s = line.match(/silence_start: ([\d.]+)/), e = line.match(/silence_end: ([\d.]+)/);
    if (s) st = base + +s[1];
    if (e && st !== null) { res.push([st, base + +e[1]]); st = null; }
  }
  if (st !== null) res.push([st, b]);
  return res;
}
const LOOSE = plan.looseNoiseDb ?? -28; // second pass for spots where room noise sits above the strict threshold
function refine(f, seg) {
  let sil = silences(f, seg.in - 1.2, seg.out + 1.2);
  // no quiet at an edge at the strict threshold: look again at the loose one before falling back to a blind offset
  if (!sil.some(([, e]) => e <= seg.in + 0.15 && e > seg.in - 1.2) || !sil.some(([s]) => s >= seg.out - 0.15))
    sil = [...sil, ...silences(f, seg.in - 1.2, seg.out + 1.2, LOOSE)].sort((x, y) => x[0] - y[0]);
  const before = sil.filter(([, e]) => e <= seg.in + 0.15).at(-1);
  const start = before ? Math.max(before[0], before[1] - 0.12) : seg.in;
  const after = sil.find(([s]) => s >= seg.out - 0.15);
  // up to 0.45 s of the pause after the last word, so the next take never starts on top of a sentence end
  const end = after ? Math.min(after[1], after[0] + 0.45) : seg.out;
  // hardIn / hardOut: cut exactly there (a leftover word runs straight into the kept one, with no silence to snap to)
  return { start: seg.hardIn ? seg.in : +Math.max(0, before ? Math.min(start, seg.in - 0.1) : start).toFixed(3),
    end: seg.hardOut ? seg.out : +(after ? Math.max(end, seg.out + 0.15) : end).toFixed(3) };
}

const maxPause = plan.maxPause ?? 0.6;
const pieces = [];
for (const s of plan.segments) {
  const f = src(s), c = refine(f, s);
  const tw = existsSync(transcript(s)) ? JSON.parse(readFileSync(transcript(s), 'utf8')).flatMap((x) => x.words) : [];
  // gaps to remove, as [cut at, resume at]: silences longer than maxPause with no word inside, plus hesitations the
  // transcript shows (over 1.1 s between words) that room noise kept silencedetect from hearing
  const gaps = [];
  for (const [a, b] of silences(f, c.start, c.end)) {
    if (b - a <= maxPause || a <= c.start + 0.05 || b >= c.end - 0.05) continue;
    if (tw.some((w) => w.s > a + 0.05 && w.s < b - 0.05)) continue;
    gaps.push([a + 0.12, b - 0.2]);
  }
  for (let k = 0; k + 1 < tw.length; k++) {
    if (tw[k + 1].s - tw[k].e <= 1.1 || tw[k].e < c.start || tw[k + 1].s > c.end) continue;
    // Whisper word times run early, so never cut on them: find the real quiet stretch (looser threshold, since room
    // noise hid it from the strict pass) inside the gap, and skip the gap if there is none
    const q = silences(f, tw[k].e - 0.2, tw[k + 1].s + 0.4, LOOSE).filter(([x, y]) => y - x > 0.5).sort((m, n) => (n[1] - n[0]) - (m[1] - m[0]))[0];
    if (q && q[0] + 0.12 > c.start + 0.1 && q[1] - 0.15 < c.end - 0.1) gaps.push([q[0] + 0.12, q[1] - 0.15]);
  }
  gaps.sort((x, y) => x[0] - y[0]);
  let cur = c.start, first = true;
  for (const [a, b] of gaps) {
    if (a <= cur + 0.05) { cur = Math.max(cur, +b.toFixed(3)); continue; } // overlaps the previous gap
    pieces.push({ s, start: cur, end: +a.toFixed(3), first });
    cur = +b.toFixed(3); first = false;
  }
  // a hard cut ends on 0.3 s of muted picture: a breath before the next take instead of a clipped run-on
  pieces.push({ s, start: cur, end: c.end, first, pad: s.hardOut ? (s.pad ?? 0.3) : 0 });
}

const parts = [], beats = [], words = [], cuts = [];
const wordsOf = (s) => (existsSync(transcript(s)) ? JSON.parse(readFileSync(transcript(s), 'utf8')).flatMap((x) => x.words) : []);
let t = 0;
for (const [i, { s, start, end: end0, first, pad = 0 }] of pieces.entries()) {
  const end = +(end0 + pad).toFixed(3);
  const f = src(s), dur = +(end - start).toFixed(3);
  const key = createHash('sha1').update(JSON.stringify([s.src, start, end, W, s.fit ?? 'crop', s.cropY, 'pre1080', pad])).digest('hex').slice(0, 12);
  const file = path.join(cache, `seg-${key}.mp4`);
  if (!existsSync(file)) {
    // cropY: where the 16:9 window sits on a taller (vertical) take, 0 = top, 0.5 = middle (default)
    // fit "blur": the whole vertical take in the middle, a soft blurred copy of it filling the sides (no close crop)
    const fit = s.fit === 'blur'
      ? `split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40,eq=brightness=-0.04[bg];[b]scale=-2:${H}:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:0`
      : `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}:(iw-${W})/2:(ih-${H})*${s.cropY ?? 0.5}`;
    // shrink to 1080p before the HDR tone-map (the float conversion on full 4K frames is ~4x slower, same result at 1080p)
    const pre = s.fit === 'blur' ? `scale=-2:${H}:flags=lanczos,` : `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,`;
    const vf = `${isHdr(f) ? pre + TM : ''}${fit},fps=${FPS},setsar=1,format=yuv420p`;
    const af = pad ? `aresample=48000,afade=t=in:d=0.015,afade=t=out:st=${(dur - pad - 0.03).toFixed(3)}:d=0.03`
      : `aresample=48000,afade=t=in:d=0.015,afade=t=out:st=${(dur - 0.015).toFixed(3)}:d=0.015`;
    execFileSync(FF, ['-v', 'error', '-y', '-ss', String(start), '-t', String(dur), '-i', f, '-vf', vf, '-af', af,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', file]);
  }
  cuts.push({ t: +t.toFixed(3), take: path.basename(s.src), src: s.src, in: start, out: end });
  if (first && s.beat) beats.push({ t, beat: s.beat, take: path.basename(s.src) });
  // every spoken word on the cut's timeline (graphics timing + captions)
  for (const w of wordsOf(s)) if (w.s >= start && w.s < end) words.push({ w: w.w.trim(), t: +(t + w.s - start).toFixed(3), e: +(t + Math.min(w.e, end) - start).toFixed(3) });
  console.log(`piece ${i + 1}/${pieces.length}: ${path.basename(s.src)} ${start}-${end}`);
  parts.push(file);
  t += dur;
}
const list = path.join(cache, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', path.join(out, 'roughcut.mp4')]);

const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
writeFileSync(path.join(HERE, id, 'words.json'), JSON.stringify({ duration: +t.toFixed(3), beats, cuts, words }) + '\n');
writeFileSync(path.join(HERE, id, 'timeline.md'), `# ${plan.title}: rough cut timeline (${mmss(t)})\n\n` +
  beats.map((b) => `- ${mmss(b.t)} ${b.beat} (${b.take})`).join('\n') + '\n');
console.log(`roughcut ${id}: ${pieces.length} pieces, ${mmss(t)} → ${path.join(out, 'roughcut.mp4')}`);
