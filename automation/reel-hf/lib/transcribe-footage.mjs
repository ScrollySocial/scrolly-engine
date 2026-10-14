// Footage → transcript, the first step of every Reel. For each take: pulls a 16 kHz mono wav into the transcripts
// folder (reel-settings.json tools.transcripts) as <Folder>__<File>.wav, then runs tools.transcribeScript (local
// faster-whisper, nothing uploaded) → .json (segments + word timings) and .txt (one timestamped line per segment) next to it.
// Paths are relative to the footage folder (reel-settings.json folders.footage), e.g. "My Series/IMG_0001.MOV".
// Takes already transcribed are skipped. The plan.json keep list then points at audio/<name>.json.
// Usage: node lib/transcribe-footage.mjs "<Folder>/<File>.MOV" ["<Folder>/<File2>.MOV" …]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { P, pythonCmd, tool } from './settings.mjs';

const FF = tool('ffmpeg');
const PY = pythonCmd();
const AUDIO = P.transcripts;
const FOOTAGE = P.footage;

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
execFileSync(PY, [P.transcribeScript, ...wavs], { cwd: path.dirname(P.transcribeScript), stdio: 'inherit' });
for (const w of wavs) console.log(`transcript: ${w.replace(/\.wav$/, '.txt')}  (plan.json: "audio/${path.basename(w, '.wav')}.json")`);
