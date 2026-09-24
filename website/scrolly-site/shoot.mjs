// Local QA: node shoot.mjs <page> <width> <out.png> [pauseSlides]  (uses local Edge/Chrome via puppeteer-core)
import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
const [,, name='home', w='1440', out='shot.png'] = process.argv;
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(x=>existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: +w, height: 900, deviceScaleFactor: 1, isMobile: +w < 600, hasTouch: +w < 600 });
const errs=[]; p.on('console', m => m.type()==='error' && errs.push(m.text())); p.on('requestfailed', r => errs.push('FAILED '+r.url())); p.on('response', r => r.status()>=400 && errs.push(r.status()+' '+r.url())); p.on('pageerror', e => errs.push(String(e)));
await p.goto(`http://localhost:8934/scrolly-site/dist/preview-${name}.html`, { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.querySelector('.sx-hero__pause')?.click());
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0);await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))});
await new Promise(r => setTimeout(r, 700));
await p.screenshot({ path: out, fullPage: true });
console.log('errors:', errs);
await b.close();
