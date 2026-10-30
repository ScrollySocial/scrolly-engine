// YouTube 1 (Replace ManyChat): the effects version as a HyperFrames composition (1920×1080) over the rough cut.
// Every graphic is timed to her real words (../words.json from roughcut.mjs). Looks = the approved storyboard
// (../storyboard.mjs) and EFFECTS-PLAN.md: graphics in the side thirds, never over her face; navy on paper; Figtree heavy
// for big words; her real screens and her own prop TVs only.
//   node build.mjs prep   → media into assets/ (video segments, voice, cold-open TV clip, screens, props, sfx, fonts)
//   node build.mjs        → index.html          then: npx hyperframes check / preview / render
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VID = path.join(HERE, '..'), ID = path.basename(VID), AUTO = path.join(VID, '../..');
const FF = path.join(AUTO, 'hyperframes-test/bin/ffmpeg.exe');
const CACHE = path.join(VID, '../.cache', ID);
const EXPORTS = path.join('C:/Users/merce/OneDrive/Scrolly Media/exports/youtube', ID);
const TAKES = 'C:/Users/merce/OneDrive/Scrolly Media/videos';
const W = JSON.parse(readFileSync(path.join(VID, 'words.json'), 'utf8'));
const DUR = W.duration, SEG = 20, END = DUR + 5; // END: the end card holds 5 s after her last word
const C = { navy: '#0a1930', sky: '#4da3ff', cream: '#f7f3ec', paper: '#fffdf7' };
const A = (...p) => path.join(HERE, 'assets', ...p);
const ff = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const TM = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';
const intro = W.cuts[0], T0 = W.cuts[1].t; // the cold open is the first piece (the Reel intro 2066)

