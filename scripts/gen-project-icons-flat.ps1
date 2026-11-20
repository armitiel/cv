# Ikonki kafelkow projektow przez OpenAI Images (edits z referencja stylu z EwolucJA).
# Uzycie: powershell -File scripts\gen-project-icons.ps1 [id ...]
$ErrorActionPreference = 'Stop'
$envFile = 'C:\Users\DELL\EwolucJA\backend\.env'
$line = Select-String -Path $envFile -Pattern '^\s*OPENAI_API_KEY\s*=' | Select-Object -First 1
$key = ($line.Line -split '=',2)[1].Trim().Trim('"').Trim("'")
$root = Split-Path $PSScriptRoot -Parent
$ref  = Join-Path $root 'portfolio-v2\me.png'
$out  = Join-Path $root 'portfolio-v2\projects\_icons\flat'
New-Item -ItemType Directory -Force $out | Out-Null
$style = 'Clean minimal flat silhouette icon. The attached portrait is ONLY a palette reference. Do NOT draw a person or a face. Style: built ONLY from solid filled shapes, NO outlines, NO strokes, NO contour lines at all. Exactly two flat colours: near-black (#1c1813) and burnt orange (#C26A32); inner details are cut-outs / negative space showing the transparent background, like a stencil or a modern pictogram. No gradients, no shading, no texture, no splatters. One simple bold object filling about 70% of the canvas, centered square composition, readable at 48px; genuine transparent background; no text, letters, frame or watermark.'
$icons = [ordered]@{
  'hubble-rx'       = 'Subject: a large diagonal medicine capsule as solid shapes: one half solid orange, the other half solid black, with two small orange signal arcs at its upper end.'
  'olympus-defence' = 'Subject: a greek spartan corinthian helmet in side view, solid black silhouette with eye slit as negative space, tall crest as a solid orange shape.'
  'casino-slot-art' = 'Subject: two cherries: two solid orange circles, a solid black stem and a solid black leaf.'
  'personal-games'  = 'Subject: a fox head in front view: solid orange head shape, black ear insides, black nose and eyes as solid shapes, white-ish cheeks as negative space.'
  'illustration'    = 'Subject: a diagonal pencil: solid orange hexagonal body, solid black sharpened tip and eraser band, drawing one short solid black curly line.'
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
