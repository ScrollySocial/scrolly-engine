// The used-content ledger: every approved carousel's brief, hook, structure and media.
// check() compares a draft against it so topics, hooks and photos don't repeat.
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { readJson, LEDGER, cfg, HERE } from './common.mjs';

const STOP = new Set('a an the and or but of to in on for with your you i my is are be it this that how what why when do does can will just from at as by not so if into about more most than'.split(' '));
const words = (s) => new Set(String(s || '').toLowerCase().replace(/\$/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const jaccard = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const w of a) if (b.has(w)) n++; return n / (a.size + b.size - n); };
const opener = (s) => String(s || '').toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).slice(0, 3).join(' ');

export const entries = () => readJson(LEDGER).entries;

// Everything a new idea or draft must not repeat: approved carousels (ledger), drafts in posts/ (not yet approved),
// and idea cards in research/ideas/ (proposed, approved, used AND rejected, so rejected topics aren't re-proposed).
export function knownContent() {
  const out = entries().map((e) => ({ kind: 'approved', id: e.id, topic: e.topic, mainPoint: e.mainPoint, hook: e.hook }));
  const seen = new Set(out.map((e) => e.id));
  const pd = path.join(HERE, 'posts');
  for (const id of existsSync(pd) ? readdirSync(pd) : []) {
    if (id.startsWith('_') || seen.has(id) || !existsSync(path.join(pd, id, 'post.json'))) continue;
    const p = readJson(path.join(pd, id, 'post.json'));
    out.push({ kind: 'draft', id, topic: p.brief?.topic, mainPoint: p.brief?.mainPoint, hook: p.slides?.[0]?.text });
  }
  const idir = path.join(HERE, 'research/ideas');
  for (const f of existsSync(idir) ? readdirSync(idir).filter((x) => x.endsWith('.md')) : []) {
    const t = readFileSync(path.join(idir, f), 'utf8');
    const g = (k) => (t.match(new RegExp(`^${k}:\\s*(.*)$`, 'mi')) || [])[1] || '';
    const ins = (t.match(/## The insight\s+([^\n]+)/) || [])[1] || '';
    out.push({ kind: `idea-${g('status')}`, id: f.replace(/\.md$/, ''), topic: g('title'), mainPoint: ins, hook: '' });
  }
  return out;
}

// Lexical similarity of free text against everything known (Claude still judges real repeats).
export function similarTo(text, exceptId) {
  const me = words(text);
  return knownContent().filter((e) => e.id !== exceptId)
    .map((e) => ({ ...e, score: Math.max(jaccard(me, words(e.topic)), jaccard(me, words(e.hook)), jaccard(me, words([e.topic, e.mainPoint, e.hook].join(' ')))) }))
    .filter((x) => x.score >= 0.15).sort((a, b) => b.score - a.score).slice(0, 8);
}

export function entryFromPost(post) {
  return {
    id: post.id, date: new Date().toISOString().slice(0, 10), style: post.style, format: post.format || null, palette: post.palette || null,
    reader: post.brief.reader, problem: post.brief.problem, outcome: post.brief.outcome,
    topic: post.brief.topic, mainPoint: post.brief.mainPoint, structure: post.brief.structure, ending: post.brief.ending,
    hook: post.slides[0]?.text, slide2: post.slides[1]?.text, slides: post.slides.length,
    cta: post.cta, tigerNod: post.tigerNod || null, hashtags: post.hashtags, media: post._mediaUsed || [],
    notionUrl: post.notionUrl || null, status: 'approved',
  };
}

// Returns { similar: [...], warnings: [...] }. Lexical only: Claude still judges whether a flagged pair is a real repeat.
export function compare(post, mediaReuseWeeks = 3) {
  const all = entries().filter((e) => e.id !== post.id);
  const me = words([post.brief?.topic, post.brief?.mainPoint, post.slides?.[0]?.text].join(' '));
  const ownIdea = (post.brief?.source || '').match(/\d{4}-\d{2}-\d{2}-[a-z0-9-]+/)?.[0];
  const similar = knownContent().filter((e) => e.id !== post.id && e.id !== ownIdea)
    .map((e) => ({ id: `${e.kind}: ${e.id}`, topic: e.topic, hook: e.hook, score: Math.max(jaccard(me, words(e.topic)), jaccard(me, words([e.topic, e.mainPoint, e.hook].join(' ')))) }))
    .filter((x) => x.score >= 0.2).sort((a, b) => b.score - a.score).slice(0, 5);
  const warnings = [];
  const recent = all.slice(-5);
  const op = opener(post.slides?.[0]?.text);
  for (const e of recent) if (op && opener(e.hook) === op) warnings.push(`Hook opens like ${e.id} ("${e.hook}"). Vary the opening.`);
  if (post.brief?.structure && recent.slice(-3).length === 3 && recent.slice(-3).every((e) => e.structure === post.brief.structure)) warnings.push(`Last 3 posts all used structure "${post.brief.structure}". Vary it.`);
  if (post.brief?.ending && recent.slice(-2).every((e) => e.ending === post.brief.ending) && recent.length >= 2) warnings.push(`Last 2 posts ended the same way ("${post.brief.ending}").`);
  if (recent.length >= 2 && recent.slice(-2).every((e) => e.style === post.style)) warnings.push(`Last 2 posts were also style ${post.style}.`);
  // Wildcard palettes: at most 1 in any 6 posts.
  const pals = cfg('brand').palettes;
  const isWild = (e) => pals[e.palette]?.wildcard;
  if (isWild(post) && all.slice(-5).some(isWild)) warnings.push(`Wildcard palette "${post.palette}" again within 6 posts (last: ${all.slice(-5).filter(isWild).map((e) => e.id).join(', ')}).`);
  const cutoff = new Date(Date.now() - mediaReuseWeeks * 7 * 864e5).toISOString().slice(0, 10);
  const mine = new Set([post.media?.background, post.media?.avatar, ...(post.slides || []).map((s) => s.media)].filter(Boolean));
  for (const e of all) if (e.date >= cutoff) for (const m of e.media || []) if (mine.has(m)) warnings.push(`Photo ${m} was used in ${e.id} (${e.date}), within ${mediaReuseWeeks} weeks.`);
  return { similar, warnings };
}
