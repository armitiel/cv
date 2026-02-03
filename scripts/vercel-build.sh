#!/bin/sh
set -e

# Buduje artefakty do katalogu ./public (Vercel outputDirectory).
# - CV: kopiuje cv.html jako index.html + cv.html oraz statyczne katalogi i favikony
# - Portfolio: buduje Vite do ./public/portfolio z base=/portfolio/

ROOT_DIR="$(pwd)"
OUT_DIR="$ROOT_DIR/public"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# CV (statyczne pliki)
cp "$ROOT_DIR/cv.html" "$OUT_DIR/index.html"
cp "$ROOT_DIR/cv.html" "$OUT_DIR/cv.html"

for d in css js images assets; do
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

# Portfolio (Vite build -> ./public/portfolio)
if [ -d "$ROOT_DIR/portfolio" ]; then
  cd "$ROOT_DIR/portfolio"
  npm install
  npx vite build --base=/portfolio/ --outDir "../public/portfolio"
  cd "$ROOT_DIR"
fi

echo "Vercel build OK (public/)."
