/**
 * @file slotWatchers.ts
 * @summary Watchers for day slots editor validity tracking
 * @remarks Vue-specific watchers for reactive validity updates
 */

import { watch, onMounted } from "vue";
import type { ReservationTimes } from "@/types/foodics";

interface DaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

/**
 * Setup watchers for validity tracking.
 */
export function setupWatchers(
  modelValue: ReservationTimes,
  emit: DaySlotsEditorEmits,
  emitValidity: (times: ReservationTimes, emit: DaySlotsEditorEmits) => void
): void {
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
