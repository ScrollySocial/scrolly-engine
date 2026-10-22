// Preview only: live checkout + injected v3 CSS + new collage. Nothing is written to the site.
import { readFileSync } from 'node:fs';
const C = 'file:///C:/Users/merce/Scrolly%20Organic%20Engine/automation/carousels/';
const { launch } = await import(C + 'lib/common.mjs');
const SP = 'C:/Users/merce/AppData/Local/Temp/claude/C--Users-merce-Scrolly-Organic-Engine/93d96b48-e6a1-4159-ab1a-a0aea15388bf/scratchpad/';
const css = readFileSync(new URL('./k1co-v3-override.css', import.meta.url), 'utf8');
const img = 'data:image/png;base64,' + readFileSync(new URL('./k1-checkout-collage-v3.png', import.meta.url)).toString('base64');
const b = await launch();
for (const [w, h, n, mob, club] of [[1440, 900, 'v3-desktop', false, false], [390, 844, 'v3-phone', true, false], [1440, 900, 'v3-desktop-club', false, true]]) {
  const pg = await b.newPage();
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob });
  await pg.goto('https://scrollyseo.com/checkout/?add-to-cart=279&variation_id=583', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 6000));
  await pg.addStyleTag({ content: '.cmplz-cookiebanner,.cmplz-manage-consent,#cmplz-cookiebanner-container{display:none!important}' + css });
  await pg.evaluate((src) => { document.querySelectorAll('.k1co-collage').forEach((i) => { i.removeAttribute('srcset'); i.src = src; }); }, img);
  if (club) { await pg.evaluate(() => document.querySelector('input[name=k1co-offer][value=club]')?.click()); await new Promise((r) => setTimeout(r, 4000)); }
  await new Promise((r) => setTimeout(r, 800));
  const qa = await pg.evaluate(() => {
    const small = [];
    for (const el of document.querySelectorAll('.k1co *')) {
      const cs = getComputedStyle(el);
      if (!el.offsetParent || !el.childNodes.length || ![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
      const fs = parseFloat(cs.fontSize);
      if (fs < 15) small.push(`${fs}px ${el.className || el.tagName}: ${el.textContent.trim().slice(0, 40)}`);
    }
    return { overflow: document.documentElement.scrollWidth - window.innerWidth, small: small.slice(0, 25) };
  });
  console.log(n, JSON.stringify(qa));
  await pg.screenshot({ path: SP + n + '.png', fullPage: true });
  await pg.close();
}
await b.close();
