// Builds the customer copy of the Reel engine: dist/reel-engine-v<VERSION>/ (or the folder given), ready to zip.
// Bump overlay/VERSION for each release; every update is a fresh build of this script, never a hand-edited copy.
//   from ../reel-hf/lib     the engine, minus the Scrolly brand kits, the Mixkit sound files and the lib README
//   from ../reel-studio     prep.mjs → tools/cut/prep.mjs, rewired to the package's settings (plans/, work/audio)
//   from overlay/           what only customers get: README, CLAUDE.md, sounds.md, THIRD-PARTY-NOTICES, a blank
//                           reel-settings.json, the blank brand kit, OFL + Apache license texts, the transcribe script,
//                           the customer version of the reel-engine-setup skill
// Then it checks the result: no sound/music/ffmpeg files, no Mixkit fetching code, nothing that names Scrolly or
// Mercedes, every font with its OFL file. Any failure stops the build.
// Writes FILES.txt (every shipped file + size) into the package: show it to Mercedes before anything is shared.
// Usage: node build-package.mjs [out-dir]
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = path.join(HERE, '../reel-hf');
const VERSION = readFileSync(path.join(HERE, 'overlay/VERSION'), 'utf8').trim();
const OUT = path.resolve(process.argv[2] || path.join(HERE, `dist/reel-engine-v${VERSION}`));
const fail = (msg) => { console.error(`build-package: ${msg}`); process.exit(1); };

// ---- 1. engine library ----
const SKIP = [/^brand[\\/]scrolly.*\.mjs$/, /^assets[\\/]sfx[\\/].+\.(mp3|wav)$/i, /^README\.md$/];
rmSync(OUT, { recursive: true, force: true });
cpSync(path.join(ENGINE, 'lib'), path.join(OUT, 'lib'), {
  recursive: true,
  filter: (src) => !SKIP.some((re) => re.test(path.relative(path.join(ENGINE, 'lib'), src))),
});

// provenance comments name the owner's own Reel folders: keep the history, drop the names
for (const f of ['components.mjs', 'templates/studio.mjs']) {
  const p = path.join(OUT, 'lib', f);
  writeFileSync(p, readFileSync(p, 'utf8').replace(/\b2026-10-13-bb-voice-file\b/g, 'the first Studio Reel').replace(/\b2026-10-13-bb-know-what-you-sell\b/g, 'the second Studio Reel'));
}

// ---- 2. the silence-aware cut, standalone (one source of truth: reel-studio/prep.mjs) ----
let cut = readFileSync(path.join(HERE, '../reel-studio/prep.mjs'), 'utf8');
const swap = (from, to, label) => {
  const n = cut.split(from).length - 1;
  if (!n) fail(`cut script changed: can't find ${label}. Update the swaps in build-package.mjs`);
  cut = cut.split(from).join(to);
};
swap("import { ffmpeg, clipPath } from '../carousels/lib/reels.mjs';",
  `import { P, ROOT, tool } from '../../lib/settings.mjs';
const ffmpeg = () => tool('ffmpeg');
const clipPath = (clip) => { const abs = path.isAbsolute(clip) ? clip : path.join(P.footage, clip); if (!existsSync(abs)) throw new Error(\`Clip not found: \${abs}\`); return abs; };`, 'the reels.mjs import');
swap("const REELS = path.join(HERE, '../carousels/reels');", "const REELS = path.join(ROOT, 'plans'); // plans/<id>/plan.json", 'REELS');
swap("path.join(REELS, '_work', s.transcript)", 'path.join(P.transcripts, \'..\', s.transcript)', 'transcript path (plan "audio/x.json" → work/audio/x.json)');
swap("path.join(REELS, '_work', c.s.transcript)", 'path.join(P.transcripts, \'..\', c.s.transcript)', 'transcript path in the pause trimmer');
cut = cut.replace(/^const fix = \{[^\n]*\};$/m, (line) => (line.includes('plan.fix') ? "const fix = { ...(plan.fix || {}) }; // plan.fix: { 'heard': 'Meant' } spellings, e.g. a brand name" : fail('fix map changed')));
cut = cut.replace(/^\/\/ Prep for a Remotion Reel:.*$/m, '// Silence-aware cut for the Reel engine (run by lib/prep-footage.mjs): accurate cuts + one base video + word timings.');
cut = cut.replace(/^\/\/ Reads \.\.\/carousels\/reels\/<id>\/plan\.json:$/m, '// Reads plans/<id>/plan.json (format: lib/README.md):');
cut = cut.replace(/^\/\/ Writes public\/<id>\/base\.mp4 \(1080×1920 SDR 30fps\) and public\/<id>\/props\.json \(for the Remotion composition\)\.$/m,
  '// Writes tools/cut/public/<id>/base.mp4 (1080×1920 SDR 30fps) and props.json (word timings); prep-footage copies them into the Reel.');
