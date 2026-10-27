// Batch 2 (2026-10-27): Pins for the Instagram long-caption posts (automation/ig-posts/posts.mjs), for Mercedes to approve.
// Each Pin links to the site page the post teaches, never to Instagram while a page fits. Copy comes from the post's
// caption (automation/planner/data/captions/<post>.md) and the page itself. No income promises.
// Schedule: starts after batch 1 ends (2026-11-06), one a day at 10am Eastern, the same link at least 3 days apart,
// counting batch 1's Pins to the same page.
// Usage: node batch-02.mjs   Output: pins/out/batch-02/<id>.png, review.html, batch.json
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { launch, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, PAL, captureShots, renderPins, styleFor } from './lib/templates.mjs';

const BATCH = 'batch-02';
const OUT = path.join(HERE, 'out', BATCH);

// Exact live board names (same list as batch-01.mjs).
const B = {
  pricing: 'Pricing your Products and Services',
  seo: 'Website SEO for Small Business',
  dm: 'Instagram DM Automation',
  ai: 'AI Tools for Small Business',
};

// date is UTC; 15:00 UTC = 10am Eastern after the clocks change on 2026-11-01.
const PINS = [
  { post: '2026-11-02-three-prices', link: '/calculators/profit/', board: B.pricing, date: '2026-11-07T15:00:00',
    layout: 'C', ...PAL.latte, num: '5', head: 'costs to add up', serif: 'before you set a price', items: ['Materials and packaging', 'Platform and payment fees', 'Shipping you cover', 'Your time', 'A share of monthly costs'],
    title: '5 Costs to Add Up Before You Set a Price', desc: 'Materials and packaging, platform fees, shipping you cover, your time and a share of monthly costs make your true cost per item. Set your price from there, then check your profit and margin with this free calculator.', keywords: 'how to price products, pricing your products, product costs, small business pricing' },
  { post: '2026-11-04-comment-to-dm', link: '/chat-manager/', board: B.dm, date: '2026-11-09T15:00:00',
    layout: 'D', ...PAL.navy, serif: 'Comment a word, get the link in your DMs', sub: 'How comment-to-DM works on Instagram, and what it costs to run.', btn_t: 'See how it works',
    title: 'How Comment-to-DM Works on Instagram', desc: 'Someone comments your keyword, and Instagram lets a business account send one private reply to that comment within 7 days. Chat Manager sends those DMs for you from your own server, about $6 a month to run.', keywords: 'instagram dm automation, comment to dm, instagram keyword dm, manychat alternative' },
  { post: '2026-11-06-google-checks', link: '/seo-site-audit/', board: B.seo, date: '2026-11-10T15:00:00',
    layout: 'C', ...PAL.latte, num: '5', head: 'free checks', serif: 'to see if Google can find your website', items: ['Pages indexed', 'What Google shows', 'Titles that say what you sell', 'Speed on a phone', 'One page per offer'],
    title: '5 Free Checks to See if Google Can Find Your Website', desc: 'Check which pages Google has indexed, what it shows for your site, your page titles, your speed on a phone and whether each offer has its own page. Want every fix found and put in order? The SEO Site Audit does it for you.', keywords: 'small business seo, seo checklist, website seo tips, google search console' },
  { post: '2026-11-02-three-prices', link: '/calculators/profit/', board: B.pricing, date: '2026-11-11T15:00:00',
    layout: 'A', ...PAL.blush, big: ['True cost', 'first'], serif: 'then set your price', chip: 'Free calculator',
    title: 'Know Your True Cost Before You Price Your Product', desc: 'Add up materials, fees, shipping, your time and a share of monthly costs, compare similar products, then set your price. This free calculator shows your profit and margin.', keywords: 'pricing strategy, profit margin, what to charge, handmade business pricing' },
  { post: '2026-11-04-comment-to-dm', link: '/chat-manager/', board: B.ai, date: '2026-11-13T15:00:00',
    layout: 'C', ...PAL.latte, num: '3', head: 'steps', serif: 'to keyword DMs on Instagram', items: ['Pick one short keyword', 'Say it in your caption', 'Send the link by DM'],
    title: '3 Steps to Keyword DMs on Instagram', desc: 'Pick one short keyword, say it near the start and end of your caption, and send the link by DM when someone comments it. Chat Manager does the sending for you, about $6 a month to run.', keywords: 'instagram automation, keyword dm, comment to dm, instagram tools for small business' },
  { post: '2026-11-06-google-checks', link: '/seo-site-audit/', board: B.seo, date: '2026-11-14T15:00:00',
    layout: 'D', ...PAL.navy, serif: 'Is Google indexing your pages?', sub: 'Check in Search Console first. Then get every fix in priority order.', btn_t: 'See the audit',
    title: 'Is Google Indexing Your Pages? Start Here', desc: 'Open Google Search Console, then Indexing, then Pages, to see which pages Google has indexed and why others are missing. For every fix in priority order, get an SEO Site Audit of your website.', keywords: 'google search console, website indexing, seo for small business, seo audit' },
];

