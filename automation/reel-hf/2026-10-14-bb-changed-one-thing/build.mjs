// "I changed one thing in my business": Studio Reel (Business Brain / IMG_2003, filmed 2026-10-12).
// Drafted 2026-10-14 (daytime run of the overnight step D); rough cut, plan, sounds and music all wait for her on the page.
// Hook take: IMG_2003's own opening (matches the row's Hook word for word; the IMG_2001/2002 alternates are vaguer).
// Spine: she gave ChatGPT and Claude the same brain. The pain (hours of work the AI half-remembers, re-explaining,
// "I told you not to do this"), then the Brain (tracked in one place, Notion, free), then the payoff and the CTA.
// Example business on screen (made up, swap on the page): speckled ceramic mugs, $38 for a set of 2.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;
// caption fixes on the transcript: the opening "I" sits before the first word time; "for me" is heard as "or me?"
if (/^changed$/i.test(R.W[0].w)) { R.W[0].w = 'changed'; R.W.unshift({ ...R.W[0], w: 'I', e: R.W[0].s }); }
// (prep capitalizes the first word after each cut; these cuts run on mid-sentence: "you just", "and suddenly", "and that way")
for (const [i, w] of R.W.entries()) {
  if (w.w === 'Just' && R.W[i - 1]?.w === 'you') w.w = 'just';
  if (w.w === 'Suddenly' && R.W[i - 1]?.w === 'And') w.w = 'suddenly';
  if (w.w === 'and' && R.W[i + 1]?.w === 'that' && R.W[i + 2]?.w === 'Way') { w.w = 'And'; R.W[i + 2].w = 'way'; }
  if (w.w === 'else' && R.W[i + 1]?.w === 'for') { w.w = 'else,'; R.W[i + 1].w = 'or'; if (R.W[i + 2]?.w === 'me.') R.W[i + 2].w = 'me?'; }
  if (/^business$/i.test(w.w) && (R.W[i - 1]?.w === 'Scrolly' || /^brain/i.test(R.W[i + 1]?.w || ''))) w.w = 'Business';
  if (/^brain/i.test(w.w) && R.W[i - 1]?.w === 'Business') w.w = w.w.replace('brain', 'Brain');
}

// a lone "And" before "I find myself" made a one-word caption that overlapped the next one: fold it into "I"
{ const k = R.W.findIndex((w, i) => w.w === 'And' && w.s > 53 && R.W[i + 1]?.w === 'I'); if (k > 0) { R.W[k + 1] = { ...R.W[k + 1], w: 'And I', s: R.W[k].s }; R.W.splice(k, 1); } }

R.frames([0, at('well'), at('so i gave'), at('and you'), at('but not'), at('and suddenly'), at('i told'), at('so instead'),
  at('and i like'), at('and that way'), at('and', 53.5), at("and i've")]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const ME = { kind: 'me' };
const UI = "'Segoe UI','" + B.font.body + "',sans-serif";

// F1 hook
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(50), K.statement('b1', 'I changed <m>one thing</m> in my business', { top: 6, size: 11, in: 0.15, swipe: at('one') }),
  K.hand('h1', 'every time I use AI', { x: 44, y: 40, size: 6.5, r: -4, in: at('every') })]);

// F2 explaining her business to two AI apps, again: the same message lands in both windows
note(2, 'Two AI chat windows (ChatGPT, Claude) get the same “here’s my business” message', 'bubble pop, light pop');
const win2 = (id, app, x, bg, msgIn) => ({
  html: `<div id="${id}" class="abs" style="left:${x}cqw;top:5cqw;width:43cqw;background:#fff;border-radius:2.2cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:${UI};color:#202124;overflow:hidden">
    <div style="font:600 3.3cqw/1 ${UI};padding:2.2cqw 2.6cqw;border-bottom:.25cqw solid #eee">${app}</div>
    <div style="padding:2.6cqw 2.2cqw 3.4cqw"><div id="${id}m" style="margin-left:5cqw;background:${bg};border-radius:2.4cqw;padding:1.8cqw 2.2cqw;font:400 3.4cqw/1.3 ${UI}">ok, again: I sell speckled ceramic mugs, $38 for a set of 2…</div></div></div>`,
  anim: [`tl.fromTo('#${id}', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: E }, ${win(2).s + (x > 30 ? 0.15 : 0)});`, `pop('#${id}m', ${msgIn});`],
});
R.scene(2, [K.fade(56), win2('w2a', 'ChatGPT', 4, '#f4f4f4', at('chatgpt')), win2('w2b', 'Claude', 53, '#f0eee6', at('claude')),
  K.hand('h2', 'over and over…', { x: 30, y: 47, size: 7, r: -3, in: at('over', 10) })]);

