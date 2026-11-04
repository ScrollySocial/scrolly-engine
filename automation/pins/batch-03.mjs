// Batch 3 (2026-10-28): 5 Pins for guide B1, /guides/replace-manychat-with-claude/ (live 2026-10-28).
// Round 3 (Mercedes 2026-10-28): headlines land at a glance (no jargon), no Pin-board collage behind the phone.
// One uses a real phone photo showing the keyword DM chat, three use stock, one is a video Pin. (phone on a tripod showing the keyword DM chat); three use stock already in
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
const PHONE = 'own-phone-dm-plain';
const B = { dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business' };
const LINK = '/guides/replace-manychat-with-claude/';

const PINS = [
  { id: 'h1-replaced-g', layout: 'G', photo: PHONE, focus: 'center 35%', ground: 'blush', scriptFont: process.env.SCRIPT || 'grace', arrow: false, board: B.ai, badge: 'Free guide', lines: [{ t: 'how I', script: true }, { t: 'replaced' }, { t: 'ManyChat' }, { t: 'for $6 a month', script: true }],
    title: 'How I Replaced ManyChat for $6 a Month', desc: 'I had Claude build my own Instagram auto-reply setup on a small server for about $6 a month, plus the Claude plan I already had. What it does, what it costs, and who should stay on ManyChat.', keywords: 'manychat alternative, replace manychat with claude, claude ai, instagram dm automation' },
  { id: 'h2-stop-f', layout: 'F', photo: P('5390124-cozy-laptop'), hl: 'marker', board: B.dm, serif: 'Stop overpaying for ManyChat', sel: 'do this instead',
    title: 'Stop Overpaying for ManyChat: Do This Instead', desc: 'ManyChat charges more as more people message you. I had Claude set up my own version on a $6-a-month server instead. What it can do, what it costs, and who should stay on ManyChat.', keywords: 'manychat alternative, manychat pricing, instagram dm automation, save money small business' },
  { id: 'h3-diy-e', layout: 'E', photo: P('13550510-desk-candle'), cardTop: 840, pin: 'cream', hl: 'caveatbrush', board: B.dm, serif: 'How to DIY your own ManyChat setup', small: 'Instagram approved!',
    title: 'How to DIY Your Own ManyChat Setup (Instagram Approved!)', desc: "Comment a keyword, get the link by DM, through Instagram's official API. How I set up my own version with Claude, step by step, plus the settings that slowed me down.", keywords: 'diy manychat, self hosted manychat, instagram api, instagram comment to dm automation' },
  { id: 'h4-39-vs-6-f', layout: 'F', photo: P('5473151-woman-laptop'), hl: 'reenie', board: B.dm, serif: 'ManyChat Pro is $39 a month. Mine is $6.', sel: "here's how",
    title: "ManyChat Pro Is $39 a Month. Mine Is $6. Here's How", desc: 'ManyChat Pro is $39 a month for up to 2,500 contacts. My own Instagram auto-reply setup runs on a $6-a-month server, plus the Claude plan I already had, however many people comment.', keywords: 'manychat pricing, manychat pro, manychat alternative, instagram automation cost' },
  { id: 'h5-link-e', layout: 'E', video: P('v7681923-woman-laptop'), cardTop: 860, pin: 'blue', hl: 'marker', board: B.ai, serif: 'Send your link to every commenter', small: 'automatically, for $6 a month',
    title: 'Send Your Link to Every Commenter, Automatically', desc: 'Someone comments your keyword on Instagram and gets your link by DM, automatically. How I set it up with Claude for about $6 a month, without ManyChat.', keywords: 'instagram auto reply, instagram dm automation, manychat alternative, claude ai' },
];

// 12pm US Eastern: 16:00 UTC until Nov 1 (EDT), 17:00 UTC from Nov 2 (EST).
const DAYS = ['2026-10-29', '2026-11-01', '2026-11-04', '2026-11-07', '2026-11-10'];
PINS.forEach((p, i) => { p.link = LINK; p.date = `${DAYS[i]}T${DAYS[i] < '2026-11-02' ? '16' : '17'}:00:00`; p.id = `pin3-${String(i + 1).padStart(2, '0')}-${p.id}`; });
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
