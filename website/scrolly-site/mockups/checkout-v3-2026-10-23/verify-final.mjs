// Swap the live inline k1co CSS for the rewritten snippet CSS and the new media 1679 image; screenshot. Nothing is written to the site.
import { readFileSync } from 'node:fs';
const C = 'file:///C:/Users/merce/Scrolly%20Organic%20Engine/automation/carousels/';
const { launch } = await import(C + 'lib/common.mjs');
const SP = new URL('./', import.meta.url).pathname.replace(/^//, '');
const src = readFileSync('C:/Users/merce/Scrolly Organic Engine/automation/k1-launch/php/k1-checkout.php', 'utf8');
const a = src.indexOf("body.scrolly-k1co{background"); const css = src.slice(a, src.indexOf('CSS;', a));
const b = await launch();
for (const [w, h, n, mob] of [[1440, 900, 'final-desktop', false], [390, 844, 'final-phone', true]]) {
  const pg = await b.newPage();
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob });
  await pg.goto('https://scrollyseo.com/checkout/?add-to-cart=279&variation_id=583', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 6000));
  const found = await pg.evaluate((css) => {
    const st = document.getElementById('scrolly-k1co-inline-css'); if (!st) return false;
    st.textContent = css;
    document.querySelectorAll('.k1co-collage').forEach((i) => { i.removeAttribute('srcset'); i.src = 'https://scrollyseo.com/wp-content/uploads/2026/10/k1-checkout-collage-v3.webp'; });
    return true;
  }, css);
  await pg.addStyleTag({ content: '.cmplz-cookiebanner,.cmplz-manage-consent,#cmplz-cookiebanner-container{display:none!important}' });
  await new Promise((r) => setTimeout(r, 2500));
  const qa = await pg.evaluate(() => {
    const small = [];
    for (const el of document.querySelectorAll('.k1co *')) {
      if (!el.offsetParent || ![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 15) small.push(fs + 'px ' + el.textContent.trim().slice(0, 30));
    }
    return { overflow: document.documentElement.scrollWidth - window.innerWidth, small };
  });
  console.log(n, 'styleFound', found, JSON.stringify(qa));
  await pg.screenshot({ path: SP + n + '.png', fullPage: true });
  await pg.close();
}
await b.close();
