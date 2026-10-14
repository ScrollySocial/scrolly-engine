// "The number one thing I regret not doing sooner with AI": Studio Reel (Business Brain / IMG_2008, filmed 2026-10-12).
// Drafted 2026-10-14 (daytime run of the overnight step D); rough cut, plan, sounds and music all wait for her on the page.
// Spine: set AI up right from the start. Two pains (repeating the same corrections; ideas lost in random chats), then a
// system that grows with the business (what changes, ideas vs real changes, updating on a decision), then the Brain.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;
// caption fixes on the transcript ("If" and "That" were re-inserted in plan.json; whisper capitalized the word after them)
for (const [i, w] of R.W.entries()) {
  if (w.w === 'You\'re' && R.W[i - 1]?.w === 'If') w.w = 'you\'re';
  if (w.w === 'Way' && R.W[i - 1]?.w === 'That') w.w = 'way';
  if (/^business$/i.test(w.w) && R.W[i - 1]?.w === 'Scrolly') w.w = 'Business';
  if (/^brain/i.test(w.w) && R.W[i - 1]?.w === 'Business') w.w = w.w.replace('brain', 'Brain');
}

R.frames([0, at('setting'), at('if you'), at("that's also"), at('i also'), at('so one'), at('you introduce'), at('you might'),
  at('for example'), at('that way'), at('and then when'), at('the longer'), at('and that is'), at('so if you')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const ME = { kind: 'me' };

// F1 hook
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(50), K.statement('b1', 'The #1 thing I regret not doing <m>sooner</m> with AI', { top: 6, size: 10, in: 0.15, swipe: at('sooner') })]);

// F2 the answer
note(2, 'The answer: set it up correctly, aside "the first time"', 'air whoosh on the statement');
R.scene(2, [K.fade(46), K.statement('b2', 'Set it up <m>correctly</m>', { top: 7, size: 13, in: win(2).s + 0.05, swipe: at('correctly') }),
  K.hand('h2', 'the first time', { x: 50, y: 24, size: 7, r: -4, in: at('first', 5) })]);

// F3 the corrections she keeps typing (her words, made specific to her voice rules)
note(3, 'Chat: an AI caption, then her corrections stack up as she says them', 'bubble / light pops, alternating');
R.scene(3, [K.fade(56), K.chat([
  { id: 'c3a', kind: 'ai', text: 'Ready to elevate your mornings? It’s not just coffee, it’s a ritual ✨', in: at('sick') },
  { ...ME, id: 'c3b', text: 'please rewrite this again', in: at('rewrite') },
  { ...ME, id: 'c3c', text: 'please don’t say “it’s not X, it’s Y”', in: at("don't do") },
  { ...ME, id: 'c3d', text: 'please include my prices', in: at('include') },
  { ...ME, id: 'c3e', text: 'please don’t use em dashes', in: at("don't use") },
], { top: 4 })]);

// F4 those rules belong in the AI from the start: a real .md file fills in
note(4, 'A rules .md file types in, aside "set it once"', 'paper slide, typing, check on the aside');
R.scene(4, [K.fade(54), K.mdFile('md4', 'how-i-write.md', [
  ['1', '# How I write', 'h'],
  ['2', '+ no em dashes', 'add'],
  ['3', '+ never “it’s not X, it’s Y”', 'add'],
  ['4', '+ always include my prices', 'add'],
], { top: 5, in: win(4).s + 0.05, typeAt: at('already'), gap: 0.45 }),
  K.hand('h4', 'set it once', { x: 54, y: 44, size: 7, r: -4, in: at('programmed') })]);

// F5 ideas lost in random chats: a real-looking chat history list, then it scatters on "all over the place"
note(5, 'Chat history list fills with scattered idea chats, then scatters', 'light pop, bubble pop, air whoosh on the scatter');
const HIST = ['gift box idea??', 'new price for the candles', 'holiday sale plan', 'Untitled chat', 'that idea from Tuesday'];
const hx = [[-14, -3, -6], [10, 2, 5], [-8, 4, -4], [16, -2, 7], [-12, 3, -5]]; // scatter x (cqw), y (cqw), rotation
R.scene(5, [K.fade(56), {
  html: `<div id="hist5" class="abs" style="left:10cqw;right:10cqw;top:3cqw;background:#f9f9f9;border-radius:2.4cqw;padding:2.2cqw 3cqw;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.4);font-family:'Segoe UI','${B.font.body}',sans-serif;color:#202124">
    <div style="font:600 3.2cqw/1 'Segoe UI';color:#8e8e8e;margin:0 0 1.6cqw 1cqw">Recent chats</div>
    ${HIST.map((t, i) => `<div id="hi5-${i}" class="hi" style="font:400 3.9cqw/1.2 'Segoe UI';padding:1.1cqw 1.6cqw;border-radius:1.4cqw;${i === 0 ? 'background:#ececec;' : ''}">${t}</div>`).join('')}</div>`,
  anim: [
    `tl.fromTo('#hist5', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, ${at('forgetting')});`,
    ...HIST.map((_, i) => `tl.fromTo('#hi5-${i}', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.25, ease: E }, ${(at('forgetting') + 0.15 + i * 0.55).toFixed(2)});`),
    ...hx.map(([x, y, r], i) => `tl.to('#hi5-${i}', { x: ${(x * 10.8).toFixed(0)}, y: ${(y * 10.8).toFixed(0)}, rotation: ${r}, duration: 0.5, ease: B }, ${(at('all over') + i * 0.04).toFixed(2)});`),
  ],
}, K.hand('h5', 'where did I put that?', { x: 36, y: 50, size: 6.5, r: -3, in: at('all over') + 0.4 })]);

