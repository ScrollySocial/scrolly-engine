// Newest top-level comments across the whole channel (1 quota unit per call).
// Reading public comments only needs the API key; posting replies uses OAuth.
if (!isMyJob('youtube')) return [];
const key = cfg('YT_API_KEY');
const channel = cfg('YT_CHANNEL_ID');
if (!key || !channel) return [];
const base = cfg('YT_BASE', 'https://www.googleapis.com/youtube/v3');

let res;
try {
  res = await http({
    method: 'GET',
    url: `${base}/commentThreads`,
    qs: { part: 'snippet', allThreadsRelatedToChannelId: channel, order: 'time', maxResults: 50, textFormat: 'plainText', key },
  });
} catch (e) {
  logError('youtube-fetch', e);
  return [{ json: { job: 'youtube', error: errText(e) } }];
}
const out = [];
for (const t of res.items || []) {
  const c = t.snippet?.topLevelComment;
  const s = c?.snippet || {};
  if (!c || s.authorChannelId?.value === channel) continue;
  out.push({
    json: {
      platform: 'YouTube',
      id: c.id,
      text: s.textOriginal || s.textDisplay || '',
      author: s.authorDisplayName || '',
      authorId: s.authorChannelId?.value || '',
      postId: s.videoId || t.snippet?.videoId || '',
      parentId: '',
      threadId: t.id,
      link: `https://www.youtube.com/watch?v=${s.videoId || t.snippet?.videoId}&lc=${c.id}`,
      createdAt: s.publishedAt || now(),
    },
  });
}
state.youtubeCheckedAt = now();
return out;
