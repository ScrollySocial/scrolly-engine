// "Your AI should know what you're selling": Studio Reel #2 (Business Brain / IMG_1996, rough cut approved 2026-10-13).
// Spine: one made-up product (a sourdough starter kit) asked about twice. First the AI guesses ([PRICE] placeholders,
// then a pile of corrections); then the same ask with the Brain's real "My offers" attached gets it right.
// Usage: node build.mjs              → index.html
//        node build.mjs storyboard   → storyboard.html (sketch sheet over real stills, for her review)
//        node build.mjs animatic     → animatic.mp4 (approved sketches timed to voice + music + sound effects)
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { animatic } from '../lib/animatic.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, at, win } = R;
// caption fixes on the transcript
for (const w of R.W) { if (w.w === 'Course,') w.w = 'course,'; if (/^business$/i.test(w.w) && R.W[R.W.indexOf(w) - 1]?.w === 'Scrolly') w.w = 'Business'; if (w.w === 'brain') w.w = 'Brain'; }

R.frames([0, at('imagine'), at('well'), at('because'), at('one of', 23), at('it has', 30), at('and then', 38), at('of course', 45), at('i created', 53), at('set up', 56)]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });

const ASK = 'write an Instagram post for my sourdough starter kit';

// F1 hook
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(46), K.statement('b1', 'Your AI should know what you’re <m>selling</m>', { top: 6, size: 11, in: 0.15, swipe: at('selling') })]);

// F2 the ask
note(2, 'A chat opens; she asks for a post', 'pop on the greeting, typing under the ask');
R.scene(2, [K.fade(50), K.chat([
  { id: 'c2a', kind: 'ai', text: 'Hi! What can I help you with today?', in: at('AI', 4) },
  { id: 'c2b', kind: 'me', text: ASK, in: at('ask'), enter: 'up' },
], { top: 6 })]);

// F3 the AI guesses: placeholders get circled as she names each one
note(3, 'AI reply full of blanks; each blank circled as she says it', 'pop on the reply; circles draw silently, one nope on the last');
const ph = K.placeholder;
R.scene(3, [K.fade(54), K.chat([
  { id: 'c3a', kind: 'me', text: ASK },
  { id: 'c3b', kind: 'ai', text: `Meet our Sourdough Starter Kit!<br>Only ${ph('ph1', '[PRICE]')}<br>Comes with ${ph('ph2', '[WHAT’S INCLUDED]')}<br>Perfect for ${ph('ph3', '[AUDIENCE]')} ✨`, in: at('well') + 0.1 },
], { top: 4 }), K.markAt('ph1', at('costs')), K.markAt('ph2', at('included')), K.markAt('ph3', at('who'))]);

// F4 the correction pile
note(4, 'Her corrections stack up; handwritten aside', 'pop, bubble pop, pop');
R.scene(4, [K.fade(48), K.chat([
  { id: 'c4a', kind: 'me', text: 'it’s $24', in: at('otherwise') },
  { id: 'c4b', kind: 'me', text: 'it comes with a jar too', in: at('money') },
  { id: 'c4c', kind: 'me', text: 'it’s for first-time bakers', in: at('correcting') },
], { top: 6 }), K.hand('h4', 'faster to just write it myself', { x: 5, y: 41, size: 6.5, r: -3, in: at('writing') })]);

// F5 the fix lands: background swap, held
note(5, 'Background swap (her cut out on mist), held: nothing else moves', 'whip whoosh in, air whoosh on the words');
R.scene(5, [K.fill(C.mist), K.statement('b5', 'One <m>central place</m> for my business info', { top: 7, size: 13.5, color: C.ink, in: at('one of', 23) + 0.1, swipe: at('central') })]);
R.cutout(5, 'assets/cut/f05-cut.webm', 6, 'sketch/f05-cut.png');

// F6 what lives there (her words on the tabs)
note(6, 'Folders fan in, one per word', 'paper slide, bubble pop, paper slide, pop (never the same twice in a row)');
R.scene(6, [K.fade(48),
  K.folder('f6a', 'offers', { x: 1, y: 11, r: -8, in: at('offers') }), K.folder('f6b', 'prices', { x: 23, y: 4, r: -2, in: at('prices') }),
  K.folder('f6c', 'customers', { x: 45, y: 8, r: 3, in: at('customers') }), K.folder('f6d', 'working on', { x: 69, y: 19, r: 8, in: at('currently') }),
  K.hand('h6', 'a place to live', { x: 8, y: 42, size: 7, r: -3, in: at('place', 37) })]);

// F7 same ask, with the Brain's real "My offers" attached
note(7, 'Same ask, with My offers attached: AI gets it right', 'bubble pop, pop on the file, bubble pop, check on the aside');
R.scene(7, [K.fade(54), K.chat([
  { id: 'c7a', kind: 'me', text: ASK, in: at('then') - 0.2, enter: 'up' },
  { id: 'c7b', kind: 'chip', text: '🧠 My offers', in: at('reference') },
  { id: 'c7c', kind: 'ai', text: 'Sourdough Starter Kit, $24: live starter, glass jar and feeding guide. Made for first-time bakers.', in: at('information', 42) + 0.2, enter: 'up' },
], { top: 4 }), K.hand('h7', 'no guessing', { x: 54, y: 51, size: 8, r: -5, color: C.peach, in: at('guessing') }), K.arrow('a7', { x: 33, y: 48.5, w: 18, r: 200, color: C.peach, in: at('guessing') + 0.1 })]);

