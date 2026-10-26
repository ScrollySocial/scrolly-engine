// The free calculators (9 on 2026-10-03; Views Per Post added 2026-10-15). One entry per page at /calculators/<slug>/, rendered by pages/calculators.mjs from Mercedes's
// "Income Goal Calculator" wireframe. `fn` is real JS that runs twice: in Node for the first paint, and as the inline page script.
// Keep every fn free of '&' (WordPress mangles it in page content) and make it return one [value, sentence] pair per entry in `outs`.
// id: the WordPress page id once created (null = not published yet).

// Formatting helpers, shared by Node and the browser (serialized into the page script as H).
export const HELPERS = `{
div:function(a,b){return b>0?a/b:0},
up:function(n){return isFinite(n)?Math.ceil(n-1e-9):0},
num:function(n){return Math.round(n).toLocaleString('en-US')},
dec:function(n){return (Math.round(n*10)/10).toLocaleString('en-US')},
pct:function(n){return (Math.round(n*10)/10).toLocaleString('en-US')+'%'},
money:function(n){var d=Math.round(n)===n||Math.abs(n)>=1000?0:2;return (n<0?'-':'')+'$'+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
}`;

const $ = (k, label, val, step = 1) => ({ k, label, val, step, pre: '$' });
const P = (k, label, val, step = 0.1, extra = {}) => ({ k, label, val, step, suf: '%', ...extra });

// Weak / Typical / Strong presets for the two rates people can't guess (Mercedes, 2026-10-15). Typical is the default.
// Visitors who buy: Littledata Shopify benchmark (427 stores, Jul-Oct 2026): median 1.4%, top 20% 2.6%+, under 0.5% = bottom 20%.
//   ThoughtMetric Q3 2025 puts organic social traffic at 1.42%, so the median holds for visitors who came from social.
// Viewers who visit your website: no published benchmark exists. Built from Reels profile visits (~3-10% of reach, onimator.com)
//   times bio-link taps (~1-3% of profile visits, 1.8% median, hopp.co), plus Stories/YouTube/Pinterest links lifting it. A judgement call.
const BUY = { presets: [['Weak', 0.5], ['Typical', 1.4], ['Strong', 2.6]], hint: 'Most online stores: 1.4%. The top 20%: 2.6% or more.' };
const VISIT = { presets: [['Weak', 0.1], ['Typical', 0.3], ['Strong', 1]], hint: 'Most viewers never leave the app. Well under 1% is normal.' };
const N = (k, label, val, step = 1) => ({ k, label, val, step });

export const GROUPS = [['make', 'Make money'], ['grow', 'Grow'], ['know', 'Know your numbers']];

