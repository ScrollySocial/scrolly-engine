// The two still posts of "1 photo of soap, 9 posts", both made only from soap.webp (her sunset bar):
//   node stills.mjs image      image post, 1080×1350
//   node stills.mjs carousel   carousel 1 "up close", 1080×1440 slides: the bar's details one per slide, the whole bar,
//                              ingredients, why cold process, scent + comment SUNSET
// Look = her old soap shop's own graphics (2026-11-04): flat peach ground, big white script question, the cut-out bar,
// thin black sans. Script = Satisfy with a stroke (closest free match), sans = Questrial, both Google Fonts.
// Writes PNGs + caption.txt to <exports>/soap-9-posts/image-post/ and carousel-1/. Needs .work/bar.png (node build.mjs reel1).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const BARPNG = path.join(OUT, '.work', 'bar.png');
const data = (f, type) => `data:${type};base64,${readFileSync(f).toString('base64')}`;
const PEACH = '#F2D3CB';
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Questrial&display=block');
*{box-sizing:border-box}html,body{margin:0}body{font-family:Questrial;color:#111}section{position:relative;overflow:hidden;background:${PEACH}}
.q{position:absolute;left:30px;right:30px;text-align:center;font-family:Satisfy;color:#fff;-webkit-text-stroke:4px #fff;line-height:1.05;white-space:nowrap}
.t{position:absolute;left:70px;right:70px;text-align:center;font-size:42px;line-height:1.35;letter-spacing:.5px}`;
let SOAP, BAR;

// bar.png is the whole 2000px photo canvas: the bar spans x 12-84%, y 4.5-94%
const bar = (w, cx, top, rot = 0) => { const cw = w / 0.72; return `<img src="${BAR}" style="position:absolute;width:${cw}px;left:${cx - 0.48 * cw}px;top:${top - 0.045 * cw}px;transform:rotate(${rot}deg)">`; };
// a crop of the photo (x, y, w in soap.webp pixels) shown as a photo of W×H
const crop = (x, y, w, W, H, top) => { const s = W / w; return `<div style="position:absolute;left:${(1080 - W) / 2}px;top:${top}px;width:${W}px;height:${H}px;border-radius:18px;box-shadow:0 18px 40px rgba(120,60,50,.22);background:url(${SOAP}) no-repeat;background-size:${2000 * s}px;background-position:${-x * s}px ${-y * s}px"></div>`; };
const q = (t, top, size = 150) => `<div class=q style="top:${top}px;font-size:${size}px">${t}</div>`;
const t = (s, top, size = 42) => `<div class=t style="top:${top}px;font-size:${size}px">${s}</div>`;
const slide = (inner) => `<section style="width:1080px;height:1440px">${inner}</section>`;

const detail = (title, c, line) => slide(q(title, 70) + crop(c[0], c[1], c[2], 860, 960, 300) + t(line, 1300));

const SLIDES = () => [
  slide(q('Is this a painting?', 80, 132) + bar(660, 540, 330, -4) + t('Swipe to look closer', 1300)),
  detail('The sky', [560, 150, 600], 'Soft grey clouds, swirled by hand'),
  detail('The clouds', [330, 600, 500], 'Pink and peach, poured in layers'),
  detail('The sun', [640, 720, 700], 'A sun that never quite sets'),
  detail('The waves', [930, 1220, 520], 'White waves swirled through the blue'),
  detail('The sparkle', [690, 470, 330], 'A little shimmer in every swirl'),
  slide(q("It's soap!", 80) + bar(640, 540, 330, 5) + t('Handmade cold process soap', 1300)),
  slide(q('No two are alike', 80, 140) + bar(560, 540, 330) + t('Every bar is poured and swirled by hand,<br>so every sunset comes out a little different.', 1150, 40)),
  slide(q('What makes it special?', 70, 118) + bar(440, 270, 470) + [
    ['Olive Oil', 'gentle and conditioning'], ['Coconut Oil', 'makes this bar nice and bubbly'], ['Castor Oil', 'helps the lather hold'],
    ['Palm Oil', 'keeps the bar firm so it lasts through many washes'], ['Shea Butter', 'gives the suds a lotion-like quality'],
  ].map(([h, d], k) => `<div style="position:absolute;left:530px;width:500px;top:${320 + k * 205}px;text-align:center">
      <div style="font-size:50px">${h}</div><div style="font-size:33px;line-height:1.3;margin-top:8px">${d}</div></div>`).join('')
    + t('Also: water, lye, sodium lactate, micas, fragrance oil', 1340, 30)),
  slide(q('Why cold process?', 70, 140) + [
    ['The glycerin stays in', 'It forms as the oils turn into soap, and it helps hold in moisture.'],
    ['10% superfat', 'A little extra oil stays in the bar as oil, not soap.'],
    ['No lye left', 'The lye is all used up turning the oils into soap.'],
  ].map(([h, d], k) => `<div style="position:absolute;left:110px;right:110px;top:${330 + k * 330}px;text-align:center">
      <div style="font-size:54px">${h}</div><div style="font-size:38px;line-height:1.35;margin-top:14px">${d}</div></div>`).join('')),
  slide(q('What does it smell like?', 70, 112) + bar(500, 540, 300, -6) + t('Coconut Water | Apple', 1000, 56)
    + t('Light, clean, with a hint of sweetness', 1090, 38) + t('Comment <b>SUNSET</b> for the link to get yours today', 1270, 40)),
];

const IMAGE = () => `<section style="width:1080px;height:1350px">${q('This is not a painting.', 70, 118)}${bar(640, 540, 290, -3)}
  <div class=t style="top:1215px">It's a bar of handmade soap.</div></section>`;

const IMAGE_CAPTION = `This is not a painting. 🌅

It's a bar of soap.

A grey sky swirled by hand, pink clouds, a sun sitting right on the horizon and a sea full of waves, all poured into one bar of handmade cold process soap.

No two bars come out the same. The swirls move a little differently every time we pour, so the sunset you get is yours alone.

It smells like coconut water and apple: light, clean, with a hint of sweetness. The kind of scent that makes a regular Tuesday shower feel like the last hour of a beach day.

Made with olive oil, coconut oil, shea butter and castor oil.

Comment SUNSET for the link to get yours today`;

const CAROUSEL_CAPTION = `Is this a painting? Look closer. 🌅

Every part of this bar is poured and swirled by hand: the grey sky, the pink clouds, the sun on the horizon and the waves underneath. Because it's done by hand, no two bars are alike.

What's inside:
Olive oil, coconut oil, palm oil, castor oil, shea butter, water, sodium hydroxide (lye), sodium lactate, micas for the colours and fragrance oil for the scent.

Wait, lye? Every true soap starts with oils plus lye. In cold process soap the lye reacts with the oils and turns them into soap, so none is left in the finished bar.

Why handmade cold process feels different:
1. The glycerin made while the soap forms stays in the bar. Glycerin is a humectant, which means it holds on to water.
2. We add 10% extra oil (superfat), so a little oil stays in the bar as oil instead of becoming soap.

The scent: coconut water and apple. Light, clean, with a hint of sweetness.

Comment SUNSET for the link to get yours today`;

async function shoot(htmls, w, h, dir, name) {
  mkdirSync(dir, { recursive: true });
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: w, height: h });
  const files = [];
  for (const [i, html] of htmls.entries()) {
    await pg.setContent(`<style>${CSS}</style>${html}`, { waitUntil: 'load', timeout: 90000 });
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => Promise.all([...document.images].map((im) => im.decode())));
    // script titles: shrink any that would run past the edges
    await pg.evaluate(() => { for (const d of document.querySelectorAll('.q')) if (d.scrollWidth > d.clientWidth) d.style.fontSize = parseFloat(getComputedStyle(d).fontSize) * d.clientWidth / d.scrollWidth + 'px'; });
    const f = path.join(dir, name(i)); await pg.screenshot({ path: f }); files.push(f);
  }
  await b.close();
  return files;
}

if (!existsSync(BARPNG)) { console.log('missing .work/bar.png: run node build.mjs reel1 once first'); process.exit(1); }
SOAP = data(path.join(HERE, 'soap.webp'), 'image/webp'); BAR = data(BARPNG, 'image/png');
const cmd = process.argv[2];
if (cmd === 'image') {
  const dir = path.join(OUT, 'image-post');
  console.log(await shoot([IMAGE()], 1080, 1350, dir, () => 'image-post.png'));
  writeFileSync(path.join(dir, 'caption.txt'), IMAGE_CAPTION);
} else if (cmd === 'carousel') {
  const dir = path.join(OUT, 'carousel-1');
  console.log(await shoot(SLIDES(), 1080, 1440, dir, (i) => `slide-${String(i + 1).padStart(2, '0')}.png`));
  writeFileSync(path.join(dir, 'caption.txt'), CAROUSEL_CAPTION);
} else console.log('usage: node stills.mjs image | carousel');
