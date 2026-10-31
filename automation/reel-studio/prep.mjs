// Prep for a Remotion Reel: accurate cuts + a single base video + word timings.
// Reads ../carousels/reels/<id>/plan.json:
//   { "kit": "yap", "segments": [ { "src": "<under reelFootageDir>", "in": 0.7, "out": 18.2, "transcript": "audio/x.json" } ],
//     "title": "...", "emphasis": ["phrase", ...], "end": { "lines": ["..."], "dur": 4 }, "music": null,
//     "exact": { "Redwood,": "Read what" }, "insert": [...], "drop": [{ "after": "way", "word": "and" }] }
// Cut rule (fixes clipped words): transcript times are only a guide. Each cut point moves into the real silence
// found by ffmpeg silencedetect around it, keeping 0.12s of air before speech and 0.2s after; if there's no
// silence nearby it pads instead of cutting tight. Every piece gets 15ms audio fades so cuts don't click.
// Writes public/<id>/base.mp4 (1080×1920 SDR 30fps) and public/<id>/props.json (for the Remotion composition).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg, clipPath } from '../carousels/lib/reels.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REELS = path.join(HERE, '../carousels/reels');
const id = process.argv[2];
if (!id) { console.log('Usage: node prep.mjs <reel-id>'); process.exit(1); }
const plan = JSON.parse(readFileSync(path.join(REELS, id, 'plan.json'), 'utf8'));
const FF = ffmpeg(), W = 1080, H = 1920, FPS = 30;
const out = path.join(HERE, 'public', id), cache = path.join(HERE, '.cache', id);
mkdirSync(out, { recursive: true }); mkdirSync(cache, { recursive: true });

const probe = (f) => spawnSync(FF, ['-i', f], { encoding: 'utf8' }).stderr;
const isHdr = (f) => /arib-std-b67|smpte2084/.test(probe(f));
const TM = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,';

