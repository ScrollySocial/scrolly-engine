// Buffer: the planner's one shape for a post, and the live GraphQL read (api.buffer.com).
// Live reads need BUFFER_API_KEY in automation/.env; without it the server shows data/buffer-snapshot.json.

export const ORG_ID = '6a59875ed10b3432d14da8d9';
export const CHANNELS = {
  '6a59887880cc80cdcacb635c': 'Instagram',
  '6abfcd1cea19ca0bde552a0a': 'TikTok',
  '6abfd384ea19ca0bde555e4e': 'YouTube',
};

export function normalizePost(n) {
  const assets = n.assets || [];
  return {
    id: n.id,
    status: n.status, // draft | needs_approval | scheduled | sending | sent | error
    channel: CHANNELS[n.channelId] || n.channelService || n.channelId,
    text: n.text || '',
    dueAt: n.dueAt || null,
    sentAt: n.sentAt || null,
    createdAt: n.createdAt || null,
    kind: assets.length > 1 ? 'carousel' : assets[0]?.type || 'text',
    count: assets.length,
    thumb: assets[0]?.thumbnail || assets[0]?.source || null,
    error: n.error?.message || null,
    // Instagram only: story | post | reel. Stories never show on the profile grid.
    igType: n.metadata?.type || null,
  };
}

// Her handles since the rename (vault brand/rename-ambition-department.md). Buffer keeps the name from when each account
// was connected (still "scrollysocial" on 2026-11-02), so the planner shows these instead.
export const HANDLES = {
  Instagram: { handle: 'ambitiondepthq', link: 'https://instagram.com/ambitiondepthq' },
  TikTok: { handle: 'ambitiondepthq', link: 'https://tiktok.com/@ambitiondepthq' },
  YouTube: { handle: 'ambitiondepthq', link: 'https://www.youtube.com/@ambitiondepthq' },
};

// A channel and its Buffer posting times (wall-clock times in the channel's own timezone).
export function normalizeChannel(c) {
  const name = CHANNELS[c.id] || c.service;
  return {
    id: c.id,
    name,
    handle: HANDLES[name]?.handle || c.name,
    link: HANDLES[name]?.link || c.externalLink || null,
    timezone: c.timezone,
    paused: Boolean(c.isQueuePaused),
    schedule: (c.postingSchedule || []).map((d) => ({ day: d.day, times: d.paused ? [] : d.times })),
  };
}

const CHANNEL_QUERY = `query PlannerChannels($org: OrganizationId!) {
  channels(input: { organizationId: $org }) {
    id name service timezone isQueuePaused externalLink
    postingSchedule { day times paused }
  }
}`;

const POST_FIELDS =`id status text dueAt sentAt createdAt channelId channelService
  error { message }
  assets { type source thumbnail }
  metadata { ... on InstagramPostMetadata { type } }`;

// Field names checked against the connector's schema (2026-10-27); not yet run with a real key.
// If Buffer rejects it, the server falls back to the snapshot and shows the error.
const QUERY = `query Planner($org: OrganizationId!, $status: [PostStatus!], $first: Int, $sort: [PostSortInput!]) {
  posts(input: { organizationId: $org, filter: { status: $status }, sort: $sort }, first: $first) {
    edges { node { ${POST_FIELDS} } }
  }
}`;

async function gql(key, query, variables) {
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '));
  return body.data;
}

async function page(key, status, first, direction) {
  const data = await gql(key, QUERY, { org: ORG_ID, status, first, sort: [{ field: 'dueAt', direction }] });
  return data.posts.edges.map((e) => normalizePost(e.node));
}

// ---- Queue it (her click on a card, after the preview) ----
// Adds one post to the end of a channel's Buffer queue: updates her existing draft when the card has one, otherwise
// creates the post. Always mode addToQueue, never shareNow. Buffer re-checks the whole post on every edit, so the
// text, assets and metadata are always sent in full.
export const CHANNEL_IDS = Object.fromEntries(Object.entries(CHANNELS).map(([id, name]) => [name.toLowerCase(), id]));
const RESULT = `... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message }`;
const CREATE = `mutation PlannerCreate($input: CreatePostInput!) { createPost(input: $input) { ${RESULT} } }`;
const EDIT = `mutation PlannerEdit($input: EditPostInput!) { editPost(input: $input) { ${RESULT} } }`;
const ONE = `query PlannerPost($id: PostId!) { post(input: { id: $id }) { id status channelId } }`;

export async function scheduledCount(key) {
  return (await page(key, ['scheduled', 'sending'], 100, 'asc')).length;
}

export async function queuePost(key, { platform, bufferId, text, assets, byHand = false }) {
  const channelId = CHANNEL_IDS[platform];
  if (!channelId) throw new Error(`no Buffer channel for ${platform}`);
  const video = assets.some((a) => a.video);
  const metadata = platform === 'instagram' ? { instagram: { type: video ? 'reel' : 'post', shouldShareToFeed: true } } : undefined;
  const base = { text, assets, ...(metadata ? { metadata } : {}), mode: 'addToQueue', schedulingType: byHand ? 'notification' : 'automatic' };
  // notification = Buffer's "Notify me": the Buffer phone app reminds her at the time and hands the post to Instagram/TikTok.
  let result;
  // Reuse her draft only if it's still a draft on the same channel; a scheduled or sent post is never touched.
  const existing = bufferId ? (await gql(key, ONE, { id: bufferId }).catch(() => null))?.post : null;
  if (existing?.status === 'draft' && existing.channelId === channelId) {
    result = (await gql(key, EDIT, { input: { id: bufferId, ...base, saveToDraft: false } })).editPost;
  } else {
    result = (await gql(key, CREATE, { input: { channelId, ...base } })).createPost;
  }
  if (!result?.post) throw new Error(result?.message || 'Buffer refused the post');
  return result.post; // { id, status, dueAt }
}

