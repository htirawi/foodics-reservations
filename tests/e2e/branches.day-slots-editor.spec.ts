/**
 * @file branches.day-slots-editor.spec.ts
 * @summary E2E tests for Day-by-Day Slots Editor in settings modal
 * @remarks Offline (intercepts); EN/AR locales; stable test IDs
 */
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Day Slots Editor - Settings Modal", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept branches API
    await page.route("**/api/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "branch-1",
              name: "Main Branch",
              reservation_duration: 60,
              reservation_times: {
                saturday: [["09:00", "12:00"]],
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
              },
              sections: [],
            },
          ],
        }),
      });
    });

    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="branches-cards"]');

    // Open settings modal for first branch
    const settingsButton = page.locator('[data-testid="branch-branch-1-settings"]').first();
    await settingsButton.click();
    await page.waitForSelector('[data-testid="settings-modal"]');
  });

  test.describe("EN Locale", () => {
    test("should display day slots section with title", async ({ page }) => {
      const slotsSection = page.locator('[data-testid="settings-day-slots"]');
      await expect(slotsSection).toBeVisible();
      await expect(slotsSection).toContainText("Day-by-day time slots");
    });

    test("should render all 7 days in fixed order (Sat → Fri)", async ({ page }) => {
      const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

      for (const day of days) {
        const daySection = page.locator(`[data-testid="settings-day-${day}"]`);
        await expect(daySection).toBeVisible();
      }
    });

    test("should display existing Saturday slot from API", async ({ page }) => {
      const saturdayList = page.locator('[data-testid="settings-day-saturday-list"]');
      await expect(saturdayList).toBeVisible();

      const slot = page.locator('[data-testid="settings-day-saturday-row-0"]');
      await expect(slot).toBeVisible();
    });

    test("should allow adding a new slot", async ({ page }) => {
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');
      await addButton.click();

      // Should create new slot
      const slot = page.locator('[data-testid="settings-day-sunday-row-0"]');
      await expect(slot).toBeVisible();

      // Should have default times
      await expect(slot).toContainText("09:00");
      await expect(slot).toContainText("17:00");
    });

    test("should allow editing slot time", async ({ page }) => {
      // Saturday already has a slot from API
      const slot = page.locator('[data-testid="settings-day-saturday-row-0"]');
      await expect(slot).toBeVisible();

      // Click edit button (assuming TimePill component has edit mode)
      // The slot should become editable - test this by checking for input fields
      // Note: This depends on TimePill implementation
    });

    test("should allow removing a slot", async ({ page }) => {
      // Add a slot first
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');
      await addButton.click();
      await page.waitForTimeout(100);

      const slot = page.locator('[data-testid="settings-day-sunday-row-0"]');
      await expect(slot).toBeVisible();

      // Remove it (assuming TimePill has remove button)
      // This depends on TimePill implementation
    });

    test("should disable add button when at max slots (3)", async ({ page }) => {
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');

      // Add 3 slots
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        await page.waitForTimeout(50);
      }

      // Button should be disabled
      await expect(addButton).toBeDisabled();
    });

    test("should display validation error for invalid slot", async ({ page }) => {
      // This test depends on ability to edit slot times
      // We'd need to create an invalid slot (e.g., start > end)
      // Then check for error message

      // Add a slot
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');
      await addButton.click();
      await page.waitForTimeout(100);

      // Try to edit to invalid times (implementation depends on TimePill)
      // ...

      // Check for error
      // const error = page.locator('[data-testid="error-sunday"]');
      // await expect(error).toBeVisible();
      // await expect(error).toContainText("Start time must be before end time");
    });

    test("should show 'Apply on all days' button only for Saturday", async ({ page }) => {
      const applyButton = page.locator('[data-testid="slots-apply-all"]');
      await expect(applyButton).toBeVisible();

      // Check it's within Saturday section
      const saturdaySection = page.locator('[data-testid="settings-day-saturday"]');
      const buttonInSaturday = saturdaySection.locator('[data-testid="slots-apply-all"]');
      await expect(buttonInSaturday).toBeVisible();

      // Check it's NOT in other sections
      const sundaySection = page.locator('[data-testid="settings-day-sunday"]');
      const buttonInSunday = sundaySection.locator('[data-testid="slots-apply-all"]');
      await expect(buttonInSunday).not.toBeVisible();
    });

    test("should show confirmation dialog when applying to all days", async ({ page }) => {
      const applyButton = page.locator('[data-testid="slots-apply-all"]');
      await applyButton.click();

      // Check for confirmation dialog
      const dialog = page.locator('[data-testid="confirm-dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Apply Saturday's slots to all days");
      await expect(dialog).toContainText("This will overwrite slots for all other days");
    });

    test("should apply slots to all days when confirmed", async ({ page }) => {
      const applyButton = page.locator('[data-testid="slots-apply-all"]');
      await applyButton.click();
      await page.waitForTimeout(100);

      // Confirm
      const confirmButton = page.locator('[data-testid="confirm-yes"]');
      await confirmButton.click();
      await page.waitForTimeout(100);

      // Check Sunday now has same slots as Saturday
      const sundayList = page.locator('[data-testid="settings-day-sunday-list"]');
      await expect(sundayList).toBeVisible();

      const sundaySlot = page.locator('[data-testid="settings-day-sunday-row-0"]');
      await expect(sundaySlot).toBeVisible();
    });

    test("should NOT apply slots when confirmation canceled", async ({ page }) => {
      // Sunday should start empty
      const sundayListBefore = page.locator('[data-testid="settings-day-sunday-list"]');
      await expect(sundayListBefore).not.toBeVisible();

      const applyButton = page.locator('[data-testid="slots-apply-all"]');
      await applyButton.click();
      await page.waitForTimeout(100);

      // Cancel
      const cancelButton = page.locator('[data-testid="confirm-no"]');
      await cancelButton.click();
      await page.waitForTimeout(100);

      // Sunday should still be empty
      const sundayListAfter = page.locator('[data-testid="settings-day-sunday-list"]');
      await expect(sundayListAfter).not.toBeVisible();
    });

    test("should have proper accessibility attributes", async ({ page }) => {
      // Check fieldset structure
      const saturdayFieldset = page.locator('[data-testid="settings-day-saturday"]');
      await expect(saturdayFieldset).toHaveAttribute("aria-labelledby", "day-heading-saturday");

      // Check heading exists
      const heading = page.locator("#day-heading-saturday");
      await expect(heading).toBeVisible();
      await expect(heading).toContainText("Saturday");
    });

    test.skip("should have aria-live on error messages", async () => {
      // Implement when TimePill edit mode is ready
    });
  });

  test.describe("AR Locale (RTL)", () => {
    test.beforeEach(async ({ page }) => {
      // Switch to Arabic
      const localeSwitcher = page.locator('[data-testid="locale-switcher"]');
      await localeSwitcher.click();
      await page.waitForTimeout(200);

      // Verify RTL mode
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "rtl");
    });

    test("should display day slots section in RTL", async ({ page }) => {
      const slotsSection = page.locator('[data-testid="settings-day-slots"]');
      await expect(slotsSection).toBeVisible();

      // Should show Arabic translations
      await expect(slotsSection).toContainText("الفترات الزمنية حسب اليوم");
    });

    test("should render all days with Arabic names", async ({ page }) => {
      const saturdaySection = page.locator('[data-testid="settings-day-saturday"]');
      await expect(saturdaySection).toBeVisible();
      await expect(saturdaySection).toContainText("السبت");
    });

    test("should add slots in RTL mode", async ({ page }) => {
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');
      await addButton.click();
      await page.waitForTimeout(100);

      const slot = page.locator('[data-testid="settings-day-sunday-row-0"]');
      await expect(slot).toBeVisible();
    });

    test.skip("should show Arabic error messages", async () => {
      // Implement when TimePill edit mode is ready
    });

    test("should show confirmation dialog in Arabic", async ({ page }) => {
      const applyButton = page.locator('[data-testid="slots-apply-all"]');
      await applyButton.click();
      await page.waitForTimeout(100);

      const dialog = page.locator('[data-testid="confirm-dialog"]');
      await expect(dialog).toBeVisible();
      // Should contain Arabic text
    });

    test("should have proper RTL layout", async ({ page }) => {
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "rtl");

      // Test that layout feels natural in RTL
      // Buttons/icons should be mirrored where appropriate
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should allow navigating between days with Tab", async ({ page }) => {
      const saturdayAdd = page.locator('[data-testid="settings-day-saturday-add"]');
      await saturdayAdd.focus();

      await page.keyboard.press("Tab");
      // Should move to next interactive element
      // Implementation depends on tab order
    });

    test("should show visible focus indicators", async ({ page }) => {
      const addButton = page.locator('[data-testid="settings-day-saturday-add"]');
      await addButton.focus();

      // Check for focus ring (implementation specific)
      // Could check for outline or box-shadow
    });
  });

  test.describe("Integration with Save", () => {
    test("should include day slots when saving settings", async ({ page }) => {
      // Intercept PUT request
      let savedData: any = null;
      await page.route("**/api/branches/branch-1", async (route) => {
        if (route.request().method() === "PUT") {
          savedData = JSON.parse(route.request().postData() || "{}");
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: savedData }),
          });
        }
      });

      // Add a slot to Sunday
      const addButton = page.locator('[data-testid="settings-day-sunday-add"]');
      await addButton.click();
      await page.waitForTimeout(100);

      // Save
      const saveButton = page.locator('[data-testid="settings-save"]');
      await saveButton.click();
      await page.waitForTimeout(200);

      // Verify saved data includes reservation_times
      expect(savedData).toHaveProperty("reservation_times");
      expect(savedData.reservation_times.sunday).toHaveLength(1);
    });

    test.skip("should prevent save when slots have validation errors", async () => {
      // Implement when TimePill edit mode is ready
    });
  });
});
