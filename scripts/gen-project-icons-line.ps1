# Ikonki kafelkow projektow przez OpenAI Images (edits z referencja stylu z EwolucJA).
# Uzycie: powershell -File scripts\gen-project-icons.ps1 [id ...]
$ErrorActionPreference = 'Stop'
$envFile = 'C:\Users\DELL\EwolucJA\backend\.env'
$line = Select-String -Path $envFile -Pattern '^\s*OPENAI_API_KEY\s*=' | Select-Object -First 1
$key = ($line.Line -split '=',2)[1].Trim().Trim('"').Trim("'")
$root = Split-Path $PSScriptRoot -Parent
$ref  = Join-Path $root 'portfolio-v2\projects\_icons\icon-style-ref.png'
$out  = Join-Path $root 'portfolio-v2\projects\_icons\line'
New-Item -ItemType Directory -Force $out | Out-Null
$style = 'The attached image shows a set of five icons: capsule, spartan helmet, cherries, fox head, pencil. Redraw ONLY the one named above as a single standalone icon, matching the reference style exactly: bold even-weight near-black (#1c1813) rounded strokes, flat orange fills, small white highlight shapes, no gradients, no shading, no texture. Draw it alone, without the rounded tile behind it. Icon fills about 75% of the canvas, centered; genuine transparent background; no text, letters, frame or watermark.'
$icons = [ordered]@{
  'hubble-rx'       = 'Icon to draw: the medicine capsule with signal arcs (1st in the reference).'
  'olympus-defence' = 'Icon to draw: the spartan helmet with orange crest (2nd in the reference).'
  'casino-slot-art' = 'Icon to draw: the cherries (3rd in the reference).'
  'personal-games'  = 'Icon to draw: the fox head (4th in the reference).'
  'illustration'    = 'Icon to draw: the pencil drawing a line (5th in the reference).'
}
foreach ($id in $icons.Keys) {
  if ($args.Count -and $args -notcontains $id) { continue }
  Write-Host "-> $id"
  $json = Join-Path $env:TEMP "icon-$id.json"
  & curl.exe -s -S --max-time 280 https://api.openai.com/v1/images/edits `
    -H "Authorization: Bearer $key" `
    -F model=gpt-image-1.5 -F "image[]=@$ref" -F size=1024x1024 -F background=transparent -F quality=high `
    --form-string "prompt=$($icons[$id]) $style" -o $json
  $r = Get-Content $json -Raw | ConvertFrom-Json
  if ($r.error) { Write-Host "ERR $id : $($r.error.message)"; continue }
  [IO.File]::WriteAllBytes((Join-Path $out "$id.png"), [Convert]::FromBase64String($r.data[0].b64_json))
  Remove-Item $json
  Write-Host "OK $id"
}
