param(
  [string]$HostName = '57.129.80.192',
  [string]$User = 'ubuntu',
  [string]$RemoteWebRoot = '/var/www/amitiel.cv',
  [switch]$Full,
  # Jeśli ustawione: deployuje tylko portfolio (bez wgrywania cv.html jako index.html)
  [switch]$PortfolioOnly,
  # Jeśli ustawione: pomija build/publikację portfolio na OVH
  [switch]$SkipPortfolio,
  # Jeśli ustawione: w submodule portfolio robi dodatkowo git pull na gałęzi (np. main),
  # zamiast budować dokładnie wersję "przypiętą" w parent repo.
  [switch]$PortfolioPullLatest,
  # Repozytorium CV (parent repo) do zaciągania na serwerze (build portfolio na OVH)
  [string]$RepoUrl = '',
  # Katalog roboczy na serwerze (źródła pod git pull + submodule)
  [string]$RemoteBuildDir = ''
)

$ErrorActionPreference = 'Stop'

function Assert-Exists($Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Brak pliku/katalogu: $Path"
  }
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Assert-Exists ".\cv.html"

$portfolioBase = "/portfolio/"
$remotePortfolioRoot = "$RemoteWebRoot/portfolio"

if (-not $RepoUrl) {
  try {
    $RepoUrl = (git remote get-url origin).Trim()
  } catch {
    $RepoUrl = 'https://github.com/armitiel/armitiel_interior.git'
  }
}

if (-not $RemoteBuildDir) {
  $RemoteBuildDir = "/home/$User/amitiel.cv-src"
}

$remote = "$User@$HostName"
$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')

Write-Host "Deploy do $remote ($RemoteWebRoot)"
Write-Host "Backup index.html na serwerze (timestamp: $ts)"
if ($PortfolioOnly) {
  Write-Host "Tryb: tylko portfolio (bez wgrywania cv.html jako index.html)"
} else {
  Write-Host "Tryb: wgrywam cv.html jako index.html + (opcjonalnie) portfolio"
}
if ($Full) {
  Write-Warning "Parametr -Full jest zignorowany (deploy jest tylko dla cv.html)."
}

# Opcje SSH/SCP: bez interaktywnego pytania o host key (ważne dla automatyzacji)
$sshOpts = @(
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ServerAliveInterval=30",
  "-o", "ServerAliveCountMax=3"
)

# 1) Backup + przygotowanie katalogu docelowego (wymaga, żeby user miał sudo bez hasła lub już miał prawa do katalogu)
ssh @sshOpts $remote "sudo mkdir -p /var/backups/amitiel.cv; if [ -f '$RemoteWebRoot/index.html' ]; then sudo cp '$RemoteWebRoot/index.html' '/var/backups/amitiel.cv/index-$ts.html'; fi; sudo mkdir -p '$RemoteWebRoot' '$remotePortfolioRoot'; sudo chown -R ${User}:${User} '$RemoteWebRoot'"

# 2) Wgraj CV jako index.html (chyba że PortfolioOnly)
if (-not $PortfolioOnly) {
  Write-Host "Wgrywam cv.html -> index.html"
  scp @sshOpts ".\cv.html" "${remote}:$RemoteWebRoot/index.html"
}

# 3) Portfolio: build + publikacja na OVH (git pull + submodule + npm ci + vite build)
if (-not $SkipPortfolio) {
  Write-Host "Portfolio: buduję na OVH z Gita i publikuję do $remotePortfolioRoot (base: $portfolioBase)"

  $portfolioPullLatestFlag = if ($PortfolioPullLatest) { "1" } else { "0" }

  $remoteScript = @"
set -euo pipefail

BUILD_DIR='$RemoteBuildDir'
REPO_URL='$RepoUrl'
WEBROOT='$RemoteWebRoot'
OUT_DIR='$remotePortfolioRoot'
BASE_URL='$portfolioBase'
PULL_LATEST_PORTFOLIO='$portfolioPullLatestFlag'

echo "[portfolio] build dir: \$BUILD_DIR"
echo "[portfolio] repo:      \$REPO_URL"
echo "[portfolio] out:       \$OUT_DIR"
echo "[portfolio] base:      \$BASE_URL"

command -v git >/dev/null 2>&1 || { echo "[portfolio] Brak 'git' na serwerze."; exit 2; }
command -v node >/dev/null 2>&1 || { echo "[portfolio] Brak 'node' na serwerze."; exit 2; }
command -v npm >/dev/null 2>&1 || { echo "[portfolio] Brak 'npm' na serwerze."; exit 2; }

if [ ! -d "\$BUILD_DIR/.git" ]; then
  echo "[portfolio] Klonuję repo..."
  rm -rf "\$BUILD_DIR"
  git clone "\$REPO_URL" "\$BUILD_DIR"
fi

cd "\$BUILD_DIR"
echo "[portfolio] Aktualizuję repo (master)..."
git fetch origin
git checkout master
git pull --ff-only origin master

echo "[portfolio] Aktualizuję submoduły..."
git submodule sync --recursive
git submodule update --init --recursive

if [ "\$PULL_LATEST_PORTFOLIO" = "1" ]; then
  echo "[portfolio] PortfolioPullLatest=1 -> git pull w submodule (main)"
  cd portfolio
  git fetch origin
  git checkout main || true
  git pull --ff-only origin main
  cd ..
fi

echo "[portfolio] Instaluję zależności i buduję..."
cd portfolio
export NODE_ENV=development
export NPM_CONFIG_PRODUCTION=false
npm ci
npm run build -- --base="\$BASE_URL"

echo "[portfolio] Publikuję do \$OUT_DIR"
mkdir -p "\$OUT_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "\$OUT_DIR"/
else
  rm -rf "\$OUT_DIR"/*
  cp -r dist/* "\$OUT_DIR"/
fi

echo "[portfolio] OK"
"@

  # Puść skrypt bash przez stdin (działa w PowerShell na Windows)
  $remoteScript | ssh @sshOpts $remote "bash -s"
} else {
  Write-Host "Portfolio: pomijam (SkipPortfolio)"
}

# 4) Szybki smoke-test
Write-Host "Test: HEAD https://amitiel.cv"
try {
  curl.exe -I -sS -m 12 "https://amitiel.cv" | Select-Object -First 20
} catch {
  Write-Warning "Nie udało się wykonać testu curl z Windows. Sprawdź w przeglądarce: https://amitiel.cv (Ctrl+F5)."
}

Write-Host "Gotowe. Jeśli nie widzisz zmian, zrób twarde odświeżenie: Ctrl+F5."

