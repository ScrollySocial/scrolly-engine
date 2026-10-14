// Print the tail of an Actor run's log. Usage: node run-log.mjs <runId>
const { default: fs } = await import('node:fs');
const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const token = env.split(/\r?\n/).find((l) => l.startsWith('APIFY_TOKEN=')).slice(12).trim();
const r = await fetch(`https://api.apify.com/v2/actor-runs/${process.argv[2]}/log`, { headers: { Authorization: `Bearer ${token}` } });
const t = await r.text();
console.log(t.split('\n').filter((l) => !/^\s*$/.test(l)).slice(-25).join('\n'));
