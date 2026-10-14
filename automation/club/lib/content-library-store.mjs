/**
 * Saved Content Library -- one JSON array per member
 * (`club/members/<slug>/content-library.json`), same one-concern-per-file
 * convention as every other Club store. Each entry is something a member
 * chose to keep after adapting a starter idea for a specific platform:
 * their own edited text, not anything generated or claimed on their
 * behalf after the fact.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { memberDir } from './club-state.mjs';

export function contentLibraryPath(slug) {
  return path.join(memberDir(slug), 'content-library.json');
}

export async function loadSavedContent(slug) {
  const p = contentLibraryPath(slug);
  if (!existsSync(p)) return [];
  return JSON.parse(await readFile(p, 'utf8'));
}

/**
 * @param {string} slug
 * @param {{sourceIdea: string, platform: string, text: string}} item
 * @returns {Promise<object>} the saved record, with id/savedAt set
 */
export async function saveContentItem(slug, item) {
  if (!item || typeof item.text !== 'string' || !item.text.trim()) {
    throw new Error('Cannot save empty content');
  }
  const items = await loadSavedContent(slug);
  const record = {
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    sourceIdea: item.sourceIdea || null,
    platform: item.platform || 'general',
    text: item.text,
  };
  items.unshift(record);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(contentLibraryPath(slug), JSON.stringify(items, null, 2), 'utf8');
  return record;
}

export async function deleteContentItem(slug, id) {
  const items = await loadSavedContent(slug);
  const next = items.filter((i) => i.id !== id);
  await mkdir(memberDir(slug), { recursive: true });
  await writeFile(contentLibraryPath(slug), JSON.stringify(next, null, 2), 'utf8');
  return next;
}
