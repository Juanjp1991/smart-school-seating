const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  try {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Check what objects are available
    const debug = await page.evaluate(() => {
      return {
        hasApp: !!window.app,
        hasPlanEditor: !!window.planEditor,
        appMethods: window.app ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.app)) : null,
        storageService: !!window.StorageService
      };
    });

    console.log('Debug info:', debug);

    // Try to manually create and save data, then reload
    const result = await page.evaluate(() => {
      // Create test layout
      const testLayout = {
        id: 'test-layout-123',
        name: 'Manual Test Layout',
        grid_rows: 2,
        grid_cols: 2,
        seats: ['0-0', '0-1', '1-0', '1-1'],
        furniture: []
      };

      const testRoster = {
        id: 'test-roster-123',
        name: 'Manual Test Roster',
        students: ['Alice', 'Bob', 'Charlie']
      };

      // Use StorageService if available
      if (window.StorageService) {
        try {
          // Save using StorageService methods
          window.StorageService.saveLayout(testLayout);
          window.StorageService.saveRoster(testRoster);

          return {
            success: true,
            layouts: window.StorageService.getAllLayouts(),
            rosters: window.StorageService.getAllRosters()
          };
        } catch (e) {
          return { success: false, error: e.message };
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem('smartschool_layouts', JSON.stringify([testLayout]));
        localStorage.setItem('smartschool_rosters', JSON.stringify([testRoster]));
        return { success: true, method: 'localStorage' };
      }
    });

    console.log('Data creation result:', result);

    // Navigate to plan editor page
    await page.evaluate(() => showPage('plan-editor'));
    await page.waitForTimeout(2000);

    // Try to force repopulate
    await page.evaluate(() => {
      if (window.app && typeof window.app.populateLayoutSelect === 'function') {
        window.app.populateLayoutSelect();
      }
      if (window.app && typeof window.app.populateRosterSelect === 'function') {
        window.app.populateRosterSelect();
      }
    });

    await page.waitForTimeout(1000);

    // Check dropdown options now
    const layoutOptions = await page.locator('#layout-select option').count();
    const rosterOptions = await page.locator('#roster-select option').count();

    console.log('Final count - Layout options:', layoutOptions, 'Roster options:', rosterOptions);

    if (layoutOptions > 1 && rosterOptions > 1) {
      console.log('✅ Success! Data loaded properly');

      // Test the actual drag and drop
      await page.selectOption('#layout-select', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('#roster-select', { index: 1 });
      await page.waitForTimeout(500);

      await page.click('button:has-text("Generate Plan")');
      await page.waitForTimeout(3000);

      const studentCards = page.locator('.student-card.occupied');
      const count = await studentCards.count();

      if (count >= 2) {
        const card1 = studentCards.nth(0);
        const card2 = studentCards.nth(1);

        const name1 = await card1.locator('.student-name').textContent();
        const name2 = await card2.locator('.student-name').textContent();

        console.log(`Students: "${name1}" and "${name2}"`);
        console.log('Attempting drag and drop...');

        await card1.dragTo(card2);
        await page.waitForTimeout(2000);

        const newName1 = await card1.locator('.student-name').textContent();
        const newName2 = await card2.locator('.student-name').textContent();

        console.log(`After drag: "${newName1}" and "${newName2}"`);

        if (name1 === newName2 && name2 === newName1) {
          console.log('✅ DRAG AND DROP SUCCESSFUL!');
        } else {
          console.log('❌ Drag and drop failed');
        }
      }
    } else {
      console.log('❌ Data still not loaded properly');
    }

    await page.screenshot({ path: 'debug-final.png' });
    console.log('Keeping browser open for inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();