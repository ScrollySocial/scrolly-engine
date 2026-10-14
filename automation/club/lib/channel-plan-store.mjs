/**
 * Persists the Module 4 ChannelPlan alongside the member's other files
 * (state.json, profile.json, offer-plan.json, discovery-plan.json) -- same
 * one-concern-per-file convention as offer-plan-store.mjs/discovery-plan-store.mjs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidChannelPlan } from './channel-plan-schema.mjs';

export function channelPlanPath(slug) {
  return path.join(memberDir(slug), 'channel-plan.json');
}

export async function loadChannelPlan(slug) {
  const p = channelPlanPath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveChannelPlan(slug, plan) {
  assertValidChannelPlan(plan);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(channelPlanPath(slug), JSON.stringify(plan, null, 2), 'utf8');
  return plan;
}
