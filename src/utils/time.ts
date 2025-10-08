import { TIME_FORMAT_REGEX } from "@/constants/regex";

/**
 * Parse HH:mm string into { h, m } object.
 * @param s - Time string in HH:mm format
 * @returns Object with hours and minutes, or null if invalid
 */
export function parseHHmm(s: string): { h: number; m: number } | null {
  const match = TIME_FORMAT_REGEX.exec(s);
  if (!match) {
    return null;
  }
  const h = parseInt(match[1] ?? "0", 10);
  const m = parseInt(match[2] ?? "0", 10);
  return { h, m };
}

/**
 * Convert { h, m } object to total minutes.
 * @param h - Hours
 * @param m - Minutes
 * @returns Total minutes since midnight
 */
export function toMinutes({ h, m }: { h: number; m: number }): number {
  return h * 60 + m;
}

/**
 * Check if string is valid HH:mm format (24-hour).
 * @param s - String to check
 * @returns true if valid HH:mm format
 */
export function isHHmm(s: string): boolean {
  return TIME_FORMAT_REGEX.test(s);
}

/**
 * Convert HH:mm string to total minutes since midnight.
 * @param time - Time string in HH:mm format
 * @returns Total minutes, or null if invalid
 */
export function timeToMinutes(time: string): number | null {
  const parsed = parseHHmm(time);
  if (!parsed) return null;
  return toMinutes(parsed);
}

/**
 * Compare two HH:mm strings by minutes.
 * @param a - First time string
 * @param b - Second time string
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareHHmm(a: string, b: string): -1 | 0 | 1 {
  const aMinutes = timeToMinutes(a);
  const bMinutes = timeToMinutes(b);
  
  if (aMinutes === null || bMinutes === null) {
    return 0;
  }
  
  if (aMinutes < bMinutes) return -1;
  if (aMinutes > bMinutes) return 1;
  return 0;
}

/**
 * Alias for parseHHmm (CARD 10 spec compliance).
 * @param input - Time string in HH:mm format
 * @returns Object with hours and minutes, or null if invalid
 */
export function parseTime(input: string): { h: number; m: number } | null {
  return parseHHmm(input);
}

/**
 * Format hours and minutes into HH:mm string (zero-padded).
 * @param h - Hours (0-23)
 * @param m - Minutes (0-59)
 * @returns Zero-padded HH:mm string
 */
export function formatTime(h: number, m: number): string {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Convert total minutes since midnight to { h, m } object.
 * Clamps input to valid range [0..1439].
 * @param total - Total minutes since midnight
 * @returns Object with hours and minutes
 */
export function fromMinutes(total: number): { h: number; m: number } {
  const clamped = Math.max(0, Math.min(1439, total));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return { h, m };
}

/**
 * Check if time is start of day (00:00).
 * @param time - Time string in HH:mm format
 * @returns true if 00:00
 */
export function isStartOfDay(time: string): boolean {
  return time === '00:00';
}

/**
 * Check if time is end of day (23:59).
 * @param time - Time string in HH:mm format
 * @returns true if 23:59
 */
export function isEndOfDay(time: string): boolean {
  return time === '23:59';
}

/**
 * Check if slot has minimum duration (1 minute).
 * @param start - Start time HH:mm
 * @param end - End time HH:mm
 * @returns true if duration >= 1 minute
 */
export function isMinimumDuration(start: string, end: string): boolean {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  if (startMin === null || endMin === null) return false;
  return (endMin - startMin) >= 1;
}
