// YouTube 1 (Replace ManyChat): the effects version as a HyperFrames composition (1920×1080) over the rough cut.
// Every graphic is timed to her real words (../words.json from roughcut.mjs). Looks = the approved storyboard
// (../storyboard.mjs) and EFFECTS-PLAN.md: graphics in the side thirds, never over her face; navy on paper; Figtree heavy
// for big words; her real screens and her own prop TVs only.
//   node build.mjs prep   → media into assets/ (video segments, voice, cold-open TV clip, screens, props, sfx, fonts)
//   node build.mjs        → index.html          then: npx hyperframes check / preview / render
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VID = path.join(HERE, '..'), ID = path.basename(VID), AUTO = path.join(VID, '../..');
const FF = path.join(AUTO, 'hyperframes-test/bin/ffmpeg.exe');
const CACHE = path.join(VID, '../.cache', ID);
const EXPORTS = path.join('C:/Users/merce/OneDrive/Scrolly Media/exports/youtube', ID);
const TAKES = 'C:/Users/merce/OneDrive/Scrolly Media/videos';
const W = JSON.parse(readFileSync(path.join(VID, 'words.json'), 'utf8'));
const DUR = W.duration, SEG = 20;
const C = { navy: '#0a1930', sky: '#4da3ff', cream: '#f7f3ec', paper: '#fffdf7' };
const A = (...p) => path.join(HERE, 'assets', ...p);
const ff = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const TM = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';
const intro = W.cuts[0], T0 = W.cuts[1].t; // the cold open is the first piece (the Reel intro 2066)

if (process.argv[2] === 'prep') {
  for (const d of ['seg', 'fonts', 'js', 'sfx', 'img']) mkdirSync(A(d), { recursive: true });
  const rc = path.join(EXPORTS, 'roughcut.mp4');
  // muted 20 s segments (the engine's pattern: short clips seek fast) + one voice track
  for (let i = 0; i * SEG < DUR; i++) if (!existsSync(A('seg', `seg-${i}.mp4`)))
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
const sfx = (name, t, vol = 0.55) => audio.push(`<audio id="${uid('fx')}" src="assets/sfx/${name}.mp3" data-start="${r2(t)}" data-duration="1.2" data-track-index="${20 + (n % 6)}" data-volume="${vol}"></audio>`);
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
const ring = (id, x, y, w, h) => `<svg id="${id}" class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible" viewBox="0 0 200 100" preserveAspectRatio="none"><path class="draw" pathLength="1" d="${RING}" fill="none" stroke="${C.navy}" stroke-width="15" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path class="draw" pathLength="1" d="${RING}" fill="none" stroke="${C.sky}" stroke-width="9" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
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
function takeover(img, a, b, { y0 = 0, y1 = -120, extra = '' } = {}) {
  const id = uid('tk');
  group(a, b, `<div class="abs" style="inset:0;background:#fff3f0;overflow:hidden"><img id="${id}" class="abs shot" src="assets/img/${img}.png"></div>${extra}${bubble(a, b)}`, { fade: 0.3, z: 6 });
  js.push(`tl.fromTo('#${id}', { y: ${y0} }, { y: ${y1}, duration: ${r2(b - a)}, ease: 'none' }, ${r2(a)});`);
  sfx('whoosh-air', a - 0.1, 0.45);
}
function chapter(num, title, t) {
  const id = uid('ch');
  group(t, t + 1.7, `<div class="abs chap" id="${id}"><div class="chn">CHAPTER ${num}</div><div class="cht">${title}</div><div class="chl"></div></div>`, { fade: 0.2, z: 7 });
  js.push(`tl.fromTo('#${id} .cht', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: E }, ${r2(t + 0.1)});`,
    `tl.fromTo('#${id} .chl', { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: E }, ${r2(t + 0.35)});`);
  sfx('paper-slide', t, 0.5);
}
// paper checklist in a side third; items tick on their words
function checklist(items, a, b, { x = 60, y = 260, w = 520, title = '' } = {}) {
  const id = uid('ck');
  group(a, b, `<div id="${id}" class="paper" style="left:${x}px;top:${y}px;width:${w}px">${title ? `<div class="pt">${title}</div>` : ''}${items.map((it, i) => `<div class="pi"><span>${it.text}</span><span id="${id}-t${i}" class="tick${it.ok ? '' : ' x'}">${it.ok ? '✓' : '✗'}</span></div>`).join('')}</div>`);
  js.push(`tl.fromTo('#${id}', { y: -40, rotation: 3 }, { y: 0, rotation: -2, duration: 0.5, ease: B }, ${r2(a)});`);
  items.forEach((it, i) => { pop(`#${id}-t${i}`, it.t); sfx(it.ok ? 'check' : 'nope', it.t, 0.4); });
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
      <img class="abs" src="assets/img/tv-walnut.png?small" style="left:0;top:0;width:${T.w}px">
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
  group(t39 - 0.1, end - 0.3, card('hk1', 'MANYCHAT PRO', '$39<small>/mo</small>', 20, 250, -2) + card('hk2', 'MINE', '$6<small>/mo</small>', 1330, 200, 2)
    + ring('hk-r', 1240, 140, 660, 460) + note('hk-n', 'still runs when<br>my laptop is off', 1400, 660, -4));
  pop('#hk1', t39, -2); sfx('pop-light', t39); pop('#hk2', t6, 2); sfx('pop-bubble', t6); draw('#hk-r', t6 + 0.35, 0.6);
  js.push(`up('#hk-n', ${r2(tOff)});`); sfx('swoosh-in', tOff, 0.4);
}

