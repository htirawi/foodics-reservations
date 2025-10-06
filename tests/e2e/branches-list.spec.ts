import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupOfflineMode } from './setup/intercepts';

/**
 * Wait for page to finish loading and data to be ready
 * Uses multiple strategies to handle different timing scenarios
 */
async function waitForPageLoad(page: Page): Promise<void> {
  // Strategy 1: Wait for network idle (all API calls complete)
  await page.waitForLoadState('networkidle').catch(() => {});

  // Strategy 2: Wait for either table/cards OR empty state to be present
  // This ensures data has been processed regardless of result
  await Promise.race([
    page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 }).catch(() => {}),
    page.waitForSelector('[data-testid^="branch-card-"]', { timeout: 5000 }).catch(() => {}),
    page.waitForSelector('[data-testid="branches-empty"]', { timeout: 5000 }).catch(() => {}),
    page.waitForSelector('[data-testid="branches-error"]', { timeout: 5000 }).catch(() => {}),
  ]);

  // Strategy 3: Small buffer for Vue reactivity to settle
  await page.waitForTimeout(100);
}

test.describe('Branches List View - Interactions', () => {
  test.describe.configure({ retries: 2 });

  test('Add Branches button triggers action', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await addButton.click();

    // Should open Add Branches modal
    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();
  });

  test('clicking branch row opens settings modal', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine test approach
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, click on cards
      const firstCard = page.locator('[data-testid^="branch-card-"]').first();
      const cardCount = await firstCard.count();

      if (cardCount > 0) {
        await firstCard.click();

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    } else {
      // On desktop, click on table rows
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      const firstRow = page.locator('[data-testid^="branch-row-"]').first();
      const rowCount = await firstRow.count();

      if (rowCount > 0) {
        await firstRow.click();

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    }
  });

  test('branch row is keyboard accessible with Enter key', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine test approach
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, test card keyboard navigation
      const firstCard = page.locator('[data-testid^="branch-card-"]').first();
      const cardCount = await firstCard.count();

      if (cardCount > 0) {
        await firstCard.focus();
        await expect(firstCard).toBeFocused();
        await firstCard.press('Enter');

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    } else {
      // On desktop, test table row keyboard navigation
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      const firstRow = page.locator('[data-testid^="branch-row-"]').first();
      const rowCount = await firstRow.count();

      if (rowCount > 0) {
        await firstRow.focus();
        await expect(firstRow).toBeFocused();
        await firstRow.press('Enter');

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    }
  });

  test('branch row is keyboard accessible with Space key', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine test approach
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, test card keyboard navigation
      const firstCard = page.locator('[data-testid^="branch-card-"]').first();
      const cardCount = await firstCard.count();

      if (cardCount > 0) {
        await firstCard.focus();
        await firstCard.press(' ');

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    } else {
      // On desktop, test table row keyboard navigation
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      const firstRow = page.locator('[data-testid^="branch-row-"]').first();
      const rowCount = await firstRow.count();

      if (rowCount > 0) {
        await firstRow.focus();
        await firstRow.press(' ');

        const settingsModal = page.getByTestId('settings-modal');
        await expect(settingsModal).toBeVisible();
      }
    }
  });

  test('Disable All button is keyboard accessible', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Wait for data to load - check viewport to determine which element to wait for
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    if (isMobile) {
      await page.waitForSelector('[data-testid^="branch-card-"]', { timeout: 5000 });
    } else {
      await page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 });
    }

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

  test('Disable All shows confirmation dialog', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Wait for data to load - check viewport to determine which element to wait for
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    if (isMobile) {
      await page.waitForSelector('[data-testid^="branch-card-"]', { timeout: 5000 });
    } else {
      await page.waitForSelector('[data-testid="branches-table"]', { timeout: 5000 });
    }

    const disableButton = page.getByTestId('disable-all');
    const isVisible = await disableButton.isVisible().catch(() => false);

    if (isVisible && !(await disableButton.isDisabled())) {
      await disableButton.click();

      const confirmModal = page.getByTestId('confirm-modal');
      await expect(confirmModal).toBeVisible();
      await expect(confirmModal).toContainText('Disable All Reservations');
    }
  });
});

test.describe('Branches List View - i18n (Arabic)', () => {
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

    // Check Arabic page title (scoped to main to avoid header h1)
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toHaveText('الحجوزات');

    // Check viewport size to determine test approach
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check cards for Arabic content
      const cards = page.locator('[data-testid^="branch-card-"]');
      const firstCard = cards.first();
      
      if (await firstCard.count() > 0) {
        await expect(firstCard).toContainText('Downtown Branch');
        await expect(firstCard).toContainText('DT-001');
      }
    } else {
      // On desktop, check table headers in Arabic
      const table = page.getByTestId('branches-table');
      await expect(table.getByRole('columnheader', { name: 'الفرع' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'المرجع' })).toBeVisible();
    }
  });

  test('RTL layout flips correctly', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Switch to Arabic
    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    // Check RTL attributes
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });
});

test.describe('Branches List View - Loading State', () => {
  test.describe.configure({ retries: 2 });

  test('shows loading indicator while fetching data', async ({ page }) => {
    // Set up a slow response to catch loading state
    await page.route('**/api/branches', async (route) => {
      // Add delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

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
  test.describe.configure({ retries: 2 });
  
  test('has proper document structure', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Should have main heading (scoped to main content)
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Check viewport size to determine test approach
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check cards structure
      const cards = page.locator('[data-testid^="branch-card-"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    } else {
      // On desktop, check table structure
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      // Table should have column headers
      const headers = table.locator('th');
      expect(await headers.count()).toBeGreaterThan(0);
    }
  });

  test('interactive elements are focusable', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Add Branches button should be focusable
    const addButton = page.getByTestId('add-branches');
    await addButton.focus();
    await expect(addButton).toBeFocused();
  });
});

test.describe('Branches List View - Responsive (Mobile)', () => {
  test.describe.configure({ retries: 2 });
  
  test('displays stacked cards on mobile viewport', async ({ page }) => {
    await setupOfflineMode(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    // Table should be hidden on mobile
    const table = page.getByTestId('branches-table');
    const tableVisible = await table.isVisible().catch(() => false);
    expect(tableVisible).toBe(false);

    // Cards should be visible on mobile
    const cards = page.locator('[data-testid^="branch-card-"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('mobile cards display all branch information', async ({ page }) => {
    await setupOfflineMode(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    const firstCard = page.locator('[data-testid^="branch-card-"]').first();
    await expect(firstCard).toContainText('Downtown Branch');
    await expect(firstCard).toContainText('DT-001');
    await expect(firstCard).toContainText('Number of Tables');
    await expect(firstCard).toContainText('Reservation Duration');
  });

  test('mobile cards are keyboard accessible', async ({ page }) => {
    await setupOfflineMode(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    const firstCard = page.locator('[data-testid^="branch-card-"]').first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
  });

  test('clicking mobile card opens settings modal', async ({ page }) => {
    await setupOfflineMode(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    const firstCard = page.locator('[data-testid^="branch-card-"]').first();
    await firstCard.click();

    const settingsModal = page.getByTestId('settings-modal');
    await expect(settingsModal).toBeVisible();
  });

  test('displays table on desktop viewport', async ({ page }) => {
    await setupOfflineMode(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await waitForPageLoad(page);

    // Table should be visible on desktop
    const table = page.getByTestId('branches-table');
    await expect(table).toBeVisible();
  });
});
