// GET /webhook/comments-status with header x-run-secret: RUN_SECRET answers with
// what the workflow has been doing: test mode, last checks, last 20 errors.
const item = $input.first().json;
const secret = cfg('RUN_SECRET');
if (!secret || (item.headers || {})['x-run-secret'] !== secret) return [{ json: { error: 'forbidden' } }];
return [{
  json: {
    testMode: DRY_RUN,
    commentsSeen: Object.keys(state.seen || {}).length,
    dmsSent: Object.keys(state.dm || {}).length,
    youtubeCheckedAt: state.youtubeCheckedAt || null,
    tiktokCheckedAt: state.tiktokCheckedAt || null,
    igTokenRefreshedAt: state.igTokenAt || null,
    lastRuns: state.lastRuns || {},
    errors: state.errors || [],
  },
}];
