/**
 * Per-engagement site credential storage — production concern, distinct
 * from Realistic V1's dev/test path (one fixed site via automation/.env).
 * Real engagements each connect a different customer's WordPress site;
 * credentials must be per-engagement, never committed, never logged in
 * plain form anywhere that isn't this store.
 *
 * Stored OUTSIDE the vault (clients/ is the Obsidian vault, readable by
 * anything that opens the repo) at automation/implementation/.secrets/
 * <slug>.json — gitignored (see automation/.gitignore). Same trust
 * boundary as automation/.env, just per-engagement instead of one global file.
 */

import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECRETS_DIR = path.resolve(__dirname, '..', '.secrets');

function secretsPath(slug) {
  return path.join(SECRETS_DIR, `${slug}.json`);
}

/** @param {{baseUrl:string, wpUser:string, wpAppPassword:string, seoPlugin:string, connectedAt?:string}} creds */
export async function storeSiteCredentials(slug, creds) {
  await mkdir(SECRETS_DIR, { recursive: true });
  const record = { ...creds, connectedAt: creds.connectedAt || new Date().toISOString() };
  await writeFile(secretsPath(slug), JSON.stringify(record, null, 2), { mode: 0o600 });
  return record;
}

export async function loadSiteCredentials(slug) {
  try {
    return JSON.parse(await readFile(secretsPath(slug), 'utf8'));
  } catch {
    return null;
  }
}

/** Called after engagement completion / on customer request — the credential no longer needs to exist once the engagement is done. */
export async function revokeSiteCredentials(slug) {
  try {
    await unlink(secretsPath(slug));
    return true;
  } catch {
    return false;
  }
}

export function hasSiteCredentials(slug) {
  return loadSiteCredentials(slug).then((c) => c !== null);
}