if (!cut.includes("from '../../lib/settings.mjs'")) fail('cut script rewire failed');
mkdirSync(path.join(OUT, 'tools/cut'), { recursive: true });
writeFileSync(path.join(OUT, 'tools/cut/prep.mjs'), cut);

// ---- 3. customer-only files ----
cpSync(path.join(HERE, 'overlay'), OUT, { recursive: true });
for (const d of ['plans', 'work/audio']) mkdirSync(path.join(OUT, d), { recursive: true });
writeFileSync(path.join(OUT, 'plans/.gitkeep'), '');

// ---- 4. checks ----
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(path.relative(OUT, p).replace(/\\/g, '/')); } };
walk(OUT);
const problems = [];
for (const f of files) {
  if (/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f)) problems.push(`audio file shipped: ${f}`);
  if (/(^|\/)(ffmpeg|ffprobe)(\.exe)?$/i.test(f)) problems.push(`ffmpeg binary shipped: ${f}`);
  if (/\.(mjs|js|py|html|json|md|txt|css)$/i.test(f) || !/\./.test(path.basename(f))) {
    const text = readFileSync(path.join(OUT, f), 'utf8');
    if (/scrolly|mercedes|scrollyseo|\bmerce\b|collection:\/\/|OneDrive\/Scrolly|bb-voice-file|bb-know-what/i.test(text)) problems.push(`personal/Scrolly detail in ${f}: ${text.match(/.{0,30}(scrolly|mercedes|merce\b|collection:\/\/|bb-voice-file|bb-know-what)[^\n]{0,30}/i)?.[0]}`);
    // Mixkit may be named (docs, sources.json, doctor's notes); no code may point at Mixkit's site or files
    if (/\.(mjs|js|py)$/.test(f) && /mixkit\.co/i.test(text)) problems.push(`Mixkit URL in code: ${f}`);
  }
}
for (const font of readdirSync(path.join(OUT, 'lib/assets/fonts')).filter((f) => f.endsWith('.woff2'))) {
  const stem = { 'figtree.woff2': 'figtree', 'bricolage-800.woff2': 'bricolage-grotesque', 'covered-by-your-grace.woff2': 'covered-by-your-grace' }[font];
  if (!stem || !existsSync(path.join(OUT, 'lib/assets/fonts', `OFL-${stem}.txt`))) problems.push(`font without a license file: ${font}`);
}
if (!readFileSync(path.join(OUT, 'lib/assets/js/gsap.min.js'), 'utf8').match(/^\/\*!\r?\n \* GSAP/)) problems.push('gsap.min.js lost its license header');
for (const must of ['README.md', 'THIRD-PARTY-NOTICES.md', 'sounds.md', 'reel-settings.json', 'lib/brand/my-brand.mjs', 'lib/brand/holidays.mjs', 'VERSION', 'tools/transcribe.py', 'tools/cut/prep.mjs', 'licenses/Apache-2.0-HyperFrames.txt', '.claude/skills/reel-engine-setup/SKILL.md']) {
  if (!files.includes(must)) problems.push(`missing ${must}`);
}
if (problems.length) fail(`${problems.length} problem(s):\n  ${problems.join('\n  ')}`);

// ---- 5. file list ----
const kb = (f) => `${Math.max(1, Math.round(statSync(path.join(OUT, f)).size / 1024))} KB`;
const list = files.sort();
const total = list.reduce((n, f) => n + statSync(path.join(OUT, f)).size, 0);
writeFileSync(path.join(OUT, 'FILES.txt'), `Reel Engine v${VERSION}: ${list.length + 1} files, ${(total / 1048576).toFixed(1)} MB (built ${new Date().toISOString().slice(0, 10)})\n\n` +
  list.map((f) => `${f.padEnd(60)} ${kb(f)}`).join('\n') + '\nFILES.txt\n');
console.log(`package built: ${OUT} (v${VERSION}, ${list.length + 1} files, ${(total / 1048576).toFixed(1)} MB, checks passed; list in FILES.txt)`);
