/**
 * @file empty-state.spec.ts
 * @summary Module: tests/e2e/branches/empty-state.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { setupEmptyState } from "@tests/e2e/setup/intercepts";

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
test.describe("Branches Empty State", () => {
    test.beforeEach(async ({ page }) => {
        await setupEmptyState(page);
        await page.goto("/");
        await waitForPageLoad(page);
    });
    test("shows empty state when no branches exist", async ({ page }) => {
        const emptyState = page.locator("[data-testid=\"branches-empty\"]");
        await expect(emptyState).toBeVisible();
    });
    test("empty state has proper structure and messaging", async ({ page }) => {
        const emptyState = page.locator("[data-testid=\"branches-empty\"]");
        await expect(emptyState).toContainText(/no branches/i);
    });
    test("does not show table when empty", async ({ page }) => {
        const table = page.locator("[data-testid=\"branches-table\"]");
        await expect(table).not.toBeVisible();
    });
    test("does not show cards when empty", async ({ page }) => {
        const cards = page.locator("[data-testid^=\"branch-card-\"]");
        await expect(cards).toHaveCount(0);
    });
});
