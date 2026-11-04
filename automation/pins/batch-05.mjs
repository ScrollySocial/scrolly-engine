// Batch 5 (2026-11-04; first built under the name batch 3, which another chat already used): 35 Pins at 5 a day from Nov 11 (batch 2 ends Nov 10), her ask: "maybe we even up to 5x day".
// Rebuilt 2026-11-04 after her review: every image new (none from batches 1-4, none twice), no numbered-list Pins,
// new looks J (instant-photo frame) and K (label-maker tape; text-only on plain grounds) next to E, F, G. Layout H was out.
// Lessons applied: titles read like real Pinterest searches (her top Pins are board-name titles); headlines land at a
// glance; benefit first, never the product name; copy only claims what the linked page says.
// New pages since batch 1: /quiz/, /next-move/, /calculators/manychat-cost/, both ManyChat/Claude guides.
// Includes the December income-goal redo (old upload had the highlight outside the card) with the real gift bow.
// Usage: node batch-05.mjs   Output: pins/out/batch-05/ (PNG/MP4 per Pin, review.html, batch.json, sheet.png)
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, renderPins, ensureStock } from './lib/templates.mjs';
import { composeVideoPin, ensureClips } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/batch-05');
const P = (s) => `pexels-${s}`;
const B = {
  dm: 'Instagram DM Automation', ai: 'AI Tools for Small Business', goals: 'Small Business Goal Setting', holiday: 'Holiday Marketing Ideas for Small Business',
  pricing: 'Pricing your Products and Services', growth: 'Instagram Growth Tips for Small Businesses', seo: 'Website SEO for Small Business',
  planning: 'Social Media Content Planning', capcut: 'CapCut Reel Templates', marketing: 'Business Marketing Ideas', reels: 'Social Media Reel Ideas for Instagram and TikTok',
};

