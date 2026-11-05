// "1 photo of soap, 9 posts": REEL 2, the scent notes (her inspo 2026-11-04: a Pinterest "Kaley watermelon sun
// block" motion ad). A soft solid pastel; her bar big on the left; the scent notes (pineapple, coconut, apple, thyme)
// in one column; one big bold white word per note on the same row. 7 seconds, a loop like the inspo:
//   the bar starts low over the notes > moves straight up, each note + word popping out as it's uncovered > hold >
//   back down the same way, covering them again > ends where it started.
// Everything sits inside the 3:4 part the main Reel's grid tile shows (y 240-1680).
//   node reel2-scent.mjs               draws every frame, then renders <exports>/soap-9-posts/reel-2-v7.mp4 (v2-v6 = rounds 1-5)
//   node reel2-scent.mjs still 6.5     one PNG of that second to <exports>/soap-9-posts/.work/r2scent/still-6.5.png
// The bar is bar.png (cut from her ONE bar photo by build.mjs). The notes are cut-outs in .work/r2scent/ (rembg
// isnet-general-use, alpha tightened): coconut = Pexels 33004189, thyme = Pexels 4198139, apple + pineapple = the
// Pexels cut-outs from the bath-items chat. Pexels License, free to use, no attribution required.
// Anton (fonts/anton.ttf, Google Fonts, OFL): the tall bold sans of the inspo's words.
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const WORK = path.join(TMP, 'r2scent');
const W = 1080, H = 1920, FPS = 30, LEN = 7;
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const url = (f) => pathToFileURL(f).href;

const BG = process.env.BG || '#A9D8F2';  // sky blue from the bar's sea (her inspo's colour, a shade deeper for the words)
// round 2 (her notes): one straight column, each note on the SAME row as its word, pineapple upright
const NOTES = [
  { word: 'PINEAPPLE', img: 'pineapple.png', x: 270, y: 905, w: 140, rot: 0 },
  { word: 'COCONUT<br>WATER', img: 'coconut.png', x: 270, y: 1130, w: 300, rot: 0 },
  { word: 'APPLE', img: 'apple.png', x: 270, y: 1340, w: 220, rot: 0 },
  { word: 'THYME', img: 'thyme.png', x: 270, y: 1545, w: 140, rot: 90 },
];
const WORD_Y = NOTES.map((n) => n.y);
// round 4 (her note, the inspo's motion): the bar starts low in the column, covering the notes, and moves straight up;
// each note (+ its word) pops out as the bar uncovers it. Then the same in reverse on the way down, back to the start,
// so it loops. Bar centre y: low 1395 (bottom edge 1646, covering all four: nothing shows at the start or end) > top 540
const BAR = { low: 1395, top: 540, half: 251, up: [0.5, 2.7], down: [4.4, 6.6] };  // half = half its visible height
const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(Math.max(p, 0), 1));
const barY = (t) => BAR.low - (BAR.low - BAR.top) *
  (sine((t - BAR.up[0]) / (BAR.up[1] - BAR.up[0])) - sine((t - BAR.down[0]) / (BAR.down[1] - BAR.down[0])));
// when the bar's bottom edge passes each note's centre: up = it appears, down = it goes (-1 / 99 = always showing)
for (const n of NOTES) {
  n.up = -1; n.down = 99;
  if (barY(0) + BAR.half < n.y) continue;
  for (let k = 1; k <= LEN * 300; k++) {
    const t = k / 300, shown = barY(t) + BAR.half < n.y;
    if (shown && n.up < 0) n.up = t;
    if (!shown && n.up >= 0 && n.down === 99) n.down = t;
  }
}

