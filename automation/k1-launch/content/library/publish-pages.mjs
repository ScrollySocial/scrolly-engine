// Publishes content/dist/carousels.html -> private page 845 and content/dist/stories.html -> private page 846
// (shown in My Account > Challenge Content). Run node ../render.mjs first. Refuses unless all 60 templates
// have a Canva link and uploaded files. Usage: node publish-pages.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wp } from '../../../../website/scrolly-site/wp-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const links = JSON.parse(readFileSync(path.join(here, 'canva-links.json'), 'utf8')).templates;
const media = JSON.parse(readFileSync(path.join(here, 'site-media.json'), 'utf8'));
const ids = [...Array(30)].flatMap((_, i) => ['C', 'S'].map((k) => k + String(i + 1).padStart(2, '0'))).concat('R01');
const missing = ids.filter((id) => !links[id]?.link || !media[id]?.pptx || !media[id]?.pdf || !media[id]?.thumb);
if (missing.length) throw new Error('not ready: ' + missing.join(' '));

for (const [id, f] of [[845, 'carousels'], [846, 'stories']]) {
  const html = readFileSync(path.join(here, '..', 'dist', f + '.html'), 'utf8');
  const n = (html.match(/canva\.link\//g) || []).length;
  const want = f === 'stories' ? 31 : 30; // stories page also carries the R01 weekly Reel series
  if (n !== want) throw new Error(`${f}.html has ${n} Canva links, expected ${want}`);
  const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: html }) });
  const back = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json;
  console.log(id, f, r.status, back.status, 'saved:', back.content.raw.trim() === html.trim());
}
