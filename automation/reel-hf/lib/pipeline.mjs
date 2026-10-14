// Where every Reel stands, for the overnight (1am) and evening (7pm) runs and the review hub.
// Reads each Reel folder's review/decisions.json (her page choices), review/render.json (last render) and
// review/posted.json (queued in Buffer), and prints one line per Reel with the next action.
// Usage: node lib/pipeline.mjs            → table
//        node lib/pipeline.mjs --json     → JSON (for scripts)
//        node lib/pipeline.mjs --mark <reel> → record that Claude has acted on her latest decisions
// Stages: plan (waiting on her: Plan it) · edit (waiting on her: Edit it) · render (evening run renders it) ·
//         approve (waiting on her: Approve it) · post (Claude posts it, skill step 7) · done · no-page (no review data)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(HERE, '..');
const MEDIA = JSON.parse(readFileSync(path.join(ROOT, '../carousels/config/media.json'), 'utf8'));
export const finalFile = (slug) => path.join(MEDIA.reelExportsDir, 'final', `${slug}.mp4`);
export const coverFile = (slug) => path.join(MEDIA.reelExportsDir, slug, 'cover.png');
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
  const renderCurrent = !!(rendered?.ok && final && rendered.hash === decisionsHash(D));
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
  else if (newDecisions && asks && ok('look')) stage = 'revise';
  else if (!ok('look')) stage = 'plan';
  else if (!ok('sound')) stage = 'edit';
  else if (!renderCurrent) stage = 'render';
  else if (!ok('video')) stage = 'approve';
  else stage = 'post';
  return { slug, stage, approved: A, pass: pass || null, asks: openAsks(D), newDecisions, savedAt: D.savedAt || null, redoSounds, rendered: rendered?.at || null, final: final ? finalFile(slug) : null, posted: posted || null, postAfter: D.postAfter || null };
}

export const allReels = () => readdirSync(ROOT).filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && existsSync(path.join(ROOT, d, 'build.mjs'))).sort();

const NEXT = {
  'no-page': 'no review page yet (overnight run drafts it, or legacy Reel)',
  plan: 'waiting on Mercedes: Plan it',
  edit: 'waiting on Mercedes: Edit it',
  revise: "Claude's turn: apply her change requests, then she reviews again",
  render: 'evening run renders it',
  approve: 'waiting on Mercedes: Approve it',
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
    writeFileSync(path.join(ROOT, slug, 'review/pass.json'), JSON.stringify(args.includes('--revised') ? { at, revised: at } : { at }));
    console.log(`${slug}: marked as acted on${args.includes('--revised') ? ' (revised: she reviews again)' : ''}`);
  } else {
    const rows = allReels().map(reelStatus);
    if (args.includes('--json')) console.log(JSON.stringify(rows, null, 1));
    else for (const r of rows) console.log(`${r.slug.padEnd(44)} ${r.stage.padEnd(8)} ${NEXT[r.stage]}${r.newDecisions && r.stage !== 'done' ? ' · NEW CHOICES to read (import.mjs)' : ''}${r.redoSounds.length ? ` · redo sounds F${r.redoSounds.join(', F')}` : ''}`);
  }
}
