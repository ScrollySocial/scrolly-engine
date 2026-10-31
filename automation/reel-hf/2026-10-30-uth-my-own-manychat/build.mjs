// "I asked Claude to build my own ManyChat": Under the Hood 2 (IMG_2085 + CTA from IMG_2086, filmed 2026-10-30,
// planner card e01bf2dd3008). Spine: ManyChat Pro $39/month → her own comment-to-DM tool on a $6 server, what it does,
// and the two setup clicks that could have cost weeks (shown on screen; she names them in the free TRAPS checklist).
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
  if (/^math,?$/i.test(w.w)) w.w = w.w.toUpperCase();
  if (/^ready,?$/i.test(w.w)) w.w = w.w.toUpperCase();
  if (/^traps,?$/i.test(w.w)) w.w = w.w.toUpperCase();
  if (w.w === 'Cool' && /^about$/i.test(nx?.w)) w.w = 'What’s cool'; // the cut starts inside "what's": caption keeps it
  if (w.w === 'list' && /^through$/i.test(nx?.w)) { w.w = 'list.'; nx.w = ''; } // "through" is past the cut (transcript time drifts)
}
R.W.splice(0, R.W.length, ...R.W.filter((w) => w.w));
// tight cuts capitalize every piece's first word: keep capitals only at a sentence start (and proper names)
for (let i = 1; i < R.W.length; i++) { const w = R.W[i], p = R.W[i - 1]; if (/^[A-Z][a-z]/.test(w.w) && !/[.?!]$/.test(p.w) && !/^(I|I'm|I'll|Claude|Instagram|Meta|ManyChat|YouTube|TikTok|Many)/.test(w.w)) w.w = w.w[0].toLowerCase() + w.w.slice(1); }

R.frames([0, at('when someone'), at('it then'), at("what's"), at('and so once'), at('another'), at('i also made'), at('i pay'), at('claude did'), at('two of'), at('if you want')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });

// F1 hook: the $39 bill
note(1, 'Hook above her head; $39 receipt', 'pop on the swipe, coins on the receipt');
R.scene(1, [K.fade(46), K.statement('b1', 'I asked Claude for my own <m>ManyChat</m>', { top: 6, size: 10.5, in: 0.15, swipe: at('ManyChat') }),
  K.receipt('r1', 'ManyChat Pro', ['$39 a month'], { x: 58, y: 36, in: at('$39') })]);

// F2 the keyword comment → auto-DM
note(2, 'A MATH comment gets an auto-DM', 'pop-bubble on the comment, pop-message on the DM');
R.scene(2, [K.fade(50), K.chat([
  { id: 'c2a', kind: 'me', text: 'comment: MATH', in: at('MATH') },
  { id: 'c2b', kind: 'ai', text: 'Want my free $1K Math worksheet? Reply READY and I’ll send it over.', in: at('auto'), enter: 'up' },
], { top: 6 })]);

// F3 READY → the link
note(3, 'They reply READY, the link arrives', 'pop on READY, pop-message on the link');
R.scene(3, [K.fade(50), K.chat([
  { id: 'c3a', kind: 'me', text: 'READY', in: at('READY') },
  { id: 'c3b', kind: 'ai', text: 'Here you go! Pop in your email and you’ll get the worksheet right away 👇', in: at('link'), enter: 'up' },
], { top: 6 })]);

// F4 the difference: email
note(4, 'Straight onto her email list', 'whoosh-air on the statement');
R.scene(4, [K.fade(46), K.statement('b4', 'Straight onto my <m>email list</m>', { top: 6, size: 11.5, in: at('integrated'), swipe: at('provider') })]);

// F5 what happens on signup
note(5, 'Lined paper: signs up, added to the list', 'paper slide, check, check');
R.scene(5, [K.fade(48), K.paper('p5', [
  { id: 't5a', text: 'signs up for the freebie', ok: true, in: at('sign up') },
  { id: 't5b', text: 'added to my email list', ok: true, in: at('automatically') },
], { top: 6, in: win(5).s + 0.1 })]);

