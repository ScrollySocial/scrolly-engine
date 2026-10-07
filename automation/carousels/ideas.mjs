// The idea bank: research/ideas/<id>.md, one researched idea per file, with a status line.
//   node ideas.mjs                 list ideas by status
//   node ideas.mjs set <id> <status>   status: proposed | approved | rejected | used
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { HERE } from './lib/common.mjs';

const DIR = path.join(HERE, 'research/ideas');
const STATUSES = ['proposed', 'approved', 'rejected', 'used'];
const field = (s, k) => (s.match(new RegExp(`^${k}:\\s*(.*)$`, 'mi')) || [])[1]?.trim() || '';
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
const [cmd, id, status] = process.argv.slice(2);

if (cmd === 'set') {
  if (!STATUSES.includes(status)) { console.log(`status must be one of ${STATUSES.join(', ')}`); process.exit(1); }
  const f = path.join(DIR, `${id}.md`);
  const s = readFileSync(f, 'utf8');
  writeFileSync(f, s.replace(/^status:.*$/mi, `status: ${status}`));
  console.log(`${id} → ${status}`);
} else {
  const rows = files.map((f) => { const s = readFileSync(path.join(DIR, f), 'utf8'); return { id: f.replace(/\.md$/, ''), status: field(s, 'status'), title: field(s, 'title'), source: field(s, 'source') }; });
  for (const st of STATUSES) {
    const list = rows.filter((r) => r.status === st);
    if (list.length) console.log(`\n${st.toUpperCase()} (${list.length})\n` + list.map((r) => `  ${r.id}  ${r.title}  [${r.source}]`).join('\n'));
  }
  if (!rows.length) console.log('(no ideas yet)');
}
