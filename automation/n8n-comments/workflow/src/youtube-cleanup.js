// Daily: YouTube comment data leaves the Comment inbox and the state file well
// within Google's 30-day limit (YouTube API Services policy III.E.4, promised on
// scrollyseo.com/privacy/). Rows are blanked first and then moved to Notion's
// trash, so the trash copy holds no YouTube data. Instagram and TikTok rows are
// not touched (Mercedes 2026-10-23: only YouTube has a fixed limit).
// YOUTUBE_KEEP_DAYS defaults to 21, leaving room for Notion's page history.
if (!isMyJob('cleanup')) return [];
const db = cfg('NOTION_COMMENTS_DB');
const days = Number(cfg('YOUTUBE_KEEP_DAYS', '21'));
const cutoff = new Date(Date.now() - days * 86400e3).toISOString();
const blank = { rich_text: [] };
let removed = 0;
let failed = 0;

if (db && cfg('NOTION_TOKEN')) {
  let cursor;
  do {
    let res;
    try {
      res = await http({
        method: 'POST',
        url: `${NOTION}/databases/${db}/query`,
        headers: notionHeaders(),
        body: {
          filter: { and: [{ property: 'Platform', select: { equals: 'YouTube' } }, { property: 'Received', date: { before: cutoff } }] },
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        },
      });
    } catch (e) {
      logError('cleanup-query', e);
      failed++;
      break;
    }
    for (const row of res.results || []) {
      try {
        await http({
          method: 'PATCH',
          url: `${NOTION}/pages/${row.id}`,
          headers: notionHeaders(),
          body: {
            properties: {
              Comment: { title: [{ type: 'text', text: { content: `(YouTube comment removed after ${days} days)` } }] },
              Author: blank,
              'Draft reply': blank,
              'Comment ID': blank,
              'Thread ID': blank,
              Note: blank,
              Link: { url: null },
            },
          },
        });
        await http({ method: 'PATCH', url: `${NOTION}/pages/${row.id}`, headers: notionHeaders(), body: { archived: true } });
        removed++;
      } catch (e) {
        logError('cleanup-row', e);
        failed++;
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
}

// The "already seen" list keeps YouTube comment IDs only as long as the rows.
let pruned = 0;
for (const [key, at] of Object.entries(state.seen || {})) {
  if (key.startsWith('YouTube:') && at < cutoff) {
    delete state.seen[key];
    pruned++;
  }
}

state.lastRuns = { ...(state.lastRuns || {}), cleanup: { at: now(), keepDays: days, rowsRemoved: removed, idsPruned: pruned, failed } };
return [{ json: { job: 'cleanup', rowsRemoved: removed, idsPruned: pruned, failed } }];
