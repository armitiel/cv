#!/usr/bin/env node
/**
 * Jeden lokalny serwer dla OBU stron — odwzorowuje routing produkcyjny (Vercel):
 *
 *   /            -> cv.html                 (CV)
 *   /portfolio/  -> portfolio-v2/index.html (Portfolio)
 *   /portfolio/* -> najpierw portfolio-v2/*, potem assety z portfolio/public/*
 *   reszta       -> pliki z katalogu głównego (images/, assets/, css/, js/, favikony…)
 *
 * Dzięki temu lokalnie ścieżki są identyczne jak na produkcji, więc obrazki,
 * fonty i linki działają tak samo — bez budowania (zmiany widać po odświeżeniu).
 *
 * Użycie:  npm run dev      (albo: node scripts/dev-server.js)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8'
};

const isFile = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };

/** Mapuje URL na plik na dysku, tak jak robi to build produkcyjny. */
function resolveFile(rawUrl) {
  let urlPath;
  try { urlPath = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]); }
  catch { urlPath = rawUrl.split('?')[0]; }

  // blokada wyjścia poza repo
  if (urlPath.includes('..')) return null;

  // Strona główna = CV
  if (urlPath === '/' || urlPath === '/index.html') return path.join(ROOT, 'cv.html');

  // Portfolio pod /portfolio/ (jak na produkcji)
  if (urlPath === '/portfolio' || urlPath === '/portfolio/') {
    return path.join(ROOT, 'portfolio-v2', 'index.html');
  }
  if (urlPath.startsWith('/portfolio/')) {
    const rest = urlPath.slice('/portfolio/'.length);
    const inV2 = path.join(ROOT, 'portfolio-v2', rest);
    if (isFile(inV2)) return inV2;                                  // strony i pliki portfolio-v2
    const inAssets = path.join(ROOT, 'portfolio', 'public', rest);  // assety: projects/, illustrations/, fonts/
    if (isFile(inAssets)) return inAssets;
    return path.join(ROOT, 'portfolio-v2', 'index.html');           // fallback
  }

  // Reszta: katalog główny repo (images/, assets/, css/, js/, favikony, cv.html…)
  return path.join(ROOT, urlPath.replace(/^\/+/, ''));
}

http.createServer((req, res) => {
  const file = resolveFile(req.url);

  if (!file || !isFile(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 — nie znaleziono: ' + req.url);
  }

  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const stat = fs.statSync(file);
  const range = req.headers.range;

  // Range (potrzebne dla wideo mp4)
  if (range && /^bytes=/.test(range)) {
    const [s, e] = range.replace(/^bytes=/, '').split('-');
    const start = parseInt(s, 10) || 0;
    const end = e ? Math.min(parseInt(e, 10), stat.size - 1) : stat.size - 1;
    if (start >= stat.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Cache-Control': 'no-cache'
    });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }

  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`
  Jeden serwer dla obu stron (routing jak na produkcji):

    CV:        http://localhost:${PORT}/
    Portfolio: http://localhost:${PORT}/portfolio/
    HubbleRx:  http://localhost:${PORT}/portfolio/hubble.html

  Ctrl+C aby zatrzymać.
`);
});
