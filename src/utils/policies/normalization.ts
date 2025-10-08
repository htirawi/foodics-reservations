/**
 * @file normalization.ts
 * @summary Normalization policies (idempotency, stability, deep clone)
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 *   - Policy: f(f(x)) === f(x), no mutation, deep clone
 */

import type { SlotTuple } from '@/types/foodics';
import { compareHHmm } from '@/utils/time';

/**
 * Policy: Normalization Guarantees
 * - Idempotent: normalize(normalize(x)) === normalize(x)
 * - Stable: doesn't mutate input
 * - Deep clone: modifying result doesn't affect input
 *
 * Edge Cases:
 * - Empty → Empty
 * - Single slot → Single slot (no change)
 * - Duplicates → Removed
 * - Unsorted → Sorted
 */

/**
 * Normalize slot array (sort, deduplicate, deep clone).
 * Guarantees:
 * - Idempotency: calling twice yields same result
 * - Stability: input not mutated
 * - Deep clone: result is independent copy
 * @param slots - Array of slot tuples
 * @returns Normalized array (sorted, deduplicated, cloned)
 */
export function normalizeSlotArray(slots: SlotTuple[]): SlotTuple[] {
  if (slots.length === 0) return [];

  // Deep clone first (ensure no mutation)
  const cloned = slots.map(slot => [slot[0], slot[1]] as SlotTuple);

  // Sort by start time
  const sorted = cloned.sort((a, b) => compareHHmm(a[0], b[0]));

  // Deduplicate
  const deduped: SlotTuple[] = [];
  for (const slot of sorted) {
    const isDuplicate = deduped.some(
      existing => existing[0] === slot[0] && existing[1] === slot[1]
    );
    if (!isDuplicate) {
      deduped.push(slot);
    }
  }

  return deduped;
}

/**
 * Verify idempotency (for testing).
 * Checks if f(f(x)) === f(x) for given function and input.
 * @param fn - Function to test
 * @param input - Input to test with
 * @returns true if function is idempotent for given input
 */
export function isIdempotent(fn: (x: SlotTuple[]) => SlotTuple[], input: SlotTuple[]): boolean {
  const once = fn(input);
  const twice = fn(once);
  return JSON.stringify(once) === JSON.stringify(twice);
}

/**
 * Verify stability (no mutation of input).
 * @param fn - Function to test
 * @param input - Input to test with
 * @returns true if function doesn't mutate input
 */
export function isStable(fn: (x: SlotTuple[]) => SlotTuple[], input: SlotTuple[]): boolean {
  const original = JSON.stringify(input);
  fn(input);
  const after = JSON.stringify(input);
  return original === after;
}

/**
 * Verify deep clone (modifying result doesn't affect input).
 * @param fn - Function to test
 * @param input - Input to test with
 * @returns true if result is deep clone
 */
export function isDeepClone(fn: (x: SlotTuple[]) => SlotTuple[], input: SlotTuple[]): boolean {
  const result = fn(input);
  if (result.length === 0) return true;

  // Mutate result
  if (result[0]) {
    result[0] = ['99:99', '99:99'];
  }

  // Check if input unchanged
  return input.length === 0 || (input[0] !== undefined && input[0][0] !== '99:99');
}
