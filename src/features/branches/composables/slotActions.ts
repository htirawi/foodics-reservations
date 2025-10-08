/**
 * @file slotActions.ts
 * @summary Slot CRUD actions for day slots editor
 * @remarks Pure functions for slot manipulation; no Vue dependencies
 */

import type { ComputedRef } from "vue";
import type { ReservationTimes, Weekday } from "@/types/foodics";
import {
  addSlotToDay,
  removeSlotFromDay,
  updateSlotField,
  applyToAllDays as applyToAllDaysUtil,
} from "./slotEditorActions";

interface DaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

interface SlotActionsConfig {
  modelValue: ComputedRef<ReservationTimes>;
  emit: DaySlotsEditorEmits;
  emitValidity: (times: ReservationTimes, emit: DaySlotsEditorEmits) => void;
  canAddSlotToDay: (modelValue: ReservationTimes, day: Weekday) => boolean;
  getDaySlots: (modelValue: ReservationTimes, day: Weekday) => [string, string][];
  validateDaySlotsFor: (modelValue: ReservationTimes, day: Weekday) => { ok: boolean; errors: string[] };
}

/**
 * Create slot CRUD actions.
 */
export function createSlotActions(config: SlotActionsConfig) {
  const { modelValue, emit, emitValidity, canAddSlotToDay, getDaySlots, validateDaySlotsFor } = config;
  function addSlot(day: Weekday): void {
    if (!canAddSlotToDay(modelValue.value, day)) return;
    const updated = addSlotToDay(modelValue.value, day);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function removeSlot(day: Weekday, index: number): void {
    const updated = removeSlotFromDay(modelValue.value, day, index);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function updateSlot(day: Weekday, index: number, field: "from" | "to", value: string): void {
    const updated = updateSlotField(modelValue.value, { day, index, field, value });
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function applyToAllDays(sourceDay: Weekday): void {
    const updated = applyToAllDaysUtil(modelValue.value, sourceDay);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  return {
    getDaySlots: (day: Weekday) => getDaySlots(modelValue.value, day),
    canAdd: (day: Weekday) => canAddSlotToDay(modelValue.value, day),
    validateDay: (day: Weekday) => validateDaySlotsFor(modelValue.value, day),
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}
