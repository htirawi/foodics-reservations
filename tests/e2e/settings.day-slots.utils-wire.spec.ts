/**
 * @file settings.day-slots.utils-wire.spec.ts
 * @summary E2E smoke test: utils validation error keys → UI localized messages
 * @remarks Offline (intercepts); EN/AR locales; proves i18n key wiring
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { switchToLocale, assertLocaleState, type Locale } from "@tests/e2e/lib/i18n";
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

test.describe("Settings Day Slots - Utils Validation Wiring", () => {
  test.beforeEach(async ({ page }) => {
    await setupOfflineModeWithSections(page);
    await page.goto("/");
    await waitForPageLoad(page);
  });

  for (const locale of ["en", "ar"] as Locale[]) {
    test.describe(`Locale: ${locale.toUpperCase()}`, () => {
      test.beforeEach(async ({ page }) => {
        // Switch locale BEFORE opening modal to avoid modal blocking switcher
        await switchToLocale(page, locale);
        await assertLocaleState(page, locale, expect);
      });

      test("should verify document direction matches locale", async ({ page }) => {
        const dir = await page.evaluate(() => document.documentElement.dir);
        const expectedDir = locale === "en" ? "ltr" : "rtl";
        expect(dir).toBe(expectedDir);

        const lang = await page.evaluate(() => document.documentElement.lang);
        expect(lang).toBe(locale);
      });

          test("should verify i18n keys exist for slot validation", async ({ page }) => {
            // Test that the i18n keys we use in our utilities exist in the UI
            const i18nKeys = [
              "settings.slots.errors.format",
              "settings.slots.errors.order",
              "settings.slots.errors.overlap",
              "settings.slots.errors.max"
            ];

            for (const key of i18nKeys) {
              const translation = await page.evaluate((key) => {
                // Access the i18n instance from the Vue app
                const app = document.querySelector('#app') as HTMLElement & { __vue_app__?: { config?: { globalProperties?: { $t?: (key: string) => string } } } };
                if (app?.__vue_app__?.config?.globalProperties?.$t) {
                  return app.__vue_app__.config.globalProperties.$t(key);
                }
                return null;
              }, key);

              expect(translation).toBeTruthy();
              expect(translation).not.toBe(key); // Should be translated, not the key itself
            }
          });
        });
      }

});

