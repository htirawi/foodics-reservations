/**
 * @file app-shell.spec.ts
 * @summary Module: tests/e2e/app-shell.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import { setupOfflineMode } from "./setup/intercepts";
test.describe("App Shell", () => {
    test("renders header with title", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const header = page.getByTestId("header-title");
        await expect(header).toBeVisible();
        await expect(header).toHaveText("Foodics Reservations");
    });
    test("renders locale switcher", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await expect(localeSwitcher).toBeVisible();
        await expect(localeSwitcher).toHaveText("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
    });
    test("has proper header landmark", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const header = page.locator("header[role=\"banner\"]");
        await expect(header).toBeVisible();
    });
    test("has proper main landmark", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const main = page.locator("main[role=\"main\"]");
        await expect(main).toBeVisible();
        await expect(main).toHaveAttribute("id", "main");
        await expect(main).toHaveAttribute("tabindex", "-1");
    });
});
test.describe("Locale Switching", () => {
    test("toggles locale from EN to AR", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await expect(localeSwitcher).toHaveText("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
        await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await localeSwitcher.click();
        await expect(localeSwitcher).toHaveText("English");
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    });
    test("toggles locale from AR back to EN", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await localeSwitcher.click();
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await localeSwitcher.click();
        await expect(localeSwitcher).toHaveText("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
        await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
    test("updates header title when locale changes", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const header = page.getByTestId("header-title");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await expect(header).toHaveText("Foodics Reservations");
        await localeSwitcher.click();
        await expect(header).toHaveText("\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633");
    });
    test("locale switcher is keyboard accessible", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await localeSwitcher.focus();
        await expect(localeSwitcher).toBeFocused();
        await localeSwitcher.press("Enter");
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    });
});
test.describe("Toaster", () => {
    test("displays toast notification", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await page.evaluate(() => {
            interface WindowWithStore extends Window {
                __uiStore?: {
                    notify: (msg: string, type: string, duration: number) => void;
                };
            }
            const uiStore = (window as WindowWithStore).__uiStore;
            if (uiStore) {
                uiStore.notify("Test success message", "success", 0);
            }
        });
        const toaster = page.getByTestId("toaster");
        await expect(toaster).toBeVisible();
        await expect(toaster).toHaveAttribute("aria-live", "polite");
        await expect(toaster).toHaveAttribute("role", "status");
    });
    test("displays success toast with correct content", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await page.evaluate(() => {
            interface WindowWithStore extends Window {
                __uiStore?: {
                    notify: (msg: string, type: string, duration: number) => void;
                };
            }
            const uiStore = (window as WindowWithStore).__uiStore;
            if (uiStore) {
                uiStore.notify("Operation completed successfully", "success", 0);
            }
        });
        const toast = page.getByTestId("toast-success");
        await expect(toast).toBeVisible();
        await expect(toast).toContainText("Operation completed successfully");
    });
    test("displays error toast with correct content", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await page.evaluate(() => {
            interface WindowWithStore extends Window {
                __uiStore?: {
                    notify: (msg: string, type: string, duration: number) => void;
                };
            }
            const uiStore = (window as WindowWithStore).__uiStore;
            if (uiStore) {
                uiStore.notify("An error occurred", "error", 0);
            }
        });
        const toast = page.getByTestId("toast-error");
        await expect(toast).toBeVisible();
        await expect(toast).toContainText("An error occurred");
    });
    test("closes toast when close button clicked", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        await page.evaluate(() => {
            interface WindowWithStore extends Window {
                __uiStore?: {
                    notify: (msg: string, type: string, duration: number) => void;
                };
            }
            const uiStore = (window as WindowWithStore).__uiStore;
            if (uiStore) {
                uiStore.notify("Dismissible toast", "info", 0);
            }
        });
        const toast = page.getByTestId("toast-info");
        await expect(toast).toBeVisible();
        const closeButton = toast.locator("button[aria-label=\"Close\"]");
        await closeButton.click();
        await expect(toast).not.toBeVisible();
    });
});
test.describe("Accessibility", () => {
    test("has visible focus indicators", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const localeSwitcher = page.getByTestId("locale-switcher");
        await localeSwitcher.focus();
        await expect(localeSwitcher).toBeFocused();
        const boxShadow = await localeSwitcher.evaluate((el) => {
            return window.getComputedStyle(el).boxShadow;
        });
        expect(boxShadow).not.toBe("none");
    });
    test("header has proper semantic structure", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const banner = page.locator("header[role=\"banner\"]");
        await expect(banner).toBeVisible();
        const heading = banner.locator("h1");
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText("Foodics Reservations");
    });
    test("main content is focusable for skip-to-content", async ({ page }) => {
        await setupOfflineMode(page);
        await page.goto("/");
        const main = page.locator("main#main[role=\"main\"]");
        await expect(main).toHaveAttribute("tabindex", "-1");
    });
});
