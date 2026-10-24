// A demo dashboard for looking at the kit with someone else's brand (no real accounts): the
// made-up "Bloom Studio" shop from demo/seed.mjs, the same data as the public demo.
//   node test/demo-inbox.mjs        → http://localhost:5697/inbox  (no login; nothing is saved)
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seed } from '../demo/seed.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'chatmgr-demo-'));
const cfg = join(tmp, 'config');
const data = join(tmp, 'data');
seed(cfg, data);
const child = spawn(process.execPath, [join(ROOT, 'inbox', 'server.mjs')], {
  env: { ...process.env, PORT: '5697', DATA_DIR: data, CONFIG_DIR: cfg, INBOX_API_SECRET: 'demo-secret', INBOX_SETUP_CODE: 'demo-code', INBOX_SECURE_COOKIE: 'false', INBOX_DEMO: 'true', DEMO_BUY_URL: process.env.DEMO_BUY_URL || '', N8N_HOST: 'bloomstudio.duckdns.org', EMAIL_LIST: 'builtin', MAILERLITE_API_KEY: '', DMS_ENABLED: 'true', RUN_SECRET: '' },
  stdio: 'inherit',
});
console.log(`demo dashboard: http://localhost:5697/inbox (no login), data in ${tmp}`);
process.on('SIGTERM', () => child.kill());
