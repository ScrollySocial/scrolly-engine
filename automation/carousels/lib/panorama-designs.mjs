// Designed grid panoramas: one wide canvas (N × 1080 by 1440) with a DIFFERENT design per tile, plus objects that
// cross the seams (photo, phone, shirt card, arrow) so the row reads as one piece on the profile grid.
// Rule: text never crosses a seam (each tile's hook sits fully inside its own tile, 90px from the edges).
import { esc } from './common.mjs';

const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

export const DESIGNS = {
  // v1, kept for history. Names: offwhite (was warm), navy (was tangerine).
  'pinned-2026-10': ({ brand, photo, shirt, screen, hooks }) => {
    const [h1, h2, h3] = hooks;
    const P = brand.palettes, warm = P.offwhite, tan = P.navy;
    return `
<div class="zone z1"></div>
<svg class="sweep" viewBox="0 0 1300 1440" preserveAspectRatio="none"><path d="M120 0 C 40 420, 220 760, 60 1440 L 1300 1440 L 1300 0 Z" fill="${tan.bg}"/></svg>
<div class="zone z3"></div>

<div class="hook t1"><h1>${rich(h1.big)}</h1><p>${esc(h1.small)}</p></div>
<div class="hook t2"><h1>${rich(h2.big)}</h1><p>${esc(h2.small)}</p></div>
<div class="hook t3"><h1>${rich(h3.big)}</h1><p>${esc(h3.small)}</p></div>

<div class="polaroid"><span class="tape"></span><div class="ph" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}"></div></div>
<div class="shirt"><span class="tape"></span><div class="ph" style="background-image:url('${shirt}')"></div><b>You earn this one</b></div>
<div class="phone"><div class="notch"></div><div class="scr" style="background-image:url('${screen.url}');background-position:${screen.focus || '50% 85%'}"></div></div>

<svg class="arrow a1" viewBox="0 0 520 220"><path d="M10 170 C 140 30, 330 10, 470 120" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M420 70 l 55 52 -70 22" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
<svg class="spark s1" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>
<svg class="spark s2" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>
<svg class="spark s3" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>

<style>
.canvas{position:relative;width:3240px;height:1440px;overflow:hidden;background:${warm.bg};font-family:'${brand.fonts.headline.family}',sans-serif}
.zone{position:absolute;top:0;bottom:0}
.z1{left:0;width:1300px;background-image:linear-gradient(${warm.tex} 3px,transparent 3px),linear-gradient(90deg,${warm.tex} 3px,transparent 3px);background-size:90px 90px}
.z3{left:2240px;right:0;background-image:radial-gradient(${warm.tex} 10px,transparent 11px);background-size:66px 66px}
.sweep{position:absolute;left:1000px;top:0;width:1300px;height:1440px}
.hook{position:absolute;top:150px;width:900px}
.hook h1{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;text-transform:uppercase;line-height:.92;font-size:150px;letter-spacing:-.005em}
.hook em{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;text-transform:none;font-size:1.12em;letter-spacing:0}
.hook p{margin-top:34px;font-weight:700;font-stretch:88%;font-variation-settings:'wdth' 88;font-size:56px;line-height:1.15}
.t1{left:90px;color:${warm.ink}}.t1 em{color:${warm.accent}}
.t2{left:1170px;color:#fff}.t2 em{color:${tan.accent}}
.t3{left:2250px;color:${warm.ink};text-align:right}.t3 em{color:${warm.accent}}
.tape{position:absolute;top:-30px;left:50%;width:220px;height:64px;translate:-50% 0;rotate:-4deg;background:color-mix(in srgb,${warm.mark} 80%,transparent);z-index:2}
.polaroid{position:absolute;left:640px;top:760px;width:600px;padding:28px 28px 110px;background:#fff;rotate:-6deg;box-shadow:0 24px 50px rgba(60,20,0,.22)}
.polaroid .ph{height:560px;background-size:cover}
.shirt{position:absolute;left:1480px;top:820px;width:560px;padding:24px 24px 90px;background:#fff;rotate:5deg;box-shadow:0 24px 50px rgba(60,20,0,.25)}
.shirt .ph{height:380px;background-size:cover;background-position:center}
.shirt b{position:absolute;left:0;right:0;bottom:24px;text-align:center;font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;font-size:52px;color:${warm.ink}}
.phone{position:absolute;left:2080px;top:520px;width:450px;height:880px;border-radius:70px;background:#151515;padding:16px;rotate:8deg;box-shadow:0 30px 60px rgba(40,10,0,.3)}
.phone .notch{position:absolute;top:28px;left:50%;translate:-50% 0;width:130px;height:34px;border-radius:18px;background:#151515;z-index:2}
.phone .scr{width:100%;height:100%;border-radius:56px;background-size:cover;background-color:#f6eee5}
.arrow{position:absolute;color:${warm.accent}}
.a1{left:820px;top:560px;width:520px;rotate:-4deg}
.spark{position:absolute;color:${warm.accent}}
.s1{left:1230px;top:700px;width:70px;color:#fff}.s2{left:2120px;top:600px;width:56px}.s3{left:3080px;top:1180px;width:80px}
</style>`;
  },
};

