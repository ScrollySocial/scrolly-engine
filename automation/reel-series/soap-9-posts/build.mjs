// "1 photo of soap, 9 posts": every post is made from ONE photo of her sunset soap bar (soap.webp, from her old soap
// business). Reel 1 (option A, her pick 2026-11-04), 7 seconds:
//   A shower clip + hook > B UPGRADE YOUR SHOWER with a pastel sunset playing inside the letters > C push into the sun on
//   the soap > D that sun becomes a real sun (zoom out of a sunset clip) > E pastel sunset flashes > F the whole bar.
//   node build.mjs reel1        renders <exports>/soap-9-posts/reel-1.mp4
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

const HOOK = 'POV: You finally find a soap that looks like a sunset.';
const BIG = ['UPGRADE', 'YOUR', 'SHOWER'];
const END = "It's a bar of soap.";
const CREAM = '#F7F1EA';

const font = (f, fam, w = 'normal') => `@font-face{font-family:${fam};src:url(data:font/woff2;base64,${readFileSync(path.join(FONTS, f)).toString('base64')});font-weight:${w}}`;
const CSS = font('figtree.woff2', 'Figtree', '300 900') + font('bricolage-800.woff2', 'Bricolage', 800) +
  `html,body{margin:0;width:${W}px;height:${H}px;background:transparent}`;

