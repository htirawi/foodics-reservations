/**
 * Settings validation composable
 */

import { ref } from 'vue';
import type { Weekday, SlotTuple } from '@/types/foodics';

interface ValidationErrors {
  duration?: string | undefined;
  slots?: Partial<Record<Weekday, string>> | undefined;
}

function checkSlotTimes(from: string, to: string): 'missing' | 'invalid' | 'valid' {
  if (!from || !to) return 'missing';
  return from >= to ? 'invalid' : 'valid';
}

function checkOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
  const [from1, to1] = slot1;
  const [from2, to2] = slot2;
  return from1 < to2 && to1 > from2;
}

/* eslint-disable max-lines-per-function, complexity, max-depth */
// Justification: Validation logic requires comprehensive checks for time slots
// Complexity is inherent to validating overlapping intervals across multiple days
export function useSettingsValidation() {
  const errors = ref<ValidationErrors>({});

  function validateDuration(duration: number, errorMsg: string): boolean {
    if (!duration || duration < 1) {
      errors.value.duration = errorMsg;
      return false;
    }
    errors.value.duration = undefined;
    return true;
  }

  function validateDaySlots(
    slots: SlotTuple[],
    day: Weekday,
    messages: { missing: string; invalid: string; overlap: string }
  ): boolean {
    if (!slots || slots.length === 0) {
      clearDayError(day);
      return true;
    }

    const validationResult = validateSlots(slots, messages);
    if (validationResult) {
      setDayError(day, validationResult);
      return false;
    }

    clearDayError(day);
    return true;
  }

  function validateSlots(slots: SlotTuple[], messages: { missing: string; invalid: string; overlap: string }): string | null {
    for (const slot of slots) {
      if (!slot) continue;
      const [from, to] = slot;
      const timeCheck = checkSlotTimes(from, to);
      
      if (timeCheck === 'missing') return messages.missing;
      if (timeCheck === 'invalid') return messages.invalid;
    }

    for (let i = 0; i < slots.length; i++) {
      const s1 = slots[i];
      if (!s1) continue;
      for (let j = i + 1; j < slots.length; j++) {
        const s2 = slots[j];
        if (s2 && checkOverlap(s1, s2)) return messages.overlap;
      }
    }

    return null;
  }

  function setDayError(day: Weekday, message: string): void {
    errors.value.slots = { ...errors.value.slots, [day]: message };
  }

  function clearDayError(day: Weekday): void {
    if (!errors.value.slots) return;
    const newSlots = { ...errors.value.slots };
    delete newSlots[day];
    errors.value.slots = Object.keys(newSlots).length > 0 ? newSlots : undefined;
  }

  function clearAllErrors(): void {
    errors.value = {};
  }

  return {
    errors,
    validateDuration,
    validateDaySlots,
    clearAllErrors,
  };
}