' Starts the Reel review hub (http://localhost:4320) with no window. Windows runs this at login through a
' one-line copy in the Startup folder (shell:startup\Scrolly review hub.vbs), so a restart never leaves the
' review page down. Safe to run any time: hub.mjs --start does nothing if the hub is already running.
' Waits 30 seconds first so the login (and OneDrive) can settle.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
here = fso.GetParentFolderName(WScript.ScriptFullName)
WScript.Sleep 30000
sh.CurrentDirectory = here
sh.Run "node lib\review\hub.mjs --start", 0, False
