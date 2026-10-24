// One-time YouTube sign-in so n8n can post the replies Mercedes approves.
// 1. In Google Cloud, create an OAuth client of type "Desktop app" and save
//    {"clientId": "...", "clientSecret": "..."} as .secrets/youtube-client.json
//    (Chat Manager kit: YT_CLIENT_ID / YT_CLIENT_SECRET in .secrets/keys.json; the refresh token
//    and the channel ID are saved back there as YT_REFRESH_TOKEN / YT_CHANNEL_ID)
// 2. node scripts/youtube-auth.mjs  -> open the printed link, sign in with the
//    YouTube channel, allow access.
// The refresh token is saved to .secrets/youtube-token.json (never printed);
// copy clientId, clientSecret and refreshToken into the server .env as
// YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const secrets = process.env.CM_SECRETS || join(root, '.secrets');
const keysFile = join(secrets, 'keys.json');
const keys = existsSync(keysFile) ? JSON.parse(readFileSync(keysFile, 'utf8')) : null;
const { clientId, clientSecret } = keys?.YT_CLIENT_ID
  ? { clientId: keys.YT_CLIENT_ID, clientSecret: keys.YT_CLIENT_SECRET }
  : JSON.parse(readFileSync(join(secrets, 'youtube-client.json'), 'utf8'));
const PORT = 8765;
const redirect = `http://127.0.0.1:${PORT}/callback`;
const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
auth.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirect,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
  access_type: 'offline',
  prompt: 'consent',
}).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') return res.end();
  const code = url.searchParams.get('code');
  if (!code) {
    res.end(`Sign-in didn't finish: ${url.searchParams.get('error') || 'no code'}`);
    return;
  }
  const t = await (
    await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirect, grant_type: 'authorization_code' }),
    })
  ).json();
  if (!t.refresh_token) {
    res.end('No refresh token came back. Run the script again.');
    console.error('No refresh token:', t.error || t);
  } else {
    mkdirSync(secrets, { recursive: true });
    writeFileSync(join(secrets, 'youtube-token.json'), JSON.stringify({ refreshToken: t.refresh_token, savedAt: new Date().toISOString() }, null, 2));
    if (keys) {
      // The channel this sign-in belongs to (the one the automation watches).
      const ch = await (await fetch('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true', { headers: { Authorization: `Bearer ${t.access_token}` } })).json();
      const channel = ch.items?.[0];
      writeFileSync(keysFile, JSON.stringify({ ...keys, YT_REFRESH_TOKEN: t.refresh_token, ...(channel ? { YT_CHANNEL_ID: channel.id } : {}) }, null, 2) + '\n');
      console.log(channel ? `Channel: ${channel.snippet.title} (${channel.id})` : 'NEEDS YOU this Google account has no YouTube channel');
    }
    res.end('YouTube is connected. You can close this tab.');
    console.log('Saved .secrets/youtube-token.json');
  }
  server.close();
});
server.listen(PORT, '127.0.0.1', () => console.log(`Open this link and sign in with your YouTube channel:\n${auth}`));
