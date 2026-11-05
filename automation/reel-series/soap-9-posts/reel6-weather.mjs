// Reel 6, v2 (her inspo 2026-11-04: the Pinterest sunscreen ad with the product as a big white-outlined sticker over
// backgrounds that change, a bold yellow serif headline with a white outline). Her idea: no matter the weather outside,
// it's still sunny in the shower. The bar sticker stays put while the background flips through fall, rain and snow, then
// lands on a sunny beach and a sunny shower. Lettering from her two other pins: a huge white script word with a bold sans
// line under it (Canva split screen text) + bold stacked serif caps with a small script word (CapCut typography).
//   node reel6-weather.mjs stills   overlay frames + check stills in .work/r6w-check
//   node reel6-weather.mjs          overlay frames + renders <exports>/soap-9-posts/reel-6-v6.mp4
// New clips (Pexels License, gitignored in clips/): 32061829 heavy rain on a street, 19602962 snowy street.
// Fonts: Corben Bold (OFL, fonts/corben-bold.ttf), Pacifico (christmas-countdown/fonts), Figtree.
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(HERE, 'clips');
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const OV = path.join(TMP, 'r6w');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const W = 1080, H = 1920, FPS = 30, T = 7;
const clip = (id) => path.join(CLIPS, `${id}.mp4`);
const ff = (args) => execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const FIT = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;

// [clip, start in the clip, from, to, grade]: hard cuts, the weather gloomy and cool, the sun warm
const GLOOM = 'eq=saturation=0.7:brightness=-0.04:contrast=1.05';
const SUNNY = 'eq=saturation=1.15:gamma=1.05:brightness=0.02';
const SHOTS = [
  [10223234, 1.0, 0, 2.1, GLOOM, 'fall'],
  [32061829, 1.0, 2.1, 2.9, GLOOM, 'rain'],
  [19602962, 2.0, 2.9, 3.7, GLOOM + ',eq=brightness=0.05', 'snow'],
  [12954182, 2.0, 3.7, 4.7, SUNNY, null],
  [8225573, 0.3, 4.7, 7.0, SUNNY + ',eq=contrast=1.12:gamma=0.97', null],
];
const SUN_AT = 3.7;
// v5 (her note: "fall" showed while you were still reading "no matter"): the bottom words wait until WEATHER has landed
const HEAD_DONE = 1.65;

// the wording (to check with her)
const TOP_SCRIPT = ['no matter', "it's still"];
const TOP_CAPS = ['THE WEATHER', 'SUNNY'];
const BOTTOM_SANS = 'OUTSIDE';
const END_SCRIPT = 'in the shower';

const b64 = (f) => readFileSync(f).toString('base64');
const CSS = `@font-face{font-family:Figtree;src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'figtree.woff2'))});font-weight:300 900}` +
  `@font-face{font-family:Pacifico;src:url(data:font/ttf;base64,${b64(path.join(HERE, '../christmas-countdown/fonts/pacifico.ttf'))})}` +
  `@font-face{font-family:Corben;src:url(data:font/ttf;base64,${b64(path.join(HERE, 'fonts/corben-bold.ttf'))})}` +
  `html,body{margin:0;width:${W}px;height:${H}px;background:transparent}`;
const YELLOW = '#FFD43B';
// the inspo's headline: yellow serif, thick white outline outside the letters, a soft warm drop so it reads on snow
const CAPS = `font:700 140px/1.02 Corben;color:${YELLOW};-webkit-text-stroke:26px #fff;paint-order:stroke fill;letter-spacing:-2px;` +
  'filter:drop-shadow(0 8px 14px rgba(60,35,10,.45))';
const SCRIPT = 'font:400 140px/1 Pacifico;color:#fff;filter:drop-shadow(0 4px 14px rgba(0,0,0,.55))';
const SANS = 'font:900 64px/1 Figtree;color:#fff;letter-spacing:14px;filter:drop-shadow(0 3px 10px rgba(0,0,0,.6))';

// the bar sticker: the cut-out (its soft shadow dropped), a thick white outline around it, a small shadow under that
async function sticker(page) {
  await page.setContent('<canvas></canvas>');
  return page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const S = img.width, a = new OffscreenCanvas(S, S), x = a.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, S, S);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 200 ? 255 : 0;
    x.putImageData(d, 0, 0);
    const R = 46, out = new OffscreenCanvas(S, S), o = out.getContext('2d');
    for (let k = 0; k < 64; k++) for (const r of [R, R * 0.6]) o.drawImage(a, Math.cos(k / 64 * 2 * Math.PI) * r, Math.sin(k / 64 * 2 * Math.PI) * r);
    o.globalCompositeOperation = 'source-in'; o.fillStyle = '#fff'; o.fillRect(0, 0, S, S);
    o.globalCompositeOperation = 'source-over'; o.drawImage(a, 0, 0);
    const f = new OffscreenCanvas(S, S), g = f.getContext('2d');
    g.shadowColor = 'rgba(30,20,10,0.4)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.drawImage(out, 0, 0);
    const blob = await f.convertToBlob({ type: 'image/png' });
    return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
  }, `data:image/png;base64,${b64(path.join(TMP, 'bar.png'))}`);
}

