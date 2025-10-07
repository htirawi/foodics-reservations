/**
 * @file useDaySlotsEditor.ts
 * @summary Composable for day slots editor functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed, watch, onMounted } from "vue";
import type { ReservationTimes, Weekday, SlotTuple } from "@/types/foodics";
import { validateDaySlots } from "@/features/branches/utils/reservation.validation";

function emitValidity(
  times: ReservationTimes,
  weekdays: Weekday[],
  emit: {
    (e: "update:valid", valid: boolean): void;
  }
): void {
  const allValid = weekdays.every((day) => {
    const slots = times[day];
    return slots ? validateDaySlots(slots).length === 0 : true;
  });
  emit("update:valid", allValid);
}

function createSlotActions(
  modelValue: ReservationTimes,
  emit: {
    (e: "update:modelValue", value: ReservationTimes): void;
    (e: "update:valid", valid: boolean): void;
  },
  weekdays: Weekday[]
) {
  function addSlot(day: Weekday): void {
    const newSlots = [...modelValue[day]];
    newSlots.push(["09:00", "17:00"]);
    const updated = { ...modelValue, [day]: newSlots };
    emit("update:modelValue", updated);
    emitValidity(updated, weekdays, emit);
  }

  function removeSlot(day: Weekday, index: number): void {
    const newSlots = modelValue[day].filter((_, i) => i !== index);
    const updated = { ...modelValue, [day]: newSlots };
    emit("update:modelValue", updated);
    emitValidity(updated, weekdays, emit);
  }

  function updateSlot(day: Weekday, index: number, field: "from" | "to", value: string): void {
    const newSlots = [...modelValue[day]];
    const slot = newSlots[index];
    if (!slot) return;
    
    const updatedSlot: SlotTuple = field === "from" ? [value, slot[1]] : [slot[0], value];
    newSlots[index] = updatedSlot;
    const updated = { ...modelValue, [day]: newSlots };
    emit("update:modelValue", updated);
    emitValidity(updated, weekdays, emit);
  }

  function applyToAllDays(day: Weekday): void {
    const template = modelValue[day];
    const updated: ReservationTimes = { ...modelValue };
    weekdays.forEach((d) => {
      updated[d] = [...template];
    });
    emit("update:modelValue", updated);
    emitValidity(updated, weekdays, emit);
  }

  return {
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}

function createDayErrors(modelValue: ReservationTimes, weekdays: Weekday[]) {
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
    
    weekdays.forEach((day) => {
      const slots = modelValue[day];
      if (slots) {
        errors[day] = validateDaySlots(slots);
      }
    });
    
    return errors;
  });
}

function setupWatchers(
  modelValue: ReservationTimes,
  weekdays: Weekday[],
  emit: {
    (e: "update:valid", valid: boolean): void;
  }
) {
  onMounted(() => {
    emitValidity(modelValue, weekdays, emit);
  });

  watch(() => modelValue, (newValue) => {
    emitValidity(newValue, weekdays, emit);
  });
}

export function useDaySlotsEditor(
  modelValue: ReservationTimes,
  emit: {
    (e: "update:modelValue", value: ReservationTimes): void;
    (e: "update:valid", valid: boolean): void;
  }
) {
  const weekdays: Weekday[] = [
    "saturday",
    "sunday", 
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  const dayErrors = createDayErrors(modelValue, weekdays);
  const { addSlot, removeSlot, updateSlot, applyToAllDays } = 
    createSlotActions(modelValue, emit, weekdays);

  setupWatchers(modelValue, weekdays, emit);

  return {
    weekdays,
    dayErrors,
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}
