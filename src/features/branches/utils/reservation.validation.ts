/**
 * @file reservation.validation.ts
 * @summary Pure validation utilities for reservation time slots
 * @remarks
 *   - Pure functions; no side effects; no DOM.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - HH:mm format only (24-hour); no date libraries.
 */
import { TIME_FORMAT_REGEX, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from "@/constants";
import type { IDurationOptions } from "@/types/duration";
import type { SlotTuple, ReservationTimes } from "@/types/foodics";
import type { IReservationTimesValidation } from "@/types/validation";
import {
  parseHHmm,
  toMinutes,
  isHHmm,
  timeToMinutes,
  compareHHmm,
} from "@/utils/time";

import {
  slotOverlaps,
  normalizeSlots,
} from "@features/branches/utils/slot.operations";
import {
  validateDaySlots,
  validateReservationTimes,
} from "@features/branches/utils/slot.validation";

// Re-export utilities for convenience
export { parseHHmm, toMinutes, isHHmm, timeToMinutes, compareHHmm };
export { slotOverlaps, normalizeSlots };
export { validateDaySlots, validateReservationTimes };
export type { IDurationOptions as DurationOptions, IReservationTimesValidation as ReservationTimesValidation };

function cleanDurationString(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed === "") return null;

    const cleaned = trimmed.replace(/[^\d-]/g, "");
    if (cleaned === "" || cleaned === "-") return null;

    return cleaned;
}

function clampDuration(value: number, min: number, max: number): number | null {
    if (value < min) return null;
    if (value > max) return max;
    return value;
}

function sanitizeStringDuration(value: string, min: number, max: number): number | null {
    const cleaned = cleanDurationString(value);
    if (cleaned === null) return null;

    const parsed = parseInt(cleaned, 10);
    if (Number.isNaN(parsed)) return null;

    return clampDuration(parsed, min, max);
}
function sanitizeNumberDuration(value: number, min: number, max: number): number | null {
    if (!Number.isFinite(value)) return null;
    return clampDuration(Math.floor(value), min, max);
}
export function sanitizeDuration(value: unknown, { min = MIN_DURATION_MINUTES, max = MAX_DURATION_MINUTES }: IDurationOptions = {}): number | null {
    if (value === null || value === undefined)
        return null;
    if (typeof value === "string")
        return sanitizeStringDuration(value, min, max);
    if (typeof value === "number")
        return sanitizeNumberDuration(value, min, max);
    return null;
}
export function isValidDuration(value: unknown, { min = MIN_DURATION_MINUTES, max = MAX_DURATION_MINUTES }: IDurationOptions = {}): value is number {
    if (typeof value !== "number" || !Number.isFinite(value))
        return false;
    if (!Number.isInteger(value))
        return false;
    return value >= min && value <= max;
}
export function isValidTimeFormat(time: string): boolean {
    return TIME_FORMAT_REGEX.test(time);
}

function timeToMinutesLocal(time: string): number | null {
    const match = TIME_FORMAT_REGEX.exec(time);
    if (!match)
        return null;
    const hours = parseInt(match[1] ?? "0", 10);
    const minutes = parseInt(match[2] ?? "0", 10);
    return hours * 60 + minutes;
}
export function isValidSlotTuple(tuple: SlotTuple): boolean {
    const [start, end] = tuple;
    if (!start || !end)
        return false;
    if (!isValidTimeFormat(start) || !isValidTimeFormat(end))
        return false;
    const startMinutes = timeToMinutesLocal(start);
    const endMinutes = timeToMinutesLocal(end);
    if (startMinutes === null || endMinutes === null)
        return false;
    return endMinutes > startMinutes;
}

/**
 * Backward-compatible wrapper for slotOverlaps.
 * @deprecated Use slotOverlaps from slot.operations.ts instead
 */
export function slotsOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
    return slotOverlaps(slot1, slot2);
}

/**
 * Backward-compatible wrapper.
 * @deprecated Use validateReservationTimes from slot.validation.ts instead
 */
export function isValidReservationTimes(reservationTimes: ReservationTimes): IReservationTimesValidation {
    return validateReservationTimes(reservationTimes);
}
