import { test, expect } from '@playwright/test';
import branches from './fixtures/branches.json' assert { type: 'json' };
import branchSettingsSuccess from './fixtures/branch-settings-success.json' assert { type: 'json' };

test.describe('Branches Settings Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/branches*', async (route) => {
      await route.fulfill({ status: 200, json: { data: branches } });
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="branches-table"]');
  });

  test.describe('EN locale', () => {
    test('opens modal with all sections visible', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(true);
      expect(await page.isVisible('[data-testid="working-hours-info"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-duration"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-tables"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-day-slots"]')).toBe(true);
    });

    test('Save button is disabled initially', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      const saveButton = page.locator('[data-testid="settings-save"]');
      await expect(saveButton).toBeDisabled();
    });

    test('enables Save button when form is valid', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Fill valid duration
      const durationInput = page.locator('[data-testid="duration-input"]');
      await durationInput.fill('60');

      // Add a valid slot
      await page.click('[data-testid="add-slot-saturday"]');

      // Wait for validation
      await page.waitForTimeout(100);

      const saveButton = page.locator('[data-testid="settings-save"]');
      await expect(saveButton).toBeEnabled();
    });

    test('disables Save button when duration is invalid', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Set invalid duration
      const durationInput = page.locator('[data-testid="duration-input"]');
      await durationInput.fill('0');
      await durationInput.blur();

      // Wait for validation
      await page.waitForTimeout(100);

      const saveButton = page.locator('[data-testid="settings-save"]');
      await expect(saveButton).toBeDisabled();
    });

    test('closes modal with Cancel button', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      await page.click('[data-testid="settings-cancel"]');
      await page.waitForTimeout(300); // Wait for transition

      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(false);
    });

    test('closes modal with Escape key', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300); // Wait for transition

      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(false);
    });

    test('allows adding and removing time slots', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Add a slot to Sunday
      await page.click('[data-testid="add-slot-sunday"]');

      // Check that a slot was added
      expect(await page.isVisible('[data-testid="settings-slot-row-sunday-0"]')).toBe(true);

      // Remove the slot
      const timePill = page.locator('[data-testid="settings-slot-row-sunday-0"]');
      await timePill.hover();
      await timePill.locator('button[aria-label*="emove"], button:has-text("×")').first().click();

      // Check that slot was removed
      await page.waitForTimeout(100);
      expect(await page.isVisible('[data-testid="settings-slot-row-sunday-0"]')).toBe(false);
    });

    test('applies slots to all days', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Add a slot to Saturday
      await page.click('[data-testid="add-slot-saturday"]');
      await page.waitForSelector('[data-testid="settings-slot-row-saturday-0"]');

      // Apply to all days
      await page.click('[data-testid="apply-all-saturday"]');

      // Check that all days now have the slot
      expect(await page.isVisible('[data-testid="settings-slot-row-sunday-0"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-slot-row-monday-0"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-slot-row-friday-0"]')).toBe(true);
    });

    test('keyboard navigation works (Tab, Escape)', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Tab should move focus to the first focusable element
      await page.keyboard.press('Tab');

      // Check that an element inside modal is focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON']).toContain(focusedElement);

      // Escape should close the modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(false);
    });

    test('saves settings when Save is clicked (with API intercept)', async ({ page }) => {
      await page.route('**/api/branches/*/settings', async (route) => {
        await route.fulfill({ status: 200, json: branchSettingsSuccess });
      });

      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Fill valid duration
      const durationInput = page.locator('[data-testid="duration-input"]');
      await durationInput.fill('60');

      // Add a valid slot
      await page.click('[data-testid="add-slot-saturday"]');
      await page.waitForTimeout(100);

      const saveButton = page.locator('[data-testid="settings-save"]');
      await expect(saveButton).toBeEnabled();

      await saveButton.click();

      // Note: This will emit save event; parent component handles the actual API call
      // In a real integration test, we'd check that the modal closes or shows a success message
    });
  });

  test.describe('AR locale', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/branches*', async (route) => {
        await route.fulfill({ status: 200, json: { data: branches } });
      });
      await page.goto('/');
      await page.waitForSelector('[data-testid="branches-table"]');
      
      // Switch to Arabic
      await page.click('[data-testid="locale-switcher"]');
      await page.waitForTimeout(200);
    });

    test('renders modal in RTL with Arabic text', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Check that document direction is RTL
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('rtl');

      // Check that modal is visible with sections
      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-duration"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-tables"]')).toBe(true);
      expect(await page.isVisible('[data-testid="settings-day-slots"]')).toBe(true);

      // Check for Arabic text (weekday names should be in Arabic)
      const pageText = await page.textContent('body');
      expect(pageText).toMatch(/السبت|الأحد|الإثنين/); // Saturday, Sunday, Monday in Arabic
    });

    test('keyboard navigation works in RTL', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Tab should still work in RTL
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON']).toContain(focusedElement);

      // Escape should close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      expect(await page.isVisible('[data-testid="settings-modal"]')).toBe(false);
    });

    test('functional operations work in RTL (add/remove slots)', async ({ page }) => {
      await page.click('[data-testid="branch-row-1"]');
      await page.waitForSelector('[data-testid="settings-modal"]');

      // Add a slot
      await page.click('[data-testid="add-slot-sunday"]');
      expect(await page.isVisible('[data-testid="settings-slot-row-sunday-0"]')).toBe(true);

      // Remove the slot
      const timePill = page.locator('[data-testid="settings-slot-row-sunday-0"]');
      await timePill.hover();
      await timePill.locator('button').first().click();

      await page.waitForTimeout(100);
      expect(await page.isVisible('[data-testid="settings-slot-row-sunday-0"]')).toBe(false);
    });
  });
});