// ---- Move queued posts (her drag on the feed preview, then her Confirm) ----
// Buffer re-checks an edit as a whole post, so each post is read in full and sent back with only its time changed
// (mode customScheduled). Every post is checked before the first edit: still scheduled, still at the time the page showed.
// Field names checked against Buffer's schema by introspection (2026-11-03).
const FULL = `query PlannerFull($id: PostId!) { post(input: { id: $id }) {
  id status channelId channelService dueAt text tags { id }
  assets { type source ... on ImageAsset { image { altText userTags { handle x y } } } ... on VideoAsset { video { thumbnailOffset title } } }
  metadata {
    ... on InstagramPostMetadata { type shouldShareToFeed firstComment link isAiGenerated geolocation { id text } stickerFields { music other products text topics } }
    ... on TiktokPostMetadata { title isAiGenerated }
    ... on YoutubePostMetadata { title privacy madeForKids notifySubscribers embeddable license isAiGenerated category { categoryId } }
  } } }`;
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));

export function editInput(p, dueAt) {
  const assets = p.assets.map((a) => {
    if (a.type === 'image') return { image: { url: a.source, metadata: clean({ altText: a.image?.altText || '', userTags: a.image?.userTags?.length ? a.image.userTags : null }) } };
    if (a.type === 'video') return { video: { url: a.source, metadata: clean({ thumbnailOffset: a.video?.thumbnailOffset, title: a.video?.title }) } };
    throw Object.assign(new Error('This post has a file type the planner can\'t move. Move it in Buffer.'), { code: 400 });
  });
  const m = p.metadata || {};
  const metadata = p.channelService === 'instagram'
    ? { instagram: clean({ type: m.type, shouldShareToFeed: m.shouldShareToFeed, firstComment: m.firstComment, link: m.link, isAiGenerated: m.isAiGenerated,
        geolocation: m.geolocation, stickerFields: m.stickerFields ? clean(m.stickerFields) : null }) }
    : p.channelService === 'tiktok' ? { tiktok: clean({ title: m.title, isAiGenerated: m.isAiGenerated }) }
    : p.channelService === 'youtube' ? { youtube: clean({ title: m.title, privacy: m.privacy, madeForKids: m.madeForKids, notifySubscribers: m.notifySubscribers,
        embeddable: m.embeddable, license: m.license, isAiGenerated: m.isAiGenerated, categoryId: m.category?.categoryId }) }
    : null;
  // schedulingType left out on purpose: Buffer keeps "Notify me" or automatic as it was
  return { id: p.id, text: p.text, assets, ...(metadata ? { metadata } : {}), tagIds: (p.tags || []).map((t) => t.id), mode: 'customScheduled', dueAt };
}

export async function movePosts(key, moves, request = gql) {
  if (!Array.isArray(moves) || !moves.length) throw Object.assign(new Error('Nothing to move.'), { code: 400 });
  const now = Date.now();
  const full = [];
  for (const { id, from, dueAt } of moves) {
    const p = (await request(key, FULL, { id }).catch(() => null))?.post; // Buffer answers "Post not found" as an error
    if (!p) throw Object.assign(new Error('A post is gone from Buffer. Refresh the planner.'), { code: 409 });
    if (p.status !== 'scheduled' || Date.parse(p.dueAt) !== Date.parse(from)) {
      throw Object.assign(new Error('Buffer changed since the planner loaded (a post posted or moved). Refresh, then drag again.'), { code: 409 });
    }
    if (!(Date.parse(dueAt) > now + 60_000)) throw Object.assign(new Error('A new time is in the past or less than a minute away.'), { code: 400 });
    full.push(editInput(p, dueAt));
  }
  const done = [];
  for (const input of full) {
    const r = (await request(key, EDIT, { input })).editPost;
    if (!r?.post) {
      const err = new Error(`Buffer refused a move${done.length ? ` after ${done.length} of ${full.length} moved` : ''}: ${r?.message || 'no reason given'}. Refresh to see where things are.`);
      throw Object.assign(err, { code: 400 });
    }
    done.push(r.post);
  }
  return done; // [{ id, status, dueAt }]
}

export async function liveFetch(key) {
  const { channels } = await gql(key, CHANNEL_QUERY, { org: ORG_ID });
  const queue = await page(key, ['draft', 'needs_approval', 'scheduled', 'sending', 'error'], 100, 'asc');
  const sent = await page(key, ['sent'], 100, 'desc'); // the grid needs older posts too (84 sent on 2026-11-03)
  return { takenAt: new Date().toISOString(), live: true, channels: channels.map(normalizeChannel), posts: [...queue, ...sent] };
}
