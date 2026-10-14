// Visual check helper: fetch cover frames via TikTok's official oEmbed endpoint and lay them out in one local HTML page.
// Usage: node thumb-sheet.mjs <out.html> <videoUrl>... (labels are the index order)
import fs from 'node:fs';

const [out, ...urls] = process.argv.slice(2);
const cells = [];
for (const [i, url] of urls.entries()) {
  try {
    const r = await (await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)).json();
    cells.push(`<figure><img src="${r.thumbnail_url}"><figcaption>${i + 1}. @${r.author_name}</figcaption></figure>`);
  } catch (e) { cells.push(`<figure><figcaption>${i + 1}. oEmbed failed</figcaption></figure>`); }
}
const cols = Number(process.env.COLS || 6);
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:13px Arial;background:#fff}main{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px}figure{margin:0}img{width:100%;aspect-ratio:9/16;object-fit:cover;display:block}figcaption{padding:2px 0}</style><main>${cells.join('')}</main>`);
console.log(`wrote ${cells.length} cells to ${out}`);
