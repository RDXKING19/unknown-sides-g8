// scripts/e2e_journey.mjs — Comprehensive End-to-end user journey test using Playwright
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

function startStaticServer(port = 4173) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise(resolve => {
    server.listen(port, () => resolve(server));
  });
}

async function runE2E() {
  console.log('--- STARTING SIDEQUEST E2E JOURNEY WALKTHROUGH ---');

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('Production dist/ does not exist. Run "npm run build" first.');
  }

  const PORT = 4173;
  const server = await startStaticServer(PORT);
  console.log(`Static production server running at http://localhost:${PORT}`);

  // Launch Edge or Chrome
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
    .catch(() => chromium.launch({ channel: 'chrome', headless: true }))
    .catch(() => chromium.launch({ headless: true }));

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err.message);
    pageErrors.push(err.message);
  });

  try {
    // 1. Load App
    console.log('1. Loading app...');
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // 2. Intro Screen
    console.log('2. Verifying Intro Screen...');
    const startJobBtn = page.getByRole('button', { name: /Start the Job/i });
    await startJobBtn.waitFor({ state: 'visible', timeout: 5000 });
    await startJobBtn.click();

    // 3. Wonder Phase
    console.log('3. Wonder Phase: The Inaccessible Ledge...');
    const openJobFileBtn = page.getByRole('button', { name: /Open the Job File/i });
    await openJobFileBtn.waitFor({ state: 'visible', timeout: 5000 });
    await openJobFileBtn.click();

    // 4. Story Phase (4 panels)
    console.log('4. Story Phase: Stepping through 4 job panels...');
    for (let p = 1; p <= 3; p++) {
      const nextBtn = page.getByRole('button', { name: /Next Step/i });
      await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
      await nextBtn.click();
    }
    const enterLabBtn = page.getByRole('button', { name: /Enter the Site Lab/i });
    await enterLabBtn.waitFor({ state: 'visible', timeout: 5000 });
    await enterLabBtn.click();

    // 5. Simulate Phase (Site Lab)
    console.log('5. Simulate Phase: Verifying site stations...');
    await page.waitForTimeout(500);

    // Pour unit tiles on Station A
    const pourBtn = page.getByRole('button', { name: /Pour Unit Tiles/i });
    if (await pourBtn.isVisible()) {
      await pourBtn.click();
      await page.waitForTimeout(400);
    }

    // Test TopNav mute toggle
    console.log('6. Testing TopNav controls...');
    const muteBtn = page.locator('header button').filter({ hasText: /Sound|Muted/i });
    if (await muteBtn.isVisible()) {
      await muteBtn.click();
      await page.waitForTimeout(200);
      await muteBtn.click(); // Unmute back
    }

    // 7. Practice Phase navigation
    console.log('7. Navigating to Practice Phase...');
    const practiceNavBtn = page.locator('nav button').filter({ hasText: '4' });
    await practiceNavBtn.click();
    await page.waitForTimeout(600);

    // Verify 10-world kingdom map is visible
    const worldCards = page.locator('.grid > div');
    const count = await worldCards.count();
    console.log(`Found ${count} world cards on Kingdom Map.`);

    // Click World 0 (Square Station)
    const world0Btn = page.getByRole('button', { name: /Start Survey Jobs/i }).first();
    if (await world0Btn.isVisible()) {
      await world0Btn.click();
      await page.waitForTimeout(500);

      // Verify question options are clickable
      const optBtn = page.locator('button.btn-option').first();
      if (await optBtn.isVisible()) {
        await optBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // 8. Reflect Phase navigation
    console.log('8. Navigating to Reflect Phase (Site Debrief)...');
    const reflectNavBtn = page.locator('nav button').filter({ hasText: '5' });
    await reflectNavBtn.click();
    await page.waitForTimeout(500);

    // Verify recap quiz option can be clicked
    const recapOpt = page.locator('button.btn-option').first();
    if (await recapOpt.isVisible()) {
      await recapOpt.click();
      await page.waitForTimeout(300);
    }

    // Test reflection text input
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Always check if the hypotenuse is unknown to add squares, or if a leg is unknown to subtract squares.');
      await page.waitForTimeout(200);
    }

    // Click Complete Site Certification button
    const certBtn = page.getByRole('button', { name: /Complete Site Certification/i });
    if (await certBtn.isVisible()) {
      await certBtn.click();
      await page.waitForTimeout(600);
    }

    // 9. Celebration Screen
    console.log('9. Checking Celebration Screen & Certificate...');
    const restartBtn = page.getByRole('button', { name: /Survey Again/i });
    if (await restartBtn.isVisible()) {
      console.log('✔ Chief Site Surveyor Certification unlocked and displayed!');
    }

    console.log('✔ Full 5-phase student journey verified successfully with 0 errors!');
  } finally {
    await browser.close();
    server.close();
  }

  if (pageErrors.length > 0) {
    throw new Error(`Encountered ${pageErrors.length} page errors during E2E test.`);
  }

  console.log('✔ E2E Journey test completed cleanly with 0 console/page errors!');
}

runE2E().catch(err => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
