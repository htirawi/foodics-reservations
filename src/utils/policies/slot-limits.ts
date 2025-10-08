/**
 * @file slot-limits.ts
 * @summary Slot limit enforcement policies (MAX_SLOTS_PER_DAY = 3)
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 *   - Policy: Hard limit at 3 slots per day, 4th rejected with error
 */

import type { SlotTuple } from '@/types/foodics';
import { MAX_SLOTS_PER_DAY } from '@/constants/reservations';

type LimitResult = { ok: true } | { ok: false; error: string };

/**
 * Policy: Slot Limits
 * - Maximum 3 slots per day (business rule)
 * - 4th slot rejected with i18n error key
 *
 * Edge Cases:
 * - 0 slots → can add (0 < 3)
 * - 2 slots → can add (2 < 3)
 * - 3 slots → cannot add (3 >= 3)
 */

/**
 * Check if adding a slot would exceed the limit.
 * Default limit is MAX_SLOTS_PER_DAY (3).
 * @param existing - Array of existing slot tuples
 * @param max - Maximum number of slots allowed (default 3)
 * @returns Validation result with i18n error key if limit exceeded
 */
export function canAddWithinLimit(
  existing: SlotTuple[],
  max = MAX_SLOTS_PER_DAY
): LimitResult {
  if (existing.length >= max) {
    return { ok: false, error: 'settings.slots.errors.max' };
  }
  return { ok: true };
}

/**
 * Check if slots array is at the limit.
 * @param slots - Array of slot tuples
 * @param max - Maximum number of slots allowed (default 3)
 * @returns true if at or over limit
 */
export function isAtLimit(slots: SlotTuple[], max = MAX_SLOTS_PER_DAY): boolean {
  return slots.length >= max;
}

/**
 * Get remaining slot capacity.
 * @param slots - Array of slot tuples
 * @param max - Maximum number of slots allowed (default 3)
 * @returns Number of additional slots that can be added (0 if at limit)
 */
export function remainingCapacity(slots: SlotTuple[], max = MAX_SLOTS_PER_DAY): number {
  return Math.max(0, max - slots.length);
}
