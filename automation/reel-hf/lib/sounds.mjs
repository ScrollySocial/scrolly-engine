// Sound library: every sound effect the engine knows, grouped by job, with its Mixkit source. ONE list for three uses:
//   - templates/studio.mjs reads the lengths (sfxLen), doctor.mjs checks the files are there
//   - `node lib/sounds.mjs --md`  writes lib/sounds.md, the customer download checklist (Mixkit's license forbids
//     shipping their files inside a tool, so customers download them once by hand; see vault selling-research.md)
//   - `node lib/sounds.mjs --get` downloads any missing file into lib/assets/sfx (the owner's own library only; never shipped to customers)
// Source ids were matched by file size against Mixkit's previews (2026-10-14). Length = where the sound ends (ffmpeg silencedetect, -50 dB), not the file's padded length.
import { existsSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const JOBS = {
  pop: 'Pop: something appears (a badge, a sticker, a chat bubble)',
  whoosh: 'Whoosh: something moves in or out, or the scene changes',
  success: 'Success: a tick, a right answer, a win',
  fail: 'Fail: a wrong answer, the bad example',
  typing: 'Typing: text being written on screen',
  riser: 'Riser: build-up into a reveal',
  click: 'Click: a cursor or button press, a photo taken',
  ding: 'Ding: an idea, a notification, a point landing',
  scratch: 'Record scratch: "wait, stop"',
  paper: 'Paper and sparkle: a card slides, something turns magic',
};

// name = file name in assets/sfx (what build.mjs uses); id = Mixkit item; cat = Mixkit category page it is listed on
export const SOUNDS = [
  { name: 'pop-light', job: 'pop', len: 0.18, id: 3005, title: 'Explainer video pops whoosh light pop', cat: 'pop', use: 'small things popping on, list items' },
  { name: 'pop-bubble', job: 'pop', len: 0.38, id: 2357, title: 'Bubble pop up alert notification', cat: 'pop', use: 'a bigger element popping on' },
  { name: 'pop-message', job: 'pop', len: 0.15, id: 2354, title: 'Message pop alert', cat: 'notification', use: 'a chat bubble or DM arriving', new: true },
  { name: 'whoosh-air', job: 'whoosh', len: 1.6, id: 1489, title: 'Air woosh', cat: 'whoosh', use: 'a panel or card sliding in' },
  { name: 'whoosh-fast', job: 'whoosh', len: 1.4, id: 1490, title: 'Fast whoosh transition', cat: 'whoosh', use: 'whip transitions' },
  { name: 'swoosh-in', job: 'whoosh', len: 0.8, id: 166, title: 'Fast small sweep transition', cat: 'swoosh', use: 'a small graphic sweeping in', new: true },
  { name: 'swoosh-out', job: 'whoosh', len: 2.2, id: 1482, title: 'Ending wind swoosh', cat: 'swoosh', use: 'a graphic leaving, end of a section', new: true },
  { name: 'zoom-in', job: 'whoosh', len: 0.6, id: 2608, title: 'Air zoom vacuum', cat: 'transition', use: 'zoom-in transitions and punch-ins', new: true },
  { name: 'check', job: 'success', len: 1.2, id: 957, title: 'Correct positive notification', cat: 'correct', use: 'a tick appearing, the good example' },
  { name: 'reward', job: 'success', len: 2.2, id: 952, title: 'Correct answer reward', cat: 'correct', use: 'the result or payoff moment', new: true },
  { name: 'coins', job: 'success', len: 0.75, id: 1993, title: 'Clinking coins', cat: 'money', use: 'money, sales, prices', new: true },
  { name: 'nope', job: 'fail', len: 1.2, id: 2876, title: 'Funny fail low tone', cat: 'wrong', use: 'the bad example (one, not three in a row)' },
  { name: 'buzzer', job: 'fail', len: 1.25, id: 954, title: 'Wrong long buzzer', cat: 'wrong', use: 'a big "wrong" moment' },
  { name: 'sad-trombone', job: 'fail', len: 5.25, id: 472, title: 'Slow sad trombone fail', cat: 'wrong', use: 'a funny letdown (use rarely)', new: true },
  { name: 'typing-laptop', job: 'typing', len: 2, id: 2531, title: 'Typing on a laptop keyboard', cat: 'click', use: 'longer typing on screen (cut to the moment)' },
  { name: 'typing-short', job: 'typing', len: 3.6, id: 1376, title: 'Typing on an electronic device', cat: 'typewriter', use: 'a short prompt or word typed', new: true },
  { name: 'typewriter-bell', job: 'typing', len: 1.5, id: 1368, title: 'Typewriter return bell', cat: 'typewriter', use: 'end of a typed line, "done"', new: true },
  { name: 'riser', job: 'riser', len: 2.7, id: 2669, title: 'Short sci-fi swell', cat: 'swell', use: 'a short build into a reveal', new: true },
  { name: 'camera', job: 'click', len: 0.4, id: 1133, title: 'Camera shutter click', cat: 'camera', use: 'a photo, a screenshot, a post appearing', new: true },
  { name: 'mouse-click', job: 'click', len: 0.2, id: 1113, title: 'Mouse click close', cat: 'click', use: 'a cursor clicking a button', new: true },
  { name: 'chime', job: 'ding', len: 1.25, id: 766, title: 'Alert quick chime', cat: 'notification', use: 'a point landing' },
  { name: 'bell', job: 'ding', len: 2.6, id: 933, title: 'Bell notification', cat: 'notification', use: 'a notification, an idea arriving', new: true },
  { name: 'record-scratch', job: 'scratch', len: 1.15, id: 702, title: 'Record player vinyl scratch', cat: 'dj-record-scratch', use: '"wait, stop", a turn in the story', new: true },
  { name: 'paper-slide', job: 'paper', len: 1.0, id: 1530, title: 'Paper slide', cat: 'paper', use: 'a card, receipt or page sliding in' },
  { name: 'sparkle', job: 'paper', len: 1.15, id: 3062, title: 'Magic wand sparkle', cat: 'sparkle', use: 'something turning "magic", a transformation', new: true },
];

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SFX_DIR = path.join(HERE, 'assets/sfx');
export const sfxLen = Object.fromEntries(SOUNDS.map((s) => [s.name, s.len]));
const preview = (id) => `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`;

function markdown() {
  const rows = (job) => SOUNDS.filter((s) => s.job === job).map((s) => `| \`${s.name}.mp3\` | ${s.title} | [${s.cat}](https://mixkit.co/free-sound-effects/${s.cat}/) · [download](https://mixkit.co/free-sound-effects/download/${s.id}/) | ${s.use} |`).join('\n');
  return `# Sound effects: download checklist

The Reel engine uses ${SOUNDS.length} free sound effects from [Mixkit](https://mixkit.co/free-sound-effects/). Mixkit's
license lets you use them in your Reels, but doesn't let us ship the files inside the engine, so you download them once
yourself (about 10 minutes).

1. For each row, open the **download** link (or the category page and find the sound by its exact title).
2. Press **Download Free SFX** and save the file.
3. Rename it to the name in the first column and put it in \`lib/assets/sfx/\`.
4. Run \`node lib/doctor.mjs\`: it lists any sound still missing. A missing sound is skipped, so a Reel still renders
   without it.

Your own sounds work too: drop any short mp3 into \`lib/assets/sfx/\` and it shows up in the review page's sound library.
Music: download your own tracks the same way (Mixkit's [free music](https://mixkit.co/free-stock-music/) or any library
you have a license for) into your Reel's \`assets/music/\` folder.

${Object.entries(JOBS).map(([job, label]) => `## ${label}\n\n| File name | Mixkit title | Links | Use it for |\n|---|---|---|---|\n${rows(job)}`).join('\n\n')}

License: [Mixkit Sound Effects Free License](https://mixkit.co/license/#sfxFree). Free for commercial use in your
videos; don't redistribute the files on their own.
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--md')) { writeFileSync(path.join(HERE, 'sounds.md'), markdown()); console.log(`lib/sounds.md: ${SOUNDS.length} sounds`); }
  else if (process.argv.includes('--get')) {
    for (const s of SOUNDS) {
      const f = path.join(SFX_DIR, `${s.name}.mp3`);
      if (existsSync(f)) continue;
      const r = await fetch(preview(s.id));
      if (!r.ok) { console.log(`✗ ${s.name}: HTTP ${r.status}`); continue; }
      writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      console.log(`✓ ${s.name} (${s.title}, ${Math.round(statSync(f).size / 1024)} KB)`);
    }
  } else for (const [job, label] of Object.entries(JOBS)) console.log(`${label}\n  ${SOUNDS.filter((s) => s.job === job).map((s) => s.name + (existsSync(path.join(SFX_DIR, `${s.name}.mp3`)) ? '' : ' (missing)')).join(', ')}`);
}
