// Animatic: the approved storyboard frames held for their real durations over her voice, the chosen music and every
// sound effect at its real time. Reviewed BEFORE the full HyperFrames build (sight + sound together).
// Called from a Reel's build.mjs:  await animatic(R, { stills, out })   (run from the Reel folder)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(HERE, '../../hyperframes-test/bin');
const FF = path.join(BIN, 'ffmpeg.exe');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

export async function animatic(R, { stills, out = 'animatic.mp4', preview } = {}) {
  const dir = path.resolve('animatic');
  mkdirSync(dir, { recursive: true });
  const n = R.F.length - 1;

  // 1. full-size frame stills drawn with the Reel's components (temp page in the Reel root so asset paths resolve)
  const page = path.resolve('_animatic-frames.html');
  R.storyboard(page, { stills, full: true });
  const puppeteer = createRequire(path.join(HERE, '../../hyperframes-test/package.json'))('puppeteer');
  const b = await puppeteer.launch({ headless: true, executablePath: EDGE, userDataDir: path.join(dir, '.edge'), timeout: 90000 });
  try {
    const p = await b.newPage();
    await p.setViewport({ width: 1080, height: 1920 });
    await p.goto(pathToFileURL(page).href, { waitUntil: 'load', timeout: 120000 });
    await p.evaluate(() => document.fonts.ready);
    for (let k = 1; k <= n; k++) await (await p.$(`#f${k}`)).screenshot({ path: path.join(dir, `f${String(k).padStart(2, '0')}.png`) });
  } finally { await b.close(); rmSync(page, { force: true }); rmSync(path.join(dir, '.edge'), { recursive: true, force: true }); }

  // 2. picture track: each frame held for its window
  const list = Array.from({ length: n }, (_, i) => `file 'f${String(i + 1).padStart(2, '0')}.png'\nduration ${R.win(i + 1).d}`).join('\n') + `\nfile 'f${String(n).padStart(2, '0')}.png'\n`;
  writeFileSync(path.join(dir, 'frames.txt'), list);

  // 3. sound: voice + music (one volume, fades) + every effect at its time
  const inputs = ['-f', 'concat', '-safe', '0', '-i', path.join(dir, 'frames.txt'), '-i', 'assets/talk-audio.m4a'];
  const chains = ['[1:a]aresample=48000,volume=1[v]'], mix = ['[v]'];
  let k = 2;
  const m = R.musicData;
  if (m) {
    inputs.push('-i', m.file);
    chains.push(`[${k}:a]aresample=48000,atrim=0:${R.DUR},volume=${m.volume},afade=t=in:d=${m.fadeIn},afade=t=out:st=${(R.DUR - m.fadeOut).toFixed(2)}:d=${m.fadeOut}[m]`);
    mix.push('[m]'); k++;
  }
  R.sfxData.forEach((s, i) => {
    inputs.push('-i', s.file);
    const ms = Math.round(s.t * 1000);
    chains.push(`[${k}:a]aresample=48000,atrim=0:${s.d},volume=${s.vol},adelay=${ms}|${ms}[s${i}]`);
    mix.push(`[s${i}]`); k++;
  });
  const filter = `${chains.join(';')};${mix.join('')}amix=inputs=${mix.length}:normalize=0:duration=first[a]`;
  execFileSync(FF, ['-v', 'error', '-y', ...inputs, '-filter_complex', filter, '-map', '0:v', '-map', '[a]',
    '-vf', 'fps=30,scale=540:960,format=yuv420p', '-c:v', 'libx264', '-crf', '22', '-preset', 'veryfast', '-g', '30', '-r', '30', '-c:a', 'aac', '-b:a', '160k',
    '-t', String(R.DUR), '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`${out}: ${n} frames, ${R.sfxData.length} sound effects${m ? ', music ' + path.basename(m.file) : ', no music'}`);
  // player page for the app's browser pane (serve automation/reel-hf with the "reel-previews" launch config, port 8942;
  // file:// pages can't play local video there and Media Player struggled)
  copyFileSync(out, path.join(dir, 'animatic.mp4'));
  writeFileSync(path.join(dir, 'player.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Animatic</title>
<style>body{margin:0;background:#161210;display:grid;place-items:center;min-height:100vh;font:15px sans-serif;color:#F6EEE5}video{height:92vh;max-width:100%;border-radius:10px}</style></head>
<body><div><video src="animatic.mp4" controls preload="auto"></video><p>Animatic · ${R.DUR.toFixed(0)}s</p></div></body></html>`);
  console.log(`play: http://localhost:8942/${path.basename(process.cwd())}/animatic/player.html`);
  // copy (never re-encode or move in place) into OneDrive: an in-place replace during sync left a broken file once
  if (preview) copyFileSync(out, preview);
}
