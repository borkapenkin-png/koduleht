const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const BUILD_DIR = path.join(__dirname, 'build');
const BACKEND_URL = 'http://localhost:8001';

// Known HTML page slugs that should be server-rendered
const SSR_PATHS = new Set(['/', '/referenssit', '/ukk', '/hintalaskuri']);

function isPageRequest(reqPath) {
  // Root or known pages
  if (SSR_PATHS.has(reqPath)) return true;
  // Service pages (contain only slug chars, no dots for file extensions)
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
          reject(new Error(`SSR returned ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Static assets (JS, CSS, images, fonts) - serve from build with cache
app.use('/static', express.static(path.join(BUILD_DIR, 'static'), { maxAge: '1y' }));
app.use('/images', express.static(path.join(BUILD_DIR, 'images'), { maxAge: '1d' }));
app.use('/manifest.json', express.static(path.join(BUILD_DIR, 'manifest.json')));
app.use('/favicon.ico', express.static(path.join(BUILD_DIR, 'favicon.ico')));
app.use('/robots.txt', express.static(path.join(BUILD_DIR, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(BUILD_DIR, 'sitemap.xml')));

// Admin panel - always serve CRA index.html (SPA)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

// HTML pages - try SSR from backend, fall back to static file
app.get('*', async (req, res) => {
  const reqPath = req.path;
  
  if (isPageRequest(reqPath)) {
    try {
      const html = await fetchSSR(reqPath);
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);
      return;
    } catch (err) {
      // SSR failed - fall back to static file
      console.log(`SSR fallback for ${reqPath}: ${err.message}`);
    }
  }
  
  // Fallback: serve static file from build
  const staticPath = path.join(BUILD_DIR, reqPath, 'index.html');
  const altPath = path.join(BUILD_DIR, reqPath + '.html');
  const fs = require('fs');
  
  if (fs.existsSync(staticPath)) {
    res.sendFile(staticPath);
  } else if (fs.existsSync(altPath)) {
    res.sendFile(altPath);
  } else {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT} (SSR-enabled)`);
});
