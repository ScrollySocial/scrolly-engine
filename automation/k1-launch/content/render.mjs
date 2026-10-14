// Renders the Challenge Content pages (weekly Reels, carousel templates, Story templates) to WordPress page HTML.
// Usage: node content/render.mjs  ->  content/dist/{reels,carousels,stories}.html (+ preview.html)
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEEK, REELS } from './week-01-reels.mjs';
import { CAROUSELS, STORIES } from './templates.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'dist');
mkdirSync(out, { recursive: true });
// Square brackets are entity-encoded so WordPress never runs copy like "[product]" as a shortcode.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');

// Designed versions from library/: Canva template links + uploaded files (pptx fallback, ideas PDF, example strip).
const LINKS = JSON.parse(readFileSync(path.join(here, 'library', 'canva-links.json'), 'utf8')).templates;
const mediaFile = path.join(here, 'library', 'site-media.json');
const MEDIA = existsSync(mediaFile) ? JSON.parse(readFileSync(mediaFile, 'utf8')) : {};
function designed(id, name) {
  const l = LINKS[id]?.link, m = MEDIA[id] || {};
  if (!l) throw new Error(`no Canva link for ${id}`);
  const strip = m.thumb ? `<div class="strip"><img src="${esc(m.thumb.url)}" width="${m.thumb.w / 2}" height="${m.thumb.h / 2}" loading="lazy" alt="Finished example of the ${esc(name)} template"></div>` : '';
  const pdf = m.pdf ? `<a class="lnk" href="${esc(m.pdf.url)}" target="_blank" rel="noopener">Ideas for 8 businesses (PDF)</a>` : '';
  const pptx = m.pptx ? `<p class="src">Canva link not opening? <a href="${esc(m.pptx.url)}" download>Download the PowerPoint file</a> and drag it onto canva.com on a computer.</p>` : '';
  return `<div class="tpl">${strip}<div class="acts"><a class="btn" href="${esc(l)}" target="_blank" rel="noopener">Open in Canva</a>${pdf}</div>${pptx}</div>`;
}
const cid = (i) => 'C' + String(i + 1).padStart(2, '0');
const sid = (i) => 'S' + String(i + 1).padStart(2, '0');
const HOW = (size, extra) => `<ol class="how"><li>Tap <b>Open in Canva</b>, then <b>Use template</b>. Free Canva works, and you get your own copy.</li><li>Type over the words. The blue notes tell you what to write.</li><li>Replace the photos with yours: select one, then Replace.</li>${extra}<li>Delete everything blue, then download as PNG (${size}).</li></ol>`;

if (REELS.length !== 25) throw new Error(`Week ${WEEK.n} has ${REELS.length} Reels, expected 25`);
if (CAROUSELS.length !== 30 || STORIES.length !== 30) throw new Error(`templates: ${CAROUSELS.length} carousels, ${STORIES.length} stories (expected 30/30)`);

// Card styles live in website/scrolly-site/chrome/k1-account.css (v3, 2026-10-03), the global stylesheet pushed by
// install-chrome.mjs, so the pages carry markup only and restyles need no republish.
const css = '';

const wrap = (inner) => `<!-- wp:html -->\n<div class="k1c">${css}${inner}</div>\n<!-- /wp:html -->\n`;

// Example video: loads only when tapped (official Instagram / TikTok embeds; we never re-host anyone's video).
function exampleBlock(m) {
  if (!m) return '';
  const src = m.ig ? `data-ig="${esc(m.ig)}"` : `data-tt="${esc(m.tt)}"`;
  const where = m.ig ? 'Instagram' : 'TikTok';
  const audio = m.audio ? `<a class="au" href="https://www.instagram.com/reels/audio/${esc(m.audio)}/" target="_blank" rel="noopener">Open this audio in Instagram</a>` : '';
  return `<div class="ex"><button type="button" ${src}>▶ Watch an example (${where})</button>${audio}<div class="slot"></div></div>`;
}
const LAZY = `<p class="src" style="margin-top:14px">Examples are real public posts shown through Instagram's and TikTok's own embeds, to show the format. Use the format, not their content. On your phone, "Open this audio in Instagram" takes you to the sound, where you can tap Use audio.</p>`;

