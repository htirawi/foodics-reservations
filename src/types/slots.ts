/**
 * @file slots.ts
 * @summary Types for time slot operations
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Weekday } from "./foodics";

/**
 * Parameters for updating a slot field.
 */
export interface SlotUpdateParams {
  day: Weekday;
  index: number;
  field: "from" | "to";
  value: string;
}
