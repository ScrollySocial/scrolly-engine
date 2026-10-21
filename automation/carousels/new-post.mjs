// Scaffolds posts/<YYYY-MM-DD>-<slug>/ with post.json (fill in) and research.md.
// Usage: node new-post.mjs <slug> <style A-E>
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { HERE, postDir, writeJson } from './lib/common.mjs';

const [slug, style = 'D'] = process.argv.slice(2);
if (!slug) { console.log('Usage: node new-post.mjs <slug> <style A-E>'); process.exit(1); }
const id = `${new Date().toISOString().slice(0, 10)}-${slug}`;
const dir = postDir(id);
if (existsSync(dir)) { console.log(`exists: ${dir}`); process.exit(1); }
mkdirSync(dir, { recursive: true });
writeJson(path.join(dir, 'post.json'), {
  id, style,
  ...(style === 'C' ? { format: 'notes' } : {}),
  ...(['D', 'E'].includes(style) ? { palette: 'offwhite' } : {}),
  brief: { source: '', reader: '', problem: '', outcome: '', topic: '', mainPoint: '', structure: '', ending: '', slide2Check: '' },
  media: style === 'A' ? { background: '' } : {},
  slides: [{ text: '', pos: 'center' }],
  cta: { type: 'link-in-bio', offer: '1k-club-challenge' },
  tigerNod: null,
  caption: '',
  hashtags: [],
  notionUrl: null,
});
writeFileSync(path.join(dir, 'research.md'), readFileSync(path.join(HERE, 'research/record-template.md'), 'utf8').replace('<topic>', id));
console.log(id);
