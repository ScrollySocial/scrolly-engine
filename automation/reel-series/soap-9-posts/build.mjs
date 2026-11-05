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
  // Great Vibes (Google Fonts, OFL, fonts/): Reel 3's thin script
  `@font-face{font-family:GreatVibes;src:url(data:font/ttf;base64,${readFileSync(path.join(HERE, 'fonts/great-vibes.ttf')).toString('base64')})}` +
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
const SOFT_SHADOW = 'text-shadow:0 2px 20px rgba(0,0,0,.35)'; // a glow only: she called the dark outline ugly
const TEXTS = {
  // 2: the line pops in one piece at a time; "welcome" lands huge in script when the bar arrives
  2: { l1: box('If beach days', 230, 70), l2: box('and bubble baths', 330, 70), l3: box('are your thing,', 430, 70),
    welcome: `<div style="position:absolute;left:0;right:0;top:1590px;text-align:center;font:255px/1 Pacifico;color:#fff;` +
      `text-shadow:0 0 30px rgba(236,140,170,.75),0 8px 24px rgba(120,40,80,.35)">welcome</div>` },
  // 3: her pick A from the lettering sheet (2026-11-04, matcha-grid inspo): thin butter-yellow script, the rest in small
  // spaced white caps, no outlines; a soft dark fade top and bottom keeps the thin type readable on her footage
  3: { head: '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,20,10,.55) 0%,rgba(30,20,10,0) 30%,rgba(30,20,10,0) 70%,rgba(30,20,10,.6) 100%)"></div>' +
      `<div style="position:absolute;left:0;right:0;top:95px;text-align:center;font:215px/0.95 GreatVibes;color:${BUTTER};${SOFT_SHADOW}">Dear<br>algorithm,</div>`,
    rest: `<div style="position:absolute;left:110px;right:110px;bottom:130px;text-align:center;font:500 46px/1.5 Figtree;letter-spacing:6px;text-transform:uppercase;color:#fff;${SOFT_SHADOW}">` +
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
// Reel 3's words + bar, one PNG per frame. 0-2.8s: words centred, "Dear" then "algorithm," float up, the caps line
// tracks in. 2.8-3.2s: words fade up and away, a soft glow blooms. 3.0-3.7s: the bar spins in from small to full size
// with a little overshoot, then floats. "Shop now" fades in at the top (her pick), not jammed against the edge.
// her list (2026-11-04), as labels around the bar: [text, x, y, appears at]
const PILLS = [['All natural ingredients', 40, 600, 3.9], ['Made by hand', 600, 820, 4.25],
  ['Smells like coconut + apple', 30, 1080, 4.6], ['Each bar is a work of art', 420, 1300, 4.95]];
async function overlay3() {
  const dir = path.join(TMP, 'r3ov');
  mkdirSync(dir, { recursive: true });
  const bar = `data:image/png;base64,${readFileSync(path.join(TMP, 'bar.png')).toString('base64')}`;
  // fixed lines, so nothing re-wraps while it animates (the tracking-in version was unreadable, her note)
  const caps = ['please connect me with all', 'the people who love', 'supporting small', 'businesses and artisanal', 'products!'];
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  await page.setContent(`<style>${CSS}*{box-sizing:border-box}.a{position:absolute;left:0;right:0;text-align:center}</style>
    <div id=scrim class=a style="inset:0;background:linear-gradient(180deg,rgba(30,20,10,.5) 0%,rgba(30,20,10,.15) 35%,rgba(30,20,10,.15) 65%,rgba(30,20,10,.55) 100%)"></div>
    <div id=glow class=a style="inset:0;background:radial-gradient(circle at 50% 52%,rgba(255,244,214,.95) 0%,rgba(255,236,190,.5) 28%,rgba(255,236,190,0) 60%);opacity:0"></div>
    <img id=bar src="${bar}" style="position:absolute;left:${(W - 900) / 2}px;top:560px;width:900px;opacity:0">
    <div id=head class=a style="font:215px/0.95 GreatVibes;color:${BUTTER};${SOFT_SHADOW}"><div id=w1>Dear</div><div id=w2>algorithm,</div></div>
    ${PILLS.map(([txt, x, y], i) => `<div id=p${i} style="position:absolute;left:${x}px;top:${y}px;padding:16px 30px;border-radius:60px;background:rgba(255,250,238,.94);font:700 40px Figtree;color:#5a4320;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;white-space:nowrap">${txt}</div>`).join('')}
    <div id=caps class=a style="left:110px;right:110px;font:500 46px/1.5 Figtree;text-transform:uppercase;color:#fff;letter-spacing:6px;${SOFT_SHADOW}">${caps.map((l, i) => `<div id=c${i}>${l}</div>`).join('')}</div>`);
  await page.evaluate((at) => { window.PILL_AT = at; return document.fonts.ready; }, PILLS.map((p) => p[3]));
  for (let f = 0; f < 7 * FPS; f++) {
    await page.evaluate((t) => {
      const c = (x) => Math.max(0, Math.min(1, x)), out3 = (x) => 1 - Math.pow(1 - c(x), 3);
      const back = (x) => { x = c(x); const k = 1.7; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
      const $ = (id) => document.getElementById(id).style;
      const late = t >= 3.8; // words back, in the final layout
      // the end says Shop now instead of Dear algorithm (her note)
      document.getElementById('w1').textContent = late ? 'Shop now' : 'Dear';
      document.getElementById('w2').textContent = late ? '' : 'algorithm,';
      const leave = c((t - 2.8) / 0.35), in1 = out3((t - 5.4) / 0.5), in2 = out3((t - 4.0) / 0.5);
      $('head').top = late ? `${250 - 30 * (1 - in1)}px` : `${560 - 40 * leave}px`;
      $('head').opacity = late ? in1 : 1 - leave;
      $('head').filter = late ? 'none' : `blur(${8 * leave}px)`;
      for (const [id, st] of [['w1', 0.15], ['w2', 0.45]]) {
        const k = out3((t - st) / 0.45);
        $(id).opacity = late ? 1 : k; $(id).transform = late ? 'none' : `translateY(${40 * (1 - k)}px)`;
      }
      $('caps').top = late ? 'auto' : '1060px'; $('caps').bottom = late ? '130px' : 'auto';
      $('caps').opacity = late ? 0 : 1 - leave; // she hated it moving to the bottom: it leaves with the script and stays gone
      // each line fades up in turn, 0.15s apart
      for (let i = 0; i < 5; i++) {
        const k = late ? 1 : out3((t - 0.85 - 0.15 * i) / 0.35);
        $(`c${i}`).opacity = k; $(`c${i}`).transform = `translateY(${24 * (1 - k)}px)`;
      }
      // the list: each label pops in beside the bar, 0.35s apart, after it lands
      PILL_AT.forEach((st, i) => { const k = back((t - st) / 0.35); $(`p${i}`).opacity = c((t - st) / 0.15); $(`p${i}`).transform = `scale(${t < st ? 0.6 : k})`; });
      $('glow').opacity = t < 2.9 ? 0 : Math.max(0, 1 - Math.abs(t - 3.15) / 0.35);
      const s = t < 3.0 ? 0 : 0.15 + 0.85 * back((t - 3.0) / 0.7), spin = -540 * (1 - out3((t - 3.0) / 0.7));
      const fl = c((t - 3.8) / 0.6), rock = 4 * Math.sin(2 * Math.PI * (t - 3.8) / 2) * fl, bob = -18 * Math.sin(2 * Math.PI * (t - 3.8) / 2 + 1) * fl;
      $('bar').opacity = t < 3.0 ? 0 : c((t - 3.0) / 0.12);
      $('bar').transform = `translateY(${bob}px) scale(${s}) rotate(${spin + rock}deg)`;
    }, f / FPS);
    await page.screenshot({ path: path.join(dir, `${String(f + 1).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close();
}
const txt = (n, k) => ['-loop', '1', '-t', '7', '-i', path.join(TMP, `b${n}-${k}.png`)];
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
  // sunset bar appears in the mold. Round 4 (her notes): words in the MIDDLE, animated; a real bar transition. The words +
  // bar layer is drawn frame by frame in the browser (overlay3) so the motion can be smooth, then laid over her footage
  3: () => render(3, ['-ss', '3.2', '-t', '1.3', '-i', clip('her-mix-pour'), '-ss', '12.5', '-t', '1.3', '-i', clip('her-mix-pour'),
    '-ss', '34.3', '-t', '4.4', '-i', clip('her-mix-pour'), '-framerate', `${FPS}`, '-i', path.join(TMP, 'r3ov', '%04d.png'),
    ...sfx('sparkle.mp3'), ...sfx('whoosh-air.mp3'), ...sfx('pop-light.mp3')],
    [0, 1, 2].map((i) => `[${i}:v]${FIT},fps=${FPS},setsar=1[h${i}]`).join(';') + ';[h0][h1][h2]concat=n=3:v=1:a=0[bg];' +
    '[3:v]format=rgba[ov];[bg][ov]overlay=shortest=1',
    `${at(4, 0.1, 0.4)}[a1];${at(5, 2.85, 0.5)}[a2];${at(6, 3.55, 0.7)}[a3];${mix(['a1', 'a2', 'a3'])}`),
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
  // 6 (her idea 2026-11-04): "It may look like fall outside / but in your shower / it's still summer". Fall leaves >
  // her lather clip > her robe-and-palm-wall clip > her pastel beach, where the bar spins in. Words + bar drawn per frame
  // (overlay6), same lettering and motion as Reel 3
  6: () => render(6, ['-ss', '1', '-t', '2.4', '-i', clip(10223234), '-ss', '1', '-t', '1.1', '-i', clip(9474976),
    '-ss', '4', '-t', '0.8', '-i', clip(8225573), '-ss', '2', '-t', '2.7', '-i', clip(12954182),
    '-framerate', `${FPS}`, '-i', path.join(TMP, 'r6ov', '%04d.png'), ...sfx('whoosh-air.mp3'), ...sfx('whoosh-air.mp3'), ...sfx('pop-light.mp3')],
    [0, 1, 2, 3].map((i) => `[${i}:v]${FIT},fps=${FPS},setsar=1[s${i}]`).join(';') + ';[s0][s1][s2][s3]concat=n=4:v=1:a=0[bg];' +
    '[4:v]format=rgba[ov];[bg][ov]overlay=shortest=1',
    `${at(5, 2.3, 0.4)}[a1];${at(6, 4.2, 0.4)}[a2];${at(7, 4.9, 0.7)}[a3];${mix(['a1', 'a2', 'a3'])}`),
};
TEXTS[6] = {};

// Reel 6's words + bar, one PNG per frame: each line pair fades up in the middle and leaves; then the bar spins in
// over the beach with "it's still / summer" at the top
async function overlay6() {
  const dir = path.join(TMP, 'r6ov');
  mkdirSync(dir, { recursive: true });
  const bar = `data:image/png;base64,${readFileSync(path.join(TMP, 'bar.png')).toString('base64')}`;
  const caps = `font:500 46px Figtree;letter-spacing:8px;text-transform:uppercase;color:#fff;${SOFT_SHADOW}`;
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  await page.setContent(`<style>${CSS}.a{position:absolute;left:0;right:0;text-align:center}</style>
    <div id=scrim class=a style="inset:0;background:linear-gradient(180deg,rgba(20,10,5,.15) 0%,rgba(20,10,5,.4) 40%,rgba(20,10,5,.4) 60%,rgba(20,10,5,.15) 100%)"></div>
    <div id=glow class=a style="inset:0;background:radial-gradient(circle at 50% 52%,rgba(255,244,214,.95) 0%,rgba(255,236,190,.5) 28%,rgba(255,236,190,0) 60%);opacity:0"></div>
    <img id=bar src="${bar}" style="position:absolute;left:${(W - 900) / 2}px;top:600px;width:900px;opacity:0">
    <div id=g1 class=a style="top:740px"><div id=c1 style="${caps}">it may look like</div><div id=s1 style="font:200px/1 GreatVibes;color:#fff;${SOFT_SHADOW}">fall outside</div></div>
    <div id=g2 class=a style="top:740px"><div id=c2 style="${caps}">but</div><div id=s2 style="font:200px/1 GreatVibes;color:#fff;${SOFT_SHADOW}">in your shower</div></div>
    <div id=g3 class=a style="top:150px"><div id=c3 style="${caps}">it's still</div><div id=s3 style="font:230px/1 GreatVibes;color:${BUTTER};${SOFT_SHADOW}">summer</div></div>`);
  await page.evaluate(() => document.fonts.ready);
  for (let f = 0; f < 7 * FPS; f++) {
    await page.evaluate((t) => {
      const c = (x) => Math.max(0, Math.min(1, x)), out3 = (x) => 1 - Math.pow(1 - c(x), 3);
      const back = (x) => { x = c(x); const k = 1.7; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
      const $ = (id) => document.getElementById(id).style;
      // [group, in at, out at]: caps first, the script 0.25s later; each group blurs up and away
      for (const [g, st, end] of [[1, 0.15, 2.2], [2, 2.45, 4.05], [3, 4.6, 99]]) {
        const leave = c((t - end) / 0.3);
        $(`g${g}`).opacity = 1 - leave; $(`g${g}`).filter = `blur(${8 * leave}px)`; $(`g${g}`).transform = `translateY(${-40 * leave}px)`;
        for (const [id, d] of [[`c${g}`, 0], [`s${g}`, 0.25]]) {
          const k = out3((t - st - d) / 0.45);
          $(id).opacity = k; $(id).transform = `translateY(${36 * (1 - k)}px)`;
        }
      }
      $('scrim').opacity = 1 - c((t - 4.2) / 0.3) * 0.6;
      $('glow').opacity = t < 4.1 ? 0 : Math.max(0, 1 - Math.abs(t - 4.35) / 0.35);
      const s = t < 4.2 ? 0 : 0.15 + 0.85 * back((t - 4.2) / 0.7), spin = -540 * (1 - out3((t - 4.2) / 0.7));
      const fl = c((t - 5.0) / 0.6), rock = 4 * Math.sin(2 * Math.PI * (t - 5.0) / 2) * fl, bob = -18 * Math.sin(2 * Math.PI * (t - 5.0) / 2 + 1) * fl;
      $('bar').opacity = t < 4.2 ? 0 : c((t - 4.2) / 0.12);
      $('bar').transform = `translateY(${bob}px) scale(${s}) rotate(${spin + rock}deg)`;
    }, f / FPS);
    await page.screenshot({ path: path.join(dir, `${String(f + 1).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close();
}

// THE MAIN REEL (the lesson, after @tainacreates' format, her inspo): her at her desk + the plain soap photo as a card,
// Client: "I only have one photo, but I need 9 posts." > "Of course, I got you" > the 9 posts pop into a 3x3 grid, the
// 6 Reels playing in their tiles. 11s. Her footage (green couch) gets the soft warm grade she likes on herself.
const MAIN_T = 11, GRID_AT = 4.4;
const TILE = { w: 300, h: 400, gap: 8, x: 82, y: 540 };
const POSTS = path.join(OUT);
// grid order mixes the formats; c2 has no post yet, so carousel 1's slide 6 stands in until carousel 2 exists
const GRID = ['reel-1', 'image', 'reel-2', 'reel-3', 'c1', 'reel-4', 'reel-5', 'c2', 'reel-6'];
const still = {
  image: path.join(POSTS, 'image-post', 'image-post.png'),
  c1: path.join(POSTS, 'carousel-1', 'slide-01.png'),
  c2: existsSync(path.join(POSTS, 'carousel-2', 'slide-01.png')) ? path.join(POSTS, 'carousel-2', 'slide-01.png') : path.join(POSTS, 'carousel-1', 'slide-06.png'),
};
async function mainTexts() {
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  const sh = 'text-shadow:0 2px 18px rgba(0,0,0,.5)';
  await png(page, `<div style="position:absolute;left:90px;right:90px;top:900px;text-align:center;font:700 62px/1.3 Figtree;color:#fff;${sh}">Client: "I only have one photo,<br>but I need 9 posts."</div>`, path.join(TMP, 'm-client.png'));
  await png(page, `<div style="position:absolute;left:330px;top:1150px;width:420px;padding:18px;background:#fff;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.35);transform:rotate(-4deg)">
    <img src="data:image/webp;base64,${readFileSync(SOAP).toString('base64')}" style="width:384px;display:block"></div>`, path.join(TMP, 'm-card.png'));
  await png(page, `<div style="position:absolute;left:0;right:0;top:330px;text-align:center;font:150px/1 GreatVibes;color:#fff;${sh}">Of course, I got you</div>`, path.join(TMP, 'm-gotyou.png'));
  await png(page, `<div style="position:absolute;left:0;right:0;top:1790px;text-align:center;font:500 44px Figtree;letter-spacing:8px;text-transform:uppercase;color:#fff;${sh}">1 photo · 9 posts</div>`, path.join(TMP, 'm-caption.png'));
  await b.close();
}
function mainReel() {
  // her green-couch clips filmed 2026-11-04 (her pick): working on the laptop for the client line, then the second take.
  // Cut once to a light 1080×1920 file (the originals are 4K HEVC)
  const her = path.join(TMP, 'm-her.mp4'), V = P.footage;
  ff(['-ss', '12', '-t', '3.2', '-i', path.join(V, 'IMG_2171.MOV'), '-ss', '8', '-t', '7', '-i', path.join(V, 'IMG_2172.MOV'), '-filter_complex',
    `[0:v]${FIT},fps=${FPS}[a];[1:v]${FIT},fps=${FPS}[b];[a][b]concat=n=2:v=1:a=0`, ...enc, her]);
  const inputs = ['-t', '10', '-i', her, ...['client', 'card', 'gotyou', 'caption'].flatMap((k) => ['-loop', '1', '-t', `${MAIN_T}`, '-i', path.join(TMP, `m-${k}.png`)])];
  const tiles = GRID.map((g, k) => {
    inputs.push(...(g.startsWith('reel') ? ['-i', path.join(OUT, `${g}.mp4`)] : ['-loop', '1', '-t', `${MAIN_T}`, '-i', still[g]]));
    return { idx: 5 + k, st: +(GRID_AT + 0.1 * k).toFixed(2), x: TILE.x + (k % 3) * (TILE.w + TILE.gap), y: TILE.y + Math.floor(k / 3) * (TILE.h + TILE.gap), reel: g.startsWith('reel') };
  });
  inputs.push(...sfx('sparkle.mp3'), ...sfx('pop-bubble.mp3'));
  const sx = 5 + GRID.length;
  const g = [
    // her clip, held on its last frame to the end; soft warm grade; a blurred, darker copy fades in behind the grid
    `[0:v]${FIT},fps=${FPS},tpad=stop_mode=clone:stop_duration=1.5,trim=duration=${MAIN_T},eq=brightness=0.03:saturation=1.05:gamma=1.04,colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02,gblur=sigma=0.8,split[b1][b2]`,
    `[b2]gblur=sigma=24,eq=brightness=-0.12,format=rgba,fade=in:st=${GRID_AT - 0.2}:d=0.3:alpha=1[blur]`,
    `[b1][blur]overlay[v0]`,
    `[1:v]format=rgba,fade=out:st=3.0:d=0.2:alpha=1[cl];[v0][cl]overlay[v1]`,
    `[2:v]format=rgba,fade=out:st=3.0:d=0.2:alpha=1[cd];[v1][cd]overlay=y='40*pow(max(0\\,1-t/0.4)\\,2)':eval=frame[v2]`,
    `[3:v]format=rgba,fade=in:st=3.2:d=0.35:alpha=1[gy];[v2][gy]overlay[v3]`,
  ];
  let last = 'v3';
  for (const [k, t] of tiles.entries()) {
    // reels start playing the moment their tile pops in; everything is cropped to the 3:4 grid shape
    const shape = `scale=${TILE.w}:${TILE.h}:force_original_aspect_ratio=increase,crop=${TILE.w}:${TILE.h}`;
    g.push(`[${t.idx}:v]${shape},fps=${FPS},format=rgba${t.reel ? `,setpts=PTS-STARTPTS+${t.st}/TB` : ''},fade=in:st=${t.st}:d=0.15:alpha=1[t${k}]`);
    g.push(`[${last}][t${k}]overlay=x=${t.x}:y='${t.y}+30*pow(max(0\\,1-(t-${t.st})/0.25)\\,2)':eval=frame:enable='gte(t\\,${t.st})':eof_action=repeat[g${k}]`);
    last = `g${k}`;
  }
  g.push(`[4:v]format=rgba,fade=in:st=${GRID_AT + 1}:d=0.3:alpha=1[cap];[${last}][cap]overlay`);
  const out = path.join(OUT, 'main-reel.mp4');
  ff([...inputs, '-filter_complex', `${g.join(';')},${GRAIN},format=yuv420p[v];${at(sx, 3.2, 0.5)}[a1];${at(sx + 1, GRID_AT, 0.6)}[a2];[a1][a2]amix=inputs=2:normalize=0,apad,atrim=0:${MAIN_T}[a]`,
    '-map', '[v]', '-map', '[a]', '-t', `${MAIN_T}`, '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

const cmd = process.argv[2];
if (cmd === 'main') { mkdirSync(TMP, { recursive: true }); await mainTexts(); mainReel(); }
else if (cmd === 'reel1') { mkdirSync(TMP, { recursive: true }); await texts(); reel1(); }
else if (BOLD[cmd?.replace("reel", "")]) { const n = +cmd.replace("reel", ""); mkdirSync(TMP, { recursive: true }); if (!existsSync(path.join(TMP, "bar.png"))) await texts(); await boldTexts(n); if (n === 4) await feed(); if (n === 3) await overlay3(); if (n === 6) await overlay6(); BOLD[n](); }
else console.log('usage: node build.mjs reel1 | reel2 | reel3 | reel4 | reel5 | reel6');
