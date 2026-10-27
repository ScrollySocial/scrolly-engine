// Posting route: makes the posting copy of a rendered Reel and (reel-settings.json → posting.videoHost 'wordpress')
// uploads it to a WordPress media library, which gives a scheduler like Buffer a link that never expires.
// Posting copy = the final render with cover.png as frame 0 (1/30 s; Buffer's API only takes a thumbnail frame
// offset, so the cover goes in as the first frame), H.264 CRF 20 capped at 9 Mbps (~45-65 MB for 60s).
// videoHost 'none': stops at the posting copy and prints its path (post it by hand).
// Then Claude adds it to the scheduler (Buffer: create_post, addToQueue, Instagram reel, thumbnailOffset 0) and updates
// the tracker card; this script records it in <reel>/review/posted.json only after that
// (pass --buffer <post id> --scheduled <iso> on a second call to record it).
// Usage: node lib/post-reel.mjs <reel>                       → posting copy + WP upload, prints JSON
//        node lib/post-reel.mjs <reel> --buffer <id> --scheduled <iso>  → writes review/posted.json
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { coverFile, finalFile, ROOT } from './pipeline.mjs';
import { P, S, tool } from './settings.mjs';

const args = process.argv.slice(2);
const slug = path.basename(args[0] || '');
const dir = path.join(ROOT, slug);
if (!slug || !existsSync(dir)) throw new Error('usage: node lib/post-reel.mjs <reel>');
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const prepFile = path.join(dir, 'review/post-upload.json');

if (opt('--buffer')) {
  const up = JSON.parse(readFileSync(prepFile, 'utf8'));
  writeFileSync(path.join(dir, 'review/posted.json'), JSON.stringify({ at: new Date().toISOString(), buffer: opt('--buffer'), scheduled: opt('--scheduled'), ...up }, null, 1));
  console.log(`${slug}: recorded as queued in ${S.posting.scheduler || "the queue"} (${opt('--buffer')})`);
  process.exit(0);
}

// already uploaded this render? reuse it (safe to re-run)
const render = JSON.parse(readFileSync(path.join(dir, 'review/render.json'), 'utf8'));
if (render.quality === 'draft') throw new Error(`${slug}: the latest render is the review draft. Run node lib/render-ready.mjs --only ${slug} for the full-quality render first`);
if (existsSync(prepFile)) {
  const prev = JSON.parse(readFileSync(prepFile, 'utf8'));
  if (prev.renderAt === render.at) { console.log(JSON.stringify(prev, null, 1)); process.exit(0); }
}
if (!existsSync(finalFile(slug))) throw new Error(`no render at ${finalFile(slug)}`);
if (!existsSync(coverFile(slug))) throw new Error(`no cover at ${coverFile(slug)}: pick one on the page (Plan it → Cover), then run render-ready`);

const out = path.join(dir, 'renders', `${slug}-post.mp4`);
execFileSync(tool('ffmpeg'), ['-v', 'error', '-y',
  '-framerate', '30', '-i', coverFile(slug), '-i', finalFile(slug),
  '-filter_complex', // one cover frame, then the video; both on a 1/30 s clock so concat keeps the cover frame
  '[0:v]scale=1080:1920,setsar=1,format=yuv420p,settb=1/30,setpts=N[c];[1:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p,settb=1/30,setpts=N[v];[c][v]concat=n=2:v=1:a=0[vo];[1:a]adelay=33:all=1[ao]',
  '-map', '[vo]', '-map', '[ao]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '9M', '-bufsize', '18M',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
const mb = +(statSync(out).size / 1e6).toFixed(1);

if (S.posting.videoHost !== 'wordpress') {
  const res = { slug, renderAt: render.at, postCopy: out, mb, videoUrl: null, note: 'no video host set (reel-settings.json posting.videoHost): upload postCopy by hand' };
  writeFileSync(prepFile, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  process.exit(0);
}
const { wp, BASE } = await import(pathToFileURL(P.wordpressClient).href);
const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'video/mp4', 'Content-Disposition': `attachment; filename="${slug}.mp4"` }, body: readFileSync(out) });
if (r.status >= 300 || !r.json?.id) throw new Error(`WordPress upload failed (${r.status}): ${JSON.stringify(r.json).slice(0, 300)}`);
const res = { slug, renderAt: render.at, postCopy: out, mb, wpMediaId: r.json.id, videoUrl: r.json.source_url, site: BASE };
writeFileSync(prepFile, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
