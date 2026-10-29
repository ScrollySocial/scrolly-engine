// Comment or DM with a keyword → the keyword's freebie flow (Instagram only).
// The keyword list is config/keywords.json, written by her dashboard (only keywords
// that are switched on and whose messages she approved are in it).
//
// Each keyword delivers one of two ways (her dashboard, keyword page):
//   direct: one DM with the freebie link ({url}).
//   email:  one DM with a personal signup link ({link}); the signup page adds the email to
//           MailerLite and MailerLite emails the freebie.
// "Ask first": the first DM only says "reply READY"; the link goes out when they reply.
// "Reply under the comment" (optional): after the DM goes out, a short public reply like "Sent
// you a DM!" under their comment. Several wordings, used in turn, so it never looks like a bot
// posting the same line again and again.
// "Only for followers" (optional, needs "ask first"): when they reply READY, Instagram says whether
// they follow her; if not, they get her "follow me first" DM and the flow waits for their next READY.
// If Instagram can't tell (an error), the link goes out: nobody is left without their freebie.
// "Let them choose" (optional, needs "ask first" and email): the first DM has two buttons, "Send it
// here" (the freebie link by DM, flow ends at sentHere) or "By email" (their signup link, as above).
// Questions (optional, need "ask first"): after their first reply, each question goes out with its
// answers as buttons; every answer is saved with them, and the freebie goes out after the last one.
// Freebie links in DMs go through the inbox's click counter (trackedUrl in _lib.js).
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

