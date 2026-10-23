// Daily: YouTube comment data leaves the inbox and the state file well within
// Google's 30-day limit (YouTube API Services policy III.E.4, promised on
// scrollyseo.com/privacy/). The inbox deletes its own YouTube rows (also every
// 6 hours on its own); this job runs that now and prunes YouTube comment IDs
// from the "already seen" list. Instagram and TikTok are not touched
// (Mercedes 2026-10-23: only YouTube has a fixed limit).
if (!isMyJob('cleanup')) return [];
const days = Number(cfg('YOUTUBE_KEEP_DAYS', '21'));
const cutoff = new Date(Date.now() - days * 86400e3).toISOString();
let removed = 0;
let failed = 0;
try {
  removed = (await inbox('POST', '/cleanup', {})).removed || 0;
} catch (e) {
  logError('cleanup-inbox', e);
  failed++;
}

let pruned = 0;
for (const [key, at] of Object.entries(state.seen || {})) {
  if (key.startsWith('YouTube:') && at < cutoff) {
    delete state.seen[key];
    pruned++;
  }
}

state.lastRuns = { ...(state.lastRuns || {}), cleanup: { at: now(), keepDays: days, rowsRemoved: removed, idsPruned: pruned, failed } };
return [{ json: { job: 'cleanup', rowsRemoved: removed, idsPruned: pruned, failed } }];
