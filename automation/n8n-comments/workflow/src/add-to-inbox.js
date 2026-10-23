// One row per comment or DM in the comment inbox (inbox/server.mjs, her dashboard).
// Spam is not logged; it's only marked as seen. Keyword-only comments and DMs are
// logged as Handled, so the conversation view shows them with the freebie DM.
// A comment is marked seen only after its row exists, so a failed write is
// retried on the next YouTube/TikTok poll.
const out = [];

for (const item of $input.all()) {
  const c = item.json;
  if (c.type === 'spam') {
    remember('seen', c.key);
    out.push({ json: { key: c.key, logged: false, why: 'spam', dm: c.dm } });
    continue;
  }
  const link = c.link || (c.platform === 'Instagram' && c.kind !== 'dm' ? await igPermalink(c.postId) : '');
  const notes = [c.note || '', c.needsCheck ? 'Check the facts in this draft before approving.' : '', c.dm && !c.keywordOnly ? `Keyword ${c.keyword}: ${c.dm}` : '']
    .filter(Boolean)
    .join(' ');
  // No draft yet (free mode): "Needs draft" until Claude writes one on the subscription.
  // With a draft: ready for review, or typed by hand on TikTok.
  const status = c.keywordOnly ? 'Handled' : !c.draft ? 'Needs draft' : c.platform === 'TikTok' ? 'Reply by hand' : 'New';
  const type = c.type ? c.type[0].toUpperCase() + c.type.slice(1) : 'Other';
  try {
    const row = await inbox('POST', '/rows', {
      kind: c.kind || 'comment',
      platform: c.platform,
      type: ['Question', 'Lead', 'Praise', 'Other'].includes(type) ? type : 'Other',
      priority: c.type === 'question' || c.type === 'lead',
      text: String(c.text || '').slice(0, 5000),
      author: c.author || '',
      personId: c.authorId || '',
      commentId: c.id,
      threadId: c.threadId || '',
      link,
      post: c.postId || '',
      receivedAt: c.createdAt || now(),
      status,
      draft: c.draft || '',
      note: notes,
      keyword: c.keyword || '',
      dm: c.dm || '',
      replyMid: c.dmMid || '',
    });
    remember('seen', c.key);
    out.push({ json: { key: c.key, logged: true, row: row.id, type: c.type, draft: c.draft, dm: c.dm } });
  } catch (e) {
    logError('inbox-add', e);
    out.push({ json: { key: c.key, logged: false, error: errText(e) } });
  }
}
state.lastRuns = { ...(state.lastRuns || {}), inbox: { at: now(), comments: out.length, logged: out.filter((o) => o.json.logged).length, failed: out.filter((o) => o.json.error).length } };
return out;
