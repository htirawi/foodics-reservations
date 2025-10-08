// Weekday Constants
export const WEEKDAY_SATURDAY = 'saturday';
export const WEEKDAY_SUNDAY = 'sunday';
export const WEEKDAY_MONDAY = 'monday';
export const WEEKDAY_TUESDAY = 'tuesday';
export const WEEKDAY_WEDNESDAY = 'wednesday';
export const WEEKDAY_THURSDAY = 'thursday';
export const WEEKDAY_FRIDAY = 'friday';

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
export const DEFAULT_SLOT_START = '09:00';
export const DEFAULT_SLOT_END = '17:00';

// Reservation Duration Bounds (minutes)
export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 1440; // 24 hours

// Time Format (used in documentation and labels)
export const RESERVATION_TIME_FORMAT = 'HH:mm';
