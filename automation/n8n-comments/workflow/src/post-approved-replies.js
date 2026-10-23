// Every 10 minutes: rows Mercedes set to Status = Approved get their Draft reply
// (as she edited it) posted as a public reply, then marked Posted.
// This uses Notion's public API with its own integration token, which is separate
// from the Claude Notion connector's query allowance.
if (!isMyJob('replies')) return [];
const db = cfg('NOTION_COMMENTS_DB');
if (!db || !cfg('NOTION_TOKEN')) return [];
const text = (p) => (p?.rich_text || p?.title || []).map((t) => t.plain_text ?? t.text?.content ?? '').join('');
const rowsAt = async (status) =>
  (await http({ method: 'POST', url: `${NOTION}/databases/${db}/query`, headers: notionHeaders(), body: { filter: { property: 'Status', select: { equals: status } }, page_size: 50 } })).results || [];
const setRow = (id, properties) => http({ method: 'PATCH', url: `${NOTION}/pages/${id}`, headers: notionHeaders(), body: { properties } });
const noteProp = (note) => ({ rich_text: [{ type: 'text', text: { content: note.slice(0, 1900) } }] });

// Once test mode is off, rows that were approved while it was on go back to New
// (the To answer view) so she can approve them again; nothing is posted unasked.
if (!DRY_RUN) {
  try {
    for (const row of await rowsAt('Not sent (test mode)')) {
      await setRow(row.id, { Status: { select: { name: 'New' } }, Note: noteProp('Approved while test mode was on, so it was not sent. Approve again to post it.') });
    }
  } catch (e) {
    logError('notion-test-mode-rows', e);
  }
}

let rows;
try {
  rows = await rowsAt('Approved');
} catch (e) {
  logError('notion-approved', e);
  return [{ json: { job: 'replies', error: errText(e) } }];
}

async function youtubeAccessToken() {
  if (state.ytAccess && state.ytAccessUntil > Date.now() + 60000) return state.ytAccess;
  const res = await http({
    method: 'POST',
    url: cfg('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token'),
    json: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // (no URLSearchParams in n8n's Code sandbox)
    body: Object.entries({
      client_id: cfg('YT_CLIENT_ID'),
      client_secret: cfg('YT_CLIENT_SECRET'),
      refresh_token: cfg('YT_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&'),
  });
  const t = typeof res === 'string' ? JSON.parse(res) : res;
  state.ytAccess = t.access_token;
  state.ytAccessUntil = Date.now() + (t.expires_in || 3600) * 1000;
  return state.ytAccess;
}

const out = [];
for (const row of rows) {
  const p = row.properties || {};
  const platform = p.Platform?.select?.name;
  const reply = text(p['Draft reply']).trim();
  const commentId = text(p['Comment ID']).trim();
  const threadId = text(p['Thread ID']).trim() || commentId;
  let status = 'Posted';
  let note = '';
  // A reply that went out but whose row didn't save as Posted (Notion hiccup) is
  // still Approved on the next run: only retry the row update, never post twice.
  const postedAt = state.repliesPosted?.[row.id];
  if (postedAt) {
    note = 'Posted once already; this run only marked the row.';
  } else if (!reply || !commentId) {
    status = 'Error';
    note = 'Draft reply or Comment ID is empty.';
  } else if (platform === 'TikTok') {
    status = 'Reply by hand';
    note = "TikTok doesn't allow replies from automations. Copy the draft into TikTok.";
  } else if (DRY_RUN) {
    status = 'Not sent (test mode)';
    note = `Test mode: would post "${reply}"`;
  } else {
    try {
      if (platform === 'Instagram') {
        await http({ method: 'POST', url: `${GRAPH}/${commentId}/replies`, qs: { message: reply }, headers: { Authorization: `Bearer ${igToken()}` } });
      } else if (platform === 'YouTube') {
        await http({
          method: 'POST',
          url: `${cfg('YT_BASE', 'https://www.googleapis.com/youtube/v3')}/comments`,
          qs: { part: 'snippet' },
          headers: { Authorization: `Bearer ${await youtubeAccessToken()}` },
          body: { snippet: { parentId: threadId, textOriginal: reply } },
        });
      } else {
        throw new Error(`unknown platform ${platform}`);
      }
      // Saved straight away, so even a crash before the row update can't repost it.
      remember('repliesPosted', row.id);
      saveState();
    } catch (e) {
      logError('post-reply', e);
      status = 'Error';
      note = `Not posted: ${errText(e)}`;
    }
  }
  const properties = { Status: { select: { name: status } } };
  if (note) properties.Note = noteProp(note);
  if (status === 'Posted') properties.Posted = { date: { start: postedAt || now() } };
  try {
    await setRow(row.id, properties);
  } catch (e) {
    logError('notion-update', e);
  }
  out.push({ json: { page: row.id, platform, status, note } });
}
state.lastRuns = { ...(state.lastRuns || {}), replies: { at: now(), approved: rows.length, posted: out.filter((o) => o.json.status === 'Posted').length, results: out.map((o) => o.json.status) } };
return out;