// Silences in [a, b] of a file's audio, in source seconds.
function silences(src, a, b, noise = plan.noiseDb ?? -34) {
  const r = spawnSync(FF, ['-ss', String(Math.max(0, a)), '-t', String(b - Math.max(0, a)), '-i', src, '-vn', '-af', `silencedetect=noise=${noise}dB:d=0.12`, '-f', 'null', '-'], { encoding: 'utf8' });
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
function refine(src, seg) {
  // plan.pad { before, after } (seconds): the segments are already measured speech islands, so cut exactly that much
  // air around them (tight jump cuts: no glances away between lines). A segment's own padAfter wins (a held pause).
  if (plan.pad) return { start: +Math.max(0, seg.in - plan.pad.before).toFixed(3), end: +(seg.out + (seg.padAfter ?? plan.pad.after)).toFixed(3), tight: false };
  const sil = silences(src, seg.in - 1.2, seg.out + 1.2);
  // start: the silence that ends closest to (and not long after) the first word
  const before = sil.filter(([, e]) => e <= seg.in + 0.15).at(-1);
  const start = before ? Math.max(before[0], before[1] - 0.12) : seg.in - 0.2;
  const after = sil.find(([s]) => s >= seg.out - 0.15);
  const end = after ? Math.min(after[1], after[0] + 0.2) : seg.out + 0.35;
  // Never trust silence over the transcript: soft word starts/ends can read as silence.
  return { start: +Math.max(0, Math.min(start, seg.in - 0.1)).toFixed(3), end: +Math.max(end, seg.out + 0.15).toFixed(3), tight: !before || !after };
}

// Refine every cut first, then merge pieces of the same clip that now touch or overlap (no repeated audio).
const cuts = [];
for (const s of plan.segments) {
  const r = refine(clipPath(s.src), s), prev = cuts.at(-1);
  if (prev && prev.s.src === s.src && r.start < prev.end + 0.05) { prev.end = Math.max(prev.end, r.end); prev.s = { ...prev.s, out: s.out }; continue; }
  cuts.push({ s, ...r });
}

// Yap pacing: inside each piece, pauses longer than plan.maxPause (default 0.45s) shrink to a 0.24s breath,
// but only where no transcript word falls inside the silence.
const maxPause = plan.maxPause ?? 0.4;
const pieces = [];
for (const c of cuts) {
  const src = clipPath(c.s.src);
  const tw = c.s.transcript ? JSON.parse(readFileSync(path.join(REELS, '_work', c.s.transcript), 'utf8')).flatMap((x) => x.words) : [];
  let cur = c.start;
  for (const [a, b] of silences(src, c.start, c.end)) {
    if (b - a <= maxPause || a <= c.start + 0.05 || b >= c.end - 0.05) continue;
    if (tw.some((w) => w.s > a + 0.05 && w.s < b - 0.05)) continue; // a word starts inside: real speech
    // A tiny first piece followed by a pause is a false start ("So... so if you're tired"): drop it.
    const first = cur === c.start, len = a + 0.12 - cur;
    if (!(first && len < 0.45)) pieces.push({ s: c.s, start: cur, end: +(a + 0.12).toFixed(3), tight: c.tight });
    else console.log(`dropped false start ${cur.toFixed(2)}-${(a + 0.12).toFixed(2)}`);
    cur = +(b - 0.12).toFixed(3);
  }
  pieces.push({ s: c.s, start: cur, end: c.end, tight: c.tight });
}

const parts = [], words = [], cutTimes = [], usedWords = new Set();
let t = 0;
for (const [i, { s, start, end, tight }] of pieces.entries()) {
  const src = clipPath(s.src);
  const dur = +(end - start).toFixed(3);
  const key = createHash('sha1').update(JSON.stringify([s.src, start, end])).digest('hex').slice(0, 12);
  const file = path.join(cache, `seg-${key}.mp4`);
  if (!existsSync(file)) {
    const vf = `${isHdr(src) ? TM : ''}scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},fps=${FPS},setsar=1,format=yuv420p`;
    const af = `aresample=48000,afade=t=in:d=0.015,afade=t=out:st=${(dur - 0.015).toFixed(3)}:d=0.015`;
    execFileSync(FF, ['-v', 'error', '-y', '-ss', String(start), '-t', String(dur), '-i', src, '-vf', vf, '-af', af,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', file]);
  }
  console.log(`segment ${i + 1}: ${s.in}-${s.out} → ${start}-${end}${tight ? ' (padded: no clear silence on one side)' : ''}`);
  parts.push(file);
  cutTimes.push(+t.toFixed(3));
  if (s.transcript) {
    const segs = JSON.parse(readFileSync(path.join(REELS, '_work', s.transcript), 'utf8'));
    // A word belongs to the piece it starts in (ends can drift into a trimmed pause); only the first word after a
    // real cut (not a trimmed pause) gets a capital.
    let first = i === 0 || pieces[i - 1].s !== s;
    // plan.pad cuts sit on the real speech onset, and transcript starts often drift earlier into the silence: there a
    // word belongs to the first piece it overlaps (each transcript word used once).
    const inPiece = (w) => (plan.pad ? w.e > start + 0.05 && w.s < end - 0.05 && !usedWords.has(`${s.transcript}|${w.s}`) : w.s >= start - 0.05 && w.s < end);
    for (const sg of segs) for (const w of sg.words) if (inPiece(w)) {
      usedWords.add(`${s.transcript}|${w.s}`);
      words.push({ w: w.w.trim(), s: +(t + Math.max(w.s, start) - start).toFixed(3), e: +(t + Math.min(w.e, end) - start).toFixed(3), seg: i, first }); first = false;
    }
  }
  t += dur;
}
const list = path.join(cache, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', path.join(out, 'base.mp4')]);

// Word clean-up (same rules as the old editor): rejoin "$1"+",000" and "well"+"-written", ChatGPT, brand names,
// capital at each cut, plan.insert / plan.exact.
for (let k = words.length - 1; k > 0; k--) {
  const a = words[k - 1], b = words[k];
  if (a.seg !== b.seg) continue;
  if ((/^[,.]?\d/.test(b.w) && /\d$/.test(a.w)) || /^-\w/.test(b.w)) { a.w += b.w; a.e = b.e; words.splice(k, 1); }
  else if (/^chat$/i.test(a.w) && /^gpt/i.test(b.w)) { a.w = 'ChatGPT' + b.w.slice(3); a.e = b.e; words.splice(k, 1); }
}
for (const ins of plan.insert || []) for (let k = 0; k < words.length - 1; k++) {
  const n = (x) => x.toLowerCase().replace(/[^a-z]/g, '');
  if (n(words[k].w) === ins.after && n(words[k + 1].w) === ins.before) words.splice(k + 1, 0, { ...words[k + 1], w: ins.word, e: words[k + 1].s, first: false });
}
// plan.drop [{after, word}]: remove a word the transcript placed inside the cut that isn't in the audio.
for (const d of plan.drop || []) for (let k = words.length - 1; k > 0; k--) {
  const n = (x) => x.toLowerCase().replace(/[^a-z]/g, '');
  if (n(words[k - 1].w) === d.after && n(words[k].w) === d.word) { words[k - 1].e = Math.max(words[k - 1].e, words[k].e); words.splice(k, 1); }
}
const fix = { '1k': '$1K', squirly: 'Scrolly', squirley: 'Scrolly', schooly: 'Scrolly', squirrely: 'Scrolly', scrolling: 'Scrolly', cod: 'Claude', ...(plan.fix || {}) };
for (const w of words) {
  if (plan.exact?.[w.w]) { w.w = plan.exact[w.w]; continue; }
  const k = w.w.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (fix[k]) w.w = w.w.replace(new RegExp(k, 'i'), fix[k]);
  if (w.first) w.w = w.w[0].toUpperCase() + w.w.slice(1);
}
// Emphasis phrases → word index ranges (drive zooms, peach caption color and sound effects).
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9$]/g, '');
const emphasis = [];
for (const phrase of plan.emphasis || []) {
  const target = phrase.split(/\s+/).map(norm);
  const k = words.findIndex((_, j) => target.every((tw, q) => words[j + q] && norm(words[j + q].w) === tw));
  if (k < 0) { console.log(`WARN emphasis not found: "${phrase}"`); continue; }
  emphasis.push({ from: k, to: k + target.length - 1, s: words[k].s, e: words[k + target.length - 1].e });
}
const props = { id, kit: plan.kit || 'yap', fps: FPS, duration: +t.toFixed(3), video: `${id}/base.mp4`, words, emphasis, cuts: cutTimes,
  title: plan.title || null, end: plan.end || null, music: plan.music || null, sfx: plan.sfx || null, grade: plan.grade || null };
writeFileSync(path.join(out, 'props.json'), JSON.stringify(props, null, 1));
console.log(`prep ${id}: ${parts.length} segments, ${t.toFixed(1)}s, ${words.length} words, ${emphasis.length} emphasis → public/${id}/`);
