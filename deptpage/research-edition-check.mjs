import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:5173/colloquium/', { waitUntil: 'networkidle' });
const card = page.locator('.soft-card').filter({ hasText: 'What I Did Last Summer (Research Edition)' });
await card.scrollIntoViewIfNeeded();
await card.screenshot({ path: '/tmp/research-edition-desktop.png' });

const page2 = await browser.newPage({ viewport: { width: 390, height: 1000 }, deviceScaleFactor: 2 });
await page2.goto('http://localhost:5173/colloquium/', { waitUntil: 'networkidle' });
const card2 = page2.locator('.soft-card').filter({ hasText: 'What I Did Last Summer (Research Edition)' });
await card2.scrollIntoViewIfNeeded();
await card2.screenshot({ path: '/tmp/research-edition-mobile.png' });
await browser.close();
