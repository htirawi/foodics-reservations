/**
 * @file reservations.ts
 * @summary Reservation domain constants (weekdays, slot limits, duration bounds)
 * @remarks
 *   - Core business rules for the reservation system
 *   - Used by forms, validation, and composables
 * @example
 *   import { WEEKDAYS, MAX_SLOTS_PER_DAY } from '@/constants/reservations';
 *   if (slots.length > MAX_SLOTS_PER_DAY) { ... }
 */

// Weekday Constants
export const WEEKDAY_SATURDAY = 'saturday' as const;
export const WEEKDAY_SUNDAY = 'sunday' as const;
export const WEEKDAY_MONDAY = 'monday' as const;
export const WEEKDAY_TUESDAY = 'tuesday' as const;
export const WEEKDAY_WEDNESDAY = 'wednesday' as const;
export const WEEKDAY_THURSDAY = 'thursday' as const;
export const WEEKDAY_FRIDAY = 'friday' as const;

/**
 * All weekdays in order (Saturday-first week, common in Middle East)
 */
export const WEEKDAYS = [
  WEEKDAY_SATURDAY,
  WEEKDAY_SUNDAY,
  WEEKDAY_MONDAY,
  WEEKDAY_TUESDAY,
  WEEKDAY_WEDNESDAY,
  WEEKDAY_THURSDAY,
  WEEKDAY_FRIDAY,
] as const;

export type Weekday = typeof WEEKDAYS[number];

// Slot Limits (business rules)
export const MAX_SLOTS_PER_DAY = 3;

// Default Slot Times
export const DEFAULT_SLOT_START = '09:00' as const;
export const DEFAULT_SLOT_END = '17:00' as const;

// Reservation Duration Bounds (minutes)
export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 1440; // 24 hours

// Time Format (used in documentation and labels)
export const RESERVATION_TIME_FORMAT = 'HH:mm' as const;
