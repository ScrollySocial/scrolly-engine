// Meta's one-time webhook check: GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
// Answer with the challenge only when the token matches META_VERIFY_TOKEN.
const q = $input.first().json.query || {};
const expected = cfg('META_VERIFY_TOKEN');
const ok = expected && q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === expected;
return [{ json: { status: ok ? 200 : 403, body: ok ? String(q['hub.challenge'] ?? '') : 'forbidden' } }];
