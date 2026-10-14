// "How many business ideas have you lost in AI chats?": Studio Reel (Business Brain / IMG_2004 take 3 + CTA IMG_2007,
// filmed 2026-10-12). Drafted 2026-10-14 (daytime run of the overnight step D); plan, sounds and music wait for her on the page.
// Spine: a good idea you can't find again (search comes up empty) → the Brain → a new idea and a style change each land
// in the right file → it stays part of the business for good → CTA.
// Looks different from today's regret-not-sooner draft (which scatters a chat history list): here a chat SEARCH comes up empty.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;
// caption fixes on the transcript
for (const [i, w] of R.W.entries()) {
  if (/^business$/i.test(w.w) && R.W[i - 1]?.w === 'Scrolly') w.w = 'Business';
  if (/^brain/i.test(w.w) && /^business$/i.test(R.W[i - 1]?.w || '') && R.W[i - 2]?.w === 'Scrolly') w.w = w.w.replace('brain', 'Brain');
  if (w.w === 'You' && R.W[i - 1]?.w === 'or') w.w = 'you';
  if (w.w === 'businesses' && R.W[i + 1]?.w === 'permanent') w.w = 'business’s';
  if (w.w === 'business' && R.W[i - 1]?.w === 'Your' && R.W[i + 1]?.w === 'brain') { w.w = 'Business'; R.W[i + 1].w = 'Brain'; }
}

R.frames([0, at('old'), at('i built'), at("it's called"), at('every time'), at('you just'), at('your business'), at('update'),
  at('so that'), at('so if')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const ME = { kind: 'me' };

// F1 hook
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(50), K.statement('b1', 'How many ideas are <m>buried</m> in old AI chats?', { top: 6, size: 10, in: 0.15, swipe: 0.9 })]);

// F2 she searches her chats for that idea: nothing comes back
note(2, 'Chat search types “bundle idea”, comes back empty; aside "it was right here…"', 'typing, nope on “No chats found”');
const SEARCH = `<div id="srch2" class="abs" style="left:10cqw;right:10cqw;top:5cqw;background:#f9f9f9;border-radius:2.4cqw;padding:2.4cqw 3cqw 3cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:'Segoe UI','${B.font.body}',sans-serif;color:#202124">
  <div style="display:flex;align-items:center;gap:2cqw;background:#fff;border:.3cqw solid #d0d0d0;border-radius:99px;padding:1.8cqw 3cqw">
    <svg viewBox="0 0 24 24" style="width:4.6cqw;height:4.6cqw;flex:none"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#6b6b6b" stroke-width="2.4"/><path d="M15 15 L21 21" stroke="#6b6b6b" stroke-width="2.6" stroke-linecap="round"/></svg>
    <span id="q2" style="font:400 4.3cqw/1.2 'Segoe UI';display:inline-block">holiday bundle idea</span></div>
  <div id="none2" style="font:600 4cqw/1.2 'Segoe UI';color:#8e8e8e;text-align:center;margin-top:3cqw">No chats found</div></div>`;
R.scene(2, [K.fade(54), { html: SEARCH, anim: [
  `tl.fromTo('#srch2', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, ${win(2).s + 0.05});`,
  `tl.fromTo('#q2', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(19)' }, ${at('conversation')});`,
  `pop('#none2', ${at('cannot')});`,
] }, K.hand('h2', 'it was right here…', { x: 36, y: 33, size: 7, r: -4, in: at('find') + 0.1 })]);

// F3 the promise
note(3, 'Statement: never lose a good idea again, aside "so I built this"', 'air whoosh in, bubble pop on the swipe');
R.scene(3, [K.fade(50), K.hand('h3', 'so I built this', { x: 22, y: 4, size: 7, r: -3, in: win(3).s + 0.1 }),
  K.statement('b3', 'Never lose a good idea <m>again</m>', { top: 15, size: 12, in: at('make sure'), swipe: at('again') })]);

// F4 the real Business Brain scrolls behind her (cut out), cursor clicks
note(4, 'The real Business Brain scrolls behind her (cut out); cursor clicks', 'whip whoosh in, light pop on the click');
R.scene(4, [K.scrollPage('br4', 'assets/img/brain.png', { in: win(4).s, dur: win(4).d.toFixed(2) })]);
R.scene(4, [K.cursor('cur4', { x: 74, y: 14, click: win(4).s + 1.3 })], { layer: 'b' });
R.cutout(4, 'assets/cut/f04-cut.webm', 6, 'sketch/f04-cut.png');

// F5 a new idea comes up in a chat
note(5, 'Chat: she types a new product idea, AI offers to save it', 'bubble pop, light pop');
R.scene(5, [K.fade(54), K.chat([
  { ...ME, id: 'c5a', text: 'idea: refill pouches for my candles, so people keep the jar', in: at('come up'), enter: 'up' },
  { id: 'c5b', kind: 'ai', text: 'Love that. Saving it to your Ideas.', in: at('do', 16) },
], { top: 5 })]);

// F6 or a style change going forward
note(6, 'Prompt bar types a new style rule, aside "or a new rule"', 'bubble pop on the bar, typing');
R.scene(6, [K.fade(46), K.prompt('p6', 'new rule: no emojis', { x: 22, y: 12, in: win(6).s + 0.05, typeAt: at('change') }),
  K.hand('h6', 'or a new rule', { x: 30, y: 30, size: 7, r: -3, in: at('style') })]);

