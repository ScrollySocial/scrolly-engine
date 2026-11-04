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
// Pacifico (from the Christmas series fonts): the cute script for Reel 2's huge "welcome" (her ask 2026-11-04)
const PACIFICO = readFileSync(path.join(HERE, '../christmas-countdown/fonts/pacifico.ttf')).toString('base64');
const CSS = font('figtree.woff2', 'Figtree', '300 900') + font('bricolage-800.woff2', 'Bricolage', 800) +
  `@font-face{font-family:Pacifico;src:url(data:font/ttf;base64,${PACIFICO})}` +
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

// Reels 2-5, round 2 (her notes 2026-11-04): each one has to grab attention as a TINY tile in the final 9-post grid,
// so every Reel gets one bold shape/colour + motion. Every one is 7s and uses only her one bar photo (cut out or cropped).
const box = (t, top, size = 64) => `<div style="position:absolute;left:100px;right:100px;top:${top}px;text-align:center;font:700 ${size}px/1.42 Figtree">
  <span style="background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px">${t}</span></div>`;
const big = (t, top, size, color, extra = '') => `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;font:800 ${size}px/0.95 Bricolage;color:${color};letter-spacing:-3px;${extra}">${t}</div>`;
const SHADOW = 'text-shadow:0 6px 24px rgba(40,20,30,.35)';
const BUTTER = '#F9E38C';
// butter yellow sits on busy footage, so it gets a firmer dark edge + soft shadow to stay readable
const DARK_SHADOW = 'text-shadow:0 0 3px rgba(60,40,20,.9),0 4px 18px rgba(40,25,10,.65)';
const TEXTS = {
  // 2: the line pops in one piece at a time; "welcome" lands huge in script when the bar arrives
  2: { l1: box('If beach days', 230, 70), l2: box('and bubble baths', 330, 70), l3: box('are your thing,', 430, 70),
    welcome: `<div style="position:absolute;left:0;right:0;top:1590px;text-align:center;font:255px/1 Pacifico;color:#fff;` +
      `text-shadow:0 0 30px rgba(236,140,170,.75),0 8px 24px rgba(120,40,80,.35)">welcome</div>` },
  // 3: butter-yellow script "Dear algorithm," and the rest in butter yellow too (her ask 2026-11-04)
  3: { head: `<div style="position:absolute;left:0;right:0;top:150px;text-align:center;font:175px/1.05 Pacifico;color:${BUTTER};${DARK_SHADOW}">Dear<br>algorithm,</div>`,
    rest: `<div style="position:absolute;left:90px;right:90px;top:1520px;text-align:center;font:800 66px/1.2 Figtree;color:${BUTTER};${DARK_SHADOW}">` +
      'please connect me with all the people who love supporting small businesses and artisanal products!</div>' },
  4: { hook: box("You weren't looking for a new soap,", 200, 66), here: big('but here<br>we are.', 1250, 175, '#fff', SHADOW) },
  5: { hook: box('Can you tell the difference?', 1240, 70),
    labels: big('REAL', 1480, 150, '#fff', SHADOW + ';width:540px') + big('SOAP', 1480, 150, '#fff', SHADOW + ';width:540px;left:540px'),
    end: big("IT'S<br>SOAP.", 1440, 200, '#fff', SHADOW) },
};
async function boldTexts(n) {
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  for (const [k, html] of Object.entries(TEXTS[n])) await png(page, html, path.join(TMP, `b${n}-${k}.png`));
  await b.close();
}
// Reel 4's feed: plain posts made from grey frames of the stock clips (generic UI, no app branding), her bar's post 8th
const FEED_SHOTS = [[7815710, 5], [6801314, 6], [9155064, 3], [13767351, 2], [36625664, 8], [4156329, 30], [11932043, 10], null, [26725993, 5]];
const POST_H = 1480, FEED_TOP = 60;
const FEED = { y: FEED_TOP + 7 * POST_H + 110 + 625 - 1000 };  // bar post's photo centred a little below the middle
async function feed() {
  const imgs = FEED_SHOTS.map((s, i) => {
    if (!s) return null;
    const f = path.join(TMP, `feed-${i}.jpg`);
    ff(['-ss', `${s[1]}`, '-i', clip(s[0]), '-frames:v', '1', '-vf', 'scale=1000:1250:force_original_aspect_ratio=increase,crop=1000:1250,hue=s=0,eq=contrast=0.85:brightness=0.03', f]);
    return `data:image/jpeg;base64,${readFileSync(f).toString('base64')}`;
  });
  const bar = `data:image/png;base64,${readFileSync(path.join(TMP, 'bar.png')).toString('base64')}`;
  const post = (src) => `<div style="height:${POST_H}px;padding:0 40px;box-sizing:border-box">
    <div style="height:110px;display:flex;align-items:center;gap:20px"><div style="width:70px;height:70px;border-radius:50%;background:#d9d9d9"></div>
      <div><div style="width:260px;height:20px;border-radius:10px;background:#cfcfcf;margin-bottom:12px"></div><div style="width:160px;height:16px;border-radius:8px;background:#e4e4e4"></div></div></div>
    ${src ? `<img src="${src}" style="width:1000px;height:1250px;display:block">`
      : `<div style="width:1000px;height:1250px;background:linear-gradient(180deg,#F3E6E4 0%,#F4BFC8 45%,#F7DDA0 70%,#7EC3E3 100%);display:flex;align-items:center;justify-content:center"><img src="${bar}" style="width:1150px;height:1150px"></div>`}
    <div style="height:120px;display:flex;align-items:center;gap:26px">${'<div style="width:48px;height:48px;border-radius:50%;border:5px solid #bbb;box-sizing:border-box"></div>'.repeat(3)}
      <div style="flex:1"></div><div style="width:200px;height:18px;border-radius:9px;background:#e4e4e4"></div></div></div>`;
  const html = `<body style="margin:0;width:${W}px;background:#fff;padding-top:${FEED_TOP}px">${imgs.map(post).join('')}</body>`;
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: 1000 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(TMP, 'feed.png'), fullPage: true });
  await b.close();
}
const txt = (n, k) =>['-loop', '1', '-t', '7', '-i', path.join(TMP, `b${n}-${k}.png`)];
const barIn = () => ['-loop', '1', '-t', '7', '-i', path.join(TMP, 'bar.png')];
const sfx = (f) => ['-i', path.join(SFX, f)];
const at = (i, sec, vol = 0.6) => `[${i}:a]adelay=${Math.round(sec * 1000)}|${Math.round(sec * 1000)},volume=${vol}`;
const mix = (labels) => `${labels.map((l) => `[${l}]`).join('')}amix=inputs=${labels.length}:normalize=0,apad,atrim=0:7[a]`;
// the bar floating: rocks a few degrees and bobs. size = bar.png px (the bar itself is ~2/3 of that)
const floatBar = (i, size, rock = 0.05, period = 2.4) =>
  `[${i}:v]scale=${size}:${size},format=rgba,rotate='${rock}*sin(2*PI*t/${period})':c=none:ow='rotw(0.12)':oh='roth(0.12)'[bar]`;

