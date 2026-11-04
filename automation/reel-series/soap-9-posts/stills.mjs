// The two still posts of "1 photo of soap, 9 posts", both made only from soap.webp (her sunset bar):
//   node stills.mjs image      image post, 1080×1350
//   node stills.mjs carousel   carousel 1 "up close", 1080×1440 slides: the bar's details one per slide, the whole bar,
//                              ingredients, why cold process, scent + comment SUNSET
// Look = her pick 2026-11-04, @chalkevalleysoaps: the photo fills the frame (darkened a little) with a big elegant white
// serif, one word in italic; text slides are a solid muted colour with a lighter-tint heading. No cut-outs, no script.
// The bar's face alone is about 4:5, so the whole bar fills the image post edge to edge, like a painting.
// Writes PNGs + caption.txt to <exports>/soap-9-posts/image-post/ and carousel-1/.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, launch } from '../../reel-hf/lib/settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(P.exports, 'soap-9-posts');
const SOAP = `data:image/webp;base64,${readFileSync(path.join(HERE, 'soap.webp')).toString('base64')}`;
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..500;1,9..144,300..500&display=block');
*{box-sizing:border-box}html,body{margin:0}body{font-family:Fraunces;font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 0;color:#fff}
section{position:relative;overflow:hidden}i{font-weight:500}
.c{position:absolute;left:80px;right:80px;text-align:center;font-weight:400;line-height:1.08;letter-spacing:-1px;text-shadow:0 2px 30px rgba(30,20,20,.35)}
.caps{font-size:46px;letter-spacing:4px;margin-top:28px;font-weight:400}
`;

// the photo of the bar (x, y, w in soap.webp pixels) filling a W×H frame, with a soft dark wash
const photo = (x, y, w, W, H, dim = 0.3) => { const s = W / w; return `background:linear-gradient(rgba(25,18,22,${dim}),rgba(25,18,22,${dim})),url(${SOAP}) no-repeat;background-size:auto,${2000 * s}px;background-position:0 0,${-x * s}px ${-y * s}px`; };
const S34 = (x, y, w, inner, dim) => `<section style="width:1080px;height:1440px;${photo(x, y, w, 1080, 1440, dim)}">${inner}</section>`;
const centre = (html, size, top = null) => `<div class=c style="${top == null ? 'top:50%;transform:translateY(-50%)' : `top:${top}px`};font-size:${size}px">${html}</div>`;
// muted grounds taken from the bar, each with a lighter tint for headings
const G = { blue: ['#7E95A2', '#CBD8DF'], rose: ['#B88F8C', '#EED6D2'], sand: ['#B29C82', '#EADFCF'] };
const flat = ([bg, tint], head, body, size = 62) => `<section style="width:1080px;height:1440px;background:${bg};display:flex;flex-direction:column;justify-content:center;padding:0 96px 60px">
  <div style="color:${tint};font-weight:400;font-size:140px;line-height:1;letter-spacing:-1px">${head}</div>
  <div style="font-weight:400;font-size:${size}px;line-height:1.28;margin-top:56px">${body}</div></section>`;

// whole bar face (inside its edges): about 1185 px wide from x 390
const SLIDES = () => [
  S34(390, 180, 1185, centre('This is not<br>a <i>painting</i>.<div class=caps>(IT’S A BAR OF SOAP)</div>', 124), 0.32),
  S34(560, 150, 600, centre('A grey sky,<br>swirled by <i>hand</i>.', 104), 0.25),
  S34(330, 600, 500, centre('Pink clouds,<br>poured in <i>layers</i>.', 104), 0.25),
  S34(640, 720, 700, centre('A sun that never<br>quite <i>sets</i>.', 104), 0.25),
  S34(930, 1200, 520, centre('Waves you can<br>actually <i>lather</i>.', 104), 0.25),
  S34(690, 470, 330, centre('A little <i>shimmer</i><br>in every swirl.', 104), 0.25),
  S34(390, 180, 1185, centre('No two bars<br>are ever <i>alike</i>.<div class=caps>(EACH ONE IS SWIRLED BY HAND)</div>', 112), 0.32),
  flat(G.blue, 'What’s inside', `Olive oil, coconut oil, palm oil, castor oil and shea butter.<br><br>
    Plus water, sodium hydroxide (lye), sodium lactate, micas for the colour and fragrance oil for the scent.`),
  flat(G.rose, 'Why cold<br>process?', `<i>The glycerin stays in.</i> It forms as the oils turn into soap, and it helps hold in moisture.<br><br>
    <i>10% superfat.</i> A little extra oil stays in the bar as oil.<br><br><i>No lye left.</i> It’s all used up making the soap.`),
  flat(G.sand, 'The scent', `Pineapple, coconut water, apple and thyme.<br><br>Light, clean, with a hint of sweetness.`, 76),
  S34(640, 720, 700, centre('Comment<br><i>SUNSET</i><div class=caps>FOR THE LINK TO GET YOURS TODAY</div>', 150), 0.35),
];

// image post: the whole bar face, edge to edge
const IMAGE = () => `<section style="width:1080px;height:1350px;${photo(390, 240, 1185, 1080, 1350, 0)}">
  <div style="position:absolute;inset:0;background:linear-gradient(rgba(25,18,22,0) 55%,rgba(25,18,22,.45))"></div>
  ${centre('This is not a <i>painting</i>.', 92, 1150)}</section>`;

const IMAGE_CAPTION = `This is not a painting. 🌅

It's a bar of soap.

A grey sky swirled by hand, pink clouds, a sun sitting right on the horizon and a sea full of waves, all poured into one bar of handmade cold process soap.

No two bars come out the same. The swirls move a little differently every time we pour, so the sunset you get is yours alone.

It smells like pineapple, coconut water, apple and thyme: light, clean, with a hint of sweetness. The kind of scent that makes a regular Tuesday shower feel like the last hour of a beach day.

Made with olive oil, coconut oil, shea butter and castor oil.

Comment SUNSET for the link to get yours today`;

const CAROUSEL_CAPTION = `This is not a painting. Look closer. 🌅

Every part of this bar is poured and swirled by hand: the grey sky, the pink clouds, the sun on the horizon and the waves underneath. Because it's done by hand, no two bars are alike.

What's inside:
Olive oil, coconut oil, palm oil, castor oil, shea butter, water, sodium hydroxide (lye), sodium lactate, micas for the colours and fragrance oil for the scent.

Wait, lye? Every true soap starts with oils plus lye. In cold process soap the lye reacts with the oils and turns them into soap, so none is left in the finished bar.

Why handmade cold process feels different:
1. The glycerin made while the soap forms stays in the bar. Glycerin is a humectant, which means it holds on to water.
2. We add 10% extra oil (superfat), so a little oil stays in the bar as oil instead of becoming soap.

The scent: pineapple, coconut water, apple and thyme. Light, clean, with a hint of sweetness.

Comment SUNSET for the link to get yours today`;

async function shoot(htmls, w, h, dir, name) {
  mkdirSync(dir, { recursive: true });
  const b = await launch(), pg = await b.newPage();
  await pg.setViewport({ width: w, height: h });
  const files = [];
  for (const [i, html] of htmls.entries()) {
    await pg.setContent(`<style>${CSS}</style>${html}`, { waitUntil: 'load', timeout: 90000 });
    await pg.evaluate(() => document.fonts.ready);
    const f = path.join(dir, name(i)); await pg.screenshot({ path: f }); files.push(f);
  }
  await b.close();
  return files;
}

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
