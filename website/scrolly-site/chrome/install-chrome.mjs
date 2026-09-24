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
const svg = fs.readFileSync(path.join(here, '../assets/scrolly-wordmark.svg'), 'utf8').replace(/<svg /, '<svg role="img" aria-label="Scrolly" ');
const items = {
  css: ['Scrolly chrome CSS', fs.readFileSync(path.join(here, 'chrome.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '')],
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
