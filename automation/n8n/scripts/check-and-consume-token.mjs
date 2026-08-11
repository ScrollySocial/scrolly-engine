#!/usr/bin/env node
/**
 * Validates the token from an "Approve & Send" webhook click against the
 * one minted by mint-approve-token.mjs, then deletes it (single-use).
 *
 * Usage: node check-and-consume-token.mjs <slug> <token>
 * stdout: {"valid": true|false}
 */
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { engagementDir } from './_paths.mjs';

const [slug, token] = process.argv.slice(2);
if (!slug || !token) {
  console.error('Usage: node check-and-consume-token.mjs <slug> <token>');
  process.exit(1);
}

const tokenPath = path.join(engagementDir(slug), 'approve-token.txt');

let stored;
try {
  stored = (await readFile(tokenPath, 'utf8')).trim();
} catch {
  process.stdout.write(JSON.stringify({ valid: false, reason: 'no pending approval for this engagement' }));
  process.exit(0);
}

const a = Buffer.from(stored);
const b = Buffer.from(token);
const valid = a.length === b.length && timingSafeEqual(a, b);

if (valid) {
  await unlink(tokenPath).catch(() => {});
}

process.stdout.write(JSON.stringify({ valid }));
