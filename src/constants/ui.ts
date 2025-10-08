// Toast Types
export const TOAST_TYPE_SUCCESS = 'success';
export const TOAST_TYPE_ERROR = 'error';
export const TOAST_TYPE_WARNING = 'warning';
export const TOAST_TYPE_INFO = 'info';

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
export const CONFIRM_VARIANT_INFO = 'info';
export const CONFIRM_VARIANT_WARNING = 'warning';
export const CONFIRM_VARIANT_DANGER = 'danger';

export const CONFIRM_VARIANTS = [
  CONFIRM_VARIANT_INFO,
  CONFIRM_VARIANT_WARNING,
  CONFIRM_VARIANT_DANGER,
] as const;

// Confirm Dialog Defaults
export const CONFIRM_DIALOG_DEFAULT_CONFIRM_TEXT = 'Confirm';
export const CONFIRM_DIALOG_DEFAULT_CANCEL_TEXT = 'Cancel';
export const CONFIRM_DIALOG_DEFAULT_VARIANT = CONFIRM_VARIANT_INFO;

// Button Variants
export const BUTTON_VARIANT_PRIMARY = 'primary';
export const BUTTON_VARIANT_GHOST = 'ghost';
export const BUTTON_VARIANT_DANGER = 'danger';

// Banner Variants
export const BANNER_VARIANT_ERROR = 'error';

// Modal Names (typed union values)
export const MODAL_NAME_ADD_BRANCHES = 'addBranches';
export const MODAL_NAME_SETTINGS = 'settings';

// Toast Color Classes (Tailwind)
export const TOAST_BASE_BG_CLASS = 'bg-white';
export const TOAST_SUCCESS_TEXT_CLASS = 'text-green-800';
export const TOAST_ERROR_TEXT_CLASS = 'text-red-800';
export const TOAST_WARNING_TEXT_CLASS = 'text-yellow-800';
export const TOAST_INFO_TEXT_CLASS = 'text-blue-800';

// RTL Utility Classes
export const RTL_ICON_FLIP_CLASS = 'rtl:rotate-180';
