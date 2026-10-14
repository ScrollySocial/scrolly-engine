// "I use ChatGPT and Claude, so I gave them one brain": Studio Reel (Business Brain / IMG_1997 best takes + IMG_1998 hook,
// filmed 2026-10-12, drafted 2026-10-14 for her review). Spine: she uses two AIs on purpose; switching between them
// means re-explaining everything; built-in memory is spotty; so the business info lives in Notion (her Business Brain),
// both AIs are connected to it and read the same, current version.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, B, at, win } = R;

// caption fixes on the transcript (checked against a fresh transcript of the cut voice track)
{
  const W = R.W, idx = (w, near) => W.findIndex((x) => x.w === w && Math.abs(x.s - near) < 0.6);
  const drop = (w, near) => { const i = idx(w, near); if (i >= 0) W.splice(i, 1); };
  drop('especially', 16.37); // only a breath of it is left after the cut
  drop('to', 30.74); // "I want ChatGPT to know" (the transcript heard "want to touch UPT")
  drop('And', 44.6); // not in the audio
  const mb = idx('Maybe', 24.37); W[mb].w = 'maybe'; W.splice(mb, 0, { ...W[mb], w: 'because', s: 24.17, e: 24.37, first: false }); // "because" is in the audio
  const th = idx('That', 51.35); W[th].w = 'that'; W.splice(th, 0, { ...W[th], w: 'and', s: 51.15, e: 51.35, first: false });
  for (const w of W) {
    if (w.w === "AI's") w.w = 'AIs';
    if (w.w === 'brain') w.w = 'Brain';
    if (w.w === 'business' && W[W.indexOf(w) + 1]?.w === 'Brain') w.w = 'Business';
  }
  const end = (w, near, to) => { const i = idx(w, near); if (i >= 0) W[i].w = to; };
  end('again,', 15.71, 'again.'); end('what,', 23.83, 'what,'); end('output,', 29.39, 'output.'); end('using,', 78.8, 'using.'); end('setup,', 82.47, 'setup.');
}

R.frames([0, at('and i know'), at('and the problem'), at('i needed'), at('because', 24), at('and i want'), at('both of those'),
  at('so i started'), at('i use notion'), at("and i've"), at('and that means'), at('so then'), at('i really'), at('the best')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });
const S = B.font.statement;

// app tab (a real-looking browser tab with the app's name, no logos)
const tab = (id, label, x, y, r) => ({
  html: `<div id="${id}" class="abs" style="left:${x}cqw;top:${y}cqw;rotate:${r}deg;display:flex;align-items:center;gap:2cqw;background:#fff;color:#1c1c1c;border-radius:2.4cqw 2.4cqw 0 0;padding:2.4cqw 4cqw 2.4cqw 3cqw;font:600 5cqw 'Segoe UI','${B.font.body}',sans-serif;box-shadow:0 1.2cqw 3cqw rgba(0,0,0,.35)"><span style="width:3.4cqw;height:3.4cqw;border-radius:50%;background:${C.ink};display:block"></span>${label}<span style="color:#9a9a9a;font-weight:400;margin-left:1.4cqw">×</span></div>`,
  anim: [],
});
const popAt = (id, t) => ({ html: '', anim: [`pop('#${id}', ${t});`] });
// small app pill (used in the "connected" diagram)
const pill = (id, label, x, y, bg = '#fff', fg = '#1c1c1c') =>
  `<div id="${id}" class="abs" style="left:${x}cqw;top:${y}cqw;background:${bg};color:${fg};border-radius:99px;padding:2.2cqw 4.6cqw;font:700 5.2cqw 'Segoe UI','${B.font.body}',sans-serif;box-shadow:0 1cqw 3cqw rgba(0,0,0,.35);white-space:nowrap">${label}</div>`;

// F1 hook above her head
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(46), K.statement('b1', 'I gave ChatGPT and Claude <m>one brain</m>', { top: 6, size: 10.5, in: 0.15, swipe: at('business') })]);

// F2 pick one and stick with it? No: two tabs open
note(2, 'Aside “pick one and stick with it?”, then two app tabs: ChatGPT and Claude', 'pop, bubble pop on the two tabs');
R.scene(2, [K.fade(48), K.hand('h2', 'pick one and stick with it?', { x: 8, y: 6, size: 7, r: -3, in: at('prefer') }),
  tab('t2a', 'ChatGPT', 8, 26, -4), tab('t2b', 'Claude', 52, 24, 3), popAt('t2a', at('different')), popAt('t2b', at('different', 9))]);

