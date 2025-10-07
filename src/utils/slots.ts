/**
 * @file slots.ts
 * @summary Pure slot validation utilities (HH:mm ranges only)
 * @remarks
 *   - Pure functions; no side effects; no DOM; no Date libraries.
 *   - TypeScript strict; no any/unknown.
 *   - Returns i18n error keys (not messages); UI translates via $t().
 */

import type { Weekday, SlotTuple, ReservationTimes } from "@/types/foodics";
import { isHHmm, timeToMinutes } from "./time";

type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validate a slot tuple [start, end].
 * Checks format (HH:mm) and order (start < end strictly).
 * @param slot - Tuple [start, end] in HH:mm format
 * @returns Validation result with i18n error key if invalid
 */
export function isValidRange(slot: SlotTuple): ValidationResult {
  const [start, end] = slot;

  if (!isHHmm(start) || !isHHmm(end)) {
    return { ok: false, error: "settings.slots.errors.format" };
  }

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes === null || endMinutes === null) {
    return { ok: false, error: "settings.slots.errors.format" };
  }

  if (startMinutes >= endMinutes) {
    return { ok: false, error: "settings.slots.errors.order" };
  }

  return { ok: true };
}

/**
 * Check if two slot tuples overlap strictly.
 * Touching boundaries (e.g., [09:00, 12:00] and [12:00, 15:00]) is NOT overlap.
 * @param a - First slot tuple
 * @param b - Second slot tuple
 * @returns true if slots strictly overlap
 */
export function isOverlapping(a: SlotTuple, b: SlotTuple): boolean {
  const aStart = timeToMinutes(a[0]);
  const aEnd = timeToMinutes(a[1]);
  const bStart = timeToMinutes(b[0]);
  const bEnd = timeToMinutes(b[1]);

  if (aStart === null || aEnd === null || bStart === null || bEnd === null) {
    return false;
  }

  return (aStart < bEnd && aEnd > bStart);
}

/**
 * Check if a candidate slot can be added to existing slots.
 * Validates format/order → enforces max limit → checks overlaps.
 * @param existing - Array of existing slot tuples
 * @param candidate - Candidate slot tuple to add
 * @param max - Maximum number of slots allowed (default 3)
 * @returns Validation result with i18n error key if invalid
 */
export function canAddSlot(
  existing: SlotTuple[],
  candidate: SlotTuple,
  max = 3
): ValidationResult {
  const rangeCheck = isValidRange(candidate);
  if (!rangeCheck.ok) {
    return rangeCheck;
  }

  if (existing.length >= max) {
    return { ok: false, error: "settings.slots.errors.max" };
  }

  for (const slot of existing) {
    if (isOverlapping(candidate, slot)) {
      return { ok: false, error: "settings.slots.errors.overlap" };
    }
  }

  return { ok: true };
}

/**
 * Deep clone ReservationTimes and copy Saturday's slots to all other days.
 * Saturday's slots remain unchanged.
 * @param rt - Original ReservationTimes object
 * @returns New ReservationTimes with Saturday copied to all days
 */
export function copySaturdayToAll(rt: ReservationTimes): ReservationTimes {
  const saturdaySlots = rt.saturday;
  const clonedSaturday = saturdaySlots.map((slot) => [slot[0], slot[1]] as SlotTuple);

  const days: Weekday[] = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  const result = {} as ReservationTimes;

  for (const day of days) {
    result[day] = clonedSaturday.map((slot) => [slot[0], slot[1]] as SlotTuple);
  }

  return result;
}

/**
 * Sort and deduplicate slots for a single day.
 * @param slots - Array of slot tuples
 * @returns Sorted and deduplicated array
 */
export function normalizeDay(slots: SlotTuple[]): SlotTuple[] {
  const sorted = [...slots].sort((a, b) => {
    const aStart = timeToMinutes(a[0]) ?? 0;
    const bStart = timeToMinutes(b[0]) ?? 0;
    return aStart - bStart;
  });

  const deduplicated: SlotTuple[] = [];
  for (const slot of sorted) {
    const isDuplicate = deduplicated.some(
      (existing) => existing[0] === slot[0] && existing[1] === slot[1]
    );
    if (!isDuplicate) {
      deduplicated.push(slot);
    }
  }

  return deduplicated;
}

