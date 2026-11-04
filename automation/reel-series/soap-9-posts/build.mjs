// "1 photo of soap, 9 posts": every post is made from ONE photo of her sunset soap bar (soap.webp, from her old soap
// business). Reel 1 (option A, her pick 2026-11-04), 7 seconds:
//   A shower clip + hook > B UPGRADE YOUR SHOWER with a pastel sunset playing inside the letters > C push into the sun on
//   the soap > D that sun becomes a real sun (zoom out of a sunset clip) > E pastel sunset flashes > F the whole bar.
//   node build.mjs reel1        renders <exports>/soap-9-posts/reel-1.mp4 (reel2..reel5 the same way)
// Clips: clips/<pexels id>.mp4 (gitignored, Pexels License, credits in credits.json).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(HERE, 'clips');
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const SFX = path.join(HERE, '../../reel-hf/lib/assets/sfx');
const SOAP = path.join(HERE, 'soap.webp');
const W = 1080, H = 1920, FPS = 30;
const clip = (id) => path.join(CLIPS, `${id}.mp4`);
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const enc = ['-r', `${FPS}`, '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-an'];
const FIT = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;
const GRAIN = 'format=yuv420p,noise=alls=3:allf=t+u';

// the soap photo (2000×2000): centre of the visible half-sun, and a 9:16 window of the bar that fills the screen
const SUN = { x: 980, y: 1070 };
const BAR = { x: 502, y: 150, w: 956, h: 1700 };

// her wording 2026-11-04 round 2
const HOOK = 'POV: You finally found a soap as fancy as you.';
const BIG = ['UPGRADE', 'YOUR', 'SHOWER', 'EXPERIENCE'];
const END = 'Comment <b>SUNSET</b> for the link to get yours today';
const CREAM = '#F7F1EA';

const font = (f, fam, w = 'normal') => `@font-face{font-family:${fam};src:url(data:font/woff2;base64,${readFileSync(path.join(FONTS, f)).toString('base64')});font-weight:${w}}`;
const CSS = font('figtree.woff2', 'Figtree', '300 900') + font('bricolage-800.woff2', 'Bricolage', 800) +
  `html,body{margin:0;width:${W}px;height:${H}px;background:transparent}`;

