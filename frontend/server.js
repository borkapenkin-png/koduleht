const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BUILD_DIR = path.join(__dirname, 'build');
const BACKEND_URL = 'http://localhost:8001';
const PORT = 3000;

// Known page paths that need SSR
const SSR_PATHS = new Set(['/', '/referenssit', '/ukk', '/hintalaskuri']);

// MIME types for static files
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
      return false;
    }
    // Cache static assets (JS/CSS/images) for 1 year, HTML never
    if (ext === '.html') {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
    } else {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000',
      });
    }
    res.end(data);
    return true;
  });
  return true;
}

function sendSPAFallback(res) {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  fs.readFile(indexPath, 'utf-8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let reqPath = parsedUrl.pathname;

  // Diagnostic endpoint - helps verify which server is running
  if (reqPath === '/__server-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'node-ssr-server',
      time: new Date().toISOString(),
      build_exists: fs.existsSync(BUILD_DIR),
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

  // Page requests - try SSR from backend
  if (isPageRequest(reqPath)) {
    try {
      const html = await fetchSSR(reqPath);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'CDN-Cache-Control': 'no-store',
        'Surrogate-Control': 'no-store',
      });
      res.end(html);
      return;
    } catch (err) {
      console.error(`SSR failed for ${reqPath}: ${err.message}`);
    }
  }

  // Fallback: check build directory for static HTML
  const staticHtml = path.join(BUILD_DIR, reqPath, 'index.html');
  const altHtml = path.join(BUILD_DIR, reqPath + '.html');

  if (fs.existsSync(staticHtml)) {
    serveStaticFile(staticHtml, res);
  } else if (fs.existsSync(altHtml)) {
    serveStaticFile(altHtml, res);
  } else {
    // Final fallback: SPA shell
    sendSPAFallback(res);
  }
});

// On startup: wait for backend, then refresh SSG pages (NOT index.html — CRA fallback must stay intact)
function refreshBuildFiles() {
  const pages = [
    { path: '/referenssit', file: 'referenssit/index.html' },
    { path: '/ukk', file: 'ukk/index.html' },
  ];

  let attempts = 0;
  const maxAttempts = 12;

  function tryRefresh() {
    attempts++;
    console.log(`[SSG-refresh] Attempt ${attempts}/${maxAttempts} - fetching SSR pages from backend...`);

    let completed = 0;
    let failed = 0;

    pages.forEach(({ path: pagePath, file }) => {
      fetchSSR(pagePath)
        .then((html) => {
          const filePath = path.join(BUILD_DIR, file);
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, html, 'utf-8');
          console.log(`[SSG-refresh] Updated build/${file}`);
          completed++;
        })
        .catch((err) => {
          failed++;
          console.log(`[SSG-refresh] Failed ${pagePath}: ${err.message}`);
        })
        .finally(() => {
          if (completed + failed === pages.length) {
            if (failed > 0 && attempts < maxAttempts) {
              console.log(`[SSG-refresh] ${failed} pages failed, retrying in 10s...`);
              setTimeout(tryRefresh, 10000);
            } else {
              console.log(`[SSG-refresh] Done: ${completed} updated, ${failed} failed`);
            }
          }
        });
    });
  }

  // Wait 5 seconds for backend to start
  setTimeout(tryRefresh, 5000);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend SSR server running on port ${PORT} (no-express, pure Node.js)`);
  refreshBuildFiles();
});