// F3 explaining her business over and over (three versions of the same opener)
note(3, 'Her chat: the same business intro typed three times', 'typing, bubble pop, pop');
R.scene(3, [K.fade(54), K.chat([
  { id: 'c3a', kind: 'me', text: 'Quick background on my business first…', in: at('explaining') },
  { id: 'c3b', kind: 'me', text: 'Okay so again, my business is…', in: at('over') },
  { id: 'c3c', kind: 'me', text: 'Like I said before, I sell…', in: at('again') },
], { top: 6 }), K.hand('h3', 'every single time', { x: 6, y: 44, size: 6.5, r: -4, in: at('again') + 0.3 })]);

// F4 one place, read by either AI
note(4, 'Statement “one place both AIs can read”; ChatGPT and Claude labels with arrows', 'air whoosh on the words, bubble pop on the labels');
R.scene(4, [K.fade(52), K.statement('b4', 'One place both AIs can <m>read</m>', { top: 5, size: 12, in: at('i needed') + 0.1, swipe: at('information', 18) }),
  K.hand('h4a', 'ChatGPT', { x: 6, y: 34, size: 7.5, r: -5, in: at('either') }), K.arrow('a4a', { x: 22, y: 24, w: 13, r: 160, in: at('either') + 0.1 }),
  K.hand('h4b', 'Claude', { x: 70, y: 34, size: 7.5, r: 4, in: at('either') + 0.25 }), K.arrow('a4b', { x: 64, y: 24, w: 13, r: 100, in: at('either') + 0.35 })]);

// F5 an hour in Claude, decisions made
note(5, 'Aside “1 hour in Claude”; a decisions list ticks as she talks', 'paper slide, check, pop, check');
R.scene(5, [K.fade(52), K.hand('h5', '1 hour in Claude', { x: 26, y: 3, size: 7, r: -3, in: at('hour') }),
  K.paper('p5', [
    { id: 't5a', text: 'new product', ok: true, in: at('decisions') },
    { id: 't5b', text: 'launch date', ok: true, in: at('based') },
    { id: 't5c', text: 'post series', ok: true, in: at('output') },
  ], { top: 14, in: at('made') - 0.2 })]);

// F6 switch to ChatGPT: it has no idea
note(6, 'Over in ChatGPT: “picking up where we left off” gets a blank', 'bubble pop, nope on the blank reply');
R.scene(6, [K.fade(54), K.chat([
  { id: 'c6a', kind: 'me', text: 'okay, picking up where we left off', in: at('want', 30), enter: 'up' },
  { id: 'c6b', kind: 'ai', text: 'I don’t have any context on that yet. Can you fill me in?', in: at('switch') },
], { top: 6 }), K.hand('h6', 'starting from zero', { x: 8, y: 44, size: 6.5, r: -4, in: at('switch') + 0.6 })]);

// F7 built-in memory: "Memory updated", then an old fact it still holds
note(7, '“Memory updated” chip, then the AI repeats an outdated fact; aside “that changed”', 'pop, bubble pop, pop');
R.scene(7, [K.fade(54), {
  html: `<div id="mem7" class="abs" style="left:28cqw;top:6cqw;display:flex;align-items:center;gap:1.6cqw;background:#fff;color:#5d5d5d;border-radius:99px;padding:1.8cqw 3.6cqw;font:500 4.2cqw 'Segoe UI','${B.font.body}',sans-serif;box-shadow:0 1cqw 3cqw rgba(0,0,0,.3)"><span style="font-size:4.6cqw;color:#1c1c1c">✎</span>Memory updated</div>`,
  anim: [`pop('#mem7', ${at('memory')});`],
}, K.hand('h7a', 'spotty', { x: 64, y: 20, size: 8, r: 6, color: C.peach, in: at('spotty') }),
K.chat([{ id: 'c7', kind: 'ai', text: 'Your launch is this Friday, right?', in: at('remember') }], { top: 20, right: 34 }),
K.hand('h7b', 'that changed last week', { x: 8, y: 38, size: 6.5, r: -4, in: at('up-to-date') })]);

