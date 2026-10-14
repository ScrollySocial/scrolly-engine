// One link for every Reel in review: http://localhost:4320 lists each Reel with where it stands (lib/pipeline.mjs)
// and opens its own review page (lib/review/server.mjs), started on demand on a fixed port per Reel (4331, 4332, …;
// kept in _runs/hub-ports.json so links stay the same across days). New Reel folders show up on refresh.
// Usage: node lib/review/hub.mjs            (runs in this terminal)
//        node lib/review/hub.mjs --start    (starts it in the background if it isn't running yet, then exits;
//                                            the overnight and evening runs use this)
import { createServer, request } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allReels, reelStatus, ROOT, coverFile } from '../pipeline.mjs';
import { readSchedule } from '../schedule.mjs';

const HUB = 4320, FIRST = 4331;
const SELF = fileURLToPath(import.meta.url);
const RUNS = path.join(ROOT, '_runs');
mkdirSync(RUNS, { recursive: true });
const PORTS = path.join(RUNS, 'hub-ports.json');

const alive = (port) => new Promise((ok) => {
  const r = request({ host: '127.0.0.1', port, path: '/api/state', timeout: 1500 }, (res) => { res.resume(); ok(true); });
  r.on('error', () => ok(false)); r.on('timeout', () => { r.destroy(); ok(false); }); r.end();
});

if (process.argv.includes('--start')) {
  if (await alive(HUB)) {
    console.log(`Review hub already running: http://localhost:${HUB}`);
  } else {
    const out = openSync(path.join(RUNS, 'hub.log'), 'a');
    spawn(process.execPath, [SELF], { cwd: ROOT, detached: true, stdio: ['ignore', out, out], windowsHide: true }).unref();
    console.log(`Review hub started: http://localhost:${HUB}`);
  }
  process.exit(0);
}

const ports = existsSync(PORTS) ? JSON.parse(readFileSync(PORTS, 'utf8')) : {};
const portFor = (slug) => {
  if (!ports[slug]) { ports[slug] = Math.max(FIRST - 1, ...Object.values(ports)) + 1; writeFileSync(PORTS, JSON.stringify(ports, null, 1)); }
  return ports[slug];
};
const children = {};
async function ensure(slug) {
  const port = portFor(slug);
  if (await alive(port)) return port;
  if (!children[slug] || children[slug].exitCode != null) {
    children[slug] = spawn(process.execPath, [path.join(ROOT, 'lib/review/server.mjs'), slug, '--port', String(port)], { cwd: path.join(ROOT, '..', '..'), stdio: 'ignore', windowsHide: true });
  }
  for (let i = 0; i < 40 && !(await alive(port)); i++) await new Promise((r) => setTimeout(r, 250));
  return port;
}

const LABEL = {
  plan: ['Plan it', 'Your turn'],
  edit: ['Edit it', 'Your turn'],
  approve: ['Approve it', 'Your turn'],
  revise: ['Claude is making your changes', "Claude's turn"],
  sounds: ['Claude is adding sounds', "Claude's turn"],
  render: ['Video gets made tonight', "Claude's turn"],
  post: ['Claude adds it to Buffer', "Claude's turn"],
  'no-page': ['Being drafted', "Claude's turn"],
  done: ['Done', 'Queued or posted'],
};
const GROUPS = [['Your turn', ['approve', 'edit', 'plan']], ["Claude's turn", ['revise', 'sounds', 'render', 'post', 'no-page']], ['Done', ['done']]];
const STEPS = [['look', 'Plan it'], ['sound', 'Edit it'], ['video', 'Approve it']];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const when = (iso) => new Date(iso).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });

// one Reel's three steps: done ✓ / sent to Claude ↺ / you've started ● / not yet
function tracker(r) {
  const A = r.approved || {}, k = r.asks || {}, revised = r.pass?.revised;
  const valid = (s) => A[s] && !(revised && A[s] < revised);
  const open = { look: k.look + k.general, sound: k.look + k.general + k.sound, video: k.video };
  const sent = r.stage === 'revise';
  const current = { plan: 'look', edit: 'sound', approve: 'video', revise: null }[r.stage];
  return STEPS.map(([s, name]) => {
    let cls = 'todo', note = 'Not yet';
    if (r.stage === 'done') { cls = 'ok'; note = 'Done'; }
    else if (open[s] && (valid(s) || sent)) { cls = 'sent'; note = 'Sent to Claude'; } // a later step's send carries this step's changes too
    else if (valid(s)) { cls = 'ok'; note = 'Approved'; }
    else if (s === current && r.savedAt && (!revised || r.savedAt > revised)) { cls = 'wip'; note = "You've started"; }
    else if (s === current) { cls = 'next'; note = revised ? 'Check the changes' : 'Ready for you'; }
    return `<span class="stp ${cls}" title="${name}: ${note}"><i></i>${name}<small>${note}</small></span>`;
  }).join('');
}

