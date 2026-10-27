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
  };
}

// A channel and its Buffer posting times (wall-clock times in the channel's own timezone).
export function normalizeChannel(c) {
  return {
    id: c.id,
    name: CHANNELS[c.id] || c.service,
    handle: c.name,
    link: c.externalLink || null,
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
  assets { type source thumbnail }`;

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

export async function liveFetch(key) {
  const { channels } = await gql(key, CHANNEL_QUERY, { org: ORG_ID });
  const queue = await page(key, ['draft', 'needs_approval', 'scheduled', 'sending', 'error'], 100, 'asc');
  const sent = await page(key, ['sent'], 30, 'desc');
  return { takenAt: new Date().toISOString(), live: true, channels: channels.map(normalizeChannel), posts: [...queue, ...sent] };
}
