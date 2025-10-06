/**
 * i18n Test Helpers
 * Provides utilities for locale switching and assertions in E2E tests
 */

import type { Page, expect } from '@playwright/test';

export type Locale = 'en' | 'ar';

export interface LocaleAssertions {
  htmlDir: string;
  htmlLang: string;
  headerTitle: string;
  localeSwitcherText: string;
}

const LOCALE_DATA: Record<Locale, LocaleAssertions> = {
  en: {
    htmlDir: 'ltr',
    htmlLang: 'en',
    headerTitle: 'Foodics Reservations',
    localeSwitcherText: 'العربية',
  },
  ar: {
    htmlDir: 'rtl',
    htmlLang: 'ar',
    headerTitle: 'حجوزات فوديكس',
    localeSwitcherText: 'English',
  },
};

/**
 * Switch to a specific locale using the locale switcher
 */
export async function switchToLocale(page: Page, targetLocale: Locale): Promise<void> {
  // Get current locale
  const currentLocale = await page.evaluate(() => document.documentElement.lang) as Locale;
  
  // If already in target locale, no need to switch
  if (currentLocale === targetLocale) {
    return;
  }
  
  // Click the locale switcher to toggle
  const switcher = page.getByTestId('locale-switcher');
  await switcher.click();
  
  // Wait for the switch to complete
  await page.waitForTimeout(100);
}

/**
 * Assert that the page is in the correct locale state
 */
export async function assertLocaleState(
  page: Page, 
  expectedLocale: Locale, 
  expectFn: typeof expect
): Promise<void> {
  const data = LOCALE_DATA[expectedLocale];
  
  // Assert HTML attributes
  const htmlDir = await page.evaluate(() => document.documentElement.dir);
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  
  expectFn(htmlDir).toBe(data.htmlDir);
  expectFn(htmlLang).toBe(data.htmlLang);
  
  // Assert UI elements
  const headerTitle = page.getByTestId('header-title');
  const localeSwitcher = page.getByTestId('locale-switcher');
  
  await expectFn(headerTitle).toHaveText(data.headerTitle);
  await expectFn(localeSwitcher).toHaveText(data.localeSwitcherText);
}

/**
 * Run a test in both English and Arabic locales
 */
export function testBothLocales(
  _testName: string,
  testFn: (page: Page, locale: Locale) => Promise<void>
) {
  return async (page: Page, expectFn: typeof expect) => {
    for (const locale of ['en', 'ar'] as Locale[]) {
      // Switch to the locale
      await switchToLocale(page, locale);
      
      // Assert we're in the correct locale
      await assertLocaleState(page, locale, expectFn);
      
      // Run the test
      await testFn(page, locale);
    }
  };
}

/**
 * Setup locale for a test based on project name
 */
export async function setupLocaleFromProject(page: Page, projectName: string): Promise<Locale> {
  // Extract locale from project name (e.g., 'chromium-en' -> 'en')
  const locale = projectName.endsWith('-ar') ? 'ar' : 'en';
  
  // Ensure we start in the correct locale
  await switchToLocale(page, locale);
  
  return locale;
}

/**
 * Get expected locale from project name
 */
export function getLocaleFromProject(projectName: string): Locale {
  return projectName.endsWith('-ar') ? 'ar' : 'en';
}
