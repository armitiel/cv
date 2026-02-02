param(
  [string]$HostName = '57.129.80.192',
  [string]$User = 'ubuntu',
  [string]$RemoteWebRoot = '/var/www/amitiel.cv',
  [switch]$Full
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
Assert-Exists ".\css"
Assert-Exists ".\images"
Assert-Exists ".\assets"
# js/ — opcjonalny (jeśli nie ma, pomijamy)
$hasJs = Test-Path -LiteralPath ".\js"
$hasPortfolioDist = Test-Path -LiteralPath ".\portfolio\dist"

$remote = "$User@$HostName"
$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')

Write-Host "Deploy do $remote ($RemoteWebRoot)"
Write-Host "Backup index.html na serwerze (timestamp: $ts)"

# Opcje SSH/SCP: bez interaktywnego pytania o host key (ważne dla automatyzacji)
$sshOpts = @(
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ServerAliveInterval=30",
  "-o", "ServerAliveCountMax=3"
)

# 1) Backup + przygotowanie katalogu docelowego (wymaga, żeby user miał sudo bez hasła lub już miał prawa do katalogu)
ssh @sshOpts $remote "sudo mkdir -p /var/backups/amitiel.cv; if [ -f '$RemoteWebRoot/index.html' ]; then sudo cp '$RemoteWebRoot/index.html' '/var/backups/amitiel.cv/index-$ts.html'; fi; sudo mkdir -p '$RemoteWebRoot'; sudo chown -R ${User}:${User} '$RemoteWebRoot'"

# 2) Wgraj CV jako index.html
Write-Host "Wgrywam cv.html -> index.html"
scp @sshOpts ".\cv.html" "${remote}:$RemoteWebRoot/index.html"

function Ensure-RemoteDir([string]$remoteDir) {
  ssh @sshOpts $remote "mkdir -p '$remoteDir'"
}

function Upload-FilePreservePath([string]$localPath, [string]$remoteRoot) {
  $rel = $localPath.TrimStart('.','\','/')
  $rel = $rel -replace '\\','/'
  $remotePath = "$remoteRoot/$rel"
  $remoteDir = ($remotePath -replace '/[^/]+$','')
  Ensure-RemoteDir $remoteDir
  scp @sshOpts $localPath "${remote}:${remotePath}"
}

function Remove-RemoteFile([string]$repoPath, [string]$remoteRoot) {
  $rel = ($repoPath -replace '\\','/')
  $remotePath = "$remoteRoot/$rel"
  ssh @sshOpts $remote "rm -f '$remotePath' 2>/dev/null || true"
}

# 3) Wgraj zasoby (domyślnie: przyrostowo — tylko zmienione pliki)
$deployRoots = @('css/', 'images/', 'assets/')
if ($hasJs) { $deployRoots += 'js/' }
$deployRoots += 'portfolio/dist/'
$uploadDirs = @('.\css', '.\images', '.\assets')
if ($hasJs) { $uploadDirs += '.\js' }
if ($hasPortfolioDist) { $uploadDirs += '.\portfolio\dist' }

if ($Full) {
  Write-Host "Wgrywam pełne katalogi: $($uploadDirs -join ', ') (tryb -Full)"
  scp @sshOpts -r @uploadDirs "${remote}:$RemoteWebRoot/"
} else {
  $gitOk = $true
  try { git --version | Out-Null } catch { $gitOk = $false }

  if (-not $gitOk) {
    Write-Warning "Nie wykryto git - robie pelny upload katalogow (jak wczesniej)."
    scp @sshOpts -r @uploadDirs "${remote}:$RemoteWebRoot/"
  } else {
    Write-Host "Tryb przyrostowy: wysylam tylko zmienione/nowe pliki (bez pelnego uploadu katalogow)."

    # Porcelain format: "XY path"
    $lines = git status --porcelain
    $changed = @()
    $deleted = @()

    foreach ($l in $lines) {
      if ([string]::IsNullOrWhiteSpace($l) -or $l.Length -lt 4) { continue }
      $status = $l.Substring(0,2)
      $path = $l.Substring(3).Trim()
      # usun cudzyslowy z nazw ze spacjami (git potrafi je dodawac)
      if ($path.StartsWith('"') -and $path.EndsWith('"')) { $path = $path.Trim('"') }
      $pathNorm = $path -replace '\\','/'

      $isInDeployRoot = $false
      foreach ($root in $deployRoots) {
        if ($pathNorm.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) { $isInDeployRoot = $true; break }
      }

      if (-not $isInDeployRoot) { continue }

      if ($status -match 'D') {
        $deleted += $pathNorm
      } else {
        $changed += $path
      }
    }

    if ($deleted.Count -gt 0) {
      Write-Host "Usuwam z serwera: $($deleted.Count) plikow"
      foreach ($p in $deleted | Select-Object -Unique) {
        Remove-RemoteFile $p $RemoteWebRoot
      }
    }

    if ($changed.Count -gt 0) {
      Write-Host "Wysylam na serwer: $($changed.Count) plikow"
      foreach ($p in $changed | Select-Object -Unique) {
        if (Test-Path -LiteralPath $p) {
          Upload-FilePreservePath $p $RemoteWebRoot
        }
      }
    } else {
      Write-Host "Brak zmian w css/js/images/assets do wyslania."
    }
  }
}

# 4) (Opcjonalnie) favikony/manifest w root, jeśli są w projekcie
$optionalFiles = @(
  ".\favicon.svg",
  ".\favicon.ico",
  ".\favicon-16x16.png",
  ".\favicon-32x32.png",
  ".\apple-touch-icon.png",
  ".\android-chrome-192x192.png",
  ".\android-chrome-512x512.png",
  ".\site.webmanifest"
)

$existingOptional = $optionalFiles | Where-Object { Test-Path -LiteralPath $_ }
if ($existingOptional.Count -gt 0) {
  Write-Host "Wgrywam pliki (favikony/manifest): $($existingOptional -join ', ')"
  scp @sshOpts @existingOptional "${remote}:$RemoteWebRoot/"
}

# 5) Szybki smoke-test
Write-Host "Test: HEAD https://amitiel.cv"
try {
  curl.exe -I -sS -m 12 "https://amitiel.cv" | Select-Object -First 20
} catch {
  Write-Warning "Nie udało się wykonać testu curl z Windows. Sprawdź w przeglądarce: https://amitiel.cv (Ctrl+F5)."
}

Write-Host "Gotowe. Jeśli nie widzisz zmian, zrób twarde odświeżenie: Ctrl+F5."

