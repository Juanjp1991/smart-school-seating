const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Navigating to application...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    console.log('Looking for navigation...');

    // Check if we're on the home page and need to navigate
    const createPlanButton = page.locator('button:has-text("Create Seating Plan")');
    const buttonExists = await createPlanButton.count() > 0;

    console.log('Create plan button exists:', buttonExists);

    if (buttonExists) {
      console.log('Clicking Create Seating Plan button...');
      await createPlanButton.click();
    } else {
      // Try alternative navigation method using showPage function
      console.log('Using showPage navigation...');
      await page.evaluate(() => {
        if (typeof showPage === 'function') {
          showPage('create-plan-page');
        }
      });
    }

    await page.waitForTimeout(2000);

    // Check current page state
    const title = await page.title();
    console.log('Page title:', title);

    // Check if we have dropdowns
    const layoutSelect = page.locator('#layout-select');
    const rosterSelect = page.locator('#roster-select');

    const layoutExists = await layoutSelect.count() > 0;
    const rosterExists = await rosterSelect.count() > 0;

    console.log('Layout select exists:', layoutExists);
    console.log('Roster select exists:', rosterExists);

    if (layoutExists && rosterExists) {
      // Check options
      const layoutOptions = await layoutSelect.locator('option').count();
      const rosterOptions = await rosterSelect.locator('option').count();

      console.log('Layout options:', layoutOptions);
      console.log('Roster options:', rosterOptions);

      if (layoutOptions > 1 && rosterOptions > 1) {
        console.log('Selecting layout and roster...');
        await layoutSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await rosterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        console.log('Generating seating plan...');
        await page.click('text=Generate Plan');
        await page.waitForTimeout(3000);

        // Check for student cards
        const studentCards = page.locator('.student-card.occupied');
        const count = await studentCards.count();
        console.log('Found', count, 'student cards');

        if (count >= 2) {
          // Inspect the first student card
          const firstCard = studentCards.nth(0);
          const isDraggable = await firstCard.getAttribute('draggable');
          const studentName = await firstCard.locator('.student-name').textContent();

          console.log('First student:', studentName);
          console.log('Is draggable:', isDraggable);

          // Check CSS classes
          const classList = await firstCard.getAttribute('class');
          console.log('CSS classes:', classList);

          // Get bounding box to see if element is visible
          const box = await firstCard.boundingBox();
          console.log('Bounding box:', box);

          // Try to evaluate drag events in the browser
          const dragResult = await page.evaluate(() => {
            const cards = document.querySelectorAll('.student-card.occupied');
            if (cards.length >= 2) {
              const firstCard = cards[0];
              const secondCard = cards[1];

              console.log('First card draggable:', firstCard.draggable);
              console.log('First card listeners:', Object.getOwnPropertyNames(firstCard));

              // Check if drag events are properly attached
              const hasEventListeners = firstCard.ondragstart !== null;
              console.log('Has ondragstart:', hasEventListeners);

              // Try to create and dispatch drag events manually
              try {
                const dragEvent = new DragEvent('dragstart', {
                  bubbles: true,
                  cancelable: true,
                  dataTransfer: new DataTransfer()
                });

                console.log('About to dispatch dragstart event...');
                const result = firstCard.dispatchEvent(dragEvent);
                console.log('Dragstart event dispatched, result:', result);

                return {
                  success: true,
                  draggable: firstCard.draggable,
                  hasListeners: hasEventListeners,
                  eventResult: result
                };
              } catch (error) {
                console.error('Error creating drag event:', error.message);
                return {
                  success: false,
                  error: error.message
                };
              }
            }
            return { success: false, reason: 'Not enough cards' };
          });

          console.log('Drag evaluation result:', dragResult);

          // Now try the actual drag and drop with Playwright
          console.log('Attempting Playwright drag and drop...');
          const secondCard = studentCards.nth(1);

          try {
            await firstCard.dragTo(secondCard);
            console.log('Playwright drag completed');

            // Check if anything changed
            await page.waitForTimeout(1000);
            const newStudentName = await firstCard.locator('.student-name').textContent();
            console.log('Student name after drag:', newStudentName);

            if (newStudentName !== studentName) {
              console.log('✅ Drag and drop worked!');
            } else {
              console.log('❌ Drag and drop did not work');
            }
          } catch (error) {
            console.log('❌ Playwright drag failed:', error.message);
          }

        } else {
          console.log('❌ Not enough student cards found');
        }
      } else {
        console.log('❌ No layout or roster options available');
      }
    } else {
      console.log('❌ Layout or roster select not found');
    }

    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved');

    // Keep browser open for manual inspection
    console.log('Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();