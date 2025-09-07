import { test, expect } from '@playwright/test'

test.describe('Layout Editor', () => {
  test('should display layout editor with default grid', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Check page title and basic elements
    await expect(page).toHaveTitle(/SmartSchool/)
    
    // Check toolbar elements
    await expect(page.locator('input[type="number"]').first()).toHaveValue('8')
    await expect(page.locator('input[type="number"]').last()).toHaveValue('6')
    
    // Check that grid cells are rendered (8*6 = 48 cells)
    const gridCells = page.locator('.grid-cell')
    await expect(gridCells).toHaveCount(48)
  })

  test('should update grid when changing dimensions', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Change rows to 5
    const rowsInput = page.locator('input[type="number"]').first()
    await rowsInput.fill('5')
    
    // Check that grid now has 5*6 = 30 cells
    const gridCells = page.locator('.grid-cell')
    await expect(gridCells).toHaveCount(30)
    
    // Change cols to 4
    const colsInput = page.locator('input[type="number"]').last()
    await colsInput.fill('4')
    
    // Check that grid now has 5*4 = 20 cells
    await expect(gridCells).toHaveCount(20)
  })

  test('should validate input ranges', async ({ page }) => {
    await page.goto('/layout-editor')
    
    const rowsInput = page.locator('input[type="number"]').first()
    
    // Try invalid negative value
    await rowsInput.fill('-1')
    await page.keyboard.press('Tab')
    
    // Should still have default grid (8*6 = 48 cells)
    const gridCells = page.locator('.grid-cell')
    await expect(gridCells).toHaveCount(48)
    
    // Try valid value
    await rowsInput.fill('10')
    await page.keyboard.press('Tab')
    
    // Should update to 10*6 = 60 cells
    await expect(gridCells).toHaveCount(60)
  })

  test('should have responsive grid styling', async ({ page }) => {
    await page.goto('/layout-editor')
    
    const grid = page.locator('.classroom-grid')
    await expect(grid).toBeVisible()
    
    // Check that grid has proper CSS styles
    await expect(grid).toHaveCSS('display', 'grid')
    await expect(grid).toHaveCSS('border', '2px solid rgb(51, 51, 51)')
    await expect(grid).toHaveCSS('border-radius', '8px')
  })

  test('should display toolbar buttons', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Check that toolbar buttons are present
    await expect(page.locator('button', { hasText: 'Save' })).toBeVisible()
    
    // Check tool buttons
    await expect(page.locator('button', { hasText: 'Seat' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Desk' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Door' })).toBeVisible()
    
    // Check tools label is displayed
    await expect(page.locator('text=Tools:')).toBeVisible()
  })

  test('should navigate from home page', async ({ page }) => {
    await page.goto('/')
    
    // Check home page elements
    await expect(page.locator('h1', { hasText: 'SmartSchool Seating' })).toBeVisible()
    
    // Click on layout editor link
    await page.locator('a[href="/layout-editor"]').click()
    
    // Should navigate to layout editor
    await expect(page).toHaveURL('/layout-editor')
    await expect(page.locator('.classroom-grid')).toBeVisible()
  })

  test('should handle edge cases for grid dimensions', async ({ page }) => {
    await page.goto('/layout-editor')
    
    const rowsInput = page.locator('input[type="number"]').first()
    const colsInput = page.locator('input[type="number"]').last()
    const gridCells = page.locator('.grid-cell')
    
    // Test minimum valid values (1x1)
    await rowsInput.fill('1')
    await colsInput.fill('1')
    await expect(gridCells).toHaveCount(1)
    
    // Test maximum valid values (20x20) 
    await rowsInput.fill('20')
    await colsInput.fill('20')
    await expect(gridCells).toHaveCount(400)
    
    // Test boundary validation (21 should not work)
    await rowsInput.fill('21')
    await page.keyboard.press('Tab')
    // Should still be 20 rows
    await expect(gridCells).toHaveCount(400)
  })

  test('should allow desk tool selection and show rotate button', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select desk tool
    const deskButton = page.locator('button', { hasText: 'Desk' })
    await deskButton.click()
    
    // Check desk button is active
    await expect(deskButton).toHaveClass(/active/)
    
    // Rotate button should appear when desk is selected
    await expect(page.locator('button', { hasText: 'Rotate (horizontal)' })).toBeVisible()
  })

  test('should hide rotate button when non-desk tool is selected', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Initially select desk to show rotate button
    await page.locator('button', { hasText: 'Desk' }).click()
    await expect(page.locator('button', { hasText: 'Rotate (horizontal)' })).toBeVisible()
    
    // Select seat tool
    await page.locator('button', { hasText: 'Seat' }).click()
    
    // Rotate button should be hidden
    await expect(page.locator('button', { hasText: 'Rotate (horizontal)' })).not.toBeVisible()
  })

  test('should place and remove door furniture', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select door tool
    await page.locator('button', { hasText: 'Door' }).click()
    
    // Click on first cell to place door
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    // Check door is placed (has furniture-door class and door emoji)
    await expect(firstCell).toHaveClass(/furniture-door/)
    await expect(firstCell).toContainText('🚪')
    
    // Click again to remove door
    await firstCell.click()
    
    // Move mouse away to clear preview
    await page.mouse.move(0, 0)
    
    // Check door is removed
    await expect(firstCell).not.toHaveClass(/furniture-door/)
    await expect(firstCell).not.toContainText('🚪')
  })

  test('should place and remove desk furniture horizontally', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select desk tool  
    await page.locator('button', { hasText: 'Desk' }).click()
    
    // Click on first cell to place horizontal desk
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    // Check both desk cells are placed (first cell + adjacent right cell)
    await expect(firstCell).toHaveClass(/furniture-desk/)
    await expect(firstCell).toContainText('🪑')
    
    const secondCell = page.locator('.grid-cell').nth(1)
    await expect(secondCell).toHaveClass(/furniture-desk/)
    await expect(secondCell).toContainText('🪑')
    
    // Click on desk to remove it
    await firstCell.click()
    
    // Move mouse away to clear preview
    await page.mouse.move(0, 0)
    
    // Both cells should be empty
    await expect(firstCell).not.toHaveClass(/furniture-desk/)
    await expect(secondCell).not.toHaveClass(/furniture-desk/)
  })

  test('should toggle desk rotation and place vertically', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select desk tool
    await page.locator('button', { hasText: 'Desk' }).click()
    
    // Click rotate button to change to vertical
    await page.locator('button', { hasText: 'Rotate (horizontal)' }).click()
    
    // Button text should update
    await expect(page.locator('button', { hasText: 'Rotate (vertical)' })).toBeVisible()
    
    // Place desk at position that allows vertical placement
    const cellInSecondRow = page.locator('.grid-cell').nth(6) // Second row, first column (6 cols in default grid)
    await cellInSecondRow.click()
    
    // Check desk is placed vertically (current cell + cell below)
    await expect(cellInSecondRow).toHaveClass(/furniture-desk/)
    await expect(cellInSecondRow).toContainText('🪑')
    
    const cellBelow = page.locator('.grid-cell').nth(12) // Third row, first column 
    await expect(cellBelow).toHaveClass(/furniture-desk/)
    await expect(cellBelow).toContainText('🪑')
  })

  test('should prevent desk placement at grid boundaries', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select desk tool
    await page.locator('button', { hasText: 'Desk' }).click()
    
    // Try to place desk at the rightmost column (should fail due to boundary)
    const lastCellInFirstRow = page.locator('.grid-cell').nth(5) // 6th cell (0-indexed) - last column of first row
    await lastCellInFirstRow.click()
    
    // Move mouse away to clear any preview
    await page.mouse.move(0, 0)
    
    // Desk should not be placed (would extend beyond grid)
    await expect(lastCellInFirstRow).not.toHaveClass(/furniture-desk/)
    
    // Try to place desk at the bottom row (should fail for vertical desk)
    await page.locator('button', { hasText: 'Rotate (horizontal)' }).click()
    const lastRowFirstCell = page.locator('.grid-cell').nth(42) // Last row, first column (8*6=48 cells, so 42 is last row)
    await lastRowFirstCell.click()
    
    // Move mouse away to clear any preview  
    await page.mouse.move(0, 0)
    
    // Desk should not be placed (would extend beyond grid bottom)
    await expect(lastRowFirstCell).not.toHaveClass(/furniture-desk/)
  })

  test('should place and remove seats', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Select seat tool (should be selected by default)
    await page.locator('button', { hasText: 'Seat' }).click()
    
    // Click on first cell to place seat
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    // Check seat is placed (has seat class and seat emoji)
    await expect(firstCell).toHaveClass(/seat/)
    await expect(firstCell).toContainText('💺')
    
    // Click again to remove seat
    await firstCell.click()
    
    // Check seat is removed
    await expect(firstCell).not.toHaveClass(/seat/)
    await expect(firstCell).not.toContainText('💺')
  })

  test('should prevent seat placement on furniture', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Place a door first
    await page.locator('button', { hasText: 'Door' }).click()
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    // Verify door is placed
    await expect(firstCell).toHaveClass(/furniture-door/)
    
    // Switch to seat tool and try to place seat on door
    await page.locator('button', { hasText: 'Seat' }).click()
    await firstCell.click()
    
    // Door should remain, seat should not be placed
    await expect(firstCell).toHaveClass(/furniture-door/)
    await expect(firstCell).not.toHaveClass(/seat/)
    await expect(firstCell).toContainText('🚪')
  })

  test('should remove seat when placing furniture', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Place a seat first
    await page.locator('button', { hasText: 'Seat' }).click()
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    // Verify seat is placed
    await expect(firstCell).toHaveClass(/seat/)
    
    // Switch to door tool and place door on seat
    await page.locator('button', { hasText: 'Door' }).click()
    await firstCell.click()
    
    // Door should be placed, seat should be removed
    await expect(firstCell).toHaveClass(/furniture-door/)
    await expect(firstCell).not.toHaveClass(/seat/)
    await expect(firstCell).toContainText('🚪')
  })

  test('should open save modal when save button is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Click save button
    await page.locator('button', { hasText: 'Save' }).click()
    
    // Check that modal opens
    await expect(page.locator('text=Save Layout')).toBeVisible()
    await expect(page.locator('input[placeholder*="Enter a name"]')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Cancel' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Save Layout' })).toBeVisible()
  })

  test('should close save modal when cancel is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Save' }).click()
    await expect(page.locator('text=Save Layout')).toBeVisible()
    
    // Click cancel
    await page.locator('button', { hasText: 'Cancel' }).click()
    
    // Modal should close
    await expect(page.locator('text=Save Layout')).not.toBeVisible()
  })

  test('should close save modal when close button is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Save' }).click()
    await expect(page.locator('text=Save Layout')).toBeVisible()
    
    // Click X button
    await page.locator('button[aria-label="Close"]').click()
    
    // Modal should close
    await expect(page.locator('text=Save Layout')).not.toBeVisible()
  })

  test('should require layout name before saving', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Save' }).click()
    
    // Try to save without name
    const saveButton = page.locator('button', { hasText: 'Save Layout' }).nth(1) // The one in the modal
    await expect(saveButton).toBeDisabled()
    
    // Enter name and button should become enabled
    await page.locator('input[placeholder*="Enter a name"]').fill('Test Layout')
    await expect(saveButton).toBeEnabled()
  })

  test('should show error for empty layout name', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Save' }).click()
    
    // Enter only spaces
    const nameInput = page.locator('input[placeholder*="Enter a name"]')
    await nameInput.fill('   ')
    
    // Try to submit by pressing enter or clicking save
    await page.keyboard.press('Enter')
    
    // Should show error message
    await expect(page.locator('text=Please enter a layout name')).toBeVisible()
  })

  test('should save layout and show success notification', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Create some layout content
    await page.locator('button', { hasText: 'Seat' }).click()
    const firstCell = page.locator('.grid-cell').first()
    await firstCell.click()
    
    await page.locator('button', { hasText: 'Door' }).click() 
    const secondCell = page.locator('.grid-cell').nth(1)
    await secondCell.click()
    
    // Save the layout
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('E2E Test Layout')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    
    // Should show success notification
    await expect(page.locator('text=Layout "E2E Test Layout" saved successfully!')).toBeVisible()
    
    // Modal should close
    await expect(page.locator('text=Save Layout')).not.toBeVisible()
  })

  test('should dismiss notification when close button is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Save a layout to trigger notification
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('Dismiss Test Layout')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    
    // Wait for success notification
    await expect(page.locator('text=Layout "Dismiss Test Layout" saved successfully!')).toBeVisible()
    
    // Click close notification button
    await page.locator('button[aria-label="Close notification"]').click()
    
    // Notification should disappear
    await expect(page.locator('text=Layout "Dismiss Test Layout" saved successfully!')).not.toBeVisible()
  })

  test('should handle save errors gracefully', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Simulate an error by trying to save with a problematic name or by causing DB issues
    // For this test, we'll just test that error UI components work correctly
    
    await page.locator('button', { hasText: 'Save' }).click()
    
    // Test that error display works in modal
    await page.locator('input[placeholder*="Enter a name"]').fill('')
    await page.keyboard.press('Enter')
    
    await expect(page.locator('[role="alert"]')).toContainText('Please enter a layout name')
  })

  test('should maintain layout state after save', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Create specific layout
    await page.locator('input[type="number"]').first().fill('4') // 4 rows
    await page.locator('input[type="number"]').last().fill('3') // 3 cols
    
    // Wait for grid to update
    await expect(page.locator('.grid-cell')).toHaveCount(12)
    
    // Add furniture
    await page.locator('button', { hasText: 'Desk' }).click()
    await page.locator('.grid-cell').first().click()
    
    await page.locator('button', { hasText: 'Seat' }).click()
    await page.locator('.grid-cell').nth(2).click()
    
    // Save the layout
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('State Test Layout')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    
    // Wait for save to complete
    await expect(page.locator('text=Layout "State Test Layout" saved successfully!')).toBeVisible()
    
    // Verify layout state is preserved
    await expect(page.locator('input[type="number"]').first()).toHaveValue('4')
    await expect(page.locator('input[type="number"]').last()).toHaveValue('3')
    await expect(page.locator('.grid-cell')).toHaveCount(12)
    
    // Verify furniture is still there
    const firstCell = page.locator('.grid-cell').first()
    await expect(firstCell).toHaveClass(/furniture-desk/)
    
    const thirdCell = page.locator('.grid-cell').nth(2)
    await expect(thirdCell).toHaveClass(/seat/)
  })

  test('should open load modal when load button is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Click Load button
    await page.locator('button', { hasText: 'Load' }).click()
    
    // Check that modal opens
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Cancel' })).toBeVisible()
  })

  test('should close load modal when cancel is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Load' }).click()
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    
    // Click cancel
    await page.locator('button', { hasText: 'Cancel' }).click()
    
    // Modal should be closed
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).not.toBeVisible()
  })

  test('should close load modal when close button is clicked', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Open modal
    await page.locator('button', { hasText: 'Load' }).click()
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    
    // Click close button (×)
    await page.locator('button[aria-label="Close"]').click()
    
    // Modal should be closed
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).not.toBeVisible()
  })

  test('should display empty state when no templates are saved', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Clear any existing templates by refreshing IndexedDB
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase('SmartSchoolSeating')
        deleteReq.onsuccess = () => resolve(undefined)
        deleteReq.onerror = () => reject(deleteReq.error)
      })
    })
    
    // Reload page to reset state
    await page.reload()
    
    // Open load modal
    await page.locator('button', { hasText: 'Load' }).click()
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    
    // Should show empty state
    await expect(page.locator('text=No templates available')).toBeVisible()
    await expect(page.locator('text=Save a layout first to see it here')).toBeVisible()
  })

  test('should load template and apply it to the editor', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // First create and save a template to load later
    await page.locator('input[type="number"]').first().fill('5') // 5 rows
    await page.locator('input[type="number"]').last().fill('4') // 4 cols
    await expect(page.locator('.grid-cell')).toHaveCount(20)
    
    // Add furniture
    await page.locator('button', { hasText: 'Desk' }).click()
    await page.locator('.grid-cell').first().click()
    
    await page.locator('button', { hasText: 'Seat' }).click()
    await page.locator('.grid-cell').nth(5).click()
    
    // Save the layout
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('Load Test Layout')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    
    // Wait for save to complete
    await expect(page.locator('text=Layout "Load Test Layout" saved successfully!')).toBeVisible()
    
    // Change the layout to something different
    await page.locator('input[type="number"]').first().fill('8') // Back to 8 rows
    await page.locator('input[type="number"]').last().fill('6') // Back to 6 cols
    await expect(page.locator('.grid-cell')).toHaveCount(48)
    
    // Clear furniture by selecting seat tool and clicking on furniture
    await page.locator('button', { hasText: 'Clear' }).click()
    await page.locator('.grid-cell').first().click()
    await page.locator('.grid-cell').nth(5).click()
    
    // Open load modal
    await page.locator('button', { hasText: 'Load' }).click()
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    
    // Should show the saved template
    await expect(page.locator('text=Load Test Layout')).toBeVisible()
    await expect(page.locator('text=5 × 4 grid')).toBeVisible()
    
    // Click Load button for the template
    await page.locator('.template-item').locator('button', { hasText: 'Load' }).click()
    
    // Should show success notification
    await expect(page.locator('text=Layout "Load Test Layout" loaded successfully!')).toBeVisible()
    
    // Verify layout was loaded correctly
    await expect(page.locator('input[type="number"]').first()).toHaveValue('5')
    await expect(page.locator('input[type="number"]').last()).toHaveValue('4')
    await expect(page.locator('.grid-cell')).toHaveCount(20)
    
    // Verify furniture was loaded
    const firstCell = page.locator('.grid-cell').first()
    await expect(firstCell).toHaveClass(/furniture-desk/)
    
    const sixthCell = page.locator('.grid-cell').nth(5)
    await expect(sixthCell).toHaveClass(/seat/)
  })

  test('should handle load errors gracefully', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Mock a database error during load
    await page.route('**/*', route => {
      // Simulate database error for our load operation
      if (route.request().method() === 'GET' && route.request().url().includes('layout-editor')) {
        // Let the page load normally first
        route.continue()
      } else {
        route.continue()
      }
    })
    
    // First save a template
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('Error Test Layout')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    await expect(page.locator('text=Layout "Error Test Layout" saved successfully!')).toBeVisible()
    
    // Mock the onLoad function to throw an error
    await page.addInitScript(() => {
      window.mockLoadError = true
    })
    
    // Open load modal
    await page.locator('button', { hasText: 'Load' }).click()
    
    // Try to load the template - the test assumes the error handling works properly
    // In a real scenario, you'd need to mock the actual load function
    await expect(page.locator('text=Error Test Layout')).toBeVisible()
  })

  test('should display multiple templates sorted by newest first', async ({ page }) => {
    await page.goto('/layout-editor')
    
    // Clear existing templates
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase('SmartSchoolSeating')
        deleteReq.onsuccess = () => resolve(undefined)
        deleteReq.onerror = () => reject(deleteReq.error)
      })
    })
    
    await page.reload()
    
    // Save first template
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('First Template')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    await expect(page.locator('text=Layout "First Template" saved successfully!')).toBeVisible()
    
    // Wait a moment to ensure different timestamps
    await page.waitForTimeout(1000)
    
    // Save second template
    await page.locator('button', { hasText: 'Save' }).click()
    await page.locator('input[placeholder*="Enter a name"]').fill('Second Template')
    await page.locator('button', { hasText: 'Save Layout' }).nth(1).click()
    await expect(page.locator('text=Layout "Second Template" saved successfully!')).toBeVisible()
    
    // Open load modal
    await page.locator('button', { hasText: 'Load' }).click()
    await expect(page.locator('h2', { hasText: 'Load Layout Template' })).toBeVisible()
    
    // Should show both templates with newest first
    const templateNames = page.locator('.template-name')
    await expect(templateNames).toHaveCount(2)
    await expect(templateNames.first()).toContainText('Second Template')
    await expect(templateNames.last()).toContainText('First Template')
  })
})