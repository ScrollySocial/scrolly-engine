/**
 * Preserves ONE final metrics snapshot per Challenge attempt, captured the
 * first time its window is observed to have closed (day 30 hit or later,
 * regardless of goal outcome) -- never overwritten afterward, even if the
 * customer keeps reporting new metrics later. Same one-file-per-member,
 * append-only-by-key convention as growth-review-store.mjs, keyed by
 * challengeId instead of always appending, since there is exactly one
 * final snapshot per attempt, not a history of them.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';

function completionsPath(slug) {
  return path.join(memberDir(slug), 'challenge-completions.json');
}

export async function loadChallengeCompletions(slug) {
  const p = completionsPath(slug);
  if (!existsSync(p)) return [];
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function getChallengeCompletion(slug, challengeId) {
  const all = await loadChallengeCompletions(slug);
  return all.find((c) => c.challengeId === challengeId) || null;
}

/**
 * Idempotent: if a final snapshot already exists for this challengeId,
 * returns it unchanged (never overwrites). Otherwise captures `metrics` as
 * the permanent final snapshot.
 */
export async function captureFinalSnapshotOnce(slug, challengeId, metrics, capturedAt = new Date().toISOString()) {
  const all = await loadChallengeCompletions(slug);
  const existing = all.find((c) => c.challengeId === challengeId);
  if (existing) return existing;
  const record = { challengeId, capturedAt, finalSnapshot: structuredClone(metrics) };
  all.push(record);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(completionsPath(slug), JSON.stringify(all, null, 2), 'utf8');
  return record;
}
