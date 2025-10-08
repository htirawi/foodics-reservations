/**
 * @file html.ts
 * @summary HTML attribute names and ID prefixes
 * @remarks
 *   - Used for dynamic ID generation and attribute setting
 *   - Ensures consistent naming conventions
 * @example
 *   import { HTML_ATTR_DIR, ID_PREFIX_INPUT } from '@/constants/html';
 *   document.documentElement.setAttribute(HTML_ATTR_DIR, 'rtl');
 */

// HTML Attribute Names
export const HTML_ATTR_DIR = 'dir';
export const HTML_ATTR_LANG = 'lang';

// ID Prefixes (for component ID generation)
export const ID_PREFIX_INPUT = 'input-';
export const ID_PREFIX_SELECT = 'select-';
export const ID_PREFIX_MODAL_TITLE = 'modal-title-';

// Random ID Generation Constants
export const RADIX_BASE36 = 36;
export const ID_RANDOM_SLICE_START = 2;
export const ID_RANDOM_SLICE_END = 9;