// the one plain sentence under the title
function line(r) {
  const saved = r.savedAt ? ` Last saved ${when(r.savedAt)}.` : '';
  switch (r.stage) {
    case 'plan': return r.pass?.revised ? `Claude made your changes (${when(r.pass.revised)}). Check them in Plan it.` : r.savedAt ? `You're partway through Plan it.${saved}` : 'Not started. Start with Plan it: moments, script and cover.';
    case 'edit': return r.pass?.revised ? `Claude made your changes (${when(r.pass.revised)}). Check them in Edit it.` : `Plan it is done. Next: sounds, captions, music and transitions.${saved}`;
    case 'approve': return 'The video is ready. Watch it and approve the caption.';
    case 'revise': return `You sent changes${r.savedAt ? ' ' + when(r.savedAt) : ''}. Claude makes them, then it comes back to you.`;
    case 'sounds': return 'You approved the plan. Claude adds the sounds, music and transitions, then Edit it opens.';
    case 'render': return 'You approved the edit. The video gets made in the overnight run.';
    case 'post': return 'You approved it. Claude adds it to the Buffer queue.';
    case 'no-page': return 'Claude is still drafting this one.';
    default: return 'Queued or posted.';
  }
}

function page() {
  const rows = allReels().map(reelStatus);
  const title = (slug) => { try { return JSON.parse(readFileSync(path.join(ROOT, slug, 'review/reel.json'), 'utf8')).title || slug; } catch { return slug; } };
  const yours = rows.filter((r) => ['plan', 'edit', 'approve'].includes(r.stage)).length;
  const claude = rows.filter((r) => ['revise', 'sounds', 'render', 'post', 'no-page'].includes(r.stage)).length;
  // posting order, copied from Notion (lib/schedule.mjs): rank among the Reels not posted yet, by Publish Order then date
  const S = readSchedule(), sched = (r) => S[r.slug] || {};
  const byPost = (a, b) => (sched(a).order ?? Infinity) - (sched(b).order ?? Infinity) || String(sched(a).date || '9').localeCompare(String(sched(b).date || '9')) || a.slug.localeCompare(b.slug);
  const queued = rows.filter((r) => r.stage !== 'done' && (sched(r).order != null || sched(r).date)).sort(byPost);
  const rank = Object.fromEntries(queued.map((r, i) => [r.slug, i + 1]));
  const day = (d) => new Date(d.length <= 10 ? d + 'T12:00' : d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const item = (r) => {
    const hasPage = existsSync(path.join(ROOT, r.slug, 'review/reel.json'));
    const open = hasPage ? `<a class="go" href="/open/${encodeURIComponent(r.slug)}">Open</a>` : '';
    const n = rank[r.slug], d = sched(r).date;
    const when = r.stage === 'done' ? '' : n ? `<span class="when"><b>Posts #${n}</b>${d ? ' · ' + day(d) : ''}</span>` : '<span class="when">Not scheduled yet</span>';
    return `<li class="s-${r.stage}"><img class="thumb" src="/thumb/${encodeURIComponent(r.slug)}" alt="" onerror="this.style.visibility='hidden'"><div class="who">${when}<b title="${esc(r.slug)}">${esc(title(r.slug))}</b><em>${LABEL[r.stage][0]}</em><p>${esc(line(r))}</p></div><div class="trk">${tracker(r)}</div>${open}</li>`;
  };
  const sections = GROUPS.map(([name, stages]) => {
    const list = rows.filter((r) => stages.includes(r.stage)).sort(byPost);
    return list.length ? `<h2>${name} <span>${list.length}</span></h2><ul>${list.map(item).join('')}</ul>` : '';
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="30"><title>Reels to review</title><style>
@font-face{font-family:B;src:url('/lib/assets/fonts/bricolage-800.woff2') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:F;src:url('/lib/assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
:root{--cream:#F6EEE5;--ink:#161210;--peach:#FFC9A8;--mist:#E7EEF5;--line:#d9cfc2;--ok:#2e7d4f}
body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.45 F,system-ui,sans-serif}
main{max-width:900px;margin:0 auto;padding:32px 16px 64px}
h1{font:800 44px/1 B,sans-serif;font-stretch:75%;margin:0 0 6px}p.sub{margin:0 0 8px;font-size:17px}
h2{font:800 26px/1 B,sans-serif;font-stretch:78%;margin:28px 0 10px}h2 span{font:700 15px F,sans-serif;background:#fff;border:1px solid var(--line);border-radius:99px;padding:2px 10px;vertical-align:middle;margin-left:6px}
ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
li{display:grid;grid-template-columns:72px 1fr auto auto;gap:16px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.who b{display:block;font-size:17px;line-height:1.3}
.thumb{width:72px;height:128px;object-fit:cover;border-radius:8px;background:var(--mist)}
.when{display:block;font-size:15px;margin-bottom:2px}.when b{display:inline;font-size:15px}
.who em{font-style:normal;font-weight:700;display:inline-block;padding:2px 10px;border-radius:99px;background:var(--mist);font-size:15px;margin:6px 0 2px}
.who p{margin:2px 0 0;font-size:15px;opacity:.8}
.s-plan .who em,.s-edit .who em,.s-approve .who em{background:var(--peach)}
.s-done{opacity:.6}
.trk{display:flex;gap:6px}
.stp{display:flex;flex-direction:column;align-items:center;width:92px;font-size:15px;font-weight:700;text-align:center;line-height:1.2}
.stp small{font-size:15px;font-weight:400;opacity:.75;margin-top:2px}
.stp i{width:26px;height:26px;border-radius:50%;border:2px solid var(--line);margin-bottom:4px;display:grid;place-items:center;font-style:normal;font-size:15px;background:#fff}
.stp.ok i{background:var(--ok);border-color:var(--ok)}.stp.ok i::after{content:'✓';color:#fff}
.stp.sent i{background:var(--mist);border-color:#8aa3bd}.stp.sent i::after{content:'↺'}
.stp.wip i{border-color:var(--ink);background:var(--peach)}.stp.wip i::after{content:'●';font-size:11px}
.stp.next i{border-color:var(--ink)}
.stp.todo{opacity:.5}
a.go{background:var(--ink);color:#fff;text-decoration:none;padding:10px 18px;border-radius:99px;font-weight:700;font-size:15px}
.key{font-size:15px;opacity:.8;margin:0 0 4px}
@media (max-width:760px){li{grid-template-columns:72px 1fr}.trk,a.go{grid-column:1/-1}a.go{justify-self:start}.stp{width:auto;flex:1}}
</style></head><body><main><h1>Reels to review</h1>
<p class="sub">${yours ? `<b>${yours} waiting on you.</b>` : 'Nothing waiting on you right now.'}${claude ? ` Claude is working on ${claude}.` : ''} This page updates by itself.</p>
<p class="key">✓ approved · ↺ sent to Claude for changes · ● you've started</p>
${sections}</main></body></html>`;
}

createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/' || p === '/index.html') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(page()); }
  if (p.startsWith('/lib/assets/fonts/')) {
    const f = path.join(ROOT, 'lib/assets/fonts', path.basename(p));
    if (existsSync(f)) { res.writeHead(200, { 'Content-Type': 'font/woff2' }); return res.end(readFileSync(f)); }
  }
  const m = /^\/open\/(.+)$/.exec(p);
  if (m && allReels().includes(m[1])) { const port = await ensure(m[1]); res.writeHead(302, { Location: `http://localhost:${port}/` }); return res.end(); }
  // a small picture per Reel: her rendered cover if there is one, else the frame she picked for the cover
  const th = /^\/thumb\/(.+)$/.exec(p);
  if (th && allReels().includes(th[1])) {
    const slug = th[1], dir = path.join(ROOT, slug);
    let frame = 1; try { const D = JSON.parse(readFileSync(path.join(dir, 'review/decisions.json'), 'utf8')); frame = D.cover?.frame || frame; } catch {}
    try { if (frame === 1) frame = JSON.parse(readFileSync(path.join(dir, 'review/reel.json'), 'utf8')).coverDefault || 1; } catch {}
    const nn = String(frame).padStart(2, '0');
    const still = String(frame).startsWith('own-') ? path.join(dir, `review/cover-photos/${frame}.jpg`) : path.join(dir, `sketch/f${nn}.jpg`);
    const f = [coverFile(slug), still, path.join(dir, 'sketch/f01.jpg')].find(existsSync);
    if (f) { res.writeHead(200, { 'Content-Type': f.endsWith('.png') ? 'image/png' : 'image/jpeg', 'Cache-Control': 'no-store' }); return res.end(readFileSync(f)); }
  }
  if (p === '/api/status') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(allReels().map(reelStatus))); }
  res.writeHead(404); res.end('not found');
}).listen(HUB, '127.0.0.1', () => console.log(`Review hub: http://localhost:${HUB}`));
