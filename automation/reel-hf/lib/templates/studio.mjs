// Studio template: one talking-head take, graphics-rich (ref @li.gorbunova). Settings proven on
// 2026-10-13-bb-voice-file and approved by Mercedes. A Reel's build.mjs can override any value.
export default {
  name: 'studio',
  // Footage: long takes are split into muted segments so each fits HyperFrames' 30s ffmpeg extraction window;
  // her voice plays from one full-length audio track.
  segment: 18,
  segmentOverlap: 0.3,
  // Framing: alternate 1.00 / camAlt at every jump cut; punch-ins go to `punch`.
  camAlt: 1.07,
  punch: 1.15,
  camOrigin: '50% 42%',
  // Captions: relaxed one-liners in the lower third, max `maxWords`, break at punctuation, pauses > `gap`, frame edges.
  captions: { top: 128, maxWords: 5, gap: 0.5 },
  // Music: ONE track, ONE static volume + fades (no automation lanes, so Studio's volume moves the whole track).
  music: { volume: 0.02, fadeIn: 4.22, fadeOut: 1.95 },
  // Graphics density: something new on screen every 1 to 2 seconds, one focal point at a time.
  density: '1-2s',
  // Sound effects available in lib/assets/sfx (real lengths in seconds). Never the SAME sound back to back, except list items (one shared sound per list is good).
  sfxLen: { 'pop-light': 0.18, 'pop-bubble': 0.38, nope: 1.2, check: 1.2, 'whoosh-air': 1.6, 'whoosh-fast': 1.4, 'paper-slide': 1.0, chime: 1.25, 'typing-laptop': 2, buzzer: 1.25 },
};
