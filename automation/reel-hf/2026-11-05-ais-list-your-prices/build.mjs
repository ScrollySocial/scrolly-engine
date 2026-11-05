// "List your prices on your website": AI search for small business (IMG_2149, filmed 2026-11-04, planner card 886391058e05).
// Spine: AI can recommend you while you sleep → it needs prices it can read → "contact us for pricing" gets passed over →
// sites with their rates get listed. Claim checked 2026-11-05 (research.md): graphics never add "every time" or a skip rate.
// Usage: node build.mjs              → index.html
//        node build.mjs review       → review/reel.json for the review page (node ../lib/review/server.mjs)
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

const R = reel();
const { K, C, at, win } = R;
// caption fixes on the transcript
for (const w of R.W) { if (/^ai$/i.test(w.w)) w.w = 'AI'; }
// tight cuts capitalize every piece's first word: keep capitals only at a sentence start (and AI)
for (let i = 1; i < R.W.length; i++) { const w = R.W[i], p = R.W[i - 1]; if (/^[A-Z][a-z]/.test(w.w) && !/[.?!]$/.test(p.w)) w.w = w.w[0].toLowerCase() + w.w.slice(1); }

R.frames([0, at('by having'), at('then you'), at('listing prices'), at('if instead'), at('AI is going'), at('for websites'), at('save this')]);
const NOTES = {};
const note = (n, title, sound) => (NOTES[n] = { title, sound });

// ---- demo pieces (inline: a ChatGPT answer and a small business's services page, both clearly examples) ----
const UI = "'Segoe UI','ScrollyFigtree',sans-serif";
// ChatGPT-style card: the question, then the answer lines. items: [{ id, html, in }]
const gpt = (id, { top, q, qIn, intro, introIn, items = [], typeAt }) => ({
  html: `<div id="${id}" class="abs blk" style="left:7cqw;right:7cqw;top:${top}cqw;background:#fff;border-radius:3cqw;box-shadow:0 1.6cqw 4.4cqw rgba(10,25,48,.38);padding:3cqw 3.6cqw 3.4cqw;font:400 3.7cqw/1.35 ${UI};color:#1c1c1c">
  <div style="display:flex;align-items:center;gap:1.6cqw;font:600 3cqw ${UI};color:#555;margin-bottom:2.2cqw"><svg viewBox="0 0 24 24" style="width:4.4cqw;height:4.4cqw"><circle cx="12" cy="12" r="10" fill="#0a1930"/><path d="M8 12a4 4 0 0 1 8 0M8 12a4 4 0 0 0 8 0" stroke="#fff" stroke-width="1.6" fill="none"/></svg>ChatGPT <span style="margin-left:auto;font-weight:500;background:#f1f1f1;border-radius:3cqw;padding:.4cqw 1.8cqw">Search</span></div>
  ${q ? `<div style="display:flex;justify-content:flex-end"><div id="${id}q" style="background:#f0f0f0;border-radius:3.6cqw;padding:1.8cqw 3cqw;max-width:86%"><span class="qt">${q}</span></div></div>` : ''}
  ${intro ? `<div id="${id}i" style="margin-top:${q ? 2.6 : 0}cqw;font-weight:600">${intro}</div>` : ''}
  ${items.map((it) => `<div id="${it.id}" style="margin-top:1.6cqw;display:flex;gap:2cqw;align-items:baseline">${it.html}</div>`).join('')}</div>`,
  anim: [`pop('#${id}', ${qIn});`, ...(typeAt != null ? [`tl.fromTo('#${id}q .qt', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(14)' }, ${typeAt});`] : []),
    ...(intro ? [`up('#${id}i', ${introIn}, 18);`] : []), ...items.map((it) => `up('#${it.id}', ${it.in}, 18);`)],
});
// a services page in a browser window: rows [{ id, name, price, in }] or a "Contact us for pricing" button
const site = (id, { top, in: t, url, title, rows = [], contact }) => ({
  html: `<div id="${id}" class="abs blk" style="left:9cqw;right:9cqw;top:${top}cqw;border-radius:2.4cqw;overflow:hidden;background:#fffdf9;box-shadow:0 1.6cqw 4.4cqw rgba(10,25,48,.38)">
  <div style="height:6cqw;background:#ece6dd;display:flex;align-items:center;gap:1.2cqw;padding:0 2.4cqw"><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#ff5f57"></i><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#febc2e"></i><i style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:#28c840"></i><span style="margin-left:2cqw;flex:1;background:#fff;border-radius:2cqw;padding:.5cqw 2cqw;font:500 2.6cqw/1.2 ${UI};color:#555">${url}</span></div>
  <div style="padding:3.4cqw 5cqw 4cqw;font:400 3.8cqw/1.3 ${UI};color:${C.ink}">
    <div style="font:400 7.4cqw/1 'ScrollyInstrument',serif;margin-bottom:2.4cqw">${title}</div>
    ${rows.map((r) => `<div id="${r.id}" style="display:flex;justify-content:space-between;padding:1.5cqw 0;border-bottom:.3cqw solid #e6dfd4"><span>${r.name}</span><b style="font-weight:700">${r.price}</b></div>`).join('')}
    ${contact ? `<div style="position:relative;display:inline-block;margin-top:2.4cqw"><div id="${id}btn" style="background:${C.ink};color:#fff;font:600 3.8cqw ${UI};padding:2cqw 4.4cqw;border-radius:5cqw">${contact}</div></div>` : ''}
  </div></div>`,
  anim: [`pop('#${id}', ${t});`, ...rows.filter((r) => r.in != null).map((r) => `up('#${r.id}', ${r.in}, 14);`)],
});

