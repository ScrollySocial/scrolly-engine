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
const KW_DM = 'manychat alternative, instagram dm automation, auto reply instagram comments, comment to dm';

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

// Looks for batch 5: J (photo in a real instant-photo frame), K (label-maker tape headline; photo, video or plain
// ground for text-only), plus E (note card), F (serif + highlight) and G (label bars) on the new photos.
const PINS = [
  // ManyChat / Claude.
  { layout: 'F', video: S('v6000648-puffer-typing'), serif: 'I replaced ManyChat with Claude', sel: 'here is what it costs', hl: 'caveatbrush', link: '/guides/replace-manychat-with-claude/', board: B.dm,
    title: 'How I Replaced ManyChat With Claude', desc: 'I replaced ManyChat with my own Instagram comment-to-DM setup that Claude built. What it does, what it costs, the setup traps, and who should stay put.', keywords: KW_DM + ', claude ai' },
  { layout: 'J', photo: S('8938259-hands-phone-green'), ground: 'mist', serif_t: 'Replace ManyChat with Claude', cap: 'here is how I did it', hl: 'reenie', link: '/guides/replace-manychat-with-claude/', board: B.ai, doodles: ['sparkle'],
    title: 'Replace ManyChat With Claude: How I Did It', desc: 'What replacing ManyChat with Claude actually means, what mine does every day and what it costs compared with ManyChat.', keywords: 'claude ai, ai tools for small business, manychat alternative, instagram automation' },
  { layout: 'F', photo: S('11989314-hands-phone-dark'), hl: 'marker', link: '/guides/replace-manychat-with-claude/', board: B.dm, serif: 'Instagram auto DMs without ManyChat', sel: 'what mine does every day',
    title: 'Instagram DM Automation Without ManyChat', desc: 'What my own comment-to-DM setup does every day, built with Claude instead of paying for ManyChat.', keywords: KW_DM },
  { layout: 'J', photo: S('8534161-laptop-flowers'), ground: 'navy', serif_t: 'What does ManyChat really cost?', cap: 'compare for your audience', hl: 'caveatbrush', link: '/calculators/manychat-cost/', board: B.dm,
    title: 'ManyChat Cost Calculator: What Will You Pay?', desc: 'See what ManyChat costs for your audience size, next to running your own comment-to-DM setup for about $6 a month.', keywords: 'manychat pricing, manychat cost, instagram automation cost, manychat alternative' },
  { layout: 'E', photo: S('3756879-orange-phone'), cardTop: 880, pin: 'white', hl: 'reenie', link: '/calculators/manychat-cost/', board: B.dm, serif: 'What will ManyChat cost you?', small: 'check your audience size',
    title: 'How Much Does ManyChat Cost for Your Audience?', desc: 'Put in your audience size and see what ManyChat would cost, next to a comment-to-DM setup that runs for about $6 a month.', keywords: 'manychat pricing, how much is manychat, instagram dm automation, small business tools' },
  { layout: 'J', photo: S('8167289-pink-phone'), ground: 'rose', serif_t: 'ManyChat or $6 a month?', cap: 'free cost calculator', hl: 'marker', link: '/calculators/manychat-cost/', board: B.ai,
    title: 'ManyChat vs a $6-a-Month DM Setup', desc: 'Compare what ManyChat costs for your audience with running your own comment-to-DM setup for about $6 a month. Free calculator.', keywords: 'manychat alternative, cheap instagram automation, ai tools for small business, manychat cost' },
  { layout: 'F', photo: S('12679950-sunglasses-laptop'), hl: 'caveatbrush', link: '/guides/can-claude-answer-instagram-dms/', board: B.ai, serif: 'Can Claude answer your Instagram DMs?', sel: 'what it can and can’t do',
    title: 'Can Claude Answer Instagram DMs?', desc: 'What Claude can and can’t do on its own, what you need, the three ways to set it up, and Instagram’s DM rules.', keywords: 'claude ai, ai instagram dms, ai tools for small business, instagram automation' },
  { layout: 'E', photo: S('17117467-peonies-laptop'), cardTop: 860, pin: 'white', serif: 'Let AI answer your DMs', small: '3 ways to set it up', hl: 'reenie', link: '/guides/can-claude-answer-instagram-dms/', board: B.dm,
    title: '3 Ways to Let AI Answer Your Instagram DMs', desc: 'The three ways to set up Claude to answer Instagram DMs, what you need for each, and Instagram’s rules for automation.', keywords: 'ai dm automation, instagram dm automation, claude ai, instagram tips' },
  { layout: 'E', video: S('v5075207-coffee-photo'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/chat-manager/', board: B.dm, serif: 'Auto-reply to comments', small: 'without ManyChat',
    title: 'Auto-Reply to Instagram Comments Without ManyChat', desc: 'Someone comments your keyword and gets your link by DM automatically. Your own comment-to-DM tool for Instagram and YouTube, about $6 a month to run.', keywords: KW_DM },
  { layout: 'G', photo: S('4050366-floor-laptop'), ground: 'blush', link: '/chat-manager/', board: B.dm, badge: 'About $6 a month', lines: [{ t: 'send your', script: true }, { t: 'link by' }, { t: 'DM' }, { t: 'automatically', script: true }],
    title: 'Send Your Link by DM Automatically', desc: 'Pick a keyword; when someone comments it, they get your link by DM. Your own comment-to-DM tool for Instagram and YouTube.', keywords: KW_DM },
  // Quizzes.
  { layout: 'J', photo: S('7234525-jewelry-hands'), ground: 'oat', serif_t: 'Find your first offer', cap: 'free 3-step quiz', hl: 'caveatbrush', link: '/quiz/', board: B.marketing, doodles: ['sparkle'],
    title: 'Digital Product Ideas: Find Your First Offer', desc: 'Not sure what to sell? Answer 3 quick steps and get digital product ideas based on what you can already do. Free quiz.', keywords: 'digital product ideas, what to sell online, first digital product, small business ideas' },
  { layout: 'J', photo: S('8489952-pink-phone-flatlay'), ground: 'deeprose', serif_t: 'What should you sell online?', cap: 'take the free quiz', hl: 'marker', link: '/quiz/', board: B.marketing,
    title: 'Not Sure What to Sell Online? Free Quiz', desc: 'Find your first offer in 3 quick steps. A free quiz with digital product ideas based on what you already know how to do.', keywords: 'what to sell online, digital product ideas, online business ideas, first offer' },
  { layout: 'F', photo: S('5208294-pink-planner'), textBottom: true, hl: 'sacramento', link: '/quiz/', board: B.marketing, serif: 'What digital product should you make?', sel: 'free 3-step quiz',
    title: 'What Digital Product Should You Make? Free Quiz', desc: 'A free 3-step quiz that turns what you can do into digital product ideas for your first offer.', keywords: 'digital product ideas, digital products to sell, side business ideas, what to sell online' },
  { layout: 'E', photo: S('13735930-cafe-notebook'), cardTop: 120, tilt: 1.5, pin: 'cream', hl: 'marker', link: '/next-move/', board: B.goals, serif: 'Stuck on your next business move?', small: 'take the free quiz',
    title: 'What Should Your Next Business Move Be? Free Quiz', desc: 'A free quiz that points you to your next step in growing your small business online.', keywords: 'small business next steps, business goals, grow your business, business planning' },
  { layout: 'J', photo: S('12911609-plants-laptop'), ground: 'latte', serif_t: 'Your next business move', cap: 'find it in a free quiz', hl: 'reenie', link: '/next-move/', board: B.goals,
    title: 'Next Steps for Your Small Business: Free Quiz', desc: 'Not sure what to work on next? Take the free next steps business quiz and get pointed to your next move.', keywords: 'small business goal setting, business next steps, small business tips, business quiz' },
  // Holiday + New Year (calculators).
  { layout: 'E', video: S('v6314621-xmas-lights'), cardTop: 640, tilt: 2, prop: 'prop-red-gift-bow', style: { serif: 'dmserif' }, size: 92, hl: 'marker', link: '/calculators/income-goal/', board: B.holiday, serif: 'Set your December income goal', small: 'then see the sales it takes',
    title: 'December Income Goal for Small Business', desc: 'Set your December income goal, then see the sales, website visitors and views it takes to reach it. A free calculator for small business owners.', keywords: 'december income goal, holiday sales goal, small business holiday marketing, income goal calculator' },
  { layout: 'J', photo: S('35446297-xmas-gifts'), ground: 'cream', serif_t: 'Your Black Friday sales goal', cap: 'sales per day, worked out', hl: 'caveatbrush', link: '/calculators/sales-goal/', board: B.holiday,
    title: 'Black Friday Sales Goal for Small Business', desc: 'Break your holiday revenue goal into the sales you need each week and each day. A free sales goal calculator.', keywords: 'black friday small business, holiday sales goal, black friday marketing, sales goal calculator' },
  { layout: 'F', photo: S('6334694-gold-wrapping'), serif: 'Your holiday sales goal', sel: 'per day, worked out free', hl: 'caveatbrush', link: '/calculators/sales-goal/', board: B.holiday,
    title: 'Holiday Sales Goal: How Many Sales Per Day?', desc: 'Break a monthly holiday revenue target into the sales you need each month, each week and each day. Free calculator.', keywords: 'holiday sales goal, christmas sales small business, daily sales goal, sales goal calculator' },
  { layout: 'F', photo: S('15422829-xmas-coffee-laptop'), textBottom: true, hl: 'reenie', link: '/calculators/income-goal/', board: B.goals, serif: 'Your 2027 income goal, in numbers', sel: 'free calculator',
    title: 'Set Your 2027 Income Goal (Free Calculator)', desc: 'Plan next year: set your income goal and see the sales, visitors and views it takes to get there.', keywords: '2027 goals, business goal setting, income goal, new year business planning' },
  { layout: 'G', photo: S('5942700-xmas-desk'), ground: 'mist', link: '/calculators/', board: B.goals, badge: 'All free', lines: [{ t: 'plan', script: true }, { t: '2027' }, { t: 'in numbers' }, { t: 'free calculators', script: true }],
    title: 'Plan Your 2027 Business With Free Calculators', desc: 'Plan next year with free calculators: income goal, sales per day, pricing, profit, break-even, conversion rate and more.', keywords: '2027 business planning, business goals, new year planning, free business calculators' },
  // Pricing + profit.
  { layout: 'J', photo: S('6755799-candle-maker'), ground: 'rose', serif_t: 'Not sure what to charge?', cap: 'compare 3 prices free', hl: 'marker', link: '/calculators/price-to-customers/', board: B.pricing,
    title: 'How to Price Your Handmade Products', desc: 'Compare three price points side by side and see how many customers each one needs to reach your goal. Free pricing calculator.', keywords: 'how to price handmade products, pricing strategy, pricing calculator, small business pricing' },
  { layout: 'J', photo: S('5900162-woman-calculator'), ground: 'espresso', serif_t: 'Should you raise your prices?', cap: 'see what each price needs', hl: 'reenie', link: '/calculators/price-to-customers/', board: B.pricing,
    title: 'Should You Raise Your Prices?', desc: 'Compare three prices and see how many customers each one needs to reach your goal. A free calculator for small businesses.', keywords: 'raise your prices, pricing your services, pricing strategy, what to charge' },
  { layout: 'E', photo: S('5900135-calculator-hands'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/calculators/profit/', board: B.pricing, serif: 'Busy but not profitable?', small: 'check your margin free',
    title: 'Busy But Not Profitable? Check Your Margin', desc: 'Work out your profit and profit margin from your revenue and costs with a free calculator for small business owners.', keywords: 'small business profit, profit margin, business money tips, small business finances' },
  { layout: 'F', photo: S('7680747-receipt'), hl: 'marker', link: '/calculators/profit/', board: B.pricing, serif: 'Know your profit margin', sel: 'in one minute, free',
    title: 'Profit Margin Calculator for Small Business', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. Free calculator.', keywords: 'profit margin calculator, small business profit, business finances, pricing' },
  // Content, Reels, traffic.
  { layout: 'J', photo: S('6347629-ring-light'), ground: 'blush', serif_t: 'How many views does each Reel need?', size: 100, cap: 'to hit your goal', hl: 'caveatbrush', link: '/calculators/views-per-post/', board: B.reels,
    title: 'How Many Views Does Each Reel Need?', desc: 'Put in your income goal, your rates and how often you post. See how many views each Reel needs, on average, to get there.', keywords: 'reel views, instagram reels tips, tiktok views, reel ideas for business' },
  { layout: 'F', photo: S('7676430-tripod-filming'), textBottom: true, serif: 'Views per post to hit your goal', sel: 'free calculator', hl: 'marker', link: '/calculators/views-per-post/', board: B.growth,
    title: 'Instagram Views Per Post Calculator', desc: 'See how many views each post needs, on average, to reach your income goal. Free calculator.', keywords: 'instagram views, instagram growth tips, views per post, content goals' },
  { layout: 'E', photo: S('3874609-tulips-laptop'), cardTop: 860, pin: 'cream', hl: 'reenie', link: '/calculators/traffic-to-sales/', board: B.seo, serif: 'Turn website visitors into sales', small: 'see your numbers free',
    title: 'Website Traffic to Sales Calculator', desc: 'Turn your website traffic and conversion rate into estimated sales and revenue. Free calculator.', keywords: 'website traffic, website sales, traffic to sales, small business website' },
  { layout: 'G', photo: S('7394372-pink-flatlay'), ground: 'latte', link: '/1k-club/', board: B.planning, badge: "Here's how", lines: [{ t: 'never run', script: true }, { t: 'out of' }, { t: 'post ideas' }, { t: 'again', script: true }],
    title: 'Never Run Out of Post Ideas Again', desc: 'Plan, create and post organic content with a complete toolkit, including a week of post ideas planned in one sitting.', keywords: 'post ideas, content ideas for small business, social media content planning, instagram post ideas' },
  { layout: 'F', photo: S('5390693-journal-bed'), textBottom: true, hl: 'caveatbrush', link: '/1k-club/', board: B.growth, serif: 'Grow on Instagram without ads', sel: "here's my system",
    title: 'How to Grow on Instagram Without Paid Ads', desc: 'A complete toolkit to plan, create and post organic content and go after your first $1,000 without depending on paid ads.', keywords: 'instagram growth, grow on instagram, organic marketing, instagram tips for small business' },
  { layout: 'J', photo: S('7622883-writing-bed'), ground: 'mist', serif_t: 'Plan a week of posts in one sitting', size: 100, cap: "here's my system", hl: 'marker', link: '/1k-club/', board: B.planning,
    title: 'Plan a Week of Instagram Posts in One Sitting', desc: 'Plan a full week of Instagram posts in one sitting with a complete toolkit for organic content.', keywords: 'content planning, plan instagram posts, batch content, social media planning' },
  { layout: 'E', video: S('v6347120-box-sticker'), cardTop: 860, pin: 'blue', serif: 'A month of product Reels', small: 'just add your clips', hl: 'caveatbrush', link: '/product-reels/', board: B.reels,
    title: 'Reel Ideas for Product Businesses', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post, and change the words, fonts and colours.', keywords: 'reel ideas for business, product reels, instagram reel ideas, tiktok ideas' },
  { layout: 'E', photo: S('7679739-packing-tape'), cardTop: 120, tilt: -1.5, pin: 'white', hl: 'marker', link: '/product-reels/', board: B.capcut, serif: 'CapCut templates for product Reels', small: '25 ready to edit',
    title: 'CapCut Templates for Product Reels', desc: '25 ready-made CapCut Reel templates for your product. Add your clips and post. Change it all in CapCut.', keywords: 'capcut templates, reel templates, product reels, capcut reel templates' },
  { layout: 'F', photo: S('16186795-pen-hand'), hl: 'reenie', link: '/seo-site-audit/', board: B.seo, serif: 'Why isn’t my website on Google?', sel: 'find out what to fix',
    title: 'Why Isn’t My Website Showing Up on Google?', desc: 'An expert SEO audit of your website, competitors, technical performance, content and search opportunities, in priority order.', keywords: 'website not on google, seo audit, small business seo, google ranking' },
  { layout: 'J', photo: S('4050340-floor-laptop-2'), ground: 'cream', serif_t: 'Fix your website SEO first', cap: 'a prioritized audit', hl: 'caveatbrush', link: '/seo-site-audit/', board: B.seo,
    title: 'Small Business SEO: What to Fix First', desc: 'A prioritized SEO audit of your technical performance, content, competitors and search opportunities, so you know what to fix first.', keywords: 'seo audit, website seo checklist, small business seo, seo tips' },
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
