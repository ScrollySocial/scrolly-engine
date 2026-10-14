// Turns a Reel into its twin carousel draft, so carousels never need their own ideas.
// Uses the established style D templates (Mercedes 2026-10-10: "we already established carousel templates"):
//   1  big-type cover = the Reel's hook (palette warm or tangerine, pattern)
//   2  hook2 = altHook (top, right-aligned) + swipeLine (bottom, left-aligned)  (content-rules 5)
//   3.. one slide per beat, carouselExtras slotted in. A beat's `carousel` object sets its layout
//       (text, number, formula, chart, phone, chat, checklist, photo) exactly like a post.json slide.
//       Beats without one alternate photo (a 3:4 frame from the Reel) and text, so check.mjs will ask for a third
//       layout kind: give the plainest beats a phone/chat/checklist/number layout before building.
//   last  CTA on the cover look, like the approved posts.
// Then: node check.mjs <id> → node build.mjs <id> → node overview.mjs <id> → show Mercedes.
// Usage: node reel-to-carousel.mjs <reel-id> [--force]   (--force overwrites an existing post.json)
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { HERE, cfg, readJson, writeJson, postDir, MEDIA_INDEX } from './lib/common.mjs';
import { loadReel, lintReel, grabFrame, reelDir } from './lib/reels.mjs';

const [id, ...flags] = process.argv.slice(2);
if (!id) { console.log('Usage: node reel-to-carousel.mjs <reel-id> [--force]'); process.exit(1); }
const reel = loadReel(id);
const { errors, series } = lintReel(reel);
const beats = [...(reel.beats || [])];
// Inserting in reverse at fixed indexes (all relative to the Reel's beats) keeps extras in written order.
for (const x of [...(reel.carouselExtras || [])].reverse()) beats.splice(Math.min(x.after ?? beats.length, beats.length), 0, x);
if (!reel.altHook) errors.push('altHook is empty: slide 2 top line (a second hook, content-rules 5)');
if (!reel.swipeLine) errors.push('swipeLine is empty: slide 2 bottom line that pulls the swipe, e.g. "Here\'s the *5 minute* version →"');
if (beats.length < 2) errors.push(`${beats.length} beat(s); a carousel needs at least 2 content slides (add carouselExtras)`);
for (const k of ['source', 'reader', 'problem', 'outcome', 'mainPoint']) if (!reel.brief?.[k]) errors.push(`brief.${k} is empty`);
if (errors.length) { for (const e of errors) console.log('ERROR   ' + e); process.exit(1); }

const dir = postDir(id);
if (existsSync(path.join(dir, 'post.json')) && !flags.includes('--force')) { console.log(`posts/${id}/post.json exists (edited by hand?). Use --force to regenerate it.`); process.exit(1); }

// 1. Content slides. Explicit `carousel` layouts win; otherwise alternate photo / text.
const PATTERNS = ['grid', 'dots', 'stripes', 'stars'];
let auto = 0;
const content = beats.map((b) => {
  const text = b.carouselText || b.text;
  if (b.carousel) return { text, ...b.carousel, _frame: b.carousel.layout === 'photo' || (b.carousel.layout === 'phone' && b.carousel.useFrame) ? b : null };
  const kind = auto++ % 2 === 0 ? 'photo' : 'text';
  return kind === 'photo' ? { layout: 'photo', text, _frame: b } : { layout: 'text', text, pattern: PATTERNS[(auto >> 1) % PATTERNS.length] };
});

// 2. Frames for slides that show the Reel: 3:4 stills into the shared photo library, indexed like any photo.
const media = cfg('media');
const frameDir = path.join(media.photosDir, 'frames', id);
const c = reel.cover;
const framed = content.filter((s) => s._frame);
// Fresh folder each run: IDs are content hashes, so stale frames from an earlier run would shadow new ones.
rmSync(frameDir, { recursive: true, force: true });
framed.forEach((s, k) => {
  const b = s._frame;
  s._file = `frames/${id}/${String(k + 1).padStart(2, '0')}.jpg`;
  grabFrame(b.clip || c.clip, b.at ?? c.at, path.join(frameDir, path.basename(s._file)), { w: 1080, h: 1440, focus: b.focus });
});
if (framed.length) {
  execFileSync(process.execPath, [path.join(HERE, 'scan-media.mjs')], { cwd: HERE, stdio: 'ignore' });
  const index = readJson(MEDIA_INDEX);
  for (const s of framed) {
    const it = index.items.find((x) => x.file === s._file && !x.missing);
    if (!it) throw new Error(`frame ${s._file} didn't get indexed`);
    s.media = it.id;
    if (!it.tags.length) { it.tags = ['reel-frame', id]; it.textSpace = ['bottom']; it.notes = `frame from ${s._frame.clip || c.clip}`; }
  }
  writeJson(MEDIA_INDEX, index);
}
for (const s of content) { delete s._frame; delete s._file; delete s.useFrame; }

// 3. post.json
mkdirSync(dir, { recursive: true });
const palette = reel.carouselPalette || 'warm';
writeJson(path.join(dir, 'post.json'), {
  id, style: 'D', palette, fromReel: id,
  brief: {
    source: `Reel ${id} (series: ${series?.name}). ${reel.brief.source}`,
    reader: reel.brief.reader, problem: reel.brief.problem, outcome: reel.brief.outcome,
    topic: reel.brief.topic || series?.name, mainPoint: reel.brief.mainPoint,
    structure: reel.brief.structure || 'reel beats, carousel long version', ending: reel.brief.ending || 'CTA from the Reel',
    slide2Check: 'hook2 format (top right-aligned, bottom left-aligned) from the Reel\'s altHook + swipeLine; same promise as the cover, new angle.',
  },
  media: {},
  slides: [
    { text: reel.carouselHook || reel.hook, pattern: reel.coverPattern || 'rays' },
    { layout: 'hook2', top: reel.altHook, bottom: reel.swipeLine },
    ...content,
    { text: reel.cta.carouselText || reel.cta.text },
  ],
  cta: { type: reel.cta.type || 'link-in-bio', ...(reel.cta.offer || series?.offer ? { offer: reel.cta.offer || series.offer } : {}) },
  tigerNod: reel.tigerNod || null,
  caption: reel.carouselCaption || reel.caption || '',
  hashtags: reel.hashtags || [],
  notionUrl: null,
});
const research = path.join(reelDir(id), 'research.md');
const target = path.join(dir, 'research.md');
if (existsSync(research)) copyFileSync(research, target);
else if (!existsSync(target)) writeFileSync(target, readFileSync(path.join(HERE, 'research/record-template.md'), 'utf8').replace('<topic>', `${id} (from Reel)`));
console.log(`carousel draft posts/${id}/post.json (${content.length + 3} slides, style D ${palette}, ${framed.length} Reel frame(s)). Next: node check.mjs ${id}`);
