// Writes config/keywords.json for the n8n workflow from the one keyword list in
// automation/carousels/config/destinations.json (commentKeywords). Only keywords
// that are live AND whose DM text Mercedes approved (dmApproved) are included,
// so nothing she hasn't OK'd is ever sent. Run after editing the list, then copy
// config/keywords.json to the server (see README.md); no restart needed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = JSON.parse(readFileSync(join(root, '..', 'carousels', 'config', 'destinations.json'), 'utf8'));
const all = dest.commentKeywords || [];
const keywords = all
  .filter((k) => k.live && k.dmApproved && k.url && k.dm?.includes('{url}'))
  .map(({ keyword, url, dm }) => ({ keyword: keyword.toUpperCase(), url, dm }));

mkdirSync(join(root, 'config'), { recursive: true });
writeFileSync(join(root, 'config', 'keywords.json'), JSON.stringify({ source: 'automation/carousels/config/destinations.json', keywords }, null, 2) + '\n');
const skipped = all.filter((k) => !keywords.some((x) => x.keyword === k.keyword.toUpperCase())).map((k) => k.keyword);
console.log(`keywords.json: ${keywords.length} sendable (${keywords.map((k) => k.keyword).join(', ') || 'none'})`);
if (skipped.length) console.log(`not sent until live + dmApproved: ${skipped.join(', ')}`);
