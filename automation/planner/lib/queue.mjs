// "Queue it" on a card: plan() says exactly what would go to Buffer (shown to her as a preview); run() does it after
// her Confirm click: uploads any slides WordPress doesn't have yet (named tad-carousel-*, never deleted, because
// Buffer fetches them at posting time), then adds the post to the end of that channel's Buffer queue.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queuePost, scheduledCount, CHANNEL_IDS } from './buffer.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CAROUSELS = join(here, '..', '..', 'carousels');
const readJson = (f, d) => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return d;
  }
};
const EXPORTS = readJson(join(CAROUSELS, 'config', 'media.json'), {}).exportsDir || '';
export const FREE_PLAN_LIMIT = 10; // Buffer Free: scheduled posts across all channels
const NAMES = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', pinterest: 'Pinterest' };
export const QUEUEABLE = ['instagram', 'tiktok']; // YouTube needs a title + category; Reels go through the nightly run

// Alt text for a carousel slide: its words, with the big number some layouts show separately ("30" + "consecutive days")
function altFor(slide = {}) {
  const words = [slide.big, slide.text, ...(slide.items || [])].filter(Boolean).join(' ').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  return words.slice(0, 300) || 'Carousel slide';
}

function carouselMedia(carouselId) {
  const dir = join(EXPORTS, carouselId);
  if (!EXPORTS || !existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^slide-\d+\.png$/.test(f)).sort();
  if (!files.length) return null;
  const post = readJson(join(CAROUSELS, 'posts', carouselId, 'post.json'), {});
  const recFile = join(CAROUSELS, 'posts', carouselId, 'wp-media.json');
  const rec = readJson(recFile, []);
  const recTime = existsSync(recFile) ? statSync(recFile).mtimeMs : 0;
  return files.map((f, k) => {
    const r = rec.find((x) => x.slide === f && /\/tad-carousel-/.test(x.url || ''));
    const changed = r && statSync(join(dir, f)).mtimeMs > (r.uploadedAt ? Date.parse(r.uploadedAt) : recTime) + 1000;
    return {
      file: join(dir, f),
      slide: f,
      preview: `/carousel-img/${carouselId}/${f}`,
      url: r && !changed ? r.url : null, // null = not on WordPress yet (or re-rendered since), uploads on Confirm
      alt: altFor(post.slides?.[k]),
    };
  });
}

// What Queue it would send. Never changes anything.
export function plan(card, platform, { keywords = [], scheduled = null } = {}) {
  const lane = card.lanes?.[platform];
  const problems = [];
  if (!QUEUEABLE.includes(platform)) problems.push(`Queue it works for Instagram and TikTok for now.`);
  const name = (NAMES[platform] || platform);
  if (!lane) problems.push(`This idea isn't planned for ${name}.`);
  else if (['Scheduled', 'Posted'].includes(lane.stage)) problems.push(`This one is already ${lane.stage === 'Posted' ? 'posted' : 'in the Buffer queue'} on ${name}.`);
  else if (lane.stage !== 'Ready') problems.push(`Move the ${name} lane to Ready first (it's at ${lane.stage}).`);
  const caption = (lane?.caption || '').trim();
  if (!caption) problems.push('Add the caption first.');
  if (platform === 'instagram' && caption.length > 2200) problems.push(`The caption is ${caption.length} characters; Instagram's limit is 2,200.`);

  let media = card.carouselId ? carouselMedia(card.carouselId) : null;
  if (!media && card.mediaUrl) {
    const video = /\.(mp4|mov)(\?|$)/i.test(card.mediaUrl);
    media = [{ url: card.mediaUrl, preview: video ? null : card.mediaUrl, video, alt: card.title }];
  }
  if (!media?.length) problems.push('No slides or media found for this card (carousel export or posted-file link).');

  // Every post except Stories asks for a comment word that Chat Manager answers (Instagram only answers comments)
  const warnings = [];
  if (card.format !== 'Story' && platform === 'instagram') {
    const k = keywords.find((x) => x.keyword === card.keyword);
    if (!card.keyword) problems.push('Add a comment word first (every post asks for one).');
    else if (!k?.live) problems.push(`The comment word ${card.keyword} isn't marked live in Chat Manager yet.`);
    else if (!caption.toUpperCase().includes(card.keyword)) warnings.push(`The caption doesn't mention "${card.keyword}".`);
  }
  if (platform === 'tiktok' && card.keyword) warnings.push('Chat Manager only answers Instagram comments, so a TikTok comment word gets no automatic DM.');
  if (scheduled != null && scheduled >= FREE_PLAN_LIMIT) problems.push(`Buffer's free plan already has ${scheduled} of ${FREE_PLAN_LIMIT} posts scheduled.`);

  return {
    platform,
    channel: (NAMES[platform] || platform),
    caption,
    media: (media || []).map(({ file, ...m }) => m),
    toUpload: (media || []).filter((m) => !m.url).length,
    draft: lane?.bufferId || null,
    // Post it herself via Buffer's "Notify me" (to add music); unset = carousels yes, everything else automatic.
    byHand: typeof lane?.byHand === 'boolean' ? lane.byHand : card.format === 'Carousel',
    scheduled,
    problems,
    warnings,
    ok: problems.length === 0,
  };
}