// F3 the answer: one brain for both
note(3, 'Statement: I gave them both the same brain', 'air whoosh in');
R.scene(3, [K.fade(46), K.statement('b3', 'I gave them both the <m>same brain</m>', { top: 7, size: 11.5, in: win(3).s + 0.05, swipe: at('same') })]);

// F4 hours of work figuring it out: a launch notes file fills in as she lists what she figured out
note(4, 'A launch .md file types in: what you sell, the price, how to market it; aside “hours of work”', 'paper slide, bubble pop, typing');
R.scene(4, [K.fade(54), K.mdFile('md4', 'mug-launch.md', [
  ['1', '# Speckled mug launch', 'h'],
  ['2', '+ selling: speckled mugs, set of 2', 'add'],
  ['3', '+ price: $38', 'add'],
  ['4', '+ marketing: Reels first, then email', 'add'],
], { top: 5, in: win(4).s + 0.05, typeAt: at('figured'), gap: 0.7 }),
  K.hand('h4', 'hours of work', { x: 56, y: 45, size: 7, r: -4, in: at('hours') })]);

// F5 only some of it makes it into the AI's memory: a real-looking "Saved memories" panel with gaps
note(5, '“Saved memories” panel: two things saved, the price and plan missing', 'light pop on the panel, nope on “spotty”, bubble pop on the aside');
const MEM = [['Sells speckled ceramic mugs', true], ['Likes short captions', true], ['Price: $38 for a set of 2', false], ['Marketing: Reels first, then email', false]];
R.scene(5, [K.fade(56), {
  html: `<div id="mem5" class="abs" style="left:9cqw;right:9cqw;top:4cqw;background:#fff;border-radius:2.4cqw;padding:2.6cqw 3cqw 1.6cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:${UI};color:#202124">
    <div style="font:600 3.8cqw/1 ${UI};margin:0 0 2cqw">Saved memories</div>
    ${MEM.map(([t, ok], i) => `<div id="mm5-${i}" style="display:flex;justify-content:space-between;align-items:center;font:400 3.5cqw/1.25 ${UI};padding:1.5cqw 0;border-top:.2cqw solid #eee;${ok ? '' : 'color:#b5b5b5'}"><span>${t}</span>${ok ? '' : `<span id="ns5-${i}" style="font:600 2.6cqw/1 ${UI};color:#fff;background:${C.orange};border-radius:5cqw;padding:.9cqw 1.6cqw;margin-left:2cqw;white-space:nowrap">not saved</span>`}</div>`).join('')}</div>`,
  anim: [
    `tl.fromTo('#mem5', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, ${win(5).s + 0.05});`,
    ...MEM.map((_, i) => `tl.fromTo('#mm5-${i}', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.25, ease: E }, ${(at('saved') + i * 0.3).toFixed(2)});`),
    `pop('#ns5-2', ${at('spotty')});`, `pop('#ns5-3', ${(at('spotty') + 0.25).toFixed(2)});`,
  ],
}, K.hand('h5', 'where’s my price?', { x: 40, y: 47, size: 6.5, r: -3, in: at('makes') })]);

// F6 re-explaining the product, again
note(6, 'Chat: she re-explains the product, bubble by bubble', 'light pop, bubble pop, light pop');
R.scene(6, [K.fade(52), K.chat([
  { ...ME, id: 'c6a', text: 'they’re speckled ceramic mugs', in: at('explaining') },
  { ...ME, id: 'c6b', text: '$38 for the set of 2', in: at('product') },
  { ...ME, id: 'c6c', text: 'I told you this yesterday', in: at('again', 28) },
], { top: 6 })]);

