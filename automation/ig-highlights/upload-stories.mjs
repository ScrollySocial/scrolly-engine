// Hosts the Freebies highlight Stories (and their TikTok versions) in WordPress media so Buffer can fetch them when it posts (the Buffer API takes
// URLs only). Files are named tad-story-*; never delete them before the Stories have posted. Looks first, so a rerun
// never makes duplicates. Records ids and URLs in wp-media.json.
// Usage: node upload-stories.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wp } from '../../website/scrolly-site/wp-client.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = 'C:/Users/merce/OneDrive/Scrolly Media/exports/ig-highlights';
const FILES = [
  { key: 'cover', file: `${MEDIA}/freebies.png`, name: 'tad-story-freebies-cover', type: 'image/png', alt: 'Freebies: free tools for your business. Tap through for quizzes, calculators and guides.' },
  { key: '1-offer-quiz', file: `${MEDIA}/freebies-video/1-offer-quiz.mp4`, name: 'tad-story-freebies-1-offer-quiz', type: 'video/mp4' },
  { key: '2-next-move', file: `${MEDIA}/freebies-video/2-next-move.mp4`, name: 'tad-story-freebies-2-next-move', type: 'video/mp4' },
  { key: '3-calculators', file: `${MEDIA}/freebies-video/3-calculators.mp4`, name: 'tad-story-freebies-3-calculators', type: 'video/mp4' },
  { key: '4-blog', file: `${MEDIA}/freebies-video/4-blog.mp4`, name: 'tad-story-freebies-4-blog', type: 'video/mp4' },
  { key: '1-offer-quiz-tiktok', file: `${MEDIA}/freebies-video/1-offer-quiz-tiktok.mp4`, name: 'tad-tiktok-freebies-1-offer-quiz', type: 'video/mp4' },
  { key: '2-next-move-tiktok', file: `${MEDIA}/freebies-video/2-next-move-tiktok.mp4`, name: 'tad-tiktok-freebies-2-next-move', type: 'video/mp4' },
  { key: '3-calculators-tiktok', file: `${MEDIA}/freebies-video/3-calculators-tiktok.mp4`, name: 'tad-tiktok-freebies-3-calculators', type: 'video/mp4' },
  { key: '4-blog-tiktok', file: `${MEDIA}/freebies-video/4-blog-tiktok.mp4`, name: 'tad-tiktok-freebies-4-blog', type: 'video/mp4' },
];
const REC = path.join(HERE, 'wp-media.json');
const rec = existsSync(REC) ? JSON.parse(readFileSync(REC, 'utf8')) : {};

const find = async (n, ext) => {
  const s = (await wp(`/wp-json/wp/v2/media?search=${encodeURIComponent(n)}&per_page=10&_fields=id,source_url`)).json;
  return Array.isArray(s) ? s.find((x) => x.source_url.endsWith(`/${n}.${ext}`)) : null;
};
for (const f of FILES) {
  const ext = f.type === 'video/mp4' ? 'mp4' : 'png';
  let hit = await find(f.name, ext);
  if (!hit) {
    const r = await wp('/wp-json/wp/v2/media', {
      method: 'POST',
      headers: { 'Content-Type': f.type, 'Content-Disposition': `attachment; filename="${f.name}.${ext}"` },
      body: readFileSync(f.file),
    });
    hit = r.status < 300 ? r.json : await find(f.name, ext); // the host can answer 502 on uploads that still land
    if (!hit) throw new Error(`Upload failed for ${f.key} (${r.status})`);
    if (f.alt) await wp(`/wp-json/wp/v2/media/${hit.id}`, { method: 'POST', body: JSON.stringify({ alt_text: f.alt }) });
  }
  rec[f.key] = { id: hit.id, url: hit.source_url, uploadedAt: rec[f.key]?.uploadedAt || new Date().toISOString() };
  writeFileSync(REC, JSON.stringify(rec, null, 1) + '\n');
  console.log(f.key.padEnd(14), hit.id, hit.source_url);
}
