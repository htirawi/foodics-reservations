/**
 * @file slotActions.ts
 * @summary Slot CRUD actions for day slots editor
 * @remarks Pure functions for slot manipulation; no Vue dependencies
 */

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
  modelValue: ReservationTimes;
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
    if (!canAddSlotToDay(modelValue, day)) return;
    const updated = addSlotToDay(modelValue, day);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function removeSlot(day: Weekday, index: number): void {
    const updated = removeSlotFromDay(modelValue, day, index);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function updateSlot(day: Weekday, index: number, field: "from" | "to", value: string): void {
    const updated = updateSlotField(modelValue, { day, index, field, value });
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  function applyToAllDays(sourceDay: Weekday): void {
    const updated = applyToAllDaysUtil(modelValue, sourceDay);
    emit("update:modelValue", updated);
    emitValidity(updated, emit);
  }

  return {
    getDaySlots: (day: Weekday) => getDaySlots(modelValue, day),
    canAdd: (day: Weekday) => canAddSlotToDay(modelValue, day),
    validateDay: (day: Weekday) => validateDaySlotsFor(modelValue, day),
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}
