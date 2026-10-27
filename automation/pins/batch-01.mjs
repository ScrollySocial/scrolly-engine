// Batch 1 (2026-10-27): two Pins for each live site page, for Mercedes to approve before anything is uploaded.
// Copy comes from each page's own text (og-data.mjs / calculators-data.mjs / the live page). No income promises.
// Schedule: about 3 a day; each page's two Pins land 5 days apart (the plan's rule is at least 3).
// Usage: node batch-01.mjs   Output: pins/out/batch-01/<id>.png, review.html, batch.json
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, esc } from '../carousels/lib/common.mjs';
import { HERE, SITE, PAL, captureShots, renderPins, styleFor } from './lib/templates.mjs';

const OUT = path.join(HERE, 'out/batch-01');

// Exact live board names, read from her public profile 2026-10-27 (the CSV must match them exactly).
const B = {
  goals: 'Small Business Goal Setting',
  pricing: 'Pricing your Products and Services',
  seo: 'Website SEO for Small Business',
  marketing: 'Business Marketing Ideas',
  planning: 'Social Media Content Planning',
  growth: 'Instagram Growth Tips for Small Businesses',
  dm: 'Instagram DM Automation',
  capcut: 'CapCut Reel Templates',
};

// One entry per page: [first Pin, second Pin]. title/desc/keywords are the Pinterest text; the rest is the image.
const PAGES = [
  { link: '/calculators/income-goal/', board: B.goals, pins: [
    { layout: 'A', ...PAL.blush, big: ['How many', 'sales'], serif: 'do you need to hit your income goal?', chip: 'Free calculator',
      title: 'Income Goal Calculator: How Many Sales Do You Need?', desc: 'Set your income goal and offer price, then see how many sales, website visitors and views it takes to get there. A free calculator for small business owners.', keywords: 'income goal calculator, small business goals, sales goal, business planning' },
    { layout: 'C', ...PAL.latte, num: '3', head: 'numbers behind', serif: 'your income goal', items: ['Sales', 'Website visitors', 'Views'],
      title: 'The 3 Numbers Behind Your Income Goal', desc: 'Your income goal turns into three numbers: how many sales you need, how many website visitors that takes, and how many views bring those visitors. Work all three out with this free calculator.', keywords: 'income goal, small business goal setting, website traffic, content views' },
  ] },
  { link: '/calculators/price-to-customers/', board: B.pricing, pins: [
    { layout: 'A', ...PAL.blush, big: ['Price', 'check'], serif: 'How many customers does each price need?', chip: 'Free calculator',
      title: 'Price Check: How Many Customers Does Each Price Need?', desc: 'Compare three price points side by side and see how many customers each one needs to reach your goal. A free pricing calculator for small businesses.', keywords: 'pricing calculator, how to price products, pricing strategy, small business pricing' },
    { layout: 'D', ...PAL.navy, serif: 'Compare three prices side by side', sub: 'See how many customers each one needs to reach your goal.', btn_t: 'Free calculator',
      title: 'Compare Three Prices Side by Side', desc: 'Not sure what to charge? Put in three prices and see how many customers each one needs to reach your goal. Free calculator, no math needed.', keywords: 'what to charge, pricing your products, pricing calculator, small business' },
  ] },
  { link: '/calculators/sales-goal/', board: B.goals, pins: [
    { layout: 'A', ...PAL.blush, big: ['Sales', 'goal'], serif: 'per month, per week and per day', chip: 'Free calculator',
      title: 'Sales Goal Calculator: Per Month, Week and Day', desc: 'Break a monthly revenue target into the sales you need each month, each week and each day. A free sales goal calculator for small business owners.', keywords: 'sales goal calculator, monthly sales goal, small business goals, revenue target' },
    { layout: 'C', ...PAL.latte, num: '3', head: 'ways to see', serif: 'your sales goal', items: ['Per month', 'Per week', 'Per day'],
      title: '3 Ways to See Your Sales Goal', desc: 'A monthly revenue target feels big. Split it into sales per month, per week and per day and it becomes something you can track. Free calculator.', keywords: 'sales goal, goal setting for business, revenue goal, small business planning' },
  ] },
  { link: '/calculators/traffic-to-sales/', board: B.seo, pins: [
    { layout: 'A', ...PAL.blush, big: ['Traffic', 'to sales'], serif: 'What is your website traffic worth?', chip: 'Free calculator',
      title: 'Traffic to Sales: What Is Your Website Traffic Worth?', desc: 'Turn your website traffic and conversion rate into estimated sales and revenue. A free calculator for small business websites and online shops.', keywords: 'website traffic, traffic to sales, online shop sales, small business website' },
    { layout: 'D', ...PAL.navy, serif: 'Turn website visitors into a sales estimate', sub: 'Enter your traffic and conversion rate. See estimated sales and revenue.', btn_t: 'Free calculator',
      title: 'Turn Website Visitors Into a Sales Estimate', desc: 'Enter your monthly website visitors and your conversion rate to see estimated sales and revenue. A free calculator for small business owners.', keywords: 'website visitors, sales estimate, conversion rate, website traffic tips' },
  ] },
  { link: '/calculators/conversion-rate/', board: B.seo, pins: [
    { layout: 'A', ...PAL.blush, big: ['Conversion', 'rate'], serif: 'What share of your visitors buy?', chip: 'Free calculator',
      title: 'Conversion Rate Calculator for Small Business Websites', desc: 'Find out what share of your website visitors actually buy. A free conversion rate calculator for small business websites and online shops.', keywords: 'conversion rate calculator, website conversion rate, online shop, small business website' },
    { layout: 'D', ...PAL.navy, serif: 'How many of your visitors actually buy?', sub: 'Work out your website conversion rate.', btn_t: 'Free calculator',
      title: 'How Many of Your Website Visitors Actually Buy?', desc: 'Your conversion rate is the share of website visitors who buy. Work out yours with this free calculator for small business owners.', keywords: 'conversion rate, website sales, ecommerce tips, small business' },
  ] },
  { link: '/calculators/content-output/', board: B.planning, pins: [
    { layout: 'A', ...PAL.blush, big: ['Content', 'habit'], serif: 'See how a small daily habit adds up', chip: 'Free calculator',
      title: 'Content Output Calculator: See How a Small Habit Adds Up', desc: 'See how a small daily content habit adds up when you share each piece on more than one platform. A free calculator for planning your social media.', keywords: 'content planning, social media planning, content calendar, posting schedule' },
    { layout: 'D', ...PAL.navy, serif: 'One small habit, shared on every platform', sub: 'See how your content adds up.', btn_t: 'Free calculator',
      title: 'One Small Content Habit, Shared on Every Platform', desc: 'Post a little each day and share it on more than one platform. This free calculator shows how much content that adds up to.', keywords: 'social media content, repurpose content, content plan, small business social media' },
  ] },
  { link: '/calculators/profit/', board: B.pricing, pins: [
    { layout: 'A', ...PAL.blush, big: ['Your', 'profit'], serif: 'gross, net and margin', chip: 'Free calculator',
      title: 'Profit Calculator: Gross Profit, Net Profit and Margin', desc: 'Work out your gross profit, net profit and profit margin from your revenue and costs. A free profit calculator for small business owners.', keywords: 'profit calculator, profit margin, small business finances, pricing' },
    { layout: 'C', ...PAL.latte, num: '3', head: 'profit numbers', serif: 'to know for your business', items: ['Gross profit', 'Net profit', 'Profit margin'],
      title: '3 Profit Numbers to Know for Your Business', desc: 'Gross profit, net profit and profit margin: work out all three from your revenue and costs with this free calculator.', keywords: 'profit margin, gross profit, net profit, small business money' },
  ] },
  { link: '/calculators/break-even/', board: B.pricing, pins: [
    { layout: 'A', ...PAL.blush, big: ['Break', 'even'], serif: 'How many sales until it pays for itself?', chip: 'Free calculator',
      title: 'Break-Even Calculator: How Many Sales Until It Pays for Itself?', desc: 'Find out how many sales it takes for a course, tool or ad budget to pay for itself. A free break-even calculator for small businesses.', keywords: 'break even calculator, break even point, small business costs, pricing' },
    { layout: 'D', ...PAL.navy, serif: 'Will that course or tool pay for itself?', sub: 'Find out how many sales it takes to break even.', btn_t: 'Free calculator',
      title: 'Will That Course or Tool Pay for Itself?', desc: 'Before you buy a course, tool or ad budget, see how many sales it takes to break even. Free calculator for small business owners.', keywords: 'break even point, business investment, small business tools, profit' },
  ] },
  { link: '/calculators/average-order-value/', board: B.marketing, pins: [
    { layout: 'A', ...PAL.blush, big: ['Order', 'value'], serif: 'What does the average customer spend?', chip: 'Free calculator',
      title: 'Average Order Value Calculator', desc: 'See how much the average customer spends per order, and what a small increase is worth. A free calculator for online shops and small businesses.', keywords: 'average order value, aov calculator, increase sales, online shop tips' },
    { layout: 'D', ...PAL.navy, serif: 'What is a small increase in order value worth?', sub: 'See how much the average customer spends per order.', btn_t: 'Free calculator',
      title: 'What Is a Small Increase in Order Value Worth?', desc: 'See how much your average customer spends per order, then see what a small increase would be worth. Free calculator for small business owners.', keywords: 'order value, upsell ideas, business marketing ideas, ecommerce' },
  ] },
  { link: '/calculators/views-per-post/', board: B.growth, pins: [
    { layout: 'A', ...PAL.blush, big: ['How many', 'views'], serif: 'does each post need to reach your goal?', chip: 'Free calculator',
      title: 'Views Per Post Calculator: How Many Views Does Each Post Need?', desc: 'Put in your income goal, your rates and how often you post. See how many views each post needs, on average, to get there. A free calculator.', keywords: 'instagram views, views per post, instagram growth, content goals' },
    { layout: 'C', ...PAL.latte, num: '3', head: 'numbers to know', serif: 'about your posting', items: ['Views needed a month', 'Posts a month', 'Average views per post'],
      title: '3 Numbers to Know About Your Posting', desc: 'How many views you need a month, how many posts you make, and how many views each post needs on average. Work them out with this free calculator.', keywords: 'instagram growth tips, posting schedule, views goal, small business instagram' },
  ] },
  { link: '/calculators/', board: B.goals, pins: [
    { layout: 'A', ...PAL.blush, big: ['10 free', 'calculators'], serif: 'for small business owners', chip: 'Free tools',
      title: '10 Free Calculators for Small Business Owners', desc: 'Free business calculators: income goal, sales goal, pricing, profit, break-even, conversion rate, average order value, traffic, content output and views per post.', keywords: 'business calculators, small business tools, free business tools, goal setting' },
    { layout: 'C', ...PAL.latte, num: '3', head: 'kinds of free', serif: 'business calculators', items: ['Goals and sales', 'Pricing and profit', 'Traffic and views'],
      title: 'Free Calculators for Goals, Pricing and Traffic', desc: 'Work out your goals and sales, your pricing and profit, and your traffic and views with ten free calculators for small business owners.', keywords: 'free calculators, small business planning, pricing, website traffic' },
  ] },
  { link: '/chat-manager/', board: B.dm, pins: [
    { layout: 'D', ...PAL.navy, serif: 'Reply to every comment with a DM', sub: 'Someone comments your keyword. They get your link in their inbox automatically.', btn_t: 'See how it works',
      title: 'Reply to Every Comment With a DM', desc: 'Someone comments your keyword and gets your link in their DMs automatically. Chat Manager is your own comment-to-DM software for Instagram and YouTube.', keywords: 'instagram dm automation, comment to dm, instagram automation, manychat alternative' },
    { layout: 'A', ...PAL.blush, big: ['Comment', 'to DM'], serif: 'your own software for Instagram and YouTube', chip: 'About $6 a month to run',
      title: 'Comment to DM Software for Instagram and YouTube', desc: 'Turn comments into email signups with your own comment-to-DM software. About $6 a month to run, whatever your list size.', keywords: 'comment to dm, instagram dm automation, email list building, instagram tools' },
  ] },
  { link: '/1k-club/', board: B.growth, pins: [
    { layout: 'D', ...PAL.navy, serif: 'Go after your first $1,000 with organic content', sub: 'A complete toolkit to plan, create and post.', btn_t: 'See the $1K Club',
      title: 'Go After Your First $1,000 With Organic Content', desc: 'The $1K Club is a complete toolkit to plan, create and go after your first $1,000 with organic content, without depending on paid ads.', keywords: 'instagram growth, organic marketing, small business instagram, content plan' },
    { layout: 'A', ...PAL.blush, big: ['The $1K', 'Club'], serif: 'a toolkit for organic content', chip: 'See what is inside',
      title: 'The $1K Club: A Toolkit for Organic Content', desc: 'Plan, create and post organic content with a complete toolkit, and go after your first $1,000 without depending on paid ads.', keywords: 'organic content, instagram tips for small business, content toolkit, social media growth' },
  ] },
  { link: '/seo-site-audit/', board: B.seo, pins: [
    { layout: 'A', ...PAL.blush, big: ['SEO', 'site audit'], serif: 'for your small business website', chip: 'Expert report',
      title: 'SEO Site Audit for Small Business Websites', desc: 'A prioritized expert audit of your website, competitors, technical performance, content and search opportunities, so you know what to fix first.', keywords: 'seo audit, website seo, small business seo, seo checklist' },
    { layout: 'D', ...PAL.navy, serif: 'Know what to fix on your website', sub: 'A prioritized audit of your site, competitors, content and search opportunities.', btn_t: 'See the audit',
      title: 'Know What to Fix on Your Website', desc: 'An expert SEO audit of your website, competitors, technical performance, content and search opportunities, in priority order.', keywords: 'website audit, seo tips, google ranking, small business website' },
  ] },
  { link: '/product-reels/', board: B.capcut, pins: [
    { layout: 'A', ...PAL.blush, big: ['25', 'Reels'], serif: 'ready-made for your product', chip: 'CapCut templates',
      title: '25 Ready-Made Reel Templates for Your Product', desc: '25 ready-made Reels for your product. Add your clips and post, and change everything in CapCut. CapCut Reel templates for product businesses.', keywords: 'capcut templates, reel templates, product reels, instagram reels for business' },
    { layout: 'D', ...PAL.navy, serif: 'Your month of Reels: done', sub: '25 ready-made Reels for your product. Add your clips and post.', btn_t: 'See the pack',
      title: 'Your Month of Reels: Done', desc: '25 ready-made CapCut Reels for your product. Add your clips and post. Change the words, fonts and colours in CapCut.', keywords: 'capcut reel templates, instagram reels ideas, product marketing, reels for small business' },
  ] },
];

