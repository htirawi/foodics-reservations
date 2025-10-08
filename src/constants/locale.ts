/**
 * @file locale.ts
 * @summary Locale codes, direction values, and i18n configuration
 * @remarks
 *   - Supported locales and RTL/LTR settings
 *   - Used by i18n plugin and locale composables
 * @example
 *   import { LOCALE_ARABIC, DIR_RTL } from '@/constants/locale';
 *   if (locale === LOCALE_ARABIC) { setDir(DIR_RTL); }
 */

// Locale Codes
export const LOCALE_ENGLISH = 'en' as const;
export const LOCALE_ARABIC = 'ar' as const;

export const SUPPORTED_LOCALES = [LOCALE_ENGLISH, LOCALE_ARABIC] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default & Fallback
export const LOCALE_DEFAULT = LOCALE_ENGLISH;
export const LOCALE_FALLBACK = LOCALE_ENGLISH;

// Text Direction Values
export const DIR_LTR = 'ltr' as const;
export const DIR_RTL = 'rtl' as const;

// Currency Codes (for i18n number formatting)
export const CURRENCY_USD = 'USD' as const;
export const CURRENCY_SAR = 'SAR' as const;
