// Test set 2 (2026-10-28): as much variety as possible on her Pexels picks, photos AND video backgrounds.
// Her feedback applied: no small label above the headline; benefit to the viewer, never the product name; the
// highlighted line in a fun font (4 fonts rotated so she can pick); her Levee Road label-bar style added (layout G).
// Headlines must land in a passing glance: few words, one idea (Mercedes 2026-10-28).
// Copy only claims what the linked page says. Text never speaks for the person in the photo.
// Usage: node test-02.mjs   Output: pins/out/test-02/ (PNGs, MP4s for video Pins, sheet.png, fonts.png)
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl } from '../carousels/lib/common.mjs';
import { HERE, H_WINDOW, ensureStock, renderPins } from './lib/templates.mjs';
import { ensureClips, composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/test-02');
const px = (id, slug, picked = 'Mercedes') => ({ id: `pexels-${id}-${slug}`, src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`, page: `https://www.pexels.com/photo/${id}/`, picked });
const PHOTOS = [
  px(25409388, 'designer-spring'), px(12497427, 'laptop-bed'), px(3747068, 'macbook-white'), px(5473151, 'woman-laptop'),
  px(7242766, 'stairs-outdoor'), px(17459745, 'stairs-laptop'), px(8368044, 'beige-suit'), px(10041228, 'coat-portrait'),
  px(8489320, 'bed-dog'), px(6912817, 'table-laptop'), px(26546539, 'room-laptop'), px(17792231, 'bed-phone'), px(8498522, 'computer-dog'),
];
const vid = (id, slug, file) => ({ id: `pexels-v${id}-${slug}`, src: `https://videos.pexels.com/video-files/${id}/${file}`, page: `https://www.pexels.com/video/${id}/`, picked: 'Mercedes' });
const CLIPS = [
  vid(7681933, 'stylish-laptop', '7681933-hd_1080_1920_25fps.mp4'), vid(7681923, 'woman-laptop', '7681923-hd_1080_1920_25fps.mp4'),
  vid(7393135, 'typing', '7393135-hd_1920_1080_25fps.mp4'), vid(19553430, 'tree-ornament', '19553430-hd_1080_1920_30fps.mp4'),
  vid(3201314, 'tree-snow', '3201314-hd_1080_1920_25fps.mp4'),
];
const P = (s) => `pexels-${s}`;

const PINS = [
  // Chat Manager: about $6 a month to run (page fact). "My ManyChat bill" is NOT used until she confirms she paid ManyChat.
  { id: 'v1-manychat-f', layout: 'F', video: P('v7681933-stylish-laptop'), hl: 'marker', link: '/chat-manager/', serif: 'Tired of paying for ManyChat?', sel: 'There is a $6-a-month way' },
  { id: 'p1-manychat-e', layout: 'E', photo: P('11179596-face-mask'), cardTop: 830, pin: 'cream', hl: 'reenie', link: '/chat-manager/', serif: 'How to auto-reply to comments', small: 'without ManyChat' },
  { id: 'p2-manychat-g', layout: 'G', photo: P('17792231-bed-phone'), ground: 'blush', link: '/chat-manager/', badge: 'About $6 a month', lines: [{ t: 'stop', script: true }, { t: 'paying for' }, { t: 'ManyChat' }, { t: 'every month', script: true }] },
  // Calculators.
  { id: 'v2-sales-e', layout: 'E', video: P('v7681923-woman-laptop'), cardTop: 860, pin: 'blue', hl: 'caveatbrush', link: '/calculators/income-goal/', serif: 'How many sales do you actually need?', small: 'work it out free' },
  { id: 'v4-december-f', layout: 'F', video: P('v19553430-tree-ornament'), hl: 'sacramento', link: '/calculators/sales-goal/', serif: 'How many sales do you need this December?', sel: 'work it out free' },
  { id: 'v5-december-e', layout: 'E', video: P('v3201314-tree-snow'), cardTop: 720, tilt: 2, pin: 'white', style: { serif: 'dmserif' }, size: 92, hl: 'marker', link: '/calculators/income-goal/', serif: 'Set your December income goal', small: 'then see the sales it takes' },
  { id: 'p3-price-e', layout: 'E', photo: P('25409388-designer-spring'), cardTop: 840, pin: 'blue', hl: 'caveatbrush', link: '/calculators/price-to-customers/', serif: 'Not sure what to charge?', small: 'compare 3 prices free' },
  { id: 'p4-price-g', layout: 'G', photo: P('6912817-table-laptop'), ground: 'oat', link: '/calculators/price-to-customers/', badge: 'Free calculator', lines: [{ t: 'find your', script: true }, { t: 'right' }, { t: 'price' }, { t: 'in 3 numbers', script: true }] },
  { id: 'p5-profit-f', layout: 'F', photo: P('5473151-woman-laptop'), hl: 'reenie', link: '/calculators/profit/', serif: 'Are you actually making a profit?', sel: 'check it free' },
  { id: 'p6-views-e', layout: 'E', photo: P('7242766-stairs-outdoor'), cardTop: 120, tilt: 1.5, pin: 'cream', hl: 'sacramento', link: '/calculators/views-per-post/', serif: 'How many views does each post need?', small: 'to hit your income goal' },
  { id: 'p7-traffic-f', layout: 'F', photo: P('17459745-stairs-laptop'), textBottom: true, hl: 'marker', link: '/calculators/traffic-to-sales/', serif: 'What is your website traffic worth?', sel: 'turn visitors into sales' },
  { id: 'p8-breakeven-f', layout: 'F', photo: P('26546539-room-laptop'), hl: 'caveatbrush', link: '/calculators/break-even/', serif: 'Will that course pay for itself?', sel: 'do the math first' },
  { id: 'p9-hub-g', layout: 'G', photo: P('3747068-macbook-white'), ground: 'mist', link: '/calculators/', badge: 'All free', lines: [{ t: 'the', script: true }, { t: '10 numbers' }, { t: 'that run' }, { t: 'your business', script: true }] },
  // $1K Club: the benefit, not the name. "My system" = her own product.
  { id: 'p10-week-f', layout: 'F', photo: P('12497427-laptop-bed'), textBottom: true, hl: 'sacramento', link: '/1k-club/', serif: 'Copy my system for a week of posts', sel: 'plan it in one sitting' },
  { id: 'p11-week-g', layout: 'G', photo: P('8498522-computer-dog'), ground: 'latte', link: '/1k-club/', badge: "Here's how", lines: [{ t: 'plan a', script: true }, { t: 'week of' }, { t: 'posts' }, { t: 'in one sitting', script: true }] },
  { id: 'p12-week-e', layout: 'E', photo: P('10041228-coat-portrait'), cardTop: 860, pin: 'white', hl: 'marker', link: '/1k-club/', serif: 'What to post this week, all planned', small: "here's my exact system" },
  // SEO Site Audit.
  { id: 'v3-google-f', layout: 'F', video: P('v7393135-typing'), focusX: .5, hl: 'caveatbrush', link: '/seo-site-audit/', serif: 'Not showing up on Google?', sel: 'find out what to fix first' },
  { id: 'p13-google-e', layout: 'E', photo: P('8368044-beige-suit'), cardTop: 860, pin: 'blue', hl: 'reenie', link: '/seo-site-audit/', serif: 'Why your website is hard to find', small: 'and what to fix first' },
  // Layout H: video (or photo) in one panel, handwritten notes pointing into it (her Digital Priestess ad reference).
  { id: 'v6-week-h', layout: 'H', video: P('v7681923-woman-laptop'), window: H_WINDOW, hl: 'caveatbrush', link: '/1k-club/',
    headHtml: 'Plan a week of posts in <em>one sitting</em>', notes: ['grab a coffee', 'pick 3 topics', 'batch the captions'] },
  { id: 'v7-dm-h', layout: 'H', video: P('v7681933-stylish-laptop'), window: H_WINDOW, ground: 'blush', hl: 'reenie', link: '/chat-manager/',
    headHtml: 'Auto-reply to comments <em>without ManyChat</em>', notes: ['someone comments a keyword', 'they get your link by DM', 'you keep working'] },
  { id: 'p15-price-h', layout: 'H', photo: P('25409388-designer-spring'), ground: 'oat', hl: 'marker', link: '/calculators/price-to-customers/',
    headHtml: 'Find the right price <em>in 3 numbers</em>', notes: ['your goal', '3 prices to compare', 'customers each one needs'] },
  // Product Reels pack.
  { id: 'p14-reels-f', layout: 'F', photo: P('8489320-bed-dog'), hl: 'marker', link: '/product-reels/', serif: 'A month of Reels for your product', sel: 'just add your clips' },
];

await ensureStock(PHOTOS);
await ensureClips(CLIPS);
const browser = await launch();
for (const w of await renderPins(browser, PINS, OUT)) console.log('WARN   ' + w);
for (const p of PINS.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }

// Font comparison: the same Pin in each of the four highlight fonts.
const FONT_TEST = ['reenie', 'caveatbrush', 'marker', 'sacramento'].map((hl) => ({ id: 'font-' + hl, layout: 'F', photo: P('5473151-woman-laptop'), hl, serif: 'Are you actually making a profit?', sel: 'check it free (' + hl + ')', link: '/calculators/profit/' }));
await renderPins(browser, FONT_TEST, OUT);
const sheet = async (name, ids, perRow) => {
  const w = perRow * 236 + 24, f = path.join(OUT, '.' + name + '.html');
  writeFileSync(f, `<body style="margin:0;background:#fff;padding:12px;display:grid;grid-template-columns:repeat(${perRow},224px);gap:12px;width:${w}px">${ids.map((id) => `<img src="${fileUrl(path.join(OUT, id + '.png'))}" style="width:224px;border-radius:12px">`).join('')}</body>`);
  const pg = await browser.newPage(); await pg.setViewport({ width: w, height: 400 });
  await pg.goto(fileUrl(f), { waitUntil: 'load' }); await pg.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true }); await pg.close();
};
await sheet('sheet', PINS.map((p) => p.id), 8);
await sheet('fonts', FONT_TEST.map((p) => p.id), 4);
await browser.close();
console.log('done   ' + OUT);
