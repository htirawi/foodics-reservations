import type { Weekday } from "@/types/foodics";

export interface IValidationErrors {
  duration?: string | undefined;
  slots?: Partial<Record<Weekday, string>> | undefined;
}

/**
 * Validation result for full reservation times (all days).
 */
export interface IReservationTimesValidation {
  ok: boolean;
  perDay: Record<Weekday, string[]>;
}

/**
 * Generic validation result type used across validators.
 */
export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validation result for slot limit checks.
 */
export type LimitResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validation result for time boundary checks.
 */
export type BoundaryResult =
  | { ok: true }
  | { ok: false; error: string };

// Backward-compatibility aliases
export type ValidationErrors = IValidationErrors;
export type ReservationTimesValidation = IReservationTimesValidation;
