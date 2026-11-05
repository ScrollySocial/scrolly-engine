// Reel 4, v2 (2026-11-04): her inspo is a Pinterest sunscreen motion ad: the product held up big against a deep blue
// sky, round white line icons joined to it by thin lines, each one labelled. Here: her ONE bar photo (the cut-out
// .work/bar.png that build.mjs makes) rises into a clear blue sky, then her real recipe draws on one callout at a time
// (line, then circle, then icon + label fade in). Her hook stays: the white box on top, "but here we are." types on last.
//   node reel4-callouts.mjs            renders <exports>/soap-9-posts/reel-4-v4.mp4
//   node reel4-callouts.mjs still 5.5  writes preview stills (seconds, comma list) to <exports>/soap-9-posts/.work/r4v4-still-*.jpg
// Sky: clips/30098016.mp4, Pexels "Clear Blue Sky with White Clouds" (https://www.pexels.com/video/30098016/, Pexels
// License, free to use), 1080×1920. Don't edit build.mjs from here: other chats share it.
import { mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const SKY = path.join(HERE, 'clips/30098016.mp4');
const BAR = path.join(TMP, 'bar.png');
const W = 1080, H = 1920, FPS = 30, DUR = 7;
const SKY_AT = 13;   // 13-20s of the sky clip is clean deep blue (earlier, clouds drift behind the labels)
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const GRAIN = 'format=yuv420p,noise=alls=3:allf=t+u';
// the sky a touch deeper and bluer, like the inspo, with a slow push-in
const SKY_VF = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},` +
  `scale=${W * 1.08}:${H * 1.08},crop=${W}:${H}:'(iw-ow)/2':'(ih-oh)/2-40+40*t/${DUR}',eq=saturation=1.12:gamma=0.94`;

const font = (f, fam, w = 'normal') => `@font-face{font-family:${fam};src:url(data:font/woff2;base64,${readFileSync(path.join(FONTS, f)).toString('base64')});font-weight:${w}}`;
const CSS = font('figtree.woff2', 'Figtree', '300 900') + font('bricolage-800.woff2', 'Bricolage', 800) +
  `html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}`;

// simple white line icons, drawn in a -50..50 box
const ICON = {
  hand: '<path d="M-18 44V24Q-30 14-38-2Q-40-10-32-10Q-26-10-20 2L-18 6V-28Q-18-34-12-34Q-6-34-6-28V-4V-40Q-6-46 0-46Q6-46 6-40V-4V-36Q6-42 12-42Q18-42 18-36V-2V-26Q18-32 24-32Q30-32 30-26V14Q30 34 16 44"/>',
  leaf: '<path d="M-30 32C-34-14 4-38 36-36C38-4 18 34-30 32Z"/><path d="M-30 32L22-20"/>',
  palm: '<path d="M4 44Q8 6-2-14"/><path d="M-2-14Q-22-34-44-22M-2-14Q-30-12-38 8M-2-14Q18-36 42-26M-2-14Q26-14 36 8"/><circle cx="-8" cy="-6" r="6"/><circle cx="6" cy="-4" r="6"/>',
  olive: '<path d="M-40 38Q0 4 38-38"/><path d="M-14 14Q-34 6-36-16Q-14-10-14 14Z"/><path d="M8-8Q28 0 34 20Q12 14 8-8Z"/><path d="M10-14Q4-36 18-46Q24-26 10-14Z"/><ellipse cx="-4" cy="30" rx="10" ry="14" transform="rotate(-35 -4 30)"/>',
  drop: '<path d="M0-40C16-18 30-2 30 14A30 30 0 0 1-30 14C-30-2-16-18 0-40Z"/><path d="M-14 16A14 14 0 0 0 0 30"/>',
  superfat: '<path d="M0-42C16-20 32-4 32 12A32 32 0 0 1-32 12C-32-4-16-20 0-42Z"/><text x="0" y="24" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="26" fill="#fff" stroke="none">10%</text>',
  snow: '<path d="M0-40V40M-35-20L35 20M-35 20L35-20"/><path d="M-10-32L0-22L10-32M-10 32L0 22L10 32M-37-6L-24-12L-27-26M37 6L24 12L27 26M-27 26L-24 12L-37 6M27-26L24-12L37-6"/>',
};
// her three claims (2026-11-04, replacing the recipe list): [label, icon, side, circle centre y, when it starts drawing]
const CALLOUTS = [
  ['handmade', 'hand', 'L', 640, 0.9],
  ['all-natural<br>ingredients', 'leaf', 'R', 830, 1.5],
  ['super-<br>moisturizing<br>formula', 'drop', 'L', 1080, 2.1],
];
const HERE_AT = 3.1;   // "but here we are." lands
const R = 98;          // circle radius
const CX = { L: 150, R: W - 150 };
// the bar: bar.png drawn at BAR_S px; the bar itself spans about x 12.5-84% and y 4.5-99.5% of the png
const BAR_S = 730, BAR_X = 540 - 0.4825 * BAR_S, BAR_Y = 530;
const EDGE = { L: BAR_X + 0.15 * BAR_S, R: BAR_X + 0.81 * BAR_S };   // where each line ends, just onto the bar

function page() {
  const bar = `data:image/png;base64,${readFileSync(BAR).toString('base64')}`;
  const callout = ([label, icon, side, y], i) => {
    const cx = CX[side], from = side === 'L' ? cx + R : cx - R, to = EDGE[side];
    return `<svg style="position:absolute;left:0;top:0" width=${W} height=${H}>
      <line id=l${i} x1=${to} y1=${y} x2=${from} y2=${y} stroke="#fff" stroke-width=4 stroke-linecap=butt pathLength=1 stroke-dasharray=1 stroke-dashoffset=1 />
      <circle id=c${i} cx=${cx} cy=${y} r=${R} fill="#fff" fill-opacity=0 stroke="#fff" stroke-width=5 pathLength=1 stroke-dasharray=1 stroke-dashoffset=1 transform="rotate(${side === 'L' ? 0 : 180} ${cx} ${y})"/>
      <g id=i${i} opacity=0 transform="translate(${cx} ${y}) scale(1.25)" fill="none" stroke="#fff" stroke-width=4.5 stroke-linecap=round stroke-linejoin=round>${ICON[icon]}</g></svg>
      <div id=t${i} style="position:absolute;left:${cx - 150}px;width:300px;top:${y + R + 14}px;text-align:center;font:800 44px/1.04 Figtree;color:#fff;opacity:0;text-shadow:0 2px 16px rgba(0,25,80,.45)">${label}</div>`;
  };
  return `<style>${CSS}.box{background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px}</style>
    <div id=hook style="position:absolute;left:100px;right:100px;top:150px;text-align:center;font:700 68px/1.42 Figtree;opacity:0">
      <span class=box>You weren't looking<br>for a new soap,</span></div>
    <div id=grp style="position:absolute;inset:0;transform-origin:540px 960px">
      <img id=bar src="${bar}" style="position:absolute;left:${BAR_X}px;top:${BAR_Y}px;width:${BAR_S}px;filter:drop-shadow(0 26px 34px rgba(0,20,70,.4))">
      ${CALLOUTS.map(callout).join('')}</div>
    <div id=here style="position:absolute;left:0;right:0;top:1390px;text-align:center;font:800 140px/1 Bricolage;color:#fff;letter-spacing:-3px;white-space:nowrap;text-shadow:0 6px 24px rgba(0,25,80,.4)">${[...'but here we are.'].map((ch, i) => `<span id=h${i} style="visibility:hidden">${ch}</span>`).join('')}</div>`;
}

// draws frame t (seconds) into the open page
async function pose(pg, t) {
  await pg.evaluate((t, at, hereAt) => {
    const c = (x) => Math.max(0, Math.min(1, x)), out3 = (x) => 1 - Math.pow(1 - c(x), 3);
    const $ = (id) => document.getElementById(id);
    // the bar rises up into the sky, then floats a little, like a hand holding it up
    const rise = out3(t / 0.7), f = c((t - 0.5) / 0.6);
    const bob = 8 * Math.sin(2 * Math.PI * t / 3) * f, rock = 0.8 * Math.sin(2 * Math.PI * t / 3.6 + 0.6) * f;
    $('grp').style.transform = `translateY(${900 * (1 - rise) + bob}px) rotate(${rock}deg)`;
    const hk = out3((t - 0.15) / 0.35);
    $('hook').style.opacity = hk; $('hook').style.transform = `translateY(${-30 * (1 - hk)}px)`;
    // each callout: the line draws out from the bar, then the circle, then the icon and label fade in
    at.forEach((st, i) => {
      $(`l${i}`).setAttribute('stroke-dashoffset', 1 - out3((t - st) / 0.25));
      const cd = out3((t - st - 0.2) / 0.4);
      $(`l${i}`).style.visibility = t < st ? 'hidden' : 'visible'; $(`c${i}`).style.visibility = cd <= 0 ? 'hidden' : 'visible';
      $(`c${i}`).setAttribute('stroke-dashoffset', 1 - cd); $(`c${i}`).setAttribute('fill-opacity', 0.07 * cd);
      const k = out3((t - st - 0.5) / 0.3);
      $(`i${i}`).setAttribute('opacity', k); $(`t${i}`).style.opacity = k;
      $(`t${i}`).style.transform = `translateY(${14 * (1 - k)}px)`;
    });
    // typewriter (her note): letter by letter, 0.06s apart; hidden letters keep their space so the line never shifts
    for (let i = 0; i < 16; i++) $(`h${i}`).style.visibility = t >= hereAt + 0.06 * i ? 'visible' : 'hidden';
  }, t, CALLOUTS.map((x) => x[4]), HERE_AT);
}

async function open() {
  if (!existsSync(BAR)) throw new Error(`no ${BAR}: run node build.mjs reel1 once first (it cuts the bar out of soap.webp)`);
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: W, height: H });
  await pg.setContent(page());
  await pg.evaluate(async () => { await document.fonts.ready; await document.getElementById('bar').decode(); });
  return { b, pg };
}

// one video render at a time on her PC: wait while any other ffmpeg runs
function waitForFfmpeg() {
  for (;;) {
    const list = execFileSync('tasklist', ['/FI', 'IMAGENAME eq ffmpeg.exe'], { encoding: 'utf8' });
    if (!/ffmpeg\.exe/i.test(list)) return;
    console.log('another ffmpeg is running, waiting a minute');
    execFileSync('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Seconds 60']);
  }
}

async function stills(times) {
  mkdirSync(TMP, { recursive: true });
  const { b, pg } = await open();
  for (const t of times) {
    const png = path.join(TMP, `r4v4-ov-${t}.png`), jpg = path.join(TMP, `r4v4-still-${t}.jpg`);
    await pose(pg, t);
    await pg.screenshot({ path: png, omitBackground: true });
    ff(['-ss', `${SKY_AT + t}`, '-i', SKY, '-i', png, '-filter_complex', `[0:v]${SKY_VF.replace(/\bt\b/g, t)}[s];[s][1:v]overlay`, '-frames:v', '1', '-q:v', '3', jpg]);
    console.log(jpg);
  }
  await b.close();
}

async function reel() {
  const dir = path.join(TMP, 'r4v4');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const { b, pg } = await open();
  for (let f = 0; f < DUR * FPS; f++) {
    await pose(pg, f / FPS);
    await pg.screenshot({ path: path.join(dir, `${String(f + 1).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close();
  waitForFfmpeg();
  const out = path.join(OUT, 'reel-4-v4.mp4');
  // no sound (her note 2026-11-04): video only
  ff(['-ss', `${SKY_AT}`, '-t', `${DUR}`, '-i', SKY, '-framerate', `${FPS}`, '-i', path.join(dir, '%04d.png'), '-filter_complex',
    `[0:v]${SKY_VF}[s];[s][1:v]overlay,${GRAIN}[v]`, '-map', '[v]', '-an', '-t', `${DUR}`, '-r', `${FPS}`,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log(out);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'still') await stills((arg || '5.5').split(',').map(Number));
else await reel();
