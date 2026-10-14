// Usage: node covers/render-cover.mjs [lilac|teal] [out.png]   Renders covers/business-brain-cover.html at 1024x1536.
import puppeteer from '../../../automation/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const [,, v = 'lilac', out = `cover-business-brain-${v}.png`] = process.argv;
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 1024, height: 1536 });
await p.goto(pathToFileURL(path.join(here, 'business-brain-cover.html')).href + '?v=' + v, { waitUntil: 'networkidle0' });
await p.waitForSelector('body[data-ready]');
await (await p.$('#c')).screenshot({ path: out });
await b.close();
console.log(out);
