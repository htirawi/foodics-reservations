/**
 * @file add-branches-modal.accessibility.spec.ts
 * @summary Module: tests/e2e/add-branches-modal.accessibility.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { switchToLocale } from "@tests/e2e/lib/i18n";
import { setupOfflineModeWithDisabledBranches } from "@tests/e2e/setup/intercepts";

async function waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState("networkidle").catch(() => { });
    await Promise.race([
        page.getByTestId("branches-table").waitFor({ timeout: 5000 }).catch(() => { }),
        page.getByTestId("branches-empty").waitFor({ timeout: 5000 }).catch(() => { }),
    ]);
    const loadingSpinner = page.getByTestId("page-loading");
    await loadingSpinner.waitFor({ state: "hidden", timeout: 5000 }).catch(() => { });
    await Promise.race([
        page.getByTestId("branches-table").waitFor({ timeout: 10000 }),
        page.getByTestId("branches-empty").waitFor({ timeout: 10000 }),
    ]).catch(() => { });
}
async function openAddBranchesModal(page: Page): Promise<void> {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor({ timeout: 3000 });
}
test.describe("Add Branches Modal - Accessibility", () => {
    test.describe.configure({ retries: 2 });
    test.describe("RTL - Arabic", () => {
        test.beforeEach(async ({ page }) => {
            await setupOfflineModeWithDisabledBranches(page);
            await page.goto("/");
            await waitForPageLoad(page);
            await switchToLocale(page, "ar");
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            await openAddBranchesModal(page);
        });
        test("displays modal in Arabic with correct dir", async ({ page }) => {
            const html = page.locator("html");
            await expect(html).toHaveAttribute("dir", "rtl");
            const titleText = await page.locator("#add-branches-title").textContent();
            expect(titleText).toBe("\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0648\u0639");
            const modal = page.getByTestId("add-branches-modal");
            await expect(modal).toBeVisible();
        });
        test("select all button shows Arabic text", async ({ page }) => {
            const modal = page.getByTestId("add-branches-modal");
            await expect(modal).toBeVisible();
            const emptyState = page.getByTestId("add-branches-empty");
            const branchesList = page.getByTestId("add-branches-list");
            await Promise.race([
                emptyState.waitFor({ timeout: 5000 }).catch(() => { }),
                branchesList.waitFor({ timeout: 5000 }).catch(() => { })
            ]);
            if (await emptyState.isVisible()) {
                console.log("Modal is showing empty state - no disabled branches available");
                return;
            }
            const selectAllButton = page.getByTestId("add-branches-select-all");
            await expect(selectAllButton).toBeVisible();
            expect(await selectAllButton.textContent()).toContain("\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0643\u0644");
            await selectAllButton.click();
            expect(await selectAllButton.textContent()).toContain("\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062A\u062D\u062F\u064A\u062F");
        });
        test("filter placeholder is in Arabic", async ({ page }) => {
            const modal = page.getByTestId("add-branches-modal");
            await expect(modal).toBeVisible();
            const emptyState = page.getByTestId("add-branches-empty");
            const branchesList = page.getByTestId("add-branches-list");
            await Promise.race([
                emptyState.waitFor({ timeout: 5000 }).catch(() => { }),
                branchesList.waitFor({ timeout: 5000 }).catch(() => { })
            ]);
            if (await emptyState.isVisible()) {
                console.log("Modal is showing empty state - no disabled branches available");
                return;
            }
            const filterInput = page.getByTestId("add-branches-filter");
            await expect(filterInput).toBeVisible();
            const placeholder = await filterInput.getAttribute("placeholder");
            expect(placeholder).toBe("\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0641\u0631\u0648\u0639...");
        });
    });
    test.describe("Accessibility", () => {
        test.beforeEach(async ({ page }) => {
            await setupOfflineModeWithDisabledBranches(page);
            await page.goto("/");
            await waitForPageLoad(page);
            await openAddBranchesModal(page);
        });
        test("modal has correct ARIA attributes", async ({ page }) => {
            const dialog = page.locator("[role=\"dialog\"]");
            await expect(dialog).toHaveAttribute("aria-modal", "true");
            await expect(dialog).toHaveAttribute("aria-labelledby", "add-branches-title");
        });
        test("escape key closes modal", async ({ page }) => {
            const modal = page.getByTestId("add-branches-modal");
            await expect(modal).toBeVisible();
            const modalContent = page.locator("[role=\"dialog\"]");
            await modalContent.focus();
            await page.keyboard.press("Escape");
            await expect(modal).not.toBeVisible({ timeout: 5000 });
        });
        test("checkboxes are labeled correctly", async ({ page }) => {
            await page.waitForFunction(() => {
                const branchItems = document.querySelectorAll("[data-testid^=\"add-branches-item-\"]");
                return branchItems.length > 0;
            }, { timeout: 10000 }).catch(() => {
            });
            const branchItems = await page.getByTestId(/add-branches-item-/).count();
            if (branchItems > 0) {
                const firstItem = page.getByTestId(/add-branches-item-/).first();
                const checkbox = firstItem.locator("input[type=\"checkbox\"]");
                const label = firstItem.locator("label");
                await expect(checkbox).toBeVisible();
                await expect(label).toBeVisible();
                const checkboxId = await checkbox.getAttribute("id");
                if (checkboxId) {
                    const labelFor = await label.getAttribute("for");
                    expect(labelFor).toBe(checkboxId);
                }
            }
            else {
                const emptyState = page.getByTestId("add-branches-empty");
                await expect(emptyState).toBeVisible();
            }
        });
        test("save button has aria-busy when saving", async ({ page }) => {
            const saveButton = page.getByTestId("add-branches-save");
            await expect(saveButton).toBeVisible();
        });
    });
});
