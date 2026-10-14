@echo off
rem Crash-resilient launcher for bridge-server.mjs.
rem
rem bridge-server.mjs itself has no restart logic -- if it crashes (or gets
rem killed, e.g. by a Windows Update reboot) nothing brings it back, which is
rem exactly what happened between the Phase 2 session and this one (see
rem current-state.md's Phase 2.5 debugging note). This loop restarts it on
rem any exit, with a short delay, and appends everything to bridge-forever.log
rem instead of a fresh log per run so restart history is visible.
rem
rem This script only makes the process resilient WHILE something has already
rem started it once (a logged-in Windows session, or Task Scheduler). It does
rem NOT make Windows launch it at boot/logon by itself -- that step still
rem needs a one-time Task Scheduler registration, deliberately left for the
rem user to run (see automation/README.md's "Keeping it running" section).
setlocal
cd /d "%~dp0"

:loop
echo [%date% %time%] Starting bridge-server.mjs >> bridge-forever.log
node bridge-server.mjs >> bridge-forever.log 2>&1
echo [%date% %time%] bridge-server.mjs exited with code %errorlevel% -- restarting in 5s >> bridge-forever.log
timeout /t 5 /nobreak >nul
goto loop
