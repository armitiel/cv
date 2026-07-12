<#
  setup-git-speed.ps1 - URUCHOM RAZ JAKO ADMINISTRATOR.

  Wylacza skanowanie folderow projektu i procesow git/node przez Microsoft
  Defender. To najwiekszy hamulec gita na Windows - po tym operacje git
  (status / add / commit / push) przyspieszaja kilkukrotnie.

  Jak uruchomic:
    1. Klik prawym na ten plik -> "Uruchom za pomoca programu PowerShell" (jako admin),
       albo otworz PowerShell jako administrator i wpisz:
         powershell -NoProfile -ExecutionPolicy Bypass -File c:\CV\setup-git-speed.ps1
#>
$ErrorActionPreference = 'Stop'

$gitDir = Split-Path (Get-Command git).Source -Parent          # ...\Git\cmd
$gitRoot = Split-Path $gitDir -Parent                           # ...\Git
$gitExe = Join-Path $gitRoot 'bin\git.exe'

Add-MpPreference -ExclusionPath 'c:\CV'
Add-MpPreference -ExclusionProcess 'git.exe'
Add-MpPreference -ExclusionProcess 'node.exe'
Add-MpPreference -ExclusionProcess 'npm.exe'
if (Test-Path $gitExe) { Add-MpPreference -ExclusionProcess $gitExe }

Write-Host "`nDodane wykluczenia Defendera:" -ForegroundColor Green
Write-Host "  Sciezki:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionPath | ForEach-Object { "    $_" }
Write-Host "  Procesy:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionProcess | ForEach-Object { "    $_" }
Write-Host "`nGotowe. Git powinien byc teraz wyraznie szybszy." -ForegroundColor Green
