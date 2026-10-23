// Usage: node reel-pack-zips.mjs [1498] [1500]   Re-uploads the Reel Template Pack zips (automation/reel-template-pack/
// for-upload, halloween/for-upload) as new WP media and points each product download at its new zip. Download ids and
// names stay the same, so past buyers keep access and get the new file. Old zip media stay in the library.
import fs from 'fs';
import path from 'path';
import https from 'https';
import { wp, BASE } from './wp-client.mjs';

// Big zips: fetch gives up after 5 min without response headers, so upload with node:https (no header timeout).
const env = Object.fromEntries(fs.readFileSync(path.resolve('../../automation/.env'), 'utf8').split(/\r?\n/)
  .map((l) => l.match(/^([A-Z_0-9]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')]));
const auth = 'Basic ' + Buffer.from(env.WP_LIVE_APP_USER + ':' + env.WP_LIVE_APP_PASSWORD).toString('base64');
const upload = (name, body) => new Promise((ok, fail) => {
  const req = https.request(BASE + '/wp-json/wp/v2/media', { method: 'POST', timeout: 30 * 60 * 1000, headers: { Authorization: auth,
    'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}"`, 'Content-Length': body.length } }, (res) => {
    let t = ''; res.on('data', (c) => (t += c)); res.on('end', () => { try { ok({ status: res.statusCode, json: JSON.parse(t) }); } catch { ok({ status: res.statusCode, json: t }); } });
  });
  req.on('timeout', () => req.destroy(new Error('upload timed out after 30 min'))); req.on('error', fail); req.end(body);
});

const PACK = path.resolve('../../automation/reel-template-pack');
const PRODUCTS = { 1498: { dir: 'halloween/for-upload', prefix: 'Scrolly-Halloween' }, 1500: { dir: 'for-upload', prefix: 'Scrolly-Product-Reel' } };
const d = new Date(), stamp = [d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join('');

for (const pid of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PRODUCTS)) {
  const cfg = PRODUCTS[pid], dir = path.join(PACK, cfg.dir);
  const p = (await wp(`/wp-json/wc/v3/products/${pid}`)).json;
  const zips = fs.readdirSync(dir).filter((f) => f.endsWith('.zip'));
  const downloads = [];
  for (const dl of p.downloads) {
    if (dl.name.startsWith('Shot list')) { downloads.push(dl); continue; }   // the PDF: reel-pack-shot-lists.mjs
    const tid = (dl.name.match(/\((h\d)\)/) || dl.name.match(/^(\d\d) /) || [])[1];
    const zip = zips.find((z) => z.startsWith(`Template ${tid} - `));
    if (!tid || !zip) throw new Error(`product ${pid}: no zip for download "${dl.name}"`);
    const body = fs.readFileSync(path.join(dir, zip));
    const slug = zip.replace(/^Template /, '').replace(/\.zip$/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/-+$/, '');
    const name = `${cfg.prefix}-${slug}-${stamp}.zip`;
    const up = await upload(name, body);
    if (!up.json.id) throw new Error(`upload failed for ${zip}: ${up.status} ${JSON.stringify(up.json).slice(0, 200)}`);
    const size = up.json.media_details?.filesize;
    if (size && size !== body.length) throw new Error(`${zip}: uploaded ${size} bytes, local ${body.length}`);
    console.log(`  ${pid} ${tid}: media ${up.json.id} ${(body.length / 1e6).toFixed(0)} MB ${up.json.source_url}`);
    downloads.push({ id: dl.id, name: dl.name, file: up.json.source_url });
  }
  const put = await wp(`/wp-json/wc/v3/products/${pid}`, { method: 'PUT', body: JSON.stringify({ downloads }) });
  const now = put.json.downloads || [];
  const ok = now.length === downloads.length && downloads.every((x) => now.some((n) => n.id === x.id && n.file === x.file));
  console.log(`product ${pid}: PUT ${put.status}, ${now.length} downloads, ${ok ? 'all point at the new zips' : 'MISMATCH'}`);
  if (!ok) process.exitCode = 1;
}
