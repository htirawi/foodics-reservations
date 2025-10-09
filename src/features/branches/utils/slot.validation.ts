import { MAX_SLOTS_PER_DAY, WEEKDAYS } from "@/constants/reservations";
import type { SlotTuple, ReservationTimes, Weekday } from "@/types/foodics";
import type { IReservationTimesValidation } from "@/types/validation";
import { isHHmm, timeToMinutes } from "@/utils/time";

import { slotOverlaps } from "@features/branches/utils/slot.operations";

/**
 * Check if slot represents overnight range (e.g., 22:00-02:00).
 * @param slot - Slot to check
 * @returns true if overnight range detected
 */
function isOvernightRange(slot: SlotTuple): boolean {
  const startMinutes = timeToMinutes(slot[0] ?? "");
  const endMinutes = timeToMinutes(slot[1] ?? "");

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return endMinutes <= startMinutes;
}

/**
 * Check if start < end.
 * @param slot - Slot to check
 * @returns true if valid
 */
function isValidSlotOrder(slot: SlotTuple): boolean {
  const [start, end] = slot;
  if (!start || !end || !isHHmm(start) || !isHHmm(end)) {
    return false;
  }

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return endMinutes > startMinutes;
}

/**
 * Check for format errors.
 */
function checkSlotFormat(slot: SlotTuple): string | null {
  const [start, end] = slot;
  if (!start || !end || !isHHmm(start) || !isHHmm(end)) {
    return `settings.slots.errors.format`;
  }
  return null;
}

/**
 * Check for overlaps with other slots.
 */
function checkOverlaps(slot: SlotTuple, index: number, allSlots: SlotTuple[]): string | null {
  for (let i = index + 1; i < allSlots.length; i++) {
    const otherSlot = allSlots[i];
    if (otherSlot && slotOverlaps(slot, otherSlot)) {
      return `settings.slots.errors.overlap`;
    }
  }
  return null;
}

/**
 * Check single slot for errors.
 * @param slot - Slot to validate
 * @param index - Index in array
 * @param allSlots - All slots for overlap check
 * @returns Error key or null
 */
function validateSingleSlot(slot: SlotTuple, index: number, allSlots: SlotTuple[]): string | null {
  const formatError = checkSlotFormat(slot);
  if (formatError) return formatError;

  if (isOvernightRange(slot)) {
    return `settings.slots.errors.overnightNotSupported`;
  }

  if (!isValidSlotOrder(slot)) {
    return `settings.slots.errors.order`;
  }

  return checkOverlaps(slot, index, allSlots);
}

/**
 * Validate slots for a single day.
 * Rules: max 3 slots, start < end, no overlaps, no overnight ranges.
 * @param slots - Array of slots for one day
 * @returns Validation result with i18n error keys
 */
export function validateDaySlots(slots: SlotTuple[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (slots.length > MAX_SLOTS_PER_DAY) {
    errors.push(`settings.slots.errors.max`);
    return { ok: false, errors };
  }

  slots.forEach((slot, index) => {
    const error = validateSingleSlot(slot, index, slots);
    if (error) {
      errors.push(error);
    }
  });

  return { ok: errors.length === 0, errors };
}

/**
 * Validate all days in reservation times.
 * @param reservationTimes - Full reservation times object
 * @returns Validation result per day
 */
export function validateReservationTimes(
  reservationTimes: ReservationTimes
): IReservationTimesValidation {
  const perDay: Record<Weekday, string[]> = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  let hasErrors = false;

  WEEKDAYS.forEach((day) => {
    const slots = reservationTimes[day];
    if (!slots) return;

    const validation = validateDaySlots(slots);
    if (!validation.ok) {
      perDay[day] = validation.errors;
      hasErrors = true;
    }
  });

  return { ok: !hasErrors, perDay };
}
