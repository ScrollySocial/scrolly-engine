// Resolves media IDs (from data/media-index.json) to file URLs for the templates.
import path from 'node:path';
import { existsSync } from 'node:fs';
import { cfg, readJson, MEDIA_INDEX, fileUrl, REPO } from './common.mjs';

export function mediaResolver() {
  const media = cfg('media');
  const items = new Map(readJson(MEDIA_INDEX).items.map((it) => [it.id, it]));
  const used = new Set();
  const mediaFor = (id, focus) => {
    if (!id) return null;
    // Preview-only stand-ins: "stock:<name>" = Playbook stock photo until Mercedes's photo is in the library.
    if (id.startsWith('stock:')) {
      const f = path.join(REPO, 'Scrolly Organic Engine/products/1k-club/playbook/design/assets/stock', id.slice(6) + '.jpg');
      if (!existsSync(f)) throw new Error(`stand-in ${id} not found`);
      used.add(id);
      return { url: fileUrl(f), focus };
    }
    const it = items.get(id);
    if (!it) throw new Error(`Media "${id}" is not in the index. Run: node scan-media.mjs`);
    if (it.type === 'video') throw new Error(`Media "${id}" is a video. Video slides aren't supported yet (needs ffmpeg; planned with the reels editor).`);
    const dir = media[it.root];
    const abs = dir && path.join(dir, it.file);
    if (!abs || !existsSync(abs)) throw new Error(`Media "${id}" (${it.file}) not found${it.root === 'videoDir' ? '; plug in the external drive' : ''}.`);
    used.add(id);
    return { url: fileUrl(abs), focus };
  };
  return { mediaFor, used, items };
}
