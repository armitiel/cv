param(
  [string]$HostName = '57.129.80.192',
  [string]$User = 'ubuntu',
  [string]$RemoteWebRoot = '/var/www/amitiel.cv',
  [string]$LocalBackupDir = '.\ovh-backup'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$remote = "$User@$HostName"
$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
$backupPath = if ($LocalBackupDir -eq '.\ovh-backup') { 
  ".\ovh-backup-$ts" 
} else { 
  $LocalBackupDir 
}

Write-Host "Pobieranie wersji z OVH: $remote ($RemoteWebRoot)"
Write-Host "Zapisywanie do: $backupPath"

# Opcje SSH/SCP: bez interaktywnego pytania o host key
$sshOpts = @(
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ServerAliveInterval=30",
  "-o", "ServerAliveCountMax=3"
)

# Sprawdź czy pliki istnieją na serwerze
Write-Host "Sprawdzam zawartość serwera..."
try {
  $cmd = "ls -la '$RemoteWebRoot' 2>&1"
  $remoteFiles = ssh @sshOpts $remote $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Katalog $RemoteWebRoot nie istnieje na serwerze lub brak dostępu."
  }
} catch {
  throw "Nie można połączyć się z serwerem lub katalog $RemoteWebRoot nie istnieje: $_"
}

# Utwórz lokalny katalog backup
New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
Write-Host "Utworzono katalog: $backupPath"

# 1) Pobierz index.html jako cv.html
Write-Host "Pobieram index.html -> cv.html"
try {
  $localCv = Join-Path $backupPath "cv.html"
  scp @sshOpts "${remote}:$RemoteWebRoot/index.html" $localCv
  Write-Host "  [OK] cv.html pobrany"
} catch {
  Write-Warning "  [ERROR] Nie udalo sie pobrac index.html: $_"
}

# 2) Pobierz katalogi: css, js, images, assets
$remoteDirs = @('css', 'js', 'images', 'assets')

foreach ($dir in $remoteDirs) {
  Write-Host "Pobieram katalog: $dir"
  $oldErrorAction = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $localDir = Join-Path $backupPath $dir
    scp @sshOpts -r "${remote}:$RemoteWebRoot/$dir" $backupPath 2>&1 | Out-Null
    if (Test-Path $localDir) {
      Write-Host "  [OK] $dir pobrany"
    } else {
      Write-Host "  [SKIP] $dir nie istnieje na serwerze (pomijam)"
    }
  } catch {
    Write-Host "  [SKIP] $dir nie istnieje na serwerze (pomijam)"
  } finally {
    $ErrorActionPreference = $oldErrorAction
  }
}

# 3) Pobierz opcjonalne pliki (favikony, manifest)
$optionalFiles = @(
  "favicon.svg",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "site.webmanifest"
)

Write-Host "Pobieram opcjonalne pliki (favikony/manifest)..."
foreach ($file in $optionalFiles) {
  $oldErrorAction = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $localFile = Join-Path $backupPath $file
    scp @sshOpts "${remote}:$RemoteWebRoot/$file" $localFile 2>&1 | Out-Null
    if (Test-Path $localFile) {
      Write-Host "  [OK] $file pobrany"
    }
  } catch {
    # Cicho pomijamy brakujące pliki
  } finally {
    $ErrorActionPreference = $oldErrorAction
  }
}

# 4) Podsumowanie
Write-Host ""
Write-Host ("=" * 60)
Write-Host "Gotowe! Pobrana wersja z OVH zapisana w: $backupPath"
Write-Host ""
Write-Host "Zawartość:"
$backupPathResolved = (Resolve-Path $backupPath).Path
Get-ChildItem -Path $backupPath -Recurse -File | ForEach-Object {
  $relPath = $_.FullName.Substring($backupPathResolved.Length + 1)
  Write-Host "  - $relPath"
}
Write-Host ""
Write-Host "Aby porównać z lokalną wersją, użyj narzędzi diff lub otwórz pliki."
