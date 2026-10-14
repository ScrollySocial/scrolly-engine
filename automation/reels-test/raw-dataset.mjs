// Fetch a run's dataset as raw text (no JSON.parse) to check big-integer precision. Usage: node raw-dataset.mjs <runId>
import fs from 'node:fs';
const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const token = env.split(/\r?\n/).find((l) => l.startsWith('APIFY_TOKEN=')).slice(12).trim();
const run = await (await fetch(`https://api.apify.com/v2/actor-runs/${process.argv[2]}`, { headers: { Authorization: `Bearer ${token}` } })).json();
const t = await (await fetch(`https://api.apify.com/v2/datasets/${run.data.defaultDatasetId}/items?format=json&limit=3`, { headers: { Authorization: `Bearer ${token}` } })).text();
let i = -1;
while ((i = t.indexOf('"song"', i + 1)) !== -1) console.log(t.slice(i, i + 90).replace(/\s+/g, ' '));
