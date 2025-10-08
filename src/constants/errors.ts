/**
 * @file errors.ts
 * @summary Fallback error message strings
 * @remarks
 *   - Default error messages when i18n keys are unavailable
 *   - Used in error interceptors and error boundaries
 * @example
 *   import { ERROR_MSG_NETWORK_FALLBACK } from '@/constants/errors';
 *   const msg = error.message ?? ERROR_MSG_NETWORK_FALLBACK;
 */

// Network/HTTP Errors
export const ERROR_MSG_NETWORK_FALLBACK = 'Network error occurred' as const;

// Locale Errors
export const ERROR_MSG_LOCALE_SAVE_FAILED = 'Failed to save language preference. It will reset on page reload.' as const;
export const ERROR_MSG_LOCALE_LOAD_FAILED = 'Failed to load language preference. Using default language.' as const;

// Branches Service Errors
export const ERROR_MSG_FETCH_BRANCHES_FAILED = 'Failed to fetch branches' as const;
export const ERROR_MSG_ENABLE_BRANCHES_FAILED = 'Failed to enable branches' as const;
export const ERROR_MSG_DISABLE_ALL_FAILED = 'Failed to disable all branches' as const;
export const ERROR_MSG_UPDATE_SETTINGS_FAILED = 'Failed to update branch settings' as const;
