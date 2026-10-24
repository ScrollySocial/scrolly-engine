// One-time Instagram setup check, run on the laptop after the Meta app exists:
//   IG_ACCESS_TOKEN=... node scripts/instagram-setup.mjs
// (or put {"accessToken": "..."} in .secrets/instagram.json; the Chat Manager kit uses
// IG_ACCESS_TOKEN in .secrets/keys.json, CM_SECRETS overrides the folder). It prints the
// account's IG_USER_ID and turns on comment notifications for the app
// (POST /me/subscribed_apps?subscribed_fields=comments; add --with-dms for
// comments,messages). Prints no secrets.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const secrets = process.env.CM_SECRETS || join(root, '.secrets');
const file = join(secrets, 'instagram.json');
const keysFile = join(secrets, 'keys.json');
const keys = existsSync(keysFile) ? JSON.parse(readFileSync(keysFile, 'utf8')) : null;
const token = process.env.IG_ACCESS_TOKEN || keys?.IG_ACCESS_TOKEN || (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).accessToken : '');
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
if (keys) writeFileSync(keysFile, JSON.stringify({ ...keys, IG_USER_ID: String(me.user_id), IG_USERNAME: me.username }, null, 2) + '\n');
if (!['BUSINESS', 'MEDIA_CREATOR', 'CREATOR'].includes(String(me.account_type).toUpperCase())) console.log('NEEDS YOU switch the Instagram account to Professional (Creator or Business) first');

// --with-dms also turns on DM notifications (only once the privacy page covers DMs).
const fields = process.argv.includes('--with-dms') ? 'comments,messages' : 'comments';
const sub = await (
  await fetch(`${GRAPH}/me/subscribed_apps?subscribed_fields=${fields}&access_token=${encodeURIComponent(token)}`, { method: 'POST' })
).json();
console.log(sub.success ? `Notifications ON for: ${fields}` : `Notifications failed: ${JSON.stringify(sub.error || sub)}`);
