/**
 * fix-assets.js - Post-build script
 * 
 * After craco build, this script reads asset-manifest.json and replaces
 * any old/wrong CSS/JS references in ALL HTML files under build/.
 * This ensures SSG HTML files always reference the correct build assets.
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, 'build');
const MANIFEST_PATH = path.join(BUILD_DIR, 'asset-manifest.json');

function getAllHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'static') {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

try {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const correctCSS = manifest.files['main.css'];
  const correctJS = manifest.files['main.js'];

  if (!correctCSS || !correctJS) {
    console.log('[fix-assets] WARNING: main.css or main.js not found in manifest');
    process.exit(0);
  }

  console.log(`[fix-assets] Correct CSS: ${correctCSS}`);
  console.log(`[fix-assets] Correct JS: ${correctJS}`);

  const htmlFiles = getAllHtmlFiles(BUILD_DIR);
  let fixedCount = 0;

  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // Replace any wrong CSS hash references (with optional ?v=... cache buster)
    content = content.replace(
      /\/static\/css\/main\.[a-f0-9]+\.css(\?v=[^"'\s]*)?/g,
      correctCSS
    );

    // Replace any wrong JS hash references (with optional ?v=... cache buster)
    content = content.replace(
      /\/static\/js\/main\.[a-f0-9]+\.js(\?v=[^"'\s]*)?/g,
      correctJS
    );

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`[fix-assets] Fixed: ${path.relative(BUILD_DIR, file)}`);
    }
  }

  console.log(`[fix-assets] Done: ${fixedCount}/${htmlFiles.length} files updated`);
} catch (e) {
  console.error(`[fix-assets] Error: ${e.message}`);
  process.exit(0); // Don't fail the build
}
