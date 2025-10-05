/**
 * Smoke Tests
 * Quick sanity checks to ensure the app mounts and basic features work
 * Runs in offline mode by default (uses fixtures)
 */

import { test, expect } from '@playwright/test';
import { setupOfflineMode } from './setup/intercepts';

test.describe('Smoke Tests', () => {
  test('should mount the app successfully', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Foodics Reservations');
  });

  test('should toggle locale between EN and AR', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    const toggleButton = page.locator('button', { hasText: 'العربية' });
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();
    await expect(page.locator('button', { hasText: 'English' })).toBeVisible();

    await page.locator('button', { hasText: 'English' }).click();
    await expect(toggleButton).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    await setupOfflineMode(page);
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