// the same services page filling the whole frame behind her cut-out (Mercedes 2026-11-05: swap the background for the
// website moments). rows: [{ id, name, price, in }]; contact = the no-price version's button
const fullSite = (id, { in: t, rows = [], contact }) => ({
  html: `<div id="${id}" class="fill" style="background:#fffdf9;font:400 4.2cqw/1.3 ${UI};color:${C.ink}">
  <div style="position:absolute;left:0;right:0;top:0;height:7cqw;background:#ece6dd;display:flex;align-items:center;gap:1.4cqw;padding:0 3cqw"><i style="width:1.8cqw;height:1.8cqw;border-radius:50%;background:#ff5f57"></i><i style="width:1.8cqw;height:1.8cqw;border-radius:50%;background:#febc2e"></i><i style="width:1.8cqw;height:1.8cqw;border-radius:50%;background:#28c840"></i><span style="margin-left:2cqw;flex:1;background:#fff;border-radius:2.4cqw;padding:.6cqw 2.4cqw;font:500 3cqw/1.2 ${UI};color:#555">yourwebsite.com/services</span></div>
  <div style="position:absolute;left:6cqw;right:6cqw;top:13cqw;display:flex;justify-content:space-between;align-items:center;font:600 3.4cqw ${UI};color:#6b6259"><span style="font:400 5cqw 'ScrollyInstrument',serif;color:${C.ink}">Your Business</span><span>Home&nbsp;&nbsp;&nbsp;Services&nbsp;&nbsp;&nbsp;About</span></div>
  <div style="position:absolute;left:6cqw;right:6cqw;top:24cqw">
    <div style="font:400 9cqw/1 'ScrollyInstrument',serif;margin-bottom:2.4cqw">Services</div>
    ${rows.map((r) => `<div id="${r.id}" style="display:flex;justify-content:space-between;padding:2cqw 0;border-bottom:.35cqw solid #e6dfd4"><span>${r.name}</span><b style="font-weight:700;font-size:5cqw">${r.price}</b></div>`).join('')}
    ${contact ? `<div style="display:inline-block;margin-top:3.4cqw;background:${C.ink};color:#fff;font:600 4.4cqw ${UI};padding:2.4cqw 5.4cqw;border-radius:6cqw">${contact}</div>` : ''}
  </div>
  <div style="position:absolute;left:3cqw;width:27cqw;top:78cqw;height:40cqw;border-radius:2cqw;background:${C.mist}"></div>
  <div style="position:absolute;right:3cqw;width:27cqw;top:78cqw;height:40cqw;border-radius:2cqw;background:${C.mist}"></div></div>`,
  anim: [`tl.fromTo('#${id}', { opacity: 0 }, { opacity: 1, duration: 0.18 }, ${t});`, ...rows.filter((r) => r.in != null).map((r) => `up('#${r.id}', ${r.in}, 14);`)],
});

// F1 hook: big words above her head
note(1, 'Hook above her head: “Get leads while you sleep”', 'pop on the swipe, chime on the moon aside');
R.scene(1, [K.fade(50), K.statement('b1', 'Get <m>leads</m> while you sleep', { top: 27, size: 14, in: 0.1, swipe: at('leads') }),
  K.hand('h1', 'zzz…', { x: 72, y: 60, size: 8, r: -8, in: at('sleep') })]);

// F2 AI recommends a business: ChatGPT demo
note(2, 'ChatGPT demo: someone asks for a photographer near them; the question types in', 'pop on the window, typing on the question');
R.scene(2, [K.fade(56), gpt('g2', { top: 27, q: 'Family photographer near me? Prices?', qIn: win(2).s + 0.05, typeAt: win(2).s + 0.3 })]);

