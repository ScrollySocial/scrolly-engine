// One person's setup, read from automation/reel-hf/reel-settings.json (REEL_SETTINGS=<file> points elsewhere, e.g. to
// test). lib/ never hard-codes a name, folder, browser path or tracker id: it asks this module.
//   S        the settings as written
//   P        every path in them, resolved (relative paths are relative to automation/reel-hf)
//   tool('ffmpeg')   ffmpeg/ffprobe from tools.bin, or the one on PATH if bin doesn't have it
//   browser()        tools.browser if it exists, else the first Edge/Chrome found on this machine
//   launch(opts)     headless browser via the puppeteer in tools.hyperframesDir
//   withBin(env)     env with tools.bin first on PATH (HyperFrames looks for ffmpeg + ffprobe there)
//   hf               'hyperframes@<version>' for npx
//   draftRenders     review renders are quick drafts (15 fps, draft quality) and the full render waits for Approve it;
//                    settings render.draft = false renders full quality straight away
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sweepInBackground } from './stray-browsers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(HERE, '..');
export const FILE = process.env.REEL_SETTINGS ? path.resolve(process.env.REEL_SETTINGS) : path.join(ROOT, 'reel-settings.json');
const WIN = process.platform === 'win32';

export const S = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
for (const k of ['owner', 'folders', 'tools', 'review', 'posting', 'tracker', 'rules', 'templates', 'render']) S[k] ||= {};

const abs = (p) => (p ? path.resolve(ROOT, p) : '');
export const P = {
  footage: abs(S.folders.footage),
  exports: abs(S.folders.exports),
  hyperframesDir: abs(S.tools.hyperframesDir || '../hyperframes-test'),
  bin: abs(S.tools.bin || '../hyperframes-test/bin'),
  python: abs(S.tools.python),
  transcribeScript: abs(S.tools.transcribeScript),
  transcripts: abs(S.tools.transcripts),
  cutScript: abs(S.tools.cutScript),
  rows: abs(S.tracker.rows || 'rows.json'),
  rulesDoc: abs(S.rules.doc),
  wordpressClient: abs(S.posting.wordpressClient),
};

export const hf = `hyperframes@${S.tools.hyperframes || '0.8.150'}`;
export const draftRenders = S.render.draft !== false;
export const ownerName = S.owner.name || 'you';
export const ports = { hub: S.review.hubPort || 4320, page: S.review.pagePort || 4321, firstReel: S.review.firstReelPort || 4331 };

export const exe = (name) => name + (WIN ? '.exe' : '');
export function tool(name) {
  const p = path.join(P.bin, exe(name));
  return existsSync(p) ? p : name;
}
export const withBin = (env = process.env) => ({ ...env, PATH: `${P.bin}${path.delimiter}${env.PATH || env.Path || ''}` });

// Edge first (the bundled headless Chrome can hang silently after a Windows restart), then Chrome
export const BROWSERS = WIN
  ? ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
     'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
     process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe')].filter(Boolean)
  : process.platform === 'darwin'
    ? ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
export function findBrowser() { return BROWSERS.find((b) => existsSync(b)) || ''; }
export function browser() {
  if (S.tools.browser && existsSync(S.tools.browser)) return S.tools.browser;
  const found = findBrowser();
  if (!found) throw new Error('No Edge or Chrome found. Run: node lib/doctor.mjs');
  return found;
}

export const puppeteer = () => createRequire(path.join(P.hyperframesDir, 'package.json'))('puppeteer');
// the browser closes with this script, even when it ends on an error; leftovers from killed scripts get swept
export async function launch(opts = {}) {
  sweepInBackground();
  const b = await puppeteer().launch({ executablePath: browser(), ...opts });
  const kill = () => { try { b.process()?.kill(); } catch {} };
  process.once('exit', kill);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGBREAK']) process.once(sig, () => { kill(); process.exit(130); });
  b.once('disconnected', () => process.off('exit', kill));
  return b;
}

// a template's values with this person's overrides (settings templates.<name>) merged in
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
export function merge(base, over) {
  if (!isObj(over)) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) if (!k.startsWith('_')) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
}
export const forTemplate = (base) => merge(base, S.templates[base.name]);

// doctor + setup: change some settings and write the file back (keeps key order and _notes)
export function saveSettings(patch) {
  const cur = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
  const next = merge(cur, patch);
  writeFileSync(FILE, JSON.stringify(next, null, 2) + '\n');
  Object.assign(S, next);
  return next;
}

// python can be a venv path or a command on PATH ('python3')
export function pythonCmd() {
  if (S.tools.python && existsSync(P.python)) return P.python;
  for (const c of WIN ? ['python', 'py'] : ['python3', 'python']) {
    try { execFileSync(c, ['--version'], { stdio: 'ignore' }); return c; } catch {}
  }
  return '';
}
