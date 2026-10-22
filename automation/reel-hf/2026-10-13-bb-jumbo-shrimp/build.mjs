// "AI + a brain = jumbo shrimp": Studio Reel #3 (Business Brain / "Just don't use the part…", rough cut approved 2026-10-13,
// her last line "and that is how you build a brain" cut). Spine: the oxymoron joke (JUMBO huge, shrimp tiny, Mercedes asked
// for FUN huge text), then AI is artificial → add the human element (you) → do it systematically (the Brain).
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;
// caption fixes on the transcript
for (const w of R.W) { if (w.w === 'Artificial') w.w = 'artificial'; if (w.w === 'Systematic') w.w = 'systematic'; }

R.frames([0, at('sounds'), at('like', 6), at("here's"), at('and', 13), at('so', 16), at('and only'), at('but you'), at('and efficient')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const S = B.font.statement;
// times of n spoken words starting at a phrase, and an entrance that shows each word of #id the moment she says it
// (Mercedes 2026-10-14: on-screen words should work like captions, not appear as one block)
const seq = (phrase, n, after = 0) => { const t0 = at(phrase, after), i = R.W.findIndex((w) => +w.s.toFixed(2) === t0); return R.W.slice(i, i + n).map((w) => +w.s.toFixed(2)); };
const say = (id, times) => ({ html: '', anim: times.map((t, k) => `tl.fromTo('#${id} > .w:nth-of-type(${k + 1})', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, ${t});`) });

// F1 hook above her head, word by word as she says it
note(1, 'Hook above her head');
R.scene(1, [K.fade(46), K.statement('b1', 'Your AI would be better if you gave it a <m>brain</m>', { top: 6, size: 10, swipe: at('brain') + 0.15 }), say('b1', seq('your', 11))]);

// F2 a real-looking dictionary card for "oxymoron"
note(2, 'Dictionary card: oxymoron');
R.scene(2, [K.fade(46), {
  html: `<div id="dict2" class="abs" style="left:7cqw;right:7cqw;top:7cqw;background:#fff;border-radius:2.6cqw;padding:4cqw 5cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:'Segoe UI','${B.font.body}',sans-serif;color:#202124">
    <div style="font:700 8.6cqw/1 'Segoe UI','${B.font.body}'">ox·y·mo·ron</div>
    <div style="font:400 3.6cqw/1.4 'Segoe UI';color:#70757a;margin:1.6cqw 0 2.2cqw">noun</div>
    <div style="font:400 4.3cqw/1.4 'Segoe UI'">two words that contradict each other, used side by side</div></div>`,
  anim: [`pop('#dict2', ${at('oxymorons')}, -2);`],
}]);

// F3 JUMBO huge on top (letters bounce in one by one); SHRIMP just as huge slams in over her shirt (Mercedes: the tiny
// shrimp couldn't be read, huge is fine). Holds through "But hear me out" (handwritten aside) so SHRIMP stays up >1s.
note(3, 'FUN huge JUMBO on top, huge SHRIMP below; aside: but hear me out');
const big3 = (word, rot) => word.split('').map((l, i) =>
  `<span class="jl" data-layout-allow-overlap data-layout-allow-overflow style="display:inline-block;rotate:${rot[i % rot.length]}deg;color:${C.peach};-webkit-text-stroke:1.3cqw ${C.ink};paint-order:stroke fill;text-shadow:1.4cqw 1.6cqw 0 ${C.ink}">${l}</span>`).join('');
const box3 = (id, top, size) => `<div id="${id}" class="abs" style="left:0;right:0;top:${top}cqw;text-align:center;font-family:'${S}';font-weight:800;font-stretch:78%;font-size:${size}cqw;line-height:1;letter-spacing:-.01em">`;
R.scene(3, [K.fade(54), {
  html: `${box3('jb3', 2, 31)}${big3('JUMBO', [-7, 4, -3, 6, -5])}</div>${box3('sh3', 112, 29)}${big3('SHRIMP', [5, -4, 3, -6, 4, -3])}</div>`,
  anim: [
    `tl.fromTo('#jb3 .jl', { scale: 0, y: -120, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.42, ease: 'back.out(2.4)', stagger: 0.07 }, ${at('jumbo')});`,
    `tl.fromTo('#sh3 .jl', { scale: 1.8, y: 80, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.32, ease: 'power4.out', stagger: 0.04 }, ${at('shrimp')});`,
    `tl.fromTo('#jb3', { y: 0 }, { y: -18, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, ${at('shrimp') + 0.2});`,
  ],
}, K.hand('h3', 'but hear me out'.split(' ').map((w) => `<span class="w" style="display:inline-block">${w}</span>`).join(' '), { x: 4, y: 42, size: 6.5, r: -5 }),
  say('h3', seq('but hear', 4))]); // each word as she says it (Mercedes 2026-10-14)

// F4 the ask: generic AI reply (a pattern banned in her voice file), then the extra brain gets attached
note(4, 'Chat: generic AI reply, then the extra brain gets attached');
R.scene(4, [K.fade(54), K.chat([
  { id: 'c5a', kind: 'me', text: 'write an Instagram post for my candle shop', in: at('why'), enter: 'up' },
  { id: 'c5b', kind: 'ai', text: 'It’s not just a candle, it’s an experience ✨', in: at('better', 10) },
  { id: 'c5c', kind: 'chip', text: '🧠 + my Business Brain', in: at('additional') },
], { top: 5 }), K.hand('h5', 'a second brain', { x: 8, y: 42, size: 6.5, r: -4, in: at('brain', 12) })]);

// F5 AI is artificial
note(5, 'AI is artificial (it’s in the name)');
R.scene(5, [K.fade(50), K.statement('b6', 'AI is <m>artificial</m>', { top: 7, size: 14, in: at('because'), swipe: at('artificial') }),
  K.hand('h6', 'it’s literally in the name', { x: 30, y: 30, size: 6, r: -3, in: at('artificial') + 0.3 })]);

// F6 the human element, as a periodic-table tile
note(6, 'Periodic-table tile: Hu, the human element');
R.scene(6, [K.fade(50), {
  html: `<div id="pt7" class="abs" style="left:34cqw;top:5cqw;width:32cqw;height:32cqw;background:${C.cream};border:.9cqw solid ${C.ink};border-radius:1.2cqw;box-shadow:1.4cqw 1.6cqw 0 ${C.ink};color:${C.ink};font-family:'${B.font.body}'">
    <div style="position:absolute;left:2.4cqw;top:1.6cqw;font:700 4.4cqw '${B.font.body}'">1</div>
    <div style="position:absolute;left:0;right:0;top:6.5cqw;text-align:center;font:800 15cqw/1 '${S}';font-stretch:78%">Hu</div>
    <div style="position:absolute;left:0;right:0;bottom:2.4cqw;text-align:center;font:600 4.4cqw '${B.font.body}'">Human</div></div>`,
  anim: [`pop('#pt7', ${at('human')}, -4);`],
}, K.hand('h7', 'add this in', { x: 4, y: 12, size: 6.5, r: -6, in: at('add') }), K.arrow('a7', { x: 17, y: 20, w: 18, r: -25, in: at('add') + 0.15 })]); // tip lands at the tile's left edge (Mercedes: arrow wasn't pointing at the Hu)

// F7 only you
note(7, 'HELLO badge: only you');
R.scene(7, [K.fade(48), K.badge('bd8', { x: 27, y: 6, top: 'HELLO', small: 'the human element is', name: 'only you', in: at('only') })]);

// F8 do it systematically: the Brain file fills in
note(8, 'A .md file fills in, line by line');
R.scene(8, [K.fade(54), K.mdFile('md9', 'my-business-brain.md', [
  ['1', '# My Business Brain', 'h'],
  ['2', '+ my offers and prices', 'add'],
  ['3', '+ how I talk', 'add'],
  ['4', '+ who I help', 'add'],
], { top: 5, in: at('but you'), typeAt: at('still'), gap: 0.5 })]);

// F9 end card (no price; name + site)
note(9, 'End card: name + scrollyseo.com');
R.scene(9, [K.fade(50), K.statement('b10', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(9).s + 0.1, swipe: win(9).s + 0.6 }),
  K.urlBar('u10', 'scrollyseo.com', { top: 21, in: at('way') })]);

// camera: alternate framing per jump cut, punch-in on "jumbo", whip into "AI is artificial" and the end card
R.cam.alternate();
R.cam.punch(at('jumbo'));
R.cam.whip(win(5).s); R.cam.whip(win(9).s);

R.captions({ hide: [1, 3, 5] });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('brain'));
fx('fx-pop2', 'pop-bubble', at('oxymorons'));
fx('fx-wh3', 'whoosh-fast', at('jumbo') - 0.05, 0.55); fx('fx-pop3', 'pop-light', at('shrimp'), 0.7);
fx('fx-pop4a', 'pop-bubble', at('why')); fx('fx-type4', 'typing-laptop', at('your', 9), 0.35, 1.2);
fx('fx-pop4b', 'pop-light', at('better', 10)); fx('fx-sw4c', 'swoosh-in', at('additional') - 0.08, 0.5); // brain attaches: a new whoosh (Mercedes 2026-10-14)
fx('fx-wh5', 'whoosh-fast', win(5).s - 0.12, 0.55); fx('fx-wh5b', 'whoosh-air', at('artificial') - 0.1, 0.45);
fx('fx-pop6', 'pop-bubble', at('human'));
fx('fx-pop7', 'pop-light', at('only'));
fx('fx-pap8', 'paper-slide', at('but you'), 0.6); fx('fx-type8', 'typing-laptop', at('still'), 0.35, 2);
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-chime9', 'chime', at('way'), 0.5, +(R.DUR - at('way') - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Chill Bro" (Mixkit, from Reel #2's candidates; the others are in assets/music-candidates to swap on the page)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'Why your AI sounds so <m>artificial</m>' },
  { text: 'The <m>human element</m> your AI is missing' },
  { text: 'Your AI needs a <m>second brain</m>', aside: 'hear me out' },
  { text: 'AI with a brain? Sounds like <m>jumbo shrimp</m>' },
  { text: 'Stop getting AI posts that sound <m>like a robot</m>' },
  { text: 'The one thing <m>only you</m> can give your AI' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `AI sounds artificial because it is, and the fix is adding what only you know about your business. I keep mine in my Scrolly Business Brain (scrollyseo.com), so every post starts with my real offers, my voice and the people I help.

Start small today: write three lines about how you talk to your customers and paste them in before your next AI request.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #instagramtips',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'AI + a brain = jumbo shrimp', covers: COVERS, coverCut: 'review/cover-cuts/f08.png', stills, post: POST });
}
else R.write();
