import { test, expect } from '@playwright/test'

test.describe('Story 4.2: Toggle Data Off', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('should show Simple View toggle button in seating plan editor', async ({ page }) => {
    // Navigate to seating plan editor  
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    // Look for the Simple View toggle button
    const simpleToggle = page.locator('button:has-text("Simple")')
    await expect(simpleToggle).toBeVisible()
    
    // Verify the button has the correct title when inactive
    await expect(simpleToggle).toHaveAttribute('title', /Show simple view/)
  })

  test('should toggle to simple view and hide all additional data', async ({ page }) => {
    // First create some test data by going to roster management
    await page.click('text=Manage Rosters')
    await page.waitForSelector('button:has-text("+ Add New Roster")', { timeout: 10000 })
    
    // Create a test roster
    await page.click('button:has-text("+ Add New Roster")')
    await page.fill('input[placeholder="Enter roster name..."]', 'Test Roster E2E')
    await page.click('button:has-text("Create Roster")')
    
    // Add a test student with ratings
    await page.click('button:has-text("+ Add Student")')
    await page.fill('input[placeholder="Student name..."]', 'Test Student')
    await page.click('button:has-text("Add Student")')
    
    // Go to seating plan editor
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    // Select the test roster
    await page.click('select[data-testid="roster-selector"]')
    await page.selectOption('select[data-testid="roster-selector"]', { label: /Test Roster E2E/ })
    
    // Enable display options first
    const displayButton = page.locator('button:has-text("Display Options")')
    if (await displayButton.isVisible()) {
      await displayButton.click()
      
      // Enable all display options
      await page.check('input[name="showPhoto"]')
      await page.check('input[name="showRatings"]')
      await page.click('body') // Close menu
    }
    
    // Place student in a seat
    await page.click('[data-testid="grid-cell"]:first-of-type')
    
    // Verify student card shows full data initially
    const studentCard = page.locator('[data-testid="student-card"]').first()
    await expect(studentCard).toBeVisible()
    
    // Now test the Simple View toggle
    const simpleToggle = page.locator('button:has-text("Simple")')
    await expect(simpleToggle).toBeVisible()
    
    // Click to enable simple view
    await simpleToggle.click()
    
    // Verify the button state changes
    await expect(simpleToggle).toHaveAttribute('title', /Show full student data/)
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
    
    // Verify student card now shows only name (simple view)
    await expect(studentCard).toBeVisible()
    // In simple view, ratings and photos should be hidden
    await expect(studentCard.locator('[data-testid="student-photo"]')).toBeHidden()
    await expect(studentCard.locator('[data-testid="student-ratings"]')).toBeHidden()
    
    // But name should still be visible
    await expect(studentCard.locator('text=Test Student')).toBeVisible()
  })

  test('should restore previous display preferences when exiting simple view', async ({ page }) => {
    // Navigate to seating plan editor
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    // Enable some display options first
    const displayButton = page.locator('button:has-text("Display Options")')
    if (await displayButton.isVisible()) {
      await displayButton.click()
      
      // Enable specific options
      await page.check('input[name="showPhoto"]')
      await page.check('input[name="showRatings"]')
      await page.click('body') // Close menu
    }
    
    // Toggle to simple view
    const simpleToggle = page.locator('button:has-text("Simple")')
    await simpleToggle.click()
    
    // Verify we're in simple view
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
    
    // Toggle back to normal view
    await simpleToggle.click()
    
    // Verify button is back to normal state
    await expect(simpleToggle).toHaveAttribute('title', /Show simple view/)
    await expect(simpleToggle).not.toHaveClass(/bg-blue-50/)
    
    // Verify that display options are restored by checking the menu
    if (await displayButton.isVisible()) {
      await displayButton.click()
      
      // These should still be checked from before simple view
      await expect(page.locator('input[name="showPhoto"]')).toBeChecked()
      await expect(page.locator('input[name="showRatings"]')).toBeChecked()
    }
  })

  test('should sync simple view state between toolbar and display menu', async ({ page }) => {
    // Navigate to seating plan editor
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    const simpleToggle = page.locator('button:has-text("Simple")')
    const displayButton = page.locator('button:has-text("Display Options")')
    
    // Initially not in simple view
    await expect(simpleToggle).not.toHaveClass(/bg-blue-50/)
    
    // Enable simple view from toolbar
    await simpleToggle.click()
    
    // Check display menu reflects this
    if (await displayButton.isVisible()) {
      await displayButton.click()
      
      // There should be some indicator in the menu about simple view being active
      const simpleViewIndicator = page.locator('text=/Simple View.*Active/i, text=/Currently in simple view/i')
      await expect(simpleViewIndicator).toBeVisible()
      
      await page.click('body') // Close menu
    }
    
    // Disable simple view
    await simpleToggle.click()
    
    // Verify toolbar button returns to normal
    await expect(simpleToggle).not.toHaveClass(/bg-blue-50/)
  })

  test('should handle simple view loading states correctly', async ({ page }) => {
    // Navigate to seating plan editor
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    const simpleToggle = page.locator('button:has-text("Simple")')
    
    // Monitor network activity to potentially catch loading state
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('displayOptions') || response.url().includes('preferences'), 
      { timeout: 5000 }
    ).catch(() => null) // Ignore if no network requests
    
    // Click the toggle
    await simpleToggle.click()
    
    // The button might show a loading state briefly
    // We'll check if it gets disabled momentarily
    const wasDisabled = await simpleToggle.isDisabled().catch(() => false)
    
    // Wait for any network requests to complete
    await responsePromise
    
    // After loading, button should be enabled and in the correct state
    await expect(simpleToggle).not.toBeDisabled()
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
  })

  test('should maintain simple view state across page interactions', async ({ page }) => {
    // Navigate to seating plan editor
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    const simpleToggle = page.locator('button:has-text("Simple")')
    
    // Enable simple view
    await simpleToggle.click()
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
    
    // Perform some other interactions (like changing grid size)
    const gridRowsInput = page.locator('input[type="number"]').first()
    if (await gridRowsInput.isVisible()) {
      await gridRowsInput.fill('6')
    }
    
    // Simple view should still be active
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
    
    // Place/remove items on the grid
    await page.click('[data-testid="grid-cell"]:first-of-type')
    
    // Simple view should still be active
    await expect(simpleToggle).toHaveClass(/bg-blue-50/)
  })

  test('should show correct visual feedback when simple view is active', async ({ page }) => {
    // Navigate to seating plan editor  
    await page.click('text=Create Seating Plan')
    await page.waitForSelector('h1:has-text("Seating Plan Editor")', { timeout: 10000 })
    
    const simpleToggle = page.locator('button:has-text("Simple")')
    
    // Initially inactive - should have normal styling
    await expect(simpleToggle).toHaveClass(/bg-white.*border-gray-200.*text-gray-700/)
    await expect(simpleToggle).not.toHaveClass(/bg-blue-50/)
    
    // Activate simple view
    await simpleToggle.click()
    
    // Should show active styling
    await expect(simpleToggle).toHaveClass(/bg-blue-50.*border-blue-200.*text-blue-700/)
    await expect(simpleToggle).not.toHaveClass(/bg-white/)
    
    // Icon should change from Eye to EyeOff
    const eyeOffIcon = simpleToggle.locator('svg')
    await expect(eyeOffIcon).toBeVisible()
    
    // Deactivate simple view
    await simpleToggle.click()
    
    // Should return to inactive styling
    await expect(simpleToggle).toHaveClass(/bg-white.*border-gray-200.*text-gray-700/)
    await expect(simpleToggle).not.toHaveClass(/bg-blue-50/)
  })
})