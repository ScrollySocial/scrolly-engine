// One-time Instagram setup check, run on the laptop after the Meta app exists:
//   IG_ACCESS_TOKEN=... node scripts/instagram-setup.mjs
// (or put {"accessToken": "..."} in .secrets/instagram.json). It prints the
// account's IG_USER_ID and turns on comment notifications for the app
// (POST /me/subscribed_apps?subscribed_fields=comments; add --with-dms for
// comments,messages). Prints no secrets.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, '.secrets', 'instagram.json');
const token = process.env.IG_ACCESS_TOKEN || (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).accessToken : '');
const GRAPH = process.env.GRAPH_BASE || 'https://graph.instagram.com/v26.0';
if (!token) {
  console.error('No token: set IG_ACCESS_TOKEN or create .secrets/instagram.json');
  process.exit(1);
}

const me = await (await fetch(`${GRAPH}/me?fields=user_id,username,account_type&access_token=${encodeURIComponent(token)}`)).json();
if (me.error) {
  console.error('Token check failed:', me.error.message);
  process.exit(1);
}
console.log(`Account: @${me.username} (${me.account_type})`);
console.log(`IG_USER_ID=${me.user_id}`);

// --with-dms also turns on DM notifications (only once the privacy page covers DMs).
const fields = process.argv.includes('--with-dms') ? 'comments,messages' : 'comments';
const sub = await (
  await fetch(`${GRAPH}/me/subscribed_apps?subscribed_fields=${fields}&access_token=${encodeURIComponent(token)}`, { method: 'POST' })
).json();
console.log(sub.success ? `Notifications ON for: ${fields}` : `Notifications failed: ${JSON.stringify(sub.error || sub)}`);
