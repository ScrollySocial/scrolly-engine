// Shared paths, config loading and browser launch for the carousel tools.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

export const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = path.resolve(HERE, '../..');
export const W = 1080, H = 1440;

export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
export const cfg = (name) => readJson(path.join(HERE, 'config', name + '.json'));
export const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').split('/').map((seg, i) => (i === 0 && /^[A-Za-z]:$/.test(seg) ? seg : encodeURIComponent(seg))).join('/');
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const LEDGER = path.join(HERE, 'data/ledger.json');
export const MEDIA_INDEX = path.join(HERE, 'data/media-index.json');
export const postDir = (id) => path.join(HERE, 'posts', id);

export function loadPost(id) {
  const p = path.join(postDir(id), 'post.json');
  if (!existsSync(p)) throw new Error(`No post at ${p}`);
  return readJson(p);
}

// Puppeteer's Chrome headless shell (Edge can be mid-update and refuse to launch). Set CHROME to override.
export async function launch() {
  const { default: puppeteer } = await import('puppeteer-core');
  // Edge first: the bundled chrome-headless-shell hangs silently after a Windows restart (2026-10-13).
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  let exe = process.env.CHROME || (existsSync(EDGE) ? EDGE : null);
  if (!exe) {
    const base = path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell');
    const { readdirSync } = await import('node:fs');
    const ver = existsSync(base) && readdirSync(base).filter((d) => d.startsWith('win64-')).sort().pop();
    if (!ver) throw new Error('No chrome-headless-shell in ~/.cache/puppeteer. Run: npx puppeteer browsers install chrome-headless-shell');
    exe = path.join(base, ver, 'chrome-headless-shell-win64/chrome-headless-shell.exe');
  }
  return puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--allow-file-access-from-files'] });
}

export const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
export const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];
export const UNSUPPORTED_EXT = ['.heic', '.heif'];

// Palette by name; old names from before the 2026-10 rebrand (warm, tangerine, blush) resolve through brand.paletteAliases.
export const paletteName = (brand, name) => (brand.paletteAliases?.[name] && !name.startsWith('_') ? brand.paletteAliases[name] : name);
export const paletteFor = (brand, name) => (name && !name.startsWith('_') ? brand.palettes[paletteName(brand, name)] : undefined);
// Light grounds keep the italic word navy on the sky marker; dark grounds (navy) turn the word itself sky.
export const isDark = (pal) => /^#0a1930$/i.test(pal?.bg || '');
