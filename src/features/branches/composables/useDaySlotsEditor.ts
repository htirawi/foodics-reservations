/**
 * @file useDaySlotsEditor.ts
 * @summary Composable for day-by-day time slots editor
 * @remarks
 *   - Handles slot CRUD operations for reservation times.
 *   - Delegates validation to pure utils.
 *   - TypeScript strict; no any/unknown; use ?./??.
 */

import { computed, watch, onMounted } from "vue";
import type { ReservationTimes, Weekday, SlotTuple } from "@/types/foodics";
import type { ConfirmFn } from "@/types/confirm";
import { validateDaySlots, normalizeSlots } from "@/features/branches/utils/reservation.validation";
import {
  addSlotToDay,
  removeSlotFromDay,
  updateSlotField,
  applyToAllDays as applyToAllDaysUtil,
  WEEKDAY_ORDER,
} from "./slotEditorActions";

const MAX_SLOTS_PER_DAY = 3;

interface DaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

type TranslateFn = (key: string) => string;

/**
 * Emit overall validity based on all days.
 */
function emitValidity(
  times: ReservationTimes,
  emit: DaySlotsEditorEmits
): void {
  const allValid = WEEKDAY_ORDER.every((day) => {
    const slots = times[day];
    if (!slots || slots.length === 0) return true;
    const validation = validateDaySlots(slots);
    return validation.ok;
  });
  emit("update:valid", allValid);
}

/**
 * Create per-day errors computed ref.
 */
function createDayErrors(modelValue: ReservationTimes) {
  return computed<Record<Weekday, string[]>>(() => {
    const errors: Record<Weekday, string[]> = {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    WEEKDAY_ORDER.forEach((day) => {
      const slots = modelValue[day];
      if (slots && slots.length > 0) {
        const validation = validateDaySlots(slots);
        errors[day] = validation.errors;
      }
    });

    return errors;
  });
}

function getDaySlots(modelValue: ReservationTimes, day: Weekday): SlotTuple[] {
  const slots = modelValue[day] ?? [];
  return normalizeSlots(slots);
}

function canAddSlot(modelValue: ReservationTimes, day: Weekday): boolean {
  const slots = modelValue[day] ?? [];
  return slots.length < MAX_SLOTS_PER_DAY;
}

function validateDaySlotsFor(modelValue: ReservationTimes, day: Weekday) {
  const slots = modelValue[day] ?? [];
  return validateDaySlots(slots);
}

/**
 * Create slot CRUD actions.
 */
function createSlotActions(
  modelValue: ReservationTimes,
  emit: DaySlotsEditorEmits
) {
  function addSlot(day: Weekday): void {
    if (!canAddSlot(modelValue, day)) return;
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
    canAdd: (day: Weekday) => canAddSlot(modelValue, day),
    validateDay: (day: Weekday) => validateDaySlotsFor(modelValue, day),
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}

/**
 * Setup watchers for validity tracking.
 */
function setupWatchers(
  modelValue: ReservationTimes,
  emit: DaySlotsEditorEmits
) {
  // Emit validity immediately for tests
  emitValidity(modelValue, emit);
  
  // Only call onMounted if we're in a component context
  try {
    onMounted(() => {
      emitValidity(modelValue, emit);
    });
  } catch {
    // Not in component context (e.g., tests), already emitted above
  }

  watch(
    () => modelValue,
    (newValue) => {
      emitValidity(newValue, emit);
    },
    { deep: true }
  );
}

/**
 * Composable for day-by-day time slots editor.
 * 
 * @param modelValue - Current reservation times
 * @param emit - Emitter for updates and validity
 * @param confirm - Confirmation dialog function
 * @param t - Translation function
 * @returns Slot management API
 */
export function useDaySlotsEditor(
  modelValue: ReservationTimes,
  emit: DaySlotsEditorEmits,
  confirm?: ConfirmFn,
  t?: TranslateFn
) {
  const dayErrors = createDayErrors(modelValue);
  const actions = createSlotActions(modelValue, emit);

  setupWatchers(modelValue, emit);

  /**
   * Apply one day's slots to all days with confirmation.
   */
  async function applyToAllDaysWithConfirm(sourceDay: Weekday): Promise<void> {
    if (!confirm || !t) {
      actions.applyToAllDays(sourceDay);
      return;
    }

    const confirmed = await confirm({
      title: t("settings.slots.applyAll"),
      message: t("settings.slots.confirmApplyAll"),
    });

    if (confirmed) {
      actions.applyToAllDays(sourceDay);
    }
  }

  return {
    weekdays: WEEKDAY_ORDER,
    dayErrors,
    ...actions,
    applyToAllDaysWithConfirm,
  };
}