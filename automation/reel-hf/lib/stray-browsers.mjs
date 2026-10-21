// Closes headless Edge/Chrome left behind by automation (2026-10-21: ~148 piled up and slowed the PC). On Windows a
// browser outlives its Node script when the script is killed (a timeout, a stopped chat), and nothing closes it.
// Only touches browsers that use a puppeteer throwaway profile (…\puppeteer_dev_*) AND whose parent process is gone,
// so a person's own Edge and any render still running are never touched.
//   node lib/stray-browsers.mjs         close them now and say how many
//   sweepInBackground()                 same, detached, at most once every 30 minutes (launch() in settings.mjs calls it)
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PS = `$ErrorActionPreference='SilentlyContinue'
$alive = @{}; Get-Process | ForEach-Object { $alive[$_.Id] = 1 }
$n = 0
Get-CimInstance Win32_Process -Filter "Name='msedge.exe' OR Name='chrome.exe' OR Name='chrome-headless-shell.exe'" |
  Where-Object { $_.CommandLine -match 'puppeteer_dev' -and $_.CommandLine -notmatch '--type=' -and -not $alive[[int]$_.ParentProcessId] } |
  ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null; $n++ }
"closed $n stray browser(s)"`;

const STAMP = path.join(os.tmpdir(), 'reel-stray-browsers.stamp');

export function sweepInBackground() {
  if (process.platform !== 'win32') return;
  try { if (existsSync(STAMP) && Date.now() - statSync(STAMP).mtimeMs < 30 * 60e3) return; writeFileSync(STAMP, ''); } catch { return; }
  spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', PS], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.platform !== 'win32') console.log('only needed on Windows');
  else console.log(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', PS], { encoding: 'utf8', windowsHide: true }).trim());
}
