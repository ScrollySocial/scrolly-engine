// Reels: one reel.json per Reel is the single source for its cover (1080×1920) and its twin carousel (1080×1440).
// Footage lives under media.json → reelFootageDir; frames are grabbed with the ffmpeg that imageio-ffmpeg ships
// in .venv (pip install imageio-ffmpeg), so no system ffmpeg or Docker is needed for stills.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { HERE, cfg, readJson } from './common.mjs';

export const REELS = path.join(HERE, 'reels');
export const reelDir = (id) => path.join(REELS, id);
export const seriesList = () => readJson(path.join(REELS, 'series.json')).series;
export const seriesFor = (id) => seriesList().find((s) => s.id === id) || null;

export function loadReel(id) {
  const p = path.join(reelDir(id), 'reel.json');
  if (!existsSync(p)) throw new Error(`No reel at ${p}`);
  return readJson(p);
}
export const allReelIds = () => readdirSync(REELS, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(path.join(REELS, d.name, 'reel.json'))).map((d) => d.name).sort();

let ffmpegExe;
export function ffmpeg() {
  if (ffmpegExe) return ffmpegExe;
  const bin = path.join(HERE, '.venv/Lib/site-packages/imageio_ffmpeg/binaries');
  const exe = existsSync(bin) && readdirSync(bin).find((f) => /^ffmpeg.*\.exe$/.test(f));
  if (!exe) throw new Error('No ffmpeg. Run: .venv/Scripts/python -m pip install imageio-ffmpeg');
  return (ffmpegExe = path.join(bin, exe));
}

export function clipPath(clip) {
  const dir = cfg('media').reelFootageDir;
  const abs = path.isAbsolute(clip) ? clip : path.join(dir || '', clip);
  if (!existsSync(abs)) throw new Error(`Clip not found: ${abs}`);
  return abs;
}

// Grabs one frame at `at` seconds, cover-cropped to w×h. focus = "x% y%" picks which part survives the crop.
export function grabFrame(clip, at, out, { w, h, focus = '50% 50%' }) {
  const [fx, fy] = focus.split(/\s+/).map((v) => parseFloat(v) / 100);
  mkdirSync(path.dirname(out), { recursive: true });
  const vf = `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}:(iw-${w})*${fx}:(ih-${h})*${fy}`;
  execFileSync(ffmpeg(), ['-v', 'error', '-y', '-ss', String(at || 0), '-i', clipPath(clip), '-frames:v', '1', '-vf', vf, '-q:v', '2', out]);
  return out;
}

export function lintReel(reel) {
  const errors = [], warnings = [];
  const s = seriesFor(reel.series);
  if (!s) errors.push(`series "${reel.series}" is not in reels/series.json`);
  if (!reel.hook) errors.push('hook is empty');
  if (!reel.cover?.clip) errors.push('cover.clip is empty (the cover is a frame from the reel)');
  if (!reel.cta?.text) errors.push('cta.text is empty: every reel ends on a sales CTA');
  const dest = cfg('destinations');
  const offer = reel.cta?.offer || s?.offer;
  const o = dest.offers.find((x) => x.id === offer);
  if (offer && !o) errors.push(`offer "${offer}" is not in config/destinations.json`);
  else if (o && !o.live && !o.upcoming) errors.push(`offer "${offer}" is not live; this reel can't sell it yet`);
  else if (o && !o.live && o.upcoming) {
    // Teaser for an upcoming product (Mercedes 2026-10-10): build interest, no link, no price.
    if (!['follow', 'save'].includes(reel.cta?.type)) errors.push(`${o.name} isn't live yet: use cta.type follow or save (drive interest), not ${reel.cta?.type || 'link-in-bio'}`);
    if (/link in (my )?bio|\$\d/i.test(reel.cta?.text || '')) errors.push(`${o.name} isn't live yet: no link-in-bio or price in the CTA`);
  }
  if (/[—|]/.test([reel.hook, reel.altHook, reel.cta?.text, ...(reel.beats || []).map((b) => b.text)].join(' '))) errors.push('em dash or "|" in reel copy');
  return { errors, warnings, series: s };
}