// 1. Why I wouldn't pay: her calculator page with Pro $39 ringed, then the free-plan checklist
{
  const t = beat('1.'); chapter(1, "Why I wouldn't pay", t);
  const t25 = at('25', t);
  checklist([{ text: 'Free: 25 contacts', ok: true, t: t25 + 0.2 }, { text: 'Limited automations', ok: false, t: at('automations', t25) }],
    t25 - 0.3, at('benefit', t25), { x: 50, y: 300, w: 560, title: 'ManyChat free plan' });
  const tNot = at('not as bad', t);
  group(tNot - 0.2, Math.min(tNot + 3, beat('2.') - 0.1), note('wp-n', "not as bad<br>as it sounds", 1410, 380, 3, 60));
  js.push(`up('#wp-n', ${r2(tNot)});`);
}

// 2. What "replace with Claude" means + official API
{ const t = beat('2.'); chapter(2, 'What "replace with Claude" means', t); }
{
  const t = beat('Official'), tApi = at('official', t);
  group(tApi - 0.1, tApi + 4.5, card('api', 'BUILT ON', 'Official<br>Instagram API', 1320, 330, 2, 110));
  pop('#api', tApi, 2); sfx('pop-light', tApi);
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
  group(tL - 0.1, tL + 5, card('nl', 'CONTACT LIMIT', 'None', 1330, 300, 2, 190) + note('nl-n', 'thousands of contacts?<br>still $6', 1360, 640, -3, 50));
  pop('#nl', tL, 2); sfx('pop-light', tL); js.push(`up('#nl-n', ${r2(tL + 1.2)});`);
}

// Trap: no logo on your Google app
{
  const t = beat('Trap'), tLogo = at('logo', t);
  group(tLogo - 0.1, tLogo + 7, `<div id="trap" class="card trap" style="left:1320px;top:250px;--r:2deg"><div class="lbl">SETUP TRAP</div><div class="num" style="font-size:84px;line-height:1">No logo on<br>your Google app</div><div class="sub">or wait 4 to 6 weeks for review</div></div>`);
  pop('#trap', tLogo, 2); sfx('nope', tLogo, 0.45);
}

