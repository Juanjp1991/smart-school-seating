const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  try {
    console.log('🚀 Final drag and drop test starting...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Create test data
    await page.evaluate(() => {
      const testLayout = {
        id: 'final-test-layout',
        name: 'Final Test Layout',
        grid_rows: 2,
        grid_cols: 2,
        seats: ['0-0', '0-1', '1-0', '1-1'],
        furniture: []
      };

      const testRoster = {
        id: 'final-test-roster',
        name: 'Final Test Roster',
        students: ['Alice', 'Bob', 'Charlie', 'Diana']
      };

      window.StorageService.saveLayout(testLayout);
      window.StorageService.saveRoster(testRoster);
    });

    // Navigate to plan editor (correct page ID)
    await page.evaluate(() => showPage('plan-editor'));
    await page.waitForTimeout(2000);

    // Select the test data
    await page.selectOption('#layout-select', 'final-test-layout');
    await page.waitForTimeout(500);
    await page.selectOption('#roster-select', 'final-test-roster');
    await page.waitForTimeout(500);

    // Generate seating plan
    console.log('📝 Generating seating plan...');
    await page.click('button:has-text("Generate Plan")');
    await page.waitForTimeout(3000);

    // Get student cards
    const studentCards = page.locator('.student-card.occupied');
    const count = await studentCards.count();
    console.log(`👥 Found ${count} students in seating plan`);

    if (count >= 2) {
      const card1 = studentCards.nth(0);
      const card2 = studentCards.nth(1);

      // Get initial names
      const name1Before = await card1.locator('.student-name').textContent();
      const name2Before = await card2.locator('.student-name').textContent();

      console.log(`📍 BEFORE: Position 1 = "${name1Before}", Position 2 = "${name2Before}"`);

      // Perform drag and drop
      console.log('🔄 Performing drag and drop...');
      await card1.dragTo(card2);
      await page.waitForTimeout(2000);

      // Check results
      const name1After = await card1.locator('.student-name').textContent();
      const name2After = await card2.locator('.student-name').textContent();

      console.log(`📍 AFTER:  Position 1 = "${name1After}", Position 2 = "${name2After}"`);

      // Determine result
      if (name1Before === name2After && name2Before === name1After) {
        console.log('✅ SUCCESS: Drag and drop worked perfectly! Students swapped places.');
      } else if (name1Before !== name1After || name2Before !== name2After) {
        console.log('🟡 PARTIAL: Some change detected, but not a perfect swap.');
      } else {
        console.log('❌ FAILED: No change detected after drag and drop.');
      }

      await page.screenshot({ path: 'final-drag-test-result.png', fullPage: true });
      console.log('📸 Screenshot saved as final-drag-test-result.png');

    } else {
      console.log('❌ Not enough students to test drag and drop');
    }

    console.log('✨ Test complete!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
})();