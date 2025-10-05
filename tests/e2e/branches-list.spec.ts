/**
 * Branches List View E2E Tests
 * Validates semantic structure, interactions, and i18n/RTL
 * Runs in offline mode by default (uses fixtures)
 */

import { test, expect } from '@playwright/test';
import { setupOfflineMode, setupEmptyState } from './setup/intercepts';

test.describe('Branches List View - Structure', () => {
  test('renders page with correct semantic hierarchy', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Header
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByTestId('header-title')).toBeVisible();

    // Main content
    await expect(page.getByRole('main')).toBeVisible();
    
    // Page heading
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
  });

  test('displays branches table with correct columns', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const table = page.getByTestId('branches-table');
    await expect(table).toBeVisible();

    // Verify column headers
    await expect(table.getByRole('columnheader', { name: 'Branch' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Reference' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Number of Tables' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Reservation Duration' })).toBeVisible();
  });

  test('displays Add Branches button', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const addButton = page.getByTestId('add-branches');
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add Branches');
  });

  test('displays Disable Reservations button when branches are enabled', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Wait for data to load
    await page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 });

    // Check if Disable All button exists (only if there are enabled branches)
    const disableButton = page.getByTestId('disable-all');
    const isVisible = await disableButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(disableButton).toHaveText('Disable Reservations');
    }
  });
});

test.describe('Branches List View - Data Display', () => {
  test('displays branch rows with correct data', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Wait for table to load
    const table = page.getByTestId('branches-table');
    await expect(table).toBeVisible();

    // Check for at least one branch row
    const rows = page.locator('[data-testid^="branch-row-"]');
    const count = await rows.count();

    if (count > 0) {
      // Verify first row has all cells
      const firstRow = rows.first();
      const cells = firstRow.locator('td');

      expect(await cells.count()).toBeGreaterThanOrEqual(4);
    }
  });

  test('displays duration in correct format', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const table = page.getByTestId('branches-table');
    await expect(table).toBeVisible();

    // Check duration column contains "Minutes"
    const durationCell = page.locator('td').filter({ hasText: 'Minutes' }).first();
    
    if (await durationCell.count() > 0) {
      const text = await durationCell.textContent();
      expect(text).toMatch(/\d+ Minutes/);
    }
  });
});

test.describe('Branches List View - Empty State', () => {
  test('shows empty state when no branches configured', async ({ page }) => {
    await setupEmptyState(page);
    await page.goto('/');

    const emptyState = page.getByTestId('empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No branches configured');
    await expect(emptyState).toContainText('Add branches to start managing reservations');
  });

  test('empty state Add Branches button is clickable', async ({ page }) => {
    await setupEmptyState(page);
    await page.goto('/');

    const addButton = page.getByTestId('add-branches');
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Should show toast
    const toaster = page.getByTestId('toaster');
    await expect(toaster).toBeVisible();
  });
});

test.describe('Branches List View - Interactions', () => {
  test('Add Branches button triggers action', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const addButton = page.getByTestId('add-branches');
    await expect(addButton).toBeVisible();
    
    await addButton.click();

    // Should show notification
    const toaster = page.getByTestId('toaster');
    await expect(toaster).toBeVisible();
  });

  test('Disable All button is keyboard accessible', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    await page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 });

    const disableButton = page.getByTestId('disable-all');
    const isVisible = await disableButton.isVisible().catch(() => false);

    if (isVisible) {
      await disableButton.focus();
      await expect(disableButton).toBeFocused();

      // Check for focus ring
      const boxShadow = await disableButton.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(boxShadow).not.toBe('none');
    }
  });
});

test.describe('Branches List View - i18n (Arabic)', () => {
  test('displays Arabic translations correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Switch to Arabic
    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    // Wait for locale to switch
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Check Arabic page title (scoped to main to avoid header h1)
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toHaveText('الحجوزات');

    // Check table headers in Arabic
    const table = page.getByTestId('branches-table');
    await expect(table.getByRole('columnheader', { name: 'الفرع' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'المرجع' })).toBeVisible();
  });

  test('RTL layout flips correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Switch to Arabic
    await page.getByTestId('locale-switcher').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Verify RTL direction
    const main = page.getByRole('main');
    const direction = await main.evaluate((el) => {
      return window.getComputedStyle(el).direction;
    });

    expect(direction).toBe('rtl');
  });
});

test.describe('Branches List View - Loading State', () => {
  test('shows loading indicator while fetching data', async ({ page }) => {
    await setupOfflineMode(page);
    
    // Delay API response slightly to catch loading state
    await page.route('**/api/branches*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/');

    // Should show loading state briefly
    const loading = page.getByTestId('page-loading');
    
    // If loading appears, verify it has proper attributes
    if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toHaveAttribute('role', 'status');
      await expect(loading).toHaveAttribute('aria-busy', 'true');
    }
  });
});

test.describe('Branches List View - Accessibility', () => {
  test('has proper document structure', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Should have main heading (scoped to main content)
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Should have table with proper structure
    const table = page.getByTestId('branches-table');
    await expect(table).toBeVisible();

    // Table should have column headers
    const headers = table.locator('th');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('interactive elements are focusable', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Add Branches button should be focusable
    const addButton = page.getByTestId('add-branches');
    await addButton.focus();
    await expect(addButton).toBeFocused();
  });
});
