// Comment or DM with a keyword → the keyword's freebie flow (Instagram only).
// The keyword list is config/keywords.json, written by her dashboard (only keywords
// that are switched on and whose messages she approved are in it).
//
// Each keyword delivers one of two ways (her dashboard, keyword page):
//   direct: one DM with the freebie link ({url}).
//   email:  one DM with a personal signup link ({link}); the signup page adds the email to
//           MailerLite and MailerLite emails the freebie.
// "Ask first": the first DM only says "reply READY"; the link goes out when they reply.
// A comment can only get ONE private-reply DM (Meta's rule, within 7 days); a DM conversation
// can get more, but only within 24 hours of their last message.
let keywords = [];
try {
  keywords = JSON.parse(fs.readFileSync(cfg('KEYWORDS_FILE', '/data/config/keywords.json'), 'utf8')).keywords || [];
} catch (e) {
  logError('keywords-file', e);
}
const ownId = cfg('IG_USER_ID');
const PUBLIC = cfg('INBOX_PUBLIC_URL', `https://${cfg('N8N_HOST', 'localhost')}`);
const wordsOf = (t) => String(t || '').toUpperCase().match(/[A-Z0-9$]+/g) || [];
const FILLER = /^(PLEASE|PLS|PLZ|THANKS|THANK|YOU|TY|HI|HEY|YES|OK|OKAY)$/;

async function sendDm(recipient, text) {
  const res = await http({
    method: 'POST',
    url: `${GRAPH}/${ownId || 'me'}/messages`,
    headers: { Authorization: `Bearer ${igToken()}` },
    body: { recipient, message: { text } },
  });
  return res?.message_id || '';
}
async function event(keyword, c, result) {
  try {
    await inbox('POST', '/events', { keyword, platform: c.platform, post: c.kind === 'dm' ? '' : await igPermalink(c.postId), result });
  } catch (e) {
    logError('inbox-event', e);
  }
}

