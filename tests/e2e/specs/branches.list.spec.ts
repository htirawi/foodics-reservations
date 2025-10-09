/**
 * @file branches.list.spec.ts
 * @summary Requirement 2 & 4: List page filtering and disable all
 */
import { test, expect } from "@playwright/test";

import { mountWithMocks, getAllBranchStates, updateBranchState } from "@tests/e2e/utils/network";

test.describe("Branches List - Requirements 2 & 4", () => {
  test.beforeEach(async ({ page }) => {
    await mountWithMocks(page);
  });

  test("REQ-2: displays only enabled & non-deleted branches with correct columns", async ({ page }) => {
    await page.goto("/");

    // Wait for table/cards to load
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Only enabled branch should be visible (accepts_reservations=true, deleted_at=null)
    const enabledBranch = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");
    await expect(enabledBranch).toBeVisible();

    // Disabled branch should NOT be visible
    const disabledBranch = page.getByTestId("branch-row-disabled-branch-1");
    await expect(disabledBranch).not.toBeVisible();

    // Verify columns: name, reference, tables count, duration
    await expect(enabledBranch).toContainText("Branch 1"); // name
    await expect(enabledBranch).toContainText("B01"); // reference
    await expect(enabledBranch).toContainText("1"); // 1 table accepts reservations
    await expect(enabledBranch).toContainText("60"); // duration in minutes
  });

  test("REQ-4: Disable All button flips all enabled branches to disabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Verify enabled branch exists
    const enabledBranch = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");
    await expect(enabledBranch).toBeVisible();

    // Click "Disable All" button
    const disableAllBtn = page.getByTestId("disable-all-btn");
    await disableAllBtn.click();

    // Confirm dialog appears
    const confirmDialog = page.getByTestId("confirm-modal");
    await expect(confirmDialog).toBeVisible();

    // Click OK/Confirm
    const confirmBtn = page.getByTestId("confirm-ok");
    await confirmBtn.click();

    // Wait for mutation to complete
    await page.waitForResponse((resp) => resp.url().includes("/api/branches/") && resp.request().method() === "PUT");

    // After disable: table should be empty (or show empty state)
    // Since all branches are now disabled, the enabled list should be empty
    await expect(enabledBranch).not.toBeVisible();

    // Verify state was updated
    const allStates = getAllBranchStates();
    const enabledCount = allStates.filter((b) => b.accepts_reservations).length;
    expect(enabledCount).toBe(0); // All should be disabled now
  });

  test("REQ-2: table shows correct count of tables that accept reservations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Branch 1 has 1 section with 1 table that accepts_reservations=true
    const row = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");

    // Check for "Number of Tables" column or similar
    // The count should be 1 (only 1 table with accepts_reservations: true)
    await expect(row).toContainText("1");
  });

  test("REQ-2: reservation_duration is displayed correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    const row = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");

    // Duration should be 60 minutes
    await expect(row).toContainText("60");
  });

  test("REQ-2: deleted branches are excluded from list", async ({ page }) => {
    // Simulate a deleted branch by setting deleted_at in state
    updateBranchState("97a57184-e3e5-4d0e-8556-09270dcd686c", {
      deleted_at: "2025-10-09T00:00:00Z" as unknown as never
    });

    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-'], [data-testid='branches-empty']");

    // Branch should NOT be visible
    const deletedBranch = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");
    await expect(deletedBranch).not.toBeVisible();
  });
});
