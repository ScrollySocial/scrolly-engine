/**
 * Persistence for implementation tasks / change history.
 * clients/<slug>/implementation/tasks.json — one JSON array, whole-file
 * read/write. Plain files, consistent with how the rest of this repo
 * already persists per-engagement state (findings.md, status.md, etc.) —
 * no database needed at this scale (implementation-agent.md: don't add
 * infrastructure the task doesn't require).
 */

import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

function dir(slug) {
  return path.join(VAULT_DIR, 'clients', slug, 'implementation');
}
function tasksPath(slug) {
  return path.join(dir(slug), 'tasks.json');
}
function changeLogPath(slug) {
  return path.join(dir(slug), 'change-log.ndjson');
}

export async function loadTasks(slug) {
  const p = tasksPath(slug);
  if (!existsSync(p)) return [];
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function saveTasks(slug, tasks) {
  await mkdir(dir(slug), { recursive: true });
  await writeFile(tasksPath(slug), JSON.stringify(tasks, null, 2));
}

export async function upsertTask(slug, task) {
  const tasks = await loadTasks(slug);
  const idx = tasks.findIndex((t) => t.taskId === task.taskId);
  if (idx === -1) tasks.push(task);
  else tasks[idx] = task;
  await saveTasks(slug, tasks);
  return tasks;
}

/** Append-only audit trail — separate from tasks.json (which holds current state per task) so history is never overwritten. */
export async function logEvent(slug, event) {
  await mkdir(dir(slug), { recursive: true });
  const line = JSON.stringify({ at: new Date().toISOString(), ...event }) + '\n';
  await appendFile(changeLogPath(slug), line);
}
