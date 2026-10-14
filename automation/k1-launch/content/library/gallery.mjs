// Review gallery + upload folder for the whole library.
//   dist/gallery/index.html + one JPG strip per template per view (template / example), for visual review.
//   dist/canva-upload/  every .pptx in one folder: select all, drag into Canva in one go.
// Usage: node gallery.mjs   (after node build.mjs)
import puppeteer from 'puppeteer-core';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
const gal = path.join(dist, 'gallery');
const up = path.join(dist, 'canva-upload');
rmSync(up, { recursive: true, force: true });
for (const d of [gal, up]) mkdirSync(d, { recursive: true });

// template metadata from the specs
const meta = {};
for (const f of readdirSync(path.join(here, 'src')).filter((f) => /^([cs]\d\d-|carousels-|stories-).*\.mjs$/.test(f))) {
  for (const s of [].concat((await import(pathToFileURL(path.join(here, 'src', f)))).default)) meta[s.slug] = s;
}
const items = [];
for (const kind of ['carousels', 'stories', 'reels']) {
  const base = path.join(dist, kind);
  if (!existsSync(base)) continue;
  for (const slug of readdirSync(base).sort()) if (meta[slug]) items.push({ kind, slug, dir: path.join(base, slug), s: meta[slug] });
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const page = await browser.newPage();
for (const it of items) {
  for (const f of readdirSync(it.dir).filter((f) => f.endsWith('.pptx'))) copyFileSync(path.join(it.dir, f), path.join(up, f));
  for (const mode of ['template', 'example']) {
    const files = readdirSync(path.join(it.dir, 'previews')).filter((f) => f.startsWith(mode)).sort();
    const h = it.kind === 'stories' ? 560 : 420;
    const imgs = files.map((f) => `<img src="data:image/png;base64,${readFileSync(path.join(it.dir, 'previews', f)).toString('base64')}" style="height:${h}px;border-radius:6px">`).join('');
    await page.setViewport({ width: 400, height: h + 20 });
    await page.setContent(`<html><body style="margin:0;padding:10px;background:#ffffff;display:inline-flex;gap:10px">${imgs}</body></html>`, { waitUntil: 'load' });
    const w = await page.evaluate(() => document.body.scrollWidth);
    await page.setViewport({ width: w, height: h + 20 });
    await page.screenshot({ path: path.join(gal, `${it.s.id}-${mode}.jpg`), type: 'jpeg', quality: 72, clip: { x: 0, y: 0, width: w, height: h + 20 } });
  }
}
await browser.close();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const section = (it) => `<section class="tpl" id="${it.s.id}"><div class="hd"><span class="id">${it.s.id}</span><h2>${esc(it.s.name)}</h2><span class="pill">${esc(it.s.job)}</span></div>
<dl><div><dt>What it’s for</dt><dd>${esc(it.s.forr)}</dd></div><div><dt>When to use it</dt><dd>${esc(it.s.when)}</dd></div><div><dt>Example</dt><dd>${esc(it.s.example)}</dd></div></dl>
<div class="strip"><img class="v-template" src="${it.s.id}-template.jpg" alt="${esc(it.s.name)}: what the customer opens" loading="lazy"><img class="v-example" src="${it.s.id}-example.jpg" alt="${esc(it.s.name)}: finished example" loading="lazy"></div></section>`;
const car = items.filter((i) => i.kind === 'carousels'), sto = items.filter((i) => i.kind === 'stories');
const html = `<title>Challenge Template Library</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Layout: review gallery. Sticky view switch; each template = header, three facts, one horizontal strip. */
:root{--bg:#f3f3f1;--surface:#fff;--fg:#1d1d20;--muted:#5f5f66;--line:#dcdcd8;--chip:#e9e9e5;--accent:#2f6bff;--f:'IBM Plex Sans',system-ui,Arial,sans-serif;--m:'IBM Plex Mono',Consolas,monospace}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#151517;--surface:#1e1e21;--fg:#ececea;--muted:#a3a3a9;--line:#323236;--chip:#2a2a2e;--accent:#7a9dff;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#151517;--surface:#1e1e21;--fg:#ececea;--muted:#a3a3a9;--line:#323236;--chip:#2a2a2e;--accent:#7a9dff;color-scheme:dark}
*{box-sizing:border-box}body{background:var(--bg);color:var(--fg);font:15px/1.5 var(--f);margin:0}
.wrap{max-width:1240px;margin:0 auto;padding-inline:20px;padding-block:28px 80px}
h1{font:700 clamp(26px,4vw,36px)/1.1 var(--f);margin:0 0 8px}.lede{color:var(--muted);max-width:72ch;margin:0 0 16px}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;padding-block:12px}
.seg{display:inline-flex;background:var(--chip);border-radius:999px;padding:3px}
.seg button{border:0;background:none;color:var(--fg);font:600 13px var(--f);padding:7px 14px;border-radius:999px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--surface);box-shadow:0 1px 2px rgba(0,0,0,.18)}
button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.jump{display:flex;flex-wrap:wrap;gap:6px}.jump a{font:500 12px var(--m);color:var(--fg);text-decoration:none;background:var(--chip);padding:4px 8px;border-radius:6px}
.gh{font:600 12px var(--m);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:40px 0 0;padding-top:6px;border-top:2px solid var(--fg)}
.tpl{padding-block:24px;border-bottom:1px solid var(--line)}
.hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin-bottom:8px}.id{font:600 13px var(--m);color:var(--muted)}
h2{font:700 20px/1.2 var(--f);margin:0}.pill{font:600 11px var(--m);text-transform:uppercase;letter-spacing:.04em;background:var(--chip);padding:3px 9px;border-radius:999px}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:6px 24px;margin:0 0 12px;font-size:14px}dl div{min-width:0}
dt{font:600 11px var(--m);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}dd{margin:0}
.strip{overflow-x:auto;border-radius:8px}.strip img{display:block;height:300px;width:auto;max-width:none}
.show-example .v-template,.show-template .v-example{display:none}
@media (max-width:600px){.strip img{height:220px}}
</style>
<div class="wrap show-template" id="w">
<h1>Challenge Template Library</h1>
<p class="lede">All ${car.length} carousel templates and ${sto.length} Story templates, built from the real template files. <b>What you open</b> shows the file a customer gets: example words to type over, blue notes saying what to write, and photo slots to replace. <b>Finished example</b> shows it with the blue removed and stock photos standing in. Scroll each row sideways to see every slide.</p>
<div class="bar"><div class="seg" id="mode"><button type="button" data-v="template" aria-pressed="true">What you open</button><button type="button" data-v="example" aria-pressed="false">Finished example</button></div>
<nav class="jump" aria-label="Jump to template">${items.map((i) => `<a href="#${i.s.id}">${i.s.id}</a>`).join('')}</nav></div>
<h2 class="gh">Carousels · 1080 × 1440</h2>${car.map(section).join('')}
<h2 class="gh">Stories · 1080 × 1920</h2>${sto.map(section).join('')}
</div>
<script>
const w=document.getElementById('w');
document.getElementById('mode').addEventListener('click',(e)=>{const b=e.target.closest('button');if(!b)return;w.className='wrap show-'+b.dataset.v;document.querySelectorAll('#mode button').forEach((x)=>x.setAttribute('aria-pressed',String(x===b)));});
</script>`;
writeFileSync(path.join(gal, 'index.html'), html);
console.log(`gallery: ${items.length} templates → dist/gallery/index.html · uploads: ${readdirSync(up).length} files → dist/canva-upload/`);
