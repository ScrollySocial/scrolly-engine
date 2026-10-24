// Chat Manager server helper, run by the setup skill from the kit folder:
//   node setup/cm.mjs set EMAIL_LIST=kit DMS_ENABLED=true   saves choices (host=… ownDomain=true too)
//   node setup/cm.mjs check-token          DigitalOcean token works, account can make a server
//   node setup/cm.mjs create [region]      makes the $6 server (SSH key, Docker, firewall, swap)
//   node setup/cm.mjs address              points yourname.duckdns.org at the server
//   node setup/cm.mjs env                  writes .secrets/server.env from .env.example + your keys
//   node setup/cm.mjs install              uploads the kit, starts it, imports + publishes the workflow
//   node setup/cm.mjs push-env             sends a changed .env (new key, DMs on, test mode off) and restarts
//   node setup/cm.mjs push-config          sends config/ (profile, pages) without a restart
//   node setup/cm.mjs check                HTTPS, dashboard, n8n status, test mode, last errors
//   node setup/cm.mjs update               backs up, uploads new code, keeps your data and keys, checks
//   node setup/cm.mjs backup               copies settings, keys and the inbox to .secrets/backups
//   node setup/cm.mjs editor               opens an SSH tunnel to the n8n editor (localhost:5678)
//   node setup/cm.mjs delete-server --yes  deletes the server (only for the test install)
// Lines start with OK / WAIT / NEEDS YOU / FAILED so the skill knows what happened. No secrets printed.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, SECRETS, readKeys, saveKeys, readServer, saveServer, readProfile, ensureGeneratedSecrets, sleep, say } from './lib.mjs';

const DO = 'https://api.digitalocean.com/v2';
const WORKFLOW_ID = 'ScrollyComments1';
const [cmd, ...args] = process.argv.slice(2);

