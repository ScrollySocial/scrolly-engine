// Every 10 minutes (or right away when she taps "Approve & post"): rows Mercedes
// approved in her dashboard get their reply (as she edited it) posted, then marked
// Posted. Comments get a public reply; DMs get a DM back.
if (!isMyJob('replies')) return [];
const rowsAt = async (status) => (await inbox('GET', `/rows?status=${encodeURIComponent(status)}`)).rows || [];
const setRow = (id, change) => inbox('PATCH', `/rows/${id}`, change);

// Once test mode is off, rows that were approved while it was on go back to New
// (the To answer view) so she can approve them again; nothing is posted unasked.
if (!DRY_RUN) {
  try {
    for (const row of await rowsAt('Not sent (test mode)')) {
      await setRow(row.id, { status: 'New', note: 'Approved while test mode was on, so it was not sent. Approve again to post it.' });
    }
  } catch (e) {
    logError('inbox-test-mode-rows', e);
  }
}

let rows;
try {
  rows = await rowsAt('Approved');
} catch (e) {
  logError('inbox-approved', e);
  return [{ json: { job: 'replies', error: errText(e) } }];
}


const out = [];
for (const row of rows) {
  const platform = row.platform;
  const reply = String(row.draft || '').trim();
  const commentId = String(row.commentId || '').trim();
  const threadId = String(row.threadId || '').trim() || commentId;
  let status = 'Posted';
  let note = '';
  let replyMid = '';
  // A reply that went out but whose row didn't save as Posted (a hiccup) is
  // still Approved on the next run: only retry the row update, never post twice.
  const postedAt = state.repliesPosted?.[row.id];
  if (postedAt) {
    note = 'Posted once already; this run only marked the row.';
  } else if (!reply || !commentId) {
    status = 'Error';
    note = 'The reply or the comment id is empty.';
  } else if (platform === 'TikTok') {
    status = 'Reply by hand';
    note = "TikTok doesn't allow replies from automations. Copy the draft into TikTok.";
  } else if (DRY_RUN) {
    status = 'Not sent (test mode)';
    note = `Test mode: would post "${reply}"`;
  } else {
    try {
      if (platform === 'Instagram' && row.kind === 'dm') {
        // Instagram only allows a reply within 24 hours of their last message.
        const res = await http({
          method: 'POST',
          url: `${GRAPH}/${cfg('IG_USER_ID') || 'me'}/messages`,
          headers: { Authorization: `Bearer ${igToken()}` },
          body: { recipient: { id: row.personId }, message: { text: reply } },
        });
        replyMid = res?.message_id || '';
      } else if (platform === 'Instagram') {
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
      note = row.kind === 'dm'
        ? `Not sent. Instagram only allows replies within 24 hours of their last message; reply in the Instagram app. (${errText(e)})`
        : `Not posted: ${errText(e)}`;
    }
  }
  const change = { status };
  if (note) change.note = note;
  if (replyMid) change.replyMid = replyMid;
  if (status === 'Posted') change.postedAt = postedAt || now();
  try {
    await setRow(row.id, change);
  } catch (e) {
    logError('inbox-update', e);
  }
  out.push({ json: { page: row.id, platform, status, note } });
}
state.lastRuns = { ...(state.lastRuns || {}), replies: { at: now(), approved: rows.length, posted: out.filter((o) => o.json.status === 'Posted').length, results: out.map((o) => o.json.status) } };
return out;
