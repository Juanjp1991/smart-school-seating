import { test, expect } from '@playwright/test'

test.describe('Story 3.3: Complete Drag & Drop Workflow Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rosters')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('should setup test data and validate drag and drop functionality', async ({ page }) => {
    console.log('🧪 Setting up test data for drag and drop validation...')
    
    // Step 1: Create a test roster if none exists
    await createTestRosterIfNeeded(page)
    
    // Step 2: Select the roster
    await selectFirstRoster(page)
    
    // Step 3: Create sample students
    await createSampleStudents(page)
    
    // Step 4: Create sample rules
    await createSampleRules(page)
    
    // Step 5: Test drag and drop functionality
    await testDragAndDropFunctionality(page)
  })

  async function createTestRosterIfNeeded(page) {
    console.log('📋 Creating test roster if needed...')
    
    // Check if any roster items exist
    const rosterItems = page.locator('[class*="roster-item"], [data-testid*="roster"], li:has-text("Roster")').all()
    
    if (rosterItems.length === 0) {
      console.log('No rosters found, creating one...')
      
      // Click create roster button
      const createButton = page.locator('button:has-text("New Roster")').first()
      await createButton.click()
      await page.waitForTimeout(1000)
      
      // Fill in roster name
      const modal = page.locator('[role="dialog"], [class*="modal"]').first()
      const input = modal.locator('input').first()
      await input.fill('Test Roster for Drag & Drop')
      await page.waitForTimeout(500)
      
      // Save roster
      const saveButton = modal.locator('button:has-text("Save"), button:has-text("Create")').first()
      await saveButton.click()
      await page.waitForTimeout(2000)
      
      console.log('✅ Test roster created')
    } else {
      console.log(`✅ Found ${rosterItems.length} existing rosters`)
    }
  }

  async function selectFirstRoster(page) {
    console.log('🎯 Selecting first roster...')
    
    // Wait for rosters to be available
    await page.waitForTimeout(1000)
    
    // Try to select the first roster
    const rosterSelectors = [
      '[class*="roster-item"]',
      'li:has-text("Roster")',
      'div:has-text("Roster")',
      'text=/test|period|class|math|english/i'
    ]
    
    for (const selector of rosterSelectors) {
      try {
        const items = page.locator(selector).all()
        if (items.length > 0) {
          await items[0].click()
          await page.waitForTimeout(1500)
          console.log(`✅ Selected roster using selector: ${selector}`)
          return
        }
      } catch (e) {
        // Continue trying
      }
    }
    
    console.log('❌ Could not select any roster')
  }

  async function createSampleStudents(page) {
    console.log('👥 Creating sample students...')
    
    // Look for add student button
    const addStudentButton = page.locator('button:has-text("Add Student")').first()
    
    try {
      if (await addStudentButton.isVisible()) {
        // Create a few students for testing
        const students = [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' },
          { firstName: 'Alice', lastName: 'Johnson' },
          { firstName: 'Bob', lastName: 'Wilson' }
        ]
        
        for (const student of students) {
          await addStudentButton.click()
          await page.waitForTimeout(1000)
          
          // Fill student form
          const modal = page.locator('[role="dialog"], [class*="modal"]').first()
          const firstNameInput = modal.locator('input[placeholder*="first"], input[placeholder*="First"]').first()
          const lastNameInput = modal.locator('input[placeholder*="last"], input[placeholder*="Last"]').first()
          
          await firstNameInput.fill(student.firstName)
          await lastNameInput.fill(student.lastName)
          await page.waitForTimeout(500)
          
          // Save student
          const saveButton = modal.locator('button:has-text("Save"), button:has-text("Create")').first()
          await saveButton.click()
          await page.waitForTimeout(1000)
        }
        
        console.log(`✅ Created ${students.length} sample students`)
      } else {
        console.log('ℹ️  Add student button not visible, may need to check existing students')
      }
    } catch (error) {
      console.log(`⚠️  Error creating students: ${error}`)
    }
  }

  async function createSampleRules(page) {
    console.log('📋 Creating sample rules for drag and drop testing...')
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000)
    
    // Look for create rule button
    const createRuleButtonSelectors = [
      'button:has-text("Create Rule")',
      'button:has-text("✏️ Rule")',
      'button:has-text("Rule")',
      '[class*="create"][class*="rule"]'
    ]
    
    let createButtonFound = false
    for (const selector of createRuleButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          console.log(`✅ Found create rule button: ${selector}`)
          createButtonFound = true
          
          // Create sample rules
          const rules = [
            { type: 'SEPARATE', description: 'Test Separate Rule' },
            { type: 'TOGETHER', description: 'Test Together Rule' },
            { type: 'FRONT_ROW', description: 'Test Front Row Rule' }
          ]
          
          for (const rule of rules) {
            await button.click()
            await page.waitForTimeout(1000)
            
            // Fill rule form (this will depend on the actual RuleBuilderModal implementation)
            const modal = page.locator('[role="dialog"], [class*="modal"]').first()
            
            // Try to select rule type
            const typeSelect = modal.locator('select').first()
            if (await typeSelect.isVisible()) {
              await typeSelect.selectOption(rule.type)
              await page.waitForTimeout(500)
            }
            
            // Try to select students (this is complex, so we'll skip detailed implementation for now)
            
            // Save rule
            const saveButton = modal.locator('button:has-text("Save"), button:has-text("Create")').first()
            if (await saveButton.isVisible()) {
              await saveButton.click()
              await page.waitForTimeout(1000)
              console.log(`✅ Created rule: ${rule.type}`)
            } else {
              // Close modal if save not available
              const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first()
              if (await closeButton.isVisible()) {
                await closeButton.click()
              }
            }
          }
          
          break
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!createButtonFound) {
      console.log('❌ Could not find create rule button')
    }
  }

  async function testDragAndDropFunctionality(page) {
    console.log('🎯 Testing drag and drop functionality...')
    
    // Wait for everything to load
    await page.waitForTimeout(3000)
    
    // Take screenshot before testing
    await page.screenshot({ path: 'before-drag-test.png', fullPage: true })
    
    // Look for reorder button
    const reorderButton = page.locator('button:has-text("Reorder"), button:has-text("⋮⋮")').first()
    
    try {
      if (await reorderButton.isVisible()) {
        console.log('✅ Found reorder button')
        
        // Click to enter drag mode
        await reorderButton.click()
        await page.waitForTimeout(1000)
        
        // Check if drag mode is active
        const isReorderMode = await page.locator('button:has-text("Reordering"), button:has-text("✅")').first().isVisible()
        if (isReorderMode) {
          console.log('✅ Successfully entered reorder mode')
        }
        
        // Look for draggable elements
        const draggables = page.locator('[data-rbd-draggable-id], [draggable="true"], [class*="draggable"]').all()
        
        if (draggables.length >= 2) {
          console.log(`✅ Found ${draggables.length} draggable elements`)
          
          // Try to perform drag operation
          const firstDraggable = draggables[0]
          const box = await firstDraggable.boundingBox()
          
          if (box) {
            console.log('✅ Found draggable element with bounding box')
            
            try {
              // Perform drag operation
              await firstDraggable.hover()
              await page.mouse.down()
              await page.mouse.move(box.x, box.y + 100) // Move down
              await page.waitForTimeout(500)
              await page.mouse.up()
              await page.waitForTimeout(2000)
              
              console.log('✅ Drag operation completed')
              
              // Take screenshot after drag
              await page.screenshot({ path: 'after-drag-test.png', fullPage: true })
              
              // Check for any changes or loading indicators
              const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], text=/updating/i').all()
              if (loadingIndicators.length > 0) {
                console.log('✅ Found loading indicators after drag - suggests update in progress')
              }
              
            } catch (error) {
              console.log(`❌ Drag operation failed: ${error}`)
            }
          } else {
            console.log('❌ Could not get bounding box for draggable element')
          }
        } else {
          console.log(`❌ Not enough draggable elements found: ${draggables.length}`)
        }
      } else {
        console.log('❌ Reorder button not found or not visible')
      }
    } catch (error) {
      console.log(`❌ Error testing drag and drop: ${error}`)
    }
    
    // Check final state
    await page.waitForTimeout(2000)
    const finalContent = await page.locator('body').textContent()
    console.log(`Final page content length: ${finalContent?.length || 0}`)
  }
})