// F8 organizing it outside the AI: folders fan in
note(8, 'Folders fan in: offers, decisions, series, customers', 'paper slide, bubble pop, paper slide, pop');
R.scene(8, [K.fade(48),
  K.folder('f8a', 'offers', { x: 1, y: 11, r: -8, in: at('organizing') }), K.folder('f8b', 'decisions', { x: 23, y: 4, r: -2, in: at('business', 46) }),
  K.folder('f8c', 'series', { x: 47, y: 8, r: 3, in: at('information', 47) }), K.folder('f8d', 'customers', { x: 69, y: 19, r: 8, in: at('outside') }),
  K.hand('h8', 'outside the AI', { x: 8, y: 42, size: 7, r: -3, in: at('itself') })]);

// F9 Notion: the real Business Brain scrolls behind her (cut out)
note(9, 'The real Business Brain (in Notion) scrolls behind her (cut out); cursor clicks', 'whip whoosh in, pop on the click');
R.scene(9, [K.scrollPage('br9', 'assets/img/brain.png', { in: win(9).s, dur: win(9).d.toFixed(2) })]);
R.scene(9, [K.cursor('cur9', { x: 74, y: 14, click: win(9).s + 1.4 })], { layer: 'b' });
R.cutout(9, 'assets/cut/f09-cut.webm', 6, 'sketch/f09-cut.png');

// F10 connected to both
note(10, 'The Brain card in the middle, wired to ChatGPT and Claude', 'bubble pop, pop, check');
R.scene(10, [K.fade(54), {
  html: `<div id="bb10" class="abs" style="left:20cqw;top:4cqw;width:60cqw;background:${C.cream};color:${C.ink};border-radius:2.4cqw;padding:3cqw 3.4cqw;text-align:center;font:800 6.6cqw/1 '${S}';font-stretch:78%;box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.4)">🧠 Business Brain<div style="font:500 3.6cqw 'Segoe UI','${B.font.body}';margin-top:1.4cqw;color:#6b625b">Notion</div></div>`
    + pill('p10a', 'ChatGPT', 6, 36) + pill('p10b', 'Claude', 66, 36),
  anim: [`pop('#bb10', ${at('connected')});`, `pop('#p10a', ${at('chatgpt', 57)});`, `pop('#p10b', ${at('claude', 58)});`],
}, K.arrow('a10a', { x: 14, y: 17, w: 14, r: 130, in: at('chatgpt', 57) - 0.1 }), K.arrow('a10b', { x: 70, y: 17, w: 14, r: 50, in: at('claude', 58) - 0.1 })]);

// F11 tell the AI to check the Brain before it builds
note(11, 'A prompt types “check my Brain first”; aside “before it builds anything”', 'bubble pop, typing');
R.scene(11, [K.fade(50), K.prompt('pr11', 'check my Brain first', { x: 16, y: 10, in: at('tell'), typeAt: at('reference', 60) }),
  K.hand('h11', 'before it builds anything', { x: 14, y: 30, size: 7, r: -3, in: at('builds') })]);

// F12 update once in Notion, both read the new version
note(12, 'A Notion page line gets updated (old date out, new date in); aside “both see the new one”', 'paper slide, typing, check');
R.scene(12, [K.fade(56), K.mdFile('md12', 'Business Brain › Launch plan', [
  ['1', '# Fall launch', 'h'],
  ['2', 'launch date: Friday', 'no'],
  ['3', '+ launch date: next Tuesday', 'add'],
], { top: 4, in: at('information', 65), typeAt: at('updated', 66), gap: 0.6 }),
K.hand('h12', 'both see the new one', { x: 34, y: 38, size: 7, r: -4, in: at('both', 68) })]);

// F13 control over what the AI uses
note(13, 'Statement: “You decide what your AI knows”', 'air whoosh on the words');
R.scene(13, [K.fade(50), K.statement('b13', 'You decide what your AI <m>knows</m>', { top: 6, size: 12, in: at('i really') + 0.1, swipe: at('control') })]);

// F14 CTA (no price; name + site)
note(14, 'End card: name + scrollyseo.com; aside “simple setup”', 'whip whoosh, chime on the URL');
R.scene(14, [K.fade(50), K.statement('b14', 'Scrolly <m>Business Brain</m>', { top: 6, size: 11, in: win(14).s + 0.1, swipe: win(14).s + 0.6 }),
  K.urlBar('u14', 'scrollyseo.com', { top: 22, in: at('actually', 80) }),
  K.hand('h14', 'simple setup', { x: 56, y: 36, size: 7.5, r: -4, in: at('simple') })]);

