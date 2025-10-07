/**
 * @file useSettingsValidation.ts
 * @summary Module: src/features/branches/composables/useSettingsValidation.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref } from "vue";
import type { Weekday, SlotTuple } from "@/types/foodics";
import type { ValidationErrors } from "@/types/validation";
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
function validateSlotTimes(slots: SlotTuple[], messages: {
    missing: string;
    invalid: string;
}): string | null {
    for (const slot of slots) {
        if (!slot) continue;
        const [from, to] = slot;
        const timeCheck = checkSlotTimes(from, to);
        if (timeCheck === "missing") return messages.missing;
        if (timeCheck === "invalid") return messages.invalid;
    }
    return null;
}

function checkSlotPairOverlap(slot1: SlotTuple, slot2: SlotTuple): boolean {
    return slot2 && checkOverlap(slot1, slot2);
}

function checkSlotAgainstOthers(slot: SlotTuple, otherSlots: SlotTuple[], startIndex: number): boolean {
    for (let j = startIndex; j < otherSlots.length; j++) {
        const otherSlot = otherSlots[j];
        if (otherSlot && checkSlotPairOverlap(slot, otherSlot)) return true;
    }
    return false;
}

function validateSlotOverlaps(slots: SlotTuple[], messages: { overlap: string }): string | null {
    for (let i = 0; i < slots.length; i++) {
        const s1 = slots[i];
        if (!s1) continue;
        if (checkSlotAgainstOthers(s1, slots, i + 1)) return messages.overlap;
    }
    return null;
}

function validateSlots(slots: SlotTuple[], messages: {
    missing: string;
    invalid: string;
    overlap: string;
}): string | null {
    const timeError = validateSlotTimes(slots, messages);
    if (timeError) return timeError;
    return validateSlotOverlaps(slots, messages);
}

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
    
    function validateDaySlots(slots: SlotTuple[], day: Weekday, messages: {
        missing: string;
        invalid: string;
        overlap: string;
    }): boolean {
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
