/**
 * @file reservation.validation.ts
 * @summary Module: src/features/branches/utils/reservation.validation.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { SlotTuple, ReservationTimes, Weekday } from "@/types/foodics";
const MIN_DURATION = 1;
const MAX_DURATION = 1440;
const TIME_FORMAT_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
export interface DurationOptions {
    min?: number;
    max?: number;
}
function sanitizeStringDuration(value: string, min: number, max: number): number | null {
    const trimmed = value.trim();
    if (trimmed === "")
        return null;
    const cleaned = trimmed.replace(/[^\d-]/g, "");
    if (cleaned === "" || cleaned === "-")
        return null;
    const parsed = parseInt(cleaned, 10);
    if (Number.isNaN(parsed))
        return null;
    if (parsed < min)
        return null;
    if (parsed > max)
        return max;
    return parsed;
}
function sanitizeNumberDuration(value: number, min: number, max: number): number | null {
    if (!Number.isFinite(value))
        return null;
    if (value < min)
        return null;
    if (value > max)
        return max;
    return Math.floor(value);
}
export function sanitizeDuration(value: unknown, { min = MIN_DURATION, max = MAX_DURATION }: DurationOptions = {}): number | null {
    if (value === null || value === undefined)
        return null;
    if (typeof value === "string")
        return sanitizeStringDuration(value, min, max);
    if (typeof value === "number")
        return sanitizeNumberDuration(value, min, max);
    return null;
}
export function isValidDuration(value: unknown, { min = MIN_DURATION, max = MAX_DURATION }: DurationOptions = {}): value is number {
    if (typeof value !== "number" || !Number.isFinite(value))
        return false;
    if (!Number.isInteger(value))
        return false;
    return value >= min && value <= max;
}
export function isValidTimeFormat(time: string): boolean {
    return TIME_FORMAT_REGEX.test(time);
}
export function timeToMinutes(time: string): number | null {
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
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    if (startMinutes === null || endMinutes === null)
        return false;
    return endMinutes > startMinutes;
}
function slotToMinutesRange(slot: SlotTuple): [
    number,
    number
] | null {
    const start = timeToMinutes(slot[0] ?? "");
    const end = timeToMinutes(slot[1] ?? "");
    if (start === null || end === null)
        return null;
    return [start, end];
}
export function slotsOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
    const range1 = slotToMinutesRange(slot1);
    const range2 = slotToMinutesRange(slot2);
    if (!range1 || !range2)
        return false;
    const [start1, end1] = range1;
    const [start2, end2] = range2;
    return (start1 < end2 && end1 > start2);
}
function checkSlotOverlap(slot: SlotTuple, index: number, allSlots: SlotTuple[]): string | null {
    for (let i = index + 1; i < allSlots.length; i++) {
        const otherSlot = allSlots[i];
        if (otherSlot && slotsOverlap(slot, otherSlot)) {
            return `Slot ${index + 1} overlaps with slot ${i + 1}`;
        }
    }
    return null;
}
export function validateDaySlots(slots: SlotTuple[]): string[] {
    const errors: string[] = [];
    slots.forEach((slot, index) => {
        if (!isValidSlotTuple(slot)) {
            errors.push(`Slot ${index + 1} is invalid`);
            return;
        }
        const overlapError = checkSlotOverlap(slot, index, slots);
        if (overlapError)
            errors.push(overlapError);
    });
    return errors;
}
export interface ReservationTimesValidation {
    ok: boolean;
    errors: Record<Weekday, string[]>;
}
export function isValidReservationTimes(reservationTimes: ReservationTimes): ReservationTimesValidation {
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
        if (!slots)
            return;
        const dayErrors = validateDaySlots(slots);
        if (dayErrors.length > 0) {
            errors[day] = dayErrors;
            hasErrors = true;
        }
    });
    return { ok: !hasErrors, errors };
}