// camera: alternate framing per jump cut, punch-in on "over and over again", whips into the Brain and the end card
R.cam.alternate();
R.cam.punch(at('over and'));
R.cam.set(win(9).s, '1.0');
R.cam.whip(win(9).s); R.cam.whip(win(14).s);

R.captions({ hide: [1, 4, 13, 14] });

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('business'));
fx('fx-pop2a', 'pop-bubble', at('different')); fx('fx-pop2b', 'pop-light', at('different', 9));
fx('fx-type3', 'typing-laptop', at('explaining'), 0.35, 1.2); fx('fx-pop3b', 'pop-bubble', at('over')); fx('fx-pop3c', 'pop-light', at('again'));
fx('fx-wh4', 'whoosh-air', at('i needed'), 0.4); fx('fx-pop4', 'pop-bubble', at('either'));
fx('fx-pap5', 'paper-slide', at('made') - 0.2, 0.6); fx('fx-chk5a', 'check', at('decisions'), 0.4); fx('fx-pop5b', 'pop-light', at('based')); fx('fx-chk5c', 'check', at('output'), 0.4);
fx('fx-pop6a', 'pop-bubble', at('want', 30)); fx('fx-no6', 'nope', at('switch'), 0.45);
fx('fx-pop7a', 'pop-light', at('memory')); fx('fx-pop7b', 'pop-bubble', at('remember')); fx('fx-pop7c', 'pop-light', at('up-to-date'));
fx('fx-pap8a', 'paper-slide', at('organizing'), 0.7); fx('fx-pop8b', 'pop-bubble', at('business', 46)); fx('fx-pap8c', 'paper-slide', at('information', 47), 0.7); fx('fx-pop8d', 'pop-light', at('outside'));
fx('fx-wh9', 'whoosh-fast', win(9).s - 0.12, 0.55); fx('fx-pop9', 'pop-light', win(9).s + 1.95, 0.5);
fx('fx-pop10a', 'pop-bubble', at('connected')); fx('fx-pop10b', 'pop-light', at('chatgpt', 57)); fx('fx-chk10', 'check', at('claude', 58), 0.45);
fx('fx-pop11', 'pop-bubble', at('tell')); fx('fx-type11', 'typing-laptop', at('reference', 60), 0.35, 1.0);
fx('fx-pap12', 'paper-slide', at('information', 65), 0.6); fx('fx-type12', 'typing-laptop', at('updated', 66), 0.3, 1.4); fx('fx-chk12', 'check', at('both', 68), 0.45);
fx('fx-wh13', 'whoosh-air', at('i really') + 0.1, 0.4);
fx('fx-wh14', 'whoosh-fast', win(14).s - 0.12, 0.55); fx('fx-chime14', 'chime', at('actually', 80), 0.5, +(R.DUR - at('actually', 80) - 0.02).toFixed(2));
R.music('assets/music/music-a.mp3'); // "Slow Pop" (Mixkit, from Reel #2's candidates; Curiosity, Chill Bro, Lonerism and Sweet September are on the last/other Reels)

// cover options (the viewer's problem in their words; no internal names, no price); <m> = peach marker swipe
const COVERS = [
  { text: 'Tired of <m>re-explaining</m> your business to AI?' },
  { text: 'Use ChatGPT <m>and</m> Claude?', aside: 'give them one brain' },
  { text: 'Switching AIs means <m>starting from zero</m>' },
  { text: 'When AI memory <m>gets it wrong</m>' },
  { text: 'One place <m>both AIs</m> can read' },
  { text: 'Stop copying your business info <m>into every chat</m>' },
];
// post caption draft (brand voice: CTA in the first two sentences, Business Brain = name + scrollyseo.com, no price, 3 hashtags)
const POST = {
  caption: `I use ChatGPT and Claude every day, and I got tired of explaining my business to each one from scratch. So my business info lives in one place, my Scrolly Business Brain (scrollyseo.com), and both AIs read the same up-to-date version.

Built-in AI memory can be spotty: it holds on to old details and misses new ones. When I change something, I update it once in Notion and both tools use the new version.

Start with one page today: your offers, your prices and what you're working on right now. Connect it to the AI you use, then ask it to check that page before it writes anything.`,
  hashtags: '#smallbusinessmarketing #aiforbusiness #notion',
};
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'I use ChatGPT and Claude, so I gave them one brain', covers: COVERS, coverCut: 'sketch/f09-cut.png', stills, post: POST });
}
else R.write();
