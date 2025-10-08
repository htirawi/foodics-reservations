/**
 * @file time.ts
 * @summary Time conversion factors, limits, and formatting constants
 * @remarks
 *   - Used by pure time utilities (HH:mm operations)
 *   - No date library dependencies
 * @example
 *   import { MINUTES_PER_HOUR, TIME_PAD_LENGTH } from '@/constants/time';
 *   const hours = Math.floor(minutes / MINUTES_PER_HOUR);
 */

// Conversion Factors
export const MINUTES_PER_HOUR = 60 as const;
export const HOURS_PER_DAY = 24 as const;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR; // 1440

// Time Limits
export const MAX_MINUTES_PER_DAY = 1439 as const; // 23:59 in minutes

// Formatting
export const TIME_PAD_LENGTH = 2 as const;
export const TIME_PAD_CHAR = '0' as const;
