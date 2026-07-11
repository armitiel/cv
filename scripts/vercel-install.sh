#!/bin/sh
set -e

# Brak submodulow. Portfolio wraz z assetami (projects/, illustrations/, fonts/)
# zyje bezposrednio w tym repo, w katalogu portfolio-v2/.
# Deploy nie potrzebuje juz GITHUB_TOKEN ani klonowania repo creative-showcase.

npm install