const reels = wrap(`<div class="intro"><b>${esc(WEEK.label)}: ${esc(WEEK.dates)}.</b> 25 current Reel formats people are copying right now, each explained in plain words with ways to use it for your business. Pick the ones that fit; your This Week list says how many to film. Borrow the format and the text idea, and bring your own footage, buyer, and next step. We can't give you rights to any song: when the audio note says to swap it, swap it.</div>`
  + REELS.map((r, i) => `<details class="card"${i < 3 ? ' open' : ''}><summary><span class="n">${i + 1}</span><span>${esc(r.name)}</span><span class="job">${esc(r.job)}</span></summary><div class="body">`
    + `<p class="src">${esc(r.src)} · about ${esc(r.time)} to make</p>`
    + `<p><b>Film:</b> ${esc(r.film)}</p><p><b>On-screen text:</b> ${esc(r.text)}</p>`
    + `<p><b>For your business:</b></p><ul>${r.ex.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`
    + exampleBlock(r.media)
    + `<p class="audio">${esc(r.audio)}</p></div></details>`).join('') + LAZY);

const carousels = wrap(`<div class="intro"><b>30 carousel templates, ready in Canva.</b> Carousels do the Trust job: explaining, answering doubts, and proving. Slide 1 is the hook, slide 2 has to make sense on its own, the middle proves it, and the last slide is the action. Put the same action in your caption.`
  + HOW('1080 × 1440, 3:4', '') + `<p class="src" style="margin:8px 0 0">Example businesses are illustrative. Each template's ideas PDF shows it filled in for 8 kinds of business.</p></div>`
  + CAROUSELS.map((c, i) => `<details class="card"><summary><span class="n">${i + 1}</span><span>${esc(c.name)}</span><span class="job">${esc(c.job)}</span></summary><div class="body">`
    + `<p class="src">Best for: ${esc(c.best)}</p>${designed(cid(i), c.name)}<p><b>What each slide does:</b></p><ol>${c.slides.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
    + `<p><b>Another example:</b> ${esc(c.ex)}</p><p><b>Caption ask:</b> ${esc(c.ask)}</p><p><b>Did it do its job?</b> Look at ${esc(c.check)}.</p></div></details>`).join(''));

const stories = wrap(`<div class="intro"><b>30 Story templates, ready in Canva.</b> Stories are for people who already know you, and they're where warm people decide to buy. Each template is 4 frames: question or problem → proof or demo → answer or result → the ask. Use one sticker per frame, keep the link sticker inside the safe zone, and use urgency only when it's true.`
  + HOW('1080 × 1920, 9:16', '<li>Blue boxes mark where an Instagram sticker goes. Add the real sticker in the Instagram app.</li>') + `<p class="src" style="margin:8px 0 0">Example businesses are illustrative. Each template's ideas PDF shows it filled in for 8 kinds of business.</p></div>`
  + `<details class="card" open><summary><span class="n">★</span><span>Weekly Reel series</span><span class="job">Reach + Trust</span></summary><div class="body">`
    + `<p class="src">Bonus Reel template, 1080 × 1920. One named show, same look every week, a new episode each time.</p>${designed('R01', 'Weekly Reel series')}`
    + `<p><b>What each page does:</b></p><ol><li>Cover: series name, episode number, this week's title. Keep the words in the middle so your grid doesn't crop them.</li><li>First 2 seconds: your clip + this episode's hook.</li><li>The useful part: the one thing to remember.</li><li>Next episode: when it comes out and what it's about.</li></ol>`
    + `<p><b>Each week:</b> duplicate your design and change only the title, number and clips. Download page 1 as PNG for the cover and pages 2 to 4 as one MP4. In Instagram, post the MP4 as a Reel, then Edit cover → Add from camera roll.</p><p><b>Did it do its job?</b> Look at follows, saves, and people asking for the next episode.</p></div></details>`
  + STORIES.map((s, i) => `<details class="card"><summary><span class="n">${i + 1}</span><span>${esc(s.name)}</span><span class="job">${esc(s.job)}</span></summary><div class="body">`
    + `${designed(sid(i), s.name)}<p><b>What each frame does:</b></p><ol>${s.frames.map((f) => `<li>${esc(f)}</li>`).join('')}</ol><p><b>Did it do its job?</b> Look at ${esc(s.check)}.</p></div></details>`).join(''));

writeFileSync(path.join(out, 'reels.html'), reels);
writeFileSync(path.join(out, 'carousels.html'), carousels);
writeFileSync(path.join(out, 'stories.html'), stories);
writeFileSync(path.join(out, 'preview.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Challenge Content preview</title><body style="max-width:860px;margin:24px auto;padding:0 16px"><h2>Reels</h2>${reels}<h2>Carousels</h2>${carousels}<h2>Stories</h2>${stories}</body>`);
console.log(`rendered: ${REELS.length} Reels (${WEEK.label}), ${CAROUSELS.length} carousels, ${STORIES.length} Stories`);
