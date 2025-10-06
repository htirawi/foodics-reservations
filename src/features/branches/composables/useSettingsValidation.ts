/**
 * @file useSettingsValidation.ts
 * @summary Module: src/features/branches/composables/useSettingsValidation.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref, type Ref } from "vue";
import type { Weekday, SlotTuple } from "@/types/foodics";
interface ValidationErrors {
    duration?: string | undefined;
    slots?: Partial<Record<Weekday, string>> | undefined;
}
function checkSlotTimes(from: string, to: string): "missing" | "invalid" | "valid" {
    if (!from || !to)
        return "missing";
    return from >= to ? "invalid" : "valid";
}
function checkOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
    const [from1, to1] = slot1;
    const [from2, to2] = slot2;
    return from1 < to2 && to1 > from2;
}
const validateDurationValue = (duration: number, errorMsg: string, errors: Ref<ValidationErrors>): boolean => {
  if (!duration || duration < 1) {
    errors.value.duration = errorMsg;
    return false;
  }
  errors.value.duration = undefined;
  return true;
};

const clearDayError = (day: Weekday, errors: Ref<ValidationErrors>): void => {
  const key = `day_${day}` as keyof ValidationErrors;
  errors.value[key] = undefined;
};

const setDayError = (day: Weekday, error: string, errors: Ref<ValidationErrors>): void => {
  const key = `day_${day}` as keyof ValidationErrors;
  errors.value[key] = error;
};

const checkSlotValidation = (slots: SlotTuple[], messages: {
  missing: string;
  invalid: string;
  overlap: string;
}): string | null => {
  // Check individual slot validity
  for (const slot of slots) {
    if (!slot) continue;
    const [from, to] = slot;
    const timeCheck = checkSlotTimes(from, to);
    if (timeCheck === "missing") return messages.missing;
    if (timeCheck === "invalid") return messages.invalid;
  }
  return null;
};

const checkSlotOverlaps = (slots: SlotTuple[], overlapMsg: string): string | null => {
  for (let i = 0; i < slots.length; i++) {
    const s1 = slots[i];
    if (!s1) continue;
    const hasOverlap = slots.slice(i + 1).some(s2 => s2 && checkOverlap(s1, s2));
    if (hasOverlap) return overlapMsg;
  }
  return null;
};

export function useSettingsValidation() {
    const errors = ref<ValidationErrors>({});
    
    const validateDuration = (duration: number, errorMsg: string): boolean => {
        return validateDurationValue(duration, errorMsg, errors);
    };
    const validateDaySlots = (slots: SlotTuple[], day: Weekday, messages: {
        missing: string;
        invalid: string;
        overlap: string;
    }): boolean => {
        if (!slots || slots.length === 0) {
            clearDayError(day, errors);
            return true;
        }
        
        const validationError = checkSlotValidation(slots, messages);
        if (validationError) {
            setDayError(day, validationError, errors);
            return false;
        }
        
        const overlapError = checkSlotOverlaps(slots, messages.overlap);
        if (overlapError) {
            setDayError(day, overlapError, errors);
            return false;
        }
        
        clearDayError(day, errors);
        return true;
    };
    const clearAllErrors = (): void => {
        errors.value = {};
    };
    return {
        errors,
        validateDuration,
        validateDaySlots,
        clearAllErrors,
    };
}
