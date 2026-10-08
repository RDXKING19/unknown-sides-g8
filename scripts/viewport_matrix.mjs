// scripts/viewport_matrix.mjs — Automated viewport responsiveness matrix validation
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const VIEWPORTS = [
  { name: 'Desktop Full HD', width: 1920, height: 1080 },
  { name: 'Laptop Widescreen', width: 1440, height: 900 },
  { name: 'Standard Laptop', width: 1366, height: 768 },
  { name: 'Compact Laptop', width: 1280, height: 720 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'iPad Air Portrait', width: 820, height: 1180 },
  { name: 'iPad Portrait', width: 768, height: 1024 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Android Compact', width: 360, height: 740 },
  { name: 'Phone Landscape', width: 844, height: 390 }
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function startServer(port = 4174) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath)) filePath = path.join(DIST_DIR, 'index.html');
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}

async function runMatrix() {
  console.log('--- STARTING SIDEQUEST VIEWPORT MATRIX VALIDATION ---');
  const server = await startServer(4174);

  const browser = await chromium.launch({ channel: 'msedge', headless: true })
    .catch(() => chromium.launch({ channel: 'chrome', headless: true }))
    .catch(() => chromium.launch({ headless: true }));

  let passedCount = 0;

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto('http://localhost:4174');
      await page.waitForLoadState('networkidle');

      // Check (c): document.documentElement.scrollWidth <= innerWidth (no horizontal scrollbar)
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });

      if (overflow > 1) {
        throw new Error(`Viewport ${vp.name} (${vp.width}x${vp.height}) has horizontal overflow of ${overflow}px`);
      }

      console.log(`✔ [${vp.name}] ${vp.width}x${vp.height} verified (0 horizontal overflow)`);
      passedCount++;
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n✔ SUCCESS: All ${passedCount} target viewports passed responsiveness matrix!`);
}

runMatrix().catch(err => {
  console.error('Viewport matrix test failed:', err);
  process.exit(1);
});
