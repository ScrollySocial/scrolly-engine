// Usage: node linkcheck.mjs <url> ...   Fetches each page and checks every internal href/img src resolves (2xx).
const pages = process.argv.slice(2);
const seen = new Map();
async function check(u){ if(seen.has(u))return seen.get(u); await new Promise(r=>setTimeout(r,250)); let s; try{const r=await fetch(u,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0'}});s=r.status+(r.redirected?' (redirect→'+r.url.replace('https://scrollyseo.com','')+')':'')}catch(e){s='ERR '+e.message} seen.set(u,s);return s}
for (const p of pages) {
  await new Promise(r=>setTimeout(r,3000)); const html = await (await fetch(p, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
  const main = html.slice(html.indexOf('<div class="scx'), html.lastIndexOf('id="scx-js"'));
  const hrefs = [...new Set([...main.matchAll(/href="([^"]+)"/g)].map(m=>m[1]))];
  const srcs = [...new Set([...main.matchAll(/src="([^"]+)"/g)].map(m=>m[1]))];
  console.log('==', p, 'hrefs', hrefs.length, 'imgs', srcs.length);
  for (const h of hrefs) {
    if (h.startsWith('mailto:')) { console.log('  mailto ok  ', h.slice(0, 60)); continue; }
    if (h.startsWith('#')) { const id = h.slice(1); console.log(' ', main.includes(`id="${id}"`) ? 'anchor ok ' : 'ANCHOR MISSING', h); continue; }
    const u = h.startsWith('/') ? new URL(h, p).href : h;
    if (h.startsWith('/#')) { const st = await check(new URL('/', p).href); console.log('  ', st, h); continue; }
    const st = await check(u); if (!String(st).startsWith('200')) console.log('  !!', st, h); }
  for (const s of srcs) { const st = await check(s); if (!String(st).startsWith('200')) console.log('  !! img', st, s); }
  console.log('  done');
}
