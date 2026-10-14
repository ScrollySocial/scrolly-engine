// "Give your AI a voice file" Studio Reel, rebuilt on the shared library (lib/). Same locked storyboard v4 as build.mjs;
// this file only says what appears when. Usage: node build-lib.mjs [out.html]   (default index.html)
import { reel } from '../lib/reel.mjs';

const R = reel();
const { K, C, at, win } = R;
R.frames([0, 3.4, at('and funny'), at("that's because"), 20.14, at('you would show'), at('and they would'), at('but for some'), at('so one of'), at("and that's really"), at('and it gives'), at('you can also'), 65.85, at('this is something'), 78.9]);

// key moments (seconds on her prepped take)
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

// camera: alternate framing per jump cut, punch-in on "a sentence or two", whips into F5 and F9
R.cam.alternate();
R.cam.punch(T.zoom8);
R.cam.set(win(9).s, '1.0');
R.cam.whip(win(5).s); R.cam.whip(win(9).s);

// ---- scenes (storyboard v4) ----
R.scene(1, [K.fade(48), K.statement('b1', 'Ever asked <m>AI</m> to write for you?', { top: 6, size: 10.5, in: 0.2, swipe: 0.9 }),
  K.chat([{ id: 'c1', kind: 'me', text: 'write a caption for my candle shop', in: T.c1 }], { top: 29 })]);
R.scene(2, [K.fade(50), K.chat([{ id: 'c2', kind: 'ai', text: 'This isn’t just a candle. It’s an experience. ✨🔥🚀 Elevate your space today!!', in: T.c2 }], { top: 6, left: 13, right: 13 }),
  K.ring('r2', { x: 1, y: 0, w: 98, h: 30, in: T.r2 }), K.hand('h2', 'nope.', { x: 66, y: 31, size: 11, r: -8, color: C.orange, in: T.h2, rise: 20 }),
  K.arrow('a2', { x: 46, y: 27, w: 18, r: 165, color: C.orange, in: T.h2 + 0.1 })]);
R.scene(3, [K.fade(50), K.paper('p3', [{ id: 't3a', text: 'grammar', ok: true, in: T.t3a }, { id: 't3b', text: 'information', ok: true, in: T.t3b }, { id: 't3c', text: 'sounds like you', ok: false, in: T.t3c }], { top: 6, in: T.p3 })]);
R.scene(4, [K.fill(C.blush), K.statement('b4', 'doesn’t automatically know your <m>personality</m>', { top: 7, size: 15.5, color: C.ink, in: T.b4 + 0.05, swipe: T.mk4 })]);
R.scene(5, [K.badge('g5', { x: 47, y: 8, name: 'your social media', in: T.g5 })]);
R.scene(6, [K.fade(50), K.folder('f6a', 'examples', { x: 4, y: 12, r: -7, in: T.f6a }), K.folder('f6b', 'likes ♥', { x: 35, y: 7, r: 1, in: T.f6b }), K.folder('f6c', 'dislikes ✗', { x: 66, y: 13, r: 7, in: T.f6c })]);
R.scene(7, [K.fade(44), K.post('q7a', 'assets/img/feed1.jpg', { x: 4, y: 7, r: -7, in: T.q7a }), K.post('q7b', 'assets/img/feed2.jpg', { x: 37, y: 4, r: 2, in: T.q7b }), K.post('q7c', 'assets/img/feed3.jpg', { x: 69, y: 8, r: 8, in: T.q7c }),
  K.hand('h7a', 'your style', { x: 6, y: 46, r: -5, in: T.q7b + 0.15 }), K.hand('h7b', 'your captions', { x: 60, y: 46, r: 4, in: T.q7c + 0.15 })]);
R.scene(8, [K.fade(48), K.receipt('rc8', 'the new hire got:', ['examples', 'likes', 'dislikes', 'your feed', 'your style', 'your captions', '...'], { x: 3, y: 5, in: T.rc8 }),
  K.hand('h8', 'AI got:', { x: 42, y: 16, size: 8, in: T.h8 }), K.prompt('pr8', 'write a caption', { x: 40, y: 30, in: T.pr8 - 0.25, typeAt: T.pr8 })]);
