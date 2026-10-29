// Batch 4 (2026-10-29): Pins for guide B7 (/guides/can-claude-answer-instagram-dms/) and the ManyChat Cost Calculator
// (/calculators/manychat-cost/), both live 2026-10-29. Mix (Mercedes 2026-10-28: test photos, video and text-only):
// round 2: 3 text-only (G, no photo), 2 fresh photos (F), 1 fresh video (E).
// Headlines land at a glance with no jargon (memory: Pin copy at a glance). Prices: manychat.com/pricing, checked 2026-10-28.
// Schedule: a 4pm US Eastern slot next to batches 1 to 3; each link at least 3 days apart.
// Usage: node batch-04.mjs   Output: pins/out/batch-04/ (PNG/MP4 per Pin, review.html, batch.json, sheet.png)
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, renderPins, ensureStock } from './lib/templates.mjs';
import { composeVideoPin, ensureClips } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-04');
const P = (s) => `pexels-${s}`;
const B = { dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business' };
const DMS = '/guides/can-claude-answer-instagram-dms/', CALC = '/calculators/manychat-cost/';

// Fresh stock only (Mercedes 2026-10-29: no photo or clip already used on a Pin). Pexels, picked by Claude to her
// stock rules (warm, cosy, real-looking, nobody posing at the camera).
const STOCK = [
  { id: P('17627337-phone-tea'), src: 'https://images.pexels.com/photos/17627337/pexels-photo-17627337.jpeg', page: 'https://www.pexels.com/photo/woman-hands-holding-tea-and-cellphone-17627337/', picked: 'Claude' },
  { id: P('35962987-laptop-coffee'), src: 'https://images.pexels.com/photos/35962987/pexels-photo-35962987.jpeg', page: 'https://www.pexels.com/photo/young-woman-relaxing-with-coffee-and-laptop-35962987/', picked: 'Claude' },
];
const CLIPS = [{ id: P('v7131639-sleep-mask-texting'), src: 'https://www.pexels.com/download/video/7131639/', page: 'https://www.pexels.com/video/a-woman-using-her-smartphone-7131639/', picked: 'Claude' }];

// Round 2 (Mercedes 2026-10-29): every Pin must stop the scroll; the calculator angle is what you could SAVE by leaving
// ManyChat (we're not selling ManyChat), and text-only Pins use the bold label-bar look on a strong colour.
const PINS = [
  { id: 'e1-ai-dms-text', link: DMS, layout: 'G', ground: 'deeprose', scriptFont: 'grace', badge: 'Free guide', board: B.ai,
    lines: [{ t: 'can AI answer', script: true }, { t: 'your' }, { t: 'Instagram' }, { t: 'DMs?', sky: true }, { t: "here's the truth", script: true }],
    title: 'Can AI Answer Your Instagram DMs? Here Is the Truth', desc: "Can Claude answer your Instagram DMs? Not on its own. What you need to set it up the official way, Instagram's DM rules, and the three ways to run it.", keywords: 'can claude answer instagram dms, ai instagram dms, instagram dm automation, instagram dm rules' },
  { id: 'e2-save-text', link: CALC, layout: 'G', ground: 'navy', scriptFont: 'grace', badge: 'Free calculator', board: B.dm,
    lines: [{ t: 'how much could you', script: true }, { t: 'save', sky: true }, { t: 'leaving' }, { t: 'ManyChat?' }],
    title: 'How Much Could You Save by Leaving ManyChat?', desc: 'Put in how many people comment or DM you each month. See what ManyChat costs you a year and what you could save running your own setup for about $6 a month.', keywords: 'manychat alternative, manychat pricing, save money small business, instagram automation cost' },
  { id: 'e3-draft-photo', link: DMS, layout: 'F', photo: P('17627337-phone-tea'), shade: .85, hl: 'caveatbrush', board: B.ai, serif: 'Let AI draft your Instagram DMs', sel: 'you just hit send',
    title: 'Let AI Draft Your Instagram DMs (You Just Hit Send)', desc: "Claude writes a reply in your voice for every comment and DM, and you send it or tweak it first. How to set it up the official way, without giving any AI your password.", keywords: 'ai instagram dms, claude instagram dm automation, instagram dm automation, claude code instagram automation' },
  { id: 'e4-save-photo', link: CALC, layout: 'F', photo: P('35962987-laptop-coffee'), hl: 'marker', board: B.ai, serif: 'How much could you save by leaving ManyChat?', sel: 'calculate it now',
    title: 'Leaving ManyChat? Calculate What You Could Save', desc: 'ManyChat charges more as more people message you. This free calculator shows your yearly ManyChat cost next to running your own setup for about $6 a month.', keywords: 'manychat cost, manychat calculator, manychat alternative, instagram dm automation cost' },
  { id: 'e5-auto-reply-video', link: DMS, layout: 'E', video: P('v7131639-sleep-mask-texting'), cardTop: 900, pin: 'blue', hl: 'marker', board: B.dm, serif: 'Auto-reply to Instagram DMs', small: 'without paying for ManyChat',
    title: 'Auto-Reply to Instagram DMs Without Paying for ManyChat', desc: "Send your link automatically when someone comments a keyword, and get AI-drafted replies for everything else, on your own setup for about $6 a month. Instagram's DM rules included.", keywords: 'instagram auto reply, auto reply instagram dms, instagram dm automation, instagram dm policy' },
  { id: 'e6-396-text', link: CALC, layout: 'G', ground: 'blush', scriptFont: 'grace', badge: 'Calculate yours', board: B.dm,
    lines: [{ t: 'leaving ManyChat Pro?', script: true }, { t: '$396', sky: true }, { t: 'saved' }, { t: 'a year' }, { t: 'at 1,000 people a month', script: true }],
    title: '$396 a Year Saved by Leaving ManyChat Pro', desc: 'At 1,000 people a month, ManyChat Pro is $468 a year on monthly billing. Your own setup runs on a $6-a-month server ($72 a year), plus a Claude plan. Work out your own numbers free.', keywords: 'manychat pro, manychat pricing, manychat alternative, save money small business' },
];

// 4pm US Eastern: 20:00 UTC until Nov 1 (EDT), 21:00 UTC from Nov 2 (EST). Guide Pins and calculator Pins alternate days.
const DAYS = ['2026-10-30', '2026-10-31', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'];
PINS.forEach((p, i) => {
  p.date = `${DAYS[i]}T${DAYS[i] < '2026-11-02' ? '20' : '21'}:00:00`;
  p.id = `pin4-${String(i + 1).padStart(2, '0')}-${p.id}`;
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

await ensureStock(STOCK);
await ensureClips(CLIPS);
const browser = await launch();
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
const W = 6 * 236 + 24, sf = path.join(OUT, '.sheet.html');
writeFileSync(sf, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(6,224px);gap:12px;width:${W}px">${PINS.map((p) => `<img src="${fileUrl(path.join(OUT, p.id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
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
