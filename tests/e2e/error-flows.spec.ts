/**
 * @file error-flows.spec.ts
 * @summary E2E tests for 401 auth errors with banner
 * @remarks Tests auth banner display, dismiss, retry, auto-dismiss (EN/AR, offline)
 */

import { test, expect } from "@playwright/test";

import { switchToLocale } from "@tests/e2e/lib/i18n";

test.describe("Error Handling", () => {
  test.describe("401 Unauthorized - Auth Token Banner", () => {
    test("shows auth token banner for 401 errors in EN", async ({ page }) => {
      await switchToLocale(page, "en");

      // Intercept API call with 401 response
      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Unauthorized",
          }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      // Verify auth banner appears with localized message
      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });
      await expect(banner).toContainText("Authentication failed");
      await expect(banner).toContainText("access token");

      // Verify HTML dir attribute
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "ltr");
    });

    test("shows auth token banner for 401 errors in AR", async ({ page }) => {
      await switchToLocale(page, "ar");

      // Intercept API call with 401 response
      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Unauthorized",
          }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      // Verify auth banner appears with Arabic message
      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });
      await expect(banner).toContainText("فشلت المصادقة");
      await expect(banner).toContainText("رمز الوصول");

      // Verify HTML dir attribute for RTL
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "rtl");
    });

    test("auth banner is dismissible", async ({ page }) => {
      await switchToLocale(page, "en");

      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });

      // Close banner
      const closeButton = banner.locator('[data-testid="banner-close"]');
      await closeButton.click();

      await expect(banner).not.toBeVisible();
    });

    test("auth banner shows retry button", async ({ page }) => {
      await switchToLocale(page, "en");

      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });

      // Verify retry button exists
      const retryButton = banner.locator('[data-testid="auth-banner-retry"]');
      await expect(retryButton).toBeVisible();
      await expect(retryButton).toContainText("Retry");
    });

    test("auth banner auto-dismisses after 10 seconds", async ({ page }) => {
      await switchToLocale(page, "en");

      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });

      // Wait for auto-dismiss (10 seconds)
      await page.waitForTimeout(10500);

      // Banner should be hidden
      await expect(banner).not.toBeVisible();
    });
  });
});