// Style rotation continues from batch 1's count per layout so these don't repeat its first Pins.
const seenLayout = { A: 15, C: 6, D: 9 };
const pins = PINS.map((p, n) => {
  const slug = p.link.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return { ...p, id: `pin-${String(n + 1).padStart(2, '0')}-${slug}-${p.layout.toLowerCase()}`, url: SITE + p.link + '?utm_source=pinterest', pinTitle: p.title, pinDesc: p.desc, style: styleFor(p.layout, seenLayout[p.layout]++) };
});

// Rule checks before anything is shown, including against batch 1 (titles and same-link spacing).
const errs = [];
const earlier = ['batch-01'].map((b) => path.join(HERE, 'out', b, 'batch.json')).filter(existsSync).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
const seen = new Set(earlier.map((p) => p.title));
for (const p of pins) {
  if (p.pinTitle.length > 100) errs.push(`${p.id}: title ${p.pinTitle.length} chars (max 100)`);
  if (p.pinDesc.length > 500) errs.push(`${p.id}: description ${p.pinDesc.length} chars (max 500)`);
  if (seen.has(p.pinTitle)) errs.push(`${p.id}: duplicate title`); seen.add(p.pinTitle);
  if (/[—|]/.test(p.pinTitle + p.pinDesc)) errs.push(`${p.id}: em dash or | in text`);
  if (!Object.values(B).includes(p.board)) errs.push(`${p.id}: board not on the allowed list`);
}
const all = [...earlier.map((p) => ({ id: p.id, url: p.url, date: p.date })), ...pins];
for (const p of pins) {
  const close = all.filter((q) => q !== p && q.url === p.url && Math.abs(new Date(q.date + 'Z') - new Date(p.date + 'Z')) < 3 * 864e5);
  if (close.length) errs.push(`${p.id}: same link less than 3 days from ${close.map((q) => q.id).join(', ')}`);
}
const perDay = {};
for (const p of all) { const d = p.date.slice(0, 10); perDay[d] = (perDay[d] || 0) + 1; }
for (const [d, n] of Object.entries(perDay)) if (n > 3) errs.push(`${d}: ${n} Pins (about 3 a day max)`);
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
await captureShots(browser, pins.filter((p) => p.layout !== 'C').map((p) => p.link));
for (const w of await renderPins(browser, pins, OUT)) console.log('WARN   ' + w);
await browser.close();

// post = the Instagram post the Pin comes from, so the planner can show which posts have Pins.
writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(pins.map(({ id, post, board, url, date, pinTitle, pinDesc, keywords }) => ({ id, post, board, url, date, title: pinTitle, description: pinDesc, keywords, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 2 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}h1{font-size:24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block;font-size:16px}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 2: ${pins.length} Pins for the Instagram posts, ${pins[0].date.slice(0, 10)} to ${pins.at(-1).date.slice(0, 10)}</h1><div class="g">
${pins.map((p) => `<div class="c"><img src="${p.id}.png" alt=""><div><b>${esc(p.pinTitle)}</b><p>${esc(p.pinDesc)}</p><small>From post: ${esc(p.post)}</small><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${pins.length} Pins -> ${OUT}`);
