// Every 15 minutes: one reminder DM to people who got a signup link but haven't signed up
// after the keyword's hours. Only inside Instagram's 24-hour window after their last DM,
// and only once (the inbox decides who is due: GET /flows/due).
if (!isMyJob('reminders')) return [];
let keywords = [];
try {
  keywords = JSON.parse(fs.readFileSync(cfg('KEYWORDS_FILE', '/data/config/keywords.json'), 'utf8')).keywords || [];
} catch (e) {
  logError('keywords-file', e);
}
const PUBLIC = cfg('INBOX_PUBLIC_URL', 'https://hooks.scrollyseo.com');
let due = [];
try {
  due = (await inbox('GET', '/flows/due')).flows || [];
} catch (e) {
  logError('inbox-due', e);
  return [{ json: { job: 'reminders', error: errText(e) } }];
}
const out = [];
for (const f of due) {
  const k = keywords.find((x) => x.keyword === f.keyword);
  if (!k?.reminder?.on || !f.dmPersonId) continue;
  const text = k.reminder.text.replace('{link}', `${PUBLIC}/inbox/f/${f.token}`);
  let result = 'test';
  if (!DRY_RUN) {
    try {
      await http({
        method: 'POST',
        url: `${GRAPH}/${cfg('IG_USER_ID') || 'me'}/messages`,
        headers: { Authorization: `Bearer ${igToken()}` },
        body: { recipient: { id: f.dmPersonId }, message: { text } },
      });
      result = 'sent';
    } catch (e) {
      logError('instagram-reminder', e);
      result = 'failed';
    }
  }
  // Marked reminded even when it failed or test mode is on, so nobody gets nudged twice.
  try {
    await inbox('PATCH', `/flows/${f.token}`, { step: 'reminded' });
  } catch (e) {
    logError('inbox-flow-reminded', e);
  }
  out.push({ json: { keyword: f.keyword, result } });
}
state.lastRuns = { ...(state.lastRuns || {}), reminders: { at: now(), due: due.length, sent: out.filter((o) => o.json.result === 'sent').length } };
return out;
