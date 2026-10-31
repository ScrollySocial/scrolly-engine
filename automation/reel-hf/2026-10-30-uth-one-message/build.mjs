// "Why your auto-DM sends only one message": Under the Hood 1 (IMG_2082, filmed 2026-10-30, planner card 3db8fe17d376).
// Spine: Meta's private-reply rule (one message per comment, 7 days), then the fix: make that one message ask for a reply.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, at, win } = R;
// caption fixes on the transcript
for (let i = 0; i < R.W.length; i++) {
  const w = R.W[i], nx = R.W[i + 1];
  if (/^many$/i.test(w.w) && nx && /^chat/i.test(nx.w)) { w.w = 'ManyChat' + nx.w.replace(/^chat/i, ''); nx.w = ''; }
  if (/^auto$/i.test(w.w) && nx && /^dm/i.test(nx.w)) { const cta = /^comment$/i.test(R.W[i - 1]?.w); w.w = (cta ? 'AUTODM' : 'auto-DM') + nx.w.replace(/^dm/i, ''); nx.w = ''; }
  if (/^rule$/i.test(w.w) && nx && /^book/i.test(nx.w)) { w.w = 'Rulebook' + nx.w.replace(/^book/i, ''); nx.w = ''; }
  if (/^meta$/i.test(w.w)) w.w = 'Meta';
  if (w.w === 'the' && nx && /^answer/.test(nx.w) && /^when$/i.test(R.W[i - 1]?.w)) w.w = 'they';
  if (/^ready$/i.test(w.w) && /^reply$/i.test(R.W[i - 1]?.w)) w.w = 'READY';
  if (w.w === 'DM' && /^to$/i.test(R.W[i - 1]?.w)) w.w = 'DM,';
}
R.W.splice(0, R.W.length, ...R.W.filter((w) => w.w));
// tight cuts capitalize every piece's first word: keep capitals only at a sentence start (and proper names)
for (let i = 1; i < R.W.length; i++) { const w = R.W[i], p = R.W[i - 1]; if (/^[A-Z][a-z]/.test(w.w) && !/[.?!]$/.test(p.w) && !/^(I|I'm|I'll|Claude|Instagram|Meta|ManyChat|YouTube|TikTok|Many)/.test(w.w)) w.w = w.w[0].toLowerCase() + w.w.slice(1); }

R.frames([0, at('if you'), at('and that is'), at('when someone'), at('you only'), at('after that'), at('so the trick'), at('when they'), at('comment auto')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });

// F1 hook
note(1, 'Hook above her head', 'pop on the swipe');
R.scene(1, [K.fade(46), K.statement('b1', 'Your auto-DM sends only <m>one message</m>', { top: 6, size: 11, in: 0.15, swipe: at('one message') }),
  K.hand('h1', 'here’s why', { x: 58, y: 38, size: 7, r: -4, in: at('here') })]);

// F2 one DM, then it waits
note(2, 'One DM lands, then nothing: “then it waits”', 'pop-message on the DM');
R.scene(2, [K.fade(48), K.chat([
  { id: 'c2a', kind: 'me', text: 'MATH', in: win(2).s + 0.3 },
  { id: 'c2b', kind: 'ai', text: 'Want my free worksheet? Reply READY and I’ll send it over.', in: at('only sends'), enter: 'up' },
], { top: 6 }), K.hand('h2', '…and then it waits', { x: 10, y: 44, size: 7, r: -3, in: at('waits') })]);

// F3 the rule
note(3, 'Instagram’s rule, ManyChat included', 'whoosh on the statement, pop on the aside');
R.scene(3, [K.fade(46), K.statement('b3', 'It’s <m>Instagram’s</m> rule', { top: 6, size: 12, in: win(3).s + 0.1, swipe: at('instagram') }),
  K.hand('h3', 'ManyChat included', { x: 50, y: 34, size: 7, r: -4, in: at('ManyChat') }), K.arrow('a3', { x: 30, y: 30, w: 17, r: 200, in: at('ManyChat') + 0.1 })]);

// F4 the private reply
note(4, 'A keyword comment turns into a “private reply” DM', 'pop on the comment, pop-bubble on the chip');
R.scene(4, [K.fade(50), K.chat([
  { id: 'c4a', kind: 'me', text: 'comment: MATH', in: at('comments') },
  { id: 'c4b', kind: 'chip', text: '🔒 private reply', in: at('private') },
], { top: 6 })]);

// F5 the two limits, ticked as she says them
note(5, 'Lined paper: the two limits', 'paper slide, check, check');
R.scene(5, [K.fade(48), K.paper('p5', [
  { id: 't5a', text: '1 message per comment', ok: true, in: at('one per') },
  { id: 't5b', text: 'sent within 7 days', ok: true, in: at('seven') },
], { top: 6, in: win(5).s + 0.1 })]);

// F6 their reply opens the window
note(6, 'Their reply opens a 24-hour window', 'whoosh-air on the statement');
R.scene(6, [K.fade(46), K.statement('b6', 'Their reply opens a <m>24-hour window</m>', { top: 6, size: 11, in: at('this reply'), swipe: at('window') })]);

