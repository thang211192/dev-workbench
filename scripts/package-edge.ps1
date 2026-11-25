$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'manifest.json') | ConvertFrom-Json
$outputDir = Join-Path $root 'dist/edge'
$zipPath = Join-Path $outputDir "dev-workbench-edge-$($manifest.version).zip"
$files = @(
    'manifest.json', 'background.js', 'popup.html', 'popup.css', 'popup.js',
    'color-picker.js', 'link-extractor.js', 'json-viewer.js', 'json-viewer.css',
    'seo-meta.js', 'seo-meta.css',
    'youtube-volume.js', 'youtube-volume.css', 'youtube-volume-player.js',
    'facebook-reels.js',
    'tiktok-auto-scroll.js',
    'screenshot-overlay.js', 'screenshot.html', 'screenshot.css', 'screenshot.js'
)
foreach ($directory in 'icons', '_locales') {
    Get-ChildItem -LiteralPath (Join-Path $root $directory) -File -Recurse | ForEach-Object {
        $files += $_.FullName.Substring($root.Length + 1).Replace('\', '/')
    }
}

foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $root $file) -PathType Leaf)) {
        throw "Missing extension file: $file"
    }
}

New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
$tempZip = Join-Path $outputDir ([Guid]::NewGuid().ToString() + '.tmp')
try {
    $archive = [IO.Compression.ZipFile]::Open($tempZip, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, (Join-Path $root $file), $file, [IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    } finally {
        $archive.Dispose()
    }
    Move-Item -LiteralPath $tempZip -Destination $zipPath -Force
} finally {
    if (Test-Path -LiteralPath $tempZip) {
        Remove-Item -LiteralPath $tempZip
    }
}
$zipPath
