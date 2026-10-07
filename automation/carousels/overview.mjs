// Writes <exports>/<id>/overview.png: every slide of a built post side by side, for quick review.
// Usage: node overview.mjs <post-id> [...more ids]
import path from 'node:path';
import { writeFileSync, readdirSync } from 'node:fs';
import { cfg, fileUrl, launch } from './lib/common.mjs';

const ids = process.argv.slice(2);
const browser = await launch();
const pg = await browser.newPage();
for (const id of ids) {
  const dir = path.join(cfg('media').exportsDir, id);
  const pngs = readdirSync(dir).filter((f) => /^slide-\d+\.png$/.test(f)).sort();
  const f = path.join(dir, '.overview.html');
  writeFileSync(f, `<body style="margin:0;background:#ddd;display:flex;gap:12px;padding:12px;width:max-content">${pngs.map((p) => `<img src="${p}" style="width:270px;height:360px">`).join('')}</body>`);
  await pg.setViewport({ width: 12 + pngs.length * 282, height: 384 });
  await pg.goto(fileUrl(f), { waitUntil: 'load' });
  await pg.screenshot({ path: path.join(dir, 'overview.png') });
  console.log(path.join(dir, 'overview.png'));
}
await browser.close();
