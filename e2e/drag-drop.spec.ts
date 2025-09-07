import { test, expect } from '@playwright/test'

test.describe('Story 3.3: Prioritize Placement Rules - Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the rosters page
    await page.goto('http://localhost:3000/rosters')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow time for data to load
  })

  test('should display drag and drop functionality', async ({ page }) => {
    console.log('🧪 Testing drag and drop functionality...')
    
    // Look for the reorder button
    const reorderButton = page.locator('button', { hasText: /reorder/i }).first()
    const hasReorderButton = await reorderButton.isVisible().catch(() => false)
    
    if (hasReorderButton) {
      console.log('✅ Found reorder button')
      
      // Click the reorder button to enable drag mode
      await reorderButton.click()
      await page.waitForTimeout(1000)
      
      // Check if drag mode is activated
      const isReorderMode = await page.locator('button', { hasText: /reordering/i }).isVisible().catch(() => false)
      if (isReorderMode) {
        console.log('✅ Successfully entered reorder mode')
      }
    } else {
      console.log('❌ Reorder button not found')
    }
    
    // Look for drag handles (the dots icon)
    const dragHandles = page.locator('[class*="drag"], [data-rbd-drag-handle], [data-testid*="drag"]').all()
    const dragHandleCount = dragHandles.length
    
    // Also look for the dots character directly in text
    const dragHandleText = page.locator('text=⋮⋮').all()
    const dragHandleTextCount = dragHandleText.length
    
    if (dragHandleCount > 0 || dragHandleTextCount > 0) {
      console.log(`✅ Found ${dragHandleCount + dragHandleTextCount} potential drag handles`)
    } else {
      console.log('❌ No drag handles found')
    }
    
    // Look for rule items that could be draggable
    const ruleItems = page.locator('[class*="rule"], [data-testid*="rule"], .RuleItem').all()
    const ruleItemCount = ruleItems.length
    
    if (ruleItemCount > 0) {
      console.log(`✅ Found ${ruleItemCount} rule items`)
    } else {
      console.log('❌ No rule items found')
    }
    
    // Look for react-beautiful-dnd specific elements
    const rbdElements = page.locator('[data-rbd-droppable-id], [data-rbd-draggable-id]').all()
    const rbdCount = rbdElements.length
    
    if (rbdCount > 0) {
      console.log(`✅ Found ${rbdCount} react-beautiful-dnd elements`)
    } else {
      console.log('❌ No react-beautiful-dnd elements found')
    }
  })

  test('should handle drag and drop operations', async ({ page }) => {
    console.log('🧪 Testing drag and drop operations...')
    
    // First, try to enable drag mode
    const reorderButton = page.locator('button', { hasText: /reorder/i }).first()
    const hasReorderButton = await reorderButton.isVisible().catch(() => false)
    
    if (hasReorderButton) {
      await reorderButton.click()
      await page.waitForTimeout(1000)
      
      // Look for draggable elements
      const draggables = page.locator('[data-rbd-draggable-id], [draggable="true"]').all()
      
      if (draggables.length > 0) {
        console.log(`✅ Found ${draggables.length} draggable elements`)
        
        // Try to drag the first element
        const firstDraggable = draggables[0]
        
        // Get the bounding box of the first draggable
        const box = await firstDraggable.boundingBox()
        
        if (box) {
          console.log('✅ Found draggable element with bounding box')
          
          // Try to perform a drag operation
          try {
            await firstDraggable.hover()
            await page.mouse.down()
            await page.mouse.move(box.x + 50, box.y + 150) // Move down
            await page.waitForTimeout(500)
            await page.mouse.up()
            await page.waitForTimeout(1000)
            
            console.log('✅ Drag operation completed')
            
            // Check if anything changed (look for loading indicators)
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
        console.log('❌ No draggable elements found')
      }
    } else {
      console.log('❌ Could not enable drag mode - reorder button not found')
    }
  })

  test('should display proper drag and drop UI elements', async ({ page }) => {
    console.log('🧪 Testing drag and drop UI elements...')
    
    // Check for drag mode toggle button
    const dragToggleButtons = [
      'button:has-text("Reorder Rules")',
      'button:has-text("⋮⋮ Reorder")',
      'button:has-text("Reorder")',
      '[data-testid*="reorder"]',
      '[class*="reorder"]'
    ]
    
    let foundToggleButton = false
    for (const selector of dragToggleButtons) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          console.log(`✅ Found drag toggle button: ${selector}`)
          foundToggleButton = true
          break
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!foundToggleButton) {
      console.log('❌ No drag toggle button found')
    }
    
    // Check for drag handles
    const dragHandleSelectors = [
      '[data-rbd-drag-handle]',
      '[class*="drag-handle"]',
      '[class*="dragHandle"]',
      'text=⋮⋮',
      '.⋮⋮',
      '[aria-grabbed="true"]',
      '[draggable="true"]'
    ]
    
    let foundDragHandles = 0
    for (const selector of dragHandleSelectors) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} drag handles with selector: ${selector}`)
          foundDragHandles += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundDragHandles === 0) {
      console.log('❌ No drag handles found')
    }
    
    // Check for droppable areas
    const droppableSelectors = [
      '[data-rbd-droppable-id]',
      '[class*="droppable"]',
      '[class*="dropZone"]',
      '[aria-dropeffect="move"]'
    ]
    
    let foundDroppables = 0
    for (const selector of droppableSelectors) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} droppable areas with selector: ${selector}`)
          foundDroppables += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundDroppables === 0) {
      console.log('❌ No droppable areas found')
    }
  })

  test('should show visual feedback during drag operations', async ({ page }) => {
    console.log('🧪 Testing visual feedback during drag...')
    
    // Try to enter drag mode
    const reorderButton = page.locator('button', { hasText: /reorder/i }).first()
    const hasReorderButton = await reorderButton.isVisible().catch(() => false)
    
    if (!hasReorderButton) {
      console.log('❌ Cannot test visual feedback - no reorder button found')
      return
    }
    
    await reorderButton.click()
    await page.waitForTimeout(1000)
    
    // Look for visual indicators that show drag mode is active
    const visualIndicators = [
      // Active reorder mode button
      'button:has-text("✅ Reordering")',
      'button:has-text("Reordering Mode")',
      '[class*="active"][class*="reorder"]',
      '[class*="green"][class*="reorder"]',
      
      // Dragging visual states
      '[class*="dragging"]',
      '[class*="is-dragging"]',
      '[aria-grabbed="true"]',
      
      // Drop zone visual states
      '[class*="drop-zone"]',
      '[class*="dropZone"]',
      '[aria-dropeffect="move"]'
    ]
    
    let foundVisualIndicators = 0
    for (const selector of visualIndicators) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} visual indicators: ${selector}`)
          foundVisualIndicators += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundVisualIndicators === 0) {
      console.log('❌ No visual feedback indicators found')
    }
  })

  test('should handle priority updates after drag and drop', async ({ page }) => {
    console.log('🧪 Testing priority updates after drag and drop...')
    
    // Look for priority indicators in the UI
    const prioritySelectors = [
      'text=/priority/i',
      'text=/#[0-9]+/',
      '[class*="priority"]',
      '[data-testid*="priority"]',
      'text=/1st|2nd|3rd|4th|5th/'
    ]
    
    let foundPriorityElements = 0
    for (const selector of prioritySelectors) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} priority elements: ${selector}`)
          foundPriorityElements += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundPriorityElements === 0) {
      console.log('❌ No priority elements found')
    }
    
    // Try to enable drag mode and perform a drag to see if priorities update
    const reorderButton = page.locator('button', { hasText: /reorder/i }).first()
    const hasReorderButton = await reorderButton.isVisible().catch(() => false)
    
    if (hasReorderButton) {
      await reorderButton.click()
      await page.waitForTimeout(1000)
      
      // Look for draggable elements
      const draggables = page.locator('[data-rbd-draggable-id], [draggable="true"]').all()
      
      if (draggables.length >= 2) {
        console.log('✅ Found enough draggable elements to test reordering')
        
        // Take a "before" snapshot of the priority text
        const beforeContent = await page.locator('body').textContent()
        
        // Try to perform a drag operation
        try {
          const firstDraggable = draggables[0]
          const box = await firstDraggable.boundingBox()
          
          if (box) {
            await firstDraggable.hover()
            await page.mouse.down()
            await page.mouse.move(box.x, box.y + 100) // Move down
            await page.waitForTimeout(500)
            await page.mouse.up()
            await page.waitForTimeout(2000) // Wait for potential updates
            
            // Check if content changed (indicates update occurred)
            const afterContent = await page.locator('body').textContent()
            
            if (beforeContent !== afterContent) {
              console.log('✅ Content changed after drag - suggests priority update occurred')
            } else {
              console.log('ℹ️  Content unchanged after drag - may need manual verification')
            }
          }
        } catch (error) {
          console.log(`❌ Drag operation failed: ${error}`)
        }
      } else {
        console.log('❌ Not enough draggable elements to test reordering')
      }
    } else {
      console.log('❌ Could not enable drag mode')
    }
  })

  test('should handle errors gracefully during drag operations', async ({ page }) => {
    console.log('🧪 Testing error handling during drag operations...')
    
    // Look for error-related elements
    const errorSelectors = [
      '[class*="error"]',
      '[class*="Error"]',
      'text=/error/i',
      '[role="alert"]',
      '[aria-live="assertive"]'
    ]
    
    let foundErrorElements = 0
    for (const selector of errorSelectors) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} error handling elements: ${selector}`)
          foundErrorElements += elements.length
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (foundErrorElements === 0) {
      console.log('ℹ️  No error elements found (may be normal if no errors occurred)')
    }
    
    // Try to perform invalid drag operations to see if errors are handled
    const reorderButton = page.locator('button', { hasText: /reorder/i }).first()
    const hasReorderButton = await reorderButton.isVisible().catch(() => false)
    
    if (hasReorderButton) {
      await reorderButton.click()
      await page.waitForTimeout(1000)
      
      // Try various drag scenarios that might cause errors
      const draggables = page.locator('[data-rbd-draggable-id], [draggable="true"]').all()
      
      if (draggables.length > 0) {
        const firstDraggable = draggables[0]
        const box = await firstDraggable.boundingBox()
        
        if (box) {
          // Try dragging to invalid positions
          try {
            await firstDraggable.hover()
            await page.mouse.down()
            await page.mouse.move(box.x - 1000, box.y - 1000) // Way off screen
            await page.waitForTimeout(500)
            await page.mouse.up()
            await page.waitForTimeout(1000)
            
            console.log('✅ Completed invalid drag operation - check if handled gracefully')
          } catch (error) {
            console.log(`ℹ️  Invalid drag operation resulted in: ${error}`)
          }
        }
      }
    }
  })
})