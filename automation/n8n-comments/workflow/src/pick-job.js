// POST /webhook/comments-run with header x-run-secret: RUN_SECRET and body
// {"job": "youtube" | "tiktok" | "replies" | "token" | "cleanup" | "reminders"} runs one job now (used by
// tests and by Claude to check things without waiting for the schedule). The
// results show up in the status webhook (status.js) and her dashboard.
const item = $input.first().json;
const secret = cfg('RUN_SECRET');
if (!secret || (item.headers || {})['x-run-secret'] !== secret) return [{ json: { job: 'none', error: 'forbidden' } }];
const job = String(item.body?.job || '');
if (!['youtube', 'tiktok', 'replies', 'token', 'cleanup', 'reminders'].includes(job)) return [{ json: { job: 'none', error: `unknown job "${job}"` } }];
return [{ json: { job } }];