const out = [];
for (const item of $input.all()) {
  const c = { ...item.json };
  const words = wordsOf(c.text);
  const isDm = c.kind === 'dm';
  if (isDm) {
    // Any DM keeps their flows' 24-hour window open (and links the DM sender to a flow that began with a comment).
    try {
      await inbox('POST', '/flows/touch', { personId: c.authorId, author: c.author });
    } catch (e) {
      logError('inbox-touch', e);
    }
  }
  const allowed = (k) => (c.platform === 'YouTube' ? !!k.where?.ytComments : isDm ? k.where?.igDms !== false : k.where?.igComments !== false);
  let hit = keywords.find((k) => words.includes(String(k.keyword).toUpperCase()) && allowed(k));
  // "READY" (or her reply word) in a DM answers an open "ask first" flow.
  let readyFlow = null;
  if (!hit && isDm) {
    try {
      const { flows } = await inbox('GET', `/flows?personId=${encodeURIComponent(c.authorId)}&author=${encodeURIComponent(c.author)}&step=asked`);
      for (const f of flows || []) {
        const k = keywords.find((x) => x.keyword === f.keyword);
        if (k && words.includes(String(k.ask?.word || 'READY').toUpperCase())) {
          hit = k;
          readyFlow = f;
          break;
        }
      }
    } catch (e) {
      logError('inbox-flows', e);
    }
  }
  if (hit) {
    c.keyword = hit.keyword;
    const trigger = readyFlow ? String(hit.ask?.word || 'READY').toUpperCase() : hit.keyword.toUpperCase();
    c.keywordOnly = words.filter((w) => w !== trigger && !FILLER.test(w)).length === 0;
  }
  // YouTube has no DMs: an automatic public reply under the comment, with the freebie link
  // (direct) or the keyword's shared signup page (email).
  if (hit && c.platform === 'YouTube') {
    const text = String(hit.yt?.text || '').replace('{url}', hit.url).replace('{link}', `${PUBLIC}/inbox/s/${hit.keyword}`);
    let result = 'test';
    if (state.dm?.[c.id]) {
      c.dm = 'already sent';
      result = 'already';
    } else if (DRY_RUN) {
      c.dm = `test mode, would reply: ${text}`;
    } else {
      try {
        await http({
          method: 'POST',
          url: `${cfg('YT_BASE', 'https://www.googleapis.com/youtube/v3')}/comments`,
          qs: { part: 'snippet' },
          headers: { Authorization: `Bearer ${await youtubeAccessToken()}` },
          body: { snippet: { parentId: c.threadId || c.id, textOriginal: text } },
        });
        remember('dm', c.id);
        c.dm = `sent: ${text}`;
        result = 'sent';
      } catch (e) {
        logError('youtube-keyword-reply', e);
        c.dm = `failed: ${errText(e)}`;
        result = 'failed';
      }
    }
    if (result !== 'already') {
      try {
        await inbox('POST', '/events', { keyword: hit.keyword, platform: 'YouTube', post: c.link || '', result });
      } catch (e) {
        logError('inbox-event', e);
      }
    }
    out.push({ json: c });
    continue;
  }
  // First DM from someone new (and not a keyword): one automatic welcome, once per person,
  // only when she switched it on and approved the text. Their message still goes to her inbox.
  if (!hit && isDm && c.platform === 'Instagram' && c.authorId && !state.welcomed?.[c.authorId]) {
    let welcome = null;
    try {
      welcome = JSON.parse(fs.readFileSync(cfg('SETTINGS_FILE', '/data/config/settings.json'), 'utf8')).welcome;
    } catch (e) {
      welcome = null;
    }
    if (welcome?.on && welcome.approved && welcome.text) {
      if (DRY_RUN) {
        c.dm = `test mode, would send: ${welcome.text}`;
      } else {
        try {
          c.dmMid = await sendDm({ id: c.authorId }, welcome.text);
          c.dm = `sent: ${welcome.text}`;
          remember('welcomed', c.authorId);
        } catch (e) {
          logError('instagram-welcome', e);
          c.dm = `failed: ${errText(e)}`;
        }
      }
    }
  }
  if (!hit || c.platform !== 'Instagram') {
    out.push({ json: c });
    continue;
  }

  // What to send now.
  const recipient = isDm ? { id: c.authorId } : { comment_id: c.id };
  let text;
  let flow = readyFlow;
  let step = '';
  try {
    if (hit.delivery === 'email' || (hit.ask?.on && !isDm)) {
      if (hit.ask?.on && !isDm && !readyFlow) {
        step = 'asked';
        text = hit.ask.text;
      } else {
        step = 'linkSent';
      }
      if (!flow) flow = await inbox('POST', '/flows', { keyword: hit.keyword, platform: 'Instagram', personId: c.authorId, author: c.author, step: step || 'linkSent' });
      if (step === 'linkSent') {
        text = hit.delivery === 'email' ? hit.linkText.replace('{link}', `${PUBLIC}/inbox/f/${flow.token}`) : hit.dm.replace('{url}', hit.url);
      }
    } else {
      text = hit.dm.replace('{url}', hit.url);
    }
  } catch (e) {
    logError('inbox-flow-start', e);
    out.push({ json: c });
    continue;
  }

  let result = 'test';
  if (!readyFlow && state.dm?.[c.id]) {
    c.dm = 'already sent';
    result = 'already';
  } else if (DRY_RUN) {
    c.dm = `test mode, would send: ${text}`;
  } else {
    try {
      c.dmMid = await sendDm(recipient, text);
      remember('dm', c.id);
      c.dm = `sent: ${text}`;
      result = 'sent';
      if (flow && readyFlow) await inbox('PATCH', `/flows/${flow.token}`, { step: 'linkSent', dmPersonId: c.authorId, lastInboundAt: true });
      else if (flow && isDm) await inbox('PATCH', `/flows/${flow.token}`, { dmPersonId: c.authorId, lastInboundAt: true });
    } catch (e) {
      logError('instagram-dm', e);
      c.dm = `failed: ${errText(e)}`;
      result = 'failed';
    }
  }
  if (result !== 'already' && !readyFlow) await event(hit.keyword, c, result);
  out.push({ json: c });
}
return out;
