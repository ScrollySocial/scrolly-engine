// Uploads each template's .pptx, ideas PDF and example strip to the live WP media library for the
// My Account Challenge Content pages (845/846). Records ids/urls in site-media.json; re-running skips
// anything already uploaded, so it is safe to resume. Usage: node deploy-site-files.mjs [ids…]
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wp } from '../../../../website/scrolly-site/wp-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
const mapFile = path.join(here, 'site-media.json');
const map = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};
const only = process.argv.slice(2).map((s) => s.toUpperCase());
const MIME = { pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', pdf: 'application/pdf', jpg: 'image/jpeg' };

async function upload(file, title) {
  const name = path.basename(file);
  const ext = name.split('.').pop();
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': MIME[ext], 'Content-Disposition': `attachment; filename="${name}"` }, body: readFileSync(file) });
  if (!r.json?.id) throw new Error(`upload failed ${name}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
  await wp(`/wp-json/wp/v2/media/${r.json.id}`, { method: 'POST', body: JSON.stringify({ title, alt_text: ext === 'jpg' ? title : '' }) });
  return { id: r.json.id, url: r.json.source_url, ...(ext === 'jpg' ? { w: r.json.media_details?.width, h: r.json.media_details?.height } : {}), kb: Math.round(statSync(file).size / 1024) };
}

for (const kind of ['carousels', 'stories', 'reels']) {
  for (const slug of readdirSync(path.join(dist, kind)).sort()) {
    const dir = path.join(dist, kind, slug);
    const id = slug.slice(0, 3).toUpperCase();
    if (only.length && !only.includes(id)) continue;
    const e = (map[id] ||= {});
    const files = readdirSync(dir);
    const jobs = {
      pptx: path.join(dir, files.find((f) => f.endsWith('-template.pptx'))),
      pdf: path.join(dir, files.find((f) => f.endsWith('-ideas.pdf'))),
      thumb: path.join(dist, 'site', 'thumbs', `${id}-example.jpg`),
    };
    for (const [k, file] of Object.entries(jobs)) {
      if (e[k]) continue;
      const label = { pptx: 'PowerPoint template', pdf: 'ideas for 8 businesses', thumb: 'finished example' }[k];
      for (let t = 1; !e[k]; t++) {
        try { e[k] = await upload(file, `$1K Challenge ${id} ${label}`); }
        catch (err) { if (t >= 4) throw err; console.log(id, k, 'retry', t, err.message); await new Promise((r) => setTimeout(r, 15000 * t)); }
      }
      writeFileSync(mapFile, JSON.stringify(map, null, 1));
      console.log(id, k, e[k].id, e[k].url);
    }
  }
}
console.log('done:', Object.keys(map).length, 'templates recorded');
