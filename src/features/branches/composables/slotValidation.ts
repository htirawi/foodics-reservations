/**
 * @file slotValidation.ts
 * @summary Validation functions for day slots editor
 * @remarks Pure validation logic extracted from main composable
 */

import type { ReservationTimes, Weekday, SlotTuple } from "@/types/foodics";
import { isValidRange, canAddSlot, normalizeDay } from "@/utils/slots";
import { WEEKDAY_ORDER } from "./slotEditorActions";
import { MAX_SLOTS_PER_DAY } from "@/constants/reservations";

/**
 * Validate slots for a single day.
 */
export function validateDaySlots(slots: SlotTuple[]): boolean {
  if (!slots || slots.length === 0) return true;
  
  // Check each slot individually
  for (const slot of slots) {
    const validation = isValidRange(slot);
    if (!validation.ok) return false;
  }
  
  // Check overlap and max limits
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const existingSlots = slots.slice(0, i);
    const validation = canAddSlot(existingSlots, slot, MAX_SLOTS_PER_DAY);
    if (!validation.ok) return false;
  }
  
  return true;
}

/**
 * Get validation errors for a single day's slots.
 */
export function getDayValidationErrors(slots: SlotTuple[]): string[] {
  if (!slots || slots.length === 0) return [];
  
  const errors: string[] = [];
  
  // Check each slot individually
  for (const slot of slots) {
    const validation = isValidRange(slot);
    if (!validation.ok) {
      errors.push(validation.error);
    }
  }
  
  // Check overlap and max limits
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const existingSlots = slots.slice(0, i);
    const validation = canAddSlot(existingSlots, slot, MAX_SLOTS_PER_DAY);
    if (!validation.ok) {
      errors.push(validation.error);
    }
  }
  
  return errors;
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
