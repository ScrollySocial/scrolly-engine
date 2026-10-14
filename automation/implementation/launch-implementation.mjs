#!/usr/bin/env node
/**
 * Launches run-implementation.mjs as a detached background process, mirroring
 * n8n/scripts/launch-runner.mjs's exact pattern (same reason: the webhook
 * caller should get an immediate response, not block on a run that can
 * involve several LLM calls and take minutes).
 *
 * Usage: node launch-implementation.mjs <slug>
 * stdout: {"launched": true, "pid": 1234, "slug": "..."}
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSync, mkdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTOMATION_DIR = path.resolve(__dirname, '..');
const VAULT_DIR = path.resolve(AUTOMATION_DIR, '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node launch-implementation.mjs <slug>');
  process.exit(1);
}

const scriptPath = path.join(__dirname, 'run-implementation.mjs');
const rawDir = path.join(VAULT_DIR, 'clients', slug, 'implementation');
mkdirSync(rawDir, { recursive: true });
const logPath = path.join(rawDir, 'launch-stdout.log');
const outFd = openSync(logPath, 'a');

const child = spawn(process.execPath, [scriptPath, slug], {
  cwd: AUTOMATION_DIR,
  detached: true,
  windowsHide: true,
  stdio: ['ignore', outFd, outFd],
  env: process.env,
});
child.unref();

process.stdout.write(JSON.stringify({ launched: true, pid: child.pid, slug }));
