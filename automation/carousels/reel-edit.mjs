// Talking-head Reel editor: cut list in, finished 1080×1920 MP4 out (no music: Mercedes adds audio in Edits).
// reels/<id>/edit.json:
//   { "segments": [ { "src": "<path under reelFootageDir>", "in": 0.7, "out": 18.2, "transcript": "<acc json>",
//                     "cutaway": { "src": "...", "at": 60, "crop": [x, y, w, h] } } ],   // cutaway = other video, same voice
//     "title": { "text": "Day 1", "dur": 3 },          // hook text at the top for the first seconds
//     "end":   { "text": "...Link in bio.", "dur": 4 },  // CTA text over the last seconds
//     "captions": true, "fix": { "squirly": "Scrolly" } }
// Steps: trim each segment (HDR→SDR when needed, 30 fps, 48 kHz) → concat → captions from word timestamps
// (chunks of ≤3 words, lower third, off her face) + title/end PNG overlays → loudness normalize.
// Output: <reelExportsDir>/edits/<id>.mp4.  Usage: node reel-edit.mjs <id>
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { HERE, cfg, esc, fileUrl, launch, readJson } from './lib/common.mjs';
import { reelDir, ffmpeg, clipPath } from './lib/reels.mjs';

const id = process.argv[2];
if (!id) { console.log('Usage: node reel-edit.mjs <id>'); process.exit(1); }
const edit = readJson(path.join(reelDir(id), 'edit.json'));
const brand = cfg('brand'), media = cfg('media');
const W = 1080, H = 1920, FF = ffmpeg();
const tmp = path.join(reelDir(id), '.edit');
mkdirSync(tmp, { recursive: true });
// Trimmed segments are cached by their settings (4K HDR decoding is the slow part); overlays are rebuilt every run.
for (const f of readdirSync(tmp)) if (!/^seg-[0-9a-f]{12}.mp4$/.test(f)) unlinkSync(path.join(tmp, f));

const isHdr = (f) => { try { execFileSync(FF, ['-i', f], { stdio: 'pipe' }); } catch (e) { return /arib-std-b67|smpte2084/.test(String(e.stderr)); } return false; };
const TM = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,';
const fit = `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},fps=30,setsar=1,format=yuv420p`;

