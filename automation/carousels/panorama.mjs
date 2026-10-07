// Renders a designed grid panorama (lib/panorama-designs.mjs) and cuts it into one 1080×1440 tile per post, saved to
// the media library (photos/panoramas/<group>-<n>.png) and indexed. Each post's slide 1 then uses
// {"layout": "image", "media": "<tile id>", "grid": "<group>"}. Also writes <exports>/_style-samples/<group>.png
// (a mock of the row with Instagram's thin gaps).
// Usage: node panorama.mjs <group>
import path from 'node:path';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { cfg, fileUrl, launch, readJson, writeJson, HERE, REPO, MEDIA_INDEX } from './lib/common.mjs';
import { mediaResolver } from './lib/media.mjs';
import { DESIGNS } from './lib/panorama-designs.mjs';

const group = process.argv[2] || 'pinned-2026-10';
const conf = readJson(path.join(HERE, 'data/panoramas.json'))[group];
const brand = cfg('brand'), media = cfg('media');
const { mediaFor } = mediaResolver();
const n = conf.posts.length, W = 1080 * n, H = 1440;
const fams = [...new Set(Object.values(brand.fonts).map((f) => f.google))].map((g) => `family=${g.replace(/ /g, '+')}`).join('&');
const body = DESIGNS[group]({
  brand,
  photo: mediaFor(conf.media, conf.focus),
  shirt: fileUrl(path.join(REPO, conf.shirt)),
  screen: mediaFor(conf.screen, conf.screenFocus),
  hooks: conf.hooks,
});
const outDir = path.join(media.photosDir, 'panoramas');
mkdirSync(outDir, { recursive: true });
const html = path.join(outDir, `.${group}.html`);
writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams}&display=block"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:${W}px}</style></head><body><div class="canvas">${body}</div></body></html>`);

const browser = await launch();
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H });
await pg.goto(fileUrl(html), { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);
const tiles = [];
for (let i = 0; i < n; i++) {
  const f = path.join(outDir, `${group}-${i + 1}.png`);
  await pg.screenshot({ path: f, clip: { x: i * 1080, y: 0, width: 1080, height: H } });
  tiles.push(f);
}
// Row mock with Instagram's thin grid gaps
const mock = path.join(cfg('media').exportsDir, '_style-samples', `.${group}-row.html`);
writeFileSync(mock, `<body style="margin:0;background:#fff;width:${n * 300 + (n - 1) * 3}px"><div style="display:grid;grid-template-columns:repeat(${n},300px);gap:3px">${tiles.map((t) => `<img src="${fileUrl(t)}" style="width:300px;height:400px;display:block">`).join('')}</div></body>`);
await pg.setViewport({ width: n * 300 + (n - 1) * 3, height: 400 });
await pg.goto(fileUrl(mock), { waitUntil: 'load' });
await pg.screenshot({ path: path.join(cfg('media').exportsDir, '_style-samples', `${group}.png`) });
await browser.close();

execFileSync(process.execPath, [path.join(HERE, 'scan-media.mjs')], { stdio: 'ignore' });
const idx = readJson(MEDIA_INDEX).items;
tiles.forEach((t, i) => {
  const rel = path.relative(media.photosDir, t).replace(/\\/g, '/');
  const it = idx.find((x) => x.file === rel && !x.missing);
  // Point the post's slide 1 at its new tile (ids change whenever the artwork changes).
  const pf = path.join(HERE, 'posts', conf.posts[i], 'post.json');
  if (it && existsSync(pf)) {
    const post = readJson(pf);
    post.slides[0] = { layout: 'image', media: it.id, grid: group, text: conf.hooks[i].big.replace(/\*/g, '') + '. ' + conf.hooks[i].small };
    writeJson(pf, post);
  }
  console.log(`tile ${i + 1} → ${conf.posts[i]}: media id ${it?.id}${existsSync(pf) ? ' (slide 1 updated)' : ' (post not created yet)'}`);
});
