/**
 * Persists the Module 5 MessagingPlan alongside the member's other files
 * (state.json, profile.json, offer-plan.json, discovery-plan.json,
 * channel-plan.json) -- same one-concern-per-file convention as
 * offer-plan-store.mjs/discovery-plan-store.mjs/channel-plan-store.mjs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidMessagingPlan } from './messaging-plan-schema.mjs';

export function messagingPlanPath(slug) {
  return path.join(memberDir(slug), 'messaging-plan.json');
}

export async function loadMessagingPlan(slug) {
  const p = messagingPlanPath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveMessagingPlan(slug, plan) {
  assertValidMessagingPlan(plan);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(messagingPlanPath(slug), JSON.stringify(plan, null, 2), 'utf8');
  return plan;
}
