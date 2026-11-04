// The two still posts of "1 photo of soap, 9 posts", both made only from soap.webp (her sunset bar):
//   node stills.mjs image      image post, 1080×1350: the cut-out bar over a soft pastel sunset still (not on white, her note)
//   node stills.mjs carousel   carousel 1 "up close", 1080×1440 slides: one crop of the bar per slide, then the whole bar,
//                              ingredients, why cold process feels different, scent + comment SUNSET
// Writes PNGs + caption.txt to <exports>/soap-9-posts/image-post/ and carousel-1/. Needs .work/bar.png (node build.mjs reel1
// makes it). Soap shop look, not Scrolly: pastels taken from the bar, Instrument Serif headlines, Figtree body, 15px+ text.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, tool, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const TMP = path.join(OUT, '.work');
const FONTS = path.join(HERE, '../../reel-hf/lib/assets/fonts');
const SOAP = path.join(HERE, 'soap.webp');
const data = (f, type) => `data:${type};base64,${readFileSync(f).toString('base64')}`;

// colours picked off the bar
const C = { peach: '#F7DCC8', pink: '#F2BCC4', sky: '#C3CCCF', sun: '#F4E2A6', sea: '#2E8FC4', deep: '#1D5B82', ink: '#3B3440', cream: '#FBF4EC' };
const CSS = `@font-face{font-family:Figtree;src:url(${data(path.join(FONTS, 'figtree.woff2'), 'font/woff2')});font-weight:300 900}
@font-face{font-family:Serif;src:url(${data(path.join(FONTS, 'instrument-serif.ttf'), 'font/ttf')})}
*{box-sizing:border-box}html,body{margin:0}body{font-family:Figtree;color:${C.ink}}
section{position:relative;overflow:hidden}
h1,h2{font-family:Serif;font-weight:400;margin:0;line-height:1.02;letter-spacing:-.5px}
.box{position:absolute;left:60px;right:60px;bottom:60px;background:rgba(251,244,236,.94);border-radius:28px;padding:40px 48px}
.box h2{font-size:72px;color:${C.deep}}.box p{font-size:34px;line-height:1.35;margin:14px 0 0}
.tag{font:700 24px Figtree;letter-spacing:3px;text-transform:uppercase;color:${C.sea};margin-bottom:14px}`;

// ---------- image post ----------
const IMAGE_CAPTION = `This is not a painting. 🌅

It's a bar of soap.

A grey sky swirled by hand, pink clouds, a sun sitting right on the horizon and a sea full of waves, all poured into one bar of handmade cold process soap.

No two bars come out the same. The swirls move a little differently every time we pour, so the sunset you get is yours alone.

It smells like coconut water and apple: light, clean, with a hint of sweetness. The kind of scent that makes a regular Tuesday shower feel like the last hour of a beach day.

Made with olive oil, coconut oil, shea butter and castor oil, and cured for weeks before it's ready for you.

Comment SUNSET for the link to get yours today`;

// ---------- carousel 1: crops of the bar (x, y, w in soap.webp pixels; height = w × 4/3) ----------
const crop = (x, y, w) => ({ x, y, w });
const SLIDES = [
  { crop: crop(560, 560, 900), tag: 'Up close', title: 'A sunset you can shower with', cover: true },
  { crop: crop(560, 150, 660), title: 'A grey sky, swirled by hand.' },
  { crop: crop(330, 600, 520), title: 'Pink clouds, poured in soft layers.' },
  { crop: crop(700, 760, 560), title: 'A sun that never quite sets.' },
  { crop: crop(1000, 1210, 450), title: 'Waves you can actually lather.' },
  { crop: crop(700, 470, 330), title: 'A little shimmer in every swirl.' },
  { whole: true },
  { text: 'every' },
  { text: 'inside' },
  { text: 'why' },
  { text: 'scent' },
];
const CAROUSEL_CAPTION = `Get up close to a sunset you can shower with. 🌅

Every part of this bar is poured and swirled by hand: the grey sky, the pink clouds, the sun on the horizon and the waves underneath. Because it's done by hand, every bar comes out a little different.

What's inside:
Olive oil, coconut oil, palm oil, castor oil, shea butter, water, sodium hydroxide (lye), sodium lactate, micas for the colours and fragrance oil for the scent.

Wait, lye? Every true soap starts with oils plus lye. In cold process soap the lye reacts with the oils and turns them into soap, so none is left in the finished bar.

Why handmade cold process feels different:
1. The glycerin made while the soap forms stays in the bar. Glycerin is a humectant, which means it holds on to water.
2. We add 10% extra oil (superfat), so a little oil stays in the bar as oil instead of becoming soap.
3. Each bar cures for weeks, so it's hard and long lasting.

The scent: coconut water and apple. Light, clean, with a hint of sweetness.

Comment SUNSET for the link to get yours today`;

