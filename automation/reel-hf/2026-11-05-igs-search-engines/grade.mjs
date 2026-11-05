// Flattering look (Mercedes 2026-11-04: soft skin, slight glow, warm), baked into the prepped footage so the review
// preview and the render both carry it. Run after every prep-footage (prep overwrites talk.mp4 + talk-seg/*).
// The raw prepped files stay in assets/raw/. Filter: sketch/grade/filter.txt (her OK'd before/after, 2026-11-05).
// Usage: node grade.mjs   (needs ../../hyperframes-test/bin/ffmpeg)
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, renameSync } from 'node:fs';

const FF = '../../hyperframes-test/bin/ffmpeg';
const G = readFileSync('sketch/grade/filter.txt', 'utf8').trim();
mkdirSync('assets/raw/talk-seg', { recursive: true });
const files = ['talk.mp4', ...readdirSync('assets/talk-seg').filter((f) => f.endsWith('.mp4')).map((f) => `talk-seg/${f}`)];
for (const f of files) {
  const src = `assets/${f}`, raw = `assets/raw/${f}`, tmp = `assets/${f}.tmp.mp4`;
  if (!existsSync(raw)) copyFileSync(src, raw); // a fresh prep replaces raw too: delete assets/raw first after re-prepping
  execFileSync(FF, ['-v', 'error', '-y', '-i', raw, '-vf', `${G},format=yuv420p`, '-c:v', 'libx264', '-crf', '16', '-preset', 'medium',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'copy', tmp], { stdio: 'inherit' });
  renameSync(tmp, src);
  console.log(`graded ${f}`);
}
