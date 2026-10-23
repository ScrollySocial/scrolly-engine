// Drop comments already handled (polls see the same comments again) and old
// ones, so the first YouTube/TikTok run doesn't flood the inbox with history.
const maxAgeMs = Number(cfg('MAX_COMMENT_AGE_HOURS', '72')) * 3600 * 1000;
const seen = state.seen || {};
const out = [];
const batch = new Set();
for (const item of $input.all()) {
  const c = item.json;
  if (!c.id) continue; // error items from a fetch node
  const key = `${c.platform}:${c.id}`;
  if (seen[key] || batch.has(key)) continue;
  const age = Date.now() - new Date(c.createdAt).getTime();
  // Too old: skipped without remembering it, so the seen list never outlives the
  // YouTube cleanup (youtube-cleanup.js).
  if (Number.isFinite(age) && age > maxAgeMs) continue;
  batch.add(key);
  out.push({ json: { ...c, key } });
}
return out;
