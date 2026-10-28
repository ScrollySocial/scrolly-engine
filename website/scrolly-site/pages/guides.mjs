// Guides (blog) template, 2026-10-27. One page per Markdown file in content/guides/ (Mercedes writes the words herself;
// the keyword plan is vault products/content-engine/keyword-clusters-2026-11.md).
// Each file builds twice:
//   dist/guide-<slug>.html        the publish payload: writing notes removed, fails while any note is left
//   dist/guide-<slug>.draft.*     local preview with the writing notes showing (never published, no id)
// Markdown supported: # front matter (--- key: value ---), ## and ### headings, paragraphs, - and 1. lists, **bold**,
// *italic*, [links](url), `code`, > her own quote, ![alt](file "caption") screenshots, | tables |, and blocks:
//   :::answer ... :::            the short answer under the hero (what Google can show as a snippet)
//   :::trap Title ... :::        a "watch out" box for a setup trap
//   :::note ... :::              writing prompt for Mercedes; shows in the draft only
//   :::cta                       the product card (front matter `product`)
//   :::intro ... :::             paragraphs between the short answer and "In this guide"
//   :::cta slim Sentence         a one-line mention with a link to the product (default sentence: PRODUCTS[].slim)
//   :::cta slim Sentence | url | Link text   the same, linking somewhere else (e.g. the demo)
//   :::bars Title ... :::        bar chart, one line per group: `250 people | ManyChat $17 | Your own $6`
//   :::flow ... :::              connected steps, one line each: `Title | one short line`
//   :::faq  ?? Question / answer lines ... :::
//   :::sources  - list ... :::   bibliography at the back (writing rules: sources go last)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { s3shell, esc } from '../lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(here, '..', 'content', 'guides');
const SITE = 'https://theambitiondepartment.com';

// Product cards a guide can end on. Image: the v3 product shot (product-images/out-v3); swap for the WP media URL once
// a guide is published (preview uses the local file).
const PRODUCTS = {
  'chat-manager': {
    name: 'Chat Manager',
    line: 'Your own comment-to-DM automation on your own server. Claude sets it up with you.',
    price: '$97 founding beta, first 10 buyers',
    url: '/chat-manager/',
    btn: 'See Chat Manager',
    slim: 'Want this without building it from scratch? Chat Manager is the same setup as a kit.',
    img: '../product-images/out-v3/chat-manager.webp',
    alt: 'Chat Manager: a keyword comment sends the freebie by DM and the person joins your email list',
  },
};

