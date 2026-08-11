#!/usr/bin/env node
/**
 * Appends a delivery record to status.md after the client email successfully
 * sends. Usage: node mark-delivered.mjs <slug>
 */
import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { engagementDir } from './_paths.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node mark-delivered.mjs <slug>');
  process.exit(1);
}

await appendFile(
  path.join(engagementDir(slug), 'status.md'),
  `\n- Delivered to client: yes (${new Date().toISOString()})\n`,
  'utf8'
);

process.stdout.write(JSON.stringify({ slug, delivered: true }));
