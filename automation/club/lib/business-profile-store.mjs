/**
 * Persists BusinessProfile (see business-profile-schema.mjs) alongside the
 * member's club-state.mjs record, as its own file — same
 * one-concern-per-file convention order-state.mjs's header describes
 * (order.json/contact.json/tasks.json living separately per engagement).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { memberDir } from './club-state.mjs';
import { assertValidBusinessProfile, newBusinessProfile } from './business-profile-schema.mjs';

export function businessProfilePath(slug) {
  return path.join(memberDir(slug), 'profile.json');
}

export async function loadBusinessProfile(slug) {
  const p = businessProfilePath(slug);
  if (!existsSync(p)) return null;
  const saved = JSON.parse(await readFile(p, 'utf8'));
  // Backfill any fields the schema has gained since this profile was saved
  // (e.g. businessName/websiteUrl, added 2026-09-17) so an old on-disk
  // profile still satisfies assertValidBusinessProfile if it's re-saved
  // later (Connections' apply-import loads-then-saves) -- never overwrites
  // a real saved value, only fills in genuinely missing keys.
  return { ...newBusinessProfile(), ...saved };
}

export async function saveBusinessProfile(slug, profile) {
  assertValidBusinessProfile(profile);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(businessProfilePath(slug), JSON.stringify(profile, null, 2), 'utf8');
  return profile;
}
