// Where every Reel stands, for the scheduled runs and the review hub.
// Reads each Reel folder's review/decisions.json (page choices), review/render.json (last render) and
// review/posted.json (queued for posting), and prints one line per Reel with the next action.
// Usage: node lib/pipeline.mjs            → table
//        node lib/pipeline.mjs --json     → JSON (for scripts)
//        node lib/pipeline.mjs --mark <reel> → record that Claude has acted on the latest decisions
// Stages: plan (waiting on the owner: Plan it) · edit (waiting on the owner: Edit it) · render (next run renders it) ·
//         approve (waiting on the owner: Approve it) · post (Claude posts it, skill step 7) · done · no-page (no review data)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { P, ROOT, ownerName } from './settings.mjs';

export { ROOT };
export const finalFile = (slug) => path.join(P.exports, 'final', `${slug}.mp4`);
export const coverFile = (slug) => path.join(P.exports, slug, 'cover.png');
const read = (f, d = null) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return d; } };

// what the render depends on: every choice except approvals, timestamps and the post caption
export function decisionsHash(D = {}) {
  const { approved, savedAt, post, postAfter, ...rest } = D;
  return createHash('sha1').update(JSON.stringify(rest)).digest('hex').slice(0, 10);
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
  let stage;
  if (posted) stage = 'done';
  else if (!hasPage) stage = 'no-page';
  else if (!A.look) stage = 'plan';
  else if (!A.sound) stage = 'edit';
  else if (!renderCurrent) stage = 'render';
  else if (!A.video) stage = 'approve';
  else stage = 'post';
  // the reviewer saved something Claude hasn't acted on yet (notes, cuts, cover, sounds...)
  const newDecisions = !!(D.savedAt && (!pass || D.savedAt > pass.at));
  // moments changed or removed after sounds were placed: their sounds need a redo
  const redoSounds = Object.entries({ ...(D.board || {}), ...(D.visual || {}) }).filter(([, b]) => b.state === 'c' || b.state === 'r').map(([n]) => +n);
  return { slug, stage, approved: A, newDecisions, savedAt: D.savedAt || null, redoSounds, rendered: rendered?.at || null, final: final ? finalFile(slug) : null, posted: posted || null, postAfter: D.postAfter || null };
}

export const allReels = () => readdirSync(ROOT).filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && existsSync(path.join(ROOT, d, 'build.mjs'))).sort();

const NEXT = {
  'no-page': 'no review page yet (overnight run drafts it, or legacy Reel)',
  plan: `waiting on ${ownerName}: Plan it`,
  edit: `waiting on ${ownerName}: Edit it`,
  render: 'next run renders it',
  approve: `waiting on ${ownerName}: Approve it`,
  post: 'Claude posts it (skill step 7)',
  done: 'queued / posted',
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === '--mark') {
    const slug = path.basename(args[1] || '');
    if (!existsSync(path.join(ROOT, slug, 'review'))) throw new Error(`no review folder for ${slug}`);
    writeFileSync(path.join(ROOT, slug, 'review/pass.json'), JSON.stringify({ at: new Date().toISOString() }));
    console.log(`${slug}: marked as acted on`);
  } else {
    const rows = allReels().map(reelStatus);
    if (args.includes('--json')) console.log(JSON.stringify(rows, null, 1));
    else for (const r of rows) console.log(`${r.slug.padEnd(44)} ${r.stage.padEnd(8)} ${NEXT[r.stage]}${r.newDecisions && r.stage !== 'done' ? ' · NEW CHOICES to read (import.mjs)' : ''}${r.redoSounds.length ? ` · redo sounds F${r.redoSounds.join(', F')}` : ''}`);
  }
}
