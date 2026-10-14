// "What exactly is a business brain? (sock drawer)": Studio Reel (Business Brain / IMG_2005, drafted 2026-10-14).
// Spine: building a brain for your AI sounds technical, but it's as simple as organizing a sock drawer: four files
// (your business, your offers, your voice, what you're working on now), then tell the AI where they are. CTA: the
// Scrolly Business Brain, name + scrollyseo.com (no price).
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;
// caption fixes on the transcript: the cut leaves capitals at every join, base.en writes "ai"; "for" leaked from the
// dropped retake ("brain for their AI | brain for their AI they think")
{
  const keep = /^(I|I'm|AI|Scrolly|Well,)$/;
  for (let i = R.W.length - 1; i > 0; i--) if (R.W[i].w === 'for' && R.W[i - 1].w === 'AI' && /^think$/i.test(R.W[i + 1]?.w)) R.W.splice(i, 1);
  for (let i = 1; i < R.W.length; i++) {
    const w = R.W[i], prev = R.W[i - 1].w;
    if (/^ai$/i.test(w.w.replace(/[^a-z]/gi, ''))) w.w = w.w.replace(/ai/i, 'AI');
    if (!/[.?!]$/.test(prev) && /^[A-Z][a-z]/.test(w.w) && !keep.test(w.w.replace(/[^a-z',]/gi, ''))) w.w = w.w[0].toLowerCase() + w.w.slice(1);
    if (/^business$/i.test(w.w) && prev === 'Scrolly') w.w = 'Business';
    if (/^brain$/i.test(w.w) && R.W[i - 1].w === 'Business') w.w = 'Brain';
  }
  R.W[6].w = 'brain?'; R.W[7].w = 'Because'; for (const w of R.W) if (w.w === 'selling?') w.w = 'selling.';
  // inserted 'Well,' shares its start with 'really?': one caption word; 'can' after a cut joins the line before it
  { const k = R.W.findIndex((w) => w.w === 'Well,'); R.W[k + 1].w = 'Well, really?'; R.W[k + 1].s = R.W[k].s; R.W.splice(k, 1); }
  { const k = R.W.findIndex((w) => w.w === 'can' && w.s > 59 && w.s < 61); R.W[k].seg = R.W[k - 1].seg; }
}

R.frames([0, at('i think', 2), at('well'), at('because all'), at('the first'), at('the second'), at('i would also'), at('because you can'),
  at('finally'), at('and once'), at('give', 59) - 0.02, at('you absolutely'), at('mine is'), at('i also'), at('and in fact')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const S = B.font.statement;

// F1 hook above her head (the row's hook)
note(1, 'Hook above her head: the sock drawer promise', 'pop on the swipe');
R.scene(1, [K.fade(50), K.statement('b1', 'If you can organize your <m>sock drawer</m>, you can build a business brain', { top: 5, size: 9.5, in: 0.15, swipe: at('business brain') })]);

// F2 what people think when they hear "a brain for your AI": the ask types, then the worries in her words
note(2, 'Prompt bar types “make a brain for my AI”; her worries in handwriting', 'pop, typing, air whoosh on “complicated”, pop on “not techy”');
R.scene(2, [K.fade(50), K.prompt('p2', 'how do I make a brain for my AI', { x: 6, y: 7, in: at('i think', 2), typeAt: at('making') }),
  K.hand('h2a', 'sounds complicated…', { x: 8, y: 22, size: 7, r: -4, in: at('complicated') }),
  K.hand('h2b', 'I’m not techy', { x: 52, y: 32, size: 7, r: 4, in: at('techy') })]);

// F3 the sock drawer: a real-looking open drawer, sock rolls drop into rows as she says it
note(3, 'An open sock drawer above her head; rolled socks drop into neat rows', 'pop on the drawer, paper slide as the socks drop, check on “definitely”');
const SOCKS = [C.peach, C.cream, C.mist, C.blush, C.ink, C.peach, C.blush, C.cream];
const sock = (i) => `<div class="sk" style="width:15cqw;height:9cqw;border-radius:4.5cqw;background:${SOCKS[i]};box-shadow:inset -1.6cqw -1cqw 0 rgba(0,0,0,.12),0 .6cqw 0 rgba(0,0,0,.18);position:relative"><i style="position:absolute;left:4.2cqw;top:0;bottom:0;width:1cqw;background:rgba(0,0,0,.1)"></i></div>`;
R.scene(3, [K.fade(56), {
  html: `<div id="dr3" class="abs" style="left:9cqw;right:9cqw;top:6cqw;height:31cqw;background:#c9a27a;border-radius:1.6cqw;box-shadow:0 1.6cqw 3cqw rgba(0,0,0,.45),inset 0 0 0 1cqw #b38a62">
    <div style="position:absolute;left:3cqw;right:3cqw;top:3cqw;bottom:3cqw;background:#ead8c0;border-radius:.8cqw;display:grid;grid-template-columns:repeat(4,1fr);gap:2cqw;padding:2.4cqw;align-content:center;justify-items:center">${SOCKS.map((_, i) => sock(i)).join('')}</div></div>
    <div id="dr3k" class="abs" style="left:41cqw;top:34.5cqw;width:18cqw;height:3cqw;border-radius:1.5cqw;background:#8d6a48"></div>`,
  anim: [`pop('#dr3', ${at('well')}, -1);`, `pop('#dr3k', ${at('well') + 0.1}, 0);`,
    `tl.fromTo('#dr3 .sk', { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.8)', stagger: 0.12 }, ${at('organize')});`],
}, K.hand('h3', 'you can do this', { x: 52, y: 41, size: 7, r: -4, in: at('definitely') })]);

// F4 the whole trick
note(4, 'Statement: all we’re doing is organizing files', 'whoosh in, pop on the swipe');
R.scene(4, [K.fade(48), K.statement('b4', 'All we’re doing is <m>organizing files</m>', { top: 6, size: 12, in: at('because all') + 0.05, swipe: at('organizing') })]);

// F5 file 1: your business (a .md file fills in on each question)
note(5, 'File 1: my-business.md fills in, one line per question', 'paper slide, typing');
R.scene(5, [K.fade(56), K.mdFile('md5', 'my-business.md', [
  ['1', '# My business', 'h'],
  ['2', '+ what I do: hand-poured soy candles', 'add'],
  ['3', '+ who I help: gift shoppers', 'add'],
  ['4', '+ how people find me: Instagram', 'add'],
], { top: 5, in: at('the first'), typeAt: at('what would'), gap: 1.3 })]);

// F6 file 2: what you sell (a receipt unrolls)
note(6, 'File 2: a receipt for one product unrolls: product, price, what’s included', 'paper slide, pop, check on “for you”');
R.scene(6, [K.fade(56), K.receipt('rc6', 'MY OFFERS', ['Cedar & Fig candle', '$28', 'gift box + matches'], { x: 27, y: 4, in: at('selling') }),
  K.hand('h6', 'before it sells for you', { x: 8, y: 47, size: 6.5, r: -4, in: at('before it') })]);

// F7 file 3: your voice
note(7, 'File 3: statement “a file for your voice”, aside: one of the most important', 'whoosh, pop on the swipe, pop on the aside');
R.scene(7, [K.fade(50), K.statement('b7', 'A file for <m>your voice</m>', { top: 7, size: 13, in: at('i would also') + 0.1, swipe: at('voice') }),
  K.hand('h7', 'one of the most important', { x: 30, y: 30, size: 6, r: -3, in: at('important') })]);

// F8 the voice file fills in (a banned phrase from her own voice rules)
note(8, 'my-voice.md fills in: past posts, words I like, a banned phrase, how to talk', 'paper slide, typing, nope on the banned line');
R.scene(8, [K.fade(58), K.mdFile('md8', 'my-voice.md', [
  ['1', '# My voice', 'h'],
  ['2', '+ 10 captions I wrote', 'add'],
  ['3', '+ words I like: cozy, small-batch', 'add'],
  ['4', '✗ “It’s not just a candle, it’s an experience”', 'no'],
  ['5', '+ sound like a friend, short sentences', 'add'],
], { top: 4, in: at('because you can'), typeAt: at('things'), gap: 1.6 })]);

// F9 file 4: what you're working on now
note(9, 'File 4: a manila folder “working on now”; aside: six months from now', 'paper slide, pop on the aside');
R.scene(9, [K.fade(52), K.folder('f9', 'working on', { x: 30, y: 6, r: -3, in: at('finally') + 0.1 }),
  K.hand('h9', 'it changes fast', { x: 8, y: 40, size: 7, r: -4, in: at('six months') })]);

// F10 all four files, organized
note(10, 'All four folders fan in, one per file', 'paper slide, bubble pop, paper slide, pop');
R.scene(10, [K.fade(50),
  K.folder('f10a', 'business', { x: 1, y: 11, r: -8, in: at('and once') }), K.folder('f10b', 'offers', { x: 23, y: 4, r: -2, in: at('once') + 0.25 }),
  K.folder('f10c', 'voice', { x: 45, y: 8, r: 3, in: at('have all') }), K.folder('f10d', 'working on', { x: 69, y: 19, r: 8, in: at('organized') })]);

// F11 the instructions file: three ticks as she lists them
note(11, 'Lined-paper instructions for the AI: three ticks as she lists them', 'paper slide, check, pop, check');
R.scene(11, [K.fade(52), K.paper('p11', [
  { id: 't11a', text: 'where to find it', ok: true, in: at('where') },
  { id: 't11b', text: 'when to use it', ok: true, in: at('when to') },
  { id: 't11c', text: 'how to keep it up to date', ok: true, in: at('keep it') },
], { top: 6, in: at('instructions') })]);

// F12 the Brain behind her (cut-out)
note(12, 'The real Scrolly Business Brain scrolls behind her (cut out); cursor clicks', 'whip whoosh in, pop on the click');
R.scene(12, [K.scrollPage('br12', 'assets/img/brain.png', { in: win(12).s, dur: win(12).d.toFixed(2) })]);
R.scene(12, [K.cursor('cur12', { x: 74, y: 14, click: at('set up') })], { layer: 'b' });
R.cutout(12, 'assets/cut/f12-cut.webm', 6, 'sketch/f12-cut.png');

// F13 why hers is different
note(13, 'Statement: works with multiple AI platforms; aside: keeps itself up to date', 'air whoosh, pop on the swipe, check on the aside');
R.scene(13, [K.fade(50), K.statement('b13', 'Works with <m>multiple AI</m> platforms', { top: 6, size: 12, in: at('mine is') + 0.1, swipe: at('multiple') }),
  K.hand('h13', 'keeps itself up to date', { x: 24, y: 33, size: 6.5, r: -3, in: at('helps') })]);

// F14 free tools
note(14, 'Handwritten: built with free tools, $0 extra (no product price)', 'pop, pop');
R.scene(14, [K.fade(48), K.statement('b14', 'Built with <m>free tools</m>', { top: 7, size: 13, in: at('i also') + 0.1, swipe: at('free') }),
  K.hand('h14', 'nothing more to pay', { x: 30, y: 30, size: 6.5, r: -4, in: at("don't have") })]);

// F15 CTA (no price; name + site)
note(15, 'End card: Scrolly Business Brain + scrollyseo.com, she keeps talking', 'air whoosh, chime');
R.scene(15, [K.fade(50), K.statement('b15', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(15).s + 0.1, swipe: win(15).s + 0.7 }),
  K.urlBar('u15', 'scrollyseo.com', { top: 21, in: win(15).s + 1.2 }),
  K.hand('h15', 'on my website', { x: 56, y: 33, size: 7, in: win(15).s + 1.6 })]);

// camera: alternate framing per jump cut, punch-in on "sock drawer", whips into the Brain and the end card
R.cam.alternate();
R.cam.punch(at('sock'));
R.cam.set(win(12).s, '1.0');
R.cam.whip(win(12).s); R.cam.whip(win(15).s);

R.captions({ hide: [1, 4, 7, 13, 14, 15], top: (t) => (t >= win(12).s && t < win(13).s ? 150 : 128) });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('business brain'));
fx('fx-pop2', 'pop-bubble', at('i think', 2)); fx('fx-type2', 'typing-laptop', at('making'), 0.35, 1.0);
fx('fx-air2', 'whoosh-air', at('complicated') - 0.1, 0.4); fx('fx-pop2b', 'pop-light', at('techy'));
fx('fx-pop3', 'pop-bubble', at('well')); fx('fx-pap3', 'paper-slide', at('organize'), 0.6); fx('fx-chk3', 'check', at('definitely'), 0.45);
fx('fx-wh4', 'whoosh-fast', at('because all') - 0.1, 0.5); fx('fx-pop4', 'pop-light', at('organizing'));
fx('fx-pap5', 'paper-slide', at('the first'), 0.6); fx('fx-type5', 'typing-laptop', at('what would'), 0.3, 2);
fx('fx-pap6', 'paper-slide', at('selling'), 0.7); fx('fx-pop6', 'pop-bubble', at('prices')); fx('fx-chk6', 'check', at('before it'), 0.45);
fx('fx-wh7', 'whoosh-air', at('i would also'), 0.45); fx('fx-pop7', 'pop-light', at('voice')); fx('fx-pop7b', 'pop-bubble', at('important'));
fx('fx-pap8', 'paper-slide', at('because you can'), 0.6); fx('fx-type8', 'typing-laptop', at('things'), 0.3, 2); fx('fx-no8', 'nope', at('hate'), 0.4);
fx('fx-pap9', 'paper-slide', at('finally') + 0.1, 0.6); fx('fx-pop9', 'pop-light', at('six months'));
fx('fx-pap10a', 'paper-slide', at('and once'), 0.6); fx('fx-pop10b', 'pop-bubble', at('once') + 0.25); fx('fx-pap10c', 'paper-slide', at('have all'), 0.6); fx('fx-pop10d', 'pop-light', at('organized'));
fx('fx-pap11', 'paper-slide', at('instructions'), 0.6); fx('fx-chk11a', 'check', at('where'), 0.4); fx('fx-pop11b', 'pop-light', at('when to')); fx('fx-chk11c', 'check', at('keep it'), 0.4);
fx('fx-wh12', 'whoosh-fast', win(12).s - 0.12, 0.55); fx('fx-pop12', 'pop-light', at('set up') + 0.5, 0.5);
fx('fx-air13', 'whoosh-air', at('mine is'), 0.4); fx('fx-pop13', 'pop-bubble', at('multiple')); fx('fx-chk13', 'check', at('helps'), 0.4);
fx('fx-pop14', 'pop-light', at('free')); fx('fx-pop14b', 'pop-bubble', at("don't have"));
fx('fx-wh15', 'whoosh-fast', win(15).s - 0.12, 0.55); fx('fx-chime15', 'chime', win(15).s + 1.2, 0.5, +(R.DUR - win(15).s - 1.2 - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Sweet September" (Mixkit, from Reel #2's candidates; Curiosity, Chill Bro and Lonerism are taken by the last/other Reels)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'If you can organize a <m>sock drawer</m>, you can do this' },
  { text: 'Not techy? You can still give your AI <m>a brain</m>' },
  { text: 'The <m>4 files</m> your AI needs about your business' },
  { text: 'Tired of explaining your business to AI <m>every time</m>?' },
  { text: 'Giving AI your business info is <m>easier</m> than it sounds', aside: 'promise' },
  { text: 'What your AI should <m>know about you</m>' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `A brain for your AI is four organized files: your business, what you sell, your voice and what you're working on now. If you'd rather start with the structure already set up, the Scrolly Business Brain is on my website, scrollyseo.com.

Start today with file one: write what you do, who you help and how people find you, then paste it in before your next AI request.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #instagramtips',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'What exactly is a business brain? (sock drawer)', covers: COVERS, coverCut: 'sketch/f03-cut.png', stills, post: POST });
}
else R.write();
