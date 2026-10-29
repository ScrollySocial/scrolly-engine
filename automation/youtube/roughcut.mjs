// YouTube long-form rough cut: the Reel engine's cut rules (reel-studio/prep.mjs) for horizontal 16:9 video.
// Reads youtube/<id>/plan.json:
//   { "title": "...", "maxPause": 0.6, "segments": [ { "src": "<under footage folder>", "in": 1.0, "out": 23.3, "beat": "Hook", "cropY": 0.2 } ] }
//   cropY = where a 16:9 window sits on a vertical take; "fit": "blur" shows the whole vertical take over a blurred copy instead
// Each cut point moves into real silence (0.12s air before speech, 0.2s after), pauses longer than maxPause shrink
// to a breath when no transcript word starts inside them, HDR (iPhone HLG) is tone-mapped to SDR.
// Writes <exports>/<id>/roughcut.mp4 (1920×1080 30fps, -14 LUFS) and youtube/<id>/timeline.md (where each beat starts).
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
function refine(f, seg) {
  const sil = silences(f, seg.in - 1.2, seg.out + 1.2);
  const before = sil.filter(([, e]) => e <= seg.in + 0.15).at(-1);
  const start = before ? Math.max(before[0], before[1] - 0.12) : seg.in - 0.2;
  const after = sil.find(([s]) => s >= seg.out - 0.15);
  const end = after ? Math.min(after[1], after[0] + 0.2) : seg.out + 0.35;
  return { start: +Math.max(0, Math.min(start, seg.in - 0.1)).toFixed(3), end: +Math.max(end, seg.out + 0.15).toFixed(3) };
}

const maxPause = plan.maxPause ?? 0.6;
const pieces = [];
for (const s of plan.segments) {
  const f = src(s), c = refine(f, s);
  const tw = existsSync(transcript(s)) ? JSON.parse(readFileSync(transcript(s), 'utf8')).flatMap((x) => x.words) : [];
  let cur = c.start, first = true;
  for (const [a, b] of silences(f, c.start, c.end)) {
    if (b - a <= maxPause || a <= c.start + 0.05 || b >= c.end - 0.05) continue;
    if (tw.some((w) => w.s > a + 0.05 && w.s < b - 0.05)) continue;
    pieces.push({ s, start: cur, end: +(a + 0.12).toFixed(3), first });
    cur = +(b - 0.2).toFixed(3); first = false;
  }
  pieces.push({ s, start: cur, end: c.end, first });
}

const parts = [], beats = [];
let t = 0;
for (const [i, { s, start, end, first }] of pieces.entries()) {
  const f = src(s), dur = +(end - start).toFixed(3);
  const key = createHash('sha1').update(JSON.stringify([s.src, start, end, W, s.fit ?? 'crop', s.cropY])).digest('hex').slice(0, 12);
  const file = path.join(cache, `seg-${key}.mp4`);
  if (!existsSync(file)) {
    // cropY: where the 16:9 window sits on a taller (vertical) take, 0 = top, 0.5 = middle (default)
    // fit "blur": the whole vertical take in the middle, a soft blurred copy of it filling the sides (no close crop)
    const fit = s.fit === 'blur'
      ? `split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40,eq=brightness=-0.04[bg];[b]scale=-2:${H}:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:0`
      : `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}:(iw-${W})/2:(ih-${H})*${s.cropY ?? 0.5}`;
    const vf = `${isHdr(f) ? TM : ''}${fit},fps=${FPS},setsar=1,format=yuv420p`;
    const af = `aresample=48000,afade=t=in:d=0.015,afade=t=out:st=${(dur - 0.015).toFixed(3)}:d=0.015`;
    execFileSync(FF, ['-v', 'error', '-y', '-ss', String(start), '-t', String(dur), '-i', f, '-vf', vf, '-af', af,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', file]);
  }
  if (first && s.beat) beats.push({ t, beat: s.beat, take: path.basename(s.src) });
  console.log(`piece ${i + 1}/${pieces.length}: ${path.basename(s.src)} ${start}-${end}`);
  parts.push(file);
  t += dur;
}
const list = path.join(cache, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', path.join(out, 'roughcut.mp4')]);

const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
writeFileSync(path.join(HERE, id, 'timeline.md'), `# ${plan.title}: rough cut timeline (${mmss(t)})\n\n` +
  beats.map((b) => `- ${mmss(b.t)} ${b.beat} (${b.take})`).join('\n') + '\n');
console.log(`roughcut ${id}: ${pieces.length} pieces, ${mmss(t)} → ${path.join(out, 'roughcut.mp4')}`);
