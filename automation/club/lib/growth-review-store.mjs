/**
 * Append-only history of Weekly Growth Reviews -- one file per member
 * (`club/members/<slug>/growth-reviews.json`, a JSON array), same
 * one-concern-per-file convention as every other module's store. Unlike
 * every prior module's single-object plan file, this one is a history: a
 * new review is always APPENDED, never overwrites a prior entry (see
 * growth-review-schema.mjs's header for why reviews are frozen historical
 * records, not re-derived current state).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { memberDir } from './club-state.mjs';

export function growthReviewsPath(slug) {
  return path.join(memberDir(slug), 'growth-reviews.json');
}

export async function loadGrowthReviews(slug) {
  const p = growthReviewsPath(slug);
  if (!existsSync(p)) return [];
  return JSON.parse(await readFile(p, 'utf8'));
}

/** The most recently appended review, or null if none exist yet. */
export async function getLatestGrowthReview(slug) {
  const reviews = await loadGrowthReviews(slug);
  return reviews.length > 0 ? reviews[reviews.length - 1] : null;
}

export async function getGrowthReviewById(slug, reviewId) {
  const reviews = await loadGrowthReviews(slug);
  return reviews.find((r) => r.reviewId === reviewId) || null;
}

/**
 * Appends a fully-computed review record (already including its diagnosis --
 * see module7.mjs) to history. Assigns `reviewId`/`createdAt` here so every
 * caller gets them consistently, never overwrites an existing entry.
 * @returns {Promise<object>} the appended record, with reviewId/createdAt set
 */
export async function appendGrowthReview(slug, reviewRecord) {
  const reviews = await loadGrowthReviews(slug);
  const record = { ...reviewRecord, reviewId: randomUUID(), createdAt: new Date().toISOString() };
  reviews.push(record);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(growthReviewsPath(slug), JSON.stringify(reviews, null, 2), 'utf8');
  return record;
}
