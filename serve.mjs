import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.PORT) || 3001;
const ROOT = resolve(new URL('.', import.meta.url).pathname);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.json': 'application/json',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm'
};

createServer(async (req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = normalize(join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.statusCode = 403; return res.end('forbidden'); }

  try {
    const s = await stat(filePath);
    const target = s.isDirectory() ? join(filePath, 'index.html') : filePath;
    const data = await readFile(target);
    const ext = extname(target).toLowerCase();
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    // Don't cache HTML/JS/CSS so edits show up immediately, but DO cache heavy assets
    const isAsset = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.woff', '.woff2', '.ttf'].includes(ext);
    res.setHeader('Cache-Control', isAsset ? 'public, max-age=3600' : 'no-store');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>404</h1>');
  }
}).listen(PORT, () => console.log(`▶ http://localhost:${PORT}`));
