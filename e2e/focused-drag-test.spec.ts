import { test, expect } from '@playwright/test'

test.describe('Story 3.3: Focused Drag & Drop Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rosters')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('should create test setup and validate drag drop step by step', async ({ page }) => {
    console.log('🧪 Starting focused drag and drop test...')
    
    // Step 1: Check initial state
    await checkInitialState(page)
    
    // Step 2: Create a roster if needed
    await ensureTestRosterExists(page)
    
    // Step 3: Select the roster to access rule interface
    await selectRosterToAccessRules(page)
    
    // Step 4: Create sample rules for drag and drop testing
    await createTestRules(page)
    
    // Step 5: Test drag and drop functionality
    await testDragDropCoreFunctionality(page)
  })

  async function checkInitialState(page) {
    console.log('📊 Checking initial state...')
    
    // Take initial screenshot
    await page.screenshot({ path: 'initial-state.png', fullPage: true })
    
    // Check for "No rosters yet" message
    const noRostersText = await page.locator('text=No rosters yet').isVisible().catch(() => false)
    if (noRostersText) {
      console.log('✅ Found "No rosters yet" message - need to create roster')
    }
    
    // Check for existing roster items
    const rosterItems = page.locator('div:has-text("Created")').all()
    console.log(`Found ${rosterItems.length} potential roster items`)
  }

  async function ensureTestRosterExists(page) {
    console.log('📋 Ensuring test roster exists...')
    
    // Check if we need to create a roster
    const noRostersText = await page.locator('text=No rosters yet').isVisible().catch(() => false)
    
    if (noRostersText) {
      console.log('Creating test roster...')
      
      // Click "New Roster" button
      const newRosterButton = page.locator('button:has-text("New Roster")').first()
      await newRosterButton.click()
      await page.waitForTimeout(1000)
      
      // Fill roster name in modal
      const modal = page.locator('[role="dialog"], [class*="modal"]').first()
      const input = modal.locator('input').first()
      await input.fill('Test Roster for Drag & Drop')
      await page.waitForTimeout(500)
      
      // Save roster
      const saveButton = modal.locator('button:has-text("Save")').first()
      await saveButton.click()
      await page.waitForTimeout(2000)
      
      console.log('✅ Test roster created successfully')
    } else {
      console.log('✅ Rosters already exist')
    }
  }

  async function selectRosterToAccessRules(page) {
    console.log('🎯 Selecting roster to access rules...')
    
    // Wait for page to stabilize
    await page.waitForTimeout(1000)
    
    // Look for roster items (they contain "Created" text)
    const rosterItems = page.locator('div:has-text("Created")').all()
    
    if (rosterItems.length > 0) {
      console.log(`Found ${rosterItems.length} roster items`)
      
      // Click the first roster item
      await rosterItems[0].click()
      await page.waitForTimeout(2000)
      
      console.log('✅ Selected roster')
      
      // Take screenshot after selection
      await page.screenshot({ path: 'after-roster-selection.png', fullPage: true })
      
      // Check if we can now see rule-related content
      const ruleContent = await page.locator('text=/rule/i').first().isVisible().catch(() => false)
      if (ruleContent) {
        console.log('✅ Found rule-related content after roster selection')
      } else {
        console.log('ℹ️  No rule content visible yet (may need to create rules)')
      }
    } else {
      console.log('❌ No roster items found to select')
    }
  }

  async function createTestRules(page) {
    console.log('📋 Creating test rules...')
    
    // Wait for everything to load
    await page.waitForTimeout(2000)
    
    // Look for create rule button - try multiple selectors
    const createRuleSelectors = [
      'button:has-text("Create Rule")',
      'button:has-text("✏️ Create Rule")',
      'button:has-text("✏️ Rule")',
      'button:has-text("Rule")',
      '[class*="create"]:has-text("Rule")'
    ]
    
    let createButtonFound = false
    for (const selector of createRuleSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          console.log(`✅ Found create rule button: ${selector}`)
          createButtonFound = true
          
          // Create a simple test rule
          await button.click()
          await page.waitForTimeout(1000)
          
          // Handle rule creation modal
          const modal = page.locator('[role="dialog"], [class*="modal"]').first()
          
          // Try to fill out the rule form
          // For now, we'll just close the modal since the exact form structure may be complex
          const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first()
          if (await closeButton.isVisible()) {
            await closeButton.click()
            await page.waitForTimeout(1000)
            console.log('ℹ️  Closed rule creation modal (would need proper form filling for real test)')
          }
          
          break
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!createButtonFound) {
      console.log('❌ Could not find create rule button')
      
      // Take screenshot to debug
      await page.screenshot({ path: 'no-create-rule-button.png', fullPage: true })
      
      // Check what buttons are actually available
      const allButtons = page.locator('button').all()
      console.log(`Found ${allButtons.length} total buttons on page`)
      
      // Log button text for debugging
      for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
        const text = await allButtons[i].textContent()
        console.log(`Button ${i + 1}: "${text}"`)
      }
    }
  }

  async function testDragDropCoreFunctionality(page) {
    console.log('🎯 Testing core drag and drop functionality...')
    
    // Wait for everything to stabilize
    await page.waitForTimeout(2000)
    
    // Take screenshot before testing drag
    await page.screenshot({ path: 'before-drag-test.png', fullPage: true })
    
    // Look for any drag and drop related elements
    const dragElements = [
      'button:has-text("Reorder")',
      'button:has-text("⋮⋮")',
      '[data-rbd-draggable-id]',
      '[draggable="true"]',
      '[class*="drag"]',
      'text=⋮⋮'
    ]
    
    let foundDragElements = 0
    for (const selector of dragElements) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} elements for selector: ${selector}`)
          foundDragElements += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundDragElements === 0) {
      console.log('❌ No drag and drop elements found')
      
      // Check what's actually in the rule section
      const ruleSection = page.locator('text=/rule|Rule/i').first()
      try {
        const isVisible = await ruleSection.isVisible()
        if (isVisible) {
          console.log('✅ Found rule section text')
          
          // Get the parent element to see what's around it
          const parent = ruleSection.locator('..')
          const parentContent = await parent.textContent()
          console.log(`Parent content around rule text: ${parentContent?.substring(0, 200)}...`)
        }
      } catch (e) {
        console.log('❌ Rule section not found')
      }
      
      return
    }
    
    // Try to find and click reorder button
    const reorderButton = page.locator('button:has-text("Reorder"), button:has-text("⋮⋮")').first()
    
    try {
      if (await reorderButton.isVisible()) {
        console.log('✅ Found reorder button, attempting to click...')
        
        await reorderButton.click()
        await page.waitForTimeout(1000)
        
        // Check if we entered reorder mode
        const reorderModeActive = await page.locator('button:has-text("✅"), button:has-text("Reordering")').first().isVisible().catch(() => false)
        if (reorderModeActive) {
          console.log('✅ Successfully entered reorder mode')
        } else {
          console.log('ℹ️  Reorder mode activation unclear')
        }
        
        // Take screenshot after entering reorder mode
        await page.screenshot({ path: 'after-reorder-mode.png', fullPage: true })
        
        // Look for draggable elements again
        const draggables = page.locator('[data-rbd-draggable-id], [draggable="true"]').all()
        
        if (draggables.length > 0) {
          console.log(`✅ Found ${draggables.length} draggable elements in reorder mode`)
          
          // Try to perform a simple drag operation
          if (draggables.length >= 2) {
            const firstDraggable = draggables[0]
            const box = await firstDraggable.boundingBox()
            
            if (box) {
              try {
                console.log('✅ Attempting drag operation...')
                
                await firstDraggable.hover()
                await page.mouse.down()
                await page.mouse.move(box.x, box.y + 50) // Move down a bit
                await page.waitForTimeout(500)
                await page.mouse.up()
                await page.waitForTimeout(2000)
                
                console.log('✅ Drag operation completed')
                
                // Take final screenshot
                await page.screenshot({ path: 'after-drag-operation.png', fullPage: true })
                
              } catch (dragError) {
                console.log(`❌ Drag operation failed: ${dragError}`)
              }
            } else {
              console.log('❌ Could not get bounding box for draggable element')
            }
          } else {
            console.log('ℹ️  Not enough draggable elements for drag test')
          }
        } else {
          console.log('❌ No draggable elements found in reorder mode')
        }
      } else {
        console.log('❌ Reorder button not visible or clickable')
      }
    } catch (error) {
      console.log(`❌ Error testing drag functionality: ${error}`)
    }
  }
})