// F7 "I told you not to do this": the AI repeats the exact thing she banned
note(7, 'Chat: AI opens with “Hey friends!”, she says no, it does it again; punch-in on “every single time”', 'bubble pop, light pop, bubble pop');
R.scene(7, [K.fade(56), K.chat([
  { id: 'c7a', kind: 'ai', text: 'Hey friends! ✨ Our speckled mugs are here!', in: win(7).s + 0.05 },
  { ...ME, id: 'c7b', text: 'I told you: never start with “Hey friends!”', in: at('told'), enter: 'up' },
  { id: 'c7c', kind: 'ai', text: 'You’re right, sorry! Hey friends! ✨ Meet our…', in: at('continue') },
], { top: 4 })]);

// F8 so instead: one place for all of it
note(8, 'Statement: something I call my Business Brain; aside “all of it”', 'light pop on the swipe, bubble pop on the aside');
R.scene(8, [K.fade(48), K.hand('h8', 'all that info, tracked in', { x: 12, y: 4, size: 6.5, r: -3, in: at('tracked') }),
  K.statement('b8', 'My <m>Business Brain</m>', { top: 14, size: 13, in: at('something'), swipe: at('business', 40) })]);

// F9 the real Business Brain (Notion) scrolls behind her (cut out), cursor clicks; aside "it's free"
note(9, 'The real Business Brain in Notion scrolls behind her (cut out); cursor clicks; aside “free”', 'whip whoosh in, bubble pop on the click, check on “free”');
R.scene(9, [K.scrollPage('br9', 'assets/img/brain.png', { in: win(9).s, dur: win(9).d.toFixed(2) })]);
R.scene(9, [K.fade(34), K.hand('h9', 'Notion: free', { x: 6, y: 6, size: 8, r: -4, color: C.peach, in: at('free') - 0.2 }),
  K.cursor('cur9', { x: 74, y: 14, click: win(9).s + 1.6 })], { layer: 'b' });
R.cutout(9, 'assets/cut/f09-cut.webm', 6, 'sketch/f09-cut.png');
// same trim as Reels #2/#3: background removal can leave a faint strip of curtain along the right edge
R.js("tl.set('#cut9', { clipPath: 'inset(0 8% 0 0)' }, 0);");

// F10 every AI pulls the right, current file
note(10, 'Business Brain file list: rows show “updated today”; cursor clicks Offers; aside “always current”', 'paper slide, light pop on the click, check on “up to date”');
const FILES = [['Offers', 'updated today'], ['Prices', 'updated today'], ['How I write', 'updated Mon'], ['Ideas', 'updated Sun']];
R.scene(10, [K.fade(54), {
  html: `<div id="fl10" class="abs" style="left:12cqw;right:12cqw;top:4cqw;background:#fff;border-radius:2.4cqw;padding:2.4cqw 3cqw 1.4cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:${UI};color:#37352f">
    <div style="font:700 4.2cqw/1 ${UI};margin:0 0 2cqw">🧠 Business Brain</div>
    ${FILES.map(([t, u], i) => `<div id="fr10-${i}" style="display:flex;justify-content:space-between;align-items:center;font:400 3.6cqw/1.2 ${UI};padding:1.5cqw 1cqw;border-radius:1.2cqw;${i === 0 ? 'background:#f1f1ef;' : ''}"><span>📄 ${t}</span><span style="font-size:2.8cqw;color:#787774">${u}</span></div>`).join('')}</div>`,
  anim: [
    `tl.fromTo('#fl10', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, ${win(10).s + 0.05});`,
    ...FILES.map((_, i) => `tl.fromTo('#fr10-${i}', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.25, ease: E }, ${(win(10).s + 0.3 + i * 0.2).toFixed(2)});`),
  ],
}, K.cursor('cur10', { x: 40, y: 15, size: 6, click: at('correct') }),
  K.hand('h10', 'always current', { x: 50, y: 45, size: 7, r: -4, in: at('up to date') - 0.2 })]);

// F11 the payoff, ticked off as she says it
note(11, 'Lined-paper list ticks as she talks: repeat myself less, fewer mistakes, better output', 'paper slide, check, light pop, check');
R.scene(11, [K.fade(50), K.paper('p11', [
  { id: 't11a', text: 'repeat myself less', ok: true, in: at('repeat', 53) },
  { id: 't11b', text: 'fewer mistakes', ok: true, in: at('mistakes') },
  { id: 't11c', text: 'better output', ok: true, in: at('quality') },
], { top: 6, in: win(11).s + 0.1 })]);

