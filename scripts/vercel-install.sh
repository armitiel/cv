#!/bin/sh
# Na Vercel: submoduł portfolio (creative-showcase) jest prywatny.
# Ustaw w Vercel → Project → Settings → Environment Variables zmienną GITHUB_TOKEN
# (GitHub Personal Access Token z uprawnieniem repo).
set -e
if [ -n "$GITHUB_TOKEN" ]; then
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
fi
git submodule update --init --recursive
npm install
