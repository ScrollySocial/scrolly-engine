// Usage: node build.mjs [pageName ...]   -> writes dist/<name>.html (the exact wp:html payload) and dist/<name>.preview.html (local preview only)
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { previewDoc } from './lib.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const want = process.argv.slice(2);
const names = fs.readdirSync(path.join(here, 'pages')).filter((f) => f.endsWith('.mjs')).map((f) => f.replace('.mjs', '')).filter((n) => !want.length || want.includes(n));
fs.mkdirSync(path.join(here, 'dist'), { recursive: true });
for (const n of names) {
  const mod = await import(pathToFileURL(path.join(here, 'pages', n + '.mjs')).href);
  const outs = mod.buildAll ? mod.buildAll() : [{ ...mod, html: mod.build() }];
  for (const o of outs) {
    const key = o.key || n;
    // Guard: CSS must never leak out of <style> blocks as visible text (a stripper bug once did exactly that).
    const visible = o.html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
    if (/!important|[a-z-]+:[^;{}<>]{1,60};[^{}<>]{0,80}\}/.test(visible)) throw new Error(key + ': CSS text leaked outside <style>');
    fs.writeFileSync(path.join(here, 'dist', key + '.html'), o.html);
    fs.writeFileSync(path.join(here, 'dist', key + '.preview.html'), previewDoc(o.html, o.title || key));
    console.log(key, (o.html.length / 1024).toFixed(1) + 'KB');
  }
}
