// Writes index.html: the "Give your AI a voice file" Studio Reel, built from the LOCKED storyboard v4
// (storyboard.html / STORYBOARD.md) on top of her prepped take (assets/talk.mp4) and its word timings (assets/words.json).
// Layout and copy come straight from the confirmed sketches; this adds motion, captions, cut-outs, audio.
// One root composition, one paused GSAP timeline. Sizes in cqw: the root is the container, so 1cqw = 10.8px.
// Usage: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('assets/words.json', 'utf8'));
const W = P.words, DUR = +P.duration.toFixed(2);
const C = { cream: '#F6EEE5', cream2: '#FFF4DC', peach: '#FFC9A8', ink: '#161210', orange: '#E05A33', blush: '#F8DCE5', mist: '#E7EEF5' };
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, '');
// start time of the first word of `phrase` at/after `after` seconds
function at(phrase, after = 0) {
  const t = phrase.split(' ').map(norm);
  for (let i = 0; i < W.length; i++) if (W[i].s >= after && t.every((x, k) => W[i + k] && norm(W[i + k].w).startsWith(x))) return +W[i].s.toFixed(2);
  throw new Error(`phrase not found: ${phrase}`);
}

// ---- frame windows (locked storyboard) ----
const F = [0, 3.4, at('and funny'), at("that's because"), 20.14, at('you would show'), at('and they would'), at('but for some'), at('so one of'), at("and that's really"), at('and it gives'), at('you can also'), 65.85, at('this is something'), 78.9, DUR];
const win = (n) => ({ s: F[n - 1], d: +(F[n] - F[n - 1]).toFixed(2) });

