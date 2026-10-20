// Rebrand QA (2026-10-20): node qa-rebrand.mjs <key> [<key> ...]  -> for each dist/<key>.full.html (made by preview-chrome.mjs) at 1440px and
// 375px: full-page screenshot dist/PREVIEW-rebrand-<key>-<desktop|phone>.png, sideways scroll, visible text under 15px, text failing WCAG AA
// against its nearest solid background (text over images is skipped), and whether Jost loaded. Loads the files directly (file://), no server needed.
import puppeteer from '../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((x) => existsSync(x));
const b = await puppeteer.launch({ executablePath: exe, headless: 'new', timeout: 120000 });
for (const key of process.argv.slice(2)) {
  for (const [label, w] of [['desktop', 1440], ['phone', 375]]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
    await p.goto(pathToFileURL(path.join(here, 'dist', key + '.full.html')).href, { waitUntil: 'networkidle2', timeout: 90000 }).catch((e) => errs.push('goto: ' + e.message));
    await p.evaluate(async () => { document.querySelector('.cmplz-cookiebanner')?.remove(); document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); await document.fonts.ready; await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); })))); });
    await new Promise((r) => setTimeout(r, 800));
    const res = await p.evaluate(() => {
      const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { c: v.slice(0, 3), a: v[3] === undefined ? 1 : v[3] }; };
      const lum = ([r, g, b]) => [r, g, b].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' && !/gradient\(transparent/.test(cs.backgroundImage)) return null; const c = parse(cs.backgroundColor); if (c && c.a > 0.9) return c.c; } return [255, 255, 255]; };
      const small = [], low = [], seen = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode; if (!t.textContent.trim()) continue;
        const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
        if (el.closest('script,style,noscript,template,[hidden],[aria-hidden=true],.scxg-drawer,.scxg-cd,#wpadminbar')) continue;
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        if (r.width <= 1 || r.height <= 1) continue;
        const fs = parseFloat(cs.fontSize), txt = t.textContent.trim().slice(0, 40);
        if (fs < 15) small.push(`${fs}px "${txt}" <${el.tagName.toLowerCase()} class="${el.className}">`);
        const fg = parse(cs.color), bg = bgOf(el);
        if (fg && bg) { const rr = ratio(fg.c, bg), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700); if (rr < (large ? 3 : 4.5)) low.push(`${rr.toFixed(2)} "${txt}" ${cs.color} on rgb(${bg.join(',')})`); }
      }
      return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, jost: document.fonts.check('16px Jost'), small: small.slice(0, 12), smallCount: small.length, low: low.slice(0, 12), lowCount: low.length };
    });
    await p.screenshot({ path: `${here}/dist/PREVIEW-rebrand-${key}-${label}.png`, fullPage: true });
    console.log(key, label, JSON.stringify({ ...res, errors: errs.slice(0, 3) }));
    await p.close();
  }
}
await b.close();
