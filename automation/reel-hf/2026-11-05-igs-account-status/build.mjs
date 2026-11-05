// Instagram settings 1: Account status (planner card a021d6f94753). Hook take IMG_2136 (filmed 2026-11-04), then her
// screen recording BPHH0190 (2026-11-05) joined onto the same timeline by screen.mjs: scroll Settings and activity (3×),
// tap Account Status, the green-check screen. Format from her saved reference Reels: hook, then the real screen with the
// setting circled by hand. Honest: "Recommendation eligibility" = Instagram can show your content to non-followers.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
// Footage: prep-footage → grade.mjs (her face only) → screen.mjs (adds the screen recording; screen.json)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, at, win } = R;
const SCR = R.P.screenAt; // where the screen recording starts
// the take opens on "If" before the transcript's first word (the hand-at-mouth start before it is cut)
if (/^your$/i.test(R.W[0].w)) R.W.unshift({ w: 'If', s: 0, e: 0.12, seg: 0, first: true });
// tight cuts capitalize every piece's first word: keep capitals only at a sentence start
for (let i = 1; i < R.W.length; i++) { const w = R.W[i], p = R.W[i - 1]; if (/^[A-Z][a-z]/.test(w.w) && w.w !== 'Instagram' && !/[.?!]$/.test(p.w)) w.w = w.w[0].toLowerCase() + w.w.slice(1); }

// her tap on Account Status and the status page loaded (BPHH0190 18.0 / 18.55): scroll 5.8 s at 3× = 1.93 s, then the
// settled list (17.0-17.5) + a 0.9 s hold so the ring is seen before the tap (screen.json)
const SETTLED = SCR + 1.93, TAP = SETTLED + 1.9, PAGE = SETTLED + 2.45;
const OUT = +(R.DUR - 2).toFixed(2); // the Save this outro: the last 2 s (screen.json holds the last screen frame for it)
R.frames([0, SCR, TAP, OUT]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });

// the menu path as a white label pill (real-looking UI, sits below Instagram's top bar). ☰ drawn, not a font glyph.
const UI = "'Segoe UI','ScrollyFigtree',sans-serif";
const BURGER = '<svg viewBox="0 0 24 24" style="width:4.2cqw;height:4.2cqw;vertical-align:-.9cqw"><path d="M4 6h16M4 12h16M4 18h16" stroke="#0a1930" stroke-width="2.4" stroke-linecap="round"/></svg>';
const path = (id, html, { top, in: t }) => ({
  html: `<div id="${id}" class="abs blk" style="left:5cqw;right:5cqw;top:${top}cqw;text-align:center"><span style="display:inline-block;background:#fff;color:${C.ink};font:600 4.3cqw/1.3 ${UI};padding:1.8cqw 3.6cqw;border-radius:5cqw;box-shadow:0 1cqw 3.4cqw rgba(10,25,48,.32)">${html}</span></div>`,
  anim: [`pop('#${id}', ${t});`],
});

// F1 hook: big bold words in the middle of the screen, just under her chin (Mercedes 2026-11-05: center, big, bold;
// her pick over the Instrument Serif statement rule). No captions under it: the words on screen carry the hook.
note(1, 'Hook in big bold letters mid-screen: “CHECK THESE SECRET SETTINGS”; zoom in on “secret”', 'pop on each line, zoom on the punch-in');
const HOOK = "font:900 15.5cqw/.92 'ScrollyFigtree',sans-serif;letter-spacing:-.02em;text-transform:uppercase";
R.scene(1, [{
  html: `<div id="hk1" class="abs blk" style="left:3cqw;right:3cqw;top:90cqw;text-align:center;color:#fff;${HOOK};text-shadow:0 .5cqw 2.4cqw rgba(0,0,0,.55)">
  <div id="hk1a" style="font-size:10.5cqw">Check these</div>
  <div id="hk1b" style="margin-top:1.4cqw"><span class="mk" style="padding:0 .1em"><span class="mkbg"></span><span class="mkt">Secret</span></span></div>
  <div id="hk1c" style="margin-top:.6cqw">settings</div></div>`,
  anim: ["up('#hk1a', 0.05, 30);", "pop('#hk1b', 0.3);", "up('#hk1c', 0.5, 30);", `swipe('#hk1', ${at('secret')});`],
}]);

// F2 the real Settings and activity screen scrolling, the path on a pill, a hand-drawn ring around Account Status
note(2, 'Her screen recording: Settings and activity scrolls down; path pill on top; ring drawn around Account Status', 'whoosh into the screen, draw on the ring');
// zoom toward the Account Status row as the scroll settles (screen + ring together); the path pill stays put (layer b)
const Z2 = SETTLED + 0.2;
R.scene(2, [K.ring('r2', { x: -1, y: 119, w: 50, h: 14, color: C.peach, in: Z2 + 0.55 })]);
R.scene(2, [path('p2', `Profile &gt; ${BURGER} &gt; Settings and activity`, { top: 19, in: SCR + 0.1 })], { layer: 'b' });
R.js(`tl.fromTo(['#cam', '#s2'], { scale: 1, transformOrigin: '0% 71%' }, { scale: 1.25, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, ${Z2});`);

