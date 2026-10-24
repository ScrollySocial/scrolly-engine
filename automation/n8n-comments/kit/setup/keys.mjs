// The key page: a small form on this computer only (127.0.0.1) where the buyer pastes keys.
// Claude never sees the values; they go straight into .secrets/keys.json.
//   node setup/keys.mjs DO_TOKEN DUCKDNS_TOKEN      → prints the link to open; exits after Save
//   node setup/keys.mjs --show META_VERIFY_TOKEN      → a page with that value and a Copy button,
//                                                      for pasting it into Meta (or the dashboard)
// The link carries a one-time code so no other website can post to it.
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readKeys, saveKeys } from './lib.mjs';

// What each key is and where to find it (shown on the page). Keep in step with the guide.
const FIELDS = {
  DO_TOKEN: ['DigitalOcean API token', 'DigitalOcean → API (left menu) → Generate New Token → Full Access, expiry 30 days is fine (only needed during setup and updates).'],
  DUCKDNS_TOKEN: ['DuckDNS token', 'duckdns.org, after signing in: the long "token" at the top of the page.'],
  DUCKDNS_NAME: ['DuckDNS name', 'The name you picked, without .duckdns.org (for bloomstudio.duckdns.org type bloomstudio).', 'text'],
  IG_ACCESS_TOKEN: ['Instagram access token', 'Meta app → Instagram → API setup with Instagram login → Generate token next to your account.'],
  META_APP_SECRET: ['Instagram app secret', 'Meta app → Instagram → API setup with Instagram login → step 3, "Instagram app secret" → Show.'],
  YT_API_KEY: ['YouTube API key', 'Google Cloud → APIs & Services → Credentials → your API key → Show key.'],
  YT_CLIENT_ID: ['Google OAuth client ID', 'Google Cloud → Google Auth Platform → Clients → your Desktop client → Client ID.', 'text'],
  YT_CLIENT_SECRET: ['Google OAuth client secret', 'Same client page → Client secret.'],
  APIFY_TOKEN: ['Apify API token (TikTok, optional)', 'apify.com → Settings → API & Integrations → Personal API token.'],
  TIKTOK_HANDLE: ['TikTok username (optional)', 'Without the @.', 'text'],
  MAILERLITE_API_KEY: ['MailerLite API token', 'MailerLite → Integrations → MailerLite API → Generate new token.'],
  KIT_API_KEY: ['Kit API key (v4)', 'Kit → Settings → Developer → API keys → Add a new key.'],
  MAILCHIMP_API_KEY: ['Mailchimp API key', 'Mailchimp → Profile → Extras → API keys → Create a key (it ends in -us21 or similar).'],
  BEEHIIV_API_KEY: ['beehiiv API key', 'beehiiv → Settings → Workspace settings → API → Create new API key.'],
  FLODESK_API_KEY: ['Flodesk API key', 'Flodesk → Account settings → Integrations → API keys → Create API key.'],
  LIST_WEBHOOK_URL: ['Webhook URL', 'Zapier "Catch Hook", Make "Custom webhook", an n8n Webhook node, or your tool\'s webhook address. Starts with https://', 'text'],
  ANTHROPIC_API_KEY: ['Claude API key (optional)', 'console.anthropic.com → API keys. Only for fully automatic drafts; set a spending limit there first.'],
};
// Values the kit made that the buyer pastes somewhere else; shown on this computer only.
const SHOWABLE = {
  META_VERIFY_TOKEN: ['Verify token', 'Paste it into Meta: Instagram → API setup with Instagram login → Configure webhooks → Verify token.'],
  INBOX_SETUP_CODE: ['Dashboard setup code', "Paste it on your dashboard's first visit, then choose your password."],
};
const showing = process.argv.includes('--show');
const wanted = process.argv.slice(2).filter((k) => (showing ? SHOWABLE[k] : FIELDS[k]));
if (!wanted.length) {
  console.error(`Name the keys to ask for: ${Object.keys(FIELDS).join(' ')}`);
  process.exit(1);
}
const code = randomBytes(12).toString('hex');
const PORT = Number(process.env.KEYS_PORT || 8766);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function page(msg = '') {
  const have = readKeys();
  const rows = wanted.map((k) => {
    const [label, hint, type] = FIELDS[k];
    return `<label for="${k}">${esc(label)}${have[k] ? ' <span class="ok">saved</span>' : ''}</label>
<input id="${k}" name="${k}" type="${type || 'password'}" autocomplete="off" spellcheck="false" placeholder="${have[k] ? 'Saved. Paste again only to replace it.' : 'Paste here'}">
<p class="hint">${esc(hint)}</p>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Chat Manager keys</title>
<style>body{margin:0;background:#f6f4f0;color:#1d1d1f;font:16px/1.5 system-ui,sans-serif}main{max-width:560px;margin:6vh auto;padding:0 16px}
.card{background:#fff;border-radius:18px;padding:22px}h1{font:400 1.8rem Georgia,serif;margin:0 0 6px}label{display:block;font-weight:600;margin:16px 0 4px}
input{width:100%;box-sizing:border-box;border:1px solid #8f8a83;border-radius:12px;padding:11px;font:inherit}.hint{font-size:14px;color:#55555c;margin:4px 0 0}
.ok{background:#d5ecdd;color:#1d6b40;border-radius:999px;padding:1px 9px;font-size:13px;font-weight:500}button{margin-top:20px;border:0;border-radius:999px;padding:12px 26px;background:#2f6fed;color:#fff;font:600 16px system-ui;cursor:pointer}
.msg{background:#d5ecdd;border-radius:12px;padding:12px;margin-bottom:12px}</style></head>
<body><main><div class="card">${msg ? `<p class="msg" role="status">${esc(msg)}</p>` : ''}<h1>Paste your keys</h1>
<p class="hint">They're saved on this computer only (the kit's .secrets folder) and sent to your own server during setup. Nobody else sees them, Claude included.</p>
<form method="post" action="/${code}">${rows}<button type="submit">Save</button></form></div></main></body></html>`;
}

function showPage() {
  const have = readKeys();
  const rows = wanted.map((k) => `<label>${esc(SHOWABLE[k][0])}</label><div class="row"><input readonly value="${esc(have[k] || '(not made yet: run node setup/cm.mjs env)')}" id="${k}"><button type="button" onclick="navigator.clipboard.writeText(document.getElementById('${k}').value);this.textContent='Copied'">Copy</button></div><p class="hint">${esc(SHOWABLE[k][1])}</p>`).join('');
  return page().replace(/<h1>[\s\S]*<\/form>/, `<h1>Copy and paste</h1>${rows}<p class="hint">Close this tab when you're done.</p>`).replace('</style>', '.row{display:flex;gap:8px}.row button{margin:0}</style>');
}
const server = http.createServer((req, res) => {
  if (req.url !== `/${code}`) return res.writeHead(404).end('Not found');
  if (showing) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(showPage());
    return setTimeout(() => process.exit(0), 120e3).unref?.();
  }
  if (req.method === 'GET') return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(page());
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 5e4) req.destroy();
  });
  req.on('end', () => {
    const form = Object.fromEntries(new URLSearchParams(raw));
    const change = {};
    for (const k of wanted) {
      let v = String(form[k] || '').trim();
      if (!v) continue;
      if (k === 'DUCKDNS_NAME') v = v.replace(/\.duckdns\.org$/i, '').toLowerCase();
      if (k === 'TIKTOK_HANDLE') v = v.replace(/^@/, '');
      change[k] = v;
    }
    saveKeys(change);
    const missing = wanted.filter((k) => !readKeys()[k]);
    // Prints names only, never values.
    console.log(`SAVED     ${Object.keys(change).join(', ') || 'nothing new'}${missing.length ? ` | still empty: ${missing.join(', ')}` : ''}`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(page(missing.length ? `Saved. Still empty: ${missing.map((k) => FIELDS[k][0]).join(', ')}.` : 'All saved. You can close this tab and go back to Claude.'));
    if (!missing.length) setTimeout(() => process.exit(0), 300);
  });
});
server.listen(PORT, '127.0.0.1', () => console.log(`OPEN      http://127.0.0.1:${PORT}/${code}`));
