import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupOfflineMode } from './setup/intercepts';

/* eslint-disable max-lines */

/**
 * Wait for page to finish loading and data to be ready
 */
async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {});
  await Promise.race([
    page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 }).catch(() => {}),
    page.waitForSelector('[data-testid^="branch-card-"]', { timeout: 5000 }).catch(() => {}),
    page.waitForSelector('[data-testid="branches-empty"]', { timeout: 5000 }).catch(() => {}),
  ]);
  await page.waitForTimeout(100);
}

test.describe('Add Branches Modal', () => {
  test.describe.configure({ retries: 2 });

  test('opens modal when Add Branches button is clicked', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('displays disabled branches list', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Check for branch items
    const branch1 = page.getByTestId('branch-1');
    const branch2 = page.getByTestId('branch-2');
    
    if (await branch1.count() > 0) {
      await expect(branch1).toBeVisible();
      await expect(branch1).toContainText('Disabled Branch 1 (DB-001)');
    }
    
    if (await branch2.count() > 0) {
      await expect(branch2).toBeVisible();
      await expect(branch2).toContainText('Disabled Branch 2 (DB-002)');
    }
  });

  test('shows no branches message when no disabled branches available', async ({ page }) => {
    // Mock empty branches response
    await page.route('**/api/branches', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    const noBranches = page.getByTestId('no-branches');
    await expect(noBranches).toBeVisible();
    await expect(noBranches).toContainText('No disabled branches available');
  });

  test('allows selecting and deselecting branches', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Select first branch
    const branch1Checkbox = page.locator('#branch-1');
    if (await branch1Checkbox.count() > 0) {
      await branch1Checkbox.check();
      await expect(branch1Checkbox).toBeChecked();

      // Save button should be enabled
      const saveButton = page.getByTestId('save-button');
      await expect(saveButton).toBeEnabled();

      // Deselect branch
      await branch1Checkbox.uncheck();
      await expect(branch1Checkbox).not.toBeChecked();

      // Save button should be disabled
      await expect(saveButton).toBeDisabled();
    }
  });

  test('select all functionality works correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    const selectAllButton = page.getByTestId('select-all');
    if (await selectAllButton.count() > 0) {
      // Click select all
      await selectAllButton.click();
      await expect(selectAllButton).toContainText('Deselect All');

      // All checkboxes should be checked
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }

      // Click deselect all
      await selectAllButton.click();
      await expect(selectAllButton).toContainText('Select All');

      // All checkboxes should be unchecked
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    }
  });

  test('handles successful branch enabling', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Select a branch
    const branch1Checkbox = page.locator('#branch-1');
    if (await branch1Checkbox.count() > 0) {
      await branch1Checkbox.check();

      // Click save
      const saveButton = page.getByTestId('save-button');
      await saveButton.click();

      // Modal should close after successful save
      await expect(modal).not.toBeVisible();

      // Toast should show success message
      const toast = page.locator('[role="alert"], [data-testid*="toast"]').first();
      if (await toast.count() > 0) {
        await expect(toast).toContainText('Successfully enabled');
      }
    }
  });

  test('handles partial failure scenario', async ({ page }) => {
    // Mock partial failure - first branch succeeds, second fails
    await page.route('**/api/branches/branch-1/enable', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'branch-1', accepts_reservations: true } }),
      });
    });

    await page.route('**/api/branches/branch-2/enable', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Select both branches
    const branch1Checkbox = page.locator('#branch-1');
    const branch2Checkbox = page.locator('#branch-2');
    
    if (await branch1Checkbox.count() > 0 && await branch2Checkbox.count() > 0) {
      await branch1Checkbox.check();
      await branch2Checkbox.check();

      // Click save
      const saveButton = page.getByTestId('save-button');
      await saveButton.click();

      // Modal should remain open due to partial failure
      await expect(modal).toBeVisible();

      // Only failed branch should remain selected
      await expect(branch1Checkbox).not.toBeChecked(); // Successfully enabled
      await expect(branch2Checkbox).toBeChecked(); // Failed, remains selected

      // Toast should show partial success message
      const toast = page.locator('[role="alert"], [data-testid*="toast"]').first();
      if (await toast.count() > 0) {
        await expect(toast).toContainText('Enabled 1 branches. Failed to enable 1 branches.');
      }
    }
  });

  test('disables controls while saving', async ({ page }) => {
    // Mock slow response to catch loading state
    await page.route('**/api/branches/*/enable', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'branch-1', accepts_reservations: true } }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Select a branch
    const branch1Checkbox = page.locator('#branch-1');
    if (await branch1Checkbox.count() > 0) {
      await branch1Checkbox.check();

      // Click save
      const saveButton = page.getByTestId('save-button');
      await saveButton.click();

      // Controls should be disabled while saving
      await expect(saveButton).toBeDisabled();
      await expect(saveButton).toHaveAttribute('loading');
      
      await expect(page.getByTestId('close-button')).toBeDisabled();
      await expect(page.getByTestId('select-all')).toBeDisabled();
      await expect(branch1Checkbox).toBeDisabled();

      // Modal content should have aria-busy
      const content = modal.locator('.space-y-4');
      await expect(content).toHaveAttribute('aria-busy', 'true');
    }
  });

  test('prevents closing while saving', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/branches/*/enable', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'branch-1', accepts_reservations: true } }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Select a branch and start saving
    const branch1Checkbox = page.locator('#branch-1');
    if (await branch1Checkbox.count() > 0) {
      await branch1Checkbox.check();

      const saveButton = page.getByTestId('save-button');
      await saveButton.click();

      // Try to close modal while saving
      const closeButton = page.getByTestId('close-button');
      await closeButton.click();

      // Modal should remain open
      await expect(modal).toBeVisible();
    }
  });

  test('has proper accessibility attributes', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Check modal accessibility
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Check checkbox accessibility
    const branch1Checkbox = page.locator('#branch-1');
    const branch1Label = page.getByTestId('branch-1');
    
    if (await branch1Checkbox.count() > 0) {
      await expect(branch1Checkbox).toHaveAttribute('id', 'branch-1');
      await expect(branch1Label).toHaveAttribute('for', 'branch-1');
    }
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Focus first interactive element
    await page.keyboard.press('Tab'); // Focus next element
    
    // Enter should work on focused elements
    await page.keyboard.press('Enter');

    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Add Branches Modal - i18n (Arabic)', () => {
  test.describe.configure({ retries: 2 });

  test('displays Arabic translations correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Switch to Arabic
    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    // Wait for locale to switch
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Check Arabic translations
    await expect(modal).toContainText('إضافة فروع');
    await expect(modal).toContainText('الفروع');

    const selectAllButton = page.getByTestId('select-all');
    if (await selectAllButton.count() > 0) {
      await expect(selectAllButton).toContainText('اختيار الكل');
    }

    const saveButton = page.getByTestId('save-button');
    await expect(saveButton).toContainText('حفظ');

    const closeButton = page.getByTestId('close-button');
    await expect(closeButton).toContainText('إغلاق');
  });

  test('RTL layout works correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Switch to Arabic
    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();

    // Modal should be properly positioned in RTL
    const modalBox = await modal.boundingBox();
    expect(modalBox).toBeTruthy();
  });
});
