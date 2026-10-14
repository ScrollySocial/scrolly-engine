// Legal + utility pages (v3, 2026-10-03): Privacy 64, Terms 65, Refund 66, Accessibility 171, Contact 124.
// Text lives in content/legal/<slug>.html (extracted from the live pages 2026-10-03; edit there). Restrained reading layout on the
// shared .s3 components (chrome/v3.css): serif title, lede, .s3-prose body, then the contact form. Old eyebrow kickers dropped.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { s3shell } from '../lib.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  ['privacy', 64, 'Privacy Policy'],
  ['terms', 65, 'Terms of Service'],
  ['refund', 66, 'Refund Policy'],
  ['accessibility', 171, 'Accessibility'],
  ['contact', 124, 'Contact'],
  ['about', 119, 'About'],
];

const CSS = `
.s3 .lg-h1{font-size:var(--s3-fs-h2)!important;line-height:1.02!important;letter-spacing:-.035em!important}
.s3 .lg-head .s3-lede{margin-top:22px}
.s3 .lg-body{margin-top:clamp(40px,5vw,64px)}
.s3 .lg-body>p:first-child{color:var(--s3-muted)}
.s3 .lg-form{margin-top:var(--s3-sec);padding-top:clamp(40px,5vw,64px);border-top:1px solid var(--s3-line)}
.s3 .lg-form h2{font:400 var(--s3-fs-h3)/1.08 var(--s3-serif)!important}
.s3 .lg-form>p{margin-top:12px;font-size:var(--s3-fs-body)}
.s3 .lg-contact .s3-split{align-items:start}
.s3 .lg-contact .lg-form{margin-top:0;padding-top:0;border-top:0}
.s3 .lg-contact .lg-help{margin-top:clamp(32px,4vw,48px)}
.s3 .lg-contact .lg-help h2{font:400 var(--s3-fs-title)/1.15 var(--s3-serif)!important}
.s3 .lg-contact .lg-help p{margin-top:10px}
`;

function parts(slug) {
  const src = fs.readFileSync(path.join(here, '..', 'content', 'legal', slug + '.html'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '');
  const h1 = src.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const intro = src.match(/<p class="intro">([\s\S]*?)<\/p>/)[1];
  const body = src.split('<!-- body -->')[1].split('<!-- form -->')[0].trim();
  const form = (src.split('<!-- form -->')[1] || '').trim();
  return { h1, intro, body, form };
}

// The form keeps its own lines: WordPress needs the shortcode on separate lines, so it is not collapsed by s3shell's whitespace pass.
const formBlock = (form, id) => {
  const m = form.match(/^<h2>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>\s*([\s\S]*)$/);
  return `<section class="lg-form" aria-labelledby="${id}"><h2 id="${id}">${m[1]}</h2><p>${m[2]}</p>\n${m[3]}\n</section>`;
};

function page(slug, id, title) {
  const { h1, intro, body, form } = parts(slug);
  const head = `<header class="lg-head"><h1 class="lg-h1">${h1}</h1><p class="s3-lede">${intro}</p></header>`;
  let html;
  if (slug === 'contact') {
    html = `<article class="lg lg-contact s3-sec tight"><div class="s3-wrap s3-split"><div>${head}<div class="lg-help">${body}</div></div><div>${formBlock(form, 'lg-form-h')}</div></div></article>`;
  } else {
    html = `<article class="lg s3-sec tight"><div class="s3-read">${head}<div class="s3-prose lg-body">${body}</div>${form ? formBlock(form, 'lg-form-h') : ''}</div></article>`;
  }
  // Shortcodes must stay on their own lines: protect them from s3shell's newline collapsing.
  const keep = [];
  html = html.replace(/\[contact-form[\s\S]*?\[\/contact-form\]/g, (sc) => { keep.push(sc); return `@@SC${keep.length - 1}@@`; });
  let out = s3shell(html, CSS);
  out = out.replace(/@@SC(\d+)@@/g, (_, i) => `\n${keep[Number(i)]}\n`);
  return { key: slug, id, title, meta: { _elementor_edit_mode: '' }, html: out };
}

export function buildAll() {
  return PAGES.map(([slug, id, title]) => page(slug, id, title));
}
