// Reel engine core: turns a Reel's declarations (frames, scenes of components, sounds) into one HyperFrames
// index.html with one paused GSAP timeline. A Reel's build.mjs only says WHAT happens WHEN; layout CSS, motion
// helpers, footage segments, captions and audio wiring live here.
//
//   const R = reel({ brand, template });          // reads assets/words.json from the Reel folder (cwd)
//   R.frames([0, 3.4, R.at('and funny'), …]);     // frame windows from the storyboard; R.win(n) = { s, d }
//   R.scene(1, [K.fade(48), K.statement(…)]);    // components from lib/components.mjs (R.K)
//   R.cutout(4, 'assets/cut/f04-cut.webm');       // the speaker, background removed, over that frame's panel
//   R.cam.alternate(); R.cam.punch(t); R.cam.whip(t);
//   R.fx('fx-pop1', 'pop-light', t); R.music('assets/music/music-a.mp3');
//   R.captions({ hide: [4, 9], top: (t) => 128 });
//   R.write();                                    // → index.html
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeComponents, componentCss } from './components.mjs';
import { BRANDS, defaultBrand } from './brand/index.mjs';
import studio from './templates/studio.mjs';

const LIB_SFX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets/sfx');
// Review stage runtime: only clips whose window holds t are visible; the GSAP timeline is posed at t.
const STAGE_JS = `const clips = [...document.querySelectorAll('.clip')], vids = [...document.querySelectorAll('video.clip')];
let playing = false;
window.stage = {
  dur: tl.duration(),
  seek(t) {
    for (const c of clips) { const s = +c.dataset.start; c.style.visibility = t >= s && t < s + +c.dataset.duration ? 'visible' : 'hidden'; }
    tl.seek(t, false);
    for (const v of vids) {
      const s = +v.dataset.start, on = t >= s && t < s + +v.dataset.duration, lt = Math.max(0, t - s);
      if (!playing || Math.abs(v.currentTime - lt) > 0.25) v.currentTime = lt;
      if (playing && on) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause();
    }
  },
  play() { playing = true; },
  pause() { playing = false; vids.forEach((v) => v.pause()); },
  rate(r) { vids.forEach((v) => (v.playbackRate = r)); },
  look(filter) { document.querySelectorAll('.talk, .cutvid').forEach((el) => (el.style.filter = filter)); },
};
if (location.hash === '#plain') { document.querySelectorAll('.talk, .cutvid').forEach((el) => el.remove()); document.body.style.background = '#4a403a'; document.querySelector('#root').style.background = '#4a403a'; }
window.stage.seek(0);`;
// filter + lighting from the review page: { brightness, contrast, saturate, warmth } (1 = as filmed; warmth 0..1)
export const lookFilter = (L = {}) => `brightness(${L.brightness ?? 1}) contrast(${L.contrast ?? 1}) saturate(${L.saturate ?? 1}) sepia(${((L.warmth ?? 0) * 0.35).toFixed(3)})`;
const capFonts = (B) => ({ body: `'${B.font.body}'`, statement: `'${B.font.statement}'`, hand: `'${B.font.hand}'` });
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, '');

