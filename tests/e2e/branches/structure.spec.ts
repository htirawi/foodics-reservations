/**
 * @file structure.spec.ts
 * @summary Module: tests/e2e/branches/structure.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { setupOfflineMode } from "@tests/e2e/setup/intercepts";

async function waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState("networkidle").catch(() => { });
    await Promise.race([
        page.waitForSelector("[data-testid=\"branches-table\"]", { timeout: 5000 }).catch(() => { }),
        page.waitForSelector("[data-testid^=\"branch-card-\"]", { timeout: 5000 }).catch(() => { }),
        page.waitForSelector("[data-testid=\"branches-empty\"]", { timeout: 5000 }).catch(() => { }),
        page.waitForSelector("[data-testid=\"branches-error\"]", { timeout: 5000 }).catch(() => { }),
    ]);
    await page.waitForTimeout(100);
}
test.describe("Branches List Structure", () => {
    test.beforeEach(async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
    });
    test("renders app container with proper structure", async ({ page }) => {
        const container = page.getByTestId("app-container");
        await expect(container).toBeVisible();
    });
    test("renders skip link for accessibility", async ({ page }) => {
        const skipLink = page.locator("[data-testid=\"skip-to-main\"]");
        await expect(skipLink).toBeVisible();
    });
    test("renders header", async ({ page }) => {
        const header = page.locator("header");
        await expect(header).toBeVisible();
    });
    test("renders main content area", async ({ page }) => {
        const main = page.locator("main#main");
        await expect(main).toBeVisible();
        await expect(main).toHaveAttribute("role", "main");
    });
    test("renders branches view inside main", async ({ page }) => {
        const main = page.locator("main#main");
        const branchesView = main.locator("[data-testid^=\"branch\"]").first();
        await expect(branchesView).toBeVisible();
    });
    test("has proper semantic HTML structure", async ({ page }) => {
        const header = page.locator("header");
        const main = page.locator("main");
        await expect(header).toBeVisible();
        await expect(main).toBeVisible();
    });
    test("main content is focusable for skip link", async ({ page }) => {
        const main = page.locator("main#main");
        await expect(main).toHaveAttribute("tabindex", "-1");
    });
    test("renders page with proper ARIA landmarks", async ({ page }) => {
        const mainLandmark = page.locator("main[role=\"main\"]");
        await expect(mainLandmark).toBeVisible();
    });
});
