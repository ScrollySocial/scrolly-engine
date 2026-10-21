# Scrolly Reel template installer (Windows).
# Puts the template into CapCut and, if the buyer added clips to "1 Put your clips here", drops them into the shots
# in name order. Run through "2 Double-click to install.cmd". It only adds a new project folder; it never changes or
# deletes the buyer's other CapCut projects.
param([switch]$NoPause)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$token = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
$drafts = Join-Path $env:LOCALAPPDATA 'CapCut\User Data\Projects\com.lveditor.draft'

function Say($text) { Write-Host ''; Write-Host $text }
function Done-Pause { if (-not $NoPause) { Write-Host ''; Read-Host 'Press Enter to close' | Out-Null } }
function Stop-Here($text) { Say $text; Done-Pause; exit 1 }

$template = Get-ChildItem -Path $here -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'draft_content.json') } | Select-Object -First 1
if (-not $template) { Stop-Here 'The template folder is missing. Unzip the whole download again and run this from inside it.' }
if (-not (Test-Path $drafts)) { Stop-Here 'CapCut for computer is not set up yet. Install CapCut, open it once, close it, then run this again.' }
$capcutOpen = [bool](Get-Process -Name 'CapCut' -ErrorAction SilentlyContinue)

# a new name each time, so running it again never overwrites an earlier version
$base = $template.Name; $name = $base; $n = 2
while (Test-Path (Join-Path $drafts $name)) { $name = "$base ($n)"; $n++ }
$dest = Join-Path $drafts $name
# robocopy handles long folder paths (a deep Downloads folder can pass Windows' 260-character limit)
robocopy $template.FullName $dest /E /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Stop-Here 'Copying the template into CapCut failed. Move this folder to your Desktop and try again.' }

# the buyer's clips, in name order, one per shot
$slots = @(Get-ChildItem -Path (Join-Path $dest 'Resources\slots') -Filter 'slot-*.mp4' | Sort-Object { [int]($_.BaseName -replace '\D', '') })
$clipDir = Join-Path $here '1 Put your clips here'
$exts = '.mp4', '.mov', '.m4v'
$clips = @()
if (Test-Path $clipDir) {
    $clips = @(Get-ChildItem -Path $clipDir -File | Where-Object { $exts -contains $_.Extension.ToLower() } |
        Sort-Object { [regex]::Replace($_.Name, '\d+', { $args[0].Value.PadLeft(8, '0') }) })
}
$files = @(Join-Path $dest 'draft_content.json'; Join-Path $dest 'draft_meta_info.json') +
         @(Get-ChildItem -Path (Join-Path $dest 'Timelines') -Recurse -Filter 'draft_content.json' | ForEach-Object FullName)
$used = [Math]::Min($clips.Count, $slots.Count)
if ($used -gt 0) {
    $clipsDest = Join-Path $dest 'Resources\clips'
    New-Item -ItemType Directory -Path $clipsDest | Out-Null
    $swaps = @()
    for ($i = 0; $i -lt $used; $i++) {
        $newName = 'shot-{0}{1}' -f ($i + 1), $clips[$i].Extension.ToLower()
        Copy-Item -Path $clips[$i].FullName -Destination (Join-Path $clipsDest $newName)
        $swaps += , @("Resources/slots/$($slots[$i].Name)", "Resources/clips/$newName")
        $swaps += , @("SHOT $($i + 1) - replace me.mp4", $clips[$i].Name)
    }
    foreach ($f in $files) {
        $text = [IO.File]::ReadAllText($f)
        foreach ($s in $swaps) { $text = $text.Replace($s[0], $s[1]) }
        [IO.File]::WriteAllText($f, $text, (New-Object Text.UTF8Encoding $false))
    }
}
# fonts shipped inside the template: point their text at this copy's own folder
$fontDir = Join-Path $dest 'Resources\fonts'
if (Test-Path $fontDir) {
    foreach ($f in $files) {
        $text = [IO.File]::ReadAllText($f)
        $text = $text.Replace("$token/Resources/fonts/", (($dest -replace '\\', '/') + '/Resources/fonts/'))
        [IO.File]::WriteAllText($f, $text, (New-Object Text.UTF8Encoding $false))
    }
}
# the project name and folder CapCut shows
$meta = Join-Path $dest 'draft_meta_info.json'
$text = [IO.File]::ReadAllText($meta)
$text = [regex]::Replace($text, '"draft_name"\s*:\s*"[^"]*"', ('"draft_name":"' + $name + '"'))
$text = [regex]::Replace($text, '"draft_fold_path"\s*:\s*"[^"]*"', ('"draft_fold_path":"' + ($dest -replace '\\', '/') + '"'))
$text = [regex]::Replace($text, '"draft_root_path"\s*:\s*"[^"]*"', ('"draft_root_path":"' + ($drafts -replace '\\', '\\') + '"'))
$text = [regex]::Replace($text, '"draft_id"\s*:\s*"[^"]*"', ('"draft_id":"' + ([guid]::NewGuid().ToString().ToUpper()) + '"'))
[IO.File]::WriteAllText($meta, $text, (New-Object Text.UTF8Encoding $false))

if ($capcutOpen) { Say "Done. CapCut is open, so close it completely and open it again. Then click ""$name"" on the home screen." }
else { Say "Done. Open CapCut and click ""$name"" on the home screen." }
if ($used -gt 0) { Write-Host "Your first $used clip(s) are already in the shots, in name order." }
if ($used -lt $slots.Count) { Write-Host "Shots still waiting for a clip: $($slots.Count - $used). Right-click each colored SHOT card in CapCut and choose Replace." }
if ($clips.Count -gt $slots.Count) { Write-Host "This template has $($slots.Count) shots, so only your first $($slots.Count) clips were used." }
Write-Host 'Then double-click each text box, type over the [brackets], and click Export.'
Done-Pause
