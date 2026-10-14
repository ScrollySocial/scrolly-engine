#!/usr/bin/env node
/**
 * Apply approved tasks: write -> read back via the API -> compare expected
 * vs actual -> log -> mark applied. Never applies a task that isn't
 * approvalState==='approved' (implementation-agent.md §5/§8).
 *
 * Usage: node apply.mjs <client-slug>
 */
import { loadTasks, saveTasks, logEvent } from './lib/snapshot-store.mjs';
import { writeField, readField } from './lib/cms-adapter.mjs';
import { valuesMatch } from './lib/compare.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node apply.mjs <client-slug>');
  process.exit(1);
}

const tasks = await loadTasks(slug);
const toApply = tasks.filter((t) => t.approvalState === 'approved' && !t.apply.applied);

if (toApply.length === 0) {
  console.log('Nothing to apply (no approved, unapplied tasks).');
  process.exit(0);
}

for (const task of toApply) {
  let writeOk = false;
  try {
    await writeField(task, task.proposedValue);
    writeOk = true;
  } catch (err) {
    task.apply.writeOk = false;
    await logEvent(slug, { type: 'apply_error', taskId: task.taskId, error: String(err?.message || err) });
    console.error(`FAILED to write ${task.taskId.slice(0, 8)} (${task.fieldType}): ${err?.message || err}`);
    continue;
  }

  const verifiedValue = await readField(task);
  const verifiedMatch = valuesMatch(task, task.proposedValue, verifiedValue);

  task.apply = {
    applied: true,
    appliedAt: new Date().toISOString(),
    writeOk,
    verifiedAt: new Date().toISOString(),
    verifiedValue,
    verifiedMatch,
  };

  await logEvent(slug, {
    type: 'apply',
    taskId: task.taskId,
    fieldType: task.fieldType,
    proposedValue: task.proposedValue,
    verifiedValue,
    verifiedMatch,
  });

  console.log(`${task.taskId.slice(0, 8)} (${task.fieldType}) applied — verified match: ${verifiedMatch}`);
  if (!verifiedMatch) {
    console.warn(`  WARNING: read-back value does not match what was written. Written: "${task.proposedValue}" / Read back: "${verifiedValue}"`);
  }
}

await saveTasks(slug, tasks);
