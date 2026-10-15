Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\seif.elawamry\.gemini\antigravity\brain\426d4ee4-852c-4045-bc85-d16ee0682636\.user_uploaded\media_1792025988696.jpg"
$publicDir = "C:\Users\seif.elawamry\.gemini\antigravity\scratch\liptis-neoped-lbw\public"
$iconsDir = Join-Path $publicDir "icons"

if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Source Image Loaded: $($srcImg.Width) x $($srcImg.Height)"

function Resize-Image($source, $targetPath, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graph.DrawImage($source, 0, 0, $width, $height)
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graph.Dispose()
    $bmp.Dispose()
    Write-Output "Generated: $targetPath ($width x $height)"
}

# 1. 512x512 PWA / Android high-res icon
Resize-Image $srcImg (Join-Path $iconsDir "icon-512.png") 512 512
Resize-Image $srcImg (Join-Path $publicDir "icon.png") 512 512

# 2. 192x192 Android home screen standard
Resize-Image $srcImg (Join-Path $iconsDir "icon-192.png") 192 192

# 3. 180x180 Apple touch icon for iOS home screen
Resize-Image $srcImg (Join-Path $publicDir "apple-touch-icon.png") 180 180

# 4. 32x32 & 48x48 Favicon PNGs
Resize-Image $srcImg (Join-Path $publicDir "favicon-32x32.png") 32 32
Resize-Image $srcImg (Join-Path $publicDir "favicon-48x48.png") 48 48
Resize-Image $srcImg (Join-Path $publicDir "favicon.ico") 32 32

$srcImg.Dispose()
Write-Output "All icons successfully generated!"
