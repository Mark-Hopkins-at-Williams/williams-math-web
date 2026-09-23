import { chromium } from 'playwright';
const browser = await chromium.launch();

for (const [w, tag] of [[390,'mobile'], [700,'desktop']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 3 });
  await page.goto('http://localhost:5173/colloquium/', { waitUntil: 'networkidle' });
  const card = page.locator('.soft-card').filter({ hasText: 'Research Edition' });
  const img = card.locator('img');
  await img.scrollIntoViewIfNeeded();
  const box = await img.boundingBox();
  console.log(tag, 'img box:', box);
  await img.screenshot({ path: `/tmp/research-edition-${tag}-imgonly.png` });
  await page.close();
}
await browser.close();
