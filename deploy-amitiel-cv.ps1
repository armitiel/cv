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
  [string]$RemoteBuildDir = '',
  # Repozytorium portfolio (submodule) do zaciągania na serwerze (publiczne HTTPS lub SSH)
  [string]$PortfolioRepoUrl = '',
  # Katalog roboczy na serwerze dla portfolio
  [string]$RemotePortfolioBuildDir = ''
)

$ErrorActionPreference = 'Stop'

function Assert-Exists($Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Brak pliku/katalogu: $Path"
  }
}

function Convert-GithubHttpsToSsh([string]$Url) {
  if (-not $Url) { return $Url }
  $u = $Url.Trim()
  if ($u -match '^https://github\.com/([^/]+)/([^/]+?)(\.git)?$') {
    return "git@github.com:$($Matches[1])/$($Matches[2]).git"
  }
  return $u
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

# Na OVH mamy skonfigurowany klucz SSH do GitHuba (BatchMode).
# Preferuj SSH zamiast HTTPS (HTTPS bez tokena kończy się prośbą o username).
$RepoUrl = Convert-GithubHttpsToSsh $RepoUrl

if (-not $RemoteBuildDir) {
  $RemoteBuildDir = "/home/$User/amitiel.cv-src"
}

$portfolioRepoUrlFromGitmodules = $null
try {
  $portfolioRepoUrlFromGitmodules = (git config --file .gitmodules --get submodule.portfolio.url).Trim()
} catch {
  $portfolioRepoUrlFromGitmodules = $null
}

if (-not $PortfolioRepoUrl) {
  $PortfolioRepoUrl = if ($portfolioRepoUrlFromGitmodules) { $portfolioRepoUrlFromGitmodules } else { 'https://github.com/armitiel/creative-showcase.git' }
}

$PortfolioRepoUrl = Convert-GithubHttpsToSsh $PortfolioRepoUrl

if (-not $RemotePortfolioBuildDir) {
  $RemotePortfolioBuildDir = "/home/$User/amitiel.portfolio-src"
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

# 2b) Wgraj kluczowe assety CV (żeby stopka/branding był zgodny z lokalnym)
try {
  if (Test-Path -LiteralPath ".\assets\footer.png") {
    Write-Host "Wgrywam assets/footer.png"
    ssh @sshOpts $remote "mkdir -p '$RemoteWebRoot/assets'"
    scp @sshOpts ".\assets\footer.png" "${remote}:$RemoteWebRoot/assets/footer.png"
  }
  if (Test-Path -LiteralPath ".\assets\v17_logo.svg") {
    Write-Host "Wgrywam assets/v17_logo.svg"
    ssh @sshOpts $remote "mkdir -p '$RemoteWebRoot/assets'"
    scp @sshOpts ".\assets\v17_logo.svg" "${remote}:$RemoteWebRoot/assets/v17_logo.svg"
  }
} catch {
  Write-Warning "Nie udało się wgrać assetów stopki. Sprawdź połączenie SCP/SSH."
}

# 3) Portfolio: build + publikacja na OVH (git pull + submodule + npm ci + vite build)
if (-not $SkipPortfolio) {
  Write-Host "Portfolio: buduję na OVH z Gita i publikuję do $remotePortfolioRoot (base: $portfolioBase)"

  $portfolioPullLatestFlag = if ($PortfolioPullLatest) { "1" } else { "0" }

  $remoteScriptTemplate = @'
set -euo pipefail

BUILD_DIR="__BUILD_DIR__"
REPO_URL="__REPO_URL__"
WEBROOT="__WEBROOT__"
OUT_DIR="__OUT_DIR__"
BASE_URL="__BASE_URL__"
PULL_LATEST_PORTFOLIO="__PULL_LATEST_PORTFOLIO__"

echo "[portfolio] build dir: $BUILD_DIR"
echo "[portfolio] repo:      $REPO_URL"
echo "[portfolio] out:       $OUT_DIR"
echo "[portfolio] base:      $BASE_URL"

command -v git >/dev/null 2>&1 || { echo "[portfolio] Brak 'git' na serwerze."; exit 2; }
command -v node >/dev/null 2>&1 || { echo "[portfolio] Brak 'node' na serwerze."; exit 2; }
command -v npm >/dev/null 2>&1 || { echo "[portfolio] Brak 'npm' na serwerze."; exit 2; }

if [ ! -d "$BUILD_DIR/.git" ]; then
  echo "[portfolio] Klonuję repo..."
  rm -rf "$BUILD_DIR"
  git clone "$REPO_URL" "$BUILD_DIR"
fi

cd "$BUILD_DIR"
echo "[portfolio] Aktualizuję repo (main)..."
git fetch origin
git checkout main || true
if [ "$PULL_LATEST_PORTFOLIO" = "1" ]; then
  git pull --ff-only origin main || true
fi

echo "[portfolio] Instaluję zależności i buduję..."
export NODE_ENV=development
export NPM_CONFIG_PRODUCTION=false
npm ci
npm run build -- --base="$BASE_URL"

echo "[portfolio] Publikuję do $OUT_DIR"
mkdir -p "$OUT_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "$OUT_DIR"/
else
  rm -rf "$OUT_DIR"/*
  cp -r dist/* "$OUT_DIR"/
fi

echo "[portfolio] OK"
'@

  $remoteScript = $remoteScriptTemplate.
    Replace('__BUILD_DIR__', $RemotePortfolioBuildDir).
    Replace('__REPO_URL__', $PortfolioRepoUrl).
    Replace('__WEBROOT__', $RemoteWebRoot).
    Replace('__OUT_DIR__', $remotePortfolioRoot).
    Replace('__BASE_URL__', $portfolioBase).
    Replace('__PULL_LATEST_PORTFOLIO__', $portfolioPullLatestFlag)

  # PowerShell potrafi wysyłać do native apps w złym kodowaniu (np. UTF-16),
  # więc zamiast pipe -> ssh, wysyłamy plik .sh przez scp i uruchamiamy na serwerze.
  $tmp = New-TemporaryFile
  try {
    # Zapisz jako UTF-8 BEZ BOM i z LF (bash-friendly)
    $scriptText = $remoteScript -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText(
      $tmp.FullName,
      $scriptText,
      (New-Object System.Text.UTF8Encoding($false))
    )
    $remoteTmp = "/tmp/amitiel-portfolio-deploy-$ts.sh"
    scp @sshOpts $tmp.FullName "${remote}:$remoteTmp"
    # Uwaga: nie usuwaj pliku, jeśli bash się wywali — ułatwia debug na serwerze
    $remoteRunCmd = ('bash ''{0}''; rc=$?; if [ $rc -eq 0 ]; then rm -f ''{0}''; fi; exit $rc' -f $remoteTmp)
    ssh @sshOpts $remote $remoteRunCmd
  } finally {
    Remove-Item -LiteralPath $tmp.FullName -Force -ErrorAction SilentlyContinue
  }
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

