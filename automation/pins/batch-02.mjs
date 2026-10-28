// Batch 2 (2026-10-28): the 19 test-set-2 Pins she approved (layouts E, F, G; layout H was out), 7 of them video.
// Headlines lead with the benefit and land at a glance; copy only claims what the linked page says.
// Schedule: from Nov 2, 3 slots a day; a link never repeats within 3 days, counting batch 1's live/scheduled Pins 1-15
// (she deleted 16-30 and said not to re-add them).
// Usage: node batch-02.mjs   Output: pins/out/batch-02/ (PNG/MP4 per Pin, review.html, batch.json, sheet.png)
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, renderPins } from './lib/templates.mjs';
import { composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-02');
const P = (s) => `pexels-${s}`;
const B = {
  dm: 'Instagram DM Automation', goals: 'Small Business Goal Setting', holiday: 'Holiday Marketing Ideas for Small Business',
  pricing: 'Pricing your Products and Services', growth: 'Instagram Growth Tips for Small Businesses', seo: 'Website SEO for Small Business',
  planning: 'Social Media Content Planning', capcut: 'CapCut Reel Templates',
};

// Image fields are as approved in test-02.mjs; title/desc/keywords are the Pinterest text.
const PINS = [
  { id: 'v1-manychat-f', layout: 'F', video: P('v7681933-stylish-laptop'), hl: 'marker', link: '/chat-manager/', board: B.dm, serif: 'Tired of paying for ManyChat?', sel: 'There is a $6-a-month way',
    title: 'Tired of Paying for ManyChat? There Is a $6-a-Month Way', desc: 'Send your link by DM whenever someone comments your keyword, with your own comment-to-DM setup for Instagram and YouTube. About $6 a month to run, whatever your list size.', keywords: 'manychat alternative, instagram dm automation, comment to dm, instagram automation' },
  { id: 'p1-manychat-e', layout: 'E', photo: P('11179596-face-mask'), cardTop: 830, pin: 'cream', hl: 'reenie', link: '/chat-manager/', board: B.dm, serif: 'How to auto-reply to comments', small: 'without ManyChat',
    title: 'How to Auto-Reply to Instagram Comments Without ManyChat', desc: 'Someone comments your keyword and gets your link in their DMs automatically. Your own comment-to-DM tool for Instagram and YouTube, about $6 a month to run.', keywords: 'auto reply instagram comments, instagram dm automation, manychat alternative, comment to dm' },
  { id: 'p2-manychat-g', layout: 'G', photo: P('17792231-bed-phone'), ground: 'blush', link: '/chat-manager/', board: B.dm, badge: 'About $6 a month', lines: [{ t: 'stop', script: true }, { t: 'paying for' }, { t: 'ManyChat' }, { t: 'every month', script: true }],
    title: 'Stop Paying for ManyChat Every Month', desc: 'Your own comment-to-DM tool for Instagram and YouTube. Comments get your link by DM automatically, for about $6 a month to run.', keywords: 'manychat alternative, instagram automation tools, comment to dm, save money small business' },
  { id: 'v2-sales-e', layout: 'E', video: P('v7681923-woman-laptop'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/calculators/income-goal/', board: B.goals, serif: 'How many sales do you actually need?', small: 'work it out free',
    title: 'How Many Sales Do You Actually Need?', desc: 'Put in your income goal and offer price. This free calculator shows how many sales, website visitors and views it takes to get there.', keywords: 'income goal calculator, how many sales do i need, small business goals, sales target' },
  { id: 'v4-december-f', layout: 'F', video: P('v19553430-tree-ornament'), hl: 'sacramento', link: '/calculators/sales-goal/', board: B.holiday, serif: 'How many sales do you need this December?', sel: 'work it out free',
    title: 'How Many Sales Do You Need This December?', desc: 'Break your December revenue goal into the sales you need each week and each day. A free sales goal calculator for small businesses planning the holidays.', keywords: 'holiday sales goal, december sales, small business holiday planning, sales goal calculator' },
  { id: 'v5-december-e', layout: 'E', video: P('v3201314-tree-snow'), cardTop: 720, tilt: 2, pin: 'white', style: { serif: 'dmserif' }, size: 92, hl: 'marker', link: '/calculators/income-goal/', board: B.holiday, serif: 'Set your December income goal', small: 'then see the sales it takes',
    title: 'Set Your December Income Goal', desc: 'Set your December income goal, then see the sales, website visitors and views it takes to reach it. A free calculator for small business owners.', keywords: 'december income goal, holiday marketing small business, income goal calculator, christmas sales' },
  { id: 'p3-price-e', layout: 'E', photo: P('25409388-designer-spring'), cardTop: 840, pin: 'blue', hl: 'caveatbrush', link: '/calculators/price-to-customers/', board: B.pricing, serif: 'Not sure what to charge?', small: 'compare 3 prices free',
    title: 'Not Sure What to Charge? Compare 3 Prices', desc: 'Put in three price points and see how many customers each one needs to reach your goal. A free pricing calculator for small businesses.', keywords: 'what to charge, pricing your products, pricing calculator, how to price' },
  { id: 'p4-price-g', layout: 'G', photo: P('6912817-table-laptop'), ground: 'oat', link: '/calculators/price-to-customers/', board: B.pricing, badge: 'Free calculator', lines: [{ t: 'find your', script: true }, { t: 'right' }, { t: 'price' }, { t: 'in 3 numbers', script: true }],
    title: 'Find Your Right Price in 3 Numbers', desc: 'Your goal, three prices to compare, and the customers each one needs. Work out your right price with this free calculator.', keywords: 'pricing strategy, right price, small business pricing, pricing calculator' },
  { id: 'p5-profit-f', layout: 'F', photo: P('5473151-woman-laptop'), hl: 'reenie', link: '/calculators/profit/', board: B.pricing, serif: 'Are you actually making a profit?', sel: 'check it free',
    title: 'Are You Actually Making a Profit?', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. A free profit calculator for small business owners.', keywords: 'profit calculator, profit margin, small business profit, business finances' },
  { id: 'p6-views-e', layout: 'E', photo: P('7242766-stairs-outdoor'), cardTop: 120, tilt: 1.5, pin: 'cream', hl: 'sacramento', link: '/calculators/views-per-post/', board: B.growth, serif: 'How many views does each post need?', small: 'to hit your income goal',
    title: 'How Many Views Does Each Post Need?', desc: 'Put in your income goal, your rates and how often you post. See how many views each post needs, on average, to get there. Free calculator.', keywords: 'instagram views, views per post, instagram growth tips, content goals' },
  { id: 'p7-traffic-f', layout: 'F', photo: P('17459745-stairs-laptop'), textBottom: true, hl: 'marker', link: '/calculators/traffic-to-sales/', board: B.seo, serif: 'What is your website traffic worth?', sel: 'turn visitors into sales',
    title: 'What Is Your Website Traffic Worth?', desc: 'Turn your website traffic and conversion rate into estimated sales and revenue with this free calculator for small business websites.', keywords: 'website traffic, traffic to sales, website conversion, small business website' },
  { id: 'p8-breakeven-f', layout: 'F', photo: P('26546539-room-laptop'), hl: 'caveatbrush', link: '/calculators/break-even/', board: B.pricing, serif: 'Will that course pay for itself?', sel: 'do the math first',
    title: 'Will That Course Pay for Itself? Do the Math First', desc: 'Before you buy a course, tool or ad budget, see how many sales it takes to break even. A free break-even calculator.', keywords: 'break even calculator, business investment, is it worth it, small business costs' },
  { id: 'p9-hub-g', layout: 'G', photo: P('3747068-macbook-white'), ground: 'mist', link: '/calculators/', board: B.goals, badge: 'All free', lines: [{ t: 'the', script: true }, { t: '10 numbers' }, { t: 'that run' }, { t: 'your business', script: true }],
    title: 'The 10 Numbers That Run Your Business', desc: 'Ten free calculators for small business owners: income goal, sales goal, pricing, profit, break-even, conversion rate, order value, traffic, content output and views per post.', keywords: 'business calculators, small business numbers, free business tools, goal setting' },
  { id: 'p10-week-f', layout: 'F', photo: P('12497427-laptop-bed'), textBottom: true, hl: 'sacramento', link: '/1k-club/', board: B.planning, serif: 'Copy my system for a week of posts', sel: 'plan it in one sitting',
    title: 'Copy My System for a Week of Posts', desc: 'Plan a week of social media posts in one sitting. The $1K Club is a complete toolkit to plan, create and post organic content.', keywords: 'content planning, social media plan, batch content, week of posts' },
  { id: 'p11-week-g', layout: 'G', photo: P('8498522-computer-dog'), ground: 'latte', link: '/1k-club/', board: B.growth, badge: "Here's how", lines: [{ t: 'plan a', script: true }, { t: 'week of' }, { t: 'posts' }, { t: 'in one sitting', script: true }],
    title: 'Plan a Week of Posts in One Sitting', desc: 'Here is how to plan a full week of Instagram posts in one sitting, with a complete toolkit for organic content.', keywords: 'instagram content plan, plan posts, instagram growth tips, organic marketing' },
  { id: 'p12-week-e', layout: 'E', photo: P('10041228-coat-portrait'), cardTop: 860, pin: 'white', hl: 'marker', link: '/1k-club/', board: B.planning, serif: 'What to post this week, all planned', small: "here's my exact system",
    title: 'What to Post This Week, All Planned', desc: 'Stop guessing what to post. Plan your week of content with my exact system: a complete toolkit to plan, create and post organic content.', keywords: 'what to post, content ideas, social media content planning, content calendar' },
  { id: 'v3-google-f', layout: 'F', video: P('v7393135-typing'), focusX: .5, hl: 'caveatbrush', link: '/seo-site-audit/', board: B.seo, serif: 'Not showing up on Google?', sel: 'find out what to fix first',
    title: 'Not Showing Up on Google? Find Out What to Fix First', desc: 'An expert SEO audit of your website, competitors, technical performance, content and search opportunities, in priority order.', keywords: 'seo audit, not showing up on google, website seo, small business seo' },
  { id: 'p13-google-e', layout: 'E', photo: P('8368044-beige-suit'), cardTop: 860, pin: 'blue', hl: 'reenie', link: '/seo-site-audit/', board: B.seo, serif: 'Why your website is hard to find', small: 'and what to fix first',
    title: 'Why Your Website Is Hard to Find (and What to Fix First)', desc: 'A prioritized SEO audit of your website, competitors, content and search opportunities, so you know what to fix first.', keywords: 'website seo tips, google ranking, seo checklist, small business website' },
  { id: 'p14-reels-f', layout: 'F', photo: P('8489320-bed-dog'), hl: 'marker', link: '/product-reels/', board: B.capcut, serif: 'A month of Reels for your product', sel: 'just add your clips',
    title: 'A Month of Reels for Your Product', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post, and change the words, fonts and colours in CapCut.', keywords: 'capcut templates, reel templates, product reels, instagram reels for business' },
];

// Schedule: 3 slots a day at 10am, 2pm and 7pm US Eastern (EST from Nov 2 = 15:00, 19:00, 00:00 UTC), from Nov 2.
const HOURS = [15, 19, 24];
const last = {};
for (const r of JSON.parse(readFileSync(path.join(HERE, 'out/batch-01/batch.json'), 'utf8')).slice(0, 15)) last[r.url] = Date.parse(r.date + 'Z');
const url = (p) => SITE + p.link + '?utm_source=pinterest';
const slotTime = (n) => Date.parse('2026-11-02T00:00:00Z') + Math.floor(n / 3) * 864e5 + HOURS[n % 3] * 36e5;
const queue = [...PINS], GAP = 3 * 864e5;
let prevLayout = null;
for (let slot = 0; queue.length && slot < 90; slot++) {
  const t = slotTime(slot);
  // Earliest-listed Pin whose link is free; avoid the same layout twice in a row when another choice exists.
  const ok = queue.filter((p) => !(last[url(p)] && t - last[url(p)] < GAP));
  const pick = ok.find((p) => p.layout !== prevLayout) || ok[0];
  if (!pick) continue;
  pick.date = new Date(t).toISOString().slice(0, 19); last[url(pick)] = t; prevLayout = pick.layout; queue.splice(queue.indexOf(pick), 1);
}if (queue.length) throw new Error('could not schedule: ' + queue.map((p) => p.id).join(', '));
PINS.sort((a, b) => a.date.localeCompare(b.date));
PINS.forEach((p, i) => { p.id = `pin2-${String(i + 1).padStart(2, '0')}-${p.id}`; });

// Rule checks.
const errs = [];
for (const p of PINS) {
  if (p.title.length > 100) errs.push(`${p.id}: title too long`);
  if (p.desc.length > 500) errs.push(`${p.id}: description too long`);
  if (/[—|]/.test(p.title + p.desc)) errs.push(`${p.id}: em dash or |`);
  if (!Object.values(B).includes(p.board)) errs.push(`${p.id}: board`);
}
if (new Set(PINS.map((p) => p.title)).size !== PINS.length) errs.push('duplicate titles');
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
const W = 7 * 236 + 24, sf = path.join(OUT, '.sheet.html');
writeFileSync(sf, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(7,224px);gap:12px;width:${W}px">${PINS.map((p) => `<img src="${fileUrl(path.join(OUT, p.id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
const pg = await browser.newPage(); await pg.setViewport({ width: W, height: 400 });
await pg.goto(fileUrl(sf), { waitUntil: 'load' }); await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();

writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(PINS.map((p) => ({ id: p.id, board: p.board, url: url(p), date: p.date, title: p.title, description: p.desc, keywords: p.keywords, video: !!p.video, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 2 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img,.c video{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 2: ${PINS.length} Pins (${PINS.filter((p) => p.video).length} video), ${PINS[0].date.slice(0, 10)} to ${PINS.at(-1).date.slice(0, 10)}</h1><div class="g">
${PINS.map((p) => `<div class="c">${p.video ? `<video src="${p.id}.mp4" autoplay muted loop playsinline></video>` : `<img src="${p.id}.png" alt="">`}<div><b>${esc(p.title)}</b><p>${esc(p.desc)}</p><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}${p.video ? ' (video)' : ''}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${PINS.length} Pins, ${PINS[0].date} to ${PINS.at(-1).date}`);
