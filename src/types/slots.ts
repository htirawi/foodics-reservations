import type { ComputedRef } from "vue";

import type { ReservationTimes, Weekday } from "@/types/foodics";

/**
 * Parameters for updating a slot field.
 */
export interface ISlotUpdateParams {
  day: Weekday;
  index: number;
  field: "from" | "to";
  value: string;
}

/**
 * Emit function signature for day slots editor.
 */
export interface IDaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

/**
 * Configuration for slot actions (CRUD operations on slots).
 */
export interface ISlotActionsConfig {
  modelValue: ComputedRef<ReservationTimes>;
  emit: IDaySlotsEditorEmits;
  emitValidity: (times: ReservationTimes, emit: IDaySlotsEditorEmits) => void;
  canAddSlotToDay: (modelValue: ReservationTimes, day: Weekday) => boolean;
  getDaySlots: (modelValue: ReservationTimes, day: Weekday) => [string, string][];
  validateDaySlotsFor: (modelValue: ReservationTimes, day: Weekday) => { ok: boolean; errors: string[] };
}
