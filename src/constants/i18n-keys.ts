/**
 * @file i18n-keys.ts
 * @summary i18n namespace keys for translations (errors, labels, messages)
 * @remarks
 *   - Prevents typos in i18n key strings
 *   - Used with vue-i18n $t() function
 * @example
 *   import { I18N_KEY_SLOT_ERROR_FORMAT } from '@/constants/i18n-keys';
 *   const errorMsg = t(I18N_KEY_SLOT_ERROR_FORMAT);
 */

// Slot Validation Error Keys
export const I18N_KEY_SLOT_ERROR_FORMAT = 'settings.slots.errors.format';
export const I18N_KEY_SLOT_ERROR_ORDER = 'settings.slots.errors.order';
export const I18N_KEY_SLOT_ERROR_MAX = 'settings.slots.errors.max';
export const I18N_KEY_SLOT_ERROR_OVERLAP = 'settings.slots.errors.overlap';
export const I18N_KEY_SLOT_ERROR_OVERNIGHT = 'settings.slots.errors.overnightNotSupported';

// Table/Section Labels
export const I18N_KEY_UNNAMED_SECTION = 'settings.tables.unnamedSection';
export const I18N_KEY_UNNAMED_TABLE = 'settings.tables.unnamedTable';

// Error Message Keys
export const I18N_KEY_ERROR_AUTH_TOKEN = 'errors.auth.token';
export const I18N_KEY_ERROR_CLIENT_GENERIC = 'errors.client.generic';
export const I18N_KEY_ERROR_SERVER_TRY_AGAIN = 'errors.server.tryAgain';

// Error Key Prefixes (for dynamic key construction)
export const I18N_KEY_PREFIX_ERROR_CLIENT = 'errors.client.';
export const I18N_KEY_PREFIX_ERROR_SERVER = 'errors.server.';
