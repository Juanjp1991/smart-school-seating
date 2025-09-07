import { test, expect } from '@playwright/test'

test.describe('Story 3.3: Basic UI Debug Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rosters')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('should display basic page structure', async ({ page }) => {
    console.log('🧪 Testing basic page structure...')
    
    // Check if page loaded
    const title = await page.title()
    console.log(`Page title: ${title}`)
    
    // Look for basic roster management elements
    const rosterElements = [
      'text=/roster/i',
      'text=/management/i',
      'text=/student/i',
      '[class*="roster"]',
      '[data-testid*="roster"]'
    ]
    
    for (const selector of rosterElements) {
      try {
        const isVisible = await page.locator(selector).first().isVisible()
        if (isVisible) {
          console.log(`✅ Found roster element: ${selector}`)
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true })
    console.log('📸 Screenshot saved for debugging')
    
    // Get page content for analysis
    const content = await page.locator('body').textContent()
    console.log(`Page content length: ${content?.length || 0}`)
    
    if (content && content.length > 100) {
      console.log('✅ Page has substantial content')
      
      // Look for any rule-related content
      if (content.toLowerCase().includes('rule')) {
        console.log('✅ Found rule-related content in page')
      } else {
        console.log('❌ No rule-related content found')
      }
      
      // Look for drag-related content
      if (content.toLowerCase().includes('drag') || content.includes('⋮⋮')) {
        console.log('✅ Found drag-related content')
      } else {
        console.log('❌ No drag-related content found')
      }
    } else {
      console.log('❌ Page appears to have minimal content')
    }
  })

  test('should check for roster creation', async ({ page }) => {
    console.log('🧪 Testing roster creation to enable drag testing...')
    
    // Look for create roster button
    const createButtonSelectors = [
      'button:has-text("Create Roster")',
      'button:has-text("New Roster")',
      'button:has-text("+ Roster")',
      '[class*="create"]',
      '[data-testid*="create"]'
    ]
    
    let foundCreateButton = false
    for (const selector of createButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          console.log(`✅ Found create button: ${selector}`)
          foundCreateButton = true
          
          // Try to click it to create a test roster
          await button.click()
          await page.waitForTimeout(1000)
          
          // Look for modal
          const modalSelectors = [
            '[role="dialog"]',
            '[class*="modal"]',
            '[data-testid*="modal"]'
          ]
          
          for (const modalSelector of modalSelectors) {
            try {
              const modal = page.locator(modalSelector).first()
              if (await modal.isVisible()) {
                console.log(`✅ Found modal: ${modalSelector}`)
                
                // Try to fill in a roster name and create it
                const input = modal.locator('input').first()
                if (await input.isVisible()) {
                  await input.fill('Test Roster for Drag Drop')
                  await page.waitForTimeout(500)
                  
                  const submitButton = modal.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")').first()
                  if (await submitButton.isVisible()) {
                    await submitButton.click()
                    await page.waitForTimeout(2000)
                    console.log('✅ Created test roster')
                    break
                  }
                }
              }
            } catch (e) {
              // Continue checking
            }
          }
          break
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!foundCreateButton) {
      console.log('❌ No create roster button found')
    }
  })

  test('should check for existing rosters and select one', async ({ page }) => {
    console.log('🧪 Testing roster selection...')
    
    // Look for any roster items
    const rosterItemSelectors = [
      '[class*="roster-item"]',
      '[data-testid*="roster"]',
      'text=/period/i',
      'text=/class/i',
      'text=/math/i',
      'text=/english/i',
      'li:has-text("Roster")',
      'div:has-text("Roster")'
    ]
    
    let foundRoster = false
    for (const selector of rosterItemSelectors) {
      try {
        const items = page.locator(selector).all()
        if (items.length > 0) {
          console.log(`✅ Found ${items.length} roster items with selector: ${selector}`)
          
          // Try to click the first one
          await items[0].click()
          await page.waitForTimeout(1000)
          foundRoster = true
          break
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!foundRoster) {
      console.log('❌ No roster items found to select')
    }
  })

  test('should check for rule creation interface', async ({ page }) => {
    console.log('🧪 Testing rule creation interface...')
    
    // Wait a bit for everything to load
    await page.waitForTimeout(2000)
    
    // Look for rule-related elements
    const ruleSelectors = [
      'text=/rule/i',
      'button:has-text("Rule")',
      'button:has-text("Create Rule")',
      '[class*="rule"]',
      '[data-testid*="rule"]'
    ]
    
    let foundRuleElements = false
    for (const selector of ruleSelectors) {
      try {
        const elements = page.locator(selector).all()
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} rule elements with selector: ${selector}`)
          foundRuleElements = true
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!foundRuleElements) {
      console.log('❌ No rule elements found')
    }
    
    // Check if we can find the compact rule list (which should be visible)
    const compactRuleList = page.locator('[class*="compact"]').first()
    try {
      if (await compactRuleList.isVisible()) {
        console.log('✅ Found compact rule list')
      }
    } catch (e) {
      console.log('❌ No compact rule list found')
    }
  })
})