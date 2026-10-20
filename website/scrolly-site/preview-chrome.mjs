// Local preview with the GLOBAL chrome (header, footer, v3.css, chrome.css, k1-account.css, chrome.js) from this checkout, before anything is
// published. Never publishes. Writes dist/<key>.full.html; open them through the `website` launch config
// (http://localhost:8934/scrolly-site/dist/<key>.full.html).
//   node preview-chrome.mjs home 1k-club        built pages (run `node build.mjs ...` first), wrapped in the live header/footer markup
//   node preview-chrome.mjs --live /product/go-get-em-tiger/ /my-account/
//                                                theme-rendered live pages, with their chrome CSS/JS swapped for the local files
// The header/footer markup (real menus) is copied from a live page, cached in dist/live/. Delete that folder to refresh it.
// Rebrand art (footer ftr-*.webp, homepage earned-phone-*.webp): pages point at the WP upload URLs; until those files are uploaded the
// preview uses the copies in assets/.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
const liveDir = path.join(dist, 'live');
fs.mkdirSync(liveDir, { recursive: true });
const R = (...p) => fs.readFileSync(path.join(here, ...p), 'utf8');

async function live(urlPath) {
  const file = path.join(liveDir, urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home');
  if (fs.existsSync(file + '.html')) return fs.readFileSync(file + '.html', 'utf8');
  const r = await fetch('https://scrollyseo.com' + urlPath, { headers: { 'User-Agent': 'Mozilla/5.0 (scrolly preview)' } });
  if (!r.ok) throw new Error(urlPath + ' ' + r.status);
  const html = await r.text();
  fs.writeFileSync(file + '.html', html);
  return html;
}
// art: WP upload URL -> local file (relative to dist/)
const localArt = (s) => s.replace(/https:\/\/scrollyseo\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/(?:scrolly-)?((?:ftr-(?:sky|strips|stars)|earned-phone-(?:sky|clouds|strips)|earned-desktop3-stars|earned-muted-(?:card|strips)|shirt-1k-graphite-front-cut-clean)\.webp)/g, (m, f) => (fs.existsSync(path.join(here, 'assets', f)) ? '../assets/' + f : m));
const css = localArt(['v3.css', 'chrome.css', 'k1-account.css'].map((f) => R('chrome', f)).join('\n'));
const js = localArt(R('chrome', 'chrome.js'));
const STYLE = `<style id="scxg-css">${css}</style>`;
const SCRIPT = `<script id="scxg-js">${js}</script>`;

const args = process.argv.slice(2);
const liveMode = args[0] === '--live';
const keys = liveMode ? args.slice(1) : args;
const frame = await live('/product/go-get-em-tiger/');
const header = frame.match(/<div class="scxg scxg-head"[\s\S]*?<\/aside><\/div>/)?.[0];
const footer = frame.match(/<div class="scxg"><footer class="scxg-ftr">[\s\S]*?<\/footer><\/div>/)?.[0];
if (!header || !footer) throw new Error('could not find the live header/footer markup');

for (const k of keys) {
  let out, name;
  if (liveMode) {
    let html = await live(k);
    // swap the chrome CSS + JS for this checkout's files (Complianz may print the JS as type="text/plain"; replace the whole tag)
    html = html.replace(/<style id="scxg-css">[\s\S]*?<\/style>/, () => STYLE).replace(/<script[^>]*id="scxg-js"[^>]*>[\s\S]*?<\/script>/, () => SCRIPT);
    if (!html.includes('id="scxg-js">' + js.slice(0, 40))) html = html.replace('</body>', () => SCRIPT + '</body>');
    out = html;
    name = 'live-' + (k.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home');
  } else {
    const page = localArt(R('dist', k + '.html')).replace('<!-- wp:html -->', '').replace('<!-- /wp:html -->', '');
    out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${k} (rebrand preview, not live)</title>${STYLE}</head><body style="margin:0">${header}<main id="content">${page}</main>${footer}${SCRIPT}</body></html>`;
    name = k;
  }
  fs.writeFileSync(path.join(dist, name + '.full.html'), out);
  console.log('dist/' + name + '.full.html', (out.length / 1024).toFixed(0) + 'KB');
}
