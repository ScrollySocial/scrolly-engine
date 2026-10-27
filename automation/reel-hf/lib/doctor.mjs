// Setup check AND fixer for the Reel engine (idea borrowed, with credit, from getgitgirl's claude-reel-editor doctor
// script, MIT). Run it first in any session that makes a Reel. Everything it needs to know comes from
// reel-settings.json (lib/settings.mjs).
// Usage: node lib/doctor.mjs             check, and fix what's safe inside the project: npm/pip packages, the Python
//                                        venv, ffmpeg + ffprobe, GSAP, missing folders, the browser path in settings
//        node lib/doctor.mjs --check     check only, change nothing
//        node lib/doctor.mjs --install   also install missing system software (Node, Python, Edge/Chrome) with
//                                        winget / brew, and set a OneDrive footage folder to "always keep on this device"
//        --json                          one JSON line per result at the end (for the setup skill)
// Each line: OK · FIXED (it changed something) · NEEDS YOU (it can't fix this; the line says what to do) ·
// NOTE (worth doing, doesn't block Reels).
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILE, P, S, exe, findBrowser, hf, pythonCmd, saveSettings, tool } from './settings.mjs';
import { SOUNDS, SFX_DIR } from './sounds.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const FIX = !args.includes('--check'), INSTALL = args.includes('--install'), JSON_OUT = args.includes('--json');
const WIN = process.platform === 'win32', MAC = process.platform === 'darwin';
const PUPPETEER = '25.13.0'; // older versions fail with "page.createCDPSession is not a function"
const results = [];
const say = (state, msg, how = '') => { results.push({ state, msg, how }); console.log(`${state.padEnd(9)} ${msg}${how ? `\n          → ${how}` : ''}`); };

// one check: test() → truthy when fine; fix() runs only when fixing is on and returns a note; `needs` is the hand fix
async function step(msg, test, { fix, needs, system, soft } = {}) {
  let ok = false;
  try { ok = await test(); } catch {}
  if (ok) return say('OK', typeof ok === 'string' ? `${msg} (${ok})` : msg);
  const allowed = fix && (system ? INSTALL : FIX);
  if (allowed) {
    try {
      const note = await fix();
      let again = false;
      try { again = await test(); } catch {}
      if (again) return say('FIXED', `${msg}${note ? ` (${note})` : ''}`);
    } catch (e) { return say(soft ? 'NOTE' : 'NEEDS YOU', msg, `${needs || 'see above'} (tried to fix: ${String(e.message).split('\n')[0]})`); }
  }
  say(soft ? 'NOTE' : 'NEEDS YOU', msg, fix && !allowed ? `${needs}${system ? ' · or run: node lib/doctor.mjs --install' : FIX ? '' : ' · or run: node lib/doctor.mjs'}` : needs);
}

const run = (cmd, a, opts = {}) => {
  const p = spawnSync(cmd, a, { encoding: 'utf8', shell: WIN && /^(npm|npx|claude)$/.test(cmd), stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  if (p.status !== 0) {
    // the real reason, not pip's closing "[notice] new release" lines
    const lines = (p.stderr || p.stdout || p.error?.message || `${cmd} failed`).trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !/^\[notice\]/i.test(l));
    const why = lines.filter((l) => /^(ERROR|error|HINT)\b/.test(l));
    throw new Error((why.length ? why.join(' ') : lines.at(-1) || `${cmd} failed`).slice(0, 400));
  }
  return p.stdout;
};
const onPath = (name) => { try { return run(WIN ? 'where' : 'which', [name]).split(/\r?\n/)[0].trim(); } catch { return ''; } };
const version = (file) => execFileSync(file, ['-version'], { encoding: 'utf8' }).split('\n')[0].split(' ').slice(0, 3).join(' ');
const pkgInstall = (winId, brew) => {
  if (WIN && onPath('winget')) return run('winget', ['install', '--id', winId, '-e', '--accept-package-agreements', '--accept-source-agreements']);
  if (MAC && onPath('brew')) return run('brew', ['install', ...brew.split(' ')]);
  throw new Error(`no package manager here: install it by hand`);
};
const rel = (p) => path.relative(process.cwd(), p) || '.';

// ---- settings ----
await step(`settings file ${rel(FILE)}`, () => existsSync(FILE), { needs: 'run the "set up my Reel engine" skill (it asks a few questions and writes this file)' });

// ---- folder path: Windows stops at 260 characters and the speech model's helpers nest deep, so pip fails ----
const ROOT = path.resolve(HERE, '..');
await step(`folder path short enough (${ROOT.length} characters)`, () => !WIN || ROOT.length <= 120, {
  soft: true, needs: 'move this folder somewhere with a shorter path, e.g. Documents\\reel-engine, then run doctor again',
});

// ---- Node ----
await step(`Node ${process.versions.node}`, () => +process.versions.node.split('.')[0] >= 20, {
  system: true, fix: () => pkgInstall('OpenJS.NodeJS.LTS', 'node') && 'restart the terminal to use the new Node',
  needs: 'install Node 20 or newer from nodejs.org',
});

// ---- Claude Code (plans, edits and builds each Reel; needs a paid Claude plan, Pro or higher) ----
// The Claude desktop app (Code tab) needs no `claude` on PATH: count it as installed, and its sign-in as signed in.
const desktopApp = [process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'AnthropicClaude'), process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Claude'),
  '/Applications/Claude.app'].filter(Boolean).find((d) => existsSync(d));
