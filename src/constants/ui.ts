/**
 * @file ui.ts
 * @summary UI constants: toast types, confirm dialogs, button variants, durations
 * @remarks
 *   - Centralized UI behavior and styling constants
 *   - Ensures consistent UX across components
 * @example
 *   import { TOAST_DEFAULT_DURATION_MS, TOAST_TYPE_SUCCESS } from '@/constants/ui';
 *   notify('Saved!', TOAST_TYPE_SUCCESS, TOAST_DEFAULT_DURATION_MS);
 */

// Toast Types
export const TOAST_TYPE_SUCCESS = 'success' as const;
export const TOAST_TYPE_ERROR = 'error' as const;
export const TOAST_TYPE_WARNING = 'warning' as const;
export const TOAST_TYPE_INFO = 'info' as const;

export const TOAST_TYPES = [
  TOAST_TYPE_SUCCESS,
  TOAST_TYPE_ERROR,
  TOAST_TYPE_WARNING,
  TOAST_TYPE_INFO,
] as const;

// Toast Durations (milliseconds)
export const TOAST_DEFAULT_DURATION_MS = 5000;
export const AUTH_BANNER_AUTO_DISMISS_MS = 10000;

// Confirm Dialog Variants
export const CONFIRM_VARIANT_INFO = 'info' as const;
export const CONFIRM_VARIANT_WARNING = 'warning' as const;
export const CONFIRM_VARIANT_DANGER = 'danger' as const;

export const CONFIRM_VARIANTS = [
  CONFIRM_VARIANT_INFO,
  CONFIRM_VARIANT_WARNING,
  CONFIRM_VARIANT_DANGER,
] as const;

// Confirm Dialog Defaults
export const CONFIRM_DIALOG_DEFAULT_CONFIRM_TEXT = 'Confirm' as const;
export const CONFIRM_DIALOG_DEFAULT_CANCEL_TEXT = 'Cancel' as const;
export const CONFIRM_DIALOG_DEFAULT_VARIANT = CONFIRM_VARIANT_INFO;

// Button Variants
export const BUTTON_VARIANT_PRIMARY = 'primary' as const;
export const BUTTON_VARIANT_GHOST = 'ghost' as const;
export const BUTTON_VARIANT_DANGER = 'danger' as const;

// Banner Variants
export const BANNER_VARIANT_ERROR = 'error' as const;

// Modal Names (typed union values)
export const MODAL_NAME_ADD_BRANCHES = 'addBranches' as const;
export const MODAL_NAME_SETTINGS = 'settings' as const;

// Toast Color Classes (Tailwind)
export const TOAST_BASE_BG_CLASS = 'bg-white' as const;
export const TOAST_SUCCESS_TEXT_CLASS = 'text-green-800' as const;
export const TOAST_ERROR_TEXT_CLASS = 'text-red-800' as const;
export const TOAST_WARNING_TEXT_CLASS = 'text-yellow-800' as const;
export const TOAST_INFO_TEXT_CLASS = 'text-blue-800' as const;

// RTL Utility Classes
export const RTL_ICON_FLIP_CLASS = 'rtl:rotate-180' as const;
