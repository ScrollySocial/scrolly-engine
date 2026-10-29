// Opening animatic for YouTube 1: the storyboard stills held over her real voice, the music bed and every sound effect
// at its time, so she hears the cold open before anything is built. Run storyboard.mjs first.
// Usage: node animatic.mjs → <exports>/youtube/<id>/animatic-opening.mp4
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ID = path.basename(HERE);
const FF = path.join(HERE, '../../hyperframes-test/bin/ffmpeg.exe');
const SB = path.join(HERE, '../.cache', ID, 'storyboard');
const SFX = path.join(HERE, '../../reel-hf/lib/assets/sfx');
const MUSIC = path.join(HERE, '../../reel-hf/2026-10-13-bb-voice-file/assets/music/music-a.mp3'); // her approved Reel track
const TAKES = 'C:/Users/merce/OneDrive/Scrolly Media/videos/2026-10-28-session';
const OUT = path.join('C:/Users/merce/OneDrive/Scrolly Media/exports/youtube', ID);
mkdirSync(OUT, { recursive: true });

// Voice: the Reel intro 2066 (0.34-10.9) then the first hook line of 2040 (1.01-4.67). Times below are on this timeline.
const intro = [0.34, 10.9], hook = [1.01, 4.67];
const T0 = intro[1] - intro[0]; // the hook starts here (10.56 s)
const total = T0 + hook[1] - hook[0];
// Stills: [file, start, end]; the big TV shrinks into the stack (0a → 0a2 → 0b), the push-in is a 0.5 s crossfade
// from 0b into 0c, then a cut to the hook.
const shots = [['0a-tvs-hundreds', 0, 4.75], ['0a2-tvs-shrink', 4.75, 5.05], ['0b-tvs-six', 5.05, 9.6], ['0c-tvs-push-in', 9.6, T0], ['1-side-statements', T0, total]];
// Sounds (word times from the 2066 transcript, minus 0.34). Never the same sound twice in a row.
const fx = [
  ['mouse-click', 0.0, 0.8], ['static', 0.05, 0.5],   // big TV switches on
  ['pop-light', 2.14, 0.6],                           // "hundreds": headline lands
  ['static', 5.0, 0.5],                               // she jumps into the small TV
  ['mouse-click', 5.35, 0.8],                         // her inbox switches on in the big TV
  ['coins', 6.54, 0.8],                               // "$6"
  ['zoom-in', 9.45, 0.9],                             // push into her TV, out on the wide hook
];

const args = ['-v', 'error', '-y'];
// the push-in still gets 0.5 s extra because the crossfade overlaps it with the still before
shots.forEach(([f, a, b], i) => args.push('-loop', '1', '-t', String(b - a + (i === 3 ? 0.5 : 0)), '-i', path.join(SB, f + '.png')));
args.push('-ss', String(intro[0]), '-t', String(T0), '-i', `${TAKES}/reels/IMG_2066.MOV`);
args.push('-ss', String(hook[0]), '-t', String(hook[1] - hook[0]), '-i', `${TAKES}/youtube/IMG_2040.MOV`);
args.push('-stream_loop', '-1', '-i', MUSIC);
args.push('-f', 'lavfi', '-t', '0.3', '-i', 'anoisesrc=color=white:amplitude=0.5:seed=7');
const n = shots.length, vi = n, hi = n + 1, mi = n + 2, si = n + 3;
const fxIn = [];
for (const [name] of fx) if (name !== 'static') { fxIn.push(args.length); args.push('-i', path.join(SFX, name + '.mp3')); }

const v = shots.map((_, i) => `[${i}:v]scale=1920:1080,fps=30,format=yuv420p,setsar=1,settb=1/30[v${i}]`);
// 0b → 0c as a 0.5 s crossfade (the push-in), the rest are cuts
v.push(`[v0][v1][v2]concat=n=3:v=1:a=0,settb=1/30[ab]`, `[ab][v3]xfade=transition=fade:duration=0.5:offset=${shots[2][2] - 0.5}[abc]`, `[abc][v4]concat=n=2:v=1:a=0[vid]`);
const a = [`[${vi}:a]aresample=48000[vo1]`, `[${hi}:a]aresample=48000[vo2]`, `[vo1][vo2]concat=n=2:v=0:a=1,loudnorm=I=-16:TP=-1.5[voice]`,
  `[${mi}:a]aresample=48000,atrim=0:${total},volume=0.07,afade=t=in:d=1.5,afade=t=out:st=${total - 1.95}:d=1.95[mus]`,
  `[${si}:a]aresample=48000,highpass=f=900,lowpass=f=7000,afade=t=in:d=0.02,afade=t=out:st=0.18:d=0.12,asplit=2[st0][st1]`];
const mixIn = ['[voice]', '[mus]'];
let k = 0, s = 0;
fx.forEach(([name, t], i) => {
  const src = name === 'static' ? `[st${s++}]` : `[${n + 4 + k++}:a]aresample=48000,`;
  a.push(`${name === 'static' ? src + 'volume=0.35,' : src}volume=0.6,adelay=${Math.round(t * 1000)}:all=1[f${i}]`.replace('],volume', ']volume'));
  mixIn.push(`[f${i}]`);
});
a.push(`${mixIn.join('')}amix=inputs=${mixIn.length}:normalize=0:duration=first,alimiter=limit=0.9[aud]`);
const out = path.join(OUT, 'animatic-opening.mp4');
args.push('-filter_complex', [...v, ...a].join(';'), '-map', '[vid]', '-map', '[aud]', '-t', String(total),
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
execFileSync(FF, args, { stdio: 'inherit' });
console.log(out);