async function sendDm(recipient, text, buttons) {
  const send = (message) => http({
    method: 'POST',
    url: `${GRAPH}/${ownId || 'me'}/messages`,
    headers: { Authorization: `Bearer ${igToken()}` },
    body: { recipient, message },
  });
  let res;
  if (buttons?.length) {
    try {
      res = await send({ text, quick_replies: buttons.map(([title, payload]) => ({ content_type: 'text', title, payload })) });
    } catch (e) {
      // Meta's docs don't promise buttons on a comment's private reply: if they're refused, the same
      // message goes out as text, telling them which word to reply (both words work, see pickOf).
      logError('instagram-buttons', e);
      res = await send({ text: `${text}\n\nReply HERE or EMAIL.` });
    }
  } else {
    res = await send({ text });
  }
  return res?.message_id || '';
}
// "Let them choose": which button they tapped (our payload), or the word they typed instead.
// Their ask word (READY) counts as email, the keyword's usual way.
const choiceButtons = (k) => [[k.choice.here || 'Send it here', `CM_HERE:${k.keyword}`], [k.choice.email || 'By email', `CM_EMAIL:${k.keyword}`]];
// Which answer they gave to question qi: the button's payload, its number typed ("2"), or its words.
function answerOf(k, qi, c, words) {
  const q = k.questions?.[qi];
  if (!q) return -1;
  const m = String(c.payload || '').match(/^CM_Q:([A-Z0-9$]+):(\d+):(\d+)$/);
  if (m && m[1] === k.keyword && Number(m[2]) === qi && q.answers[Number(m[3])]) return Number(m[3]);
  if (words.length === 1 && /^[1-9]$/.test(words[0]) && q.answers[Number(words[0]) - 1]) return Number(words[0]) - 1;
  const said = words.join(' ');
  const exact = q.answers.findIndex((a) => wordsOf(a.label).join(' ') === said);
  if (exact >= 0) return exact;
  // Every word of an answer in their message ("clothes mostly" → Clothes); the longest answer wins.
  let best = -1;
  q.answers.forEach((a, i) => {
    const w = wordsOf(a.label);
    if (w.length && w.every((x) => words.includes(x)) && (best < 0 || w.length > wordsOf(q.answers[best].label).length)) best = i;
  });
  return best;
}
const questionButtons = (k, qi) => k.questions[qi].answers.map((a, i) => [a.label, `CM_Q:${k.keyword}:${qi}:${i}`]);
function pickOf(k, c, words) {
  if (c.payload === `CM_HERE:${k.keyword}`) return 'here';
  if (c.payload === `CM_EMAIL:${k.keyword}`) return 'email';
  if (words.includes('EMAIL') || words.includes('MAIL')) return 'email';
  if (words.includes('HERE')) return 'here';
  if (words.includes(String(k.ask?.word || 'READY').toUpperCase())) return 'email';
  // A tapped button whose title has neither word (she renamed them) still matches by its title.
  const title = (t) => wordsOf(t).join(' ');
  if (title(c.text) === title(k.choice.here)) return 'here';
  if (title(c.text) === title(k.choice.email)) return 'email';
  return '';
}
async function publicReply(hit, c) {
  const lines = String(hit.publicReply?.text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!hit.publicReply?.on || !lines.length) return;
  const n = state.publicReplyN || 0;
  state.publicReplyN = n + 1;
  try {
    await http({ method: 'POST', url: `${GRAPH}/${c.id}/replies`, qs: { message: lines[n % lines.length] }, headers: { Authorization: `Bearer ${igToken()}` } });
    c.note = `${c.note ? `${c.note} ` : ''}Replied under the comment.`;
  } catch (e) {
    logError('instagram-public-reply', e);
  }
}
async function followsMe(igsid) {
  try {
    const p = await http({ method: 'GET', url: `${GRAPH}/${igsid}`, qs: { fields: 'is_user_follow_business', access_token: igToken() } });
    return p?.is_user_follow_business !== false;
  } catch (e) {
    logError('instagram-follow-check', e);
    return true;
  }
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
  // "READY" (or her reply word) in a DM answers an open "ask first" flow; with "let them choose",
  // so does a tapped button (or HERE / EMAIL typed). A flow at "question" waits for an answer.
  let readyFlow = null;
  let pick = '';
  let answer = -1;
  if (!hit && isDm) {
    try {
      const { flows } = await inbox('GET', `/flows?personId=${encodeURIComponent(c.authorId)}&author=${encodeURIComponent(c.author)}&step=asked&step=question`);
      for (const f of flows || []) {
        const k = keywords.find((x) => x.keyword === f.keyword);
        if (!k) continue;
        if (f.step === 'question') {
          const a = answerOf(k, f.qIndex || 0, c, words);
          if (a < 0) continue;
          hit = k;
          readyFlow = f;
          answer = a;
          pick = f.pick || '';
          break;
        }
        const p = k.choice?.on ? pickOf(k, c, words) : '';
        if (p || words.includes(String(k.ask?.word || 'READY').toUpperCase())) {
          hit = k;
          readyFlow = f;
          pick = p;
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
    const answers = answer >= 0 ? wordsOf(hit.questions[readyFlow.qIndex || 0].answers[answer].label) : pick ? ['HERE', 'EMAIL', 'MAIL', ...wordsOf(hit.choice.here), ...wordsOf(hit.choice.email)] : [];
    c.keywordOnly = !!((pick || answer >= 0) && c.payload) || words.filter((w) => w !== trigger && !answers.includes(w) && !FILLER.test(w)).length === 0;
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
  let buttons = null;
  let flow = readyFlow;
  let step = '';
  // "Let them choose" asks in a DM conversation too (the buttons need a reply to answer).
  const choosing = !!hit.choice?.on && !!hit.ask?.on;
  const questions = hit.ask?.on ? hit.questions || [] : [];
  // The answer just given (kept with them), and which question comes next (-1: none, the freebie).
  const qAt = readyFlow?.qIndex || 0;
  const given = answer >= 0 ? { q: questions[qAt].text, a: questions[qAt].answers[answer].label, url: questions[qAt].answers[answer].url || '' } : null;
  let nextQ = -1;
  if (given) nextQ = qAt + 1 < questions.length ? qAt + 1 : -1;
  else if (readyFlow) nextQ = questions.length ? 0 : -1;
  // A keyword typed in a DM is already a conversation: straight to the first question.
  else if (isDm && questions.length && !choosing) nextQ = 0;
  // The freebie their answers picked (an answer with its own link), else the keyword's.
  const freebie = given?.url || readyFlow?.freebieUrl || hit.url;
  try {
    if (hit.delivery === 'email' || (hit.ask?.on && !isDm) || nextQ >= 0) {
      if (hit.ask?.on && (!isDm || choosing) && !readyFlow) {
        step = 'asked';
        text = hit.ask.text;
        if (choosing) buttons = choiceButtons(hit);
      } else if (nextQ >= 0) {
        step = 'question';
        text = questions[nextQ].text;
      } else {
        step = choosing && pick === 'here' ? 'sentHere' : 'linkSent';
      }
      // post: which Reel or post it came from, for the dashboard's top posts (signups per post).
      if (!flow) flow = await inbox('POST', '/flows', { keyword: hit.keyword, platform: 'Instagram', personId: c.authorId, author: c.author, post: isDm ? '' : await igPermalink(c.postId), step: step || 'linkSent' });
      if (step === 'question') buttons = questionButtons(hit, nextQ);
      else if (step === 'sentHere') text = hit.dm.replace('{url}', await trackedUrl(hit, 'here', flow.token, freebie));
      else if (step === 'linkSent') {
        text = hit.delivery === 'email' ? hit.linkText.replace('{link}', `${PUBLIC}/inbox/f/${flow.token}`) : hit.dm.replace('{url}', await trackedUrl(hit, 'direct', flow.token, freebie));
      }
    } else {
      text = hit.dm.replace('{url}', await trackedUrl(hit, 'direct', '', hit.url));
    }
  } catch (e) {
    logError('inbox-flow-start', e);
    out.push({ json: c });
    continue;
  }

  // Only for followers: not following yet → the "follow me first" DM instead of the link.
  let gated = false;
  if (readyFlow?.step === 'asked' && hit.ask?.on && hit.followGate?.on && hit.followGate.text && !(await followsMe(c.authorId))) {
    gated = true;
    text = hit.followGate.text;
  }

  let result = 'test';
  if (!readyFlow && state.dm?.[c.id]) {
    c.dm = 'already sent';
    result = 'already';
  } else if (DRY_RUN) {
    c.dm = `test mode, would send: ${text}`;
  } else {
    try {
      // Not following yet: the follow-first message carries the buttons again, to tap once they follow.
      c.dmMid = await sendDm(recipient, text, gated ? (choosing ? choiceButtons(hit) : null) : buttons);
      remember('dm', c.id);
      c.dm = `sent: ${text}`;
      result = 'sent';
      const moved = { step, dmPersonId: c.authorId, lastInboundAt: true, ...(step === 'question' ? { qIndex: nextQ } : {}), ...(pick ? { pick } : {}), ...(given ? { answer: given } : {}) };
      if (flow && readyFlow) await inbox('PATCH', `/flows/${flow.token}`, gated ? { followGated: true, dmPersonId: c.authorId, lastInboundAt: true } : moved);
      else if (flow && isDm) await inbox('PATCH', `/flows/${flow.token}`, { ...moved, step: undefined }); // just made at this step
      if (!isDm && !readyFlow) await publicReply(hit, c);
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
