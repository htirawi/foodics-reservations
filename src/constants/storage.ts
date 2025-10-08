/**
 * @file storage.ts
 * @summary localStorage and sessionStorage key constants
 * @remarks
 *   - Prevents typos in storage key strings
 *   - Ensures consistent storage access across the app
 * @example
 *   import { LOCALE_STORAGE_KEY } from '@/constants/storage';
 *   localStorage.setItem(LOCALE_STORAGE_KEY, 'ar');
 */

// localStorage Keys
export const LOCALE_STORAGE_KEY = 'foodics-locale' as const;
