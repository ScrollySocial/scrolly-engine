// Meta posts comment events here. Check the X-Hub-Signature-256 header (HMAC
// SHA-256 of the raw body with the app secret) so nobody else can make the
// workflow send DMs, then turn each comment into the shared comment shape.
const crypto = require('crypto');
const item = $input.first();
const headers = item.json.headers || {};
const secret = cfg('META_APP_SECRET');
const sent = String(headers['x-hub-signature-256'] || '');

let raw;
try {
  raw = await helpers.getBinaryDataBuffer(0, 'data');
} catch (e) {
  raw = null;
}
if (!secret || !raw || !sent.startsWith('sha256=')) {
  logError('instagram-signature', new Error(`missing ${!secret ? 'META_APP_SECRET' : !raw ? 'raw body' : 'signature header'}`));
  return [];
}
const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
const given = sent.slice(7);
if (given.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
  logError('instagram-signature', new Error('signature mismatch, event ignored'));
  return [];
}

const body = JSON.parse(raw.toString('utf8'));
const ownId = cfg('IG_USER_ID');
const out = [];
for (const entry of body.entry || []) {
  // Instagram Login sends entry.changes[]; some examples put field/value on the entry itself.
  const changes = entry.changes || (entry.field ? [{ field: entry.field, value: entry.value }] : []);
  for (const ch of changes) {
    if (ch.field !== 'comments' || !ch.value) continue;
    const v = ch.value;
    const id = v.id || v.comment_id;
    const authorId = v.from?.id;
    if (!id || (ownId && authorId === ownId) || (entry.id && authorId === entry.id)) continue; // her own replies
    out.push({
      json: {
        platform: 'Instagram',
        id: String(id),
        text: v.text || '',
        author: v.from?.username || '',
        authorId: authorId || '',
        postId: v.media?.id || '',
        parentId: v.parent_id || '',
        threadId: '',
        link: '',
        createdAt: entry.time ? new Date(entry.time * (entry.time > 1e12 ? 1 : 1000)).toISOString() : now(),
      },
    });
  }
  // DMs (and Story replies) arrive as entry.messaging[]; only read once DMS_ENABLED=true.
  if (!DMS) continue;
  for (const m of entry.messaging || []) {
    const msg = m.message;
    if (!msg?.mid || msg.is_deleted || msg.is_unsupported) continue;
    const at = m.timestamp ? new Date(m.timestamp).toISOString() : now();
    const text = msg.text || (msg.attachments?.length ? `(${msg.attachments[0].type || 'attachment'})` : '');
    // Echo = a DM sent from her account (the Instagram app or this automation): kept for the conversation view.
    if (msg.is_echo) {
      try {
        await inbox('POST', '/rows', { kind: 'out', platform: 'Instagram', commentId: msg.mid, personId: m.recipient?.id || '', author: await igUsername(m.recipient?.id), text, status: 'Posted', receivedAt: at });
      } catch (e) {
        logError('inbox-echo', e);
      }
      continue;
    }
    const sender = m.sender?.id;
    if (!sender || sender === ownId || sender === entry.id) continue;
    out.push({
      json: {
        platform: 'Instagram',
        kind: 'dm',
        id: String(msg.mid),
        text,
        author: await igUsername(sender),
        authorId: sender,
        postId: '',
        parentId: '',
        threadId: '',
        link: '',
        note: msg.reply_to?.story ? 'Story reply' : '',
        // A tapped button ("Send it here" / "By email") arrives as its title, with our payload here.
        payload: msg.quick_reply?.payload || '',
        createdAt: at,
      },
    });
  }
}
return out;
