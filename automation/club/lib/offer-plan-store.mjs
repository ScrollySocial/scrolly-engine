/**
 * Persists the Module 2 OfferPlan alongside the member's other files
 * (state.json, profile.json) -- same one-concern-per-file convention as
 * business-profile-store.mjs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidOfferPlan } from './offer-plan-schema.mjs';

export function offerPlanPath(slug) {
  return path.join(memberDir(slug), 'offer-plan.json');
}

export async function loadOfferPlan(slug) {
  const p = offerPlanPath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveOfferPlan(slug, plan) {
  assertValidOfferPlan(plan);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(offerPlanPath(slug), JSON.stringify(plan, null, 2), 'utf8');
  return plan;
}
