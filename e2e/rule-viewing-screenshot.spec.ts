import { test, expect } from '@playwright/test'

test('Take screenshot of Story 3.2 implementation', async ({ page }) => {
  // Navigate to the rosters page
  await page.goto('http://localhost:3000/rosters')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'test-results/story-3.2-rosters-page.png', 
    fullPage: true 
  })
  
  // Test navigation to home and back
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')
  
  await page.screenshot({ 
    path: 'test-results/story-3.2-home-page.png', 
    fullPage: true 
  })
  
  // Check the actual title
  const title = await page.title()
  console.log(`📋 Actual page title: "${title}"`)
  
  // Check page content for rule-related functionality  
  const content = await page.textContent('body')
  const hasRuleContent = content?.toLowerCase().includes('rule') || 
                         content?.toLowerCase().includes('roster') ||
                         content?.toLowerCase().includes('seating')
  
  console.log(`📋 Page has rule-related content: ${hasRuleContent}`)
  console.log(`📋 Content length: ${content?.length} characters`)
  
  // Look for specific UI elements
  const buttons = await page.locator('button').allTextContents()
  const links = await page.locator('a').allTextContents()
  
  console.log(`📋 Found ${buttons.length} buttons:`, buttons.slice(0, 5))
  console.log(`📋 Found ${links.length} links:`, links.slice(0, 5))
  
  expect(hasRuleContent).toBeTruthy()
})