// One-time YouTube sign-in so n8n can post the replies Mercedes approves.
// 1. In Google Cloud, create an OAuth client of type "Desktop app" and save
//    {"clientId": "...", "clientSecret": "..."} as .secrets/youtube-client.json
// 2. node scripts/youtube-auth.mjs  -> open the printed link, sign in with the
//    Scrolly YouTube channel, allow access.
// The refresh token is saved to .secrets/youtube-token.json (never printed);
// copy clientId, clientSecret and refreshToken into the server .env as
// YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { clientId, clientSecret } = JSON.parse(readFileSync(join(root, '.secrets', 'youtube-client.json'), 'utf8'));
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
    mkdirSync(join(root, '.secrets'), { recursive: true });
    writeFileSync(join(root, '.secrets', 'youtube-token.json'), JSON.stringify({ refreshToken: t.refresh_token, savedAt: new Date().toISOString() }, null, 2));
    res.end('YouTube is connected. You can close this tab.');
    console.log('Saved .secrets/youtube-token.json');
  }
  server.close();
});
server.listen(PORT, '127.0.0.1', () => console.log(`Open this link and sign in with the Scrolly YouTube channel:\n${auth}`));
