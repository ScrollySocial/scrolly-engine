// Batch 4 (2026-10-29): Pins for guide B7 (/guides/can-claude-answer-instagram-dms/) and the ManyChat Cost Calculator
// (/calculators/manychat-cost/), both live 2026-10-29. Mix (Mercedes 2026-10-28: test photos, video and text-only):
// 3 text-only list Pins (C), 2 graphic Pins with the live page on a phone (A, D), 1 photo (F), 1 video (E).
// Headlines land at a glance with no jargon (memory: Pin copy at a glance). Prices: manychat.com/pricing, checked 2026-10-28.
// Schedule: a 4pm US Eastern slot next to batches 1 to 3; each link at least 3 days apart.
// Usage: node batch-04.mjs   Output: pins/out/batch-04/ (PNG/MP4 per Pin, review.html, batch.json, sheet.png)
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, PAL, captureShots, renderPins, styleFor } from './lib/templates.mjs';
import { composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-04');
const P = (s) => `pexels-${s}`;
const B = { dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business' };
const DMS = '/guides/can-claude-answer-instagram-dms/', CALC = '/calculators/manychat-cost/';

const PINS = [
  { id: 'd1-3-ways-c', link: DMS, layout: 'C', ...PAL.latte, num: '3', head: 'ways to automate', serif: 'your Instagram DMs', items: ['Keyword DMs on autopilot', 'AI drafts, you approve', 'Fully automatic replies'], board: B.dm,
    title: '3 Ways to Automate Your Instagram DMs', desc: "Keyword DMs that send your link automatically, AI-written drafts you approve, or fully automatic replies. What each one costs, what Instagram allows, and the one I chose.", keywords: 'instagram dm automation, automate instagram dms, claude instagram dm automation, instagram auto reply' },
  { id: 'c1-cost-a', link: CALC, layout: 'A', ...PAL.blush, big: ['What will', 'ManyChat cost?'], serif: 'for your audience size', chip: 'Free calculator', board: B.dm,
    title: 'What Will ManyChat Cost You? Free Calculator', desc: 'Put in how many people comment or DM you each month. See the ManyChat plan you would need, what it costs a year, and what running your own setup costs instead.', keywords: 'manychat pricing, how much does manychat cost, manychat calculator, manychat alternative' },
  { id: 'd2-password-f', link: DMS, layout: 'F', photo: P('12497427-laptop-bed'), hl: 'caveatbrush', board: B.ai, serif: 'Never give AI your Instagram password', sel: 'do this instead',
    title: 'Never Give AI Your Instagram Password (Do This Instead)', desc: "Bots that log in and click around Instagram break its rules and can get your account restricted. Here's the official way to let Claude help with your DMs.", keywords: 'instagram dm policy, ai instagram automation, claude code instagram automation, instagram account safety' },
  { id: 'c2-plans-c', link: CALC, layout: 'C', ...PAL.latte, num: '5', head: 'ManyChat plans', serif: 'and what each costs a month', items: ['Free: $0', 'Essential: $17', 'Pro: $39', 'Business: $99', 'Advanced: $199'], board: B.dm,
    title: 'ManyChat Pricing: What Each Plan Costs a Month', desc: 'ManyChat charges by how many people you interact with each month: Free up to 25, Essential $17 for 250, Pro $39 for 2,500, Business $99 for 7,500, Advanced $199 for 25,000 (monthly billing). Work out yours free.', keywords: 'manychat pricing, manychat plans, manychat pro price, manychat cost per month' },
  { id: 'd3-ai-dms-d', link: DMS, layout: 'D', ...PAL.navy, serif: 'Can AI answer your Instagram DMs?', sub: "What it can do, what Instagram allows, and what it can't.", btn_t: 'Read the guide', board: B.ai,
    title: 'Can AI Answer Your Instagram DMs? What Instagram Allows', desc: "Can Claude answer your Instagram DMs? Not on its own. What you need to set it up the official way, Instagram's DM rules, and the three ways to run it.", keywords: 'can claude answer instagram dms, ai instagram dms, instagram dm rules, instagram dm automation' },
  { id: 'c3-468-vs-72-c', link: CALC, layout: 'C', ...PAL.latte, num: '$396', head: 'saved a year', serif: 'at 1,000 people a month', items: ['ManyChat Pro: $468', 'My own setup: $72'], styleOverride: { marker: 'num' }, board: B.ai,
    title: 'ManyChat Pro Is $468 a Year. My Own Setup Is $72.', desc: 'For 1,000 people a month, ManyChat Pro costs $468 a year on monthly billing. My own setup runs on a $6-a-month server, plus the Claude plan I already had. Work out your numbers free.', keywords: 'manychat pro, manychat pricing, manychat alternative, save money small business' },
  { id: 'd4-auto-reply-e', link: DMS, layout: 'E', video: P('v7393135-typing'), cardTop: 860, pin: 'cream', hl: 'marker', board: B.dm, serif: 'Auto-reply to Instagram DMs', small: 'the way Instagram allows',
    title: 'Auto-Reply to Instagram DMs the Way Instagram Allows', desc: "Send your link automatically when someone comments a keyword, and get AI-drafted replies for everything else. Instagram's DM rules and how to stay inside them.", keywords: 'instagram auto reply, auto reply instagram dms, instagram dm automation, instagram dm policy' },
];

// 4pm US Eastern: 20:00 UTC until Nov 1 (EDT), 21:00 UTC from Nov 2 (EST). Guide Pins and calculator Pins alternate days.
const DAYS = ['2026-10-30', '2026-10-31', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-08'];
const seenLayout = { A: 0, C: 0, D: 0 };
PINS.forEach((p, i) => {
  p.date = `${DAYS[i]}T${DAYS[i] < '2026-11-02' ? '20' : '21'}:00:00`;
  p.id = `pin4-${String(i + 1).padStart(2, '0')}-${p.id}`;
  if (p.layout in seenLayout) p.style = { ...styleFor(p.layout, 3 + seenLayout[p.layout]++), ...p.styleOverride }; // not batch 1's first looks; styleOverride: e.g. plain digits for a dollar number
});
const url = (p) => SITE + p.link + '?utm_source=pinterest';

const errs = [];
for (const p of PINS) {
  if (p.title.length > 100) errs.push(`${p.id}: title too long`);
  if (p.desc.length > 500) errs.push(`${p.id}: description too long`);
  if (/[—|]/.test(p.title + p.desc)) errs.push(`${p.id}: em dash or |`);
}
for (const link of [DMS, CALC]) {
  const ds = PINS.filter((p) => p.link === link).map((p) => Date.parse(p.date + 'Z')).sort();
  ds.forEach((d, i) => { if (i && d - ds[i - 1] < 3 * 864e5) errs.push(`${link}: Pins less than 3 days apart`); });
}
if (new Set(PINS.map((p) => p.title)).size !== PINS.length) errs.push('duplicate titles');
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
await captureShots(browser, [...new Set(PINS.filter((p) => ['A', 'D'].includes(p.layout)).map((p) => p.link))]);
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
const W = 7 * 236 + 24, sf = path.join(OUT, '.sheet.html');
writeFileSync(sf, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(7,224px);gap:12px;width:${W}px">${PINS.map((p) => `<img src="${fileUrl(path.join(OUT, p.id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
const pg = await browser.newPage(); await pg.setViewport({ width: W, height: 400 });
await pg.goto(fileUrl(sf), { waitUntil: 'load' }); await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();

writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(PINS.map((p) => ({ id: p.id, board: p.board, url: url(p), date: p.date, title: p.title, description: p.desc, keywords: p.keywords, video: !!p.video, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 4 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img,.c video{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 4: ${PINS.length} Pins (DMs guide + ManyChat calculator)</h1><div class="g">
${PINS.map((p) => `<div class="c">${p.video ? `<video src="${p.id}.mp4" autoplay muted loop playsinline></video>` : `<img src="${p.id}.png" alt="">`}<div><b>${esc(p.title)}</b><p>${esc(p.desc)}</p><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${PINS.length} Pins, ${PINS[0].date} to ${PINS.at(-1).date}`);
