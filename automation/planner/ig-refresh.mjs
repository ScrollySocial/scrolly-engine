// "Refresh my grid": reads what's on her Instagram profile right now, so the feed preview's posted part matches
// Instagram (Buffer still lists posts she deleted, and doesn't know posts made in the app).
// Paid: Apify apify/instagram-scraper, about $0.0027 a post (checked 2026-10-12), capped per run below.
// Saves data/ig-profile.json and each post's picture in data/ig-thumbs/ (Instagram's own image links expire).
//   node automation/planner/ig-refresh.mjs [max posts, default 60]
import { writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runActor } from '../reels-test/apify.mjs';
import { HANDLES } from './lib/buffer.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, 'data');
const THUMBS = join(DATA, 'ig-thumbs');
const handle = HANDLES.Instagram.handle;
const max = Number(process.argv[2]) || 60;

const { items, rec } = await runActor('apify/instagram-scraper', {
  directUrls: [`https://www.instagram.com/${handle}/`], resultsType: 'posts', resultsLimit: max, addParentData: false,
}, { maxItems: max, maxTotalChargeUsd: 0.3, timeoutSecs: 240, label: `planner grid refresh @${handle}` });
if (rec.status !== 'SUCCEEDED') throw new Error(`Apify run ${rec.runId} ended ${rec.status}`);
const posts = items.filter((p) => p.shortCode && !p.error);
if (!posts.length) throw new Error(`Apify returned no posts for @${handle} (${items[0]?.error || 'empty'}). Nothing changed.`);

mkdirSync(THUMBS, { recursive: true });
const out = [];
for (const p of posts) {
  const kind = p.type === 'Sidecar' ? 'carousel' : p.type === 'Video' ? 'video' : 'image';
  let thumb = null;
  try {
    const r = await fetch(p.displayUrl);
    if (r.ok) {
      writeFileSync(join(THUMBS, `${p.shortCode}.jpg`), Buffer.from(await r.arrayBuffer()));
      thumb = `/ig-thumb/${p.shortCode}.jpg`;
    }
  } catch {}
  out.push({
    code: p.shortCode, url: p.url || `https://www.instagram.com/p/${p.shortCode}/`, kind,
    count: p.childPosts?.length || (p.images?.length ?? 1), caption: p.caption || '', postedAt: p.timestamp || null,
    pinned: Boolean(p.isPinned), thumb, likes: p.likesCount ?? null, comments: p.commentsCount ?? null,
  });
}
// Instagram's grid: pinned posts first, then newest first
out.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.postedAt).localeCompare(String(a.postedAt)));
const file = join(DATA, 'ig-profile.json');
writeFileSync(`${file}.tmp`, JSON.stringify({ takenAt: new Date().toISOString(), handle, posts: out }, null, 1));
renameSync(`${file}.tmp`, file);
console.log(`@${handle}: ${out.length} posts saved (${out.filter((p) => p.pinned).length} pinned, ${out.filter((p) => !p.thumb).length} without a picture). Apify: $${rec.usageTotalUsd ?? '?'}`);
