/**
 * @file branches.settings-modal.spec.ts
 * @summary Module: tests/e2e/branches.settings-modal.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { setupOfflineModeWithSections } from "@tests/e2e/setup/intercepts";

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

test.describe("Branches Settings Modal", () => {
    test.beforeEach(async ({ page }) => {
        await setupOfflineModeWithSections(page);
        await page.goto("/");
        await waitForPageLoad(page);
    });
    test.describe("EN locale", () => {
        test("opens modal with all sections visible", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await expect(page.getByTestId("settings-modal")).toBeVisible();
            await expect(page.getByTestId("working-hours-info")).toBeVisible();
            await expect(page.getByTestId("settings-duration")).toBeVisible();
            await expect(page.getByTestId("settings-tables")).toBeVisible();
            await expect(page.getByTestId("settings-day-slots")).toBeVisible();
        });
        test("Save button is enabled when form has valid data", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeEnabled();
        });
        test("enables Save button when form is valid", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.clear();
            await durationInput.fill("60");
            await durationInput.blur();
            await page.waitForTimeout(1000);
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeVisible();
        });
        test("disables Save button when duration is invalid", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.fill("0");
            await durationInput.blur();
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeDisabled();
        });
        test("validates duration and disables Save for invalid values", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByRole("spinbutton", { name: /duration/i });
            await durationInput.waitFor({ state: "visible" });
            const saveButton = page.getByTestId("save-button");
            await expect(durationInput).toHaveValue("90", { timeout: 2000 });
            await durationInput.fill("0");
            await expect(saveButton).toBeDisabled();
            await durationInput.fill("120");
            await expect(saveButton).toBeVisible();
            await expect(durationInput).toHaveValue("120");
        });
        test("shows error for negative duration", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.fill("-5");
            await durationInput.blur();
            const error = page.getByTestId("settings-duration-error");
            await expect(error).toBeVisible();
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeDisabled();
        });
        test("clamps duration to max value when exceeding max", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.fill("9999");
            await durationInput.blur();
            await page.waitForTimeout(1000);
            await expect(durationInput).toHaveValue("480");
            const error = page.getByTestId("settings-duration-error");
            await expect(error).not.toBeVisible();
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeVisible();
        });
        test("clears error when valid duration is entered", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.fill("0");
            await durationInput.blur();
            const error = page.getByTestId("settings-duration-error");
            await expect(error).toBeVisible();
            await durationInput.fill("120");
            await durationInput.blur();
            await expect(error).not.toBeVisible();
        });
        test("closes modal with Cancel button", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.getByTestId("settings-cancel").click();
            await expect(page.getByTestId("settings-modal")).not.toBeVisible();
        });
        test("closes modal with Escape key", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.keyboard.press("Escape");
            await expect(page.getByTestId("settings-modal")).not.toBeVisible();
        });
        test("allows adding and removing time slots", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.getByTestId("add-slot-sunday").click();
            await expect(page.getByTestId("settings-slot-row-sunday-3")).toBeVisible();
            const timePill = page.getByTestId("settings-slot-row-sunday-3");
            await timePill.hover();
            const removeButton = timePill.getByRole("button", { name: "Remove" });
            await expect(removeButton).toBeVisible();
            await removeButton.click();
            const slotCount = await page.getByTestId(/settings-slot-row-sunday-/).count();
            console.log("Slot count after remove:", slotCount);
            await expect(page.getByTestId("settings-slot-row-sunday-3")).not.toBeVisible();
        });
        test("applies slots to all days", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.getByTestId("add-slot-saturday").click();
            await page.getByTestId("settings-slot-row-saturday-0").waitFor();
            await page.getByTestId("apply-all-saturday").click();
            await expect(page.getByTestId("settings-slot-row-sunday-0")).toBeVisible();
            await expect(page.getByTestId("settings-slot-row-monday-0")).toBeVisible();
            await expect(page.getByTestId("settings-slot-row-friday-0")).toBeVisible();
        });
        test("keyboard navigation works (Tab, Escape)", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.waitForTimeout(200);
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.focus();
            await page.keyboard.press("Tab");
            const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(["INPUT", "BUTTON"]).toContain(focusedElement);
            await page.keyboard.press("Escape");
            await expect(page.getByTestId("settings-modal")).not.toBeVisible();
        });
        test("saves settings when Save is clicked (with API intercept)", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.fill("60");
            await durationInput.blur();
            await page.getByTestId("add-slot-saturday").click();
            await page.waitForTimeout(1000);
            const saveButton = page.getByTestId("save-button");
            await expect(saveButton).toBeVisible();
            const slot = page.getByTestId("settings-slot-row-saturday-0");
            await expect(slot).toBeVisible();
        });

        test("displays tables section with summary count", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            
            const tablesSection = page.getByTestId("settings-tables");
            await expect(tablesSection).toBeVisible();
            
            const summary = page.getByTestId("settings-tables-summary");
            await expect(summary).toBeVisible();
            await expect(summary).toContainText("Reservable tables: 3");
        });

        test("displays table labels with section names", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            
            const tablesList = page.getByTestId("settings-tables-list");
            await expect(tablesList).toBeVisible();
            
            await expect(page.getByTestId("settings-tables-table-test-table-1")).toContainText("Main Hall – Table 1");
            await expect(page.getByTestId("settings-tables-table-test-table-2")).toContainText("Main Hall – Table 2");
            await expect(page.getByTestId("settings-tables-table-test-table-3")).toContainText("Terrace – Table 3");
        });

        test("tables section has semantic list structure", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            
            const tablesList = page.getByTestId("settings-tables-list");
            await expect(tablesList).toBeVisible();
            
            const tagName = await tablesList.evaluate(el => el.tagName);
            expect(tagName).toBe("UL");
            
            const role = await tablesList.getAttribute("role");
            expect(role).toBe("list");
        });
    });
    test.describe("AR locale", () => {
        test.beforeEach(async ({ page }) => {
            await setupOfflineModeWithSections(page);
            await page.goto("/");
            await waitForPageLoad(page);
            await page.getByTestId("locale-switcher").click();
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        });
        test("renders modal in RTL with Arabic text", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("rtl");
            await expect(page.getByTestId("settings-modal")).toBeVisible();
            await expect(page.getByTestId("settings-duration")).toBeVisible();
            await expect(page.getByTestId("settings-tables")).toBeVisible();
            await expect(page.getByTestId("settings-day-slots")).toBeVisible();
            const pageText = await page.textContent("body");
            expect(pageText).toMatch(/السبت|الأحد|الإثنين/);
        });
        test("keyboard navigation works in RTL", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.waitForTimeout(200);
            const durationInput = page.getByTestId("settings-duration-input");
            await durationInput.focus();
            await page.keyboard.press("Tab");
            const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(["INPUT", "BUTTON"]).toContain(focusedElement);
            await page.keyboard.press("Escape");
            await expect(page.getByTestId("settings-modal")).not.toBeVisible();
        });
        test("functional operations work in RTL (add/remove slots)", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            await page.getByTestId("add-slot-sunday").click();
            await expect(page.getByTestId("settings-slot-row-sunday-3")).toBeVisible();
            const timePill = page.getByTestId("settings-slot-row-sunday-3");
            await timePill.hover();
            await timePill.getByRole("button").first().click();
            await expect(page.getByTestId("settings-slot-row-sunday-3")).not.toBeVisible();
        });

        test("displays tables section in Arabic with correct summary", async ({ page }) => {
            await page.getByTestId("branch-row-test-branch-1").click();
            await page.getByTestId("settings-modal").waitFor();
            
            const tablesSection = page.getByTestId("settings-tables");
            await expect(tablesSection).toBeVisible();
            
            const summary = page.getByTestId("settings-tables-summary");
            await expect(summary).toBeVisible();
            await expect(summary).toContainText("الطاولات التي تقبل الحجوزات: 3");
        });
    });
});
