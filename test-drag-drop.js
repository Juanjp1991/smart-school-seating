const { test, expect } = require('@playwright/test');

test('Test drag and drop functionality in seating plan', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:8000');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Navigate to the Create Seating Plan page
  await page.click('text=Create Seating Plan');

  // Wait for the page to load
  await page.waitForTimeout(1000);

  console.log('Navigated to Create Seating Plan page');

  // Check if we need to create sample data first
  const layoutSelect = page.locator('#layout-select');
  const rosterSelect = page.locator('#roster-select');

  // Check if there are any layouts
  const layoutOptions = await layoutSelect.locator('option').count();
  console.log('Number of layout options:', layoutOptions);

  if (layoutOptions <= 1) {
    console.log('No layouts found, creating sample layout...');

    // Go to layout editor to create a layout
    await page.click('text=Layout Editor');
    await page.waitForTimeout(1000);

    // Create a simple 2x2 layout
    await page.fill('#layout-name', 'Test Layout');
    await page.fill('#grid-rows', '2');
    await page.fill('#grid-cols', '2');
    await page.click('text=Create Layout');
    await page.waitForTimeout(500);

    // Add some seats
    const gridCells = page.locator('.grid-cell');
    await gridCells.nth(0).click(); // Add seat at position 0,0
    await gridCells.nth(1).click(); // Add seat at position 0,1
    await gridCells.nth(2).click(); // Add seat at position 1,0

    // Save the layout
    await page.click('text=Save Layout');
    await page.waitForTimeout(1000);

    console.log('Created test layout');
  }

  // Check if we need to create a roster
  await page.click('text=Create Seating Plan');
  await page.waitForTimeout(1000);

  const rosterOptions = await rosterSelect.locator('option').count();
  console.log('Number of roster options:', rosterOptions);

  if (rosterOptions <= 1) {
    console.log('No rosters found, creating sample roster...');

    // Go to roster manager to create a roster
    await page.click('text=Roster Manager');
    await page.waitForTimeout(1000);

    // Create a simple roster
    await page.fill('#roster-name', 'Test Roster');
    await page.click('text=Create Roster');
    await page.waitForTimeout(500);

    // Add some students
    await page.fill('#student-name', 'Alice');
    await page.click('text=Add Student');
    await page.waitForTimeout(200);

    await page.fill('#student-name', 'Bob');
    await page.click('text=Add Student');
    await page.waitForTimeout(200);

    await page.fill('#student-name', 'Charlie');
    await page.click('text=Add Student');
    await page.waitForTimeout(200);

    // Save the roster
    await page.click('text=Save Roster');
    await page.waitForTimeout(1000);

    console.log('Created test roster');
  }

  // Go back to Create Seating Plan
  await page.click('text=Create Seating Plan');
  await page.waitForTimeout(1000);

  // Select the layout and roster
  await layoutSelect.selectOption({ index: 1 }); // Select first non-empty option
  await page.waitForTimeout(500);

  await rosterSelect.selectOption({ index: 1 }); // Select first non-empty option
  await page.waitForTimeout(500);

  // Generate seating plan
  await page.click('text=Generate Plan');
  await page.waitForTimeout(2000);

  console.log('Generated seating plan');

  // Now test drag and drop
  const studentCards = page.locator('.student-card.occupied');
  const studentCount = await studentCards.count();
  console.log('Found', studentCount, 'occupied seats');

  if (studentCount >= 2) {
    // Get the first two student cards
    const firstStudent = studentCards.nth(0);
    const secondStudent = studentCards.nth(1);

    // Get student names before drag
    const firstName = await firstStudent.locator('.student-name').textContent();
    const secondName = await secondStudent.locator('.student-name').textContent();

    console.log('Students before drag:', firstName, 'and', secondName);

    // Check if draggable attribute is set
    const isDraggable = await firstStudent.getAttribute('draggable');
    console.log('First student draggable attribute:', isDraggable);

    // Test drag and drop
    console.log('Attempting drag and drop...');

    // Try the drag and drop operation
    await firstStudent.dragTo(secondStudent);

    // Wait a moment for the operation to complete
    await page.waitForTimeout(1000);

    // Check if students swapped
    const newFirstName = await firstStudent.locator('.student-name').textContent();
    const newSecondName = await secondStudent.locator('.student-name').textContent();

    console.log('Students after drag:', newFirstName, 'and', newSecondName);

    // Verify the swap occurred
    if (firstName === newSecondName && secondName === newFirstName) {
      console.log('✅ Drag and drop worked! Students swapped successfully.');
    } else {
      console.log('❌ Drag and drop failed. Students did not swap.');

      // Let's check if any drag events are fired
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.student-card.occupied');
        if (cards.length > 0) {
          const card = cards[0];
          console.log('Card draggable:', card.draggable);
          console.log('Card has dragstart listener:', !!card.ondragstart);

          // Try to manually trigger drag events
          const dragStartEvent = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
          });

          card.dispatchEvent(dragStartEvent);
          console.log('Manual dragstart event fired');
        }
      });
    }
  } else {
    console.log('❌ Not enough students to test drag and drop');
  }

  // Take a screenshot for debugging
  await page.screenshot({ path: 'drag-drop-test.png', fullPage: true });
  console.log('Screenshot saved as drag-drop-test.png');
});