// Batch 3 (2026-10-28): 5 Pins for guide B1, /guides/replace-manychat-with-claude/ (live 2026-10-28).
// Two use the guide's own top photo, one is a video Pin (Mercedes 2026-10-28: mix photos, video and graphics to test) (phone on a tripod showing the keyword DM chat); three use stock already in
// assets/stock that no ManyChat Pin has used. Copy only claims what the guide says.
// Schedule: a 4th daily slot (12pm US Eastern) next to batches 1 and 2, every 3 days so the link never repeats within 3 days.
// Usage: node batch-03.mjs   Output: pins/out/batch-03/ (PNG per Pin, review.html, batch.json, sheet.png)
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, renderPins } from './lib/templates.mjs';
import { composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-03');
const P = (s) => `pexels-${s}`;
const OWN = 'own-guide-manychat-hero';
const B = { dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business' };
const LINK = '/guides/replace-manychat-with-claude/';

const PINS = [
  { id: 'g1-replaced-g', layout: 'G', photo: OWN, focus: 'center 40%', ground: 'blush', scriptFont: 'caveatbrush', arrow: false, board: B.ai, badge: 'About $6 a month', lines: [{ t: 'how I', script: true }, { t: 'replaced' }, { t: 'ManyChat' }, { t: 'with Claude', script: true }],
    title: 'How I Replaced ManyChat with Claude', desc: 'I had Claude build my own Instagram comment-to-DM system on a small server for about $6 a month. What it does, what it costs, the setup traps, and who should stay on ManyChat.', keywords: 'manychat alternative, replace manychat with claude, claude ai, instagram dm automation' },
  { id: 'g2-can-claude-f', layout: 'F', photo: P('5390124-cozy-laptop'), hl: 'marker', board: B.dm, serif: 'Can Claude replace ManyChat?', sel: 'here is what I found',
    title: 'Can Claude Replace ManyChat? Here Is What I Found', desc: "Claude can set up your own comment-to-DM software for Instagram, with YouTube comment replies too. What it can and can't do compared with ManyChat, and what it costs each month.", keywords: 'can claude replace manychat, manychat vs claude, instagram comment to dm, ai automation' },
  { id: 'g3-cost-e', layout: 'E', photo: P('13550510-desk-candle'), cardTop: 840, pin: 'cream', hl: 'caveatbrush', board: B.dm, serif: 'ManyChat vs your own setup', small: 'what it really costs',
    title: 'ManyChat vs Your Own Setup: What It Really Costs', desc: 'ManyChat charges more as more people message you. My own comment-to-DM setup costs about $6 a month for the server, however many people comment. The full cost breakdown.', keywords: 'manychat pricing, manychat alternative, instagram automation cost, comment to dm' },
  { id: 'g4-traps-e', layout: 'E', photo: OWN, focus: 'center 30%', cardTop: 120, tilt: 1.5, pin: 'white', hl: 'reenie', board: B.dm, serif: 'Setup traps that cost me time', small: 'read these before you build',
    title: 'The Setup Traps That Cost Me Time (Read Before You Build)', desc: 'Building your own Instagram comment-to-DM tool? The Google and Meta settings that cause weeks of waiting or a manual review, and how to skip them.', keywords: 'instagram api, meta developer app, instagram dm automation, self hosted manychat' },
  { id: 'v1-own-tool-e', layout: 'E', video: P('v7681923-woman-laptop'), cardTop: 860, pin: 'blue', hl: 'marker', board: B.ai, serif: 'Build your own comment-to-DM tool', small: 'how I did it with Claude',
    title: 'Build Your Own Instagram Comment-to-DM Tool', desc: "Comment a keyword, get the link by DM. How I built my own version with Claude, n8n and Instagram's official API, and what it does every day.", keywords: 'instagram comment to dm automation, n8n, claude ai, instagram automation tools' },
];

// 12pm US Eastern: 16:00 UTC until Nov 1 (EDT), 17:00 UTC from Nov 2 (EST).
const DAYS = ['2026-10-29', '2026-11-01', '2026-11-04', '2026-11-07', '2026-11-10'];
PINS.forEach((p, i) => { p.link = LINK; p.date = `${DAYS[i]}T${DAYS[i] < '2026-11-02' ? '16' : '17'}:00:00`; p.id = `pin3-${String(i + 1).padStart(2, '0')}-${p.id}${p.layout === 'G' ? '-v2' : ''}`; });
// -v2: Pin 1 was redone after upload (Sacramento script swapped for Caveat Brush), so the old upload isn't reused.
const url = (p) => SITE + p.link + '?utm_source=pinterest';

const errs = [];
for (const p of PINS) {
  if (p.title.length > 100) errs.push(`${p.id}: title too long`);
  if (p.desc.length > 500) errs.push(`${p.id}: description too long`);
  if (/[—|]/.test(p.title + p.desc)) errs.push(`${p.id}: em dash or |`);
}
if (new Set(PINS.map((p) => p.title)).size !== PINS.length) errs.push('duplicate titles');
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
const W = 5 * 236 + 24, sf = path.join(OUT, '.sheet.html');
writeFileSync(sf, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(5,224px);gap:12px;width:${W}px">${PINS.map((p) => `<img src="${fileUrl(path.join(OUT, p.id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
const pg = await browser.newPage(); await pg.setViewport({ width: W, height: 400 });
await pg.goto(fileUrl(sf), { waitUntil: 'load' }); await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();

writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(PINS.map((p) => ({ id: p.id, board: p.board, url: url(p), date: p.date, title: p.title, description: p.desc, keywords: p.keywords, video: !!p.video, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 3 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img,.c video{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 3: ${PINS.length} Pins for the ManyChat guide</h1><div class="g">
${PINS.map((p) => `<div class="c">${p.video ? `<video src="${p.id}.mp4" autoplay muted loop playsinline></video>` : `<img src="${p.id}.png" alt="">`}<div><b>${esc(p.title)}</b><p>${esc(p.desc)}</p><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${PINS.length} Pins, ${PINS[0].date} to ${PINS.at(-1).date}`);
