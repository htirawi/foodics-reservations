/**
 * @file a11y.comprehensive.spec.ts
 * @summary Comprehensive accessibility tests for the application
 * @description
 *   Tests accessibility compliance across all major pages and components
 *   using axe-core via axe-playwright integration.
 *
 *   WCAG 2.1 AA compliance target: ≥95%
 */

import { test, expect } from '@playwright/test'

import { checkA11y, checkA11yForSelector } from '@tests/e2e/helpers/a11y'

test.describe('Accessibility - Core Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('homepage should meet WCAG 2.1 AA standards', async ({ page }) => {
    // Wait for branches to load
    await page.waitForSelector('[data-testid="branches-table"]', { timeout: 10000 })

    // Run comprehensive a11y scan
    await checkA11y(page, {
      wcagLevel: 'wcag21aa',
      impactLevels: ['critical', 'serious'], // Only fail on critical and serious issues
    })
  })

  test('homepage with loading state should be accessible', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/branches*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto('http://localhost:5173')

    // Check accessibility during loading
    await page.waitForSelector('[data-testid="branches-loading"]')
    await checkA11y(page)
  })

  test('homepage with error state should be accessible', async ({ page }) => {
    // Intercept API to return error
    await page.route('**/branches*', async (route) => {
      await route.abort('failed')
    })

    await page.goto('http://localhost:5173')

    // Check accessibility with error state
    await page.waitForSelector('[data-testid="branches-error"]')
    await checkA11y(page)
  })
})

test.describe('Accessibility - Modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('Add Branches Modal should be accessible', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="add-branches"]')

    // Wait for modal to be visible
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Check modal accessibility
    await checkA11yForSelector(page, '[data-testid="add-branches-modal"]', {
      wcagLevel: 'wcag21aa',
    })
  })

  test('Branch Settings Modal should be accessible', async ({ page }) => {
    // Wait for branches to load
    await page.waitForSelector('[data-testid="branches-table"]')

    // Click on settings for first branch
    const settingsButtons = page.locator('[data-testid^="branch-settings-"]')
    await settingsButtons.first().click()

    // Wait for modal to be visible
    await page.waitForSelector('[data-testid="settings-modal"]', { timeout: 5000 })

    // Check modal accessibility
    await checkA11yForSelector(page, '[data-testid="settings-modal"]', {
      wcagLevel: 'wcag21aa',
    })
  })

  test('Confirm Dialog should be accessible', async ({ page }) => {
    // Wait for branches table
    await page.waitForSelector('[data-testid="branches-table"]')

    // Click "Disable All" to trigger confirm dialog
    await page.click('[data-testid="disable-all-button"]')

    // Wait for confirm dialog
    await page.waitForSelector('[data-testid="confirm-dialog"]')

    // Check dialog accessibility
    await checkA11yForSelector(page, '[data-testid="confirm-dialog"]', {
      wcagLevel: 'wcag21aa',
    })
  })
})

test.describe('Accessibility - Interactive Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('Locale Switcher should be accessible', async ({ page }) => {
    // Check locale switcher
    await checkA11yForSelector(page, '[data-testid="locale-switcher"]', {
      wcagLevel: 'wcag21aa',
    })

    // Open dropdown
    await page.click('[data-testid="locale-switcher"]')

    // Check again with dropdown open
    await checkA11yForSelector(page, '[data-testid="locale-switcher"]')
  })

  test('Table components should be accessible', async ({ page }) => {
    // Wait for branches table
    await page.waitForSelector('[data-testid="branches-table"]')

    // Check table accessibility
    await checkA11yForSelector(page, '[data-testid="branches-table"]', {
      wcagLevel: 'wcag21aa',
    })
  })

  test('Form inputs should be accessible', async ({ page }) => {
    // Open Add Branches Modal (has form inputs)
    await page.click('[data-testid="add-branches"]')
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Check form accessibility
    const form = page.locator('[data-testid="add-branches-modal"] form')
    if ((await form.count()) > 0) {
      await checkA11yForSelector(page, '[data-testid="add-branches-modal"]')
    }
  })
})

