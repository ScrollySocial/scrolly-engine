// Renders the Remotion half of the side-by-side test: StudioBeat → <reelExportsDir>/compare/remotion.mp4
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia, openBrowser } from '@remotion/renderer';
import { cfg } from '../carousels/lib/common.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(cfg('media').reelExportsDir, 'compare'); mkdirSync(out, { recursive: true });
const browserExecutable = process.env.CHROME || null;
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.join(HERE, 'src/index.jsx'), publicDir: path.join(HERE, 'public') });
const puppeteerInstance = await openBrowser('chrome', { browserExecutable });
const common = { serveUrl, browserExecutable, puppeteerInstance, timeoutInMilliseconds: 240000, inputProps: {} };
const composition = await selectComposition({ ...common, id: 'StudioBeat' });
await renderMedia({ ...common, composition, codec: 'h264', crf: 18, outputLocation: path.join(out, 'remotion.mp4'), concurrency: 2 });
await puppeteerInstance.close({ silent: true });
console.log(`remotion.mp4 in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
