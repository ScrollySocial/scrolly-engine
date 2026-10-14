// Footage step for a HyperFrames Reel. Runs the silence-aware cut (reel-settings.json tools.cutScript, default
// reel-studio/prep.mjs, which reads carousels/reels/<prep-id>/plan.json) unless --skip-cut, then fills <reel>/assets with:
//   talk.mp4            the prepped take (1080x1920 SDR 30fps, loudness normalized)
//   talk-audio.m4a      the voice as one full-length track
//   talk-seg/talk-N.mp4 muted ~18s segments, 0.3s overlap (HyperFrames' frame extraction has a 30s ffmpeg window)
//   words.json          word timings on the talk.mp4 timeline (+ jump-cut times for camera alternation)
// Usage: node lib/prep-footage.mjs <reel-folder> <prep-id> [--skip-cut]
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import studio from './templates/studio.mjs';
import { P, tool } from './settings.mjs';

const FF = tool('ffmpeg');
const FP = tool('ffprobe');
const CUT = path.dirname(P.cutScript);
const [dir, id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!dir || !id) { console.log('Usage: node lib/prep-footage.mjs <reel-folder> <prep-id> [--skip-cut]'); process.exit(1); }
const reelDir = path.resolve(dir), A = path.join(reelDir, 'assets');

if (!process.argv.includes('--skip-cut')) execFileSync(process.execPath, [path.basename(P.cutScript), id], { cwd: CUT, stdio: 'inherit' });
const pub = path.join(CUT, 'public', id);
if (!existsSync(path.join(pub, 'base.mp4'))) throw new Error(`no prepped take at ${pub}`);

mkdirSync(path.join(A, 'talk-seg'), { recursive: true });
copyFileSync(path.join(pub, 'base.mp4'), path.join(A, 'talk.mp4'));
copyFileSync(path.join(pub, 'props.json'), path.join(A, 'words.json'));
const ff = (...args) => execFileSync(FF, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
ff('-i', path.join(A, 'talk.mp4'), '-vn', '-c:a', 'copy', path.join(A, 'talk-audio.m4a'));

const dur = +execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(A, 'talk.mp4')], { encoding: 'utf8' }).trim();
const SEG = studio.segment, OV = studio.segmentOverlap;
for (let i = 0; i * SEG < dur; i++) {
  ff('-ss', String(i * SEG), '-t', String(SEG + OV), '-i', path.join(A, 'talk.mp4'), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(A, 'talk-seg', `talk-${i}.mp4`));
}
console.log(`prep-footage: ${dur.toFixed(2)}s → ${Math.ceil(dur / SEG)} segments + voice track + words.json in ${A}`);
