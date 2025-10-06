/**
 * Reservation validation utilities
 * Pure functions for validating reservation settings (duration, slots, times)
 */

import type { SlotTuple, ReservationTimes, Weekday } from '@/types/foodics';

/**
 * Minimum reservation duration in minutes
 */
const MIN_DURATION = 1;

/**
 * Maximum reservation duration in minutes (24 hours)
 */
const MAX_DURATION = 1440;

/**
 * Time format regex: HH:mm (24-hour format)
 */
const TIME_FORMAT_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates a reservation duration value
 * @param duration - Duration in minutes
 * @returns true if valid (between MIN_DURATION and MAX_DURATION)
 */
export function isValidDuration(duration: number): boolean {
  return Number.isFinite(duration) && duration >= MIN_DURATION && duration <= MAX_DURATION;
}

/**
 * Validates a time string in HH:mm format
 * @param time - Time string to validate
 * @returns true if format is valid
 */
export function isValidTimeFormat(time: string): boolean {
  return TIME_FORMAT_REGEX.test(time);
}

/**
 * Converts HH:mm time string to minutes since midnight
 * @param time - Time in HH:mm format
 * @returns Minutes since midnight, or null if invalid format
 */
export function timeToMinutes(time: string): number | null {
  const match = TIME_FORMAT_REGEX.exec(time);
  if (!match) return null;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  return hours * 60 + minutes;
}

/**
 * Validates a single time slot tuple
 * @param tuple - [start, end] time slot
 * @returns true if both times are valid format and end > start
 */
export function isValidSlotTuple(tuple: SlotTuple): boolean {
  const [start, end] = tuple;
  if (!start || !end) return false;
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return false;

  return endMinutes > startMinutes;
}

/**
 * Converts a slot tuple to minutes range
 * @param slot - Slot tuple to convert
 * @returns [start, end] in minutes or null if invalid
 */
function slotToMinutesRange(slot: SlotTuple): [number, number] | null {
  const start = timeToMinutes(slot[0] ?? '');
  const end = timeToMinutes(slot[1] ?? '');
  if (start === null || end === null) return null;
  return [start, end];
}

/**
 * Checks if two time slots overlap
 * @param slot1 - First time slot
 * @param slot2 - Second time slot
 * @returns true if slots overlap
 */
export function slotsOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
  const range1 = slotToMinutesRange(slot1);
  const range2 = slotToMinutesRange(slot2);
  if (!range1 || !range2) return false;

  const [start1, end1] = range1;
  const [start2, end2] = range2;
  return (start1 < end2 && end1 > start2);
}

/**
 * Checks if a slot overlaps with any subsequent slots
 * @param slot - The slot to check
 * @param index - Index of the slot
 * @param allSlots - All slots for the day
 * @returns Error message if overlap found, null otherwise
 */
function checkSlotOverlap(slot: SlotTuple, index: number, allSlots: SlotTuple[]): string | null {
  for (let i = index + 1; i < allSlots.length; i++) {
    const otherSlot = allSlots[i];
    if (otherSlot && slotsOverlap(slot, otherSlot)) {
      return `Slot ${index + 1} overlaps with slot ${i + 1}`;
    }
  }
  return null;
}

/**
 * Validates all slots for a single day
 * @param slots - Array of time slot tuples for one day
 * @returns Array of error messages (empty if valid)
 */
export function validateDaySlots(slots: SlotTuple[]): string[] {
  const errors: string[] = [];

  slots.forEach((slot, index) => {
    if (!isValidSlotTuple(slot)) {
      errors.push(`Slot ${index + 1} is invalid`);
      return;
    }

    const overlapError = checkSlotOverlap(slot, index, slots);
    if (overlapError) {
      errors.push(overlapError);
    }
  });

  return errors;
}

/**
 * Validation result for reservation times
 */
export interface ReservationTimesValidation {
  ok: boolean;
  errors: Record<Weekday, string[]>;
}

/**
 * Validates complete reservation times structure
 * @param reservationTimes - Weekly reservation times
 * @returns Validation result with ok flag and per-day errors
 */
export function isValidReservationTimes(
  reservationTimes: ReservationTimes
): ReservationTimesValidation {
  const errors: Record<Weekday, string[]> = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  let hasErrors = false;

  (Object.keys(reservationTimes) as Weekday[]).forEach((day) => {
    const slots = reservationTimes[day];
    if (!slots) return;

    const dayErrors = validateDaySlots(slots);
    if (dayErrors.length > 0) {
      errors[day] = dayErrors;
      hasErrors = true;
    }
  });

  return {
    ok: !hasErrors,
    errors,
  };
}

