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
const NOTION = cfg('NOTION_BASE', 'https://api.notion.com/v1');
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
function notionHeaders() {
  return { Authorization: `Bearer ${cfg('NOTION_TOKEN')}`, 'Notion-Version': '2022-06-28' };
}
// A run-now call ({job: 'youtube'}) reaches every job node; each one only runs
// for its own job name, or when its schedule fired (no job on the item).
function isMyJob(name) {
  const job = $input.first()?.json?.job;
  return !job || job === name;
}
// ---- end shared helpers ----