async function png(page, html, file, bg = 'transparent') {
  await page.setContent(`<style>${CSS}body{background:${bg}}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: bg === 'transparent' });
}

async function texts() {
  const b = await launch(); const page = await b.newPage();
  await page.setViewport({ width: W, height: H });
  // hook: black words on white boxes, top third (her countdown style)
  await png(page, `<div style="position:absolute;left:90px;right:90px;top:250px;text-align:center;font:700 66px/1.42 Figtree">
    <span style="background:#fff;padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px">${HOOK}</span></div>`, path.join(TMP, 'hook.png'));
  // the big words as a white-on-black mask: the sunset clip shows through the white
  await png(page, `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;font:800 250px/0.92 Bricolage;color:#fff;letter-spacing:-6px">
    ${BIG.map((w) => `<div>${w}</div>`).join('')}</div>`, path.join(TMP, 'mask.png'), '#000');
  await png(page, `<div style="position:absolute;left:0;right:0;top:1500px;text-align:center;font:700 72px Figtree;color:#1b1b1b">${END}</div>`, path.join(TMP, 'end.png'));
  await b.close();
}

function reel1() {
  mkdirSync(TMP, { recursive: true });
  const seg = (n) => path.join(TMP, `r1-${n}.mp4`);
  const hook = path.join(TMP, 'hook.png');
  // A 1.5s: her pick, a woman lathering in the shower, slow push-in, hook on top
  ff(['-ss', '0.4', '-t', '1.5', '-i', clip(5240831), '-loop', '1', '-i', hook, '-filter_complex',
    `[0:v]${FIT},scale=1146:2036,zoompan=z='1+0.04*in_time/1.5':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS},${GRAIN}[v];[v][1:v]overlay=shortest=1`,
    '-t', '1.5', ...enc, seg('a')]);
  // B 1.4s: the words filled with a pastel sunset, on cream; quick fade in
  ff(['-f', 'lavfi', '-t', '1.4', '-i', `color=${CREAM}:s=${W}x${H}:r=${FPS}`, '-ss', '2', '-t', '1.4', '-i', clip(35016536),
    '-loop', '1', '-t', '1.4', '-i', path.join(TMP, 'mask.png'), '-filter_complex',
    `[1:v]crop=iw:ih*0.5:0:0,${FIT},eq=brightness=0.06:saturation=1.25,format=rgba[s];[2:v]format=gray,scale=${W}:${H}[m];[s][m]alphamerge,fade=in:st=0:d=0.15:alpha=1[t];[0:v][t]overlay=shortest=1,${GRAIN}`,
    '-t', '1.4', ...enc, seg('b')]);
  // C 1.3s: the bar fills the screen (reads as a painting), easing in until the frame is all sun
  const up = 4, D = Math.round(1.3 * FPS);
  ff(['-i', SOAP, '-filter_complex',
    `[0:v]crop=${BAR.w}:${BAR.h}:${BAR.x}:${BAR.y},scale=${BAR.w * up}:${BAR.h * up}:flags=lanczos,` +
    `zoompan=z='1+6*pow(on/${D},2.2)':x='${(SUN.x - BAR.x) * up}-iw/zoom/2':y='${(SUN.y - BAR.y) * up}-ih/zoom/2':d=${D}:s=${W}x${H}:fps=${FPS},${GRAIN}`,
    '-frames:v', `${D}`, ...enc, seg('c')]);
  // D 0.8s: a real sun, starting zoomed right in on it and pulling out to the whole sunset
  const sun = { x: 556 * 2, y: 1056 * 2 };
  ff(['-ss', '3', '-t', '0.8', '-i', clip(32064395), '-filter_complex',
    `[0:v]${FIT},scale=${W * 2}:${H * 2},zoompan=z='1+11*pow(1-min(in_time/0.8\\,1),2.4)':` +
    `x='max(0,min(iw-iw/zoom,${sun.x}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${sun.y}-ih/zoom/2))':d=1:s=${W}x${H}:fps=${FPS},` +
    `eq=saturation=0.85:gamma=1.04,${GRAIN}`, '-t', '0.8', ...enc, seg('d')]);
  // E 1.2s: four pastel sunsets, 0.3s each, hard cuts
  const flash = [34918687, 26725993, 40774068, 35684730];
  ff([...flash.flatMap((id) => ['-ss', '3', '-t', '0.3', '-i', clip(id)]), '-filter_complex',
    flash.map((_, i) => `[${i}:v]${FIT},fps=${FPS},trim=duration=0.3,setpts=PTS-STARTPTS[f${i}]`).join(';') + ';' +
    flash.map((_, i) => `[f${i}]`).join('') + `concat=n=${flash.length}:v=1,${GRAIN}`, ...enc, seg('e')]);
  // F 1s: the whole bar on white, a slow settle, "It's a bar of soap."
  ff(['-loop', '1', '-t', '1', '-i', SOAP, '-loop', '1', '-t', '1', '-i', path.join(TMP, 'end.png'), '-filter_complex',
    `color=white:s=${W}x${H}:r=${FPS}:d=1[bg];[0:v]scale=1000:1000,format=rgba[s];[bg][s]overlay=40:380[v];[v][1:v]overlay,${GRAIN}`,
    '-t', '1', ...enc, seg('f')]);

  // join: hook over C, D and E too (not over the big words or the end); a short dissolve where soap sun meets real sun
  const out = path.join(OUT, 'reel-1.mp4');
  const XF = 0.13, dA = 1.5, dB = 1.4, dC = 1.3, dD = 0.8;
  const sfx = (f) => path.join(SFX, f);
  ff(['-i', seg('a'), '-i', seg('b'), '-i', seg('c'), '-i', seg('d'), '-i', seg('e'), '-i', seg('f'), '-loop', '1', '-i', hook,
    '-i', sfx('pop-light.mp3'), '-i', sfx('zoom-in.mp3'), '-i', sfx('whoosh-air.mp3'), '-i', sfx('sparkle.mp3'),
    '-filter_complex',
    [0, 1, 2, 3, 4, 5].map((i) => `[${i}:v]setsar=1[s${i}];`).join('') +
    `[s2][s3]xfade=transition=fade:duration=${XF}:offset=${dC - XF}[cd];[cd][s4]concat=n=2:v=1[cde];[6:v]format=rgba[hk];[cde][hk]overlay=shortest=1[cdeh];` +
    `[s0][s1][cdeh][s5]concat=n=4:v=1,format=yuv420p[v];` +
    `[7:a]adelay=${dA * 1000}|${dA * 1000},volume=0.7[a1];[8:a]adelay=${(dA + dB) * 1000}|${(dA + dB) * 1000},volume=0.6[a2];` +
    `[9:a]adelay=${(dA + dB + dC - 0.1) * 1000}|${(dA + dB + dC - 0.1) * 1000},volume=0.5[a3];` +
    `[10:a]adelay=${(dA + dB + dC + dD - XF + 1.2) * 1000}|${(dA + dB + dC + dD - XF + 1.2) * 1000},volume=0.6[a4];` +
    `[a1][a2][a3][a4]amix=inputs=4:normalize=0,apad,atrim=0:7[a]`,
    '-map', '[v]', '-map', '[a]', '-t', '7', '-r', `${FPS}`, '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  console.log(out);
}

const cmd = process.argv[2];
if (cmd === 'reel1') { mkdirSync(TMP, { recursive: true }); await texts(); reel1(); }
else console.log('usage: node build.mjs reel1');
