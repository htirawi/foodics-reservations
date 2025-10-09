/**
 * @file smoke.spec.ts
 * @summary Module: tests/e2e/smoke.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";

import { setupOfflineMode } from "@tests/e2e/setup/intercepts";

test.describe("Smoke Tests", () => {
    test("should mount the app successfully", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await expect(page.getByTestId("header-title")).toContainText("Foodics Reservations");
    });
    test("should toggle locale between EN and AR", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const toggleButton = page.locator("button", { hasText: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" });
        await expect(toggleButton).toBeVisible();
        await toggleButton.click();
        await expect(page.locator("button", { hasText: "English" })).toBeVisible();
        await page.locator("button", { hasText: "English" }).click();
        await expect(toggleButton).toBeVisible();
    });
    test("should have proper page structure", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("main")).toBeVisible();
    });
    test("should have proper accessibility structure", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await expect(page.locator("main[role=\"main\"]")).toBeVisible();
        await expect(page.getByTestId("skip-to-main")).toBeAttached();
        await expect(page.locator("header")).toBeVisible();
        await page.keyboard.press("Tab");
        const skipLink = page.getByTestId("skip-to-main");
        await page.waitForTimeout(100);
        const browserName = page.context().browser()?.browserType().name();
        if (browserName !== "webkit") {
            await skipLink.click({ force: true });
        }
        const mainElement = page.locator("#main");
        await expect(mainElement).toHaveAttribute("tabindex", "-1");
    });
});
