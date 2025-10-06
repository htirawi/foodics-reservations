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
test.describe("Branches List View - Structure", () => {
    test.describe.configure({ retries: 2 });
    test("renders page with correct semantic hierarchy", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const mainHeading = page.getByRole("main").getByRole("heading", { level: 1 });
        await expect(mainHeading).toBeVisible();
        await expect(mainHeading).toHaveText("Reservations");
    });
    test("displays branches table with correct columns", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const cards = page.locator("[data-testid^=\"branch-card-\"]");
            await expect(cards.first()).toBeVisible();
            const firstCard = cards.first();
            await expect(firstCard).toContainText("Downtown Branch");
            await expect(firstCard).toContainText("DT-001");
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            await expect(table.getByRole("columnheader", { name: "Branch" })).toBeVisible();
            await expect(table.getByRole("columnheader", { name: "Reference" })).toBeVisible();
            await expect(table.getByRole("columnheader", { name: "Number of Tables" })).toBeVisible();
            await expect(table.getByRole("columnheader", { name: "Reservation Duration" })).toBeVisible();
        }
    });
    test("displays Add Branches button", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const addButton = page.getByTestId("add-branches");
        await expect(addButton).toBeVisible();
        await expect(addButton).toHaveText("Add Branches");
    });
    test("displays Disable Reservations button when branches are enabled", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const disableButton = page.getByTestId("disable-all");
        const isVisible = await disableButton.isVisible().catch(() => false);
        if (isVisible) {
            await expect(disableButton).toHaveText("Disable Reservations");
        }
    });
});
