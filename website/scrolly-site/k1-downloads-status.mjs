// Read-only: list the downloadable files on the $1K Club variations (582 Club only, 583 Club + Challenge)
// and whether the /1k-club/ page (291) is published and uses the tierPage template.
import { wp } from './wp-client.mjs';
for (const v of [582, 583]) {
  const r = await wp(`/wp-json/wc/v3/products/279/variations/${v}`);
  console.log(`variation ${v}: ${r.status} downloadable=${r.json.downloadable}`);
  for (const d of r.json.downloads || []) console.log(`  - ${d.name} | ${d.file} | id ${d.id}`);
}
const p = await wp('/wp-json/wp/v2/pages/291?context=edit');
const raw = p.json.content?.raw || '';
console.log(`page 291: ${p.json.status} | modified ${p.json.modified} | has cl-prods slider: ${raw.includes('cl-prods')} | Quality Guide card: ${raw.includes('Social Media Quality Guide')}`);