// F7 the Brain remembers: the ideas file gets the new line
note(7, 'ideas.md: the refill idea types in under an older idea', 'paper slide, typing');
R.scene(7, [K.fade(54), K.mdFile('md7', 'ideas.md', [
  ['1', '# Ideas', 'h'],
  ['2', 'holiday gift bundle', ''],
  ['3', '+ candle refill pouches', 'add'],
], { top: 5, in: win(7).s + 0.05, typeAt: at('remember'), gap: 0.45 })]);

// F8 ...and the right files get updated: two folders drop in
note(8, 'Two folders drop in: ideas / my voice, aside "filed for you"', 'paper slide, light pop');
R.scene(8, [K.fade(48),
  K.folder('f8a', 'ideas', { x: 8, y: 9, r: -6, in: win(8).s + 0.05 }),
  K.folder('f8b', 'my voice', { x: 54, y: 6, r: 5, in: at('files') }),
  K.hand('h8', 'filed for you', { x: 30, y: 42, size: 7, r: -3, in: at('files') + 0.3 })]);

// F9 part of the business for good
note(9, 'Statement: your business’s permanent memory, aside "no more digging through old chats"', 'air whoosh on the swipe, check on the aside');
R.scene(9, [K.fade(50), K.statement('b9', 'Your business’s <m>permanent</m> memory', { top: 6, size: 12, in: at('becomes'), swipe: at('permanent') }),
  K.hand('h9', 'no more digging through old chats', { x: 6, y: 41, size: 6, r: -3, in: at('going', 27) })]);

// F10 CTA (no price; name + site)
note(10, 'End card: name + scrollyseo.com, aside "on my website"', 'air whoosh, chime under “on my website”');
R.scene(10, [K.fade(50), K.statement('b10', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(10).s + 0.1, swipe: win(10).s + 0.7 }),
  K.urlBar('u10', 'scrollyseo.com', { top: 31, in: at('check out') }),
  K.hand('h10', 'on my website', { x: 56, y: 44, size: 7.5, in: at('website') - 0.4 }), K.arrow('a10', { x: 34, y: 41, w: 18, r: 190, in: at('website') - 0.3, d: 0.4 })]);

// camera: alternate framing per jump cut, punch-in on "cannot find again", whips into the Brain and the end card
R.cam.alternate();
R.cam.punch(at('cannot'));
R.cam.set(win(4).s, '1.0');
R.cam.whip(win(4).s); R.cam.whip(win(10).s);

R.captions({ hide: [1, 10], top: (t) => (t >= win(4).s && t < win(5).s ? 150 : 128) });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', 0.9);
fx('fx-type2', 'typing-laptop', at('conversation'), 0.35, 0.9); fx('fx-no2', 'nope', at('cannot'), 0.45);
fx('fx-wh3', 'whoosh-air', win(3).s, 0.4); fx('fx-pop3', 'pop-bubble', at('again', 10));
fx('fx-wh4', 'whoosh-fast', win(4).s - 0.12, 0.55); fx('fx-pop4', 'pop-light', win(4).s + 1.8, 0.5);
fx('fx-pop5a', 'pop-bubble', at('come up')); fx('fx-pop5b', 'pop-light', at('do', 16));
fx('fx-pop6', 'pop-bubble', win(6).s + 0.05); fx('fx-type6', 'typing-laptop', at('change'), 0.35, 1.0);
fx('fx-pap7', 'paper-slide', win(7).s + 0.05, 0.6); fx('fx-type7', 'typing-laptop', at('remember'), 0.35, 1.3);
fx('fx-pap8', 'paper-slide', win(8).s + 0.05, 0.6); fx('fx-pop8', 'pop-light', at('files'));
fx('fx-wh9', 'whoosh-air', at('permanent') - 0.1, 0.4); fx('fx-chk9', 'check', at('going', 27), 0.45);
fx('fx-wh10', 'whoosh-air', win(10).s, 0.4); fx('fx-chime10', 'chime', at('website') - 0.4, 0.5, +(R.DUR - at('website') + 0.4 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Sleepy Cat" (Mixkit, from Reel #2's candidates; Curiosity, Chill Bro, Lonerism, Sweet September and Slow Pop are on other Reels)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'How many ideas are <m>buried</m> in old AI chats?' },
  { text: 'Scrolling old chats for <m>that one idea</m>?' },
  { text: 'Where did <m>that idea</m> go?', aside: 'it was in some chat…' },
  { text: 'Your best ideas are <m>lost</m> in AI chats' },
  { text: 'Can’t find that <m>AI chat</m> again?' },
  { text: 'Make AI <m>remember</m> your ideas' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `How many good ideas are sitting in AI chats you'll never open again? My Scrolly Business Brain (scrollyseo.com) saves every new idea and style change to the right file, so it stays part of your business going forward.

Try this today: skim your last five AI chats, copy any idea you still want to try into one note, and paste that note in the next time you plan with AI.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #businessideas',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'How many business ideas have you lost in AI chats?', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