const cropDiv = (c, h = 1440) => {
  const s = 1080 / c.w; // scale so the crop fills the slide width
  return `<div style="position:absolute;inset:0;background:url(${SOAP_URL}) no-repeat;background-size:${2000 * s}px;background-position:${-c.x * s}px ${-c.y * s}px;height:${h}px"></div>`;
};
let SOAP_URL, BAR_URL;

function slideHtml(sl, i, n) {
  const num = `<div style="position:absolute;top:44px;right:52px;font:600 24px Figtree;color:${C.cream};background:rgba(29,91,130,.55);padding:8px 16px;border-radius:30px">${i + 1}/${n}</div>`;
  if (sl.crop) {
    if (sl.cover) return `<section style="width:1080px;height:1440px">${cropDiv(sl.crop)}${num}
      <div class=box style="bottom:70px;padding:48px 52px"><div class=tag>${sl.tag}</div><h1 style="font-size:96px;color:${C.deep}">${sl.title}</h1>
      <p style="font-size:32px;margin:18px 0 0">Swipe to see every detail &rarr;</p></div></section>`;
    return `<section style="width:1080px;height:1440px">${cropDiv(sl.crop)}${num}<div class=box><h2>${sl.title}</h2></div></section>`;
  }
  const bg = `background:linear-gradient(180deg,${C.sky} 0%,${C.peach} 38%,${C.pink} 62%,${C.sun} 100%)`;
  if (sl.whole) return `<section style="width:1080px;height:1440px;${bg}">${num}
    <img src="${BAR_URL}" style="position:absolute;width:1060px;left:10px;top:270px">
    <div style="position:absolute;left:0;right:0;top:70px;text-align:center"><h2 style="font-size:88px;color:${C.deep}">All of that is<br>one bar of soap.</h2></div></section>`;
  const page = (inner, style = '') => `<section style="width:1080px;height:1440px;background:${C.cream};${style}">${num}
    <div style="position:absolute;left:0;right:0;bottom:0;height:200px;${cropStrip()}"></div>
    <div style="position:absolute;left:90px;right:90px;top:120px">${inner}</div></section>`;
  if (sl.text === 'every') return page(`<div class=tag>Made by hand</div>
    <h2 style="font-size:104px;color:${C.deep}">Every bar comes out a little different.</h2>
    <p style="font-size:40px;line-height:1.4;margin-top:40px">The sky, the clouds and the waves are swirled by hand, so no two sunsets match. Yours will be one of a kind.</p>`);
  if (sl.text === 'inside') {
    const rows = [['Olive oil + shea butter', 'mild, creamy, conditioning'], ['Coconut oil', 'big, bubbly lather'], ['Castor oil', 'helps the lather hold'],
      ['Palm oil', 'a hard, long lasting bar'], ['Water + sodium hydroxide (lye)', 'turns the oils into soap'], ['Sodium lactate', 'helps the bar harden'],
      ['Micas', 'the sunset colours'], ['Fragrance oil', 'coconut water + apple']];
    return page(`<div class=tag>What's inside</div><h2 style="font-size:84px;color:${C.deep};margin-bottom:34px">Ingredients</h2>
      ${rows.map(([a, b], k) => `<div style="display:flex;justify-content:space-between;gap:24px;padding:17px 0;border-top:2px solid ${[C.sky, C.pink, C.sun, C.peach][k % 4]};font-size:33px">
        <b style="font-weight:700">${a}</b><span style="text-align:right;color:#6A5F6E">${b}</span></div>`).join('')}`, '');
  }
  if (sl.text === 'why') {
    const pts = [['The glycerin stays in', 'Glycerin forms as the oils turn into soap, and it stays in the bar. It\'s a humectant: it holds on to water.'],
      ['10% superfat', 'We add a little extra oil, so some stays in the bar as oil instead of becoming soap.'],
      ['Slow cured', 'The lye is used up as the soap forms, and each bar then cures for weeks to harden.']];
    return page(`<div class=tag>Cold process</div><h2 style="font-size:84px;color:${C.deep};margin-bottom:30px">Why handmade soap feels different</h2>
      ${pts.map(([h, p], k) => `<div style="display:flex;gap:28px;margin-top:30px"><div style="flex:none;width:66px;height:66px;border-radius:50%;background:${[C.pink, C.sun, C.sky][k]};font:400 44px/66px Serif;text-align:center;color:${C.deep}">${k + 1}</div>
        <div><div style="font-size:38px;font-weight:700">${h}</div><div style="font-size:33px;line-height:1.38;margin-top:6px">${p}</div></div></div>`).join('')}`);
  }
  if (sl.text === 'scent') return `<section style="width:1080px;height:1440px;${bg}">${num}
    <img src="${BAR_URL}" style="position:absolute;width:700px;left:190px;top:460px">
    <div style="position:absolute;left:90px;right:90px;top:110px;text-align:center"><div class=tag>The scent</div>
    <h2 style="font-size:92px;color:${C.deep}">Coconut water + apple</h2>
    <p style="font-size:38px;line-height:1.4;margin:22px 0 0">Light, clean, with a hint of sweetness.</p></div>
    <div style="position:absolute;left:110px;right:110px;bottom:70px;background:${C.cream};border-radius:28px;padding:30px 36px;text-align:center;font-size:40px;line-height:1.35">Comment <b style="color:${C.sea}">SUNSET</b> for the link to get yours today</div></section>`;
}
// a thin band of the bar's own sky-to-sea, as a footer on the text slides
const cropStrip = () => `background:url(${SOAP_URL}) no-repeat;background-size:2600px;background-position:-520px -1640px`;

