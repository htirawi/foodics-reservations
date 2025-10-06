import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupOfflineMode } from '../setup/intercepts';

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

test.describe('Branches List View - Data Display', () => {
  test.describe.configure({ retries: 2 });

  test('displays branch rows with correct data', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine which layout to test
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, test cards display
      const cards = page.locator('[data-testid^="branch-card-"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);

      // Check first card content
      const firstCard = cards.first();
      await expect(firstCard).toContainText('Downtown Branch');
      await expect(firstCard).toContainText('DT-001');
    } else {
      // On desktop, test table display
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      // Check that we have branch rows
      const rows = table.locator('[data-testid^="branch-row-"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Verify first row content
      const firstRow = rows.first();
      await expect(firstRow).toContainText('Downtown Branch');
      await expect(firstRow).toContainText('DT-001');
    }
  });

  test('displays duration in correct format', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine which layout to test
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check cards for duration
      const cards = page.locator('[data-testid^="branch-card-"]');
      const firstCard = cards.first();
      await expect(firstCard).toContainText('90 Minutes');
    } else {
      // On desktop, check table for duration
      const table = page.getByTestId('branches-table');
      const firstRow = table.locator('[data-testid^="branch-row-"]').first();
      await expect(firstRow).toContainText('90 Minutes');
    }
  });
});
