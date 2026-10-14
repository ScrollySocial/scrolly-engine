/**
 * Persists the Module 6 SalesPathPlan alongside the member's other files --
 * same one-concern-per-file convention as every prior module's store.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidSalesPathPlan } from './sales-path-plan-schema.mjs';

export function salesPathPlanPath(slug) {
  return path.join(memberDir(slug), 'sales-path-plan.json');
}

export async function loadSalesPathPlan(slug) {
  const p = salesPathPlanPath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveSalesPathPlan(slug, plan) {
  assertValidSalesPathPlan(plan);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(salesPathPlanPath(slug), JSON.stringify(plan, null, 2), 'utf8');
  return plan;
}