// F3 the rule: big words
note(3, '“List your prices” in big words, a ring around prices', 'whoosh on the statement, draw on the ring');
R.scene(3, [K.fade(50), K.statement('b3', 'List your <m>prices</m>', { top: 30, size: 17, in: win(3).s + 0.05, swipe: at('need') })]);

// F4 a services page WITH prices
// background swap (Mercedes 2026-11-05): the page fills the frame behind her cut-out
note(4, 'Background swap: an example services page with prices fills the frame behind her; each price pops in', 'paper slide on the page, list pops (same sound, it’s a list)');
const t4 = win(4).s;
R.scene(4, [fullSite('w4', { in: t4, rows: [
  { id: 'w4a', name: 'Mini session', price: '$250', in: t4 + 0.35 },
  { id: 'w4b', name: 'Full session', price: '$450', in: t4 + 0.75 }] }),
  K.hand('h4', 'EXAMPLE', { x: 50, y: 25, size: 6.5, r: -4, color: C.ink, in: t4 + 0.3 })]);
R.cutout(4, 'assets/cut/f04-cut.webm', 6, 'sketch/f04-cut.png');

// F5 the "contact us for pricing" page, same swap
note(5, 'Background swap: the same page with no prices, only a “Contact us for pricing” button; ring drawn around it', 'pop on the page, draw on the ring');
const t5 = win(5).s;
R.scene(5, [fullSite('w5', { in: t5, rows: [
  { id: 'w5a', name: 'Mini session', price: '' }], contact: 'Contact us for pricing' }),
  K.ring('r5', { x: 2, y: 44, w: 64, h: 18, color: C.peach, in: at('contact') })]);
R.cutout(5, 'assets/cut/f05-cut.webm', 6, 'sketch/f05-cut.png');

// F6 skipped
note(6, 'The no-price page tips away, a red see-through wash comes over the frame, “Skipped” slams in', 'whoosh as it slides off, pop on Skipped');
const t6 = win(6).s;
// the final state is written into the HTML (page gone, red on) so the step 1 picture shows it; the tweens start from the opening state
R.scene(6, [K.fade(50), { html: '<div id="w6o" style="position:absolute;inset:0;transform:translateX(-120%) rotate(-10deg);opacity:.4">', anim: [] }, site('w6', { top: 25, in: t6 - 0.01, url: 'yourwebsite.com/services', title: 'Services', rows: [
  { id: 'w6a', name: 'Mini session', price: '' }], contact: 'Contact us for pricing' }),
  { html: '</div>', anim: [`tl.fromTo('#w6o', { xPercent: 0, x: 0, rotation: 0, opacity: 1 }, { xPercent: -120, rotation: -10, opacity: 0.4, duration: 0.4, ease: 'power3.in' }, ${at('skip') - 0.1});`] },
  // red see-through wash over the whole frame as it's skipped (Mercedes 2026-11-05)
  { html: '<div id="red6" class="fill" style="background:rgba(225,18,38,.52)"></div>', anim: [`tl.fromTo('#red6', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, ${at('skip') + 0.1});`] },
  K.statement('b6', '<m>Skipped</m>', { top: 33, size: 17, in: at('skip') + 0.25, enter: 'slam', swipe: at('skip') + 0.45 })]);

// F7 the sites that list their rates get the answer
note(7, 'ChatGPT answers with the photographers whose prices it could read; each line pops in', 'pop-message on the answer, list pops');
const t7 = win(7).s;
R.scene(7, [K.fade(62), gpt('g7', { top: 27, qIn: t7, intro: 'I’d recommend these photographers near you:', introIn: at('websites'),
  items: [
    { id: 'g7a', html: `<b style="font-weight:700">1.</b><span>Mini session from <b style="font-weight:700">$250</b> <span style="font-size:2.8cqw;color:#666;background:#f1f1f1;border-radius:2cqw;padding:.2cqw 1.4cqw">yourwebsite.com</span></span>`, in: at('actually') },
    { id: 'g7b', html: `<b style="font-weight:700">2.</b><span>Full session <b style="font-weight:700">$400</b> <span style="font-size:2.8cqw;color:#666;background:#f1f1f1;border-radius:2cqw;padding:.2cqw 1.4cqw">another site</span></span>`, in: at('rates') }] })]);

