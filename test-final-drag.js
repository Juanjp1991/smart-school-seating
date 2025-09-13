const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  try {
    console.log('Testing final drag and drop implementation...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Inject test data
    await page.evaluate(() => {
      const layout = {
        id: 'test-1',
        name: 'Test Layout',
        grid_rows: 2,
        grid_cols: 2,
        seats: ['0-0', '0-1', '1-0', '1-1'],
        furniture: []
      };

      const roster = {
        id: 'roster-1',
        name: 'Test Roster',
        students: ['Alice', 'Bob', 'Charlie', 'Diana']
      };

      localStorage.setItem('smartschool_layouts', JSON.stringify([layout]));
      localStorage.setItem('smartschool_rosters', JSON.stringify([roster]));
    });

    // Navigate to plan editor
    await page.evaluate(() => showPage('create-plan-page'));
    await page.waitForTimeout(1000);

    // Force reload of dropdowns by calling the app's populate methods
    await page.evaluate(() => {
      if (window.app) {
        window.app.populateLayoutSelect();
        window.app.populateRosterSelect();
      }
    });
    await page.waitForTimeout(1000);

    // Check if dropdowns are populated
    const layoutOptions = await page.locator('#layout-select option').count();
    const rosterOptions = await page.locator('#roster-select option').count();

    console.log('Layout options:', layoutOptions);
    console.log('Roster options:', rosterOptions);

    if (layoutOptions > 1 && rosterOptions > 1) {
      await page.selectOption('#layout-select', 'test-1');
      await page.waitForTimeout(500);
      await page.selectOption('#roster-select', 'roster-1');
      await page.waitForTimeout(500);

      console.log('Generating seating plan...');
      await page.click('button:has-text("Generate Plan")');
      await page.waitForTimeout(3000);

      // Check for students
      const studentCards = page.locator('.student-card.occupied');
      const count = await studentCards.count();
      console.log('Student cards found:', count);

      if (count >= 2) {
        // Test drag and drop
        const card1 = studentCards.nth(0);
        const card2 = studentCards.nth(1);

        const name1Before = await card1.locator('.student-name').textContent();
        const name2Before = await card2.locator('.student-name').textContent();

        console.log(`BEFORE: Card 1 = "${name1Before}", Card 2 = "${name2Before}"`);

        // Check draggable state
        const isDraggable = await card1.getAttribute('draggable');
        console.log('Card 1 draggable:', isDraggable);

        // Do the drag and drop
        console.log('Performing drag and drop...');
        await card1.dragTo(card2);
        await page.waitForTimeout(2000);

        const name1After = await card1.locator('.student-name').textContent();
        const name2After = await card2.locator('.student-name').textContent();

        console.log(`AFTER: Card 1 = "${name1After}", Card 2 = "${name2After}"`);

        if (name1Before === name2After && name2Before === name1After) {
          console.log('✅ SUCCESS: Drag and drop worked perfectly!');
        } else if (name1Before !== name1After || name2Before !== name2After) {
          console.log('🔄 PARTIAL: Some change detected');
        } else {
          console.log('❌ FAILED: No change detected');
        }

        await page.screenshot({ path: 'final-test-result.png', fullPage: true });
      } else {
        console.log('❌ Not enough student cards');
      }
    } else {
      console.log('❌ Not enough dropdown options');
    }

    console.log('Test complete. Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'test-error-final.png' });
  } finally {
    await browser.close();
  }
})();