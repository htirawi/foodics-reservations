import { watch, onMounted, type Ref } from "vue";
import type { ReservationTimes } from "@/types/foodics";

interface DaySlotsEditorEmits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}

/**
 * Setup watchers for validity tracking.
 */
export function setupWatchers(
  modelValue: Ref<ReservationTimes>,
  emit: DaySlotsEditorEmits,
  emitValidity: (times: ReservationTimes, emit: DaySlotsEditorEmits) => void
): void {
  // Emit validity immediately for tests
  emitValidity(modelValue.value, emit);

  // Only call onMounted if we're in a component context
  try {
    onMounted(() => {
      emitValidity(modelValue.value, emit);
    });
  } catch {
    // Not in component context (e.g., tests), already emitted above
  }

  watch(
    modelValue,
    (newValue) => {
      emitValidity(newValue, emit);
    },
    { deep: true }
  );
}
