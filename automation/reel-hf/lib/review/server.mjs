// Local review page for one Reel (laptop). Serves the page, the Reel's files (with byte ranges so video seeks),
// the reviewer's decisions (review/decisions.json, saved as they work) and one fixed job: rebuild the preview stage + review data.
// Usage: node lib/review/server.mjs [<reel-folder>] [--port <n>]   (default: the most recently built Reel; port from reel-settings.json)
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverHtml, COVER_STYLES } from '../cover.mjs';
import { BRANDS, defaultBrand } from '../brand/index.mjs';
import { reelStatus } from '../pipeline.mjs';
import { P, S, hf, ports, withBin } from '../settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '../..');
const args = process.argv.slice(2);
const PORT = +(args[args.indexOf('--port') + 1] || 0) || ports.page;
const pick = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const reels = readdirSync(ROOT).filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && existsSync(path.join(ROOT, d, 'build.mjs')));
const slug = pick ? path.basename(pick) : reels.sort((a, b) => statSync(path.join(ROOT, b, 'build.mjs')).mtimeMs - statSync(path.join(ROOT, a, 'build.mjs')).mtimeMs)[0];
const DIR = path.join(ROOT, slug);
if (!existsSync(DIR)) throw new Error(`no Reel folder ${DIR}`);
mkdirSync(path.join(DIR, 'review'), { recursive: true });
const DEC = path.join(DIR, 'review/decisions.json'), BUILD = path.join(DIR, 'review/build.json');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const soundHash = (d) => createHash('sha1').update(JSON.stringify([d.sound || {}, d.music || {}])).digest('hex').slice(0, 10);
let job = { running: false, log: '', ok: null };
let cutJob = { running: false, frame: null, ok: null };
const nn = (n) => String(n).padStart(2, '0');
// the speaker's cut-out for cover frame n: made on the review page, or the storyboard's existing one
const cutFor = (n) => [`review/cover-cuts/f${nn(n)}.png`, `sketch/f${nn(n)}-cut.png`].find((p) => existsSync(path.join(DIR, p)));
const slash = (p) => p.split(path.sep).join('/');
const urlFor = (abs) => { const a = path.resolve(abs); if (a.startsWith(DIR)) return '/reel/' + slash(path.relative(DIR, a)); if (a.startsWith(path.join(HERE, '..'))) return '/lib/' + slash(path.relative(path.join(HERE, '..'), a)); return ''; };
function makeCut(n) {
  if (cutJob.running || cutFor(n)?.startsWith('review/')) return;
  cutJob = { running: true, frame: n, ok: null };
  mkdirSync(path.join(DIR, 'review/cover-cuts'), { recursive: true });
  const p = spawn('npx', ['--yes', hf, 'remove-background', `sketch/f${nn(n)}.jpg`, '-o', `review/cover-cuts/f${nn(n)}.png`], { cwd: DIR, shell: true, env: withBin() });
  p.on('close', (code) => { cutJob = { running: false, frame: n, ok: code === 0 && existsSync(path.join(DIR, `review/cover-cuts/f${nn(n)}.png`)) }; });
}

