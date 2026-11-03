// Title-font sample sheet: "51 days until Christmas!" in each candidate font, red with a white outline, over a clip still.
//   node font-sheet.mjs                                  current font + every font in fonts/
//   node font-sheet.mjs "Name=C:/path/font.otf" ...      also try these (e.g. fonts not cleared for commercial use yet)
// → <exports>/christmas-countdown/font-compare.png
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'christmas-countdown');
const CLIP = path.join(HERE, '../../reel-template-pack/assets/Christmas/14988566_1080_1920_60fps.mp4');
const MIME = { '.woff2': 'font/woff2', '.otf': 'font/otf', '.ttf': 'font/ttf' };
const FONTS = [
  ['Handwritten (now)', path.join(HERE, '../../reel-hf/lib/assets/fonts/covered-by-your-grace.woff2')],
  ...readdirSync(path.join(HERE, 'fonts')).filter((f) => MIME[path.extname(f)]).map((f) => [path.parse(f).name, path.join(HERE, 'fonts', f)]),
  ...process.argv.slice(2).map((a) => a.split('=')),
];

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const bg = path.join(OUT, '.font-bg.jpg');
execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', '-ss', '2', '-i', CLIP, '-frames:v', '1', '-vf', 'crop=1080:640:0:260', bg], { stdio: 'ignore' });

const b64 = (f) => readFileSync(f).toString('base64');
const faces = FONTS.map(([, f], i) => `@font-face { font-family: F${i}; src: url(data:${MIME[path.extname(f)]};base64,${b64(f)}); }`).join('\n');
const tiles = FONTS.map(([name], i) => `<div class="tile"><div class="t" style="font-family: F${i}">51 days until Christmas!</div><div class="n">${i + 1}. ${name}</div></div>`).join('');
const b = await launch();
const page = await b.newPage();
await page.setViewport({ width: 2160, height: 640 * Math.ceil(FONTS.length / 2) });
await page.setContent(`<!doctype html><html><head><style>${faces}
  body { margin: 0; display: grid; grid-template-columns: 1fr 1fr; background: #111; }
  .tile { position: relative; height: 640px; background: url(data:image/jpeg;base64,${b64(bg)}) center/cover;
          display: flex; align-items: center; justify-content: center; text-align: center; }
  .t { font-size: 120px; line-height: 1.05; color: #C2362F; -webkit-text-stroke: 14px #fff; paint-order: stroke fill;
       padding: 0 60px; text-wrap: balance; filter: drop-shadow(0 4px 10px rgba(0,0,0,.25)); }
  .n { position: absolute; left: 20px; bottom: 16px; font: 700 34px Arial; color: #fff; background: rgba(0,0,0,.55); padding: 4px 14px; border-radius: 8px; }
</style></head><body>${tiles}</body></html>`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// a font that failed to load falls back silently: say so instead of showing a wrong sample
const bad = await page.evaluate((n) => [...Array(n).keys()].filter((i) => !document.fonts.check(`120px F${i}`)), FONTS.length);
if (bad.length) console.log('NOT LOADED:', bad.map((i) => FONTS[i][0]).join(', '));
const file = path.join(OUT, 'font-compare.png');
await page.screenshot({ path: file });
await b.close();
console.log(file);