// v2 (2026-10-07, after Mercedes's feedback): one focal point per tile, plain backgrounds behind text,
// small die-cut stickers (stars, a badge) crossing the seams. Tile 1 = her walking video/photo full-bleed.
const STAR = (fill) => `<svg viewBox="0 0 100 100"><path d="M50 4 61 36 95 37 68 58 78 92 50 72 22 92 32 58 5 37 39 36Z" fill="${fill}" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke"/></svg>`;
DESIGNS['pinned-2026-10-v2'] = ({ brand, photo, hooks, stats }) => {
  const [h1, h2, h3] = hooks;
  const P = brand.palettes, warm = P.offwhite, tan = P.navy;
  const max = Math.log10(Math.max(...stats.map((s) => +s[0].replace(/,/g, ''))));
  return `
<div class="t t1" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}">
  <div class="hl1"><p><span>${esc(h1.big)}</span></p><p class="sm"><span>${esc(h1.small)}</span></p></div>
</div>
<div class="t t2"><div class="hook"><h1>${rich(h2.big)}</h1><p>${esc(h2.small)} →</p></div></div>
<div class="t t3"><div class="hook"><h1>${rich(h3.big)}</h1><p>${esc(h3.small)}</p></div>
  <div class="card">${stats.map(([v, l]) => `<div class="row"><b>${esc(v)}</b><span>${esc(l)}</span><i style="width:${Math.max(8, (Math.log10(+v.replace(/,/g, '')) / max) * 100)}%"></i></div>`).join('')}</div>
</div>
<div class="sticker badge"><b>30</b><span>days</span></div>
<div class="sticker star sa">${STAR('#4da3ff')}</div>
<div class="sticker star sb">${STAR(tan.bg)}</div>
<div class="sticker star sc">${STAR(warm.accent)}</div>
<style>
.canvas{position:relative;width:3240px;height:1440px;overflow:hidden;font-family:'${brand.fonts.headline.family}',sans-serif}
.t{position:absolute;top:0;bottom:0;width:1080px}
.t1{left:0;background-size:cover}
.t2{left:1080px;background:${tan.bg}}
.t3{left:2160px;background:${warm.bg}}
.hl1{position:absolute;left:80px;right:80px;bottom:170px;font-family:'${brand.fonts.highlight.family}',sans-serif;font-weight:600;color:#000}
.hl1 p{font-size:84px;line-height:1.4}.hl1 p.sm{font-size:52px;margin-top:22px}
.hl1 span{background:#fff;padding:.08em .32em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.hook{position:absolute;left:90px;right:90px;top:170px}
.hook h1{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;text-transform:uppercase;line-height:.92;font-size:168px;letter-spacing:-.005em}
.hook em{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;text-transform:none;font-size:1.12em;letter-spacing:0}
.hook p{margin-top:44px;font-weight:700;font-stretch:88%;font-variation-settings:'wdth' 88;font-size:60px}
.t2 .hook{color:#fff;left:140px;top:330px}.t2 em{color:${tan.accent}}
.t3 .hook{color:${warm.ink};top:150px}.t3 .hook h1{font-size:140px}.t3 em{color:${warm.accent}}
.card{position:absolute;left:120px;right:120px;bottom:150px;background:#fff;border-radius:40px;padding:50px 56px;box-shadow:0 20px 50px rgba(60,20,0,.12);rotate:-2deg;display:flex;flex-direction:column;gap:34px}
.row{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:22px;row-gap:12px}
.row b{font-weight:800;font-stretch:80%;font-variation-settings:'wdth' 80;font-size:96px;line-height:1;color:${warm.ink}}
.row span{font-weight:700;font-size:40px;color:${warm.ink};opacity:.7}
.row i{grid-column:1/3;display:block;height:22px;border-radius:11px;background:${warm.accent}}
.row:not(:last-child) i{background:color-mix(in srgb,${warm.accent} 35%,#fff)}
.sticker{position:absolute;filter:drop-shadow(0 8px 14px rgba(40,10,0,.25))}
.badge{left:968px;top:70px;width:220px;height:220px;border-radius:50%;background:#fff;color:${tan.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;rotate:-10deg;border:10px solid ${tan.bg};outline:8px solid #fff}
.badge b{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;font-size:112px;line-height:.9}
.badge span{font-weight:800;font-size:40px;text-transform:uppercase;letter-spacing:.06em}
.star svg{display:block;width:100%;height:auto}
.sa{left:1010px;top:1250px;width:100px;rotate:12deg}
.sb{left:2100px;top:1000px;width:150px;rotate:-14deg}
.sc{left:2105px;top:70px;width:96px;rotate:8deg}
</style>`;
};

