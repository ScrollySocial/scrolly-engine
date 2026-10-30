// Caption file for YouTube 1: words.json (the cut's word times, from roughcut.mjs) → captions.srt, with the names
// Whisper hears wrong fixed (ManyChat, Claude, n8n, Meta, Apify, CHATTERBOX). Upload the .srt; captions are not burned in.
// Usage: node captions.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { words } = JSON.parse(readFileSync(path.join(HERE, 'words.json'), 'utf8'));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// two-word mishearings → one word (keeps the first word's punctuation-free start, the last word's trailing punctuation)
const PAIRS = { manychat: 'ManyChat', manychats: 'ManyChat', minichat: 'ManyChat', cloudcode: 'Claude Code', cloudapp: 'Claude app',
  cloudsubscription: 'Claude subscription', anyend: 'n8n', chatterbox: 'CHATTERBOX', redor: 'read or', accountdonor: 'account owner' };
const TRIPLES = { mailorlight: 'MailerLite' };
const ONE = { autotatt: 'auto-DM', minichat: 'ManyChat', manychat: 'ManyChat', appify: 'Apify', meta: 'Meta', tiktok: 'TikTok', claude: 'Claude' };
const tail = (w) => (w.match(/[.,!?;:]+$/) || [''])[0];
const ws = [];
for (let i = 0; i < words.length; i++) {
  const a = words[i], b = words[i + 1], c = words[i + 2];
  const tri = c && TRIPLES[norm(a.w) + norm(b.w) + norm(c.w)];
  if (tri) { ws.push({ w: tri + tail(c.w), t: a.t, e: c.e }); i += 2; continue; }
  // Whisper splits hyphenated words ("auto -DM", "user -friendly"): join them back
  if (b && b.w.startsWith('-')) { const j = a.w + b.w; ws.push({ ...a, w: ONE[norm(j)] ? ONE[norm(j)] + tail(j) : j, e: b.e }); i++; continue; }
  const pair = b && PAIRS[norm(a.w) + norm(b.w)];
  if (pair) { ws.push({ w: pair + tail(b.w), t: a.t, e: b.e }); i++; continue; }
  const one = ONE[norm(a.w)];
  ws.push({ ...a, w: one ? one + tail(a.w) : a.w });
}
// cues: up to 42 characters and 5 s, broken after sentence ends or at a pause over 0.5 s
const cues = [];
let cur = [];
const flush = () => { if (cur.length) cues.push({ t: cur[0].t, e: cur.at(-1).e, text: cur.map((w) => w.w).join(' ') }); cur = []; };
for (const w of ws) {
  const prev = cur.at(-1), len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
  if (prev && (len > 42 || w.e - cur[0].t > 5 || w.t - prev.e > 0.5 || /[.!?]$/.test(prev.w))) flush();
  cur.push(w);
}
flush();
const ts = (x) => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.t)} --> ${ts(Math.min(Math.max(c.e, c.t + 0.8), cues[i + 1]?.t ?? Infinity))}\n${c.text}\n`).join('\n');
writeFileSync(path.join(HERE, 'captions.srt'), srt);
console.log(`captions.srt: ${cues.length} cues`);