// Fresh Pexels picks for batch 5 only (her rule 2026-11-04: no image used in an earlier batch, no numbered-list Pins,
// nothing that looks like the old Pins). Downloaded once into assets/stock/ (gitignored), credits in credits.json.
const px = (id, slug) => ({ id: `pexels-${id}-${slug}`, src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`, page: `https://www.pexels.com/photo/${id}/`, picked: 'Claude (batch 5)' });
const PHOTOS = [
  px(5390693, 'journal-bed'), px(13735930, 'cafe-notebook'), px(16186795, 'pen-hand'), px(8167289, 'pink-phone'), px(7394372, 'pink-flatlay'),
  px(5208294, 'pink-planner'), px(12679950, 'sunglasses-laptop'), px(11989314, 'hands-phone-dark'), px(8938259, 'hands-phone-green'), px(3756879, 'orange-phone'),
  px(6755799, 'candle-maker'), px(6755858, 'candle-jar'), px(7234525, 'jewelry-hands'), px(12911609, 'plants-laptop'), px(4050366, 'floor-laptop'),
  px(17117467, 'peonies-laptop'), px(3874609, 'tulips-laptop'), px(35446297, 'xmas-gifts'), px(6334694, 'gold-wrapping'), px(29341293, 'gift-supplies'),
  px(5727928, 'gift-wrap-white'), px(5900135, 'calculator-hands'), px(7680747, 'receipt'), px(7223500, 'packing-box'), px(7679739, 'packing-tape'),
  px(6399496, 'bokeh-mug'), px(15422829, 'xmas-coffee-laptop'), px(5942700, 'xmas-desk'), px(6347629, 'ring-light'), px(7676430, 'tripod-filming'),
  px(7622883, 'writing-bed'), px(8534161, 'laptop-flowers'), px(8489952, 'pink-phone-flatlay'), px(5900162, 'woman-calculator'), px(4050340, 'floor-laptop-2'),
];
const vid = (id, slug, file) => ({ id: `pexels-v${id}-${slug}`, src: `https://videos.pexels.com/video-files/${id}/${file}`, page: `https://www.pexels.com/video/${id}/`, picked: 'Claude (batch 5)' });
const CLIPS = [
  vid(6000648, 'puffer-typing', '6000648-hd_1080_1920_24fps.mp4'), vid(5075207, 'coffee-photo', '5075207-hd_1080_2048_25fps.mp4'),
  vid(6314621, 'xmas-lights', '6314621-hd_1080_1920_24fps.mp4'), vid(6347120, 'box-sticker', '6347120-hd_1080_1920_24fps.mp4'),
];
const S = (s) => `pexels-${s}`;

// Copy v3 (2026-11-04): her row notes + Pinterest's own search suggestions (typeahead, read logged in on her account).
// Pinterest suggests: manychat automation, dm automation instagram, auto reply instagram, instagram automation tool,
// claude prompts for business, what should i sell online, what can i sell online to make money, digital product ideas
// to sell, how to sell your first digital product, small business tips for beginners, black friday ideas for small
// business, black friday marketing ideas, holiday sales ideas, small business income goals, monthly income goals,
// how to price your handmade products, pricing strategy business, profit margin formula, profit margin calculator,
// how to manage small business finances, reel ideas for small business, product reels ideas, what to post on
// instagram small business, how to grow organically on instagram, content planning ideas, instagram content plan small
// business, seo tips for small business, website seo audit, website traffic increase.
// NOT suggested on Pinterest: manychat alternative, claude ai, ai tools for business, how to get your website on google.
// No years in Pins (her rule). Copy only claims what the linked page says.
const KW_AUTO = 'manychat automation, dm automation instagram, auto reply instagram, instagram automation tool';
const PINS = [
  // ManyChat / AI / Chat Manager.
  { layout: 'F', video: S('v6000648-puffer-typing'), serif: 'I replaced ManyChat with Claude', sel: 'here is what it costs', hl: 'caveatbrush', link: '/guides/replace-manychat-with-claude/', board: B.dm,
    title: 'How I Replaced ManyChat With Claude', desc: 'I replaced ManyChat with my own Instagram comment-to-DM setup that Claude built. What it does, what it costs, the setup traps, and who should stay put.', keywords: KW_AUTO + ', claude prompts for business' },
  { layout: 'J', photo: S('8938259-hands-phone-green'), ground: 'mist', serif_t: 'Claude for business: let it answer your DMs', size: 96, cap: '3 ways to set it up', hl: 'reenie', link: '/guides/can-claude-answer-instagram-dms/', board: B.ai,
    title: 'Claude for Business: Let It Answer Your Instagram DMs', desc: 'What Claude can and can\u2019t do on its own, what you need, the three ways to set it up, and Instagram\u2019s DM rules.', keywords: 'claude prompts for business, claude skills, manychat automation, instagram automation tool' },
  { layout: 'F', photo: S('11989314-hands-phone-dark'), hl: 'marker', link: '/chat-manager/', board: B.dm, serif: 'DM automation for Instagram', sel: 'without ManyChat',
    title: 'DM Automation for Instagram Without ManyChat', desc: 'Your own comment-to-DM tool for Instagram and YouTube: someone comments your keyword and gets your link by DM. About $6 a month to run.', keywords: 'dm automation instagram, instagram dm automation, instagram automation workflow, manychat automation' },
  { layout: 'J', photo: S('8534161-laptop-flowers'), ground: 'navy', serif_t: 'What does ManyChat really cost?', cap: 'compare for your audience', hl: 'caveatbrush', link: '/calculators/manychat-cost/', board: B.dm,
    title: 'ManyChat Automation Cost: Free Calculator', desc: 'See what ManyChat costs for your audience size, next to running your own comment-to-DM setup for about $6 a month.', keywords: 'manychat automation, manychat pricing, instagram automation tool, small business tools' },
  { layout: 'E', photo: S('3756879-orange-phone'), cardTop: 880, pin: 'white', hl: 'reenie', link: '/calculators/manychat-cost/', board: B.dm, serif: 'ManyChat automation too pricey?', small: 'see the cheaper way',
    title: 'ManyChat Automation Too Expensive? Compare the Cost', desc: 'Put in your audience size and see what ManyChat would cost, next to a comment-to-DM setup that runs for about $6 a month.', keywords: 'manychat automation, instagram automation tool, dm automation instagram, small business tools' },
  { layout: 'J', photo: S('8167289-pink-phone'), ground: 'rose', serif_t: 'ManyChat or $6 a month?', cap: 'free cost calculator', hl: 'marker', link: '/calculators/manychat-cost/', board: B.ai,
    title: 'ManyChat Automation vs a $6-a-Month Setup', desc: 'Compare what ManyChat costs for your audience with running your own comment-to-DM setup for about $6 a month. Free calculator.', keywords: 'manychat automation, instagram automation tool, automation on instagram, small business tools' },
  { layout: 'F', photo: S('12679950-sunglasses-laptop'), hl: 'caveatbrush', link: '/guides/replace-manychat-with-claude/', board: B.ai, serif: 'How to use AI to replace ManyChat', sel: 'here is how I did it',
    title: 'How to Use AI to Replace ManyChat', desc: 'How I used Claude to build my own Instagram comment-to-DM setup instead of paying for ManyChat: what it does, what it costs and the setup traps.', keywords: 'claude prompts for business, manychat automation, instagram automation tool, dm automation instagram' },
  { layout: 'E', photo: S('17117467-peonies-laptop'), cardTop: 860, pin: 'white', serif: 'You can slash your ManyChat bill', small: 'here is how', hl: 'reenie', link: '/guides/replace-manychat-with-claude/', board: B.dm,
    title: 'Instagram Automation Tool: Slash Your ManyChat Bill', desc: 'How I replaced ManyChat with my own comment-to-DM setup that runs for about $6 a month, and who should stay put.', keywords: 'instagram automation tool, manychat automation, dm automation instagram, small business tools' },
  { layout: 'E', video: S('v5075207-coffee-photo'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/chat-manager/', board: B.dm, serif: 'Auto reply on Instagram', small: 'without ManyChat',
    title: 'Auto Reply Instagram Comments Without ManyChat', desc: 'Someone comments your keyword and gets your link by DM automatically. Your own comment-to-DM tool for Instagram and YouTube, about $6 a month to run.', keywords: 'auto reply instagram, dm automation instagram, instagram automation tool, manychat automation' },
  { layout: 'G', photo: S('4050366-floor-laptop'), ground: 'blush', link: '/chat-manager/', board: B.dm, badge: 'About $6 a month', lines: [{ t: 'how to', script: true }, { t: 'replace' }, { t: 'ManyChat' }, { t: 'for $6 a month', script: true }],
    title: 'How to Replace ManyChat for $6 a Month', desc: 'Your own comment-to-DM tool for Instagram and YouTube: someone comments your keyword and gets your link by DM. About $6 a month to run.', keywords: 'manychat automation, instagram automation tool, auto reply instagram, dm automation instagram' },
  // Quizzes.
  { layout: 'J', photo: S('7234525-jewelry-hands'), ground: 'oat', serif_t: 'Want to make money online but don’t know where to start?', size: 84, cap: 'we’ve got you', hl: 'caveatbrush', link: '/quiz/', board: B.marketing,
    title: 'What Can I Sell Online? Find Your First Digital Product', desc: 'Want to make money online but don’t know where to start? Answer 3 quick steps and get digital product ideas based on what you can already do. Free quiz.', keywords: 'what can i sell online to make money, digital product ideas for beginners, how to sell your first digital product, side hustle ideas' },
  { layout: 'J', photo: S('8489952-pink-phone-flatlay'), ground: 'deeprose', serif_t: 'Digital product ideas to sell', cap: 'find yours in 3 steps', hl: 'marker', link: '/quiz/', board: B.marketing,
    title: 'Digital Product Ideas to Sell (Free Quiz)', desc: 'Find your first offer in 3 quick steps. A free quiz with digital product ideas based on what you already know how to do.', keywords: 'digital product ideas to sell, digital product ideas that sell, digital product ideas for beginners, what to sell online' },
  { layout: 'F', photo: S('5208294-pink-planner'), textBottom: true, hl: 'sacramento', link: '/quiz/', board: B.marketing, serif: 'What should I sell online?', sel: 'take the free quiz',
    title: 'What Should I Sell Online? Free Quiz', desc: 'A free 3-step quiz that turns what you can already do into digital product ideas for your first offer.', keywords: 'what should i sell online, what to sell online ideas, digital product ideas to sell, side hustle ideas at home' },
  { layout: 'E', photo: S('13735930-cafe-notebook'), cardTop: 120, tilt: 1.5, pin: 'cream', hl: 'marker', link: '/next-move/', board: B.goals, serif: 'Not sure what to do next in your business?', small: 'take the free quiz',
    title: 'Small Business Tips for Beginners: What to Do Next', desc: 'A free quiz that points you to your next step in growing your small business online.', keywords: 'small business tips for beginners, small business tips, start a business checklist, business goals ideas' },
  { layout: 'J', photo: S('12911609-plants-laptop'), ground: 'latte', serif_t: 'Your next step in business', cap: 'take the free quiz', hl: 'reenie', link: '/next-move/', board: B.goals,
    title: 'Small Business Tips: Find Your Next Step (Free Quiz)', desc: 'Not sure what to work on next? Take the free next steps business quiz and get pointed to your next move.', keywords: 'small business tips and tricks, small business tips for beginners, business goals ideas, start a business' },
  // Holiday + goals (calculators).
  { layout: 'E', video: S('v6314621-xmas-lights'), cardTop: 640, tilt: 2, prop: 'prop-red-gift-bow', style: { serif: 'dmserif' }, size: 92, hl: 'marker', link: '/calculators/income-goal/', board: B.goals, serif: 'Set your monthly income goal', small: 'then see the sales it takes',
    title: 'Monthly Income Goals for Small Business (Free Calculator)', desc: 'Set your monthly income goal, then see the sales, website visitors and views it takes to reach it. A free calculator for small business owners.', keywords: 'monthly income goals, small business income goals, business income goals, income goal tracker' },
  { layout: 'J', photo: S('35446297-xmas-gifts'), ground: 'cream', serif_t: 'How to hit your Black Friday sales goal', size: 100, cap: 'free sales goal calculator', hl: 'caveatbrush', link: '/calculators/sales-goal/', board: B.holiday,
    title: 'Black Friday Ideas for Small Business: Hit Your Sales Goal', desc: 'Break your Black Friday and holiday revenue goal into the sales you need each week and each day. A free sales goal calculator.', keywords: 'black friday ideas for small business, black friday small business ideas, black friday marketing ideas, sales goal tracker' },
  { layout: 'F', photo: S('6334694-gold-wrapping'), serif: 'Holiday sales ideas start here', sel: 'set your sales goal', hl: 'caveatbrush', link: '/calculators/sales-goal/', board: B.holiday,
    title: 'Holiday Sales Ideas for Small Business: Set Your Goal', desc: 'Before the holiday rush, break your sales target into the sales you need each month, week and day. Free calculator.', keywords: 'holiday sales ideas, holiday sales marketing, christmas small business ideas, sales goal tracker' },
  { layout: 'F', photo: S('15422829-xmas-coffee-laptop'), textBottom: true, hl: 'reenie', link: '/calculators/income-goal/', board: B.goals, serif: 'Small business income goals', sel: 'work yours out free',
    title: 'Small Business Income Goals: Free Calculator', desc: 'Set your income goal and see the sales, visitors and views it takes to get there.', keywords: 'small business income goals, business income goals, monthly income goals, business goals ideas' },
  { layout: 'G', photo: S('5942700-xmas-desk'), ground: 'mist', link: '/calculators/', board: B.goals, badge: 'All free', lines: [{ t: 'manage your', script: true }, { t: 'business' }, { t: 'finances' }, { t: 'free calculators', script: true }],
    title: 'How to Manage Small Business Finances: Free Calculators', desc: 'Free calculators for small business owners: income goal, sales per day, pricing, profit, break-even, conversion rate and more.', keywords: 'how to manage small business finances, managing small business finances, business finance tracker, small business tips' },
  // Pricing + profit.
  { layout: 'J', photo: S('6755799-candle-maker'), ground: 'rose', serif_t: 'How to price your handmade products', size: 100, cap: 'free pricing calculator', hl: 'marker', link: '/calculators/price-to-customers/', board: B.pricing,
    title: 'How to Price Your Handmade Products', desc: 'Compare three price points side by side and see how many customers each one needs to reach your goal. Free pricing calculator.', keywords: 'how to price your handmade products, how to price crafts to sell, how to price handmade items to sell, pricing guide' },
  { layout: 'J', photo: S('5900162-woman-calculator'), ground: 'espresso', serif_t: 'Pricing strategy for small business', size: 100, cap: 'compare 3 prices', hl: 'reenie', link: '/calculators/price-to-customers/', board: B.pricing,
    title: 'Pricing Strategy for Small Business: Compare 3 Prices', desc: 'Compare three prices and see how many customers each one needs to reach your goal. A free calculator for small businesses.', keywords: 'pricing strategy business, pricing strategy, how to price your products, pricing guide' },
  { layout: 'E', photo: S('5900135-calculator-hands'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/calculators/profit/', board: B.pricing, serif: 'Profit margin formula, done for you', small: 'free calculator',
    title: 'Profit Margin Formula + Free Profit Margin Calculator', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. A free calculator for small business owners.', keywords: 'profit margin formula, profit margin calculator, profit margins, small business finances' },
  { layout: 'F', photo: S('7680747-receipt'), hl: 'marker', link: '/calculators/profit/', board: B.pricing, serif: 'Profit margin calculator', sel: 'free, for small business',
    title: 'Profit Margin Calculator for Small Business', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. Free calculator.', keywords: 'profit margin calculator, profit margin formula, profitable small business ideas, business finance' },
  // Content, Reels, traffic, SEO.
  { layout: 'J', photo: S('6347629-ring-light'), ground: 'blush', serif_t: 'Reel ideas for small business', cap: 'fresh ideas every week', hl: 'caveatbrush', link: '/1k-club/', board: B.reels,
    title: 'Reel Ideas for Small Business: Fresh Ideas Every Week', desc: 'Never run out of Reel ideas: the $1K Club and Challenge include fresh Reel ideas every week, plus a toolkit to plan, create and post.', keywords: 'reel ideas for small business, reel ideas for business, reels for business ideas, instagram reels ideas' },
  { layout: 'F', photo: S('7676430-tripod-filming'), textBottom: true, serif: 'How much content should you post?', sel: 'free content calculator', hl: 'marker', link: '/calculators/content-output/', board: B.planning,
    title: 'Content Planning Ideas: How Much Should You Post?', desc: 'See how a small daily content habit adds up when you share each piece on more than one platform. A free calculator.', keywords: 'content planning ideas, content planning calendar, content ideas for business, instagram content plan small business' },
  { layout: 'E', photo: S('3874609-tulips-laptop'), cardTop: 860, pin: 'cream', hl: 'reenie', link: '/calculators/traffic-to-sales/', board: B.seo, serif: 'Turn website visitors into sales', small: 'see your numbers free',
    title: 'Website Traffic Increase: Turn Visitors Into Sales', desc: 'Turn your website traffic and conversion rate into estimated sales and revenue. Free calculator.', keywords: 'website traffic increase, website traffic, small business website, website seo tips' },
  { layout: 'G', photo: S('7394372-pink-flatlay'), ground: 'latte', link: '/1k-club/', board: B.planning, badge: "Here's how", lines: [{ t: 'not sure', script: true }, { t: 'what to post' }, { t: 'to grow?' }, { t: 'start here', script: true }],
    title: 'What to Post on Instagram for Small Business', desc: 'Not sure what to post to grow your account? Plan, create and post with a complete toolkit, including a week of post ideas planned in one sitting.', keywords: 'what to post on instagram small business, instagram post ideas for small business, content ideas for instagram, instagram post ideas business' },
  { layout: 'F', photo: S('5390693-journal-bed'), textBottom: true, hl: 'caveatbrush', link: '/1k-club/', board: B.growth, serif: 'How to grow organically on Instagram', sel: "here's my system",
    title: 'How to Grow Organically on Instagram', desc: 'A complete toolkit to plan, create and post organic content and go after your first $1,000 without depending on paid ads.', keywords: 'how to grow organically on instagram, instagram tips to grow, instagram growth tips for small business, how to grow engagement on instagram' },
  { layout: 'J', photo: S('7622883-writing-bed'), ground: 'mist', serif_t: 'Instagram content plan for small business', size: 96, cap: 'see how much to post', hl: 'marker', link: '/calculators/content-output/', board: B.planning,
    title: 'Instagram Content Plan for Small Business', desc: 'Plan how much to post: see how a small daily content habit adds up when you share each piece on more than one platform. A free calculator.', keywords: 'instagram content plan small business, instagram content planner small business, content planning ideas, content calendar' },
  { layout: 'E', video: S('v6347120-box-sticker'), cardTop: 860, pin: 'blue', serif: 'No time for content this month?', small: 'try this!', hl: 'caveatbrush', link: '/product-reels/', board: B.reels,
    title: 'Product Reels Ideas: 25 Ready-Made Reels for Your Shop', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post, and change the words, fonts and colours.', keywords: 'product reels ideas, product reels instagram ideas, reel ideas product, reel ideas for small business' },
  { layout: 'E', photo: S('7679739-packing-tape'), cardTop: 120, tilt: -1.5, pin: 'white', hl: 'marker', link: '/product-reels/', board: B.capcut, serif: 'CapCut templates for product Reels', small: '25 ready to edit',
    title: 'CapCut Templates for Product Reels', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post. Change it all in CapCut.', keywords: 'capcut templates edit, capcut templates video, product reels video ideas, reel templates' },
  { layout: 'F', photo: S('16186795-pen-hand'), hl: 'reenie', link: '/seo-site-audit/', board: B.seo, serif: 'SEO tips for small business', sel: 'start with a site audit',
    title: 'SEO Tips for Small Business: Know What to Fix First', desc: 'An expert SEO audit of your website, competitors, technical performance, content and search opportunities, in priority order.', keywords: 'seo tips for small business, seo for small business, seo tips for beginners, website seo tips' },
  { layout: 'J', photo: S('4050340-floor-laptop-2'), ground: 'cream', serif_t: 'Website SEO audit', cap: 'know what to fix first', hl: 'caveatbrush', link: '/seo-site-audit/', board: B.seo,
    title: 'Website SEO Audit for Small Business', desc: 'A prioritized SEO audit of your technical performance, content, competitors and search opportunities, so you know what to fix first.', keywords: 'website seo audit, local seo for small business, seo tips for small business, website seo optimization' },
];
// Layout K (label-maker tape) was rejected as ugly (2026-11-04); its Pins moved to E, F and J.

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

await ensureStock(PHOTOS);
await ensureClips(CLIPS);
// No image may repeat inside the batch or from earlier batches (all picks are new ids).
const imgs = PINS.map((p) => p.photo || p.video).filter(Boolean); if (new Set(imgs).size !== imgs.length) throw new Error('an image is used twice in batch 5');
const browser = await launch();
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
