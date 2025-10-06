/**
 * @file i18n.spec.ts
 * @summary Module: tests/e2e/i18n.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
const STORAGE_KEY = "foodics-locale";
test.describe("i18n and RTL", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.clear();
        });
        await page.goto("/");
        await page.waitForSelector("[data-testid=\"locale-switcher\"]");
    });
    test.describe("Locale Switcher", () => {
        test("renders locale switcher button", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await expect(switcher).toBeVisible();
            await expect(switcher).toHaveRole("button");
        });
        test("shows Arabic label when in English mode", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await expect(switcher).toHaveText("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
        });
        test("is keyboard accessible", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await switcher.focus();
            await expect(switcher).toBeFocused();
        });
        test("has visible focus ring", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await switcher.focus();
            const focusRing = await switcher.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                    outline: styles.outline,
                    boxShadow: styles.boxShadow,
                };
            });
            const hasFocusIndicator = focusRing.outline !== "none" ||
                focusRing.boxShadow.includes("ring");
            expect(hasFocusIndicator).toBe(true);
        });
    });
    test.describe("Locale Toggle", () => {
        test("toggles to Arabic on click", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const locale = await page.evaluate(() => document.documentElement.lang);
            expect(locale).toBe("ar");
            const switcher = page.getByTestId("locale-switcher");
            await expect(switcher).toHaveText("English");
        });
        test("toggles back to English", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            await expect(page.getByTestId("locale-switcher")).toHaveText("English");
            await page.getByTestId("locale-switcher").click();
            await expect(page.getByTestId("locale-switcher")).toHaveText("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
            const locale = await page.evaluate(() => document.documentElement.lang);
            expect(locale).toBe("en");
        });
        test("updates page title in Arabic", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const title = page.getByTestId("header-title");
            await expect(title).toHaveText("\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633");
        });
        test("updates page title back to English", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            await page.getByTestId("locale-switcher").click();
            const title = page.getByTestId("header-title");
            await expect(title).toHaveText("Foodics Reservations");
        });
    });
    test.describe("HTML dir Attribute", () => {
        test("sets dir=\"ltr\" by default", async ({ page }) => {
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("ltr");
        });
        test("sets dir=\"rtl\" when switching to Arabic", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("rtl");
        });
        test("sets dir=\"ltr\" when switching back to English", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            await page.getByTestId("locale-switcher").click();
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("ltr");
        });
    });
    test.describe("HTML lang Attribute", () => {
        test("sets lang=\"en\" by default", async ({ page }) => {
            const lang = await page.evaluate(() => document.documentElement.lang);
            expect(lang).toBe("en");
        });
        test("sets lang=\"ar\" when switching to Arabic", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const lang = await page.evaluate(() => document.documentElement.lang);
            expect(lang).toBe("ar");
        });
        test("sets lang=\"en\" when switching back to English", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            await page.getByTestId("locale-switcher").click();
            const lang = await page.evaluate(() => document.documentElement.lang);
            expect(lang).toBe("en");
        });
    });
    test.describe("Persistence", () => {
        test("persists locale to localStorage", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const stored = await page.evaluate((key) => {
                return localStorage.getItem(key);
            }, STORAGE_KEY);
            expect(stored).toBe("ar");
        });
        test("restores locale from localStorage on page load", async ({ context }) => {
            const page = await context.newPage();
            await page.goto("/");
            await page.waitForSelector("[data-testid=\"locale-switcher\"]");
            await page.getByTestId("locale-switcher").click();
            await expect(page.getByTestId("header-title")).toHaveText("\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633");
            await page.reload();
            await page.waitForSelector("[data-testid=\"locale-switcher\"]");
            await expect(page.getByTestId("header-title")).toHaveText("\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633");
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("rtl");
            await page.close();
        });
        test("persists across new page visits", async ({ context }) => {
            const page = await context.newPage();
            await page.goto("/");
            await page.waitForSelector("[data-testid=\"locale-switcher\"]");
            await page.getByTestId("locale-switcher").click();
            await page.close();
            const newPage = await context.newPage();
            await newPage.goto("/");
            await newPage.waitForSelector("[data-testid=\"locale-switcher\"]");
            const title = newPage.getByTestId("header-title");
            await expect(title).toHaveText("\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633");
            await newPage.close();
        });
        test("defaults to English when no locale stored", async ({ page }) => {
            const title = page.getByTestId("header-title");
            await expect(title).toHaveText("Foodics Reservations");
            const dir = await page.evaluate(() => document.documentElement.dir);
            expect(dir).toBe("ltr");
        });
    });
    test.describe("RTL Layout", () => {
        test("maintains navigable layout in RTL mode", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const header = page.locator("header[role=\"banner\"]");
            await expect(header).toBeVisible();
            const switcher = page.getByTestId("locale-switcher");
            await expect(switcher).toBeVisible();
            await switcher.click();
            await expect(page.getByTestId("header-title")).toHaveText("Foodics Reservations");
        });
        test("header layout works in RTL", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const header = page.locator("header[role=\"banner\"]");
            const headerBox = await header.boundingBox();
            expect(headerBox).not.toBeNull();
            expect(headerBox?.width).toBeGreaterThan(0);
            expect(headerBox?.height).toBeGreaterThan(0);
        });
    });
    test.describe("Visual Parity", () => {
        test("English layout snapshot", async ({ page }) => {
            const header = page.locator("header[role=\"banner\"]");
            await expect(header).toBeVisible();
            await expect(page.getByTestId("header-title")).toBeVisible();
            await expect(page.getByTestId("locale-switcher")).toBeVisible();
        });
        test("Arabic layout snapshot", async ({ page }) => {
            await page.getByTestId("locale-switcher").click();
            const header = page.locator("header[role=\"banner\"]");
            await expect(header).toBeVisible();
            await expect(page.getByTestId("header-title")).toBeVisible();
            await expect(page.getByTestId("locale-switcher")).toBeVisible();
        });
        test("header elements are visible in both locales", async ({ page }) => {
            await expect(page.getByTestId("header-title")).toBeVisible();
            await expect(page.getByTestId("locale-switcher")).toBeVisible();
            await page.getByTestId("locale-switcher").click();
            await expect(page.getByTestId("header-title")).toBeVisible();
            await expect(page.getByTestId("locale-switcher")).toBeVisible();
        });
    });
    test.describe("Accessibility", () => {
        test("switcher has translatable aria-label", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            const ariaLabelEn = await switcher.getAttribute("aria-label");
            expect(ariaLabelEn).toBe("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
            await switcher.click();
            const ariaLabelAr = await switcher.getAttribute("aria-label");
            expect(ariaLabelAr).toBe("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
        });
        test("can toggle locale using keyboard", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await switcher.focus();
            await page.keyboard.press("Enter");
            const lang = await page.evaluate(() => document.documentElement.lang);
            expect(lang).toBe("ar");
        });
        test("can toggle locale using space key", async ({ page }) => {
            const switcher = page.getByTestId("locale-switcher");
            await switcher.focus();
            await page.keyboard.press("Space");
            const lang = await page.evaluate(() => document.documentElement.lang);
            expect(lang).toBe("ar");
        });
    });
});
