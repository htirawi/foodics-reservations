import { MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from '@/constants';

/**
 * Policy: Duration Bounds
 * - Min: 1 minute
 * - Max: 1440 minutes (24 hours)
 * - Reject: <= 0, NaN, Infinity
 * - Clamp: > max → max
 * - Floor: floats → integer
 *
 * Edge Cases:
 * - 0 → null
 * - -10 → null
 * - 1 → 1 (min)
 * - 1440 → 1440 (max)
 * - 1441 → 1440 (clamp)
 * - 15.7 → 15 (floor)
 * - NaN → null
 * - Infinity → null
 * - "" → null
 * - "abc" → null
 */

/**
 * Check if string is a valid numeric string.
 * @param str - String to check
 * @returns true if valid
 */
function isValidNumericString(str: string): boolean {
  return str !== '' && str !== '-' && str !== '.';
}

/**
 * Parse value to number (handles string and number types).
 * @param value - Value to parse
 * @returns Parsed number or null if invalid
 */
function parseValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;

  const cleaned = value.trim().replace(/[^\d.-]/g, '');
  return isValidNumericString(cleaned) ? parseFloat(cleaned) : null;
}

/**
 * Sanitize duration with strict edge-case handling.
 * Clamps to [min, max] and floors to integer.
 * Returns null for invalid input (null, undefined, NaN, Infinity, negative, empty string).
 * @param value - Value to sanitize (string or number)
 * @param options - Min/max bounds (defaults to MIN_DURATION_MINUTES/MAX_DURATION_MINUTES)
 * @returns Sanitized duration in minutes, or null if invalid
 */
export function sanitizeDurationStrict(
  value: unknown,
  { min = MIN_DURATION_MINUTES, max = MAX_DURATION_MINUTES } = {}
): number | null {
  const parsed = parseValue(value);

  if (parsed === null || !Number.isFinite(parsed)) return null;
  if (parsed < min) return null;
  if (parsed > max) return max;

  return Math.floor(parsed);
}

/**
 * Check if duration is within valid bounds (no clamping or coercion).
 * Returns true only if value is a valid integer in [min, max].
 * @param value - Value to check
 * @param options - Min/max bounds
 * @returns true if valid duration
 */
export function isValidDurationStrict(
  value: unknown,
  { min = MIN_DURATION_MINUTES, max = MAX_DURATION_MINUTES } = {}
): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  if (!Number.isInteger(value)) {
    return false;
  }
  return value >= min && value <= max;
}
