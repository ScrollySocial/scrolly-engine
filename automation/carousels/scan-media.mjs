// Indexes the shared photo library (config/media.json → photosDir) into data/media-index.json.
// IDs come from file content (sha1), so renaming or moving a photo keeps its ID and its usage history.
// Tags/notes written by Claude are preserved across scans. Also writes data/contact-sheet.png
// (numbered thumbnails) so new photos can be looked at and tagged in one pass.
// Usage: node scan-media.mjs
import { readdirSync, statSync, readFileSync, existsSync, writeFileSync, openSync, readSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { HERE, cfg, readJson, writeJson, MEDIA_INDEX, fileUrl, esc, launch, IMAGE_EXT, VIDEO_EXT, UNSUPPORTED_EXT } from './lib/common.mjs';

const media = cfg('media');
const roots = [['photo', media.photosDir], ['video', media.videoDir]].filter(([, d]) => d);
const index = existsSync(MEDIA_INDEX) ? readJson(MEDIA_INDEX) : { items: [] };
const byId = new Map(index.items.map((it) => [it.id, it]));

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}

const seen = new Set(), unsupported = [], fresh = [];
for (const [kind, dir] of roots) {
  if (!existsSync(dir)) { console.log(`${kind} folder not available (${dir})${kind === 'video' ? ', is the external drive plugged in?' : ''}`); continue; }
  for (const f of walk(dir)) {
    const ext = path.extname(f).toLowerCase();
    if (UNSUPPORTED_EXT.includes(ext)) { unsupported.push(f); continue; }
    const isImg = IMAGE_EXT.includes(ext), isVid = VIDEO_EXT.includes(ext);
    if (!isImg && !isVid) continue;
    // Large videos: hash first 8 MB + size so scanning stays fast.
    const size = statSync(f).size;
    let buf;
    if (isVid) { const fd = openSync(f, 'r'); buf = Buffer.alloc(Math.min(size, 8 << 20)); readSync(fd, buf, 0, buf.length, 0); closeSync(fd); } else buf = readFileSync(f);
    const id = createHash('sha1').update(buf).update(String(size)).digest('hex').slice(0, 10);
    seen.add(id);
    const rel = path.relative(dir, f).replace(/\\/g, '/');
    const prev = byId.get(id);
    const item = { id, type: isImg ? 'photo' : 'video', root: kind === 'photo' ? 'photosDir' : 'videoDir', file: rel, folder: rel.split('/')[0],
      width: prev?.width ?? null, height: prev?.height ?? null, addedAt: prev?.addedAt || new Date().toISOString().slice(0, 10),
      tags: prev?.tags || [], notes: prev?.notes || '', textSpace: prev?.textSpace || [], missing: false };
    if (!prev) fresh.push(item);
    byId.set(id, item);
  }
}
// Only mark missing when its folder was actually reachable (an unplugged drive isn't "missing").
for (const it of byId.values()) {
  const dir = it.root === 'photosDir' ? media.photosDir : media.videoDir;
  if (!seen.has(it.id) && dir && existsSync(dir)) it.missing = true;
}

// Read real (EXIF-rotated) dimensions in the browser, and draw a contact sheet of photos still needing tags.
const photos = [...byId.values()].filter((it) => it.type === 'photo' && !it.missing);
const abs = (it) => path.join(it.root === 'photosDir' ? media.photosDir : media.videoDir, it.file);
const untagged = photos.filter((it) => !it.tags.length);
if (photos.length) {
  const browser = await launch();
  const pg = await browser.newPage();
  await pg.setViewport({ width: 1600, height: 900 });
  const cells = untagged.length ? untagged : [];
  const sheetHtml = path.join(HERE, 'data/.contact-sheet.html');
  writeFileSync(sheetHtml, `<html><body style="margin:0;font:600 18px sans-serif;background:#fff;display:flex;flex-wrap:wrap;gap:10px;padding:10px;width:1580px">
    ${photos.map((it) => `<figure data-id="${it.id}" style="margin:0;width:300px;${cells.includes(it) ? '' : 'display:none'}"><img src="${fileUrl(abs(it))}" style="width:300px;height:400px;object-fit:cover;display:block;background:#eee"><figcaption>${esc(it.id)} · ${esc(it.file.slice(-28))}</figcaption></figure>`).join('')}
  </body></html>`);
  await pg.goto(fileUrl(sheetHtml), { waitUntil: 'load' });
  await pg.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
  const dims = await pg.evaluate(() => [...document.querySelectorAll('figure')].map((f) => ({ id: f.dataset.id, w: f.querySelector('img').naturalWidth, h: f.querySelector('img').naturalHeight })));
  for (const d of dims) { const it = byId.get(d.id); it.width = d.w || null; it.height = d.h || null; }
  if (cells.length) {
    const sheet = path.join(HERE, 'data/contact-sheet.png');
    await pg.screenshot({ path: sheet, fullPage: true });
    console.log(`contact sheet of ${cells.length} untagged photo(s): ${sheet}`);
  }
  await browser.close();
}

index.items = [...byId.values()].sort((a, b) => a.file.localeCompare(b.file));
writeJson(MEDIA_INDEX, index);
console.log(`indexed ${index.items.filter((i) => !i.missing).length} item(s), ${fresh.length} new, ${untagged.length} untagged, ${index.items.filter((i) => i.missing).length} missing`);
for (const it of index.items) if (it.width && Math.min(it.width, it.height) < 1080) console.log(`  low-res (${it.width}×${it.height}): ${it.id} ${it.file}`);
if (unsupported.length) console.log(`\n${unsupported.length} HEIC file(s) skipped (iPhone format the renderer can't read). Export as JPG or set iPhone Settings > Camera > Formats > Most Compatible:\n  ` + unsupported.map((f) => path.basename(f)).join('\n  '));
