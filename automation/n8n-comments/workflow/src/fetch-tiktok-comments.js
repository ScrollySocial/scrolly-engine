// TikTok gives creators no comments API, so read comments on her newest videos
// with the Apify actor clockworks/tiktok-comments-scraper (pay per comment, the
// run is capped at TIKTOK_MAX_USD). Replies to TikTok comments are typed by hand.
if (!isMyJob('tiktok')) return [];
const token = cfg('APIFY_TOKEN');
const handle = cfg('TIKTOK_HANDLE').replace(/^@/, '');
if (!token || !handle) return [];
const base = cfg('APIFY_BASE', 'https://api.apify.com/v2');

let rows;
try {
  rows = await http({
    method: 'POST',
    url: `${base}/acts/clockworks~tiktok-comments-scraper/run-sync-get-dataset-items`,
    qs: { token, maxTotalChargeUsd: cfg('TIKTOK_MAX_USD', '0.10') },
    body: {
      profiles: [handle],
      resultsPerPage: Number(cfg('TIKTOK_VIDEOS', '3')),
      profileSorting: 'latest',
      commentsPerPost: Number(cfg('TIKTOK_COMMENTS_PER_VIDEO', '30')),
      maxRepliesPerComment: 0,
    },
    timeout: 300000,
  });
} catch (e) {
  logError('tiktok-fetch', e);
  return [{ json: { job: 'tiktok', error: errText(e) } }];
}
const out = [];
for (const r of rows || []) {
  if (r.errorCode || !r.cid || (r.uniqueId || '').toLowerCase() === handle.toLowerCase()) continue;
  out.push({
    json: {
      platform: 'TikTok',
      id: String(r.cid),
      text: r.text || '',
      author: r.uniqueId || '',
      authorId: r.uid || '',
      postId: r.videoWebUrl || '',
      parentId: '',
      threadId: '',
      link: r.videoWebUrl || '',
      createdAt: r.createTimeISO || now(),
    },
  });
}
state.tiktokCheckedAt = now();
return out;
