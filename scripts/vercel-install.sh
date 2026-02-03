#!/bin/sh
# Na Vercel: submoduł portfolio (creative-showcase) jest prywatny.
# Ustaw w Vercel → Project → Settings → Environment Variables zmienną GITHUB_TOKEN
# (GitHub Personal Access Token z uprawnieniem repo).
set -e
if [ -n "$GITHUB_TOKEN" ]; then
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
fi

# Vercel potrafi odtworzyć cache z poprzedniego deployu.
# Jeśli katalog submodułu istnieje, ale nie jest poprawnie zainicjalizowany (brak .git),
# `git submodule update` próbuje klonować do niepustego katalogu i kończy się błędem.
if [ -d "portfolio" ] && [ ! -e "portfolio/.git" ]; then
  rm -rf "portfolio"
fi

# Wymuś czysty stan submodułu (bezpieczne także gdy jeszcze nie był inicjalizowany)
git submodule deinit -f -- portfolio >/dev/null 2>&1 || true
rm -rf ".git/modules/portfolio" >/dev/null 2>&1 || true
rm -rf "portfolio" >/dev/null 2>&1 || true

git submodule update --init --recursive
npm install
