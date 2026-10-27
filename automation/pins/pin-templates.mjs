// Renders one sample Pin per layout (A, C, D) for checking template changes.
// Usage: node pin-templates.mjs   Output: pins/out/templates/<id>.png + sheet.png
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, fileUrl } from '../carousels/lib/common.mjs';
import { HERE, PAL, captureShots, renderPins } from './lib/templates.mjs';

const OUT = path.join(HERE, 'out/templates');
const SAMPLES = [
  { id: 'A-income-goal', layout: 'A', ...PAL.blush, link: '/calculators/income-goal/', big: ['How many', 'sales'], serif: 'do you need to hit your income goal?', chip: 'Free calculator' },
  { id: 'C-numbers', layout: 'C', ...PAL.latte, link: '/calculators/', num: '3', head: 'numbers to know', serif: 'before you set your prices', items: ['Profit per sale', 'Break-even point', 'Average order value'] },
  { id: 'D-dm', layout: 'D', ...PAL.navy, link: '/chat-manager/', serif: 'Reply to every comment with a DM', sub: 'Someone comments your keyword. They get your link in their inbox automatically.', btn_t: 'See how it works' },
];

const browser = await launch();
await captureShots(browser, SAMPLES.filter((s) => s.layout !== 'C').map((s) => s.link));
for (const p of await renderPins(browser, SAMPLES, OUT)) console.log('WARN   ' + p);
const sheet = path.join(OUT, '.sheet.html');
writeFileSync(sheet, `<body style="margin:0;background:#fff;padding:30px;display:flex;gap:24px;width:${SAMPLES.length * 324 + 36}px">${SAMPLES.map((s) => `<img src="${fileUrl(path.join(OUT, s.id + '.png'))}" style="width:300px;border-radius:16px">`).join('')}</body>`);
const pg = await browser.newPage();
await pg.setViewport({ width: SAMPLES.length * 324 + 36, height: 520, deviceScaleFactor: 1 });
await pg.goto(fileUrl(sheet), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
await browser.close();
console.log('done   ' + OUT);
