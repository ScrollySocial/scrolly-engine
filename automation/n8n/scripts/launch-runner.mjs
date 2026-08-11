#!/usr/bin/env node
/**
 * Launches automation/runner/run-discover.mjs for a given client slug as a
 * detached background process, so the n8n "Intake & Kickoff" workflow can
 * return immediately instead of blocking on a full engagement run.
 *
 * Usage: node launch-runner.mjs <slug>
 * stdout: {"launched": true, "pid": 1234, "slug": "..."}
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { openSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { AUTOMATION_DIR, engagementDir } from './_paths.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node launch-runner.mjs <slug>');
  process.exit(1);
}

const runnerPath = path.join(AUTOMATION_DIR, 'runner', 'run-discover.mjs');
const rawDir = path.join(engagementDir(slug), 'raw');
const logPath = path.join(rawDir, 'launch-stdout.log');

// Create raw/ ourselves so the launch log always lands in a real file —
// letting stdio silently fall back to 'ignore' here previously made a stuck
// detached child impossible to debug (see automation/README.md's note on
// the 2026-08-10 detached-spawn investigation).
mkdirSync(rawDir, { recursive: true });
const outFd = openSync(logPath, 'a');

const child = spawn(process.execPath, [runnerPath, slug], {
  cwd: AUTOMATION_DIR,
  detached: true,
  windowsHide: true,
  stdio: ['ignore', outFd, outFd],
  env: process.env,
});
child.unref();

process.stdout.write(JSON.stringify({ launched: true, pid: child.pid, slug }));
