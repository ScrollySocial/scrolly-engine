// Before researching or drafting: has this topic (or something close) already been made, drafted, proposed or rejected?
// Usage: node check-topic.mjs "growth content vs selling content"
import { similarTo } from './lib/ledger.mjs';

const text = process.argv.slice(2).join(' ');
if (!text) { console.log('Usage: node check-topic.mjs "<topic or hook>"'); process.exit(1); }
const hits = similarTo(text);
if (!hits.length) console.log('No similar content found.');
for (const h of hits) console.log(`${Math.round(h.score * 100)}%  [${h.kind}] ${h.id}  ${h.topic || ''}`);
