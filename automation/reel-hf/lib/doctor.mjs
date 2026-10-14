// Setup check for the Reel engine (idea borrowed, with credit, from getgitgirl's claude-reel-editor doctor script,
// MIT). Run it first in any session that makes a Reel; every line that isn't OK says how to fix it.
// Usage: node lib/doctor.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOUNDS, SFX_DIR } from './sounds.mjs';
import scrolly from './brand/scrolly.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUTO = path.join(HERE, '../..');
const HFT = path.join(AUTO, 'hyperframes-test');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
let bad = 0;
const ok = (msg) => console.log(`OK    ${msg}`);
const fail = (msg, fix) => { bad++; console.log(`FIX   ${msg}\n      → ${fix}`); };
const check = (cond, msg, fix) => (cond ? ok(msg) : fail(msg, fix));

const [major] = process.versions.node.split('.').map(Number);
check(major >= 20, `Node ${process.versions.node}`, 'install Node 20 or newer');

for (const exe of ['ffmpeg.exe', 'ffprobe.exe']) {
  const p = path.join(HFT, 'bin', exe);
  let v = '';
  try { v = execFileSync(p, ['-version'], { encoding: 'utf8' }).split('\n')[0].split(' ').slice(0, 3).join(' '); } catch {}
  check(v, `${exe} in hyperframes-test/bin ${v && `(${v})`}`, 'copy ffmpeg + ffprobe into automation/hyperframes-test/bin (HyperFrames needs both on PATH)');
}

let pup = '';
try { pup = createRequire(path.join(HFT, 'package.json'))('puppeteer/package.json').version; } catch {}
check(pup === '25.13.0', `puppeteer ${pup || 'missing'} in hyperframes-test`, 'cd automation/hyperframes-test && npm i puppeteer@25.13.0 (older versions fail with "page.createCDPSession is not a function")');

check(existsSync(EDGE), 'Microsoft Edge (headless browser for storyboards, animatics, covers)', 'install Edge, or point EDGE in lib/animatic.mjs at Chrome');

const py = path.join(AUTO, 'carousels/.venv/Scripts/python.exe');
let fw = false;
try { execFileSync(py, ['-c', 'import faster_whisper'], { stdio: 'ignore' }); fw = true; } catch {}
check(fw, 'faster-whisper in carousels/.venv (transcription)', 'cd automation/carousels && .venv/Scripts/pip install faster-whisper');

check(existsSync(path.join(AUTO, 'reel-studio/prep.mjs')), 'reel-studio/prep.mjs (silence-aware cuts)', 'restore automation/reel-studio/prep.mjs from git');

// sound library (lib/sounds.mjs): a missing sound only matters once a Reel uses it, so this is a note, not a stop
const missingSfx = SOUNDS.filter((s) => !existsSync(path.join(SFX_DIR, `${s.name}.mp3`))).map((s) => s.name);
if (!missingSfx.length) ok(`sound effects (${SOUNDS.length} in lib/sounds.mjs)`);
else console.log(`NOTE  sound effects: ${SOUNDS.length - missingSfx.length} of ${SOUNDS.length}; missing ${missingSfx.join(', ')}
      → download them from the links in lib/sounds.md into lib/assets/sfx (a Reel can't use a sound until it's there)`);
const missingFonts = scrolly.fontFiles.filter((f) => !existsSync(path.join(HERE, 'assets/fonts', f)));
check(!missingFonts.length, `brand fonts (${scrolly.fontFiles.join(', ')})`, `missing in lib/assets/fonts: ${missingFonts.join(', ')}`);
check(existsSync(path.join(HERE, 'assets/js')) && readdirSync(path.join(HERE, 'assets/js')).length, 'GSAP in lib/assets/js', 'copy gsap.min.js from the voice-file Reel into lib/assets/js');

const media = JSON.parse(readFileSync(path.join(AUTO, 'carousels/config/media.json'), 'utf8'));
check(existsSync(media.reelFootageDir), `footage folder ${media.reelFootageDir}`, 'set OneDrive "Scrolly Media" to Always keep on this device, or fix reelFootageDir in carousels/config/media.json');
check(existsSync(media.reelExportsDir), `exports folder ${media.reelExportsDir}`, 'create it (finished Reels, previews and covers go there so they reach her phone)');

console.log(bad ? `\n${bad} thing(s) to fix before making a Reel.` : '\nAll set.');
process.exit(bad ? 1 : 0);