// 5. The costs: the receipt unrolls, ManyChat Pro $39 with a drawn ✗ beside it
{
  const t = beat('5.'); chapter(5, 'The costs', t);
  const t0 = t + 1.9, tEnd = nextBeat(t) - 0.3;
  group(t0, tEnd, `<div id="rc" class="receipt" style="left:1340px;top:150px"><b>My monthly bill</b>
    <div class="row" id="rc1"><span>Claude plan</span><span>have it</span></div><div class="row" id="rc2"><span>Server</span><span>$6</span></div>
    <div class="row" id="rc3"><span>Apify</span><span>free credit</span></div><div class="row" id="rc4"><span>Web address</span><span>free</span></div>
    <div class="row tot" id="rc5"><span>Total</span><span>$6/mo</span></div></div>` + card('rc-mc', 'MANYCHAT PRO', '$39<small>/mo</small>', 60, 330, -2, 170) + cross('rc-x', 380, 610));
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
    tT - 1.2, tT + 7, { x: 50, y: 300, w: 520, title: 'Auto-replies' });
}

// My comment inbox: the real inbox (filters, a TikTok comment with its draft), then "your data, your server"
{
  const t = beat('My comment'); takeover('inbox', t + 0.2, nextBeat(t) - 0.3, { y0: 0, y1: -300 });
  const tOwn = at('own all that data', beat('TikTok'));
  group(tOwn - 0.1, tOwn + 4.5, card('own', 'WHO OWNS IT', 'Your data,<br>your server', 1320, 320, 2, 96));
  pop('#own', tOwn, 2); sfx('pop-light', tOwn);
}

// 7. Who should stay on ManyChat
{
  const t = beat('7.'); chapter(7, 'Who should stay on ManyChat', t);
  // what she names: WhatsApp (per-message fees on top of the server) and Facebook
  checklist([{ text: 'WhatsApp', ok: true, t: at('whatsapp', t) }, { text: 'Facebook', ok: true, t: at('facebook', t) }],
    at('whatsapp', t) - 0.4, nextBeat(t) - 0.4, { x: 50, y: 300, w: 520, title: 'Stay on ManyChat for' });
  const tMsg = at('per message', t);
  group(tMsg - 0.1, nextBeat(t) - 0.4, note('st-n', 'WhatsApp also charges<br>per message', 1360, 420, 3, 52));
  js.push(`up('#st-n', ${r2(tMsg)});`);
}

// 8. Get mine: the guide, the Chat Manager page, CHATTERBOX typed in a comment bar, the site URL
{
  const t = beat('8.'); chapter(8, 'Get mine', t);
  const tCopy = at('copying', t);  // "if you're interested in copying mine" → the Chat Manager page
  takeover('chat-manager', tCopy - 0.2, tCopy + 9, { y0: 0, y1: -200 });
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

// End screen: she moves to the left, the right side stays clear for YouTube's end-screen cards
const tEndS = beat('End screen');
html.push(`<div id="es" class="grp" style="z-index:1"><div class="abs" style="left:1180px;top:0;width:740px;height:1080px;background:${C.navy}"></div>
  <div class="abs" style="left:1260px;top:150px;font:900 70px/1 Fig;letter-spacing:-.02em;color:${C.cream}">Watch next</div>
  <div class="abs" style="left:1470px;top:700px;font:800 32px/1.35 Fig;color:${C.cream}">@AmbitionDeptHQ<br><span style="font-weight:500;font-size:27px;opacity:.85">theambitiondepartment.com</span></div></div>`);
js.push(`gsap.set('#es', { opacity: 0 }); tl.to('#es', { opacity: 1, duration: 0.5 }, ${r2(tEndS)});`,
  `tl.to('#cam', { x: -420, duration: 0.7, ease: 'power3.inOut' }, ${r2(tEndS)});`);
wide.push([tEndS - 0.3, DUR]);
audio.push(bed('music-end', tEndS, DUR - tEndS, 0.09, 2, 2, 12));

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
#cam{position:absolute;inset:0;transform-origin:50% 40%}
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
.pill{position:absolute;background:${C.cream};color:${C.navy};font:700 34px/1 Fig;padding:20px 34px;border-radius:999px;box-shadow:0 10px 30px rgba(10,25,48,.3)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="${r2(DUR)}">
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
