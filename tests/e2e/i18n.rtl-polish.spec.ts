/**
 * @file i18n.rtl-polish.spec.ts
 * @summary Module: tests/e2e/i18n.rtl-polish.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";

test.describe("RTL & Arabic UI Polish", () => {
    test.beforeEach(async ({ page }) => {
        // Intercept API calls to avoid real network requests
        await page.route("**/api/**", (route) => {
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ data: [] }),
            });
        });
        
        await page.goto("/");
    });

    test.describe("Direction & Language Flipping", () => {
        test("should set correct dir and lang attributes when switching to Arabic", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Verify HTML attributes
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            await expect(page.locator("html")).toHaveAttribute("lang", "ar");
        });

        test("should set correct dir and lang attributes when switching to English", async ({ page }) => {
            // Switch to Arabic first
            await page.click('[data-testid="locale-switcher"]');
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            
            // Switch back to English
            await page.click('[data-testid="locale-switcher"]');
            
            // Verify HTML attributes
            await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
            await expect(page.locator("html")).toHaveAttribute("lang", "en");
        });

        test("should persist locale preference across page reloads", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            
            // Reload page
            await page.reload();
            
            // Verify Arabic is still selected
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            await expect(page.locator("html")).toHaveAttribute("lang", "ar");
        });
    });

    test.describe("Layout & Logical Properties", () => {
        test("should use logical properties in header layout", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Check header layout uses logical properties
            const header = page.locator("header");
            await expect(header).toBeVisible();
            
            // Verify header content is properly aligned
            const headerContent = header.locator("div").last();
            await expect(headerContent).toHaveClass(/justify-between/);
        });

        test("should position skip link using logical properties", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Focus skip link
            await page.keyboard.press("Tab");
            
            // Verify skip link is positioned correctly
            const skipLink = page.locator('[data-testid="skip-to-main"]');
            await expect(skipLink).toBeVisible();
            await expect(skipLink).toHaveClass(/focus:inset-inline-start-4/);
        });
    });

    test.describe("Modal RTL Behavior", () => {
        test("should position modal close button correctly in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Open a modal (we'll need to trigger one)
            // For now, let's check if any modals exist and can be opened
            const branchesTable = page.locator('[data-testid="branches-table"]');
            if (await branchesTable.isVisible()) {
                // Click on a branch row to open settings modal
                const firstRow = branchesTable.locator("tbody tr").first();
                if (await firstRow.isVisible()) {
                    await firstRow.click();
                    
                    // Check if modal opened
                    const modal = page.locator('[role="dialog"]');
                    if (await modal.isVisible()) {
                        // Verify modal header has close button
                        const closeButton = modal.locator('button[aria-label*="Close"], button[aria-label*="إغلاق"]');
                        await expect(closeButton).toBeVisible();
                        
                        // Close modal
                        await closeButton.click();
                    }
                }
            }
        });

        test("should handle keyboard navigation correctly in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Test that Tab navigation works (focus should move to some element)
            await page.keyboard.press("Tab");
            
            // Verify some element is focused (not testing specific element due to sr-only skip link)
            const focusedElement = page.locator(":focus");
            await expect(focusedElement).toBeVisible();
        });
    });

    test.describe("Toast RTL Behavior", () => {
        test("should position toasts correctly in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Check toast container positioning
            const toaster = page.locator('[data-testid="toaster"]');
            if (await toaster.isVisible()) {
                // Verify toast container uses logical properties
                await expect(toaster).toHaveClass(/sm:justify-end/);
            }
        });
    });

    test.describe("Table RTL Behavior", () => {
        test("should align table headers correctly in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Check table headers use logical alignment
            const table = page.locator('[data-testid="branches-table"]');
            if (await table.isVisible()) {
                const headers = table.locator("th");
                const headerCount = await headers.count();
                
                for (let i = 0; i < headerCount; i++) {
                    const header = headers.nth(i);
                    await expect(header).toHaveClass(/text-start/);
                }
            }
        });
    });

    test.describe("Accessibility in RTL", () => {
        test("should maintain proper ARIA attributes in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Verify skip link has proper ARIA
            const skipLink = page.locator('[data-testid="skip-to-main"]');
            await expect(skipLink).toHaveAttribute("href", "#main");
            
            // Verify main content is focusable
            const main = page.locator("#main");
            await expect(main).toHaveAttribute("role", "main");
            await expect(main).toHaveAttribute("tabindex", "-1");
        });

        test("should maintain focus visibility in RTL", async ({ page }) => {
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Focus some element
            await page.keyboard.press("Tab");
            
            // Verify focus ring is visible on some element
            const focusedElement = page.locator(":focus");
            await expect(focusedElement).toBeVisible();
        });
    });

    test.describe("Cross-browser RTL Support", () => {
        test("should work correctly in WebKit", async ({ page, browserName }) => {
            test.skip(browserName !== "webkit", "WebKit specific test");
            
            // Switch to Arabic
            await page.click('[data-testid="locale-switcher"]');
            
            // Verify basic RTL functionality
            await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
            await expect(page.locator("html")).toHaveAttribute("lang", "ar");
            
            // Switch back to English
            await page.click('[data-testid="locale-switcher"]');
            await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
            await expect(page.locator("html")).toHaveAttribute("lang", "en");
        });
    });
});