// F6 a system that grows with the business
note(6, 'Statement: a system that grows with my business, aside "so much changes"', 'light pop on the swipe, bubble pop on the aside');
R.scene(6, [K.fade(48), K.statement('b6', 'A system that <m>grows</m> with my business', { top: 6, size: 11, in: win(6).s + 0.1, swipe: at('grow') }),
  K.hand('h6', 'so much changes', { x: 8, y: 40, size: 7, r: -4, in: at('change', 34) })]);

const wide = (c, w) => ({ ...c, html: c.html.replace('class="receipt" style="', `class="receipt" style="width:${w}cqw;`) });
// F7 what changes: a receipt of the year's changes unrolls
note(7, 'A receipt of what changed unrolls; aside "never saw that coming"', 'paper slide on the receipt, bubble pop on the aside');
R.scene(7, [K.fade(54), wide(K.receipt('r7', 'WHAT CHANGED', ['new product: gift box', 'price: $24 to $28', 'customers want: refills'], { x: 24, y: 3, in: at('introduce') }), 52),
  K.hand('h7', 'never saw that coming', { x: 4, y: 47, size: 6.5, r: -4, in: at('never') }),
  K.arrow('a7', { x: 70, y: 40, w: 12, r: -70, in: at('never') + 0.15 })]);

// F8 you change your mind about marketing: the plan gets rewritten
note(8, 'Marketing plan .md: one line crossed out, a new one added', 'typing, light pop on the new line');
R.scene(8, [K.fade(50), K.mdFile('md8', 'holiday-plan.md', [
  ['1', '# Holiday launch', 'h'],
  ['2', 'post it only on Instagram', 'no'],
  ['3', '+ email my list first', 'add'],
], { top: 5, in: win(8).s + 0.05, typeAt: at('completely'), gap: 0.5 })]);

// F9 her AI thinks the idea through, then it gets recorded somewhere she can track
note(9, 'Chat: new product idea, AI thinks it through, logged to the Brain', 'bubble pop, light pop, check on the log');
R.scene(9, [K.fade(54), K.chat([
  { ...ME, id: 'c9a', text: 'new idea: a mini gift box for the holidays. worth it?', in: at('new product', 48), enter: 'up' },
  { id: 'c9b', kind: 'ai', text: 'Could work! An easy add-on for gift shoppers. Want me to log it as an idea?', in: at('think', 50) },
  { id: 'c9c', kind: 'chip', text: '🧠 Ideas: logged', in: at('record') },
], { top: 4 }), K.hand('h9', 'a place I can track', { x: 6, y: 50, size: 6.5, r: -3, in: at('actually track') })]);

// F10 ideas I'm considering vs real changes: two folders
note(10, 'Two folders: just ideas / real changes', 'paper slide, bubble pop');
R.scene(10, [K.fade(48),
  K.folder('f10a', 'just ideas', { x: 8, y: 9, r: -6, in: at('considering') }),
  K.folder('f10b', 'real changes', { x: 54, y: 6, r: 5, in: at('actual') }),
  K.hand('h10', 'my brain can tell them apart', { x: 6, y: 42, size: 6, r: -3, in: at('distinguish') })]);

// F11 a decision gets made: one quick update
note(11, 'Prompt bar types the update, aside "one quick update"', 'typing, check');
R.scene(11, [K.fade(46), K.prompt('p11', 'gift box: it’s a go', { x: 22, y: 12, in: at('decision') - 0.3, typeAt: at('update') }),
  K.hand('h11', 'one quick update', { x: 30, y: 30, size: 7, r: -3, in: at('information') })]);

// F12 the longer you use AI: organized and accurate
note(12, 'Statement: organized and accurate', 'air whoosh in, light pop on the swipe');
R.scene(12, [K.fade(50), K.hand('h12', 'the longer you use AI', { x: 20, y: 4, size: 6.5, r: -3, in: win(12).s + 0.1 }),
  K.statement('b12', '<m>Organized</m> and accurate', { top: 15, size: 13, in: at('important'), swipe: at('organized') })]);

