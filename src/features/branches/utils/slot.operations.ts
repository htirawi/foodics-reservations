/**
 * @file slot.operations.ts
 * @summary Pure slot operations (overlap, normalize, etc.)
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 *   - HH:mm format only; no date libraries.
 */
import type { SlotTuple } from "@/types/foodics";
import { timeToMinutes, compareHHmm } from "@/utils/time";

/**
 * Convert slot to [startMinutes, endMinutes] range.
 * @param slot - Slot tuple [from, to]
 * @returns [start, end] in minutes, or null if invalid
 */
function slotToMinutesRange(slot: SlotTuple): [number, number] | null {
  const start = timeToMinutes(slot[0] ?? "");
  const end = timeToMinutes(slot[1] ?? "");
  if (start === null || end === null) return null;
  return [start, end];
}

/**
 * Check if two slots overlap (touching is OK).
 * @param slot1 - First slot
 * @param slot2 - Second slot
 * @returns true if slots overlap (not touching)
 */
export function slotOverlaps(slot1: SlotTuple, slot2: SlotTuple): boolean {
  const range1 = slotToMinutesRange(slot1);
  const range2 = slotToMinutesRange(slot2);
  if (!range1 || !range2) return false;

  const [start1, end1] = range1;
  const [start2, end2] = range2;

  // Touching is OK: 09:00-12:00 and 12:00-15:00 allowed
  // Overlap is NOT OK: 09:00-12:30 and 12:00-15:00 overlaps
  return (start1 < end2 && end1 > start2) && !(end1 === start2 || end2 === start1);
}

/**
 * Normalize slots (sort by start, remove duplicates).
 * @param slots - Array of slots
 * @returns Sorted, de-duplicated slots
 */
export function normalizeSlots(slots: SlotTuple[]): SlotTuple[] {
  if (slots.length === 0) return [];

  const sorted = [...slots].sort((a, b) => compareHHmm(a[0], b[0]));

  const deduped: SlotTuple[] = [];
  for (const slot of sorted) {
    const isDuplicate = deduped.some(
      (existing) => existing[0] === slot[0] && existing[1] === slot[1]
    );
    if (!isDuplicate) {
      deduped.push(slot);
    }
  }
  return deduped;
}