R.scene(9, [K.fill('rgba(10,8,6,.42)'), K.statement('b9', 'VOICE FILE', { top: 8, size: 30, color: C.cream2, in: T.b9 - 0.05, enter: 'slam' })]);
R.scene(9, [K.spark('sp9', { x: 84, y: 10, s: 8, in: T.b9 + 0.2 })], { layer: 'b' });
R.scene(10, [K.fade(52), K.mdFile('m10', 'voice.md', [['1', '# My voice', 'h'], ['2', ''], ['3', '## How I talk', 'h'], ['+', 'warm, clear, a little funny', 'add'], ['+', 'short sentences, real examples', 'add'], ['6', '## What I like', 'h'], ['+', 'specific details, plain words', 'add'], ['+', 'no hype, no big promises', 'add']], { top: 5, in: T.m10, rise: 40, typeAt: T.m10 + 0.35, gap: 0.68 })]);
R.scene(11, [K.fade(52), K.mdFile('m11', 'voice.md', [['9', '## Examples', 'h'], ['+', '> New fall scents just landed.', 'add'], ['+', '> Cozy, small batch, gone fast.', 'add'], ['+', '> Packing orders today with a', 'add'], ['+', '> very bossy cat supervising.', 'add']], { top: 5, in: T.m11, typeAt: T.m11 + 0.3, gap: 0.75 })]);
R.scene(12, [K.fade(52), K.mdFile('m12', 'voice.md', [['15', '## Never say', 'h'], ['✗', 'It’s not X, it’s Y', 'no'], ['✗', 'Let’s dive in', 'no'], ['✗', 'Buckle up', 'no'], ['✗', '🚀🚀🚀!!!', 'no']], { top: 5, in: T.m12, typeAt: T.m12 + 0.2, gap: 0.7 })]);
R.scene(13, [K.fade(54), K.chat([{ id: 'c13a', kind: 'me', text: 'write a caption for my candle shop', in: T.c13a, enter: 'up' }, { id: 'c13b', kind: 'chip', text: '📄 voice.md', in: T.c13b }, { id: 'c13c', kind: 'ai', text: 'New fall scents are in. Soft, cozy, made in small batches. Come smell them before they sell out.', in: T.c13c, enter: 'up' }], { top: 4 }),
  K.hand('h13', 'sounds like me', { x: 50, y: 47, size: 8, r: -5, color: C.peach, in: T.h13 }), K.arrow('a13', { x: 28, y: 44, w: 18, r: 200, color: C.peach, in: T.h13 + 0.1 })]);
R.scene(14, [K.scrollPage('br14', 'assets/img/brain.png', { in: win(14).s, dur: win(14).d.toFixed(2) })]);
R.scene(14, [K.cursor('cur14', { x: 74, y: 14, click: T.cur14 })], { layer: 'b' });
R.scene(15, [K.fade(50), K.statement('b15', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: T.b15, swipe: T.b15 + 0.6 }), K.urlBar('u15', 'scrollyseo.com', { top: 31, in: T.u15 }),
  K.hand('h15', 'on my website', { x: 56, y: 44, size: 7.5, in: T.h15 }), K.arrow('a15', { x: 34, y: 41, w: 18, r: 190, in: T.h15 + 0.1, d: 0.4 })]);

// her, background removed, in front of the F4 / F9 / F14 panels
R.cutout(4, 'assets/cut/f04-cut.webm'); R.cutout(9, 'assets/cut/f09-cut.webm'); R.cutout(14, 'assets/cut/f14-cut.webm');

R.captions({ hide: [4, 9, 13, 15], top: (t) => (t >= win(14).s && t < win(15).s ? 150 : 128) });

// ---- sound ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', T.c1); fx('fx-pop2', 'pop-bubble', T.c2); fx('fx-nope2', 'nope', T.h2, 0.55);
fx('fx-chk3a', 'check', T.t3a, 0.4); fx('fx-chk3b', 'check', T.t3b, 0.4); fx('fx-buzz3', 'buzzer', T.t3c, 0.45); // buzzer, not a second nope
fx('fx-wh4', 'whoosh-air', T.b4 - 0.15, 0.5); fx('fx-wh5', 'whoosh-fast', win(5).s - 0.12, 0.55); fx('fx-pop5', 'pop-bubble', T.g5, 0.6);
fx('fx-pap6a', 'paper-slide', T.f6a, 0.7); fx('fx-pap6b', 'paper-slide', T.f6b, 0.7); fx('fx-pap6c', 'paper-slide', T.f6c, 0.7);
fx('fx-pop7a', 'pop-light', T.q7a); fx('fx-pop7b', 'pop-light', T.q7b); fx('fx-pop7c', 'pop-light', T.q7c);
fx('fx-pap8', 'paper-slide', T.rc8, 0.6); fx('fx-type8', 'typing-laptop', T.pr8, 0.35, 1.2);
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-wh9b', 'whoosh-air', T.b9 - 0.1, 0.5);
fx('fx-type10', 'typing-laptop', T.m10 + 0.2, 0.3, 5.4); fx('fx-pop11a', 'pop-light', T.m11 + 0.8, 0.5); fx('fx-pop11b', 'pop-light', T.m11 + 2.4, 0.5);
fx('fx-type12', 'typing-laptop', T.m12 + 0.3, 0.3, 2.6); fx('fx-no12', 'nope', T.m12 + 0.2 + 4 * 0.7, 0.35); // ONE nope on the last banned line
fx('fx-pop13a', 'pop-bubble', T.c13a); fx('fx-pop13c', 'pop-light', T.c13c); fx('fx-chk13', 'check', T.h13, 0.5);
fx('fx-pop14', 'pop-light', T.cur14 + 0.55, 0.5); fx('fx-wh15', 'whoosh-air', win(15).s, 0.4); fx('fx-chime15', 'chime', T.h15, 0.5, +(R.DUR - T.h15 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // her Studio settings: volume 0.02, fade-in 4.22s, fade-out 1.95s (template defaults)

R.write(process.argv[2] || 'index.html');