// F12 CTA (no price; name + site)
note(12, 'End card: name + scrollyseo.com, aside “make your own”', 'air whoosh, chime under “on my website”');
R.scene(12, [K.fade(50), K.statement('b12', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(12).s + 0.1, swipe: at('scrolly', 58) + 0.2 }),
  K.urlBar('u12', 'scrollyseo.com', { top: 31, in: at('website') - 0.6 }),
  K.hand('h12', 'make your own', { x: 56, y: 44, size: 7.5, in: at('make', 60) - 0.2 }), K.arrow('a12', { x: 34, y: 41, w: 18, r: 190, in: at('make', 60) - 0.1, d: 0.4 })]);

// camera: alternate framing per jump cut, punch-in on "every single time", whips into the Brain and the end card
R.cam.alternate();
R.cam.punch(at('every', 31));
R.cam.set(win(9).s, '1.0');
R.cam.whip(win(9).s); R.cam.whip(win(12).s);

R.captions({ hide: [1, 12], top: (t) => (t >= win(9).s && t < win(10).s ? 150 : 128) });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('one'));
fx('fx-pop2a', 'pop-bubble', at('chatgpt')); fx('fx-pop2b', 'pop-light', at('claude'));
fx('fx-wh3', 'whoosh-air', win(3).s, 0.4);
fx('fx-pap4', 'paper-slide', win(4).s + 0.05, 0.6); fx('fx-pop4', 'pop-bubble', at('hours')); fx('fx-type4', 'typing-laptop', at('figured'), 0.35, 2.2);
fx('fx-pop5a', 'pop-light', win(5).s + 0.05); fx('fx-no5', 'nope', at('spotty'), 0.45); fx('fx-pop5b', 'pop-bubble', at('makes'));
fx('fx-pop6a', 'pop-light', at('explaining')); fx('fx-pop6b', 'pop-bubble', at('product')); fx('fx-pop6c', 'pop-light', at('again', 28));
fx('fx-pop7a', 'pop-bubble', win(7).s + 0.05); fx('fx-pop7b', 'pop-light', at('told')); fx('fx-pop7c', 'pop-bubble', at('continue'));
fx('fx-pop8', 'pop-light', at('business', 40));
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-pop9', 'pop-bubble', win(9).s + 2.1, 0.5); fx('fx-chk9', 'check', at('free') - 0.2, 0.45);
fx('fx-pap10', 'paper-slide', win(10).s + 0.05, 0.6); fx('fx-pop10', 'pop-light', at('correct') + 0.5); fx('fx-chk10', 'check', at('up to date') - 0.2, 0.45);
fx('fx-pap11', 'paper-slide', win(11).s + 0.1, 0.6); fx('fx-chk11a', 'check', at('repeat', 53), 0.4); fx('fx-pop11', 'pop-light', at('mistakes')); fx('fx-chk11c', 'check', at('quality'), 0.4);
fx('fx-wh12', 'whoosh-air', win(12).s, 0.4); fx('fx-chime12', 'chime', at('website') - 0.4, 0.5, +(R.DUR - at('website') + 0.4 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Sleepy Cat" (Mixkit, from Reel #2's candidates; Curiosity, Chill Bro, Lonerism, Sweet September, Slow Pop are on other Reels)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'Tired of <m>re-explaining</m> your business to AI?' },
  { text: 'One change made AI <m>so much better</m>', aside: 'for my business' },
  { text: 'Your AI keeps <m>forgetting</m> your prices' },
  { text: 'ChatGPT and Claude, <m>same brain</m>' },
  { text: 'Stop telling AI <m>“I told you”</m>' },
  { text: 'Make every AI <m>know your business</m>' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `I changed one thing in my business: ChatGPT and Claude now share the same brain. My offers, prices and rules live in my Scrolly Business Brain (scrollyseo.com), so every AI I use pulls the current version and I barely repeat myself anymore.

Start small: put your current offer, price and marketing plan in one note, paste it in before your next AI chat, and update it the moment something changes.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #chatgpttips',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'I changed one thing in my business', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
