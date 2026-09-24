// One-off: upload the tiger-emoji PNG as a WP media item and set it as the
// site icon (favicon). Reuses the same Application Password auth as
// wp-client.mjs, but that helper only does JSON bodies, so this does a
// raw-binary POST for the media upload step.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASE } from './wp-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const l of fs.readFileSync(path.resolve(here, '../../automation/.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const auth = 'Basic ' + Buffer.from(env.WP_LIVE_APP_USER + ':' + env.WP_LIVE_APP_PASSWORD).toString('base64');

const imgPath = process.argv[2];
if (!imgPath) { console.error('usage: node set-favicon.mjs <path-to-png>'); process.exit(1); }
const bytes = fs.readFileSync(imgPath);

const upload = await fetch(BASE + '/wp-json/wp/v2/media', {
  method: 'POST',
  headers: {
    Authorization: auth,
    'Content-Type': 'image/png',
    'Content-Disposition': 'attachment; filename="scrolly-tiger-favicon.png"',
  },
  body: bytes,
});
const uploadJson = await upload.json();
console.log('upload status', upload.status, 'id', uploadJson.id, uploadJson.source_url || uploadJson.message);
if (!uploadJson.id) process.exit(1);

const setIcon = await fetch(BASE + '/wp-json/wp/v2/settings', {
  method: 'POST',
  headers: { Authorization: auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({ site_icon: uploadJson.id }),
});
const setIconJson = await setIcon.json();
console.log('settings status', setIcon.status, 'site_icon now', setIconJson.site_icon);
