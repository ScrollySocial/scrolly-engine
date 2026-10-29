// ---- shared helpers (build.mjs prepends this file to every Code node) ----
// Settings come from the server's .env (see ../../.env.example). Every base URL
// is a setting so tests can point the workflow at test/mock-apis.mjs instead of
// the real Meta / Google / Apify / Anthropic / Notion APIs.
const cfg = (key, fallback = '') => {
  const v = $env[key];
  return v === undefined || v === null || String(v).trim() === '' ? fallback : String(v).trim();
};
// Test mode is ON unless COMMENTS_DRY_RUN=false: nothing is sent to Instagram or
// YouTube, the inbox rows say what would have been sent.
const DRY_RUN = cfg('COMMENTS_DRY_RUN', 'true') !== 'false';
const GRAPH = cfg('GRAPH_BASE', 'https://graph.instagram.com/v26.0');
// The comment inbox (inbox/server.mjs) on the private Docker network; it replaced Notion on 2026-10-23.
const INBOX = cfg('INBOX_BASE', 'http://inbox:3000');
// Instagram DMs are read only when DMS_ENABLED=true (switched on after the privacy page covers them).
const DMS = cfg('DMS_ENABLED') === 'true';
// State (comments seen, DMs sent, refreshed Instagram token, last errors) lives
// in one JSON file in n8n's data volume, read fresh by every node and saved when
// the node ends (build.mjs adds the save). Not workflow static data: n8n hands a
// queued run the static data from when it was triggered, so two runs close
// together overwrite each other's lists. N8N_CONCURRENCY_PRODUCTION_LIMIT=1
// keeps runs one at a time so the file never gets two writers.
const fs = require('fs');
const STATE_FILE = cfg('STATE_FILE', '/home/node/.n8n/scrolly-comments-state.json');
let state = {};
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
} catch (e) {
  state = {};
}
function saveState() {
  fs.writeFileSync(`${STATE_FILE}.tmp`, JSON.stringify(state));
  fs.renameSync(`${STATE_FILE}.tmp`, STATE_FILE);
}
const helpers = this.helpers;
const now = () => new Date().toISOString();

async function http(opts) {
  return helpers.httpRequest({ json: true, timeout: 60000, ...opts });
}
function errText(e) {
  const body = e?.response?.body ?? e?.cause?.response?.data ?? e?.description;
  const detail = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
  return `${e?.message || e}${detail ? ' ' + detail : ''}`.slice(0, 500);
}
function remember(listName, id, max = 3000) {
  state[listName] = state[listName] || {};
  state[listName][id] = now();
  const keys = Object.keys(state[listName]);
  if (keys.length > max) for (const k of keys.slice(0, keys.length - max)) delete state[listName][k];
}
function logError(where, e) {
  state.errors = [...(state.errors || []), { at: now(), where, error: errText(e) }].slice(-20);
}
// The Instagram token is refreshed weekly by the token job; the newest one lives
// in the state file, the .env value is only the starting token.
const igToken = () => state.igToken || cfg('IG_ACCESS_TOKEN');
function inbox(method, path, body) {
  return http({ method, url: `${INBOX}/inbox/api${path}`, headers: { 'x-inbox-secret': cfg('INBOX_API_SECRET') }, ...(body ? { body } : {}) });
}
// Post links and DM senders' usernames, looked up once and remembered.
// The freebie link for a DM, through the inbox's click counter (/inbox/go/<id>). In test mode, or if the
// inbox can't make one, the plain link: nobody is ever left without their freebie.
async function trackedUrl(k, kind, flowToken, plain) {
  const url = plain || k.url;
  if (DRY_RUN) return url;
  try {
    const l = await inbox('POST', '/links', { keyword: k.keyword, kind, flow: flowToken || '' });
    return `${cfg('INBOX_PUBLIC_URL', `https://${cfg('N8N_HOST', 'localhost')}`)}/inbox/go/${l.id}`;
  } catch (e) {
    logError('inbox-link', e);
    return url;
  }
}
async function igPermalink(mediaId) {
  if (!mediaId) return '';
  state.permalinks = Object.keys(state.permalinks || {}).length > 2000 ? {} : state.permalinks || {};
  if (state.permalinks[mediaId] === undefined) {
    try {
      state.permalinks[mediaId] = (await http({ method: 'GET', url: `${GRAPH}/${mediaId}`, qs: { fields: 'permalink', access_token: igToken() } })).permalink || '';
    } catch (e) {
      return '';
    }
  }
  return state.permalinks[mediaId];
}
async function igUsername(igsid) {
  state.people = Object.keys(state.people || {}).length > 2000 ? {} : state.people || {};
  if (state.people[igsid] === undefined) {
    try {
      state.people[igsid] = (await http({ method: 'GET', url: `${GRAPH}/${igsid}`, qs: { fields: 'username', access_token: igToken() } })).username || '';
    } catch (e) {
      return '';
    }
  }
  return state.people[igsid];
}
// A run-now call ({job: 'youtube'}) reaches every job node; each one only runs
// for its own job name, or when its schedule fired (no job on the item).
function isMyJob(name) {
  const job = $input.first()?.json?.job;
  return !job || job === name;
}
// YouTube posting needs a short-lived OAuth token from the saved refresh token.
async function youtubeAccessToken() {
  if (state.ytAccess && state.ytAccessUntil > Date.now() + 60000) return state.ytAccess;
  const res = await http({
    method: 'POST',
    url: cfg('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token'),
    json: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // (no URLSearchParams in n8n's Code sandbox)
    body: Object.entries({
      client_id: cfg('YT_CLIENT_ID'),
      client_secret: cfg('YT_CLIENT_SECRET'),
      refresh_token: cfg('YT_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&'),
  });
  const t = typeof res === 'string' ? JSON.parse(res) : res;
  state.ytAccess = t.access_token;
  state.ytAccessUntil = Date.now() + (t.expires_in || 3600) * 1000;
  return state.ytAccess;
}
// ---- end shared helpers ----