// ---- small builders ----
const SPARK = (id, x, y, s, c = C.cream2) => `<svg id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${s}cqw;height:${s}cqw" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="${c}"/></svg>`;
const ARROW = (id, x, y, w, r = 0, c = C.cream2) => `<div id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;height:${w * 0.75}cqw;rotate:${r}deg"><svg viewBox="0 0 120 90" style="width:100%;height:100%"><path class="draw" pathLength="1" d="M8 12 C40 4 86 18 98 64" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path class="draw" pathLength="1" d="M80 52 L99 70 L110 46" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
const RING = (id, x, y, w, h, c = C.orange) => `<svg id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;height:${h}cqw" viewBox="0 0 200 100" preserveAspectRatio="none"><path class="draw" pathLength="1" d="M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`;
const fade = (h) => `<div class="fade" style="background:linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,.25) ${h * 0.6}%,rgba(0,0,0,0) ${h}%)"></div>`;
const big = (id, html, top, size, color = '#fff') => `<div id="${id}" class="big" style="top:${top}cqw;font-size:${size}cqw;color:${color}">${html.replace(/<m>(.*?)<\/m>/g, '<span class="mk"><span class="mkbg"></span><span class="mkt">$1</span></span>')}</div>`;
const hand = (id, t, x, y, size = 7, r = -4, c = C.cream2) => `<div id="${id}" class="hand" style="left:${x}cqw;top:${y}cqw;font-size:${size}cqw;rotate:${r}deg;color:${c}">${t}</div>`;
const scene = (n, inner, z = 5, suffix = '') => { const w = win(n); return `<div id="s${n}${suffix}" class="clip scene" data-start="${w.s}" data-duration="${w.d}" data-track-index="${2 + (suffix ? 1 : 0)}" style="z-index:${z}">${inner}</div>`; };
const mdLines = (lines) => lines.map(([g, t, k = ''], i) => `<div class="ln ${k}" id="${''}"><b>${g}</b><span class="lt">${t}</span></div>`).join('');

// ---- scenes (layouts = storyboard v4) ----
const S = [];
S.push(scene(1, `${fade(48)}${big('b1', 'Ever asked <m>AI</m> to write for you?', 6, 10.5)}<div class="chat" style="top:29cqw"><div id="c1" class="msg me">write a caption for my candle shop</div></div>`));
S.push(scene(2, `${fade(50)}<div class="chat" style="top:6cqw;left:13cqw;right:13cqw"><div id="c2" class="msg ai">This isn’t just a candle. It’s an experience. ✨🔥🚀 Elevate your space today!!</div></div>${RING('r2', 1, 0, 98, 30)}${hand('h2', 'nope.', 66, 31, 11, -8, C.orange)}${ARROW('a2', 46, 27, 18, 165, C.orange)}`));
S.push(scene(3, `${fade(50)}<div id="p3" class="paper" style="top:6cqw"><div>grammar <span id="t3a" class="tick">✓</span></div><div>information <span id="t3b" class="tick">✓</span></div><div>sounds like you <span id="t3c" class="tick x">✗</span></div></div>`));
S.push(scene(4, `<div class="fill" style="background:${C.blush}"></div>${big('b4', 'doesn’t automatically know your <m>personality</m>', 7, 15.5, C.ink)}`));
S.push(scene(5, `<div id="g5" class="badge" style="left:47cqw;top:8cqw"><div class="b-top">HELLO<small>my job is</small></div><div class="b-name">your social media</div></div>`));
const folder = (id, t, x, y, r) => `<div id="${id}" class="folder" style="left:${x}cqw;top:${y}cqw;rotate:${r}deg"><div class="f-tab">${t}</div><div class="f-body"><i></i><i></i><i></i></div></div>`;
S.push(scene(6, `${fade(50)}${folder('f6a', 'examples', 4, 12, -7)}${folder('f6b', 'likes ♥', 35, 7, 1)}${folder('f6c', 'dislikes ✗', 66, 13, 7)}`));
S.push(scene(7, `${fade(44)}<img id="q7a" class="post" src="assets/img/feed1.jpg" style="left:4cqw;top:7cqw;rotate:-7deg"><img id="q7b" class="post" src="assets/img/feed2.jpg" style="left:37cqw;top:4cqw;rotate:2deg"><img id="q7c" class="post" src="assets/img/feed3.jpg" style="left:69cqw;top:8cqw;rotate:8deg">${hand('h7a', 'your style', 6, 46, 7, -5)}${hand('h7b', 'your captions', 60, 46, 7, 4)}`));
S.push(scene(8, `${fade(48)}<div id="rc8" class="receipt" style="left:3cqw;top:5cqw"><b>the new hire got:</b><br>examples<br>likes<br>dislikes<br>your feed<br>your style<br>your captions<br>...</div>${hand('h8', 'AI got:', 42, 16, 8, -4)}<div id="pr8" class="prompt" style="left:40cqw;top:30cqw"><span class="ptxt">write a caption</span><i>↑</i></div>`));
S.push(scene(9, `<div class="fill" style="background:rgba(10,8,6,.42)"></div>${big('b9', 'VOICE FILE', 8, 30, C.cream2)}`));
S.push(scene(9, `${SPARK('sp9', 84, 10, 8)}`, 7, 'b'));
const md = (id, top, file, lines) => `<div id="${id}" class="md" style="top:${top}cqw"><div class="md-bar"><i></i><i></i><i></i><span>${file}</span></div><div class="md-body">${mdLines(lines)}</div></div>`;
S.push(scene(10, `${fade(52)}${md('m10', 5, 'voice.md', [['1', '# My voice', 'h'], ['2', ''], ['3', '## How I talk', 'h'], ['+', 'warm, clear, a little funny', 'add'], ['+', 'short sentences, real examples', 'add'], ['6', '## What I like', 'h'], ['+', 'specific details, plain words', 'add'], ['+', 'no hype, no big promises', 'add']])}`));
S.push(scene(11, `${fade(52)}${md('m11', 5, 'voice.md', [['9', '## Examples', 'h'], ['+', '> New fall scents just landed.', 'add'], ['+', '> Cozy, small batch, gone fast.', 'add'], ['+', '> Packing orders today with a', 'add'], ['+', '> very bossy cat supervising.', 'add']])}`));
S.push(scene(12, `${fade(52)}${md('m12', 5, 'voice.md', [['15', '## Never say', 'h'], ['✗', 'It’s not X, it’s Y', 'no'], ['✗', 'Let’s dive in', 'no'], ['✗', 'Buckle up', 'no'], ['✗', '🚀🚀🚀!!!', 'no']])}`));
S.push(scene(13, `${fade(54)}<div class="chat" style="top:4cqw"><div id="c13a" class="msg me">write a caption for my candle shop</div><div id="c13b" class="chip">📄 voice.md</div><div id="c13c" class="msg ai">New fall scents are in. Soft, cozy, made in small batches. Come smell them before they sell out.</div></div>${hand('h13', 'sounds like me', 50, 47, 8, -5, C.peach)}${ARROW('a13', 28, 44, 18, 200, C.peach)}`));
S.push(scene(14, `<div class="brainwrap"><img id="br14" class="brain" src="assets/img/brain.png"></div><div class="fill" style="background:rgba(22,18,16,.12)"></div>`));
S.push(scene(14, `<svg id="cur14" class="abs blk" style="left:74cqw;top:14cqw;width:7cqw;height:7cqw" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L13 23 L16 21.5 L12 14 L19 14 Z" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/></svg>`, 7, 'b'));
S.push(scene(15, `${fade(50)}${big('b15', 'Scrolly <m>Business Brain</m>', 6, 11)}<div id="u15" class="url" style="top:31cqw"><span class="lock">🔒</span>scrollyseo.com</div>${hand('h15', 'on my website', 56, 44, 7.5, -4)}${ARROW('a15', 34, 41, 18, 190)}`));

