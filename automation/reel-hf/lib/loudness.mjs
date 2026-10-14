// Music level, measured, not guessed. ffmpeg's EBU R128 meter (ebur128) reads her voice track and the music track;
// the music's volume is then set so it sits a fixed number of dB under her voice. Library tracks differ by ~5 dB
// (Mixkit: -9.8 to -15 LUFS), so one fixed volume number can't give every Reel the same level.
//   Quiet    = 25 dB under the voice  (≈ -40 LUFS with her voice at -15)
//   Normal   = 21 dB under            (≈ -36 LUFS, the default)
//   Up front = 17 dB under            (≈ -32 LUFS)
// Before 2026-10-14 music sat at volume 0.02 ≈ -46 LUFS, 31-35 dB under her voice: too quiet to hear on a phone.
// Measurements are cached per file (size + mtime + length) in assets/.loudness.json of the Reel folder.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tool } from './settings.mjs';

export const LEVELS = {
  quiet: { label: 'Quiet', under: 25, say: 'In the background. You notice it if you listen for it.' },
  normal: { label: 'Normal', under: 21, say: 'You hear it clearly; your voice stays well on top.' },
  front: { label: 'Up front', under: 17, say: 'Part of the mood. Good for short, punchy Reels.' },
};
export const DEFAULT_LEVEL = 'normal';
// music more than this many dB under the voice is inaudible on a phone speaker: the build warns
export const WARN_UNDER = 26;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = tool('ffmpeg');
const CACHE = 'assets/.loudness.json';

// integrated loudness (LUFS) of a file, first `seconds` only if given; null if ffmpeg can't read it
export function lufs(file, seconds) {
  if (!existsSync(file)) return null;
  const st = statSync(file), key = `${file}|${st.size}|${Math.round(st.mtimeMs)}|${seconds ? seconds.toFixed(1) : ''}`;
  let cache = {};
  try { cache = JSON.parse(readFileSync(CACHE, 'utf8')); } catch {}
  if (cache[key] != null) return cache[key];
  const p = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, ...(seconds ? ['-t', String(seconds)] : []), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const m = /Integrated loudness:\s*I:\s*(-?[\d.]+) LUFS/.exec(p.stderr || '');
  if (!m) return null;
  cache[key] = +m[1];
  try { writeFileSync(CACHE, JSON.stringify(cache, null, 1)); } catch {}
  return cache[key];
}

const db = (x) => 20 * Math.log10(x);
const r1 = (x) => Math.round(x * 10) / 10;

// volume (0..1, linear, what data-volume takes) that puts the music `under` dB below the voice
export const volumeFor = (voice, music, under) => +Math.min(1, 10 ** ((voice - under - music) / 20)).toFixed(4);

// everything about the music level for one Reel: the volume per level, and where the chosen volume lands
export function musicMix({ voiceFile, musicFile, seconds, volume, level }) {
  const voice = lufs(voiceFile), music = lufs(musicFile, seconds);
  if (voice == null || music == null || music < -60) return { measured: false, voice, music };
  const levels = Object.fromEntries(Object.entries(LEVELS).map(([k, L]) => [k, volumeFor(voice, music, L.under)]));
  const vol = volume ?? levels[level] ?? levels[DEFAULT_LEVEL];
  const out = music + db(vol), under = voice - out;
  return { measured: true, voice: r1(voice), music: r1(music), levels, volume: vol, out: r1(out), under: r1(under), tooQuiet: under > WARN_UNDER };
}