function page() {
  const notes = NOTES.map((n, i) => `<img class="n" id="n${i}" src="${url(path.join(WORK, n.img))}" style="width:${n.w}px">` +
    `<div class="w" id="w${i}" style="top:${WORD_Y[i]}px">${n.word}</div>`).join('');
  return `<!doctype html><html><head><style>
@font-face{font-family:Anton;src:url(${url(path.join(HERE, 'fonts/anton.ttf'))})}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
img{position:absolute;left:0;top:0;transform-origin:50% 50%;filter:drop-shadow(-16px 22px 20px rgba(30,70,110,.25))}
#bar{width:525px;z-index:2}
.w{position:absolute;left:520px;width:490px;transform:translateY(-50%);font:400 114px/0.98 Anton;color:#fff;letter-spacing:1px;
  text-shadow:0 3px 14px rgba(20,60,100,.18)}
#title{position:absolute;top:92px;width:100%;text-align:center;font:400 150px/1 Anton;letter-spacing:3px;color:#fff;text-shadow:0 3px 14px rgba(20,60,100,.18)}
</style></head><body>
<div id="title">BAR SOAP</div>
<div class="w" id="sl" style="top:${BAR.top + 20}px">SMELLS<br>LIKE</div>
<img id="bar" src="${url(path.join(TMP, 'bar.png'))}">${notes}
<script>
const NOTES = ${JSON.stringify(NOTES)};
const outBack = (p) => { const c = 1.9; p = Math.min(Math.max(p, 0), 1) - 1; return 1 + (c + 1) * p * p * p + c * p * p; };
const outCubic = (p) => 1 - Math.pow(1 - Math.min(Math.max(p, 0), 1), 3);
const place = (el, cx, cy, s, rot, o) => { el.style.opacity = o;
  el.style.transform = 'translate(' + (cx - el.offsetWidth / 2) + 'px,' + (cy - el.offsetHeight / 2) + 'px) rotate(' + rot + 'deg) scale(' + s + ')'; };
const inCubic = (p) => Math.pow(Math.min(Math.max(p, 0), 1), 3);
const BAR = ${JSON.stringify(BAR)};
const sine = ${sine.toString()};
const barY = ${barY.toString()};
window.setT = (t) => {
  place(document.getElementById('bar'), 270, barY(t), 1, 0, 1);
  // round 6 (her ask): SMELLS LIKE beside the bar while it's at the top
  const sl = outCubic((t - BAR.up[1] + 0.2) / 0.3) * (1 - inCubic((t - BAR.down[0]) / 0.25)), e = document.getElementById('sl');
  e.style.opacity = sl; e.style.transform = 'translate(' + (90 * (1 - sl)) + 'px,-50%)';
  NOTES.forEach((n, i) => {
    // pops out from behind the bar as it's uncovered; shrinks back just as the bar covers it again
    const p = n.up < 0 ? 1 : (t - n.up) / 0.35, s = (p <= 0 ? 0 : outBack(p)) * (1 - inCubic((t - n.down + 0.2) / 0.2));
    place(document.getElementById('n' + i), n.x, n.y, s, n.rot + 14 * (1 - Math.min(Math.max(p, 0), 1)), s > 0.001 ? 1 : 0);
    // its word slides in from the right as it fades up, and back out the same way
    const q = (n.up < 0 ? 1 : outCubic((t - n.up - 0.05) / 0.3)) * (1 - inCubic((t - n.down + 0.25) / 0.25)), w = document.getElementById('w' + i);
    w.style.opacity = q; w.style.transform = 'translate(' + (90 * (1 - q)) + 'px,-50%)';
  });
};
</script></body></html>`;
}

async function frames(times, name) {
  mkdirSync(WORK, { recursive: true });
  const html = path.join(WORK, 'page.html');
  writeFileSync(html, page());
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: W, height: H });
  await pg.goto(url(html), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  for (const [k, t] of times.entries()) {
    await pg.evaluate((t) => window.setT(t), t);
    await pg.screenshot({ path: name(k, t) });
  }
  await b.close();
}

if (process.argv[2] === 'still') {
  const ts = process.argv.slice(3).map(Number);
  await frames(ts, (k, t) => path.join(WORK, `still-${t}.png`));
  console.log(ts.map((t) => path.join(WORK, `still-${t}.png`)).join('\n'));
} else {
  const dir = path.join(WORK, 'f');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  await frames(Array.from({ length: LEN * FPS }, (_, k) => k / FPS), (k) => path.join(dir, `${String(k).padStart(4, '0')}.png`));
  const out = path.join(OUT, 'reel-2-v7.mp4');
  // no sound effects (her ask, round 6): a silent audio track, so it joins the other Reels the same way
  ff(['-framerate', `${FPS}`, '-i', path.join(dir, '%04d.png'), '-f', 'lavfi', '-t', `${LEN}`, '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', '[0:v]format=yuv420p,noise=alls=3:allf=t+u,format=yuv420p[v]',
    '-map', '[v]', '-map', '1:a', '-t', `${LEN}`, '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}