// v3 (2026-10-07): big shapes cross the seams so the row reads as one piece. A tangerine blob spans the middle and
// spills into both outer tiles; her photo/video bleeds past seam 1 with a wavy edge; a white growth line runs from
// tile 2 across seam 2 into the stats card. Text stays inside its own tile.
DESIGNS['pinned-2026-10-v3'] = ({ brand, photo, hooks, stats }) => {
  const [h1, h2, h3] = hooks;
  const P = brand.palettes, warm = P.offwhite, tan = P.navy;
  const max = Math.log10(Math.max(...stats.map((s) => +s[0].replace(/,/g, ''))));
  return `
<svg class="layer" viewBox="0 0 3240 1440" preserveAspectRatio="none">
  <path d="M900 0 C 820 380, 760 900, 820 1440 L 2470 1440 C 2620 1150, 2560 760, 2380 520 C 2300 380, 2260 180, 2300 0 Z" fill="${tan.bg}"/>
</svg>
<div class="photo" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}"></div>
<svg class="layer line" viewBox="0 0 3240 1440" preserveAspectRatio="none">
  <path d="M1240 1300 C 1500 1290, 1640 1210, 1820 1150 S 2160 1000, 2420 920" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
  ${[[1240, 1300], [1820, 1150], [2420, 920]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="${tan.bg}" stroke="#fff" stroke-width="12"/>`).join('')}
</svg>
<div class="hl1"><p><span>${esc(h1.big)}</span></p><p class="sm"><span>${esc(h1.small)}</span></p></div>
<div class="hook h2"><h1>${rich(h2.big)}</h1><p>${esc(h2.small)} →</p></div>
<div class="hook h3"><h1>${rich(h3.big)}</h1><p>${esc(h3.small)}</p></div>
<div class="card">${stats.map(([v, l]) => `<div class="row"><b>${esc(v)}</b><span>${esc(l)}</span><i style="width:${Math.max(8, (Math.log10(+v.replace(/,/g, '')) / max) * 100)}%"></i></div>`).join('')}</div>
<div class="sticker badge"><b>30</b><span>days</span></div>
<div class="sticker star sa">${STAR('#4da3ff')}</div>
<div class="sticker star sb">${STAR(warm.accent)}</div>
<style>
.canvas{position:relative;width:3240px;height:1440px;overflow:hidden;background:${warm.bg};font-family:'${brand.fonts.headline.family}',sans-serif}
.layer{position:absolute;inset:0;width:3240px;height:1440px}
.photo{position:absolute;left:0;top:0;width:1190px;height:1440px;background-size:cover;
  clip-path:path('M0 0 L1120 0 C 1190 240, 1080 470, 1150 720 C 1210 960, 1100 1200, 1170 1440 L0 1440 Z')}
