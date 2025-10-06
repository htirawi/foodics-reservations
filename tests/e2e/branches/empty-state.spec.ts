import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupEmptyState } from '../setup/intercepts';

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

test.describe('Branches List View - Empty State', () => {
  test.describe.configure({ retries: 2 });

  test('shows empty state when no branches configured', async ({ page }) => {
    await setupEmptyState(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Should show empty state
    const emptyState = page.getByTestId('branches-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No branches configured');
    await expect(emptyState).toContainText('Add branches to start managing reservations');
  });

  test('empty state Add Branches button is clickable', async ({ page }) => {
    await setupEmptyState(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const emptyState = page.getByTestId('branches-empty');
    await expect(emptyState).toBeVisible();

    // Click the action button in empty state
    const actionButton = emptyState.getByRole('button', { name: 'Add Branches' });
    await actionButton.click();

    // Should open Add Branches modal
    const modal = page.getByTestId('add-branches-modal');
    await expect(modal).toBeVisible();
  });
});
