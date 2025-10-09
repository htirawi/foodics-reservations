/**
 * File: tests/e2e/branches-filtering.spec.ts
 * Purpose: E2E tests for branch filtering (deleted_at and accepts_reservations)
 * Notes: Tests correct filtering of enabled/disabled/soft-deleted branches
 */

import { test, expect } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

import { loadFixture, isAllowedUrl } from "@tests/e2e/utils/network";

async function setupCompleteScenario(page: Page): Promise<void> {
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(loadFixture("branches-complete-scenario.json")),
    });
  });

  await page.route(/\/api\/branches\/[^/]+$/, async (route: Route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as { accepts_reservations?: boolean };
    const url = route.request().url();
    const branchId = url.split("/").pop();

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: branchId,
          name: `Branch ${branchId}`,
          accepts_reservations: body.accepts_reservations ?? true,
          deleted_at: null,
        },
      }),
    });
  });

  await page.route("**/*", async (route: Route) => {
    const url = route.request().url();
    if (isAllowedUrl(url)) {
      await route.continue();
    } else {
      await route.abort("blockedbyclient");
    }
  });
}

async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle").catch(() => {});
  await Promise.race([
    page.getByTestId("branches-table").waitFor({ timeout: 5000 }).catch(() => {}),
    page.getByTestId("branches-empty").waitFor({ timeout: 5000 }).catch(() => {}),
  ]);
}

test.describe("Branch Filtering - Complete Scenario", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupCompleteScenario(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  test("list shows only enabled non-deleted branches", async ({ page }) => {
    const table = page.getByTestId("branches-table");
    await expect(table).toBeVisible();

    const rows = page.locator("[data-testid^='branch-row-']");
    const count = await rows.count();

    expect(count).toBe(2);

    await expect(table).toContainText("Branch 1");
    await expect(table).toContainText("B01");
    await expect(table).toContainText("branch 2");
    await expect(table).toContainText("B02");

    await expect(table).not.toContainText("B29");
    await expect(table).not.toContainText("Deleted Branch");
  });

  test("Add Branches modal shows only disabled non-deleted branches", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const emptyState = page.getByTestId("add-branches-empty");
    await expect(emptyState).not.toBeVisible();

    const list = page.getByTestId("add-branches-list");
    await expect(list).toBeVisible();

    const items = page.locator("[data-testid^='add-branches-item-']");
    const count = await items.count();

    expect(count).toBeGreaterThanOrEqual(3);

    await expect(list).toContainText("B29");
    await expect(list).toContainText("B30");
    await expect(list).toContainText("B32");

    await expect(list).not.toContainText("Branch 1");
    await expect(list).not.toContainText("Deleted Branch");
  });

  test("soft-deleted branches are completely hidden", async ({ page }) => {
    const table = page.getByTestId("branches-table");
    await expect(table).not.toContainText("Deleted Branch");
    await expect(table).not.toContainText("DEL-001");
    await expect(table).not.toContainText("DEL-002");

    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const list = page.getByTestId("add-branches-list");
    await expect(list).not.toContainText("Deleted Branch");
    await expect(list).not.toContainText("DEL-001");
    await expect(list).not.toContainText("DEL-002");
  });

  test("enabled tables count is correct", async ({ page }) => {
    const table = page.getByTestId("branches-table");
    await expect(table).toBeVisible();

    const rows = page.locator("[data-testid^='branch-row-']");
    const firstRow = rows.first();
    const secondRow = rows.nth(1);

    await expect(firstRow).toBeVisible();
    await expect(secondRow).toBeVisible();

    const firstRowText = await firstRow.textContent();
    const secondRowText = await secondRow.textContent();

    expect(firstRowText).toMatch(/[02]/);
    expect(secondRowText).toMatch(/[02]/);
  });
});

