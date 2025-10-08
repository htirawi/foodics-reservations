import { computed, type Ref } from "vue";
import type { ReservationTimes, Weekday } from "@/types/foodics";
import type { ConfirmFn } from "@/types/confirm";
import { WEEKDAY_ORDER } from "./slotEditorActions";
import { createSlotActions } from "./slotActions";
import { setupWatchers } from "./slotWatchers";
import {
  emitValidity,
  getDaySlots,
  canAddSlotToDay,
  validateDaySlotsFor,
  getDayValidationErrors
} from "./slotValidation";

interface DaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

type TranslateFn = (key: string) => string;

/**
 * Create per-day errors computed ref.
 */
function createDayErrors(modelValue: Ref<ReservationTimes>) {
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
      errors[day] = getDayValidationErrors(modelValue.value[day]);
    });

    return errors;
  });
}



/**
 * Composable for day-by-day time slots editor.
 *
 * @param modelValue - Current reservation times (reactive ref)
 * @param emit - Emitter for updates and validity
 * @param confirm - Confirmation dialog function
 * @param t - Translation function
 * @returns Slot management API
 */
export function useDaySlotsEditor(
  modelValue: Ref<ReservationTimes>,
  emit: DaySlotsEditorEmits,
  confirm?: ConfirmFn,
  t?: TranslateFn
) {
  const dayErrors = createDayErrors(modelValue);
  const actions = createSlotActions({
    modelValue: computed(() => modelValue.value),
    emit,
    emitValidity,
    canAddSlotToDay,
    getDaySlots,
    validateDaySlotsFor
  });

  setupWatchers(modelValue, emit, emitValidity);

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