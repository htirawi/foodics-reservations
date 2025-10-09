// Locale Codes
export const LOCALE_ENGLISH = 'en';
export const LOCALE_ARABIC = 'ar';

export const SUPPORTED_LOCALES = [LOCALE_ENGLISH, LOCALE_ARABIC];
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default & Fallback
export const LOCALE_DEFAULT = LOCALE_ENGLISH;
export const LOCALE_FALLBACK = LOCALE_ENGLISH;

// Text Direction Values
export const DIR_LTR = 'ltr';
export const DIR_RTL = 'rtl';

// Currency Codes (for i18n number formatting)
export const CURRENCY_USD = 'USD';
export const CURRENCY_SAR = 'SAR';
