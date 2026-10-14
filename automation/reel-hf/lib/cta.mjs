// Every Reel has a purpose: ONE action it asks for (Mercedes 2026-10-14, roadmap Must have #6). Picked in Plan it
// (review page, "Ending" tab) and saved in review/decisions.json as cta: { kind, word, detail, bg, frame }; a Reel's
// build.mjs can set the default from the Notion row's CTA with R.endCard({ kind, … }). The build turns it into:
//   1. an end card after she stops talking (her cut-out on a brand color, the ask above her head, a real-looking UI piece),
//   2. the matching caption line (inserted as the post caption's second sentence unless it's already there),
//   3. a hook reminder on the Plan step (write the hook so the ending pays it off).
// Generic for customer kits: wording comes from here + the brand kit (handle, bioLink, site); no Scrolly names.
// "Comment for a freebie" = she sends the DMs by hand until ManyChat is set up.

const q = (w) => `“${w}”`;
const up = (w) => String(w || '').trim().toUpperCase();

// label = button on the Plan step; needs = which fields the Plan step asks for; hook = the reminder shown with the choice
export const CTAS = {
  follow: {
    label: 'Follow',
    needs: [],
    hook: 'Open with a promise of more to come: a series, a part 1, a problem you solve every week.',
    card: (c, B) => ({ text: '<m>Follow</m> for more', ui: 'follow', aside: B.handle || '' }),
    caption: (c, B) => `Follow ${B.handle || 'along'} for ${c.detail || 'more like this'}.`,
  },
  comment: {
    label: 'Comment a word',
    needs: ['word', 'detail'],
    detailLabel: 'What the word tells you (optional)',
    detailHint: 'if you want part 2',
    hook: 'Ask a question or take a side in the hook, so commenting the word feels like answering it.',
    card: (c) => ({ text: `Comment <m>${up(c.word)}</m>`, ui: 'comment', aside: c.detail || '' }),
    caption: (c) => `Comment ${q(up(c.word))} ${c.detail || 'if you want part 2'}.`,
  },
  share: {
    label: 'Share',
    needs: ['detail'],
    detailLabel: 'Who they send it to',
    detailHint: 'a friend who needs this',
    hook: 'Name the person in the hook (“if your friend still…”), so viewers think of who to send it to.',
    card: (c) => ({ text: '<m>Send this</m> to', ui: 'share', aside: c.detail || 'a friend who needs this' }),
    caption: (c) => `Send this to ${c.detail || 'a friend who needs this'}.`,
  },
  save: {
    label: 'Save',
    needs: ['detail'],
    detailLabel: 'When they come back to it',
    detailHint: 'for your next post',
    hook: 'Promise something worth keeping in the hook: steps, a list, a template, numbers.',
    card: (c) => ({ text: '<m>Save</m> this', ui: 'save', aside: c.detail || 'for later' }),
    caption: (c) => `Save this ${c.detail || 'for later'}.`,
  },
  link: {
    label: 'Link in bio',
    needs: ['detail'],
    detailLabel: 'What the link is',
    detailHint: 'the free guide',
    hook: 'Show the problem the link solves in the hook, so the link feels like the next step.',
    card: (c, B) => ({ text: '<m>Link</m> in my bio', ui: 'link', aside: c.detail || B.bioLink || '' }),
    caption: (c, B) => `${cap(c.detail || B.bioLink || 'The link')} is in my bio.`,
  },
  freebie: {
    label: 'Comment for a freebie',
    needs: ['word', 'detail'],
    detailLabel: 'What they get',
    detailHint: 'the checklist',
    hook: 'Tease the freebie’s result in the hook, so commenting feels worth it.',
    manual: 'You send these DMs yourself for now (no ManyChat yet). Check comments for the word after it posts.',
    card: (c) => ({ text: `Comment <m>${up(c.word)}</m>`, ui: 'dm', aside: `I'll DM you ${c.detail || 'the freebie'}` }),
    caption: (c) => `Comment ${q(up(c.word))} and I'll send you ${c.detail || 'the freebie'}.`,
  },
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// what the Plan step and the build agree on; null if nothing usable was picked
export function resolveCta(c) {
  if (!c?.kind || !CTAS[c.kind]) return null;
  const def = CTAS[c.kind];
  if (def.needs.includes('word') && !String(c.word || '').trim()) return null;
  return { ...c, word: up(c.word), detail: String(c.detail || '').trim() };
}
export const ctaCaption = (c, B) => CTAS[c.kind].caption(c, B);

// put the CTA line second in the caption (writing rules: CTA in the first two sentences), unless it's already in there
export function withCtaLine(caption, line) {
  if (!caption || !line) return caption || line || '';
  if (caption.includes(line)) return caption;
  const m = caption.match(/^[\s\S]*?[.!?](\s+|$)/);
  if (!m) return `${caption.trim()} ${line}`;
  return `${m[0].trimEnd()} ${line} ${caption.slice(m[0].length)}`.trimEnd();
}

// for the review page: labels, field names and hook reminders (no functions)
export const ctaList = () => Object.entries(CTAS).map(([id, d]) => ({ id, label: d.label, needs: d.needs, detailLabel: d.detailLabel || '', detailHint: d.detailHint || '', hook: d.hook, manual: d.manual || '' }));
