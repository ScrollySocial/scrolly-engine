# Stitch TikTok cover frames (official oEmbed thumbnails) into one labeled grid image for visual review.
# Usage: powershell -File cover-grid.ps1 -Out grid.jpg -Labels "28","31" -Urls "https://...","https://..."
param([string]$Out, [string[]]$Urls, [string[]]$Labels, [int]$Cols = 4, [int]$W = 300, [int]$H = 533)
Add-Type -AssemblyName System.Drawing
$rows = [Math]::Ceiling($Urls.Count / $Cols)
$bmp = New-Object System.Drawing.Bitmap ($Cols * $W), ($rows * ($H + 22))
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font 'Arial', 11, ([System.Drawing.FontStyle]::Bold)
$tmp = [IO.Path]::GetTempFileName()
for ($i = 0; $i -lt $Urls.Count; $i++) {
  $x = ($i % $Cols) * $W; $y = [Math]::Floor($i / $Cols) * ($H + 22)
  try {
    $o = Invoke-RestMethod ("https://www.tiktok.com/oembed?url=" + [uri]::EscapeDataString($Urls[$i]))
    Invoke-WebRequest $o.thumbnail_url -OutFile $tmp -UseBasicParsing
    $img = [System.Drawing.Image]::FromFile($tmp)
    $g.DrawImage($img, $x, $y + 22, $W, $H); $img.Dispose()
    $g.DrawString("#$($Labels[$i]) @$($o.author_name)", $font, [System.Drawing.Brushes]::Black, $x + 4, $y + 3)
  } catch { $g.DrawString("#$($Labels[$i]) failed", $font, [System.Drawing.Brushes]::Red, $x + 4, $y + 3) }
}
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $g.Dispose(); $bmp.Dispose(); Remove-Item $tmp -ErrorAction SilentlyContinue
"saved $Out"
