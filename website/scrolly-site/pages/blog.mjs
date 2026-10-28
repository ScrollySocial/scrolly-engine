// Blog index (2026-10-28, Mercedes: "I just wanted a blog"). Lists every guide in content/guides/ that is published
// (wpId set), newest first, as one card each. Posts keep their /guides/<slug>/ addresses (Pins and DMs already point
// there). Header/footer come from the global chrome; page CSS is layout only.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { s3shell, esc } from '../lib.mjs';

export const id = null; // set once the WP page exists
export const title = 'Blog';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(here, '..', 'content', 'guides');

function posts() {
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const src = fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\r\n/g, '\n');
    const m = src.match(/^---\n([\s\S]*?)\n---\n/);
    const fm = Object.fromEntries(m[1].split('\n').filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
    // Same read time the guide page shows in its hero, taken from its built page (build guides first).
    const built = path.join(here, '..', 'dist', `guide-${fm.slug}.html`);
    const mins = fs.existsSync(built) ? Number((fs.readFileSync(built, 'utf8').match(/(\d+) min read/) || [])[1]) : 0;
    return { ...fm, mins };
  }).filter((p) => p.wpId).sort((a, b) => (b.published || b.updated).localeCompare(a.published || a.updated));
}

const date = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export function build() {
  const list = posts();
  const body = `
<section class="s3-sec bl-hero"><div class="s3-wrap">
 <h1 class="s3-display">Blog</h1>
 <p class="s3-lede">Step-by-step guides from building my own business, with the real costs and what went wrong.</p>
</div></section>
<section class="bl-list"><div class="s3-wrap">
${list.map((p) => `<article class="bl-card"><a class="bl-pic" href="/guides/${p.slug}/" tabindex="-1" aria-hidden="true"><img src="${p.heroImage}" alt="" loading="lazy"></a>
 <div class="bl-txt"><p class="s3-fine">${date(p.published || p.updated)} · ${p.mins ? `${p.mins} min read` : ''}</p>
 <h2 class="s3-h3"><a href="/guides/${p.slug}/">${esc(p.h1)} ${esc(p.h1Italic)}</a></h2>
 <p>${esc(p.description)}</p>
 <a class="s3-link" href="/guides/${p.slug}/">Read the guide →</a></div></article>`).join('\n')}
</div></section>`;
  return s3shell(body, CSS);
}

const CSS = `
.bl-hero{padding-bottom:clamp(24px,3vw,40px)}
.bl-hero .s3-lede{margin-top:20px}
.bl-list{padding-bottom:var(--s3-sec)}
.bl-card{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:center;padding:clamp(20px,2.5vw,32px);background:#fff;border-radius:24px}
.bl-card+.bl-card{margin-top:32px}
.bl-pic img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px}
.s3 .bl-txt>*+*{margin-top:14px}
.s3 .bl-txt .s3-link{display:inline-block;margin-top:22px}
.bl-txt h2 a{color:inherit;text-decoration:none}
.bl-txt h2 a:hover{text-decoration:underline;text-decoration-color:var(--s3-sky);text-decoration-thickness:3px}
@media (max-width:800px){.bl-card{grid-template-columns:1fr}}
`;
