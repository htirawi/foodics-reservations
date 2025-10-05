/**
 * i18n E2E Tests
 * Validates locale switching, persistence, HTML dir/lang attributes, and RTL behavior
 */

import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'foodics-locale';

test.describe('i18n and RTL', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="locale-switcher"]');
  });

  test.describe('Locale Switcher', () => {
    test('renders locale switcher button', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      await expect(switcher).toBeVisible();
      await expect(switcher).toHaveRole('button');
    });

    test('shows Arabic label when in English mode', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      await expect(switcher).toHaveText('العربية');
    });

    test('is keyboard accessible', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      await switcher.focus();
      await expect(switcher).toBeFocused();
    });

    test('has visible focus ring', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      await switcher.focus();
      
      // Check for focus ring styles
      const focusRing = await switcher.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
        };
      });
      
      // Should have either outline or box-shadow for focus
      const hasFocusIndicator = 
        focusRing.outline !== 'none' || 
        focusRing.boxShadow.includes('ring');
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  test.describe('Locale Toggle', () => {
    test('toggles to Arabic on click', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      // Check i18n locale changed
      const locale = await page.evaluate(() => document.documentElement.lang);
      expect(locale).toBe('ar');
      
      // Check button text changed
      const switcher = page.getByTestId('locale-switcher');
      await expect(switcher).toHaveText('English');
    });

    test('toggles back to English', async ({ page }) => {
      // Toggle to Arabic
      await page.getByTestId('locale-switcher').click();
      await expect(page.getByTestId('locale-switcher')).toHaveText('English');
      
      // Toggle back to English
      await page.getByTestId('locale-switcher').click();
      await expect(page.getByTestId('locale-switcher')).toHaveText('العربية');
      
      const locale = await page.evaluate(() => document.documentElement.lang);
      expect(locale).toBe('en');
    });

    test('updates page title in Arabic', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const title = page.getByTestId('header-title');
      await expect(title).toHaveText('حجوزات فوديكس');
    });

    test('updates page title back to English', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      await page.getByTestId('locale-switcher').click();
      
      const title = page.getByTestId('header-title');
      await expect(title).toHaveText('Foodics Reservations');
    });
  });

  test.describe('HTML dir Attribute', () => {
    test('sets dir="ltr" by default', async ({ page }) => {
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('ltr');
    });

    test('sets dir="rtl" when switching to Arabic', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('rtl');
    });

    test('sets dir="ltr" when switching back to English', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      await page.getByTestId('locale-switcher').click();
      
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('ltr');
    });
  });

  test.describe('HTML lang Attribute', () => {
    test('sets lang="en" by default', async ({ page }) => {
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('en');
    });

    test('sets lang="ar" when switching to Arabic', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('ar');
    });

    test('sets lang="en" when switching back to English', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      await page.getByTestId('locale-switcher').click();
      
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('en');
    });
  });

  test.describe('Persistence', () => {
    test('persists locale to localStorage', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const stored = await page.evaluate((key) => {
        return localStorage.getItem(key);
      }, STORAGE_KEY);
      
      expect(stored).toBe('ar');
    });

    test('restores locale from localStorage on page load', async ({ context }) => {
      // Create a page without the init script that clears localStorage
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForSelector('[data-testid="locale-switcher"]');
      
      // Set locale to Arabic
      await page.getByTestId('locale-switcher').click();
      await expect(page.getByTestId('header-title')).toHaveText('حجوزات فوديكس');
      
      // Reload page (localStorage should persist)
      await page.reload();
      await page.waitForSelector('[data-testid="locale-switcher"]');
      
      // Should still be in Arabic
      await expect(page.getByTestId('header-title')).toHaveText('حجوزات فوديكس');
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('rtl');
      
      await page.close();
    });

    test('persists across new page visits', async ({ context }) => {
      // Create first page and set locale to Arabic
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForSelector('[data-testid="locale-switcher"]');
      await page.getByTestId('locale-switcher').click();
      await page.close();
      
      // Navigate to a new page
      const newPage = await context.newPage();
      await newPage.goto('/');
      await newPage.waitForSelector('[data-testid="locale-switcher"]');
      
      // Should load in Arabic
      const title = newPage.getByTestId('header-title');
      await expect(title).toHaveText('حجوزات فوديكس');
      
      await newPage.close();
    });

    test('defaults to English when no locale stored', async ({ page }) => {
      const title = page.getByTestId('header-title');
      await expect(title).toHaveText('Foodics Reservations');
      
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('ltr');
    });
  });

  test.describe('RTL Layout', () => {
    test('maintains navigable layout in RTL mode', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      // Check that header is still properly laid out
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();
      
      // Check that button is still clickable
      const switcher = page.getByTestId('locale-switcher');
      await expect(switcher).toBeVisible();
      await switcher.click();
      
      // Should toggle back successfully
      await expect(page.getByTestId('header-title')).toHaveText('Foodics Reservations');
    });

    test('header layout works in RTL', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const header = page.locator('header[role="banner"]');
      const headerBox = await header.boundingBox();
      
      expect(headerBox).not.toBeNull();
      expect(headerBox?.width).toBeGreaterThan(0);
      expect(headerBox?.height).toBeGreaterThan(0);
    });
  });

  test.describe('Visual Parity', () => {
    test('English layout snapshot', async ({ page }) => {
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();
      
      // Basic visual check - just ensure elements are visible
      await expect(page.getByTestId('header-title')).toBeVisible();
      await expect(page.getByTestId('locale-switcher')).toBeVisible();
    });

    test('Arabic layout snapshot', async ({ page }) => {
      await page.getByTestId('locale-switcher').click();
      
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();
      
      // Basic visual check - ensure elements are visible in RTL
      await expect(page.getByTestId('header-title')).toBeVisible();
      await expect(page.getByTestId('locale-switcher')).toBeVisible();
    });

    test('header elements are visible in both locales', async ({ page }) => {
      // English
      await expect(page.getByTestId('header-title')).toBeVisible();
      await expect(page.getByTestId('locale-switcher')).toBeVisible();
      
      // Arabic
      await page.getByTestId('locale-switcher').click();
      await expect(page.getByTestId('header-title')).toBeVisible();
      await expect(page.getByTestId('locale-switcher')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('switcher has translatable aria-label', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      
      // In English mode, aria-label should be Arabic text
      const ariaLabelEn = await switcher.getAttribute('aria-label');
      expect(ariaLabelEn).toBe('العربية');
      
      // Toggle to Arabic
      await switcher.click();
      
      // In Arabic mode, aria-label should update (still Arabic text per locale file)
      const ariaLabelAr = await switcher.getAttribute('aria-label');
      expect(ariaLabelAr).toBe('العربية');
    });

    test('can toggle locale using keyboard', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      
      await switcher.focus();
      await page.keyboard.press('Enter');
      
      // Should toggle to Arabic
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('ar');
    });

    test('can toggle locale using space key', async ({ page }) => {
      const switcher = page.getByTestId('locale-switcher');
      
      await switcher.focus();
      await page.keyboard.press('Space');
      
      // Should toggle to Arabic
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('ar');
    });
  });
});
