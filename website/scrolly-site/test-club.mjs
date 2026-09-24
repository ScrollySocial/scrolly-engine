import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(x=>existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
let fails=0; const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++;};
for (const w of [1440,390]) {
  const p = await b.newPage(); await p.setViewport({width:w,height:900,isMobile:w<600,hasTouch:w<600});
  await p.goto('http://localhost:8934/scrolly-site/dist/preview-1k-club.html',{waitUntil:'networkidle0'});
  console.log('\n== $1K Club page @'+w);
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal scroll');
  const links=await p.$$eval('.sx a',as=>as.map(a=>a.getAttribute('href')));
  for (const l of ['#launch','/1k-challenge/','/digital-products/','/seo-tools/','/contact/','/10k-club/','/24k-club/']) ok(links.includes(l),'link kept: '+l);
  ok(links.some(l=>l&&l.startsWith('mailto:hello@scrollyseo.com?subject=Launch%20updates')),'mailto launch-news link kept');
  ok(await p.$$eval('.sx-faq details',d=>d.length===4),'4 FAQ items');
  await p.click('.sx-faq details:nth-child(4) summary'); ok(await p.$eval('.sx-faq details:nth-child(4)',d=>d.open),'FAQ opens');
  const bar=await p.evaluate(()=>{const t=document.querySelector('.sx-prog__track');const f=document.querySelector('.sx-prog__fill');return [t.getAttribute('aria-valuenow'),getComputedStyle(f).backgroundColor,getComputedStyle(f).width, document.querySelector('.sx-prog').dataset.progress]});
  ok(bar[1]==='rgb(148, 236, 225)','progress bar uses $1K teal, data-progress='+bar[3]+' width='+bar[2]);
  await p.close();
}
await b.close(); console.log(fails?fails+' FAILURES':'ALL PASSED'); process.exit(fails?1:0);
