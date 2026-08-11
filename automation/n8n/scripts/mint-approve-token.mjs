#!/usr/bin/env node
/**
 * Mints a single-use approval token for one engagement's review email, per
 * REQUIRE_MANUAL_APPROVAL's hard-stop gate (see plan / discover-engine.md's
 * Automated Mode section). Called by "Engagement Complete" before composing
 * the operator review email.
 *
 * Usage: node mint-approve-token.mjs <slug>
 * stdout: {"token": "..."}
 */
import { randomBytes } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { engagementDir } from './_paths.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node mint-approve-token.mjs <slug>');
  process.exit(1);
}

const token = randomBytes(24).toString('hex');
const dir = engagementDir(slug);
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, 'approve-token.txt'), token, 'utf8');

process.stdout.write(JSON.stringify({ token, slug }));