const claudeAccount = () => { try { return !!JSON.parse(readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8')).oauthAccount; } catch { return false; } };
await step('Claude Code installed', () => (onPath('claude') && run('claude', ['--version']).trim()) || (desktopApp && 'Claude desktop app'), {
  soft: true, needs: 'install the Claude desktop app (claude.ai/download) or Claude Code (claude.com/claude-code) and sign in with a paid Claude plan (Pro or higher)',
});
await step('Claude Code signed in', () => claudeAccount() || (onPath('claude') && JSON.parse(run('claude', ['auth', 'status'])).loggedIn), {
  soft: true, needs: 'open Claude (desktop app or a terminal: claude) and sign in with a paid Claude plan (Pro or higher)',
});

// ---- browser for stills, covers, storyboards (Edge or Chrome) ----
await step('headless browser (Edge or Chrome)', () => (S.tools.browser && existsSync(S.tools.browser) ? S.tools.browser : ''), {
  fix: async () => {
    let found = findBrowser();
    if (!found && INSTALL) { pkgInstall('Microsoft.Edge', '--cask microsoft-edge'); found = findBrowser(); }
    if (!found) throw new Error('none installed');
    saveSettings({ tools: { browser: found } });
    return `set tools.browser to ${found}`;
  },
  needs: 'install Microsoft Edge or Google Chrome, or set tools.browser in reel-settings.json',
});

// ---- HyperFrames helper folder: puppeteer (+ ffmpeg/ffprobe/gsap sources) ----
const hfReq = () => createRequire(path.join(P.hyperframesDir, 'package.json'));
// always the whole set in one npm install: npm removes anything package.json doesn't list, so installing one helper
// on its own (after an interrupted first install) would delete the others
const hfInstall = () => {
  mkdirSync(P.hyperframesDir, { recursive: true });
  if (!existsSync(path.join(P.hyperframesDir, 'package.json'))) writeFileSync(path.join(P.hyperframesDir, 'package.json'), JSON.stringify({ name: 'reel-engine-tools', private: true }, null, 1));
  run('npm', ['install', `puppeteer@${PUPPETEER}`, '@ffprobe-installer/ffprobe', 'ffmpeg-static', 'gsap', hf], { cwd: P.hyperframesDir });
};
await step(`puppeteer ${PUPPETEER} in ${rel(P.hyperframesDir)}`, () => hfReq()('puppeteer/package.json').version === PUPPETEER, {
  fix: () => {
    hfInstall();
    return 'npm install (puppeteer, ffmpeg, ffprobe, gsap, hyperframes)';
  },
  needs: `cd ${rel(P.hyperframesDir)} && npm i puppeteer@${PUPPETEER}`,
});

// ---- ffmpeg + ffprobe in tools.bin (HyperFrames needs both on PATH) ----
for (const name of ['ffmpeg', 'ffprobe']) {
  const target = path.join(P.bin, exe(name));
  await step(`${name} in ${rel(P.bin)}`, () => existsSync(target) && version(target), {
    fix: () => {
      mkdirSync(P.bin, { recursive: true });
      let src = onPath(name);
      if (!src) {
        const req = hfReq();
        if (name === 'ffprobe') {
          try { src = req('@ffprobe-installer/ffprobe').path; } catch {}
          if (!src) { hfInstall(); src = hfReq()('@ffprobe-installer/ffprobe').path; }
        }
        else {
          try { src = req('ffmpeg-static'); } catch {}
          if (!src) { hfInstall(); src = hfReq()('ffmpeg-static'); }
        }
      }
      if (!src || !existsSync(src)) throw new Error(`no ${name} found to copy`);
      copyFileSync(src, target);
      return `copied from ${src}`;
    },
    needs: `put ${exe('ffmpeg')} and ${exe('ffprobe')} in ${rel(P.bin)} (ffmpeg.org) or install ffmpeg on PATH`,
  });
}

// ---- transcription: Python venv with faster-whisper (+ imageio-ffmpeg, the cut script's ffmpeg) ----
const venvDir = S.tools.python ? path.resolve(path.dirname(P.python), '..') : '';
const pyImports = (mod) => { execFileSync(P.python, ['-c', `import ${mod}`], { stdio: 'ignore' }); return true; };
await step('Python', () => (existsSync(P.python) ? 'venv' : pythonCmd()), {
  system: true, fix: () => pkgInstall('Python.Python.3.12', 'python@3.12') && 'restart the terminal',
  needs: 'install Python 3.10+ from python.org (tick "Add to PATH")',
});
await step(`transcription venv ${rel(venvDir || '(tools.python not set)')}`, () => existsSync(P.python), {
  fix: () => {
    const sys = pythonCmd();
    if (!sys || !venvDir) throw new Error('no Python to make it with');
    run(sys, ['-m', 'venv', venvDir]);
    return 'python -m venv';
  },
  needs: 'set tools.python in reel-settings.json to a Python venv',
});
for (const [mod, pkg, why] of [['faster_whisper', 'faster-whisper', 'transcription'], ['imageio_ffmpeg', 'imageio-ffmpeg', 'the cut script uses its ffmpeg']]) {
  await step(`${pkg} (${why})`, () => pyImports(mod), {
    fix: () => { run(P.python, ['-m', 'pip', 'install', '--quiet', pkg]); return 'pip install'; },
    needs: `${rel(P.python)} -m pip install ${pkg}`,
  });
}

// ---- engine files that ship with the package (can't be downloaded) ----
for (const [label, file] of [['transcribe script', P.transcribeScript], ['silence-aware cut script', P.cutScript]]) {
  await step(`${label} ${rel(file)}`, () => existsSync(file), { needs: 'part of the Reel engine package: restore it from git, or fix the path in reel-settings.json tools' });
}
const sfxDir = SFX_DIR;
// sounds are downloaded by the person (their own Mixkit license), so missing ones don't block: they stay silent.
// A download dropped in lib/assets/sfx (Mixkit names it e.g. mixkit-air-woosh-1489.wav; the id in lib/sounds.mjs, or an
// older sfx/sources.json, maps the number to the engine's name), or one already renamed to <name>.wav, is saved as <name>.mp3.
const sounds = SOUNDS.map((s) => s.name), sfxPath = (s) => path.join(sfxDir, `${s}.mp3`);
const missingSfx = () => sounds.filter((s) => !existsSync(sfxPath(s)));
const sfxSources = existsSync(path.join(sfxDir, 'sources.json')) ? JSON.parse(readFileSync(path.join(sfxDir, 'sources.json'), 'utf8')) : {};
// downloads are converted first (fix mode), so the count below is what's really there. Looks in lib/assets/sfx and in
// the person's Downloads folder (only files Mixkit named, mixkit-…-<id>.wav), so nobody has to rename or move them.
const sfxConverted = [];
if (FIX) {
  const audio = (dir, only = /./) => existsSync(dir) ? readdirSync(dir).filter((f) => /\.(wav|mp3|m4a|ogg)$/i.test(f) && only.test(f)).map((f) => path.join(dir, f)) : [];
  const files = [...audio(sfxDir), ...audio(path.join(os.homedir(), 'Downloads'), /^mixkit-/i)];
  for (const s of missingSfx()) {
    const num = sfxSources[s]?.mixkit ?? SOUNDS.find((x) => x.name === s)?.id;
    const base = (f) => path.basename(f).replace(/\.[^.]+$/, '');
    const src = files.find((f) => path.dirname(f) === sfxDir && base(f) === s) || (num && files.find((f) => new RegExp(`(^|\\D)${num}(\\D|$)`).test(base(f))));
    if (!src) continue;
    try { mkdirSync(sfxDir, { recursive: true }); execFileSync(tool('ffmpeg'), ['-v', 'error', '-y', '-i', src, '-codec:a', 'libmp3lame', '-q:a', '2', sfxPath(s)]); sfxConverted.push(`${path.basename(src)} → ${s}.mp3`); }
    catch (e) { say('NOTE', `couldn't convert ${path.basename(src)}`, String(e.message).split('\n')[0]); }
  }
  if (sfxConverted.length) say('FIXED', `sound downloads saved under the engine's names (${sfxConverted.join(', ')})`);
}
// what's still missing, starter sounds first; the download links live in sounds.md (no Mixkit address in engine code)
const missingNote = () => {
  const miss = SOUNDS.filter((s) => missingSfx().includes(s.name)), md = existsSync(path.join(HERE, '../sounds.md')) ? 'sounds.md' : 'the package\'s sounds.md';
  const first = miss.filter((s) => s.starter), rest = miss.filter((s) => !s.starter);
  return `open each one's download link in ${md}, press Download Free SFX (leave the file in Downloads), then run doctor again. Until then those sounds stay silent.${first.length ? `\n          Start with: ${first.map((s) => s.name).join(', ')}` : ''}${rest.length ? `\n          Then (${rest.length} more): ${rest.map((s) => s.name).join(', ')}` : ''}`;
};
await step(`sound effects in lib/assets/sfx (${sounds.length - missingSfx().length} of ${sounds.length})`, () => !missingSfx().length, {
  soft: true,
  needs: missingNote(),
});
const { BRANDS, defaultBrand } = await import('./brand/index.mjs');
await step(`brand kit "${S.brand || '(not set)'}"`, () => BRANDS[S.brand], {
  fix: () => { const id = Object.keys(BRANDS)[0]; saveSettings({ brand: id }); return `set brand to ${id}`; },
  needs: `set brand in reel-settings.json to one of: ${Object.keys(BRANDS).join(', ')}`,
});
const fonts = defaultBrand().fontFiles || [];
await step(`brand fonts (${fonts.join(', ')})`, () => fonts.every((f) => existsSync(path.join(HERE, 'assets/fonts', f))), { needs: 'put the brand kit\'s font files in lib/assets/fonts' });
const gsapDir = path.join(HERE, 'assets/js');
await step('GSAP in lib/assets/js', () => existsSync(gsapDir) && readdirSync(gsapDir).includes('gsap.min.js'), {
  fix: () => { mkdirSync(gsapDir, { recursive: true }); copyFileSync(hfReq().resolve('gsap/dist/gsap.min.js'), path.join(gsapDir, 'gsap.min.js')); return 'copied from node_modules/gsap'; },
  needs: 'copy gsap.min.js (gsap/dist) into lib/assets/js',
});

// ---- folders ----
const inOneDrive = (p) => /onedrive/i.test(p);
await step(`footage folder ${P.footage || '(folders.footage not set)'}`, () => P.footage && existsSync(P.footage), {
  fix: () => { if (!P.footage) throw new Error('not set'); mkdirSync(P.footage, { recursive: true }); return 'created it: put raw takes here, one subfolder per series'; },
  needs: 'set folders.footage in reel-settings.json',
});
if (WIN && P.footage && existsSync(P.footage) && inOneDrive(P.footage)) {
  // OneDrive online-only files can't be read by ffmpeg mid-run: pin the folder to this device (attrib's P flag)
  const pinned = () => /P/.test(execFileSync('attrib', [P.footage], { encoding: 'utf8' }).split(/[A-Za-z]:\\/)[0]);
  await step('footage folder kept on this device (OneDrive)', pinned, {
    system: true, soft: true, fix: () => { run('attrib', ['+P', '-U', P.footage, '/S', '/D']); return 'pinned: OneDrive downloads every take'; },
    needs: 'right-click the footage folder in File Explorer → Always keep on this device',
  });
}
for (const [label, dir] of [['exports folder', P.exports], ['transcripts folder', P.transcripts]]) {
  await step(`${label} ${dir || '(not set)'}`, () => dir && existsSync(dir), {
    fix: () => { if (!dir) throw new Error('not set'); mkdirSync(dir, { recursive: true }); if (dir === P.exports) for (const s of ['final', 'previews']) mkdirSync(path.join(dir, s), { recursive: true }); return 'created'; },
    needs: `set it in reel-settings.json`,
  });
}

// ---- posting + tracker (checked here, set up in the skill: credentials and accounts stay with the person) ----
if (S.posting.videoHost === 'wordpress') {
  await step(`WordPress client ${rel(P.wordpressClient)}`, () => existsSync(P.wordpressClient), { needs: 'set posting.wordpressClient, or posting.videoHost to "none"' });
}
if (S.tracker.app === 'planner') {
  // Mercedes's own Content Planner (automation/planner), read and changed through its command-line tool
  const cli = path.resolve(ROOT, S.tracker.cli || '../planner/tracker.mjs');
  await step(`planner tracker ${rel(cli)}`, () => existsSync(cli), { needs: 'set tracker.cli to the planner\'s tracker.mjs, or tracker.app to "none"' });
} else if (S.tracker.app && S.tracker.app !== 'none') {
  await step(`${S.tracker.app} tracker id set`, () => !!S.tracker.database, { needs: 'set tracker.database (the setup skill finds it), or tracker.app to "none"' });
}
if (S.rules.doc) await step(`rules doc ${rel(P.rulesDoc)}`, () => existsSync(P.rulesDoc), { needs: 'fix rules.doc in reel-settings.json, or remove it to keep rules in rules.list only' });

const left = results.filter((r) => r.state === 'NEEDS YOU').length, fixed = results.filter((r) => r.state === 'FIXED').length;
console.log(left ? `\n${left} thing(s) still need you${fixed ? `, ${fixed} fixed` : ''}.` : `\nAll set${fixed ? ` (${fixed} fixed)` : ''}.`);
if (JSON_OUT) console.log(JSON.stringify(results));
process.exit(left ? 1 : 0);