// F6 YouTube too
note(6, 'YouTube comment gets an auto reply', 'pop-bubble, pop-message');
R.scene(6, [K.fade(50), K.chat([
  { id: 'c6a', kind: 'me', text: '▶ YouTube comment: MATH', in: at('youtube') },
  { id: 'c6b', kind: 'ai', text: 'Here’s my free $1K Math worksheet. Pop in your email and it opens right away 👇', in: at('auto response'), enter: 'up' },
], { top: 6 })]);

// F7 one inbox
// inbox demo above her head (Mercedes 2026-10-30): the public Chat Manager demo (made-up shop), list → click → the thread
note(7, 'Inbox demo above her head: the list, a click, the whole comment-to-signup thread scrolls', 'pop on the window, click, paper slide on the scroll');
const t7 = at('email inbox'), c7 = at('manage') + 0.3;
const inboxDemo = { html: `<div id="ib7" class="abs blk" style="left:7cqw;top:3cqw;width:86cqw;height:74cqw;border-radius:2.2cqw;overflow:hidden;background:#fff6f3;box-shadow:0 1.5cqw 4cqw rgba(10,25,48,.35)">
  <div style="height:5.6cqw;background:#ece6dd;display:flex;align-items:center;gap:1.2cqw;padding:0 2.4cqw"><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#ff5f57"></i><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#febc2e"></i><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#28c840"></i><span style="margin-left:2cqw;flex:1;background:#fff;border-radius:2cqw;padding:.5cqw 2cqw;font:500 2.4cqw/1.2 Jost,sans-serif;color:#0a1930">my inbox</span></div>
  <div style="position:relative;height:68.4cqw;overflow:hidden"><img id="ib7a" src="assets/img/inbox-list.png" style="position:absolute;left:-5%;top:0;width:150%"><img id="ib7b" src="assets/img/inbox-thread.png" style="position:absolute;left:-4%;top:0;width:118%;opacity:0"></div></div>`,
  anim: [`pop('#ib7', ${t7});`, `tl.to('#ib7a', { y: '-12%', duration: 1.2, ease: 'power1.inOut' }, ${t7 + 0.6});`,
    `tl.set('#ib7b', { opacity: 1 }, ${c7 + 0.25});`, `tl.to('#ib7b', { y: '-38%', duration: ${(win(7).d - (c7 - win(7).s) - 0.8).toFixed(2)}, ease: 'power1.inOut' }, ${c7 + 0.6});`] };
R.scene(7, [K.fade(40), inboxDemo, K.cursor('cur7', { x: 40, y: 22, size: 6, click: c7 }),
  K.hand('h7', 'demo shop, same inbox', { x: 50, y: 78, size: 5.5, r: -3, in: t7 + 0.4 })]);

// F8 $6 vs $39
note(8, 'Receipt: $6 a month server', 'coins on the receipt');
R.scene(8, [K.fade(48), K.statement('b8', 'Only <m>$6 a month</m>', { top: 6, size: 12, in: win(8).s + 0.1, swipe: at('$6') }),
  K.receipt('r8', 'My server', ['$6 a month', 'always running'], { x: 58, y: 30, in: at('host') })]);

// F9 who did what
note(9, 'Chat: Claude wrote the code, she did the clicks', 'typing, pop-message');
R.scene(9, [K.fade(50), K.chat([
  { id: 'c9a', kind: 'ai', text: 'Done. Now click Publish app in your Google account.', in: at('technical'), enter: 'up' },
  { id: 'c9b', kind: 'me', text: 'clicked ✓', in: at('clicks') },
], { top: 6 })]);

// F10 the two traps
note(10, 'Lined paper: the two clicks that cost weeks', 'paper slide, nope, nope');
R.scene(10, [K.fade(48), K.paper('p10', [
  { id: 't10a', text: 'logo on the Google app: 4 to 6 week review', ok: false, in: at('clicks') },
  { id: 't10b', text: 'app left in Testing: stops after 7 days', ok: false, in: at('weeks') },
], { top: 6, in: win(10).s + 0.1 })]);

