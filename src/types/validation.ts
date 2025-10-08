import type { Weekday } from "./foodics";

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

// Backward-compatibility aliases
export type ValidationErrors = IValidationErrors;
export type ReservationTimesValidation = IReservationTimesValidation;