async function png(page, html, file, bg = 'transparent') {
  await page.setContent(`<style>${CSS}body{background:${bg}}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  // big words: each line sized to the same width (after the font has loaded, or the sizes come out wrong)
  await page.evaluate(() => { for (const d of document.querySelectorAll('#w div')) d.style.fontSize = (200 * 960 / d.getBoundingClientRect().width) + 'px'; });
  await page.screenshot({ path: file, omitBackground: bg === 'transparent' });
}

async function texts() {
  const b = await launch(); const page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  // hook: black words on white boxes, top third (her countdown style)
  await png(page, `<div style="position:absolute;left:90px;right:90px;top:250px;text-align:center;font:700 66px/1.42 Figtree">
    <span style="background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px">${HOOK}</span></div>`, path.join(TMP, 'hook.png'));
  // the big words as a white-on-black mask: the shower clip keeps playing through the white. Each line is sized to
  // the same width, so EXPERIENCE fits
  await png(page, `<div id=w style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;font:800 200px/0.9 Bricolage;color:#fff;letter-spacing:-4px">
    ${BIG.map((w) => `<div style="white-space:nowrap">${w}</div>`).join('')}</div>`, path.join(TMP, 'mask.png'), '#000');
  await png(page, `<div id=w style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;font:800 200px/0.9 Bricolage;color:transparent;letter-spacing:-4px;text-shadow:0 6px 18px rgba(60,30,20,.28),0 0 1px rgba(60,30,20,.45)">
    ${BIG.map((w) => `<div style="white-space:nowrap">${w}</div>`).join('')}</div>`, path.join(TMP, 'shadow.png'));
  await png(page, `<div style="position:absolute;left:110px;right:110px;top:1430px;text-align:center;font:600 64px/1.42 Figtree">
    <span style="background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px">${END}</span></div>`, path.join(TMP, 'end.png'));
  // the bar cut out of its white background (per row: first to last pixel that isn't white), with a soft shadow
  await page.setContent('<canvas id=c></canvas>');
  const cut = await page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const w = img.width, h = img.height, a = new OffscreenCanvas(w, h), x = a.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, w, h), px = d.data;
    const solid = (i) => (765 - px[i] - px[i + 1] - px[i + 2]) > 36;
    for (let y = 0; y < h; y++) {
      let l = -1, r = -1;
      for (let i = 0; i < w; i++) if (solid((y * w + i) * 4)) { l = i; break; }
      for (let i = w - 1; i >= 0; i--) if (solid((y * w + i) * 4)) { r = i; break; }
      for (let i = 0; i < w; i++) if (l < 0 || i < l + 2 || i > r - 2) px[(y * w + i) * 4 + 3] = 0;
    }
    x.putImageData(d, 0, 0);
    const o = new OffscreenCanvas(w, h), y2 = o.getContext('2d');
    y2.shadowColor = 'rgba(40,20,30,0.45)'; y2.shadowBlur = 60; y2.shadowOffsetY = 30;
    y2.drawImage(a, 0, 0);
    const blob = await o.convertToBlob({ type: 'image/png' });
    return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result.split(',')[1]); f.readAsDataURL(blob); });
  }, `data:image/webp;base64,${readFileSync(SOAP).toString('base64')}`);
  writeFileSync(path.join(TMP, 'bar.png'), Buffer.from(cut, 'base64'));
  await b.close();
}

function reel1() {
  mkdirSync(TMP, { recursive: true });
  const seg = (n) => path.join(TMP, `r1-${n}.mp4`);
  const hook = path.join(TMP, 'hook.png');
  const XF = 0.13, dA = 1.3, dB = 1.6, dC = 1.2, dD = 0.7, dE = 0.9;
  const dF = +(7 - (dA + dB + dC + dD - XF + dE) + 0.05).toFixed(2);
  // A 1.3s: her pick, a woman lathering in the shower, slow push-in, hook on top
  ff(['-ss', '0.4', '-t', `${dA}`, '-i', clip(5240831), '-loop', '1', '-i', hook, '-filter_complex',
    `[0:v]${FIT},fps=${FPS},scale=1146:2036,zoompan=z='1+0.04*in_time/${dA}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS},${GRAIN}[v];[v][1:v]overlay=shortest=1`,
    '-t', `${dA}`, ...enc, seg('a')]);
  // B 1.6s: the transition OUT of the shower (her idea): the same clip keeps playing, the soap bar closes in around it
  // until it only shows inside UPGRADE YOUR SHOWER EXPERIENCE; the words fade and C's zoom starts from this same frame
  ff(['-loop', '1', '-t', `${dB}`, '-i', SOAP, '-ss', `${0.4 + dA}`, '-t', `${dB}`, '-i', clip(5240831),
    '-loop', '1', '-t', `${dB}`, '-i', path.join(TMP, 'mask.png'), '-f', 'lavfi', '-t', `${dB}`, '-i', `color=white:s=${W}x${H}:r=${FPS}`, '-loop', '1', '-t', `${dB}`, '-i', path.join(TMP, 'shadow.png'), '-filter_complex',
    `[1:v]${FIT},fps=${FPS},crop=iw/1.5:ih/1.5:iw/6:ih*0.3,scale=${W}:${H},eq=contrast=1.15:brightness=-0.06:saturation=1.15,format=rgba[s];[3:v]format=rgba,fade=out:st=0.05:d=0.4:alpha=1[full];[2:v]fps=${FPS},format=rgba[ml];[ml][full]overlay,format=gray[m];` +
    `[0:v]crop=${BAR.w}:${BAR.h}:${BAR.x}:${BAR.y},scale=${W}:${H}:flags=lanczos,fps=${FPS},setsar=1[bar];` +
    `[s][m]alphamerge,fade=out:st=${dB - 0.22}:d=0.2:alpha=1[t];[4:v]format=rgba,fade=in:st=0.1:d=0.35:alpha=1,fade=out:st=${dB - 0.22}:d=0.2:alpha=1[sh];[bar][sh]overlay[bgs];[bgs][t]overlay=shortest=1,${GRAIN}`,
    '-t', `${dB}`, ...enc, seg('b')]);
  // C 1.2s: the bar fills the screen (reads as a painting), easing in until the frame is all sun
  const up = 4, D = Math.round(dC * FPS);
  ff(['-i', SOAP, '-filter_complex',
    `[0:v]crop=${BAR.w}:${BAR.h}:${BAR.x}:${BAR.y},scale=${BAR.w * up}:${BAR.h * up}:flags=lanczos,` +
    `zoompan=z='1+6*pow(on/${D},2.2)':x='${(SUN.x - BAR.x) * up}-iw/zoom/2':y='${(SUN.y - BAR.y) * up}-ih/zoom/2':d=${D}:s=${W}x${H}:fps=${FPS},${GRAIN}`,
    '-frames:v', `${D}`, ...enc, seg('c')]);
  // D 0.7s: a real sun, starting zoomed right in on it and pulling out to the whole sunset
  const sun = { x: 556 * 2, y: 1056 * 2 };
  ff(['-ss', '3', '-t', `${dD}`, '-i', clip(32064395), '-filter_complex',
    `[0:v]${FIT},fps=${FPS},scale=${W * 2}:${H * 2},zoompan=z='1+11*pow(1-min(in_time/0.8\\,1),2.4)':` +
    `x='max(0,min(iw-iw/zoom,${sun.x}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${sun.y}-ih/zoom/2))':d=1:s=${W}x${H}:fps=${FPS},` +
    `eq=saturation=0.85:gamma=1.04,${GRAIN}`, '-t', `${dD}`, ...enc, seg('d')]);
  // E 0.9s: three pastel sunsets, 0.3s each, hard cuts
  const flash = [34918687, 40774068, 35684730];
  ff([...flash.flatMap((id) => ['-ss', '3', '-t', '0.5', '-i', clip(id)]), '-filter_complex',
    flash.map((_, i) => `[${i}:v]${FIT},fps=${FPS},trim=end_frame=9,setpts=PTS-STARTPTS[f${i}]`).join(';') + ';' +
    flash.map((_, i) => `[f${i}]`).join('') + `concat=n=${flash.length}:v=1,${GRAIN}`, ...enc, seg('e')]);
  // F: the bar cut out, floating over a soft pastel sunset (not on white, her note), with the comment CTA
  ff(['-ss', '1', '-t', `${dF}`, '-i', clip(35016483), '-loop', '1', '-t', `${dF}`, '-i', path.join(TMP, 'bar.png'),
    '-loop', '1', '-t', `${dF}`, '-i', path.join(TMP, 'end.png'), '-filter_complex',
    `[0:v]${FIT},fps=${FPS},gblur=sigma=5,eq=brightness=0.03[bg];[1:v]scale=1000:1000,format=rgba[s];` +
    `[bg][s]overlay=x=40:y='300-14*t':eval=frame[v];[v][2:v]overlay,${GRAIN}`,
    '-t', `${dF}`, ...enc, seg('f')]);

  // join: hook over C, D and E too (not over the big words or the end); a short dissolve where soap sun meets real sun
  const out = path.join(OUT, 'reel-1.mp4');
  const sfx = (f) => path.join(SFX, f);
  ff(['-i', seg('a'), '-i', seg('b'), '-i', seg('c'), '-i', seg('d'), '-i', seg('e'), '-i', seg('f'), '-loop', '1', '-i', hook,
    '-i', sfx('pop-light.mp3'), '-i', sfx('zoom-in.mp3'), '-i', sfx('whoosh-air.mp3'), '-i', sfx('sparkle.mp3'),
    '-filter_complex',
    [0, 1, 2, 3, 4, 5].map((i) => `[${i}:v]setsar=1[s${i}];`).join('') +
    `[s2][s3]xfade=transition=fade:duration=${XF}:offset=${dC - XF}[cd];[cd][s4]concat=n=2:v=1[cde];[6:v]format=rgba[hk];[cde][hk]overlay=shortest=1[cdeh];` +
    `[s0][s1][cdeh][s5]concat=n=4:v=1,format=yuv420p[v];` +
    `[7:a]adelay=${dA * 1000}|${dA * 1000},volume=0.7[a1];[8:a]adelay=${(dA + dB) * 1000}|${(dA + dB) * 1000},volume=0.6[a2];` +
    `[9:a]adelay=${(dA + dB + dC - 0.1) * 1000}|${(dA + dB + dC - 0.1) * 1000},volume=0.5[a3];` +
    `[10:a]adelay=${(dA + dB + dC + dD - XF + dE) * 1000}|${(dA + dB + dC + dD - XF + dE) * 1000},volume=0.6[a4];` +
    `[a1][a2][a3][a4]amix=inputs=4:normalize=0,apad,atrim=0:7[a]`,
    '-map', '[v]', '-map', '[a]', '-t', '7', '-r', `${FPS}`, '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

// Reels 2-5 (her list 2026-11-04), one simple template so they're quick: stock scenes with hard cuts, her bar cut out on
// top (floats a little, or drops in at popAt), one line of text on white boxes the whole way
const SIMPLE = {
  2: { hook: 'If beach days and bubble baths are your thing, welcome.',
    scenes: [{ id: 36625664, ss: 2, d: 3.5 }, { id: 8227197, ss: 1, d: 3.5 }], bar: { w: 560, y: 1000 } },
  3: { hook: 'Dear algorithm, please connect me with all the people who love supporting small businesses and artisanal products!',
    scenes: [{ id: 13767351, ss: 0.5, d: 7 }], bar: { w: 600, y: 860 } },
  4: { hook: "You weren't looking for a new soap, but here we are.",
    scenes: [{ id: 7815710, ss: 2, d: 7 }], bar: { w: 380, y: 1250, popAt: 1.2 } },
  5: { hook: 'Can you tell the difference?',
    scenes: [{ id: 36609524, ss: 1, d: 3.3, label: 'A real sunset' }, { soap: true, d: 3.7, label: 'A bar of soap' }] },
};
const box = (t, top, size = 64) => `<div style="position:absolute;left:100px;right:100px;top:${top}px;text-align:center;font:700 ${size}px/1.42 Figtree">
  <span style="background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px">${t}</span></div>`;

async function simpleTexts(n) {
  const r = SIMPLE[n], b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  await png(page, box(r.hook, 230), path.join(TMP, `s${n}-hook.png`));
  for (const [i, sc] of r.scenes.entries()) if (sc.label) await png(page, box(sc.label, 1500, 72), path.join(TMP, `s${n}-label${i}.png`));
  await b.close();
}

function simple(n) {
  const r = SIMPLE[n], seg = (i) => path.join(TMP, `s${n}-${i}.mp4`);
  r.scenes.forEach((sc, i) => {
    const label = sc.label ? ['-loop', '1', '-t', `${sc.d}`, '-i', path.join(TMP, `s${n}-label${i}.png`)] : [];
    const src = sc.soap
      ? ['-loop', '1', '-t', `${sc.d}`, '-i', SOAP]
      : ['-ss', `${sc.ss}`, '-t', `${sc.d}`, '-i', clip(sc.id)];
    // the soap scene: the bar fills the frame like the real sunset did, easing out to show it's a bar
    const base = sc.soap
      ? `[0:v]crop=${BAR.w}:${BAR.h}:${BAR.x}:${BAR.y},scale=${BAR.w * 2}:${BAR.h * 2},zoompan=z='1.5-0.5*on/${Math.round(sc.d * FPS)}':x='${(SUN.x - BAR.x) * 2}-iw/zoom/2':y='${(SUN.y - BAR.y) * 2}-ih/zoom/2':d=${Math.round(sc.d * FPS)}:s=${W}x${H}:fps=${FPS}`
      : `[0:v]${FIT},fps=${FPS},scale=1146:2036,zoompan=z='1+0.05*in_time/${sc.d}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS}`;
    const inputs = [...src, ...label];
    const chain = [`${base},setsar=1[v0]`];
    let last = 'v0', k = 1;
    if (r.bar) {
      inputs.push('-loop', '1', '-t', `${sc.d}`, '-i', path.join(TMP, 'bar.png'));
      const w = Math.round(r.bar.w * 2000 / 1350 / 2) * 2; // bar.png is the whole 2000px photo; the bar is ~1350px of it
      const x = Math.round((W - w) / 2), y0 = r.bar.y - Math.round(w * 0.04);
      const t0 = r.bar.popAt ?? 0;
      const y = r.bar.popAt != null ? `if(lt(t\,${t0})\,${H}\,${y0}-90*pow(max(0\,1-(t-${t0})/0.28)\,2))` : `${y0}-12*t`;
      chain.push(`[${inputs.filter((v) => v === '-i').length - 1}:v]scale=${w}:${w},format=rgba[bar]`, `[${last}][bar]overlay=x=${x}:y='${y}':eval=frame[v${k}]`);
      last = `v${k++}`;
    }
    if (sc.label) { chain.push(`[${last}][1:v]overlay[v${k}]`); last = `v${k++}`; }
    chain.push(`[${last}]${GRAIN}`);
    ff([...inputs, '-filter_complex', chain.join(';'), '-frames:v', `${Math.round(sc.d * FPS)}`, ...enc, seg(i)]);
  });
  const out = path.join(OUT, `reel-${n}.mp4`), k = r.scenes.length;
  const sfx = r.bar?.popAt != null ? path.join(SFX, 'pop-bubble.mp3') : path.join(SFX, 'whoosh-air.mp3');
  const at = Math.round((r.bar?.popAt ?? r.scenes[0].d) * 1000);
  ff([...r.scenes.flatMap((_, i) => ['-i', seg(i)]), '-loop', '1', '-i', path.join(TMP, `s${n}-hook.png`), '-i', sfx, '-filter_complex',
    r.scenes.map((_, i) => `[${i}:v]setsar=1[c${i}]`).join(';') + ';' + r.scenes.map((_, i) => `[c${i}]`).join('') +
    `concat=n=${k}:v=1[cat];[${k}:v]format=rgba[hk];[cat][hk]overlay=shortest=1,format=yuv420p[v];[${k + 1}:a]adelay=${at}|${at},volume=0.6,apad,atrim=0:7[a]`,
    '-map', '[v]', '-map', '[a]', '-t', '7', '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

const cmd = process.argv[2];
if (cmd === 'reel1') { mkdirSync(TMP, { recursive: true }); await texts(); reel1(); }
else if (SIMPLE[cmd?.replace('reel', '')]) { const n = +cmd.replace('reel', ''); mkdirSync(TMP, { recursive: true }); if (!existsSync(path.join(TMP, 'bar.png'))) await texts(); await simpleTexts(n); simple(n); }
else console.log('usage: node build.mjs reel1 | reel2 | reel3 | reel4 | reel5');
