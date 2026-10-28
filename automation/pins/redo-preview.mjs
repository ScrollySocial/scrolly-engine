// Preview of Pins queued for the next batch (2026-10-28): the December income-goal video Pin she deleted because the
// first upload had the old overflowing highlight; now with the fit fix and a real cut-out gift bow on the card.
// Usage: node redo-preview.mjs   Output: pins/out/next-round/
import path from 'node:path';
import { launch } from '../carousels/lib/common.mjs';
import { HERE, renderPins } from './lib/templates.mjs';
import { composeVideoPin } from './lib/video.mjs';

const OUT = path.join(HERE, 'out/next-round');
export const NEXT = [
  { id: 'pin3-v5-december-e-bow', layout: 'E', video: 'pexels-v3201314-tree-snow', cardTop: 720, tilt: 2, prop: 'prop-red-gift-bow', style: { serif: 'dmserif' }, size: 92, hl: 'marker',
    link: '/calculators/income-goal/', serif: 'Set your December income goal', small: 'then see the sales it takes' },
];
const browser = await launch();
for (const w of await renderPins(browser, NEXT, OUT)) console.log('WARN   ' + w);
await browser.close();
for (const p of NEXT.filter((x) => x.video)) { composeVideoPin(p, OUT); console.log('video  ' + p.id); }