async function doApi(method, path, body) {
  const token = readKeys().DO_TOKEN;
  if (!token) throw new Error('No DigitalOcean token yet: run node setup/keys.mjs DO_TOKEN');
  const res = await fetch(`${DO}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`DigitalOcean answered ${res.status}: ${data.message || data.id || ''}`);
  return data;
}
function run(bin, argv, opts = {}) {
  const r = spawnSync(bin, argv, { encoding: 'utf8', maxBuffer: 64e6, ...opts });
  if (r.error) throw new Error(`${bin} didn't run: ${r.error.message}`);
  return r;
}
const host = () => readServer().host || (readKeys().DUCKDNS_NAME ? `${readKeys().DUCKDNS_NAME}.duckdns.org` : '');
function sshArgs() {
  const s = readServer();
  return ['-i', s.sshKey, '-o', 'StrictHostKeyChecking=accept-new', '-o', `UserKnownHostsFile=${join(SECRETS, 'ssh', 'known_hosts')}`, '-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes'];
}
// Runs a shell command on the server; input (a string or Buffer) goes to its stdin.
function ssh(command, input) {
  const s = readServer();
  if (!s.ip) throw new Error('No server yet: run node setup/cm.mjs create');
  return run('ssh', [...sshArgs(), `root@${s.ip}`, command], { input });
}
function sshOk(command, input, what) {
  const r = ssh(command, input);
  if (r.status !== 0) throw new Error(`${what} failed on the server: ${(r.stderr || r.stdout).trim().split('\n').slice(-3).join(' | ')}`);
  return r.stdout;
}
// The kit's code as a tar.gz: what goes to the server (never .secrets, tests, the guide or config data).
function codeArchive({ withConfig }) {
  const list = ['Caddyfile', 'docker-compose.yml', 'inbox', 'workflow', 'templates'].filter((p) => existsSync(join(ROOT, p)));
  if (withConfig) list.push('config');
  const out = join(SECRETS, 'upload.tgz');
  const r = run('tar', ['-czf', out, '--exclude=node_modules', '--exclude=*.tmp', ...list], { cwd: ROOT });
  if (r.status !== 0) throw new Error(`tar failed: ${r.stderr}`);
  return readFileSync(out);
}

async function checkToken() {
  const { account } = await doApi('GET', '/account');
  if (account.status !== 'active') return say('NEEDS YOU', `DigitalOcean account status is "${account.status}" (${account.status_message || 'finish sign-up and add a card'})`);
  say('OK', `DigitalOcean token works (${account.email}), room for ${account.droplet_limit} servers`);
}

async function create(region = 'nyc1') {
  const s = readServer();
  if (s.dropletId) {
    const d = await doApi('GET', `/droplets/${s.dropletId}`).catch(() => null);
    if (d) return say('OK', `Server already exists: ${s.ip} (${d.droplet.status})`);
  }
  // An SSH key made on this computer opens the server; DigitalOcean only gets the public half.
  const keyFile = s.sshKey;
  mkdirSync(join(SECRETS, 'ssh'), { recursive: true });
  if (!existsSync(keyFile)) {
    const r = run('ssh-keygen', ['-t', 'ed25519', '-N', '', '-C', 'chat-manager', '-f', keyFile]);
    if (r.status !== 0) throw new Error(`ssh-keygen failed: ${r.stderr}`);
  }
  const pub = readFileSync(`${keyFile}.pub`, 'utf8').trim();
  const keys = (await doApi('GET', '/account/keys?per_page=200')).ssh_keys || [];
  const fingerprint = run('ssh-keygen', ['-E', 'md5', '-lf', `${keyFile}.pub`]).stdout.split(' ')[1]?.replace(/^MD5:/, '');
  let key = keys.find((k) => k.fingerprint === fingerprint || k.public_key.trim() === pub);
  if (!key) key = (await doApi('POST', '/account/keys', { name: 'Chat Manager', public_key: pub })).ssh_key;
  // First boot: Docker, firewall (SSH, web only), 1 GB swap so n8n has room on the 1 GB server.
  const userData = `#cloud-config
package_update: true
runcmd:
  - curl -fsSL https://get.docker.com | sh
  - ufw allow OpenSSH
  - ufw allow 80
  - ufw allow 443
  - ufw --force enable
  - fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
  - mkdir -p ${s.remoteDir}
`;
  const { droplet } = await doApi('POST', '/droplets', { name: 'chat-manager', region, size: 's-1vcpu-1gb', image: 'ubuntu-24-04-x64', ssh_keys: [key.id], user_data: userData, tags: ['chat-manager'], monitoring: true });
  saveServer({ dropletId: droplet.id, region });
  say('WAIT', `Server ordered in ${region}; waiting for its address…`);
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const d = (await doApi('GET', `/droplets/${droplet.id}`)).droplet;
    const ip = d.networks?.v4?.find((n) => n.type === 'public')?.ip_address;
    if (d.status === 'active' && ip) {
      saveServer({ ip });
      return say('OK', `Server is up: ${ip} ($6/month, 1 GB, Ubuntu 24.04). Docker installs in the next few minutes.`);
    }
  }
  say('FAILED', 'The server took more than 5 minutes to start. Check DigitalOcean → Droplets.');
}

async function address() {
  const k = readKeys();
  const s = readServer();
  if (s.ownDomain) {
    const ips = await import('node:dns').then((dns) => dns.promises.resolve4(s.host).catch(() => []));
    return ips.includes(s.ip) ? say('OK', `${s.host} points at ${s.ip}`) : say('NEEDS YOU', `Add an A record: ${s.host} → ${s.ip} (at your domain company), then run this again`);
  }
  if (!k.DUCKDNS_TOKEN || !k.DUCKDNS_NAME) return say('NEEDS YOU', 'DuckDNS token and name: node setup/keys.mjs DUCKDNS_NAME DUCKDNS_TOKEN');
  const res = await fetch(`https://www.duckdns.org/update?domains=${encodeURIComponent(k.DUCKDNS_NAME)}&token=${encodeURIComponent(k.DUCKDNS_TOKEN)}&ip=${s.ip}`);
  const text = (await res.text()).trim();
  if (text !== 'OK') return say('FAILED', `DuckDNS said "${text}" (KO means the name or token is wrong; the name must already be added on duckdns.org)`);
  saveServer({ host: `${k.DUCKDNS_NAME}.duckdns.org` });
  say('OK', `${k.DUCKDNS_NAME}.duckdns.org points at ${s.ip}`);
}

