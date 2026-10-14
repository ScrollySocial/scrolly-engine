// Mechanical checks for content-rules.md. These catch the checkable rules; the judgment rules
// (momentum, substance, honesty of the hook) are Claude's final review, listed in SKILL.md.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { cfg, postDir, HERE } from './common.mjs';

const CTA_PATTERNS = {
  'link-in-bio': /link in (my )?bio/i,
  save: /\bsave\b/i,
  share: /\b(send|share)\b/i,
  follow: /\bfollow\b/i,
  comment: /\bcomment\b/i,
};

export function lint(post) {
  const brand = cfg('brand'), dest = cfg('destinations');
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), Wn = (m) => warnings.push(m);
  const slides = post.slides || [];
  const allText = [...slides.map((s) => [s.text, s.top, s.bottom].filter(Boolean).join(' ')), post.caption || '', ...(post.hashtags || [])].join('\n');

  // Planning brief (internal)
  for (const k of ['source', 'reader', 'problem', 'outcome', 'topic', 'mainPoint', 'structure', 'ending']) if (!post.brief?.[k]) E(`brief.${k} is empty`);
  if (!existsSync(path.join(postDir(post.id), 'research.md'))) E('research.md missing (sources + verification notes)');

  // Structure and length
  if (slides.length < 5) E(`${slides.length} slides; minimum is 5 (develop the idea or recommend another format)`);
  if (!['A', 'B', 'C', 'D', 'E'].includes(post.style)) E(`style must be A-E`);
  if (['D', 'E'].includes(post.style)) for (const pal of [post.palette, ...slides.map((s) => s.palette)].filter(Boolean)) if (!brand.palettes[pal] || pal.startsWith('_')) E(`palette "${pal}" is not one of the locked palettes (${Object.keys(brand.palettes).filter((k) => !k.startsWith('_')).join(', ')})`);
  slides.forEach((s, i) => {
    const pal = brand.palettes[s.palette || post.palette];
    if ([].concat(s.overlay || []).includes('circle')) { const m = (s.text || '').match(/\*([^*]+)\*/); if (!m) E(`slide ${i + 1}: circle overlay needs a *word* to circle`); else if (m[1].trim().split(/\s+/).length > 2) Wn(`slide ${i + 1}: circle more than 2 words looks crowded`); }
    if (pal?.wildcard && [].concat(s.overlay || []).some((o) => ['note', 'card'].includes(o))) E(`slide ${i + 1}: no white note/card overlays on wildcard palettes (Mercedes 2026-10-06)`);
  });
  if (post.style === 'C' && !post.format) E('style C needs a format (notes, post-card)');
  if (post.style === 'A' && !post.media?.background && !slides.every((s) => s.media)) E('style A needs media.background');
  if (post.style === 'B') slides.forEach((s, i) => { if (!s.media) E(`slide ${i + 1}: style B needs a media id per slide`); });
  if (post.style === 'B') { const ids = slides.map((s) => s.media).filter(Boolean); if (new Set(ids).size < ids.length) Wn('style B repeats a photo within the post'); }

  // Slide copy
  slides.forEach((s, i) => {
    const t = s.text || [s.top, s.bottom].filter(Boolean).join(' ');
    if (!t.trim()) E(`slide ${i + 1} is empty`);
    const sentences = t.split(/(?<=[.!?])\s+/).filter((x) => x.trim()).length;
    if (sentences > 2) Wn(`slide ${i + 1} has ${sentences} sentences; aim for one thought (split it?)`);
    if (t.length > 160) Wn(`slide ${i + 1} is ${t.length} characters; likely overloaded`);
  });
  if (/\b(zero|0|no|few)\s+(followers|audience)\b|nobody'?s watching|how many followers/i.test(allText)) Wn('audience-size angle; avoid unless Mercedes asked for it (content-rules 1c)');
  for (const o of dest.offers.filter((x) => !x.live)) {
    const name = new RegExp(o.name.replace(/[^a-z0-9 ]/gi, '').split(' ').filter(Boolean).join('\\s+'), 'i');
    if (!name.test(allText)) continue;
    if (!o.upcoming) E(`mentions ${o.name}, which isn't live`);
    else if (!['follow', 'save'].includes(post.cta?.type)) E(`${o.name} is upcoming: teaser posts use a follow or save CTA, not ${post.cta?.type}`);
  }
  // Slide 2 = second hook (content-rules 5): a new angle on slide 1's promise, not the first content point or a reword.
  if (slides.length > 1) {
    const s2 = slides[1].text || [slides[1].top, slides[1].bottom].filter(Boolean).join(' ');
    if (/^\s*(day|step|tip|part|reason|mistake|#)\s*\d|^\s*\d+[.):]/i.test(s2)) E('slide 2 starts like a content point (Day/Step/1.); it must be a second hook (content-rules 5)');
    const w = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9$ ]/g, ' ').split(/\s+/).filter((x) => x.length > 3));
    const a = w(slides[0].text), b = w(s2); let n = 0; for (const x of a) if (b.has(x)) n++;
    if (a.size && n / Math.min(a.size, b.size || 1) > 0.7) Wn('slide 2 reuses most of slide 1\'s words; make it a new angle, not a reword (content-rules 5)');
    if (['D', 'E'].includes(post.style) && (slides[1].layout || 'cover') === (slides[0].layout || 'cover')) E('slide 2 uses the same format as slide 1; give it its own format (e.g. layout "hook2": top right-aligned, bottom left-aligned) (content-rules 5)');
    if (slides[1].layout === 'hook2' && (!slides[1].top || !slides[1].bottom)) E('slide 2 hook2 needs "top" and "bottom" text');
    if (!post.brief?.slide2Check) E('brief.slide2Check is empty: write one line on how slide 2 works as an alternate cover (content-rules 5)');
  }
  // Layout variety (content-rules 7c), for designed styles D/E
  if (['D', 'E'].includes(post.style) && slides.length >= 5) {
    const content = slides.slice(2, -1);
    const lay = (s) => s.layout || 'cover';
    content.forEach((s, k) => { if (lay(s) === 'cover') E(`slide ${k + 3}: content slide uses the cover look; give it a layout (content-rules 7c)`); });
    content.forEach((s, k) => { if (k && lay(s) === lay(content[k - 1]) && !['pano', 'photo', 'image'].includes(lay(s))) E(`slides ${k + 2}-${k + 3}: same layout twice in a row (${lay(s)})`); });
    const kinds = new Set(content.map(lay));
    if (content.length >= 4 && kinds.size < 3 && !content.every((x) => ['pano', 'photo'].includes(lay(x)))) E(`only ${kinds.size} layout(s) across content slides; use at least 3 (content-rules 7c)`);
    const accents = content.filter((s) => /\*[^*]+\*/.test(s.text || '')).length;
    if (accents > 2) E(`${accents} content slides use an accent word; cover only, plus at most 2 (content-rules 7c)`);
  }
  const standIns = [post.media?.background, post.media?.avatar, post.media?.pano, ...slides.map((x) => x.media), ...slides.map((x) => x.cutout)].filter((m) => String(m || '').startsWith('stock:'));
  for (const g of new Set(slides.map((x) => x.grid).filter(Boolean))) {
    const pano = JSON.parse(readFileSync(path.join(HERE, 'data/panoramas.json'), 'utf8'))[g];
    if (String(pano?.media || '').startsWith('stock:')) standIns.push(pano.media);
  }
  if (standIns.length) Wn(`${standIns.length} stand-in stock photo(s); swap in Mercedes's photos before approval (ledger add refuses stand-ins)`);
  if (/but first/i.test(allText)) E('"but first" is banned');

  // Dashes, banned phrasing
  if (/[—]/.test(allText)) E('em dash found (use a period, comma or colon)');
  if (/\s–\s/.test(allText)) E('en dash used as a dash');
  if (/\|/.test(allText)) E('"|" found');
  for (const w of ['secret', 'hack', 'game changer', 'game-changer']) if (new RegExp(`\\b${w}`, 'i').test(allText)) Wn(`uses "${w}"; allowed only when it's genuinely the right word`);
  if (/\b(it'?s|this is|that'?s)\s+not\s+[^.?!]{1,60}[,;]\s*(it'?s|this is|that'?s)\b/i.test(allText)) E('"it\'s not X, it\'s Y" construction');
  if (/,\s*not\s+[^.?!,]{1,30}[.!?]/i.test(allText)) Wn('", not Y" contrast construction; rewrite it as a plain statement');
  if (/\bnot\s+[^.?!,]{1,40},\s*but\b/i.test(allText)) Wn('"not X, but Y" construction; rewrite unless it truly reads naturally');
  if (/(results? (are )?guaranteed|guarantee[sd]? (you|results)|overnight|get rich)/i.test(allText)) E('income/result promise language');

  // CTA
  const cta = post.cta || {};
  if (!CTA_PATTERNS[cta.type]) E(`cta.type must be one of ${Object.keys(CTA_PATTERNS).join(', ')}`);
  if (cta.type === 'comment' && !brand.manychat) E('comment CTAs are off until ManyChat is set up (brand.manychat=false)');
  if (brand.manychat && cta.type !== 'comment') E('ManyChat is on: CTA must be a comment keyword');
  if (cta.type === 'comment' && !dest.commentKeywords.includes(cta.keyword)) E(`keyword "${cta.keyword}" is not a confirmed comment keyword`);
  if (cta.type === 'link-in-bio' && !dest.linkInBio.confirmed) E('link in bio destination not confirmed');
  if (!brand.manychat && /\bcomment\b/i.test([slides.at(-1)?.text, post.caption].join(' '))) E('"comment" CTA wording while ManyChat is off');
  if (cta.offer && !dest.offers.some((o) => o.id === cta.offer && o.live)) E(`offer "${cta.offer}" is not a confirmed live offer`);
  const prices = dest.offers.filter((o) => o.live).map((o) => o.price);
  for (const m of allText.matchAll(/\$\s?(\d[\d,]*)(?![\dKk])/g)) { const v = Number(m[1].replace(/,/g, '')); if (!prices.includes(v)) Wn(`"$${m[1]}" isn't a confirmed offer price; make sure it's a verified fact, not an offer`); }
  const pat = CTA_PATTERNS[cta.type];
  if (pat && slides.length && !pat.test(slides.at(-1).text)) E(`last slide doesn't contain the ${cta.type} CTA`);
  const firstTwo = (post.caption || '').split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
  if (pat && !pat.test(firstTwo)) E(`caption's first two sentences don't contain the ${cta.type} CTA`);

  // Caption + hashtags
  if (!post.caption || post.caption.length < 200) Wn('caption is short; it should add context, an example, a caveat or an application');
  const tags = post.hashtags || [];
  if (tags.length !== brand.hashtagsPerPost) E(`${tags.length} hashtags; exactly ${brand.hashtagsPerPost} required`);
  tags.forEach((t) => { if (!/^#[A-Za-z0-9_]+$/.test(t)) E(`bad hashtag "${t}"`); });
  if (/#\w/.test(post.caption || '')) E('hashtags belong in post.hashtags, not inside the caption text');

  // Tiger nod: at most once
  const nods = (post.tigerNod ? 1 : 0) + ((post.caption || '').match(/🐯|\btiger\b/gi) || []).length;
  if (nods > 1) E('tiger nod appears more than once');
  if (post.tigerNod && !brand.tigerNod.options.includes(post.tigerNod)) E(`tigerNod must be one of ${brand.tigerNod.options.join(', ')}`);

  return { errors, warnings };
}
