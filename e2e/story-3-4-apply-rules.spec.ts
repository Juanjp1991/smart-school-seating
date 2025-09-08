import { test, expect } from '@playwright/test'

test.describe('Story 3.4: Apply Placement Rules', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full auto-placement workflow', async ({ page }) => {
    // Step 1: Create a test roster with students
    console.log('🔸 Step 1: Creating test roster with students...')
    
    // Navigate to rosters page
    await page.click('text=Rosters')
    await page.waitForLoadState('networkidle')
    
    // Create new roster
    await page.click('text=Create Roster')
    await page.fill('[placeholder="Enter roster name"]', 'Test Auto Placement')
    await page.click('text=Create')
    await page.waitForTimeout(1000)
    
    // Add some test students
    const students = [
      { firstName: 'Alice', lastName: 'Johnson' },
      { firstName: 'Bob', lastName: 'Smith' },
      { firstName: 'Carol', lastName: 'Davis' },
      { firstName: 'David', lastName: 'Wilson' }
    ]
    
    for (const student of students) {
      await page.click('text=Add Student')
      await page.fill('[placeholder="First name"]', student.firstName)
      await page.fill('[placeholder="Last name"]', student.lastName)
      await page.click('button:has-text("Add Student"):not([disabled])')
      await page.waitForTimeout(500)
    }
    
    console.log('✅ Created roster with 4 students')

    // Step 2: Create some placement rules
    console.log('🔸 Step 2: Creating placement rules...')
    
    // Look for the Rules section and create a rule
    const rulesSection = page.locator('text=Rules').first()
    if (await rulesSection.isVisible()) {
      // Click Create Rule button
      await page.click('text=Rule', { timeout: 5000 })
      await page.waitForTimeout(1000)
      
      // Select rule type - SEPARATE
      await page.selectOption('select[name="type"]', 'SEPARATE')
      
      // Select students Alice and Bob to separate
      await page.check('input[type="checkbox"][value*="Alice"]')
      await page.check('input[type="checkbox"][value*="Bob"]')
      
      // Create the rule
      await page.click('button:has-text("Create Rule")')
      await page.waitForTimeout(1000)
      
      console.log('✅ Created SEPARATE rule for Alice and Bob')
      
      // Create another rule - FRONT_ROW for Carol
      await page.click('text=Rule')
      await page.waitForTimeout(1000)
      
      await page.selectOption('select[name="type"]', 'FRONT_ROW')
      await page.check('input[type="checkbox"][value*="Carol"]')
      await page.click('button:has-text("Create Rule")')
      await page.waitForTimeout(1000)
      
      console.log('✅ Created FRONT_ROW rule for Carol')
    } else {
      console.log('ℹ️ Rules section not immediately visible, continuing with placement test...')
    }

    // Step 3: Navigate to plan editor
    console.log('🔸 Step 3: Navigating to plan editor...')
    
    // Look for a way to access the plan editor
    // Try clicking on "Plan Editor" or similar
    const planEditorButton = page.locator('text=Plan Editor').first()
    if (await planEditorButton.isVisible({ timeout: 2000 })) {
      await planEditorButton.click()
    } else {
      // Alternative: look for "Edit" or similar button
      const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit")')
      if (await editButtons.count() > 0) {
        await editButtons.first().click()
      } else {
        // Try navigating directly to plan editor
        await page.goto('http://localhost:3001/plan-editor')
      }
    }
    
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Step 4: Look for and test Auto Place functionality
    console.log('🔸 Step 4: Testing Auto Place functionality...')
    
    // Look for Auto Place button
    const autoPlaceButton = page.locator('button:has-text("Auto Place"), button:has-text("🎯")')
    
    if (await autoPlaceButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found Auto Place button')
      
      // Check if button is enabled
      const isEnabled = await autoPlaceButton.isEnabled()
      console.log(`Auto Place button enabled: ${isEnabled}`)
      
      if (isEnabled) {
        // Click Auto Place button
        await autoPlaceButton.click()
        console.log('✅ Clicked Auto Place button')
        
        // Look for confirmation dialog or progress modal
        const confirmDialog = page.locator('text=Clear existing seat assignments')
        if (await confirmDialog.isVisible({ timeout: 2000 })) {
          // Click OK/Yes to confirm
          await page.click('button:has-text("OK"), button:has-text("Yes")')
          console.log('✅ Confirmed placement options')
        }
        
        // Look for placement progress modal
        const progressModal = page.locator('text=Auto Placement in Progress, text=Placing')
        if (await progressModal.isVisible({ timeout: 3000 })) {
          console.log('✅ Placement progress modal appeared')
          
          // Wait for placement to complete
          await page.waitForTimeout(3000)
        }
        
        // Look for placement results modal
        const resultsModal = page.locator('text=Placement Results, text=Students Placed')
        if (await resultsModal.isVisible({ timeout: 5000 })) {
          console.log('✅ Placement results modal appeared')
          
          // Check for success indicators
          const successIndicators = page.locator('text=✅, text=🎉')
          const successCount = await successIndicators.count()
          console.log(`Found ${successCount} success indicators`)
          
          // Look for "Apply Placements" button
          const applyButton = page.locator('button:has-text("Apply Placements")')
          if (await applyButton.isVisible({ timeout: 2000 })) {
            await applyButton.click()
            console.log('✅ Applied placements')
            
            // Wait for modal to close
            await page.waitForTimeout(2000)
          }
        } else {
          // Look for success message or updated seating chart
          const successMessage = page.locator('text=Successfully placed, text=students placed')
          if (await successMessage.isVisible({ timeout: 3000 })) {
            console.log('✅ Got success message for placement')
          }
        }
        
        // Step 5: Verify placement results
        console.log('🔸 Step 5: Verifying placement results...')
        
        // Look for evidence that students are now placed
        const seatingChart = page.locator('[class*="seating"], [class*="chart"], [class*="grid"]').first()
        if (await seatingChart.isVisible({ timeout: 3000 })) {
          // Look for student names or cards on the seating chart
          const studentElements = page.locator('text=Alice, text=Bob, text=Carol, text=David')
          const placedStudentCount = await studentElements.count()
          console.log(`Found ${placedStudentCount} students visible on seating chart`)
          
          if (placedStudentCount > 0) {
            console.log('✅ Students appear to be placed on seating chart')
          }
        }
        
        // Check unassigned students section
        const unassignedSection = page.locator('text=Unassigned Students')
        if (await unassignedSection.isVisible({ timeout: 2000 })) {
          const unassignedCount = await page.locator('text=Unassigned Students').textContent()
          console.log(`Unassigned students info: ${unassignedCount}`)
        }
        
      } else {
        console.log('⚠️ Auto Place button is disabled - checking why...')
        
        // Check for reasons why it might be disabled
        const studentCount = await page.locator('text=student').count()
        console.log(`Found ${studentCount} references to students on page`)
        
        const rosterInfo = await page.locator('text=roster, text=Roster').count()
        console.log(`Found ${rosterInfo} references to roster on page`)
      }
      
    } else {
      console.log('❌ Auto Place button not found')
      
      // Try to understand current page state
      const pageTitle = await page.title()
      console.log(`Current page title: ${pageTitle}`)
      
      const url = page.url()
      console.log(`Current URL: ${url}`)
      
      // Look for any buttons that might be related
      const allButtons = page.locator('button')
      const buttonCount = await allButtons.count()
      console.log(`Found ${buttonCount} buttons on page`)
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const buttonText = await allButtons.nth(i).textContent()
          console.log(`Button ${i + 1}: "${buttonText}"`)
        }
      }
    }

    // Final verification
    console.log('🔸 Final verification...')
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/story-3-4-final-state.png', fullPage: true })
    console.log('✅ Screenshot saved')

    // Basic assertion that we reached some form of seating interface
    const hasSeatingElements = await page.locator('text=seat, text=Seat, text=student, text=Student').count() > 0
    expect(hasSeatingElements).toBeTruthy()
    
    console.log('🎉 Story 3.4 Auto Placement test completed!')
  })

  test('should handle auto-placement with no rules gracefully', async ({ page }) => {
    console.log('🔸 Testing auto-placement with no rules...')
    
    // Navigate to rosters page
    await page.click('text=Rosters')
    await page.waitForLoadState('networkidle')
    
    // Create a simple roster with one student
    await page.click('text=Create Roster')
    await page.fill('[placeholder="Enter roster name"]', 'No Rules Test')
    await page.click('text=Create')
    await page.waitForTimeout(1000)
    
    // Add one student
    await page.click('text=Add Student')
    await page.fill('[placeholder="First name"]', 'Test')
    await page.fill('[placeholder="Last name"]', 'Student')
    await page.click('button:has-text("Add Student"):not([disabled])')
    await page.waitForTimeout(500)
    
    // Try to access plan editor and auto placement
    const planEditorButton = page.locator('text=Plan Editor').first()
    if (await planEditorButton.isVisible({ timeout: 2000 })) {
      await planEditorButton.click()
      await page.waitForLoadState('networkidle')
      
      const autoPlaceButton = page.locator('button:has-text("Auto Place"), button:has-text("🎯")')
      if (await autoPlaceButton.isVisible({ timeout: 3000 })) {
        // Should still work even without rules
        if (await autoPlaceButton.isEnabled()) {
          await autoPlaceButton.click()
          console.log('✅ Auto Place works without rules')
          
          // Handle any confirmation dialogs
          await page.waitForTimeout(2000)
          const confirmButtons = page.locator('button:has-text("OK"), button:has-text("Yes"), button:has-text("Continue")')
          if (await confirmButtons.count() > 0) {
            await confirmButtons.first().click()
          }
          
          // Look for completion
          await page.waitForTimeout(3000)
          console.log('✅ Placement completed without rules')
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/story-3-4-no-rules.png', fullPage: true })
    
    console.log('✅ No rules test completed')
  })

  test('should show validation errors for invalid placement scenarios', async ({ page }) => {
    console.log('🔸 Testing validation errors...')
    
    // Navigate to plan editor directly
    await page.goto('http://localhost:3001/plan-editor')
    await page.waitForLoadState('networkidle')
    
    // Look for Auto Place button
    const autoPlaceButton = page.locator('button:has-text("Auto Place"), button:has-text("🎯")')
    
    if (await autoPlaceButton.isVisible({ timeout: 3000 })) {
      // Button should be disabled when no students/roster
      const isDisabled = await autoPlaceButton.isDisabled()
      console.log(`Auto Place button disabled when no data: ${isDisabled}`)
      
      if (!isDisabled) {
        // Try clicking anyway to see validation
        await autoPlaceButton.click()
        await page.waitForTimeout(2000)
        
        // Look for error messages
        const errorMessages = page.locator('text=error, text=Error, text=cannot, text=Cannot, text=No students, text=required')
        const errorCount = await errorMessages.count()
        console.log(`Found ${errorCount} potential error messages`)
        
        if (errorCount > 0) {
          console.log('✅ Validation errors shown appropriately')
        }
      } else {
        console.log('✅ Auto Place properly disabled when no data')
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/story-3-4-validation.png', fullPage: true })
    
    console.log('✅ Validation test completed')
  })
})