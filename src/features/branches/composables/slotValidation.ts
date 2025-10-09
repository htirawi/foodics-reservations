import { MAX_SLOTS_PER_DAY } from "@/constants/reservations";
import type { ReservationTimes, Weekday, SlotTuple } from "@/types/foodics";
import { isValidRange, canAddSlot, normalizeDay } from "@/utils/slots";

import { WEEKDAY_ORDER } from "@features/branches/composables/slotEditorActions";

/**
 * Validate a single slot and collect errors.
 */
function validateSingleSlot(
  slot: SlotTuple,
  index: number,
  allSlots: SlotTuple[],
  errors: string[]
): void {
  const rangeValidation = isValidRange(slot);
  if (!rangeValidation.ok) {
    errors.push(rangeValidation.error);
    return;
  }

  const existingSlots = allSlots.slice(0, index);
  const overlapValidation = canAddSlot(existingSlots, slot, MAX_SLOTS_PER_DAY);
  if (!overlapValidation.ok) {
    errors.push(overlapValidation.error);
  }
}

/**
 * Get validation errors for a single day's slots.
 */
export function getDayValidationErrors(slots: SlotTuple[]): string[] {
  if (!slots || slots.length === 0) return [];

  const errors: string[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot) {
      validateSingleSlot(slot, i, slots, errors);
    }
  }

  return errors;
}

/**
 * Validate slots for a single day.
 */
export function validateDaySlots(slots: SlotTuple[]): boolean {
  return getDayValidationErrors(slots).length === 0;
}

/**
 * Emit overall validity based on all days.
 */
export function emitValidity(
  times: ReservationTimes,
  emit: (e: "update:valid", valid: boolean) => void
): void {
  const allValid = WEEKDAY_ORDER.every((day) => validateDaySlots(times[day] ?? []));
  emit("update:valid", allValid);
}

/**
 * Get normalized slots for a day.
 */
export function getDaySlots(modelValue: ReservationTimes, day: Weekday): SlotTuple[] {
  const slots = modelValue[day] ?? [];
  return normalizeDay(slots);
}

/**
 * Check if a slot can be added to a day.
 */
export function canAddSlotToDay(modelValue: ReservationTimes, day: Weekday): boolean {
  const slots = modelValue[day] ?? [];
  return slots.length < MAX_SLOTS_PER_DAY;
}

/**
 * Validate slots for a specific day and return result.
 */
export function validateDaySlotsFor(modelValue: ReservationTimes, day: Weekday) {
  const slots = modelValue[day] ?? [];
  const errors = getDayValidationErrors(slots);
  return { ok: errors.length === 0, errors };
}