// F7 the fix: the one message asks for a reply
note(7, 'Her real ask: reply READY, and they do', 'pop-message on the ask, pop-bubble on READY');
R.scene(7, [K.fade(50), K.statement('b7', 'Make it <m>ask for a reply</m>', { top: 5, size: 9.5, in: win(7).s + 0.1, swipe: at('ask') }), K.chat([
  { id: 'c7a', kind: 'ai', text: 'Want my free worksheet? Reply READY and I’ll send it over.', in: at('mine'), enter: 'up' },
  { id: 'c7b', kind: 'me', text: 'READY', in: at('link', at('mine')) },
], { top: 27 })]);

// F8 the link, then one reminder an hour later
note(8, 'Signup link, then a reminder “1 hour later”', 'pop-message on the link, chime on the reminder');
R.scene(8, [K.fade(50), K.chat([
  { id: 'c8a', kind: 'ai', text: 'Here you go! Pop in your email and you’ll get it right away 👇', in: at('signup') - 0.2, enter: 'up' },
  { id: 'c8b', kind: 'ai', text: 'Just checking you saw this! Your link is still here 👇', in: at('reminder'), enter: 'up' },
], { top: 6 }), K.hand('h8', '1 hour later', { x: 56, y: 50, size: 7, r: -4, in: at('reminder') - 0.3 })]);

// F9 her CTA; the end card follows
// no end card (Mercedes 2026-10-30: the freeze frame at the end looked bad): the ask lands live as she says the word
note(9, 'Comment AUTODM + comment bar appear as she says it; aside: free Rulebook', 'pop on the word, pop-bubble on the bar');
R.scene(9, [K.fade(46), K.statement('b9', 'Comment <m>AUTODM</m>', { top: 6, size: 12, in: at('AUTODM', win(9).s), swipe: at('AUTODM', win(9).s) + 0.4 }),
  K.ctaUi('ui9', 'comment', { top: 27, word: 'AUTODM', handle: R.B.handle || '', name: R.B.label || '', in: at('AUTODM', win(9).s) + 0.5 }),
  K.hand('h9', 'free Rulebook, no ManyChat needed', { x: 6, y: 44, size: 6.5, r: -3, in: at('rulebook') })]);
R.endCard({ kind: 'comment', word: 'AUTODM', detail: 'for my free Auto-DM Rulebook' }, { live: true });

R.cam.alternate();
R.cam.punch(at('waits'));
R.cam.punch(at('the trick'));

R.captions({ hide: [9], top: () => 150 }); // below her chin (Mercedes 2026-10-30: 128 covered her face)

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('one message'));
fx('fx-pop2a', 'pop-bubble', win(2).s + 0.3); fx('fx-msg2', 'pop-message', at('only sends'));
fx('fx-wh3', 'whoosh-air', win(3).s + 0.1, 0.4); fx('fx-pop3', 'pop-light', at('ManyChat'));
fx('fx-pop4a', 'pop-bubble', at('comments')); fx('fx-pop4b', 'pop-light', at('private'));
fx('fx-pap5', 'paper-slide', win(5).s + 0.1, 0.6); fx('fx-chk5a', 'check', at('one per'), 0.4); fx('fx-pop5b', 'pop-light', at('seven'));
fx('fx-wh6', 'whoosh-air', at('this reply'), 0.4);
fx('fx-pop7', 'pop-light', at('ask')); fx('fx-msg7a', 'pop-message', at('mine')); fx('fx-pop7b', 'pop-bubble', at('link', at('mine')));
fx('fx-msg8a', 'pop-message', at('signup') - 0.2); fx('fx-chime8', 'chime', at('reminder'), 0.5);
fx('fx-pop9', 'pop-light', at('AUTODM', win(9).s) + 0.4); fx('fx-bar9', 'pop-bubble', at('AUTODM', win(9).s) + 0.5);
// music cuts out on "it waits" and stays out (Mercedes 2026-10-30: silence through that pause)
const waits = R.W.find((w) => w.s >= at('waits') - 0.001);
R.music('assets/music/music-a.mp3', { end: +(waits.e + 0.05).toFixed(2), fadeOut: 0.2 }); // "Curiosity" (Mixkit), her pick on the 2026-10-13 Reels

// cover options (the viewer's problem in their words); <m> = marker swipe
const COVERS = [
  { text: 'Why your auto-DM sends <m>only one message</m>' },
  { text: 'Your auto-DM <m>stops after one message</m>?', aside: "here's why" },
  { text: 'The <m>one-message rule</m> every DM tool follows' },
  { text: 'Get people to <m>reply</m> to your auto-DM' },
  { text: 'ManyChat can’t <m>send a second DM</m> either' },
];
const POST = {
  caption: `Comment-to-DM tools can send one message per comment, and it has to go out within 7 days. That's Meta's private reply rule, and every tool follows it, ManyChat included.

After that, you can only keep talking if they reply, which opens a 24-hour window. So make your one message ask for a reply. Mine says: reply READY and I'll send it over.`,
  hashtags: '#instagramtips #smallbusinessmarketing #aiforbusiness',
};
if (process.argv[2] === 'frames') { console.log(JSON.stringify(R.F)); process.exit(0); }
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'Why your auto-DM sends only one message', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
