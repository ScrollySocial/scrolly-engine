# Challenge lifecycle scenarios A-F (+ mail failure, retry purchase) through the generated snippet with WP stand-ins.
# Usage: powershell -File automation/k1-launch/test/run-lifecycle.ps1
$root = Split-Path -Parent $PSScriptRoot
$lint = Join-Path $env:TEMP 'k1-lint.php'
$src = [IO.File]::ReadAllText((Join-Path $root 'dist\my-account-1k-tabs.php'))
# Test copy only: route PHP's upload built-ins to test versions (CLI has no real HTTP uploads).
$src = $src.Replace('is_uploaded_file(', 'k1test_is_uploaded_file(').Replace('move_uploaded_file(', 'k1test_move_uploaded_file(')
[IO.File]::WriteAllText($lint, "<?php`n" + $src)
$step = Join-Path $PSScriptRoot 'lifecycle-step.php'
function Run([string]$name, [string[]]$steps) {
  $env:K1_STATE = Join-Path $env:TEMP ("k1-life-" + $name + ".json")
  if (Test-Path $env:K1_STATE) { Remove-Item -LiteralPath $env:K1_STATE }
  Write-Output "`n==================== $name"
  foreach ($s in $steps) { $parts = $s -split ' ', 2; Write-Output ("-- " + $s); php $step $lint $parts[0] @($parts[1] -split ' ' | Where-Object { $_ }) }
  $st = Get-Content $env:K1_STATE -Raw | ConvertFrom-Json
  $ach = $st.scrolly_k1_chal.achievement
  Write-Output ("STATE: verified=" + $ach.verified + " claim=" + [bool]$ach.claim + " rewardChoice=" + $ach.rewardChoice + " merchOrdered=" + $ach.merchOrdered + " reviews=" + (($ach.reviews | ForEach-Object { $_.decision }) -join ','))
  Write-Output ("HISTORY: " + (@($st.scrolly_k1_chal_history) | ForEach-Object { 'order ' + $_.order }) -join ', ' + " | current order " + $st.scrolly_k1_chal.order)
  Write-Output ("MAILS: " + (($st._mails | ForEach-Object { $_.subject + ' [attachments: ' + ($_.attachments -join ',') + ' | from: ' + (($_.sources | ForEach-Object { $_ + ' (exists after send: ' + (Test-Path $_) + ')' }) -join ',') + ']' }) -join ' || '))
}
php -l $lint | Select-Object -First 1
Run 'A-day18-win'        @('setup 18 1050', 'render', 'claim', 'render claimed', 'admin', 'verify', 'render', 'accept', 'render reward', 'merch-ordered', 'render')
Run 'B-day30-win'        @('setup 30 1000', 'render', 'claim', 'verify', 'render')
Run 'C-ended-725'        @('setup 32 725', 'render')
$env:K1_280 = 'publish'
Run 'C2-ended-725-retry-published' @('setup 32 725', 'render')
Remove-Item Env:\K1_280
Run 'D-refund-below-1k'  @('setup 20 1050', 'claim', 'refund 100', 'admin', 'reject Refund brought qualifying revenue below $1,000', 'render')
Run 'E-winner-declines'  @('setup 25 1200', 'claim', 'verify', 'decline', 'render reward')
Run 'F-winner-accepts'   @('setup 22 1100', 'claim', 'verify', 'accept', 'render reward')
Run 'G-claim-no-valid-file' @('setup 19 1000', 'claim-nofile', 'render claimfiles')
$env:K1_MAIL_FAIL = '1'
Run 'H-mail-fails'       @('setup 19 1000', 'claim', 'render claimmail')
Remove-Item Env:\K1_MAIL_FAIL
Run 'I-new-paid-attempt' @('setup 32 725', 'render', 'render@2002', 'start@2002', 'render@2002')
