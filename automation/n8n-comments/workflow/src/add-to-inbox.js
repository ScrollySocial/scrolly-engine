// One row per comment in the Notion "Comment inbox" (Scrolly Content Tracker).
// Spam and keyword-only comments are not logged; they're only marked as seen.
// A comment is marked seen only after its row exists, so a failed write is
// retried on the next YouTube/TikTok poll.
const db = cfg('NOTION_COMMENTS_DB');
const clip = (s, n = 1900) => String(s || '').slice(0, n);
const rich = (s) => ({ rich_text: s ? [{ type: 'text', text: { content: clip(s) } }] : [] });
const out = [];

for (const item of $input.all()) {
  const c = item.json;
  if (c.keywordOnly || c.type === 'spam') {
    remember('seen', c.key);
    out.push({ json: { key: c.key, logged: false, why: c.keywordOnly ? 'keyword only' : 'spam', dm: c.dm } });
    continue;
  }
  let link = c.link;
  if (!link && c.platform === 'Instagram' && c.postId) {
    try {
      const m = await http({ method: 'GET', url: `${GRAPH}/${c.postId}`, qs: { fields: 'permalink', access_token: igToken() } });
      link = m.permalink || '';
    } catch (e) {
      link = '';
    }
  }
  const notes = [c.dm ? `Keyword ${c.keyword}: ${c.dm}` : '', c.needsCheck ? 'Check the facts in this draft before approving.' : '', c.note || '']
    .filter(Boolean)
    .join(' ');
  const properties = {
    Comment: { title: [{ type: 'text', text: { content: clip(c.text, 1900) || '(no text)' } }] },
    Platform: { select: { name: c.platform } },
    Type: { select: { name: c.type ? c.type[0].toUpperCase() + c.type.slice(1) : 'Other' } },
    Priority: { checkbox: c.type === 'question' || c.type === 'lead' },
    'Draft reply': rich(c.draft),
    Status: { select: { name: c.platform === 'TikTok' ? 'Reply by hand' : 'New' } },
    Author: rich(c.author),
    'Comment ID': rich(c.id),
    'Thread ID': rich(c.threadId),
    Received: { date: { start: c.createdAt || now() } },
    Note: rich(notes),
  };
  if (link) properties.Link = { url: link };
  try {
    const page = await http({
      method: 'POST',
      url: `${NOTION}/pages`,
      headers: notionHeaders(),
      body: { parent: { database_id: db }, properties },
    });
    remember('seen', c.key);
    out.push({ json: { key: c.key, logged: true, page: page.id, type: c.type, draft: c.draft, dm: c.dm } });
  } catch (e) {
    logError('notion-add', e);
    out.push({ json: { key: c.key, logged: false, error: errText(e) } });
  }
}
state.lastRuns = { ...(state.lastRuns || {}), inbox: { at: now(), comments: out.length, logged: out.filter((o) => o.json.logged).length, failed: out.filter((o) => o.json.error).length } };
return out;
