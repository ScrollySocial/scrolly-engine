// The used-content ledger (data/ledger.json).
//   node ledger.mjs add <post-id> [card-id]      record an APPROVED carousel (after Mercedes OKs it); card-id = its
//                                                Content Planner card (an old Notion URL is still accepted)
//   node ledger.mjs list                          one line per recorded carousel
//   node ledger.mjs media <media-id>              where a photo has been used
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readJson, writeJson, LEDGER, loadPost, postDir, HERE } from './lib/common.mjs';
import { entryFromPost } from './lib/ledger.mjs';

const [cmd, arg, card] = process.argv.slice(2);
const L = readJson(LEDGER);
if (cmd === 'add') {
  const post = loadPost(arg);
  const b = path.join(postDir(arg), 'build.json');
  if (!existsSync(b)) { console.log('Build it first (node build.mjs ' + arg + ').'); process.exit(1); }
  post._mediaUsed = readJson(b).mediaUsed;
  if (post._mediaUsed.some((m) => m.startsWith('stock:'))) { console.log('This build still uses stand-in stock photos. Swap in real photos and rebuild first.'); process.exit(1); }
  if (card?.startsWith('http')) post.notionUrl = card;
  else if (card) post.plannerId = card;
  const e = entryFromPost(post);
  L.entries = L.entries.filter((x) => x.id !== e.id).concat(e);
  writeJson(LEDGER, L);
  // Mark the idea card this post came from as used, so research never re-proposes it.
  const idea = (post.brief?.source || '').match(/\d{4}-\d{2}-\d{2}-[a-z0-9-]+/)?.[0];
  const f = idea && path.join(HERE, 'research/ideas', idea + '.md');
  if (f && existsSync(f)) { writeFileSync(f, readFileSync(f, 'utf8').replace(/^status:.*$/mi, 'status: used')); console.log(`idea ${idea} → used`); }
  console.log(`recorded ${e.id} (${L.entries.length} total)`);
} else if (cmd === 'media') {
  for (const e of L.entries) if ((e.media || []).includes(arg)) console.log(`${e.date}  ${e.id}`);
} else {
  for (const e of L.entries) console.log(`${e.date}  ${e.style}  ${e.id}  "${e.hook}"`);
  if (!L.entries.length) console.log('(ledger empty)');
}
