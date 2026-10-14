// Usage: node chrome/install-chrome.mjs
// Creates/updates the three private WP pages that hold the global chrome CSS, JS and logo SVG, then writes chrome/wpcode-snippet.php
// (the ONLY thing that has to be pasted into WPCode; re-run this script to push CSS/JS/logo changes — no re-paste needed).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from '../wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const idsFile = path.join(here, 'ids.json');
const ids = fs.existsSync(idsFile) ? JSON.parse(fs.readFileSync(idsFile, 'utf8')) : {};
// v3 (2026-10-03): text wordmark (serif SCROLLY). The old vector logo is assets/scrolly-wordmark.svg. The <a> around it carries aria-label="Scrolly home".
const svg = fs.readFileSync(path.join(here, 'logo.html'), 'utf8').trim();
const items = {
  // v3.css (site-wide v3 foundation: tokens, .s3 components, theme/WooCommerce layer) goes first, then the header/footer chrome,
  // then k1-account.css (My Account frame + $1K member area; must load after v3.css to win over its theme layer).
  css: ['Scrolly chrome CSS', ['v3.css', 'chrome.css', 'k1-account.css'].map((f) => fs.readFileSync(path.join(here, f), 'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '')],
  js: ['Scrolly chrome JS', fs.readFileSync(path.join(here, 'chrome.js'), 'utf8').replace(/\n\s*/g, '')],
  logo: ['Scrolly chrome logo', svg],
};
for (const [k, [title, content]] of Object.entries(items)) {
  const body = JSON.stringify({ title, content, status: 'private', slug: 'scrolly-chrome-' + k, comment_status: 'closed' });
  const r = ids[k] ? await wp(`/wp-json/wp/v2/pages/${ids[k]}`, { method: 'POST', body }) : await wp('/wp-json/wp/v2/pages', { method: 'POST', body });
  if (!r.json.id) throw new Error(k + ' failed ' + JSON.stringify(r.json).slice(0, 200));
  ids[k] = r.json.id;
  console.log(k, r.json.id, r.status, r.json.status, (r.json.content?.raw || '').length);
}
fs.writeFileSync(idsFile, JSON.stringify(ids, null, 1));
const tpl = fs.readFileSync(path.join(here, 'snippet.php.tpl'), 'utf8').replace('__CSS_ID__', ids.css).replace('__JS_ID__', ids.js).replace('__LOGO_ID__', ids.logo);
fs.writeFileSync(path.join(here, 'wpcode-snippet.php'), tpl);
fs.writeFileSync(path.join(here, '.lint.php'), '<?php\n' + tpl);
console.log('snippet written,', tpl.length, 'bytes');
