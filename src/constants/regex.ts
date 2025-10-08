/**
 * @file regex.ts
 * @summary Regular expression patterns for validation
 * @remarks
 *   - Centralized regex patterns to avoid duplication
 *   - Used by validation utilities
 * @example
 *   import { TIME_FORMAT_REGEX } from '@/constants/regex';
 *   if (!TIME_FORMAT_REGEX.test(input)) { ... }
 */

/**
 * HH:mm format validation (24-hour time)
 * Matches: 00:00 to 23:59
 */
export const TIME_FORMAT_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
