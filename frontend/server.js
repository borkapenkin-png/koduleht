const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BUILD_DIR = path.join(__dirname, 'build');
const BACKEND_URL = 'http://localhost:8001';
const PORT = 3000;
const MANIFEST_PATH = path.join(BUILD_DIR, 'asset-manifest.json');

// Correct CSS/JS paths from asset-manifest.json (always reflects the current build)
let CORRECT_CSS = '';
let CORRECT_JS = '';

function loadManifest() {
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const files = manifest.files || {};
    CORRECT_CSS = files['main.css'] || '';
    CORRECT_JS = files['main.js'] || '';
    console.log(`[manifest] CSS: ${CORRECT_CSS}, JS: ${CORRECT_JS}`);
  } catch (e) {
    console.error(`[manifest] Failed to read: ${e.message}`);
  }
}

// Load on startup and watch for changes
loadManifest();
fs.watchFile(MANIFEST_PATH, { interval: 5000 }, () => {
  console.log('[manifest] asset-manifest.json changed, reloading...');
  loadManifest();
});

/**
 * Fix CSS/JS references in HTML to match the current build.
 * This ensures that even if SSG HTML was generated with old hashes,
 * the browser always gets the correct CSS/JS paths.
 */
function fixAssetPaths(html) {
  if (!CORRECT_CSS && !CORRECT_JS) return html;
  let fixed = html;
  // Fix CSS: replace any /static/css/main.HASH.css (with optional ?v=...) with the correct path
  if (CORRECT_CSS) {
    fixed = fixed.replace(
      /\/static\/css\/main\.[a-f0-9]+\.css(\?v=[^"'\s]*)?/g,
      CORRECT_CSS
    );
  }
  // Fix JS: replace any /static/js/main.HASH.js (with optional ?v=...) with the correct path
  if (CORRECT_JS) {
    fixed = fixed.replace(
      /\/static\/js\/main\.[a-f0-9]+\.js(\?v=[^"'\s]*)?/g,
      CORRECT_JS
    );
  }
  return fixed;
}

// Known page paths that need SSR
const SSR_PATHS = new Set(['/', '/referenssit', '/ukk', '/hintalaskuri']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.map': 'application/json',
};

function isPageRequest(reqPath) {
  if (SSR_PATHS.has(reqPath)) return true;
  if (reqPath.match(/^\/[a-z0-9-]+$/) && !reqPath.includes('.')) return true;
  return false;
}

function fetchSSR(pagePath) {
  return new Promise((resolve, reject) => {
    const ssrPath = pagePath === '/' ? '/api/ssr/home' : `/api/ssr${pagePath}`;
    const req = http.get(`${BACKEND_URL}${ssrPath}`, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 500) {
          resolve(data);
        } else {
          reject(new Error(`SSR status ${res.statusCode}, len ${data.length}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    if (ext === '.html') {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(data);
    } else {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000',
      });
      res.end(data);
    }
  });
}

function sendHtml(res, html) {
  const fixed = fixAssetPaths(html);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'CDN-Cache-Control': 'no-store',
    'Surrogate-Control': 'no-store',
  });
  res.end(fixed);
}

function sendSPAFallback(res) {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  fs.readFile(indexPath, 'utf-8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }
    sendHtml(res, data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let reqPath = parsedUrl.pathname;

  // Diagnostic endpoint
  if (reqPath === '/__server-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'node-ssr-server-v2',
      time: new Date().toISOString(),
      build_exists: fs.existsSync(BUILD_DIR),
      correct_css: CORRECT_CSS,
      correct_js: CORRECT_JS,
    }));
    return;
  }

  // Static files (JS, CSS, images, fonts, etc.)
  if (reqPath.startsWith('/static/') || reqPath.startsWith('/images/')) {
    const filePath = path.join(BUILD_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      serveStaticFile(filePath, res);
      return;
    }
    // Return 404 for missing static assets - NEVER fall through to SPA
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // Known static files at root
  const rootStatics = ['/manifest.json', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/logo192.png', '/logo512.png'];
  if (rootStatics.includes(reqPath) || reqPath.endsWith('.map')) {
    const filePath = path.join(BUILD_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      serveStaticFile(filePath, res);
      return;
    }
  }

  // Admin panel & login - always serve SPA
  if (reqPath === '/admin' || reqPath.startsWith('/admin/') || reqPath === '/login') {
    sendSPAFallback(res);
    return;
  }

  // Page requests - try SSR from backend, then static HTML, then SPA fallback
  if (isPageRequest(reqPath)) {
    // 1. Try live SSR from backend
    try {
      const html = await fetchSSR(reqPath);
      sendHtml(res, html);
      return;
    } catch (err) {
      console.error(`SSR failed for ${reqPath}: ${err.message}`);
    }

    // 2. Try static SSG HTML files (fix asset paths before serving)
    const staticHtml = path.join(BUILD_DIR, reqPath, 'index.html');
    const altHtml = path.join(BUILD_DIR, reqPath + '.html');
    const ssgFile = fs.existsSync(staticHtml) ? staticHtml : fs.existsSync(altHtml) ? altHtml : null;

    if (ssgFile) {
      try {
        const html = fs.readFileSync(ssgFile, 'utf-8');
        sendHtml(res, html);
        return;
      } catch (e) {
        console.error(`Static HTML read failed for ${ssgFile}: ${e.message}`);
      }
    }

    // 3. Final fallback: SPA shell
    sendSPAFallback(res);
    return;
  }

  // Non-page requests fallback
  const staticHtml = path.join(BUILD_DIR, reqPath, 'index.html');
  const altHtml = path.join(BUILD_DIR, reqPath + '.html');

  if (fs.existsSync(staticHtml)) {
    const html = fs.readFileSync(staticHtml, 'utf-8');
    sendHtml(res, html);
  } else if (fs.existsSync(altHtml)) {
    const html = fs.readFileSync(altHtml, 'utf-8');
    sendHtml(res, html);
  } else {
    sendSPAFallback(res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend SSR server v2 running on port ${PORT}`);
  console.log(`Assets: CSS=${CORRECT_CSS}, JS=${CORRECT_JS}`);
});
