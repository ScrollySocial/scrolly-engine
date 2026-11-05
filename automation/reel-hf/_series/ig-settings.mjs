// "Instagram settings" series (planner cards "Instagram settings 1 to 8"): the look Mercedes approved on card 1
// (2026-11-05-igs-account-status, v7): her hook take with the hook in big bold capitals under her chin and a punch-in,
// then her real screen recording (joined by the Reel's screen.mjs) with a path pill, zooms and hand-drawn rings,
// then a faceless "SAVE THIS" outro with the Saved toast tilted across the middle. No music, no captions.
// A Reel's build.mjs only passes the config below. Times on the screen are { part, dt }: part = index into
// screen.json parts, dt = seconds after that part starts on the Reel's timeline.
//
//   igsReel({ title, hook: { a, b, c, top, size, sizeA, swipe, punch }, frames: [{ part, … }], shots: {…}, covers, post })
import { readFileSync } from 'node:fs';
import { reel } from '../lib/reel.mjs';
import { reviewExport, PROXY } from '../lib/review/export.mjs';

export async function igsReel(cfg) {
  const R = reel();
  const { K, C, at } = R;
  const SCR = R.P.screenAt;
  // where each screen.json part starts on the timeline
  const S = JSON.parse(readFileSync('screen.json', 'utf8'));
  const starts = []; let t = SCR;
  for (const p of S.parts) { starts.push(+t.toFixed(3)); t += (p.out - p.in) / (p.speed || 1) + (p.hold || 0); }
  const T = ({ part, dt = 0 }) => +(starts[part] + dt).toFixed(2);
  const OUT = +(R.DUR - 2).toFixed(2); // the outro: the last 2 s (the last part's hold covers it)

  for (const x of cfg.fixWords || []) x(R.W);
  const screenFrames = cfg.frames.map(T);
  R.frames([0, SCR, ...screenFrames.slice(1), OUT]);
  const NOTES = {};
  const note = (n, title, sound) => (NOTES[n] = { title, sound });

  const UI = "'Segoe UI','ScrollyFigtree',sans-serif";
  const BURGER = '<svg viewBox="0 0 24 24" style="width:4.2cqw;height:4.2cqw;vertical-align:-.9cqw"><path d="M4 6h16M4 12h16M4 18h16" stroke="#0a1930" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const pill = (id, html, { top, in: t0 }) => ({
    html: `<div id="${id}" class="abs blk" style="left:5cqw;right:5cqw;top:${top}cqw;text-align:center"><span style="display:inline-block;background:#fff;color:${C.ink};font:600 4.3cqw/1.3 ${UI};padding:1.8cqw 3.6cqw;border-radius:5cqw;box-shadow:0 1cqw 3.4cqw rgba(10,25,48,.32)">${html}</span></div>`,
    anim: [`pop('#${id}', ${t0});`],
  });

  // F1 hook: big bold capitals just under her chin (Mercedes 2026-11-05: center, big, bold)
  const H = cfg.hook, HOOK = "font:900 15.5cqw/.92 'ScrollyFigtree',sans-serif;letter-spacing:-.02em;text-transform:uppercase";
  note(1, `Hook in big bold letters mid-screen: “${[H.a, H.b, H.c].join(' ').toUpperCase()}”; zoom in on “${H.punch}”`, 'pop on each line, zoom on the punch-in');
  R.scene(1, [{
    html: `<div id="hk1" class="abs blk" style="left:3cqw;right:3cqw;top:${H.top}cqw;text-align:center;color:#fff;${HOOK};font-size:${H.size ?? 15.5}cqw;text-shadow:0 .5cqw 2.4cqw rgba(0,0,0,.55)">
  <div id="hk1a" style="font-size:${H.sizeA ?? 10.5}cqw">${H.a}</div>
  <div id="hk1b" style="margin-top:1.4cqw"><span class="mk" style="padding:0 .1em"><span class="mkbg"></span><span class="mkt">${H.b}</span></span></div>
  <div id="hk1c" style="margin-top:.6cqw">${H.c}</div></div>`,
    anim: ["up('#hk1a', 0.05, 30);", "pop('#hk1b', 0.3);", "up('#hk1c', 0.5, 30);", `swipe('#hk1', ${at(H.swipe)});`],
  }]);

  // screen frames: F2 = the Settings and activity list (path pill), then one frame per page. Per frame:
  // rings [{ x, y, w, h, at }], zoom { at, scale, origin, d } (screen + rings move together, the pill doesn't),
  // tap { at } (click sound), note
  const fx = R.fx.bind(R);
  const ringFx = ['swoosh-in', 'check'];
  let ri = 0;
  cfg.frames.forEach((f, i) => {
    const n = i + 2, sid = `#s${n}`;
    note(n, f.note, f.sound || 'draw on the ring');
    const rings = (f.rings || []).map((r, k) => K.ring(`r${n}${k}`, { x: r.x, y: r.y, w: r.w, h: r.h, color: C.peach, in: T(r.at) }));
    if (rings.length) R.scene(n, rings);
    if (i === 0) R.scene(n, [pill(`p${n}`, `Profile &gt; ${BURGER} &gt; Settings and activity`, { top: 19, in: SCR + 0.1 })], { layer: 'b' });
    if (f.zoom) R.js(`tl.fromTo(['#cam', '${sid}'], { scale: 1, transformOrigin: '${f.zoom.origin}' }, { scale: ${f.zoom.scale}, duration: ${f.zoom.d ?? 0.5}, ease: '${f.zoom.ease || 'power2.inOut'}', immediateRender: false }, ${T(f.zoom.at)});`);
    // each frame starts unzoomed (a page change is a cut)
    if (i > 0) R.js(`tl.set(['#cam'], { scale: 1, transformOrigin: '50% 42%' }, ${screenFrames[i]});`);
    for (const r of f.rings || []) { fx(`fx-r${n}${ri}`, ringFx[ri % 2], T(r.at), 0.45); ri++; }
    if (f.tap) fx(`fx-tap${n}`, 'mouse-click', T(f.tap), 0.5);
  });

  // outro, no face (Mercedes 2026-11-05): the held screen under a blue-mist wash, SAVE THIS, the Saved toast tilted
  const nOut = cfg.frames.length + 2;
  note(nOut, 'Outro, no face: blue-mist wash over the screen, “SAVE THIS” big and bold, the Saved toast big and diagonal across the middle', 'whoosh in, check on the toast');
  R.scene(nOut, [{ html: `<div id="wash${nOut}" class="fill" style="background:${C.mist};opacity:.9"></div>`, anim: [`tl.fromTo('#wash${nOut}', { opacity: 0 }, { opacity: 0.9, duration: 0.25 }, ${OUT});`] },
    { html: `<div id="sv${nOut}" class="abs blk" style="left:3cqw;right:3cqw;top:44cqw;text-align:center;color:${C.ink};${HOOK};font-size:21cqw">Save <span class="mk" style="padding:0 .1em"><span class="mkbg"></span><span class="mkt">this</span></span></div>`,
      anim: [`pop('#sv${nOut}', ${OUT + 0.1});`, `swipe('#sv${nOut}', ${OUT + 0.45});`] },
    { html: '<div class="abs blk" style="left:0;right:0;top:100cqw;height:20cqw;transform:rotate(-9deg) scale(1.25);transform-origin:50% 0">', anim: [] },
    K.ctaUi(`ui${nOut}`, 'save', { top: 0, handle: R.B.handle || '', name: R.B.label || '', in: OUT + 0.6 }),
    { html: '</div>', anim: [] }]);
  R.endCard({ kind: 'comment', word: 'MATH', detail: 'and I’ll send you my $1K Math calculator' }, { live: true }); // the caption line

  R.cam.alternate(R.P.cuts.filter((c) => c < SCR));
  R.cam.punch(at(H.punch), 1.12);
  R.cam.set(SCR, 1);
  R.cam.whip(SCR);
  R.cam.set(OUT, 1);
  R.captions({ hide: Array.from({ length: nOut }, (_, i) => i + 1), top: () => 150 });

  fx('fx-pop1', 'pop-light', 0.3);
  fx('fx-zm1', 'zoom-in', at(H.punch) - 0.05, 0.4);
  fx('fx-wh2', 'whoosh-fast', SCR - 0.12, 0.45);
  fx('fx-pop2', 'pop-bubble', SCR + 0.1, 0.5);
  fx('fx-whO', 'whoosh-air', OUT, 0.4);
  fx('fx-popO', 'pop-light', OUT + 0.15, 0.5);
  fx('fx-chkO', 'check', OUT + 0.7, 0.5);
  // no music (Mercedes 2026-11-05: "please don't add music")

  if (process.argv[2] === 'frames') { console.log(JSON.stringify(R.F)); process.exit(0); }
  const stills = (n) => `sketch/f${String(n).padStart(2, '0')}.jpg`;
  if (process.argv[2] === 'review') {
    R.write('review/stage.html', { stage: { video: PROXY, stills } });
    await reviewExport(R, { notes: NOTES, title: cfg.title, covers: cfg.covers, coverCut: 'sketch/f01-cut.png', stills, post: cfg.post });
  } else R.write();
  return R;
}
