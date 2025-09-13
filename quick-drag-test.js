const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Loading application...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Create test data directly via localStorage
    console.log('Creating test data via localStorage...');
    await page.evaluate(() => {
      // Create test layout
      const testLayout = {
        id: 'test-layout-1',
        name: 'Test Layout',
        grid_rows: 2,
        grid_cols: 3,
        seats: ['0-0', '0-1', '0-2', '1-0'],
        furniture: []
      };

      // Create test roster
      const testRoster = {
        id: 'test-roster-1',
        name: 'Test Roster',
        students: ['Alice', 'Bob', 'Charlie', 'Diana']
      };

      // Save to localStorage
      localStorage.setItem('smartschool_layouts', JSON.stringify([testLayout]));
      localStorage.setItem('smartschool_rosters', JSON.stringify([testRoster]));

      console.log('Test data saved to localStorage');
    });

    // Navigate to create seating plan
    console.log('Navigating to create seating plan...');
    await page.evaluate(() => showPage('create-plan-page'));
    await page.waitForTimeout(1000);

    // Select the test layout and roster
    console.log('Selecting layout and roster...');
    await page.selectOption('#layout-select', 'test-layout-1');
    await page.waitForTimeout(500);
    await page.selectOption('#roster-select', 'test-roster-1');
    await page.waitForTimeout(500);

    // Generate seating plan
    console.log('Generating seating plan...');
    await page.click('button:has-text("Generate Plan")');
    await page.waitForTimeout(3000);

    // Check the generated plan
    const studentCards = page.locator('.student-card.occupied');
    const count = await studentCards.count();
    console.log(`Found ${count} occupied seats`);

    if (count >= 2) {
      // Take a screenshot before testing
      await page.screenshot({ path: 'before-drag-test.png', fullPage: true });

      const firstCard = studentCards.nth(0);
      const secondCard = studentCards.nth(1);

      // Get student names before drag
      const firstName = await firstCard.locator('.student-name').textContent();
      const secondName = await secondCard.locator('.student-name').textContent();

      console.log(`BEFORE: Seat 1 = "${firstName}", Seat 2 = "${secondName}"`);

      // Check if draggable is set
      const isDraggable = await firstCard.getAttribute('draggable');
      console.log(`First card draggable attribute: ${isDraggable}`);

      // Get the bounding boxes
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      console.log('First card position:', firstBox);
      console.log('Second card position:', secondBox);

      // Test the drag events are properly set up
      const dragSetupTest = await page.evaluate(() => {
        const occupiedCards = document.querySelectorAll('.student-card.occupied');
        const results = [];

        for (let i = 0; i < occupiedCards.length; i++) {
          const card = occupiedCards[i];
          results.push({
            index: i,
            draggable: card.draggable,
            className: card.className,
            hasOnDragStart: typeof card.ondragstart,
            studentName: card.querySelector('.student-name')?.textContent || 'N/A'
          });
        }

        return results;
      });

      console.log('Drag setup test results:', dragSetupTest);

      // Now test actual drag and drop with Playwright
      console.log('Testing Playwright drag and drop...');

      try {
        // Use the dragTo method
        await firstCard.dragTo(secondCard);
        console.log('Playwright dragTo completed');

        // Wait for potential changes
        await page.waitForTimeout(2000);

        // Check results
        const newFirstName = await firstCard.locator('.student-name').textContent();
        const newSecondName = await secondCard.locator('.student-name').textContent();

        console.log(`AFTER PLAYWRIGHT: Seat 1 = "${newFirstName}", Seat 2 = "${newSecondName}"`);

        // Take screenshot after
        await page.screenshot({ path: 'after-playwright-drag.png', fullPage: true });

        // Check if it worked
        if (firstName === newSecondName && secondName === newFirstName) {
          console.log('✅ SUCCESS: Playwright drag and drop worked perfectly!');
        } else if (firstName !== newFirstName || secondName !== newSecondName) {
          console.log('🔄 PARTIAL: Some change occurred');
        } else {
          console.log('❌ FAILED: Playwright drag and drop did not work');

          // Try manual approach with mouse events
          console.log('Trying manual mouse drag...');

          // Reset to ensure we're testing fresh
          await page.reload();
          await page.waitForTimeout(2000);

          await page.evaluate(() => showPage('create-plan-page'));
          await page.waitForTimeout(1000);

          await page.selectOption('#layout-select', 'test-layout-1');
          await page.waitForTimeout(500);
          await page.selectOption('#roster-select', 'test-roster-1');
          await page.waitForTimeout(500);

          await page.click('button:has-text("Generate Plan")');
          await page.waitForTimeout(3000);

          const freshCards = page.locator('.student-card.occupied');
          const freshFirst = freshCards.nth(0);
          const freshSecond = freshCards.nth(1);

          const freshFirstName = await freshFirst.locator('.student-name').textContent();
          const freshSecondName = await freshSecond.locator('.student-name').textContent();

          console.log(`FRESH START: Seat 1 = "${freshFirstName}", Seat 2 = "${freshSecondName}"`);

          // Get fresh bounding boxes
          const freshFirstBox = await freshFirst.boundingBox();
          const freshSecondBox = await freshSecond.boundingBox();

          // Manual mouse drag
          await page.mouse.move(freshFirstBox.x + freshFirstBox.width/2, freshFirstBox.y + freshFirstBox.height/2);
          await page.mouse.down();
          await page.waitForTimeout(100);
          await page.mouse.move(freshSecondBox.x + freshSecondBox.width/2, freshSecondBox.y + freshSecondBox.height/2, { steps: 10 });
          await page.waitForTimeout(500);
          await page.mouse.up();

          await page.waitForTimeout(2000);

          const manualFirstName = await freshFirst.locator('.student-name').textContent();
          const manualSecondName = await freshSecond.locator('.student-name').textContent();

          console.log(`AFTER MANUAL: Seat 1 = "${manualFirstName}", Seat 2 = "${manualSecondName}"`);

          await page.screenshot({ path: 'after-manual-drag.png', fullPage: true });

          if (freshFirstName === manualSecondName && freshSecondName === manualFirstName) {
            console.log('✅ SUCCESS: Manual mouse drag worked!');
          } else {
            console.log('❌ FAILED: Manual mouse drag also failed');

            // Let's inspect what actually happened in the JavaScript
            const debugInfo = await page.evaluate(() => {
              // Check if planEditor exists and has dragData
              if (window.planEditor) {
                return {
                  hasPlanEditor: true,
                  dragData: window.planEditor.dragData || null,
                  assignments: Object.fromEntries(window.planEditor.assignments || new Map())
                };
              } else {
                return { hasPlanEditor: false };
              }
            });

            console.log('Debug info:', debugInfo);
          }
        }

      } catch (error) {
        console.log('❌ Playwright drag error:', error.message);
      }

    } else {
      console.log('❌ Not enough student cards found');
    }

    console.log('Keeping browser open for manual inspection (15 seconds)...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();