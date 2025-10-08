/**
 * @file time-boundaries.ts
 * @summary Time boundary edge-case policies (00:00, 23:59, overnight, min duration)
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 *   - Returns i18n error keys.
 *   - Policy: 00:00 start allowed, 23:59 end allowed, overnight rejected.
 */

import type { SlotTuple } from '@/types/foodics';
import { timeToMinutes, isHHmm } from '@/utils/time';
import { MIN_SLOT_DURATION_MINUTES } from '@/constants/time';

type BoundaryResult = { ok: true } | { ok: false; error: string };

/**
 * Policy: Time boundaries (00:00-23:59)
 * - Allow 00:00 as start time
 * - Allow 23:59 as end time
 * - Reject overnight ranges (end <= start)
 * - Enforce minimum duration (1 minute)
 *
 * Edge Cases:
 * - 00:00-00:01 (min duration at start of day) → valid
 * - 23:58-23:59 (min duration at end of day) → valid
 * - 00:00-23:59 (full day slot) → valid
 * - 23:59-00:00 (overnight) → invalid
 * - 12:00-12:00 (zero duration) → invalid
 */

/**
 * Check if slot is a valid time boundary.
 * Allows 00:00 start, 23:59 end, rejects overnight.
 * @param slot - Slot tuple [start, end]
 * @returns Validation result with i18n error key if invalid
 */
export function validateTimeBoundaries(slot: SlotTuple): BoundaryResult {
  const [start, end] = slot;

  if (!isHHmm(start) || !isHHmm(end)) {
    return { ok: false, error: 'settings.slots.errors.format' };
  }

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (startMin === null || endMin === null) {
    return { ok: false, error: 'settings.slots.errors.format' };
  }

  // Reject overnight ranges (end <= start)
  if (endMin <= startMin) {
    return { ok: false, error: 'settings.slots.errors.overnightNotSupported' };
  }

  // Enforce minimum duration (1 minute)
  if ((endMin - startMin) < MIN_SLOT_DURATION_MINUTES) {
    return { ok: false, error: 'settings.slots.errors.order' };
  }

  return { ok: true };
}

/**
 * Check if slot represents an overnight range (end time < start time).
 * Example: 22:00-02:00 is overnight.
 * @param slot - Slot tuple [start, end]
 * @returns true if overnight range detected
 */
export function isOvernightRange(slot: SlotTuple): boolean {
  const startMin = timeToMinutes(slot[0]);
  const endMin = timeToMinutes(slot[1]);

  if (startMin === null || endMin === null) {
    return false;
  }

  return endMin <= startMin;
}
