// Footage → transcript, the first step of every Reel. For each take: pulls a 16 kHz mono wav into
// carousels/reels/_work/audio/<Folder>__<File>.wav, then runs carousels/transcribe.py (local faster-whisper, nothing
// uploaded) → .json (segments + word timings) and .txt (one timestamped line per segment) next to it.
// Paths are relative to the footage folder (media.json → reelFootageDir), e.g. "Business Brain/IMG_1996.MOV".
// Takes already transcribed are skipped. The plan.json keep list then points at audio/<name>.json.
// Usage: node lib/transcribe-footage.mjs "<Folder>/<File>.MOV" ["<Folder>/<File2>.MOV" …]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUTO = path.join(HERE, '../..');
const CAR = path.join(AUTO, 'carousels');
const FF = path.join(AUTO, 'hyperframes-test/bin/ffmpeg.exe');
const PY = path.join(CAR, '.venv/Scripts/python.exe');
const AUDIO = path.join(CAR, 'reels/_work/audio');
const FOOTAGE = JSON.parse(readFileSync(path.join(CAR, 'config/media.json'), 'utf8')).reelFootageDir;

const takes = process.argv.slice(2);
if (!takes.length) { console.log('Usage: node lib/transcribe-footage.mjs "<Folder>/<File>.MOV" …'); process.exit(1); }
mkdirSync(AUDIO, { recursive: true });

const wavs = [];
for (const take of takes) {
  const src = path.isAbsolute(take) ? take : path.join(FOOTAGE, take);
  if (!existsSync(src)) throw new Error(`footage not found: ${src}`);
  const name = path.relative(FOOTAGE, src).replace(/\.[^.]+$/, '').replace(/[\\/]/g, '__').replace(/\s+/g, '_');
  const wav = path.join(AUDIO, `${name}.wav`);
  if (!existsSync(wav)) execFileSync(FF, ['-v', 'error', '-y', '-i', src, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav], { stdio: 'inherit' });
  wavs.push(wav);
}
execFileSync(PY, [path.join(CAR, 'transcribe.py'), ...wavs], { cwd: CAR, stdio: 'inherit' });
for (const w of wavs) console.log(`transcript: ${path.relative(CAR, w.replace(/\.wav$/, '.txt'))}  (plan.json: "audio/${path.basename(w, '.wav')}.json")`);