// layout (px in the 1080×1920 frame), v3 (her note: the words sat on the bar): top words 200-600, a smaller sticker
// 680-1350 with clear space round it, bottom words 1390-1660, all inside a 3:4 grid crop starting at about y 220
// v6 (her idea): no bar during the weather, so the weather word sits big in the middle (top 860); the bar only slaps
// on once SUNNY has landed, then "in the shower" comes in under it
const BAR_W = 690, BAR_TOP = 665; // bar.png box (the bar itself is ~72% of its width)
async function overlay() {
  mkdirSync(OV, { recursive: true });
  const b = await launch(), page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  const bar = await sticker(page);
  const sparks = [[150, 330, 0.0], [920, 300, 0.25], [110, 1180, 0.5], [950, 1100, 0.7], [860, 560, 0.95]];
  await page.setContent(`<style>${CSS}.a{position:absolute;left:0;right:0;text-align:center}span{display:inline-block}</style>
    <img id=bar src="${bar}" style="position:absolute;left:${(W - BAR_W) / 2}px;top:${BAR_TOP}px;width:${BAR_W}px">
    <div id=top class=a style="top:200px"><div id=ts style="${SCRIPT};font-size:125px;margin-bottom:-6px"></div><div id=tc style="${CAPS}"></div></div>
    <div id=bot class=a style="top:1390px"><div id=bs style="${SCRIPT};font-size:210px;line-height:1"></div><div id=bn style="${SANS};margin-top:-8px"></div></div>
    ${sparks.map(([sx, sy], i) => `<svg id=S${i} width=90 height=90 style="position:absolute;left:${sx}px;top:${sy}px;opacity:0" viewBox="-10 -10 20 20"><path d="M0-10Q1-1 10 0Q1 1 0 10Q-1 1-10 0Q-1-1 0-10Z" fill="#fff" stroke="${YELLOW}" stroke-width="1.2"/></svg>`).join('')}`);
  await page.evaluate(() => document.fonts.ready);
  const cuts = SHOTS.map((s) => s[2]);
  for (let f = 0; f < T * FPS; f++) {
    await page.evaluate((t, cuts, shots, txt, sparks, SUN_AT, HEAD_DONE) => {
      const c = (x) => Math.max(0, Math.min(1, x));
      const back = (x) => { x = c(x); const k = 2.2; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
      const $ = (id) => document.getElementById(id);
      const sun = t >= SUN_AT, i = cuts.filter((s) => s <= t).length - 1, since = t - cuts[i], wsince = t - Math.max(cuts[i], HEAD_DONE);
      // the sticker slaps on after SUNNY (pops up from small, a tilt that settles), then bobs gently
      const BAR_AT = SUN_AT + 1.2, bt = t - BAR_AT, sway = Math.sin(2 * Math.PI * bt / 1.6) * c(bt / 0.6);
      $('bar').style.opacity = c(bt / 0.06);
      $('bar').style.transform = `translateY(${-10 * sway}px) scale(${bt <= 0 ? 0.3 : 0.3 + 0.7 * back(bt / 0.4)}) rotate(${-12 * (1 - c(bt / 0.4)) + 2.5 * sway}deg)`;
      // the headline, word by word (v4, her note: slower): no / matter / THE / WEATHER, 0.4s apart; when the sun comes
      // out: it's / still / SUNNY, then in / the / shower. Each word pops up from small with a little overshoot
      const k = sun ? 1 : 0;
      if ($('top').dataset.k !== String(k)) {
        $('top').dataset.k = k;
        $('ts').innerHTML = txt.ts[k].split(' ').map((w) => `<span class=w>${w}</span>`).join(' ');
        $('tc').innerHTML = txt.tc[k].split(' ').map((w) => `<div><span class=w>${w}</span></div>`).join('');
        $('tc').style.fontSize = sun ? '215px' : '140px';
      }
      const pop = (el, st) => { const x = (t - st) / 0.45; el.style.opacity = c(x * 4); el.style.transform = `translateY(${30 * (1 - c(x))}px) scale(${x <= 0 ? 0.6 : 0.6 + 0.4 * back(x)})`; };
      const t0 = sun ? SUN_AT + 0.1 : 0.15;
      [...document.querySelectorAll('#top .w')].forEach((el, j) => pop(el, t0 + 0.4 * j));
      // the bottom: the weather word changes on every cut (huge white script), OUTSIDE stays; sunny: "in the shower"
      const word = sun ? txt.end : shots[i][5];
      if ($('bs').dataset.w !== word) { $('bs').dataset.w = word; $('bs').innerHTML = word.split(' ').map((w) => `<span class=w>${w}</span>`).join(' '); }
      $('bs').style.fontSize = sun ? '175px' : '330px';
      $('bot').style.top = sun ? '1390px' : '860px';
      $('bn').style.fontSize = sun ? '64px' : '90px';
      if (sun) { $('bs').style.transform = 'none'; [...document.querySelectorAll('#bs .w')].forEach((el, j) => pop(el, BAR_AT + 0.45 + 0.3 * j)); }
      else { $('bs').style.transform = `scale(${back(wsince / 0.3)}) rotate(${i % 2 ? 4 : -4}deg)`; $('bs').style.opacity = c(wsince / 0.06); }
      $('bn').textContent = sun ? '' : txt.sans;
      $('bn').style.opacity = c((t - HEAD_DONE - 0.15) / 0.2);
      // sparkles twinkle round the sticker once it's sunny
      sparks.forEach(([, , st], j) => {
        const p = ((bt - st) % 1.2) / 0.6, s = $(`S${j}`).style;
        s.opacity = bt < st || p > 1 ? 0 : Math.sin(Math.PI * p); s.transform = `scale(${0.5 + 0.8 * Math.sin(Math.PI * c(p))}) rotate(${90 * c(p)}deg)`;
      });
    }, f / FPS, cuts, SHOTS, { ts: TOP_SCRIPT, tc: TOP_CAPS, sans: BOTTOM_SANS, end: END_SCRIPT }, sparks, SUN_AT, HEAD_DONE);
    await page.screenshot({ path: path.join(OV, `${String(f + 1).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close();
}

// the background: the shots cut back to back, plus a quick white flash when the sun comes out
const bgInputs = () => SHOTS.flatMap(([id, ss, a, z]) => ['-ss', `${ss}`, '-t', `${(z - a + 0.1).toFixed(2)}`, '-i', clip(id)]);
const bgGraph = () => SHOTS.map(([, , a, z, g], i) => `[${i}:v]${FIT},fps=${FPS},${g},trim=duration=${(z - a).toFixed(2)},setpts=PTS-STARTPTS[s${i}]`).join(';') +
  // (each fade only on its own half: a fade fills the rest of its stream with white)
  `;[s0][s1][s2]concat=n=3:v=1:a=0,fade=out:st=${SUN_AT - 0.08}:d=0.08:color=white[wx];` +
  `[s3][s4]concat=n=2:v=1:a=0,fade=in:st=0:d=0.2:color=white[sx];[wx][sx]concat=n=2:v=1:a=0[bg]`;

function render() {
  // no sound effects (her note, v3): a silent track only, so it joins like the other Reels
  const n = SHOTS.length, out = path.join(OUT, 'reel-6-v6.mp4');
  ff([...bgInputs(), '-framerate', `${FPS}`, '-i', path.join(OV, '%04d.png'), '-f', 'lavfi', '-t', `${T}`, '-i', 'anullsrc=r=44100:cl=stereo', '-filter_complex',
    `${bgGraph()};[${n}:v]format=rgba[ov];[bg][ov]overlay=shortest=1,format=yuv420p,noise=alls=3:allf=t+u[v]`,
    '-map', '[v]', '-map', `${n + 1}:a`, '-t', `${T}`, '-r', `${FPS}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

// check stills: one frame per shot + the final grid moment, the overlay on a frame of its background
function stills() {
  const dir = path.join(TMP, 'r6w-check');
  mkdirSync(dir, { recursive: true });
  for (const t of [1.4, 1.95, 2.5, 3.3, 4.4, 5.0, 6.6]) {
    const s = SHOTS.find(([, , a, z]) => t >= a && t < z);
    ff(['-ss', `${s[1] + t - s[2]}`, '-i', clip(s[0]), '-i', path.join(OV, `${String(Math.round(t * FPS) + 1).padStart(4, '0')}.png`),
      '-filter_complex', `[0:v]${FIT},${s[4]}[b];[b][1:v]overlay`, '-frames:v', '1', path.join(dir, `t${t}.jpg`)]);
  }
  console.log(dir);
}

if (!existsSync(path.join(TMP, 'bar.png'))) throw new Error('needs .work/bar.png (node build.mjs makes it)');
await overlay();
if (process.argv[2] === 'stills') stills(); else render();
