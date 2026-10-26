// New checkout collage (1800x1200, transparent): three phones with real Challenge/Club screens, v3 colours.
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const C = 'file:///C:/Users/merce/Scrolly%20Organic%20Engine/automation/carousels/';
const { launch } = await import(C + 'lib/common.mjs');
const S = 'C:/Users/merce/OneDrive/Scrolly Media/photos/screens/site/';
const u = (f) => pathToFileURL(S + f).href;
const phone = (cls, img, pos = '0 0') => `<div class="ph ${cls}"><div class="notch"></div><div class="scr" style="background-image:url('${img}');background-position:${pos}"></div></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1800px;height:1200px;background:transparent}
.stage{position:relative;width:1800px;height:1200px}
.blob{position:absolute;left:330px;top:120px;width:1140px;height:960px;border-radius:50%;background:#dfe4f0}
.ph{position:absolute;width:430px;height:880px;border-radius:66px;background:#151515;padding:16px;box-shadow:0 40px 80px rgba(10,25,48,.28)}
.notch{position:absolute;top:30px;left:50%;translate:-50% 0;width:120px;height:32px;border-radius:16px;background:#151515;z-index:2}
.scr{width:100%;height:100%;border-radius:52px;background-color:#fff;background-repeat:no-repeat;background-size:100% auto}
.p1{left:250px;top:230px;rotate:-9deg}.p2{left:685px;top:120px;z-index:3}.p3{left:1120px;top:230px;rotate:9deg}
.p2 .scr{background-position:0 64px}
.spark{position:absolute;width:70px;height:70px}.s1{left:1540px;top:170px}.s2{left:210px;top:980px;width:52px;height:52px}
</style></head><body><div class="stage"><div class="blob"></div>
${phone('p1', u('k1-tile2-notion.webp'), '0 64px')}
${phone('p2', u('k1-tile2-reels-tall.png'))}
${phone('p3', u('live-calculators-2026-10-26.png'), '0 64px')}
<svg class="spark s1" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="#4da3ff"/></svg>
<svg class="spark s2" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="#0a1930"/></svg>
</div></body></html>`;
const out = process.env.COLLAGE_OUT || 'C:/Users/merce/AppData/Local/Temp/claude/co/';
writeFileSync(out + 'collage.html', html);
const b = await launch(); const pg = await b.newPage();
await pg.setViewport({ width: 1800, height: 1200 });
await pg.goto(pathToFileURL(out + 'collage.html').href, { waitUntil: 'networkidle0' });
await pg.screenshot({ path: out + 'k1-checkout-collage-v3.png', omitBackground: true });
await b.close(); console.log('ok');