.hl1{position:absolute;left:80px;width:920px;bottom:170px;font-family:'${brand.fonts.highlight.family}',sans-serif;font-weight:600;color:#000}
.hl1 p{font-size:84px;line-height:1.4}.hl1 p.sm{font-size:52px;margin-top:22px}
.hl1 span{background:#fff;padding:.08em .32em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.hook h1{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;text-transform:uppercase;line-height:.92;letter-spacing:-.005em}
.hook em{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;text-transform:none;font-size:1.12em;letter-spacing:0}
.hook p{margin-top:40px;font-weight:700;font-stretch:88%;font-variation-settings:'wdth' 88;font-size:56px}
.h2{position:absolute;left:1260px;width:820px;top:250px;color:#fff}.h2 h1{font-size:150px}.h2 em{color:${tan.accent}}
.h3{position:absolute;left:2420px;width:730px;top:150px;color:${warm.ink};text-align:right}.h3 h1{font-size:128px}.h3 em{color:${warm.accent}}
.card{position:absolute;left:2470px;width:680px;top:820px;background:#fff;border-radius:40px;padding:44px 50px;box-shadow:0 20px 50px rgba(60,20,0,.16);rotate:-2deg;display:flex;flex-direction:column;gap:28px}
.row{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:20px;row-gap:10px}
.row b{font-weight:800;font-stretch:80%;font-variation-settings:'wdth' 80;font-size:84px;line-height:1;color:${warm.ink}}
.row span{font-weight:700;font-size:36px;color:${warm.ink};opacity:.7}
.row i{grid-column:1/3;display:block;height:20px;border-radius:10px;background:${warm.accent}}
.row:not(:last-child) i{background:color-mix(in srgb,${warm.accent} 35%,#fff)}
.sticker{position:absolute;filter:drop-shadow(0 8px 14px rgba(40,10,0,.25))}
.badge{left:975px;top:90px;width:210px;height:210px;border-radius:50%;background:#fff;color:${tan.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;rotate:-10deg;border:10px solid ${tan.bg};outline:8px solid #fff}
.badge b{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;font-size:104px;line-height:.9}
.badge span{font-weight:800;font-size:36px;text-transform:uppercase;letter-spacing:.06em}
.star svg{display:block;width:100%;height:auto}
.sa{left:2100px;top:90px;width:120px;rotate:-12deg}
.sb{left:1180px;top:1180px;width:96px;rotate:10deg}
</style>`;
};

// v4 (2026-10-07): only NEUTRAL elements cross seams (content-rules 7d): the navy sweep, her photo's edge, a big
// star sticker, a soft blue-mist blob, a squiggle and sparkles. No words or charts on seams; the stats card sits inside tile 3.
// 2026-10-21: moved to the 2026-10 rebrand (off-white + navy sweep, sky accents, Instrument Serif hooks, Jost lines).
const ARROW_D = '<svg viewBox="0 0 120 170"><path d="M38 8c-30 30-18 70 18 70 26 0 26-34 2-30-30 6-30 60-6 92" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M34 128l18 22 20-20" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SQUIGGLE = (c) => `<svg viewBox="0 0 600 160"><path d="M10 110 C 70 10, 130 10, 170 80 S 270 150, 310 80 S 410 10, 450 80 S 550 150, 590 60" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round"/></svg>`;
const SPARK = (c) => `<svg viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="${c}"/></svg>`;
DESIGNS['pinned-2026-10-v4'] = ({ brand, photo, hooks, stats }) => {
  const [h1, h2, h3] = hooks;
  const P = brand.palettes, light = P.offwhite, navy = P.navy, mist = P.mist;
  const max = Math.log10(Math.max(...stats.map((s) => +s[0].replace(/,/g, ''))));
  return `
<svg class="layer" viewBox="0 0 3240 1440" preserveAspectRatio="none">
  <path d="M900 0 C 820 380, 760 900, 820 1440 L 2110 1440 C 2150 1150, 2120 760, 2100 520 C 2090 380, 2100 180, 2120 0 Z" fill="${navy.bg}"/>
</svg>
<div class="photo" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}"></div>
<div class="hl1"><p><span>${esc(h1.big)}</span></p><p class="sm"><span>${esc(h1.small)}</span></p></div>
<div class="hook h2"><h1>${rich(h2.big)}</h1><p>${esc(h2.small)} →</p></div>
<div class="hook h3"><h1>${rich(h3.big)}</h1><p>${esc(h3.small)}</p></div>
<div class="card">${stats.map(([v, l]) => `<div class="row"><b>${esc(v)}</b><span>${esc(l)}</span><i style="width:${Math.max(8, (Math.log10(+v.replace(/,/g, '')) / max) * 100)}%"></i></div>`).join('')}</div>
<div class="sticker bigstar">${STAR(light.mark)}</div>
<div class="doodle arr">${ARROW_D}</div><div class="doodle note">do the<br>math<br>with me</div>
<div class="spk k1">${SPARK(navy.accent)}</div><div class="spk k2">${SPARK(light.mark)}</div><div class="spk k3">${SPARK('#fff')}</div>
<style>
.canvas{position:relative;width:3240px;height:1440px;overflow:hidden;background:${light.bg};font-family:'${brand.fonts.display.family}',sans-serif}
.layer{position:absolute;inset:0;width:3240px;height:1440px}
.photo{position:absolute;left:0;top:0;width:1190px;height:1440px;background-size:cover;
  clip-path:path('M0 0 L1120 0 C 1190 240, 1080 470, 1150 720 C 1210 960, 1100 1200, 1170 1440 L0 1440 Z')}
.hl1{position:absolute;left:80px;width:880px;bottom:170px;font-family:'${brand.fonts.highlight.family}',sans-serif;font-weight:500;color:${light.ink}}
.hl1 p{font-size:82px;line-height:1.4}.hl1 p.sm{font-size:52px;margin-top:22px}
.hl1 span{background:#fff;padding:.08em .32em;border-radius:.22em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.hook h1{font-family:'${brand.fonts.headline.family}',serif;font-weight:400;line-height:.98;letter-spacing:-.01em;text-wrap:balance}
.hook em{font:inherit;color:inherit;background:none}
.hook p{margin-top:40px;font-weight:500;font-size:54px}
.h2{position:absolute;left:1240px;width:800px;top:300px;color:${navy.ink}}.h2 h1{font-size:168px}
.h3{position:absolute;left:2420px;width:730px;top:150px;color:${light.ink};text-align:right}.h3 h1{font-size:150px}

.card{position:absolute;left:2470px;width:680px;top:800px;background:#fff;border-radius:40px;padding:44px 50px;box-shadow:0 20px 50px rgba(10,25,48,.14);rotate:-2deg;display:flex;flex-direction:column;gap:28px}
.row{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:20px;row-gap:10px}
.row b{font-family:'${brand.fonts.headline.family}',serif;font-weight:400;font-size:92px;line-height:1;color:${light.ink}}
.row span{font-weight:500;font-size:36px;color:#4a4e66}
.row i{grid-column:1/3;display:block;height:20px;border-radius:10px;background:${light.ink}}
.row:not(:last-child) i{background:${mist.bg}}
.sticker{position:absolute;filter:drop-shadow(0 8px 14px rgba(10,25,48,.22))}
.sticker svg,.spk svg{display:block;width:100%;height:auto}
.bigstar{left:930px;top:90px;width:300px;rotate:-12deg}
.arr{position:absolute;left:2280px;top:990px;width:110px;color:${light.mark};rotate:-50deg}.arr svg{display:block;width:100%;height:auto}
.note{position:absolute;left:2205px;top:770px;font:400 62px/1.05 'Covered By Your Grace',cursive;color:${light.ink};rotate:-6deg;letter-spacing:.03em}
.spk{position:absolute}
.k1{left:1930px;top:1180px;width:90px}.k2{left:2230px;top:1250px;width:60px}.k3{left:1130px;top:1250px;width:70px}
</style>`;
};
