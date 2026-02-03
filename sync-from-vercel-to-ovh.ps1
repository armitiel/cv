<#
.SYNOPSIS
  Pobiera wersję strony z Vercel i wgrywa ją na serwer OVH (amitiel.cv).
  Użyj tego, gdy źródłem prawdy jest deploy na Vercel, a OVH ma być lustrem.

.PARAMETER VercelUrl
  Pełny URL strony na Vercel, np. https://cv-xxx.vercel.app lub https://amitiel.cv (jeśli domena wskazuje na Vercel).

.PARAMETER HostName, User, RemoteWebRoot
  Parametry połączenia z OVH (domyślnie jak w deploy-amitiel-cv.ps1).
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$VercelUrl,
  [string]$HostName = '57.129.80.192',
  [string]$User = 'ubuntu',
  [string]$RemoteWebRoot = '/var/www/amitiel.cv',
  # Pobierz też katalog /portfolio/ z Vercel (jeśli Vercel hostuje portfolio)
  [switch]$IncludePortfolio
)

$ErrorActionPreference = 'Stop'

$VercelUrl = $VercelUrl.TrimEnd('/')
$remote = "$User@$HostName"

$sshOpts = @(
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ServerAliveInterval=30",
  "-o", "ServerAliveCountMax=3"
)

Write-Host "Sync z Vercel na OVH: $VercelUrl -> $remote ($RemoteWebRoot)"

# Skrypt bash wykonywany na OVH: pobiera stronę z Vercel do katalogu www
$remoteScript = @"
set -euo pipefail
VERCEL_URL='$VercelUrl'
WEBROOT='$RemoteWebRoot'
mkdir -p "\$WEBROOT"/{css,js,images,assets}

echo '[sync] Pobieram index.html (strona glowna)...'
curl -sS -L -o "\$WEBROOT/index.html" "\$VERCEL_URL/"

echo '[sync] Pobieram katalogi css, js, images, assets...'
for dir in css js images assets; do
  if command -v wget >/dev/null 2>&1; then
    wget -q -r -l 2 -np -nH --cut-dirs=1 -P "\$WEBROOT" "\$VERCEL_URL/\$dir/" 2>/dev/null || true
  else
    echo "[sync] Brak wget, pomijam \$dir (zainstaluj wget)"
  fi
done

# Napraw strukturę: wget tworzy np. css/ w WEBROOT - OK
echo '[sync] Gotowe (index.html + css/js/images/assets).'
"@

if ($IncludePortfolio) {
  $remoteScript += @"

echo '[sync] Pobieram portfolio...'
mkdir -p "\$WEBROOT/portfolio"
if command -v wget >/dev/null 2>&1; then
  wget -q -r -l 3 -np -nH --cut-dirs=1 -P "\$WEBROOT" "\$VERCEL_URL/portfolio/" 2>/dev/null || true
fi
"@
}

# Zapisz skrypt do pliku (UTF-8 bez BOM, LF) i wyślij na serwer
$tmp = New-TemporaryFile
try {
  $scriptText = $remoteScript -replace "`r`n", "`n"
  [System.IO.File]::WriteAllText($tmp.FullName, $scriptText, (New-Object System.Text.UTF8Encoding($false)))
  $remoteTmp = "/tmp/sync-from-vercel-$(Get-Date -Format 'yyyyMMdd-HHmmss').sh"
  scp @sshOpts $tmp.FullName "${remote}:$remoteTmp"
  ssh @sshOpts $remote "bash $remoteTmp; rm -f $remoteTmp"
} finally {
  Remove-Item -LiteralPath $tmp.FullName -Force -ErrorAction SilentlyContinue
}

Write-Host "Gotowe. OVH ma teraz wersje z Vercel. Sprawdz: https://amitiel.cv (Ctrl+F5)."
Write-Host "Uwaga: Jesli brakuje plikow (css/js/images), na serwerze OVH zainstaluj wget: sudo apt-get install -y wget"
