// Rename (2026-10-29): Instagram @scrollysocial → @ambitiondepthq on the live site. Only two spots had it (checked every
// page, post and product 2026-10-29): the footer's Instagram link in the chrome JS page (538, source chrome/chrome.js) and
// the Chat Manager line in the Privacy Policy (page 64, source content/legal/privacy.html). TikTok, YouTube and X links
// keep @scrollysocial until those accounts are renamed. Backs up each page to ../backups/pages first.
// Usage: node swap-ig-handle-live.mjs [--go]   (without --go it only reports)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const go = process.argv.includes('--go');
const SWAPS = {
  538: ["'https://www.instagram.com/scrollysocial/'", "'https://www.instagram.com/ambitiondepthq/'"],
  64: ["Instagram account (@scrollysocial)", "Instagram account (@ambitiondepthq)"],
};
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(here, '..', 'backups', 'pages');

for (const [id, [from, to]] of Object.entries(SWAPS)) {
  const p = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit&_fields=id,slug,content,modified`)).json;
  const raw = p.content?.raw || '';
  const n = raw.split(from).length - 1;
  console.log(`page ${id} ${p.slug} (modified ${p.modified}): ${n} to change`);
  if (!go || n !== 1) continue;
  fs.writeFileSync(path.join(dir, `page-${id}-${stamp}.html`), raw);
  const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: raw.replace(from, to) }) });
  console.log(`   saved ${r.status}`);
}
