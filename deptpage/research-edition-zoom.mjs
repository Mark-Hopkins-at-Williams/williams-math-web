import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, deviceScaleFactor: 3 });
await page.goto('http://localhost:5173/colloquium/', { waitUntil: 'networkidle' });
const img = page.locator('img[alt="Photo of CS Students"]').nth(1); // Oct 2 event (2nd "CS Students" event)
await img.scrollIntoViewIfNeeded();
const box = await img.boundingBox();
console.log('mobile img box:', box);
await img.screenshot({ path: '/tmp/research-edition-mobile-imgonly.png' });
await browser.close();
