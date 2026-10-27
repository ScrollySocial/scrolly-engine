// Ideas: one card per idea, with a lane per platform that moves on its own (Mercedes 2026-10-27).
// Stored in data/ideas.json. This replaces the Notion Content Pipeline once the move is done
// (vault products/my-planner/plan.md has the switch-over steps).
import { randomBytes } from 'node:crypto';

export const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'pinterest'];
// Buffer platforms. A lane that's null isn't planned for that platform.
export const STAGES = ['Idea', 'Script', 'Film', 'Edit', 'Ready', 'Scheduled', 'Posted'];
// Pins come from the generator and the bulk CSV, so Pinterest has its own steps.
export const PIN_STAGES = ['Needs Pins', 'Pins made', 'Scheduled', 'Live'];
export const FORMATS = ['Reel', 'Carousel', 'Single image', 'Short', 'YouTube long-form', 'Live', 'Story'];

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
function cleanExtras(x) {
  if (!x || typeof x !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(x).slice(0, 40)) if (typeof v === 'string' && v) out[str(k, 60)] = str(v, 2000);
  return Object.keys(out).length ? out : null;
}

// Cleans what the page sends, so a bad request can't put junk in the file.
export function cleanIdea(input, existing) {
  const lanes = {};
  for (const p of PLATFORMS) {
    const l = input.lanes?.[p];
    const stages = p === 'pinterest' ? PIN_STAGES : STAGES;
    if (!l || !stages.includes(l.stage)) {
      lanes[p] = null;
      continue;
    }
    lanes[p] = {
      stage: l.stage,
      date: /^\d{4}-\d\d-\d\d$/.test(l.date || '') ? l.date : '',
      caption: str(l.caption, 5000), // YouTube: description
      title: str(l.title, 200), // YouTube title
      bufferId: /^[a-f\d]{24}$/.test(l.bufferId || '') ? l.bufferId : '',
      page: str(l.page, 300), // Pinterest: the site page its Pins link to
    };
  }
  const now = new Date().toISOString();
  const order = Number(input.order);
  return {
    id: existing?.id || randomBytes(6).toString('hex'),
    title: str(input.title, 200).trim() || 'Untitled idea',
    format: FORMATS.includes(input.format) ? input.format : '',
    hook: str(input.hook, 500),
    cta: str(input.cta, 500),
    notes: str(input.notes, 8000),
    product: str(input.product, 100),
    series: str(input.series, 100),
    link: str(input.link, 500), // script or working file
    filmingNotes: str(input.filmingNotes, 3000), // Reels: the footage files and best takes (the nightly run reads it)
    editNotes: str(input.editNotes, 3000),
    // The Reel's folder, relative to automation/reel-hf (set = already drafted; the nightly run skips it)
    reelFolder: /^[\w./-]{1,160}$/.test(input.reelFolder || '') ? input.reelFolder : '',
    mediaUrl: str(input.mediaUrl, 500), // the posted video or image (WordPress media)
    order: input.order !== '' && input.order != null && Number.isFinite(order) ? order : null, // posting order, lower first
    // used by the carousel skill's repeat checks
    carouselId: str(input.carouselId, 200),
    mediaUsed: str(input.mediaUsed, 1000),
    notionId: existing?.notionId || (/^[a-f\d]{32}$/.test(input.notionId || '') ? input.notionId : ''),
    // Notion fields with no planner home yet, kept as they were (read-only on the page)
    fromNotion: existing?.fromNotion || cleanExtras(input.fromNotion),
    archived: Boolean(input.archived),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lanes,
  };
}
