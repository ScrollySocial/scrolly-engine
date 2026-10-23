// Usage: node reel-pack-shot-lists.mjs [1498] [1500]   Uploads each pack's shot list PDF (automation/reel-template-pack/
// guide/shot-list-<pack>.pdf, made by build/shot_list_pdf.py) as new WP media and adds or updates the product's
// "Shot list (all templates)" download. Re-running keeps the same download id, so buyers keep access to the new file.
import fs from 'fs';
import path from 'path';
import { wp, BASE } from './wp-client.mjs';

const env = Object.fromEntries(fs.readFileSync(path.resolve('../../automation/.env'), 'utf8').split(/\r?\n/)
  .map((l) => l.match(/^([A-Z_0-9]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')]));
const auth = 'Basic ' + Buffer.from(env.WP_LIVE_APP_USER + ':' + env.WP_LIVE_APP_PASSWORD).toString('base64');

const PACK = path.resolve('../../automation/reel-template-pack');
const PRODUCTS = { 1498: { pack: 'halloween', prefix: 'Scrolly-Halloween' }, 1500: { pack: 'product', prefix: 'Scrolly-Product-Reel' } };
const NAME = 'Shot list (all templates)';
const d = new Date(), stamp = [d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join('');

for (const pid of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PRODUCTS)) {
  const cfg = PRODUCTS[pid];
  const body = fs.readFileSync(path.join(PACK, 'guide', `shot-list-${cfg.pack}.pdf`));
  const r = await fetch(BASE + '/wp-json/wp/v2/media', { method: 'POST', body, headers: { Authorization: auth,
    'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${cfg.prefix}-Shot-list-${stamp}.pdf"` } });
  const up = await r.json();
  if (!up.id) throw new Error(`upload failed for ${pid}: ${r.status} ${JSON.stringify(up).slice(0, 200)}`);
  console.log(`  ${pid}: media ${up.id} ${up.source_url}`);

  const p = (await wp(`/wp-json/wc/v3/products/${pid}`)).json;
  const old = p.downloads.find((x) => x.name === NAME);
  const downloads = old ? p.downloads.map((x) => (x === old ? { ...x, file: up.source_url } : x))
    : [{ name: NAME, file: up.source_url }, ...p.downloads];
  const put = await wp(`/wp-json/wc/v3/products/${pid}`, { method: 'PUT', body: JSON.stringify({ downloads }) });
  const now = put.json.downloads || [];
  const ok = now.length === downloads.length && now.some((n) => n.name === NAME && n.file === up.source_url);
  console.log(`product ${pid}: PUT ${put.status}, ${now.length} downloads, ${ok ? 'shot list attached' : 'MISMATCH'}`);
  if (!ok) process.exitCode = 1;
}
