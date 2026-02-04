#!/bin/sh
set -e

# Buduje artefakty do katalogu ./public (Vercel outputDirectory).
# - CV: kopiuje cv.html jako index.html + cv.html oraz statyczne katalogi i favikony
# - Portfolio: buduje Vite do ./public/portfolio z base=/portfolio/

ROOT_DIR="$(pwd)"
OUT_DIR="$ROOT_DIR/public"

CV_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
PORTFOLIO_SHA="unknown"
if [ -d "$ROOT_DIR/portfolio" ]; then
  if (cd "$ROOT_DIR/portfolio" >/dev/null 2>&1 && git rev-parse --short HEAD >/dev/null 2>&1); then
    PORTFOLIO_SHA="$(cd "$ROOT_DIR/portfolio" && git rev-parse --short HEAD)"
  fi
fi
BUILD_TIME_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Informacja diagnostyczna (żeby szybko sprawdzić, co jest na produkcji)
cat > "$OUT_DIR/build-info.json" <<EOF
{"cv":"$CV_SHA","portfolio":"$PORTFOLIO_SHA","builtAt":"$BUILD_TIME_UTC"}
EOF

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
  npm ci --include=dev 2>/dev/null || npm install --include=dev
  npx vite build --base=/portfolio/ --outDir "../public/portfolio"
  cd "$ROOT_DIR"

  # build-info także dla portfolio (łatwe sprawdzenie pod /portfolio/build-info.json)
  if (cd "$ROOT_DIR/portfolio" >/dev/null 2>&1 && git rev-parse --short HEAD >/dev/null 2>&1); then
    PORTFOLIO_SHA="$(cd "$ROOT_DIR/portfolio" && git rev-parse --short HEAD)"
  fi
  if [ -d "$OUT_DIR/portfolio" ]; then
    cat > "$OUT_DIR/portfolio/build-info.json" <<EOF
{"cv":"$CV_SHA","portfolio":"$PORTFOLIO_SHA","builtAt":"$BUILD_TIME_UTC"}
EOF
  fi
fi

echo "Vercel build OK (public/)."
