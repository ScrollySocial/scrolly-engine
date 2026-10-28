// Photo Pin samples (layouts E: pinned note card, F: serif + text-selection highlight) on Pexels stock, for her review.
// Usage: node photo-samples.mjs   Output: pins/out/photo-samples/<id>.png + sheet.png
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl } from '../carousels/lib/common.mjs';
import { HERE, ensureStock, renderPins } from './lib/templates.mjs';

const OUT = path.join(HERE, 'out/photo-samples');
const STOCK = [
  { id: 'pexels-11179596-face-mask', src: 'https://images.pexels.com/photos/11179596/pexels-photo-11179596.jpeg', page: 'https://www.pexels.com/photo/woman-lying-down-in-face-mask-with-cucumbers-11179596/', picked: 'Mercedes' },
  { id: 'pexels-19553430-tree-ornament', src: 'https://images.pexels.com/videos/19553430/bauble-christmas-atmosphere-christmas-lights-christmas-tree-19553430.jpeg', page: 'https://www.pexels.com/video/a-christmas-tree-with-a-red-ornament-on-it-19553430/', picked: 'Mercedes (video poster frame)' },
  { id: 'pexels-3201314-tree-snow', src: 'https://images.pexels.com/videos/3201314/free-video-3201314.jpg', page: 'https://www.pexels.com/video/christmas-tree-with-snow-and-glitters-3201314/', picked: 'Mercedes (video poster frame)' },
  { id: 'pexels-5390124-cozy-laptop', src: 'https://images.pexels.com/photos/5390124/pexels-photo-5390124.jpeg', page: 'https://www.pexels.com/photo/woman-in-brown-sweater-using-her-laptop-5390124/', picked: 'Claude' },
  { id: 'pexels-13550510-desk-candle', src: 'https://images.pexels.com/photos/13550510/pexels-photo-13550510.jpeg', page: 'https://www.pexels.com/photo/coffee-cup-and-laptop-on-wooden-table-13550510/', picked: 'Claude' },
];

// Copy comes from the linked page. Text never speaks for the person in the photo.
const SAMPLES = [
  { id: 'E-dm-face-mask', layout: 'E', photo: 'pexels-11179596-face-mask', focus: 'center 30%', cardTop: 820, pin: 'cream', link: '/chat-manager/',
    tag: 'Chat Manager', serif: 'Comments get your link by DM while you rest', small: 'Your own comment-to-DM tool' },
  { id: 'F-december-sales', layout: 'F', photo: 'pexels-19553430-tree-ornament', link: '/calculators/sales-goal/',
    serif: 'How many sales do you need this December?', sel: 'Free sales goal calculator' },
  { id: 'E-december-income', layout: 'E', photo: 'pexels-3201314-tree-snow', cardTop: 700, tilt: 2, pin: 'white', style: { serif: 'dmserif' }, size: 92, link: '/calculators/income-goal/',
    tag: 'Free calculator', serif: 'Work out your December income goal', small: 'Sales, visitors and views you need' },
  { id: 'F-plan-week', layout: 'F', photo: 'pexels-5390124-cozy-laptop', textBottom: true, shadeTop: false, shade: .55, link: '/1k-club/',
    serif: 'Plan a week of posts in one sitting', sel: 'The $1K Club toolkit' },
  { id: 'E-ten-calculators', layout: 'E', photo: 'pexels-13550510-desk-candle', cardTop: 160, tilt: -1.5, pin: 'blue', domInk: '#fff', link: '/calculators/',
    tag: 'Free tools', serif: '10 free calculators for small business owners', small: 'Pricing, profit, goals and traffic' },
];

await ensureStock(STOCK);
const browser = await launch();
for (const w of await renderPins(browser, SAMPLES, OUT)) console.log('WARN   ' + w);
const sheet = path.join(OUT, '.sheet.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;padding:24px;display:flex;gap:20px;width:${SAMPLES.length * 300 + 28}px">${SAMPLES.map((s) => `<img src="${fileUrl(path.join(OUT, s.id + '.png'))}" style="width:280px;border-radius:16px">`).join('')}</body>`);
const pg = await browser.newPage();
await pg.setViewport({ width: SAMPLES.length * 300 + 28, height: 480 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();
console.log('done   ' + OUT);