// .env for the server: .env.example with the buyer's values filled in. Anything not set stays
// as in the example (empty = that part off).
function buildEnv() {
  const k = ensureGeneratedSecrets();
  const s = readServer();
  const h = host();
  if (!h) throw new Error('No web address yet: run node setup/cm.mjs address');
  const tz = s.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const yt = (() => {
    try {
      return JSON.parse(readFileSync(join(SECRETS, 'youtube-token.json'), 'utf8')).refreshToken;
    } catch {
      return '';
    }
  })();
  const values = {
    N8N_HOST: h,
    N8N_WEBHOOK_URL: `https://${h}/`,
    N8N_EDITOR_BASE_URL: `https://${h}/`,
    INBOX_PUBLIC_URL: `https://${h}`,
    GENERIC_TIMEZONE: tz,
    TZ: tz,
    ...Object.fromEntries(Object.entries(k).filter(([key]) => /^[A-Z][A-Z0-9_]+$/.test(key) && !['DO_TOKEN', 'DUCKDNS_TOKEN', 'DUCKDNS_NAME'].includes(key))),
    ...(yt && !k.YT_REFRESH_TOKEN ? { YT_REFRESH_TOKEN: yt } : {}),
    ...(s.settings || {}),
  };
  const lines = readFileSync(join(ROOT, '.env.example'), 'utf8').split(/\r?\n/);
  const seen = new Set();
  const out = lines.map((line) => {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!m) return line;
    seen.add(m[1]);
    return m[1] in values ? `${m[1]}=${String(values[m[1]]).replace(/[\r\n]/g, '')}` : line;
  });
  for (const [key, v] of Object.entries(values)) if (!seen.has(key)) out.push(`${key}=${String(v).replace(/[\r\n]/g, '')}`);
  const text = out.join('\n');
  writeFileSync(join(SECRETS, 'server.env'), text, { mode: 0o600 });
  return text;
}

async function waitForSsh() {
  for (let i = 0; i < 60; i++) {
    const r = ssh('cloud-init status --wait >/dev/null 2>&1; command -v docker >/dev/null && echo ready');
    if (r.status === 0 && r.stdout.includes('ready')) return;
    await sleep(5000);
  }
  throw new Error('The server is not reachable over SSH after 5 minutes');
}
async function waitFor(what, test, tries = 60, ms = 5000) {
  for (let i = 0; i < tries; i++) {
    if (await test().catch(() => false)) return true;
    await sleep(ms);
  }
  throw new Error(`${what} didn't come up in time`);
}
function publishWorkflow() {
  const dir = readServer().remoteDir;
  sshOk(`cd ${dir} && for i in $(seq 1 60); do docker compose logs n8n 2>&1 | grep -q "Editor is now accessible" && break; sleep 3; done && docker compose exec -T n8n n8n import:workflow --input=/data/workflow/scrolly-comments.json && docker compose exec -T n8n n8n publish:workflow --id=${WORKFLOW_ID} && docker compose restart n8n`, undefined, 'Importing the workflow');
}

async function install() {
  const s = readServer();
  const h = host();
  say('WAIT', 'Waiting for the server to finish installing Docker…');
  await waitForSsh();
  if (!existsSync(join(ROOT, 'config', 'profile.json'))) throw new Error('No config/profile.json yet: the setup skill writes it from your answers first');
  const env = buildEnv();
  sshOk(`mkdir -p ${s.remoteDir} && cd ${s.remoteDir} && tar -xzf - && test -f config/keywords-all.json || echo '{"keywords":[]}' > config/keywords-all.json`, codeArchive({ withConfig: true }), 'Uploading the kit');
  sshOk(`cd ${s.remoteDir} && umask 077 && cat > .env && docker compose up -d`, env, 'Starting Chat Manager');
  say('WAIT', 'Started. Importing the workflow (n8n takes a minute the first time)…');
  publishWorkflow();
  await waitFor('HTTPS', async () => (await fetch(`https://${h}/inbox/health`)).ok, 36);
  say('OK', `Chat Manager is running at https://${h}/inbox`);
  await check();
}