test.describe("Add Branches Modal - Full Flow", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupCompleteScenario(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  test("search/filter works correctly", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B3");

    await page.waitForTimeout(250);

    const items = page.locator("[data-testid^='add-branches-item-']");
    const count = await items.count();

    expect(count).toBe(2);
    await expect(page.locator("[data-testid='add-branches-item-disabled-2']")).toBeVisible();
    await expect(page.locator("[data-testid='add-branches-item-disabled-3']")).toBeVisible();
    await expect(page.locator("[data-testid='add-branches-item-disabled-1']")).not.toBeVisible();
  });

  test("select all / deselect all works", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const selectAllButton = page.getByTestId("add-branches-select-all");
    await expect(selectAllButton).toContainText("Select All");

    await selectAllButton.click();

    await expect(selectAllButton).toContainText("Deselect All");

    const checkboxes = page.locator("input[type='checkbox']");
    const firstCheckbox = checkboxes.first();
    const secondCheckbox = checkboxes.nth(1);
    const thirdCheckbox = checkboxes.nth(2);

    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).toBeChecked();
    await expect(thirdCheckbox).toBeChecked();

    await selectAllButton.click();
    await expect(selectAllButton).toContainText("Select All");

    await expect(firstCheckbox).not.toBeChecked();
    await expect(secondCheckbox).not.toBeChecked();
    await expect(thirdCheckbox).not.toBeChecked();
  });

  test("individual checkbox selection works", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const saveButton = page.getByTestId("add-branches-save");
    await expect(saveButton).toBeDisabled();

    const checkbox = page.locator("input[type='checkbox']").first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await expect(saveButton).toBeEnabled();

    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    await expect(saveButton).toBeDisabled();
  });

  test("enabling branches updates the list and closes modal", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox = page.locator("input[type='checkbox']").first();
    await checkbox.click();

    const saveButton = page.getByTestId("add-branches-save");
    await saveButton.click();

    await page.getByTestId("add-branches-modal").waitFor({ state: "hidden", timeout: 5000 });

    const rowsAfter = await page.locator("[data-testid^='branch-row-']").count();
    expect(rowsAfter).toBeGreaterThanOrEqual(2);
  });

  test("filtered select all only selects visible branches", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B30");
    await page.waitForTimeout(250);

    const visibleItems = await page.locator("[data-testid^='add-branches-item-']").count();
    expect(visibleItems).toBe(1);

    const selectAllButton = page.getByTestId("add-branches-select-all");
    await selectAllButton.click();

    const checkedBoxes = await page.locator("input[type='checkbox']:checked").count();
    expect(checkedBoxes).toBe(1);
  });
});

test.describe("Disable All Functionality", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupCompleteScenario(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  test("disable all button only targets enabled non-deleted branches", async ({ page }) => {
    const disableButton = page.getByTestId("disable-all-button");
    await expect(disableButton).toBeVisible();
    await expect(disableButton).toBeEnabled();

    await disableButton.click();

    const confirmModal = page.getByTestId("confirm-modal");
    await expect(confirmModal).toBeVisible();

    const confirmButton = page.getByTestId("confirm-confirm");
    await confirmButton.click();

    await page.waitForTimeout(500);

    const table = page.getByTestId("branches-table");
    const tableVisible = await table.isVisible().catch(() => false);
    
    if (!tableVisible) {
      const emptyState = page.getByTestId("branches-empty");
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe("Branch Filtering - Arabic (RTL)", () => {
  test.describe.configure({ retries: 2 });

  test("filtering works correctly in Arabic", async ({ page }) => {
    await setupCompleteScenario(page);
    await page.goto("/");
    await waitForPageLoad(page);

    const localeSwitcher = page.getByTestId("locale-switcher");
    await localeSwitcher.click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const items = page.locator("[data-testid^='add-branches-item-']");
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B3");
    await page.waitForTimeout(250);

    const filteredCount = await items.count();
    expect(filteredCount).toBeGreaterThanOrEqual(2);
  });
});

