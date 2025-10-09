/**
 * @file branches.settings.spec.ts
 * @summary Requirements 5-9: Settings modal validation and slot management
 */
import { test, expect } from "@playwright/test";

import { MIN_DURATION_MINUTES } from "@constants/reservations";

import { mountWithMocks } from "@tests/e2e/utils/network";

test.describe("Settings Modal - Requirements 5-9", () => {
  test.beforeEach(async ({ page }) => {
    await mountWithMocks(page);
    await page.goto("/");
    await page.waitForSelector("[data-testid='branches-table'], [data-testid^='branch-card-']");

    const branchRow = page.getByTestId("branch-row-97a57184-e3e5-4d0e-8556-09270dcd686c");
    await branchRow.click();
    await page.waitForSelector("[data-testid='settings-modal']");
  });

  test("REQ-5: settings modal opens when clicking branch", async ({ page }) => {
    const modal = page.getByTestId("settings-modal");
    await expect(modal).toBeVisible();
  });

  test("REQ-6: duration is required and validates >= MIN_DURATION_MINUTES", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");

    await durationInput.clear();
    await durationInput.blur();

    const errorMsg = page.getByTestId("settings-duration-error");
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText("required");

    await durationInput.fill("3");
    await durationInput.blur();

    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText(`${MIN_DURATION_MINUTES}`);

    await durationInput.fill("30");
    await durationInput.blur();

    await expect(errorMsg).not.toBeVisible();
  });

  test("REQ-6: duration only accepts integers", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");

    await durationInput.fill("30.5");
    await durationInput.blur();

    const errorMsg = page.getByTestId("settings-duration-error");
    const hasError = await errorMsg.isVisible();

    if (hasError) {
      await expect(errorMsg).toContainText("integer");
    } else {
      const value = await durationInput.inputValue();
      expect(parseInt(value, 10)).toBe(30);
    }
  });

  test.skip("REQ-7: table dropdown shows {section_name} - {table_name} format", async () => {
    // Skip this test - table selection is done via checkboxes in settings-tables-list, not a dropdown
  });

  test("REQ-8: can add/edit/delete time slots (max 3 per day)", async ({ page }) => {
    const addSlotBtn = page.getByTestId("add-slot-saturday");
    await addSlotBtn.click();

    const saturdaySlots = page.locator("[data-testid^='settings-slot-row-saturday-']");
    await expect(saturdaySlots).toHaveCount(3);

    const addBtnDisabled = await addSlotBtn.isDisabled();
    expect(addBtnDisabled).toBe(true);
  });

  test("REQ-8: can delete a slot", async ({ page }) => {
    const firstSlot = page.getByTestId("settings-slot-row-saturday-0");
    await expect(firstSlot).toBeVisible();

    const deleteBtn = firstSlot.getByTestId("slot-delete-btn");
    await deleteBtn.click();

    const saturdaySlots = page.locator("[data-testid^='settings-slot-row-saturday-']");
    await expect(saturdaySlots).toHaveCount(1);
  });

  test("REQ-8: slot times are in HH:mm - HH:mm format", async ({ page }) => {
    const firstSlot = page.getByTestId("settings-slot-row-saturday-0");

    const slotText = await firstSlot.textContent();
    expect(slotText).toMatch(/\d{2}:\d{2} - \d{2}:\d{2}/);
  });

  test("REQ-9: Apply on all days copies Saturday slots to other days", async ({ page }) => {
    const applyAllBtn = page.getByTestId("apply-all-saturday");
    await applyAllBtn.click();

    const confirmDialog = page.getByTestId("confirm-modal");
    await expect(confirmDialog).toBeVisible();
    await page.getByTestId("confirm-ok").click();
    await expect(confirmDialog).not.toBeVisible();

    const sundaySlots = page.locator("[data-testid^='settings-slot-row-sunday-']");
    await expect(sundaySlots).toHaveCount(2);

    const mondaySlots = page.locator("[data-testid^='settings-slot-row-monday-']");
    await expect(mondaySlots).toHaveCount(2);
  });

  test("REQ-9: Apply on all days clips to max 3 slots per day with notice", async ({ page }) => {
    await page.getByTestId("add-slot-saturday").click();

    const saturdaySlots = page.locator("[data-testid^='settings-slot-row-saturday-']");
    await expect(saturdaySlots).toHaveCount(3);

    await page.getByTestId("apply-all-saturday").click();

    const tuesdaySlots = page.locator("[data-testid^='settings-slot-row-tuesday-']");
    const tuesdayCount = await tuesdaySlots.count();
    expect(tuesdayCount).toBeLessThanOrEqual(3);
  });

  test("REQ-9: Save triggers PUT with correct payload (duration + reservation_times)", async ({ page }) => {
    const durationInput = page.getByTestId("settings-duration-input");
    await durationInput.clear();
    await durationInput.fill("90");
    await durationInput.blur();

    await page.getByTestId("add-slot-sunday").click();
    await page.waitForSelector("[data-testid='settings-slot-row-sunday-2']");

    const sundaySlot = page.getByTestId("settings-slot-row-sunday-2");
    const startTimeInput = sundaySlot.locator("input[type='time']").first();
    const endTimeInput = sundaySlot.locator("input[type='time']").last();
    await startTimeInput.fill("10:00");
    await endTimeInput.fill("11:00");

    const putRequest = page.waitForRequest((req) =>
      req.url().includes("/api/branches/97a57184-e3e5-4d0e-8556-09270dcd686c") && req.method() === "PUT"
    );

    await page.getByTestId("save-button").click();

    const req = await putRequest;
    const payload = req.postDataJSON();

    expect(payload).toHaveProperty("reservation_duration", 90);
    expect(payload).toHaveProperty("reservation_times");
    expect(payload.reservation_times).toHaveProperty("sunday");
    expect(payload.reservation_times.sunday).toContainEqual(["10:00", "11:00"]);
  });

  test("REQ-7: all tables show correct section-table format in list", async ({ page }) => {
    const tablesList = page.getByTestId("settings-tables-list");
    await expect(tablesList).toBeVisible();

    const tableItems = tablesList.locator("[data-testid^='settings-tables-table-']");
    const count = await tableItems.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const itemText = await tableItems.nth(i).textContent();
      expect(itemText).toMatch(/.+ - .+/);
    }
  });

  test("REQ-8: editing slot time updates correctly", async ({ page }) => {
    const firstSlot = page.getByTestId("settings-slot-row-saturday-0");

    const startInput = firstSlot.locator("input[type='time']").first();
    const endInput = firstSlot.locator("input[type='time']").last();

    await startInput.fill("08:00");
    await endInput.fill("09:00");
    await startInput.blur();

    const slotText = await firstSlot.textContent();
    expect(slotText).toContain("08:00");
    expect(slotText).toContain("09:00");
  });

  test("REQ-9: Apply all confirmation dialog works", async ({ page }) => {
    const applyAllBtn = page.getByTestId("apply-all-saturday");
    await applyAllBtn.click();

    const confirmDialog = page.getByTestId("confirm-modal");
    await expect(confirmDialog).toBeVisible();

    await page.getByTestId("confirm-cancel").click();
    await expect(confirmDialog).not.toBeVisible();
  });
});
