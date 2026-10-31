// Screen crops for the v3 $1K hero (2026-10-31): the live $1K Math calculator, shot at 2x.
// Usage: node capture.mjs
import puppeteer from '../../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await p.goto('https://theambitiondepartment.com/calculators/income-goal/', { waitUntil: 'networkidle2', timeout: 90000 });
await p.evaluate(() => document.fonts.ready);
// Hide the consent box and floating buttons, then crop the blue "Your numbers" panel (title bar to the fine print).
await p.addStyleTag({ content: '.cmplz-cookiebanner,[class*=accessib],[id*=accessib],.cmplz-manage-consent{display:none!important}' });
await p.screenshot({ path: 'calc-panel.png', clip: { x: 65, y: 204, width: 1310, height: 566 } });
await b.close();
