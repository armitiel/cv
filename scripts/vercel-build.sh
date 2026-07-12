#!/bin/sh
set -e

# Buduje artefakty do katalogu ./public (Vercel outputDirectory).
# - CV: kopiuje cv.html jako index.html + cv.html oraz statyczne katalogi i favikony
# - Portfolio: kopiuje statyczne portfolio-v2 (razem z assetami) do ./public/portfolio
# Uwaga: brak submodulow i brak kroku budowania - wszystko zyje w tym repo.

ROOT_DIR="$(pwd)"
OUT_DIR="$ROOT_DIR/public"

CV_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
BUILD_TIME_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Informacja diagnostyczna (żeby szybko sprawdzić, co jest na produkcji)
cat > "$OUT_DIR/build-info.json" <<EOF
{"cv":"$CV_SHA","portfolio":"portfolio-v2","builtAt":"$BUILD_TIME_UTC"}
EOF

# CV (statyczne pliki)
cp "$ROOT_DIR/cv.html" "$OUT_DIR/index.html"
cp "$ROOT_DIR/cv.html" "$OUT_DIR/cv.html"

for d in css js images assets shared; do
  if [ -d "$ROOT_DIR/$d" ]; then
    cp -R "$ROOT_DIR/$d" "$OUT_DIR/"
  fi
done

# Pliki opcjonalne (favikony/manifest)
for f in favicon.svg favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png site.webmanifest; do
  if [ -f "$ROOT_DIR/$f" ]; then
    cp "$ROOT_DIR/$f" "$OUT_DIR/$f"
  fi
done

# Portfolio (statyczne portfolio-v2 -> ./public/portfolio)
# portfolio-v2 zawiera juz wszystko: strony, data.js oraz assety (projects/, illustrations/, fonts/)
mkdir -p "$OUT_DIR/portfolio"
if [ -d "$ROOT_DIR/portfolio-v2" ]; then
  cp -R "$ROOT_DIR/portfolio-v2/." "$OUT_DIR/portfolio/"
fi
cat > "$OUT_DIR/portfolio/build-info.json" <<EOF
{"cv":"$CV_SHA","portfolio":"portfolio-v2","builtAt":"$BUILD_TIME_UTC"}
EOF

echo "Vercel build OK (public/)."
