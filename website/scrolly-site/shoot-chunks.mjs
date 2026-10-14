// Visual QA: node shoot-chunks.mjs <url> <width> <outPrefix> [chunkHeight]  -> full page captured in chunk PNGs (headless Edge/Chrome via puppeteer-core); prints page height, horizontal overflow and console errors.
import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
const [,, url, w = '1280', pre = 'shot', ch = '1500'] = process.argv;
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(x=>existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: +w, height: 900, deviceScaleFactor: 1, isMobile: +w < 600, hasTouch: +w < 600 });
const errs=[]; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type()==='error' && errs.push(m.text().slice(0,150)));
await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
await p.evaluate(async()=>{document.querySelector('.cmplz-cookiebanner')?.remove();for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}scrollTo(0,0)});
await new Promise(r => setTimeout(r, 800));
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
let i = 0;
for (let y = 0; y < H; y += +ch) { await p.screenshot({ path: `${pre}-${String(++i).padStart(2,'0')}.png`, clip: { x: 0, y, width: +w, height: Math.min(+ch, H - y) }, captureBeyondViewport: true }); }
console.log(JSON.stringify({ height: H, chunks: i, overflow: over, errors: errs.slice(0,5) }));
await b.close();
