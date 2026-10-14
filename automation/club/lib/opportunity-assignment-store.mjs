/**
 * Persistence for a member's opportunity assignments (recommended/planned/
 * posted, updated in place by assignmentId as state advances) and their
 * posted results (append-only -- a result, once recorded, is never
 * overwritten, same convention as growth-review-store.mjs).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { memberDir } from './club-state.mjs';

function assignmentsPath(slug) {
  return path.join(memberDir(slug), 'opportunity-assignments.json');
}
function resultsPath(slug) {
  return path.join(memberDir(slug), 'opportunity-results.json');
}

export async function loadAssignments(slug) {
  const p = assignmentsPath(slug);
  return existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : [];
}

async function saveAssignments(slug, assignments) {
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(assignmentsPath(slug), JSON.stringify(assignments, null, 2), 'utf8');
}

/** Appends new assignment records, skipping any (opportunityId, platform, challengeAttemptId) already present -- never creates a duplicate recommendation. */
export async function addAssignments(slug, newOnes) {
  const existing = await loadAssignments(slug);
  const key = (a) => `${a.challengeAttemptId}::${a.opportunityId}::${a.platform}`;
  const existingKeys = new Set(existing.map(key));
  const toAdd = newOnes.filter((a) => !existingKeys.has(key(a)));
  const all = [...existing, ...toAdd];
  await saveAssignments(slug, all);
  return all;
}

/** Updates one assignment's state in place (recommended -> planned -> posted). Throws if the assignment doesn't belong to this member. */
export async function updateAssignmentState(slug, assignmentId, patch) {
  const all = await loadAssignments(slug);
  const idx = all.findIndex((a) => a.assignmentId === assignmentId);
  if (idx === -1) throw new Error(`No assignment "${assignmentId}" for member "${slug}"`);
  all[idx] = { ...all[idx], ...patch };
  await saveAssignments(slug, all);
  return all[idx];
}

export async function loadOpportunityResults(slug) {
  const p = resultsPath(slug);
  return existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : [];
}

/** Append-only -- a posted item's results are never overwritten, only ever added to. */
export async function appendOpportunityResult(slug, result) {
  const all = await loadOpportunityResults(slug);
  const record = { ...result, resultId: randomUUID(), recordedAt: new Date().toISOString() };
  all.push(record);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(resultsPath(slug), JSON.stringify(all, null, 2), 'utf8');
  return record;
}
