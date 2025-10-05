/**
 * App Shell E2E Tests
 * Validates header, locale switching, toaster, and accessibility
 * Runs in offline mode by default (uses fixtures)
 */

import { test, expect } from '@playwright/test';
import { setupOfflineMode } from './setup/intercepts';

test.describe('App Shell', () => {
  test('renders header with title', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const header = page.getByTestId('header-title');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Foodics Reservations');
  });

  test('renders locale switcher', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const localeSwitcher = page.getByTestId('locale-switcher');
    await expect(localeSwitcher).toBeVisible();
    await expect(localeSwitcher).toHaveText('العربية');
  });

  test('has proper header landmark', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();
  });

  test('has proper main landmark', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('id', 'main');
    await expect(main).toHaveAttribute('tabindex', '-1');
  });
});

test.describe('Locale Switching', () => {
  test('toggles locale from EN to AR', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const localeSwitcher = page.getByTestId('locale-switcher');
    
    // Initially EN
    await expect(localeSwitcher).toHaveText('العربية');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Click to switch to AR
    await localeSwitcher.click();

    await expect(localeSwitcher).toHaveText('English');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('toggles locale from AR back to EN', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const localeSwitcher = page.getByTestId('locale-switcher');
    
    // Switch to AR
    await localeSwitcher.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Switch back to EN
    await localeSwitcher.click();

    await expect(localeSwitcher).toHaveText('العربية');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('updates header title when locale changes', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const header = page.getByTestId('header-title');
    const localeSwitcher = page.getByTestId('locale-switcher');

    await expect(header).toHaveText('Foodics Reservations');

    await localeSwitcher.click();

    await expect(header).toHaveText('حجوزات فوديكس');
  });

  test('locale switcher is keyboard accessible', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const localeSwitcher = page.getByTestId('locale-switcher');
    
    // Focus the button
    await localeSwitcher.focus();
    
    // Verify focus ring is visible (check for focus styles)
    await expect(localeSwitcher).toBeFocused();

    // Activate with keyboard
    await localeSwitcher.press('Enter');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Toaster', () => {
  test('displays toast notification', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    // Inject a toast via the UI store for testing
    await page.evaluate(() => {
      interface WindowWithStore extends Window {
        __uiStore?: { notify: (msg: string, type: string, duration: number) => void };
      }
      const uiStore = (window as WindowWithStore).__uiStore;
      if (uiStore) {
        uiStore.notify('Test success message', 'success', 0);
      }
    });

    const toaster = page.getByTestId('toaster');
    await expect(toaster).toBeVisible();
    await expect(toaster).toHaveAttribute('aria-live', 'polite');
    await expect(toaster).toHaveAttribute('role', 'status');
  });

  test('displays success toast with correct content', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    await page.evaluate(() => {
      interface WindowWithStore extends Window {
        __uiStore?: { notify: (msg: string, type: string, duration: number) => void };
      }
      const uiStore = (window as WindowWithStore).__uiStore;
      if (uiStore) {
        uiStore.notify('Operation completed successfully', 'success', 0);
      }
    });

    const toast = page.getByTestId('toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Operation completed successfully');
  });

  test('displays error toast with correct content', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    await page.evaluate(() => {
      interface WindowWithStore extends Window {
        __uiStore?: { notify: (msg: string, type: string, duration: number) => void };
      }
      const uiStore = (window as WindowWithStore).__uiStore;
      if (uiStore) {
        uiStore.notify('An error occurred', 'error', 0);
      }
    });

    const toast = page.getByTestId('toast-error');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('An error occurred');
  });

  test('closes toast when close button clicked', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    await page.evaluate(() => {
      interface WindowWithStore extends Window {
        __uiStore?: { notify: (msg: string, type: string, duration: number) => void };
      }
      const uiStore = (window as WindowWithStore).__uiStore;
      if (uiStore) {
        uiStore.notify('Dismissible toast', 'info', 0);
      }
    });

    const toast = page.getByTestId('toast-info');
    await expect(toast).toBeVisible();

    const closeButton = toast.locator('button[aria-label="Close"]');
    await closeButton.click();

    await expect(toast).not.toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('has visible focus indicators', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.focus();

    // Check that focus styles are applied
    await expect(localeSwitcher).toBeFocused();
    
    // Verify the button has focus ring styles
    const boxShadow = await localeSwitcher.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    expect(boxShadow).not.toBe('none');
  });

  test('header has proper semantic structure', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const banner = page.locator('header[role="banner"]');
    await expect(banner).toBeVisible();

    const heading = banner.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Foodics Reservations');
  });

  test('main content is focusable for skip-to-content', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const main = page.locator('main#main[role="main"]');
    await expect(main).toHaveAttribute('tabindex', '-1');
  });
});
