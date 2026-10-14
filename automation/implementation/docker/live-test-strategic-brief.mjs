#!/usr/bin/env node
/**
 * Realistic-scope component 5 live validation: Path 4 strategic
 * implementation briefs. Pure generation, no CMS write — same shape as
 * live-test-link-planner.mjs. Uses a REAL finding from Mulberry Creek's
 * actual audit (findings.json Category D) as input, and the Docker test
 * site's real pages as the known-URL set for the internal-link QA guard.
 */
import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStrategicBrief, validateBrief, renderBriefReview } from '../lib/strategic-brief-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

const siteConfig = { baseUrl: process.env.WP_BASE_URL, wpUser: process.env.WP_APP_USER, wpAppPassword: process.env.WP_APP_PASSWORD };
async function getPage(id) {
  const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
  const res = await fetch(`${siteConfig.baseUrl}/wp-json/wp/v2/pages/${id}?context=edit`, { headers: { Authorization: `Basic ${token}` } });
  const obj = await res.json();
  return { url: obj.link, title: obj.title.raw };
}
const siteContext = [await getPage(10), await getPage(18)];

// --- Step 1: prove QA catches a deliberately-broken brief ------------------
const brokenBrief = { slug: 'Not A Valid Slug!', title: '', targetKeyword: 'test', contentOutline: [], internalLinksIn: ['http://example.com/invented-url/'], internalLinksOut: [] };
const brokenResult = validateBrief(brokenBrief, siteContext);
console.log(`Deliberately-broken brief correctly failed QA: ${brokenResult.qa.passed === false}`);
if (brokenResult.qa.passed) {
  console.error('QA did not catch the broken brief — do not trust the real generation below.');
  process.exit(1);
}

// --- Step 2: real finding, real generation ----------------------------------
const findingsRows = JSON.parse(await readFile(path.join(VAULT_DIR, 'clients', 'mulberry-creek', 'discover', 'findings.json'), 'utf8'));
const finding = findingsRows.find((r) => r.table === 'D' && r.finding.includes('Plant Nursery / Garden Center'));
if (!finding) {
  console.error('Could not find the expected Category D finding in mulberry-creek/discover/findings.json.');
  process.exit(1);
}
console.log(`Using real finding: "${finding.finding.slice(0, 100)}..."`);

const rawBrief = await generateStrategicBrief(finding, siteContext);
const validated = validateBrief(rawBrief, siteContext);

console.log(`\nTitle: ${validated.title}`);
console.log(`Slug: /${validated.slug}/`);
console.log(`Target keyword: ${validated.targetKeyword}`);
console.log(`Outline sections: ${validated.contentOutline?.length}`);
console.log(`Internal links in: ${JSON.stringify(validated.internalLinksIn)}`);
console.log(`Internal links out: ${JSON.stringify(validated.internalLinksOut)}`);
console.log(`QA: ${validated.qa.passed ? 'PASS' : 'FAIL — ' + validated.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ')}`);

const implDir = path.join(VAULT_DIR, 'clients', 'mulberry-creek', 'implementation');
await mkdir(implDir, { recursive: true });
await writeFile(path.join(implDir, 'strategic-brief-nursery-page.md'), renderBriefReview(validated));
console.log(`\nWrote ${implDir}/strategic-brief-nursery-page.md`);
