// Instagram settings Reels: her phone screen recording goes AFTER the hook take on the same talk.mp4 timeline, so the
// engine (cuts, captions, review proxy, render) treats it like more footage. The voice track gets matching silence.
// Run after prep-footage + grade (grade only touches the hook: run grade.mjs first, then this).
// screen.json: { "src": "<under the videos folder>", "width": 960, "parts": [{ "in": 11.2, "out": 17.0, "speed": 3, "y": 222, "hold": 1.3 }, …] }
// (hold = seconds the part's last frame stays on, for the comment bar at the end)
// Screen recordings are SDR (bt709, 1284x2778, 60 fps): scaled to S.width (default 1080) wide, cropped to 1920 from y,
// padded to 1080 with white (Instagram's own background, so the real UI just gets wider margins; room for a ring
// around a label that starts at the screen edge). Nothing redrawn. Writes the joined talk.mp4, talk-audio.m4a, talk-seg/*, and words.json duration + screenAt.
// Usage: node screen.mjs   (raw hook kept in assets/raw/hook-graded.mp4, so re-running is safe)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';

const FF = '../../hyperframes-test/bin/ffmpeg', FP = '../../hyperframes-test/bin/ffprobe';
const VIDEOS = 'C:/Users/merce/OneDrive/Scrolly Media/videos';
const S = JSON.parse(readFileSync('screen.json', 'utf8'));
const ff = (...a) => execFileSync(FF, ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
const vdur = (f) => +execFileSync(FP, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();
const dur = (f) => +execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();

mkdirSync('assets/raw', { recursive: true });
const hook = 'assets/raw/hook-graded.mp4';
if (!existsSync(hook)) copyFileSync('assets/talk.mp4', hook); // first run: talk.mp4 is the graded hook
const W = JSON.parse(readFileSync('assets/words.json', 'utf8'));
const hookDur = +vdur(hook).toFixed(3); // video length: the hook's audio runs a few frames longer

// each part: trimmed, sped up, scaled to 1080 wide, top 1920 kept, 30 fps; then joined
const src = path.join(VIDEOS, S.src);
const parts = S.parts.map((p, i) => {
  const f = `assets/raw/screen-${i}.mp4`;
  ff('-ss', String(p.in), '-to', String(p.out), '-i', src, '-an', '-vf', `setpts=PTS/${p.speed || 1},scale=${S.width || 1080}:-2:flags=lanczos,crop=${S.width || 1080}:1920:0:${p.y || 0},pad=1080:1920:(ow-iw)/2:0:white,fps=30${p.hold ? `,tpad=stop_mode=clone:stop_duration=${p.hold}` : ''},format=yuv420p`,
    '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', f);
  return f;
});
const list = 'assets/raw/screen-list.txt';
writeFileSync(list, parts.map((f) => `file '${path.basename(f)}'`).join('\n'));
ff('-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', 'assets/raw/screen.mp4');
const screenDur = +vdur('assets/raw/screen.mp4').toFixed(3);

// hook (video + voice) + screen (video + silence)
ff('-i', hook, '-i', 'assets/raw/screen.mp4', '-filter_complex',
  `[0:v]fps=30,format=yuv420p,setsar=1[v0];[1:v]setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v];[0:a]atrim=0:${hookDur},apad=whole_dur=${(hookDur + screenDur).toFixed(3)}[a]`,
  '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', 'assets/talk.mp4');
ff('-i', 'assets/talk.mp4', '-vn', '-c:a', 'copy', 'assets/talk-audio.m4a');
const total = vdur('assets/talk.mp4');
rmSync('assets/talk-seg', { recursive: true, force: true }); mkdirSync('assets/talk-seg');
for (let i = 0; i * 18 < total; i++) ff('-ss', String(i * 18), '-t', '18.3', '-i', 'assets/talk.mp4', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `assets/talk-seg/talk-${i}.mp4`);
W.duration = +total.toFixed(2); W.screenAt = hookDur;
writeFileSync('assets/words.json', JSON.stringify(W, null, 1));
console.log(`screen.mjs: hook ${hookDur}s + screen ${screenDur}s = ${total.toFixed(2)}s (${readdirSync('assets/talk-seg').length} segments)`);
