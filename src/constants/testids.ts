/**
 * @file testids.ts
 * @summary Test IDs (data-testid) for E2E and component tests
 * @remarks
 *   - Centralized test selectors for Playwright/Vitest
 *   - Ensures consistent test target naming
 *   - Use TESTID_* for static IDs, TESTID_*_PREFIX for dynamic templates
 * @example
 *   import { TESTID_ADD_BRANCHES_BTN } from '@/constants/testids';
 *   <BaseButton data-testid={TESTID_ADD_BRANCHES_BTN}>Add</BaseButton>
 */

// Layout
export const TESTID_HEADER_TITLE = 'header-title' as const;
export const TESTID_SKIP_TO_MAIN = 'skip-to-main' as const;

// Toaster
export const TESTID_TOASTER = 'toaster' as const;
export const TESTID_TOAST_PREFIX = 'toast-' as const; // toast-success, toast-error, etc.

// Common UI Components
export const TESTID_EMPTY_STATE = 'empty-state' as const;
export const TESTID_PAGE_LOADING = 'page-loading' as const;
export const TESTID_LOCALE_SWITCHER = 'locale-switcher' as const;

// Confirm Dialog
export const TESTID_CONFIRM_MODAL = 'confirm-modal' as const;
export const TESTID_CONFIRM_CANCEL = 'confirm-cancel' as const;
export const TESTID_CONFIRM_OK = 'confirm-ok' as const;

// Banner
export const TESTID_BANNER_CLOSE = 'banner-close' as const;
export const TESTID_AUTH_BANNER_RETRY = 'auth-banner-retry' as const;

// Branches List View
export const TESTID_ADD_BRANCHES_BTN = 'add-branches' as const;
export const TESTID_BRANCHES_LOADING = 'branches-loading' as const;
export const TESTID_BRANCHES_ERROR = 'branches-error' as const;
export const TESTID_BRANCHES_EMPTY = 'branches-empty' as const;
export const TESTID_BRANCHES_TABLE = 'branches-table' as const;

// Branches Table/Cards (dynamic)
export const TESTID_BRANCH_ROW_PREFIX = 'branch-row-' as const; // branch-row-{id}
export const TESTID_BRANCH_CARD_PREFIX = 'branch-card-' as const; // branch-card-{id}

// Add Branches Modal
export const TESTID_ADD_BRANCHES_MODAL = 'add-branches-modal' as const;
export const TESTID_ADD_BRANCHES_EMPTY = 'add-branches-empty' as const;
export const TESTID_ADD_BRANCHES_FILTER = 'add-branches-filter' as const;
export const TESTID_ADD_BRANCHES_SELECT_ALL = 'add-branches-select-all' as const;
export const TESTID_ADD_BRANCHES_LIST = 'add-branches-list' as const;
export const TESTID_ADD_BRANCHES_ITEM_PREFIX = 'add-branches-item-' as const; // add-branches-item-{id}
export const TESTID_ADD_BRANCHES_CLOSE = 'add-branches-close' as const;
export const TESTID_ADD_BRANCHES_SAVE = 'add-branches-save' as const;

// Settings Modal
export const TESTID_SETTINGS_MODAL = 'settings-modal' as const;
export const TESTID_WORKING_HOURS_INFO = 'working-hours-info' as const;
export const TESTID_SETTINGS_TABLES = 'settings-tables' as const;
export const TESTID_SETTINGS_TABLES_SUMMARY = 'settings-tables-summary' as const;
export const TESTID_SETTINGS_TABLES_LIST = 'settings-tables-list' as const;
export const TESTID_SETTINGS_SECTION_PREFIX = 'settings-tables-section-' as const; // settings-tables-section-{id}
export const TESTID_SETTINGS_TABLE_PREFIX = 'settings-tables-table-' as const; // settings-tables-table-{id}
export const TESTID_SETTINGS_DAY_SLOTS = 'settings-day-slots' as const;
export const TESTID_SETTINGS_CANCEL = 'settings-cancel' as const;
export const TESTID_SETTINGS_SAVE = 'settings-save' as const;
export const TESTID_SAVE_BUTTON = 'save-button' as const;
export const TESTID_DISABLE_BUTTON = 'disable-button' as const;

// Duration Field
export const TESTID_SETTINGS_DURATION = 'settings-duration' as const;
export const TESTID_SETTINGS_DURATION_INPUT = 'settings-duration-input' as const;
export const TESTID_SETTINGS_DURATION_ERROR = 'settings-duration-error' as const;

// Day Slots Editor (dynamic)
export const TESTID_DAY_PREFIX = 'day-' as const; // day-saturday, day-sunday, etc.
export const TESTID_APPLY_ALL_PREFIX = 'apply-all-' as const; // apply-all-saturday
export const TESTID_SETTINGS_DAY_LIST_PREFIX = 'settings-day-' as const; // settings-day-saturday-list
export const TESTID_SLOT_ROW_PREFIX = 'settings-slot-row-' as const; // settings-slot-row-saturday-0
export const TESTID_ADD_SLOT_PREFIX = 'add-slot-' as const; // add-slot-saturday
export const TESTID_ERROR_PREFIX = 'error-' as const; // error-saturday
