const { chromium } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log(`[console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (error) => console.error('[pageerror]', error.stack || error.message));

  await page.goto('http://127.0.0.1:3000/phones', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await browser.close();
}

run().catch((error) => {
  console.error('[debug-phones]', error);
  process.exit(1);
});