export function reel({ brand, template = studio, words = 'assets/words.json', out = 'index.html' } = {}) {
  // review-page choices (review/decisions.json); the env override lets Claude test without touching the real file
  const DEC = process.env.REEL_DECISIONS || 'review/decisions.json';
  const D = existsSync(DEC) ? JSON.parse(readFileSync(DEC, 'utf8')) : {};
  const T = template, B = brand || BRANDS[D.brand] || defaultBrand(); // brand kit picked in step 1 (default: reel-settings.json)
  const P = JSON.parse(readFileSync(words, 'utf8'));
  const W = P.words, DUR = +P.duration.toFixed(2);
  const K = makeComponents(B);
  const scenes = [], cuts = [], sfx = [], camJs = [], animJs = [], rawJs = [];
  let capRender = () => null;
  let F = [0, DUR], music = '', capHtml = '', capList = [], capHide = [];
  const byFrame = {}, cutStill = {}, cutMeta = []; // for the storyboard sheet
  const sfxData = [], sfxOff = []; let musicData = null; // for the animatic mix (+ switched-off sounds, for the review page)
  // sound changes made on the review page (review/decisions.json): { sound: { <fx id>: { off, name, vol } }, music: { volume } }
  // caption edits from step 1: { <caption #>: { text, style: 'big' | 'hide', mark: [word #] } }, captionFont: 'body' | 'statement' | 'hand'
  const capEdits = D.captions || {}, capFont = D.captionFont;
  const soundEdits = D.sound || {}, musicEdit = D.music || {}, transEdits = D.transitions || {}, look = D.look;
  let addedDone = false;
  const camEvents = []; // whips and punch-ins, so the review page can swap transitions

  // start time of the first word of `phrase` at/after `after` seconds
  const at = (phrase, after = 0) => {
    const t = phrase.split(' ').map(norm);
    for (let i = 0; i < W.length; i++) if (W[i].s >= after && t.every((x, k) => W[i + k] && norm(W[i + k].w).startsWith(x))) return +W[i].s.toFixed(2);
    throw new Error(`phrase not found: ${phrase}`);
  };
  const win = (n) => ({ s: F[n - 1], d: +(F[n] - F[n - 1]).toFixed(2) });

  const capCss = () => {
    const big = Object.values(capEdits).some((e) => e.style === 'big'), font = capFont && capFonts(B)[capFont], marked = Object.values(capEdits).some((e) => e.mark?.length);
    return (marked ? `.cap .mk{display:inline-block;padding:0 .12em}.cap .mkbg{display:block;position:absolute;left:-.04em;right:-.04em;top:.12em;bottom:.04em;background:${B.C.peach};text-shadow:none}.cap .mkt{position:relative;color:${B.C.ink};text-shadow:none}
` : '') + (big ? `.cap.big span{font:800 10.5cqw/.95 '${B.font.statement}';font-stretch:78%}\n` : '') + (font ? `.cap span{font-family:${font}}${capFont === 'statement' ? '.cap span{font-stretch:80%}' : ''}${capFont === 'hand' ? '.cap span{font-weight:400;font-size:7cqw}' : ''}\n` : '');
  };
  const R = {
    W, DUR, P, K, C: B.C, B, T, at, win,
    frames(list) { F = [...list, ...(list.at(-1) === DUR ? [] : [DUR])]; return F; },
    get F() { return F; },
    // layer '' = main scene (track 2, z 5); layer 'b' = a second layer above cut-outs (track 3, z 7)
    scene(n, parts, { z, layer = '' } = {}) {
      const w = win(n);
      (byFrame[n] ||= []).push({ layer, html: parts.map((p) => p.html).join('') });
      scenes.push(`<div id="s${n}${layer}" class="clip scene" data-start="${w.s}" data-duration="${w.d}" data-track-index="${2 + (layer ? 1 : 0)}" style="z-index:${z ?? (layer ? 7 : 5)}">${parts.map((p) => p.html).join('')}</div>`);
      for (const p of parts) animJs.push(...p.anim);
    },
    // still = a background-removed PNG of the frame, used only on the storyboard sheet
    cutout(n, file, z = 6, still) {
      const w = win(n);
      if (still) cutStill[n] = still;
      cutMeta.push({ n, z, still, file });
      cuts.push(`<video id="cut${n}" class="clip cutvid" src="${file}" muted playsinline data-start="${w.s}" data-duration="${w.d}" data-track-index="4" style="z-index:${z}"></video>`);
    },
    cam: {
      set: (t, scale) => camJs.push(`tl.set('#cam', { scale: ${scale} }, ${t});`),
      // alternate framing at every jump cut from prep (1.00 / camAlt)
      alternate: (cutTimes = P.cuts, scale = T.camAlt) => cutTimes.forEach((t, i) => R.cam.set(t, i % 2 ? scale : 1)),
      punch: (t, scale = T.punch, d = 0.45) => camEvents.push({ type: 'zoom', t: +t, idx: [camJs.length] }) && camJs.push(`tl.fromTo('#cam', { scale: 1.0 }, { scale: ${scale}, duration: ${d}, ease: E, immediateRender: false }, ${t});`),
      // motion-blur whip handoff landing at t
      whip: (t) => camEvents.push({ type: 'whip', t: +t, idx: [camJs.length, camJs.length + 1] }) && camJs.push(
        `tl.fromTo('#cam', { x: 0, filter: 'blur(0px)' }, { x: -90, filter: 'blur(14px)', duration: 0.12, ease: 'power2.in', immediateRender: false }, ${t} - 0.12);`,
        `tl.fromTo('#cam', { x: 90, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out', immediateRender: false }, ${t});`),
    },
    // sound effect at its real length; lanes rotate 12..15
    fx(id, file, t, vol = 0.6, d) {
      const ed = soundEdits[id] || {}, baseVol = vol, base = file;
      if (ed.off) { sfxOff.push({ id, name: file, base, t: +t, vol, baseVol, d: d ?? T.sfxLen[file], off: true }); return; }
      if (ed.name && ed.name !== file) { file = ed.name; d = T.sfxLen[file] ?? d; }
      if (!existsSync(`assets/sfx/${file}.mp3`) && existsSync(path.join(LIB_SFX, `${file}.mp3`))) copyFileSync(path.join(LIB_SFX, `${file}.mp3`), `assets/sfx/${file}.mp3`);
      // a sound that isn't downloaded yet stays silent (the Reel still builds and renders); sounds.md lists the files
      if (!existsSync(`assets/sfx/${file}.mp3`)) { console.log(`sound off: assets/sfx/${file}.mp3 not found (${id})`); sfxOff.push({ id, name: file, base, t: +t, vol, baseVol, d: d ?? T.sfxLen[file], off: true, missing: true }); return; }
      if (ed.vol != null) vol = ed.vol;
      sfxData.push({ id, name: file, base, file: `assets/sfx/${file}.mp3`, t: +t, vol, baseVol, d: d ?? T.sfxLen[file] });
      sfx.push(`<audio id="${id}" src="assets/sfx/${file}.mp3" data-start="${(+t).toFixed(2)}" data-duration="${d ?? T.sfxLen[file]}" data-track-index="${12 + (sfx.length % 4)}" data-volume="${vol}"></audio>`);
    },
    music(file, { volume = T.music.volume, fadeIn = T.music.fadeIn, fadeOut = T.music.fadeOut } = {}) {
      const baseVolume = volume, baseFile = file;
      if (musicEdit.file && existsSync(musicEdit.file)) file = musicEdit.file;
      if (musicEdit.volume != null) volume = musicEdit.volume;
      musicData = { file, baseFile, volume, baseVolume, fadeIn, fadeOut };
      music = `<audio id="music-a" src="${file}" data-start="0" data-duration="${DUR}" data-track-index="10" data-volume="${volume}" data-fade-in="${fadeIn}" data-fade-out="${fadeOut}"></audio>`;
    },
    // relaxed lower-third captions; hide = frame numbers that carry their own type
    captions({ hide = [], top = () => T.captions.top, maxWords = T.captions.maxWords, gap = T.captions.gap } = {}) {
      const noCap = hide.map(win).map((w) => [w.s, w.s + w.d]);
      const caps = [];
      let cur = [];
      const flush = () => { if (!cur.length) return; const s = cur[0].s, e = cur.at(-1).e; caps.push({ s, e, t: cur.map((w) => w.w).join(' ').replace(/\s+([.,?!])/g, '$1').replace(/[.,]$/, '') }); cur = []; };
      for (const w of W) {
        if (noCap.some(([a, b]) => w.s >= a - 0.05 && w.s < b)) { flush(); continue; }
        if (cur.length && (w.seg !== cur.at(-1).seg || w.s - cur.at(-1).e > gap || F.some((f) => f > cur[0].s && f <= w.s))) flush();
        cur.push(w);
        if (cur.length >= maxWords || /[.,?!]$/.test(w.w)) flush();
      }
      flush();
      capList = caps; capHide = hide;
      capRender = (i) => {
        const c = caps[i], ed = capEdits[i] || {};
        if (ed.style === 'hide') return null;
        const words = (ed.text ?? c.t).split(/\s+/).filter(Boolean), mark = new Set(ed.mark || []);
        const inner = ed.text == null && !mark.size ? c.t : words.map((w, k) => (mark.has(k) ? `<span class="mk"><span class="mkbg"></span><span class="mkt">${w}</span></span>` : w)).join(' ');
        return { cls: 'clip cap' + (ed.style === 'big' ? ' big' : ''), inner };
      };
      capHtml = caps.map((c, i) => { const r = capRender(i); if (!r) return null; const d = Math.max(0.3, Math.min((caps[i + 1]?.s ?? c.e + 0.6) - c.s - 0.02, Math.max(0.6, c.e - c.s + 0.5))); return `<div id="cap${i}" class="${r.cls}" data-start="${c.s.toFixed(2)}" data-duration="${d.toFixed(2)}" data-track-index="6" style="top:${top(c.s)}cqw"><span>${r.inner}</span></div>`; }).filter((x) => x != null).join('\n');
      return caps;
    },
    js(code) { rawJs.push(code); },
    get sfxData() { return sfxData; },
    get sfxOff() { return sfxOff; },
    get musicData() { return musicData; },
    get captionList() { return capList.map((c, i) => ({ i, s: c.s, e: c.e, t: c.t })); },
    get look() { return look; },
    // beat-to-beat transitions (frame 2 onward): what build.mjs planned and what the reviewer chose, for the review page
    get transitions() { return F.slice(1, -1).map((t, i) => ({ frame: i + 2, t: +t, planned: camEvents.find((e) => Math.abs(e.t - t) < 0.06)?.type || 'cut', chosen: transEdits['F' + (i + 2)] })); },
    // Storyboard sheet: each frame drawn with the SAME components over a real still of the take, in its final
    // (end-of-entrance) state. stills(n) → image path; notes[n] = { title, sound } (text under each frame).
    // full: one 1080px-wide frame per row with id=f<k>, no notes (the animatic screenshots these)
    storyboard(file, { stills, notes = {}, title = '', version = 'v1', full = false } = {}) {
      const n = F.length - 1;
      const cells = Array.from({ length: n }, (_, i) => {
        const k = i + 1, w = win(k), note = notes[k] || {};
        const layers = byFrame[k] || [];
        const main = layers.filter((l) => !l.layer).map((l) => l.html).join(''), top = layers.filter((l) => l.layer).map((l) => l.html).join('');
        const ci = capHide.includes(k) ? -1 : capList.findIndex((c) => c.s >= w.s && c.s < w.s + w.d), cr = ci >= 0 ? capRender(ci) : null, cap = cr && capList[ci];
        const said = W.filter((x) => x.s >= w.s && x.s < w.s + w.d).map((x) => x.w).join(' ');
        return `<figure class="cell"><div class="frame" id="f${k}"><img class="bg" src="${stills(k)}"><div class="scene">${main}</div>${cutStill[k] ? `<img class="bg" src="${cutStill[k]}">` : ''}<div class="scene">${top}</div>${cap ? `<div class="${cr.cls.replace('clip ', '')}" style="top:${T.captions.top}cqw"><span>${cr.inner}</span></div>` : ''}</div>
<figcaption><b>F${k}</b> <span class="t">${w.s.toFixed(1)}–${(w.s + w.d).toFixed(1)}s</span>${note.title ? ` ${note.title}` : ''}<br><i>“${said}”</i>${note.sound ? `<br><span class="snd">♪ ${note.sound}</span>` : ''}</figcaption></figure>`;
      }).join('\n');
      writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} storyboard ${version}</title>
<style>
${B.fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
body{background:${B.C.cream};color:${B.C.ink};font:15px/1.4 '${B.font.body}',sans-serif;padding:24px 16px}
h1{font:800 26px '${B.font.statement}';font-stretch:78%;margin-bottom:4px}.sub{margin-bottom:20px;color:#5c534d}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:22px 16px}
.frame{position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;container-type:inline-size;border-radius:10px;background:#000;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.frame .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scene{position:absolute;inset:0}
.abs{position:absolute}.blk{display:block}.fill,.fade{position:absolute;inset:0}
${componentCss(B)}
${capCss()}.draw{stroke-dashoffset:0}
${full ? 'body{padding:0;background:#000}h1,.sub,figcaption{display:none}.grid{display:block}.frame{width:1080px;border-radius:0;box-shadow:none}' : ''}
figcaption{margin-top:8px;font-size:15px}figcaption .t{color:#7a6f68}figcaption i{color:#4a423d}.snd{color:${B.C.orange}}
</style></head><body><h1>${title}</h1><p class="sub">Storyboard ${version}: real stills from the take, graphics drawn with the Reel's own components (final positions). Captions shown are the relaxed lower-third ones.</p><div class="grid">
${cells}
</div></body></html>`);
      console.log(`${file}: ${n} frames`);
    },
    // stage = { stills: (n) => image path }: the review stage (no video). A still per frame instead of the take, cut-outs
    // as PNGs, no audio (the review page plays voice + sounds itself), paths relative to the Reel root via <base>, and
    // window.stage.seek(t) to show the right clips and pose the timeline at any moment. Written to review/stage.html.
    write(file = out, { stage } = {}) {
      // sounds added on the review page ({ id, name, t, vol }), once per build
      if (!addedDone) { addedDone = true; for (const a of D.addedSfx || []) R.fx(a.id, a.name, a.t, a.vol ?? 0.6); }
      // a different look for single moments (the review page previews these live, so only the real build sets them)
      const lookJs = () => {
        const by = D.lookByFrame || {};
        if (stage || !Object.keys(by).length) return '';
        return '\n' + F.slice(0, -1).map((t, i) => `tl.set('.talk, .cutvid', { filter: '${lookFilter(by[i + 1] !== undefined ? by[i + 1] || {} : look || {})}' }, ${t});`).join('\n');
      };
      // transitions chosen on the review page replace what build.mjs planned at that beat
      const camOut = () => {
        const lines = [...camJs], extra = [];
        for (const [key, type] of Object.entries(transEdits)) {
          const t = F[+key.slice(1) - 1]; if (t == null) continue;
          for (const e of camEvents) if (Math.abs(e.t - t) < 0.06) e.idx.forEach((i) => (lines[i] = null));
          if (type === 'whip') extra.push(`tl.fromTo('#cam', { x: 0, filter: 'blur(0px)' }, { x: -90, filter: 'blur(14px)', duration: 0.12, ease: 'power2.in', immediateRender: false }, ${t} - 0.12);`, `tl.fromTo('#cam', { x: 90, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out', immediateRender: false }, ${t});`);
          if (type === 'zoom') extra.push(`tl.fromTo('#cam', { scale: 1.0 }, { scale: ${T.punch}, duration: 0.45, ease: E, immediateRender: false }, ${t});`);
        }
        return [...lines.filter((l) => l != null), ...extra];
      };
      // the take as muted segments (assets/talk-seg/talk-<i>.mp4, made by lib/prep-footage.mjs) + one voice track
      const SEG = T.segment;
      const talk = stage?.video ? `<video id="talkv" class="clip talk" src="${stage.video}" muted playsinline preload="auto" data-start="0" data-duration="${DUR}"></video>`
        : stage ? F.slice(0, -1).map((s, i) => `<img class="clip talk" src="${stage.stills(i + 1)}" data-start="${s}" data-duration="${+(F[i + 1] - s).toFixed(3)}">`).join('') : Array.from({ length: Math.ceil(DUR / SEG) }, (_, i) => {
        const st = i * SEG, d = Math.min(SEG, DUR - st);
        return `<video id="talk-${i}" class="clip talk" src="assets/talk-seg/talk-${i}.mp4" muted playsinline data-start="${st}" data-duration="${+d.toFixed(3)}" data-track-index="${i % 2}"></video>`;
      }).join('');
      const js = `
const tl = gsap.timeline({ paused: true });
const E = 'power3.out', B = 'back.out(1.6)';
const pop = (s, t, r = 0) => tl.fromTo(s, { scale: 0, rotation: r - 8, opacity: 0 }, { scale: 1, rotation: r, opacity: 1, duration: 0.45, ease: B }, t);
const up = (s, t, y = 30) => tl.fromTo(s, { y, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: E }, t);
const draw = (s, t, d = 0.45) => tl.fromTo(s + ' .draw, ' + s + '.draw', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, t);
const swipe = (s, t) => tl.fromTo(s + ' .mkbg', { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, t);
const words = (s, t) => tl.fromTo(s + ' .w', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: E, stagger: 0.06 }, t);
const typeLines = (s, t0, gap) => document.querySelectorAll(s + ' .ln').forEach((el, i) => {
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t0 + i * gap);
  tl.fromTo(el.querySelector('.lt'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: Math.max(0.2, gap * 0.8), ease: 'steps(18)' }, t0 + i * gap);
});
${camOut().join('\n')}${lookJs()}
${animJs.join('\n')}
${rawJs.join('\n')}
document.querySelectorAll('.cap span').forEach((el) => { const t = +el.parentElement.dataset.start; tl.fromTo(el, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: E }, t); });
${stage ? STAGE_JS : "window.__timelines['main'] = tl;"}
`;
      const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080, height=1920">
${stage ? '<base href="../">\n' : ''}<script src="assets/js/gsap.min.js"></script>
<style>
${B.fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:100%;height:100%;overflow:hidden;container-type:inline-size;font-family:'${B.font.body}',sans-serif}
#cam{position:absolute;inset:0;transform-origin:${T.camOrigin}}
.talk{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scene{position:absolute;inset:0}
.cutvid{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
.abs{position:absolute}.blk{display:block}
.fill,.fade{position:absolute;inset:0}
${componentCss(B)}
${look ? `.talk,.cutvid{filter:${lookFilter(look)}}
` : ''}${capCss()}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
<div id="cam">${talk}</div>
${stage ? '' : `<audio id="voice" src="assets/talk-audio.m4a" data-start="0" data-duration="${DUR}" data-track-index="9" data-volume="1"></audio>\n`}${scenes.join('\n')}
${stage ? cutMeta.map((c, k) => (existsSync(c.file) ? cuts[k].replace('<video ', '<video preload="auto" ') : c.still ? `<img class="clip cutvid" src="${c.still}" data-start="${win(c.n).s}" data-duration="${win(c.n).d}" style="z-index:${c.z}">` : '')).join('\n') : cuts.join('\n')}
${capHtml}
${stage ? '' : `${sfx.join('\n')}\n${music}`}
</div>
<script>${js}</script>
</body>
</html>`;
      writeFileSync(file, html);
      console.log(`${file}: ${DUR}s, ${scenes.length} scene layers, ${capHtml ? capHtml.split('\n').length : 0} captions, ${sfx.length} sfx`);
    },
  };
  return R;
}