async function shoot(htmls, w, h, dir) {
  mkdirSync(dir, { recursive: true });
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: w, height: h });
  const files = [];
  for (const [i, html] of htmls.entries()) {
    await pg.setContent(`<style>${CSS}</style>${html}`);
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => Promise.all([...document.images].map((im) => im.decode())));
    const f = path.join(dir, htmls.length > 1 ? `slide-${String(i + 1).padStart(2, '0')}.png` : 'image-post.png');
    await pg.screenshot({ path: f }); files.push(f);
  }
  await b.close();
  return files;
}

const bar = path.join(TMP, 'bar.png');
if (!existsSync(bar)) { console.log('missing .work/bar.png: run node build.mjs reel1 once first'); process.exit(1); }
SOAP_URL = data(SOAP, 'image/webp'); BAR_URL = data(bar, 'image/png');
const cmd = process.argv[2];
if (cmd === 'image') {
  // background: a still of a soft pink-and-blue pastel sunset over the sea (Pexels 34918687), lightly blurred
  const still = path.join(TMP, 'img-bg.jpg');
  execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', '-ss', '2', '-i', path.join(HERE, 'clips', '34918687.mp4'), '-frames:v', '1',
    '-vf', 'scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=3,eq=brightness=0.04:saturation=0.9', still]);
  const html = `<section style="width:1080px;height:1350px;background:url(${data(still, 'image/jpeg')}) center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(251,244,236,.35),rgba(251,244,236,0) 40%)"></div>
    <img src="${BAR_URL}" style="position:absolute;width:1120px;left:-20px;top:150px">
    <div style="position:absolute;left:0;right:0;top:64px;text-align:center"><h1 style="font-size:84px;color:${C.cream};text-shadow:0 2px 18px rgba(60,40,80,.35)">This is not a painting.</h1></div></section>`;
  const dir = path.join(OUT, 'image-post');
  console.log(await shoot([html], 1080, 1350, dir));
  writeFileSync(path.join(dir, 'caption.txt'), IMAGE_CAPTION);
} else if (cmd === 'carousel') {
  const dir = path.join(OUT, 'carousel-1');
  console.log(await shoot(SLIDES.map((s, i) => slideHtml(s, i, SLIDES.length)), 1080, 1440, dir));
  writeFileSync(path.join(dir, 'caption.txt'), CAROUSEL_CAPTION);
} else console.log('usage: node stills.mjs image | carousel');