// ---- cut-outs (her, background removed) above their scene's background, below its decorations ----
const cut = (n, file, z = 6) => { const w = win(n); return `<video id="cut${n}" class="clip cutvid" src="${file}" muted playsinline data-start="${w.s}" data-duration="${w.d}" data-track-index="4" style="z-index:${z}"></video>`; };
const CUTS = [cut(4, 'assets/cut/f04-cut.webm'), cut(9, 'assets/cut/f09-cut.webm'), cut(14, 'assets/cut/f14-cut.webm')];

// ---- relaxed captions (lower third), hidden on frames that carry their own type ----
const noCap = [win(4), win(9), win(13), win(15)].map((w) => [w.s, w.s + w.d]);
const capTop = (t) => (t >= win(14).s && t < win(15).s ? 150 : 128);
const caps = [];
let cur = [];
const flush = () => { if (!cur.length) return; const s = cur[0].s, e = cur.at(-1).e; caps.push({ s, e, t: cur.map((w) => w.w).join(' ').replace(/\s+([.,?!])/g, '$1').replace(/[.,]$/, '') }); cur = []; };
for (let i = 0; i < W.length; i++) {
  const w = W[i];
  if (noCap.some(([a, b]) => w.s >= a - 0.05 && w.s < b)) { flush(); continue; }
  if (cur.length && (w.seg !== cur.at(-1).seg || w.s - cur.at(-1).e > 0.5 || F.some((f) => f > cur[0].s && f <= w.s))) flush();
  cur.push(w);
  if (cur.length >= 5 || /[.,?!]$/.test(w.w)) flush();
}
flush();
const capHtml = caps.map((c, i) => { const d = Math.max(0.3, Math.min((caps[i + 1]?.s ?? c.e + 0.6) - c.s - 0.02, Math.max(0.6, c.e - c.s + 0.5))); return `<div id="cap${i}" class="clip cap" data-start="${c.s.toFixed(2)}" data-duration="${d.toFixed(2)}" data-track-index="6" style="top:${capTop(c.s)}cqw"><span>${c.t}</span></div>`; }).join('\n');

