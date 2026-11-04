// Batch 5 (2026-11-04; first built under the name batch 3, which another chat already used): 35 Pins at 5 a day from Nov 11 (batch 2 ends Nov 10), her ask: "maybe we even up to 5x day".
// Mix: photo + video (E note card, F serif + highlight, G label bars), graphic with her site on a phone (A, D) and
// text-only lists (C; memory: always include text-only Pins). Approved styles only (layout H was out).
// Lessons applied: titles read like real Pinterest searches (her top Pins are board-name titles); headlines land at a
// glance; benefit first, never the product name; copy only claims what the linked page says.
// New pages since batch 1: /quiz/, /next-move/, /calculators/manychat-cost/, both ManyChat/Claude guides.
// Includes the December income-goal redo (old upload had the highlight outside the card) with the real gift bow.
// Usage: node batch-05.mjs   Output: pins/out/batch-05/ (PNG/MP4 per Pin, review.html, batch.json, sheet.png)
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, renderPins, styleFor, captureShots } from './lib/templates.mjs';
import { composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-05');
const P = (s) => `pexels-${s}`;
const B = {
  dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business', goals: 'Small Business Goal Setting', holiday: 'Holiday Marketing Ideas for Small Business',
  pricing: 'Pricing your Products and Services', growth: 'Instagram Growth Tips for Small Businesses', seo: 'Website SEO for Small Business',
  planning: 'Social Media Content Planning', capcut: 'CapCut Reel Templates', marketing: 'Business Marketing Ideas', reels: 'Social Media Reel Ideas for Instagram and TikTok',
};
const KW_DM = 'manychat alternative, instagram dm automation, auto reply instagram comments, comment to dm';

const PINS = [
  // ManyChat / Claude (her strongest new angle; guides + calculator).
  { layout: 'F', video: P('v7681933-stylish-laptop'), hl: 'caveatbrush', link: '/guides/replace-manychat-with-claude/', board: B.dm, serif: 'How I replaced ManyChat with Claude', sel: 'what it costs instead',
    title: 'How I Replaced ManyChat With Claude', desc: 'I replaced ManyChat with my own Instagram comment-to-DM setup that Claude built. What it does, what it costs, the setup traps, and who should stay put.', keywords: KW_DM + ', claude ai' },
  { layout: 'G', photo: P('17792231-bed-phone'), ground: 'rose', link: '/guides/replace-manychat-with-claude/', board: B.ai, badge: 'Read how', lines: [{ t: 'how I', script: true }, { t: 'replaced' }, { t: 'ManyChat' }, { t: 'with Claude', script: true }],
    title: 'Replace ManyChat With Claude: How I Did It', desc: 'What replacing ManyChat with Claude actually means, what mine does every day and what it costs compared with ManyChat.', keywords: 'claude ai, ai tools for small business, manychat alternative, instagram automation' },
  { layout: 'C', link: '/guides/replace-manychat-with-claude/', board: B.dm, num: '3', head: 'things my DM setup does', serif: 'every day, without ManyChat', items: ['Replies to keyword comments', 'Sends the link by DM', 'Collects the email'],
    title: 'Instagram DM Automation Without ManyChat', desc: 'What my own comment-to-DM setup does every day, built with Claude instead of paying for ManyChat.', keywords: KW_DM },
  { layout: 'A', link: '/calculators/manychat-cost/', board: B.dm, big: ['ManyChat', 'cost'], serif: 'for your audience size', chip: 'Free calculator',
    title: 'ManyChat Cost Calculator: What Will You Pay?', desc: 'See what ManyChat costs for your audience size, next to running your own comment-to-DM setup for about $6 a month.', keywords: 'manychat pricing, manychat cost, instagram automation cost, manychat alternative' },
  { layout: 'E', photo: P('5390124-cozy-laptop'), cardTop: 840, pin: 'cream', hl: 'reenie', link: '/calculators/manychat-cost/', board: B.dm, serif: 'What will ManyChat cost you?', small: 'check your audience size',
    title: 'How Much Does ManyChat Cost for Your Audience?', desc: 'Put in your audience size and see what ManyChat would cost, next to a comment-to-DM setup that runs for about $6 a month.', keywords: 'manychat pricing, how much is manychat, instagram dm automation, small business tools' },
  { layout: 'D', link: '/calculators/manychat-cost/', board: B.ai, serif: 'ManyChat or $6 a month?', sub: 'Compare the cost for your audience size.', btn_t: 'Free calculator',
    title: 'ManyChat vs a $6-a-Month DM Setup', desc: 'Compare what ManyChat costs for your audience with running your own comment-to-DM setup for about $6 a month. Free calculator.', keywords: 'manychat alternative, cheap instagram automation, ai tools for small business, manychat cost' },
  { layout: 'F', photo: P('7242766-stairs-outdoor'), textBottom: true, hl: 'marker', link: '/guides/can-claude-answer-instagram-dms/', board: B.ai, serif: 'Can Claude answer your Instagram DMs?', sel: 'what it can and can’t do',
    title: 'Can Claude Answer Instagram DMs?', desc: 'What Claude can and can’t do on its own, what you need, the three ways to set it up, and Instagram’s DM rules.', keywords: 'claude ai, ai instagram dms, ai tools for small business, instagram automation' },
  { layout: 'E', photo: P('8498522-computer-dog'), cardTop: 120, tilt: 1.5, pin: 'blue', hl: 'caveatbrush', link: '/guides/can-claude-answer-instagram-dms/', board: B.dm, serif: '3 ways to let AI answer your DMs', small: 'and Instagram’s rules',
    title: '3 Ways to Let AI Answer Your Instagram DMs', desc: 'The three ways to set up Claude to answer Instagram DMs, what you need for each, and Instagram’s rules for automation.', keywords: 'ai dm automation, instagram dm automation, claude ai, instagram tips' },
  { layout: 'F', photo: P('11179596-face-mask'), hl: 'sacramento', link: '/chat-manager/', board: B.dm, serif: 'Auto-reply to comments while you rest', sel: 'without ManyChat',
    title: 'Auto-Reply to Instagram Comments While You Rest', desc: 'Someone comments your keyword and gets your link by DM automatically. Your own comment-to-DM tool for Instagram and YouTube, about $6 a month to run.', keywords: KW_DM },
  { layout: 'C', link: '/chat-manager/', board: B.dm, num: '3', head: 'steps to auto DMs', serif: 'without ManyChat', items: ['Pick a keyword', 'Someone comments it', 'They get your link by DM'],
    title: 'How Comment-to-DM Works in 3 Steps', desc: 'Pick a keyword, someone comments it, they get your link by DM. Your own comment-to-DM tool for Instagram and YouTube, about $6 a month.', keywords: KW_DM },
  // Quizzes.
  { layout: 'G', photo: P('25409388-designer-spring'), ground: 'blush', link: '/quiz/', board: B.marketing, badge: 'Free quiz', lines: [{ t: 'find your', script: true }, { t: 'first' }, { t: 'offer' }, { t: 'in 3 steps', script: true }],
    title: 'Digital Product Ideas: Find Your First Offer', desc: 'Not sure what to sell? Answer 3 quick steps and get digital product ideas based on what you can already do. Free quiz.', keywords: 'digital product ideas, what to sell online, first digital product, small business ideas' },
  { layout: 'F', photo: P('12497427-laptop-bed'), textBottom: true, dim: .25, hl: 'caveatbrush', link: '/quiz/', board: B.marketing, serif: 'What digital product should you make?', sel: 'take the free quiz',
    title: 'What Digital Product Should You Make? Free Quiz', desc: 'A free 3-step quiz that turns what you can do into digital product ideas for your first offer.', keywords: 'digital product ideas, what to sell online, digital products to sell, side business ideas' },
  { layout: 'D', link: '/quiz/', board: B.marketing, serif: 'Not sure what to sell online?', sub: 'Find your first offer in 3 quick steps.', btn_t: 'Take the free quiz',
    title: 'Not Sure What to Sell Online?', desc: 'Find your first offer in 3 quick steps. A free quiz with digital product ideas based on what you already know how to do.', keywords: 'what to sell online, digital product ideas, online business ideas, first offer' },
  { layout: 'E', photo: P('6912817-table-laptop'), cardTop: 860, pin: 'white', hl: 'marker', link: '/next-move/', board: B.goals, serif: 'Stuck on your next business move?', small: 'take the free quiz',
    title: 'What Should Your Next Business Move Be? Free Quiz', desc: 'A free quiz that points you to your next step in growing your small business online.', keywords: 'small business next steps, business goals, grow your business, business planning' },
  { layout: 'A', link: '/next-move/', board: B.goals, big: ['Next', 'move'], serif: 'for your small business', chip: 'Free quiz',
    title: 'Next Steps for Your Small Business: Free Quiz', desc: 'Not sure what to work on next? Take the free next steps business quiz and get pointed to your next move.', keywords: 'small business goal setting, business next steps, small business tips, business quiz' },
  // Calculators (holiday angles now; people are searching December plans).
  { layout: 'E', video: P('v3201314-tree-snow'), cardTop: 720, tilt: 2, prop: 'prop-red-gift-bow', style: { serif: 'dmserif' }, size: 92, hl: 'marker', link: '/calculators/income-goal/', board: B.holiday, serif: 'Set your December income goal', small: 'then see the sales it takes',
    title: 'December Income Goal for Small Business', desc: 'Set your December income goal, then see the sales, website visitors and views it takes to reach it. A free calculator for small business owners.', keywords: 'december income goal, holiday sales goal, small business holiday marketing, income goal calculator' },
  { layout: 'C', link: '/calculators/income-goal/', board: B.goals, num: '3', head: 'numbers behind', serif: 'your income goal', items: ['Sales', 'Website visitors', 'Views'],
    title: 'Income Goal Calculator for Small Business', desc: 'Turn your income goal into the sales, website visitors and views it takes. Free calculator for small business owners.', keywords: 'income goal calculator, small business goals, business planning, sales goal' },
  { layout: 'F', photo: P('5473151-woman-laptop'), hl: 'reenie', link: '/calculators/income-goal/', board: B.goals, serif: 'Your 2027 income goal, in numbers', sel: 'free calculator',
    title: 'Set Your 2027 Income Goal (Free Calculator)', desc: 'Plan next year: set your income goal and see the sales, visitors and views it takes to get there.', keywords: '2027 goals, business goal setting, income goal, new year business planning' },
  { layout: 'F', video: P('v19553430-tree-ornament'), hl: 'marker', link: '/calculators/sales-goal/', board: B.holiday, serif: 'Your Black Friday sales goal', sel: 'per day, worked out free',
    title: 'Black Friday Sales Goal for Small Business', desc: 'Break your holiday revenue goal into the sales you need each week and each day. A free sales goal calculator.', keywords: 'black friday small business, holiday sales goal, black friday marketing, sales goal calculator' },
  { layout: 'A', link: '/calculators/sales-goal/', board: B.goals, big: ['Sales', 'per day'], serif: 'from your monthly goal', chip: 'Free calculator',
    title: 'Sales Goal Calculator: Sales Per Day', desc: 'Break a monthly revenue target into the sales you need each month, each week and each day.', keywords: 'sales goal calculator, daily sales goal, small business goals, revenue goal' },
  { layout: 'G', photo: P('8368044-beige-suit'), ground: 'oat', link: '/calculators/price-to-customers/', board: B.pricing, badge: 'Free calculator', lines: [{ t: 'how to', script: true }, { t: 'price' }, { t: 'your offer' }, { t: 'with 3 numbers', script: true }],
    title: 'How to Price Your Offer (Free Pricing Calculator)', desc: 'Compare three price points side by side and see how many customers each one needs to reach your goal.', keywords: 'how to price your products, pricing strategy, pricing calculator, small business pricing' },
  { layout: 'C', link: '/calculators/price-to-customers/', board: B.pricing, num: '3', head: 'prices to compare', serif: 'before you pick one', items: ['Low price', 'Middle price', 'High price'],
    title: 'Pricing Strategy: Compare 3 Prices', desc: 'Not sure what to charge? Compare three prices and see how many customers each one needs to reach your goal.', keywords: 'pricing strategy, what to charge, pricing your services, pricing calculator' },
  { layout: 'D', link: '/calculators/profit/', board: B.pricing, serif: 'Know your profit margin', sub: 'Gross profit, net profit and margin from your revenue and costs.', btn_t: 'Free calculator',
    title: 'Profit Margin Calculator for Small Business', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. Free calculator.', keywords: 'profit margin calculator, small business profit, business finances, pricing' },
  { layout: 'F', photo: P('13550510-desk-candle'), hl: 'caveatbrush', link: '/calculators/profit/', board: B.pricing, serif: 'Busy but not profitable?', sel: 'check your margin free',
    title: 'Busy But Not Profitable? Check Your Margin', desc: 'Work out your profit and profit margin from your revenue and costs with a free calculator for small business owners.', keywords: 'small business profit, profit margin, business money tips, small business finances' },
  { layout: 'G', photo: P('3747068-macbook-white'), ground: 'mist', link: '/calculators/', board: B.goals, badge: 'All free', lines: [{ t: 'free', script: true }, { t: 'business' }, { t: 'calculators' }, { t: 'for small shops', script: true }],
    title: 'Free Business Calculators for Small Business', desc: 'Ten free calculators: income goal, sales goal, pricing, profit, break-even, conversion rate, order value, traffic, content output and views per post.', keywords: 'free business calculators, small business tools, business planning tools, goal setting' },
  { layout: 'C', link: '/calculators/', board: B.goals, num: '3', head: 'numbers to plan', serif: 'your 2027 with', items: ['Income goal', 'Sales per day', 'Profit margin'],
    title: '3 Numbers to Plan Your 2027 Business', desc: 'Plan next year with three numbers: your income goal, the sales per day it takes, and your profit margin. Free calculators.', keywords: '2027 business planning, business goals, new year planning, small business numbers' },
  { layout: 'E', video: P('v7681923-woman-laptop'), cardTop: 860, pin: 'blue', hl: 'reenie', link: '/calculators/views-per-post/', board: B.reels, serif: 'How many views does each Reel need?', small: 'to hit your goal',
    title: 'How Many Views Does Each Reel Need?', desc: 'Put in your income goal, your rates and how often you post. See how many views each Reel needs, on average, to get there.', keywords: 'reel views, instagram reels tips, tiktok views, reel ideas for business' },
  { layout: 'A', link: '/calculators/views-per-post/', board: B.growth, big: ['Views', 'per post'], serif: 'to hit your income goal', chip: 'Free calculator',
    title: 'Instagram Views Per Post Calculator', desc: 'See how many views each post needs, on average, to reach your income goal. Free calculator.', keywords: 'instagram views, instagram growth tips, views per post, content goals' },
  { layout: 'F', photo: P('17459745-stairs-laptop'), textBottom: true, hl: 'sacramento', link: '/calculators/traffic-to-sales/', board: B.seo, serif: 'Turn website visitors into sales', sel: 'see your numbers free',
    title: 'Website Traffic to Sales Calculator', desc: 'Turn your website traffic and conversion rate into estimated sales and revenue. Free calculator.', keywords: 'website traffic, website sales, traffic to sales, small business website' },
  // $1K Club, Product Reels, SEO audit.
  { layout: 'G', photo: P('26546539-room-laptop'), ground: 'latte', link: '/1k-club/', board: B.planning, badge: "Here's how", lines: [{ t: 'never run', script: true }, { t: 'out of' }, { t: 'post ideas' }, { t: 'again', script: true }],
    title: 'Never Run Out of Post Ideas Again', desc: 'Plan, create and post organic content with a complete toolkit, including a week of post ideas planned in one sitting.', keywords: 'post ideas, content ideas for small business, social media content planning, instagram post ideas' },
  { layout: 'E', photo: P('10041228-coat-portrait'), cardTop: 860, pin: 'cream', hl: 'caveatbrush', link: '/1k-club/', board: B.growth, serif: 'Grow on Instagram without ads', small: "here's my system",
    title: 'How to Grow on Instagram Without Paid Ads', desc: 'A complete toolkit to plan, create and post organic content and go after your first $1,000 without depending on paid ads.', keywords: 'instagram growth, grow on instagram, organic marketing, instagram tips for small business' },
  { layout: 'F', photo: P('8489320-bed-dog'), hl: 'caveatbrush', link: '/product-reels/', board: B.reels, serif: 'Reel ideas for product businesses', sel: '25 ready-made templates',
    title: 'Reel Ideas for Product Businesses', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post, and change the words, fonts and colours.', keywords: 'reel ideas for business, product reels, instagram reel ideas, tiktok ideas' },
  { layout: 'D', link: '/product-reels/', board: B.capcut, serif: 'A month of product Reels, done', sub: '25 CapCut templates. Add your clips and post.', btn_t: 'See the pack',
    title: 'CapCut Templates for Product Reels', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post. Change it all in CapCut.', keywords: 'capcut templates, reel templates, product reels, capcut reel templates' },
  { layout: 'E', video: P('v7393135-typing'), cardTop: 860, pin: 'white', hl: 'marker', link: '/seo-site-audit/', board: B.seo, serif: 'Why isn’t my website on Google?', small: 'find out what to fix',
    title: 'Why Isn’t My Website Showing Up on Google?', desc: 'An expert SEO audit of your website, competitors, technical performance, content and search opportunities, in priority order.', keywords: 'website not on google, seo audit, small business seo, google ranking' },
  { layout: 'C', link: '/seo-site-audit/', board: B.seo, num: '3', head: 'things an SEO audit', serif: 'checks on your website', items: ['Technical problems', 'Your content', 'Your competitors'],
    title: 'What an SEO Audit Checks on Your Website', desc: 'A prioritized SEO audit covers your technical performance, content, competitors and search opportunities, so you know what to fix first.', keywords: 'seo audit, website seo checklist, small business seo, seo tips' },
];

// Graphic layouts (A, C, D) get a rotating style; each layout keeps its own counter (as in batch 1).
const n = { A: 0, C: 0, D: 0 };
for (const p of PINS) if (n[p.layout] !== undefined) p.style = styleFor(p.layout, n[p.layout]++ + 3);
for (const p of PINS) if (p.photo && !existsSync(path.join(HERE, 'assets/stock', p.photo + '.jpg'))) throw new Error('missing stock photo ' + p.photo);

// Schedule: 5 a day from Nov 11 at 8am, 11am, 2pm, 5pm, 8pm US Eastern (EST = UTC-5). A link never repeats within
// 3 days, counting batches 1-4 (minus the Pins she deleted); the same layout never runs twice in a row.
const HOURS = [13, 16, 19, 22, 25];
const url = (p) => SITE + p.link + '?utm_source=pinterest';
const last = {};
const prior = [...JSON.parse(readFileSync(path.join(HERE, 'out/batch-01/batch.json'), 'utf8')).slice(0, 15),
  ...JSON.parse(readFileSync(path.join(HERE, 'out/batch-02/batch.json'), 'utf8')).filter((r) => !r.id.startsWith('pin2-10-')),
  ...['batch-03', 'batch-04'].flatMap((b) => JSON.parse(readFileSync(path.join(HERE, 'out', b, 'batch.json'), 'utf8')))];
for (const r of prior) last[r.url] = Math.max(last[r.url] || 0, Date.parse(r.date + 'Z'));
const slotTime = (k) => Date.parse('2026-11-11T00:00:00Z') + Math.floor(k / 5) * 864e5 + HOURS[k % 5] * 36e5;
const queue = [...PINS], GAP = 3 * 864e5;
let prevLayout = null;
for (let k = 0; queue.length && k < 200; k++) {
  const t = slotTime(k);
  const ok = queue.filter((p) => !(last[url(p)] && t - last[url(p)] < GAP));
  const pick = ok.find((p) => p.layout !== prevLayout) || ok[0];
  if (!pick) continue;
  pick.date = new Date(t).toISOString().slice(0, 19); last[url(pick)] = t; prevLayout = pick.layout; queue.splice(queue.indexOf(pick), 1);
}
if (queue.length) throw new Error('could not schedule: ' + queue.length);
PINS.sort((a, b) => a.date.localeCompare(b.date));
const slug = (l) => l.replace(/^\/|\/$/g, '').split('/').pop();
PINS.forEach((p, i) => { p.id = `pin5-${String(i + 1).padStart(2, '0')}-${slug(p.link) || 'home'}-${p.layout.toLowerCase()}${p.video ? 'v' : ''}`; });

// Rule checks.
const errs = [];
for (const p of PINS) {
  if (p.title.length > 100) errs.push(`${p.id}: title ${p.title.length} chars`);
  if (p.desc.length > 500) errs.push(`${p.id}: description too long`);
  if (/[—|]/.test(p.title + p.desc)) errs.push(`${p.id}: em dash or |`);
  if (!Object.values(B).includes(p.board)) errs.push(`${p.id}: board`);
}
if (new Set(PINS.map((p) => p.title)).size !== PINS.length) errs.push('duplicate titles');
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
await captureShots(browser, PINS.filter((p) => ['A', 'D'].includes(p.layout)).map((p) => p.link));
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
const W = 7 * 236 + 24, sf = path.join(OUT, '.sheet.html');
writeFileSync(sf, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(7,224px);gap:12px;width:${W}px">${PINS.map((p) => `<img src="${fileUrl(path.join(OUT, p.id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
const pg = await browser.newPage(); await pg.setViewport({ width: W, height: 400 });
await pg.goto(fileUrl(sf), { waitUntil: 'load' }); await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();

writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(PINS.map((p) => ({ id: p.id, board: p.board, url: url(p), date: p.date, title: p.title, description: p.desc, keywords: p.keywords, video: !!p.video, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 5 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img,.c video{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 5 (new): ${PINS.length} Pins (${PINS.filter((p) => p.video).length} video), ${PINS[0].date.slice(0, 10)} to ${PINS.at(-1).date.slice(0, 10)}</h1><div class="g">
${PINS.map((p) => `<div class="c">${p.video ? `<video src="${p.id}.mp4" autoplay muted loop playsinline></video>` : `<img src="${p.id}.png" alt="">`}<div><b>${esc(p.title)}</b><p>${esc(p.desc)}</p><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}${p.video ? ' (video)' : ''}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${PINS.length} Pins, ${PINS[0].date} to ${PINS.at(-1).date}`);
