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
import { setupEmptyState } from "../setup/intercepts";
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
test.describe("Branches List View - Empty State", () => {
    test.describe.configure({ retries: 2 });
    test("shows empty state when no branches configured", async ({ page }) => {
        await setupEmptyState(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const emptyState = page.getByTestId("branches-empty");
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText("No branches configured");
        await expect(emptyState).toContainText("Add branches to start managing reservations");
    });
    test("empty state Add Branches button is clickable", async ({ page }) => {
        await setupEmptyState(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const emptyState = page.getByTestId("branches-empty");
        await expect(emptyState).toBeVisible();
        const actionButton = emptyState.getByRole("button", { name: "Add Branches" });
        await actionButton.click();
        const modal = page.getByTestId("add-branches-modal");
        await expect(modal).toBeVisible();
    });
});
