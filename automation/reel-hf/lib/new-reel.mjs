// Scaffold a new HyperFrames Reel folder from the voice-file project's setup + the shared library assets.
// Usage: node lib/new-reel.mjs <yyyy-mm-dd-slug>
import { mkdirSync, copyFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SRC = path.join(ROOT, '2026-10-13-bb-voice-file'); // first approved Studio Reel = project template
const id = process.argv[2];
if (!id || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) { console.log('Usage: node lib/new-reel.mjs <yyyy-mm-dd-slug>'); process.exit(1); }
const dir = path.join(ROOT, id);
if (existsSync(dir)) throw new Error(`${dir} already exists`);

const copyDir = (from, to) => { mkdirSync(to, { recursive: true }); for (const f of readdirSync(from)) copyFileSync(path.join(from, f), path.join(to, f)); };
for (const sub of ['fonts', 'js', 'sfx']) copyDir(path.join(HERE, 'assets', sub), path.join(dir, 'assets', sub));
for (const sub of ['img', 'music', 'cut']) mkdirSync(path.join(dir, 'assets', sub), { recursive: true });
for (const f of ['hyperframes.json', 'CLAUDE.md', 'AGENTS.md']) copyFileSync(path.join(SRC, f), path.join(dir, f));
writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ id, name: id, createdAt: new Date().toISOString() }, null, 2));
writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
  name: id, private: true, type: 'module',
  scripts: { build: 'node build.mjs', dev: 'npx --yes hyperframes@0.8.150 preview', check: 'npx --yes hyperframes@0.8.150 check', render: 'npx --yes hyperframes@0.8.150 render', publish: 'npx --yes hyperframes@0.8.150 publish' },
}, null, 2));
writeFileSync(path.join(dir, 'build.mjs'), `// ${id}: Studio Reel. Declares frames, scenes and sounds; lib/ does the rest. Usage: node build.mjs
import { reel } from '../lib/reel.mjs';

const R = reel();
const { K, C, at, win } = R;
R.frames([0 /* , at('first words of frame 2'), … from the locked storyboard */]);

R.cam.alternate();
// R.scene(1, [K.fade(48), K.statement('b1', 'Hook with a <m>marker</m> word', { top: 6, size: 10.5, in: 0.2, swipe: 0.9 })]);

R.captions({ hide: [] });
// R.fx('fx-pop1', 'pop-light', 1.2);
// R.music('assets/music/music-a.mp3');
R.write();
`);
console.log(`new Reel at ${dir}\nnext: node lib/prep-footage.mjs ${path.relative(process.cwd(), dir)} <prep-id>`);
