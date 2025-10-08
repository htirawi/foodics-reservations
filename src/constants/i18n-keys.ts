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
export const I18N_KEY_SLOT_ERROR_FORMAT = 'settings.slots.errors.format' as const;
export const I18N_KEY_SLOT_ERROR_ORDER = 'settings.slots.errors.order' as const;
export const I18N_KEY_SLOT_ERROR_MAX = 'settings.slots.errors.max' as const;
export const I18N_KEY_SLOT_ERROR_OVERLAP = 'settings.slots.errors.overlap' as const;
export const I18N_KEY_SLOT_ERROR_OVERNIGHT = 'settings.slots.errors.overnight' as const;

// Table/Section Labels
export const I18N_KEY_UNNAMED_SECTION = 'settings.tables.unnamedSection' as const;
export const I18N_KEY_UNNAMED_TABLE = 'settings.tables.unnamedTable' as const;

// Error Message Keys
export const I18N_KEY_ERROR_AUTH_TOKEN = 'errors.auth.token' as const;
export const I18N_KEY_ERROR_CLIENT_GENERIC = 'errors.client.generic' as const;
export const I18N_KEY_ERROR_SERVER_TRY_AGAIN = 'errors.server.tryAgain' as const;

// Error Key Prefixes (for dynamic key construction)
export const I18N_KEY_PREFIX_ERROR_CLIENT = 'errors.client.' as const;
export const I18N_KEY_PREFIX_ERROR_SERVER = 'errors.server.' as const;
