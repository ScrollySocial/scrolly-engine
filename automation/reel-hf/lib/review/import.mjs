// Reads her review back: prints every note, cut, sound change, music change, cover pick and rule from
// <reel>/review/decisions.json as a plain change list, tied to a time and frame, for Claude to act on.
// Sound and music changes already apply on the next build (lib/reel.mjs reads decisions.json); cuts need the take
// re-cut (find the words in plan.json's source transcript, adjust the keep list, re-run prep-footage).
// Usage: node lib/review/import.mjs <reel-folder>
//        node lib/review/import.mjs <reel-folder> --done   (after making her change requests: files them under
//        "handled" so the page stops counting them, and marks the Reel revised so she checks it and approves again)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || '.');
const R = JSON.parse(readFileSync(path.join(dir, 'review/reel.json'), 'utf8'));
const decFile = path.join(dir, 'review/decisions.json');
if (!existsSync(decFile)) { console.log('No review decisions yet.'); process.exit(0); }
const D = JSON.parse(readFileSync(decFile, 'utf8'));
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const where = (p) => (p.x == null ? '' : ` (${p.y < 35 ? 'top' : p.y < 65 ? 'middle' : 'bottom'}${p.x < 33 ? ' left' : p.x > 67 ? ' right' : ''}, x ${p.x}% y ${p.y}%)`);
const frame = (n) => R.frames.find((f) => f.n === n);
const out = [];

const LABEL = { k: 'KEEP', c: 'CHANGE', r: 'REMOVE' };
for (const [n, b] of Object.entries(D.board || {})) if (b.state || b.note) out.push(`${LABEL[b.state] || 'NOTE'} F${n} ${frame(+n)?.title || ''}${b.note ? ': ' + b.note : ''}`);
for (const [k, at] of Object.entries(D.approved || {})) out.push(`APPROVED step "${k}" at ${at}`);
for (const [n, b] of Object.entries(D.visual || {})) if (b.state || b.note) out.push(`LOOK ${LABEL[b.state] || 'NOTE'} F${n} ${frame(+n)?.title || ''}${b.note ? ': ' + b.note : ''}`);
for (const [i, e] of Object.entries(D.captions || {})) out.push(`CAPTION #${i} “${R.captions?.[+i]?.t || ''}”: ${[e.style, e.text && 'text → ' + e.text, e.mark?.length && 'marker on words ' + e.mark.join(',')].filter(Boolean).join(', ')} (applies on next build)`);
if (D.captionFont) out.push(`CAPTION FONT: ${D.captionFont} (applies on next build)`);
for (const n of D.videoNotes || []) out.push(`VIDEO NOTE ${fmt(n.t)}: ${n.text}`);
for (const p of D.pins || []) out.push(`NOTE ${fmt(p.t)} F${p.frame} ${frame(p.frame)?.title || ''}${where(p)}: ${p.text || '(empty note: ask her)'}`);
const cut = (D.cut || []).map((i) => R.words[i]).filter(Boolean);
for (const w of cut) out.push(`CUT ${fmt(w.s)} F${w.frame}: "${w.w}" (word ${w.i}; re-cut the take, then rebuild)`);
for (const [id, e] of Object.entries(D.sound || {})) {
  const s = R.sfx.find((x) => x.id === id);
  const what = [e.off && 'switched off', e.name && `swapped to ${e.name}`, e.vol != null && `volume ${Math.round((s?.baseVol ?? 0) * 100)}% → ${Math.round(e.vol * 100)}%`].filter(Boolean).join(', ');
  out.push(`SOUND ${s ? fmt(s.t) + ' F' + s.frame + ' ' + s.base : id}: ${what} (applies on next build)`);
}
if (D.music?.volume != null) out.push(`MUSIC volume ${R.music.baseVolume} → ${D.music.volume} (applies on next build)`);
for (const a of D.addedSfx || []) out.push(`ADDED SOUND ${fmt(a.t)}: ${a.name} (applies on next build)`);
if (D.soundRequests?.trim()) out.push(`SOUND REQUESTS (find options, list file/source/size, ask before downloading): ${D.soundRequests.trim().split(/\s*\n\s*/).join(' | ')}`);
if (D.music?.file) out.push(`MUSIC track → ${D.music.file} (applies on next build)`);
for (const [k, type] of Object.entries(D.transitions || {})) out.push(`TRANSITION into ${k}: ${type} (applies on next build)`);
if (D.look) out.push(`LOOK ${JSON.stringify(D.look)} (applies on next build; check the render, CSS filters on footage)`);
for (const [n, L] of Object.entries(D.lookByFrame || {})) out.push(`LOOK for F${n}: ${L ? JSON.stringify(L) : 'as filmed'} (applies on next build)`);
if (D.post?.caption || D.post?.hashtags) out.push(`POST CAPTION (her edit): ${(D.post.caption ?? R.post?.caption ?? '').replace(/\s+/g, ' ').slice(0, 160)}… | hashtags: ${D.post.hashtags ?? R.post?.hashtags ?? ''}`);
if (D.postAfter) out.push(`AFTER APPROVAL: ${D.postAfter === 'queue' ? 'set the Notion row to Ready (adds it to the Buffer queue; needs a live video URL)' : 'hold: set the Notion row to Approved'}`);
if (D.cover) out.push(`COVER: frame F${D.cover.frame}, ${D.cover.style === 'photo' ? 'full video frame' : 'cut-out on ' + D.cover.bg}, text “${D.cover.text}”${D.cover.aside ? ' + aside “' + D.cover.aside + '”' : ''} (render with lib/cover.mjs renderCovers)`);
else if (D.coverText) out.push(`COVER TEXT: ${D.coverText}${R.coverOptions?.includes(D.coverText) ? '' : ' (her own wording)'}`);
if (D.notes?.trim()) out.push(`GENERAL: ${D.notes.trim()}`);
if (D.rule?.trim()) out.push(`RULE FOR EVERY REEL (add to the handoff spec's Her rules after confirming): ${D.rule.trim()}`);

console.log(out.length ? `${R.slug}: ${out.length} item(s), saved ${D.savedAt}\n` + out.map((l) => '- ' + l).join('\n') : 'Nothing changed: she approved as is.');

if (process.argv.includes('--done')) {
  // file away what was asked (notes, change/remove marks, word cuts, pins, video notes, sound requests); picks stay
  const at = new Date().toISOString(), txt = (x) => String(x || '').trim();
  const take = (o) => { const out = {}; for (const [n, b] of Object.entries(o || {})) if (b.state === 'c' || b.state === 'r' || txt(b.note)) { out[n] = b; if (b.state === 'k') o[n] = { state: 'k' }; else delete o[n]; } return out; };
  const done = { at, visual: take(D.visual), board: take(D.board), cut: D.cut || [], pins: D.pins || [], videoNotes: D.videoNotes || [], soundRequests: D.soundRequests || '', notes: D.notes || '' };
  Object.assign(D, { cut: [], pins: [], videoNotes: [], soundRequests: '', notes: '' });
  D.handled = [...(D.handled || []), done];
  writeFileSync(decFile, JSON.stringify(D, null, 1));
  writeFileSync(path.join(dir, 'review/pass.json'), JSON.stringify({ at, revised: at }));
  console.log(`Filed ${out.length} item(s) as handled; marked revised (her earlier approvals need giving again).`);
}
