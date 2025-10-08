/**
 * @file edge.policies.spec.ts
 * @summary E2E tests for edge-case policies (offline, EN/AR locales)
 * @remarks
 *   - NOTE: Full implementation requires component wiring for error display
 *   - This file documents required E2E tests for edge-case policies
 *   - Tests should run offline with intercepts, no real API/tokens
 *   - Must run in both EN and AR locales with dir/string assertions
 *
 * REQUIRED TESTS (to be implemented when UI wiring is complete):
 *
 * 1. Week Order (Sat→Fri):
 *    - Verify days render in Saturday → Friday order
 *    - Check both EN labels (Saturday, Sunday...) and AR labels (السبت, الأحد...)
 *
 * 2. Overlap Detection:
 *    - Edit slot to overlap another → inline error shown, Save disabled
 *    - Touching slots (end === start) → NO error, Save enabled
 *    - Error message: EN "must not overlap" / AR "لا يمكن أن تتداخل"
 *
 * 3. Max Slots Per Day:
 *    - Day with 3 slots → "Add Slot" button disabled
 *    - Attempt 4th slot → blocked with "max 3" error
 *
 * 4. Overnight Ranges Blocked:
 *    - Set slot with end < start (e.g., 22:00-02:00) → error shown
 *    - Error key: "settings.slots.errors.overnightNotSupported"
 *    - EN: "Overnight ranges aren't supported" / AR: "الفترات الليلية غير مدعومة"
 *
 * 5. Empty Day Allowed:
 *    - Remove all slots from a day → no error
 *    - Save button remains enabled (empty day = closed, valid)
 *
 * 6. Apply Saturday to All Days:
 *    - Click "Apply on all days" → confirmation dialog appears
 *    - Confirm → Saturday slots copied to Sun-Fri
 *    - Cancel → no changes applied
 *    - Dialog message: EN "overwrite" / AR "الكتابة فوق"
 *
 * 7. No Sections/Tables:
 *    - Branch with no sections → summary shows "Reservable tables: 0"
 *    - UI remains usable, Save button functional
 *
 * 8. 401 Auth Handling:
 *    - Mock 401 response → auth banner appears
 *    - EN: "Authentication failed" / AR: "فشلت المصادقة"
 *    - Protected actions blocked until token restored
 *    - Restore token → retry succeeds, banner dismissed
 *
 * 9. State Persistence:
 *    - Edit slot, save, reload page → changes persisted (via intercepts)
 *    - Verify state survives page refresh
 *
 * 10. Locale/RTL:
 *     - EN → html[dir="ltr"], labels in English
 *     - AR → html[dir="rtl"], labels in Arabic, layout RTL
 */

import { test, expect } from "@playwright/test";
import { switchToLocale } from "./lib/i18n";

test.describe("Edge-Case Policies - E2E (Documented)", () => {
  test.describe("Basic Verification", () => {
    test("should verify html[dir] for EN", async ({ page }) => {
      await switchToLocale(page, "en");
      await page.goto("/");
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "ltr");
    });

    test("should verify html[dir=rtl] for AR", async ({ page }) => {
      await switchToLocale(page, "ar");
      await page.goto("/");
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "rtl");
    });

    test("should show 401 auth banner in EN", async ({ page }) => {
      await switchToLocale(page, "en");

      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });
      await expect(banner).toContainText("Authentication failed");
    });

    test("should show 401 auth banner in AR", async ({ page }) => {
      await switchToLocale(page, "ar");

      await page.route("**/api/branches*", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const banner = page.locator('[data-testid="auth-token-banner"]');
      await expect(banner).toBeVisible({ timeout: 10000 });
      await expect(banner).toContainText("فشلت المصادقة");
    });
  });

});
