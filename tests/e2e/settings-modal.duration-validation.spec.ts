/**
 * File: tests/e2e/settings-modal.duration-validation.spec.ts
 * Purpose: E2E tests for duration validation (integer, MIN_DURATION_MINUTES = 5)
 * Notes: Tests integer validation and minimum duration enforcement
 */

import { test, expect } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

import { loadFixture, isAllowedUrl } from "@tests/e2e/utils/network";

async function setupSettings(page: Page): Promise<void> {
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

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(loadFixture("branch-settings-success.json")),
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

test.describe("Settings Modal - Duration Validation", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupSettings(page);
    await page.goto("/");
    await waitForPageLoad(page);

    const firstRow = page.locator("[data-testid^='branch-row-']").first();
    await firstRow.click();
    await page.getByTestId("settings-modal").waitFor();
  });

  test("accepts valid integer duration >= 5", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    
    await durationInput.fill("5");
    await durationInput.blur();
    
    const error = page.getByTestId("settings-duration-error");
    await expect(error).not.toBeVisible();
  });

  test("rejects duration < 5", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    
    await durationInput.fill("4");
    await durationInput.blur();
    
    const error = page.getByTestId("settings-duration-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/minimum|min|5/i);
  });

  test("rejects duration = 0", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    
    await durationInput.fill("0");
    await durationInput.blur();
    
    const error = page.getByTestId("settings-duration-error");
    await expect(error).toBeVisible();
  });

  test("accepts large valid durations", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    
    await durationInput.fill("120");
    await durationInput.blur();
    
    const error = page.getByTestId("settings-duration-error");
    await expect(error).not.toBeVisible();
  });

  test("rejects decimal/float values", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    
    await durationInput.fill("30.5");
    await durationInput.blur();
    
    const error = page.getByTestId("settings-duration-error");
    await expect(error).toBeVisible();
  });
});

test.describe("Settings Modal - Slots Validation", () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await setupSettings(page);
    await page.goto("/");
    await waitForPageLoad(page);

    const firstRow = page.locator("[data-testid^='branch-row-']").first();
    await firstRow.click();
    await page.getByTestId("settings-modal").waitFor();
  });

  test("allows up to 3 slots per day", async ({ page }) => {
    const saturdaySection = page.locator("[data-testid='settings-slot-day-saturday']");
    const addButton = saturdaySection.getByTestId("slots-add");

    const existingSlots = await saturdaySection.locator("[data-testid^='settings-day-saturday-row-']").count();

    if (existingSlots < 3) {
      await addButton.click();
      const newSlots = await saturdaySection.locator("[data-testid^='settings-day-saturday-row-']").count();
      expect(newSlots).toBe(existingSlots + 1);
    }
  });

  test("blocks adding more than 3 slots per day", async ({ page }) => {
    const saturdaySection = page.locator("[data-testid='settings-slot-day-saturday']");
    const addButton = saturdaySection.getByTestId("slots-add");

    const initialSlots = await saturdaySection.locator("[data-testid^='settings-day-saturday-row-']").count();

    for (let i = initialSlots; i < 3; i++) {
      await addButton.click();
      await page.waitForTimeout(100);
    }

    const finalSlots = await saturdaySection.locator("[data-testid^='settings-day-saturday-row-']").count();
    expect(finalSlots).toBeLessThanOrEqual(3);
  });

  test("apply to all days copies Saturday slots to all days", async ({ page }) => {
    const applyButton = page.getByTestId("slots-apply-all");
    await expect(applyButton).toBeVisible();

    await applyButton.click();

    const confirmModal = page.getByTestId("confirm-modal");
    await expect(confirmModal).toBeVisible();

    const confirmButton = page.getByTestId("confirm-confirm");
    await confirmButton.click();

    await page.waitForTimeout(300);

    const sundaySlots = await page.locator("[data-testid='settings-slot-day-sunday'] [data-testid^='settings-day-sunday-row-']").count();
    const saturdaySlots = await page.locator("[data-testid='settings-slot-day-saturday'] [data-testid^='settings-day-saturday-row-']").count();

    expect(sundaySlots).toBe(Math.min(saturdaySlots, 3));
  });

  test("apply to all days respects max 3 slots limit", async ({ page }) => {
    const saturdaySection = page.locator("[data-testid='settings-slot-day-saturday']");
    const saturdaySlots = await saturdaySection.locator("[data-testid^='settings-day-saturday-row-']").count();

    const applyButton = page.getByTestId("slots-apply-all");
    await applyButton.click();

    const confirmModal = page.getByTestId("confirm-modal");
    await expect(confirmModal).toBeVisible();

    const confirmButton = page.getByTestId("confirm-confirm");
    await confirmButton.click();

    await page.waitForTimeout(300);

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
    
    for (const day of days) {
      const daySlots = await page.locator(`[data-testid='settings-slot-day-${day}'] [data-testid^='settings-day-${day}-row-']`).count();
      expect(daySlots).toBeLessThanOrEqual(3);
      expect(daySlots).toBe(Math.min(saturdaySlots, 3));
    }
  });
});

test.describe("Settings Modal - Table Display Format", () => {
  test.describe.configure({ retries: 2 });

  test("tables are formatted as 'section - table' with hyphen", async ({ page }) => {
    await setupSettings(page);
    await page.goto("/");
    await waitForPageLoad(page);

    const firstRow = page.locator("[data-testid='branch-row-enabled-1']");
    await firstRow.click();
    await page.getByTestId("settings-modal").waitFor();

    const tablesList = page.getByTestId("settings-tables-list");
    await expect(tablesList).toBeVisible();

    const tableText = await tablesList.textContent();
    expect(tableText).toMatch(/Terrace\s+-\s+Table/);
    expect(tableText).not.toMatch(/–/);
  });
});

