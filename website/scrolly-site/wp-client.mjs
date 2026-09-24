// Minimal WP REST client (Application Password from automation/.env — never printed). Throttles + retries on host 429s.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const l of fs.readFileSync(path.resolve(here, '../../automation/.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
export const BASE = env.WP_LIVE_BASE_URL.replace(/\/$/, '');
const auth = 'Basic ' + Buffer.from(env.WP_LIVE_APP_USER + ':' + env.WP_LIVE_APP_PASSWORD).toString('base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function wp(p, opts = {}) {
  for (let i = 0; i < 8; i++) {
    await sleep(900);
    const r = await fetch(BASE + p, { ...opts, headers: { Authorization: auth, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    if (r.status === 429) { await sleep(5000 * (i + 1)); continue; }
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = t; }
    return { status: r.status, json: j, headers: r.headers };
  }
  throw new Error('persistent 429 for ' + p);
}