export const CALCS = [
  {
    slug: 'income-goal', id: 1151, group: 'make', name: 'Income Goal Calculator',
    short: 'Set an income goal and an offer price. See how many sales, visitors and views it takes.',
    lede: 'Set your income goal and offer price. See how many sales, website visitors and views it takes to get there.',
    fields: [$('goal', 'Monthly revenue goal', 1000, 50), $('aov', 'Average order value', 50), P('view', 'Viewers to website', 0.3, 0.1, VISIT), P('conv', 'Visitors who buy', 1.4, 0.1, BUY)],
    // Results run in the same order as the inputs and the funnel: views, then visitors, then sales (Mercedes, 2026-10-15).
    outs: ['Estimated views needed', 'Website visitors needed', 'Sales needed'],
    fn: `function(v,H){var s=H.up(H.div(v.goal,v.aov)),vi=H.up(H.div(s,v.conv/100)),vw=H.up(H.div(vi,v.view/100));
return [[H.num(vw),'You’ll need about '+H.num(vw)+' views across your content.'],
[H.num(vi),'If '+H.pct(v.view)+' of viewers visit your site, that’s about '+H.num(vi)+' visitors.'],
[H.num(s),'If '+H.pct(v.conv)+' of them buy, that’s '+H.num(s)+(s===1?' sale':' sales')+' at '+H.money(v.aov)+', enough for '+H.money(v.goal)+'.']]}`,
    why: 'Working backwards from a goal turns a vague number into a daily plan: how many sales, how many visitors, how much content.',
    tips: ['Raise your average order value with a bundle or an add-on.', 'Make your offer page clear and specific so more visitors buy.', 'Post consistently on the platforms where your buyers already are.', 'Swap in your real numbers once you have them: website clicks are in your Instagram Insights.'],
    related: ['price-to-customers', 'sales-goal', 'conversion-rate'],
  },
  {
    slug: 'price-to-customers', id: 1152, group: 'make', name: 'Price to Customers Calculator',
    short: 'See how many customers you need at different price points.',
    lede: 'Compare three price points side by side. See how many customers each one needs to reach your goal.',
    fields: [$('goal', 'Revenue goal', 1000, 50), $('p1', 'Lower price', 10), $('p2', 'Middle price', 50), $('p3', 'Higher price', 200)],
    outs: ['At your lower price', 'At your middle price', 'At your higher price'],
    fn: `function(v,H){function c(p){var n=H.up(H.div(v.goal,p));return [H.num(n),'At '+H.money(p)+', you need '+H.num(n)+(n===1?' customer':' customers')+' to reach '+H.money(v.goal)+'.']}
return [c(v.p1),c(v.p2),c(v.p3)]}`,
    why: 'Price decides how many people you need to reach. A higher price means fewer customers, and each one usually needs more trust before buying.',
    tips: ['Try a price you would be proud to defend.', 'Offer a lower-priced entry product and a higher-priced next step.', 'Fewer customers at a higher price can mean less content and less support.'],
    related: ['income-goal', 'sales-goal', 'average-order-value'],
  },
  {
    slug: 'sales-goal', id: 1153, group: 'make', name: 'Sales Goal Calculator',
    short: 'Break a monthly target into weekly and daily sales.',
    lede: 'Break a monthly revenue target into the sales you need each month, week and day.',
    fields: [$('goal', 'Monthly revenue target', 1000, 50), $('aov', 'Average order value', 50)],
    outs: ['Sales per month', 'Sales per week', 'Sales per day'],
    fn: `function(v,H){var s=H.up(H.div(v.goal,v.aov));
return [[H.num(s),'At '+H.money(v.aov)+' each, '+H.money(v.goal)+' a month is '+H.num(s)+' sales.'],
[H.dec(s/(52/12)),'About '+H.dec(s/(52/12))+' sales a week.'],
[H.dec(s/30),'About '+H.dec(s/30)+' sales a day, every day of the month.']]}`,
    why: 'A monthly number feels big. A daily number is something you can check every evening and act on the next morning.',
    tips: ['Track sales daily so a slow week is visible early.', 'Plan your content around the days you usually sell.', 'If the daily number feels too high, look at your average order value first.'],
    related: ['income-goal', 'price-to-customers', 'traffic-to-sales'],
  },
  {
    slug: 'traffic-to-sales', id: 1154, group: 'grow', name: 'Traffic to Sales Calculator',
    short: 'Turn website visitors and a conversion rate into estimated sales.',
    lede: 'Turn your website traffic and conversion rate into estimated sales and revenue.',
    fields: [N('vis', 'Website visitors per month', 1000, 10), P('conv', 'Visitors who buy', 1.4, 0.1, BUY), $('aov', 'Average order value', 50)],
    outs: ['Estimated sales', 'Estimated revenue', 'Revenue per visitor'],
    // Sales are whole (nobody makes 0.7 of a sale); revenue per visitor is the exact rate x order value, so rounding never skews it.
    fn: `function(v,H){var s=Math.round(v.vis*v.conv/100),r=s*v.aov,rv=Math.round(v.conv*v.aov)/100;
return [[H.num(s),H.num(v.vis)+' visitors at '+H.pct(v.conv)+' is about '+H.num(s)+(s===1?' sale':' sales')+' a month.'],
[H.money(r),'At '+H.money(v.aov)+' per order, that’s about '+H.money(r)+' a month.'],
[H.money(rv),'Each visitor is worth about '+H.money(rv)+'. Paying more than that per click loses money.']]}`,
    why: 'Knowing what one visitor is worth tells you how much effort a new traffic source deserves.',
    tips: ['Find which pages your buyers visit before they buy.', 'Small conversion gains add up as traffic grows.', 'Compare revenue per visitor across your traffic sources.'],
    related: ['conversion-rate', 'income-goal', 'content-output'],
  },
  {
    slug: 'conversion-rate', id: 1155, group: 'grow', name: 'Conversion Rate Calculator',
    short: 'Find out what share of your visitors actually buy.',
    lede: 'Find out what share of your website visitors actually buy.',
    fields: [N('vis', 'Website visitors', 1000, 10), N('orders', 'Orders', 25)],
    outs: ['Conversion rate', 'Visitors per sale'],
    fn: `function(v,H){var c=H.div(v.orders,v.vis)*100,p=H.div(v.vis,v.orders);
return [[H.pct(c),H.num(v.orders)+' orders from '+H.num(v.vis)+' visitors is a '+H.pct(c)+' conversion rate.'],
[H.dec(p),'About '+H.dec(p)+' visitors for every sale.']]}`,
    why: 'Your conversion rate shows how well your page and offer turn interest into sales. It is often easier to improve than traffic.',
    tips: ['Use the same time period for visitors and orders.', 'Lead with what the buyer gets, in their words.', 'Remove steps between “I want this” and paying.', 'Test one change at a time so you know what worked.'],
    related: ['traffic-to-sales', 'income-goal', 'average-order-value'],
  },
  {
    slug: 'content-output', id: 1156, group: 'grow', name: 'Content Output Calculator',
    short: 'See how daily content adds up across platforms.',
    lede: 'See how a small daily content habit adds up when you share each piece on more than one platform.',
    fields: [N('per', 'New pieces of content per day', 1), N('plat', 'Platforms you share each piece on', 3), N('days', 'Days', 30)],
    outs: ['Posts in this period', 'Posts per week', 'Posts per year'],
    fn: `function(v,H){var d=v.per*v.plat;
return [[H.num(d*v.days),H.num(v.per)+' a day on '+H.num(v.plat)+' platforms is '+H.num(d*v.days)+' posts in '+H.num(v.days)+' days.'],
[H.num(d*7),H.num(d*7)+' posts every week.'],
[H.num(d*365),H.num(d*365)+' posts in a year.']]}`,
    why: 'Sharing one piece of content in more places multiplies your chances to be found without multiplying the work of creating it.',
    tips: ['Create once, then adapt the format for each platform.', 'Pick a pace you can keep for months, not days.', 'Batch filming or writing on one day a week.'],
    related: ['income-goal', 'traffic-to-sales', 'sales-goal'],
  },
  {
    // 2026-10-15 (Mercedes): Income Goal + Content Output in one, so the views goal becomes a per-post number. A month is 30 days.
    slug: 'views-per-post', id: 1479, group: 'grow', name: 'Views Per Post Calculator',
    short: 'See how many views each post needs to reach your income goal.',
    lede: 'Put in your income goal, your rates and how often you post. See how many views each post needs, on average, to get there.',
    fields: [$('goal', 'Monthly revenue goal', 1000, 50), $('aov', 'Average order value', 50), P('view', 'Viewers to website', 0.3, 0.1, VISIT), P('conv', 'Visitors who buy', 1.4, 0.1, BUY), N('per', 'New posts per day', 1), N('plat', 'Platforms you share each post on', 3)],
    outs: ['Views needed a month', 'Posts a month', 'Average views per post'],
    fn: `function(v,H){var s=H.up(H.div(v.goal,v.aov)),vi=H.up(H.div(s,v.conv/100)),vw=H.up(H.div(vi,v.view/100)),p=Math.round(v.per*v.plat*30),a=H.up(H.div(vw,p));
return [[H.num(vw),H.num(s)+(s===1?' sale':' sales')+' at '+H.money(v.aov)+' takes about '+H.num(vi)+' visitors, which is about '+H.num(vw)+' views.'],
[H.num(p),H.num(v.per)+' a day on '+H.num(v.plat)+(v.plat===1?' platform':' platforms')+' is '+H.num(p)+' posts in 30 days.'],
[H.num(a),'Each post needs about '+H.num(a)+' views, on average, to reach '+H.money(v.goal)+' a month.']]}`,
    why: 'A monthly views goal is hard to picture. A views-per-post number is something you can check against your own analytics after every post.',
    tips: ['Compare the answer with what your posts actually get in your insights.', 'Sharing each post on one more platform lowers the views each one needs.', 'A higher order value means fewer sales, so fewer views per post.', 'A clear link and a reason to click raise the share of viewers who visit.'],
    related: ['income-goal', 'content-output', 'traffic-to-sales'],
  },
  {
    slug: 'profit', id: 1157, group: 'know', name: 'Profit Calculator',
    short: 'Work out revenue, expenses, profit and margin.',
    lede: 'Work out your gross profit, net profit and profit margin from revenue and costs.',
    fields: [$('rev', 'Revenue', 5000, 50), $('cogs', 'Product costs (what each sale costs you)', 1500, 50), $('exp', 'Other expenses (tools, ads, fees)', 1000, 50)],
    outs: ['Gross profit', 'Net profit', 'Profit margin'],
    fn: `function(v,H){var g=v.rev-v.cogs,n=g-v.exp,m=H.div(n,v.rev)*100;
return [[H.money(g),'Revenue minus product costs: '+H.money(g)+'.'],
[H.money(n),'After other expenses, you keep '+H.money(n)+'.'],
[H.pct(m),'You keep '+H.pct(m)+' of every dollar you bring in.']]}`,
    why: 'Revenue is what comes in. Profit is what you keep. Margin shows whether growth will actually pay you more.',
    tips: ['Review your tools and subscriptions every quarter.', 'Raise prices before cutting what makes your product good.', 'Count your payment and platform fees as expenses.'],
    related: ['break-even', 'average-order-value', 'price-to-customers'],
  },
  {
    slug: 'break-even', id: 1158, group: 'know', name: 'Break-Even Calculator',
    short: 'Find out how many sales until an investment pays for itself.',
    lede: 'Find out how many sales it takes for an investment, like a course, tool or ad budget, to pay for itself.',
    fields: [$('inv', 'Investment', 500, 10), $('price', 'Price per sale', 50), $('cost', 'Cost per sale', 20)],
    outs: ['Profit per sale', 'Sales to break even', 'Revenue at break even'],
    fn: `function(v,H){var p=v.price-v.cost;if(!(p>0))return [[H.money(p),'Your price needs to be higher than your cost per sale.'],['0','You can’t break even while each sale loses money.'],['$0','Raise your price or lower your cost per sale.']];
var n=H.up(v.inv/p);
return [[H.money(p),'Each sale leaves '+H.money(p)+' after its costs.'],
[H.num(n),'You break even after '+H.num(n)+(n===1?' sale.':' sales.')],
[H.money(n*v.price),'That’s '+H.money(n*v.price)+' in revenue.']]}`,
    why: 'Before you spend, know how many sales it takes to get the money back. Then you can judge whether the spend is realistic.',
    tips: ['Count only the costs that scale with each sale as cost per sale.', 'Set a date by which you expect to break even.', 'A higher price shortens the road to break even.'],
    related: ['profit', 'sales-goal', 'average-order-value'],
  },
  {
    slug: 'average-order-value', id: 1159, group: 'know', name: 'Average Order Value Calculator',
    short: 'See how much the average customer spends.',
    lede: 'See how much the average customer spends per order, and what a small increase is worth.',
    fields: [$('rev', 'Revenue', 5000, 50), N('orders', 'Number of orders', 100), $('raise', 'Increase per order', 5)],
    outs: ['Average order value', 'Extra revenue from the increase'],
    fn: `function(v,H){var a=H.div(v.rev,v.orders),x=v.orders*v.raise;
return [[H.money(Math.round(a*100)/100),H.money(v.rev)+' from '+H.num(v.orders)+' orders is '+H.money(Math.round(a*100)/100)+' per order.'],
[H.money(x),'Adding '+H.money(v.raise)+' to each order would bring in '+H.money(x)+' more from the same customers.']]}`,
    why: 'Raising what each customer spends grows revenue without needing more customers, more traffic or more content.',
    tips: ['Offer a bundle that saves the buyer a step.', 'Suggest one relevant add-on at checkout.', 'Set a free shipping threshold just above your current average.'],
    related: ['profit', 'price-to-customers', 'income-goal'],
  },
];