// 1. Segments
const parts = [];
let t = 0;
const words = [];
for (const [i, s] of edit.segments.entries()) {
  const src = clipPath(s.src), dur = +(s.out - s.in).toFixed(3), out = path.join(tmp, `seg-${createHash('sha1').update(JSON.stringify([s.src, s.in, s.out, s.cutaway || null])).digest('hex').slice(0, 12)}.mp4`);
  let args;
  if (s.cutaway) {
    const c = s.cutaway, csrc = clipPath(c.src);
    const crop = c.crop ? `crop=${c.crop.join(':')},` : '';
    args = ['-ss', String(s.in), '-t', String(dur), '-i', src, '-ss', String(c.at || 0), '-t', String(dur), '-i', csrc,
      '-filter_complex', `[1:v]${isHdr(csrc) ? TM : ''}${crop}${fit}[v];[0:a]aresample=48000[a]`, '-map', '[v]', '-map', '[a]'];
  } else {
    args = ['-ss', String(s.in), '-t', String(dur), '-i', src, '-vf', `${isHdr(src) ? TM : ''}${fit}`, '-af', 'aresample=48000'];
  }
  if (!existsSync(out)) execFileSync(FF, ['-v', 'error', '-y', ...args, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-c:a', 'aac', '-b:a', '192k', '-ac', '1', out]);
  else console.log(`cached  segment ${i + 1}`);
  parts.push(out);
  if (s.transcript && edit.captions !== false) {
    const segs = readJson(path.join(HERE, 'reels/_work', s.transcript));
    let first = true;
    for (const sg of segs) for (const w of sg.words) if (w.s >= s.in - 0.05 && w.e <= s.out + 0.15) {
      words.push({ w: w.w.trim(), s: t + w.s - s.in, e: Math.min(t + w.e - s.in, t + dur), seg: i, first });
      first = false;
    }
  }
  t += dur;
}
const total = t;
const list = path.join(tmp, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
const joined = path.join(tmp, 'joined.mp4');
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);

// 2. Caption chunks (≤3 words, break after punctuation and at every cut), with clean-up:
//    "$1" + ",000" rejoined, brand names fixed, each segment starts with a capital, edit.insert adds words the
//    transcript dropped ([{ "after": "idea", "before": "gave", "word": "it" }]), edit.fix maps single words.
for (let k = words.length - 1; k > 0; k--) if (/^[,.]?\d/.test(words[k].w) && /\d$/.test(words[k - 1].w) && words[k].seg === words[k - 1].seg) { words[k - 1].w += words[k].w; words[k - 1].e = words[k].e; words.splice(k, 1); }
for (let k = words.length - 1; k > 0; k--) if (/^-\w/.test(words[k].w) && words[k].seg === words[k - 1].seg) { words[k - 1].w += words[k].w; words[k - 1].e = words[k].e; words.splice(k, 1); }
for (let k = words.length - 1; k > 0; k--) if (/^chat$/i.test(words[k - 1].w) && /^gpt/i.test(words[k].w)) { words[k - 1].w = 'ChatGPT' + words[k].w.slice(3); words[k - 1].e = words[k].e; words.splice(k, 1); }
for (const ins of edit.insert || []) for (let k = 0; k < words.length - 1; k++) {
  const a = words[k], b = words[k + 1];
  if (a.w.toLowerCase().replace(/[^a-z]/g, '') === ins.after && b.w.toLowerCase().replace(/[^a-z]/g, '') === ins.before) words.splice(k + 1, 0, { ...b, w: ins.word, e: b.s, first: false });
}
for (const w of words) if (w.first) w.w = w.w[0].toUpperCase() + w.w.slice(1);
for (const w of words) if (!w.first && /^(Get|Little|You|Show|Mini)$/.test(w.w)) w.w = w.w.toLowerCase();
const fix = { '1k': '$1K', club: 'Club', squirly: 'Scrolly', squirley: 'Scrolly', schooly: 'Scrolly', squirrely: 'Scrolly', scrolling: 'Scrolly', cod: 'Claude', chad: 'Chat', ...(edit.fix || {}) };
const fixWord = (w) => { if (edit.exact?.[w]) return edit.exact[w]; const k = w.toLowerCase().replace(/[^a-z0-9]/g, ''); return fix[k] ? w.replace(new RegExp(k, 'i'), fix[k]) : w; };
const chunks = [];
let cur = [];
for (const w of words) {
  cur.push({ ...w, w: fixWord(w.w) });
  const next = words[words.indexOf(w) + 1];
  if (cur.length >= 3 || /[.,?!]$/.test(w.w) || (next && next.seg !== w.seg)) { chunks.push(cur); cur = []; }
}
if (cur.length) chunks.push(cur);
const caps = chunks.map((c, k) => ({ text: c.map((x) => x.w).join(' ').replace(/\s+([.,?!])/g, '$1'), s: c[0].s, e: Math.max(c.at(-1).e, (chunks[k + 1]?.[0].s ?? c.at(-1).e)) }))
  .map((c) => ({ ...c, e: Math.min(c.e, c.s + 2.5) }));

// 3. Overlay PNGs
const font = brand.fonts.highlight;
const capHtml = (txt) => `<div class="cap">${esc(txt)}</div>`;
const boxHtml = (txt, top) => `<p class="box" style="top:${top}px"><span>${esc(txt)}</span></p>`;
const page = (inner) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${font.google.replace(/ /g, '+')}&display=block">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;background:transparent}
.cap{position:absolute;left:70px;right:70px;top:1330px;text-align:center;font:800 76px/1.1 '${font.family}',sans-serif;color:#fff;
-webkit-text-stroke:12px #161210;paint-order:stroke fill;text-shadow:0 4px 14px rgba(0,0,0,.45)}
.box{position:absolute;left:90px;right:90px;text-align:center;font:${font.weight} 62px/1.45 '${font.family}',sans-serif;color:#000}
.box span{background:#fff;padding:.08em .34em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}</style></head><body>${inner}</body></html>`;
const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H });
// One frame per time slice holding every overlay active in it (caption + title/end), joined into a single
// transparent track, so the final pass is one overlay instead of dozens (the old way used 4+ GB of memory).
const endStart = edit.end ? total - edit.end.dur : Infinity;
const events = [];
for (const c of caps) if (c.s < endStart) events.push({ s: c.s, e: Math.min(c.e, endStart), html: capHtml(c.text) });
if (edit.title) events.push({ s: 0, e: edit.title.dur, html: boxHtml(edit.title.text, 300) });
if (edit.end) events.push({ s: endStart, e: total, html: boxHtml(edit.end.text, 1250) });
const cuts = [...new Set([0, total, ...events.flatMap((e) => [e.s, e.e])].map((x) => +Math.min(Math.max(x, 0), total).toFixed(2)))].sort((a, b) => a - b);
const lines = [];
for (let k = 0; k < cuts.length - 1; k++) {
  const a = cuts[k], b = cuts[k + 1];
  if (b - a < 0.01) continue;
  const html = events.filter((e) => e.s <= a + 0.001 && e.e >= b - 0.001).map((e) => e.html).join('');
  const f = path.join(tmp, `o${k}.html`), p = path.join(tmp, `o${k}.png`);
  writeFileSync(f, page(html));
  await pg.goto(fileUrl(f), { waitUntil: 'load', timeout: 90000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: p, omitBackground: true });
  lines.push(`file '${p.replace(/\\/g, '/')}'`, `duration ${(b - a).toFixed(3)}`);
}
lines.push(lines.at(-2));
await browser.close();
const olist = path.join(tmp, 'overlay.txt');
writeFileSync(olist, lines.join('\n'));
const track = path.join(tmp, 'overlay.mov');
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', olist, '-vf', 'fps=30,format=rgba', '-c:v', 'qtrle', track]);
const burned = path.join(tmp, 'burned.mp4');
execFileSync(FF, ['-v', 'error', '-y', '-i', joined, '-i', track, '-filter_complex', '[0:v][1:v]overlay=0:0:shortest=1[v]', '-map', '[v]', '-map', '0:a',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-c:a', 'copy', burned]);
const src = burned;
const outDir = path.join(media.reelExportsDir, 'edits');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${id}.mp4`);
execFileSync(FF, ['-v', 'error', '-y', '-i', src, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
writeFileSync(path.join(reelDir(id), 'captions.txt'), caps.map((c) => `${c.s.toFixed(2)}-${c.e.toFixed(2)} ${c.text}`).join('\n'));
console.log(`edit ${id}: ${edit.segments.length} segments, ${caps.length} captions, ${total.toFixed(1)}s → ${out}`);
