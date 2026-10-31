// Renders hero.html to the $1K Club hero image (1536 x 1024 webp) plus a PNG preview.
// Usage: node render.mjs
import puppeteer from '../../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const b = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1536, height: 1024, deviceScaleFactor: 2 });
await p.goto('file:///' + path.join(here, 'hero.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(here, 'hero@2x.png') });
await b.close();
const out = path.join(here, '..', '..', 'assets', 'k1-hero-v3.webp');
execFileSync('python', ['-c', `from PIL import Image;im=Image.open(r'${path.join(here, 'hero@2x.png')}').convert('RGB');im.resize((1536,1024),Image.LANCZOS).save(r'${out}',quality=86,method=6)`]);
console.log('wrote', out);
