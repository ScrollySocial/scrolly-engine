// Renders the Challenge Content pages (weekly Reels, carousel templates, Story templates) to WordPress page HTML.
// Usage: node content/render.mjs  ->  content/dist/{reels,carousels,stories}.html (+ preview.html)
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEEK, REELS } from './week-01-reels.mjs';
import { CAROUSELS, STORIES } from './templates.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'dist');
mkdirSync(out, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

if (REELS.length !== 25) throw new Error(`Week ${WEEK.n} has ${REELS.length} Reels, expected 25`);
if (CAROUSELS.length !== 30 || STORIES.length !== 30) throw new Error(`templates: ${CAROUSELS.length} carousels, ${STORIES.length} stories (expected 30/30)`);

const css = `<style>
.k1c{font-family:"Public Sans",system-ui,Arial,sans-serif;color:#000}
.k1c .intro{background:#fbf8f3;border-radius:12px;padding:14px 16px;margin:0 0 16px;font-size:15px;line-height:1.45}
.k1c details.card{background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:12px;margin:0 0 10px;padding:0}
.k1c details.card>summary{cursor:pointer;list-style:none;padding:14px 16px;display:flex;gap:12px;align-items:baseline;font-weight:800;font-size:16px;line-height:1.3}
.k1c details.card>summary::-webkit-details-marker{display:none}
.k1c .n{font-family:"Archivo","Arial Black",sans-serif;font-weight:900;min-width:28px;color:#000}
.k1c .job{margin-left:auto;background:#94ece1;border-radius:20px;padding:2px 10px;font-size:12px;font-weight:800;white-space:nowrap}
.k1c .body{padding:0 16px 16px 56px;font-size:15px;line-height:1.5}
.k1c .body p{margin:0 0 8px}
.k1c .body b{font-weight:800}
.k1c .src{font-size:13px;color:#4a4a4a}
.k1c ol,.k1c ul{margin:4px 0 10px;padding-left:20px}
.k1c li{margin:0 0 4px}
.k1c .audio{background:#fbf8f3;border-radius:8px;padding:8px 10px;font-size:13px}
@media(max-width:600px){.k1c .body{padding-left:16px}.k1c details.card>summary{flex-wrap:wrap}.k1c .job{margin-left:0}}
</style>`;

const wrap = (inner) => `<!-- wp:html -->\n<div class="k1c">${css}${inner}</div>\n<!-- /wp:html -->\n`;

const reels = wrap(`<div class="intro"><b>${esc(WEEK.label)}: ${esc(WEEK.dates)}.</b> 25 current Reel formats people are copying right now, each explained in plain words with ways to use it for your business. Pick the ones that fit; your This Week list says how many to film. Borrow the format and the text idea, and bring your own footage, buyer, and next step. We can't give you rights to any song: when the audio note says to swap it, swap it.</div>`
  + REELS.map((r, i) => `<details class="card"${i < 3 ? ' open' : ''}><summary><span class="n">${i + 1}</span><span>${esc(r.name)}</span><span class="job">${esc(r.job)}</span></summary><div class="body">`
    + `<p class="src">${esc(r.src)} · about ${esc(r.time)} to make</p>`
    + `<p><b>Film:</b> ${esc(r.film)}</p><p><b>On-screen text:</b> ${esc(r.text)}</p>`
    + `<p><b>For your business:</b></p><ul>${r.ex.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`
    + `<p class="audio">${esc(r.audio)}</p></div></details>`).join(''));

const carousels = wrap(`<div class="intro"><b>30 carousel templates.</b> Carousels do the Trust job: explaining, answering doubts, and proving. Every template follows the Playbook skeleton: slide 1 is the first hook, slide 2 is a second first impression (it has to make sense on its own), the middle proves it, and the last slide is the action. Make slides 1080 × 1440 (3:4), about 25 words or fewer each, and put the action on the last slide and in the caption. Examples use the Playbook's illustrative businesses.</div>`
  + CAROUSELS.map((c, i) => `<details class="card"><summary><span class="n">${i + 1}</span><span>${esc(c.name)}</span><span class="job">${esc(c.job)}</span></summary><div class="body">`
    + `<p class="src">Best for: ${esc(c.best)}</p><ol>${c.slides.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
    + `<p><b>Example:</b> ${esc(c.ex)}</p><p><b>Caption ask:</b> ${esc(c.ask)}</p><p><b>Did it do its job?</b> Look at ${esc(c.check)}.</p></div></details>`).join(''));

const stories = wrap(`<div class="intro"><b>30 Story templates.</b> Stories are for people who already know you, and they're where warm people decide to buy. Each template is 4 frames: question or problem → proof or demo → answer or result → the ask. Use one sticker per frame, keep the link sticker inside the safe zone, and use urgency only when it's true. Save your best ones to Highlights.</div>`
  + STORIES.map((s, i) => `<details class="card"><summary><span class="n">${i + 1}</span><span>${esc(s.name)}</span><span class="job">${esc(s.job)}</span></summary><div class="body">`
    + `<ol>${s.frames.map((f) => `<li>${esc(f)}</li>`).join('')}</ol><p><b>Did it do its job?</b> Look at ${esc(s.check)}.</p></div></details>`).join(''));

writeFileSync(path.join(out, 'reels.html'), reels);
writeFileSync(path.join(out, 'carousels.html'), carousels);
writeFileSync(path.join(out, 'stories.html'), stories);
writeFileSync(path.join(out, 'preview.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Challenge Content preview</title><body style="max-width:860px;margin:24px auto;padding:0 16px"><h2>Reels</h2>${reels}<h2>Carousels</h2>${carousels}<h2>Stories</h2>${stories}</body>`);
console.log(`rendered: ${REELS.length} Reels (${WEEK.label}), ${CAROUSELS.length} carousels, ${STORIES.length} Stories`);
