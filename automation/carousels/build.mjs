// Renders one carousel to ready-to-post PNGs (1080×1440, 3:4) plus caption.txt and preview.html,
// into the OneDrive exports folder so the files sync to Mercedes's phone for posting.
// Usage: node build.mjs <post-id> [--force]   (--force renders even when rule checks fail, for draft previews)
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { W, H, cfg, loadPost, postDir, fileUrl, esc, writeJson, launch } from './lib/common.mjs';
import { pageHtml, SIZES } from './lib/templates.mjs';
import { mediaResolver } from './lib/media.mjs';
import { lint } from './lib/rules.mjs';
import { fitSlides } from './lib/fit.mjs';
import { compare } from './lib/ledger.mjs';

const [id, ...flags] = process.argv.slice(2);
if (!id) { console.log('Usage: node build.mjs <post-id> [--force]'); process.exit(1); }
const force = flags.includes('--force');
const post = loadPost(id);
const brand = cfg('brand'), media = cfg('media');

// 1. Rule checks + ledger comparison
const { errors, warnings } = lint(post);
const { similar, warnings: ledgerWarn } = compare(post, media.photoReuseWeeks);
for (const e of errors) console.log('ERROR   ' + e);
for (const w of [...warnings, ...ledgerWarn]) console.log('WARN    ' + w);
for (const s of similar) console.log(`SIMILAR ${s.id} (${Math.round(s.score * 100)}%): ${s.topic} / "${s.hook}"`);
if (errors.length && !force) { console.log(`\n${errors.length} rule error(s). Fix them, or use --force for a draft preview.`); process.exit(1); }

// 2. Render
const { mediaFor, used } = mediaResolver();
const html = pageHtml(post, { brand, mediaFor });
const renderFile = path.join(postDir(id), '.render.html');
writeFileSync(renderFile, html);

const out = path.join(media.exportsDir, id);
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });

const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await pg.goto(fileUrl(renderFile), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
await pg.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));

const family = post.style === 'D' ? brand.fonts.bold.family : brand.fonts.highlight.family;
const fontOk = await pg.evaluate((f) => [...document.fonts].some((x) => x.family.replace(/"/g, '') === f && x.status === 'loaded'), family);
const problems = [];
if (!fontOk) problems.push(`font "${family}" did not load (offline? sandbox?)`);

// Shrink-to-fit inside each style's safe area; fail below the style's minimum size (= the slide needs splitting).
const sz = SIZES[post.style];
const fit = await fitSlides(pg, sz);
for (const f of fit) {
  if (!f.ok) problems.push(`slide ${f.i + 1}: copy doesn't fit even at ${f.size}px; split it into two slides`);
  else if (f.size < (f.i === 0 ? sz.cover : sz.body)) console.log(`fit     slide ${f.i + 1} shrunk to ${f.size}px (${f.lines} lines)`);
}

// Background photos actually loaded?
const broken = await pg.evaluate(() => Promise.all([...document.querySelectorAll('.bg')].map((b) => new Promise((r) => {
  const url = getComputedStyle(b).backgroundImage.slice(5, -2); const im = new Image(); im.onload = () => r(null); im.onerror = () => r(url); im.src = url;
}))));
for (const b of broken.filter(Boolean)) problems.push(`photo failed to load: ${decodeURI(b)}`);

const sections = await pg.$$('section.s');
for (const [i, el] of sections.entries()) await el.screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) });
await browser.close();

// 3. Caption + preview
const caption = `${post.caption.trim()}\n\n${post.hashtags.join(' ')}`;
writeFileSync(path.join(out, 'caption.txt'), caption);
const pngs = post.slides.map((_, i) => `slide-${String(i + 1).padStart(2, '0')}.png`);
writeFileSync(path.join(out, 'preview.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(id)}</title><style>
body{font:16px/1.5 system-ui,sans-serif;margin:0;background:#f4f4f5;color:#18181b}
main{max-width:1200px;margin:0 auto;padding:24px 16px}
h1{font-size:20px;margin:0 0 4px}.meta{color:#52525b;font-size:15px;margin-bottom:20px}
.phone{width:min(390px,100%);background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);margin-bottom:28px}
.rail{display:flex;overflow-x:auto;scroll-snap-type:x mandatory}.rail img{width:100%;flex:none;scroll-snap-align:start;aspect-ratio:3/4}
.cap{padding:12px 14px;white-space:pre-wrap;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.grid figure{margin:0}.grid img{width:100%;display:block;border-radius:8px}.grid figcaption{font-size:15px;color:#52525b}
.brief{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:24px;font-size:15px}
</style></head><body><main>
<h1>${esc(id)}</h1><div class="meta">Style ${esc(post.style)}${post.format ? ' · ' + esc(post.format) : ''}${post.palette ? ' · ' + esc(post.palette) : ''} · ${post.slides.length} slides · CTA: ${esc(post.cta.type)}</div>
<div class="brief"><b>Reader:</b> ${esc(post.brief.reader)}<br><b>Problem:</b> ${esc(post.brief.problem)}<br><b>Outcome:</b> ${esc(post.brief.outcome)}</div>
<div class="phone"><div class="rail">${pngs.map((p) => `<img src="${p}" alt="">`).join('')}</div><div class="cap">${esc(caption)}</div></div>
<div class="grid">${pngs.map((p, i) => `<figure><img src="${p}" alt=""><figcaption>${i + 1}</figcaption></figure>`).join('')}</div>
</main></body></html>`);
writeJson(path.join(postDir(id), 'build.json'), { builtAt: new Date().toISOString(), exportDir: out, mediaUsed: [...used], fit, problems });

if (problems.length) { console.log('\nPROBLEMS:\n' + problems.map((p) => '  ' + p).join('\n')); process.exitCode = 1; }
console.log(`\n${pngs.length} slides → ${out}\npreview: ${path.join(out, 'preview.html')}`);
