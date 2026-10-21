// Where every Reel stands, for the scheduled runs and the review hub.
// Reads each Reel folder's review/decisions.json (page choices), review/render.json (last render) and
// review/posted.json (queued for posting), and prints one line per Reel with the next action.
// Usage: node lib/pipeline.mjs            → table
//        node lib/pipeline.mjs --json     → JSON (for scripts)
//        node lib/pipeline.mjs --mark <reel> → record that Claude has acted on her latest decisions
//        node lib/pipeline.mjs --mark <reel> --sounds → the sound pass is done for the plan she approved (Edit it opens)
// Stages, in order: plan (her: Plan it) · revise (Claude: make the changes she sent) · sounds (Claude: add sounds,
//         music and transitions to the approved plan) · edit (her: Edit it) · render (overnight run renders it) ·
//         approve (her: Approve it) · final (overnight run makes the full-quality render of the draft she approved) ·
//         post (Claude posts it, skill step 7) · done · no-page (no review data)
// With settings render.draft on (the default) the render stage makes a quick draft (15 fps, draft quality) in the
// exports folder's draft/; the full render to final/ waits for Approve it. render.json says which one it is (quality).
// Drafts stop at Plan it (no sounds yet): sounds only go on once she approves the plan, so they're placed once.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, ROOT, ownerName } from './settings.mjs';

export { ROOT };
export const finalFile = (slug) => path.join(P.exports, 'final', `${slug}.mp4`);
export const draftFile = (slug) => path.join(P.exports, 'draft', `${slug}.mp4`);
export const coverFile = (slug) => path.join(P.exports, slug, 'cover.png');
const read = (f, d = null) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return d; } };

// what the render depends on: every choice except approvals, timestamps and the post caption
export function decisionsHash(D = {}) {
  const { approved, savedAt, post, postAfter, ...rest } = D;
  return createHash('sha1').update(JSON.stringify(rest)).digest('hex').slice(0, 10);
}

// her open change requests per step (not picks like a sound swap, which the build applies by itself).
// The review page counts the same things. `node lib/review/import.mjs <reel> --done` files them away once made.
export function openAsks(D = {}) {
  const txt = (x) => String(x || '').trim();
  const changed = (o) => Object.values(o || {}).filter((b) => b.state === 'c' || b.state === 'r' || txt(b.note)).length;
  return {
    look: changed(D.visual) + ((D.cut || []).length ? 1 : 0),
    sound: changed(D.board) + (txt(D.soundRequests) ? 1 : 0) + (D.pins || []).length,
    video: (D.videoNotes || []).length,
    general: txt(D.notes) ? 1 : 0,
  };
}

export function reelStatus(slug) {
  const dir = path.join(ROOT, slug);
  const D = read(path.join(dir, 'review/decisions.json'), {});
  const A = D.approved || {};
  const rendered = read(path.join(dir, 'review/render.json'));
  const posted = read(path.join(dir, 'review/posted.json'));
  const pass = read(path.join(dir, 'review/pass.json'));
  const hasPage = existsSync(path.join(dir, 'review/reel.json'));
  const final = existsSync(finalFile(slug));
  // renders from before drafts existed have no quality: they were full renders
  const isDraft = rendered?.quality === 'draft';
  const renderCurrent = !!(rendered?.ok && existsSync(isDraft ? draftFile(slug) : finalFile(slug)) && rendered.hash === decisionsHash(D));
  // she saved something Claude hasn't acted on yet (notes, cuts, cover, sounds...)
  const newDecisions = !!(D.savedAt && (!pass || D.savedAt > pass.at));
  // moments she changed or removed after sounds were placed: their sounds need a redo
  const redoSounds = Object.entries({ ...(D.board || {}), ...(D.visual || {}) }).filter(([, b]) => b.state === 'c' || b.state === 'r').map(([n]) => +n);
  // change requests (not just picks): a step approved with these goes back to Claude, never on to the render
  const asks = Object.values(openAsks(D)).some(Boolean);
  // once Claude revises (pipeline --mark <reel> --revised), approvals given before that need giving again
  const ok = (k) => A[k] && !(pass?.revised && A[k] < pass.revised);
  let stage;
  if (posted) stage = 'done';
  else if (!hasPage) stage = 'no-page';
  else if (newDecisions && asks && (ok('look') || ok('sound') || ok('video'))) stage = 'revise'; // she sent changes from any step
  else if (!ok('look')) stage = 'plan';
  else if (!(pass?.sounds && pass.sounds >= A.look)) stage = 'sounds'; // sound pass after her latest plan approval
  else if (!ok('sound')) stage = 'edit';
  else if (!renderCurrent) stage = 'render';
  else if (!ok('video')) stage = 'approve';
  else if (isDraft) stage = 'final';
  else stage = 'post';
  return { slug, stage, approved: A, pass: pass || null, asks: openAsks(D), newDecisions, savedAt: D.savedAt || null, redoSounds, rendered: rendered?.at || null, quality: rendered ? rendered.quality || 'full' : null, final: final ? finalFile(slug) : null, posted: posted || null, postAfter: D.postAfter || null };
}

export const allReels = () => readdirSync(ROOT).filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && existsSync(path.join(ROOT, d, 'build.mjs'))).sort();

const NEXT = {
  'no-page': 'no review page yet (overnight run drafts it, or legacy Reel)',
  plan: `waiting on ${ownerName}: Plan it`,
  edit: `waiting on ${ownerName}: Edit it`,
  revise: "Claude's turn: apply her change requests (import.mjs --done), then she reviews again",
  sounds: "Claude's turn: sound pass (sounds, music, transitions), then pipeline --mark <reel> --sounds",
  render: 'evening run renders it',
  approve: `waiting on ${ownerName}: Approve it`,
  final: 'evening run makes the full-quality render (she approved the draft)',
  post: 'Claude posts it (skill step 7)',
  done: 'queued / posted',
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === '--mark') {
    const slug = path.basename(args[1] || '');
    if (!existsSync(path.join(ROOT, slug, 'review'))) throw new Error(`no review folder for ${slug}`);
    const at = new Date().toISOString();
    // --revised: Claude changed what she approved, so her approvals before now must be given again
    // --sounds: the sound pass is done, so Edit it opens. Earlier marks are kept (merged).
    const f = path.join(ROOT, slug, 'review/pass.json'), prev = read(f, {});
    writeFileSync(f, JSON.stringify({ ...prev, at, ...(args.includes('--revised') ? { revised: at } : {}), ...(args.includes('--sounds') ? { sounds: at } : {}) }));
    console.log(`${slug}: marked as acted on${args.includes('--revised') ? ' (revised: she reviews again)' : ''}${args.includes('--sounds') ? ' (sound pass done: Edit it is open)' : ''}`);
  } else {
    const rows = allReels().map(reelStatus);
    if (args.includes('--json')) console.log(JSON.stringify(rows, null, 1));
    else for (const r of rows) console.log(`${r.slug.padEnd(44)} ${r.stage.padEnd(8)} ${NEXT[r.stage]}${r.newDecisions && r.stage !== 'done' ? ' · NEW CHOICES to read (import.mjs)' : ''}${r.redoSounds.length ? ` · redo sounds F${r.redoSounds.join(', F')}` : ''}`);
  }
}
