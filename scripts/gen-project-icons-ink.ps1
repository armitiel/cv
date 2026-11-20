# Ikonki kafelkow projektow przez OpenAI Images (edits z referencja stylu z EwolucJA).
# Uzycie: powershell -File scripts\gen-project-icons.ps1 [id ...]
$ErrorActionPreference = 'Stop'
$envFile = 'C:\Users\DELL\EwolucJA\backend\.env'
$line = Select-String -Path $envFile -Pattern '^\s*OPENAI_API_KEY\s*=' | Select-Object -First 1
$key = ($line.Line -split '=',2)[1].Trim().Trim('"').Trim("'")
$root = Split-Path $PSScriptRoot -Parent
$ref  = Join-Path $root 'portfolio-v2\me.png'
$out  = Join-Path $root 'portfolio-v2\projects\_icons\ink'
New-Item -ItemType Directory -Force $out | Out-Null
$style = 'Clean minimal icon mark. The attached portrait is ONLY a palette reference. Do NOT draw a person or a face. Style: clean confident shapes with smooth solid near-black (#1c1813) strokes of even weight and flat burnt orange (#C26A32) fills; slightly hand-drawn but tidy edges; NO splatters, NO dry-brush texture, NO drips, NO sketchy lines, NO grain, NO gradients, NO shading. Strictly two colours. One simple object, compact and bold, filling about 70% of the canvas, centered square composition, readable at 48px; genuine transparent background; no text, letters, frame or watermark.'
$icons = [ordered]@{
  'hubble-rx'       = 'Subject: a large diagonal medicine capsule, one half orange and one half outlined, with two small curved signal arcs at its upper end.'
  'olympus-defence' = 'Subject: a greek spartan corinthian helmet in side view drawn in black ink, its tall crest as a flat orange shape.'
  'casino-slot-art' = 'Subject: two cherries on a stem, cherries as round flat orange circles, stem and leaf in black ink.'
  'personal-games'  = 'Subject: a simple fox head in front view, flat orange shape with clean black outline, ears and eyes.'
  'illustration'    = 'Subject: a classic wooden hexagonal pencil (clearly a pencil with sharpened tip and eraser), diagonal, body orange, drawing one short curly line.'
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
