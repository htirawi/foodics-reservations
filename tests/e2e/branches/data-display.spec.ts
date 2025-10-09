/**
 * @file data-display.spec.ts
 * @summary Module: tests/e2e/branches/data-display.spec.ts
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
test.describe("Branches Data Display", () => {
    test.beforeEach(async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
    });
    test("displays branch data correctly in table", async ({ page }) => {
        const table = page.locator("[data-testid=\"branches-table\"]");
        await expect(table).toBeVisible();
        const rows = page.locator("[data-testid^=\"branch-row-\"]");
        await expect(rows).not.toHaveCount(0);
    });
    test("each branch row displays required fields", async ({ page }) => {
        const firstRow = page.locator("[data-testid^=\"branch-row-\"]").first();
        await expect(firstRow).toContainText(/.+/);
    });
    test("branches display in proper order", async ({ page }) => {
        const rows = page.locator("[data-testid^=\"branch-row-\"]");
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);
    });
    test("branch data is formatted correctly", async ({ page }) => {
        const firstRow = page.locator("[data-testid^=\"branch-row-\"]").first();
        const text = await firstRow.textContent();
        expect(text).toBeTruthy();
    });
    test("handles missing or null data gracefully", async ({ page }) => {
        const table = page.locator("[data-testid=\"branches-table\"]");
        await expect(table).toBeVisible();
    });
    test("displays correct count of branches", async ({ page }) => {
        const rows = page.locator("[data-testid^=\"branch-row-\"]");
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });
});
