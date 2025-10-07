/**
 * @file validation.ts
 * @summary Types for validation functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Weekday } from "./foodics";

export interface ValidationErrors {
  duration?: string | undefined;
  slots?: Partial<Record<Weekday, string>> | undefined;
}

/**
 * Validation result for full reservation times (all days).
 */
export interface ReservationTimesValidation {
  ok: boolean;
  perDay: Record<Weekday, string[]>;
}