// F13 the real Business Brain scrolls behind her (cut out), cursor clicks
note(13, 'The real Business Brain scrolls behind her (cut out); cursor clicks', 'whip whoosh in, bubble pop on the click');
R.scene(13, [K.scrollPage('br13', 'assets/img/brain.png', { in: win(13).s, dur: win(13).d.toFixed(2) })]);
R.scene(13, [K.cursor('cur13', { x: 74, y: 14, click: win(13).s + 1.6 })], { layer: 'b' });
R.cutout(13, 'assets/cut/f13-cut.webm', 6, 'sketch/f13-cut.png');

// F14 CTA (no price; name + site)
note(14, 'End card: name + scrollyseo.com, aside "copy my work"', 'air whoosh, chime under “on my website”');
R.scene(14, [K.fade(50), K.statement('b14', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(14).s + 0.1, swipe: win(14).s + 0.7 }),
  K.urlBar('u14', 'scrollyseo.com', { top: 31, in: at('check out') }),
  K.hand('h14', 'copy my work', { x: 56, y: 44, size: 7.5, in: at('copy') - 0.2 }), K.arrow('a14', { x: 34, y: 41, w: 18, r: 190, in: at('copy') - 0.1, d: 0.4 })]);

// camera: alternate framing per jump cut, punch-in on "all over the place", whips into the Brain and the end card
R.cam.alternate();
R.cam.punch(at('all over'));
R.cam.set(win(13).s, '1.0');
R.cam.whip(win(13).s); R.cam.whip(win(14).s);

R.captions({ hide: [1, 14], top: (t) => (t >= win(13).s && t < win(14).s ? 150 : 128) });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('sooner'));
fx('fx-wh2', 'whoosh-air', win(2).s, 0.4);
fx('fx-pop3a', 'pop-bubble', at('sick')); fx('fx-pop3b', 'pop-light', at('rewrite')); fx('fx-pop3c', 'pop-bubble', at("don't do"));
fx('fx-pop3d', 'pop-light', at('include')); fx('fx-pop3e', 'pop-bubble', at("don't use"));
fx('fx-pap4', 'paper-slide', win(4).s + 0.05, 0.6); fx('fx-type4', 'typing-laptop', at('already'), 0.35, 1.6); fx('fx-chk4', 'check', at('programmed'), 0.45);
fx('fx-pop5a', 'pop-light', at('forgetting')); fx('fx-pop5b', 'pop-bubble', at('random')); fx('fx-wh5', 'whoosh-air', at('all over') - 0.05, 0.45);
fx('fx-pop6a', 'pop-light', at('grow')); fx('fx-pop6b', 'pop-bubble', at('change', 34));
fx('fx-pap7', 'paper-slide', at('introduce'), 0.6); fx('fx-pop7', 'pop-bubble', at('never'));
fx('fx-type8', 'typing-laptop', at('completely'), 0.35, 1.4); fx('fx-pop8', 'pop-light', at('completely') + 1.0);
fx('fx-pop9a', 'pop-bubble', at('new product', 48)); fx('fx-pop9b', 'pop-light', at('think', 50)); fx('fx-chk9', 'check', at('record'), 0.45);
fx('fx-pap10', 'paper-slide', at('considering'), 0.6); fx('fx-pop10', 'pop-bubble', at('actual'));
fx('fx-type11', 'typing-laptop', at('update'), 0.35, 1.0); fx('fx-chk11', 'check', at('information'), 0.45);
fx('fx-wh12', 'whoosh-air', win(12).s, 0.4); fx('fx-pop12', 'pop-light', at('organized'));
fx('fx-wh13', 'whoosh-fast', win(13).s - 0.12, 0.55); fx('fx-pop13', 'pop-bubble', win(13).s + 2.1, 0.5);
fx('fx-wh14', 'whoosh-air', win(14).s, 0.4); fx('fx-chime14', 'chime', at('website') - 0.4, 0.5, +(R.DUR - at('website') + 0.4 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Lonerism" (Mixkit, from Reel #2's candidates; Reel #2 = Curiosity, jumbo shrimp = Chill Bro; the rest are in assets/music-candidates)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'Tired of telling AI <m>“rewrite this”</m>?' },
  { text: 'The AI setup I wish I did <m>sooner</m>' },
  { text: 'My #1 AI <m>regret</m>', aside: 'learn from mine' },
  { text: 'Stop losing ideas in <m>old AI chats</m>' },
  { text: 'Set up your AI <m>right</m> the first time' },
  { text: 'Your AI should <m>remember</m> your business' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `My number one AI regret is waiting so long to set it up properly. Now my writing rules, offers and every business change live in my Scrolly Business Brain (scrollyseo.com), so I stop repeating the same corrections and my ideas stop getting lost in old chats.

Try one piece today: write down the three corrections you give AI most often and paste them in before your next request.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #businesstips',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'The number one thing I regret not doing sooner with AI', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