if (process.argv[2] === 'prep') {
  for (const d of ['seg', 'fonts', 'js', 'sfx', 'img']) mkdirSync(A(d), { recursive: true });
  const rc = path.join(EXPORTS, 'roughcut.mp4');
  // muted 20 s segments (the engine's pattern: short clips seek fast) + one voice track
  // remade whenever the rough cut is newer: reusing old pieces with a new voice track put the picture out of sync
  const fresh = (f) => existsSync(f) && statSync(f).mtimeMs > statSync(rc).mtimeMs;
  for (let i = 0; i * SEG < DUR; i++) if (!fresh(A('seg', `seg-${i}.mp4`)))
    ff(['-ss', String(i * SEG), '-t', String(Math.min(SEG, DUR - i * SEG)), '-i', rc, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-g', '30', A('seg', `seg-${i}.mp4`)]);
  ff(['-i', rc, '-vn', '-c:a', 'copy', A('voice.m4a')]);
  // her vertical Reel intro as a 4:3 TV picture (face framed like the storyboard)
  ff(['-ss', String(intro.in), '-t', String(T0), '-i', `${TAKES}/${intro.src}`, '-an', '-vf', `scale=-2:1920,${TM},crop=iw:iw*3/4:0:ih*0.36,scale=960:720,fps=30`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-g', '30', A('seg', 'tv-her.mp4')]);
  ff(['-f', 'lavfi', '-t', '0.3', '-i', 'anoisesrc=color=white:amplitude=0.5:seed=7', '-af', 'highpass=f=900,lowpass=f=7000,afade=t=in:d=0.02,afade=t=out:st=0.18:d=0.12,volume=0.35', A('sfx', 'static.mp3')]);
  const lib = path.join(AUTO, 'reel-hf/lib/assets');
  for (const f of ['figtree.woff2', 'covered-by-your-grace.woff2']) copyFileSync(path.join(lib, 'fonts', f), A('fonts', f));
  copyFileSync(path.join(lib, 'js/gsap.min.js'), A('js', 'gsap.min.js'));
  for (const f of ['mouse-click', 'pop-light', 'pop-bubble', 'coins', 'zoom-in', 'paper-slide', 'whoosh-air', 'check', 'nope', 'chime', 'swoosh-in'])
    copyFileSync(path.join(lib, 'sfx', f + '.mp3'), A('sfx', f + '.mp3'));
  copyFileSync(path.join(AUTO, 'reel-hf/2026-10-13-bb-voice-file/assets/music/music-a.mp3'), A('music.mp3'));
  const hq = path.join(AUTO, 'reel-template-pack/build/.cache/hq');
  copyFileSync(path.join(hq, 'Vintage Walnut Rabbit-Ear Television.png'), A('img', 'tv-walnut.png'));
  copyFileSync(path.join(hq, 'Vintage Walnut Rabbit-Ear Television.png'), A('img', 'tv-walnut-small.png')); // second copy: two identical img nodes read as duplicate media
  copyFileSync(path.join(hq, 'Beige CRT monitor with green screen-56.png'), A('img', 'tv-crt.png'));
  for (const f of ['tv-calc', 'tv-inbox', 'inbox', 'flows', 'keywords', 'calculator', 'guide', 'chat-manager']) copyFileSync(path.join(CACHE, 'screens', f + '.png'), A('img', f + '.png'));
  copyFileSync(path.join(CACHE, 'frames', 'curtain-bw.jpg'), A('img', 'curtain-bw.jpg'));
  console.log('prep done');
  process.exit(0);
}

// ---- word lookup: time of a spoken phrase (first match after `after` seconds) ----
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$]/g, '');
const ws = W.words.map((w) => ({ ...w, n: norm(w.w) }));
function at(phrase, after = 0, end = false) {
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i < ws.length; i++) {
    if (ws[i].t < after) continue;
    if (p.every((x, k) => ws[i + k] && ws[i + k].n === x)) return end ? ws[i + p.length - 1].e : ws[i].t;
  }
  throw new Error(`phrase not found after ${after}s: "${phrase}"`);
}
const beat = (name) => { const b = W.beats.find((x) => x.beat.startsWith(name)); if (!b) throw new Error('beat ' + name); return b.t; };
const nextBeat = (t) => (W.beats.find((b) => b.t > t + 0.1) || { t: DUR }).t;
const r2 = (x) => +x.toFixed(3);
// music bed with a fade in/out as a volume lane (clip-local seconds); data-volume stays 1 so the lane is the level
const bed = (id, a, d, level, fi, fo, track) => `<audio id="${id}" src="assets/music.mp3" data-start="${r2(a)}" data-duration="${r2(d)}" data-track-index="${track}" data-volume="1" data-automation='${JSON.stringify({ version: 1, lanes: [{ target: 'volume', points: [{ t: 0, v: 0 }, { t: fi, v: level }, { t: r2(d - fo), v: level }, { t: r2(d), v: 0 }] }] })}'></audio>`;

// ---- building blocks: html + timeline lines ----
const html = [], js = [], audio = [], wide = []; // wide = windows where the camera stays wide (a graphic is up)
let n = 0;
const uid = (p) => `${p}${++n}`;
// each sound's slot = its real length (ffprobe once per file)
const FP = path.join(AUTO, 'hyperframes-test/bin/ffprobe.exe'), lens = {};
const len = (name) => (lens[name] ??= Math.min(1.2, +execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', A('sfx', name + '.mp3')], { encoding: 'utf8' }).trim()));
// where each sound is loudest (s): hit() lines that moment up with the motion it belongs to
const PEAK = { 'whoosh-air': 0.71, 'swoosh-in': 0.3, 'zoom-in': 0.43, 'paper-slide': 0.36, 'pop-light': 0.03 };
const hit = (name, t, vol) => sfx(name, Math.max(0, t - (PEAK[name] || 0)), vol);
const sfx = (name, t, vol = 0.55) => audio.push(`<audio id="${uid('fx')}" src="assets/sfx/${name}.mp3" data-start="${r2(t)}" data-duration="${r2(len(name))}" data-track-index="${20 + (n % 6)}" data-volume="${vol}"></audio>`);
// a group shown from a to b (fade in/out on a plain div; the framework only owns .clip visibility)
function group(a, b, inner, { fade = 0.25, keepWide = true, z = 5 } = {}) {
  const id = uid('g');
  html.push(`<div id="${id}" class="grp" style="z-index:${z}">${inner}</div>`);
  js.push(`gsap.set('#${id}', { opacity: 0 });`, `tl.to('#${id}', { opacity: 1, duration: ${fade} }, ${r2(a)});`, `tl.to('#${id}', { opacity: 0, duration: ${fade} }, ${r2(b - fade)});`);
  if (keepWide) wide.push([a - 0.3, b + 0.1]);
  return id;
}
const pop = (sel, t, rot = 0) => js.push(`pop('${sel}', ${r2(t)}, ${rot});`);
const card = (id, label, value, x, y, rot, size = 210) =>
  `<div id="${id}" class="card" style="left:${x}px;top:${y}px;--r:${rot}deg"><div class="lbl">${label}</div><div class="num" style="font-size:${size}px">${value}</div></div>`;
const note = (id, text, x, y, rot = -4, size = 54) => `<div id="${id}" class="hand note" style="left:${x}px;top:${y}px;--r:${rot}deg;font-size:${size}px">${text}</div>`;
const RING = 'M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40';
const ring = (id, x, y, w, h) => `<svg id="${id}" class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible" viewBox="0 0 200 100" preserveAspectRatio="none"><path class="draw" pathLength="1" d="${RING}" fill="none" stroke="${C.navy}" stroke-width="4.6" stroke-linecap="round"/><path class="draw" pathLength="1" d="${RING}" fill="none" stroke="${C.sky}" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const cross = (id, x, y, s = 110) => `<svg id="${id}" class="abs" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px" viewBox="0 0 100 100"><path class="draw" pathLength="1" d="M18 16 L84 86" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" fill="none"/><path class="draw" pathLength="1" d="M82 14 L20 84" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" fill="none"/><path class="draw" pathLength="1" d="M18 16 L84 86" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" fill="none"/><path class="draw" pathLength="1" d="M82 14 L20 84" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" fill="none"/></svg>`;
const draw = (sel, t, d = 0.5) => js.push(`draw('${sel}', ${r2(t)}, ${d});`);

// her face in a rounded box bottom-right during screen takeovers: the cut's own video, cropped to her face
function bubble(a, b) {
  const vids = [];
  for (let i = Math.floor(a / SEG); i * SEG < b; i++) {
    const s = Math.max(a, i * SEG), e = Math.min(b, (i + 1) * SEG - 0.034, DUR - 0.034);
    if (e - s > 0.05) vids.push(`<video id="${uid('bv')}" class="clip bvid" src="assets/seg/seg-${i}.mp4" muted playsinline data-start="${r2(s)}" data-duration="${r2(e - s)}" data-media-start="${r2(s - i * SEG)}" data-track-index="${2 + (vids.length % 2)}"></video>`);
  }
  return `<div class="bubble">${vids.join('')}</div>`;
}
// screen takeover: the real screen fills the frame (slow drift down so it feels alive), her face bubble on top
// slides in from the right (the whoosh peaks as it lands), drifts down slowly (only pages whose background matches
// the frame's, the demo pages: on her site pages the drift shows an empty band), ends on b (put b on the cut it hides)
function takeover(img, a, b, { y0 = 0, y1 = -120, extra = '', face = true } = {}) {
  const id = uid('tk'), sl = uid('sl');
  group(a, b, `<div id="${sl}" class="abs" style="inset:0;background:#fff3f0;overflow:hidden"><img id="${id}" class="abs shot" src="assets/img/${img}.png"></div>${extra}${face ? bubble(a, b) : ''}`, { fade: 0.2, z: 6 });
  js.push(`tl.fromTo('#${sl}', { x: 1920 }, { x: 0, duration: 0.45, ease: 'power3.out' }, ${r2(a)});`,
    `tl.fromTo('#${id}', { y: ${y0} }, { y: ${y1}, duration: ${r2(b - a)}, ease: 'none' }, ${r2(a)});`);
  hit('whoosh-air', a + 0.35, 0.45);
}
// full-screen title card over a rough join between takes (her voice carries on underneath)
function bridge(text, t, d = 1.6) {
  const id = uid('br');
  group(t - 0.5, t - 0.5 + d, `<div id="${id}" class="abs bridge"><div class="brt">${text}</div></div>`, { fade: 0.15, z: 7 });
  js.push(`tl.fromTo('#${id} .brt', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: E }, ${r2(t - 0.45)});`);
  hit('swoosh-in', t - 0.35, 0.35);
}
// IG-style emphasis line under her face: the phrase builds word by word as she says it
function say(phrase, after = 0) {
  const t = at(phrase, after), e = at(phrase, after, true), id = uid('say');
  const ws = phrase.split(/\s+/);
  group(t - 0.05, e + 0.9, `<div id="${id}" class="say">${ws.map((w) => `<span>${w}</span>`).join(' ')}</div>`, { fade: 0.15, keepWide: false, z: 4 });
  const said = W.words.filter((w) => w.t >= t - 0.01 && w.t <= e + 0.01);
  ws.forEach((_, i) => js.push(`tl.fromTo('#${id} span:nth-child(${i + 1})', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15 }, ${r2((said[i] || said.at(-1)).t)});`));
}
// where a take first comes in (after a given time)
const takeStart = (take, after = 0) => W.cuts.find((c, i) => c.take === take && c.t >= after && (W.cuts[i - 1] || {}).take !== take).t;
function chapter(num, title, t) {
  const id = uid('ch');
  group(t, t + 1.7, `<div class="abs chap" id="${id}"><div class="chn">CHAPTER ${num}</div><div class="cht">${title}</div><div class="chl"></div></div>`, { fade: 0.2, z: 7 });
  js.push(`tl.fromTo('#${id} .cht', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: E }, ${r2(t + 0.1)});`,
    `tl.fromTo('#${id} .chl', { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: E }, ${r2(t + 0.35)});`);
  sfx('paper-slide', t, 0.5);
}
// paper checklist in a side third; items tick on their words
function checklist(items, a, b, { x = 1200, y = 260, w = 560, title = '' } = {}) {
  const id = uid('ck');
  group(a, b, `<div id="${id}" class="paper" style="left:${x}px;top:${y}px;width:${w}px">${title ? `<div class="pt">${title}</div>` : ''}${items.map((it, i) => `<div class="pi"><span>${it.text}</span><span id="${id}-t${i}" class="tick${it.ok ? '' : ' x'}">${it.ok ? '✓' : '✗'}</span></div>`).join('')}</div>`);
  js.push(`tl.fromTo('#${id}', { y: -40, rotation: 3 }, { y: 0, rotation: -2, duration: 0.5, ease: B }, ${r2(a)});`);
  items.forEach((it, i) => { pop(`#${id}-t${i}`, it.t); sfx(it.ok ? 'check' : 'pop-light', it.t, 0.4); });
}

// ================= the video =================
// 0:00 cold open: one big TV (her), it shrinks into the little TV on top as the stack appears; the big walnut TV
// shows her inbox, the CRT her ManyChat calculator. On "Here's what I do" the camera pushes into her TV → wide hook.
{
  const tMy = at('my version'), tSix = at('$6'), tHere = at("here's what i do"), tHund = at('hundreds');
  const S = { w: 1180 }; S.h = S.w * 1131 / 1215; S.x = 700; S.y = 1060 - S.h;             // solo TV
  const Wt = { x: 230, y: 333, w: 760 }; Wt.h = Wt.w * 1131 / 1215;                         // big walnut: inbox
  const R = { x: 1010, w: 660 }; R.h = R.w * 1062 / 1163; R.y = 1040 - R.h;                 // CRT: calculator
  const T = { w: 440 }; T.h = T.w * 1131 / 1215; T.x = 1090; T.y = R.y - T.h + 14;          // little TV: her
  const scr = (o) => `left:${r2(o.w * 0.095)}px;top:${r2(o.h * 0.39)}px;width:${r2(o.w * 0.638)}px;height:${r2(o.h * 0.48)}px`;
  const sc = S.w / T.w; // her TV is built at the little-TV size and scaled up for the solo open
  html.push(`<div id="co" class="grp" style="z-index:9">
  <img class="abs" src="assets/img/curtain-bw.jpg" style="inset:0;width:1920px;height:1080px;object-fit:cover">
  <div id="co-stage" class="abs" style="inset:0;transform-origin:${r2(T.x + T.w * 0.414)}px ${r2(T.y + T.h * 0.63)}px">
    <div id="co-stack" class="abs" style="inset:0">
      <div class="abs" style="left:150px;right:180px;top:1010px;height:60px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%)"></div>
      <img class="abs" src="assets/img/tv-walnut.png" style="left:${Wt.x}px;top:${Wt.y}px;width:${Wt.w}px">
      <div id="co-inbox" class="abs tvs" style="left:${r2(Wt.x + Wt.w * 0.095)}px;top:${r2(Wt.y + Wt.h * 0.39)}px;width:${r2(Wt.w * 0.638)}px;height:${r2(Wt.h * 0.48)}px;border-radius:7%/10%"><img id="co-inbox-img" class="abs fillimg" src="assets/img/tv-inbox.png"><div class="abs scan"></div><div class="abs glare"></div></div>
      <img class="abs" src="assets/img/tv-crt.png" style="left:${R.x}px;top:${r2(R.y)}px;width:${R.w}px">
      <div class="abs tvs" style="left:${r2(R.x + R.w * 0.066)}px;top:${r2(R.y + R.h * 0.105)}px;width:${r2(R.w * 0.588)}px;height:${r2(R.h * 0.602)}px;border-radius:4%"><img class="abs fillimg" src="assets/img/tv-calc.png"><div class="abs scan"></div><div class="abs glare"></div></div>
    </div>
    <div id="co-her" class="abs" style="left:${r2(T.x)}px;top:${r2(T.y)}px;width:${T.w}px;height:${r2(T.h)}px;transform-origin:0 0">
      <img class="abs" src="assets/img/tv-walnut-small.png" style="left:0;top:0;width:${T.w}px">
      <div class="abs tvs" style="${scr(T)};border-radius:7%/10%"><video id="co-vid" class="clip fillimg" src="assets/seg/tv-her.mp4" muted playsinline data-start="0" data-duration="${r2(T0)}" data-track-index="4"></video><div class="abs scan"></div><div class="abs glare"></div></div>
    </div>
  </div>
  <div id="co-h1" class="abs head" style="width:640px;font-size:92px;top:250px">MANYCHAT: UP TO <span class="sky">$100s</span> A MONTH</div>
  <div id="co-h2" class="abs head">MINE: <span class="sky">$6</span> A MONTH</div>
</div>`);
  js.push(
    `gsap.set('#co-her', { x: ${r2(S.x - T.x)}, y: ${r2(S.y - T.y)}, scale: ${r2(sc)} });`,
    `gsap.set('#co-stack', { opacity: 0 }); gsap.set('#co-h2', { opacity: 0 }); gsap.set('#co-inbox-img', { opacity: 0 });`,
    `tl.fromTo('#co-her', { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.02);`,
    `pop('#co-h1', ${r2(tHund)}, 0);`,
    // the shrink: big TV → little TV on top, the stack fades in, headline swaps
    `tl.to('#co-her', { x: 0, y: 0, scale: 1, duration: 0.55, ease: 'power3.inOut' }, ${r2(tMy - 0.1)});`,
    `tl.to('#co-stack', { opacity: 1, duration: 0.45 }, ${r2(tMy)});`,
    `tl.to('#co-h1', { opacity: 0, duration: 0.2 }, ${r2(tMy - 0.1)});`,
    `tl.to('#co-inbox-img', { opacity: 1, duration: 0.12 }, ${r2(tMy + 0.45)});`, // the big TV switches on with her inbox
    `pop('#co-h2', ${r2(tSix - 0.15)}, 0);`,
    // the push-in through her little TV, then the cold open hands over to the wide hook
    `tl.to('#co-stage', { scale: 7, duration: ${r2(T0 - tHere + 0.05)}, ease: 'power2.in' }, ${r2(tHere)});`,
    `tl.to('#co-h2', { opacity: 0, duration: 0.25 }, ${r2(tHere)});`,
    `tl.to('#co', { opacity: 0, duration: 0.12 }, ${r2(T0 - 0.06)});`);
  sfx('mouse-click', 0, 0.55); sfx('static', 0.05, 0.9); sfx('pop-light', tHund, 0.55);
  sfx('static', tMy - 0.1, 0.9); sfx('mouse-click', tMy + 0.4, 0.55); sfx('coins', tSix, 0.55); sfx('zoom-in', tHere - 0.1, 0.6);
  audio.push(bed('music-open', 0, T0 + 1.5, 0.07, 1.5, 2, 11));
  wide.push([0, T0 + 0.1]);
}

// 0:10 hook: ManyChat Pro $39 on the left, hers $6 on the right (ringed), "still runs when my laptop is off"
{
  const h = beat('Hook'), end = nextBeat(h);
  const t39 = at('$39', h), t6 = at('$6', h), tOff = at('computer', h);
  // both on the right: her face sits at ~40% across in every take, so the right third is the roomy side
  group(t39 - 0.1, end - 0.3, card('hk1', 'MANYCHAT PRO', '$39<small>/mo</small>', 1170, 70, -2, 150) + card('hk2', 'MINE', '$6<small>/mo</small>', 1450, 360, 2, 170)
    + ring('hk-r', 1380, 300, 540, 380) + note('hk-n', 'still runs when<br>my laptop is off', 1200, 790, -4));
  pop('#hk1', t39, -2); sfx('pop-light', t39); pop('#hk2', t6, 2); sfx('pop-bubble', t6); draw('#hk-r', t6 + 0.35, 0.6);
  js.push(`up('#hk-n', ${r2(tOff)});`); sfx('swoosh-in', tOff, 0.4);
}

// 1. Why I wouldn't pay: her calculator page with Pro $39 ringed, then the free-plan checklist
{
  const t = beat('1.'); chapter(1, "Why I wouldn't pay", t);
  // she says free "jumps up to" Pro: the Essential tier sits in between, so the real ladder goes on screen
  const tPro = at('pro plan', t);
  group(tPro - 0.1, at('pay that', tPro) + 2.4, note('tier-n', 'Essential: $17 for 250<br>Pro: $39 for 2,500', 1250, 380, -3, 52));
  js.push(`up('#tier-n', ${r2(tPro)});`); sfx('swoosh-in', tPro, 0.35);
  // the join into 2041 and on into 2043 is rough (her arm, quick cuts): her real calculator page covers it, no face box
  takeover('calculator', takeStart('IMG_2041.MOV') - 0.1, takeStart('IMG_2043.MOV') + 2.2, { y0: 0, y1: 0, face: false });
  const t25 = at('25', takeStart('IMG_2043.MOV'));  // 2039 also says 25 earlier: the checklist goes with 2043's
  checklist([{ text: 'Free: 25 contacts', ok: true, t: t25 + 0.2 }, { text: 'Limited automations', ok: false, t: at('automations', t25) }],
    t25 - 0.3, at('benefit', t25), { y: 300, title: 'ManyChat free plan' });
  const tNot = at('not as bad', t);
  group(tNot - 0.2, Math.min(tNot + 3, beat('2.') - 0.1), note('wp-n', "not as bad<br>as it sounds", 1300, 380, 3, 60));
  js.push(`up('#wp-n', ${r2(tNot)});`);
}

// 2. What "replace with Claude" means + official API
{ const t = beat('2.'); chapter(2, 'What "replace with Claude" means', t); }
// how it works, as a diagram: Claude Code builds it -> n8n runs it on a $6 server -> Instagram + YouTube (official
// APIs) -> her inbox. First while she explains it (2044), again over the start of 2045 (she presses record there).
function diagram(a, b, times, { api } = {}) {
  const id = uid('dg');
  const nodes = [['Claude Code', 'builds it for you'], ['n8n', 'runs it, on a $6 server'], ['Instagram + YouTube', 'official APIs'], ['Your inbox', 'replies + drafts']];
  const arrows = nodes.map((_, i) => (i ? `<div class="darr" id="${id}-a${i}">&rarr;</div>` : ''));
  // the ring sits inside the "Instagram + YouTube" box (inset beyond its edges), so it pops and moves with the box
  const ringIn = (i) => (api && i === 2 ? ring(`${id}-r`, 0, 0, 10, 10).replace('left:0px;top:0px;width:10px;height:10px', 'left:-75px;top:-95px;width:calc(100% + 150px);height:calc(100% + 190px)') : '');
  group(a, b, `<div class="abs" style="inset:0;background:${C.cream}"></div><div class="dtitle">How it works</div><div class="diag">${nodes.map(([h, sub], i) => `${arrows[i]}<div class="dn" id="${id}-n${i}">${ringIn(i)}<div class="dh">${h}</div><div class="ds">${sub}</div></div>`).join('')}</div>`
    + bubble(a, b), { fade: 0.25, z: 6 });
  times.forEach((t, i) => { pop(`#${id}-n${i}`, t, 0); if (i) js.push(`up('#${id}-a${i}', ${r2(t - 0.15)}, 0);`); sfx('pop-light', t, 0.45); });
  if (api) draw(`#${id}-r`, api, 0.6);
}
{
  const t = beat('2.'), tC = at('claude code', t);
  diagram(tC - 0.4, at('regardless', tC) + 1.2, [tC, at('any end', tC), at('server', tC), at('server', tC) + 0.8]);
  const t2 = beat('Official'), tApi = at('official', t2);
  diagram(t2 - 0.1, tApi + 2.6, [t2 + 0.1, t2 + 0.3, t2 + 0.5, t2 + 0.7], { api: tApi });
}

// 3. What it does every day: the real Flows page (ask to reply first → signup link → email list → reminder)
{
  const t = beat('3.'); chapter(3, 'What it does every day', t);
  takeover('flows', t + 1.9, nextBeat(t) - 0.2, { y0: 0, y1: -180 });
}

// 4. It works on YouTube too: "no contact limits"
{ const t = beat('4.'); chapter(4, 'It works on YouTube too', t); }
{
  const t = beat('No contact'), tL = at('not limited', t);
  // the "No contact limits" bridge card already says the headline; this note adds the number
  group(tL - 0.1, tL + 5, note('nl-n', 'thousands of contacts?<br>still $6', 1300, 420, -3, 56));
  js.push(`up('#nl-n', ${r2(tL)});`); sfx('swoosh-in', tL, 0.35);
}

// Trap: no logo on your Google app
{
  const t = beat('Trap'), tLogo = at('logo', t);
  group(tLogo - 0.1, tLogo + 7, `<div id="trap" class="card trap" style="left:1320px;top:250px;--r:2deg"><div class="lbl">SETUP TRAP</div><div class="num" style="font-size:84px;line-height:1">No logo on<br>your Google app</div><div class="sub">or wait 4 to 6 weeks for review</div></div>`);
  pop('#trap', tLogo, 2); sfx('pop-light', tLogo, 0.5);
}

// 5. The costs: the receipt unrolls, ManyChat Pro $39 with a drawn ✗ beside it
{
  const t = beat('5.'); chapter(5, 'The costs', t);
  const t0 = t + 1.9, tEnd = nextBeat(t) - 0.3;
  group(t0, tEnd, `<div id="rc" class="receipt" style="left:1340px;top:150px"><b>My monthly bill</b>
    <div class="row" id="rc1"><span>Claude plan</span><span>have it</span></div><div class="row" id="rc2"><span>Server</span><span>$6</span></div>
    <div class="row" id="rc3"><span>Apify</span><span>free credit</span></div><div class="row" id="rc4"><span>Web address</span><span>free</span></div>
    <div class="row tot" id="rc5"><span>Total</span><span>$6/mo</span></div></div>` + card('rc-mc', 'MANYCHAT PRO', '$39<small>/mo</small>', 40, 380, -2, 110) + cross('rc-x', 170, 620, 100));
  js.push(`tl.fromTo('#rc', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power2.out' }, ${r2(t0)});`);
  ['rc1', 'rc2', 'rc3', 'rc4'].forEach((r, i) => js.push(`up('#${r}', ${r2(t0 + 0.6 + i * 0.5)}, 14);`));
  js.push(`up('#rc5', ${r2(t0 + 2.8)}, 14);`); sfx('coins', t0 + 2.8);
  pop('#rc-mc', t0 + 3.6, -2); draw('#rc-x', t0 + 4.1, 0.4); sfx('pop-light', t0 + 3.6);
}

// The time it takes
{
  const t = beat('The time'), tDay = at('day', t);
  group(tDay - 0.1, tDay + 5, note('tm-n', 'about 1 full day,<br>mostly the back end', 1380, 360, -3, 56));
  js.push(`up('#tm-n', ${r2(tDay)});`); sfx('swoosh-in', tDay, 0.4);
}

// 6. What it can't do
{
  const t = beat('6.'); chapter(6, "What it can't do", t);
  const tT = at('tiktok', t);
  checklist([{ text: 'Instagram', ok: true, t: tT - 0.8 }, { text: 'YouTube', ok: true, t: tT - 0.4 }, { text: 'TikTok auto-DM', ok: false, t: tT + 0.3 }],
    tT - 1.2, tT + 7, { y: 300, w: 520, title: 'Auto-replies' });
}

// My comment inbox: the real inbox (filters, a TikTok comment with its draft), then "your data, your server"
{
  const t = beat('My comment'); takeover('inbox', t + 0.2, nextBeat(t), { y0: 0, y1: -300 });
  // "logging in through a browser isn't allowed... it's through Apify": Apify reads public comments, never her login
  const tAp = at('called apify', at('called apify', beat('TikTok')) + 1);
  group(tAp - 0.1, tAp + 5, note('ap-n', 'Apify reads public comments.<br>It never logs in as you.', 1230, 400, -3, 50));
  js.push(`up('#ap-n', ${r2(tAp)});`); sfx('swoosh-in', tAp, 0.35);
  const tOwn = at('own all that data', beat('TikTok'));
  group(tOwn - 0.1, tOwn + 4.5, card('own', 'WHO OWNS IT', 'Your data,<br>your server', 1320, 320, 2, 96));
  pop('#own', tOwn, 2); sfx('pop-light', tOwn);
}

// 7. Who should stay on ManyChat
{
  const t = beat('7.'); chapter(7, 'Who should stay on ManyChat', t);
  // what she names: WhatsApp (per-message fees on top of the server) and Facebook
  checklist([{ text: 'WhatsApp', ok: true, t: at('whatsapp', t) }, { text: 'Facebook', ok: true, t: at('facebook', t) }],
    at('whatsapp', t) - 0.4, nextBeat(t) - 0.4, { y: 200, w: 520, title: 'Stay on ManyChat for' });
  const tMsg = at('per message', t);
  group(tMsg - 0.1, nextBeat(t) - 0.4, note('st-n', 'WhatsApp also charges<br>per message', 1240, 640, 3, 52));
  js.push(`up('#st-n', ${r2(tMsg)});`);
}

// 8. Get mine: the guide, the Chat Manager page, CHATTERBOX typed in a comment bar, the site URL
{
  const t = beat('8.'); chapter(8, 'Get mine', t);
  const tG = takeStart('IMG_2059.MOV', t), tCM = W.cuts.find((c) => c.take === 'IMG_2061.MOV' && c.t > tG).t;
  takeover('guide', tG - 0.15, tCM, { y0: 0, y1: 0 });          // "a couple of blog posts that walk you through it"
  takeover('chat-manager', tCM, tCM + 9.5, { y0: 0, y1: 0 });  // "if you're interested in copying mine"
  const tCb = at('chatter', t);
  const word = 'CHATTERBOX', tDemo = at('demo', tCb);
  group(tCb - 0.3, tDemo + 4.5, `<div id="cb" class="cbar" style="left:1290px;top:430px"><span class="cbp">Add a comment...</span><span id="cbt" class="cbt">${word}</span><span class="cbs">Post</span></div>`
    + `<div id="url" class="pill" style="left:1330px;top:560px">theambitiondepartment.com</div>`);
  pop('#cb', tCb - 0.2, 0);
  js.push(`tl.set('#cb .cbp', { opacity: 0 }, ${r2(tCb)});`,
    `tl.fromTo('#cbt', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'steps(10)' }, ${r2(tCb)});`);
  sfx('pop-bubble', tCb - 0.2, 0.45);
  pop('#url', tDemo, 0); sfx('pop-light', tDemo);
}

// full-screen title cards over the rough joins between takes that no chapter card or screen already hides
bridge('No contact limits', takeStart('IMG_2054.MOV'));
bridge('Setting it up for YouTube', takeStart('IMG_2049.MOV'));
bridge('How long it takes', takeStart('IMG_2048.MOV'));
bridge('The one big limit', takeStart('IMG_2056.MOV'));
bridge('TikTok comments, too', takeStart('IMG_2058.MOV'));

// IG-style emphasis on the lines that carry the point (none where a card or screen already says it)
say('I built one myself');
say('totally approved with meta', beat('Official'));
say('any keyword that you set up', beat('3.'));
say('save you so much money', beat('4.'));
say('one place for all of my comments', beat('My comment'));
say('our own business asset', beat('TikTok'));
say('less than an hour', beat('8.'));

// End screen: she moves to the left, the right side stays clear for YouTube's end-screen cards
const tEndS = beat('End screen');
html.push(`<div id="es" class="grp" style="z-index:1"><div class="abs" style="left:1180px;top:0;width:740px;height:1080px;background:${C.navy}"></div>
  <div class="abs" style="left:1260px;top:150px;font:900 70px/1 Fig;letter-spacing:-.02em;color:${C.cream}">Watch next</div>
  <div class="abs" style="left:1470px;top:700px;font:800 32px/1.35 Fig;color:${C.cream}">@AmbitionDeptHQ<br><span style="font-weight:500;font-size:27px;opacity:.85">theambitiondepartment.com</span></div></div>`);
js.push(`gsap.set('#es', { opacity: 0 }); tl.to('#es', { opacity: 1, duration: 0.5 }, ${r2(tEndS)});`,
  `tl.to('#cam', { x: -420, duration: 0.7, ease: 'power3.inOut' }, ${r2(tEndS)});`);
wide.push([tEndS - 0.3, DUR]);
// end card: covers her reaching for the phone, holds 5 s after her last word, music fades out under it
const tCard = at('cool things', tEndS) - 0.2;
html.push(`<div id="ec" class="grp" style="z-index:8"><div class="abs" style="inset:0;background:${C.navy}"></div>
  <div class="abs" style="left:140px;top:300px;width:900px"><div style="font:900 120px/1 Fig;letter-spacing:-.03em;color:${C.cream}">Thanks for watching</div>
  <div style="font:600 46px/1.3 Fig;color:${C.cream};opacity:.9;margin-top:34px">Subscribe for more cool things you can do with AI</div>
  <div style="font:800 40px/1 Fig;color:${C.sky};margin-top:60px">@AmbitionDeptHQ</div></div></div>`);
js.push(`gsap.set('#ec', { opacity: 0 }); tl.to('#ec', { opacity: 1, duration: 0.5 }, ${r2(tCard)});`);
audio.push(bed('music-end', tEndS, END - tEndS, 0.09, 2, 3, 12));

// punch-in at every jump cut: alternate wide and close, but stay wide while a graphic is up
{
  let close = false;
  const isWide = (t) => wide.some(([a, b]) => t >= a && t <= b);
  for (const c of W.cuts.slice(1)) {
    if (isWide(c.t)) { if (close) { js.push(`tl.set('#cam', { scale: 1 }, ${r2(c.t)});`); close = false; } continue; }
    close = !close;
    js.push(`tl.set('#cam', { scale: ${close ? 1.18 : 1} }, ${r2(c.t)});`);
  }
  // a graphic that starts mid-piece pulls the camera back to wide with it
  for (const [a] of wide) js.push(`tl.set('#cam', { scale: 1 }, ${r2(Math.max(0, a))});`);
}

// ---- page ----
const segs = [];
for (let i = 0; i * SEG < DUR; i++) {
  const d = Math.min(SEG, DUR - i * SEG);
  segs.push(`<video id="talk-${i}" class="clip talk" src="assets/seg/seg-${i}.mp4" muted playsinline data-start="${i * SEG}" data-duration="${r2(d)}" data-track-index="${i % 2}"></video>`);
}
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920, height=1080">
<script src="assets/js/gsap.min.js"></script>
<style>
@font-face{font-family:'Fig';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
@font-face{font-family:'Hand';src:url('assets/fonts/covered-by-your-grace.woff2') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:'Fig',sans-serif;background:#000}
#cam{position:absolute;inset:0;transform-origin:40% 38%}
.talk{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.abs{position:absolute}
.grp{position:absolute;inset:0;pointer-events:none}
.card{position:absolute;background:${C.paper};color:${C.navy};padding:34px 44px 38px;box-shadow:0 18px 44px rgba(10,25,48,.35);border-radius:6px;rotate:var(--r)}
.lbl{font:700 36px/1 Fig;letter-spacing:.02em;opacity:.75}
.num{font:900 210px/.95 Fig;letter-spacing:-.03em}.num small{font-size:.38em;font-weight:700}
.trap{width:560px}.trap .sub{font:600 34px/1.2 Fig;margin-top:14px;opacity:.8}
.hand{position:absolute;font:400 54px/1.05 Hand;color:${C.navy};white-space:nowrap}
.note{background:${C.paper};padding:18px 28px 22px;box-shadow:0 12px 30px rgba(10,25,48,.35);border-radius:4px;rotate:var(--r)}
.draw{stroke-dasharray:1;stroke-dashoffset:1}
.paper{position:absolute;background:${C.paper};background-image:repeating-linear-gradient(180deg,transparent 0 78px,#cfe0ee 78px 81px);padding:26px 40px 30px;font:400 56px/81px Hand;color:#2b2724;box-shadow:0 14px 36px rgba(10,25,48,.35)}
.paper .pt{font:800 30px/81px Fig;color:${C.navy};letter-spacing:.02em;text-transform:uppercase}
.paper .pi{display:flex;justify-content:space-between;gap:20px}
.tick{display:inline-block;color:#2e7d4f;font-family:Fig;font-weight:800}.tick.x{color:${C.navy}}
.receipt{position:absolute;width:520px;background:${C.paper};padding:40px 44px 70px;font:400 44px/1.25 Hand;color:#2b2724;rotate:-3deg;box-shadow:0 18px 40px rgba(10,25,48,.35)}
.receipt b{display:block;font-weight:400;color:${C.navy};margin-bottom:30px}.receipt b{text-decoration:underline ${C.sky} 8px;text-underline-offset:6px}
.receipt .row{display:flex;justify-content:space-between;gap:20px}
.receipt .tot{border-top:3px dashed #2b2724;margin-top:16px;padding-top:12px;font-size:54px;color:${C.navy}}
.chap{inset:0;background:${C.navy};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}
.chn{font:700 40px/1 Fig;letter-spacing:.3em;color:${C.sky}}
.cht{font:900 150px/1 Fig;letter-spacing:-.03em;color:${C.cream};text-align:center;max-width:1700px}
.chl{width:200px;height:5px;background:${C.sky}}
.shot{left:0;top:0;width:1920px;height:auto}
.bubble{position:absolute;right:44px;bottom:44px;width:440px;height:330px;border-radius:28px;border:6px solid ${C.cream};box-shadow:0 16px 40px rgba(10,25,48,.35);overflow:hidden;background:#000}
.bvid{position:absolute;left:-260px;top:-95px;width:960px;height:540px;object-fit:cover}
.head{left:70px;top:70px;width:880px;font:900 104px/.95 Fig;letter-spacing:-.03em;color:${C.navy};-webkit-text-stroke:22px ${C.paper};paint-order:stroke fill}
.head .sky{color:${C.sky}}
.tvs{overflow:hidden;background:#1d1f22}.fillimg{left:0;top:0;width:100%;height:100%;object-fit:cover}
.off{inset:0;background:radial-gradient(#3a3d42,#15171a)}
.scan{inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.08) 0 2px,transparent 2px 5px)}
.glare{inset:0;background:radial-gradient(120% 90% at 30% 15%,rgba(255,255,255,.22),transparent 45%),radial-gradient(140% 120% at 50% 50%,transparent 60%,rgba(0,0,0,.35))}
.cbar{position:absolute;width:560px;display:flex;align-items:center;gap:16px;background:#fff;border-radius:999px;padding:22px 30px;box-shadow:0 12px 30px rgba(10,25,48,.35);font:600 36px/1 Fig;color:#111}
.cbp{position:absolute;left:30px;color:#888;font-weight:500}.cbt{flex:1;letter-spacing:.02em}.cbs{color:${C.sky};font-weight:800}
.bridge{inset:0;background:${C.cream};display:flex;align-items:center;justify-content:center}
.brt{font:900 130px/1 Fig;letter-spacing:-.03em;color:${C.navy};text-align:center;max-width:1600px}
.say{position:absolute;left:300px;width:940px;top:905px;text-align:center}
.say span{display:inline-block;background:${C.paper};color:${C.navy};font:800 50px/1 Fig;padding:12px 16px;margin:0 -4px;box-shadow:0 8px 20px rgba(10,25,48,.3)}
.dtitle{position:absolute;left:0;right:0;top:110px;text-align:center;font:900 84px/1 Fig;letter-spacing:-.03em;color:${C.navy}}
.diag{position:absolute;left:50px;right:50px;top:290px;display:flex;align-items:center;justify-content:center;gap:14px}
.dn{position:relative;background:${C.paper};border:5px solid ${C.navy};border-radius:22px;padding:34px 28px;width:380px;min-height:230px;box-shadow:0 14px 34px rgba(10,25,48,.25)}
.dh{font:900 54px/1.02 Fig;color:${C.navy};letter-spacing:-.02em}.ds{font:600 32px/1.25 Fig;color:${C.navy};opacity:.8;margin-top:14px}
.darr{font:900 70px/1 Fig;color:${C.sky}}
.pill{position:absolute;background:${C.cream};color:${C.navy};font:700 34px/1 Fig;padding:20px 34px;border-radius:999px;box-shadow:0 10px 30px rgba(10,25,48,.3)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="${r2(END)}">
<div id="cam">
${segs.join('\n')}
</div>
${html.join('\n')}
<audio id="voice" src="assets/voice.m4a" data-start="0" data-duration="${r2(DUR)}" data-track-index="10" data-volume="1"></audio>
${audio.join('\n')}
</div>
<script>
const tl = gsap.timeline({ paused: true });
const E = 'power3.out', B = 'back.out(1.6)';
const pop = (s, t, r = 0) => tl.fromTo(s, { scale: 0, rotation: r - 8, opacity: 0 }, { scale: 1, rotation: r, opacity: 1, duration: 0.45, ease: B }, t);
const up = (s, t, y = 30) => tl.fromTo(s, { y, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, t);
const draw = (s, t, d = 0.45) => tl.fromTo(s + ' .draw', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, t);
${js.join('\n')}
window.__timelines['main'] = tl;
</script>
</body>
</html>
`;
writeFileSync(path.join(HERE, 'index.html'), page);
console.log(`index.html: ${r2(DUR)} s, ${html.length} graphic groups, ${audio.length} sounds`);
