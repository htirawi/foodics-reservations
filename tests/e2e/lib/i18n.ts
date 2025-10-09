/**
 * @file i18n.ts
 * @summary Module: tests/e2e/lib/i18n.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Page, expect } from "@playwright/test";

export type Locale = "en" | "ar";
export interface ILocaleAssertions {
    htmlDir: string;
    htmlLang: string;
    headerTitle: string;
    localeSwitcherText: string;
}
const LOCALE_DATA: Record<Locale, ILocaleAssertions> = {
    en: {
        htmlDir: "ltr",
        htmlLang: "en",
        headerTitle: "Foodics Reservations",
        localeSwitcherText: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    },
    ar: {
        htmlDir: "rtl",
        htmlLang: "ar",
        headerTitle: "\u062D\u062C\u0648\u0632\u0627\u062A \u0641\u0648\u062F\u064A\u0643\u0633",
        localeSwitcherText: "English",
    },
};
export async function switchToLocale(page: Page, targetLocale: Locale): Promise<void> {
    // Check if we're on a page - if not, navigate first
    const currentUrl = page.url();
    if (!currentUrl || currentUrl === "about:blank") {
        await page.goto("/", { waitUntil: "domcontentloaded" });
    }
    
    // Wait for page to be loaded by checking for locale-switcher
    const switcher = page.getByTestId("locale-switcher");
    await switcher.waitFor({ state: "visible", timeout: 10000 });
    
    const currentLocale = await page.evaluate(() => document.documentElement.lang) as Locale;
    if (currentLocale === targetLocale) {
        return;
    }
    
    await switcher.click();
    await page.waitForTimeout(100);
}
export async function assertLocaleState(page: Page, expectedLocale: Locale, expectFn: typeof expect): Promise<void> {
    const data = LOCALE_DATA[expectedLocale];
    const htmlDir = await page.evaluate(() => document.documentElement.dir);
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    expectFn(htmlDir).toBe(data.htmlDir);
    expectFn(htmlLang).toBe(data.htmlLang);
    const headerTitle = page.getByTestId("header-title");
    const localeSwitcher = page.getByTestId("locale-switcher");
    await expectFn(headerTitle).toHaveText(data.headerTitle);
    await expectFn(localeSwitcher).toHaveText(data.localeSwitcherText);
}
export function testBothLocales(_testName: string, testFn: (page: Page, locale: Locale) => Promise<void>) {
    return async (page: Page, expectFn: typeof expect) => {
        for (const locale of ["en", "ar"] as Locale[]) {
            await switchToLocale(page, locale);
            await assertLocaleState(page, locale, expectFn);
            await testFn(page, locale);
        }
    };
}
export async function setupLocaleFromProject(page: Page, projectName: string): Promise<Locale> {
    const locale = projectName.endsWith("-ar") ? "ar" : "en";
    await switchToLocale(page, locale);
    return locale;
}
export function getLocaleFromProject(projectName: string): Locale {
    return projectName.endsWith("-ar") ? "ar" : "en";
}