// F3 the Account Status page: ring around Recommendation eligibility (no extra text: Mercedes 2026-11-05)
note(3, 'Account Status page, slow push in: ring around “Recommendation eligibility” ✓', 'click on her tap, check on the ring');
const t3 = PAGE + 0.35;
R.scene(3, [K.ring('r3', { x: -1.5, y: 98.5, w: 101, h: 15, color: C.peach, in: t3 })]);
R.js(`tl.fromTo(['#cam', '#s3'], { scale: 1, transformOrigin: '50% 61%' }, { scale: 1.05, duration: ${(OUT - TAP).toFixed(2)}, ease: 'none', immediateRender: false }, ${TAP});`);

// F4 outro (Mercedes 2026-11-05: "add an outro that says save this"; then: no face at the end, Saved bar diagonal across
// the middle): the held Account Status screen under a blue-mist wash, SAVE THIS in the hook's big bold type, the
// Instagram Saved toast enlarged and tilted across the middle. Comment MATH stays in the caption.
note(4, 'Outro, no face: blue-mist wash over the screen, “SAVE THIS” big and bold, the Saved toast big and diagonal across the middle', 'whoosh in, check on the toast');
R.scene(4, [{ html: `<div id="wash4" class="fill" style="background:${C.mist};opacity:.9"></div>`, anim: [`tl.fromTo('#wash4', { opacity: 0 }, { opacity: 0.9, duration: 0.25 }, ${OUT});`] },
  { html: `<div id="sv4" class="abs blk" style="left:3cqw;right:3cqw;top:44cqw;text-align:center;color:${C.ink};${HOOK};font-size:21cqw">Save <span class="mk" style="padding:0 .1em"><span class="mkbg"></span><span class="mkt">this</span></span></div>`,
    anim: [`pop('#sv4', ${OUT + 0.1});`, `swipe('#sv4', ${OUT + 0.45});`] },
  { html: '<div class="abs blk" style="left:0;right:0;top:100cqw;height:20cqw;transform:rotate(-9deg) scale(1.25);transform-origin:50% 0">', anim: [] },
  K.ctaUi('ui4', 'save', { top: 0, handle: R.B.handle || '', name: R.B.label || '', in: OUT + 0.6 }),
  { html: '</div>', anim: [] }]);
R.endCard({ kind: 'comment', word: 'MATH', detail: 'and I’ll send you my $1K Math calculator' }, { live: true }); // the caption line

R.cam.alternate(R.P.cuts.filter((t) => t < SCR));
R.cam.punch(at('secret'), 1.12);
R.cam.set(SCR, 1); // back to full frame for the screen recording
R.cam.whip(SCR);
R.cam.set(OUT, 1); // the outro sits on its own panel

R.captions({ hide: [1, 2, 3, 4], top: () => 150 }); // hook words are on screen; the screen part has no voice

// ---- sound (never the same effect twice in a row) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', 0.3);
fx('fx-zm1', 'zoom-in', at('secret') - 0.05, 0.4);
fx('fx-wh2', 'whoosh-fast', SCR - 0.12, 0.45);
fx('fx-pop2', 'pop-bubble', SCR + 0.1, 0.5);
fx('fx-sw2', 'swoosh-in', Z2 + 0.55, 0.45);
fx('fx-clk3', 'mouse-click', TAP, 0.5);
fx('fx-chk3', 'check', t3, 0.5);
fx('fx-wh4', 'whoosh-air', OUT, 0.4);
fx('fx-pop4', 'pop-light', OUT + 0.15, 0.5);
fx('fx-chk4', 'check', OUT + 0.7, 0.5);
// no music (Mercedes 2026-11-05: didn't like Curiosity or Hip Hop 02; "please don't add music")

// cover options (the viewer's problem in their words); <m> = marker swipe
const COVERS = [
  { text: 'Instagram account <m>not growing</m>?', aside: 'check this first' },
  { text: 'Can Instagram <m>recommend</m> your Reels?' },
  { text: 'The <m>secret setting</m> to check first' },
  { text: 'Is your account <m>being held back</m>?', aside: 'setting #1' },
  { text: '<m>Not growing</m>? Check this setting' },
];
// caption: the exact menu path, honest about what the screen tells you; the CTA line is inserted by the build
const POST = {
  caption: `Instagram settings to check, part 1: Account Status.

Profile > ☰ (top right) > Settings and activity > scroll to the bottom > Account Status

Look for "Recommendation eligibility". A green check means Instagram can recommend your content to people who don't follow you yet (Explore, the Reels feed). If anything there isn't green, tap it: Instagram shows what's wrong and, for some issues, lets you ask for a review.

Instagram moves these menus around, so if you can't find it, type "Account Status" into the search bar at the top of Settings and activity.`,
  hashtags: '#instagramtips #instagramgrowth #reelstips',
};
if (process.argv[2] === 'frames') { console.log(JSON.stringify(R.F)); process.exit(0); }
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'Instagram settings 1: Account status', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
