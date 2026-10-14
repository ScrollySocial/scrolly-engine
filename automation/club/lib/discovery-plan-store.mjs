/**
 * Persists the Module 3 DiscoveryPlan alongside the member's other files
 * (state.json, profile.json, offer-plan.json) -- same one-concern-per-file
 * convention as offer-plan-store.mjs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidDiscoveryPlan } from './discovery-plan-schema.mjs';

export function discoveryPlanPath(slug) {
  return path.join(memberDir(slug), 'discovery-plan.json');
}

export async function loadDiscoveryPlan(slug) {
  const p = discoveryPlanPath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveDiscoveryPlan(slug, plan) {
  assertValidDiscoveryPlan(plan);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(discoveryPlanPath(slug), JSON.stringify(plan, null, 2), 'utf8');
  return plan;
}