function render(n, inputs, graph, audio) {
  const out = path.join(OUT, `reel-${n}.mp4`);
  ff([...inputs, '-filter_complex', `${graph},${GRAIN},format=yuv420p[v];${audio}`,
    '-map', '[v]', '-map', '[a]', '-t', '7', '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

// the split line in 5: off the right edge, slides to the middle, holds, then slides back out to the right
const SPLIT = `if(lt(t\\,1.8)\\,${W}\\,if(lt(t\\,2.4)\\,${W}-${W / 2}*(t-1.8)/0.6\\,if(lt(t\\,4.6)\\,${W / 2}\\,min(${W}\\,${W / 2}+${W / 2}*(t-4.6)/0.4))))`;
const BOLD = {
  // 2 (round 3, her clips): overhead beach, pushing in on the foam at the right edge > that foam dissolves into bath foam
  // filling the frame (foam to foam) > the overhead bath (turned upright, same top-down view as the beach) > THEN the bar
  // drops in over the foam and floats
  2: () => render(2, ['-ss', '1', '-t', '2.6', '-i', clip(36625664), '-ss', '0.5', '-t', '1.4', '-i', clip(11932043),
    '-ss', '14', '-t', '2', '-i', clip(4156329), '-ss', '13', '-t', '1.8', '-i', clip(11932043), ...barIn(), ...txt(2, 'l1'), ...txt(2, 'l2'), ...txt(2, 'l3'), ...txt(2, 'welcome'),
    ...sfx('whoosh-air.mp3'), ...sfx('pop-bubble.mp3'), ...sfx('sparkle.mp3')],
    `[0:v]${FIT},fps=${FPS},scale=${W * 2}:${H * 2},zoompan=z='1+1.2*min(in_time/2.6\\,1)':x='(iw-iw/zoom)*min(in_time/2.2\\,1)':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS},setsar=1[beach];` +
    `[1:v]${FIT},fps=${FPS},setsar=1[foam];[2:v]transpose=1,${FIT},fps=${FPS},setsar=1[bath];` +
    `[3:v]${FIT},fps=${FPS},gblur=sigma=3,setsar=1[foam2];` +
    `[beach][foam]xfade=transition=fade:duration=0.4:offset=2.2[bf];[bf][bath]xfade=transition=fade:duration=0.4:offset=3.2[bfb];[bfb][foam2]concat=n=2:v=1[bg];` +
    `${floatBar(4, 1000)};[bar]fade=in:st=5.2:d=0.15:alpha=1[barf];[bg][barf]overlay=x='(W-w)/2':y='if(lt(t\\,5.2)\\,${H}\\,590+20*sin(2*PI*t/2.4)-120*pow(max(0\\,1-(t-5.2)/0.3)\\,2))':eval=frame[vb];` +
    // each line drops in and fades up (0.2s apart); welcome rises in big once the bar has landed
    [[5, 0.15], [6, 0.45], [7, 0.75]].map(([i, st], k) => `[${i}:v]format=rgba,fade=in:st=${st}:d=0.2:alpha=1[l${k}]`).join(';') +
    `;[vb][l0]overlay=y='-40*max(0\\,1-(t-0.15)/0.25)':eval=frame[w0];[w0][l1]overlay=y='-40*max(0\\,1-(t-0.45)/0.25)':eval=frame[w1];` +
    `[w1][l2]overlay=y='-40*max(0\\,1-(t-0.75)/0.25)':eval=frame[w2];` +
    `[8:v]format=rgba,fade=in:st=5.45:d=0.25:alpha=1[wel];[w2][wel]overlay=y='120*pow(max(0\\,1-(t-5.45)/0.4)\\,2)':eval=frame`,
    `${at(9, 2.2, 0.5)}[a1];${at(10, 5.2, 0.6)}[a2];${at(11, 5.45, 0.5)}[a3];${mix(['a1', 'a2', 'a3'])}`),
  // 3 (round 3): HER footage from her old soap business (clips/her-mix-pour.mp4), only the shots before the charcoal goes
  // in (that batch was her black Deep Clean bar): the pour, the stick blender in yellow batter, the empty mold. Then the
  // sunset bar drops into the mold
  3: () => render(3, ['-ss', '3.2', '-t', '1.3', '-i', clip('her-mix-pour'), '-ss', '12.5', '-t', '1.3', '-i', clip('her-mix-pour'),
    '-ss', '34.3', '-t', '4.4', '-i', clip('her-mix-pour'), ...barIn(), ...txt(3, 'head'), ...txt(3, 'rest'), ...sfx('sparkle.mp3'), ...sfx('pop-light.mp3')],
    [0, 1, 2].map((i) => `[${i}:v]${FIT},fps=${FPS},setsar=1[h${i}]`).join(';') + ';[h0][h1][h2]concat=n=3:v=1:a=0[bg];' +
    // once it has landed (~3.3s) the bar starts to rock and float, easing in so it doesn't jolt
    `[3:v]scale=860:860,format=rgba,rotate='0.07*sin(2*PI*(t-3.3)/2)*min(1\\,max(0\\,(t-3.3)/0.6))':c=none:ow='rotw(0.12)':oh='roth(0.12)'[bar];` +
    `[bg][bar]overlay=x='(W-w)/2':y='if(lt(t\\,2.8)\\,-1000\\,600-abs(1100*exp(-5*(t-2.8))*cos(8*(t-2.8)))-22*sin(2*PI*(t-3.3)/2+1)*min(1\\,max(0\\,(t-3.3)/0.6)))':eval=frame[vb];` +
    `[vb][4:v]overlay[vh];[5:v]format=rgba,fade=in:st=0.6:d=0.25:alpha=1[rest];[vh][rest]overlay`,
    `${at(6, 0.1, 0.4)}[a1];${at(7, 3.0, 0.7)}[a2];${mix(['a1', 'a2'])}`),
  // 4 (round 3): a feed of grey, boring posts scrolls fast, slows and stops dead on her bar, the only colour on screen
  4: () => {
    const { y } = FEED;
    render(4, ['-loop', '1', '-t', '7', '-i', path.join(TMP, 'feed.png'), ...txt(4, 'hook'), ...txt(4, 'here'), ...sfx('whoosh-fast.mp3'), ...sfx('pop-light.mp3')],
      `[0:v]crop=${W}:${H}:0:'${y}*(1-pow(1-min(t/2\\,1)\\,3))',fps=${FPS},tmix=frames=3,setsar=1[bg];[bg][1:v]overlay[vh];` +
      `[2:v]format=rgba,fade=in:st=2.0:d=0.2:alpha=1[here];[vh][here]overlay=y='90*pow(max(0\\,1-(t-2.0)/0.35)\\,2)':eval=frame`,
      `${at(3, 0, 0.5)}[a1];${at(4, 2.0, 0.7)}[a2];${mix(['a1', 'a2'])}`);
  },
  // 5: the real sunset; a line slides in to split the screen REAL | SOAP down the middle; then the soap takes over
  // (round 3: her sunset clip, laid out like the bar: blue sky, pink band, sun on the horizon, sea. Both sides framed at
  // the same scale with the horizons level, the whole bar showing, not a close-up)
  5: () => render(5, ['-ss', '1', '-t', '7', '-i', clip(13663887), '-loop', '1', '-t', '7', '-i', SOAP, ...txt(5, 'hook'), ...txt(5, 'labels'), ...txt(5, 'end'),
    '-f', 'lavfi', '-t', '7', '-i', `color=black:s=${W}x${H}:r=${FPS}`, '-f', 'lavfi', '-t', '7', '-i', `color=white:s=${W}x${H}:r=${FPS}`,
    '-f', 'lavfi', '-t', '7', '-i', `color=white:s=10x${H}:r=${FPS}`, ...sfx('whoosh-air.mp3'), ...sfx('whoosh-fast.mp3'), ...barIn(), ...sfx('pop-light.mp3')],
    `[0:v]${FIT},scale=1296:2304,crop=${W}:${H}:216:0,fps=${FPS},setsar=1[sun];[1:v]crop=878:1560:541:373,scale=${W}:${H}:flags=lanczos,fps=${FPS},setsar=1[soap];` +
    `[5:v][6:v]overlay=x='${SPLIT}':eval=frame,format=gray[m];[soap][m]alphamerge[sm];[sun][sm]overlay[v1];` +
    `[v1][7:v]overlay=x='${SPLIT}-5':eval=frame:enable='between(t\\,1.8\\,5.0)'[v2];` +
    `[v2][2:v]overlay=enable='lt(t\\,5.0)'[v3];[v3][3:v]overlay=enable='between(t\\,2.4\\,4.6)'[v4];` +
    // then the whole bar drops in over the real sunset, so you see them at the same scale
    `[10:v]scale=1000:1000,format=rgba,fade=in:st=5.0:d=0.12:alpha=1[bar];[v4][bar]overlay=x=40:y='if(lt(t\\,5.0)\\,${H}\\,420-110*pow(max(0\\,1-(t-5.0)/0.3)\\,2))':eval=frame[v5];` +
    `[4:v]format=rgba,fade=in:st=5.25:d=0.2:alpha=1[end];[v5][end]overlay`,
    `${at(8, 1.8, 0.5)}[a1];${at(9, 4.6, 0.5)}[a2];${at(11, 5.0, 0.7)}[a3];${mix(['a1', 'a2', 'a3'])}`),
};

const cmd = process.argv[2];
if (cmd === 'reel1') { mkdirSync(TMP, { recursive: true }); await texts(); reel1(); }
else if (BOLD[cmd?.replace("reel", "")]) { const n = +cmd.replace("reel", ""); mkdirSync(TMP, { recursive: true }); if (!existsSync(path.join(TMP, "bar.png"))) await texts(); await boldTexts(n); if (n === 4) await feed(); BOLD[n](); }
else console.log('usage: node build.mjs reel1 | reel2 | reel3 | reel4 | reel5');
