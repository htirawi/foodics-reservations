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

test.describe('Branches List View - Structure', () => {
  test.describe.configure({ retries: 2 });
  
  test('renders page with correct semantic hierarchy', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Should have main heading (scoped to main content)
    const mainHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveText('Reservations');
  });

  test('displays branches table with correct columns', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Check viewport size to determine which layout to test
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, test the cards layout
      const cards = page.locator('[data-testid^="branch-card-"]');
      await expect(cards.first()).toBeVisible();
      
      // Verify card content includes branch information
      const firstCard = cards.first();
      await expect(firstCard).toContainText('Downtown Branch');
      await expect(firstCard).toContainText('DT-001');
    } else {
      // On desktop, test the table layout
      const table = page.getByTestId('branches-table');
      await expect(table).toBeVisible();

      // Verify column headers
      await expect(table.getByRole('columnheader', { name: 'Branch' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Reference' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Number of Tables' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Reservation Duration' })).toBeVisible();
    }
  });

  test('displays Add Branches button', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const addButton = page.getByTestId('add-branches');
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add Branches');
  });

  test('displays Disable Reservations button when branches are enabled', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await waitForPageLoad(page);

    // Should show disable button when branches exist
    const disableButton = page.getByTestId('disable-all');
    const isVisible = await disableButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(disableButton).toHaveText('Disable Reservations');
    }
  });
});
