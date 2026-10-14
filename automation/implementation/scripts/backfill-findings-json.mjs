#!/usr/bin/env node
/**
 * One-time dev/test utility: parses an EXISTING findings.md (written before
 * the findings.json prompt addition existed) into the same findings.json
 * shape future Discover runs will emit natively. Not part of the production
 * path — production engagements get findings.json directly from the runner
 * going forward (see runner/run-discover.mjs's Step-13 instruction). This
 * exists only so Checkpoint-1 can be proven against Mulberry Creek's real,
 * already-collected findings without re-running (and re-paying for) the
 * audit. Markdown-table parsing is exactly the fragile path
 * implementation-agent.md §11 says to avoid for production — kept
 * deliberately out of the translator/engine for that reason.
 *
 * Usage: node scripts/backfill-findings-json.mjs <client-slug>
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/backfill-findings-json.mjs <client-slug>');
  process.exit(1);
}

const mdPath = path.join(VAULT_DIR, 'clients', slug, 'discover', 'findings.md');
const jsonPath = path.join(VAULT_DIR, 'clients', slug, 'discover', 'findings.json');

const md = await readFile(mdPath, 'utf8');
const lines = md.split('\n');

let currentTableTag = null;
const rows = [];
let i = 0;

function tagFromHeading(line) {
  // "## A. Competitive Search Landscape" -> "A"; "### Geographic Market (O2)" -> "O2"
  const catMatch = line.match(/^##\s+([A-Z])\./);
  if (catMatch) return catMatch[1];
  const oMatch = line.match(/\((O\d+)\)/);
  if (oMatch) return oMatch[1];
  return currentTableTag;
}

while (i < lines.length) {
  const line = lines[i];
  if (/^#{2,3}\s/.test(line)) {
    currentTableTag = tagFromHeading(line) || currentTableTag;
  }
  // Table header row: starts with | and the NEXT line is a |---|---| separator.
  if (line.trim().startsWith('|') && lines[i + 1] && /^\|[\s-:|]+\|$/.test(lines[i + 1].trim())) {
    const headerCells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
    let j = i + 2;
    while (j < lines.length && lines[j].trim().startsWith('|')) {
      const raw = lines[j].trim();
      const cells = raw.slice(1, -1).split('|').map((c) => c.trim());
      if (cells.length === headerCells.length) {
        const obj = { table: currentTableTag };
        headerCells.forEach((h, idx) => {
          obj[h] = cells[idx];
        });
        rows.push(obj);
      }
      j += 1;
    }
    i = j;
    continue;
  }
  i += 1;
}

await writeFile(jsonPath, JSON.stringify(rows, null, 2));
console.log(`Backfilled ${rows.length} rows from ${mdPath} -> ${jsonPath}`);
