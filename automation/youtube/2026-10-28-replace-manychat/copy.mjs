// YouTube 1 upload copy: title, description with chapters (times from words.json, so they match the cut) and links.
// Usage: node copy.mjs → YOUTUBE.md
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { beats } = JSON.parse(readFileSync(path.join(HERE, 'words.json'), 'utf8'));
const plan = JSON.parse(readFileSync(path.join(HERE, 'plan.json'), 'utf8'));
const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
// chapter titles = the on-screen chapter cards (YouTube needs the first chapter at 0:00)
const CH = { '1.': "Why I wouldn't pay for ManyChat", '2.': 'What "replace it with Claude" means', '3.': 'What it does every day',
  '4.': 'It works on YouTube too', '5.': 'The costs', '6.': "What it can't do", '7.': 'Who should stay on ManyChat', '8.': 'Get my copy' };
const chapters = [['0:00', 'ManyChat Pro $39 vs mine $6'],
  ...beats.filter((b) => CH[b.beat.slice(0, 2)]).map((b) => [mmss(b.t), CH[b.beat.slice(0, 2)]])];
const u = (p, c = 'yt1') => `https://theambitiondepartment.com${p}?utm_source=youtube&utm_medium=description&utm_campaign=${c}`;

const desc = `ManyChat Pro is $39 a month for up to 2,500 contacts. I replaced it with my own comment and DM tool, built with Claude, and it costs me $6 a month for the server. In this video: what it does every day, what it really costs, the setup trap that can add weeks of review, and what it can't do yet.

Want my copy? Comment CHATTERBOX and I'll send you the Chat Manager page.

Full guide: ${u('/guides/replace-manychat-with-claude/')}
ManyChat cost calculator: ${u('/calculators/manychat-cost/')}
Chat Manager (live demo + kit): ${u('/chat-manager/')}

Chapters
${chapters.map(([t, n]) => `${t} ${n}`).join('\n')}

ManyChat prices from manychat.com/pricing, checked October 28, 2026.`;

writeFileSync(path.join(HERE, 'YOUTUBE.md'), `# YouTube 1: upload copy

**Title:** ${plan.title}

**Captions:** upload \`captions.srt\` (English). Not burned in.

**Description:**

\`\`\`
${desc}
\`\`\`

**Pinned comment:** Comment CHATTERBOX and I'll send you the Chat Manager page (live demo + the kit).

**End screen:** right side kept clear for 19 s: add "Best for viewer" video + Subscribe there.
`);
console.log('YOUTUBE.md written:', chapters.length, 'chapters');
