// Usage: node og/sheet-shot.mjs  -> og/out/sheet.png (full-page screenshot of the review sheet)
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { launch } from '../../../automation/carousels/lib/common.mjs';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
const b = await launch();
const p = await b.newPage();
await p.setViewport({ width: 1180, height: 900 });
await p.goto(pathToFileURL(path.join(out, 'sheet.html')).href, { waitUntil: 'load' });
await p.screenshot({ path: path.join(out, 'sheet.png'), fullPage: true });
await b.close();
console.log('ok');
