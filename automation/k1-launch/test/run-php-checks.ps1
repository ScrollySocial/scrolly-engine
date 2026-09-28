# Lint the generated snippet and run Start Here -> save -> Plan through PHP with WP stubs.
# Usage: powershell -File automation/k1-launch/test/run-php-checks.ps1
$root = Split-Path -Parent $PSScriptRoot
$snip = Join-Path $root 'dist\my-account-1k-tabs.php'
$lint = Join-Path $env:TEMP 'k1-lint.php'
$state = Join-Path $env:TEMP 'k1-stub-state.json'
$stub = Join-Path $PSScriptRoot 'wp-stub-run.php'
[IO.File]::WriteAllText($lint, "<?php`n" + [IO.File]::ReadAllText($snip))
if (Test-Path $state) { Remove-Item -LiteralPath $state }

Write-Output '--- lint'
php -l $lint

Write-Output '--- 1. Start Here (no profile yet)'
$o = (php $stub $lint start $state) -join "`n"
Write-Output ('shows Start Here: ' + ($o -match 'Start here'))
Write-Output ('form fields: ' + ([regex]::Matches($o, 'name="(offer|price|route|stage|audience|where|channel|business|found\[\]|revenue|closePct|reviews|emailList)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique) -join ', ')

Write-Output '--- 2. save with price 0 (must be rejected)'
php $stub $lint save-bad $state
$o = (php $stub $lint start $state need) -join "`n"
Write-Output ('warning shown: ' + ($o -match 'a price above'))
Write-Output ('draft kept (offer prefilled): ' + ($o -match 'value="Something"'))

Write-Output '--- 3. valid save'
php $stub $lint save $state
Write-Output ('stored: ' + (Get-Content $state -Raw))

Write-Output '--- 4. Plan tab'
$o = (php $stub $lint plan $state profile) -join "`n"
Write-Output ('plan container: ' + ($o -match 'id="k1-plan" data-saved='))
Write-Output ('bundle inlined: ' + ($o -match 'ScrollyK1'))
Write-Output ('edit form: ' + ($o -match 'Edit my business details'))
Write-Output ('Challenge card (not started yet): ' + ($o -match 'Start my 30 days'))
Write-Output ('success message: ' + ($o -match 'Your plan is ready'))
Write-Output ('PHP warnings/errors: ' + [regex]::Matches($o, '(Warning|Notice|Fatal error|Deprecated):').Count)
Write-Output ('check-in form: ' + ($o -match 'Weekly check-in' -and $o -match 'id="k1-checkin-metrics"'))

Write-Output '--- 5. weekly check-in save'
php $stub $lint review $state
$st = Get-Content $state -Raw | ConvertFrom-Json
$rev = $st.scrolly_k1_reviews[-1]
Write-Output ('review stored: actions=' + ($rev.actions -join ',') + ' rev=' + $rev.rev + ' sales=' + $rev.sales + ' metrics=' + (($rev.metrics | ForEach-Object { $_.label + ':' + $_.value }) -join '; ') + ' snapshot.route=' + $rev.snapshot.route)
Write-Output ('log after check-in (expect $350 earlier + $350 top-up): ' + (($st.scrolly_k1_log | ForEach-Object { '$' + $_.rev + ' (' + $_.note + ')' }) -join ', '))
$o = (php $stub $lint plan $state review) -join "`n"
Write-Output ('result container has reviews: ' + ($o -match 'id="k1-review" data-saved=.*data-reviews="\[\{'))
Write-Output ('next check-in date shown: ' + ($o -match 'Next check-in:'))
Write-Output ('This Week container with Challenge data: ' + ($o -match 'id="k1-week" data-challenge='))
Write-Output ('PHP warnings/errors: ' + [regex]::Matches($o, '(Warning|Notice|Fatal error|Deprecated):').Count)
Set-Content -Path (Join-Path $root 'dist\stub-plan-output.html') -Value $o -Encoding utf8

Write-Output '--- 6. Club-only buyer (variation 582)'
$env:K1_VARIATION = '582'
$o = (php $stub $lint plan $state) -join "`n"
Remove-Item Env:\K1_VARIATION
Write-Output ('club view shown: ' + ($o -match 'Your \$1K Club') + ' | upsell: ' + ($o -match 'Add the \$1K Challenge') + ' | no plan/check-in: ' + (-not ($o -cmatch 'id="k1-plan"|<h2>Weekly check-in</h2>')))
Write-Output ('PHP warnings/errors: ' + [regex]::Matches($o, '(Warning|Notice|Fatal error|Deprecated):').Count)


