// Studio template: one talking-head take, graphics-rich (ref @li.gorbunova). Settings proven on the first Studio Reel
// (2026-10-13-bb-voice-file). The person's own taste goes in reel-settings.json → templates.studio (merged in here);
// a Reel's build.mjs can still override any value.
import { forTemplate } from '../settings.mjs';
import { sfxLen } from '../sounds.mjs';

export default forTemplate({
  name: 'studio',
  // Footage: long takes are split into muted segments so each fits HyperFrames' 30s ffmpeg extraction window;
  // the voice plays from one full-length audio track.
  segment: 18,
  segmentOverlap: 0.3,
  // Framing: alternate 1.00 / camAlt at every jump cut; punch-ins go to `punch`.
  camAlt: 1.07,
  punch: 1.15,
  camOrigin: '50% 42%',
  // Captions: relaxed one-liners in the lower third, max `maxWords`, break at punctuation, pauses > `gap`, frame edges.
  captions: { top: 128, maxWords: 5, gap: 0.5 },
  // Music: ONE track, ONE static volume + fades (no automation lanes, so Studio's volume moves the whole track).
  // level = Quiet / Normal / Up front, measured against the voice (lib/loudness.mjs); Normal ≈ -36 LUFS, 21 dB under.
  // fallbackVolume only if ffmpeg can't measure. (Was volume 0.02 ≈ -46 LUFS until 2026-10-14: inaudible.)
  music: { level: 'normal', fallbackVolume: 0.07, fadeIn: 4.22, fadeOut: 1.95 },
  // Graphics density: something new on screen every 1 to 2 seconds, one focal point at a time.
  density: '1-2s',
  // Sound effects: the library in lib/sounds.mjs, grouped by job (real lengths in seconds). Never the SAME sound back to back, except list items (one shared sound per list is good).
  sfxLen,
});
