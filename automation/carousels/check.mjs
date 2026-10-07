// Rule checks + ledger comparison without rendering. Run before writing slides (with just the brief + hook)
// to catch repeats early, and again after drafting.
// Usage: node check.mjs <post-id>
import { cfg, loadPost } from './lib/common.mjs';
import { lint } from './lib/rules.mjs';
import { compare } from './lib/ledger.mjs';

const post = loadPost(process.argv[2]);
const { errors, warnings } = lint(post);
const { similar, warnings: lw } = compare(post, cfg('media').photoReuseWeeks);
for (const e of errors) console.log('ERROR   ' + e);
for (const w of [...warnings, ...lw]) console.log('WARN    ' + w);
for (const s of similar) console.log(`SIMILAR ${s.id} (${Math.round(s.score * 100)}%): ${s.topic} / "${s.hook}"`);
console.log(`\n${errors.length} error(s), ${warnings.length + lw.length} warning(s), ${similar.length} similar post(s)`);
process.exitCode = errors.length ? 1 : 0;
