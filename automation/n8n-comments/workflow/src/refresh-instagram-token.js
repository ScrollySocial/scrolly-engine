// Instagram long-lived tokens last 60 days; refreshing weekly keeps them alive.
// The new token is kept in the state file (igToken() reads it first).
if (!isMyJob('token')) return [];
if (!igToken()) return [];
try {
  const res = await http({
    method: 'GET',
    url: cfg('IG_REFRESH_URL', 'https://graph.instagram.com/refresh_access_token'),
    qs: { grant_type: 'ig_refresh_token', access_token: igToken() },
  });
  if (!res.access_token) throw new Error('no access_token in the answer');
  state.igToken = res.access_token;
  state.igTokenAt = now();
  state.lastRuns = { ...(state.lastRuns || {}), token: { at: now(), refreshed: true } };
  return [{ json: { job: 'token', refreshed: true, expiresInDays: Math.round((res.expires_in || 0) / 86400) } }];
} catch (e) {
  logError('instagram-token', e);
  return [{ json: { job: 'token', refreshed: false, error: errText(e) } }];
}
