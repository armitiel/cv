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

$remote = "$User@$HostName"
$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')

Write-Host "Deploy do $remote ($RemoteWebRoot)"
Write-Host "Backup index.html na serwerze (timestamp: $ts)"
Write-Host "Tryb: wysyłam tylko cv.html jako index.html (OVH)"
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
ssh @sshOpts $remote "sudo mkdir -p /var/backups/amitiel.cv; if [ -f '$RemoteWebRoot/index.html' ]; then sudo cp '$RemoteWebRoot/index.html' '/var/backups/amitiel.cv/index-$ts.html'; fi; sudo mkdir -p '$RemoteWebRoot'; sudo chown -R ${User}:${User} '$RemoteWebRoot'"

# 2) Wgraj CV jako index.html
Write-Host "Wgrywam cv.html -> index.html"
scp @sshOpts ".\cv.html" "${remote}:$RemoteWebRoot/index.html"

# 3) Szybki smoke-test
Write-Host "Test: HEAD https://amitiel.cv"
try {
  curl.exe -I -sS -m 12 "https://amitiel.cv" | Select-Object -First 20
} catch {
  Write-Warning "Nie udało się wykonać testu curl z Windows. Sprawdź w przeglądarce: https://amitiel.cv (Ctrl+F5)."
}

Write-Host "Gotowe. Jeśli nie widzisz zmian, zrób twarde odświeżenie: Ctrl+F5."

