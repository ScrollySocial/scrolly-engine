// Saves Buffer posts for the planner when there's no BUFFER_API_KEY yet.
// Claude runs the Buffer connector's list_posts, saves each result to a file, then:
//   node automation/planner/buffer-snapshot.mjs <result.json> [more.json ...]
// Accepts the connector's saved result ([{type,text}]), a plain {edges} page, or an array of posts.
// Every run replaces the snapshot, so pass the queue AND the sent posts together.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePost, normalizeChannel } from './lib/buffer.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node buffer-snapshot.mjs <list_posts result> [...]');
  process.exit(1);
}

// get_channel results (anything with a postingSchedule) are saved as channels.
const posts = new Map();
const channels = new Map();
for (const f of files) {
  let data = JSON.parse(readFileSync(f, 'utf8'));
  if (Array.isArray(data) && data[0]?.type === 'text') data = JSON.parse(data[0].text);
  const nodes = Array.isArray(data) ? data : data.edges ? data.edges.map((e) => e.node) : [data];
  for (const n of nodes) {
    if (n.postingSchedule) channels.set(n.id, normalizeChannel(n));
    else posts.set(n.id, normalizePost(n));
  }
}

mkdirSync(join(here, 'data'), { recursive: true });
const out = { takenAt: new Date().toISOString(), channels: [...channels.values()], posts: [...posts.values()] };
writeFileSync(join(here, 'data', 'buffer-snapshot.json'), JSON.stringify(out, null, 1));
console.log(`saved ${out.channels.length} channels, ${out.posts.length} posts`);