async function pushEnv() {
  const s = readServer();
  sshOk(`cd ${s.remoteDir} && umask 077 && cat > .env && docker compose up -d`, buildEnv(), 'Updating settings');
  say('OK', 'Settings sent; Chat Manager restarted with them');
}
async function pushConfig() {
  const s = readServer();
  const r = run('tar', ['-czf', join(SECRETS, 'config.tgz'), '--exclude=keywords-all.json', '--exclude=keywords.json', '--exclude=settings.json', 'config'], { cwd: ROOT });
  if (r.status !== 0) throw new Error(r.stderr);
  sshOk(`cd ${s.remoteDir} && tar -xzf -`, readFileSync(join(SECRETS, 'config.tgz')), 'Sending config');
  say('OK', 'Profile and pages sent (keywords and the welcome message on the server were kept)');
}

async function check() {
  const h = host();
  const k = readKeys();
  let bad = 0;
  const step = async (label, fn) => {
    try {
      const note = await fn();
      say('OK', `${label}${note ? `: ${note}` : ''}`);
    } catch (e) {
      bad++;
      say('FAILED', `${label}: ${e.message}`);
    }
  };
  await step('HTTPS and dashboard', async () => {
    const r = await fetch(`https://${h}/inbox/health`);
    if (!r.ok) throw new Error(`answered ${r.status}`);
    return `https://${h}/inbox`;
  });
  await step('Privacy page', async () => {
    const r = await fetch(`https://${h}/privacy`);
    if (!r.ok) throw new Error(`answered ${r.status} (the skill writes it from templates/privacy.html)`);
    return `https://${h}/privacy`;
  });
  await step('n8n editor is not public', async () => {
    const r = await fetch(`https://${h}/rest/settings`);
    if (r.status !== 404) throw new Error(`answered ${r.status}; Caddyfile should only expose /webhook, /inbox and the pages`);
  });
  await step('Instagram webhook check (Meta verify)', async () => {
    const r = await fetch(`https://${h}/webhook/instagram?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(k.META_VERIFY_TOKEN || '')}&hub.challenge=42`);
    if ((await r.text()).trim() !== '42') throw new Error(`answered ${r.status}: the workflow isn't published yet`);
  });
  await step('n8n status', async () => {
    const r = await fetch(`https://${h}/webhook/comments-status`, { headers: { 'x-run-secret': k.RUN_SECRET || '' } });
    const st = await r.json();
    if (st.error) throw new Error(st.error);
    const errors = st.errors || [];
    return `test mode ${st.testMode ? 'ON (nothing is sent)' : 'off'}${errors.length ? `, ${errors.length} recent error(s), last: ${String(errors.at(-1)?.error || '').slice(0, 160)}` : ', no errors'}`;
  });
  if (bad) process.exitCode = 1;
}