// F8 her CTA, live as she says it
// a ribbon banner with a bookmark that fills (Mercedes 2026-11-05: "a cute save banner"; the small handwritten line was
// too hard to read, so the words sit big on the ribbon)
note(8, '“Save this” + a sky-blue ribbon banner with a bookmark that fills: “for your next website update”', 'pop on the word, check on the banner');
const t8 = win(8).s;
const banner = { html: `<div id="rb8" class="abs blk" style="left:4cqw;right:4cqw;top:47cqw;height:15cqw;rotate:-3deg">
  <svg viewBox="0 0 100 15" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 1cqw 1.6cqw rgba(10,25,48,.35))">
    <polygon points="0,3 9,3 9,15 0,15 3,9" fill="#2f7fd6"/><polygon points="100,3 91,3 91,15 100,15 97,9" fill="#2f7fd6"/>
    <polygon points="5,0 95,0 95,12 5,12" fill="${C.peach}"/><polygon points="5,12 9,12 9,15" fill="#1d5aa0"/><polygon points="95,12 91,12 91,15" fill="#1d5aa0"/></svg>
  <div style="position:absolute;left:5%;right:5%;top:0;height:80%;display:flex;align-items:center;justify-content:center;gap:2.4cqw;font:800 5cqw/1 'ScrollyFigtree',sans-serif;color:${C.ink};white-space:nowrap">
    <svg viewBox="0 0 24 24" style="width:6.4cqw;height:6.4cqw;flex:none"><path id="bm8" d="M19 21 12 15.5 5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z" fill="rgba(10,25,48,0)" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/></svg>
    <span>for your next website update</span></div></div>`,
  anim: [`tl.fromTo('#rb8', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' }, ${t8 + 0.5});`,
    `tl.to('#bm8', { fill: '${C.ink}', duration: 0.2 }, ${t8 + 0.95});`] };
R.scene(8, [K.fade(46), K.statement('b8', '<m>Save</m> this', { top: 27, size: 17, in: t8 + 0.02, swipe: t8 + 0.35 }), banner]);
R.endCard({ kind: 'save', detail: 'for your next website update' }, { live: true });

R.cam.alternate();
R.cam.punch(at('skip'));
R.cam.punch(at('save this'));

R.captions({ hide: [8], top: () => 150 }); // below her chin (Mercedes 2026-10-30)

// ---- sound (never the same effect twice in a row; list items may share one) ----
const fx = R.fx.bind(R);
fx('fx-pop1', 'pop-light', at('leads'));
fx('fx-chime1', 'chime', at('sleep'), 0.4);
fx('fx-pop2', 'pop-bubble', win(2).s + 0.05);
fx('fx-wh3', 'whoosh-air', win(3).s + 0.05, 0.4);
fx('fx-pap4', 'paper-slide', t4, 0.5);
R.fxList('fx-row4', 'pop-light', [t4 + 0.35, t4 + 0.75], 0.5);
fx('fx-pop5', 'pop-bubble', t5 + 0.05);
fx('fx-wh6', 'whoosh-fast', at('skip'), 0.5);
fx('fx-pop6', 'pop-light', at('skip') + 0.25);
fx('fx-msg7', 'pop-message', at('websites'));
R.fxList('fx-row7', 'pop-bubble', [at('actually'), at('rates')], 0.5);
fx('fx-pop8', 'pop-light', t8 + 0.35);
fx('fx-chk8', 'check', t8 + 0.95, 0.5);
fx('fx-wh8', 'whoosh-air', t8 + 0.5, 0.35);
R.music('assets/music/music-a.mp3');

// cover options (the viewer's problem in their words); <m> = marker swipe
const COVERS = [
  { text: 'Why AI won’t <m>recommend</m> your business' },
  { text: '“Contact us for pricing” is <m>costing you</m>', aside: 'AI moves on' },
  { text: 'Want ChatGPT to <m>recommend you</m>?', aside: 'list your prices' },
  { text: 'Get <m>leads while you sleep</m> with AI search' },
  { text: 'The one website fix for <m>AI search</m>' },
];
// caption: only what research.md supports; the CTA line is inserted by the build from the Ending pick
const POST = {
  caption: `When someone asks ChatGPT what a service costs near them, it can only answer with prices it can read. A page that says "contact us for pricing" gives it nothing to quote.

A 2026 study of about 2 million AI citations across ChatGPT, Claude, Google AI and Gemini found pricing pages get cited more often than most other kinds of pages. So put your real prices, or at least a "starting at" price, on your services page.`,
  hashtags: '#smallbusinessmarketing #aisearch #websitetips',
};
if (process.argv[2] === 'frames') { console.log(JSON.stringify(R.F)); process.exit(0); }
const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
if (process.argv[2] === 'review') {
  R.write('review/stage.html', { stage: { video: PROXY, stills } });
  await reviewExport(R, { notes: NOTES, title: 'List your prices on your website', covers: COVERS, coverCut: 'sketch/f01-cut.png', stills, post: POST });
}
else R.write();
