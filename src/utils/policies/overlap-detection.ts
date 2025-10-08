import type { SlotTuple } from '@/types/foodics';
import { timeToMinutes } from '@/utils/time';

/**
 * Policy: Touching vs Overlapping
 * - Touching (a_end === b_start): ALLOWED
 * - Strict overlap (a_end > b_start && a_start < b_end): FORBIDDEN
 *
 * Edge Cases:
 * - [09:00, 12:00] + [12:00, 15:00] → false (touching, not overlapping)
 * - [09:00, 12:01] + [12:00, 15:00] → true (overlap by 1 minute)
 * - [09:00, 12:00] + [11:59, 15:00] → true (overlap by 1 minute)
 * - [09:00, 12:00] + [08:59, 15:00] → true (nested)
 * - [00:00, 01:00] + [01:00, 02:00] → false (edge-to-edge touching)
 */

/**
 * Detect strict overlap (touching is OK).
 * Returns true only if slots strictly overlap (not just touch).
 * @param a - First slot tuple
 * @param b - Second slot tuple
 * @returns true if slots strictly overlap
 */
export function isStrictOverlap(a: SlotTuple, b: SlotTuple): boolean {
  const aStart = timeToMinutes(a[0]);
  const aEnd = timeToMinutes(a[1]);
  const bStart = timeToMinutes(b[0]);
  const bEnd = timeToMinutes(b[1]);

  if (aStart === null || aEnd === null || bStart === null || bEnd === null) {
    return false;
  }

  // Touching boundaries are OK (not overlap)
  if (aEnd === bStart || bEnd === aStart) {
    return false;
  }

  // Strict overlap check
  return (aStart < bEnd && aEnd > bStart);
}

/**
 * Check if slot can be added without overlapping existing slots.
 * Uses strict overlap detection (touching is allowed).
 * @param existing - Array of existing slot tuples
 * @param candidate - Candidate slot tuple to add
 * @returns Validation result with i18n error key if overlap detected
 */
export function canAddWithoutOverlap(
  existing: SlotTuple[],
  candidate: SlotTuple
): { ok: true } | { ok: false; error: string } {
  for (const slot of existing) {
    if (isStrictOverlap(candidate, slot)) {
      return { ok: false, error: 'settings.slots.errors.overlap' };
    }
  }
  return { ok: true };
}

/**
 * Find all slots that overlap with a given slot.
 * @param slots - Array of slot tuples
 * @param target - Target slot to check against
 * @returns Array of overlapping slots
 */
export function findOverlappingSlots(slots: SlotTuple[], target: SlotTuple): SlotTuple[] {
  const overlapping: SlotTuple[] = [];
  for (const slot of slots) {
    if (isStrictOverlap(slot, target)) {
      overlapping.push(slot);
    }
  }
  return overlapping;
}