// F8 still check it, but now it passes
note(8, 'Lined-paper check: each line ticks as she talks', 'paper slide, check, pop, check');
R.scene(8, [K.fade(50), K.paper('p8', [
  { id: 't8a', text: 'price', ok: true, in: at('check', 45) },
  { id: 't8b', text: 'what’s included', ok: true, in: at('information', 49) },
  { id: 't8c', text: 'who it’s for', ok: true, in: at('ai', 50) },
], { top: 6, in: at('of course', 45) + 0.1 }), K.hand('h8', 'so much easier', { x: 46, y: 40, size: 7.5, r: -4, in: at('process') })]);

// F9 the Brain behind her
note(9, 'The real Business Brain scrolls behind her (cut out); cursor clicks', 'whip whoosh in, pop on the click');
R.scene(9, [K.scrollPage('br9', 'assets/img/brain.png', { in: win(9).s, dur: win(9).d.toFixed(2) })]);
R.scene(9, [K.cursor('cur9', { x: 74, y: 14, click: win(9).s + 1.4 })], { layer: 'b' });
R.cutout(9, 'assets/cut/f09-cut.webm', 6, 'sketch/f09-cut.png');
// background removal left a faint strip of curtain along the right edge (last ~8%) of both cut-outs: trim it
R.js("tl.set('#cut5, #cut9', { clipPath: 'inset(0 8% 0 0)' }, 0);");

// F10 CTA (no price; name + site)
note(10, 'End card: name + scrollyseo.com, she keeps talking', 'air whoosh, chime under “on my website”');
R.scene(10, [K.fade(50), K.statement('b10', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(10).s + 0.1, swipe: win(10).s + 0.7 }),
  K.urlBar('u10', 'scrollyseo.com', { top: 31, in: win(10).s + 1.3 }),
  K.hand('h10', 'on my website', { x: 56, y: 44, size: 7.5, in: at('website') - 0.4 }), K.arrow('a10', { x: 34, y: 41, w: 18, r: 190, in: at('website') - 0.3, d: 0.4 })]);

// camera: alternate framing per jump cut, punch-in on "just writing the post yourself", whips into the swap and the Brain
R.cam.alternate();
R.cam.punch(at('writing'));
R.cam.set(win(5).s, '1.0');
R.cam.whip(win(5).s); R.cam.whip(win(9).s);

R.captions({ hide: [5, 10], top: (t) => (t >= win(9).s && t < win(10).s ? 150 : 128) });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('selling'));
fx('fx-pop2a', 'pop-bubble', at('AI', 4)); fx('fx-type2', 'typing-laptop', at('ask'), 0.35, 1.4);
fx('fx-pop3', 'pop-light', at('well') + 0.1); fx('fx-no3', 'nope', at('who'), 0.45); // circles draw silently, ONE nope on the last (Mercedes: nope-buzzer-nope sounded like a double womp)
fx('fx-pop4a', 'pop-light', at('otherwise')); fx('fx-pop4b', 'pop-bubble', at('money')); fx('fx-pop4c', 'pop-light', at('correcting'));
fx('fx-wh5', 'whoosh-fast', win(5).s - 0.12, 0.55); fx('fx-wh5b', 'whoosh-air', at('central') - 0.1, 0.45);
fx('fx-pap6a', 'paper-slide', at('offers'), 0.7); fx('fx-pop6b', 'pop-bubble', at('prices')); fx('fx-pap6c', 'paper-slide', at('customers'), 0.7); fx('fx-pop6d', 'pop-light', at('currently'));
fx('fx-pop7a', 'pop-bubble', at('then') - 0.2); fx('fx-pop7b', 'pop-light', at('reference')); fx('fx-pop7c', 'pop-bubble', at('information', 42) + 0.2); fx('fx-chk7', 'check', at('guessing'), 0.5);
fx('fx-pap8', 'paper-slide', at('of course', 45) + 0.1, 0.6); fx('fx-chk8a', 'check', at('check', 45), 0.4); fx('fx-pop8b', 'pop-light', at('information', 49)); fx('fx-chk8c', 'check', at('ai', 50), 0.4);
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-pop9', 'pop-light', win(9).s + 1.95, 0.5);
fx('fx-wh10', 'whoosh-air', win(10).s, 0.4); fx('fx-chime10', 'chime', at('website') - 0.4, 0.5, +(R.DUR - at('website') + 0.4 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Curiosity" (Mixkit), picked 2026-10-13; template level 0.02, fades 4.22s / 1.95s

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'Stop <m>correcting</m> every post AI writes for you' },
  { text: 'Your AI keeps <m>guessing</m> your prices', aside: "here's the fix" },
  { text: 'Why AI posts get <m>your offer</m> wrong' },
  { text: 'AI doesn’t know <m>what you sell</m> (yet)' },
  { text: 'The fix for AI posts <m>full of blanks</m>' },
  { text: 'Tired of filling in AI’s <m>[PRICE]</m> blanks?' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `When your AI doesn't know your prices, what's included or who it's for, you end up fixing every post it writes. I keep all of that in my Scrolly Business Brain (scrollyseo.com), so my AI gets those details right the first time.

Try it with one product today: write down the price, what comes with it and who it's for, then attach that note every time you ask AI for a post.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #instagramtips',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'storyboard') R.storyboard('storyboard.html', { stills, notes: NOTES, title: 'Your AI should know what you’re selling', version: 'v1' });
else if (process.argv[2] === 'animatic') await animatic(R, { stills, preview: 'C:/Users/merce/OneDrive/Scrolly Media/exports/reels/previews/2026-10-13-bb-know-what-you-sell-animatic.mp4' });
else if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'Your AI should know what you’re selling', covers: COVERS, coverCut: 'sketch/f05-cut.png', stills, post: POST });
}
else R.write();
