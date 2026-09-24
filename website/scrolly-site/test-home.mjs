// QA for the homepage fragment: node test-home.mjs  (needs the website preview server on :8934 and Edge/Chrome)
import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(x=>existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new' });
let fails=0; const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++;};
const state = p => p.evaluate(()=>{const pv=document.querySelector('.sx-preview');const cs=e=>getComputedStyle(e);
  const tee=cs(pv.querySelector('.sx-tee')).fill, bar=cs(pv.querySelector('.sx-prog__fill')).backgroundColor;
  const art=[...pv.querySelectorAll('.sx-tee-art')].filter(a=>cs(a).opacity>0.9).map(a=>a.dataset.art);
  return {club:pv.dataset.club,tee,bar,art,href:pv.querySelector('.sx-preview__club').getAttribute('href'),cta:pv.querySelector('.sx-preview__club').textContent.trim(),sel:[...document.querySelectorAll('.sx-club.is-sel')].map(c=>c.dataset.club)}});
const T={ '1k':'rgb(148, 236, 225)','10k':'rgb(193, 174, 252)','24k':'rgb(255, 179, 143)' };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for (const mobile of [false,true]) {
  const p = await b.newPage();
  await p.setViewport({ width: mobile?390:1440, height: mobile?844:900, isMobile:mobile, hasTouch:mobile });
  await p.goto('http://localhost:8934/scrolly-site/dist/preview-home.html',{waitUntil:'networkidle0'});
  console.log('\n=== '+(mobile?'MOBILE 390 (touch)':'DESKTOP 1440')+' ===');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal page scroll');
  const act=()=>p.evaluate(()=>document.querySelector('.sx-slide.is-active').dataset.club);
  await p.click('.sx-hero__pause');
  await p.click('.sx-hero__tab[data-club="1k"]'); await wait(200); ok(await act()==='1k','tab $1K -> slide 1k');
  await p.click('.sx-hero__next'); await wait(200); ok(await act()==='10k','next -> 10k');
  await p.click('.sx-hero__next'); await wait(200); ok(await act()==='24k','next -> 24k');
  await p.click('.sx-hero__next'); await wait(200); ok(await act()==='1k','next wraps -> 1k');
  await p.click('.sx-hero__prev'); await wait(200); ok(await act()==='24k','prev wraps -> 24k');
  await p.click('.sx-hero__tab[data-club="10k"]'); await wait(200);
  const cta=await p.evaluate(()=>{const a=document.querySelector('.sx-slide.is-active .sx-slide__cta');return [a.textContent.trim(),a.getAttribute('href'),document.querySelector('.sx-slide.is-active .sx-slide__h').textContent]});
  ok(cta[0].startsWith('Show me how')&&cta[1]==='/10k-club/','10k slide CTA "Show me how" -> /10k-club/  (headline: '+cta[2]+')');
  await p.focus('.sx-hero__tab[data-club="10k"]'); await p.keyboard.press('ArrowRight'); await wait(200); ok(await act()==='24k','ArrowRight on tab -> 24k');
  const hrefs=await p.$$eval('.sx-slide .sx-slide__cta',as=>as.map(a=>a.getAttribute('href')));
  ok(JSON.stringify(hrefs)==='["/1k-club/","/10k-club/","/24k-club/"]','slide CTAs '+hrefs);
  const inert=await p.$$eval('.sx-slide',s=>s.map(x=>x.hasAttribute('inert')));
  ok(inert.filter(Boolean).length===2,'inactive slides are inert (not tabbable)');
  if(mobile){
    await p.evaluate(()=>window.scrollTo(0,0));
    const box=await (await p.$('.sx-hero__viewport')).boundingBox();
    const before=await act();
    await p.touchscreen.touchStart(box.x+300,box.y+200); await p.touchscreen.touchMove(box.x+120,box.y+205); await p.touchscreen.touchEnd(); await wait(300);
    ok(await act()!==before,'swipe left changes slide ('+before+' -> '+await act()+')');
  }
  // record whether a click on a tile would navigate (default not prevented), then cancel the navigation
  await p.evaluate(()=>{window.__clicks=[];document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.sx-club__pick');if(a){__clicks.push({href:a.getAttribute('href'),prevented:e.defaultPrevented});e.preventDefault()}})});
  const lastClick=()=>p.evaluate(()=>__clicks[__clicks.length-1]);
  if(!mobile){
    for (const k of ['1k','10k','24k']) {
      await p.hover(`.sx-club[data-club="${k}"] .sx-club__pick`); await wait(700);
      const s=await state(p);
      ok(s.club===k&&s.tee===T[k]&&s.bar===T[k]&&s.art.join()===k&&s.href===`/${k}-club/`,`hover ${k}: tee=${s.tee} bar=${s.bar} art=${s.art} cta="${s.cta}"`);
    }
    await p.mouse.move(5,5); await wait(700); let s=await state(p); ok(s.club==='1k','mouse leave reverts to default (1k)');
    for (const k of ['1k','10k','24k']) {
      await p.click(`.sx-club[data-club="${k}"] .sx-club__pick`); const c=await lastClick();
      ok(c.href===`/${k}-club/`&&c.prevented===false,`click ${k} tile goes to /${k}-club/ (link not intercepted)`);
    }
    await p.mouse.move(5,5); await p.evaluate(()=>document.activeElement.blur()); await wait(400);
    await p.focus('.sx-club[data-club="24k"] .sx-club__pick'); await wait(600); s=await state(p);
    ok(s.club==='24k'&&s.tee===T['24k']&&s.bar===T['24k'],'keyboard focus on 24k tile previews it (tee='+s.tee+', bar='+s.bar+')');
    await p.keyboard.press('Tab'); await wait(500); s=await state(p); ok(s.club==='24k','tabbing to the Challenge link inside the same card keeps the preview');
    await p.focus('.sx-hero__pause'); await wait(600); s=await state(p); ok(s.club==='1k','focus leaves the card -> reverts to default (1k)');
    await p.focus('.sx-club[data-club="10k"] .sx-club__pick'); await p.keyboard.press('Enter'); await wait(200); const e=await lastClick(); ok(e.href==='/10k-club/'&&e.prevented===false,'Enter on a focused tile follows the link');
  } else {
    const tapEl=async k=>{const el=await p.$(`.sx-club[data-club="${k}"] .sx-club__pick`);await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await wait(250);await el.tap();await wait(700)};
    await tapEl('10k'); let s=await state(p); let c=await lastClick();
    ok(c.prevented===true&&s.club==='10k'&&s.tee===T['10k']&&s.bar===T['10k']&&s.sel.join()==='10k'&&s.href==='/10k-club/','1st tap on 10k previews (does not navigate): tee+bar lavender, CTA "'+s.cta+'"');
    await tapEl('10k'); c=await lastClick(); ok(c.prevented===false,'2nd tap on the selected 10k tile follows the link');
    await tapEl('24k'); s=await state(p); c=await lastClick();
    ok(c.prevented===true&&s.club==='24k'&&s.tee===T['24k']&&s.art.join()==='24k','tap 24k previews (tee peach/orange, art=24k, CTA "'+s.cta+'")');
    const vis=await p.evaluate(()=>{const r=document.querySelector('.sx-preview').getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});
    ok(vis,'preview panel is in view after tap');
    const h=await p.evaluate(()=>Math.round(document.querySelector('.sx-preview__club').getBoundingClientRect().height));
    ok(h>=44,'Visit CTA is a full-size tap target ('+h+'px tall)');
  }
  const links=await p.$$eval('.sx-club a',as=>as.map(a=>a.getAttribute('href')));
  ok(JSON.stringify(links)==='["/1k-club/","/1k-challenge/","/10k-club/","/10k-challenge/","/24k-club/","/24k-challenge/"]','existing club + challenge links preserved');
  await p.$eval('#sx-goal',e=>e.value=''); await p.type('#sx-goal','12000'); await p.$eval('#sx-avg',e=>e.value=''); await p.type('#sx-avg','250'); await p.select('#sx-days','60');
  const c=await p.evaluate(()=>[document.querySelector('.sx-calc__big').textContent,document.querySelector('.sx-calc__per').textContent]);
  ok(c[0]==='48'&&c[1].includes('0.8'),'calculator 12000/250 over 60d => '+c.join(' | '));
  const small=await p.evaluate(()=>[...document.querySelectorAll('.sx a, .sx button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height<40&&!e.closest('[inert]')}).map(e=>e.textContent.trim().slice(0,25)+':'+Math.round(e.getBoundingClientRect().height)));
  console.log('  (info) visible controls under 40px tall:',small.slice(0,8).join(' , ')||'none');
  await p.close();
}
await b.close(); console.log('\n'+(fails?fails+' FAILURES':'ALL PASSED')); process.exit(fails?1:0);