// Her take is split into muted 18s segments (assets/talk-seg, cut with 0.3s overlap) so each render extraction
// fits HyperFrames' 30s ffmpeg window; her voice plays from one full-length track (assets/talk-audio.m4a).
const SEG = 18;
const TALK_SEGS = Array.from({ length: Math.ceil(DUR / SEG) }, (_, i) => {
  const st = i * SEG, d = Math.min(SEG, DUR - st);
  return `<video id="talk-${i}" class="clip talk" src="assets/talk-seg/talk-${i}.mp4" muted playsinline data-start="${st}" data-duration="${+d.toFixed(3)}" data-track-index="${i % 2}"></video>`;
}).join('');

// ---- audio: sfx + 2-section music bed ----
const sfx = [];
// every sound effect gets its real length (they are 1 to 2s; typing is trimmed per use) and lanes rotate 12..15
const SFX_LEN = { 'pop-light': 0.18, 'pop-bubble': 0.38, nope: 1.2, check: 1.2, 'whoosh-air': 1.6, 'whoosh-fast': 1.4, 'paper-slide': 1.0, chime: 1.6, 'typing-laptop': 2, buzzer: 1.25 };
const fx = (id, file, t, vol = 0.6, d) => sfx.push(`<audio id="${id}" src="assets/sfx/${file}.mp3" data-start="${(+t).toFixed(2)}" data-duration="${d ?? SFX_LEN[file]}" data-track-index="${12 + (sfx.length % 4)}" data-volume="${vol}"></audio>`);
const T = {
  c1: 1.25, c2: 3.6, r2: 5.1, h2: 5.5,
  p3: 7.6, t3a: at('grammar', 7) + 0.2, t3b: at('information', 7) + 0.2, t3c: at("doesn't", 12) + 0.1,
  b4: win(4).s, mk4: at('personality', 16),
  g5: at('hired', 20) - 0.1,
  f6a: at('examples', 26), f6b: at('like', 29), f6c: at("don't", 30),
  q7a: at('feed', 32), q7b: at('style', 34), q7c: at('captions', 36),
  rc8: win(8).s + 0.25, h8: 41.0, pr8: 41.3, zoom8: at('sentence', 42),
  b9: at('voice', 49),
  m10: win(10).s + 0.15, m11: win(11).s + 0.1, m12: win(12).s + 0.1,
  c13a: win(13).s + 0.15, c13b: win(13).s + 0.75, c13c: win(13).s + 1.6, h13: win(13).s + 3.2,
  cur14: 74.6, b15: win(15).s + 0.15, u15: win(15).s + 1.3, h15: at('website', 84) - 0.4,
};
fx('fx-pop1', 'pop-light', T.c1); fx('fx-pop2', 'pop-bubble', T.c2); fx('fx-nope2', 'nope', T.h2, 0.55);
fx('fx-chk3a', 'check', T.t3a, 0.4); fx('fx-chk3b', 'check', T.t3b, 0.4); fx('fx-buzz3', 'buzzer', T.t3c, 0.45); // game-show buzzer (Mercedes 2026-10-13): no back-to-back nopes
fx('fx-wh4', 'whoosh-air', T.b4 - 0.15, 0.5); fx('fx-wh5', 'whoosh-fast', win(5).s - 0.12, 0.55); fx('fx-pop5', 'pop-bubble', T.g5, 0.6);
fx('fx-pap6a', 'paper-slide', T.f6a, 0.7); fx('fx-pap6b', 'paper-slide', T.f6b, 0.7); fx('fx-pap6c', 'paper-slide', T.f6c, 0.7);
fx('fx-pop7a', 'pop-light', T.q7a); fx('fx-pop7b', 'pop-light', T.q7b); fx('fx-pop7c', 'pop-light', T.q7c);
fx('fx-pap8', 'paper-slide', T.rc8, 0.6); fx('fx-type8', 'typing-laptop', T.pr8, 0.35, 1.2);
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-wh9b', 'whoosh-air', T.b9 - 0.1, 0.5);
fx('fx-type10', 'typing-laptop', T.m10 + 0.2, 0.3, 5.4); fx('fx-pop11a', 'pop-light', T.m11 + 0.8, 0.5); fx('fx-pop11b', 'pop-light', T.m11 + 2.4, 0.5);
// F12: typing under the banned list, ONE nope on the last line (four overlapping nopes sounded "crazy")
fx('fx-type12', 'typing-laptop', T.m12 + 0.3, 0.3, 2.6); fx('fx-no12', 'nope', T.m12 + 0.2 + 4 * 0.7, 0.35);
fx('fx-pop13a', 'pop-bubble', T.c13a); fx('fx-pop13c', 'pop-light', T.c13c); fx('fx-chk13', 'check', T.h13, 0.5);
fx('fx-pop14', 'pop-light', T.cur14 + 0.55, 0.5); fx('fx-wh15', 'whoosh-air', win(15).s, 0.4); fx('fx-chime15', 'chime', T.h15, 0.5, +(DUR - T.h15 - 0.02).toFixed(2));
// Music (Mercedes's Studio edits 2026-10-13): one track the whole way ("Be Happy 2" removed, she hated it),
// her fade-in 4.22s / fade-out 1.95s, turned way down. ONE static data-volume (no automation lane) so Studio's
// volume control moves the whole track instead of only the stretch between two automation points.
const music = `
<audio id="music-a" src="assets/music/music-a.mp3" data-start="0" data-duration="${DUR}" data-track-index="10" data-volume="0.02" data-fade-in="4.22" data-fade-out="1.95"></audio>`;