// Schedule: one Pin for every page, then the other Pin in the same order, 3 a day at 10am, 2pm and 7pm US Eastern.
const START = '2026-10-28', SLOTS = ['14:00:00', '18:00:00', '23:00:00']; // UTC
// Alternate which Pin goes first so the same layout doesn't run for days in a row.
const order = [...PAGES.map((p, i) => [i, i % 2]), ...PAGES.map((p, i) => [i, 1 - (i % 2)])];
const day = (n) => { const d = new Date(START + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// Each Pin gets its own style (ground, pattern, fonts, doodles, phone position), rotated per layout.
const seenLayout = { A: 0, C: 0, D: 0 };
const pins = order.map(([pi, k], n) => {
  const page = PAGES[pi], p = page.pins[k];
  const style = styleFor(p.layout, seenLayout[p.layout]++);
  const slug = page.link.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return { ...p, id: `pin-${String(n + 1).padStart(2, '0')}-${slug}-${p.layout.toLowerCase()}`, link: page.link, url: SITE + page.link + '?utm_source=pinterest', board: page.board, date: `${day(Math.floor(n / 3))}T${SLOTS[n % 3]}`, pinTitle: p.title, pinDesc: p.desc, style };
});

// Rule checks before anything is shown.
const errs = [];
const seen = new Set();
for (const p of pins) {
  if (p.pinTitle.length > 100) errs.push(`${p.id}: title ${p.pinTitle.length} chars (max 100)`);
  if (p.pinDesc.length > 500) errs.push(`${p.id}: description ${p.pinDesc.length} chars (max 500)`);
  if (seen.has(p.pinTitle)) errs.push(`${p.id}: duplicate title`); seen.add(p.pinTitle);
  if (/[—|]/.test(p.pinTitle + p.pinDesc)) errs.push(`${p.id}: em dash or | in text`);
  if (!Object.values(B).includes(p.board)) errs.push(`${p.id}: board not on the allowed list`);
}
for (const page of PAGES) {
  const ds = pins.filter((p) => p.link === page.link).map((p) => new Date(p.date));
  if (ds.length === 2 && Math.abs(ds[1] - ds[0]) < 3 * 864e5) errs.push(`${page.link}: Pins less than 3 days apart`);
}
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

const browser = await launch();
// Every layout except C shows the linked page on a phone.
await captureShots(browser, pins.filter((p) => p.layout !== 'C').map((p) => p.link));
for (const w of await renderPins(browser, pins, OUT)) console.log('WARN   ' + w);
await browser.close();

writeFileSync(path.join(OUT, 'batch.json'), JSON.stringify(pins.map(({ id, board, url, date, pinTitle, pinDesc, keywords }) => ({ id, board, url, date, title: pinTitle, description: pinDesc, keywords, status: 'Draft' })), null, 2) + '\n');
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pin batch 1 review</title>
<style>body{font:16px/1.45 Arial,sans-serif;background:#f4f4f4;margin:0;padding:24px;color:#111}h1{font-size:24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.c{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}.c img{width:100%;display:block}.c div{padding:12px 14px}.c b{display:block;font-size:16px}.c p{margin:6px 0;color:#444;font-size:15px}.c small{display:block;color:#666;font-size:15px}</style>
<h1>Pin batch 1: ${pins.length} Pins, ${START} to ${pins.at(-1).date.slice(0, 10)}</h1><p>Each card: the image, the Pinterest title and description, the board, where it links and when it posts (US Eastern).</p><div class="g">
${pins.map((p) => `<div class="c"><img src="${p.id}.png" alt=""><div><b>${esc(p.pinTitle)}</b><p>${esc(p.pinDesc)}</p><small>Board: ${esc(p.board)}</small><small>Links to: ${esc(p.link)}</small><small>Posts: ${new Date(p.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}</small></div></div>`).join('\n')}
</div>`);
console.log(`done   ${pins.length} Pins -> ${OUT}`);
