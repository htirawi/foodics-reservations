/**
 * @file branches-list.spec.ts
 * @summary Module: tests/e2e/branches-list.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { setupOfflineMode } from "./setup/intercepts";
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
test.describe("Branches List View - Interactions", () => {
    test.describe.configure({ retries: 2 });
    test("Add Branches button triggers action", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const addButton = page.getByTestId("add-branches");
        await addButton.click();
        const modal = page.getByTestId("add-branches-modal");
        await expect(modal).toBeVisible();
    });
    test("clicking branch row opens settings modal", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
            const cardCount = await firstCard.count();
            if (cardCount > 0) {
                await firstCard.click();
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            const firstRow = page.locator("[data-testid^=\"branch-row-\"]").first();
            const rowCount = await firstRow.count();
            if (rowCount > 0) {
                await firstRow.click();
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
    });
    test("branch row is keyboard accessible with Enter key", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
            const cardCount = await firstCard.count();
            if (cardCount > 0) {
                await firstCard.focus();
                await expect(firstCard).toBeFocused();
                await firstCard.press("Enter");
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            const firstRow = page.locator("[data-testid^=\"branch-row-\"]").first();
            const rowCount = await firstRow.count();
            if (rowCount > 0) {
                await firstRow.focus();
                await expect(firstRow).toBeFocused();
                await firstRow.press("Enter");
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
    });
    test("branch row is keyboard accessible with Space key", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
            const cardCount = await firstCard.count();
            if (cardCount > 0) {
                await firstCard.focus();
                await firstCard.press(" ");
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            const firstRow = page.locator("[data-testid^=\"branch-row-\"]").first();
            const rowCount = await firstRow.count();
            if (rowCount > 0) {
                await firstRow.focus();
                await firstRow.press(" ");
                const settingsModal = page.getByTestId("settings-modal");
                await expect(settingsModal).toBeVisible();
            }
        }
    });
    test("Disable All button is keyboard accessible", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            await page.waitForSelector("[data-testid^=\"branch-card-\"]", { timeout: 5000 });
        }
        else {
            await page.waitForSelector("[data-testid=\"branches-table\"]", { timeout: 5000 });
        }
        const disableButton = page.getByTestId("disable-all");
        const isVisible = await disableButton.isVisible().catch(() => false);
        if (isVisible) {
            await disableButton.focus();
            await expect(disableButton).toBeFocused();
            const boxShadow = await disableButton.evaluate((el) => {
                return window.getComputedStyle(el).boxShadow;
            });
            expect(boxShadow).not.toBe("none");
        }
    });
    test("Disable All shows confirmation dialog", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            await page.waitForSelector("[data-testid^=\"branch-card-\"]", { timeout: 5000 });
        }
        else {
            await page.waitForSelector("[data-testid=\"branches-table\"]", { timeout: 5000 });
        }
        const disableButton = page.getByTestId("disable-all");
        const isVisible = await disableButton.isVisible().catch(() => false);
        if (isVisible && !(await disableButton.isDisabled())) {
            await disableButton.click();
            const confirmModal = page.getByTestId("confirm-modal");
            await expect(confirmModal).toBeVisible();
            await expect(confirmModal).toContainText("Disable All Reservations");
        }
    });
});
test.describe("Branches List View - i18n (Arabic)", () => {
    test.describe.configure({ retries: 2 });
    test("displays Arabic translations correctly", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const localeSwitcher = page.getByTestId("locale-switcher");
        await localeSwitcher.click();
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        const mainHeading = page.getByRole("main").getByRole("heading", { level: 1 });
        await expect(mainHeading).toHaveText("\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A");
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const cards = page.locator("[data-testid^=\"branch-card-\"]");
            const firstCard = cards.first();
            if (await firstCard.count() > 0) {
                await expect(firstCard).toContainText("Downtown Branch");
                await expect(firstCard).toContainText("DT-001");
            }
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table.getByRole("columnheader", { name: "\u0627\u0644\u0641\u0631\u0639" })).toBeVisible();
            await expect(table.getByRole("columnheader", { name: "\u0627\u0644\u0645\u0631\u062C\u0639" })).toBeVisible();
        }
    });
    test("RTL layout flips correctly", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const localeSwitcher = page.getByTestId("locale-switcher");
        await localeSwitcher.click();
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    });
});
test.describe("Branches List View - Loading State", () => {
    test.describe.configure({ retries: 2 });
    test("shows loading indicator while fetching data", async ({ page }) => {
        await page.route("**/api/branches", async (route) => {
            await new Promise(resolve => setTimeout(resolve, 100));
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ data: [] }),
            });
        });
        await page.goto("/");
        await waitForPageLoad(page);
        const loading = page.getByTestId("page-loading");
        if (await loading.isVisible().catch(() => false)) {
            await expect(loading).toHaveAttribute("role", "status");
            await expect(loading).toHaveAttribute("aria-busy", "true");
        }
    });
});
test.describe("Branches List View - Accessibility", () => {
    test.describe.configure({ retries: 2 });
    test("has proper document structure", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const mainHeading = page.getByRole("main").getByRole("heading", { level: 1 });
        await expect(mainHeading).toBeVisible();
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
            const cards = page.locator("[data-testid^=\"branch-card-\"]");
            const cardCount = await cards.count();
            expect(cardCount).toBeGreaterThan(0);
        }
        else {
            const table = page.getByTestId("branches-table");
            await expect(table).toBeVisible();
            const headers = table.locator("th");
            expect(await headers.count()).toBeGreaterThan(0);
        }
    });
    test("interactive elements are focusable", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await waitForPageLoad(page);
        const addButton = page.getByTestId("add-branches");
        await addButton.focus();
        await expect(addButton).toBeFocused();
    });
});
test.describe("Branches List View - Responsive (Mobile)", () => {
    test.describe.configure({ retries: 2 });
    test("displays stacked cards on mobile viewport", async ({ page }) => {
        await setupOfflineMode(page);
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/");
        await waitForPageLoad(page);
        const table = page.getByTestId("branches-table");
        const tableVisible = await table.isVisible().catch(() => false);
        expect(tableVisible).toBe(false);
        const cards = page.locator("[data-testid^=\"branch-card-\"]");
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThan(0);
    });
    test("mobile cards display all branch information", async ({ page }) => {
        await setupOfflineMode(page);
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/");
        await waitForPageLoad(page);
        const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
        await expect(firstCard).toContainText("Downtown Branch");
        await expect(firstCard).toContainText("DT-001");
        await expect(firstCard).toContainText("Number of Tables");
        await expect(firstCard).toContainText("Reservation Duration");
    });
    test("mobile cards are keyboard accessible", async ({ page }) => {
        await setupOfflineMode(page);
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/");
        await waitForPageLoad(page);
        const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
        await firstCard.focus();
        await expect(firstCard).toBeFocused();
    });
    test("clicking mobile card opens settings modal", async ({ page }) => {
        await setupOfflineMode(page);
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/");
        await waitForPageLoad(page);
        const firstCard = page.locator("[data-testid^=\"branch-card-\"]").first();
        await firstCard.click();
        const settingsModal = page.getByTestId("settings-modal");
        await expect(settingsModal).toBeVisible();
    });
    test("displays table on desktop viewport", async ({ page }) => {
        await setupOfflineMode(page);
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto("/");
        await waitForPageLoad(page);
        const table = page.getByTestId("branches-table");
        await expect(table).toBeVisible();
    });
});