// ---- timeline ----
const pieces = P.cuts.map((c, i) => ({ t: c, scale: i % 2 ? 1.07 : 1 }));
const js = `
const tl = gsap.timeline({ paused: true });
const E = 'power3.out', B = 'back.out(1.6)';
// framing: alternate 1.00 / 1.07 at each jump cut, punch-in on "a sentence or two", whip handoffs into F5 and F9
${pieces.map((p) => `tl.set('#cam', { scale: ${p.scale} }, ${p.t});`).join('\n')}
tl.fromTo('#cam', { scale: 1.0 }, { scale: 1.15, duration: 0.45, ease: E, immediateRender: false }, ${T.zoom8});
tl.set('#cam', { scale: 1.0 }, ${win(9).s});
for (const t of [${win(5).s}, ${win(9).s}]) {
  tl.fromTo('#cam', { x: 0, filter: 'blur(0px)' }, { x: -90, filter: 'blur(14px)', duration: 0.12, ease: 'power2.in', immediateRender: false }, t - 0.12);
  tl.fromTo('#cam', { x: 90, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out', immediateRender: false }, t);
}
// pop-in helper (scale spring) and fade-up helper
const pop = (s, t, r = 0) => tl.fromTo(s, { scale: 0, rotation: r - 8, opacity: 0 }, { scale: 1, rotation: r, opacity: 1, duration: 0.45, ease: B }, t);
const up = (s, t, y = 30) => tl.fromTo(s, { y, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, t);
const draw = (s, t, d = 0.45) => tl.fromTo(s + ' .draw, ' + s + '.draw', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, t);
const swipe = (s, t) => tl.fromTo(s + ' .mkbg', { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, t);
const words = (s, t) => tl.fromTo(s + ' .w', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: E, stagger: 0.06 }, t);
// F1
words('#b1', 0.2); swipe('#b1', 0.9); pop('#c1', ${T.c1});
// F2
pop('#c2', ${T.c2}); draw('#r2', ${T.r2}, 0.5); up('#h2', ${T.h2}, 20); draw('#a2', ${T.h2 + 0.1}, 0.35);
// F3
tl.fromTo('#p3', { y: -60, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: -2, duration: 0.5, ease: B }, ${T.p3});
pop('#t3a', ${T.t3a}); pop('#t3b', ${T.t3b}); pop('#t3c', ${T.t3c});
// F4 (held: words land, then the swipe, then nothing moves)
words('#b4', ${T.b4 + 0.05}); swipe('#b4', ${T.mk4});
// F5
tl.fromTo('#g5', { scale: 1.6, rotation: 22, opacity: 0 }, { scale: 1, rotation: 6, opacity: 1, duration: 0.35, ease: 'power4.out' }, ${T.g5});
// F6 folders slide in one per word
${['f6a', 'f6b', 'f6c'].map((id, k) => `tl.fromTo('#${id}', { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: B }, ${T[id]});`).join('\n')}
// F7 her real covers snap in, labels after
${['q7a', 'q7b', 'q7c'].map((id) => `pop('#${id}', ${T[id]}, 0);`).join('\n')}
up('#h7a', ${T.q7b + 0.15}, 16); up('#h7b', ${T.q7c + 0.15}, 16);
// F8 receipt unrolls, prompt types
tl.fromTo('#rc8', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power1.inOut' }, ${T.rc8});
up('#h8', ${T.h8}, 16); pop('#pr8', ${T.pr8 - 0.25});
tl.fromTo('#pr8 .ptxt', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'steps(15)' }, ${T.pr8});
// F9 the fix lands
tl.fromTo('#b9', { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power4.out' }, ${T.b9 - 0.05});
pop('#sp9', ${T.b9 + 0.2});
// F10 to F12 voice.md being edited: lines appear in order, typed left to right
const typeLines = (s, t0, gap) => document.querySelectorAll(s + ' .ln').forEach((el, i) => {
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t0 + i * gap);
  tl.fromTo(el.querySelector('.lt'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: Math.max(0.2, gap * 0.8), ease: 'steps(18)' }, t0 + i * gap);
});
up('#m10', ${T.m10}, 40); typeLines('#m10', ${T.m10 + 0.35}, 0.68);
up('#m11', ${T.m11}, 20); typeLines('#m11', ${T.m11 + 0.3}, 0.75);
up('#m12', ${T.m12}, 20); typeLines('#m12', ${T.m12 + 0.2}, 0.7);
// F13 the voice file in use
up('#c13a', ${T.c13a}, 24); pop('#c13b', ${T.c13b}); up('#c13c', ${T.c13c}, 24); up('#h13', ${T.h13}, 16); draw('#a13', ${T.h13 + 0.1}, 0.35);
// F14 the Brain behind her: slow scroll, cursor clicks "Talk to my brain"
tl.fromTo('#br14', { yPercent: 0 }, { yPercent: -38, duration: ${win(14).d.toFixed(2)}, ease: 'none' }, ${win(14).s});
tl.fromTo('#cur14', { x: 160, y: 220, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: E }, ${T.cur14 - 0.8});
tl.fromTo('#cur14', { scale: 1 }, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, ${T.cur14 + 0.5});
// F15 CTA
words('#b15', ${T.b15}); swipe('#b15', ${T.b15 + 0.6}); pop('#u15', ${T.u15}); up('#h15', ${T.h15}, 16); draw('#a15', ${T.h15 + 0.1}, 0.4);
// captions: quick rise
document.querySelectorAll('.cap span').forEach((el) => { const t = +el.parentElement.dataset.start; tl.fromTo(el, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: E }, t); });
window.__timelines['main'] = tl;
`;