const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) && !u.startsWith(SITE) ? ' rel="noopener"' : ''}>${t}</a>`);
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('guide needs front matter');
  const fm = Object.fromEntries(m[1].split('\n').filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  return { fm, body: src.slice(m[0].length) };
}

// Plain lines -> HTML (paragraphs, lists, headings, tables, quotes, figures).
function blocks(text, toc) {
  const out = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    let m;
    if ((m = l.match(/^(##|###) (.+)/))) {
      const id = slugify(m[2]);
      if (m[1] === '##' && toc) toc.push([id, m[2]]);
      out.push(m[1] === '##' ? `<h2 id="${id}">${inline(m[2])}</h2>` : `<h3 id="${id}">${inline(m[2])}</h3>`);
    } else if ((m = l.match(/^!\[([^\]]*)\]\((\S+)(?: "([^"]+)")?\)/))) {
      const pic = m[2].startsWith('REPLACE-') ? '<div class="gd-shot">Your screenshot goes here</div>' : `<img src="${m[2]}" alt="${esc(m[1])}" loading="lazy">`;
      out.push(`<figure>${pic}${m[3] ? `<figcaption>${inline(m[3])}</figcaption>` : ''}</figure>`);
    } else if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      i--;
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const [head, , ...body] = rows;
      out.push(`<div class="gd-table" tabindex="0" role="region" aria-label="Table"><table><thead><tr>${cells(head).map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${cells(r).map((c, k) => (k ? `<td>${inline(c)}</td>` : `<th scope="row">${inline(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d/.test(l);
      const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) items.push(lines[i++].replace(/^(- |\d+\. )/, ''));
      i--;
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
    } else if (l.startsWith('> ')) {
      const q = [];
      while (i < lines.length && lines[i].startsWith('> ')) q.push(lines[i++].slice(2));
      i--;
      out.push(`<blockquote>${q.map((t) => `<p>${inline(t)}</p>`).join('')}</blockquote>`);
    } else {
      const p = [];
      while (i < lines.length && lines[i].trim() && !/^(##|- |\d+\. |\||> |!\[)/.test(lines[i])) p.push(lines[i++]);
      i--;
      out.push(`<p>${inline(p.join(' '))}</p>`);
    }
  }
  return out.join('');
}

// Grouped horizontal bars. The last series is drawn in sky blue (the reader's own option), the others in mist ink.
// Values are printed beside each bar, and the same numbers sit in a screen-reader table.
function bars(title, text) {
  const groups = text.split('\n').filter((l) => l.includes('|')).map((l) => {
    const [label, ...cells] = l.split('|').map((c) => c.trim());
    return [label, cells.map((c) => { const m = c.match(/^(.*?)\s+(\S*?)([\d.,]+)(\S*)$/); if (!m) throw new Error('bars: bad value ' + c); return [m[1], m[2] + m[3] + m[4], parseFloat(m[3].replace(/,/g, ''))]; })];
  });
  const max = Math.max(...groups.flatMap(([, c]) => c.map((x) => x[2])));
  const names = groups[0][1].map((x) => x[0]);
  return `<figure class="gd-bars">${title ? `<figcaption>${inline(title)}</figcaption>` : ''}<div aria-hidden="true">${groups.map(([label, cells]) => `<div class="gd-bar-g"><p>${inline(label)}</p>${cells.map(([n, v, a], k) => `<div class="gd-bar${k === cells.length - 1 ? ' you' : ''}"><span class="gd-bar-n">${inline(n)}</span><span class="gd-bar-t"><i style="width:${Math.max(1.5, (a / max) * 100).toFixed(1)}%"></i><b>${esc(v)}</b></span></div>`).join('')}</div>`).join('')}</div><div class="gd-sr"><table><caption>${inline(title || 'Chart')}</caption><thead><tr><th scope="col"></th>${names.map((n) => `<th scope="col">${inline(n)}</th>`).join('')}</tr></thead><tbody>${groups.map(([label, cells]) => `<tr><th scope="row">${inline(label)}</th>${cells.map((x) => `<td>${esc(x[1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></figure>`;
}

// Connected steps (order matters, so they're numbered).
function flow(text) {
  const rows = text.split('\n').filter((l) => l.includes('|')).map((l) => l.split('|').map((c) => c.trim()));
  return `<ol class="gd-flow" style="--n:${rows.length}">${rows.map(([t, d]) => `<li><b>${inline(t)}</b><span>${inline(d || '')}</span></li>`).join('')}</ol>`;
}

function render(file, { draft }) {
  const { fm, body } = frontMatter(fs.readFileSync(path.join(DIR, file), 'utf8').replace(/\r\n/g, '\n'));
  const toc = [];
  const faqs = [];
  let answer = '';
  let intro = '';
  let sources = '';
  let notes = 0;
  const product = PRODUCTS[fm.product];
  const card = product ? `<aside class="gd-cta" aria-label="${product.name}"><img src="${product.img}" alt="${esc(product.alt)}" loading="lazy"><div><p class="gd-cta-name">${product.name}</p><p>${product.line}</p><p class="gd-cta-price">${product.price}</p><a class="s3-btn" href="${product.url}">${product.btn}</a></div></aside>` : '';

  // Walk the lines: plain runs become HTML; ":::kind arg" opens a block that ":::" closes (":::cta" stands alone).
  let html = '';
  let run = [];
  const flush = () => { html += blocks(run.join('\n'), toc); run = []; };
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^:::(\w+)\s*(.*)$/);
    if (!m) { run.push(lines[i]); continue; }
    flush();
    const [, kind, arg] = m;
    if (kind === 'cta') {
      if (!arg.startsWith('slim')) { html += card; continue; }
      if (!product) throw new Error(`${file}: :::cta slim needs a product`);
      const [say, url, btn] = arg.slice(4).split('|').map((s) => s.trim());
      html += `<p class="gd-slim">${inline(say || product.slim)} <a href="${url || product.url}">${inline(btn || product.btn)} →</a></p>`;
      continue;
    }
    const inner = [];
    while (++i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i]);
    const text = inner.join('\n');
    if (kind === 'answer') answer = blocks(text);
    else if (kind === 'intro') intro = blocks(text);
    else if (kind === 'trap') html += `<div class="gd-trap"><p class="gd-trap-t">${inline(arg || 'Watch out')}</p>${blocks(text)}</div>`;
    else if (kind === 'note') { notes++; if (draft) html += `<div class="gd-note"><p class="gd-note-t">Writing note (not published)</p>${blocks(text)}</div>`; }
    else if (kind === 'faq') text.split(/^\?\? /m).slice(1).forEach((qa) => { const [q, ...a] = qa.split('\n'); faqs.push([q.trim(), a.join('\n').trim()]); });
    else if (kind === 'bars') html += bars(arg, text);
    else if (kind === 'flow') html += flow(text);
    else if (kind === 'sources') sources = `<section class="gd-sources" aria-labelledby="sources"><h2 id="sources">Sources</h2>${blocks(text)}</section>`;
    else throw new Error(`${file}: unknown block :::${kind}`);
  }
  flush();
  if (!draft && notes) throw new Error(`${file}: ${notes} writing note(s) left. Write those sections, delete the :::note blocks, then build again.`);
  const todo = JSON.stringify(fm) + html + answer + JSON.stringify(faqs);
  if (!draft && !fm.heroImage) throw new Error(`${file}: add heroImage (your own photo or screenshot).`);
  if (!draft && /\[WRITE|WRITE alt|WRITE a caption|REPLACE-/.test(todo)) throw new Error(`${file}: a [WRITE …] line or placeholder screenshot is left.`);

  const faqHtml = faqs.length ? `<section class="gd-faq s3-faq" aria-labelledby="faq"><h2 id="faq">Questions people ask</h2>${faqs.map(([q, a]) => `<details><summary>${inline(q)}</summary><div>${blocks(a)}</div></details>`).join('')}</section>` : '';
  if (faqs.length) toc.push(['faq', 'Questions people ask']);
  const tocHtml = toc.length > 2 ? `<nav class="gd-toc" aria-label="In this guide"><p class="gd-toc-t">In this guide</p><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${inline(t)}</a></li>`).join('')}</ol></nav>` : '';
  const words = (answer + html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const updated = new Date(fm.updated + 'T12:00:00Z');
  const dateText = updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  // Article + FAQ structured data (check after publish that WordPress kept the script tag).
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: fm.title, description: fm.description, dateModified: fm.updated, datePublished: fm.published || fm.updated, author: { '@type': 'Person', name: fm.author, url: SITE + '/about/' }, publisher: { '@type': 'Organization', name: 'The Ambition Department', url: SITE }, mainEntityOfPage: `${SITE}/guides/${fm.slug}/` }];
  if (faqs.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/\*|`|\[|\]\([^)]*\)/g, '') } })) });

  const page = `
<header class="gd-hero s3-wrap">
 <div class="gd-hero-txt"><h1>${inline(fm.h1)} <em class="or">${inline(fm.h1Italic)}</em></h1>
 <p class="s3-lede">${inline(fm.lede)}</p>
 <p class="gd-meta"><span>By <a href="/about/">${esc(fm.author)}</a></span><span>Updated ${dateText}</span><span>${Math.max(1, Math.round(words / 230))} min read</span></p></div>
 ${fm.heroImage ? `<img class="gd-hero-pic" src="${fm.heroImage}" alt="${esc(fm.heroAlt || '')}">` : draft ? '<div class="gd-hero-pic gd-shot">Your photo or a real screenshot goes here</div>' : ''}
</header>
<div class="gd-body s3-read">
 ${answer ? `<div class="gd-answer"><p class="gd-answer-t">The short answer</p>${answer}</div>` : ''}
 ${intro ? `<div class="gd-intro">${intro}</div>` : ''}
 ${tocHtml}
 <article>${html}${faqHtml}${sources}</article>
 <aside class="gd-author" aria-label="About the author"><div class="gd-face" aria-hidden="true">${fm.authorPhoto ? `<img src="${fm.authorPhoto}" alt="">` : 'M'}</div><div><p class="gd-author-n">Written by ${esc(fm.author)}</p><p>${inline(fm.authorBio)}</p></div></aside>
</div>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;

  return {
    key: `guide-${fm.slug}${draft ? '.draft' : ''}`,
    id: draft ? null : (Number(fm.wpId) || null),
    title: fm.title,
    html: s3shell(page, CSS),
  };
}

export function buildAll() {
  if (!fs.existsSync(DIR)) return [];
  const out = [];
  for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
    out.push(render(f, { draft: true }));
    try { out.push(render(f, { draft: false })); } catch (e) { console.log('  (publish copy skipped) ' + e.message); }
  }
  return out;
}

const CSS = `
/* Hero: same headline standard as the other v3 heroes (v3.css, 2026-10-27) */
.gd-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(28px,4vw,72px);align-items:center;padding:clamp(32px,4.5vw,72px) 0 clamp(32px,4vw,56px)}
.gd-hero-pic{width:100%;max-height:calc(100vh - 220px);aspect-ratio:4/3;object-fit:cover;border-radius:20px}
.gd-hero h1{font-size:clamp(3rem,6vw,6.2rem)!important;line-height:.95!important;letter-spacing:-.02em!important;max-width:14ch}
.gd-hero h1 em{font-style:italic}
.gd-hero .s3-lede{margin-top:24px}
.s3 .gd-meta{display:flex;flex-wrap:wrap;gap:8px 28px;margin-top:28px;font-size:var(--s3-fs-fine);color:var(--s3-muted)}
.gd-meta a{color:var(--s3-ink)}

/* Reading column */
.gd-body{padding-bottom:var(--s3-sec)}
.gd-body article>*+*{margin-top:1.1em}
.gd-body p,.gd-body li{font-size:var(--s3-fs-body);line-height:1.65}
.gd-body h2{font-size:var(--s3-fs-h3)!important;line-height:1.08;margin-top:1.4em!important;scroll-margin-top:110px}
.s3 .gd-intro{margin-top:28px}
.s3 .gd-intro p+p{margin-top:1.1em}
.gd-body h3{font-size:var(--s3-fs-title)!important;line-height:1.15;margin-top:1.6em!important;scroll-margin-top:110px}
.gd-body ul,.gd-body ol{padding-left:1.3em}
.gd-body li+li{margin-top:.45em}
.gd-body a{text-decoration-color:var(--s3-sky);text-decoration-thickness:2px;text-underline-offset:3px}
.gd-body code{font-size:.95em;background:var(--s3-mist);padding:.08em .35em;border-radius:6px}
.gd-body figure img{border-radius:16px;width:100%}
.gd-shot{aspect-ratio:16/10;border-radius:16px;border:2px dashed #8f8a83;display:grid;place-items:center;color:var(--s3-muted);font-size:var(--s3-fs-body)}
.gd-body figcaption{margin-top:10px;font-size:var(--s3-fs-fine);color:var(--s3-muted)}
.gd-body blockquote{border-left:3px solid var(--s3-pink);padding-left:22px}
.gd-body blockquote p{font:italic 400 var(--s3-fs-lede)/1.4 var(--s3-serif)}

/* Short answer + contents */
.gd-answer{background:var(--s3-mist);border-radius:18px;padding:28px 30px}
.gd-answer-t,.gd-toc-t,.gd-trap-t,.gd-note-t{font:800 var(--s3-fs-label)/1.2 var(--s3-sans);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px!important}
.s3 .gd-answer p+p{margin-top:.8em}
.gd-toc{margin:40px 0 8px;padding:0 0 28px;border-bottom:1px solid var(--s3-line)}
.gd-toc ol{padding-left:1.3em;columns:2;column-gap:40px}
.gd-toc li{break-inside:avoid;font-size:var(--s3-fs-body)}
.gd-toc a{text-decoration:none}
.gd-toc a:hover{text-decoration:underline;text-decoration-color:var(--s3-sky)}

/* Trap box, product card */
.gd-trap{background:#fff;border-radius:18px;padding:24px 28px}
.gd-trap p+p{margin-top:.6em}
.gd-cta{display:grid;grid-template-columns:200px 1fr;gap:28px;align-items:center;background:var(--s3-mist);border-radius:20px;padding:24px;margin:2.4em 0!important}
.gd-cta img{border-radius:14px;width:100%}
.gd-cta-name{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important}
.gd-cta-price{font-size:var(--s3-fs-fine)!important;color:var(--s3-muted);margin:6px 0 16px!important}
.gd-cta .s3-btn{margin-top:4px}

/* Table */
.gd-table{overflow-x:auto;border-radius:16px;background:#fff}
.gd-table table{border-collapse:collapse;width:100%;min-width:520px;font-size:var(--s3-fs-fine)}
.gd-table th,.gd-table td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--s3-line);vertical-align:top}
.gd-table thead th{font-weight:700}
.gd-table tbody tr:last-child>*{border-bottom:0}
.gd-table tbody th{font-weight:500}

/* FAQ, sources, author */
.gd-faq{margin-top:3em!important}
.gd-faq h2{margin-bottom:.6em}
.gd-sources{margin-top:3em!important}
.gd-sources li,.gd-sources p{font-size:var(--s3-fs-fine)!important;overflow-wrap:anywhere}
.gd-author{display:flex;gap:22px;align-items:center;margin-top:56px;padding-top:32px;border-top:1px solid var(--s3-line)}
.gd-face{flex:none;width:84px;height:84px;border-radius:50%;box-shadow:0 0 0 3px var(--s3-pink);overflow:hidden;display:grid;place-items:center;background:var(--s3-mist);font:400 2.4rem/1 var(--s3-serif)}
.gd-face img{width:100%;height:100%;object-fit:cover}
.gd-author-n{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important;margin-bottom:6px!important}
.gd-author p{font-size:var(--s3-fs-body)}

/* Slim product mention */
.s3 .gd-slim{border-left:3px solid var(--s3-sky);padding:6px 0 6px 20px;font-size:var(--s3-fs-body)}
.gd-slim a{font-weight:700;white-space:nowrap}

/* Bar chart */
.gd-bars{background:#fff;border-radius:18px;padding:26px 28px}
.gd-bars figcaption{font:400 var(--s3-fs-title)/1.15 var(--s3-serif);color:var(--s3-ink);margin:0 0 18px}
.gd-bar-g+.gd-bar-g{margin-top:18px}
.s3 .gd-bar-g>p{font-weight:700;font-size:var(--s3-fs-fine);margin-bottom:8px}
.gd-bar{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center;font-size:var(--s3-fs-fine)}
.gd-bar+.gd-bar{margin-top:6px}
.gd-bar-t{display:flex;align-items:center;gap:10px}
.gd-bar-t i{display:block;height:22px;border-radius:0 6px 6px 0;background:var(--s3-muted)}
.gd-bar.you .gd-bar-t i{background:var(--s3-sky)}
.gd-bar-t b{white-space:nowrap}
.gd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* Flow */
.s3 .gd-flow{list-style:none;padding:0;display:grid;grid-template-columns:repeat(var(--n),1fr);gap:20px;counter-reset:f;position:relative}
.gd-flow li{counter-increment:f;position:relative;padding-top:58px;margin:0!important}
.gd-flow li::before{content:counter(f);position:absolute;top:0;left:0;width:42px;height:42px;border-radius:50%;background:var(--s3-navy);color:#fff;display:grid;place-items:center;font:400 1.5rem/1 var(--s3-serif);z-index:1}
.gd-flow li:not(:last-child)::after{content:"";position:absolute;top:20px;left:42px;right:-20px;height:2px;background:var(--s3-sky)}
.gd-flow b{display:block;font:400 var(--s3-fs-title)/1.1 var(--s3-serif);margin-bottom:6px}
.gd-flow span{display:block;font-size:var(--s3-fs-fine);line-height:1.5;color:var(--s3-muted)}

/* Writing notes: draft preview only */
.gd-note{border:2px dashed #8f8a83;border-radius:16px;padding:20px 24px;background:#fffbe8}
.gd-note p,.gd-note li{font-size:var(--s3-fs-fine)!important}
.s3 .gd-note>*+*{margin-top:.6em}

@media (max-width:900px){.gd-hero{grid-template-columns:1fr}.gd-hero-pic{max-height:none}}
@media (max-width:700px){
 .s3 .gd-flow{grid-template-columns:1fr;gap:22px}
 .gd-flow li{padding:0 0 0 60px;min-height:42px}
 .gd-flow li:not(:last-child)::after{top:42px;left:20px;right:auto;bottom:-22px;width:2px;height:auto}
 .gd-bar{grid-template-columns:84px 1fr;gap:8px}
 .gd-bars{padding:22px 18px}
 .gd-toc ol{columns:1}
 .gd-cta{grid-template-columns:1fr;padding:20px}
 .gd-cta img{max-width:220px}
 .gd-answer,.gd-trap{padding:22px 20px}
}`;
