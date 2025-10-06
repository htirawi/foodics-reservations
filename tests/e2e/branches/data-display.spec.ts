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
import { setupOfflineMode } from "../setup/intercepts";
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
test.describe("Branches List View - Data Display", () => {
    test.describe.configure({ retries: 2 });
    test("displays branch rows with correct data", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const cards = page.locator("[data-testid^=\"branch-card-\"]");
            const cardCount = await cards.count();
            expect(cardCount).toBeGreaterThan(0);
            const firstCard = cards.first();
            await expect(firstCard).toContainText("Downtown Branch");
            await expect(firstCard).toContainText("DT-001");
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            const rows = table.locator("[data-testid^=\"branch-row-\"]");
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);
            const firstRow = rows.first();
            await expect(firstRow).toContainText("Downtown Branch");
            await expect(firstRow).toContainText("DT-001");
        }
    });
    test("displays duration in correct format", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const cards = page.locator("[data-testid^=\"branch-card-\"]");
            const firstCard = cards.first();
            await expect(firstCard).toContainText("90 Minutes");
        }
        else {
            const table = page.getByTestId("branches-table");
            const firstRow = table.locator("[data-testid^=\"branch-row-\"]").first();
            await expect(firstRow).toContainText("90 Minutes");
        }
    });
});
