import { test, expect } from '@playwright/test';

test.describe('Accessibility - Skip Link', () => {
  test('should navigate to main content when skip link is activated', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Verify skip link is present and initially hidden
    const skipLink = page.getByTestId('skip-to-main');
    await expect(skipLink).toBeAttached();
    
    // Skip link should be visually hidden initially
    await expect(skipLink).toHaveClass(/sr-only/);

    // Press Tab to focus the skip link
    await page.keyboard.press('Tab');
    
    // Skip link should become visible when focused
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveClass(/focus:not-sr-only/);

    // Press Enter to activate the skip link
    await page.keyboard.press('Enter');

    // Main element should be focused
    const mainElement = page.locator('#main');
    await expect(mainElement).toBeFocused();

    // Verify main element has the correct attributes
    await expect(mainElement).toHaveAttribute('role', 'main');
    await expect(mainElement).toHaveAttribute('tabindex', '-1');
  });

  test('should work in both English and Arabic', async ({ page }) => {
    // Test English
    await page.goto('/');
    const skipLinkEn = page.getByTestId('skip-to-main');
    await expect(skipLinkEn).toContainText('Skip to main content');

    // Switch to Arabic
    await page.getByRole('button', { name: /العربية|Arabic/ }).click();
    const skipLinkAr = page.getByTestId('skip-to-main');
    await expect(skipLinkAr).toContainText('انتقل إلى المحتوى الرئيسي');

    // Verify RTL direction is applied
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');

    // Focus the skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByTestId('skip-to-main');
    await expect(skipLink).toBeFocused();

    // Verify skip link has proper focus styles
    await expect(skipLink).toHaveClass(/focus:ring-2/);
    await expect(skipLink).toHaveClass(/focus:ring-blue-500/);

    // Activate skip link
    await page.keyboard.press('Enter');

    // Main should be focused and visible
    const mainElement = page.locator('#main');
    await expect(mainElement).toBeFocused();
    await expect(mainElement).toBeVisible();
  });
});
