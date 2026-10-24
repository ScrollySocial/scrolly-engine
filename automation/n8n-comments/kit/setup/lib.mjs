// Shared bits for the Chat Manager setup helpers (keys.mjs, cm.mjs, pages.mjs).
// Keys live in one file on the buyer's computer, .secrets/keys.json, written by the key page
// (keys.mjs) and by the helpers themselves (generated secrets, the YouTube sign-in). They never
// pass through chat and never go into git.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
// In the download the helpers sit in <kit>/setup; in Mercedes's repo in automation/n8n-comments/kit/setup.
const inDownload = existsSync(join(here, '..', 'docker-compose.yml'));
export const ROOT = inDownload ? join(here, '..') : join(here, '..', '..');
// Run from Mercedes's repo, the helpers use kit/.secrets, never her own automation/n8n-comments/.secrets
// (which holds her live server's keys and .env backup).
export const SECRETS = process.env.CM_SECRETS || (inDownload ? join(ROOT, '.secrets') : join(here, '..', '.secrets'));
const KEYS = join(SECRETS, 'keys.json');
const SERVER = join(SECRETS, 'server.json');

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  renameSync(`${file}.tmp`, file);
}
export const readKeys = () => readJson(KEYS, {});
export function saveKeys(change) {
  const keys = { ...readKeys(), ...change };
  for (const [k, v] of Object.entries(keys)) if (v === '' || v == null) delete keys[k];
  writeJson(KEYS, keys);
  return keys;
}
// The server: its IP, web address, folder on the server and the SSH key that opens it.
export const readServer = () => ({ remoteDir: '/opt/chat-manager', sshKey: join(SECRETS, 'ssh', 'chat-manager'), ...readJson(SERVER, {}) });
export const saveServer = (change) => writeJson(SERVER, { ...readJson(SERVER, {}), ...change });
export const readProfile = () => readJson(join(ROOT, 'config', 'profile.json'), readJson(join(ROOT, 'config', 'profile.example.json'), {}));
export const hex = (bytes) => randomBytes(bytes).toString('hex');
// Secrets the kit makes for itself, once (kept in keys.json so a reinstall keeps them).
export function ensureGeneratedSecrets() {
  const k = readKeys();
  const add = {};
  if (!k.N8N_ENCRYPTION_KEY) add.N8N_ENCRYPTION_KEY = hex(32);
  if (!k.RUN_SECRET) add.RUN_SECRET = hex(16);
  if (!k.INBOX_API_SECRET) add.INBOX_API_SECRET = hex(24);
  if (!k.INBOX_SETUP_CODE) add.INBOX_SETUP_CODE = hex(6);
  if (!k.META_VERIFY_TOKEN) add.META_VERIFY_TOKEN = hex(16);
  return Object.keys(add).length ? saveKeys(add) : k;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Plain status lines the setup skill reads: OK / WAIT / NEEDS YOU / FAILED.
export const say = (status, text) => console.log(`${status.padEnd(9)} ${text}`);
