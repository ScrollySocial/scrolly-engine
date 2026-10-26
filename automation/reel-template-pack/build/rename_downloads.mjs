// Rename (2026-10-26): re-upload the Reel pack downloads without the "Scrolly-" file-name prefix, plus the rebuilt shot
// lists, and point products 1498/1500 at them. Each download keeps its id (past buyers get the new files). The zips'
// contents are unchanged (taken from the live files). Old media stay in the library.
// Usage: node build/rename_downloads.mjs <folder with the downloaded live files + index.json>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { wp } = await import(pathToFileURL(path.resolve(here, '../../../website/scrolly-site/wp-client.mjs')).href);
const dir = process.argv[2];
const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const SHOT = { 1498: path.resolve(here, '../guide/shot-list-halloween.pdf'), 1500: path.resolve(here, '../guide/shot-list-product.pdf') };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function upload(src, fname, type) {
  const stem = fname.replace(/\.[a-z]+$/, '');
  for (let i = 1; i <= 4; i++) {
    const found = (await wp(`/wp-json/wp/v2/media?search=${encodeURIComponent(stem)}&_fields=id,source_url`)).json;
    const hit = Array.isArray(found) && found.find((m) => m.source_url.endsWith('/' + fname));
    if (hit) return hit.source_url;
    try {
      const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': type, 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(src) });
      if (r.json?.id) return r.json.source_url;
      console.log(`  try ${i} ${fname}: ${r.status}`);
    } catch (e) { console.log(`  try ${i} ${fname}: ${e.message}`); }
    await sleep(20000);
  }
  throw new Error('upload failed: ' + fname);
}

for (const pid of [1498, 1500]) {
  const newFile = {};
  for (const x of index.filter((x) => x.product === pid)) {
    const isShot = x.local.toLowerCase().endsWith('.pdf');
    const fname = x.local.replace(/^Scrolly-/, '');
    const src = isShot ? SHOT[pid] : path.join(dir, x.local);
    newFile[x.id] = await upload(src, fname, isShot ? 'application/pdf' : 'application/zip');
    console.log(`${pid} uploaded ${fname}`);
  }
  const cur = (await wp(`/wp-json/wc/v3/products/${pid}`)).json;
  const dls = cur.downloads.map((d) => ({ id: d.id, name: d.name, file: newFile[d.id] || d.file }));
  const missing = cur.downloads.filter((d) => !newFile[d.id]).map((d) => d.name);
  const r = await wp(`/wp-json/wc/v3/products/${pid}`, { method: 'PUT', body: JSON.stringify({ downloads: dls }) });
  console.log(`product ${pid}: ${r.status}, ${dls.length} downloads${missing.length ? ', NOT swapped: ' + missing.join(', ') : ''}`);
}
console.log('done');
