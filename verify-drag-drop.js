const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  let success = false;

  try {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Create test data
    await page.evaluate(() => {
      const layout = { id: 'verify-layout', name: 'Verify Layout', grid_rows: 2, grid_cols: 2, seats: ['0-0', '0-1'], furniture: [] };
      const roster = { id: 'verify-roster', name: 'Verify Roster', students: ['Alice', 'Bob'] };
      window.StorageService.saveLayout(layout);
      window.StorageService.saveRoster(roster);
    });

    await page.evaluate(() => showPage('plan-editor'));
    await page.waitForTimeout(1000);

    await page.selectOption('#layout-select', 'verify-layout');
    await page.selectOption('#roster-select', 'verify-roster');

    await page.click('button:has-text("Generate Plan")');
    await page.waitForTimeout(2000);

    const cards = page.locator('.student-card.occupied');
    const count = await cards.count();

    if (count >= 2) {
      const card1 = cards.nth(0);
      const card2 = cards.nth(1);

      const name1 = await card1.locator('.student-name').textContent();
      const name2 = await card2.locator('.student-name').textContent();

      console.log('Before:', name1, 'and', name2);

      await card1.dragTo(card2);
      await page.waitForTimeout(1000);

      const newName1 = await card1.locator('.student-name').textContent();
      const newName2 = await card2.locator('.student-name').textContent();

      console.log('After:', newName1, 'and', newName2);

      if (name1 === newName2 && name2 === newName1) {
        console.log('✅ DRAG AND DROP WORKING!');
        success = true;
      } else {
        console.log('❌ Drag and drop failed');
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
    process.exit(success ? 0 : 1);
  }
})();