// split big statements into word spans for the word-by-word entrance (marker spans stay whole)
const splitWords = (html) => html.replace(/(<div id="b\d+" class="big"[^>]*>)(.*?)(<\/div>)/g, (m, a, inner, c) => a + inner.split(/(<span class="mk">.*?<\/span><\/span>)/).map((part) => part.startsWith('<span class="mk">') ? `<span class="w">${part}</span>` : part.split(/\s+/).filter(Boolean).map((w) => `<span class="w">${w}</span>`).join(' ')).join(' ') + c);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080, height=1920">
<script src="assets/js/gsap.min.js"></script>
<style>
@font-face{font-family:'ScrollyFigtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
@font-face{font-family:'ScrollyBricolage';src:url('assets/fonts/bricolage-800.woff2') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:'ScrollyHand';src:url('assets/fonts/covered-by-your-grace.woff2') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:100%;height:100%;overflow:hidden;container-type:inline-size;font-family:'ScrollyFigtree',sans-serif}
#cam{position:absolute;inset:0;transform-origin:50% 42%}
.talk{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scene{position:absolute;inset:0}
.cutvid{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
.abs{position:absolute}.blk{display:block}
.fill,.fade{position:absolute;inset:0}
.big{position:absolute;left:5cqw;right:5cqw;text-align:center;font-family:'ScrollyBricolage';font-weight:800;font-stretch:78%;line-height:.9;letter-spacing:-.01em;text-shadow:0 .4cqw 2cqw rgba(0,0,0,.35)}
.big .w{display:inline-block}
.mk{position:relative;display:inline-block;padding:0 .12em}
.mkbg{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};transform-origin:0 50%;border-radius:.08em;display:block}
.mk{rotate:-1.5deg}.mkbg{skew:-6deg}
.mkt{position:relative;color:${C.ink};text-shadow:none}
.hand{position:absolute;font-family:'ScrollyHand';line-height:1;text-shadow:0 0 1.1cqw rgba(0,0,0,.6),0 .3cqw 1.6cqw rgba(0,0,0,.55);white-space:nowrap}
.cap{position:absolute;left:6cqw;right:6cqw;text-align:center;z-index:8}
.cap span{display:inline-block;font:800 5.4cqw/1.15 'ScrollyFigtree';color:#fff;text-shadow:0 0 .6cqw rgba(0,0,0,.8),0 .5cqw 1.8cqw rgba(0,0,0,.6)}
.chat{position:absolute;left:6cqw;right:6cqw;display:flex;flex-direction:column;gap:1.6cqw}
.msg{font:500 4cqw/1.3 'Segoe UI','ScrollyFigtree',sans-serif;padding:2.4cqw 3.2cqw;border-radius:4.4cqw;max-width:84%;box-shadow:0 .8cqw 2.4cqw rgba(0,0,0,.25)}
.msg.me{align-self:flex-end;background:#2f2f2f;color:#fff;border-bottom-right-radius:1.2cqw}
.msg.ai{align-self:flex-start;background:#fff;color:#1c1c1c;border-bottom-left-radius:1.2cqw}
.chip{align-self:flex-end;font:600 3.2cqw 'Segoe UI','ScrollyFigtree';background:#fff;color:#333;padding:1.2cqw 2.4cqw;border-radius:2cqw;border:.3cqw solid #ddd}
.paper{position:absolute;left:14cqw;right:14cqw;background:#fffdf7;background-image:repeating-linear-gradient(180deg,transparent 0 8.4cqw,#cfe0ee 8.4cqw 8.7cqw);padding:2.6cqw 5cqw 3cqw;font:400 7.6cqw/8.7cqw 'ScrollyHand';color:#2b2724;box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.35)}
.paper div{display:flex;justify-content:space-between}.tick{display:inline-block;color:#2e7d4f;font-family:'ScrollyFigtree';font-weight:800}.tick.x{color:${C.orange}}
.badge{position:absolute;width:46cqw;border-radius:2.4cqw;overflow:hidden;box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.4);background:#fff}
.b-top{background:${C.orange};color:#fff;text-align:center;font:800 9cqw/1 'ScrollyFigtree';padding:2cqw 0 1.4cqw}.b-top small{display:block;font:600 3.4cqw 'ScrollyFigtree';margin-top:.6cqw}
.b-name{font:400 7.4cqw/1 'ScrollyHand';color:${C.ink};text-align:center;padding:4cqw 2cqw 4.6cqw}
.folder{position:absolute;width:30cqw;filter:drop-shadow(0 1.4cqw 2.4cqw rgba(0,0,0,.4))}
.f-tab{display:inline-block;background:#E9C98E;font:400 6.4cqw/1 'ScrollyHand';color:#2b2724;padding:1.6cqw 3cqw 1cqw 2.4cqw;border-radius:1.6cqw 3cqw 0 0;white-space:nowrap}
.f-body{height:20cqw;border-radius:0 1.6cqw 1.6cqw 1.6cqw;position:relative;overflow:hidden;background:linear-gradient(180deg,#F2D7A3,#E2BE80)}
.f-body i{position:absolute;left:12%;right:12%;display:block}.f-body i:nth-child(1){top:-.6cqw;height:4cqw;background:#fffdf7;border-radius:.4cqw}.f-body i:nth-child(2){top:7cqw;height:.5cqw;background:rgba(138,106,58,.35)}.f-body i:nth-child(3){top:10cqw;height:.5cqw;right:30%;background:rgba(138,106,58,.35)}
.post{position:absolute;width:27cqw;border-radius:1cqw;border:.8cqw solid #fff;box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.4)}
.receipt{position:absolute;width:30cqw;background:#fffdf7;padding:3cqw 3.2cqw 6cqw;font:400 5.4cqw/1.12 'ScrollyHand';color:#2b2724;rotate:-3deg;box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.35)}
.receipt b{font-weight:400;color:${C.orange}}
.prompt{position:absolute;width:56cqw;display:flex;align-items:center;justify-content:space-between;background:#2f2f2f;color:#fff;border-radius:99px;padding:2.4cqw 2.4cqw 2.4cqw 4cqw;font:500 4.4cqw 'Segoe UI','ScrollyFigtree';box-shadow:0 1cqw 3cqw rgba(0,0,0,.4)}
.prompt .ptxt{display:inline-block}
.prompt i{font-style:normal;width:6.4cqw;height:6.4cqw;border-radius:50%;background:#fff;color:#2f2f2f;display:grid;place-items:center;font-weight:800}
.md{position:absolute;left:5cqw;right:5cqw;background:#1f1d1b;border-radius:2cqw;overflow:hidden;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.45);font:500 3.7cqw/1.55 Consolas,'Cascadia Mono',monospace}
.md-bar{display:flex;align-items:center;gap:1.2cqw;padding:1.6cqw 2.4cqw;background:#2b2826}.md-bar i{width:2cqw;height:2cqw;border-radius:50%;background:#5a5450;display:block}.md-bar span{margin-left:1.6cqw;font:600 3.2cqw 'ScrollyFigtree';color:#cfc6bd}
.md-body{padding:1.8cqw 0 2.4cqw}.ln{display:flex;gap:3cqw;padding:0 3cqw;color:#e9e1d8;min-height:5.7cqw}.ln b{width:4cqw;text-align:right;color:#6f6862;font-weight:400}.lt{display:inline-block}
.ln.h .lt{color:${C.peach};font-weight:700}.ln.add{background:rgba(110,190,130,.16)}.ln.add b{color:#7fcf93}.ln.no{background:rgba(224,90,51,.16)}.ln.no b{color:${C.orange}}
.brainwrap{position:absolute;inset:0;overflow:hidden;background:#efe6da}.brain{position:absolute;left:0;top:0;width:100%;display:block}
.url{position:absolute;left:14cqw;right:14cqw;display:flex;align-items:center;gap:2cqw;background:#fff;border-radius:99px;padding:2.4cqw 4cqw;font:600 5cqw 'Segoe UI','ScrollyFigtree';color:#1c1c1c;box-shadow:0 1cqw 3cqw rgba(0,0,0,.35)}.lock{font-size:3.6cqw}
.draw{stroke-dasharray:1;stroke-dashoffset:1}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
<div id="cam">${TALK_SEGS}</div>
<audio id="voice" src="assets/talk-audio.m4a" data-start="0" data-duration="${DUR}" data-track-index="9" data-volume="1"></audio>
${splitWords(S.join('\n'))}
${CUTS.join('\n')}
${capHtml}
${sfx.join('\n')}
${music}
</div>
<script>${js}</script>
</body>
</html>`;
writeFileSync('index.html', html);
console.log(`index.html: ${DUR}s, ${S.length} scene layers, ${caps.length} captions, ${sfx.length} sfx`);
