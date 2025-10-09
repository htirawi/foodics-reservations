/**
 * @file branches.addBranches.spec.ts
 * @summary Requirement 3: Add Branches modal with pagination
 */
import { test, expect } from "@playwright/test";

import { mountWithMocks, getBranchState } from "@tests/e2e/utils/network";

test.describe("Add Branches Modal - Requirement 3", () => {
  test.beforeEach(async ({ page }) => {
    await mountWithMocks(page);
  });

  test("REQ-3: modal lists disabled branches (accepts_reservations=false, deleted_at=null)", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Open "Add Branches" modal
    const addBtn = page.getByTestId("add-branches");
    await addBtn.click();

    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    // Should show the disabled branch from page 2
    const disabledItem = page.getByTestId("add-branches-item-disabled-branch-1");
    await expect(disabledItem).toBeVisible();
    await expect(disabledItem).toContainText("Disabled Branch");
    await expect(disabledItem).toContainText("DIS-001");

    // Enabled branch should NOT be in the list
    const enabledItem = page.getByTestId("add-branches-item-97a57184-e3e5-4d0e-8556-09270dcd686c");
    await expect(enabledItem).not.toBeVisible();
  });

  test("REQ-3: enabling a branch sends PUT /branches/:id with accepts_reservations=true", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Open modal
    await page.getByTestId("add-branches").click();
    await page.waitForSelector("[data-testid='add-branches-modal']");

    // Select the disabled branch checkbox
    const branchItem = page.getByTestId("add-branches-item-disabled-branch-1");
    const checkbox = branchItem.locator("input[type='checkbox']");
    await checkbox.click();

    // Click save button to trigger PUT
    const saveBtn = page.getByTestId("add-branches-save");

    // Listen for PUT request
    const putRequest = page.waitForRequest((req) =>
      req.url().includes("/api/branches/disabled-branch-1") && req.method() === "PUT"
    );

    await saveBtn.click();
    const req = await putRequest;

    // Verify payload
    const payload = req.postDataJSON();
    expect(payload).toHaveProperty("accepts_reservations", true);

    // Verify state was updated
    const updatedState = getBranchState("disabled-branch-1");
    expect(updatedState?.accepts_reservations).toBe(true);
  });

  test("REQ-3: enabled branch moves from modal to main list", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Open modal
    await page.getByTestId("add-branches").click();
    await page.waitForSelector("[data-testid='add-branches-modal']");

    // Select branch checkbox
    const branchItem = page.getByTestId("add-branches-item-disabled-branch-1");
    const checkbox = branchItem.locator("input[type='checkbox']");
    await checkbox.click();

    // Click save to enable
    const saveBtn = page.getByTestId("add-branches-save");
    await saveBtn.click();

    // Wait for PUT to complete
    await page.waitForResponse((resp) =>
      resp.url().includes("/api/branches/disabled-branch-1") && resp.request().method() === "PUT"
    );

    // Modal should close automatically after save
    await page.waitForTimeout(500);

    // Reload to see updated list
    await page.reload();
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Branch should now appear in main list
    const newRow = page.getByTestId("branch-row-disabled-branch-1");
    await expect(newRow).toBeVisible();
  });

  test("REQ-3: modal shows empty state when no disabled branches remain", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    // Open modal
    await page.getByTestId("add-branches").click();
    await page.waitForSelector("[data-testid='add-branches-modal']");

    // Select and enable the only disabled branch
    const branchItem = page.getByTestId("add-branches-item-disabled-branch-1");
    await branchItem.locator("input[type='checkbox']").click();

    // Click save to enable
    const saveBtn = page.getByTestId("add-branches-save");
    await saveBtn.click();

    await page.waitForResponse((resp) =>
      resp.url().includes("/api/branches/disabled-branch-1")
    );

    // Wait for modal to close and reopen
    await page.waitForTimeout(500);
    await page.getByTestId("add-branches").click();
    await page.waitForSelector("[data-testid='add-branches-modal']");

    // Modal should now show empty state
    const emptyState = page.getByTestId("add-branches-empty");
    await expect(emptyState).toBeVisible();
  });
});