async function backup() {
  const s = readServer();
  const dir = join(SECRETS, 'backups', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
  mkdirSync(dir, { recursive: true });
  const get = (command, file) => {
    const r = ssh(command);
    if (r.status === 0) writeFileSync(join(dir, file), r.stdout, { mode: 0o600 });
    return r.status === 0;
  };
  // Binary-safe: tar comes back base64.
  const cfg = ssh(`cd ${s.remoteDir} && tar -czf - config .env | base64 -w0`);
  if (cfg.status === 0) writeFileSync(join(dir, 'config-and-env.tgz'), Buffer.from(cfg.stdout, 'base64'), { mode: 0o600 });
  get(`cd ${s.remoteDir} && docker compose exec -T inbox cat /data/inbox.json`, 'inbox.json');
  get(`cd ${s.remoteDir} && docker compose exec -T n8n cat /home/node/.n8n/scrolly-comments-state.json`, 'n8n-state.json');
  const kept = readdirSync(dir);
  say(kept.length >= 2 ? 'OK' : 'FAILED', `Backup in .secrets/backups/${dir.split(/[\\/]/).pop()} (${kept.join(', ')})`);
  return dir;
}

async function update() {
  const s = readServer();
  const h = host();
  const before = await fetch(`https://${h}/inbox/health`).then((r) => r.ok).catch(() => false);
  if (!before) say('NEEDS YOU', `https://${h} isn't answering before the update; updating anyway`);
  await backup();
  // New code only; config/ on the server (profile, pages, keywords, welcome) stays. New settings
  // in .env.example are added to the server's .env with their defaults; existing values are kept.
  sshOk(`cd ${s.remoteDir} && tar -xzf -`, codeArchive({ withConfig: false }), 'Uploading the new version');
  const example = readFileSync(join(ROOT, '.env.example'), 'utf8');
  sshOk(`cd ${s.remoteDir} && cat > .env.example && touch .env && while IFS= read -r line; do case "$line" in [A-Z]*=*) k="\${line%%=*}"; grep -q "^$k=" .env || echo "$line" >> .env;; esac; done < .env.example && docker compose up -d`, example, 'Restarting with the new version');
  publishWorkflow();
  await waitFor('HTTPS', async () => (await fetch(`https://${h}/inbox/health`)).ok, 36);
  say('OK', 'Updated. Your keywords, inbox, email list, settings and keys were kept.');
  await check();
}

function editor() {
  const s = readServer();
  say('OK', 'n8n editor: open http://localhost:5678 while this runs (Ctrl+C to close the tunnel)');
  spawn('ssh', [...sshArgs().slice(0, -2), '-N', '-L', '5678:127.0.0.1:5678', `root@${s.ip}`], { stdio: 'inherit' });
}

async function deleteServer() {
  if (!args.includes('--yes')) return say('NEEDS YOU', 'Deleting the server removes everything on it. Run with --yes only when the owner said so.');
  const s = readServer();
  if (!s.dropletId) return say('OK', 'No server recorded');
  await doApi('DELETE', `/droplets/${s.dropletId}`);
  saveServer({ dropletId: null, ip: null });
  say('OK', `Server ${s.dropletId} deleted`);
}

// Choices from the setup questions. host, ownDomain, remoteDir, sshKey and timezone describe the
// server; everything else (EMAIL_LIST, DMS_ENABLED, COMMENTS_DRY_RUN, YOUTUBE, TIKTOK…) goes into .env.
function set() {
  const s = readServer();
  const settings = { ...(s.settings || {}) };
  const top = {};
  for (const a of args) {
    const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) throw new Error(`"${a}" isn't NAME=value`);
    if (['host', 'ownDomain', 'remoteDir', 'sshKey', 'timezone'].includes(m[1])) top[m[1]] = m[1] === 'ownDomain' ? m[2] === 'true' : m[2];
    else if (/KEY|TOKEN|SECRET/.test(m[1])) throw new Error(`${m[1]} is a key: use node setup/keys.mjs ${m[1]}`);
    else settings[m[1]] = m[2];
  }
  saveServer({ ...top, settings });
  say('OK', `Saved ${args.map((a) => a.split('=')[0]).join(', ')}`);
}

const commands = { set, 'check-token': checkToken, create: () => create(args[0]), address, env: () => (buildEnv(), say('OK', 'Wrote .secrets/server.env')), install, 'push-env': pushEnv, 'push-config': pushConfig, check, update, backup, editor, 'delete-server': deleteServer };
if (!commands[cmd]) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   ')).join('\n'));
  process.exit(cmd ? 1 : 0);
}
try {
  await commands[cmd]();
} catch (e) {
  say('FAILED', e.message);
  process.exitCode = 1;
}
