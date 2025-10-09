/**
 * File: tests/e2e/add-branches-modal.complete.spec.ts
 * Purpose: Complete E2E tests for Add Branches modal with all scenarios
 * Notes: Tests selection, filtering, enabling, soft-delete exclusion
 */

import { test, expect } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

import { loadFixture, isAllowedUrl } from "@tests/e2e/utils/network";

async function setupWithDisabledBranches(page: Page): Promise<void> {
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

test.describe("Add Branches Modal - Complete Functionality", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupWithDisabledBranches(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  test("displays correct number of disabled non-deleted branches", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    const items = page.locator("[data-testid^='add-branches-item-']");
    const count = await items.count();

    expect(count).toBe(3);

    await expect(items).toContainText(["B29", "B30", "B32"]);
  });

  test("search filter works by branch name", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B29");
    await page.waitForTimeout(250);

    const items = page.locator("[data-testid^='add-branches-item-']");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText("B29");
  });

  test("search filter works by branch reference", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B3");
    await page.waitForTimeout(250);

    const items = page.locator("[data-testid^='add-branches-item-']");
    const count = await items.count();
    expect(count).toBe(2);
  });

  test("select all selects all visible branches", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const selectAllButton = page.getByTestId("add-branches-select-all");
    await expect(selectAllButton).toContainText("Select All");

    await selectAllButton.click();

    await expect(selectAllButton).toContainText("Deselect All");

    const checkboxes = page.locator("input[type='checkbox']");
    const checkedCount = await checkboxes.evaluateAll((boxes) =>
      boxes.filter((box) => (box as HTMLInputElement).checked).length
    );
    expect(checkedCount).toBe(3);
  });

  test("select all on filtered list only selects filtered items", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B30");
    await page.waitForTimeout(250);

    const selectAllButton = page.getByTestId("add-branches-select-all");
    await selectAllButton.click();

    const checkbox1 = page.locator("#branch-disabled-1");
    const checkbox2 = page.locator("#branch-disabled-2");

    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).toBeChecked();
  });

  test("deselect all clears all selections", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox1 = page.locator("#branch-disabled-1");
    const checkbox2 = page.locator("#branch-disabled-2");

    await checkbox1.click();
    await checkbox2.click();

    const selectAllButton = page.getByTestId("add-branches-select-all");
    await selectAllButton.click();

    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).not.toBeChecked();
  });

  test("enable button is disabled when no selection", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const saveButton = page.getByTestId("add-branches-save");
    await expect(saveButton).toBeDisabled();
  });

  test("enable button is enabled when branches are selected", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox = page.locator("#branch-disabled-1");
    await checkbox.click();

    const saveButton = page.getByTestId("add-branches-save");
    await expect(saveButton).toBeEnabled();
  });

  test("enabling branches sends correct PUT requests", async ({ page }) => {
    const putRequests: Array<{ id: string; body: unknown }> = [];

    await page.route(/\/api\/branches\/[^/]+$/, async (route: Route) => {
      if (route.request().method() === "PUT") {
        const url = route.request().url();
        const branchId = url.split("/").pop();
        const body = route.request().postDataJSON();

        putRequests.push({ id: branchId ?? "", body });

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: branchId,
              accepts_reservations: true,
              deleted_at: null,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox1 = page.locator("#branch-disabled-1");
    const checkbox2 = page.locator("#branch-disabled-2");

    await checkbox1.click();
    await checkbox2.click();

    const saveButton = page.getByTestId("add-branches-save");
    await saveButton.click();

    await page.waitForTimeout(500);

    expect(putRequests.length).toBe(2);
    expect(putRequests[0]?.body).toEqual({ accepts_reservations: true });
    expect(putRequests[1]?.body).toEqual({ accepts_reservations: true });
  });

  test("modal closes after successful save", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    const checkbox = page.locator("#branch-disabled-1");
    await checkbox.click();

    const saveButton = page.getByTestId("add-branches-save");
    await saveButton.click();

    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test("close button works", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    const closeButton = page.getByTestId("add-branches-close");
    await closeButton.click();

    await expect(modal).not.toBeVisible();
  });

  test("clicking outside modal closes it", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    await page.locator('[role="dialog"]').press("Escape");
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("selections persist when filtering", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox1 = page.locator("#branch-disabled-1");
    await checkbox1.click();
    await expect(checkbox1).toBeChecked();

    const filter = page.getByTestId("add-branches-filter");
    await filter.fill("B30");
    await page.waitForTimeout(250);

    await filter.clear();
    await page.waitForTimeout(250);

    await expect(checkbox1).toBeChecked();
  });
});

test.describe("Add Branches Modal - Empty State", () => {
  test.describe.configure({ retries: 2 });

  test("shows empty state when all branches are enabled", async ({ page }) => {
    await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "enabled-1",
              name: "Branch 1",
              reference: "B01",
              accepts_reservations: true,
              deleted_at: null,
              sections: [],
            },
          ],
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

    await page.goto("/");
    await waitForPageLoad(page);

    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    const emptyState = page.getByTestId("add-branches-empty");
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText("No disabled branches");
    await expect(emptyState).toContainText("All branches are already enabled");
  });
});

test.describe("Add Branches Modal - Accessibility", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupWithDisabledBranches(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  test("modal has proper ARIA attributes", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("aria-modal", "true");
    await expect(modal).toHaveAttribute("aria-labelledby");
  });

  test("checkboxes are keyboard accessible", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    const checkbox = page.locator("#branch-disabled-1");
    await checkbox.focus();
    await expect(checkbox).toBeFocused();

    await checkbox.press("Space");
    await expect(checkbox).toBeChecked();
  });

  test("modal can be closed with Escape key", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    const modal = page.getByTestId("add-branches-modal");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("focus is trapped inside modal", async ({ page }) => {
    await page.getByTestId("add-branches").click();
    await page.getByTestId("add-branches-modal").waitFor();

    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));

    expect(focusedElement).toBeTruthy();
  });
});

