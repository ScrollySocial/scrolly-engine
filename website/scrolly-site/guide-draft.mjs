// Puts a guide outline into WordPress as a PRIVATE DRAFT POST, so Mercedes can write in the normal WordPress editor.
// The draft is only her writing space: it is never published. When she's done, her words are copied back into
// content/guides/<slug>.md and the designed page is built from that file (pages/guides.mjs).
//   node guide-draft.mjs push <slug>     create the draft (or refuse if one exists: it may hold her writing)
// Writing notes become yellow boxes she deletes. Page pieces (charts, step graphics, product mentions) become blue
// boxes she leaves in place; they're drawn by the page from the .md file, not from the draft.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp, BASE } from './wp-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [cmd, slug] = process.argv.slice(2);
//   node guide-draft.mjs replace <slug>  rewrite the draft, ONLY while nobody has edited it since it was created
if (!['push', 'replace'].includes(cmd) || !slug) throw new Error('usage: node guide-draft.mjs push|replace <slug>');
const file = path.join(here, 'content', 'guides', slug + '.md');
const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const fmEnd = src.indexOf('\n---\n', 4);
const fm = Object.fromEntries(src.slice(4, fmEnd).split('\n').filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
if (fm.draftPostId && cmd === 'push') throw new Error(`draft already exists (post ${fm.draftPostId}); it may hold her writing, so it is never overwritten`);
const body = src.slice(fmEnd + 5);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

const P = (h) => `<!-- wp:paragraph -->\n<p>${h}</p>\n<!-- /wp:paragraph -->`;
const H = (lvl, t) => `<!-- wp:heading${lvl === 2 ? '' : ` {"level":${lvl}}`} -->\n<h${lvl} class="wp-block-heading">${inline(t)}</h${lvl}>\n<!-- /wp:heading -->`;
const L = (items, ordered) => `<!-- wp:list${ordered ? ' {"ordered":true}' : ''} -->\n<${ordered ? 'ol' : 'ul'} class="wp-block-list">${items.map((t) => `<!-- wp:list-item -->\n<li>${inline(t)}</li>\n<!-- /wp:list-item -->`).join('\n')}</${ordered ? 'ol' : 'ul'}>\n<!-- /wp:list -->`;
const T = (rows) => {
  const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const [head, , ...rest] = rows;
  return `<!-- wp:table -->\n<figure class="wp-block-table"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>\n<!-- /wp:table -->`;
};
const BOX = (bg, inner) => `<!-- wp:group {"style":{"color":{"background":"${bg}"},"spacing":{"padding":{"top":"16px","bottom":"16px","left":"20px","right":"20px"}},"border":{"radius":"12px"}},"layout":{"type":"constrained"}} -->\n<div class="wp-block-group has-background" style="border-radius:12px;background-color:${bg};padding-top:16px;padding-right:20px;padding-bottom:16px;padding-left:20px">${inner}</div>\n<!-- /wp:group -->`;
const NOTE = (inner) => BOX('#fff3b8', P('<strong>✏️ WRITING NOTE: delete this yellow box when the section is written.</strong>') + inner);
const PIECE = (label, inner = '') => BOX('#dfe4f0', P(`<strong>🔵 PAGE PIECE (leave this blue box here): ${label}</strong>`) + inner);
const SHOT = (caption) => BOX('#f1ece4', P(`<strong>📷 SCREENSHOT SPOT:</strong> replace this box with your screenshot (Add block → Image). Caption idea: ${inline(caption.replace(/^WRITE a caption: /, ''))}`));

function blocks(text) {
  const out = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    let m;
    if ((m = l.match(/^(##|###) (.+)/))) out.push(H(m[1].length, m[2]));
    else if ((m = l.match(/^!\[[^\]]*\]\(\S+(?: "([^"]+)")?\)/))) out.push(SHOT(m[1] || ''));
    else if (l.startsWith('|')) { const r = []; while (i < lines.length && lines[i].startsWith('|')) r.push(lines[i++]); i--; out.push(T(r)); }
    else if (/^(- |\d+\. )/.test(l)) { const it = []; const o = /^\d/.test(l); while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) it.push(lines[i++].replace(/^(- |\d+\. )/, '')); i--; out.push(L(it, o)); }
    else { const p = []; while (i < lines.length && lines[i].trim() && !/^(##|- |\d+\. |\||!\[)/.test(lines[i])) p.push(lines[i++]); i--; out.push(P(inline(p.join(' ')))); }
  }
  return out.join('\n\n');
}

const parts = [];
// Page details first: the bits that sit in the page's top section and author box.
parts.push(BOX('#fff3b8', P('<strong>✏️ PAGE DETAILS: fill these in, then delete this yellow box.</strong>') + L([
  `**Intro line under the title** (under 30 words): ${fm.lede.replace(/^\[WRITE[^\]]*\]$/, '')}`,
  '**About you** (2 sentences for the "Written by Mercedes" box at the end): ',
  '**Top picture:** add one real photo or screenshot right below this box (you at your laptop with the inbox open, or a keyword DM on your phone).',
  '**Your photo** for the author box: add it at the very bottom of this draft.',
])));

const lines = body.split('\n');
let run = [];
const flush = () => { if (run.length) parts.push(blocks(run.join('\n'))); run = []; };
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^:::(\w+)\s*(.*)$/);
  if (!m) { run.push(lines[i]); continue; }
  flush();
  const [, kind, arg] = m;
  if (kind === 'cta') { parts.push(PIECE(arg.startsWith('slim') ? 'one-line Chat Manager mention' : 'the Chat Manager product card')); continue; }
  const inner = [];
  while (++i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i]);
  const text = inner.join('\n').replace(/^\[WRITE[^\]]*\]$/gm, '');
  if (kind === 'note') parts.push(NOTE(blocks(text
    .replace(/\*\*How to use this file\.\*\*[^\n]*/, '**How to use this draft.** Write your words under each heading. Delete each yellow box when its section is done. Leave the blue boxes: they mark charts, graphics and Chat Manager mentions the finished page adds for you. Click Save draft as you go, never Publish. When it’s all written, tell Claude, and it builds the designed page from your words and shows you previews first.')
    .replace(/\*\*Top picture\.\*\*[^\n]*\n?/, ''))));
  else if (kind === 'answer') parts.push(H(2, 'The short answer') + '\n\n' + P('(Write 2 or 3 sentences here, 40 to 60 words. This shows in a box right under the title.)'));
  else if (kind === 'trap') parts.push(H(3, `Watch out: ${arg}`) + '\n\n' + P('(Write this trap here: what Meta does, what you do instead, what happens if you skip it.)'));
  else if (kind === 'flow') parts.push(PIECE('step graphic', L(text.split('\n').filter((x) => x.includes('|')).map((x) => x.replace(' | ', ': ')), true)));
  else if (kind === 'bars') parts.push(PIECE(`cost chart "${arg}"`, P('The page draws it from these numbers. To change one, just tell Claude.') + L(text.split('\n').filter((x) => x.includes('|')), false)));
  else if (kind === 'faq') {
    parts.push(H(2, 'Questions people ask'));
    text.split(/^\?\? /m).slice(1).forEach((qa) => { const [q, ...a] = qa.split('\n'); const hint = inner.join('\n').split(/^\?\? /m).find((x) => x.startsWith(q)) || ''; parts.push(H(3, q.trim())); parts.push(P(`(Your answer here. ${inline((hint.split('\n')[1] || '').replace(/^\[WRITE[.,]?\s*|\]$/g, ''))})`)); });
  } else if (kind === 'sources') parts.push(H(2, 'Sources') + '\n\n' + P('(Write each as: name of page, site, date you checked it. Suggested:)') + '\n\n' + L(inner.filter((x) => x.startsWith('- ') && !x.includes('[WRITE')).map((x) => x.slice(2)), false));
}
flush();

if (process.argv.includes('--dry')) {
  fs.writeFileSync(path.join(here, 'dist', `guide-${slug}.wp-draft.html`), parts.join('\n\n'));
  console.log('dry run: dist/guide-' + slug + '.wp-draft.html');
  process.exit(0);
}
if (cmd === 'replace') {
  const cur = await wp(`/wp-json/wp/v2/posts/${fm.draftPostId}?context=edit&_fields=date_gmt,modified_gmt,status`);
  if (cur.status !== 200) throw new Error('read failed ' + cur.status);
  if (cur.json.modified_gmt !== cur.json.date_gmt || cur.json.status !== 'draft') throw new Error(`post ${fm.draftPostId} was edited since it was created (or isn't a draft); not touching it`);
  const u = await wp(`/wp-json/wp/v2/posts/${fm.draftPostId}`, { method: 'POST', body: JSON.stringify({ content: parts.join('\n\n'), date_gmt: cur.json.date_gmt }) });
  console.log('replaced', fm.draftPostId, u.status);
  process.exit(0);
}
const r = await wp('/wp-json/wp/v2/posts', { method: 'POST', body: JSON.stringify({ title: `DRAFT, do not publish: ${fm.title}`, status: 'draft', content: parts.join('\n\n') }) });
if (r.status !== 201) throw new Error('create failed ' + r.status + ' ' + JSON.stringify(r.json).slice(0, 300));
fs.writeFileSync(file, src.replace(/^slug: .*$/m, (s) => `${s}\ndraftPostId: ${r.json.id}`));
console.log('draft post', r.json.id, r.json.status, `${BASE}/wp-admin/post.php?post=${r.json.id}&action=edit`);