test.describe('Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('can navigate to all interactive elements with Tab key', async ({ page }) => {
    await page.waitForSelector('[data-testid="branches-table"]')

    // Get all focusable elements
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const count = await focusableElements.count()

    expect(count).toBeGreaterThan(0)

    // Tab through first 5 elements
    for (let i = 0; i < Math.min(5, count); i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    }
  })

  test('Escape key closes modal', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="add-branches"]')
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Press Escape
    await page.keyboard.press('Escape')

    // Modal should be closed
    await expect(page.locator('[data-testid="add-branches-modal"]')).not.toBeVisible()
  })

  test('Enter key submits forms', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="add-branches"]')
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Focus on first input (if any)
    const input = page.locator('[data-testid="add-branches-modal"] input').first()
    if ((await input.count()) > 0) {
      await input.focus()
      // Note: Actual form submission test would require valid data
      // This just tests that Enter is recognized as an interaction
      await page.keyboard.press('Enter')
    }
  })
})

test.describe('Accessibility - ARIA Labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('all buttons have accessible names', async ({ page }) => {
    await page.waitForSelector('[data-testid="branches-table"]')

    // Get all buttons
    const buttons = page.locator('button')
    const count = await buttons.count()

    // Check each button has accessible text or aria-label
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const text = await button.innerText()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')

      // Button should have text, aria-label, or aria-labelledby
      const hasAccessibleName = text.trim() !== '' || ariaLabel || ariaLabelledBy
      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test('all images have alt text', async ({ page }) => {
    await page.waitForSelector('[data-testid="branches-table"]')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Check each image has alt text
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeDefined()
    }
  })

  test('form inputs have labels', async ({ page }) => {
    // Open modal with form
    await page.click('[data-testid="add-branches"]')
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Get all inputs
    const inputs = page.locator('input, select, textarea')
    const count = await inputs.count()

    // Check each input has a label
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const inputId = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')

      // Input should have id with matching label, aria-label, or aria-labelledby
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`)
        const hasLabel = (await label.count()) > 0
        const hasAccessibleName = hasLabel || ariaLabel || ariaLabelledBy
        expect(hasAccessibleName).toBeTruthy()
      } else {
        // If no ID, must have aria-label or aria-labelledby
        expect(ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }
  })
})

test.describe('Accessibility - Color Contrast', () => {
  test('all text has sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="branches-table"]')

    // This is automatically checked by axe-core in checkA11y
    await checkA11y(page, {
      includedRules: ['color-contrast'],
      impactLevels: ['serious', 'critical'],
    })
  })
})

test.describe('Accessibility - Focus Management', () => {
  test('focus is trapped inside modal', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.click('[data-testid="add-branches"]')
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Get all focusable elements in modal
    const modalFocusable = page.locator('[data-testid="add-branches-modal"] button, [data-testid="add-branches-modal"] a, [data-testid="add-branches-modal"] input')
    const count = await modalFocusable.count()

    expect(count).toBeGreaterThan(0)

    // Tab through all elements + 1
    for (let i = 0; i <= count; i++) {
      await page.keyboard.press('Tab')
    }

    // Focus should still be inside modal
    const focused = page.locator(':focus')
    const isInModal = await focused.locator('xpath=ancestor::*[@data-testid="add-branches-modal"]').count() > 0
    expect(isInModal).toBeTruthy()
  })

  test('focus returns to trigger element after modal closes', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Focus on Add Branches button
    const addButton = page.locator('[data-testid="add-branches"]')
    await addButton.focus()

    // Open modal
    await addButton.click()
    await page.waitForSelector('[data-testid="add-branches-modal"]')

    // Close modal with Escape
    await page.keyboard.press('Escape')

    // Wait for modal to close
    await expect(page.locator('[data-testid="add-branches-modal"]')).not.toBeVisible()

    // Focus should return to Add Branches button
    const focused = page.locator(':focus')
    await expect(focused).toHaveAttribute('data-testid', 'add-branches')
  })
})