// Preset pills for a field with `presets` (styles: .s3-pres in chrome/v3.css). id = the input's id prefix ('cdir-' or 'cl-').
// The hint gets its own id so the input can point at it with aria-describedby.
export const presetHtml = (x, id, val = x.val) => `<div class="s3-pres" role="group" aria-label="Suggested rates for ${x.label.toLowerCase()}">${x.presets.map(([n, v]) => `<button type="button" class="s3-pre" data-for="${id}${x.k}" data-v="${v}" aria-pressed="${v === val}">${n} <b>${v}%</b></button>`).join('')}</div><p class="s3-hint" id="${id}h-${x.k}">${x.hint}</p>`;
// Page-script part: presets(form, run) wires clicks (fill the box, recalculate); presetSync(form) marks the pill matching each box. No '&' (s3shell).
export const PRESET_JS = `function presetSync(f){[].forEach.call(f.querySelectorAll('.s3-pre'),function(b){var x=parseFloat(document.getElementById(b.getAttribute('data-for')).value);b.setAttribute('aria-pressed',x===parseFloat(b.getAttribute('data-v'))?'true':'false')})}
function presets(f,run){f.addEventListener('click',function(e){var b=e.target.closest('.s3-pre');if(!b)return;document.getElementById(b.getAttribute('data-for')).value=b.getAttribute('data-v');run()})}`;

// Runs an entry's fn in Node with the given (or default) values.
const H = new Function('return ' + HELPERS)();
export function compute(c, vals) {
  const v = vals || Object.fromEntries(c.fields.map((f) => [f.k, f.val]));
  return new Function('return ' + c.fn)()(v, H);
}
