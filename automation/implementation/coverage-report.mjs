#!/usr/bin/env node
/**
 * Coverage/reconciliation report: proves every row in a real findings.json
 * receives an explicit disposition, per the productization requirement that
 * no audit finding may be silently dropped. Deterministic — no LLM, no CMS
 * access needed, safe to run against any findings.json at any time.
 *
 * Usage: node coverage-report.mjs <client-slug>
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyFindings } from './lib/finding-classifier.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node coverage-report.mjs <client-slug>');
  process.exit(1);
}

const findingsPath = path.join(VAULT_DIR, 'clients', slug, 'discover', 'findings.json');
const rows = JSON.parse(await readFile(findingsPath, 'utf8'));

const { classified, counts, unclassifiedCount } = classifyFindings(rows);

const actionableDispositions = new Set(['PATH_1', 'PATH_2', 'PATH_3', 'PATH_4']);
const actionableCount = classified.filter((c) => actionableDispositions.has(c.disposition)).length;

console.log(`Total findings: ${rows.length}`);
console.log(`Actionable (Path 1-4): ${actionableCount}`);
console.log('Counts by disposition:', JSON.stringify(counts, null, 2));
console.log(`Unclassified: ${unclassifiedCount}`);

const lines = [
  `# Coverage Reconciliation — ${slug}`,
  '',
  `Generated ${new Date().toISOString()}. Proves every finding in \`findings.json\` receives an explicit, deterministic disposition — none silently dropped.`,
  '',
  `**Total findings: ${rows.length}**`,
  `**Actionable (routed to an implementation path): ${actionableCount}**`,
  `**Unclassified: ${unclassifiedCount}** ${unclassifiedCount === 0 ? '(requirement met)' : '(REQUIREMENT NOT MET)'}`,
  '',
  '## Counts by disposition',
  '',
  '| disposition | count |',
  '|---|---|',
  ...Object.entries(counts).map(([k, v]) => `| ${k} | ${v} |`),
  '',
  '## Every finding, with disposition and reason',
  '',
  '| # | table | finding | disposition | reason |',
  '|---|---|---|---|---|',
  ...classified.map((c) => `| ${c.index} | ${c.table} | ${String(c.finding).slice(0, 90).replace(/\|/g, '\\|')} | ${c.disposition} | ${c.reason.replace(/\|/g, '\\|')} |`),
];

const outDir = path.join(VAULT_DIR, 'clients', slug, 'implementation');
await import('node:fs/promises').then((fs) => fs.mkdir(outDir, { recursive: true }));
const outPath = path.join(outDir, 'coverage-reconciliation.md');
await writeFile(outPath, lines.join('\n') + '\n');
console.log(`\nWrote ${outPath}`);

process.exit(unclassifiedCount === 0 ? 0 : 1);
