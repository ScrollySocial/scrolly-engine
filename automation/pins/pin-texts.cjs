// Writes a table of a batch's Pin texts (big text, small line, Pinterest title, target search) for her review.
// Usage: node pin-texts.cjs batch-05   Output: out/<batch>/pin-texts.md (also printed)
const fs = require('fs');
const batch = process.argv[2] || 'batch-05';
const src = fs.readFileSync(batch + '.mjs', 'utf8');
const chunks = src.split(/\n  \{ layout: /).slice(1);
const clean = (s) => s.replace(/\\u00a0/g, ' ').replace(/\\u2019/g, '’').replace(/\\'/g, "'");
const get = (c, k) => {
  const i = c.indexOf(k + ": '");
  if (i < 0) return '';
  let j = i + k.length + 3, s = '';
  while (j < c.length && !(c[j] === "'" && c[j - 1] !== '\\')) s += c[j++];
  return clean(s);
};
const info = {};
for (const c of chunks) {
  const lines = [...c.matchAll(/\{ t: '([^']*)'(, script: true)? \}/g)].map((m) => m[1]).join(' ');
  info[get(c, 'title')] = {
    head: get(c, 'serif_t') || get(c, ', serif') || lines,
    sub: [get(c, 'sel') || get(c, 'small') || get(c, 'cap'), get(c, 'badge')].filter(Boolean).join(' + '),
    kw: get(c, 'keywords') || (c.includes('KW_AUTO') ? 'manychat automation' : ''),
  };
}
const rows = JSON.parse(fs.readFileSync(`out/${batch}/batch.json`, 'utf8'));
const out = ['| # | Posts (Eastern) | Big text on the Pin | Small line | Pinterest title | Pinterest search it targets |', '|---|---|---|---|---|---|'];
rows.forEach((r, i) => {
  const d = new Date(r.date + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' });
  const x = info[r.title] || {};
  out.push(`| ${i + 1} | ${d}${r.video ? ' (video)' : ''} | ${x.head} | ${x.sub} | ${r.title} | ${(x.kw || '').split(',')[0]} |`);
});
fs.writeFileSync(`out/${batch}/pin-texts.md`, `# ${batch} Pin texts\n\n` + out.join('\n') + '\n');
console.log(out.join('\n'));
