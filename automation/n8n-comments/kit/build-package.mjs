// Builds the Chat Manager download (the WooCommerce file) from Mercedes's working copy:
//   node kit/build-package.mjs        → kit/dist/chat-manager-<version>/ and kit/dist/chat-manager-<version>.zip
// Takes only code, the example profile, the setup helpers, the skills and the guide. Never .secrets,
// her profile, keywords, pages, tests' data or raw screenshots; then scans the result for anything of
// hers (keys, IDs, her server) and stops if it finds one.
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const KIT = dirname(fileURLToPath(import.meta.url));
const SRC = join(KIT, '..');
const version = readFileSync(join(KIT, 'VERSION'), 'utf8').trim();
const name = `chat-manager-${version}`;
const out = join(KIT, 'dist', name);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const copy = (from, to = from, filter) => cpSync(join(SRC, from), join(out, to), { recursive: true, filter });
// The running system
for (const f of ['Caddyfile', 'docker-compose.yml', '.env.example']) copy(f);
copy('inbox', 'inbox', (p) => !p.endsWith('.tmp'));
copy('workflow');
copy('scripts/instagram-setup.mjs');
copy('scripts/youtube-auth.mjs');
copy('config/profile.example.json');
// Self-test the buyer (or Claude) can run after an update
copy('test/run-kit-test.mjs');
copy('test/demo-inbox.mjs');
copy('demo/seed.mjs');
// Setup, skills, guide, docs
copy('kit/setup', 'setup');
copy('kit/skills/chat-manager-setup', '.claude/skills/chat-manager-setup');
copy('kit/skills/draft-comment-replies', '.claude/skills/draft-comment-replies');
if (existsSync(join(KIT, 'guide', 'index.html'))) copy('kit/guide', 'guide', (p) => !/shots-raw/.test(p));
for (const f of ['README.md', 'CHANGELOG.md', 'VERSION']) copy(`kit/${f}`, f);
writeFileSync(join(out, '.gitignore'), '.secrets/\n.env\nconfig/profile.json\nconfig/pages/\nconfig/keywords*.json\nconfig/settings.json\n');

// ---- leak check: nothing of Mercedes's live setup may ship ----
const FORBIDDEN = [
  [/157\.245\.142\.39/, "her server's IP"],
  [/17841434374468375/, 'her Instagram user ID'],
  [/981733824988100|1730911521333807/, 'her Meta app IDs'],
  [/UCUQpezffVegv9QMsruSuG8g/, 'her YouTube channel ID'],
  [/202163156140688566/, 'her MailerLite group'],
  [/scrollysocial@outlook\.com/, 'her Google account'],
  [/\b(sk-ant-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|IGA[A-Za-z0-9]{40,}|dop_v1_[a-f0-9]{40,})/, 'a real-looking key'],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./, 'a token'],
];
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : files.push(join(d, f))));
walk(out);
let leaks = 0;
for (const f of files) {
  if (/\.(png|jpe?g|webp|zip)$/i.test(f)) continue;
  const text = readFileSync(f, 'utf8');
  for (const [re, what] of FORBIDDEN) if (re.test(text)) leaks++, console.log(`LEAK      ${relative(out, f)}: ${what}`);
}
for (const bad of ['.secrets', 'config/profile.json', 'config/keywords.json', 'config/keywords-all.json', 'config/pages', 'kit', 'meta-app']) {
  if (existsSync(join(out, bad))) leaks++, console.log(`LEAK      ${bad} is in the package`);
}
if (leaks) {
  console.log(`FAILED    ${leaks} problem(s); nothing zipped`);
  process.exit(1);
}

// ---- zip (PowerShell on Windows, zip elsewhere) ----
const zip = join(KIT, 'dist', `${name}.zip`);
rmSync(zip, { force: true });
const r = process.platform === 'win32'
  ? spawnSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${out}' -DestinationPath '${zip}' -Force`], { encoding: 'utf8' })
  : spawnSync('zip', ['-rq', zip, name], { cwd: join(KIT, 'dist'), encoding: 'utf8' });
if (r.status !== 0) {
  console.log(`FAILED    zip: ${r.stderr}`);
  process.exit(1);
}
console.log(`OK        ${files.length} files, no leaks → kit/dist/${name}.zip (${Math.round(statSync(zip).size / 1024)} KB)`);
