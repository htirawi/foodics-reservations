/**
 * @file null-safety.ts
 * @summary Null safety policies (graceful null/undefined/empty handling)
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 *   - Policy: Never throw, return null or ValidationError
 *   - Edge cases: null → null, undefined → null, "" → null
 */

/**
 * Policy: Null Safety
 * - Never throw exceptions
 * - Return null for invalid input
 * - Return ValidationError for validation failures
 * - Handle null, undefined, empty string gracefully
 *
 * Edge Cases:
 * - null → null (or empty string/array)
 * - undefined → null (or empty string/array)
 * - "" → null (or empty if string accessor)
 * - "   " → null (whitespace-only)
 */

/**
 * Safe string accessor (returns empty string for null/undefined).
 * Never throws, always returns string.
 * @param value - Value to convert to string
 * @returns String representation, or empty string for nullish values
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Safe array accessor (returns empty array for null/undefined).
 * Never throws, always returns array.
 * @param value - Value to convert to array
 * @returns Array, or empty array for nullish values
 */
export function safeArray<T>(value: unknown): T[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Check if value is null or undefined (nullish).
 * @param value - Value to check
 * @returns true if null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if string is empty or whitespace-only.
 * @param value - String to check
 * @returns true if empty or whitespace
 */
export function isEmpty(value: string): boolean {
  return value.trim() === '';
}

/**
 * Safe number accessor (returns fallback for invalid numbers).
 * Handles null, undefined, NaN, Infinity.
 * @param value - Value to convert to number
 * @param fallback - Fallback value (default 0)
 * @returns Valid number or fallback
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

/**
 * Safe property accessor (returns null for missing properties).
 * Never throws, returns null if path doesn't exist.
 * @param obj - Object to access
 * @param key - Property key
 * @returns Property value or null
 */
export function safeGet<T>(obj: unknown, key: string): T | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const value = (obj as Record<string, unknown>)[key];
  return value === undefined ? null : (value as T);
}
