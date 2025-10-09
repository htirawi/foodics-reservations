/**
 * @file a11y.skip-link.spec.ts
 * @summary Module: tests/e2e/a11y.skip-link.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";

test.describe("Accessibility - Skip Link", () => {
    test("should navigate to main content when skip link is activated", async ({ page }) => {
        await page.goto("/");
        const skipLink = page.getByTestId("skip-to-main");
        await expect(skipLink).toBeAttached();
        await expect(skipLink).toHaveClass(/sr-only/);
        await page.keyboard.press("Tab");
        await expect(skipLink).toBeVisible();
        await expect(skipLink).toHaveClass(/focus:not-sr-only/);
        await page.waitForTimeout(100);
        const browserName = page.context().browser()?.browserType().name();
        const mainElement = page.locator("#main");
        if (browserName !== "webkit") {
            await skipLink.click({ force: true });
            await expect(mainElement).toBeFocused({ timeout: 2000 });
        }
        await expect(mainElement).toHaveAttribute("role", "main");
        await expect(mainElement).toHaveAttribute("tabindex", "-1");
    });
    test("should work in both English and Arabic", async ({ page }) => {
        await page.goto("/");
        const skipLinkEn = page.getByTestId("skip-to-main");
        await expect(skipLinkEn).toContainText("Skip to main content");
        await page.getByRole("button", { name: /العربية|Arabic/ }).click();
        const skipLinkAr = page.getByTestId("skip-to-main");
        await expect(skipLinkAr).toContainText("\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0631\u0626\u064A\u0633\u064A");
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    });
    test("should have proper focus management", async ({ page }) => {
        await page.goto("/");
        await page.keyboard.press("Tab");
        const skipLink = page.getByTestId("skip-to-main");
        await page.waitForTimeout(100);
        const browserName = page.context().browser()?.browserType().name();
        const mainElement = page.locator("#main");
        if (browserName !== "webkit") {
            await skipLink.click({ force: true });
            await expect(mainElement).toBeFocused({ timeout: 2000 });
        }
        await expect(skipLink).toHaveClass(/focus:ring-2/);
        await expect(skipLink).toHaveClass(/focus:ring-blue-500/);
        await expect(mainElement).toBeVisible();
    });
});
