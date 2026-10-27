// 2026-10-27: Implementation is off the site for now (not deleted). Removes its Shop menu item (197), sets page 263 to private,
// and takes its "Coming soon" card off the SEO tools page (316). Edits LIVE (page backup saved first).
// To bring it back: page 263 -> publish, re-add the menu item under Shop (328), restore the card from the backup.
// Usage: node hide-implementation.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const before = (await wp('/wp-json/wp/v2/pages/316?context=edit')).json.content.raw;
const i = before.indexOf('<article class="cat-prod"><a class="cv" href="/implementation/"');
const card = i < 0 ? '' : before.slice(i, before.indexOf('</article>', i) + '</article>'.length);
console.log('card on 316:', card ? 'found' : 'already gone');
if (!apply) process.exit(0);
const LEDE = ['Keep moving with a site audit or implementation help.', 'Find out exactly what to fix with a site audit.'];
if (card || before.includes(LEDE[0])) {
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-316-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  console.log('316', (await wp('/wp-json/wp/v2/pages/316', { method: 'POST', body: JSON.stringify({ content: (card ? before.replace(card, '') : before).replace(LEDE[0], LEDE[1]) }) })).status);
}
console.log('menu item 197', (await wp('/wp-json/wp/v2/menu-items/197?force=true', { method: 'DELETE' })).status);
console.log('page 263 private', (await wp('/wp-json/wp/v2/pages/263', { method: 'POST', body: JSON.stringify({ status: 'private' }) })).status);
