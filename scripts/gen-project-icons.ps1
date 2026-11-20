# Ikonki kafelkow projektow przez OpenAI Images (edits z referencja stylu z EwolucJA).
# Uzycie: powershell -File scripts\gen-project-icons.ps1 [id ...]
$ErrorActionPreference = 'Stop'
$envFile = 'C:\Users\DELL\EwolucJA\backend\.env'
$line = Select-String -Path $envFile -Pattern '^\s*OPENAI_API_KEY\s*=' | Select-Object -First 1
$key = ($line.Line -split '=',2)[1].Trim().Trim('"').Trim("'")
$root = Split-Path $PSScriptRoot -Parent
$ref  = Join-Path $root 'portfolio-v2\projects\ewolucja\icons\lisek-ui-v1.png'
$out  = Join-Path $root 'portfolio-v2\projects\_icons'
New-Item -ItemType Directory -Force $out | Out-Null
$style = 'Simple minimal game UI icon for a designer portfolio. The attached image is ONLY a style reference for outline and colour warmth (do not draw a fox unless asked). Keep it very simple: one bold object, few large shapes, thick clean dark warm outline, flat colours with at most one soft shadow tone and one small highlight, no texture, no tiny details, no rivets, no sparkles, no glow, no cast shadow; max 3-4 colours; centered square icon, full silhouette, generous transparent padding, readable at 48px; genuine transparent background; no text, letters, badge, frame, scene or watermark.'
$icons = [ordered]@{
  'hubble-rx'       = 'Subject: a teal medicine capsule with two curved signal waves next to it.'
  'olympus-defence' = 'Subject: a greek spartan corinthian helmet in side view with a tall red crest, bronze helmet.'
  'casino-slot-art' = 'Subject: two red cherries joined by a green stem with one leaf.'
  'personal-games'  = 'Subject: DRAW THE FOX FROM THE REFERENCE: a simplified happy orange fox head (front view, pointy ears, cream cheeks, small teal scarf). It must be a fox.'
  'illustration'    = 'Subject: a chunky yellow pencil drawing one curly orange line.'
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
