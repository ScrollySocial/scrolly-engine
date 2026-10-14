// Evening run, the mechanical half: renders every Reel whose Plan it AND Edit it are approved and whose render is
// missing or older than her latest choices (stage "render" in lib/pipeline.mjs). Claude applies her notes first;
// this script only builds, checks, renders, makes the cover and refreshes the review page.
// Per Reel: node build.mjs → hyperframes check → render (into <reel>/renders, then a fresh copy to OneDrive
// exports/reels/final, never replaced in place) → cover.png from her cover pick → node build.mjs review → review/render.json.
// Skips a Reel whose index.html was edited outside build.mjs (HyperFrames Studio): diff and fold those in first.
// Usage: node lib/render-ready.mjs [--only <reel>] [--dry]     (needs the Bash sandbox off: Edge + ffmpeg)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { allReels, coverFile, decisionsHash, finalFile, reelStatus, ROOT } from './pipeline.mjs';
import { renderCovers } from './cover.mjs';
import { BRANDS } from './brand/index.mjs';

const args = process.argv.slice(2);
const only = args.includes('--only') ? path.basename(args[args.indexOf('--only') + 1]) : null;
const dry = args.includes('--dry');
const BIN = path.join(ROOT, '../hyperframes-test/bin');
const env = { ...process.env, PATH: `${BIN}${path.delimiter}${process.env.PATH}`, PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS: '180000', PRODUCER_PLAYER_READY_TIMEOUT_MS: '180000' };
const sha = (f) => createHash('sha1').update(readFileSync(f)).digest('hex');
const nn = (n) => String(n).padStart(2, '0');

const todo = allReels().map(reelStatus).filter((r) => r.stage === 'render' && (!only || r.slug === only));
if (!todo.length) { console.log('Nothing to render.'); process.exit(0); }
console.log(`To render: ${todo.map((r) => r.slug).join(', ')}`);
if (dry) process.exit(0);

const results = [];
for (const { slug } of todo) {
  const dir = path.join(ROOT, slug), log = path.join(dir, 'renders/render.log'), t0 = Date.now();
  mkdirSync(path.join(dir, 'renders'), { recursive: true });
  writeFileSync(log, `render ${new Date().toISOString()}\n`);
  const run = (cmd, a, timeoutMin) => {
    const p = spawnSync(cmd, a, { cwd: dir, env, shell: cmd === 'npx', encoding: 'utf8', timeout: timeoutMin * 60e3, maxBuffer: 64 << 20 });
    writeFileSync(log, `\n$ ${cmd} ${a.join(' ')}\n${p.stdout || ''}${p.stderr || ''}${p.error ? '\n' + p.error.message : ''}\n`, { flag: 'a' });
    return p.status === 0;
  };
  const fail = (why) => { results.push({ slug, ok: false, why }); console.log(`✗ ${slug}: ${why} (log: ${log})`); };

  // HyperFrames Studio edits live only in index.html: never build over them
  const stamp = path.join(dir, 'review/built-index.sha');
  if (existsSync(stamp) && existsSync(path.join(dir, 'index.html')) && readFileSync(stamp, 'utf8').trim() !== sha(path.join(dir, 'index.html'))) { fail('index.html was edited in Studio: diff it into build.mjs first'); continue; }
  if (!run(process.execPath, ['build.mjs'], 5)) { fail('build.mjs failed'); continue; }
  writeFileSync(stamp, sha(path.join(dir, 'index.html')));
  if (!run('npx', ['--yes', 'hyperframes@0.8.150', 'check'], 15)) { fail('hyperframes check failed'); continue; }
  const local = path.join(dir, 'renders', `${slug}.mp4`);
  if (!run('npx', ['--yes', 'hyperframes@0.8.150', 'render', '.', '-o', `renders/${slug}.mp4`], 45) || !existsSync(local)) { fail('render failed'); continue; }
  // OneDrive breaks files replaced in place: remove, then copy fresh
  mkdirSync(path.dirname(finalFile(slug)), { recursive: true });
  rmSync(finalFile(slug), { force: true });
  copyFileSync(local, finalFile(slug));

  // her cover pick from the page (Plan it → Cover)
  const D = JSON.parse(readFileSync(path.join(dir, 'review/decisions.json'), 'utf8'));
  let cover = null;
  if (D.cover?.text) {
    const n = D.cover.frame || 1;
    const cut = [`review/cover-cuts/f${nn(n)}.png`, `sketch/f${nn(n)}-cut.png`].map((p) => path.join(dir, p)).find(existsSync);
    const photo = path.join(dir, `sketch/f${nn(n)}.jpg`);
    const style = D.cover.style === 'photo' || !cut ? 'photo' : 'cut';
    try {
      mkdirSync(path.dirname(coverFile(slug)), { recursive: true });
      rmSync(coverFile(slug), { force: true });
      await renderCovers({ options: [{ text: D.cover.text, aside: D.cover.aside?.trim() || '', style, photo, bg: D.cover.bg || 'cream', brand: BRANDS[D.brand] || undefined }], cut, outDir: path.dirname(coverFile(slug)), names: ['cover.png'] });
      cover = coverFile(slug);
    } catch (e) { writeFileSync(log, `\ncover failed: ${e.message}\n`, { flag: 'a' }); }
  }
  run(process.execPath, ['build.mjs', 'review'], 10); // step 3 now plays the render
  const secs = Math.round((Date.now() - t0) / 1000);
  writeFileSync(path.join(dir, 'review/render.json'), JSON.stringify({ at: new Date().toISOString(), ok: true, hash: decisionsHash(D), file: finalFile(slug), cover, seconds: secs }, null, 1));
  results.push({ slug, ok: true, file: finalFile(slug), cover, minutes: +(secs / 60).toFixed(1) });
  console.log(`✓ ${slug}: ${(secs / 60).toFixed(1)} min → ${finalFile(slug)}${cover ? '' : ' (no cover picked yet)'}`);
}
const runs = path.join(ROOT, '_runs');
mkdirSync(runs, { recursive: true });
writeFileSync(path.join(runs, `${new Date().toISOString().slice(0, 10)}-render.json`), JSON.stringify(results, null, 1));
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} rendered.`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