// Upload one slide to WordPress media, looking first so a retry never makes a duplicate
async function upload(wp, m, carouselId) {
  const base = `tad-carousel-${carouselId}-${m.slide.replace('.png', '')}`;
  const name = m.url === null && m.stale ? `${base}-r${Date.now().toString(36)}` : base;
  const find = async (n) => {
    const s = (await wp(`/wp-json/wp/v2/media?search=${encodeURIComponent(n)}&per_page=10&_fields=id,source_url`)).json;
    return Array.isArray(s) ? s.find((x) => x.source_url.endsWith(`/${n}.png`)) : null;
  };
  let hit = name === base ? await find(name) : null;
  if (!hit) {
    const r = await wp('/wp-json/wp/v2/media', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${name}.png"` },
      body: readFileSync(m.file),
    });
    hit = r.status < 300 ? r.json : await find(name); // the host can answer 502 on uploads that still land
    if (!hit) throw new Error(`Upload failed for ${m.slide} (${r.status})`);
    await wp(`/wp-json/wp/v2/media/${hit.id}`, { method: 'POST', body: JSON.stringify({ alt_text: m.alt, title: `Carousel: ${carouselId} ${m.slide}` }) });
  }
  return { id: hit.id, url: hit.source_url };
}

// Her Confirm click: upload what's missing, then queue. Returns the Buffer post { id, status, dueAt }.
export async function run(card, platform, key, keywords) {
  const scheduled = await scheduledCount(key);
  const p = plan(card, platform, { keywords, scheduled });
  if (!p.ok) throw Object.assign(new Error(p.problems.join(' ')), { code: 400 });

  let media = card.carouselId ? carouselMedia(card.carouselId) : null;
  if (media?.some((m) => !m.url)) {
    const { wp } = await import('../../../website/scrolly-site/wp-client.mjs');
    const recFile = join(CAROUSELS, 'posts', card.carouselId, 'wp-media.json');
    const rec = readJson(recFile, []);
    for (const m of media) {
      if (m.url) continue;
      m.stale = rec.some((x) => x.slide === m.slide && /\/tad-carousel-/.test(x.url || ''));
      const up = await upload(wp, m, card.carouselId);
      m.url = up.url;
      const entry = { slide: m.slide, id: up.id, url: up.url, alt: m.alt, uploadedAt: new Date().toISOString() };
      const i = rec.findIndex((x) => x.slide === m.slide);
      if (i >= 0) rec[i] = entry;
      else rec.push(entry);
      writeFileSync(recFile, JSON.stringify(rec, null, 1) + '\n'); // after each one, so a failure halfway keeps progress
    }
  }
  if (!media) media = p.media;

  const assets = media.map((m) => (m.video ? { video: { url: m.url } } : { image: { url: m.url, metadata: { altText: m.alt || card.title } } }));
  return { ...(await queuePost(key, { platform, bufferId: p.draft, text: p.caption, assets, byHand: p.byHand })), byHand: p.byHand };
}

export { CHANNEL_IDS };