// F11 her CTA; the end card follows
// no end card (Mercedes 2026-10-30: "Comment TRAPS should show up when I say it", no freeze frame)
note(11, 'Comment TRAPS + comment bar appear as she says it; aside: every setup trap', 'pop on the word, pop-bubble on the bar');
R.scene(11, [K.fade(46), K.statement('b11', 'Comment <m>TRAPS</m>', { top: 6, size: 12, in: at('TRAPS'), swipe: at('TRAPS') + 0.4 }),
  K.ctaUi('ui11', 'comment', { top: 27, word: 'TRAPS', handle: R.B.handle || '', name: R.B.label || '', in: at('TRAPS') + 0.5 }),
  K.hand('h11', 'every setup trap, free', { x: 8, y: 44, size: 7, r: -3, in: at('pitfalls') })]);
R.endCard({ kind: 'comment', word: 'TRAPS', detail: 'for my free setup trap checklist' }, { live: true });

R.cam.alternate();
R.cam.punch(at('weeks'));

R.captions({ hide: [11], top: () => 150 }); // below her chin (Mercedes 2026-10-30: 128 covered her face)

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('ManyChat')); fx('fx-coin1', 'coins', at('$39'), 0.5);
fx('fx-pop2', 'pop-bubble', at('MATH')); fx('fx-msg2', 'pop-message', at('auto'));
fx('fx-pop3', 'pop-light', at('READY')); fx('fx-msg3', 'pop-message', at('link'));
fx('fx-wh4', 'whoosh-air', at('integrated'), 0.4);
fx('fx-pap5', 'paper-slide', win(5).s + 0.1, 0.6); fx('fx-chk5a', 'check', at('sign up'), 0.4); fx('fx-pop5b', 'pop-light', at('automatically'));
fx('fx-pop6', 'pop-bubble', at('youtube')); fx('fx-msg6', 'pop-message', at('auto response'));
fx('fx-pop7a', 'pop-bubble', t7); fx('fx-clk7', 'mouse-click', c7, 0.4); fx('fx-pap7c', 'paper-slide', c7 + 0.6, 0.7);
fx('fx-pop8', 'pop-light', at('$6')); fx('fx-coin8', 'coins', at('host'), 0.5);
fx('fx-type9', 'typing-short', at('technical') - 0.6, 0.35); fx('fx-msg9', 'pop-message', at('clicks'));
fx('fx-pap10', 'paper-slide', win(10).s + 0.1, 0.6); fx('fx-no10', 'nope', at('weeks'), 0.45);
fx('fx-pop11', 'pop-light', at('TRAPS') + 0.4); fx('fx-bar11', 'pop-bubble', at('TRAPS') + 0.5);
R.music('assets/music/music-a.mp3'); // "Curiosity" (Mixkit), her pick on the 2026-10-13 Reels

const COVERS = [
  { text: 'I built my own <m>ManyChat</m> for $6 a month' },
  { text: 'Tired of paying <m>$39 a month</m> for auto-DMs?' },
  { text: 'Auto-DMs that go <m>straight to your email list</m>' },
  { text: 'My comment-to-DM tool <m>Claude built</m>', aside: 'for $6 a month' },
  { text: 'Skip the <m>ManyChat bill</m>' },
];
const POST = {
  caption: `ManyChat Pro would have cost me $39 a month, so I asked Claude to build my own version. Now a keyword comment gets a DM, a READY reply gets the link, and everyone who signs up lands on my email list. YouTube comments get a reply too, and it all runs on a $6 a month server.

Claude did the technical parts. I did the account setup and the clicks, and two of those clicks could have cost me weeks.`,
  hashtags: '#claudeai #instagramtips #smallbusinessmarketing',
};
if (process.argv[2] === 'frames') { console.log(JSON.stringify(R.F)); process.exit(0); }
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'I asked Claude to build my own ManyChat', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
