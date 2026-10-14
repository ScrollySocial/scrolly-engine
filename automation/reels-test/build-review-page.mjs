// Builds a local review page: the 8 corrected examples (with breakdowns) + every video that passed the mechanic screen.
// Players are TikTok's official embed (tiktok.com/embed/v2/<id>); nothing is downloaded or re-hosted.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-03-correction');
const ex = JSON.parse(fs.readFileSync(path.join(dir, 'examples.json'), 'utf8'));
const screen = JSON.parse(fs.readFileSync(path.join(dir, 'mechanic-screen.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const idOf = (url) => url.split('/video/')[1]?.split(/[?/]/)[0];
const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'K');
const player = (url, eager) => `<div class="player" data-id="${idOf(url)}">${eager ? `<iframe src="https://www.tiktok.com/embed/v2/${idOf(url)}" loading="lazy" allow="encrypted-media; fullscreen" allowfullscreen></iframe>` : `<button onclick="load(this)">▶ Load video</button>`}</div>`;

const cards = ex.examples.map((e, i) => {
  const vids = e.sourceFacts.examples || [];
  const facts = Object.entries(e.sourceFacts).filter(([k2]) => k2 !== 'examples').map(([k2, v]) => `<li><b>${esc(k2)}:</b> ${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</li>`).join('');
  return `<section class="card${e.label.includes('EXCLUDED') ? ' excluded' : ''}" id="${e.id}">
  <h2>${i + 1}. ${esc(e.name)} <span class="tag">${esc(e.label)}</span></h2>
  <div class="row"><div class="players">${vids.map((v) => `<figure>${player(v.url, true)}<figcaption><a href="${v.url}" target="_blank">${esc(v.url.split('/@')[1]?.split('/')[0])}</a> · ${v.durationSec}s${v.plays ? ' · ' + k(v.plays) + ' plays' : ''}${v.note ? ' · ' + esc(v.note) : ''}</figcaption></figure>`).join('')}</div>
  <div class="info">
    ${e.why ? `<p class="warn">${esc(e.why)}</p>` : ''}
    ${e.visualMechanic ? `<p><b>Visual mechanic:</b> ${esc(e.visualMechanic)}</p><p><b>Text mechanic:</b> ${esc(e.textMechanic)}</p><p><b>Audio mechanic:</b> ${esc(e.audioMechanic)}</p><p><b>Difficulty:</b> ${esc(e.difficulty)} · <b>Filming time:</b> ${esc(e.filmingTime)}</p><p><b>Adaptation:</b> ${esc(e.adaptation)}</p>` : ''}
    <p class="small"><b>Visual check:</b> ${esc(e.visualCheck)}</p>
    <details><summary>Source facts</summary><ul class="small">${facts}</ul></details>
    <label>My verdict: <select data-key="v-${e.id}"><option></option><option>Yes, this is it</option><option>Close</option><option>No</option></select></label>
    <textarea data-key="n-${e.id}" placeholder="Notes"></textarea>
  </div></div></section>`;
}).join('\n');

const rows = screen.videos.map((v, i) => `<tr><td>${i + 1}</td><td>${player(v.url, false)}</td><td><a href="${v.url}" target="_blank">@${esc(v.author)}</a><br><span class="small">${Math.round(v.durationSec)}s · ${v.ageDays}d old · ${k(v.plays)} plays · ratio ${v.ratio}</span></td><td class="small">${esc(v.soundName)}<br>sound used by ${v.soundCreators} creators (${v.soundCreatorsRecent14} in 14d)${v.borrowedSound ? ' · borrowed sound' : ''}${v.template ? ' · template' : ''}</td><td class="small">${esc(v.caption.slice(0, 140))}</td><td><select data-key="s-${v.videoId}"><option></option><option>Steal-able</option><option>Maybe</option><option>No</option></select></td></tr>`).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reels to Steal Review</title>
<style>
:root{--ink:#08152c;--bg:#fbf8f3;--card:#fff;--teal:#94ece1;--line:#e5e0d8}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,Arial,sans-serif}
main{max-width:1200px;margin:0 auto;padding:16px}
h1{font-size:26px;margin:8px 0}.lead{margin:0 0 18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 18px}.card.excluded{opacity:.75;border-style:dashed}
.card h2{font-size:19px;margin:0 0 12px}.tag{font-size:12px;background:var(--teal);border-radius:20px;padding:3px 10px;margin-left:6px;vertical-align:middle}
.row{display:flex;gap:16px;flex-wrap:wrap}.players{display:flex;gap:10px;flex-wrap:wrap}.info{flex:1;min-width:280px}
figure{margin:0;width:260px}figcaption{font-size:12px;margin-top:4px}
.player{width:260px;height:470px;background:#000;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.player iframe{width:100%;height:100%;border:0}.player button{font:inherit;padding:10px 16px;border-radius:20px;border:0;cursor:pointer}
table .player{width:180px;height:320px}
.small{font-size:12px;color:#44506a}.warn{background:#fff4d6;padding:8px;border-radius:8px}
textarea{width:100%;min-height:60px;margin-top:8px;font:inherit;box-sizing:border-box}select{font:inherit;margin-left:6px}
table{width:100%;border-collapse:collapse;background:var(--card)}td{border-bottom:1px solid var(--line);padding:8px;vertical-align:top}
details{margin:6px 0}#copy{position:sticky;top:0;background:var(--ink);color:#fff;padding:10px 16px;z-index:5;display:flex;gap:12px;align-items:center}
#copy button{font:inherit;border:0;border-radius:18px;padding:6px 14px;cursor:pointer}
@media(max-width:640px){figure,.player{width:100%}}
</style></head><body>
<div id="copy">Your picks save in this browser. <button onclick="copyNotes()">Copy my verdicts for Claude</button><span id="msg"></span></div>
<main>
<h1>Reels to Steal: review</h1>
<p class="lead">Part 1: the ${ex.examples.length} examples from the correction pass, with my breakdowns. Part 2: all ${screen.videos.length} videos that passed the loose screen (15s or less, recent, 50K+ plays, reuse or breakout signal). These were not all reviewed by me; click ▶ to load each one. Players are TikTok's own embeds.</p>
${cards}
<h1 id="all">Part 2: all ${screen.videos.length} screen-passers</h1>
<table><tbody>${rows}</tbody></table>
</main>
<script>
function load(b){const d=b.parentNode;d.innerHTML='<iframe src="https://www.tiktok.com/embed/v2/'+d.dataset.id+'" allow="encrypted-media; fullscreen" allowfullscreen></iframe>'}
const store={get(k){try{return localStorage.getItem('r2s:'+k)}catch(e){return null}},set(k,v){try{localStorage.setItem('r2s:'+k,v)}catch(e){}}};
document.querySelectorAll('[data-key]').forEach(el=>{const v=store.get(el.dataset.key);if(v)el.value=v;el.addEventListener('input',()=>store.set(el.dataset.key,el.value));el.addEventListener('change',()=>store.set(el.dataset.key,el.value))});
function copyNotes(){const out=[];document.querySelectorAll('[data-key]').forEach(el=>{if(el.value)out.push(el.dataset.key+': '+el.value)});const t=out.join('\\n')||'(no verdicts yet)';navigator.clipboard.writeText(t).then(()=>{document.getElementById('msg').textContent='Copied '+out.length+' items. Paste them to Claude.'},()=>{prompt('Copy this:',t)})}
</script></body></html>`;
fs.writeFileSync(path.join(dir, 'review.html'), html);
console.log('wrote', path.join(dir, 'review.html'), `(${ex.examples.length} examples, ${screen.videos.length} screen-passers)`);