function sendFile(req, res, file) {
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); return res.end('not found'); }
  const size = statSync(file).size, type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? +range[1] : size - +range[2], end = range[1] && range[2] ? +range[2] : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
}
const json = (res, obj, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const inside = (base, p) => { const f = path.resolve(base, '.' + p); return f.startsWith(path.resolve(base)) ? f : null; };

function rebuild() {
  if (job.running) return;
  job = { running: true, log: '', ok: null, started: Date.now() };
  const dec = existsSync(DEC) ? JSON.parse(readFileSync(DEC, 'utf8')) : {};
  const steps = [['build.mjs', 'review']]; // quick: stage + review data (transitions, music, covers)
  const next = () => {
    const step = steps.shift();
    if (!step) { job.running = false; job.ok = true; writeFileSync(BUILD, JSON.stringify({ at: new Date().toISOString(), soundHash: soundHash(dec) })); return; }
    const p = spawn(process.execPath, step, { cwd: DIR, env: withBin() });
    p.stdout.on('data', (d) => (job.log += d)); p.stderr.on('data', (d) => (job.log += d));
    p.on('close', (code) => { if (code) { job.running = false; job.ok = false; job.log += `\n(stopped: ${step.join(' ')} exited ${code})`; } else next(); });
  };
  next();
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
  if (p === '/' || p === '/index.html') return sendFile(req, res, path.join(HERE, 'page.html'));
  if (p === '/api/reel') {
    const f = path.join(DIR, 'review/reel.json');
    if (!existsSync(f)) return sendFile(req, res, f);
    // + who and where, for the page's labels (reel-settings.json)
    return json(res, { ...JSON.parse(readFileSync(f, 'utf8')), defaultBrand: defaultBrand().name, owner: S.owner.name || '', account: S.owner.instagram || '',
      scheduler: S.posting.scheduler || '', tracker: S.tracker.app && S.tracker.app !== 'none' ? S.tracker.name || S.tracker.app : '', statuses: S.tracker.statuses || {} });
  }
  if (p === '/api/state') {
    const dec = existsSync(DEC) ? JSON.parse(readFileSync(DEC, 'utf8')) : {};
    const b = existsSync(BUILD) ? JSON.parse(readFileSync(BUILD, 'utf8')) : null;
    let status = null; try { status = reelStatus(slug); } catch {}
    return json(res, { slug, status, cutJob, cuts: Array.from({ length: 30 }, (_, i) => i + 1).filter((n) => cutFor(n)), decisions: dec, build: b, current: soundHash(dec), job: { running: job.running, ok: job.ok, started: job.started, tail: job.log.split('\n').filter(Boolean).slice(-3) } });
  }
  if (p === '/api/decisions' && req.method === 'PUT') {
    let body = '';
    req.on('data', (d) => (body += d));
    return req.on('end', () => { try { const d = JSON.parse(body); writeFileSync(DEC, JSON.stringify({ ...d, savedAt: new Date().toISOString() }, null, 1)); json(res, { ok: true, current: soundHash(d) }); } catch (e) { json(res, { ok: false, error: e.message }, 400); } });
  }
  if (p === '/api/rebuild' && req.method === 'POST') { rebuild(); return json(res, { ok: true }); }
  if (p === '/api/cutout' && req.method === 'POST') { makeCut(+url.searchParams.get('frame')); return json(res, { ok: true }); }
  // live cover preview: frame, style (cut | photo), background, text, aside
  if (p === '/cover') {
    const q = url.searchParams, n = +q.get('frame') || 1, style = COVER_STYLES[q.get('style')] ? q.get('style') : 'cut', pos = q.get('pos') === 'top' ? 'top' : 'bottom';
    const cut = cutFor(n), photo = `sketch/f${nn(n)}.jpg`;
    const html = coverHtml({ brand: BRANDS[q.get('brand')] || defaultBrand(), text: q.get('text') || '', aside: q.get('aside') || '', style, pos, bg: q.get('bg') || 'cream', cut: cut && path.join(DIR, cut), photo: path.join(DIR, photo), asset: urlFor });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(html);
  }
  if (p.startsWith('/lib/')) { const f = inside(path.join(HERE, '..'), p.slice(4)); return f ? sendFile(req, res, f) : (res.writeHead(403), res.end()); }
  if (p.startsWith('/exports/')) { const f = inside(P.exports, p.slice(8)); return f ? sendFile(req, res, f) : (res.writeHead(403), res.end()); }
  if (p.startsWith('/reel/')) { const f = inside(DIR, p.slice(5)); return f ? sendFile(req, res, f) : (res.writeHead(403), res.end()); }
  res.writeHead(404); res.end('not found');
}).listen(PORT, '127.0.0.1', () => console.log(`Reel review for ${slug}: http://localhost:${PORT}`));
