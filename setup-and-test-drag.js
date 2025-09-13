const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Setting up test data and testing drag-drop...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // First, create a layout
    console.log('Creating test layout...');
    await page.evaluate(() => showPage('layout-editor-page'));
    await page.waitForTimeout(1000);

    await page.fill('#layout-name', 'Test Layout');
    await page.fill('#grid-rows', '2');
    await page.fill('#grid-cols', '3');
    await page.click('button:has-text("Create Layout")');
    await page.waitForTimeout(1000);

    // Add some seats by clicking grid cells
    console.log('Adding seats to layout...');
    const gridCells = page.locator('.grid-cell');
    await gridCells.nth(0).click(); // (0,0)
    await gridCells.nth(1).click(); // (0,1)
    await gridCells.nth(2).click(); // (0,2)
    await gridCells.nth(3).click(); // (1,0)

    await page.click('button:has-text("Save Layout")');
    await page.waitForTimeout(1000);

    console.log('Layout created successfully');

    // Now create a roster
    console.log('Creating test roster...');
    await page.evaluate(() => showPage('roster-manager-page'));
    await page.waitForTimeout(1000);

    await page.fill('#roster-name', 'Test Roster');
    await page.click('button:has-text("Create Roster")');
    await page.waitForTimeout(500);

    // Add students
    const students = ['Alice', 'Bob', 'Charlie', 'Diana'];
    for (const student of students) {
      await page.fill('#student-name', student);
      await page.click('button:has-text("Add Student")');
      await page.waitForTimeout(300);
    }

    await page.click('button:has-text("Save Roster")');
    await page.waitForTimeout(1000);

    console.log('Roster created successfully');

    // Now go to create seating plan
    console.log('Creating seating plan...');
    await page.evaluate(() => showPage('create-plan-page'));
    await page.waitForTimeout(1000);

    // Select layout and roster
    await page.selectOption('#layout-select', { index: 1 });
    await page.waitForTimeout(500);
    await page.selectOption('#roster-select', { index: 1 });
    await page.waitForTimeout(500);

    // Generate plan
    await page.click('button:has-text("Generate Plan")');
    await page.waitForTimeout(3000);

    console.log('Seating plan generated');

    // Now test drag and drop
    const studentCards = page.locator('.student-card.occupied');
    const count = await studentCards.count();
    console.log('Found', count, 'occupied seats');

    if (count >= 2) {
      const firstCard = studentCards.nth(0);
      const secondCard = studentCards.nth(1);

      // Get initial student names
      const firstName = await firstCard.locator('.student-name').textContent();
      const secondName = await secondCard.locator('.student-name').textContent();

      console.log('Before drag: First seat =', firstName, ', Second seat =', secondName);

      // Check draggable attribute
      const isDraggable = await firstCard.getAttribute('draggable');
      console.log('First card draggable attribute:', isDraggable);

      // Get mouse position for first card
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      console.log('First card position:', firstBox);
      console.log('Second card position:', secondBox);

      // Test if drag events are working by evaluating in browser
      const dragTestResult = await page.evaluate(() => {
        const cards = document.querySelectorAll('.student-card.occupied');
        if (cards.length >= 2) {
          const firstCard = cards[0];

          console.log('Testing drag event setup...');
          console.log('Card draggable:', firstCard.draggable);
          console.log('Card class:', firstCard.className);

          // Create and dispatch a dragstart event manually
          const dragEvent = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
          });

          console.log('Dispatching manual dragstart event...');
          const result = firstCard.dispatchEvent(dragEvent);
          console.log('Manual dragstart result:', result);

          return {
            draggable: firstCard.draggable,
            className: firstCard.className,
            eventFired: result
          };
        }
        return { error: 'Not enough cards' };
      });

      console.log('Manual drag test result:', dragTestResult);

      // Try Playwright drag and drop
      console.log('Attempting Playwright dragTo...');
      try {
        await firstCard.dragTo(secondCard);
        console.log('Playwright dragTo completed');

        await page.waitForTimeout(2000);

        // Check results
        const newFirstName = await firstCard.locator('.student-name').textContent();
        const newSecondName = await secondCard.locator('.student-name').textContent();

        console.log('After drag: First seat =', newFirstName, ', Second seat =', newSecondName);

        if (firstName === newSecondName && secondName === newFirstName) {
          console.log('✅ SUCCESS: Drag and drop worked! Students swapped.');
        } else if (firstName !== newFirstName || secondName !== newSecondName) {
          console.log('🔄 PARTIAL: Something changed, but not a perfect swap.');
        } else {
          console.log('❌ FAILED: No change detected after drag and drop.');
        }

      } catch (error) {
        console.log('❌ Playwright dragTo failed:', error.message);

        // Try alternative: mouse events
        console.log('Trying manual mouse events...');
        try {
          await page.mouse.move(firstBox.x + firstBox.width/2, firstBox.y + firstBox.height/2);
          await page.mouse.down();
          await page.waitForTimeout(100);
          await page.mouse.move(secondBox.x + secondBox.width/2, secondBox.y + secondBox.height/2);
          await page.waitForTimeout(100);
          await page.mouse.up();

          await page.waitForTimeout(2000);

          const manualFirstName = await firstCard.locator('.student-name').textContent();
          const manualSecondName = await secondCard.locator('.student-name').textContent();

          console.log('After manual mouse: First =', manualFirstName, ', Second =', manualSecondName);

          if (firstName === manualSecondName && secondName === manualFirstName) {
            console.log('✅ Manual mouse events worked!');
          } else {
            console.log('❌ Manual mouse events also failed');
          }

        } catch (mouseError) {
          console.log('❌ Manual mouse events failed:', mouseError.message);
        }
      }

    } else {
      console.log('❌ Not enough student cards for testing');
    }

    // Take screenshots
    await page.screenshot({ path: 'setup-test-final.png', fullPage: true });
    console.log('Final screenshot saved');

    console.log('Keeping browser open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('Error during setup and test:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();